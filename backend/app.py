from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from logging.handlers import RotatingFileHandler
import torch
import asyncio
from scripts.loader import initialize_model
from predict import predictor
from scripts.helper import binary_image_to_file, array_to_binary_image, user_file_to_array_image
from PIL import UnidentifiedImageError
from uuid import uuid4
from collections import deque
from database.db import mongo_connection
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import concurrent.futures
from fastapi.staticfiles import StaticFiles


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

# MongoDB Collection
collection = None

# Identify Device and Load Model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = initialize_model().to(device)

# Prediction Request Queue
queue = deque()
queue_condition = asyncio.Condition()
# Storage Request Queue
db_queue = deque()
db_condition = asyncio.Condition()

# Background task for queues
processing_task = None
db_task = None


# Background Image Processing
async def process_queue():
    """Background task to process queued requests."""
    while True:
        async with queue_condition:
            await queue_condition.wait()

        while queue:
            request_data = queue.popleft()
            fid = request_data["fid"]
            image = request_data["image"]

            try:
                # Perform Prediction
                prediction = predictor(model, device, image)
                image_binary = array_to_binary_image(prediction["image"])

                # Store in Database
                data = {
                    "fid": fid,
                    "image": image_binary,
                    "analysis": prediction["analysis"],
                    "createdAt": datetime.now(timezone.utc)
                }
                async with db_condition:
                    db_queue.append(data)
                    db_condition.notify()
                logging.info(f"Prediction completed for {fid}")

            except Exception as e:
                logging.error(f"Error in process_queue: {e}", exc_info=True)


async def batch_db_writer():
    """Batch writes processed predictions to MongoDB at intervals."""
    loop = asyncio.get_running_loop()

    while True:
        # Pause for 10 seconds
        await asyncio.sleep(10)
        if db_queue:
            async with db_condition:
                batch_data = list(db_queue)
                db_queue.clear()
                logging.info(
                    f"Performing Batch Write: {len(batch_data)} entries")

            with concurrent.futures.ThreadPoolExecutor() as executor:
                try:
                    await loop.run_in_executor(executor, collection.insert_many, batch_data)
                except Exception as e:
                    logging.error(
                        f"Database insert failed: {e}", exc_info=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    global processing_task, db_task, collection
    processing_task = asyncio.create_task(process_queue())
    db_task = asyncio.create_task(batch_db_writer())

    for i in range(0, 2):
        collection = await mongo_connection()
        if collection is None:
            logging.info(f"MongoDB Connection Failed on Attempt: {i+1}.")
            await asyncio.sleep(2 ** i)
        else:
            logging.info(
                f"MongoDB Connection Established on Attempt: {i+1}.")
            break
    if collection is None:
        raise RuntimeError("MongoDB connection could not be established.")

    logging.info("Server Started.")

    yield

    try:
        processing_task.cancel()
        db_task.cancel()
        await processing_task
        await db_task

    except asyncio.CancelledError:
        logging.info("Server Cleanup Completed.")

    try:
        collection.database.client.close()
        logging.info("MongoDB Connection Closed.")
    except Exception as e:
        logging.error(f"Error Closing MongoDB Connection: {e}", exc_info=True)


app = FastAPI(lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

############
# API ROUTES
############


@app.get("/api/prediction-analysis/{fid}")
async def get_analysis(fid: str):
    """Retrieve the prediction analysis using the UUID."""
    try:
        prediction = await collection.find_one({"fid": fid})

        if prediction is None:
            return JSONResponse(content=None, status_code=204)

        analysis_data = prediction["analysis"]
        # await collection.delete_one({"fid": fid})
        # logging.info(f"Analysis retrieved and deleted for {fid}")
        return analysis_data

    except Exception as e:
        logging.error(f"Error fetching analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error fetching analysis: {e}")


@app.get("/api/prediction-image/{fid}")
async def get_prediction(fid: str):
    """Retrieve the prediction result using the UUID."""
    try:
        prediction = await collection.find_one({"fid": fid})

        if prediction is None:
            return JSONResponse(content=None, status_code=204)

        image_binaries = prediction["image"]
        image = binary_image_to_file(image_binaries)

        return StreamingResponse(image, media_type="image/jpeg")

    except Exception as e:
        logging.error(f"Error fetching prediction image: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error fetching prediction image: {e}")


@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    """Upload an image and add it to the processing queue."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")
    try:
        # Read File IO
        content = await file.read()
        # Convert it to Np.Array
        image = user_file_to_array_image(content)

        async with queue_condition:
            fid = str(uuid4())
            queue.append({"fid": fid, "image": image})
            queue_condition.notify()

        logging.info(f"File uploaded and added to queue: {fid}")
        return {"message": "Uploaded successfully", "data": {"fid": fid}}

    except UnidentifiedImageError as e:
        logging.warning(f"⚠️ Invalid image file uploaded: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

    except Exception as e:
        logging.error(f"Error Uploading File: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, detail=f"Error Uploading File: {e}")


app.mount("/", StaticFiles(directory="../dentai/dist", html=True), name="static")

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1",
                port=8000, reload=True)
