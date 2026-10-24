const mongoose = require("mongoose");

/**
 * Medicine — one document per medicine per hospital.
 */
const medicineSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    name:     { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Antibiotic", "Analgesic", "Emergency", "Hormone", "Antidiabetic", "Antiviral", "Other"],
      required: true,
    },
    qty:    { type: Number, required: true, min: 0, default: 0 },
    expiry: { type: String, default: "" }, // stored as YYYY-MM-DD string
    status: {
      type: String,
      enum: ["Available", "Low Stock", "Critical"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
