import { useState, useEffect } from "react";
import "./css/dashboard.css";
import "./css/cards.css";

import DashboardCard    from "./components/DashboardCard";
import EmergencyButton  from "./components/EmergencyButton";
import BloodGroupCard   from "./components/BloodGroupCard";
import NotificationCard from "./components/NotificationCard";
import { patientApi }   from "../../services/api";
import { useAuth }      from "../../context/AuthContext";

/* ── Relative time helper ── */
const relTime = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Yesterday" : `${d} days ago`;
};

const Dashboard = ({ onNavigate }) => {
  const { user } = useAuth();

  const [stats,         setStats]         = useState({ hospitals: 0, openRequests: 0, unreadNotifs: 0 });
  const [hospitals,     setHospitals]     = useState([]);
  const [bloodGroups,   setBloodGroups]   = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [sosState,      setSosState]      = useState("idle"); // idle | sending | sent | error
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    Promise.allSettled([
      patientApi.getStats(),
      patientApi.getHospitals(),
      patientApi.getBloodAvailability(),
      patientApi.getNotifications(),
    ]).then(([s, h, b, n]) => {
      if (s.status === "fulfilled") setStats(s.value);
      if (h.status === "fulfilled") setHospitals((h.value.hospitals || []).slice(0, 3));
      if (b.status === "fulfilled") setBloodGroups(b.value.bloodAvailability || []);
      if (n.status === "fulfilled") setNotifications((n.value.notifications || []).slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  const displayName = user?.name ? user.name.split(" ")[0] : "there";
  const hour        = new Date().getHours();
  const greeting    = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    { icon: "🏥", label: "Nearby Hospitals",    value: String(stats.hospitals    ?? 0), colorClass: "blue"  },
    { icon: "🩸", label: "My Blood Requests",   value: String(stats.openRequests  ?? 0), colorClass: "red"   },
    { icon: "🔔", label: "Unread Notifications",value: String(stats.unreadNotifs  ?? 0), colorClass: "green" },
  ];

  const handleSOS = async () => {
    if (sosState === "sending") return;
    setSosState("sending");
    try {
      await patientApi.submitEmergency({
        bloodGroup:  user?.bloodGroup || "O+",
        unitsNeeded: 1,
        urgency:     "Critical",
        notes:       "SOS triggered from patient dashboard",
      });
      setSosState("sent");
    } catch (_) {
      setSosState("error");
    }
    setTimeout(() => setSosState("idle"), 4000);
  };

  if (loading) {
    return (
      <div className="page-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className="page-body">

      {/* ── SOS sent banner ── */}
      {sosState === "sent" && (
        <div className="sos-alert-banner">
          🚨 Emergency request sent! Help is on the way.
        </div>
      )}
      {sosState === "error" && (
        <div className="sos-alert-banner sos-alert-banner--error">
          ⚠️ Could not send emergency request. Please call 112 immediately.
        </div>
      )}

      {/* ── Greeting ── */}
      <div className="page-header">
        <h1>{greeting}, {displayName} 👋</h1>
        <p>Here&apos;s your health overview for today.</p>
      </div>

      {/* ── 3 Stat cards ── */}
      <div className="stat-cards stat-cards--3col">
        {statCards.map((c, i) => (
          <DashboardCard key={c.label} {...c} delay={i * 0.08} />
        ))}
      </div>

      {/* ── Emergency SOS ── */}
      <EmergencyButton
        onRequest={handleSOS}
        sending={sosState === "sending"}
        sent={sosState === "sent"}
      />

      {/* ── Hospitals + Blood Availability ── */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>

        {/* Nearby Hospitals */}
        <div className="section-card">
          <div className="section-card__header">
            <h2 className="section-title">🏥 Nearby Hospitals</h2>
            <button
              className="section-link-btn"
              onClick={() => onNavigate?.("hospitals")}
            >
              View all →
            </button>
          </div>

          {hospitals.length === 0 ? (
            <p className="empty-state-text">No approved hospitals found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {hospitals.map((h) => (
                <div className="hosp-row" key={h._id}>
                  <div className="hosp-row__icon">🏥</div>
                  <div className="hosp-row__info">
                    <strong>{h.name}</strong>
                    {(h.city || h.state) && (
                      <span>📍 {[h.city, h.state].filter(Boolean).join(", ")}</span>
                    )}
                    {h.hospitalType && <span>🏷 {h.hospitalType}</span>}
                    {h.phone && <span>📞 {h.phone}</span>}
                  </div>
                  <button
                    className="btn-primary btn-sm"
                    onClick={() => onNavigate?.("hospitals")}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blood Availability */}
        <div className="section-card">
          <div className="section-card__header">
            <h2 className="section-title">🩸 Blood Availability</h2>
            <button
              className="section-link-btn"
              onClick={() => onNavigate?.("blood-search")}
            >
              Search →
            </button>
          </div>

          {bloodGroups.length === 0 ? (
            <p className="empty-state-text">No blood availability data.</p>
          ) : (
            <div className="blood-grid">
              {bloodGroups.map((b) => (
                <BloodGroupCard key={b.type} type={b.type} status={b.status} units={b.units} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Notifications + Profile mini-card ── */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>

        {/* Notifications */}
        <div className="section-card">
          <div className="section-card__header">
            <h2 className="section-title">🔔 Notifications</h2>
            <button
              className="section-link-btn"
              onClick={() => onNavigate?.("notifications")}
            >
              View all →
            </button>
          </div>

          {notifications.length === 0 ? (
            <p className="empty-state-text">No notifications yet.</p>
          ) : (
            <div className="notification-list">
              {notifications.map((n) => (
                <NotificationCard
                  key={n._id}
                  message={n.message || n.title}
                  time={relTime(n.createdAt)}
                  color={n.read ? "blue" : "red"}
                />
              ))}
            </div>
          )}
        </div>

        {/* Profile mini-card */}
        <div className="profile-card">
          <div className="profile-avatar">👤</div>
          <h3>{user?.name || "—"}</h3>
          <p style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>{user?.email || ""}</p>
          <div className="profile-details">
            <div className="profile-row">
              <span className="label">Blood Group</span>
              <span className="value" style={{ color: "#EF4444", fontWeight: 700 }}>
                {user?.bloodGroup || "Not set"}
              </span>
            </div>
            <div className="profile-row">
              <span className="label">Phone</span>
              <span className="value">{user?.phone || "Not set"}</span>
            </div>
            <div className="profile-row">
              <span className="label">City</span>
              <span className="value">{user?.city || "Not set"}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button
              className="btn-primary btn-sm"
              style={{ flex: 1 }}
              onClick={() => onNavigate?.("profile")}
            >
              Edit Profile
            </button>
            <button
              className="btn-outline btn-sm"
              style={{ flex: 1 }}
              onClick={() => onNavigate?.("my-requests")}
            >
              My Requests
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
