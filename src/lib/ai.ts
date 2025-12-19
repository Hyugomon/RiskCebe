
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBW37adsy4SLtrCwPE_EXhHJhtmteScBhw"; // Provided by user
const genAI = new GoogleGenerativeAI(API_KEY);

export const callAI = async (
    systemPrompt: string,
    userPrompt: string,
    modelName: string = "models/gemini-3-flash-preview"
): Promise<string> => {
    try {
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemPrompt
        });

        const result = await model.generateContent(userPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
};
