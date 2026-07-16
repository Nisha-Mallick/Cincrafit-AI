import express from "express";
import admin, { db } from "../firebase.js";
import verifyToken from "../middleware/auth.middleware.js";

const router = express.Router();

// SAVE / UPDATE CHAT
router.post("/save", verifyToken, async (req, res) => {
  const { chatId, domain, messages } = req.body;
  const uid = req.user.uid;

  try {
    if (chatId) {
      await db
        .collection("users")
        .doc(uid)
        .collection("chats")
        .doc(chatId)
        .update({
          messages,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return res.json({ success: true, chatId });
    }

    // new chat creation
    const docRef = await db
      .collection("users")
      .doc(uid)
      .collection("chats")
      .add({
        domain,
        messages,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({ success: true, chatId: docRef.id });
  } catch (err) {
    console.error("❌ Chat save error:", err);
    res.status(500).json({ error: "Failed to save chat" });
  }
});

// LIST CHATS
router.get("/list", verifyToken, async (req, res) => {
  const uid = req.user.uid;

  const snapshot = await db
    .collection("users")
    .doc(uid)
    .collection("chats")
    .orderBy("updatedAt", "desc")
    .get();

  const chats = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  }));

  res.json(chats);
});

// RENAME CHAT
router.put("/rename/:id", verifyToken, async (req, res) => {
  const uid = req.user.uid;
  const chatId = req.params.id;
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }

  try {
    await db
      .collection("users")
      .doc(uid)
      .collection("chats")
      .doc(chatId)
      .update({
        title: title.trim(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Chat rename error:", err);
    res.status(500).json({ error: "Failed to rename chat" });
  }
});

// DELETE CHAT
router.delete("/delete/:id", verifyToken, async (req, res) => {
  const uid = req.user.uid;
  const chatId = req.params.id;

  try {
    await db
      .collection("users")
      .doc(uid)
      .collection("chats")
      .doc(chatId)
      .delete();
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Chat delete error:", err);
    res.status(500).json({ error: "Failed to delete chat" });
  }
});

export default router;
