const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

/**
 * Universal User model.
 * Covers: patient, donor, admin roles.
 * Hospitals have their own Hospital model but a User document is also
 * created so they can log in via the same /api/auth/login endpoint.
 */
const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: {
      type: String, required: true, unique: true,
      lowercase: true, trim: true,
    },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ["patient", "donor", "hospital", "admin", "bloodbank"],
      default: "patient",
    },

    /* ── Donor-specific ── */
    bloodGroup:       { type: String, default: null },
    city:             { type: String, default: null },
    state:            { type: String, default: null },
    phone:            { type: String, default: null },
    address:          { type: String, default: null },
    dob:              { type: String, default: null },   // stored as YYYY-MM-DD string
    weight:           { type: String, default: null },   // e.g. "70 kg"
    occupation:       { type: String, default: null },
    emergencyContact: { type: String, default: null },   // phone number
    emergencyName:    { type: String, default: null },   // name + relationship

    /* ── Donor availability (can they donate right now?) ── */
    availability: { type: Boolean, default: true },

    /* ── Donor ID document (Aadhaar/other) stored as base64 ── */
    idDocument: {
      data:        { type: String, default: null },      // base64-encoded file
      fileName:    { type: String, default: null },
      contentType: { type: String, default: null },      // e.g. "image/png"
      uploadedAt:  { type: Date,   default: null },
    },

    /* ── Reason if admin rejected the donor ── */
    rejectionReason: { type: String, default: null },

    /* ── Registration/Licence document upload (hospital & blood bank)
           Stored as base64 — visible only to admins for verification. ── */
    registrationDocument: {
      data:        { type: String, default: null },     // base64-encoded file
      fileName:    { type: String, default: null },
      contentType: { type: String, default: null },     // e.g. "image/png" or "application/pdf"
      uploadedAt:  { type: Date,   default: null },
    },

    /* ── Donor approval ── */
    donorStatus: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: function () {
        return this.role === "donor" ? "pending" : "approved";
      },
    },

    /* ── Hospital approval (for hospital users, mirrors Hospital.approvalStatus) ── */
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: function () {
        /* Hospitals AND blood banks require admin approval.
           All other roles (patient, donor, admin) are approved by default. */
        return (this.role === "hospital" || this.role === "bloodbank") ? "pending" : "approved";
      },
    },

    /* Link to Hospital document for hospital users */
    hospitalRef: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },

    isActive: { type: Boolean, default: true },

    /* ── Persisted preferences (donors and other roles) ── */
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

/* ── Hash password before saving ── */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ── Password comparison ── */
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

/* ── Never return password in JSON ── */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
