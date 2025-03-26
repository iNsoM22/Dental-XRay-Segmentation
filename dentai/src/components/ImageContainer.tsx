import { motion } from "framer-motion";

interface ImageContainerProp {
  imageURL: string;
  unavailableMsg: string;
}

const ImageContainer = ({ imageURL, unavailableMsg }: ImageContainerProp) => {
  if (imageURL) {
    return (
      <motion.img
        className="flex-grow flex justify-center size-full items-center p-8 m-6 text-gray-600 text-xl bg-gray-300 rounded-md border"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        src={imageURL}
        alt="Upload Preview"
      />
    );
  }
  return (
    <div className="flex-grow flex justify-center w-full h-full items-center p-8 m-6 text-gray-600 text-xl bg-gray-100 rounded-md border">
      <motion.div
        className="flex justify-center items-center"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <p className="text-center w-full flex items-center justify-center">
          {unavailableMsg}
        </p>
      </motion.div>
    </div>
  );
};

export default ImageContainer;
