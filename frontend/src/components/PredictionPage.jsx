import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { uploadImage } from "../services/apiService"; // Import the uploadImage function
import "./PredictionPage.css"; // Include the CSS file

const PredictPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve uploaded image from Home page
  const [uploadedImage, setUploadedImage] = useState(
    location.state?.uploadedImage || null
  );
  const [predictionResult, setPredictionResult] = useState(null); // Store prediction result (processed image or result)
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [errorMessage, setErrorMessage] = useState(null); // State for handling errors

  useEffect(() => {
    // If there is an uploaded image, call the FastAPI to get the prediction
    if (uploadedImage) {
      fetchPrediction(uploadedImage);
    }
  }, [uploadedImage]); // Re-run when uploadedImage changes

  const fetchPrediction = async (image) => {
    setLoading(true); // Set loading state to true when making the request
    setErrorMessage(null); // Clear previous error message, if any
    try {
      const response = await uploadImage(image); // Call API to process the image
      // Handle the returned response containing both processed image and prediction data
      const imageURL = URL.createObjectURL(response.imageBlob); // Create URL for processed image blob
      setPredictionResult({
        imageUrl: imageURL,
        predictedData: response.predictedData,
      }); // Store both the image and predicted data
    } catch (error) {
      console.error("Error during prediction:", error);
      setErrorMessage("Failed to process the image. Please try again.");
    } finally {
      setLoading(false); // Set loading state to false once the request is complete
    }
  };

  const handleBackToHome = () => {
    navigate("/"); // Navigate back to the home page
  };

  return (
    <div className="predict-page">
      {/* Image Preview */}
      <div className="image-preview">
        {uploadedImage ? (
          <img
            src={uploadedImage}
            alt="Uploaded X-ray"
            className="predict-image"
          />
        ) : (
          <p>No image uploaded. Please upload an image on the Home page.</p>
        )}
      </div>

      {/* Predict Section */}
      <div className="predict-section">
        {loading ? (
          <button className="predict-btn" disabled>
            Processing...
          </button>
        ) : (
          <button
            className="predict-btn"
            onClick={() => fetchPrediction(uploadedImage)}
          >
            Predict
          </button>
        )}
      </div>

      {/* Prediction Results */}
      <div className="prediction-results">
        {loading ? (
          <h2>Loading...</h2>
        ) : predictionResult ? (
          <>
            <h2>Prediction Results</h2>
            <div className="result-image">
              <img
                src={predictionResult.imageUrl}
                alt="Prediction"
                className="prediction-image"
              />
            </div>
            <div className="result-data">
              <h3>Prediction Data:</h3>
              <p>{predictionResult.predictedData}</p>{" "}
              {/* Display the predicted data */}
            </div>
          </>
        ) : errorMessage ? (
          <h2>{errorMessage}</h2>
        ) : (
          <h2>No prediction available.</h2>
        )}
      </div>

      {/* Back Button */}
      <div className="back-btn-container">
        <button className="back-btn" onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default PredictPage;
