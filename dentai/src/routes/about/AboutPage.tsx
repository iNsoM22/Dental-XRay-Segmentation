import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6">
      <motion.div
        className="max-w-4xl text-center bg-white/10 backdrop-blur-md p-10 rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-bold text-blue-400 mb-4">About Dent AI</h1>
        <p className="text-lg text-gray-300 leading-relaxed">
          <span className="font-semibold text-white">Dent AI</span> is an
          AI-powered segmentation model designed to precisely analyze X-ray
          images, detecting disfigurations, flaws, and anomalies with high
          accuracy.
        </p>
        <p className="mt-4 text-gray-300">
          Trained on a custom dataset using Kaggle, Dent AI leverages advanced
          deep learning techniques to assist medical professionals in diagnosis
          and analysis.
        </p>
      </motion.div>
    </div>
  );
};

export default About;
