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

/* ── User management ── */
router.get   ("/users",                 ctrl.getUsers);
router.patch ("/users/:id/deactivate",  ctrl.deactivateUser);

/* ── Donor management ── */
router.get   ("/donors",                ctrl.getDonors);
router.patch ("/donors/:id/approve",    ctrl.approveDonor);
router.patch ("/donors/:id/reject",     ctrl.rejectDonor);

module.exports = router;
