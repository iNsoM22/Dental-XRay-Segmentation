import axios from "axios";

const server: string = import.meta.env.VITE_SERVER_URL + "/api";

export const getPrediction = async (
  file: File
): Promise<{ imageFile: File; analysis: any } | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${server}/upload`, formData);

    const { image: base64Image, analysis } = response.data;

    const byteString = atob(base64Image);
    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }

    const imageFile = new File([byteArray], file.name, {
      type: "image/jpeg",
    });

    return { imageFile, analysis };
  } catch (err) {
    console.error("Error Receiving Prediction:", err);
    return null;
  }
};
