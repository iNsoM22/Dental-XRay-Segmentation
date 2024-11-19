import os
import google.generativeai as genai
from dotenv import load_dotenv


load_dotenv()


api = os.getenv("API_KEY")
genai.configure(api_key=api)
model = genai.GenerativeModel("gemini-1.5-flash")


def generator(patient_data: dict):
    """
    Argument Example:
        patient_data = {
            'cavity': {'count': 2, 'confidence': 0.90},
            'impacted tooth': {'count': 1, 'confidence': 0.98}
            }
    """
    patient_description = (
        "You are an expert dentist. Based on the following patient data, recommend precise and valid treatments and some preventions from further loss that the patient should consider. "
        "Do not ask for a further appointment or meeting with you. Suggest briefly but in a friendly yet professional tone:\n\n"
    )
    for key, value in patient_data.items():
        patient_description += f"{key.capitalize()}: {value['count']} instance(s), confidence {value['confidence']:.0%}.\n"

    response = model.generate_content(patient_description)
    return response.text
