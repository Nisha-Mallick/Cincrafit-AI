import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("❌ GROQ_API_KEY missing");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Isolated RAG flow for Merchant Test Mode.
 * It ONLY uses the provided extracted text from the PDF.
 */
export const queryTestRAG = async (extractedText, userQuery, chatHistory = []) => {
  // Build conversation memory (up to last 6 messages)
  const conversationContext = chatHistory
    .slice(-6)
    .map(m => `${m.sender === "user" ? "User" : "AI"}: ${m.text}`)
    .join("\n");

  const systemPrompt = `
You are Cinecrafit AI Test Mode Assistant.
Your job is to answer questions strictly based on the provided VERIFIED CONTEXT.

Your knowledge rules (VERY IMPORTANT):
- You can ONLY use the information provided in the VERIFIED CONTEXT below.
- Never guess, assume, or invent offers, prices, coupons, or any details.
- Never use external knowledge or search the internet.
- If the user asks about something NOT present in the context, respond clearly: "I cannot find this information in your uploaded document."
- Keep your tone friendly, human, and conversational.

Strict formatting:
- Do not mention that you are reading from a PDF or context block directly (just say "in the document" or "in your offer").
`;

  const prompt = `
${systemPrompt}

==============================
PREVIOUS CONVERSATION:
${conversationContext || "No previous conversation."}
==============================

VERIFIED CONTEXT (Uploaded Document):
${extractedText || "No text available."}
==============================

USER QUESTION:
${userQuery}
`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Test RAG Error:", error);
    throw new Error("Failed to process query.");
  }
};
