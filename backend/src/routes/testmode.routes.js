import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import admin, { db } from "../firebase.js";
import { PDFParse } from "pdf-parse";
import { queryTestRAG } from "../services/merchantTest.service.js";

const router = express.Router();

// Multer config for in-memory uploads (up to 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Middleware: Verify Token & Merchant Auth
 */
const verifyMerchantAuth = async (req, res, next) => {
  const idToken = req.headers.authorization?.split("Bearer ")[1];
  if (!idToken) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    
    if (!userDoc.exists) return res.status(404).json({ error: "User not found" });
    
    const userData = userDoc.data();
    
    const isAdmin = userData.isAdmin === true;
    const isApprovedMerchant = userData.merchantVerified === true && userData.verificationStatus === "approved";

    if (!isAdmin && !isApprovedMerchant) {
      return res.status(403).json({ error: "Forbidden: Admin or Approved Merchant access required" });
    }
    
    req.user = { uid: decoded.uid, email: decoded.email, ...userData };
    next();
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

/**
 * 1. GET CAMPAIGNS
 */
router.get("/campaigns", verifyMerchantAuth, async (req, res) => {
  try {
    const uploadsRef = db.collection("users").doc(req.user.uid).collection("uploads");
    const snapshot = await uploadsRef.orderBy("uploadedAt", "desc").get();
    
    const campaigns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({ campaigns });
  } catch (error) {
    console.error("Fetch Campaigns Error:", error);
    res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

/**
 * 2. UPLOAD & PARSE PDF
 */
router.post("/upload", verifyMerchantAuth, upload.single("pdf"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No PDF uploaded" });

  try {
    // 1. Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: `cinecrafit/merchants/${req.user.uid}`, resource_type: "raw" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // 2. Parse PDF Text
    const parser = new PDFParse({ data: req.file.buffer });
    const parsedData = await parser.getText();
    await parser.destroy();
    const extractedText = parsedData.text;

    // 3. Save to Firestore
    const uploadRef = db.collection("users").doc(req.user.uid).collection("uploads").doc();
    
    const metadata = {
      merchantUid: req.user.uid,
      merchantName: req.user.businessName || req.user.email,
      category: req.user.businessType || "Unknown",
      fileName: req.file.originalname,
      fileSize: req.file.size,
      pdfUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      extractedText,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      merchantApproved: false,
      status: "draft",
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    };

    await uploadRef.set(metadata);

    res.status(201).json({ success: true, uploadId: uploadRef.id, ...metadata });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Upload failed: " + error.message });
  }
});

/**
 * 3. DELETE UPLOAD
 */
router.delete("/upload/:uploadId", verifyMerchantAuth, async (req, res) => {
  try {
    const { uploadId } = req.params;
    const uploadRef = db.collection("users").doc(req.user.uid).collection("uploads").doc(uploadId);
    const doc = await uploadRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Upload not found" });

    const data = doc.data();
    
    // Delete from Cloudinary
    if (data.publicId) {
      await cloudinary.uploader.destroy(data.publicId, { resource_type: "raw" });
    }

    // Delete Chats collection recursively (optional but good practice)
    const chatsRef = uploadRef.collection("chats");
    const chatsSnapshot = await chatsRef.get();
    const batch = db.batch();
    chatsSnapshot.docs.forEach(cDoc => batch.delete(cDoc.ref));
    await batch.commit();

    // Delete Document
    await uploadRef.delete();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

/**
 * 4. TEST MODE CHAT QUERY
 */
router.post("/query", verifyMerchantAuth, async (req, res) => {
  const { uploadId, query, chatHistory } = req.body;
  if (!uploadId || !query) return res.status(400).json({ error: "Missing parameters" });

  try {
    const uploadRef = db.collection("users").doc(req.user.uid).collection("uploads").doc(uploadId);
    const doc = await uploadRef.get();

    if (!doc.exists) return res.status(404).json({ error: "Campaign not found" });
    
    const { extractedText } = doc.data();
    const answer = await queryTestRAG(extractedText, query, chatHistory);

    res.status(200).json({ answer });
  } catch (error) {
    console.error("Query Error:", error);
    res.status(500).json({ error: "Failed to process query" });
  }
});

/**
 * 5. GET/SAVE CHATS (Specific to Upload)
 */
router.get("/chats/:uploadId", verifyMerchantAuth, async (req, res) => {
  try {
    const chatDoc = await db.collection("users").doc(req.user.uid)
      .collection("uploads").doc(req.params.uploadId)
      .collection("chats").doc("default").get();

    if (!chatDoc.exists) return res.status(200).json({ messages: [] });
    res.status(200).json(chatDoc.data());
  } catch (error) {
    console.error("Get Chat Error:", error);
    res.status(500).json({ error: "Failed to fetch chat" });
  }
});

router.post("/chats/:uploadId", verifyMerchantAuth, async (req, res) => {
  try {
    const { messages } = req.body;
    await db.collection("users").doc(req.user.uid)
      .collection("uploads").doc(req.params.uploadId)
      .collection("chats").doc("default")
      .set({
        messages,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Save Chat Error:", error);
    res.status(500).json({ error: "Failed to save chat" });
  }
});

/**
 * 6. APPROVE DATASET
 */
router.post("/approve/:uploadId", verifyMerchantAuth, async (req, res) => {
  try {
    const uploadRef = db.collection("users").doc(req.user.uid).collection("uploads").doc(req.params.uploadId);
    await uploadRef.update({
      merchantApproved: true,
      status: "approved",
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Approve Error:", error);
    res.status(500).json({ error: "Failed to approve dataset" });
  }
});

export default router;
