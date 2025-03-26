import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { toastError } from "@/lib/toaster";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { useImagePrediction } from "@/context/ImagePredictionContext";

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const {
    imageForPredictionURL,
    setImageForPredictionURL,
    setImageForPredictionFile,
    resetImages,
  } = useImagePrediction();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile: File | undefined = event.target.files?.[0];

    if (selectedFile) {
      const validImageTypes: string[] = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/bmp",
        "image/webp",
      ];

      if (validImageTypes.includes(selectedFile.type)) {
        const imageURL: string = URL.createObjectURL(selectedFile);
        setImageForPredictionURL(imageURL);
        setImageForPredictionFile(selectedFile);
      } else {
        // Show SnackBar and Clear Values
        toastError(
          "Invalid File Type: Image should be of these types: jpeg, png, gif, bmp, or webp."
        );
      }
    }
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();
    if (imageForPredictionURL) {
      navigate("/predict");
    }
  };

  return (
    <div className="h-screen w-screen relative bg-gray-50 text-gray-900 flex flex-col">
      {/* Hero Section */}
      <section className="flex-grow flex justify-center items-center text-center max-h-[80%] bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="parallax">
          <motion.div
            className="w-full transition-all duration-1000 flex flex-col items-center"
            initial={{ x: 0 }}
          >
            <motion.h1
              className="text-7xl mt-20 font-extrabold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Revolutionizing Dental Care with AI
            </motion.h1>
            <motion.p
              className="text-2xl mt-8 max-w-xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              AI-powered dental X-ray analysis for early detection and better
              diagnosis.
            </motion.p>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                className="mt-20 px-15 py-9 bg-white text-blue-600 text-xl font-semibold rounded-4xl shadow-lg"
                variant={"secondary"}
                onClick={() => fileInputRef.current?.click()}
              >
                {/* Make this Input Button to Choose File From the Local and then Load that file */}
                {!imageForPredictionURL
                  ? "Upload X-Ray"
                  : "Select Another X-Ray"}
              </Button>
              <input
                type="file"
                hidden={true}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </motion.div>
          </motion.div>

          {imageForPredictionURL && (
            <div className="flex-col size-[520px] py-10 mr-44">
              <motion.div
                className="flex"
                initial={{ opacity: 0, width: 0, height: 0 }}
                animate={{ opacity: 1, width: "25rem", height: "25rem" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="relative flex justify-end">
                  <img
                    className="rounded-2xl shadow-lg"
                    src={imageForPredictionURL}
                    alt="Uploaded Preview"
                  />
                  <Button
                    className="flex absolute justify-center items-center p-4 m-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 shadow-md z-10"
                    onClick={() => resetImages()}
                  >
                    ✕
                  </Button>
                </div>
              </motion.div>

              <Button
                variant="outline"
                className="m-5 self-center bg-black w-50 max-w-50 h-24 rounded-4xl text-xl font-bold "
                onClick={handleSubmit}
              >
                Predict
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="flex flex-col max-h-[31%] h-full justify-center bg-gray-200 text-center">
        <h2 className="text-4xl font-semibold">Why Choose DentAi?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 mt-6">
          {[
            "AI-Powered Diagnosis",
            "Faster & More Accurate",
            "Secure & Private",
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * index }}
            >
              <Card className="shadow-lg hover:shadow-xl transition-all">
                <CardContent className="text-lg font-medium">
                  {feature}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
