const router = require("express").Router();
const { protect, requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/donorController");

router.use(protect, requireRole("donor"));

router.get  ("/profile", ctrl.getProfile);
router.patch("/profile", ctrl.updateProfile);

module.exports = router;
