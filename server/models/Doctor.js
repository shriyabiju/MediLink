const mongoose = require("mongoose");

/**
 * Doctor — one document per doctor per hospital.
 */
const doctorSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
      index: true,
    },
    name:   { type: String, required: true, trim: true },
    dept:   { type: String, required: true, trim: true },
    spec:   { type: String, default: "", trim: true },
    shift:  { type: String, enum: ["Morning", "Evening", "Night"], default: "Morning" },
    status: { type: String, enum: ["Available", "Busy", "On Leave"], default: "Available" },
    phone:  { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
