import torch
import numpy as np
from scripts.loader import initialize_model
from scripts.inference import inference
from scripts.plot import plot_segments
from scripts.parser import json_parser

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = initialize_model().to(device)


def predict(image: np.ndarray):
    """
    Predicts object detections on a given image and returns both annotated image and parsed predictions.
    This Function should be used when inferencing on the image. 

    Args:
        image (np.array): Input image as a Numpy array (H, W, C).

    Returns:
        dict: A dictionary containing:
            - "image": Annotated image as a Numpy array with predictions drawn on it.
            - "predictions": Parsed predictions as a dictionary with class names as keys 
              and a dictionary of 'count' and 'average confidence' as values.

    Usage:
        The annotated image can be used for visualizing the predictions using libraries like
        matplotlib or OpenCV. It can also be used directly in frontend applications.

        The predictions dictionary contains the class names as keys, with their values being another 
        dictionary that holds:
            - "count": The number of instances detected for that class.
            - "confidence": The average confidence score of all instances of that class.
    """

    preds = inference(model, device, image, conf_thres=0.65)
    annotated_image = plot_segments(image, preds)
    parsed_predictions = json_parser(preds)
    return {
        "image": annotated_image,
        "predictions": parsed_predictions
    }


if __name__ == "__main__":
    # Usage of predict function.
    # Similar Logic Steps should be implemented when using this for Web Usage.
    import cv2

    image_path = 'model_testing_image.jpg'
    image = cv2.imread(image_path)

    result = predict(image)
    annotated_image = result["image"]
    predictions = result["predictions"]

    print("Predictions: ")
    for class_name, data in predictions.items():
        print(
            f"{class_name}: Count = {data['count']}, Average Confidence = {data['confidence']}")

    cv2.imshow("Annotated Image", annotated_image)

    cv2.waitKey(0)
    cv2.destroyAllWindows()
