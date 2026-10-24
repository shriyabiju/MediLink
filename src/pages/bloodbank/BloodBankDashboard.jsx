import { useState } from "react";
import BloodBankSidebar from "./BloodBankSidebar";
import BloodBankHeader  from "./BloodBankHeader";
import BloodBankHome    from "./BloodBankHome";
import BloodBankInventory from "./BloodBankInventory";
import BloodBankRequests  from "./BloodBankRequests";
import BloodBankNotifications from "./BloodBankNotifications";
import BloodBankSettings from "./BloodBankSettings";

const PAGE_MAP = {
  home:          BloodBankHome,
  inventory:     BloodBankInventory,
  requests:      BloodBankRequests,
  notifications: BloodBankNotifications,
  settings:      BloodBankSettings,
};

const PAGE_TITLES = {
  home:          "Dashboard",
  inventory:     "Blood Inventory",
  requests:      "Blood Requests",
  notifications: "Notifications",
  settings:      "Settings",
};

export default function BloodBankDashboard() {
  const [active,      setActive]      = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const PageComponent = PAGE_MAP[active] || BloodBankHome;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC", fontFamily: "Inter, sans-serif" }}>
      <BloodBankSidebar active={active} setActive={setActive} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", marginLeft: 260, transition: "margin-left 0.3s" }}>
        <BloodBankHeader title={PAGE_TITLES[active] || "Dashboard"} onMenuClick={() => setSidebarOpen((p) => !p)} />
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          <PageComponent />
        </main>
      </div>
    </div>
  );
}
