const mongoose = require("mongoose");

/**
 * BloodRequest model — represents a blood donation request posted
 * by a hospital or admin on behalf of a patient.
 *
 * This is the ONLY BloodRequest model in MediLink.
 * The hospital EmergencyRequests.jsx UI should be wired to this model
 * in a future sprint (hospital module — Part 3 dependency).
 *
 * Visibility:
 *   - Any authenticated donor can read open/partially-filled requests.
 *   - Private patient details (full name, medical notes) are NOT
 *     exposed to donors. Only blood group, urgency, units, and
 *     the posting hospital's name/city are visible.
 *   - Hospital staff and admins manage the full document.
 *
 * Status lifecycle (managed by hospital/admin):
 *   open             → request is active, donors can respond
 *   partially_filled → some donors have responded, still needs more
 *   fulfilled        → enough donors found, no more needed
 *   cancelled        → hospital cancelled the request
 */
const bloodRequestSchema = new mongoose.Schema(
  {
    /* ── Posted by ── */
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      required: true,
    },

    /* ── Hospital association (for patient → hospital requests) ── */
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Hospital",
      default: null,
    },

    /* ── Hospital name/city (existing fields, used by donor flow) ── */
    hospitalName: { type: String, required: true, trim: true },
    hospitalCity: { type: String, default: "",    trim: true },
    hospitalState:{ type: String, default: "",    trim: true },

    /* ── Request type ── */
    requestType: {
      type: String,
      enum: ["emergency", "appointment"],
      default: "emergency",
    },

    /* ── Patient details (for patient-submitted requests) ── */
    patientName:    { type: String, default: "",    trim: true },
    patientAge:     { type: Number, default: null },
    patientGender:  { type: String, default: "",   trim: true },
    patientPhone:   { type: String, default: "",   trim: true },
    patientEmail:   { type: String, default: "",   trim: true },
    patientCity:    { type: String, default: "",   trim: true },
    patientAddress: { type: String, default: "",   trim: true },

    /* ── Request details ── */
    bloodGroup: {
      type:     String,
      required: true,
      enum:     ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      index:    true,
    },
    unitsNeeded: { type: Number, required: true, min: 1 },
    unitsFilled: { type: Number, default: 0 },

    requiredDate: { type: Date,   default: null },
    requiredTime: { type: String, default: "",   trim: true },

    urgency: {
      type:    String,
      enum:    ["Critical", "High", "Medium", "Low", "Normal", "Urgent", "Emergency"],
      default: "Medium",
      index:   true,
    },

    reason: { type: String, default: "", trim: true, maxlength: 500 },

    /* ── Status (donor flow) ── */
    status: {
      type:    String,
      enum:    ["open", "partially_filled", "fulfilled", "cancelled"],
      default: "open",
      index:   true,
    },

    /* ── Review status (hospital review workflow for patient requests) ── */
    reviewStatus: {
      type:    String,
      enum:    ["pending", "under_review", "approved", "rejected", "fulfilled"],
      default: "pending",
    },

    /* ── Additional context ── */
    notes: { type: String, default: "", trim: true, maxlength: 500 },

    /* ── Supporting documents (base64, visible only to assigned hospital) ── */
    documents: [
      {
        fileName:    { type: String, required: true },
        contentType:  { type: String, required: true },
        data:         { type: String, required: true },  // base64
        uploadedAt:   { type: Date,  default: Date.now },
      },
    ],

    /* ── Donors who expressed interest ── */
    interestedDonors: [
      {
        donor:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        respondedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

/* Compound index for the donor's "nearby requests" query */
bloodRequestSchema.index({ status: 1, bloodGroup: 1, createdAt: -1 });

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
