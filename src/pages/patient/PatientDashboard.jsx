import { useState } from "react";
import Sidebar  from "./components/Sidebar";
import Navbar   from "./components/navbar";
import "./css/dashboard.css";
import "./css/sidebar.css";
import "./css/navbar.css";
import "./css/cards.css";

import Dashboard    from "./Dashboard";
import Hospitals    from "./Hospitals";
import BloodBanks   from "./BloodBanks";
import BloodSearch  from "./BloodSearch";
import Emergency    from "./Emergency";
import MyRequests   from "./MyRequests";
import Profile      from "./Profile";
import Notifications from "./Notifications";
import Settings     from "./Settings";

/* Placeholder for unfinished pages */
const ComingSoon = ({ title, icon }) => (
  <div className="page-body">
    <div className="page-header">
      <h1>{icon} {title}</h1>
      <p>This section is coming soon.</p>
    </div>
    <div className="section-card" style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>{icon}</div>
      <p style={{ color: "#94A3B8", fontSize: 14 }}>
        {title} will be available in a future update.
      </p>
    </div>
  </div>
);

const PAGE_MAP = {
  "dashboard":       Dashboard,
  "blood-search":    BloodSearch,
  "hospitals":       Hospitals,
  "blood-banks":     BloodBanks,
  "emergency":       Emergency,
  "my-requests":     MyRequests,
  "notifications":   Notifications,
  "profile":         Profile,
  "settings":        Settings,
  "appointments":    () => <ComingSoon title="Appointments"    icon="📅" />,
  "medical-history": () => <ComingSoon title="Medical History" icon="📜" />,
};

const PAGE_TITLES = {
  "dashboard":       "Dashboard",
  "blood-search":    "Blood Search",
  "hospitals":       "Hospitals",
  "blood-banks":     "Blood Banks",
  "emergency":       "Need Blood?",
  "my-requests":     "My Requests",
  "notifications":   "Notifications",
  "profile":         "Profile",
  "settings":        "Settings",
  "appointments":    "Appointments",
  "medical-history": "Medical History",
};

export default function PatientDashboard() {
  const [activePage,  setActivePage]  = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const PageComponent = PAGE_MAP[activePage] || Dashboard;

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: "#F8FAFC",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area — offset by sidebar width */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        marginLeft: 260,
        minWidth: 0,
        transition: "margin-left 0.3s",
      }}>
        <Navbar
          title={PAGE_TITLES[activePage] || "Dashboard"}
          onMenuClick={() => setSidebarOpen((p) => !p)}
        />
        <main style={{ flex: 1, overflowY: "auto" }}>
          <PageComponent onNavigate={setActivePage} />
        </main>
      </div>

      {/* Collapse sidebar margin on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .pt-main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
