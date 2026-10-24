const mongoose = require("mongoose");

/**
 * BloodStock — one document per blood group per hospital.
 * Each hospital has up to 8 documents (one per blood group).
 * This is separate from BloodRequest (donor-facing requests).
 */
const bloodStockSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    group: {
      type: String,
      required: true,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    units: { type: Number, required: true, min: 0, default: 0 },
    pricePerUnit: { type: Number, min: 0, default: 0 }, // INR per unit, 0 = not configured
    status: {
      type: String,
      enum: ["Available", "Low Stock", "Out of Stock"],
      default: "Available",
    },
  },
  { timestamps: true }
);

// Each hospital can only have ONE entry per blood group
bloodStockSchema.index({ hospital: 1, group: 1 }, { unique: true });

module.exports = mongoose.model("BloodStock", bloodStockSchema);
