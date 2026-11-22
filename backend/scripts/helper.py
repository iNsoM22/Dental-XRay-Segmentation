from PIL import Image
import numpy as np
from io import BytesIO


# Used for Converting Binary Image Data from User Upload to Numpy Array.
def user_file_to_array_image(image_bytes: bytes) -> np.ndarray:
    """
    Converts binary image data back to a NumPy array.

    Args:
        image_bytes (bytes): Binary image data from user upload.

    Returns:
        np.ndarray: Decoded image as an RGB NumPy array.
    """
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    return np.array(image)


# Used to Convert Np Array to Binary Image for Database Storage
def array_to_binary_image(image: np.ndarray, format: str = "JPEG") -> bytes:
    """
    Converts a NumPy array to raw image bytes for SQLite BLOB storage.

    Args:
        image (np.ndarray): Input image as a NumPy array.
        format (str): Image format (default is "JPEG"). Supports "PNG", "JPEG", etc.

    Returns:
        bytes: Encoded image bytes.
    """
    buffer = BytesIO()
    Image.fromarray(image).save(buffer, format=format)
    return buffer.getvalue()


# Used to Convert Binary to ioFile Streaming Response for API get
def binary_image_to_file(image: bytes):
    """
    Converts raw image bytes back to a file-like object for API response.

    Args:
        image (bytes): Binary image data retrieved from SQLite.

    Returns:
        BytesIO: File-like object containing the image data.
    """
    return BytesIO(image)
