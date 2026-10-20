import { useRef, useEffect } from "react";
import {
  LayoutDashboard, Building2, Droplets,
  Users, ClipboardList, LogOut, Shield, X,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/sidebar.css";

const NAV = [
  { id: "dashboard",  label: "Dashboard",          icon: LayoutDashboard },
  { id: "hospitals",  label: "Hospital Verification", icon: Building2,    badge: null },
  { id: "donors",     label: "Donor Management",   icon: Droplets },
  { id: "users",      label: "User Management",    icon: Users },
  { id: "requests",   label: "Requests Overview",  icon: ClipboardList },
];

export default function AdminSidebar({ active, setActive, isOpen, onClose, pendingCount = 0 }) {
  const ref      = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  useEffect(() => {
    const handler = (e) => {
      if (isOpen && ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const getBadge = (id) => {
    if (id === "hospitals" && pendingCount > 0) return pendingCount;
    return null;
  };

  return (
    <>
      <div className={`admin-sidebar-overlay ${isOpen ? "visible" : ""}`} onClick={onClose} />
      <aside className={`admin-sidebar ${isOpen ? "open" : ""}`} ref={ref}>
        {/* Brand */}
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__brand-icon">
            <Shield size={20} />
          </div>
          <div className="admin-sidebar__brand-text">
            <h2>MediLink</h2>
            <span>Admin Portal</span>
          </div>
          <button className="admin-sidebar__close" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          <p className="admin-sidebar__section-label">Main Menu</p>
          {NAV.map(({ id, label, icon: Icon }) => {
            const badge = getBadge(id);
            return (
              <button
                key={id}
                className={`admin-sidebar__item ${active === id ? "active" : ""}`}
                onClick={() => { setActive(id); onClose?.(); }}
                aria-current={active === id ? "page" : undefined}
              >
                <span className="admin-sidebar__item-icon"><Icon size={18} /></span>
                <span>{label}</span>
                {badge ? (
                  <span className="admin-sidebar__badge" aria-label={`${badge} pending`}>{badge}</span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__user-avatar">{initials}</div>
            <div className="admin-sidebar__user-info">
              <strong>{user?.name ?? "Admin"}</strong>
              <span>Administrator</span>
            </div>
          </div>
          <button className="admin-sidebar__logout" onClick={handleLogout}>
            <LogOut size={16} /> <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
