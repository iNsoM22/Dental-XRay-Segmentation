import { motion } from "framer-motion";

interface ImageContainerProp {
  imageURL: string;
  unavailableMsg: string;
}

const ImageContainer = ({ imageURL, unavailableMsg }: ImageContainerProp) => {
  return (
    <div className="flex justify-center items-center w-full h-full p-4 rounded-md border shadow-md">
      {imageURL ? (
        <motion.img
          className="max-w-full max-h-full w-full h-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          src={imageURL}
          alt="Upload Preview"
        />
      ) : (
        <motion.div
          className="flex justify-center items-center w-full h-full p-6 text-white text-xl rounded-md shadow-md"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="text-center text-lg font-semibold">{unavailableMsg}</p>
        </motion.div>
      )}
    </div>
  );
};

export default ImageContainer;
