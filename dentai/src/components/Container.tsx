import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useImagePrediction } from "@/context/ImagePredictionContext";
import { icons } from "@/assets/assets";
import ImageContainer from "./ImageContainer";
import { useNavigate } from "react-router-dom";
import Loader from "./loader";

interface ContainerProps {
  intervalId: NodeJS.Timeout | null;
  loading: boolean;
}

const Container = ({ intervalId, loading }: ContainerProps) => {
  const [showPredictImage, setShowPredictImage] = useState(false);
  const {
    imageForPredictionFile,
    predictedImageFile,
    imageForPredictionURL,
    resetImages,
    fid,
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
      a.download = fileToDownload.name || fid + "./jpg";
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
    <div className="w-full flex flex-col pt-8 gap-5 overflow-auto lg:overflow-hidden">
      {/* Tool Box */}
      <div className="flex justify-center w-full min-w-72">
        <div className="flex max-[400px]:justify-center max-[400px]:px-2 justify-between min-w-fit gap-4 items-center w-[90%] rounded-lg shadow px-8 py-2 section-background">
          <div className="flex gap-3 min-w-fit">
            <Button
              variant="outline"
              className={`og-pred-option-btn ${
                showPredictImage ? "bg-blue-600" : "bg-gray-600"
              }`}
              onClick={() => setShowPredictImage(true)}
            >
              Prediction
            </Button>
            <Button
              variant="outline"
              className={`og-pred-option-btn ${
                showPredictImage ? "bg-gray-600" : "bg-blue-600"
              }`}
              onClick={() => setShowPredictImage(false)}
            >
              Original
            </Button>
          </div>
          <div className="flex gap-3 min-w-fit">
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
      </div>

      {/* Image Container */}
      <div className="flex items-center justify-center lg:max-h-[70vh]">
        {loading ? (
          <Loader />
        ) : (
          <ImageContainer
            imageURL={
              (showPredictImage ? predictedImageURL : imageForPredictionURL) ||
              ""
            }
            unavailableMsg={
              showPredictImage ? "No Prediction Performed" : "Image Unavailable"
            }
          />
        )}
      </div>
    </div>
  );
};

export default Container;
