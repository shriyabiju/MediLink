const mongoose = require("mongoose");

/**
 * BloodBankStock — one document per blood group entry for a blood bank.
 * Blood banks can store multiple entries per blood group (e.g. different
 * collection dates or prices). Units must be > 0 and not expired to be available.
 */
const bloodBankStockSchema = new mongoose.Schema(
  {
    /* Which blood bank owns this stock */
    bloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      required: true,
      index: true,
    },

    bloodGroup: {
      type:     String,
      required: true,
      enum:     ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },

    units:       { type: Number, required: true, min: 0 },
    pricePerUnit:{ type: Number, required: true, min: 0 }, // in rupees / local currency

    collectedOn: { type: Date, default: null },
    expiresOn:   { type: Date, required: true },

    /* Computed on read — do not store; calculated from expiresOn and units */
    /* isAvailable = units > 0 && expiresOn > now */
  },
  { timestamps: true }
);

/* Virtual: is this stock currently available? */
bloodBankStockSchema.virtual("isAvailable").get(function () {
  return this.units > 0 && new Date(this.expiresOn) > new Date();
});

bloodBankStockSchema.set("toJSON",   { virtuals: true });
bloodBankStockSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("BloodBankStock", bloodBankStockSchema);
