import { Button } from "@/components/ui/button";
import AnalysisContainer from "@/components/AnalysisContainer";
import { useImagePrediction } from "@/context/ImagePredictionContext";
import { useState } from "react";
import { getPrediction } from "@/services/DBService";
import Container from "@/components/Container";
import { toastError } from "@/lib/toaster";
import Loader from "@/components/CircularLoader";
import { Question } from "@/lib/gemini";

const PredictionPage = () => {
  const {
    imageForPredictionFile,
    predictedImageFile,
    predictedImageURL,
    setPredictedImageFile,
    setPredictedImageURL,
  } = useImagePrediction();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const [rawText, setRawText] = useState<Question | null>(null);

  const toggleAnalysis = () => {
    setShowAnalysis((prev) => !prev);
  };

  const getPredictionsFromServer = async (event: any) => {
    event.preventDefault();
    if (!imageForPredictionFile) return;
    setIsProcessing(true);

    // Reset Previous Predictions
    setPredictedImageFile(null);
    setPredictedImageURL(null);
    setShowAnalysis(false);
    setRawText(null);

    const response = await getPrediction(imageForPredictionFile);
    if (response && response?.imageFile && response?.analysis) {
      setPredictedImageFile(response.imageFile);
      const predictionURL = URL.createObjectURL(response.imageFile);
      setPredictedImageURL(predictionURL);
      setRawText(response.analysis);
    } else {
      toastError("Server Not Responding");
    }
    setIsProcessing(false);
  };

  return (
    <main className="relative flex flex-col min-h-screen">
      <div className="flex flex-col pt-20 pb-8 px-2 lg:flex-row lg:w-full lg:justify-center lg:gap-5">
        <section className="flex flex-col max-sm:px-1 max-md:px-4  lg:px-2 lg:max-w-7xl lg:w-[70%] lg:justify-center">
          {/* Main Images Container */}
          <Container loading={isProcessing} />
          <div className="flex w-full gap-4 mt-8 justify-center">
            <Button
              variant={"outline"}
              className="custom-button"
              onClick={getPredictionsFromServer}
              disabled={isProcessing}
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
          className={`flex justify-center lg:flex lg:flex-col lg:gap-4 lg:w-[25%] lg:max-w-xl transition-all duration-300 ${
            showAnalysis ? "block" : "hidden lg:block"
          }`}
        >
          <AnalysisContainer rawFile={rawText} loading={isProcessing} />
          {/* Predict Again Button (Large Screens) */}
          <Button
            variant="outline"
            className="custom-button-lg"
            onClick={getPredictionsFromServer}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader />
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
