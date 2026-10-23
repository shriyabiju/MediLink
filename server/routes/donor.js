const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");

const profileCtrl      = require("../controllers/donorController");
const donationCtrl     = require("../controllers/donationController");
const bloodReqCtrl     = require("../controllers/bloodRequestController");
const notifCtrl        = require("../controllers/notificationController");

/* Every route in this file requires a valid JWT and role="donor" */
router.use(protect, requireRole("donor"));

/* ── Profile ── */
router.get  ("/profile", profileCtrl.getProfile);
router.patch("/profile", profileCtrl.updateProfile);

/* ── Password change ── */
router.post("/change-password", profileCtrl.changePassword);

/* ── Settings ── */
router.get  ("/settings", profileCtrl.getSettings);
router.patch("/settings", profileCtrl.saveSettings);

/* ── Donations ── */
router.post  ("/donations",             donationCtrl.createDonation);
router.get   ("/donations",             donationCtrl.getMyDonations);
router.get   ("/donations/:id",         donationCtrl.getDonationById);
router.patch ("/donations/:id/cancel",  donationCtrl.cancelDonation);

/* ── Dashboard stats (real DB aggregation) ── */
router.get("/dashboard", bloodReqCtrl.getDashboardStats);

/* ── Blood requests (read + respond) ── */
router.get  ("/blood-requests",               bloodReqCtrl.getBloodRequests);
router.post ("/blood-requests/:id/respond",   bloodReqCtrl.respondToRequest);

/* ── Notifications ── */
router.get   ("/notifications",             notifCtrl.getNotifications);
router.patch ("/notifications/read-all",    notifCtrl.markAllRead);
router.patch ("/notifications/:id/read",    notifCtrl.markRead);
router.delete("/notifications/:id",        notifCtrl.deleteNotification);

module.exports = router;
