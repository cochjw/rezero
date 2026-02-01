
import { GoogleGenAI } from "@google/genai";
import { Ingredient } from "../types";

// Always initialize with process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateRecipe = async (ingredients: Ingredient[]): Promise<string> => {
  if (!process.env.API_KEY) return "API Key가 설정되지 않았습니다.";

  const ingredientNames = ingredients.map(i => i.name).join(', ');
  const prompt = `다음 식재료를 메인으로 한국식 요리 레시피 추천: ${ingredientNames}. 친절하게.`;

  try {
    const response = await ai.models.generateContent({
      // Use gemini-3-flash-preview for basic text tasks (e.g., recipe recommendation)
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Use the .text property to get the generated text
    return response.text || "레시피를 생성하지 못했습니다.";
  } catch (error) {
    // Log helpful message but return standard user-friendly string
    console.error("Gemini Recipe Generation failed (likely quota or network):", error);
    return "레시피를 불러올 수 없습니다. (할당량 초과 또는 네트워크 오류)";
  }
};

// Image generation function removed as we are using static category illustrations now.
export const generateIngredientImage = async (ingredientName: string): Promise<string | null> => {
  return null;
};
