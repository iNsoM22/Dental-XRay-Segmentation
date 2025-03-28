import { Button } from "@/components/ui/button";
import AnalysisContainer from "@/components/AnalysisContainer";
import { useImagePrediction } from "@/context/ImagePredictionContext";
import { useEffect, useRef, useState } from "react";
import { getPrediction, uploadImage } from "@/services/DBService";
import Container from "@/components/Container";
import { toastError } from "@/lib/toaster";
import Loader from "@/components/loader";

const PredictionPage = () => {
  const {
    imageForPredictionFile,
    predictedImageFile,
    predictedImageURL,
    setPredictedImageFile,
    setPredictedImageURL,
    fid,
    setFid,
  } = useImagePrediction();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(false);

  const toggleAnalysis = () => {
    setShowAnalysis((prev) => !prev);
  };

  const getPredictionsFromServer = async () => {
    if (!fid) return;

    const response = await getPrediction(fid);
    if (response?.imageFile) {
      setPredictedImageFile(response.imageFile);
      const predictionURL = URL.createObjectURL(response.imageFile);
      setPredictedImageURL(predictionURL);

      // Stop Polling
      setIsProcessing(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const handlePrediction = async (event: any) => {
    event.preventDefault();

    // Reset Previous Fid if Available
    setFid(null);
    setPredictedImageFile(null);
    setPredictedImageURL(null);
    setShowAnalysis(false);

    setIsButtonDisabled(true);
    setTimeout(() => setIsButtonDisabled(false), 5000);

    if (imageForPredictionFile) {
      const response = await uploadImage(imageForPredictionFile);
      if (response) {
        setFid(response);
        setIsProcessing(true);
      } else {
        toastError("Server Not Responding");
      }
    }
  };

  // Polling for Prediction Results
  useEffect(() => {
    if (fid && isProcessing) {
      intervalRef.current = setInterval(getPredictionsFromServer, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fid, isProcessing]);

  return (
    <main className="relative flex flex-col min-h-screen">
      <div className="flex flex-col pt-20 pb-8 px-2 lg:flex-row lg:w-full lg:justify-center lg:gap-5">
        <section className="flex flex-col max-sm:px-1 max-md:px-4  lg:px-2 lg:max-w-7xl lg:w-[70%] lg:justify-center">
          {/* Main Images Container */}
          <Container intervalId={intervalRef.current} loading={isProcessing} />
          <div className="flex w-full gap-4 mt-8 justify-center">
            <Button
              variant={"outline"}
              className="custom-button"
              onClick={handlePrediction}
              disabled={isButtonDisabled}
            >
              {predictedImageURL ? "Predict Again" : "Predict"}
            </Button>
            <Button
              variant={"outline"}
              className="custom-button px-16"
              onClick={toggleAnalysis}
              disabled={!predictedImageFile}
            >
              {!showAnalysis ? "Show Analysis" : "Close Analysis"}
            </Button>
          </div>
        </section>

        {/* Right Section - Text Analysis & Predict Again */}
        <section
          className={`lg:flex lg:flex-col lg:gap-4 lg:w-[25%] lg:max-w-xl transition-all duration-300 ${
            showAnalysis ? "block" : "hidden lg:block"
          }`}
        >
          <AnalysisContainer />
          {/* Predict Again Button (Large Screens) */}
          <Button
            variant="outline"
            className="custom-button-lg"
            onClick={handlePrediction}
            disabled={isButtonDisabled}
          >
            {isButtonDisabled ? (
              <div className=" p-4">
                <Loader />
              </div>
            ) : predictedImageURL ? (
              "Predict Again"
            ) : (
              "Predict"
            )}
          </Button>
        </section>
      </div>
    </main>
  );
};
export default PredictionPage;
