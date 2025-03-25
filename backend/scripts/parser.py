import numpy as np


def json_parser(predictions):
    """
    Parses a list of prediction results and organizes them by detected class, 
    counting the occurrences of each class and calculating the average confidence.

    Parameters:
    - predictions (list of dicts): A list of prediction dictionaries, where each dictionary 
      contains details of a detected object such as:
      - "class_name" (str): The name of the detected class.
      - "confidence" (float): The confidence score of the detection.

    Returns:
    - dict: A dictionary where each key is a class name and the value is another dictionary 
      with two fields:
      - "count" (int): The number of times this class was detected.
      - "confidence" (float): The average confidence for this class.

    Example:
    - input: [{'class_name': 'dog', 'confidence': 0.95}, {'class_name': 'dog', 'confidence': 0.85}, {'class_name': 'cat', 'confidence': 0.98}]
    - output: {'dog': {'count': 2, 'confidence': 0.90}, 'cat': {'count': 1, 'confidence': 0.98}}
    """
    parsed_results = {}
    for pred in predictions:
        detected_class = pred["class_name"]
        confidence = pred["confidence"]

        if detected_class in parsed_results:
            parsed_results[detected_class]["count"] += 1
            parsed_results[detected_class]["confidence"].append(confidence)
        else:
            parsed_results[detected_class] = {
                "count": 1,
                "confidence": [confidence],
            }

    for pred in parsed_results:
        conf = parsed_results[pred]["confidence"]
        parsed_results[pred]["confidence"] = np.mean(conf)

    return parsed_results
