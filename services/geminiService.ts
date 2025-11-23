import { GoogleGenAI, Type } from "@google/genai";
import { Diagnosis } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const diagnosisSchema = {
    type: Type.OBJECT,
    properties: {
        plantName: {
            type: Type.STRING,
            description: "The common name of the plant species in the image."
        },
        disease: {
            type: Type.STRING,
            description: "The common name of the plant disease. If the plant is healthy, say 'Healthy'."
        },
        description: {
            type: Type.STRING,
            description: "A brief, one to two sentence description of the disease and its typical symptoms on a leaf."
        },
        treatment: {
            type: Type.STRING,
            description: "A simple, actionable treatment recommendation for a home gardener. Provide 2-3 bullet points. If healthy, suggest general care tips."
        },
    },
    required: ["plantName", "disease", "description", "treatment"]
};

function base64ToGenerativePart(base64Data: string, mimeType: string) {
    return {
      inlineData: {
        data: base64Data.split(',')[1],
        mimeType
      },
    };
}

export async function diagnosePlant(imageBase64: string, language: 'en' | 'ur'): Promise<Diagnosis> {
  const imageMimeType = imageBase64.match(/data:(image\/[a-zA-Z]+);base64,/)?.[1] || 'image/jpeg';
  
  const imagePart = base64ToGenerativePart(imageBase64, imageMimeType);

  const languageInstruction = language === 'ur'
    ? "All string values in the JSON object, including the plant name, disease, description, and especially the treatment plan, must be in the Urdu language, written in the Urdu script."
    : "All string values in the JSON object must be in the English language.";

  const textPart = {
    text: `You are an expert plant pathologist and botanist. Analyze this image of a plant leaf.
    First, identify the plant's common name.
    Then, identify the disease, if any. Provide a brief description and simple treatment advice suitable for a home gardener.
    If the plant appears healthy, state that and provide general care tips as the treatment.
    Respond only with the JSON object as specified in the schema.
    ${languageInstruction}`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
        responseMimeType: "application/json",
        responseSchema: diagnosisSchema,
    }
  });

  const text = response.text.trim();
  try {
    const parsedJson = JSON.parse(text);
    return parsedJson as Diagnosis;
  } catch(e) {
    console.error("Failed to parse JSON response:", text);
    throw new Error("Received an invalid response from the AI model.");
  }
}