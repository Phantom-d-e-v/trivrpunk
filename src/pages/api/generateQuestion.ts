// /pages/api/generateQuestion.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { subtopic } = req.body;

  if (!subtopic) {
    return res.status(400).json({ error: "Missing subtopic in body" });
  }

  const prompt = `
  Generate one multiple choice trivia question for the topic "${subtopic}".
  Response must be a JSON object in this format:
  {
    "question": "Which animal can sleep standing up?",
    "options": ["Elephant", "Cat", "Horse", "Frog"],
    "answer": "Horse"
  }
  Only give the JSON, no explanation.
  `;

  try {
    // Use a valid Gemini model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    if (!rawText) throw new Error("Empty response from Gemini");

    // Remove code fences if present
    const cleanedText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    // Extract the first JSON object from the cleaned text
    const match = cleanedText.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error("Failed to extract JSON");

    const parsed = JSON.parse(match[0]);

    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error("Gemini generateQuestion error:", error.message);
    return res.status(500).json({ error: "Failed to generate question." });
  }
}
