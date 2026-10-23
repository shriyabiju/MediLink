const User = require("../models/User");

/* ════════════════════════════════════════════
   GET /api/donor/profile
   Returns the logged-in donor's full profile.
   Protected: requires valid JWT + role="donor".
════════════════════════════════════════════ */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "Donor not found." });
    res.json({ user });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Server error fetching profile." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/donor/profile
   Updates permitted donor profile fields.
   A donor can only edit their own profile
   (enforced because we use req.user._id, not a param).
   Protected: requires valid JWT + role="donor".

   Permitted fields:
     name, phone, city, state, address,
     bloodGroup, dob, weight, occupation,
     emergencyContact, emergencyName

   Fields the donor CANNOT change via this endpoint:
     email, role, password, donorStatus, isActive
════════════════════════════════════════════ */
exports.updateProfile = async (req, res) => {
  try {
    const ALLOWED = [
      "name", "phone", "city", "state", "address",
      "bloodGroup", "dob", "weight", "occupation",
      "emergencyContact", "emergencyName",
    ];

    /* Build update object from only the allowed keys that were sent */
    const update = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) {
        /* Trim strings, store empty string as null so Mongo stays clean */
        const val = typeof req.body[key] === "string"
          ? req.body[key].trim()
          : req.body[key];
        update[key] = val === "" ? null : val;
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "No updatable fields provided." });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "Donor not found." });

    res.json({ user, message: "Profile updated successfully." });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: "Server error updating profile." });
  }
};
