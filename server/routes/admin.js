const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/adminController");

/* Every admin route is protected and requires the 'admin' role */
router.use(protect, requireRole("admin"));

/* ── Dashboard stats ── */
router.get("/stats", ctrl.getStats);

/* ── Hospital management ── */
router.get   ("/hospitals",             ctrl.getHospitals);
router.get   ("/hospitals/:id",         ctrl.getHospitalById);
router.patch ("/hospitals/:id/approve", ctrl.approveHospital);
router.patch ("/hospitals/:id/reject",  ctrl.rejectHospital);

/* ── Donor management ── */
router.get   ("/donors",                ctrl.getDonors);
router.get   ("/donors/:id",            ctrl.getDonorById);
router.patch ("/donors/:id/approve",    ctrl.approveDonor);
router.patch ("/donors/:id/reject",     ctrl.rejectDonor);

/* ── User management ── */
router.get   ("/users",                 ctrl.getUsers);
router.patch ("/users/:id/deactivate",  ctrl.deactivateUser);
router.patch ("/users/:id/reactivate",  ctrl.reactivateUser);

module.exports = router;

/* ── Blood request oversight ── */
router.get   ("/blood-requests",                  ctrl.getBloodRequests);
router.patch ("/blood-requests/:id/status",       ctrl.updateBloodRequestStatus);

/* ── Blood bank management ── */
router.get   ("/bloodbanks",            ctrl.getBloodBanks);
router.patch ("/bloodbanks/:id/approve", ctrl.approveBloodBank);
router.patch ("/bloodbanks/:id/reject",  ctrl.rejectBloodBank);
