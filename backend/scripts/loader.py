import os
import sys
from pathlib import Path
import torch

BACKEND_DIR = Path(__file__).resolve().parent.parent
YOLOV5_DIR = BACKEND_DIR / "yolov5"
if str(YOLOV5_DIR) not in sys.path:
    sys.path.insert(0, str(YOLOV5_DIR))
ROOT = Path(os.path.relpath(YOLOV5_DIR, Path.cwd())) if YOLOV5_DIR.exists() else YOLOV5_DIR


def initialize_model():
    """
    Initializes and loads the YOLOv5 model.
    Returns the initialized model.
    """
    from models.common import DetectMultiBackend
    model_dir = BACKEND_DIR / "model"
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = model_dir / "model.pt"

    if not model_path.exists():
        raise FileNotFoundError(
            f"The model file '{model_path}' was not found.")

    # Load the YOLOv5 model using DetectMultiBackend
    model = DetectMultiBackend(str(model_path), device=torch.device(
        "cuda" if torch.cuda.is_available() else "cpu"))
    model.eval()
    return model
