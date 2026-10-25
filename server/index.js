require("dotenv").config();

const express    = require("express");
const cors       = require("cors");
const mongoose   = require("mongoose");

const authRoutes        = require("./routes/auth");
const adminRoutes       = require("./routes/admin");
const donorRoutes       = require("./routes/donor");
const bloodReqRoutes    = require("./routes/bloodRequest");
const hospitalRoutes    = require("./routes/hospital");
const patientRoutes     = require("./routes/patient");
const bloodBankRoutes   = require("./routes/bloodbank");

/* Register models so Mongoose creates collections on first use */
require("./models/User");
require("./models/Hospital");
require("./models/Donation");
require("./models/BloodRequest");
require("./models/Notification");
require("./models/Doctor");
require("./models/Medicine");
require("./models/BloodStock");
require("./models/BloodBankStock");

const app  = express();
const PORT = process.env.PORT || 5000;

/* ── CORS ── */
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

/* ── Body parser (10mb limit for base64 document uploads) ── */
app.use(express.json({ limit: "10mb" }));

/* ── Routes ── */
app.use("/api/auth",           authRoutes);
app.use("/api/admin",          adminRoutes);
app.use("/api/donor",          donorRoutes);
app.use("/api/blood-requests", bloodReqRoutes);
app.use("/api/hospital",       hospitalRoutes);
app.use("/api/patient",        patientRoutes);
app.use("/api/bloodbank",      bloodBankRoutes);

/* ── Health check ── */
app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date() }));

/* ── Global error handler ── */
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

/* ── Connect to MongoDB then start ── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB connected:", process.env.MONGO_URI);
    app.listen(PORT, () => console.log(`🚀  MediLink API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  });
