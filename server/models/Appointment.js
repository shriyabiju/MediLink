const mongoose = require("mongoose");

/**
 * Appointment model — one document per appointment booked by a patient.
 *
 * Status lifecycle:
 *   upcoming   → booked, not yet happened
 *   completed  → appointment took place
 *   cancelled  → patient or hospital cancelled
 */
const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    doctorName:   { type: String, required: true, trim: true },
    department:   { type: String, required: true, trim: true },
    hospitalName: { type: String, required: true, trim: true },
    date:         { type: String, required: true },  // YYYY-MM-DD
    time:         { type: String, required: true },  // e.g. "10:30 AM"
    mode: {
      type: String,
      enum: ["In-person", "Online"],
      default: "In-person",
    },
    notes:  { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
