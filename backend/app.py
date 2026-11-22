from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Header, Form
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from logging.handlers import RotatingFileHandler
import torch
import asyncio
import gc
import hmac
import os
from typing import Optional
from dotenv import load_dotenv
from scripts.loader import initialize_model
from predict import predictor
from scripts.helper import binary_image_to_file, array_to_binary_image, user_file_to_array_image
from PIL import UnidentifiedImageError
from uuid import uuid4
from collections import deque
from database.db import init_sqlite_db, SqlitePredictionStore
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

load_dotenv(Path(__file__).resolve().parent / ".env")

# Setup Logging
log_handler = RotatingFileHandler(
    "app.log", maxBytes=5 * 1024 * 1024, backupCount=2,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        log_handler
    ]
)

# Auth & Lifecycle Config
API_KEY = os.getenv("API_KEY", "").strip()
MODEL_IDLE_TIMEOUT_SECONDS = float(os.getenv("MODEL_IDLE_TIMEOUT_SECONDS", "120"))

# SQLite Prediction Store
db_store: Optional[SqlitePredictionStore] = None

# Identify Device (model is lazy-loaded on demand by ModelManager)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Prediction Request Queue
queue = deque()
queue_condition = asyncio.Condition()
# Storage Request Queue
db_queue = deque()
db_condition = asyncio.Condition()

# In-memory tracking for queue status & un-flushed results
job_statuses: dict[str, dict] = {}
pending_results: dict[str, dict] = {}

# Background task for queues
processing_task = None
db_task = None


class ModelManager:
    """Lazy-loads the model on demand, keeps it in RAM for queued work, and discards it after idle timeout."""

    def __init__(self, target_device: torch.device, idle_timeout: float):
        self.device = target_device
        self.idle_timeout = idle_timeout
        self.model = None
        self._busy = False
        self._lock = asyncio.Lock()
        self._unload_task: Optional[asyncio.Task] = None

    def cancel_scheduled_unload(self):
        if self._unload_task and not self._unload_task.done():
            self._unload_task.cancel()
            self._unload_task = None

    async def acquire(self):
        self.cancel_scheduled_unload()
        async with self._lock:
            if self.model is None:
                logging.info("Loading model into memory...")
                loop = asyncio.get_running_loop()
                loaded = await loop.run_in_executor(None, initialize_model)
                self.model = loaded.to(self.device)
                logging.info(f"Model loaded on device: {self.device}")
            self._busy = True
            return self.model

    def release(self):
        self._busy = False

    def schedule_unload(self):
        self.cancel_scheduled_unload()
        self._unload_task = asyncio.create_task(self._idle_unload_worker())

    async def _idle_unload_worker(self):
        try:
            await asyncio.sleep(self.idle_timeout)
            async with self._lock:
                if self.model is not None and not self._busy and not queue:
                    logging.info(
                        f"Model idle for {self.idle_timeout}s with empty queue. Discarding from memory."
                    )
                    self.model = None
                    gc.collect()
                    if torch.cuda.is_available():
                        torch.cuda.empty_cache()
        except asyncio.CancelledError:
            pass

    async def unload_now(self):
        self.cancel_scheduled_unload()
        async with self._lock:
            if self.model is not None:
                self.model = None
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                logging.info("Model unloaded on shutdown.")


model_manager = ModelManager(device, MODEL_IDLE_TIMEOUT_SECONDS)


def _run_inference_sync(model, target_device: torch.device, image) -> dict:
    """Synchronous inference + encoding helper executed in a thread pool."""
    prediction = predictor(model, target_device, image)
    image_binary = array_to_binary_image(prediction["image"])
    return {
        "image": image_binary,
        "analysis": prediction["analysis"],
    }


def _prune_old_statuses(max_entries: int = 1000):
    if len(job_statuses) <= max_entries:
        return
    finished = [
        k for k, v in job_statuses.items()
        if v["status"] in ("completed", "failed")
    ]
    for k in finished[: len(job_statuses) - max_entries]:
        job_statuses.pop(k, None)


