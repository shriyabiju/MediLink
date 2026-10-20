/**
 * Creates the default admin account if none exists.
 * Run once: node scripts/seedAdmin.js
 *
 * Change credentials in .env or pass environment variables:
 *   ADMIN_NAME="Super Admin" ADMIN_EMAIL=admin@medilink.com ADMIN_PASSWORD=Admin@2026
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User     = require("../models/User");

const NAME     = process.env.ADMIN_NAME     || "Super Admin";
const EMAIL    = process.env.ADMIN_EMAIL    || "admin@medilink.com";
const PASSWORD = process.env.ADMIN_PASSWORD || "Admin@2026!";

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB:", process.env.MONGO_URI);

  const existing = await User.findOne({ email: EMAIL });
  if (existing) {
    console.log(`✅  Admin already exists: ${existing.email}`);
    process.exit(0);
  }

  await User.create({
    name:           NAME,
    email:          EMAIL,
    password:       PASSWORD,
    role:           "admin",
    approvalStatus: "approved",
    donorStatus:    "approved",
  });

  console.log("✅  Admin created successfully!");
  console.log("   Email:   ", EMAIL);
  console.log("   Password:", PASSWORD);
  console.log("   ⚠  Change this password after first login.");
  process.exit(0);
})().catch((err) => {
  console.error("❌  Seed failed:", err.message);
  process.exit(1);
});
