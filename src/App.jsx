import { useState } from "react";
import Sidebar   from "./pages/patient/components/Sidebar";
import Navbar    from "./pages/patient/components/Navbar";
import Dashboard from "./pages/patient/Dashboard";
import "./pages/patient/css/dashboard.css";

const pageTitles = {
  dashboard:         "Dashboard",
  hospitals:         "Hospitals",
  "blood-donors":    "Blood Donors",
  "blood-banks":     "Blood Banks",
  pharmacy:          "Pharmacy",
  emergency:         "Emergency",
  appointments:      "Appointments",
  "medical-history": "Medical History",
  notifications:     "Notifications",
  profile:           "Profile",
  settings:          "Settings",
};

function App() {
  const [activePage, setActivePage]   = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-content">
        <Navbar
          title={pageTitles[activePage] ?? "Dashboard"}
          onMenuClick={() => setSidebarOpen(true)}
        />
        {activePage === "dashboard" && <Dashboard />}
        {activePage !== "dashboard" && (
          <div className="page-body">
            <div className="page-header animate-fade-up">
              <h1>{pageTitles[activePage]}</h1>
              <p>This section is coming soon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