# Background Image Processing
async def process_queue():
    """Background task to process queued requests."""
    loop = asyncio.get_running_loop()

    while True:
        async with queue_condition:
            while not queue:
                await queue_condition.wait()
            request_data = queue.popleft()

        fid = request_data["fid"]
        session_id = request_data["session_id"]
        image = request_data["image"]

        if fid in job_statuses:
            job_statuses[fid]["status"] = "processing"
            job_statuses[fid]["updatedAt"] = datetime.now(timezone.utc).isoformat()

        try:
            active_model = await model_manager.acquire()
            try:
                result = await loop.run_in_executor(
                    None, _run_inference_sync, active_model, device, image
                )
            finally:
                model_manager.release()

            # Store in Database Queue
            data = {
                "fid": fid,
                "sessionId": session_id,
                "image": result["image"],
                "analysis": result["analysis"],
                "createdAt": datetime.now(timezone.utc),
            }
            async with db_condition:
                pending_results[fid] = data
                db_queue.append(data)
                db_condition.notify()

            if fid in job_statuses:
                job_statuses[fid]["status"] = "completed"
                job_statuses[fid]["updatedAt"] = datetime.now(timezone.utc).isoformat()
            _prune_old_statuses()
            logging.info(f"Prediction completed for {fid} (session={session_id})")

        except Exception as e:
            logging.error(f"Error in process_queue for {fid}: {e}", exc_info=True)
            if fid in job_statuses:
                job_statuses[fid]["status"] = "failed"
                job_statuses[fid]["error"] = str(e)
                job_statuses[fid]["updatedAt"] = datetime.now(timezone.utc).isoformat()

        async with queue_condition:
            if not queue:
                model_manager.schedule_unload()


async def flush_db_queue():
    """Flush queued prediction results to SQLite in a batch."""
    if db_store is None:
        return
    async with db_condition:
        if not db_queue:
            return
        batch_data = list(db_queue)
        db_queue.clear()
        logging.info(f"Performing Batch Write: {len(batch_data)} entries")

    loop = asyncio.get_running_loop()
    try:
        await loop.run_in_executor(None, db_store.insert_many, batch_data)
        await loop.run_in_executor(None, db_store.delete_expired)
        for item in batch_data:
            pending_results.pop(item["fid"], None)
    except Exception as e:
        logging.error(f"Database insert failed: {e}", exc_info=True)
        async with db_condition:
            db_queue.extendleft(reversed(batch_data))


async def batch_db_writer():
    """Batch writes processed predictions to SQLite at intervals."""
    while True:
        try:
            await asyncio.sleep(10)
            await flush_db_queue()
        except asyncio.CancelledError:
            await flush_db_queue()
            raise


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    global processing_task, db_task, db_store
    if not API_KEY:
        logging.warning("API_KEY is not set in environment; API key auth is disabled.")

    db_store = init_sqlite_db()
    deleted = db_store.delete_expired()
    logging.info(f"SQLite Database Initialized at {db_store.db_path} (pruned {deleted} expired rows).")

    processing_task = asyncio.create_task(process_queue())
    db_task = asyncio.create_task(batch_db_writer())
    logging.info("Server Started.")

    yield

    try:
        processing_task.cancel()
        db_task.cancel()
        await asyncio.gather(processing_task, db_task, return_exceptions=True)
    except asyncio.CancelledError:
        logging.info("Server Cleanup Completed.")

    await model_manager.unload_now()

    try:
        if db_store is not None:
            db_store.close()
        logging.info("SQLite Database Connection Closed.")
    except Exception as e:
        logging.error(f"Error Closing SQLite Connection: {e}", exc_info=True)


