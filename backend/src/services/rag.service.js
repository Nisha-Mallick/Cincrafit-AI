import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import Groq from "groq-sdk";
import { fileURLToPath } from "url";

if (!process.env.GROQ_API_KEY) {
  throw new Error("❌ GROQ_API_KEY missing");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// PDF TEXT EXTRACTION
const extractPdfText = async (pdfPath) => {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const parser = new PDFParse({ data: dataBuffer });
    const data = await parser.getText();
    await parser.destroy();
    return data.text;
  } catch (err) {
    throw err;
  }
};

//LOADING PDFs FROM FOLDER
const loadPdfTextFromFolder = async (folderPath) => {
  console.log("📂 Loading PDFs from:", folderPath);

  const files = fs.readdirSync(folderPath);
  let combinedText = "";

  for (const file of files) {
    if (file.endsWith(".pdf")) {
      const pdfPath = path.join(folderPath, file);
      const text = await extractPdfText(pdfPath);
      combinedText += text + "\n";
    }
  }

  return combinedText;
};

//MAIN RAG FUNCTION
export const queryWithRAG = async (domain, userQuery, chatHistory = []) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const DATA_DIR = path.join(__dirname, "../../data");

  let context = "";
  if (domain === "all") {
    context += await loadPdfTextFromFolder(path.join(DATA_DIR, "movies")) + "\\n";
    context += await loadPdfTextFromFolder(path.join(DATA_DIR, "fashion")) + "\\n";
    context += await loadPdfTextFromFolder(path.join(DATA_DIR, "food")) + "\\n";
  } else {
    let folderPath = "";
    if (domain === "movie") folderPath = path.join(DATA_DIR, "movies");
    if (domain === "fashion") folderPath = path.join(DATA_DIR, "fashion");
    if (domain === "food") folderPath = path.join(DATA_DIR, "food");
    if (folderPath) context = await loadPdfTextFromFolder(folderPath);
  }

  // BUILDING CONVERSATION MEMORY (UPTO LAST 6 MESSAGES)
const conversationContext = chatHistory
  .slice(-6)
  .map(m => `${m.sender === "user" ? "User" : "AI"}: ${m.text}`)
  .join("\n");

  const systemPrompt = `
You are Cincrafit AI, a friendly and trustworthy deals assistant.

Your personality:
- Sound like a helpful friend who explains things clearly
- Be polite, warm, and conversational
- Don’t sound robotic or overly formal

Your knowledge rules (VERY IMPORTANT):
- You can ONLY use the information provided in the VERIFIED CONTEXT.
- Never guess, assume, or invent offers, prices, or coupon codes.
- If the user asks about something NOT present in the context, respond clearly and honestly.

How to answer:
- If a verified deal exists:
  - Explain it in a friendly way
  - Mention key details (brand/platform, offer, validity, benefits)
  - Example tone:
    “Yes! 😊 This offer is available and here’s what you get…”

- If NO relevant data exists in the context:
  - You MUST reply EXACTLY with the phrase: "NO_VERIFIED_DATA_FOUND"
  - Do not provide any other text.

Strict rules:
- Stay within the selected domain (movies, fashion, food)
- Never hallucinate or fabricate deals
- Never say you searched the internet
- Never mention PDFs or internal files directly
- Only rely on the provided context

You are part of a multi-agent system:
- A Route Agent decides the domain
- You respond ONLY using verified domain data
`;

 const prompt = `
${systemPrompt}

==============================
PREVIOUS CONVERSATION:
${conversationContext || "No previous conversation."}
==============================

VERIFIED CONTEXT:
${context}
==============================

USER QUESTION:
${userQuery}
`;


  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
  });

  const responseText = completion.choices[0].message.content;
  if (responseText.includes("NO_VERIFIED_DATA_FOUND")) {
    return await queryExternalWithModel(userQuery, chatHistory);
  }

  return responseText;
};

// Smart External Knowledge TOOL Fallback
export const queryExternalWithModel = async (userQuery, chatHistory = []) => {
  const conversationContext = chatHistory
    .slice(-6)
    .map(m => `${m.sender === "user" ? "User" : "AI"}: ${m.text}`)
    .join("\n");

  const systemPrompt = `
You are Cinecrafit AI.

You do NOT have verified internal data for this query.

Your role:
- Help the user intelligently
- Guide them step by step
- Explain WHERE and HOW to find the correct information
- Be specific to the platform and country if mentioned
- Never claim you searched the internet
- Never invent offers or prices

STRICT FORMATTING RULES (MANDATORY):
- Explain navigation steps
- Explain what sections to check
- Suggest Google search phrasing
- Ask clarifying follow-up questions
- Output MUST contain multiple lines
- EACH step must be on its OWN line
- Insert a blank line between steps
- Every step MUST start with: "Step X:"
- NEVER write steps in a single paragraph
- Use newline characters strictly (\n\n)

Tone:
Friendly, human, helpful.
`;

  const prompt = `
${systemPrompt}
==============================
PREVIOUS CONVERSATION:
${conversationContext || "None"}
==============================
USER QUERY:
${userQuery}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [{ role: "user", content: prompt }],
  });

  return completion.choices[0].message.content;
};

export { queryExternalWithModel as externalKnowledgeResponse };

