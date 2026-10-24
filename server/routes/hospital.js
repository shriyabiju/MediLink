const router = require("express").Router();
const { protect, requireRole, requireApproved } = require("../middleware/auth");
const ctrl = require("../controllers/hospitalController");

/* All hospital routes require:
   1. valid JWT (protect)
   2. role = "hospital" (requireRole)
   3. approvalStatus = "approved" (requireApproved)
*/
router.use(protect, requireRole("hospital"), requireApproved);

/* ── Profile ── */
router.get  ("/profile", ctrl.getProfile);
router.patch("/profile", ctrl.updateProfile);

/* ── Dashboard stats ── */
router.get("/stats", ctrl.getDashboardStats);

/* ── Blood stock ── */
router.get  ("/blood-stock",         ctrl.getBloodStock);
router.post ("/blood-stock",         ctrl.upsertBloodStock);  // add or update by group
router.delete("/blood-stock/:id",    ctrl.deleteBloodStock);

/* ── Doctors ── */
router.get  ("/doctors",        ctrl.getDoctors);
router.post ("/doctors",        ctrl.createDoctor);
router.patch("/doctors/:id",    ctrl.updateDoctor);
router.delete("/doctors/:id",   ctrl.deleteDoctor);

/* ── Medicines ── */
router.get  ("/medicines",       ctrl.getMedicines);
router.post ("/medicines",       ctrl.createMedicine);
router.patch("/medicines/:id",   ctrl.updateMedicine);
router.delete("/medicines/:id",  ctrl.deleteMedicine);

/* ── Emergency requests (using shared BloodRequest model) ── */
router.get  ("/requests",            ctrl.getEmergencyRequests);
router.patch("/requests/:id/status", ctrl.updateRequestStatus);

/* ── Notifications ── */
router.get   ("/notifications",             ctrl.getNotifications);
router.patch ("/notifications/read-all",    ctrl.markAllNotifsRead);
router.patch ("/notifications/:id/read",    ctrl.markNotifRead);
router.delete("/notifications/:id",        ctrl.deleteNotif);

/* ── Settings ── */
router.post("/change-password", ctrl.changePassword);

/* ── Bed management ── */
router.get("/beds",  ctrl.getBeds);
router.put("/beds",  ctrl.updateBeds);

/* ── Reports (aggregated analytics) ── */
router.get("/reports", ctrl.getReports);

/* ── Other hospitals (directory view) ── */
router.get("/other-hospitals", ctrl.getOtherHospitals);

/* ── Donors list (read-only, safe fields) ── */
router.get("/donors", ctrl.getDonors);

/* ── All blood requests (platform-wide view) ── */
router.get("/all-requests", ctrl.getAllBloodRequests);

module.exports = router;