app = FastAPI(lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def verify_api_key(
    x_api_key: Optional[str] = Header(default=None, alias="X-API-Key"),
):
    """Verify the shared API key sent by the frontend/client."""
    if not API_KEY:
        return
    if not x_api_key or not hmac.compare_digest(x_api_key, API_KEY):
        raise HTTPException(status_code=401, detail="Invalid or missing API key.")


def _verify_session_access(expected_session_id: Optional[str], provided_session_id: Optional[str]):
    if expected_session_id and provided_session_id and expected_session_id != provided_session_id:
        raise HTTPException(status_code=403, detail="Session ID mismatch.")


############
# API ROUTES
############


@app.get("/api/status/{fid}", dependencies=[Depends(verify_api_key)])
async def get_status(
    fid: str,
    x_session_id: Optional[str] = Header(default=None, alias="X-Session-ID"),
):
    """Retrieve the current queue and processing status for a prediction job."""
    job = job_statuses.get(fid)
    if job is not None:
        _verify_session_access(job.get("sessionId"), x_session_id)
        queue_ids = [item["fid"] for item in list(queue)]
        queue_position = queue_ids.index(fid) + 1 if fid in queue_ids else 0
        return {
            "fid": fid,
            "session_id": job.get("sessionId"),
            "status": job["status"],
            "queue_position": queue_position,
            "queue_length": len(queue_ids),
            "model_loaded": model_manager.model is not None,
            "error": job.get("error"),
        }

    if db_store is not None:
        loop = asyncio.get_running_loop()
        prediction = await loop.run_in_executor(None, db_store.find_one, fid, False)
        if prediction is not None:
            _verify_session_access(prediction.get("sessionId"), x_session_id)
            return {
                "fid": fid,
                "session_id": prediction.get("sessionId"),
                "status": "completed",
                "queue_position": 0,
                "queue_length": len(queue),
                "model_loaded": model_manager.model is not None,
                "error": None,
            }

    raise HTTPException(status_code=404, detail="Prediction job not found.")


@app.get("/api/prediction-analysis/{fid}", dependencies=[Depends(verify_api_key)])
async def get_analysis(
    fid: str,
    x_session_id: Optional[str] = Header(default=None, alias="X-Session-ID"),
):
    """Retrieve the prediction analysis using the UUID."""
    try:
        job = job_statuses.get(fid)
        if job and job["status"] == "failed":
            _verify_session_access(job.get("sessionId"), x_session_id)
            raise HTTPException(
                status_code=500, detail=job.get("error", "Prediction failed.")
            )

        prediction = pending_results.get(fid)
        if prediction is None and db_store is not None:
            loop = asyncio.get_running_loop()
            prediction = await loop.run_in_executor(None, db_store.find_one, fid, True)

        if prediction is None:
            return JSONResponse(content=None, status_code=204)

        _verify_session_access(prediction.get("sessionId"), x_session_id)
        return prediction["analysis"]

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error fetching analysis: {e}")


@app.get("/api/prediction-image/{fid}", dependencies=[Depends(verify_api_key)])
async def get_prediction(
    fid: str,
    x_session_id: Optional[str] = Header(default=None, alias="X-Session-ID"),
):
    """Retrieve the prediction result using the UUID."""
    try:
        job = job_statuses.get(fid)
        if job and job["status"] == "failed":
            _verify_session_access(job.get("sessionId"), x_session_id)
            raise HTTPException(
                status_code=500, detail=job.get("error", "Prediction failed.")
            )

        prediction = pending_results.get(fid)
        if prediction is None and db_store is not None:
            loop = asyncio.get_running_loop()
            prediction = await loop.run_in_executor(None, db_store.find_one, fid, True)

        if prediction is None:
            return JSONResponse(content=None, status_code=204)

        _verify_session_access(prediction.get("sessionId"), x_session_id)
        image_binaries = prediction["image"]
        image = binary_image_to_file(image_binaries)

        return StreamingResponse(image, media_type="image/jpeg")

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching prediction image: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error fetching prediction image: {e}")


@app.post("/api/upload", dependencies=[Depends(verify_api_key)])
async def upload(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(default=None),
    x_session_id: Optional[str] = Header(default=None, alias="X-Session-ID"),
):
    """Upload an image and add it to the processing queue."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")
    try:
        resolved_session_id = (x_session_id or session_id or "").strip() or str(uuid4())
        # Read File IO
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        # Convert it to Np.Array
        image = user_file_to_array_image(content)

        async with queue_condition:
            fid = str(uuid4())
            now_iso = datetime.now(timezone.utc).isoformat()
            queue.append({
                "fid": fid,
                "session_id": resolved_session_id,
                "image": image,
            })
            queue_position = len(queue)
            job_statuses[fid] = {
                "fid": fid,
                "sessionId": resolved_session_id,
                "status": "queued",
                "error": None,
                "createdAt": now_iso,
                "updatedAt": now_iso,
            }
            model_manager.cancel_scheduled_unload()
            queue_condition.notify()

        logging.info(
            f"File uploaded and added to queue: {fid} (session={resolved_session_id}, pos={queue_position})"
        )
        return {
            "message": "Uploaded successfully",
            "data": {
                "fid": fid,
                "session_id": resolved_session_id,
                "queue_position": queue_position,
            },
        }

    except UnidentifiedImageError as e:
        logging.warning(f"⚠️ Invalid image file uploaded: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

    except Exception as e:
        logging.error(f"Error Uploading File: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error Uploading File: {e}")


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1",
                port=8000, reload=True)
