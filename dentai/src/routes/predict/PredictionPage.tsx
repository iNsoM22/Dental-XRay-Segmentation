import { Button } from "@/components/ui/button";
import AnalysisContainer from "@/components/AnalysisContainer";
import { useImagePrediction } from "@/context/ImagePredictionContext";
import { Card, CardContent } from "@/components/ui/card";
import { icons } from "@/assets/assets";
import ImageContainer from "@/components/ImageContainer";
import "./PredictionPage.css";
import { useState } from "react";

const PredictionPage = () => {
  const [showPredictImage, setShowPredictImage] = useState(false);
  const {
    imageForPredictionFile,
    predictedImageFile,
    imageForPredictionURL,
    predictedImageURL,
  } = useImagePrediction();

  // Image Download Handler
  const handleDownload = (event: React.MouseEvent<HTMLButtonElement>) => {
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

  return (
    <main className="h-screen w-screen flex flex-col pb-10">
      <div className="flex size-full flex-grow p-6 mt-16 gap-6 max-w-10/12 mx-auto relative z-10">
        {/* Left Section - Image Preview */}
        <Card className="flex flex-col h-full w-5/6 p-4 shadow-2xl bg-white/90 backdrop-blur-lg">
          <CardContent className="flex flex-col">
            {/* Image Buttons to Change Between Original and Predicted Image*/}
            <div className="flex space-x-4 mb-4">
              <Button
                variant="outline"
                className={`w-24 border-gray-400 ${
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
                className={`w-24 border-gray-400 ${
                  showPredictImage ? "" : "bg-blue-300 hover:bg-blue-300"
                }`}
                onClick={() => {
                  setShowPredictImage(false);
                }}
              >
                Original
              </Button>
            </div>

            {/* Image Preview */}
            {!showPredictImage ? (
              <ImageContainer imageURL={imageForPredictionURL || ""} />
            ) : (
              <ImageContainer imageURL={predictedImageURL || ""} />
            )}

            {/* Download Button */}
            <Button
              variant="outline"
              className="absolute top-4 right-4 box-content cursor-pointer rounded-2xl"
              onClick={handleDownload}
            >
              <img
                src={icons.FileDownload}
                height={40}
                width={40}
                alt="Download Predictions"
              />
            </Button>
          </CardContent>
        </Card>
        {/* Right Section - Text Analysis & Predict Again */}
        <div className="flex flex-col w-1/4 gap-4">
          <AnalysisContainer />
          {/* Predict Again Button */}
          <Button
            variant={"outline"}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:text-white text-white text-lg py-8 rounded-4xl shadow-md"
          >
            {predictedImageURL ? "Predict Again" : "Predict"}
          </Button>
        </div>
      </div>
    </main>
  );
};

export default PredictionPage;
