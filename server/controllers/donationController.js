const Donation = require("../models/Donation");
const User     = require("../models/User");

/* ════════════════════════════════════════════
   POST /api/donor/donations
   Submit a new donation interest record.

   Required body fields: bloodGroup, preferredDate, centre
   Optional:  donationType, notes

   Status is always set to "pending" — never "completed" on submit.
   Donors can only create records for themselves (req.user._id).
════════════════════════════════════════════ */
exports.createDonation = async (req, res) => {
  try {
    const { bloodGroup, donationType, preferredDate, centre, notes } = req.body;

    /* ── Field validation ── */
    const errors = [];

    if (!bloodGroup || !bloodGroup.trim()) {
      errors.push("Blood group is required.");
    } else {
      const valid = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
      if (!valid.includes(bloodGroup.trim())) {
        errors.push(`Invalid blood group. Must be one of: ${valid.join(", ")}.`);
      }
    }

    if (!preferredDate) {
      errors.push("Preferred donation date is required.");
    } else {
      const d = new Date(preferredDate);
      if (isNaN(d.getTime())) {
        errors.push("Preferred date is not a valid date.");
      } else if (d < new Date(new Date().setHours(0, 0, 0, 0))) {
        errors.push("Preferred date cannot be in the past.");
      }
    }

    if (!centre || !centre.trim()) {
      errors.push("Donation centre / hospital name is required.");
    } else if (centre.trim().length < 3) {
      errors.push("Donation centre name is too short.");
    }

    if (donationType) {
      const validTypes = ["Whole Blood", "Plasma", "Platelets", "Other"];
      if (!validTypes.includes(donationType)) {
        errors.push(`Invalid donation type. Must be one of: ${validTypes.join(", ")}.`);
      }
    }

    if (notes && notes.length > 500) {
      errors.push("Notes cannot exceed 500 characters.");
    }

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    /* ── Create record ── */
    const donation = await Donation.create({
      donor:         req.user._id,           // always the logged-in donor
      bloodGroup:    bloodGroup.trim(),
      donationType:  donationType || "Whole Blood",
      preferredDate: new Date(preferredDate),
      centre:        centre.trim(),
      notes:         notes ? notes.trim() : "",
      status:        "pending",              // never auto-completed
    });

    res.status(201).json({
      message:  "Donation interest submitted successfully. A coordinator will contact you to confirm.",
      donation,
    });
  } catch (err) {
    console.error("createDonation error:", err);
    res.status(500).json({ message: "Server error submitting donation." });
  }
};

/* ════════════════════════════════════════════
   GET /api/donor/donations
   Returns the logged-in donor's own donation history.
   Donors see only their own records (req.user._id filter).
   Sorted newest first.
════════════════════════════════════════════ */
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ donations, total: donations.length });
  } catch (err) {
    console.error("getMyDonations error:", err);
    res.status(500).json({ message: "Server error fetching donation history." });
  }
};

/* ════════════════════════════════════════════
   GET /api/donor/donations/:id
   Returns a single donation record.
   Enforces donor ownership — a donor cannot
   read another donor's record.
════════════════════════════════════════════ */
exports.getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findOne({
      _id:   req.params.id,
      donor: req.user._id,        // ownership check
    }).lean();

    if (!donation) {
      return res.status(404).json({
        message: "Donation record not found or you do not have permission to view it.",
      });
    }

    res.json({ donation });
  } catch (err) {
    console.error("getDonationById error:", err);
    res.status(500).json({ message: "Server error fetching donation." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/donor/donations/:id/cancel
   Allows the donor to cancel their own pending donation.
   Cannot cancel a completed or already-cancelled record.
════════════════════════════════════════════ */
exports.cancelDonation = async (req, res) => {
  try {
    const { reason = "" } = req.body;

    const donation = await Donation.findOne({
      _id:   req.params.id,
      donor: req.user._id,
    });

    if (!donation) {
      return res.status(404).json({ message: "Donation record not found." });
    }

    if (donation.status === "completed") {
      return res.status(400).json({ message: "A completed donation cannot be cancelled." });
    }

    if (donation.status === "cancelled") {
      return res.status(400).json({ message: "This donation is already cancelled." });
    }

    donation.status       = "cancelled";
    donation.cancelReason = reason.trim();
    await donation.save();

    res.json({ message: "Donation cancelled.", donation });
  } catch (err) {
    console.error("cancelDonation error:", err);
    res.status(500).json({ message: "Server error cancelling donation." });
  }
};
