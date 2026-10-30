const Hospital    = require("../models/Hospital");
const User        = require("../models/User");
const BloodStock  = require("../models/BloodStock");
const Doctor      = require("../models/Doctor");
const Medicine    = require("../models/Medicine");
const BloodRequest = require("../models/BloodRequest");
const Notification = require("../models/Notification");
const bcrypt      = require("bcryptjs");

/* ─── Helper: get Hospital doc for the logged-in user ─────────── */
const getHospitalDoc = async (userId) =>
  Hospital.findOne({ user: userId });

/* ════════════════════════════════════════════
   GET /api/hospital/profile
════════════════════════════════════════════ */
exports.getProfile = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital profile not found." });
    res.json({ hospital });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/hospital/profile
   Body: any subset of hospital fields
════════════════════════════════════════════ */
exports.updateProfile = async (req, res) => {
  try {
    const ALLOWED = [
      "name", "phone", "address", "city", "state",
      "hospitalType", "registrationNumber", "totalBeds",
      "description", "website",
    ];
    const update = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) {
        update[key] = typeof req.body[key] === "string"
          ? req.body[key].trim()
          : req.body[key];
      }
    }

    const hospital = await Hospital.findOneAndUpdate(
      { user: req.user._id },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!hospital) return res.status(404).json({ message: "Hospital profile not found." });
    res.json({ hospital, message: "Profile updated." });
  } catch (err) {
    res.status(500).json({ message: "Server error updating profile." });
  }
};

/* ════════════════════════════════════════════
   GET /api/hospital/stats
   Dashboard summary counts
════════════════════════════════════════════ */
exports.getDashboardStats = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });
    const hId = hospital._id;

    const [bloodStock, doctors, medicines, bloodRequests, unreadNotifs] =
      await Promise.all([
        BloodStock.find({ hospital: hId }),
        Doctor.find({ hospital: hId }),
        Medicine.find({ hospital: hId }),
        BloodRequest.find({ postedBy: req.user._id }),
        Notification.countDocuments({ recipient: req.user._id, read: false, deleted: false }),
      ]);

    const totalBloodUnits = bloodStock.reduce((s, b) => s + b.units, 0);
    const availableDoctors = doctors.filter((d) => d.status === "Available").length;
    const pendingRequests  = bloodRequests.filter((r) => r.status === "open").length;
    const lowMedicines     = medicines.filter((m) => m.status === "Critical" || m.status === "Low Stock").length;

    res.json({
      totalBloodUnits,
      totalDoctors: doctors.length,
      availableDoctors,
      totalMedicines: medicines.length,
      lowMedicines,
      pendingRequests,
      totalRequests: bloodRequests.length,
      totalBeds: hospital.totalBeds || 0,
      unreadNotifs,
    });
  } catch (err) {
    console.error("getDashboardStats:", err);
    res.status(500).json({ message: "Server error fetching stats." });
  }
};

