from fastapi import FastAPI, File, UploadFile, HTTPException
import uvicorn
import numpy as np
from PIL import Image, UnidentifiedImageError
from io import BytesIO
from predict import *
from scripts.gen_ai import generator, model
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def image_to_array(image_bytes):
    try:
        image = Image.open(BytesIO(image_bytes))
        return np.array(image)
    except UnidentifiedImageError as e:
        raise HTTPException(status_code=400, detail="Invalid image file")


def array_to_image(image):
    pil_image = Image.fromarray(image)
    final_image = BytesIO()
    pil_image.save(final_image, format="JPEG")
    final_image.seek(0)
    return final_image


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    content = await file.read()

    try:
        image = image_to_array(content)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    prediction = predict(image)

    # To slow, not working properly.
    # predicted_data = generator(prediction["predictions"])

    annotated_image = array_to_image(prediction["image"])
    # return {
    #     "image": StreamingResponse(annotated_image, media_type="image/jpeg"),
    #     "predicted_data": str(predicted_data),
    # }
    return StreamingResponse(annotated_image, media_type="image/jpeg")


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
