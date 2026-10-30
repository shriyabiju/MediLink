const mongoose = require("mongoose");

/**
 * Hospital model — stores extended hospital details beyond what
 * the User model holds. A Hospital document is created alongside
 * the User document when a hospital registers.
 */
const hospitalSchema = new mongoose.Schema(
  {
    /* Back-reference to the User document that owns this hospital */
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    /* Core identity */
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, lowercase: true, trim: true },

    /* Contact + location */
    phone:   { type: String, default: "" },
    address: { type: String, default: "" },
    city:    { type: String, default: "" },
    state:   { type: String, default: "" },

    /* Hospital-specific details */
    hospitalType: {
      type: String,
      enum: ["Government", "Private", "NGO", "Clinic", "Other"],
      default: "Other",
    },
    registrationNumber: { type: String, default: "" },
    totalBeds:          { type: Number, default: 0 },

    /**
     * approvalStatus — the field the admin controls.
     *   pending  → registered, awaiting admin review
     *   approved → admin has verified; hospital can log in
     *   rejected → admin rejected; hospital cannot log in
     */
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    /* Admin action metadata */
    reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt:  { type: Date, default: null },
    rejectReason:{ type: String, default: "" },

    /* Profile */
    description:  { type: String, default: "" },
    website:      { type: String, default: "" },
    logoUrl:      { type: String, default: "" },
    isActive:     { type: Boolean, default: true },

    /* Bed management — array of ward records */
    beds: [
      {
        type:      { type: String, required: true, trim: true },  // e.g. ICU, General
        total:     { type: Number, default: 0, min: 0 },
        occupied:  { type: Number, default: 0, min: 0 },
        color:     { type: String, default: "#2563EB" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Hospital", hospitalSchema);
