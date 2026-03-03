// Utils/geminiParser.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from './logger.js';

const GEMINI_TIMEOUT_MS = 30000; // 30 seconds

export async function parseTextWithGemini(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY in environment variables');

  if (text.length > 20000) {
    throw new Error('Input text is too long. Please keep it under 20,000 characters.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const result = await model.generateContent(prompt);
    clearTimeout(timeout);

    let responseText = result.response.text();

    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\s*/, '').replace(/```$/, '').trim();
    }

    const parsedData = JSON.parse(cleanedText);
    return parsedData;

  } catch (error) {
    clearTimeout(timeout);
    // ✅ FIX: Actually log the error
    logger.error('Gemini API error:', error.message);
    if (error.name === 'AbortError') {
      throw new Error('Gemini request timed out after 30 seconds.');
    }
    throw new Error('Failed to parse response from Gemini: ' + error.message);
  }
}