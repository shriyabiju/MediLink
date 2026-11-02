import { useState } from "react";
import {
  Building2, Droplets, Pill, AlertTriangle,
  CalendarDays, MapPin, Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./css/patient.css";

/* ── Static data ── */
const STATS = [
  { icon: "🏥", label: "Nearby Hospitals",  value: "12", sub: "Within 10 km",      color: "blue"   },
  { icon: "🩸", label: "Blood Donors",       value: "43", sub: "Available now",     color: "red"    },
  { icon: "💊", label: "Pharmacies Open",    value: "18", sub: "24h available",     color: "green"  },
  { icon: "🚨", label: "Active Requests",    value: "2",  sub: "Pending response",  color: "orange" },
];

const HOSPITALS = [
  { name: "Apollo Hospital",   rating: 4.8, distance: 2, beds: true  },
  { name: "Fortis Healthcare", rating: 4.6, distance: 5, beds: true  },
  { name: "AIIMS",             rating: 4.9, distance: 8, beds: false },
];

const BLOOD_GROUPS = [
  { type: "A+",  status: "available",   emoji: "🟢" },
  { type: "A-",  status: "limited",     emoji: "🟡" },
  { type: "B+",  status: "available",   emoji: "🟢" },
  { type: "B-",  status: "unavailable", emoji: "🔴" },
  { type: "O+",  status: "available",   emoji: "🟢" },
  { type: "O-",  status: "unavailable", emoji: "🔴" },
  { type: "AB+", status: "available",   emoji: "🟢" },
  { type: "AB-", status: "limited",     emoji: "🟡" },
];

const QUICK_ACTIONS = [
  { icon: <Building2 size={20} />,    label: "Find Hospital"     },
  { icon: <Droplets size={20} />,     label: "Find Donor"        },
  { icon: "🏦",                        label: "Blood Bank"        },
  { icon: <Pill size={20} />,         label: "Pharmacy"          },
  { icon: <CalendarDays size={20} />, label: "Book Appointment"  },
  { icon: <MapPin size={20} />,       label: "Find Nearby"       },
];

const MEDICINES = [
  { name: "Paracetamol", pharmacy: "Apollo Pharmacy",  available: true  },
  { name: "Amoxicillin", pharmacy: "MedPlus Pharmacy", available: true  },
  { name: "Metformin",   pharmacy: "Health+ Pharmacy", available: false },
];

const NOTIFICATIONS = [
  { id: 1, message: "Blood donor accepted your request", time: "2 min ago",  dotColor: "#EF4444" },
  { id: 2, message: "Appointment Confirmed",              time: "Yesterday",  dotColor: "#10B981" },
  { id: 3, message: "New hospital added near you",        time: "2 days ago", dotColor: "#2563EB" },
];

const APPOINTMENTS = [
  { doctor: "Dr. Rahul Sharma", date: "Tomorrow",  time: "10:30 AM", dept: "Cardiology" },
  { doctor: "Dr. Priya Nair",   date: "25 July",   time: "2:00 PM",  dept: "General"    },
];

const HISTORY = [
  { date: "12 July", test: "Blood Test",      status: "Completed" },
  { date: "2 June",  test: "General Checkup", status: "Completed" },
  { date: "18 May",  test: "X-Ray",           status: "Completed" },
];

const PROFILE = {
  bloodGroup:       "O+",
  age:              "22",
  emergencyContact: "+91 98765 43210",
  address:          "Kochi, Kerala",
};

/* ── Component ── */
export default function PatientHome() {
  const { user }                  = useAuth();
  const [query,   setQuery]       = useState("");
  const [sosSent, setSosSent]     = useState(false);

  const name            = user?.name ?? "there";
  const initials        = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const filteredMeds    = MEDICINES.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSOS = () => {
    setSosSent(true);
    setTimeout(() => setSosSent(false), 4000);
  };

  return (
    <div>
      {/* SOS alert banner */}
      {sosSent && (
        <div className="pd-sos-alert">
          🚨 Emergency request sent! Help is on the way.
        </div>
      )}

      {/* Page header */}
      <div className="pd-page-header">
        <div>
          <h1>Good morning, {name} 👋</h1>
          <p>Here's your health overview for today.</p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="pd-stats-grid">
        {STATS.map((s) => (
          <div className="pd-stat" key={s.label}>
            <div className={`pd-stat__icon pd-stat__icon--${s.color}`}>{s.icon}</div>
            <div>
              <div className="pd-stat__label">{s.label}</div>
              <div className="pd-stat__value">{s.value}</div>
              <div className="pd-stat__sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── SOS card ── */}
      <div className="pd-sos-card">
        <span className="pd-sos-card__icon">🚨</span>
        <h2>EMERGENCY</h2>
        <p>Need immediate help? Request emergency assistance instantly.</p>
        <button className="pd-sos-btn" onClick={handleSOS}>
          REQUEST HELP
        </button>
      </div>

      {/* ── Quick Actions ── */}
      <div className="pd-card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="pd-card__header">
          <span className="pd-card__title">⚡ Quick Actions</span>
        </div>
        <div className="pd-quick-grid">
          {QUICK_ACTIONS.map((qa) => (
            <button className="pd-quick-btn" key={qa.label}>
              <span className="pd-quick-btn__icon">{qa.icon}</span>
              {qa.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Hospitals + Blood availability ── */}
      <div className="pd-two-col">

        {/* Nearby Hospitals */}
        <div className="pd-card">
          <div className="pd-card__header">
            <span className="pd-card__title">🏥 Nearby Hospitals</span>
            <button className="pd-link-btn">View all</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {HOSPITALS.map((h) => (
              <div className="pd-hospital-card" key={h.name}>
                <div className="pd-hospital-card__header">
                  <div>
                    <span style={{ fontSize: "1.4rem" }}>🏥</span>
                    <h4>{h.name}</h4>
                  </div>
                  <span className={`pd-badge pd-badge--${h.beds ? "success" : "danger"}`}>
                    {h.beds ? "🛏 Beds Available" : "🛏 Full"}
                  </span>
                </div>
                <div className="pd-hospital-card__meta">
                  <span className="rating">⭐ {h.rating}</span>
                  <span>📍 {h.distance} km away</span>
                </div>
                <button className="pd-btn pd-btn--primary pd-btn--sm" style={{ width: "100%" }}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Blood Availability */}
        <div className="pd-card">
          <div className="pd-card__header">
            <span className="pd-card__title">🩸 Blood Availability</span>
          </div>
          <div className="pd-blood-grid">
            {BLOOD_GROUPS.map((b) => (
              <div className="pd-blood-item" key={b.type}>
                <div className="pd-blood-item__type">{b.type}</div>
                <div className="pd-blood-item__status">{b.emoji}</div>
                <div className="pd-blood-item__label">{b.status}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Medicine Search + Notifications ── */}
      <div className="pd-two-col">

        {/* Medicine Search */}
        <div className="pd-card">
          <div className="pd-card__header">
            <span className="pd-card__title">💊 Medicine Search</span>
          </div>
          <div className="pd-search-input-wrap">
            <Search size={15} />
            <input
              type="text"
              placeholder="Search medicine…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div>
            {filteredMeds.length > 0 ? filteredMeds.map((m) => (
              <div className="pd-medicine-row" key={m.name}>
                <div className="pd-medicine-row__info">
                  <h4>💊 {m.pharmacy}</h4>
                  <p>{m.name}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span className={`pd-badge pd-badge--${m.available ? "success" : "danger"}`}>
                    {m.available ? "Available" : "Out of stock"}
                  </span>
                  {m.available && (
                    <button className="pd-btn pd-btn--primary pd-btn--sm">View</button>
                  )}
                </div>
              </div>
            )) : (
              <p style={{ textAlign: "center", color: "var(--text-faint)", fontSize: "var(--text-sm)", padding: "var(--space-6) 0" }}>
                No medicines found.
              </p>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="pd-card">
          <div className="pd-card__header">
            <span className="pd-card__title">🔔 Notifications</span>
            <button className="pd-link-btn">View all</button>
          </div>
          <div className="pd-list">
            {NOTIFICATIONS.map((n) => (
              <div className="pd-notif-row" key={n.id}>
                <span className="pd-notif-row__dot" style={{ background: n.dotColor }} />
                <div className="pd-notif-row__text">
                  <p>{n.message}</p>
                  <span>{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Appointments + Profile ── */}
      <div className="pd-two-col">

        {/* Upcoming Appointments */}
        <div className="pd-card">
          <div className="pd-card__header">
            <span className="pd-card__title">📅 Upcoming Appointments</span>
            <button className="pd-link-btn">View all</button>
          </div>
          <div className="pd-list">
            {APPOINTMENTS.map((a, i) => (
              <div className="pd-appt-row" key={i}>
                <div className="pd-appt-row__info">
                  <h4>👨‍⚕️ {a.doctor}</h4>
                  <p>📅 {a.date}</p>
                </div>
                <div className="pd-appt-row__time">
                  <div className="time">{a.time}</div>
                  <div className="dept">{a.dept}</div>
                </div>
                <button className="pd-btn pd-btn--secondary pd-btn--sm" style={{ marginLeft: "var(--space-3)" }}>
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Profile card */}
        <div className="pd-profile-card">
          <div className="pd-profile-card__avatar">{initials}</div>
          <h3>{name}</h3>
          <div style={{ marginTop: "var(--space-4)" }}>
            {[
              { label: "Age",              value: PROFILE.age              },
              { label: "Blood Group",      value: PROFILE.bloodGroup,      danger: true },
              { label: "Emergency Contact",value: PROFILE.emergencyContact },
              { label: "Address",          value: PROFILE.address          },
            ].map((row) => (
              <div className="pd-profile-row" key={row.label}>
                <span className="label">{row.label}</span>
                <span
                  className="value"
                  style={row.danger ? { color: "var(--danger)", fontWeight: 700 } : {}}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <button className="pd-btn pd-btn--primary" style={{ width: "100%", marginTop: "var(--space-5)" }}>
            Edit Profile
          </button>
        </div>

      </div>

      {/* ── Medical History ── */}
      <div className="pd-card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="pd-card__header">
          <span className="pd-card__title">📜 Medical History</span>
          <button className="pd-link-btn">View all</button>
        </div>
        <div className="pd-list">
          {HISTORY.map((h, i) => (
            <div className="pd-history-row" key={i}>
              <span className="pd-history-row__date">{h.date}</span>
              <div className="pd-history-row__info">
                <h4>{h.test}</h4>
              </div>
              <span className="pd-badge pd-badge--success">✅ {h.status}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
