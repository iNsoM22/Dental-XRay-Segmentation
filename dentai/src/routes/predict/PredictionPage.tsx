import { Button } from "@/components/ui/button";
import AnalysisContainer from "@/components/AnalysisContainer";
import { useImagePrediction } from "@/context/ImagePredictionContext";
import { Card, CardContent } from "@/components/ui/card";
import { icons } from "@/assets/assets";
import ImageContainer from "@/components/ImageContainer";
import "./PredictionPage.css";
import { useEffect, useState } from "react";
import { getPrediction, uploadImage } from "@/services/DBService";
import { useNavigate } from "react-router-dom";

const PredictionPage = () => {
  const [showPredictImage, setShowPredictImage] = useState(false);
  const {
    imageForPredictionFile,
    predictedImageFile,
    imageForPredictionURL,
    predictedImageURL,
    setPredictedImageFile,
    setPredictedImageURL,
    fid,
    setFid,
    resetImages,
  } = useImagePrediction();
  const [isProcessing, setIsProcessing] = useState(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();

  // Image Download Handler
  const handleDownload = (event: any) => {
    event.preventDefault();

    let fileToDownload = showPredictImage
      ? predictedImageFile
      : imageForPredictionFile;

    if (fileToDownload) {
      const url = URL.createObjectURL(fileToDownload);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileToDownload.name || "downloaded_image.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleBackNavigation = (event: any) => {
    event.preventDefault();
    resetImages();
    intervalId && clearInterval(intervalId);
    navigate("/");
  };

  const getPredictionsFromServer = async () => {
    if (fid) {
      const response = await getPrediction(fid);
      response && setPredictedImageFile(response);
      if (predictedImageFile) {
        const predictionURL = URL.createObjectURL(predictedImageFile);
        setPredictedImageURL(predictionURL);
        // Stop Polling
        setIsProcessing(false);
        setIntervalId(null);
      }
    }
  };
  const handlePrediction = async (event: any) => {
    event.preventDefault();
    // Reset Previous Fid if Available
    setFid(null);

    if (imageForPredictionFile) {
      const response = await uploadImage(imageForPredictionFile);
      if (response) {
        setFid(response);
        setIsProcessing(true);
      }
    }
  };

  // Polling for Prediction Results
  useEffect(() => {
    if (isProcessing && !predictedImageFile && !predictedImageURL) {
      const id = setInterval(getPredictionsFromServer, 5000);
      setIntervalId(id);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isProcessing, fid]);

  return (
    <main className="h-screen w-screen overflow-hidden py-10">
      {/* Left Section - Image Preview */}
      <div className="flex flex-grow max-h-screen h-[85%] mt-16 max-w-9/12 mx-auto relative">
        {/* Right Side Tool Box */}
        <span className="right-tool-box">
          {/* Image Buttons to Change Between Original and Predicted Image*/}
          <Button
            variant="outline"
            className={`w-20  max-w-26 border-gray-400 ${
              showPredictImage ? "bg-blue-300 hover:bg-blue-300" : ""
            }`}
            onClick={() => {
              setShowPredictImage(true);
            }}
          >
            Prediction
          </Button>
          <Button
            variant="outline"
            className={`w-20 max-w-26 border-gray-400 ${
              showPredictImage ? "" : "bg-blue-300 hover:bg-blue-300"
            }`}
            onClick={() => {
              setShowPredictImage(false);
            }}
          >
            Original
          </Button>
          {/* Back Button */}
          <img
            src={icons.BackArrow}
            height={27}
            width={27}
            alt="Back Arrow"
            className="cursor-pointer rounded-2xl"
            onClick={handleBackNavigation}
          />
          {/* Download Button */}
          <img
            src={icons.FileDownload}
            height={27}
            width={27}
            alt="Download Predictions"
            className="cursor-pointer rounded-2xl"
            onClick={handleDownload}
          />
        </span>

        {/* Image Preview */}
        {!showPredictImage ? (
          <ImageContainer
            imageURL={imageForPredictionURL || ""}
            unavailableMsg="Image Unavailable"
          />
        ) : (
          <ImageContainer
            imageURL={predictedImageURL || ""}
            unavailableMsg="No Prediction Performed"
          />
        )}

        {/* Right Section - Text Analysis & Predict Again */}
        <div className="flex flex-col w-1/4 gap-4">
          <AnalysisContainer />
          {/* Predict Again Button */}
          <Button
            variant={"outline"}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:text-white text-white text-lg py-8 rounded-4xl shadow-md"
            onClick={handlePrediction}
          >
            {predictedImageURL ? "Predict Again" : "Predict"}
          </Button>
        </div>
      </div>
    </main>
  );
};
export default PredictionPage;
