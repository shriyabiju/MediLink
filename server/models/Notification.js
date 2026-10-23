const mongoose = require("mongoose");

/**
 * Notification model — one document per notification per recipient.
 *
 * This is the ONLY Notification model in MediLink.
 * Other modules (hospital, patient) should use this same model when
 * they need per-user notifications.
 *
 * type values and their meaning:
 *   request      — a blood request matching the donor's blood group was posted
 *   donation     — a donation record status changed (confirmed / completed)
 *   appointment  — upcoming appointment reminder
 *   eligible     — donor became eligible to donate again
 *   verified     — donor profile was approved/rejected by admin
 *   system       — general platform message
 */
const notificationSchema = new mongoose.Schema(
  {
    /* ── Recipient ── */
    recipient: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    /* ── Content ── */
    type: {
      type:    String,
      enum:    ["request", "donation", "appointment", "eligible", "verified", "system"],
      default: "system",
    },
    title:   { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },

    /* ── Optional reference to a related document ── */
    refModel: { type: String, enum: ["BloodRequest", "Donation", null], default: null },
    refId:    { type: mongoose.Schema.Types.ObjectId, default: null },

    /* ── State ── */
    read:    { type: Boolean, default: false, index: true },
    deleted: { type: Boolean, default: false }, // soft-delete so counts stay correct
  },
  { timestamps: true }
);

/* Compound index for the most common query: unread notifications for a recipient */
notificationSchema.index({ recipient: 1, read: 1, deleted: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
