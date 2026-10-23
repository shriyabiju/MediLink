/* ═══════════════════════════════════════════════
   User Model  (models/User.js)
═══════════════════════════════════════════════

   This file defines WHAT a "User" looks like in our
   MongoDB database.  We use Mongoose (a tool that lets
   us talk to MongoDB using JavaScript objects instead
   of raw database queries).

   Each user has:
     - name      → their full name
     - email     → must be unique (used for login)
     - password  → stored as a HASH (never plain text)
     - role      → one of: patient, donor, hospital, admin
     - extra hospital fields (only filled if role is "hospital")
═══════════════════════════════════════════════ */

const mongoose = require("mongoose");

// ── Define the shape (schema) of a User document ──
const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true },       // e.g. "John Doe"
    email: { type: String, required: true, unique: true }, // must be unique
    password: { type: String, required: true },    // hashed version of password
    role:  {
      type: String,
      enum: ["patient", "donor", "hospital", "admin"], // only these 4 values allowed
      default: "patient",
    },

    // ── Hospital-only fields (empty for patient / donor) ──
    phone:              { type: String, default: "" },
    address:            { type: String, default: "" },
    city:               { type: String, default: "" },
    state:              { type: String, default: "" },
    hospitalType:       { type: String, default: "" },
    registrationNumber: { type: String, default: "" },
    totalBeds:          { type: Number, default: 0 },

    // Hospitals need admin approval before they can log in
    approvalStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved", // patient & donor are auto-approved
    },
  },
  { timestamps: true } // automatically adds createdAt & updatedAt fields
);

// ── Export the model so other files can use it ──
// "User" is the name → MongoDB will create a collection called "users"
module.exports = mongoose.model("User", userSchema);
