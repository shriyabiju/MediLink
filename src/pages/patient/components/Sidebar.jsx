import "../css/sidebar.css";
import { useAuth }     from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const NAV = [
  { icon: "🏠", label: "Dashboard",      id: "dashboard" },
  { icon: "🩸", label: "Blood Search",    id: "blood-search" },
  { icon: "🏥", label: "Hospitals",       id: "hospitals" },
  { icon: "🏦", label: "Blood Banks",     id: "blood-banks" },
  { icon: "🚑", label: "Emergency",       id: "emergency" },
  { icon: "📅", label: "Appointments",    id: "appointments" },
  { icon: "📜", label: "Medical History", id: "medical-history" },
  { icon: "🔔", label: "Notifications",   id: "notifications" },
  { icon: "👤", label: "Profile",         id: "profile" },
  { icon: "⚙️", label: "Settings",        id: "settings" },
];

export default function Sidebar({ activePage = "dashboard", onNavigate, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "P";

  const handleNav = (id) => {
    if (onNavigate) onNavigate(id);
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`pt-sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`pt-sidebar ${isOpen ? "open" : ""}`}>
        {/* Brand */}
        <div className="pt-sidebar__brand">
          <div className="pt-sidebar__brand-icon">🩺</div>
          <div>
            <h2>MediLink</h2>
            <span>Patient Portal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="pt-sidebar__nav">
          <p className="pt-nav-section-label">Main Menu</p>
          {NAV.map((item) => (
            <button
              key={item.id}
              className={`pt-nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => handleNav(item.id)}
            >
              <span className="pt-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer — user info + logout */}
        <div className="pt-sidebar__footer">
          {user && (
            <div className="pt-sidebar__user">
              <div className="pt-sidebar__user-avatar">{initials}</div>
              <div className="pt-sidebar__user-info">
                <strong>{user.name}</strong>
                <span>Patient</span>
              </div>
            </div>
          )}
          <button className="pt-logout-btn" onClick={handleLogout}>
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
