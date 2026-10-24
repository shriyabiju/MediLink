const router = require("express").Router();
const { protect, requireRole, requireApproved } = require("../middleware/auth");
const ctrl = require("../controllers/bloodBankController");

/* Every route requires valid JWT + role=bloodbank + approved */
router.use(protect, requireRole("bloodbank"), requireApproved);

/* ── Profile ── */
router.get("/profile", ctrl.getProfile);

/* ── Dashboard stats ── */
router.get("/stats", ctrl.getStats);

/* ── Blood stock CRUD ── */
router.get   ("/stock",      ctrl.getStock);
router.post  ("/stock",      ctrl.addStock);
router.patch ("/stock/:id",  ctrl.updateStock);
router.delete("/stock/:id",  ctrl.deleteStock);

/* ── Blood requests ── */
router.get   ("/requests",                 ctrl.getRequests);
router.patch ("/requests/:id/fulfill",     ctrl.fulfillRequest);
router.patch ("/requests/:id/cancel",      ctrl.cancelRequest);

/* ── Notifications ── */
router.get   ("/notifications",          ctrl.getNotifications);
router.patch ("/notifications/read-all", ctrl.markAllNotifsRead);
router.patch ("/notifications/:id/read", ctrl.markNotifRead);

/* ── Settings ── */
router.post("/change-password", ctrl.changePassword);

module.exports = router;
