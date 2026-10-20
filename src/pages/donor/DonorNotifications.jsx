import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Droplets, CalendarCheck, CheckCircle, Shield, Check } from "lucide-react";
import { NOTIFICATIONS as INITIAL_NOTIFS } from "./data/sampleData";
import "./css/donor.css";

const TYPE_META = {
  request:     { Icon: Droplets,      color: "#EF4444", bg: "#FEE2E2" },
  appointment: { Icon: CalendarCheck, color: "#F59E0B", bg: "#FEF3C7" },
  eligible:    { Icon: CheckCircle,   color: "#10B981", bg: "#D1FAE5" },
  verified:    { Icon: Shield,        color: "#2563EB", bg: "#DBEAFE" },
  donation:    { Icon: Bell,          color: "#8B5CF6", bg: "#EDE9FE" },
};

export default function DonorNotifications() {
  const [notifs, setNotifs]     = useState(INITIAL_NOTIFS);
  const [filter, setFilter]     = useState("all"); // all | unread | read

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markRead    = (id) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAll     = ()   => setNotifs((p) => p.map((n) => ({ ...n, read: true })));
  const deleteNotif = (id) => setNotifs((p) => p.filter((n) => n.id !== id));

  const displayed = notifs.filter((n) =>
    filter === "all"    ? true :
    filter === "unread" ? !n.read :
    n.read
  );

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>Notifications</h1>
          <p>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
              : "All caught up — no unread notifications."}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="dd-quick-btn dd-quick-btn--outline" onClick={markAll}>
            <Check size={15} /> Mark all as read
          </button>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div
        style={{
          display: "flex", gap: 8, marginBottom: "var(--space-5)",
          background: "var(--bg-alt)", borderRadius: "var(--radius-sm)",
          padding: 5, width: "fit-content",
        }}
      >
        {[
          { id: "all",    label: `All (${notifs.length})` },
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

      {/* ── List ── */}
      {displayed.length === 0 ? (
        <div className="dd-empty">
          <div className="dd-empty__icon"><Bell size={28} /></div>
          <h3>No notifications</h3>
          <p>{filter === "unread" ? "No unread notifications." : "Nothing here yet."}</p>
        </div>
      ) : (
        <div className="dd-notif-list">
          <AnimatePresence>
            {displayed.map((n) => {
              const { Icon, color, bg } = TYPE_META[n.type] ?? TYPE_META.donation;
              return (
                <motion.div
                  key={n.id}
                  className={`dd-notif-item ${n.read ? "" : "unread"}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => markRead(n.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") markRead(n.id); }}
                  aria-label={n.title}
                >
                  <div className="dd-notif-icon" style={{ background: bg, color }}>
                    <Icon size={18} />
                  </div>
                  <div className="dd-notif-body">
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <span>{n.time}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    {!n.read && <div className="dd-notif-unread-dot" aria-label="Unread" />}
                    <button
                      style={{
                        background: "none", border: "none", color: "var(--text-faint)",
                        cursor: "pointer", fontSize: ".85rem", padding: "2px 4px",
                        borderRadius: 4, lineHeight: 1, transition: "color var(--transition)",
                      }}
                      onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }}
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
