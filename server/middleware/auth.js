const jwt  = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect — verifies Bearer JWT and attaches req.user
 */
exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token — authorization denied." });
    }

    const token   = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User not found or deactivated." });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

/**
 * requireRole(...roles) — ensures req.user has one of the specified roles.
 * Must be called after protect().
 */
exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated." });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied. Requires role: ${roles.join(" or ")}.`,
    });
  }
  next();
};

/**
 * requireApproved — for hospital routes.
 * Hospitals must be approved to access their own dashboard APIs.
 */
exports.requireApproved = (req, res, next) => {
  if (req.user.role !== "hospital") return next();

  if (req.user.approvalStatus === "pending") {
    return res.status(403).json({
      message:
        "Your hospital account is pending admin approval. You will be notified once reviewed.",
      code: "HOSPITAL_PENDING",
    });
  }
  if (req.user.approvalStatus === "rejected") {
    return res.status(403).json({
      message:
        "Your hospital registration was not approved. Please contact MediLink support.",
      code: "HOSPITAL_REJECTED",
    });
  }
  next();
};
