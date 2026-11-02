const router      = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const User         = require("../models/User");
const Hospital     = require("../models/Hospital");
const BloodRequest = require("../models/BloodRequest");
const Notification = require("../models/Notification");
const BloodStock   = require("../models/BloodStock");
const BloodBankStock = require("../models/BloodBankStock");
const bcrypt       = require("bcryptjs");
const ctrl         = require("../controllers/patientController");

/* All patient routes require a valid JWT and role = "patient" */
router.use(protect, requireRole("patient"));

/* ── patientController routes ── */
router.post("/requests",          ctrl.createRequest);
router.get("/requests",           ctrl.getMyRequests);
router.get("/requests/:id",       ctrl.getRequestById);
router.patch("/requests/:id/cancel", ctrl.cancelRequest);

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
════════════════════════════════════════════ */
router.patch("/profile", async (req, res) => {
  try {
    const ALLOWED = ["name", "phone", "city", "address", "bloodGroup"];
    const update = {};
    for (const k of ALLOWED) {
      if (req.body[k] !== undefined) {
        update[k] = typeof req.body[k] === "string" ? req.body[k].trim() || null : req.body[k];
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
      .sort({ name: 1 }).lean();
    res.json({ hospitals, total: hospitals.length });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/hospitals/:id/details
════════════════════════════════════════════ */
router.get("/hospitals/:id/details", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
      .select("name city state hospitalType totalBeds phone email address registrationNumber").lean();
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });
    const stock = await BloodStock.find({ hospital: req.params.id, units: { $gt: 0 } }).lean();
    const bloodStock = stock.map((s) => ({
      bloodGroup: s.group, units: s.units, pricePerUnit: s.pricePerUnit || 0,
      status: s.status, updatedAt: s.updatedAt || null,
    }));
    res.json({ hospital: { ...hospital, bloodStock } });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid hospital ID." });
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/blood-availability
════════════════════════════════════════════ */
router.get("/blood-availability", async (req, res) => {
  try {
    const allStock = await BloodStock.find({}).lean();
    const totals = {};
    allStock.forEach((s) => { totals[s.group] = (totals[s.group] || 0) + s.units; });
    const result = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((g) => ({
      type: g, units: totals[g] || 0,
      status: totals[g] > 20 ? "available" : totals[g] > 5 ? "limited" : "unavailable",
    }));
    res.json({ bloodAvailability: result });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/blood-requests
════════════════════════════════════════════ */
router.get("/blood-requests", async (req, res) => {
  try {
    const requests = await BloodRequest.find({ postedBy: req.user._id, requestType: "appointment" })
      .sort({ createdAt: -1 }).select("-interestedDonors -documents").lean();
    res.json({ requests, total: requests.length });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   POST /api/patient/emergency (disabled)
════════════════════════════════════════════ */
router.post("/emergency", async (_req, res) => {
  return res.status(403).json({
    message: "Patients cannot send emergency requests directly to donors. Please use 'Book Appointment'.",
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
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false, deleted: false });
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
════════════════════════════════════════════ */
router.get("/blood-banks", async (req, res) => {
  try {
    const { search = "" } = req.query;
    const filter = { role: "bloodbank", approvalStatus: "approved" };
    if (search.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [{ name: re }, { city: re }, { state: re }];
    }
    const banks = await User.find(filter).select("name phone city state address bloodGroup updatedAt").sort({ name: 1 }).lean();
    const bankIds = banks.map((b) => b._id);
    const allStock = await BloodBankStock.find({ bloodBank: { $in: bankIds } }).lean();
    const stockMap = {};
    allStock.forEach((s) => {
      const id = s.bloodBank.toString();
      if (!stockMap[id]) stockMap[id] = [];
      if (s.units > 0 && new Date(s.expiresOn) > new Date()) {
        stockMap[id].push({ bloodGroup: s.bloodGroup, units: s.units, pricePerUnit: s.pricePerUnit, expiresOn: s.expiresOn, updatedAt: s.updatedAt || null });
      }
    });
    const result = banks.map((b) => ({ ...b, stock: stockMap[b._id.toString()] || [] }));
    res.json({ bloodBanks: result, total: result.length });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/blood-search
════════════════════════════════════════════ */
router.get("/blood-search", async (req, res) => {
  try {
    const { bloodGroup, location, source = "all" } = req.query;
    const results = [];

    if (source === "all" || source === "hospital") {
      const hospitalFilter = { approvalStatus: "approved" };
      if (location?.trim()) { const re = new RegExp(location.trim(), "i"); hospitalFilter.$or = [{ name: re }, { city: re }, { state: re }]; }
      const hospitals = await Hospital.find(hospitalFilter).select("name city state phone email address totalBeds").lean();
      const hospitalIds = hospitals.map((h) => h._id);
      const stockFilter = { hospital: { $in: hospitalIds }, units: { $gt: 0 } };
      if (bloodGroup && bloodGroup !== "all") stockFilter.group = bloodGroup;
      const hospitalStock = await BloodStock.find(stockFilter).lean();
      const stockByHospital = {};
      hospitalStock.forEach((s) => {
        const id = s.hospital.toString();
        if (!stockByHospital[id]) stockByHospital[id] = [];
        stockByHospital[id].push({ bloodGroup: s.group, units: s.units, pricePerUnit: s.pricePerUnit || 0, status: s.status, updatedAt: s.updatedAt || null });
      });
      hospitals.forEach((h) => {
        const stock = stockByHospital[h._id.toString()] || [];
        if (stock.length > 0) results.push({ source: "hospital", sourceId: h._id, name: h.name, city: h.city, state: h.state, phone: h.phone, address: h.address, bloodStock: stock, updatedAt: h.updatedAt || null });
      });
    }

    if (source === "all" || source === "bloodbank") {
      const bankFilter = { role: "bloodbank", approvalStatus: "approved" };
      if (location?.trim()) { const re = new RegExp(location.trim(), "i"); bankFilter.$or = [{ name: re }, { city: re }, { state: re }]; }
      const banks = await User.find(bankFilter).select("name phone city state address").lean();
      const bankIds = banks.map((b) => b._id);
      const bbStockFilter = { bloodBank: { $in: bankIds }, units: { $gt: 0 }, expiresOn: { $gt: new Date() } };
      if (bloodGroup && bloodGroup !== "all") bbStockFilter.bloodGroup = bloodGroup;
      const bankStock = await BloodBankStock.find(bbStockFilter).lean();
      const stockByBank = {};
      bankStock.forEach((s) => {
        const id = s.bloodBank.toString();
        if (!stockByBank[id]) stockByBank[id] = [];
        stockByBank[id].push({ bloodGroup: s.bloodGroup, units: s.units, pricePerUnit: s.pricePerUnit, expiresOn: s.expiresOn, updatedAt: s.updatedAt || null });
      });
      banks.forEach((b) => {
        const stock = stockByBank[b._id.toString()] || [];
        if (stock.length > 0) results.push({ source: "bloodbank", sourceId: b._id, name: b.name, city: b.city, state: b.state, phone: b.phone, address: b.address, bloodStock: stock, updatedAt: b.updatedAt || null });
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
════════════════════════════════════════════ */
router.post("/blood-request", async (req, res) => {
  try {
    const { hospitalId, patientName, patientAge, patientGender, patientPhone, patientEmail, patientCity, patientAddress, bloodGroup, unitsNeeded, urgency, requiredDate, requiredTime, reason, notes, documents } = req.body;
    if (!hospitalId) return res.status(400).json({ message: "Please select a hospital." });
    if (!bloodGroup) return res.status(400).json({ message: "Blood group is required." });
    if (!unitsNeeded || unitsNeeded < 1) return res.status(400).json({ message: "Units needed must be at least 1." });
    const validBG = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
    if (!validBG.includes(bloodGroup)) return res.status(400).json({ message: "Invalid blood group." });
    const hospital = await Hospital.findOne({ _id: hospitalId, approvalStatus: "approved" });
    if (!hospital) return res.status(404).json({ message: "Hospital not found or not approved." });
    const patientUser = await User.findById(req.user._id).select("name email phone city");
    const requestData = {
      postedBy: req.user._id, hospitalId: hospital._id, hospitalName: hospital.name,
      hospitalCity: hospital.city || "", hospitalState: hospital.state || "",
      requestType: "appointment",
      patientName: patientName?.trim() || patientUser.name || "",
      patientAge: patientAge ? Number(patientAge) : null,
      patientGender: patientGender?.trim() || "",
      patientPhone: patientPhone?.trim() || patientUser.phone || "",
      patientEmail: patientEmail?.trim() || patientUser.email || "",
      patientCity: patientCity?.trim() || patientUser.city || "",
      patientAddress: patientAddress?.trim() || "",
      bloodGroup, unitsNeeded: Number(unitsNeeded), urgency: urgency || "Normal",
      requiredDate: requiredDate ? new Date(requiredDate) : null,
      requiredTime: requiredTime?.trim() || "", reason: reason?.trim() || "",
      notes: notes?.trim() || "", reviewStatus: "pending", status: "open",
    };
    if (documents?.length) {
      requestData.documents = documents.filter((d) => d.data && d.fileName && d.contentType)
        .map((d) => ({ fileName: d.fileName, contentType: d.contentType, data: d.data, uploadedAt: new Date() }));
    }
    const request = await BloodRequest.create(requestData);
    const hospitalUser = await User.findOne({ hospitalRef: hospital._id });
    if (hospitalUser) {
      await Notification.create({
        recipient: hospitalUser._id, type: "request", title: "New Blood Request",
        message: `A patient has submitted a blood request for ${bloodGroup} (${unitsNeeded} units).`,
        refModel: "BloodRequest", refId: request._id,
      });
    }
    res.status(201).json({ request: { _id: request._id, reviewStatus: request.reviewStatus }, message: "Blood request submitted successfully." });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid hospital ID." });
    res.status(500).json({ message: "Server error submitting request." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/my-requests
════════════════════════════════════════════ */
router.get("/my-requests", async (req, res) => {
  try {
    const requests = await BloodRequest.find({ postedBy: req.user._id, requestType: "appointment" })
      .select("hospitalName hospitalCity bloodGroup unitsNeeded urgency requiredDate reason reviewStatus status createdAt")
      .sort({ createdAt: -1 }).lean();
    res.json({ requests, total: requests.length });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
});

/* ════════════════════════════════════════════
   GET /api/patient/my-requests/:id
════════════════════════════════════════════ */
router.get("/my-requests/:id", async (req, res) => {
  try {
    const request = await BloodRequest.findOne({ _id: req.params.id, postedBy: req.user._id })
      .select("-documents.data").lean();
    if (!request) return res.status(404).json({ message: "Request not found." });
    res.json({ request });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid request ID." });
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
