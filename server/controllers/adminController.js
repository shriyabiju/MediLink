const User         = require("../models/User");
const Hospital     = require("../models/Hospital");
const BloodRequest = require("../models/BloodRequest");

/* ════════════════════════════════════════════
   GET /api/admin/stats
   Summary counts for the admin dashboard
════════════════════════════════════════════ */
exports.getStats = async (_req, res) => {
  try {
    const [
      totalUsers,
      totalPatients,
      totalHospitals,
      pendingHospitals,
      approvedHospitals,
      rejectedHospitals,
      totalDonors,
      pendingDonors,
      approvedDonors,
      totalBloodRequests,
      openBloodRequests,
      totalBloodBanks,
      pendingBloodBanks,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "patient" }),
      Hospital.countDocuments(),
      Hospital.countDocuments({ approvalStatus: "pending" }),
      Hospital.countDocuments({ approvalStatus: "approved" }),
      Hospital.countDocuments({ approvalStatus: "rejected" }),
      User.countDocuments({ role: "donor" }),
      User.countDocuments({ role: "donor", donorStatus: "pending" }),
      User.countDocuments({ role: "donor", donorStatus: "approved" }),
      BloodRequest.countDocuments(),
      BloodRequest.countDocuments({ status: { $in: ["open", "partially_filled"] } }),
      User.countDocuments({ role: "bloodbank" }),
      User.countDocuments({ role: "bloodbank", approvalStatus: "pending" }),
    ]);

    res.json({
      totalUsers,
      totalPatients,
      totalHospitals,
      pendingHospitals,
      approvedHospitals,
      rejectedHospitals,
      totalDonors,
      pendingDonors,
      approvedDonors,
      totalBloodRequests,
      openBloodRequests,
      totalBloodBanks,
      pendingBloodBanks,
    });
  } catch (err) {
    console.error("getStats:", err);
    res.status(500).json({ message: "Server error fetching stats." });
  }
};

/* ════════════════════════════════════════════
   GET /api/admin/hospitals
   Query params: status = pending | approved | rejected | all
════════════════════════════════════════════ */
exports.getHospitals = async (req, res) => {
  try {
    const { status = "all" } = req.query;
    const filter = status === "all" ? {} : { approvalStatus: status };

    const hospitals = await Hospital.find(filter)
      .populate("user", "name email createdAt")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ hospitals });
  } catch (err) {
    console.error("getHospitals:", err);
    res.status(500).json({ message: "Server error fetching hospitals." });
  }
};

