import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, Droplets, CalendarCheck, CheckCircle,
  Shield, Check, AlertCircle, RefreshCw,
} from "lucide-react";
import { donorApi } from "../../services/api";
import "./css/donor.css";

/* ── Icon + colour per notification type ── */
const TYPE_META = {
  request:     { Icon: Droplets,      color: "#EF4444", bg: "#FEE2E2" },
  appointment: { Icon: CalendarCheck, color: "#F59E0B", bg: "#FEF3C7" },
  eligible:    { Icon: CheckCircle,   color: "#10B981", bg: "#D1FAE5" },
  verified:    { Icon: Shield,        color: "#2563EB", bg: "#DBEAFE" },
  donation:    { Icon: Bell,          color: "#8B5CF6", bg: "#EDE9FE" },
  system:      { Icon: Bell,          color: "#64748B", bg: "#F1F5F9" },
};

/* ── Relative time label ── */
function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7)  return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { dateStyle: "medium" });
}

export default function DonorNotifications() {
  const [notifs,    setNotifs]    = useState([]);
  const [filter,    setFilter]    = useState("all");
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [unreadCount, setUnread]  = useState(0);

  /* ── Fetch from backend ── */
  const fetchNotifs = useCallback((activeFilter = filter) => {
    setLoading(true);
    setError("");
    donorApi.getNotifications(activeFilter)
      .then(({ notifications, unreadCount: u }) => {
        setNotifs(notifications);
        setUnread(u);
      })
      .catch((err) => setError(err.message || "Failed to load notifications."))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchNotifs(filter); }, [filter]);

  /* ── Mark single as read (optimistic update) ── */
  const handleMarkRead = async (id) => {
    setNotifs((p) =>
      p.map((n) => n._id === id ? { ...n, read: true } : n)
    );
    setUnread((u) => Math.max(0, u - 1));
    try {
      await donorApi.markRead(id);
    } catch {
      /* revert on error */
      fetchNotifs(filter);
    }
  };

  /* ── Mark all as read ── */
  const handleMarkAll = async () => {
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try {
      await donorApi.markAllRead();
    } catch {
      fetchNotifs(filter);
    }
  };

  /* ── Dismiss (soft-delete) ── */
  const handleDelete = async (id) => {
    const wasUnread = notifs.find((n) => n._id === id)?.read === false;
    setNotifs((p) => p.filter((n) => n._id !== id));
    if (wasUnread) setUnread((u) => Math.max(0, u - 1));
    try {
      await donorApi.deleteNotification(id);
    } catch {
      fetchNotifs(filter);
    }
  };

  const totalCount = notifs.length;

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>Notifications</h1>
          <p>
            {loading ? "Loading notifications…" :
             unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
              : "All caught up — no unread notifications."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {unreadCount > 0 && (
            <button className="dd-quick-btn dd-quick-btn--outline" onClick={handleMarkAll}>
              <Check size={15} /> Mark all as read
            </button>
          )}
          <button
            className="dd-quick-btn dd-quick-btn--outline"
            onClick={() => fetchNotifs(filter)}
            style={{ padding: "8px 12px" }}
            title="Refresh notifications"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── API error ── */}
      {error && !loading && (
        <div style={{
          background: "var(--danger-soft)", border: "1px solid var(--danger)",
          borderRadius: "var(--radius-sm)", padding: "12px 18px",
          marginBottom: "var(--space-5)", color: "#991B1B",
          fontSize: "var(--text-sm)", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div style={{
        display: "flex", gap: 8, marginBottom: "var(--space-5)",
        background: "var(--bg-alt)", borderRadius: "var(--radius-sm)",
        padding: 5, width: "fit-content",
      }}>
        {[
          { id: "all",    label: `All (${totalCount})` },
          { id: "unread", label: `Unread (${unreadCount})` },
          { id: "read",   label: "Read" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--radius-xs)",
              border: "none",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all var(--transition)",
              background: filter === t.id ? "var(--card)" : "transparent",
              color: filter === t.id ? "var(--primary-light)" : "var(--text-muted)",
              boxShadow: filter === t.id ? "var(--shadow-xs)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Loading skeleton ── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-sm)" }} />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && notifs.length === 0 && (
        <div className="dd-empty">
          <div className="dd-empty__icon"><Bell size={28} /></div>
          <h3>No notifications</h3>
          <p>
            {filter === "unread"
              ? "No unread notifications. You're all caught up!"
              : filter === "read"
              ? "No read notifications yet."
              : "No notifications yet. Submit a donation or respond to a blood request to receive one."}
          </p>
        </div>
      )}

      {/* ── Notification list ── */}
      {!loading && notifs.length > 0 && (
        <div className="dd-notif-list">
          <AnimatePresence>
            {notifs.map((n) => {
              const { Icon, color, bg } = TYPE_META[n.type] ?? TYPE_META.system;
              return (
                <motion.div
                  key={n._id}
                  className={`dd-notif-item ${n.read ? "" : "unread"}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => !n.read && handleMarkRead(n._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && !n.read)
                      handleMarkRead(n._id);
                  }}
                  aria-label={n.title}
                  style={{ cursor: n.read ? "default" : "pointer" }}
                >
                  <div className="dd-notif-icon" style={{ background: bg, color }}>
                    <Icon size={18} />
                  </div>

                  <div className="dd-notif-body">
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <span>{relativeTime(n.createdAt)}</span>
                  </div>

                  <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "flex-end", gap: 8, flexShrink: 0,
                  }}>
                    {!n.read && (
                      <div className="dd-notif-unread-dot" aria-label="Unread" />
                    )}
                    <button
                      style={{
                        background: "none", border: "none",
                        color: "var(--text-faint)", cursor: "pointer",
                        fontSize: ".85rem", padding: "2px 4px",
                        borderRadius: 4, lineHeight: 1,
                        transition: "color var(--transition)",
                      }}
                      onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                      aria-label="Dismiss notification"
                      title="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
