import { useState } from "react";
import { CalendarDays, FolderOpen, Pill, Bot, Settings, LayoutDashboard } from "lucide-react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DashboardHome from "./DashboardHome";
import "./css/dashboard.css";

const PLACEHOLDER_PAGES = {
  appointments: { icon: CalendarDays, title: "Upcoming Appointments", sub: "Your booked appointments will appear here." },
  records:      { icon: FolderOpen,   title: "Medical Records",       sub: "Your medical records will appear here." },
  prescriptions:{ icon: Pill,         title: "Prescriptions",         sub: "Your prescriptions will appear here." },
  ai:           { icon: Bot,          title: "AI Health Assistant",   sub: "Your full AI health assistant will appear here." },
  settings:     { icon: Settings,     title: "Settings",              sub: "Account and notification settings will appear here." },
};

const PlaceholderPage = ({ icon: Icon, title, sub }) => (
  <div className="ud-placeholder">
    <div className="ud-placeholder-icon"><Icon size={30} /></div>
    <h2>{title}</h2>
    <p>{sub}</p>
  </div>
);

export default function Dashboard() {
  const [activeTab,   setActiveTab]   = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    if (activeTab === "home") return <DashboardHome />;
    const page = PLACEHOLDER_PAGES[activeTab];
    return page ? <PlaceholderPage {...page} /> : <DashboardHome />;
  };

  return (
    <div className="ud-shell">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="ud-main">
        <Header onMenuClick={() => setSidebarOpen((p) => !p)} />
        <main className="ud-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
