const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* ════════════════════════════════════════════
   GET /api/donor/profile
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
════════════════════════════════════════════ */
exports.updateProfile = async (req, res) => {
  try {
    const ALLOWED = [
      "name", "phone", "city", "state", "address",
      "bloodGroup", "dob", "weight", "occupation",
      "emergencyContact", "emergencyName",
      "availability",
    ];

    const update = {};
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) {
        const val = typeof req.body[key] === "string"
          ? req.body[key].trim()
          : req.body[key];
        update[key] = val === "" ? null : val;
      }
    }

    /* ── Handle ID document upload (base64) ── */
    if (req.body.idDocument && typeof req.body.idDocument === "object") {
      const doc = req.body.idDocument;
      if (doc.data && doc.fileName) {
        update["idDocument.data"]        = doc.data;
        update["idDocument.fileName"]    = doc.fileName;
        update["idDocument.contentType"] = doc.contentType || "image/png";
        update["idDocument.uploadedAt"]  = new Date();
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "No updatable fields provided." });
    }

    /* ── If donor was rejected, editing profile resubmits for review ── */
    const currentUser = await User.findById(req.user._id).select("donorStatus");
    if (currentUser?.donorStatus === "rejected") {
      update.donorStatus    = "pending";
      update.rejectionReason = null;   // clear old reason on resubmit
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

/* ════════════════════════════════════════════
   POST /api/donor/change-password
   Body: { currentPassword, newPassword, confirmPassword }

   Security rules:
   - Requires the correct current password (re-authentication).
   - New password must be at least 8 characters.
   - New password must not be the same as the current one.
   - Password is hashed by the User model pre-save hook.
   - Donors can only change their own password (req.user._id).
════════════════════════════════════════════ */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    /* ── Input validation ── */
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Current password, new password, and confirmation are all required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match." });
    }

    /* Fetch the user WITH password so we can verify */
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "Donor not found." });

    /* Verify current password */
    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return res.status(401).json({ message: "Current password is incorrect." });
    }

    /* Reject if new password is identical to the current one */
    const same = await bcrypt.compare(newPassword, user.password);
    if (same) {
      return res.status(400).json({
        message: "New password must be different from the current password.",
      });
    }

    /* Save — the pre-save hook will hash it */
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ message: "Server error changing password." });
  }
};

/* ════════════════════════════════════════════
   GET /api/donor/settings
   Returns the donor's persisted settings object.
════════════════════════════════════════════ */
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("settings name email").lean();
    if (!user) return res.status(404).json({ message: "Donor not found." });

    /* Return stored settings or safe defaults */
    const defaults = {
      notifications: {
        bloodRequests: true,
        appointments:  true,
        eligibility:   true,
        weeklyDigest:  false,
        smsAlerts:     false,
        emailAlerts:   true,
      },
      privacy: {
        profileVisible: true,
        showBloodGroup: true,
        allowContact:   true,
      },
    };

    res.json({
      settings: user.settings ?? defaults,
      name:  user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("getSettings error:", err);
    res.status(500).json({ message: "Server error fetching settings." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/donor/settings
   Body: { notifications: {...}, privacy: {...} }
   Persists settings on the User document.
════════════════════════════════════════════ */
exports.saveSettings = async (req, res) => {
  try {
    const { notifications, privacy } = req.body;

    if (!notifications && !privacy) {
      return res.status(400).json({ message: "No settings provided." });
    }

    /* Build a safe, validated settings object — never trust raw input */
    const NOTIF_KEYS   = ["bloodRequests", "appointments", "eligibility", "weeklyDigest", "smsAlerts", "emailAlerts"];
    const PRIVACY_KEYS = ["profileVisible", "showBloodGroup", "allowContact"];

    const safeSettings = {};

    if (notifications && typeof notifications === "object") {
      safeSettings["settings.notifications"] = {};
      for (const k of NOTIF_KEYS) {
        if (typeof notifications[k] === "boolean") {
          safeSettings["settings.notifications"][k] = notifications[k];
        }
      }
    }

    if (privacy && typeof privacy === "object") {
      safeSettings["settings.privacy"] = {};
      for (const k of PRIVACY_KEYS) {
        if (typeof privacy[k] === "boolean") {
          safeSettings["settings.privacy"][k] = privacy[k];
        }
      }
    }

    await User.findByIdAndUpdate(req.user._id, { $set: safeSettings });

    res.json({ message: "Settings saved successfully." });
  } catch (err) {
    console.error("saveSettings error:", err);
    res.status(500).json({ message: "Server error saving settings." });
  }
};
