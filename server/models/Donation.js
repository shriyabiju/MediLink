const mongoose = require("mongoose");

/**
 * Donation model — one document per donation submission.
 *
 * A donation starts as "pending" when the donor expresses interest.
 * Status is only moved to "completed" by an admin or hospital staff,
 * never automatically on submission.
 *
 * Status lifecycle:
 *   pending   → donor has submitted interest, awaiting confirmation
 *   confirmed → centre/admin has confirmed the appointment
 *   completed → donation actually carried out and verified
 *   cancelled → donor or centre cancelled
 */
const donationSchema = new mongoose.Schema(
  {
    /* ── Owner ── */
    donor: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,   // fast lookup by donor
    },

    /* ── What was submitted (mirrors the interest form fields) ── */
    bloodGroup: {
      type:     String,
      required: true,
      enum:     ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    donationType: {
      type:    String,
      enum:    ["Whole Blood", "Plasma", "Platelets", "Other"],
      default: "Whole Blood",
    },
    preferredDate: {
      type:     Date,
      required: true,
    },
    centre: {
      type:     String,
      required: true,
      trim:     true,
    },
    notes: {
      type:    String,
      default: "",
      trim:    true,
      maxlength: 500,
    },

    /* ── Status ── */
    status: {
      type:    String,
      enum:    ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
      /* NOTE: "pending" is set on submission and is never changed by this API.
               An admin/hospital endpoint (out of scope for Part 2) updates it. */
    },

    /* ── Outcome (filled in when completed) ── */
    units:         { type: Number, default: null },
    completedDate: { type: Date,   default: null },
    certificate:   { type: Boolean, default: false },

    /* ── Cancellation ── */
    cancelReason: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
