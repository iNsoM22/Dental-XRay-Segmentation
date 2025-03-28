import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useImagePrediction } from "@/context/ImagePredictionContext";
import { icons } from "@/assets/assets";
import ImageContainer from "./ImageContainer";
import { useNavigate } from "react-router-dom";

interface ContainerProps {
  intervalId: NodeJS.Timeout | null;
}

const Container = ({ intervalId }: ContainerProps) => {
  const [showPredictImage, setShowPredictImage] = useState(false);
  const {
    imageForPredictionFile,
    predictedImageFile,
    imageForPredictionURL,
    resetImages,
    predictedImageURL,
  } = useImagePrediction();
  const navigate = useNavigate();

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

  useEffect(() => {
    if (!predictedImageURL) return;

    setShowPredictImage(true);
  }, [predictedImageURL]);

  // Re-Upload or HomePage Navigation Handler
  const handleBackNavigation = (event: any) => {
    event.preventDefault();
    resetImages();
    setShowPredictImage(false);
    intervalId && clearInterval(intervalId);
    navigate("/");
  };

  return (
    <div className="lg:min-h-screen flex flex-col items-center justify-center p-4">
      {/* Tool Box */}
      <div className="flex justify-between items-center w-full max-w-3xl p-3 rounded-lg shadow-md section-background">
        <div className="flex space-x-4">
          <Button
            variant="outline"
            className={`w-28 border-gray-400 text-[17px] text-white hover:bg-blue-600 ${
              showPredictImage ? "bg-blue-600" : "bg-gray-600"
            }`}
            onClick={() => setShowPredictImage(true)}
          >
            Prediction
          </Button>
          <Button
            variant="outline"
            className={`w-28 border-gray-400 text-[17px] text-white hover:bg-blue-600 ${
              showPredictImage ? "bg-gray-600" : "bg-blue-600"
            }`}
            onClick={() => setShowPredictImage(false)}
          >
            Original
          </Button>
        </div>
        <div className="flex space-x-3">
          <img
            src={icons.BackArrow}
            height={27}
            width={27}
            alt="Back Arrow"
            className="cursor-pointer rounded-lg hover:opacity-80"
            onClick={handleBackNavigation}
          />
          <img
            src={icons.FileDownload}
            height={27}
            width={27}
            alt="Download Predictions"
            className="cursor-pointer rounded-lg hover:opacity-80"
            onClick={handleDownload}
          />
        </div>
      </div>

      {/* Image Container */}
      <div className="mt-8 grow w-full max-w-6xl h-[90%] flex justify-center">
        <div className="max-w-screen w-full p-6 rounded-lg flex items-center justify-center min-h-[400px] md:max-h-[70vh] section-background">
          <ImageContainer
            imageURL={
              (showPredictImage ? predictedImageURL : imageForPredictionURL) ||
              ""
            }
            unavailableMsg={
              showPredictImage ? "No Prediction Performed" : "Image Unavailable"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Container;
