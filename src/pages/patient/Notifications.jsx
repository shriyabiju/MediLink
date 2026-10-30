import { useState, useEffect, useCallback } from "react";
import { patientApi } from "../../services/api";

const Notifications = () => {
  const [notifs,  setNotifs]  = useState([]);
  const [unread,  setUnread]  = useState(0);
  const [filter,  setFilter]  = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchNotifs = useCallback(() => {
    setLoading(true);
    patientApi.getNotifications(filter)
      .then((d) => { setNotifs(d.notifications); setUnread(d.unreadCount); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markRead = async (id) => {
    await patientApi.markNotifRead(id).catch(() => {});
    fetchNotifs();
  };

  const typeColors = {
    request:     { bg: "#DBEAFE", icon: "🩸" },
    donation:    { bg: "#D1FAE5", icon: "💉" },
    appointment: { bg: "#EDE9FE", icon: "📅" },
    eligible:    { bg: "#FEF3C7", icon: "✅" },
    verified:    { bg: "#ECFDF5", icon: "✔️" },
    system:      { bg: "#F1F5F9", icon: "🔔" },
  };

  return (
    <div className="page-body">
      <div className="page-header animate-fade-up">
        <h1>🔔 Notifications {unread > 0 && <span style={{ fontSize: 14, color: "#2563EB" }}>({unread} unread)</span>}</h1>
        <p>Your recent alerts and updates.</p>
      </div>

      {/* Filter buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["all", "unread"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "8px 20px", borderRadius: 20, border: "1.5px solid",
            fontWeight: 600, fontSize: 13, cursor: "pointer",
            borderColor: filter === f ? "#2563EB" : "#E2E8F0",
            background:  filter === f ? "#EFF6FF" : "#fff",
            color:       filter === f ? "#2563EB" : "#64748B",
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#94A3B8" }}>Loading…</p>
      ) : notifs.length === 0 ? (
        <div className="section-card" style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔔</div>
          <p>No notifications {filter === "unread" ? "unread" : "yet"}.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifs.map((n) => {
            const style = typeColors[n.type] || typeColors.system;
            return (
              <div key={n._id} onClick={() => !n.read && markRead(n._id)} style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                background: n.read ? "#fff" : style.bg,
                border: "1.5px solid " + (n.read ? "#E2E8F0" : "#BFDBFE"),
                borderRadius: 12, padding: "14px 16px", cursor: n.read ? "default" : "pointer",
                transition: "box-shadow 0.2s",
              }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{style.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: n.read ? 500 : 700, color: "#1E293B", fontSize: 14, marginBottom: 3 }}>
                    {n.title}
                  </p>
                  <p style={{ color: "#64748B", fontSize: 13, lineHeight: 1.5 }}>{n.message}</p>
                  <p style={{ color: "#94A3B8", fontSize: 11, marginTop: 5 }}>
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#2563EB", flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
