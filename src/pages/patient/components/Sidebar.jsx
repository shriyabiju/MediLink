import "../css/sidebar.css";

const navItems = [
  { icon: "🏠", label: "Dashboard",       id: "dashboard" },
  { icon: "🏥", label: "Hospitals",        id: "hospitals" },
  { icon: "🩸", label: "Blood Donors",     id: "blood-donors" },
  { icon: "🏦", label: "Blood Banks",      id: "blood-banks" },
  { icon: "💊", label: "Pharmacy",         id: "pharmacy" },
  { icon: "🚑", label: "Emergency",        id: "emergency" },
  { icon: "📅", label: "Appointments",     id: "appointments" },
  { icon: "📜", label: "Medical History",  id: "medical-history" },
  { icon: "🔔", label: "Notifications",    id: "notifications" },
  { icon: "👤", label: "Profile",          id: "profile" },
  { icon: "⚙️", label: "Settings",         id: "settings" },
];

const Sidebar = ({ activePage = "dashboard", onNavigate, isOpen, onClose }) => {
  const handleNav = (id) => {
    if (onNavigate) onNavigate(id);
    if (onClose) onClose();
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "visible" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <h2>Medi<span>Link</span></h2>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn">
            <span className="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
