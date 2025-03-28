from typing import Dict, List
import numpy as np


def json_parser(predictions: List[Dict[str, float]]) -> List[dict]:
    """
    Parses a list of prediction results and organizes them by detected class, 
    counting the occurrences of each class and calculating the average confidence.

    Parameters:
    - predictions(list of dicts): A list of prediction dictionaries, where each dictionary 
      contains details of a detected object such as:
      - "class_name" (str): The name of the detected class.
      - "confidence" (float): The confidence score of the detection.

    Returns:
    - list: A list of ProcessedPredictions instances, where each entry contains:
      - "class_name" (str): The name of the detected class.
      - "count" (int): The number of times this class was detected.
      - "average_confidence" (float): The average confidence for this class.

    Examples:
    - input: [{'class_name': 'dog', 'confidence': 0.95}, {'class_name': 'dog', 'confidence': 0.85}, {'class_name': 'cat', 'confidence': 0.98}]
    - output: [{class_name: 'dog', count: 2, average_confidence: 0.90},
               {class_name: 'cat', count: 1, average_confidence: 0.98}]
    """
    parsed_results: Dict[str, Dict[str, List[float] | int]] = {}
    for pred in predictions:
        detected_class: str = pred["class_name"]
        confidence: float = pred["confidence"]

        if detected_class in parsed_results:
            parsed_results[detected_class]["count"] += 1
            parsed_results[detected_class]["average_confidence"].append(
                confidence)
        else:
            parsed_results[detected_class] = {
                "count": 1,
                "average_confidence": [confidence]
            }

    processed_predictions: List[dict] = []
    for class_name, data in parsed_results.items():
        average_confidence: float = np.mean(data["average_confidence"])
        processed_predictions.append({
            "class_name": class_name,
            "count": data["count"],
            "average_confidence": average_confidence
        })

    return processed_predictions
