import { GoogleGenerativeAI } from "@google/generative-ai";

export interface Question {
  className: string;
  count: number;
  averageConfidence: number;
}

const genAI = new GoogleGenerativeAI(
  import.meta.env.VITE_GEMINI_API_PUBLIC_KEY
);
const systemInstruction: string =
  "You are an expert dentist. Based on the following patient data, " +
  "recommend precise and valid treatments and some preventions from " +
  "further loss that the patient should consider. Do not ask for a further " +
  "appointment or meeting with you. Suggest briefly but in a friendly yet professional tone.";

const models = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  systemInstruction: systemInstruction,
});

export const askModel = async (setAnswerOn: any, query: Question[]) => {
  let reportDescription: string = "";
  query.forEach((value) => {
    reportDescription += `${value.className} has ${
      value.count
    } instances, with an overall confidence score of ${value.averageConfidence.toFixed(
      2
    )}.\n`;
  });

  const response = await models.generateContentStream(reportDescription);

  for await (const chunk of response.stream) {
    setAnswerOn((prev: string) => prev + chunk.text());
  }
};
