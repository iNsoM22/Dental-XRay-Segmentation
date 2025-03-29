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
    return null;
  }
};

// Fetches the prediction results for a given file ID
export const getPrediction = async (
  fileId: string
): Promise<{ imageFile: File } | null> => {
  try {
    const response = await axios.get(`${server}/prediction-image/${fileId}`, {
      responseType: "blob",
      validateStatus: (status) => status === 200 || status === 204,
    });
    if (response.status === 204) {
      return null;
    }
    const imageFile = new File([response.data], `prediction_${fileId}.jpg`, {
      type: "image/jpeg",
    });
    return { imageFile };
  } catch (error) {
    return null;
  }
};

// Fetches the Analysis for a given file ID
export const getAnalysis = async (fileId: string): Promise<any> => {
  try {
    const response = await axios.get(
      `${server}/prediction-analysis/${fileId}`,
      {
        headers: { "Content-Type": "application/json" },
        validateStatus: (status) => status === 200 || status === 204,
      }
    );
    if (response.status === 204) {
      return null;
    }
    return response.data;
  } catch (error) {
    return null;
  }
};