/* ════════════════════════════════════════════
   BLOOD STOCK CRUD
════════════════════════════════════════════ */
exports.getBloodStock = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });
    const stock = await BloodStock.find({ hospital: hospital._id }).sort({ group: 1 });
    res.json({ stock });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.upsertBloodStock = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    const { group, units, status, pricePerUnit } = req.body;
    if (!group) return res.status(400).json({ message: "Blood group is required." });
    if (units === undefined || units < 0) return res.status(400).json({ message: "Units must be 0 or more." });

    const record = await BloodStock.findOneAndUpdate(
      { hospital: hospital._id, group },
      { $set: { units: Number(units), status: status || "Available", pricePerUnit: Number(pricePerUnit) || 0 } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ record, message: "Blood stock updated." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.deleteBloodStock = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    const record = await BloodStock.findOneAndDelete({ _id: req.params.id, hospital: hospital._id });
    if (!record) return res.status(404).json({ message: "Record not found." });
    res.json({ message: "Blood stock record removed." });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   DOCTOR CRUD
════════════════════════════════════════════ */
exports.getDoctors = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });
    const doctors = await Doctor.find({ hospital: hospital._id }).sort({ name: 1 });
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.createDoctor = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    const { name, dept, spec, shift, status, phone } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Doctor name is required." });
    if (!dept?.trim()) return res.status(400).json({ message: "Department is required." });

    const doctor = await Doctor.create({
      hospital: hospital._id,
      name: name.trim(), dept: dept.trim(),
      spec: spec?.trim() || "",
      shift: shift || "Morning",
      status: status || "Available",
      phone: phone?.trim() || "",
    });
    res.status(201).json({ doctor, message: "Doctor added." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    const { name, dept, spec, shift, status, phone } = req.body;
    const update = {};
    if (name)   update.name   = name.trim();
    if (dept)   update.dept   = dept.trim();
    if (spec  !== undefined) update.spec   = spec.trim();
    if (shift)  update.shift  = shift;
    if (status) update.status = status;
    if (phone !== undefined) update.phone  = phone.trim();

    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, hospital: hospital._id },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found." });
    res.json({ doctor, message: "Doctor updated." });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    const doctor = await Doctor.findOneAndDelete({ _id: req.params.id, hospital: hospital._id });
    if (!doctor) return res.status(404).json({ message: "Doctor not found." });
    res.json({ message: "Doctor removed." });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   MEDICINE CRUD
════════════════════════════════════════════ */
exports.getMedicines = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });
    const medicines = await Medicine.find({ hospital: hospital._id }).sort({ name: 1 });
    res.json({ medicines });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.createMedicine = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    const { name, category, qty, expiry, status } = req.body;
    if (!name?.trim())  return res.status(400).json({ message: "Medicine name is required." });
    if (!category)      return res.status(400).json({ message: "Category is required." });
    if (qty === undefined || qty < 0) return res.status(400).json({ message: "Quantity must be 0 or more." });

    const medicine = await Medicine.create({
      hospital: hospital._id,
      name: name.trim(), category,
      qty: Number(qty),
      expiry: expiry || "",
      status: status || "Available",
    });
    res.status(201).json({ medicine, message: "Medicine added." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    const { name, category, qty, expiry, status } = req.body;
    const update = {};
    if (name)     update.name     = name.trim();
    if (category) update.category = category;
    if (qty !== undefined) update.qty = Number(qty);
    if (expiry !== undefined) update.expiry = expiry;
    if (status)   update.status   = status;

    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, hospital: hospital._id },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!medicine) return res.status(404).json({ message: "Medicine not found." });
    res.json({ medicine, message: "Medicine updated." });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, hospital: hospital._id });
    if (!medicine) return res.status(404).json({ message: "Medicine not found." });
    res.json({ message: "Medicine removed." });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   EMERGENCY REQUESTS (via BloodRequest model)
