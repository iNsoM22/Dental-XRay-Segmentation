import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadImage } from "../services/apiService";
import "./Home.css";

const Home = ({ setUploadedImage }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp",
      ];
      if (validImageTypes.includes(selectedFile.type)) {
        const imageURL = URL.createObjectURL(selectedFile);
        setPreviewImage(imageURL);
        setFile(selectedFile);
        setImageUploaded(true);
      } else {
        alert("Please upload a valid image file (JPG, PNG, GIF, BMP, WEBP).");
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePredict = async () => {
    if (!file) {
      alert("Please upload an image first.");
      return;
    }

    setLoading(true);

    try {
      const processedImageBlob = await uploadImage(file);

      const processedImageUrl = URL.createObjectURL(processedImageBlob);
      setUploadedImage(processedImageUrl);
      navigate("/prediction", { state: { uploadedImage: processedImageUrl } });
    } catch (error) {
      alert("Failed to process the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="parallax"></div>
      {!imageUploaded && (
        <header className="header">
          <h1 className="header-title">DentAI</h1>
        </header>
      )}

      <div className="container">
        {!imageUploaded && (
          <div>
            <div className="instructions">
              Drop your X-ray image here or click to upload
            </div>
            <button className="upload-btn" onClick={handleButtonClick}>
              Drop Your X-Ray Here
            </button>
            <input
              type="file"
              accept="image/*"
              className="file-input"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>
        )}

        {imageUploaded && (
          <div className="image-preview-container">
            <div className="image-preview">
              <img src={previewImage} alt="Uploaded Preview" />
            </div>
            <button
              className="predict-btn"
              onClick={handlePredict}
              disabled={loading}
            >
              {loading ? "Processing..." : "Predict"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
