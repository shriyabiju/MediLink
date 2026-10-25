const BloodRequest = require("../models/BloodRequest");
const Donation     = require("../models/Donation");
const User         = require("../models/User");
const { createNotification } = require("./notificationController");

/* ════════════════════════════════════════════
   GET /api/donor/blood-requests
   Returns open blood requests visible to donors.
   Private patient information is NOT returned.

   Query params (all optional):
     bloodGroup  — e.g. "O+"
     urgency     — Critical | High | Medium | Low
     status      — open | partially_filled  (default: open,partially_filled)
     city        — case-insensitive hospital city match
     search      — free-text on hospitalName + city
════════════════════════════════════════════ */
exports.getBloodRequests = async (req, res) => {
  try {
    const { bloodGroup, urgency, status, city, search } = req.query;

    /* Default: show requests that still need donors */
    const statusFilter = status
      ? status.split(",")
      : ["open", "partially_filled"];

    const filter = { status: { $in: statusFilter } };

    if (bloodGroup && bloodGroup !== "All") filter.bloodGroup = bloodGroup;
    if (urgency    && urgency    !== "All") filter.urgency    = urgency;

    if (city && city.trim()) {
      filter.hospitalCity = { $regex: city.trim(), $options: "i" };
    }
    if (search && search.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [{ hospitalName: re }, { hospitalCity: re }];
    }

    const requests = await BloodRequest.find(filter)
      .sort({ createdAt: -1 }) // newest first; urgency sorted in JS below
      .select(
        /* Exclude interestedDonors details — donors should not see each other */
        "-interestedDonors -notes"
      )
      .lean();

    /* Sort Critical > High > Medium > Low */
    const URGENCY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    requests.sort((a, b) =>
      (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9)
    );

    /* Tag whether the logged-in donor has already responded.
       Use a single query with interestedDonors projection (no duplicate find). */
    const donorId = req.user._id.toString();
    const tagged  = await BloodRequest.find(filter)
      .select("interestedDonors")
      .lean();

    const respondedSet = new Set(
      tagged
        .filter((r) =>
          r.interestedDonors.some((d) => d.donor.toString() === donorId)
        )
        .map((r) => r._id.toString())
    );

    const result = requests.map((r) => ({
      ...r,
      alreadyResponded: respondedSet.has(r._id.toString()),
    }));

    res.json({ requests: result, total: result.length });
  } catch (err) {
    console.error("getBloodRequests error:", err);
    res.status(500).json({ message: "Server error fetching blood requests." });
  }
};

/* ════════════════════════════════════════════
   POST /api/donor/blood-requests/:id/respond
   Donor expresses interest in a blood request.
   - Prevents duplicate responses from the same donor.
   - Only works on open / partially_filled requests.
   - Does NOT expose other donors' information.
════════════════════════════════════════════ */
exports.respondToRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Blood request not found." });
    }

    if (!["open", "partially_filled"].includes(request.status)) {
      return res.status(400).json({
        message: "This request is no longer accepting responses.",
      });
    }

    const donorId = req.user._id.toString();

    /* Prevent duplicate */
    const already = request.interestedDonors.some(
      (d) => d.donor.toString() === donorId
    );
    if (already) {
      return res.status(409).json({
        message: "You have already responded to this request.",
        alreadyResponded: true,
      });
    }

    request.interestedDonors.push({ donor: req.user._id });

    /* Auto-update status if partially filled */
    const filled = request.interestedDonors.length;
    if (filled >= request.unitsNeeded) {
      request.status      = "fulfilled";
      request.unitsFilled = request.unitsNeeded;
    } else if (filled > 0) {
      request.status      = "partially_filled";
      request.unitsFilled = filled;
    }

    await request.save();

    res.json({
      message: "Thank you! Your interest has been registered. A coordinator will contact you.",
      alreadyResponded: false,
      requestStatus: request.status,
    });

    /* Send notification safely — wrapped in try/catch so a failure
       does not affect the main response or cause unhandled rejections */
    try {
      await createNotification({
        recipient: req.user._id,
        type:      "request",
        title:     "Blood Request Response Registered",
        message:   `You responded to a ${request.bloodGroup} blood request from ${request.hospitalName}. They will contact you soon.`,
        refModel:  "BloodRequest",
        refId:     request._id,
      });
    } catch (notifErr) {
      console.error("Notification creation failed (non-blocking):", notifErr.message);
    }
  } catch (err) {
    console.error("respondToRequest error:", err);
    res.status(500).json({ message: "Server error responding to request." });
  }
};

