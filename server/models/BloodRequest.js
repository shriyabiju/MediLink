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
    hospitalName: { type: String, required: true, trim: true },
    hospitalCity: { type: String, default: "",    trim: true },
    hospitalState:{ type: String, default: "",    trim: true },

    /* ── Request details ── */
    bloodGroup: {
      type:     String,
      required: true,
      enum:     ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      index:    true,
    },
    unitsNeeded: { type: Number, required: true, min: 1 },
    unitsFilled: { type: Number, default: 0 },

    urgency: {
      type:    String,
      enum:    ["Critical", "High", "Medium", "Low"],
      default: "Medium",
      index:   true,
    },

    /* ── Status ── */
    status: {
      type:    String,
      enum:    ["open", "partially_filled", "fulfilled", "cancelled"],
      default: "open",
      index:   true,
    },

    /* ── Additional context (no private patient PII) ── */
    notes: { type: String, default: "", trim: true, maxlength: 500 },

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
