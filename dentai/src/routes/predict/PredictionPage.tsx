import { Button } from "@/components/ui/button";
import AnalysisContainer from "@/components/AnalysisContainer";
import { useImagePrediction } from "@/context/ImagePredictionContext";
import { useEffect, useRef, useState } from "react";
import { getPrediction, uploadImage } from "@/services/DBService";
import { Card, CardContent } from "@/components/ui/card";
import Container from "@/components/Container";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    <main className="h-screen w-screen overflow-scroll md:overflow-hidden">
      <Card className="h-full w-full">
        <CardContent className="flex flex-col space-x-8 mt-[15%] md:mt-8 lg:m-0 lg:flex-row justify-center items-center">
          <section className="relative w-full max-w-full lg:w-[60%] lg:max-w-[75%] h-[90%] my-auto">
            {/* Main Images Container */}
            <Container intervalId={intervalRef.current} />
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
