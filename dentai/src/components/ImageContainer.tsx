import { motion } from "framer-motion";

interface ImageContainerProp {
  imageURL: string;
  unavailableMsg: string;
}

const ImageContainer = ({ imageURL, unavailableMsg }: ImageContainerProp) => {
  return (
    <div className="flex justify-center p-2 min-h-[50vh] max-h-full items-center w-full lg:h-full section-background rounded-md border shadow-md">
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
          className="flex justify-center items-center w-full h-full p-6 text-white text-xl"
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
