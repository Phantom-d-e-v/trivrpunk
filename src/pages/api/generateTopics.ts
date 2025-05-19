import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const topic = req.body?.topic || "fun general trivia";

  const prompt = `
You are a creative trivia generator AI. Based on the topic "${topic}", give me 5 trivia subtopics. 
Each should have:
- A catchy title (3-5 words)
- A quirky, intriguing one-liner description

Respond in this JSON array format:
[
  { "title": "Trivia Title", "description": "One-liner Description" },
  ...
]
`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const outputText = response.text();

    if (!outputText) {
      console.error("Gemini output is empty or undefined", response);
      return res
        .status(500)
        .json({ error: "Gemini output is empty or undefined" });
    }

    let triviaTopics;
    try {
      const cleanedText = outputText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      triviaTopics = JSON.parse(cleanedText);
    } catch (err) {
      console.error("Failed to parse Gemini output as JSON:", outputText, err);
      return res
        .status(500)
        .json({ error: "Failed to parse Gemini output as JSON" });
    }

    res.status(200).json({ topics: triviaTopics });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "Failed to generate topics." });
  }
}
