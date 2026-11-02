import { useState, useEffect } from "react";
import "./css/dashboard.css";
import "./css/cards.css";

import DashboardCard    from "./components/DashboardCard";
import HospitalCard     from "./components/HospitalCard";
import BloodGroupCard   from "./components/BloodGroupCard";
import NotificationCard from "./components/NotificationCard";
import { patientApi }   from "../../services/api";
import { useAuth }      from "../../context/AuthContext";

const Dashboard = ({ onNavigate }) => {
  const { user }  = useAuth();
  const [stats,   setStats]   = useState({ hospitals: 0, openRequests: 0, unreadNotifs: 0 });
  const [hospitals,     setHospitals]     = useState([]);
  const [bloodGroups,   setBloodGroups]   = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      patientApi.getStats(),
      patientApi.getHospitals(),
      patientApi.getBloodAvailability(),
      patientApi.getNotifications(),
    ]).then(([s, h, b, n]) => {
      setStats(s);
      setHospitals((h.hospitals || []).slice(0, 3));
      setBloodGroups(b.bloodAvailability || []);
      setNotifications((n.notifications || []).slice(0, 3));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const displayName = user?.name ? user.name.split(" ")[0] : "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    { icon: "🏥", label: "Nearby Hospitals",    value: String(stats.hospitals    ?? 0), colorClass: "blue"  },
    { icon: "🩸", label: "My Blood Requests",   value: String(stats.openRequests ?? 0), colorClass: "red"   },
    { icon: "🔔", label: "Unread Notifications",value: String(stats.unreadNotifs ?? 0), colorClass: "green" },
  ];

  if (loading) return (
    <div className="page-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", color: "#94A3B8" }}>Loading…</div>
    </div>
  );

  return (
    <div className="page-body">
      {/* ── Welcome header ── */}
      <div className="page-header animate-fade-up">
        <h1>{greeting}, {displayName} 👋</h1>
        <p>Here's your health overview for today.</p>
      </div>

      {/* ── Stat cards (3 columns) ── */}
      <div className="stat-cards" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {statCards.map((c, i) => (
          <DashboardCard key={c.label} {...c} delay={i * 0.08} />
        ))}
      </div>

      {/* ── Emergency assistance ── */}
      <div
        style={{
          background: "linear-gradient(135deg, #991B1B 0%, #EF4444 100%)",
          borderRadius: 16,
          padding: "24px 28px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          boxShadow: "0 4px 20px rgba(239,68,68,0.28)",
          animation: "fadeInUp 0.5s ease 0.15s both",
        }}
      >
        <div style={{ color: "#fff" }}>
          <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.8, marginBottom: 4 }}>
            🚨 EMERGENCY
          </p>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: 4 }}>
            Need immediate help?
          </h2>
          <p style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            Request emergency healthcare assistance through MediLink.
          </p>
        </div>
        <button
          onClick={() => onNavigate?.("emergency")}
          style={{
            background: "#fff",
            color: "#EF4444",
            border: "none",
            padding: "12px 28px",
            borderRadius: 50,
            fontWeight: 800,
            fontSize: "0.875rem",
            letterSpacing: "0.5px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          REQUEST HELP
        </button>
      </div>

      {/* ── Hospitals + Blood ── */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        {/* Nearby hospitals */}
        <div className="section-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>🏥 Nearby Hospitals</h2>
            <button
              onClick={() => onNavigate?.("hospitals")}
              style={{ fontSize: "0.78rem", color: "#2563EB", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              View all →
            </button>
          </div>
          {hospitals.length === 0 ? (
            <p style={{ color: "#94A3B8", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
              No approved hospitals found.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {hospitals.map((h) => (
                <div
                  key={h._id}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 12,
                    background: "#F8FAFC", border: "1px solid #E2E8F0",
                    cursor: "pointer", transition: "background 0.18s",
                  }}
                  onClick={() => onNavigate?.("hospitals")}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "#EFF6FF", color: "#2563EB",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.1rem", flexShrink: 0,
                  }}>
                    🏥
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {h.name}
                    </p>
                    {(h.city || h.state) && (
                      <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>
                        📍 {[h.city, h.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 600, padding: "3px 10px",
                    borderRadius: 20, background: "#F0FDF4", color: "#16A34A", flexShrink: 0,
                  }}>
                    Approved
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blood availability */}
        <div className="section-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>🩸 Blood Availability</h2>
            <button
              onClick={() => onNavigate?.("blood-search")}
              style={{ fontSize: "0.78rem", color: "#2563EB", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              Search →
            </button>
          </div>
          <div className="blood-grid">
            {bloodGroups.length > 0
              ? bloodGroups.map((b) => (
                  <BloodGroupCard key={b.type} type={b.type} status={b.status} />
                ))
              : ["A+","A-","B+","B-","O+","O-","AB+","AB-"].map((g) => (
                  <BloodGroupCard key={g} type={g} status="unavailable" />
                ))
            }
          </div>
        </div>
      </div>

      {/* ── Notifications + Profile ── */}
      <div className="dashboard-grid" style={{ marginBottom: 24 }}>
        {/* Notifications */}
        <div className="section-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 className="section-title" style={{ marginBottom: 0 }}>🔔 Recent Notifications</h2>
            <button
              onClick={() => onNavigate?.("notifications")}
              style={{ fontSize: "0.78rem", color: "#2563EB", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              View all →
            </button>
          </div>
          {notifications.length === 0 ? (
            <p style={{ color: "#94A3B8", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
              No notifications yet.
            </p>
          ) : (
            <div className="notification-list">
              {notifications.map((n, i) => (
                <NotificationCard
                  key={n._id}
                  message={n.message || n.title}
                  time={new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  color={n.read ? "blue" : "red"}
                  delay={i * 0.1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Profile mini-card */}
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.name ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "P"}
          </div>
          <h3>{user?.name || "—"}</h3>
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
          <button
            onClick={() => onNavigate?.("profile")}
            style={{
              marginTop: 16, width: "100%", padding: "9px",
              borderRadius: 10, border: "1.5px solid #E2E8F0",
              background: "#fff", color: "#2563EB", fontWeight: 600,
              fontSize: "0.82rem", cursor: "pointer",
            }}
          >
            Edit Profile →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
