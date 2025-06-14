import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function askGrok(systemPrompt, finalPrompt) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama3-70b-8192",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: finalPrompt }
        ],
        max_tokens: 400,
        temperature: 0.1,
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("[GROK] API Error:", error?.response?.data || error.message);
    throw new Error("GROK API call failed.");
  }
}