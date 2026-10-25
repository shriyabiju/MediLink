const jwt      = require("jsonwebtoken");
const User     = require("../models/User");
const Hospital = require("../models/Hospital");

/* ── Helper: sign JWT ── */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/* ── Helper: send auth response ── */
const sendAuth = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    token,
    user: {
      _id:            user._id,
      name:           user.name,
      email:          user.email,
      role:           user.role,
      approvalStatus: user.approvalStatus,
      donorStatus:    user.donorStatus,
      hospitalRef:    user.hospitalRef,
    },
  });
};

/* ════════════════════════════════════════════
   POST /api/auth/register
   Body: { name, email, password, role, ...extra }
════════════════════════════════════════════ */
exports.register = async (req, res) => {
  try {
    const {
      name, email, password, role,
      /* Hospital extra fields */
      hospitalName,
      phone, address, city, state,
      hospitalType, registrationNumber, totalBeds,
      /* Registration document (base64) for hospital & blood bank */
      registrationDocument,
    } = req.body;

    /* Validate required */
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required." });
    }

    /* Prevent registering as admin via public signup */
    if (role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be self-registered." });
    }

    const valid = ["patient", "donor", "hospital", "bloodbank"];
    if (!valid.includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    /* Check duplicate email */
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    /* Create the User document */
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      phone: phone || undefined,
      city:  city  || undefined,
    };

    /* Hospital and donor get pending status automatically via schema defaults */
    const user = await User.create(userData);

    /* Save registration document if provided (hospital + blood bank) */
    if ((role === "hospital" || role === "bloodbank") && registrationDocument) {
      user.registrationDocument = {
        data:        registrationDocument.data,
        fileName:    registrationDocument.fileName,
        contentType: registrationDocument.contentType || "application/pdf",
        uploadedAt:  new Date(),
      };
      await user.save();
    }

    /* If hospital, also create a Hospital document */
    if (role === "hospital") {
      const hospital = await Hospital.create({
        user:               user._id,
        name:               (hospitalName || name).trim(),  // prefer explicit hospital name
        email:              email.toLowerCase().trim(),
        phone:              phone              || "",
        address:            address            || "",
        city:               city               || "",
        state:              state              || "",
        hospitalType:       hospitalType       || "Other",
        registrationNumber: registrationNumber || "",
        totalBeds:          Number(totalBeds)  || 0,
        approvalStatus:     "pending",
      });

      /* Save hospital reference on the User document */
      user.hospitalRef = hospital._id;
      await user.save();
    }

    /* Hospital accounts must be approved before they can use the system;
       respond with 201 but don't issue a token so they can't auto-login */
    if (role === "hospital") {
      return res.status(201).json({
        message:
          "Registration successful. Your hospital account is pending admin approval. " +
          "You will be able to log in once an administrator reviews your application.",
        approvalStatus: "pending",
      });
    }

    /* Blood Bank: same approval flow as hospital */
    if (role === "bloodbank") {
      return res.status(201).json({
        message:
          "Registration successful. Your Blood Bank account is pending admin approval. " +
          "You will be able to log in once an administrator reviews your application.",
        approvalStatus: "pending",
      });
    }

    /* Donors: registered but require approval per system requirements */
    if (role === "donor") {
      /* Issue a token but donorStatus is 'pending' — frontend can surface this */
      return sendAuth(user, 201, res);
    }

    /* Patients: immediate access */
    sendAuth(user, 201, res);
  } catch (err) {
    console.error("register error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
};

/* ════════════════════════════════════════════
   POST /api/auth/login
   Body: { email, password, role }
   The role must match the account's registered role.
════════════════════════════════════════════ */
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    /* Find user */
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    /* Check password */
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    /* ── Verify selected role matches the account's role ──
       The user must pick the role that matches their registered account.
       This prevents a patient, for example, from logging in as a hospital. */
    if (role && user.role !== role) {
      return res.status(403).json({
        message: "The selected role does not match your account.",
        code:   "ROLE_MISMATCH",
      });
    }

    /* ── Hospital approval gate ── */
    if (user.role === "hospital") {
      if (user.approvalStatus === "pending") {
        return res.status(403).json({
          message:
            "Your hospital account is pending admin approval. " +
            "You will receive a notification once reviewed.",
          code: "HOSPITAL_PENDING",
        });
      }
      if (user.approvalStatus === "rejected") {
        return res.status(403).json({
          message:
            "Your hospital registration was not approved by the administrator. " +
            "Please contact MediLink support for assistance.",
          code: "HOSPITAL_REJECTED",
        });
      }
    }

    /* ── Blood Bank approval gate ── */
    if (user.role === "bloodbank") {
      if (user.approvalStatus === "pending") {
        return res.status(403).json({
          message: "Your Blood Bank account is pending admin approval.",
          code: "BLOODBANK_PENDING",
        });
      }
      if (user.approvalStatus === "rejected") {
        return res.status(403).json({
          message: "Your Blood Bank registration was not approved.",
          code: "BLOODBANK_REJECTED",
        });
      }
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been deactivated." });
    }

    sendAuth(user, 200, res);
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Server error during login." });
  }
};

/* ════════════════════════════════════════════
   GET /api/auth/me  (protected)
════════════════════════════════════════════ */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("hospitalRef");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};
