const User = require("../models/User");

/* GET /api/donor/profile — donor reads own profile */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

/* PATCH /api/donor/profile — donor updates own profile */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, city, bloodGroup } = req.body;
    const update = {};
    if (name)       update.name       = name;
    if (phone)      update.phone      = phone;
    if (city)       update.city       = city;
    if (bloodGroup) update.bloodGroup = bloodGroup;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error updating profile." });
  }
};
