import { useState } from "react";
import "./css/dashboard.css";
import "./css/cards.css";

import DashboardCard    from "./components/DashboardCard";
import EmergencyButton  from "./components/EmergencyButton";
import HospitalCard     from "./components/HospitalCard";
import BloodGroupCard   from "./components/BloodGroupCard";
import AppointmentCard  from "./components/AppointmentCard";
import NotificationCard from "./components/NotificationCard";
import SearchBar        from "./components/SearchBar";

/* ── Static data ── */
const statCards = [
  { icon: "🏥", label: "Nearby",          value: "12", colorClass: "blue"   },
  { icon: "🩸", label: "Blood Donors",    value: "43", colorClass: "red"    },
  { icon: "💊", label: "Pharmacies Open", value: "18", colorClass: "green"  },
  { icon: "🚨", label: "Active Requests", value: "2",  colorClass: "orange" },
];

const hospitals = [
  { name: "Apollo Hospital",   rating: 4.8, distance: 2, bedsAvailable: true  },
  { name: "Fortis Healthcare", rating: 4.6, distance: 5, bedsAvailable: true  },
  { name: "AIIMS Delhi",       rating: 4.9, distance: 8, bedsAvailable: false },
];

const bloodGroups = [
  { type: "A+",  status: "available"   },
  { type: "A-",  status: "limited"     },
  { type: "B+",  status: "available"   },
  { type: "B-",  status: "unavailable" },
  { type: "O+",  status: "available"   },
  { type: "O-",  status: "unavailable" },
  { type: "AB+", status: "available"   },
  { type: "AB-", status: "limited"     },
];

const quickActions = [
  { icon: "🏥", label: "Find Hospital"    },
  { icon: "🩸", label: "Find Donor"       },
  { icon: "🏦", label: "Blood Bank"       },
  { icon: "💊", label: "Pharmacy"         },
  { icon: "📅", label: "Book Appointment" },
  { icon: "📍", label: "Find Nearby"      },
];

const medicines = [
  { name: "Paracetamol", pharmacy: "Apollo Pharmacy",  available: true  },
  { name: "Amoxicillin", pharmacy: "MedPlus Pharmacy", available: true  },
  { name: "Metformin",   pharmacy: "Health+ Pharmacy", available: false },
];

const notifications = [
  { message: "Blood donor accepted your request", time: "2 min ago",  color: "red"   },
  { message: "Appointment Confirmed",              time: "Yesterday",  color: "green" },
  { message: "New hospital added near you",        time: "2 days ago", color: "blue"  },
];

const medicalHistory = [
  { date: "12 July", test: "Blood Test",      status: "Completed" },
  { date: "2 June",  test: "General Checkup", status: "Completed" },
  { date: "18 May",  test: "X-Ray",           status: "Completed" },
];

const profileData = {
  name:             "Vismaya",
  age:              "22",
  bloodGroup:       "O+",
  emergencyContact: "+91 98765 43210",
  address:          "Kochi, Kerala",
};

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sosTriggered, setSosTriggered] = useState(false);

  const filteredMedicines = medicines.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSOS = () => {
    setSosTriggered(true);
    setTimeout(() => setSosTriggered(false), 3000);
  };

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
        <h1>Good morning, {profileData.name} 👋</h1>
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

      {/* Quick Actions */}
      <div className="section-card" style={{ marginBottom: "24px" }}>
        <h2 className="section-title">⚡ Quick Actions</h2>
        <div className="quick-actions">
          {quickActions.map((qa) => (
            <button key={qa.label} className="quick-action-btn">
              <span className="qa-icon">{qa.icon}</span>
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hospitals + Blood */}
      <div className="dashboard-grid" style={{ marginBottom: "24px" }}>
        <div className="section-card">
          <h2 className="section-title">🏥 Nearby Hospitals</h2>
          <div className="hospital-cards" style={{ gridTemplateColumns: "1fr" }}>
            {hospitals.map((h, i) => (
              <HospitalCard key={h.name} {...h} delay={i * 0.1} />
            ))}
          </div>
        </div>
        <div className="section-card">
          <h2 className="section-title">🩸 Blood Availability</h2>
          <div className="blood-grid">
            {bloodGroups.map((b) => (
              <BloodGroupCard key={b.type} {...b} />
            ))}
          </div>
        </div>
      </div>

      {/* Medicine Search + Notifications */}
      <div className="dashboard-grid" style={{ marginBottom: "24px" }}>
        <div className="section-card">
          <h2 className="section-title">💊 Medicine Search</h2>
          <SearchBar placeholder="Search Medicine..." onSearch={setSearchQuery} />
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredMedicines.length > 0 ? filteredMedicines.map((m) => (
              <div key={m.name} className="medicine-card">
                <div className="medicine-info">
                  <h4>💊 {m.pharmacy}</h4>
                  <p>{m.name}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span className={`badge ${m.available ? "green" : "red"}`}>
                    {m.available ? "Available" : "Out of stock"}
                  </span>
                  {m.available && <button className="btn-primary">View</button>}
                </div>
              </div>
            )) : (
              <p style={{ color: "#94A3B8", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
                No medicines found.
              </p>
            )}
          </div>
        </div>
        <div className="section-card">
          <h2 className="section-title">🔔 Notifications</h2>
          <div className="notification-list">
            {notifications.map((n, i) => (
              <NotificationCard key={i} {...n} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </div>

      {/* Appointments + Profile */}
      <div className="dashboard-grid" style={{ marginBottom: "24px" }}>
        <div className="section-card">
          <h2 className="section-title">📅 Upcoming Appointments</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <AppointmentCard doctor="Dr. Rahul Sharma" date="Tomorrow"  time="10:30 AM" department="Cardiology" delay={0}   />
            <AppointmentCard doctor="Dr. Priya Nair"   date="25 July"   time="2:00 PM"  department="General"    delay={0.1} />
          </div>
        </div>
        <div className="profile-card">
          <div className="profile-avatar">👤</div>
          <h3>{profileData.name}</h3>
          <div className="profile-details">
            <div className="profile-row">
              <span className="label">Age</span>
              <span className="value">{profileData.age}</span>
            </div>
            <div className="profile-row">
              <span className="label">Blood Group</span>
              <span className="value" style={{ color: "#EF4444", fontWeight: 700 }}>{profileData.bloodGroup}</span>
            </div>
            <div className="profile-row">
              <span className="label">Emergency Contact</span>
              <span className="value">{profileData.emergencyContact}</span>
            </div>
            <div className="profile-row">
              <span className="label">Address</span>
              <span className="value">{profileData.address}</span>
            </div>
          </div>
          <button className="btn-primary" style={{ width: "100%", marginTop: "16px" }}>Edit Profile</button>
        </div>
      </div>

      {/* Medical History */}
      <div className="section-card" style={{ marginBottom: "24px" }}>
        <h2 className="section-title">📜 Medical History</h2>
        <div className="history-list">
          {medicalHistory.map((h, i) => (
            <div key={i} className="history-card animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="history-date">{h.date}</span>
              <div className="history-info"><h4>{h.test}</h4></div>
              <span className="badge green">✅ {h.status}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
