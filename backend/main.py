import os
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import torch
from scripts.loader import initialize_model
from predict import predictor
from scripts.helper import array_to_binary_image, user_file_to_array_image
from PIL import UnidentifiedImageError
import base64
from fastapi.staticfiles import StaticFiles


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = initialize_model().to(device)


app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/upload")
async def upload(file: UploadFile = File(...)):
    """Upload an image and add it to the processing queue."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")
    try:
        content = await file.read()
        image = user_file_to_array_image(content)
        prediction = predictor(model, device, image)
        binary_img = array_to_binary_image(prediction["image"], pil_image=True)
        img_base64 = base64.b64encode(binary_img.read()).decode("utf-8")

        return {
            "analysis": prediction["analysis"],
            "image": img_base64
        }

    except UnidentifiedImageError as e:
        raise HTTPException(status_code=400, detail=f"Invalid Image File: {e}")

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error Uploading File: {e}")


client_path = os.path.join(Path.cwd(), "dentai/dist/")
app.mount("/", StaticFiles(directory=client_path, html=True), name="static")


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1",
                port=8000, reload=True)