/* ════════════════════════════════════════════
   GET /api/admin/hospitals/:id
════════════════════════════════════════════ */
exports.getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .populate("user", "name email createdAt approvalStatus")
      .populate("reviewedBy", "name email");

    if (!hospital) return res.status(404).json({ message: "Hospital not found." });
    res.json({ hospital });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid hospital ID." });
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/admin/hospitals/:id/approve
════════════════════════════════════════════ */
exports.approveHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    if (hospital.approvalStatus === "approved") {
      return res.status(400).json({ message: "Hospital is already approved." });
    }

    /* Update Hospital document */
    hospital.approvalStatus = "approved";
    hospital.reviewedBy     = req.user._id;
    hospital.reviewedAt     = new Date();
    hospital.rejectReason   = "";
    await hospital.save();

    /* Mirror status on the User document */
    await User.findByIdAndUpdate(hospital.user, { approvalStatus: "approved" });

    res.json({
      message:  `Hospital "${hospital.name}" has been approved.`,
      hospital: { _id: hospital._id, name: hospital.name, approvalStatus: "approved" },
    });
  } catch (err) {
    console.error("approveHospital:", err);
    res.status(500).json({ message: "Server error approving hospital." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/admin/hospitals/:id/reject
   Body: { reason? }
════════════════════════════════════════════ */
exports.rejectHospital = async (req, res) => {
  try {
    const { reason = "" } = req.body;

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    if (hospital.approvalStatus === "rejected") {
      return res.status(400).json({ message: "Hospital is already rejected." });
    }

    hospital.approvalStatus = "rejected";
    hospital.reviewedBy     = req.user._id;
    hospital.reviewedAt     = new Date();
    hospital.rejectReason   = reason;
    await hospital.save();

    await User.findByIdAndUpdate(hospital.user, { approvalStatus: "rejected" });

    res.json({
      message:  `Hospital "${hospital.name}" has been rejected.`,
      hospital: { _id: hospital._id, name: hospital.name, approvalStatus: "rejected" },
    });
  } catch (err) {
    console.error("rejectHospital:", err);
    res.status(500).json({ message: "Server error rejecting hospital." });
  }
};

/* ════════════════════════════════════════════
   GET /api/admin/users
   All users (patients + donors + admins; excludes hospitals)
   Query: role, page, limit
════════════════════════════════════════════ */
exports.getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const skip   = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching users." });
  }
};

/* ════════════════════════════════════════════
   GET /api/admin/donors
   Query: status = pending | approved | rejected | all
════════════════════════════════════════════ */
exports.getDonors = async (req, res) => {
  try {
    const { status = "all" } = req.query;
    const filter = { role: "donor" };
    if (status !== "all") filter.donorStatus = status;

    const donors = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ donors });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching donors." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/admin/donors/:id/approve
════════════════════════════════════════════ */
exports.approveDonor = async (req, res) => {
  try {
    const donor = await User.findOne({ _id: req.params.id, role: "donor" });
    if (!donor) return res.status(404).json({ message: "Donor not found." });

    /* Prevent invalid state transition — already approved */
    if (donor.donorStatus === "approved") {
      return res.status(400).json({ message: "Donor is already approved." });
    }

    donor.donorStatus = "approved";
    await donor.save();

    res.json({ message: `Donor "${donor.name}" approved.`, donor: { _id: donor._id, donorStatus: "approved" } });
  } catch (err) {
    /* Handle invalid ObjectId format */
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid donor ID." });
    res.status(500).json({ message: "Server error approving donor." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/admin/donors/:id/reject
   Body: { reason? }
════════════════════════════════════════════ */
exports.rejectDonor = async (req, res) => {
  try {
    const donor = await User.findOne({ _id: req.params.id, role: "donor" });
    if (!donor) return res.status(404).json({ message: "Donor not found." });

    /* Prevent invalid state transition — already rejected */
    if (donor.donorStatus === "rejected") {
      return res.status(400).json({ message: "Donor is already rejected." });
    }

    donor.donorStatus = "rejected";
    await donor.save();

    res.json({ message: `Donor "${donor.name}" rejected.`, donor: { _id: donor._id, donorStatus: "rejected" } });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid donor ID." });
    res.status(500).json({ message: "Server error rejecting donor." });
  }
};

/* ════════════════════════════════════════════
   GET /api/admin/donors/:id
   View a single donor's details
════════════════════════════════════════════ */
exports.getDonorById = async (req, res) => {
  try {
    const donor = await User.findOne({ _id: req.params.id, role: "donor" }).select("-password");
    if (!donor) return res.status(404).json({ message: "Donor not found." });
    res.json({ donor });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid donor ID." });
    res.status(500).json({ message: "Server error fetching donor." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/admin/users/:id/deactivate
════════════════════════════════════════════ */
exports.deactivateUser = async (req, res) => {
  try {
    /* Prevent admin from deactivating their own account */
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot deactivate your own account." });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: `User "${user.name}" deactivated.`, user });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid user ID." });
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/admin/users/:id/reactivate
   Reactivate a previously deactivated account
════════════════════════════════════════════ */
exports.reactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ message: `User "${user.name}" reactivated.`, user });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid user ID." });
    res.status(500).json({ message: "Server error reactivating user." });
  }
};

/* ════════════════════════════════════════════
   GET /api/admin/blood-requests
   Admin view of all blood requests.
   Query: status = open | partially_filled | fulfilled | cancelled | all
          urgency = Critical | High | Medium | Low
          bloodGroup = A+ | A- | etc.
════════════════════════════════════════════ */
exports.getBloodRequests = async (req, res) => {
  try {
    const { status = "all", urgency, bloodGroup } = req.query;

    const filter = {};
    if (status !== "all") filter.status = status;
    if (urgency && urgency !== "all") filter.urgency = urgency;
    if (bloodGroup && bloodGroup !== "all") filter.bloodGroup = bloodGroup;

    const requests = await BloodRequest.find(filter)
      .populate("postedBy", "name email role")
      .sort({ createdAt: -1 })
      .lean();

    /* Sort by urgency: Critical first */
    const ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    requests.sort((a, b) => (ORDER[a.urgency] ?? 9) - (ORDER[b.urgency] ?? 9));

    res.json({ requests, total: requests.length });
  } catch (err) {
    console.error("getBloodRequests (admin):", err);
    res.status(500).json({ message: "Server error fetching blood requests." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/admin/blood-requests/:id/status
   Admin updates a blood request status.
   Body: { status: "open" | "partially_filled" | "fulfilled" | "cancelled" }
════════════════════════════════════════════ */
exports.updateBloodRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["open", "partially_filled", "fulfilled", "cancelled"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Blood request not found." });

    request.status = status;
    await request.save();

    res.json({ message: `Request status updated to "${status}".`, request });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid request ID." });
    console.error("updateBloodRequestStatus:", err);
    res.status(500).json({ message: "Server error updating request status." });
  }
};

/* ════════════════════════════════════════════
   GET /api/admin/bloodbanks
   List blood bank users by approval status.
════════════════════════════════════════════ */
exports.getBloodBanks = async (req, res) => {
  try {
    const { status = "all" } = req.query;
    const filter = { role: "bloodbank" };
    if (status !== "all") filter.approvalStatus = status;

    const banks = await User.find(filter)
      .select("name email phone city approvalStatus createdAt")
      .sort({ createdAt: -1 });

    res.json({ bloodbanks: banks });
  } catch (err) {
    res.status(500).json({ message: "Server error fetching blood banks." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/admin/bloodbanks/:id/approve
════════════════════════════════════════════ */
exports.approveBloodBank = async (req, res) => {
  try {
    const bank = await User.findOne({ _id: req.params.id, role: "bloodbank" });
    if (!bank) return res.status(404).json({ message: "Blood bank not found." });
    if (bank.approvalStatus === "approved")
      return res.status(400).json({ message: "Already approved." });

    bank.approvalStatus = "approved";
    await bank.save();
    res.json({ message: `Blood bank "${bank.name}" approved.`, bloodbank: { _id: bank._id, approvalStatus: "approved" } });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/admin/bloodbanks/:id/reject
════════════════════════════════════════════ */
exports.rejectBloodBank = async (req, res) => {
  try {
    const bank = await User.findOne({ _id: req.params.id, role: "bloodbank" });
    if (!bank) return res.status(404).json({ message: "Blood bank not found." });
    if (bank.approvalStatus === "rejected")
      return res.status(400).json({ message: "Already rejected." });

    bank.approvalStatus = "rejected";
    await bank.save();
    res.json({ message: `Blood bank "${bank.name}" rejected.`, bloodbank: { _id: bank._id, approvalStatus: "rejected" } });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};
