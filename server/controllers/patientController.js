
const PatientRequest = require("../models/PatientRequest");

// POST /api/patient/requests
// Create a blood or medicine request.
exports.createRequest = async (req, res) => {
  try {
    const {
      requestType,
      bloodGroup,
      medicineName,
      quantity,
      unit,
      urgency,
      city,
      address,
      contactPhone,
    } = req.body;

    if (!requestType || quantity == null || !unit || !city || !contactPhone) {
      return res.status(400).json({
        message: "Request type, quantity, unit, city, and contact phone are required.",
      });
    }

    if (!Number.isFinite(Number(quantity)) || Number(quantity) < 1) {
      return res.status(400).json({
        message: "Quantity must be a number greater than or equal to 1.",
      });
    }

    const request = await PatientRequest.create({
      patient: req.user._id,
      requestType,
      bloodGroup: requestType === "blood" ? bloodGroup : null,
      medicineName: requestType === "medicine" ? medicineName : null,
      quantity: Number(quantity),
      unit,
      urgency: urgency || "normal",
      city,
      address: address || "",
      contactPhone,
    });

    return res.status(201).json({
      message: "Patient request created successfully.",
      request,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }

    console.error("createRequest error:", err);
    return res.status(500).json({
      message: "Server error while creating patient request.",
    });
  }
};

// GET /api/patient/requests
// List only the logged-in patient's requests.
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await PatientRequest.find({
      patient: req.user._id,
    }).sort({ createdAt: -1 });

    return res.json({ requests });
  } catch (err) {
    console.error("getMyRequests error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// GET /api/patient/requests/:id
// Read one of the logged-in patient's requests.
exports.getRequestById = async (req, res) => {
  try {
    const request = await PatientRequest.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found.",
      });
    }

    return res.json({ request });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid request ID." });
    }

    console.error("getRequestById error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};

// PATCH /api/patient/requests/:id/cancel
// Patients may cancel only their own pending requests.
exports.cancelRequest = async (req, res) => {
  try {
    const request = await PatientRequest.findOne({
      _id: req.params.id,
      patient: req.user._id,
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found.",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "Only pending requests can be cancelled.",
      });
    }

    request.status = "cancelled";
    await request.save();

    return res.json({
      message: "Request cancelled successfully.",
      request,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid request ID." });
    }

    console.error("cancelRequest error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
