import axios from "axios";

const server: string = import.meta.env.VITE_SERVER_URL + "/api";

// Uploads the image to the server and returns a UUID for the request
export const uploadImage = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${server}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data?.data?.fid || null;
  } catch (error) {
    console.error("Error Uploading Image:", error);
    return null;
  }
};

// Fetches the prediction results for a given file ID
export const getPrediction = async (
  fileId: string
): Promise<{ imageFile: File | Blob } | null> => {
  try {
    const imageResponse = await axios.get(
      `${server}/api/prediction-image/${fileId}`,
      {
        responseType: "blob",
      }
    );

    const imageFile = new File(
      [imageResponse.data],
      `prediction_${fileId}.jpg`,
      { type: "image/jpeg" }
    );
    return { imageFile };
  } catch (error) {
    console.error("Error Fetching Prediction:", error);
    return null;
  }
};

// Fetches the Analysis for a given file ID
export const getAnalysis = async (fileId: string): Promise<string | null> => {
  try {
    const response = await axios.get(
      `${server}/api/prediction-analysis/${fileId}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error Fetching Analysis:", error);
    return null;
  }
};
