import {
  LayoutDashboard,
  CalendarDays,
  FolderOpen,
  Pill,
  Bot,
  Settings,
  LogOut,
} from "lucide-react";
import "./css/sidebar.css";

const navItems = [
  { id: "home",          label: "Dashboard Home",       icon: LayoutDashboard },
  { id: "appointments",  label: "Upcoming Appointments", icon: CalendarDays },
  { id: "records",       label: "Medical Records",       icon: FolderOpen },
  { id: "prescriptions", label: "Prescriptions",         icon: Pill },
  { id: "ai",            label: "AI Health Assistant",   icon: Bot },
  { id: "settings",      label: "Settings",              icon: Settings },
];

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">M</div>
        <span>MediLink</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`sidebar-item ${activeTab === id ? "active" : ""}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <button className="sidebar-logout">
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
