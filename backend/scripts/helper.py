from PIL import Image
import numpy as np
from io import BytesIO
from bson import Binary


# Used for Converting Binary Image Data from User Upload to Numpy Array.
def user_file_to_array_image(image_bytes: bytes) -> np.ndarray:
    """
    Converts binary image data back to a NumPy array.

    Args:
        image_bytes (bytes): Binary image data retrieved from MongoDB.

    Returns:
        np.ndarray: Decoded image as a NumPy array.
    """
    image = Image.open(BytesIO(image_bytes))
    return np.array(image)


# Used to Convert Np Array to Binary Image for Database Storage
def array_to_binary_image(image: np.ndarray, format: str = "JPEG") -> Binary:
    """
    Converts a NumPy array to a BSON Binary object for MongoDB storage.

    Args:
        image (np.ndarray): Input image as a NumPy array.
        format (str): Image format (default is "JPEG"). Supports "PNG", "JPEG", etc.

    Returns:
        Binary: BSON-compatible binary object for MongoDB.
    """
    buffer = BytesIO()
    Image.fromarray(image).save(buffer, format=format)
    return Binary(buffer.getvalue())


# Used to Convert Binary to ioFile Streaming Response for API get
def binary_image_to_file(image: Binary):
    """
    Converts a BSON Binary image back to a file-like object for API response.

    Args:
        image (Binary): Binary image data retrieved from MongoDB.

    Returns:
        BytesIO: File-like object containing the image data.
    """
    return BytesIO(image)
