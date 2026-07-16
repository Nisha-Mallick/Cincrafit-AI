import express from "express";
import verifyAuthToken from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", verifyAuthToken, (req, res) => {
  res.json({
    message: "Access granted to protected route",
    user: req.user,
  });
});

export default router;
