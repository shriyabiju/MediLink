
const router = require("express").Router();

const { protect, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/patientController");

// All routes below require an authenticated patient.
router.use(protect, requireRole("patient"));

// Create a blood or medicine request.
router.post("/requests", ctrl.createRequest);

// Get all requests belonging to the logged-in patient.
router.get("/requests", ctrl.getMyRequests);

// Get one request belonging to the logged-in patient.
router.get("/requests/:id", ctrl.getRequestById);

// Cancel a pending request belonging to the logged-in patient.
router.patch("/requests/:id/cancel", ctrl.cancelRequest);

module.exports = router;
