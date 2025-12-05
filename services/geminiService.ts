import { GoogleGenAI, Type, Schema } from "@google/genai";
import { InspirationResponse } from "../types";

// Initialize Gemini Client
// Assumption: process.env.API_KEY is available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

export const getInspiration = async (mood: string): Promise<InspirationResponse | null> => {
  try {
    const prompt = `生成一句独特、深刻或富有诗意的名言（中文），以匹配这种心情： "${mood}"。`;
    
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING, description: "名言内容（中文）。" },
        author: { type: Type.STRING, description: "作者姓名（如果是真实人物请用中文名，如果未知则填'佚名'）。" },
      },
      required: ["text", "author"],
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 1.1, // Slightly higher for creativity
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;

    return JSON.parse(jsonText) as InspirationResponse;
  } catch (error) {
    console.error("Error generating inspiration:", error);
    return null;
  }
};