const Notification = require("../models/Notification");

/* ════════════════════════════════════════════
   GET /api/donor/notifications
   Returns all non-deleted notifications for the
   logged-in donor, sorted newest first.
   Query:  filter = all | unread | read
════════════════════════════════════════════ */
exports.getNotifications = async (req, res) => {
  try {
    const { filter = "all" } = req.query;

    const query = {
      recipient: req.user._id,
      deleted:   false,
    };
    if (filter === "unread") query.read = false;
    if (filter === "read")   query.read = true;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      deleted:   false,
      read:      false,
    });

    res.json({ notifications, total: notifications.length, unreadCount });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ message: "Server error fetching notifications." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/donor/notifications/:id/read
   Marks a single notification as read.
   Ownership enforced by filtering on recipient.
════════════════════════════════════════════ */
exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }
    res.json({ notification });
  } catch (err) {
    console.error("markRead error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   PATCH /api/donor/notifications/read-all
   Marks all unread notifications as read.
════════════════════════════════════════════ */
exports.markAllRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipient: req.user._id, read: false, deleted: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read.", updated: result.modifiedCount });
  } catch (err) {
    console.error("markAllRead error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   DELETE /api/donor/notifications/:id
   Soft-deletes a notification (sets deleted: true).
   Ownership enforced.
════════════════════════════════════════════ */
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { deleted: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }
    res.json({ message: "Notification dismissed." });
  } catch (err) {
    console.error("deleteNotification error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

/* ════════════════════════════════════════════
   Utility: createNotification (used internally
   by other controllers — not an HTTP handler)
════════════════════════════════════════════ */
exports.createNotification = async ({ recipient, type, title, message, refModel, refId }) => {
  try {
    return await Notification.create({
      recipient,
      type:    type     || "system",
      title:   title    || "Notification",
      message: message  || "",
      refModel: refModel || null,
      refId:    refId    || null,
    });
  } catch (err) {
    console.error("createNotification util error:", err);
    return null;
  }
};
