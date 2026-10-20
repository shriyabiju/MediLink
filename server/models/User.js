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
      enum: ["patient", "donor", "hospital", "admin"],
      default: "patient",
    },

    /* ── Donor-specific ── */
    bloodGroup:  { type: String, default: null },
    city:        { type: String, default: null },
    phone:       { type: String, default: null },

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
        return this.role === "hospital" ? "pending" : "approved";
      },
    },

    /* Link to Hospital document for hospital users */
    hospitalRef: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", default: null },

    isActive:    { type: Boolean, default: true },
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
