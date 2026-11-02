import { useRef, useEffect } from "react";
import {
  LayoutDashboard, Building2, Droplets, Siren,
  CalendarDays, FileText, Bell, User, Settings,
  LogOut, X, HeartPulse,
} from "lucide-react";
import { useAuth }     from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/sidebar.css";

const NAV = [
  { id: "dashboard",        label: "Dashboard",       icon: LayoutDashboard },
  { id: "hospitals",        label: "Hospitals",        icon: Building2 },
  { id: "blood-banks",      label: "Blood Banks",      icon: Droplets },
  { id: "emergency",        label: "Emergency",        icon: Siren },
  { id: "appointments",     label: "Appointments",     icon: CalendarDays },
  { id: "medical-history",  label: "Medical History",  icon: FileText },
  { id: "notifications",    label: "Notifications",    icon: Bell, badge: 3 },
  { id: "profile",          label: "Profile",          icon: User },
  { id: "settings",         label: "Settings",         icon: Settings },
];

export default function PatientSidebar({ active, setActive, isOpen, onClose }) {
  const ref      = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "P";

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  /* Close on outside-click on mobile */
  useEffect(() => {
    const handler = (e) => {
      if (isOpen && ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`pd-sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`pd-sidebar ${isOpen ? "open" : ""}`} ref={ref}>

        {/* Brand */}
        <div className="pd-sidebar__brand">
          <div className="pd-sidebar__brand-icon">
            <HeartPulse size={20} color="#fff" />
          </div>
          <div className="pd-sidebar__brand-text">
            <h2>MediLink</h2>
            <span>Patient Portal</span>
          </div>
          <button
            className="pd-sidebar__close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="pd-sidebar__nav" aria-label="Patient navigation">
          <p className="pd-sidebar__section-label">Main Menu</p>
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              className={`pd-sidebar__item ${active === id ? "active" : ""}`}
              onClick={() => { setActive(id); onClose?.(); }}
              aria-current={active === id ? "page" : undefined}
            >
              <span className="pd-sidebar__item-icon">
                <Icon size={18} />
              </span>
              <span>{label}</span>
              {badge && (
                <span className="pd-sidebar__badge" aria-label={`${badge} unread`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="pd-sidebar__footer">
          <div className="pd-sidebar__user">
            <div className="pd-sidebar__user-avatar">{initials}</div>
            <div className="pd-sidebar__user-info">
              <strong>{user?.name ?? "Patient"}</strong>
              <span>Patient</span>
            </div>
          </div>
          <button className="pd-sidebar__logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  );
}
