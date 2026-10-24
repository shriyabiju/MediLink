
const mongoose = require("mongoose");

const patientRequestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    requestType: {
      type: String,
      enum: ["blood", "medicine"],
      required: true,
    },

    bloodGroup: {
      type: String,
      enum: [
        "A+", "A-", "B+", "B-",
        "AB+", "AB-", "O+", "O-",
      ],
      default: null,
    },

    medicineName: {
      type: String,
      trim: true,
      default: null,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unit: {
      type: String,
      trim: true,
      required: true,
    },

    urgency: {
      type: String,
      enum: ["normal", "urgent", "emergency"],
      default: "normal",
    },

    city: {
      type: String,
      trim: true,
      required: true,
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    contactPhone: {
      type: String,
      trim: true,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "fulfilled",
        "cancelled",
        "rejected",
      ],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

// Validate fields that depend on request type.
patientRequestSchema.pre("validate", function () {
  if (this.requestType === "blood") {
    if (!this.bloodGroup) {
      this.invalidate(
        "bloodGroup",
        "Blood group is required for blood requests."
      );
    }

    if (this.medicineName) {
      this.invalidate(
        "medicineName",
        "Medicine name is not applicable to blood requests."
      );
    }
  }

  if (this.requestType === "medicine") {
    if (!this.medicineName || !this.medicineName.trim()) {
      this.invalidate(
        "medicineName",
        "Medicine name is required for medicine requests."
      );
    }

    if (this.bloodGroup) {
      this.invalidate(
        "bloodGroup",
        "Blood group is not applicable to medicine requests."
      );
    }
  }
});

module.exports = mongoose.model(
  "PatientRequest",
  patientRequestSchema
);
