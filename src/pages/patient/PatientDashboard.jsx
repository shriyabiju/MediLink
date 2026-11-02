import { useState } from "react";
import Sidebar       from "./components/Sidebar";
import Navbar        from "./components/navbar";
import "./css/dashboard.css";
import "./css/sidebar.css";
import "./css/navbar.css";
import "./css/cards.css";

import Dashboard     from "./Dashboard";
import Hospitals     from "./Hospitals";
import BloodBanks    from "./BloodBanks";
import BloodSearch   from "./BloodSearch";
import Emergency     from "./Emergency";
import MyRequests    from "./MyRequests";
import Profile       from "./Profile";
import Notifications from "./Notifications";
import Settings      from "./Settings";

/* ── Coming Soon placeholder ── */
const ComingSoon = ({ title, icon }) => (
  <div className="page-body">
    <div className="page-header">
      <h1>{icon} {title}</h1>
      <p>This section is coming soon.</p>
    </div>
    <div className="section-card" style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <p style={{ color: "#94A3B8", fontSize: 14 }}>
        {title} will be available in a future update.
      </p>
    </div>
  </div>
);

const PAGE_MAP = {
  "dashboard":        Dashboard,
  "blood-search":     BloodSearch,
  "hospitals":        Hospitals,
  "blood-banks":      BloodBanks,
  "emergency":        Emergency,
  "my-requests":      MyRequests,
  "notifications":    Notifications,
  "profile":          Profile,
  "settings":         Settings,
  "appointments":     () => <ComingSoon title="Appointments"    icon="📅" />,
  "medical-history":  () => <ComingSoon title="Medical History" icon="📜" />,
};

const PAGE_TITLES = {
  "dashboard":        "Dashboard",
  "blood-search":     "Blood Requests",
  "hospitals":        "Find Hospitals",
  "blood-banks":      "Blood Banks",
  "emergency":        "Emergency",
  "my-requests":      "My Requests",
  "notifications":    "Notifications",
  "profile":          "Profile",
  "settings":         "Settings",
  "appointments":     "Appointments",
  "medical-history":  "Medical History",
};

export default function PatientDashboard() {
  const [activePage,  setActivePage]  = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const PageComponent = PAGE_MAP[activePage] ?? Dashboard;

  return (
    <div className="pt-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="pt-main">
        <Navbar
          title={PAGE_TITLES[activePage] ?? "Dashboard"}
          onMenuClick={() => setSidebarOpen((p) => !p)}
        />
        <main className="pt-page-area">
          <PageComponent onNavigate={setActivePage} />
        </main>
      </div>
    </div>
  );
}
