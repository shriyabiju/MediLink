import { useEffect, useRef } from "react";
import {
  LayoutDashboard, CalendarDays, FolderOpen,
  Pill, Bot, Settings, LogOut, Heart, X,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./css/sidebar.css";

const NAV = [
  { id: "home",          label: "Dashboard",             icon: LayoutDashboard },
  { id: "appointments",  label: "Upcoming Appointments", icon: CalendarDays,   badge: 2 },
  { id: "records",       label: "Medical Records",       icon: FolderOpen },
  { id: "prescriptions", label: "Prescriptions",         icon: Pill,           badge: 1 },
  { id: "ai",            label: "AI Health Assistant",   icon: Bot },
  { id: "settings",      label: "Settings",              icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose }) {
  const ref = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  /* close on outside click (mobile) */
  useEffect(() => {
    const handler = (e) => {
      if (isOpen && ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div className="ud-sidebar-overlay" onClick={onClose} />
      )}

      <aside className={`ud-sidebar ${isOpen ? "ud-sidebar--open" : ""}`} ref={ref}>
        {/* Brand */}
        <div className="ud-sidebar__brand">
          <div className="ud-sidebar__brand-icon">
            <Heart size={18} fill="#fff" color="#fff" />
          </div>
          <div className="ud-sidebar__brand-text">
            <span className="ud-sidebar__brand-name">MediLink</span>
            <span className="ud-sidebar__brand-role">Patient Portal</span>
          </div>
          {/* Mobile close */}
          <button className="ud-sidebar__close" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="ud-sidebar__nav">
          <p className="ud-sidebar__section-label">Main Menu</p>
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              className={`ud-sidebar__item ${activeTab === id ? "ud-sidebar__item--active" : ""}`}
              onClick={() => { setActiveTab(id); onClose?.(); }}
            >
              <span className="ud-sidebar__item-icon"><Icon size={18} /></span>
              <span className="ud-sidebar__item-label">{label}</span>
              {badge && <span className="ud-sidebar__badge">{badge}</span>}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="ud-sidebar__footer">
          <div className="ud-sidebar__user">
            <div className="ud-sidebar__user-avatar">{initials}</div>
            <div className="ud-sidebar__user-info">
              <strong>{user?.name ?? "Patient"}</strong>
              <span>Patient</span>
            </div>
          </div>
          <button className="ud-sidebar__logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
