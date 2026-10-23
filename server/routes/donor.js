const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");

const profileCtrl  = require("../controllers/donorController");
const donationCtrl = require("../controllers/donationController");

/* Every route in this file requires a valid JWT and role="donor" */
router.use(protect, requireRole("donor"));

/* ── Profile ── */
router.get  ("/profile", profileCtrl.getProfile);
router.patch("/profile", profileCtrl.updateProfile);

/* ── Donations ── */
router.post  ("/donations",             donationCtrl.createDonation);
router.get   ("/donations",             donationCtrl.getMyDonations);
router.get   ("/donations/:id",         donationCtrl.getDonationById);
router.patch ("/donations/:id/cancel",  donationCtrl.cancelDonation);

module.exports = router;
