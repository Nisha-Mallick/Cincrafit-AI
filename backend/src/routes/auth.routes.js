import express from "express";
import admin, { db } from "../firebase.js";
import { verifyMerchant } from "../services/merchantVerification.service.js";

const router = express.Router();

// Helper to check admin
const checkIsAdmin = (email) => {
  const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(",") : [];
  return adminEmails.includes(email);
};

/**
 * VERIFY LOGIN TOKEN & HANDLE MERCHANT VERIFICATION
 */
router.post("/login", async (req, res) => {
  const { idToken, role, merchantData } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "ID token missing" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email;
    const name = decodedToken.name || email.split("@")[0];
    
    const isAdmin = checkIsAdmin(email);

    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();

    let userData = {
      uid,
      email,
      displayName: name,
      isAdmin,
    };

    if (!userDoc.exists) {
      // New user
      userData.role = role === "merchant" ? "merchant" : "customer";
      userData.createdAt = admin.firestore.FieldValue.serverTimestamp();
      
      if (role === "merchant" && merchantData) {
        const verificationResult = await verifyMerchant({ email, ...merchantData });
        
        const isVerified = verificationResult.trustScore >= 70;
        const vStatus = isVerified ? "approved" : "pending";
        
        userData = {
          ...userData,
          ...merchantData,
          trustScore: verificationResult.trustScore,
          merchantVerified: isVerified,
          verificationStatus: vStatus,
          verificationReason: verificationResult.reason || "",
          verificationDetails: verificationResult.breakdown || [],
          verifiedBy: isVerified ? "auto" : null,
          verifiedAt: isVerified ? admin.firestore.FieldValue.serverTimestamp() : null,
          adminRemarks: "",
          verificationHistory: [{
            action: vStatus,
            timestamp: new Date()
          }]
        };
      }
      
      await userRef.set(userData);
    } else {
      userData = userDoc.data();
      // Ensure existing users get the latest isAdmin flag 
      if (userData.isAdmin !== isAdmin) {
        await userRef.update({ isAdmin });
        userData.isAdmin = isAdmin;
      }
      
      // If a merchant was previously rejected and retries to submit new merchant details
      if (role === "merchant" && merchantData && userData.verificationStatus === "rejected") {
        const verificationResult = await verifyMerchant({ email, ...merchantData });
        const isVerified = verificationResult.trustScore >= 70;
        const vStatus = isVerified ? "approved" : "pending";
        
        const updatedFields = {
          ...merchantData,
          trustScore: verificationResult.trustScore,
          merchantVerified: isVerified,
          verificationStatus: vStatus,
          verificationReason: verificationResult.reason || "",
          verificationDetails: verificationResult.breakdown || [],
          verifiedBy: isVerified ? "auto" : null,
          verifiedAt: isVerified ? admin.firestore.FieldValue.serverTimestamp() : null,
          verificationHistory: admin.firestore.FieldValue.arrayUnion({
            action: vStatus,
            timestamp: new Date()
          })
        };
        await userRef.update(updatedFields);
        userData = { ...userData, ...updatedFields };
      }
    }

    res.status(200).json({
      uid: userData.uid,
      email: userData.email,
      role: userData.role,
      merchantVerified: userData.merchantVerified,
      verificationStatus: userData.verificationStatus,
      trustScore: userData.trustScore,
      isAdmin: userData.isAdmin
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

/**
 * ADMIN: GET ALL MERCHANTS
 */
router.get("/merchants", async (req, res) => {
  const idToken = req.headers.authorization?.replace("Bearer ", "");
  if (!idToken) return res.status(401).json({ error: "Missing token" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    if (!checkIsAdmin(decodedToken.email)) {
      return res.status(403).json({ error: "Unauthorized. Admin access required." });
    }

    const snapshot = await db.collection("users").where("role", "==", "merchant").get();
    const merchants = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ merchants });
  } catch (error) {
    console.error("Get Merchants Error:", error);
    res.status(401).json({ error: "Invalid token or server error" });
  }
});

/**
 * ADMIN: MANUAL VERIFY MERCHANT
 */
router.post("/manual-verify-merchant", async (req, res) => {
  const { idToken, merchantUid, action, remarks } = req.body;

  if (!idToken || !merchantUid || !action) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!["approved", "rejected"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const adminEmail = decodedToken.email;
    
    // Server-side security check
    if (!checkIsAdmin(adminEmail)) {
      return res.status(403).json({ error: "Unauthorized. Admin access required." });
    }

    const merchantRef = db.collection("users").doc(merchantUid);
    const merchantDoc = await merchantRef.get();
    
    if (!merchantDoc.exists) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    const updatedFields = {
      verificationStatus: action,
      merchantVerified: action === "approved",
      verifiedBy: adminEmail,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      adminRemarks: remarks || "",
      verificationHistory: admin.firestore.FieldValue.arrayUnion({
        action,
        admin: adminEmail,
        remarks: remarks || "",
        timestamp: new Date()
      })
    };

    await merchantRef.update(updatedFields);

    res.status(200).json({ success: true, message: `Merchant ${action} successfully.` });

  } catch (error) {
    console.error("Manual Verify Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
