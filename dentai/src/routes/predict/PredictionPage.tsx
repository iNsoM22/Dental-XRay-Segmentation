import { Button } from "@/components/ui/button";
import AnalysisContainer from "@/components/AnalysisContainer";
import { useImagePrediction } from "@/context/ImagePredictionContext";
import { useEffect, useState } from "react";
import { getPrediction, uploadImage } from "@/services/DBService";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import Container from "@/components/Container";

const PredictionPage = () => {
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
  const [showAnalysis, setShowAnalysis] = useState(true);

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const toggleAnalysis = () => {
    setShowAnalysis((prev) => !prev);
  };

  // Re-Upload or HomePage Navigation Handler
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
    <main className="h-screen w-screen overflow-scroll md:overflow-hidden">
      <Card className="h-full w-full">
        <CardContent className="flex flex-col space-x-8 mt-[15%] md:mt-8 lg:m-0 lg:flex-row justify-center items-center">
          {/* relative w-full lg:w-[60%] min-h-[90%] max-h-full lg:max-w-[75%] */}
          <section className="relative w-full max-w-full lg:w-[60%] lg:max-w-[75%] h-[90%] my-auto">
            <Container />
            <div className="flex gap-4 mt-2 justify-center">
              <Button
                variant={"outline"}
                className="w-32 py-6 max-w-80 flex place-self-center visible lg:invisible bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:text-white text-white text-lg rounded-4xl shadow-md"
                onClick={handlePrediction}
              >
                {predictedImageURL ? "Predict Again" : "Predict"}
              </Button>
              <Button
                variant={"outline"}
                className="w-32 py-6 max-w-80 flex place-self-center visible lg:invisible bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 hover:text-white text-white text-lg rounded-4xl shadow-md"
                onClick={toggleAnalysis}
                disabled={!predictedImageFile}
              >
                {predictedImageURL ? "Show Analysis" : "Close Analysis"}
              </Button>
            </div>
          </section>

          {/* Right Section - Text Analysis & Predict Again */}
          <section
            className={`relative flex flex-col w-full min-h-60 max-h-full lg:max-w-[30%] lg:w-[20%] lg:h-[90%] gap-4 justify-center lg:justify-start
              transition-all duration-300 ${
                showAnalysis ? "visible" : "invisible lg:visible"
              }`}
          >
            <AnalysisContainer />
            {/* Predict Again Button (Large Screens) */}
            <Button
              variant="outline"
              className="w-60 max-w-80 hidden lg:flex self-center bg-gradient-to-r from-green-500 to-blue-500 
               hover:from-green-600 hover:to-blue-600 hover:text-white text-white text-lg 
               py-8 rounded-4xl shadow-md"
              onClick={handlePrediction}
            >
              {predictedImageURL ? "Predict Again" : "Predict"}
            </Button>
          </section>
        </CardContent>
      </Card>
    </main>
  );
};
export default PredictionPage;
