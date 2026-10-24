import { useState, useEffect } from "react";
import "./css/dashboard.css";
import "./css/cards.css";

import DashboardCard    from "./components/DashboardCard";
import EmergencyButton  from "./components/EmergencyButton";
import HospitalCard     from "./components/HospitalCard";
import BloodGroupCard   from "./components/BloodGroupCard";
import AppointmentCard  from "./components/AppointmentCard";
import NotificationCard from "./components/NotificationCard";
import SearchBar        from "./components/SearchBar";
import { patientApi }   from "../../services/api";
import { useAuth }      from "../../context/AuthContext";

const Dashboard = () => {
  const { user }  = useAuth();
  const [stats,   setStats]   = useState({ hospitals: 0, openRequests: 0, unreadNotifs: 0 });
  const [hospitals,   setHospitals]   = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [sosTriggered,  setSosTriggered]  = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      patientApi.getStats(),
      patientApi.getHospitals(),
      patientApi.getBloodAvailability(),
      patientApi.getNotifications(),
    ]).then(([s, h, b, n]) => {
      setStats(s);
      setHospitals(h.hospitals.slice(0, 3));
      setBloodGroups(b.bloodAvailability);
      setNotifications(n.notifications.slice(0, 3));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const displayName = user?.name ? user.name.split(" ")[0] : "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const statCards = [
    { icon: "🏥", label: "Nearby Hospitals",  value: String(stats.hospitals),    colorClass: "blue"   },
    { icon: "🩸", label: "Open Blood Requests", value: String(stats.openRequests), colorClass: "red"    },
    { icon: "🔔", label: "Unread Alerts",     value: String(stats.unreadNotifs), colorClass: "green"  },
  ];

  const handleSOS = async () => {
    setSosTriggered(true);
    try {
      await patientApi.submitEmergency({
        hospitalName: "Emergency SOS",
        bloodGroup:   user?.bloodGroup || "O+",
        unitsNeeded:  1,
        urgency:      "Critical",
        notes:        "SOS triggered from patient dashboard",
      });
    } catch (_) {}
    setTimeout(() => setSosTriggered(false), 3000);
  };

  if (loading) return (
    <div className="page-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ textAlign: "center", color: "#94A3B8" }}>Loading…</div>
    </div>
  );

  return (
    <div className="page-body">
      {sosTriggered && (
        <div style={{
          background: "#EF4444", color: "#fff", borderRadius: "12px",
          padding: "14px 20px", marginBottom: "20px", fontWeight: 600,
          animation: "fadeInUp 0.3s ease both",
        }}>
          🚨 Emergency request sent! Help is on the way.
        </div>
      )}

      <div className="page-header animate-fade-up">
        <h1>{greeting}, {displayName} 👋</h1>
        <p>Here&apos;s your health overview for today.</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards">
        {statCards.map((c, i) => (
          <DashboardCard key={c.label} {...c} delay={i * 0.08} />
        ))}
      </div>

      {/* SOS */}
      <EmergencyButton onRequest={handleSOS} />

      {/* Hospitals + Blood */}
      <div className="dashboard-grid" style={{ marginBottom: "24px" }}>
        <div className="section-card">
          <h2 className="section-title">🏥 Nearby Hospitals</h2>
          {hospitals.length === 0 ? (
            <p style={{ color: "#94A3B8", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
              No approved hospitals found.
            </p>
          ) : (
            <div className="hospital-cards" style={{ gridTemplateColumns: "1fr" }}>
              {hospitals.map((h, i) => (
                <HospitalCard
                  key={h._id}
                  name={h.name}
                  rating={4.5}
                  distance={null}
                  bedsAvailable={h.totalBeds > 0}
                  delay={i * 0.1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="section-card">
          <h2 className="section-title">🩸 Blood Availability</h2>
          <div className="blood-grid">
            {bloodGroups.map((b) => (
              <BloodGroupCard key={b.type} type={b.type} status={b.status} />
            ))}
          </div>
        </div>
      </div>

      {/* Notifications + Profile */}
      <div className="dashboard-grid" style={{ marginBottom: "24px" }}>
        <div className="section-card">
          <h2 className="section-title">🔔 Notifications</h2>
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
                  time={new Date(n.createdAt).toLocaleDateString()}
                  color={n.read ? "blue" : "red"}
                  delay={i * 0.1}
                />
              ))}
            </div>
          )}
        </div>

        <div className="profile-card">
          <div className="profile-avatar">👤</div>
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
