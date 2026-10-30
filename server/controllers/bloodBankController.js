const User            = require("../models/User");
const BloodBankStock  = require("../models/BloodBankStock");
const BloodRequest    = require("../models/BloodRequest");
const Notification    = require("../models/Notification");
const bcrypt          = require("bcryptjs");

/* ════════════════════════════════════════════
   GET /api/bloodbank/profile
════════════════════════════════════════════ */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ user });
  } catch (err) { res.status(500).json({ message: "Server error." }); }
};

/* ════════════════════════════════════════════
   GET /api/bloodbank/stats
   Dashboard summary
════════════════════════════════════════════ */
exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const allStock = await BloodBankStock.find({ bloodBank: req.user._id }).lean();

    const available = allStock.filter((s) => s.units > 0 && new Date(s.expiresOn) > now);
    const expired   = allStock.filter((s) => new Date(s.expiresOn) <= now);

    const totalUnits = available.reduce((s, r) => s + r.units, 0);
    const bloodGroups = [...new Set(available.map((s) => s.bloodGroup))].length;

    const requests = await BloodRequest.find({}).lean();
    const pendingReqs   = requests.filter((r) => r.status === "open" || r.status === "partially_filled").length;
    const completedReqs = requests.filter((r) => r.status === "fulfilled").length;

    const unreadNotifs = await Notification.countDocuments({
      recipient: req.user._id, read: false, deleted: false,
    });

    res.json({
      totalUnits,
      bloodGroups,
      availableStockCount: available.length,
      expiredStockCount:   expired.length,
      pendingRequests:     pendingReqs,
      completedRequests:   completedReqs,
      unreadNotifs,
    });
  } catch (err) {
    console.error("bloodbank getStats:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   GET /api/bloodbank/stock
   All stock for this blood bank
════════════════════════════════════════════ */
exports.getStock = async (req, res) => {
  try {
    const stock = await BloodBankStock.find({ bloodBank: req.user._id }).sort({ bloodGroup: 1 });
    res.json({ stock });
  } catch (err) { res.status(500).json({ message: "Server error." }); }
};

/* ════════════════════════════════════════════
   POST /api/bloodbank/stock
   Add a new stock entry
   Body: { bloodGroup, units, pricePerUnit, collectedOn, expiresOn }
════════════════════════════════════════════ */
exports.addStock = async (req, res) => {
  try {
    const { bloodGroup, units, pricePerUnit, collectedOn, expiresOn } = req.body;

    if (!bloodGroup)    return res.status(400).json({ message: "Blood group is required." });
    if (units < 0)      return res.status(400).json({ message: "Units cannot be negative." });
    if (pricePerUnit < 0) return res.status(400).json({ message: "Price cannot be negative." });
    if (!expiresOn)     return res.status(400).json({ message: "Expiry date is required." });

    const expiry = new Date(expiresOn);
    if (isNaN(expiry.getTime())) return res.status(400).json({ message: "Invalid expiry date." });
    if (expiry <= new Date())    return res.status(400).json({ message: "Expiry date must be in the future." });

    const record = await BloodBankStock.create({
      bloodBank:    req.user._id,
      bloodGroup,
      units:        Number(units),
      pricePerUnit: Number(pricePerUnit),
      collectedOn:  collectedOn ? new Date(collectedOn) : null,
      expiresOn:    expiry,
    });
    res.status(201).json({ record, message: "Stock added." });
  } catch (err) {
    res.status(500).json({ message: "Server error adding stock." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/bloodbank/stock/:id
   Update units and/or price
════════════════════════════════════════════ */
exports.updateStock = async (req, res) => {
  try {
    const { units, pricePerUnit } = req.body;
    const update = {};
    if (units !== undefined) {
      if (Number(units) < 0) return res.status(400).json({ message: "Units cannot be negative." });
      update.units = Number(units);
    }
    if (pricePerUnit !== undefined) {
      if (Number(pricePerUnit) < 0) return res.status(400).json({ message: "Price cannot be negative." });
      update.pricePerUnit = Number(pricePerUnit);
    }

    const record = await BloodBankStock.findOneAndUpdate(
      { _id: req.params.id, bloodBank: req.user._id },
      { $set: update },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: "Stock record not found." });
    res.json({ record, message: "Stock updated." });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   DELETE /api/bloodbank/stock/:id
════════════════════════════════════════════ */
exports.deleteStock = async (req, res) => {
  try {
    const record = await BloodBankStock.findOneAndDelete({ _id: req.params.id, bloodBank: req.user._id });
    if (!record) return res.status(404).json({ message: "Stock record not found." });
    res.json({ message: "Stock removed." });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   GET /api/bloodbank/requests
   All open blood requests (from hospitals + patients)
   Blood banks view these to decide which to fulfill.
════════════════════════════════════════════ */
exports.getRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    const requests = await BloodRequest.find(filter)
      .populate("postedBy", "name role")
      .sort({ createdAt: -1 })
      .lean();

    const ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    requests.sort((a, b) => (ORDER[a.urgency] ?? 9) - (ORDER[b.urgency] ?? 9));

    res.json({ requests, total: requests.length });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/bloodbank/requests/:id/fulfill
   Blood bank marks a request as fulfilled.
   Body: { stockId } — which stock record to deduct from
   Only deducts stock WHEN actually fulfilled, not on accept.
════════════════════════════════════════════ */
exports.fulfillRequest = async (req, res) => {
  try {
    const { stockId } = req.body;

    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found." });
    if (request.status === "fulfilled") return res.status(400).json({ message: "Already fulfilled." });
    if (request.status === "cancelled") return res.status(400).json({ message: "Request was cancelled." });

    /* Deduct from stock if a stockId is provided */
    if (stockId) {
      const stock = await BloodBankStock.findOne({ _id: stockId, bloodBank: req.user._id });
      if (!stock) return res.status(404).json({ message: "Stock record not found." });
      if (stock.bloodGroup !== request.bloodGroup)
        return res.status(400).json({ message: `Stock blood group (${stock.bloodGroup}) does not match request (${request.bloodGroup}).` });
      if (stock.units < request.unitsNeeded)
        return res.status(400).json({ message: `Insufficient stock. Available: ${stock.units}, needed: ${request.unitsNeeded}.` });
      if (new Date(stock.expiresOn) <= new Date())
        return res.status(400).json({ message: "This stock has expired and cannot be used." });

      stock.units -= request.unitsNeeded;
      await stock.save();
    }

    request.status      = "fulfilled";
    request.unitsFilled = request.unitsNeeded;
    await request.save();

    /* Notify the requester */
    await Notification.create({
      recipient: request.postedBy,
      type:      "request",
      title:     "Blood Request Fulfilled",
      message:   `Your ${request.bloodGroup} blood request (${request.unitsNeeded} units) has been fulfilled by a blood bank.`,
      refModel:  "BloodRequest",
      refId:     request._id,
    });

    res.json({ request, message: "Request marked as fulfilled." });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/bloodbank/requests/:id/cancel
   Blood bank cancels/rejects a request it cannot fulfill.
════════════════════════════════════════════ */
exports.cancelRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found." });
    if (request.status === "fulfilled") return res.status(400).json({ message: "Cannot cancel a fulfilled request." });
    if (request.status === "cancelled") return res.status(400).json({ message: "Already cancelled." });

    request.status = "cancelled";
    await request.save();
    res.json({ request, message: "Request cancelled." });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid ID." });
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   NOTIFICATIONS
════════════════════════════════════════════ */
exports.getNotifications = async (req, res) => {
  try {
    const { filter = "all" } = req.query;
    const query = { recipient: req.user._id, deleted: false };
    if (filter === "unread") query.read = false;

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).lean();
    const unreadCount   = await Notification.countDocuments({ recipient: req.user._id, read: false, deleted: false });
    res.json({ notifications, total: notifications.length, unreadCount });
  } catch (err) { res.status(500).json({ message: "Server error." }); }
};

exports.markNotifRead = async (req, res) => {
  try {
    const n = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }, { new: true }
    );
    if (!n) return res.status(404).json({ message: "Notification not found." });
    res.json({ notification: n });
  } catch (err) { res.status(500).json({ message: "Server error." }); }
};

exports.markAllNotifsRead = async (req, res) => {
  try {
    const r = await Notification.updateMany(
      { recipient: req.user._id, read: false, deleted: false }, { read: true }
    );
    res.json({ message: "All marked as read.", updated: r.modifiedCount });
  } catch (err) { res.status(500).json({ message: "Server error." }); }
};

/* ════════════════════════════════════════════
   PATCH /api/bloodbank/change-password
════════════════════════════════════════════ */
exports.changePassword = async (req, res) => {
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
    if (same) return res.status(400).json({ message: "New password must differ from the current one." });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password updated successfully." });
  } catch (err) { res.status(500).json({ message: "Server error." }); }
};
