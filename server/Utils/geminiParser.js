// server/utils/geminiParser.js
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function parseTextWithGemini(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment variables");
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  // Updated prompt to enforce valid JSON output
  const prompt = `
You are a project generator. Analyze the following chat log and output ONLY a valid JSON object 
(with no extra text or markdown code fences) that lists the files to create with their complete code.
The JSON format should be:
{
  "files": [
    { "name": "filename.ext", "content": "complete file code" },
    ...
  ]
}
Chat log:
${text}
  `;
  
  try {
    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    // console.log("Raw Gemini output:", responseText);
    
    // Clean up the response in case it's wrapped in triple backticks
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```(?:json)?\s*/, "").replace(/```$/, "").trim();
    }
    
    const parsedData = JSON.parse(cleanedText);
    return parsedData;
    
  } catch (error) {
    // console.error("Error generating content with Gemini:", error);
    throw new Error("Google Gemini API call failed.");
  }
}
