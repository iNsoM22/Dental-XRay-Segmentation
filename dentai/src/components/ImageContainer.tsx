import { motion } from "framer-motion";

interface ImageContainerProp {
  imageURL: string;
}

const ImageContainer = ({ imageURL }: ImageContainerProp) => {
  return (
    <div className="flex-grow flex justify-center w-full h-full items-center p-8 m-6 text-gray-600 text-xl bg-gray-100 rounded-md border">
      <motion.div
        className="flex justify-center items-center"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {imageURL ? (
          <img
            className="rounded-2xl box-content object-contain"
            src={imageURL}
            width={800}
            height={600}
            alt="Uploaded Preview"
          />
        ) : (
          <p className="text-center w-full flex items-center justify-center">
            Preview is not available
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ImageContainer;
