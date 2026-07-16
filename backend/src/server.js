import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import protectedRoutes from "./routes/protected.routes.js";
import authRoutes from "./routes/auth.routes.js";
import ragRoutes from "./routes/rag.routes.js";
import chatRoutes from "./routes/chat.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

import testmodeRoutes from "./routes/testmode.routes.js";

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.use("/rag", ragRoutes);
app.use("/chat", chatRoutes);
app.use("/testmode", testmodeRoutes);

/* HEALTH CHECK */
app.get("/health", (req, res) => {
  res.json({ status: "Backend alive 🔥" });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🔥 Cinecrafit Backend running on port ${PORT}`);
});
