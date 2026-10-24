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
      .select("name city state hospitalType totalBeds phone email")
      .sort({ name: 1 })
      .lean();
    res.json({ hospitals, total: hospitals.length });
  } catch (err) {
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
   Open blood requests visible to patients
════════════════════════════════════════════ */
router.get("/blood-requests", async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: { $in: ["open", "partially_filled"] } })
      .sort({ createdAt: -1 })
      .select("-interestedDonors")
      .lean();
    res.json({ requests, total: requests.length });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   POST /api/patient/emergency
   Patient submits an emergency blood request
   Body: { hospitalName, hospitalCity, bloodGroup, unitsNeeded, urgency, notes }
════════════════════════════════════════════ */
router.post("/emergency", async (req, res) => {
  try {
    const { hospitalName, hospitalCity, bloodGroup, unitsNeeded, urgency, notes } = req.body;
    if (!hospitalName?.trim()) return res.status(400).json({ message: "Hospital name is required." });
    if (!bloodGroup)           return res.status(400).json({ message: "Blood group is required." });
    if (!unitsNeeded || unitsNeeded < 1) return res.status(400).json({ message: "Units needed must be at least 1." });

    const valid = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    if (!valid.includes(bloodGroup)) return res.status(400).json({ message: "Invalid blood group." });

    const request = await BloodRequest.create({
      postedBy:     req.user._id,
      hospitalName: hospitalName.trim(),
      hospitalCity: hospitalCity?.trim() || "",
      bloodGroup,
      unitsNeeded:  Number(unitsNeeded),
      urgency:      urgency || "High",
      notes:        notes?.trim() || "",
    });
    res.status(201).json({ request, message: "Emergency request submitted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
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
      .select("name phone city state address bloodGroup")
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

module.exports = router;
