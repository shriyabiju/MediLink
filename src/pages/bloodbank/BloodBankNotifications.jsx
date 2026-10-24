import { useState, useEffect, useCallback } from "react";
import { Bell, CheckCircle, Trash2 } from "lucide-react";
import { bloodBankApi } from "../../services/api";

export default function BloodBankNotifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [unread,  setUnread]  = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");

  const fetchNotifs = useCallback(() => {
    setLoading(true);
    bloodBankApi.getNotifications(filter)
      .then((d) => { setNotifs(d.notifications); setUnread(d.unreadCount); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markRead = async (id) => { await bloodBankApi.markRead(id).catch(() => {}); fetchNotifs(); };
  const markAllRead = async () => { await bloodBankApi.markAllRead().catch(() => {}); fetchNotifs(); };

  const typeColors = { request: "#DBEAFE", donation: "#D1FAE5", system: "#F1F5F9", verified: "#ECFDF5", eligible: "#FEF3C7", appointment: "#EDE9FE" };
  const typeIcons  = { request: "🩸", donation: "💉", system: "🔔", verified: "✔️", eligible: "✅", appointment: "📅" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0F172A", fontFamily: "Poppins, sans-serif" }}>Notifications {unread > 0 && <span style={{ fontSize: "0.9rem", color: "#2563EB" }}>({unread} unread)</span>}</h1>
          <p style={{ color: "#64748B", fontSize: "0.85rem" }}>Your recent alerts and updates</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {["all", "unread"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 16px", borderRadius: 20, border: "1.5px solid", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", borderColor: filter === f ? "#2563EB" : "#E2E8F0", background: filter === f ? "#EFF6FF" : "#fff", color: filter === f ? "#2563EB" : "#64748B" }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
          <button onClick={markAllRead} style={{ padding: "6px 16px", borderRadius: 20, border: "1.5px solid #E2E8F0", background: "#fff", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", color: "#64748B" }}>Mark all read</button>
        </div>
      </div>

      {loading ? <p style={{ textAlign: "center", color: "#94A3B8" }}>Loading…</p> : notifs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}><Bell size={28} style={{ marginBottom: 10, color: "#CBD5E1" }} /><p>No notifications {filter === "unread" ? "unread" : "yet"}.</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifs.map((n) => {
            const bg = typeColors[n.type] || "#F1F5F9";
            const icon = typeIcons[n.type] || "🔔";
            return (
              <div key={n._id} onClick={() => !n.read && markRead(n._id)} style={{ display: "flex", alignItems: "flex-start", gap: 14, background: n.read ? "#fff" : bg, border: `1.5px solid ${n.read ? "#E2E8F0" : "#BFDBFE"}`, borderRadius: 12, padding: "14px 16px", cursor: n.read ? "default" : "pointer" }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: n.read ? 500 : 700, color: "#0F172A", fontSize: "0.875rem", marginBottom: 3 }}>{n.title}</p>
                  <p style={{ color: "#64748B", fontSize: "0.8rem", lineHeight: 1.5 }}>{n.message}</p>
                  <p style={{ color: "#94A3B8", fontSize: "0.7rem", marginTop: 5 }}>{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#2563EB", flexShrink: 0, marginTop: 4 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
