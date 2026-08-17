import { GoogleGenAI } from "@google/genai";
import { AiActionType } from "../types";

const apiKey = process.env.API_KEY || '';
// Note: In a real app, handle missing key gracefully.
const ai = new GoogleGenAI({ apiKey });

export const generateBlogContent = async (
  action: AiActionType,
  context: string,
  currentContent: string
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please provide a valid API Key.");
  }

  const modelId = 'gemini-2.5-flash';
  let prompt = "";

  switch (action) {
    case AiActionType.GENERATE_TITLE:
      prompt = `Generate a catchy, SEO-friendly title for a blog post with the following content. Return ONLY the title text, no quotes. Content: ${currentContent.substring(0, 1000)}...`;
      break;
    case AiActionType.SUMMARIZE:
      prompt = `Write a short 2-sentence summary (meta description) for this blog post. Return ONLY the summary. Content: ${currentContent.substring(0, 2000)}...`;
      break;
    case AiActionType.FIX_GRAMMAR:
      prompt = `Fix the grammar and spelling of the following text, maintaining the original tone and markdown formatting. Return only the corrected text. Text: ${context}`;
      break;
    case AiActionType.EXPAND_TEXT:
      prompt = `Expand upon the following idea or paragraph to make it more detailed and engaging for a blog post. Use Markdown. Idea: ${context}`;
      break;
    default:
      return "";
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate content. Please try again.");
  }
};