════════════════════════════════════════════ */
exports.getEmergencyRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const hospital = await getHospitalDoc(req.user._id);

    /* Build filter: include requests posted by this hospital user
       AND requests directed to this hospital by patients */
    const filter = { $or: [{ postedBy: req.user._id }] };
    if (hospital) {
      filter.$or.push({ hospitalId: hospital._id });
    }
    if (status && status !== "All") filter.status = status;

    const requests = await BloodRequest.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["open", "partially_filled", "fulfilled", "cancelled"];
    if (!valid.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${valid.join(", ")}` });
    }

    /* Allow update if the request was posted by this hospital user
       OR if it was directed to this hospital by a patient */
    const hospital = await getHospitalDoc(req.user._id);
    const findFilter = { _id: req.params.id };
    if (hospital) {
      findFilter.$or = [{ postedBy: req.user._id }, { hospitalId: hospital._id }];
    } else {
      findFilter.postedBy = req.user._id;
    }

    const request = await BloodRequest.findOne(findFilter);
    if (!request) return res.status(404).json({ message: "Request not found." });

    request.status = status;
    await request.save();
    res.json({ request, message: "Status updated." });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   GET /api/hospital/requests/:id/details
   Returns full request details (including documents) for review.
   Only accessible if the request is assigned to this hospital.
════════════════════════════════════════════ */
exports.getRequestDetails = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    const request = await BloodRequest.findOne({
      _id: req.params.id,
      hospitalId: hospital._id,
    }).lean();

    if (!request) return res.status(404).json({ message: "Request not found or not assigned to your hospital." });

    res.json({ request });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/hospital/requests/:id/review
   Hospital updates the review status of a patient blood request.
   Body: { reviewStatus }
════════════════════════════════════════════ */
exports.updateReviewStatus = async (req, res) => {
  try {
    const { reviewStatus } = req.body;
    const valid = ["pending", "under_review", "approved", "rejected", "fulfilled"];
    if (!valid.includes(reviewStatus)) {
      return res.status(400).json({ message: `Review status must be one of: ${valid.join(", ")}` });
    }

    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });

    const request = await BloodRequest.findOne({
      _id: req.params.id,
      hospitalId: hospital._id,
    });
    if (!request) return res.status(404).json({ message: "Request not found or not assigned to your hospital." });

    request.reviewStatus = reviewStatus;
    /* Sync the donor-flow status when appropriate */
    if (reviewStatus === "fulfilled") request.status = "fulfilled";
    if (reviewStatus === "rejected")   request.status = "cancelled";
    await request.save();

    /* Notify the patient about the status change */
    await Notification.create({
      recipient: request.postedBy,
      type:      "request",
      title:     `Blood Request ${reviewStatus.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}`,
      message:   `Your blood request for ${request.bloodGroup} (${request.unitsNeeded} units) at ${request.hospitalName} has been ${reviewStatus.replace("_", " ")}.`,
      refModel:  "BloodRequest",
      refId:     request._id,
    });

    res.json({ request: { _id: request._id, reviewStatus: request.reviewStatus }, message: `Request ${reviewStatus.replace("_", " ")}.` });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    console.error("updateReviewStatus:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   NOTIFICATIONS (shared Notification model)
════════════════════════════════════════════ */
exports.getNotifications = async (req, res) => {
  try {
    const { filter = "all" } = req.query;
    const query = { recipient: req.user._id, deleted: false };
    if (filter === "unread") query.read = false;
    if (filter === "read")   query.read = true;

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).lean();
    const unreadCount   = await Notification.countDocuments({ recipient: req.user._id, read: false, deleted: false });
    res.json({ notifications, total: notifications.length, unreadCount });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.markNotifRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }, { new: true }
    );
    if (!notif) return res.status(404).json({ message: "Notification not found." });
    res.json({ notification: notif });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.markAllNotifsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false, deleted: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read.", updated: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

exports.deleteNotif = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { deleted: true }, { new: true }
    );
    if (!notif) return res.status(404).json({ message: "Notification not found." });
    res.json({ message: "Notification dismissed." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   SETTINGS — change password
════════════════════════════════════════════ */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All three password fields are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found." });

    const match = await user.comparePassword(currentPassword);
    if (!match) return res.status(401).json({ message: "Current password is incorrect." });

    const same = await bcrypt.compare(newPassword, user.password);
    if (same) return res.status(400).json({ message: "New password must be different from the current one." });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   GET /api/hospital/beds
════════════════════════════════════════════ */
exports.getBeds = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });
    res.json({ beds: hospital.beds || [] });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   PUT /api/hospital/beds
   Replaces the entire beds array.
   Body: { beds: [{ type, total, occupied, color }] }
════════════════════════════════════════════ */
exports.updateBeds = async (req, res) => {
  try {
    const { beds } = req.body;
    if (!Array.isArray(beds)) return res.status(400).json({ message: "beds must be an array." });

    for (const b of beds) {
      if (!b.type?.trim()) return res.status(400).json({ message: "Each bed entry must have a type." });
      if (b.total < 0 || b.occupied < 0) return res.status(400).json({ message: "Counts cannot be negative." });
      if (b.occupied > b.total) return res.status(400).json({ message: `Occupied cannot exceed total for ${b.type}.` });
    }

    const hospital = await Hospital.findOneAndUpdate(
      { user: req.user._id },
      { $set: { beds } },
      { new: true }
    );
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });
    res.json({ beds: hospital.beds, message: "Bed data updated." });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   GET /api/hospital/reports
   Aggregates real data from all collections.
════════════════════════════════════════════ */
exports.getReports = async (req, res) => {
  try {
    const hospital = await getHospitalDoc(req.user._id);
    if (!hospital) return res.status(404).json({ message: "Hospital not found." });
    const hId = hospital._id;

    const [bloodStock, doctors, medicines, requests] = await Promise.all([
      BloodStock.find({ hospital: hId }),
      Doctor.find({ hospital: hId }),
      Medicine.find({ hospital: hId }),
      BloodRequest.find({ postedBy: req.user._id }),
    ]);

    /* Blood stock chart */
    const bloodData = bloodStock.map((b) => ({ label: b.group, value: b.units }));

    /* Medicine stock by category */
    const catMap = {};
    medicines.forEach((m) => {
      catMap[m.category] = (catMap[m.category] || 0) + m.qty;
    });
    const medicineData = Object.entries(catMap).map(([label, value]) => ({ label, value }));

    /* Bed occupancy */
    const bedData = (hospital.beds || []).map((b) => ({
      label: b.type,
      value: b.occupied,
      total: b.total,
    }));

    /* Request stats */
    const requestStats = {
      total:     requests.length,
      open:      requests.filter((r) => r.status === "open").length,
      fulfilled: requests.filter((r) => r.status === "fulfilled").length,
      cancelled: requests.filter((r) => r.status === "cancelled").length,
    };

    /* Doctor stats */
    const doctorStats = {
      total:     doctors.length,
      available: doctors.filter((d) => d.status === "Available").length,
      busy:      doctors.filter((d) => d.status === "Busy").length,
      onLeave:   doctors.filter((d) => d.status === "On Leave").length,
    };

    /* Medicine alerts */
    const medicineAlerts = {
      total:    medicines.length,
      low:      medicines.filter((m) => m.status === "Low Stock").length,
      critical: medicines.filter((m) => m.status === "Critical").length,
    };

    res.json({
      bloodData,
      medicineData,
      bedData,
      requestStats,
      doctorStats,
      medicineAlerts,
      totalBeds: hospital.totalBeds || 0,
    });
  } catch (err) {
    console.error("getReports:", err);
    res.status(500).json({ message: "Server error fetching reports." });
  }
};

/* ════════════════════════════════════════════
   GET /api/hospital/other-hospitals
   List all OTHER approved hospitals (not this one).
   Includes their blood stock summary.
════════════════════════════════════════════ */
exports.getOtherHospitals = async (req, res) => {
  try {
    const myHospital = await getHospitalDoc(req.user._id);
    if (!myHospital) return res.status(404).json({ message: "Hospital not found." });

    /* Find all approved hospitals except this one */
    const hospitals = await Hospital.find({
      approvalStatus: "approved",
      _id: { $ne: myHospital._id },
    })
      .select("name city state phone email hospitalType totalBeds address registrationNumber")
      .sort({ name: 1 })
      .lean();

    /* For each hospital, attach blood stock summary */
    const hospitalIds = hospitals.map((h) => h._id);
    const allStock = await BloodStock.find({ hospital: { $in: hospitalIds } }).lean();

    /* Group stock by hospital */
    const stockMap = {};
    allStock.forEach((s) => {
      const id = s.hospital.toString();
      if (!stockMap[id]) stockMap[id] = [];
      stockMap[id].push({ group: s.group, units: s.units, status: s.status });
    });

    const result = hospitals.map((h) => ({
      ...h,
      bloodStock: stockMap[h._id.toString()] || [],
    }));

    res.json({ hospitals: result, total: result.length });
  } catch (err) {
    console.error("getOtherHospitals:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   GET /api/hospital/donors
   List registered donors — safe fields only.
   Hospitals only see APPROVED donors by default.
   Never exposes passwords, tokens, idDocument, or private info.
════════════════════════════════════════════ */
exports.getDonors = async (req, res) => {
  try {
    const { bloodGroup, city, status } = req.query;

    const filter = { role: "donor" };
    /* Default: only show approved/verified donors to hospitals */
    if (status && status !== "all") {
      filter.donorStatus = status;
    } else {
      filter.donorStatus = "approved";
    }
    if (bloodGroup && bloodGroup !== "all") filter.bloodGroup = bloodGroup;
    if (city       && city       !== "all") filter.city       = new RegExp(city.trim(), "i");

    /* Select only safe fields — NEVER include idDocument, rejectionReason, password */
    const donors = await User.find(filter)
      .select("name bloodGroup dob city phone availability donorStatus createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ donors, total: donors.length });
  } catch (err) {
    console.error("getDonors (hospital):", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   GET /api/hospital/all-requests
   All blood requests (from all hospitals + patients),
   NOT filtered by postedBy — so hospital can see what
   patients and other hospitals have requested.
   Query: status, bloodGroup, urgency
════════════════════════════════════════════ */
exports.getAllBloodRequests = async (req, res) => {
  try {
    const { status, bloodGroup, urgency } = req.query;

    const filter = {};
    if (status     && status     !== "all") filter.status     = status;
    if (bloodGroup && bloodGroup !== "all") filter.bloodGroup = bloodGroup;
    if (urgency    && urgency    !== "all") filter.urgency    = urgency;

    const requests = await BloodRequest.find(filter)
      .populate("postedBy", "name role")
      .sort({ createdAt: -1 })
      .lean();

    /* Sort Critical first */
    const ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    requests.sort((a, b) => (ORDER[a.urgency] ?? 9) - (ORDER[b.urgency] ?? 9));

    res.json({ requests, total: requests.length });
  } catch (err) {
    console.error("getAllBloodRequests:", err);
    res.status(500).json({ message: "Server error." });
  }
};


/* ════════════════════════════════════════════
   GET /api/hospital/settings
   Returns the hospital user's persisted settings.
════════════════════════════════════════════ */
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("settings name email").lean();
    if (!user) return res.status(404).json({ message: "User not found." });

    const defaults = {
      notifications: {
        email: true, sms: false, criticalBlood: true,
        lowMedicine: true, bedUpdates: true, emergency: true,
      },
    };

    res.json({
      settings: user.settings ?? defaults,
      name:  user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("getSettings error:", err);
    res.status(500).json({ message: "Server error fetching settings." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/hospital/settings
   Body: { notifications: { email, sms, criticalBlood, ... } }
   Persists notification preferences on the User document.
════════════════════════════════════════════ */
exports.saveSettings = async (req, res) => {
  try {
    const { notifications } = req.body;

    if (!notifications || typeof notifications !== "object") {
      return res.status(400).json({ message: "No settings provided." });
    }

    /* Build a safe settings object — only accept known boolean keys */
    const NOTIF_KEYS = ["email", "sms", "criticalBlood", "lowMedicine", "bedUpdates", "emergency"];
    const notifSettings = {};

    for (const k of NOTIF_KEYS) {
      if (typeof notifications[k] === "boolean") {
        notifSettings[k] = notifications[k];
      }
    }

    /* Set the entire settings object (works even when settings was null) */
    await User.findByIdAndUpdate(req.user._id, { $set: { settings: { notifications: notifSettings } } });

    res.json({ message: "Settings saved successfully." });
  } catch (err) {
    console.error("saveSettings error:", err);
    res.status(500).json({ message: "Server error saving settings." });
  }
};
