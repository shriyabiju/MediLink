const router      = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const User         = require("../models/User");
const Hospital     = require("../models/Hospital");
const BloodRequest = require("../models/BloodRequest");
const Notification = require("../models/Notification");
const BloodStock   = require("../models/BloodStock");
const BloodBankStock = require("../models/BloodBankStock");
const bcrypt       = require("bcryptjs");

/* All patient routes require a valid JWT and role = "patient" */
router.use(protect, requireRole("patient"));

/* ════════════════════════════════════════════
   GET /api/patient/profile
════════════════════════════════════════════ */
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   PATCH /api/patient/profile
   Body: { name, phone, city, address, bloodGroup }
════════════════════════════════════════════ */
router.patch("/profile", async (req, res) => {
  try {
    const ALLOWED = ["name", "phone", "city", "address", "bloodGroup"];
    const update = {};
    for (const k of ALLOWED) {
      if (req.body[k] !== undefined) {
        update[k] = typeof req.body[k] === "string"
          ? req.body[k].trim() || null
          : req.body[k];
      }
    }
    if (Object.keys(update).length === 0)
      return res.status(400).json({ message: "No valid fields provided." });

    const user = await User.findByIdAndUpdate(
      req.user._id, { $set: update }, { new: true, runValidators: true }
    ).select("-password");
    res.json({ user, message: "Profile updated." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   POST /api/patient/change-password
════════════════════════════════════════════ */
router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ message: "All fields are required." });
    if (newPassword.length < 8)
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    if (newPassword !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match." });

    const user = await User.findById(req.user._id);
    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(401).json({ message: "Current password is incorrect." });

    const same = await bcrypt.compare(newPassword, user.password);
    if (same) return res.status(400).json({ message: "New password must be different." });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/stats
   Dashboard summary counts
════════════════════════════════════════════ */
router.get("/stats", async (req, res) => {
  try {
    const [hospitals, openRequests, unreadNotifs] = await Promise.all([
      Hospital.countDocuments({ approvalStatus: "approved" }),
      BloodRequest.countDocuments({ status: { $in: ["open", "partially_filled"] } }),
      Notification.countDocuments({ recipient: req.user._id, read: false, deleted: false }),
    ]);
    res.json({ hospitals, openRequests, unreadNotifs });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/hospitals
   List approved hospitals
════════════════════════════════════════════ */
router.get("/hospitals", async (req, res) => {
  try {
    const { search = "" } = req.query;
    const filter = { approvalStatus: "approved" };
    if (search.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [{ name: re }, { city: re }, { state: re }];
    }
    const hospitals = await Hospital.find(filter)
      .select("name city state hospitalType totalBeds phone email address registrationNumber")
      .sort({ name: 1 })
      .lean();
    res.json({ hospitals, total: hospitals.length });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/hospitals/:id/details
   Full hospital details including blood stock.
════════════════════════════════════════════ */
router.get("/hospitals/:id/details", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .select("name city state hospitalType totalBeds phone email address registrationNumber")
      .lean();
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    const stock = await BloodStock.find({ hospital: req.params.id, units: { $gt: 0 } }).lean();
    const bloodStock = stock.map((s) => ({
      bloodGroup:  s.group,
      units:        s.units,
      pricePerUnit: s.pricePerUnit || 0,
      status:       s.status,
      updatedAt:    s.updatedAt || null,
    }));

    res.json({ hospital: { ...hospital, bloodStock } });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid hospital ID." });
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/blood-availability
   Aggregated blood stock from all hospitals
════════════════════════════════════════════ */
router.get("/blood-availability", async (req, res) => {
  try {
    const allStock = await BloodStock.find({}).lean();

    /* Sum units per blood group across all hospitals */
    const totals = {};
    allStock.forEach((s) => {
      totals[s.group] = (totals[s.group] || 0) + s.units;
    });

    const result = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((g) => ({
      type:   g,
      units:  totals[g] || 0,
      status: totals[g] > 20 ? "available" : totals[g] > 5 ? "limited" : "unavailable",
    }));
    res.json({ bloodAvailability: result });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/blood-requests
   Returns ONLY the patient's own submitted appointment requests.
   Patients must NOT see hospital-to-donor emergency requests.
════════════════════════════════════════════ */
router.get("/blood-requests", async (req, res) => {
  try {
    const requests = await BloodRequest.find({
      postedBy:    req.user._id,
      requestType: "appointment",
    })
      .sort({ createdAt: -1 })
      .select("-interestedDonors -documents")
      .lean();
    res.json({ requests, total: requests.length });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   POST /api/patient/emergency
   DEPRECATED — patients must use POST /api/patient/blood-request instead.
   Only hospitals can send emergency requests visible to donors.
   This endpoint is kept to return a clear error rather than 404.
════════════════════════════════════════════ */
router.post("/emergency", async (req, res) => {
  return res.status(403).json({
    message:
      "Patients cannot send emergency requests directly to donors. " +
      "Please use 'Book Appointment' to submit a blood request to a hospital. " +
      "The hospital will manage the emergency request to donors on your behalf.",
    code: "PATIENT_EMERGENCY_DISABLED",
  });
});

/* ════════════════════════════════════════════
   GET /api/patient/notifications
════════════════════════════════════════════ */
router.get("/notifications", async (req, res) => {
  try {
    const { filter = "all" } = req.query;
    const query = { recipient: req.user._id, deleted: false };
    if (filter === "unread") query.read = false;

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).lean();
    const unreadCount   = await Notification.countDocuments({ recipient: req.user._id, read: false, deleted: false });
    res.json({ notifications, total: notifications.length, unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   PATCH /api/patient/notifications/:id/read
════════════════════════════════════════════ */
router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }, { new: true }
    );
    if (!n) return res.status(404).json({ message: "Notification not found." });
    res.json({ notification: n });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/blood-banks
   List approved blood banks with their stock.
════════════════════════════════════════════ */
router.get("/blood-banks", async (req, res) => {
  try {
    const { search = "" } = req.query;
    const filter = { role: "bloodbank", approvalStatus: "approved" };
    if (search.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [{ name: re }, { city: re }, { state: re }];
    }

    const banks = await User.find(filter)
      .select("name phone city state address bloodGroup updatedAt")
      .sort({ name: 1 })
      .lean();

    /* Attach stock for each blood bank */
    const bankIds = banks.map((b) => b._id);
    const allStock = await BloodBankStock.find({ bloodBank: { $in: bankIds } }).lean();

    const stockMap = {};
    allStock.forEach((s) => {
      const id = s.bloodBank.toString();
      if (!stockMap[id]) stockMap[id] = [];
      // Only show non-expired, available stock
      if (s.units > 0 && new Date(s.expiresOn) > new Date()) {
        stockMap[id].push({
          bloodGroup: s.bloodGroup,
          units:      s.units,
          pricePerUnit: s.pricePerUnit,
          expiresOn:  s.expiresOn,
          updatedAt:  s.updatedAt || null,
        });
      }
    });

    const result = banks.map((b) => ({
      ...b,
      stock: stockMap[b._id.toString()] || [],
    }));

    res.json({ bloodBanks: result, total: result.length });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/blood-search
   Unified search across hospitals + blood banks.
   Query: bloodGroup, location, source (hospital|bloodbank|all)
════════════════════════════════════════════ */
router.get("/blood-search", async (req, res) => {
  try {
    const { bloodGroup, location, source = "all" } = req.query;
    const results = [];

    /* ── Search hospital blood stock ── */
    if (source === "all" || source === "hospital") {
      const hospitalFilter = { approvalStatus: "approved" };
      if (location && location.trim()) {
        const re = new RegExp(location.trim(), "i");
        hospitalFilter.$or = [{ name: re }, { city: re }, { state: re }];
      }
      const hospitals = await Hospital.find(hospitalFilter)
        .select("name city state phone email address totalBeds")
        .lean();

      const hospitalIds = hospitals.map((h) => h._id);
      const stockFilter = { hospital: { $in: hospitalIds }, units: { $gt: 0 } };
      if (bloodGroup && bloodGroup !== "all") stockFilter.group = bloodGroup;
      const hospitalStock = await BloodStock.find(stockFilter).lean();

      const stockByHospital = {};
      hospitalStock.forEach((s) => {
        const id = s.hospital.toString();
        if (!stockByHospital[id]) stockByHospital[id] = [];
        stockByHospital[id].push({
          bloodGroup:    s.group,
          units:          s.units,
          pricePerUnit:   s.pricePerUnit || 0,
          status:         s.status,
          updatedAt:      s.updatedAt || null,
        });
      });

      hospitals.forEach((h) => {
        const stock = stockByHospital[h._id.toString()] || [];
        if (stock.length > 0) {
          results.push({
            source:       "hospital",
            sourceId:     h._id,
            name:         h.name,
            city:         h.city,
            state:        h.state,
            phone:        h.phone,
            address:      h.address,
            bloodStock:   stock,
            updatedAt:    h.updatedAt || null,
          });
        }
      });
    }

    /* ── Search blood bank stock ── */
    if (source === "all" || source === "bloodbank") {
      const bankFilter = { role: "bloodbank", approvalStatus: "approved" };
      if (location && location.trim()) {
        const re = new RegExp(location.trim(), "i");
        bankFilter.$or = [{ name: re }, { city: re }, { state: re }];
      }
      const banks = await User.find(bankFilter)
        .select("name phone city state address")
        .lean();

      const bankIds = banks.map((b) => b._id);
      const bbStockFilter = {
        bloodBank: { $in: bankIds },
        units: { $gt: 0 },
        expiresOn: { $gt: new Date() },
      };
      if (bloodGroup && bloodGroup !== "all") bbStockFilter.bloodGroup = bloodGroup;
      const bankStock = await BloodBankStock.find(bbStockFilter).lean();

      const stockByBank = {};
      bankStock.forEach((s) => {
        const id = s.bloodBank.toString();
        if (!stockByBank[id]) stockByBank[id] = [];
        stockByBank[id].push({
          bloodGroup:    s.bloodGroup,
          units:          s.units,
          pricePerUnit:   s.pricePerUnit,
          expiresOn:      s.expiresOn,
          updatedAt:      s.updatedAt || null,
        });
      });

      banks.forEach((b) => {
        const stock = stockByBank[b._id.toString()] || [];
        if (stock.length > 0) {
          results.push({
            source:     "bloodbank",
            sourceId:   b._id,
            name:       b.name,
            city:       b.city,
            state:      b.state,
            phone:      b.phone,
            address:    b.address,
            bloodStock: stock,
            updatedAt:  b.updatedAt || null,
          });
        }
      });
    }

    res.json({ results, total: results.length });
  } catch (err) {
    console.error("blood-search:", err);
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   POST /api/patient/blood-request
   Patient submits a detailed blood request to a specific hospital.
   Body: { hospitalId, patientName, patientAge, patientGender, patientPhone,
           patientEmail, patientCity, patientAddress, bloodGroup, unitsNeeded,
           urgency, requiredDate, requiredTime, reason, notes, documents }
   documents: [{ fileName, contentType, data (base64) }]
════════════════════════════════════════════ */
router.post("/blood-request", async (req, res) => {
  try {
    const {
      hospitalId, patientName, patientAge, patientGender,
      patientPhone, patientEmail, patientCity, patientAddress,
      bloodGroup, unitsNeeded, urgency, requiredDate, requiredTime,
      reason, notes, documents,
    } = req.body;

    /* ── Validation ── */
    if (!hospitalId)              return res.status(400).json({ message: "Please select a hospital." });
    if (!bloodGroup)              return res.status(400).json({ message: "Blood group is required." });
    if (!unitsNeeded || unitsNeeded < 1) return res.status(400).json({ message: "Units needed must be at least 1." });

    const validBG = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    if (!validBG.includes(bloodGroup)) return res.status(400).json({ message: "Invalid blood group." });

    /* ── Verify the hospital exists and is approved ── */
    const hospital = await Hospital.findOne({ _id: hospitalId, approvalStatus: "approved" });
    if (!hospital) return res.status(404).json({ message: "Selected hospital not found or not approved." });

    /* ── Get patient's profile for auto-populated fields ── */
    const patientUser = await User.findById(req.user._id).select("name email phone city");

    /* ── Build the request ── */
    const requestData = {
      postedBy:      req.user._id,
      hospitalId:     hospital._id,
      hospitalName:   hospital.name,
      hospitalCity:   hospital.city || "",
      hospitalState:  hospital.state || "",
      requestType:    "appointment",
      patientName:    patientName?.trim()    || patientUser.name  || "",
      patientAge:     patientAge  ? Number(patientAge) : null,
      patientGender:  patientGender?.trim()  || "",
      patientPhone:   patientPhone?.trim()   || patientUser.phone  || "",
      patientEmail:   patientEmail?.trim()   || patientUser.email || "",
      patientCity:    patientCity?.trim()    || patientUser.city   || "",
      patientAddress: patientAddress?.trim() || "",
      bloodGroup,
      unitsNeeded:    Number(unitsNeeded),
      urgency:        urgency || "Normal",
      requiredDate:   requiredDate ? new Date(requiredDate) : null,
      requiredTime:   requiredTime?.trim() || "",
      reason:         reason?.trim()  || "",
      notes:          notes?.trim()   || "",
      reviewStatus:   "pending",
      /* Keep donor-flow status as 'open' for backward compatibility */
      status:         "open",
    };

    /* ── Attach documents if provided ── */
    if (documents && Array.isArray(documents) && documents.length > 0) {
      requestData.documents = documents
        .filter((d) => d.data && d.fileName && d.contentType)
        .map((d) => ({
          fileName:    d.fileName,
          contentType:  d.contentType,
          data:         d.data,
          uploadedAt:   new Date(),
        }));
    }

    const request = await BloodRequest.create(requestData);

    /* ── Notify the hospital user about the new request ── */
    const hospitalUser = await User.findOne({ hospitalRef: hospital._id });
    if (hospitalUser) {
      await Notification.create({
        recipient: hospitalUser._id,
        type:      "request",
        title:     "New Blood Request",
        message:   `A patient has submitted a blood request for ${bloodGroup} (${unitsNeeded} units).`,
        refModel:  "BloodRequest",
        refId:     request._id,
      });
    }

    res.status(201).json({
      request: { _id: request._id, reviewStatus: request.reviewStatus },
      message: "Blood request submitted successfully. The hospital will review your request.",
    });
  } catch (err) {
    console.error("blood-request error:", err);
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid hospital ID." });
    res.status(500).json({ message: "Server error submitting request." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/my-requests
   Returns blood requests submitted by this patient.
════════════════════════════════════════════ */
router.get("/my-requests", async (req, res) => {
  try {
    const requests = await BloodRequest.find({ postedBy: req.user._id, requestType: "appointment" })
      .select("hospitalName hospitalCity bloodGroup unitsNeeded urgency requiredDate reason reviewStatus status createdAt")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ requests, total: requests.length });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/my-requests/:id
   Returns a single blood request owned by this patient.
════════════════════════════════════════════ */
router.get("/my-requests/:id", async (req, res) => {
  try {
    const request = await BloodRequest.findOne({ _id: req.params.id, postedBy: req.user._id })
      .select("-documents.data")  /* Don't return document base64 in list view */
      .lean();
    if (!request) return res.status(404).json({ message: "Request not found." });
    res.json({ request });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid request ID." });
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
