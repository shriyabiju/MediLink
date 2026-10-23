/* ═══════════════════════════════════════════════
   MediLink Backend - server.js
═══════════════════════════════════════════════

   This is the MAIN file that starts the backend server.
   It does 4 things:
     1. Loads environment variables from .env
     2. Connects to MongoDB
     3. Sets up Express (the web framework)
     4. Connects our route files (register, login, health)
═══════════════════════════════════════════════ */

// ── 1. Load .env file ──
// dotenv reads the .env file and puts its values into process.env
require("dotenv").config();

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

// Import our auth routes (register + login)
const authRoutes = require("./routes/auth");

// ── 2. Connect to MongoDB ──
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/medilink";
const PORT      = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ── 3. Create the Express app ──
const app = express();

// CORS allows our React frontend (port 5173) to talk to this backend (port 5000)
app.use(cors());

// This lets Express understand JSON in request bodies (req.body)
app.use(express.json());

// ── 4. Connect route files ──
// Any URL starting with /api/auth goes to authRoutes (register, login)
app.use("/api/auth", authRoutes);

// Health check route — just confirms the server is running
// You can test it by visiting http://localhost:5000/api/health in your browser
app.get("/api/health", (req, res) => {
  res.json({
    status:  "OK",
    message: "MediLink backend is running!",
    time:    new Date().toISOString(),
  });
});

// ── Start the server ──
app.listen(PORT, () => {
  console.log(`🚀 MediLink backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
