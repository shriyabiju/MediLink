import { useRef, useEffect } from "react";
import {
  LayoutDashboard, User, Droplets, MapPin,
  Clock, Bell, Settings, LogOut, Heart, X,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/sidebar.css";

const NAV = [
  { id: "home",         label: "Dashboard",           icon: LayoutDashboard },
  { id: "profile",      label: "My Profile",          icon: User },
  { id: "blood",        label: "Blood Donation",      icon: Droplets },
  { id: "requests",     label: "Nearby Blood Requests", icon: MapPin, badge: 3 },
  { id: "history",      label: "Donation History",    icon: Clock },
  { id: "notifications",label: "Notifications",       icon: Bell,  badge: 3 },
  { id: "settings",     label: "Settings",            icon: Settings },
];

export default function DonorSidebar({ active, setActive, isOpen, onClose }) {
  const ref      = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "D";

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
        className={`donor-sidebar-overlay ${isOpen ? "visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`donor-sidebar ${isOpen ? "open" : ""}`} ref={ref}>
        {/* Brand */}
        <div className="donor-sidebar__brand">
          <div className="donor-sidebar__brand-icon">
            <Heart size={20} fill="#fff" color="#fff" />
          </div>
          <div className="donor-sidebar__brand-text">
            <h2>MediLink</h2>
            <span>Donor Portal</span>
          </div>
          <button
            className="donor-sidebar__close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="donor-sidebar__nav" aria-label="Donor navigation">
          <p className="donor-sidebar__section-label">Main Menu</p>
          {NAV.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              className={`donor-sidebar__item ${active === id ? "active" : ""}`}
              onClick={() => { setActive(id); onClose?.(); }}
              aria-current={active === id ? "page" : undefined}
            >
              <span className="donor-sidebar__item-icon">
                <Icon size={18} />
              </span>
              <span>{label}</span>
              {badge && (
                <span className="donor-sidebar__badge" aria-label={`${badge} unread`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="donor-sidebar__footer">
          <div className="donor-sidebar__user">
            <div className="donor-sidebar__user-avatar">{initials}</div>
            <div className="donor-sidebar__user-info">
              <strong>{user?.name ?? "Donor"}</strong>
              <span>Blood Donor</span>
            </div>
          </div>
          <button className="donor-sidebar__logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
