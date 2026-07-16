import express from "express";
import verifyAuthToken from "../middleware/auth.middleware.js";
import { queryWithRAG } from "../services/rag.service.js";
import { detectDomain } from "../services/routeAgent.service.js";
import { externalKnowledgeResponse } from "../services/rag.service.js";
import { db } from "../firebase.js";

const router = express.Router();

router.post("/query", verifyAuthToken, async (req, res) => {
  const { query } = req.body;
  const uid = req.user.uid; 

  try {
    
    const domain = detectDomain(query);
    

    
    const snapshot = await db
      .collection("users")
      .doc(uid)
      .collection("chats")
      .orderBy("updatedAt", "desc")
      .limit(1)
      .get();

    let chatHistory = [];

    if (!snapshot.empty) {
      chatHistory = snapshot.docs[0].data().messages || [];
    }

    //Pass memory into RAG
    let answer;

    if (domain === "external") {
      answer = await externalKnowledgeResponse(query, chatHistory);
    } else {
      answer = await queryWithRAG(domain, query, chatHistory);
    }

    res.json({
      domain,
      answer,
    });
  } catch (error) {
    console.error("❌ RAG ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
