import { createContext, useContext, useState, ReactNode } from "react";

interface ImagePredictionContextType {
  imageForPredictionFile: File | null;
  predictedImageFile: File | null;
  imageForPredictionURL: string | null;
  predictedImageURL: string | null;

  setImageForPredictionFile: (file: File | null) => void;
  setPredictedImageFile: (file: File | null) => void;
  setImageForPredictionURL: (url: string | null) => void;
  setPredictedImageURL: (url: string | null) => void;
  resetImages: () => void;
}

const ImagePredictionContext = createContext<
  ImagePredictionContextType | undefined
>(undefined);

export const ImagePredictionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [imageForPredictionFile, setImageForPredictionFile] =
    useState<File | null>(null);
  const [predictedImageFile, setPredictedImageFile] = useState<File | null>(
    null
  );
  const [imageForPredictionURL, setImageForPredictionURL] = useState<
    string | null
  >(null);
  const [predictedImageURL, setPredictedImageURL] = useState<string | null>(
    null
  );

  const resetImages = () => {
    setImageForPredictionFile(null);
    setPredictedImageFile(null);
    setImageForPredictionURL(null);
    setPredictedImageURL(null);
  };

  return (
    <ImagePredictionContext.Provider
      value={{
        imageForPredictionFile,
        predictedImageFile,
        imageForPredictionURL,
        predictedImageURL,
        setImageForPredictionFile,
        setPredictedImageFile,
        setImageForPredictionURL,
        setPredictedImageURL,
        resetImages,
      }}
    >
      {children}
    </ImagePredictionContext.Provider>
  );
};

export const useImagePrediction = () => {
  const context = useContext(ImagePredictionContext);
  if (!context) {
    throw new Error(
      "useImagePrediction must be used within an ImagePredictionProvider"
    );
  }
  return context;
};
