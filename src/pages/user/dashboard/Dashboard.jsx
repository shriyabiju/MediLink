import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DashboardHome from "./DashboardHome";
import "./css/dashboard.css";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <DashboardHome />;
      case "appointments":
        return <div className="placeholder-page"><h2>Upcoming Appointments</h2><p>Your appointments will appear here.</p></div>;
      case "records":
        return <div className="placeholder-page"><h2>Medical Records</h2><p>Your medical records will appear here.</p></div>;
      case "prescriptions":
        return <div className="placeholder-page"><h2>Prescriptions</h2><p>Your prescriptions will appear here.</p></div>;
      case "ai":
        return <div className="placeholder-page"><h2>AI Health Assistant</h2><p>Your AI health assistant will appear here.</p></div>;
      case "settings":
        return <div className="placeholder-page"><h2>Settings</h2><p>Your settings will appear here.</p></div>;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="dashboard-main">
        <Header />
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