/* ════════════════════════════════════════════
   GET /api/donor/dashboard
   Returns aggregated stats for the donor home page.
   All figures are derived from real DB records.
════════════════════════════════════════════ */
exports.getDashboardStats = async (req, res) => {
  try {
    const donorId = req.user._id;

    /* Run all queries in parallel */
    const [
      allDonations,
      openRequestsCount,
      matchingRequestsCount,
      donorProfile,
    ] = await Promise.all([
      /* All this donor's donation records */
      Donation.find({ donor: donorId }).lean(),

      /* Total open/partially-filled blood requests */
      BloodRequest.countDocuments({ status: { $in: ["open", "partially_filled"] } }),

      /* Requests matching the donor's blood group (if set) */
      (async () => {
        const user = await User.findById(donorId).select("bloodGroup").lean();
        if (!user?.bloodGroup) return 0;
        return BloodRequest.countDocuments({
          status:     { $in: ["open", "partially_filled"] },
          bloodGroup: user.bloodGroup,
        });
      })(),

      /* Full donor profile for blood group + city display */
      User.findById(donorId).select("name bloodGroup city donorStatus").lean(),
    ]);

    /* ── Derived donation stats ── */
    const completed  = allDonations.filter((d) => d.status === "completed");
    const pending    = allDonations.filter((d) => d.status === "pending");
    const confirmed  = allDonations.filter((d) => d.status === "confirmed");
    const totalUnits = completed.reduce((s, d) => s + (d.units || 1), 0);

    /* Last completed donation date */
    let lastDonationDate   = null;
    let nextEligibleDate   = null;
    let eligibilityStatus  = "unknown";

    if (completed.length > 0) {
      const lastDon    = completed.sort((a, b) =>
        new Date(b.completedDate || b.preferredDate) - new Date(a.completedDate || a.preferredDate)
      )[0];
      lastDonationDate = lastDon.completedDate || lastDon.preferredDate;
      const next       = new Date(lastDonationDate);
      next.setDate(next.getDate() + 90);
      nextEligibleDate  = next;
      eligibilityStatus = new Date() >= next ? "eligible" : "not-eligible";
    }

    res.json({
      /* Donation stats */
      totalSubmissions:    allDonations.length,
      completedDonations:  completed.length,
      pendingDonations:    pending.length + confirmed.length,
      livesImpacted:       totalUnits > 0 ? totalUnits * 3 : completed.length * 3,
      lastDonationDate,
      nextEligibleDate,
      eligibilityStatus,

      /* Blood request stats */
      openRequestsCount,
      matchingRequestsCount,

      /* Profile summary */
      bloodGroup:   donorProfile?.bloodGroup   || null,
      city:         donorProfile?.city         || null,
      donorStatus:  donorProfile?.donorStatus  || "pending",
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ message: "Server error fetching dashboard stats." });
  }
};

/* ════════════════════════════════════════════
   POST /api/donor/blood-requests  (admin/hospital only — not donor)
   Hospitals post new blood requests here.
   This route is registered in a SEPARATE router (see routes/bloodRequest.js).
   Placed here for co-location; called from a different mount point.
════════════════════════════════════════════ */
exports.createBloodRequest = async (req, res) => {
  try {
    const {
      hospitalName, hospitalCity, hospitalState,
      bloodGroup, unitsNeeded, urgency, notes,
    } = req.body;

    /* Validation */
    if (!hospitalName?.trim()) return res.status(400).json({ message: "Hospital name is required." });
    if (!bloodGroup)           return res.status(400).json({ message: "Blood group is required." });
    if (!unitsNeeded || unitsNeeded < 1) return res.status(400).json({ message: "Units needed must be at least 1." });

    const valid = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    if (!valid.includes(bloodGroup)) return res.status(400).json({ message: "Invalid blood group." });

    const request = await BloodRequest.create({
      postedBy:      req.user._id,
      hospitalName:  hospitalName.trim(),
      hospitalCity:  hospitalCity?.trim()  || "",
      hospitalState: hospitalState?.trim() || "",
      bloodGroup,
      unitsNeeded:   Number(unitsNeeded),
      urgency:       urgency || "Medium",
      notes:         notes?.trim() || "",
    });

    res.status(201).json({ message: "Blood request posted.", request });
  } catch (err) {
    console.error("createBloodRequest error:", err);
    res.status(500).json({ message: "Server error creating blood request." });
  }
};
