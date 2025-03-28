from fastapi import FastAPI, File, UploadFile, HTTPException, Response
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
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
from datetime import datetime
import concurrent.futures

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
            print("✅ Background Processing Activated.")
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
                    "createdAt": datetime.now()
                }
                print("✅ Processing Complete.")
                async with db_condition:
                    db_queue.append(data)
                    db_condition.notify()

            except Exception as e:
                print(f"❌ Error in process_queue: {e}")


async def batch_db_writer():
    """Batch writes processed predictions to MongoDB at intervals."""
    loop = asyncio.get_running_loop()

    while True:
        # Pause for 5 seconds
        await asyncio.sleep(5)
        print("✅ Batch Writing Activated.")
        if db_queue:
            async with db_condition:
                print("✅ Performing Batch Write")
                batch_data = list(db_queue)
                db_queue.clear()

            with concurrent.futures.ThreadPoolExecutor() as executor:
                try:
                    await loop.run_in_executor(executor, collection.insert_many, batch_data)
                except Exception as e:
                    print(f"❌ Database insert failed: {e}")

        print("✅ Batch Operation Completed.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    global processing_task, db_task, collection
    processing_task = asyncio.create_task(process_queue())
    db_task = asyncio.create_task(batch_db_writer())
    collection = await mongo_connection()

    yield

    processing_task.cancel()
    db_task.cancel()

    try:
        await processing_task
        await db_task
    except asyncio.CancelledError:
        print("✅ Server Cleanup Completed.")

    collection.database.client.close()
    print("✅ MongoDB Connection Closed.")


app = FastAPI(lifespan=lifespan)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/prediction-analysis/{fid}")
async def get_analysis(fid: str):
    """Retrieve the prediction analysis using the UUID."""
    try:
        print("✅ Request Hit for Getting Analysis.")
        prediction = await collection.find_one({"fid": fid})

        if not prediction:
            return {"status": 202, "message": "Processing", "data": None}

        analysis_data = prediction["analysis"]
        await collection.delete_one({"fid": fid})
        return analysis_data

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching analysis: {e}")


@app.get("/api/prediction-image/{fid}")
async def get_prediction(fid: str):
    """Retrieve the prediction result using the UUID."""
    print("✅ Request Hit for Getting Prediction.")
    print("FID:", fid)

    try:
        prediction = await collection.find_one({"fid": fid})

        if not prediction:
            return {"status": 202, "message": "Processing", "data": None}

        image_binaries = prediction["image"]
        image = binary_image_to_file(image_binaries)

        return StreamingResponse(image, media_type="image/jpeg")

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching prediction image: {e}")


@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    """Upload an image and add it to the processing queue."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    print("✅ Request Hit for Uploading File")
    try:
        # Read File IO
        content = await file.read()
        # Convert it to Np.Array
        image = user_file_to_array_image(content)

        async with queue_condition:
            fid = str(uuid4())
            queue.append({"fid": fid, "image": image})
            queue_condition.notify()

        print("✅ Upload Queue:", len(queue))
        return {"status": 200, "message": "Uploaded successfully", "data": {"fid": fid}}

    except UnidentifiedImageError as e:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error Uploading File: {e}")


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1",
                port=8000, reload=True)
