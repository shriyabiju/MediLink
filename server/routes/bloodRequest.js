/**
 * Blood Request routes — shared resource
 *
 * POST /api/blood-requests         — hospital or admin posts a new request
 * GET  /api/blood-requests         — public read (any authenticated user)
 *
 * NOTE FOR HOSPITAL MODULE:
 *   The hospital EmergencyRequests.jsx should be wired to this router.
 *   Connect it by:
 *   1. Using POST /api/blood-requests to create requests.
 *   2. Using GET  /api/blood-requests to list them in the hospital dashboard.
 *   3. Adding PATCH /api/blood-requests/:id/status for hospital staff to
 *      update status (fulfilled / cancelled) — add to this file when ready.
 */
const router   = require("express").Router();
const { protect, requireRole, requireApproved } = require("../middleware/auth");
const ctrl = require("../controllers/bloodRequestController");

/* POST — only an approved hospital or admin can create a donor-visible blood request */
router.post(
  "/",
  protect,
  requireRole("hospital", "admin"),
  requireApproved,
  ctrl.createBloodRequest
);

/* GET — any authenticated user can list requests (donors, hospitals, admins) */
router.get("/", protect, ctrl.getBloodRequests);

module.exports = router;
