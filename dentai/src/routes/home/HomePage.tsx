import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useRef } from "react";
import { toastError } from "@/lib/toaster";
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

  const handleFileChange = (event: any) => {
    resetImages();
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
    <main className="relative lg:h-screen flex flex-col bg-gradient-to-r from-blue-600 to-blue-400 bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="parallax flex flex-col min-h-[70vh] lg:flex-row grow justify-center items-center text-center text-white p-4 pb-3 lg:pl-10 xl:pt-10">
        <motion.div
          className={`w-full ${
            imageForPredictionURL && "md:w-[80%]"
          } transition-all duration-1000 ease-in flex flex-col items-center`}
          initial={{ x: 0 }}
        >
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl mt-20 font-extrabold md:px-20 lg:px-40"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Revolutionizing Dental Care with AI
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl md:text-2xl mt-6 max-w-xl mx-auto"
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
              className="primary-btn"
              variant={"secondary"}
              onClick={() => fileInputRef.current?.click()}
            >
              {!imageForPredictionURL ? "Upload X-Ray" : "Select Another X-Ray"}
            </Button>
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </motion.div>
        </motion.div>

        {imageForPredictionURL && (
          <div className="flex flex-col justify-between items-center lg:mr-44 py-6 sm:py-10 max-sm:w-[80%]">
            <div className="relative flex justify-center w-full">
              <motion.img
                className="rounded-2xl shadow-lg sm:max-w-[400px] md:max-w-[500px]"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  maxHeight: 320,
                  maxWidth: 500,
                }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                src={imageForPredictionURL}
                alt="Uploaded Preview"
              />
              <Button
                className="absolute top-3 right-5 lg:right-4 p-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm"
                onClick={() => {
                  resetImages();
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                ✕
              </Button>
            </div>

            <Button
              variant="outline"
              className="mt-5 bg-black w-40 h-12 rounded-4xl text-lg font-bold"
              onClick={handleSubmit}
            >
              Predict
            </Button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="flex flex-col p-6 pb-16 bg-gray-200 text-center">
        <h2 className="text-2xl md:text-4xl font-semibold">
          Why Choose DentAI?
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
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
                <CardContent className="text-lg font-medium py-4">
                  {feature}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
