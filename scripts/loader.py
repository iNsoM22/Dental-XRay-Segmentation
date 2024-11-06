import torch
import os
import sys
from pathlib import Path
import torch

if str("yolov5") not in sys.path:
    sys.path.append(str("yolov5"))
ROOT = Path(os.path.relpath("yolov5", Path.cwd()))


def initialize_model():
    """
    Initializes and loads the YOLOv5 model.
    Returns the initialized model.
    """
    from models.common import DetectMultiBackend
    os.makedirs("model", exist_ok=True)
    model_path = "model/model.pt"

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"The model file '{model_path}' was not found.")

    # Load the YOLOv5 model using DetectMultiBackend
    model = DetectMultiBackend(model_path, device=torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"))
    model.eval()
    return model
