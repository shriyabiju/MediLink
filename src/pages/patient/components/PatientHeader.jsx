import { useState } from "react";
import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { useAuth }     from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/header.css";

const NOTIFICATIONS = [
  { id: 1, type: "request",     message: "Blood donor accepted your request.",         time: "2 min ago"  },
  { id: 2, type: "appointment", message: "Appointment with Dr. Rahul Sharma confirmed.", time: "1h ago"    },
  { id: 3, type: "info",        message: "New hospital added near your location.",       time: "Yesterday" },
];

const TYPE_COLOR = {
  request:     "#EF4444",
  appointment: "#2563EB",
  info:        "#0EA5E9",
  warning:     "#F59E0B",
};

export default function PatientHeader({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const [showNotif,   setShowNotif]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [read,        setRead]        = useState([]);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "P";

  const unread   = NOTIFICATIONS.filter((n) => !read.includes(n.id)).length;
  const markRead = (id) => setRead((p) => [...p, id]);
  const markAll  = ()   => setRead(NOTIFICATIONS.map((n) => n.id));

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const toggle = (which) => {
    if (which === "notif")   { setShowNotif((p) => !p);   setShowProfile(false); }
    if (which === "profile") { setShowProfile((p) => !p); setShowNotif(false);   }
  };

  const closeAll = () => { setShowNotif(false); setShowProfile(false); };

  return (
    <header className="pd-header">

      {/* ── Left ── */}
      <div className="pd-header__left">
        <button
          className="pd-header__menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="pd-header__search">
          <Search size={15} className="pd-header__search-icon" />
          <input
            type="search"
            placeholder="Search records, appointments…"
            aria-label="Search"
          />
        </div>
      </div>

      {/* ── Right ── */}
      <div className="pd-header__right">

        {/* Bell */}
        <div className="pd-header__dropdown-wrap">
          <button
            className="pd-header__icon-btn"
            onClick={() => toggle("notif")}
            aria-label="Notifications"
            aria-expanded={showNotif}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="pd-header__notif-dot" aria-hidden="true">{unread}</span>
            )}
          </button>

          {showNotif && (
            <div className="pd-header__dropdown pd-header__dropdown--notif">
              <div className="pd-header__dropdown-head">
                <span>Notifications {unread > 0 && `(${unread} unread)`}</span>
                {unread > 0 && (
                  <button className="pd-header__mark-all" onClick={() => { markAll(); closeAll(); }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="pd-notif-list">
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className={`pd-notif-item ${read.includes(n.id) ? "pd-notif-item--read" : ""}`}
                    onClick={() => { markRead(n.id); closeAll(); }}
                  >
                    <span
                      className="pd-notif-dot-color"
                      style={{ background: TYPE_COLOR[n.type] ?? "#64748B" }}
                    />
                    <div className="pd-notif-body">
                      <p>{n.message}</p>
                      <span>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="pd-header__dropdown-wrap">
          <button
            className="pd-header__profile-btn"
            onClick={() => toggle("profile")}
            aria-expanded={showProfile}
          >
            <div className="pd-header__avatar">{initials}</div>
            <div className="pd-header__profile-text">
              <strong>{user?.name ?? "Patient"}</strong>
              <span>Patient</span>
            </div>
            <ChevronDown size={14} />
          </button>

          {showProfile && (
            <div className="pd-header__dropdown pd-header__dropdown--profile">
              <div className="pd-header__profile-info">
                <div className="pd-header__avatar pd-header__avatar--lg">{initials}</div>
                <div>
                  <strong>{user?.name ?? "Patient"}</strong>
                  <span>{user?.email ?? ""}</span>
                </div>
              </div>
              <hr />
              <button className="pd-header__menu-item" onClick={closeAll}>View Profile</button>
              <button className="pd-header__menu-item" onClick={closeAll}>Settings</button>
              <button
                className="pd-header__menu-item pd-header__menu-item--danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
