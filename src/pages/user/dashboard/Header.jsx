import { useState } from "react";
import { Bell, ChevronDown, Search, Menu } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./css/header.css";

const NOTIFICATIONS = [
  { id: 1, type: "info",    text: "Appointment with Dr. Smith tomorrow at 10:00 AM.", time: "1h ago" },
  { id: 2, type: "warning", text: "Prescription refill reminder: Metformin 500mg.", time: "3h ago" },
  { id: 3, type: "success", text: "Lab report is ready for download.",              time: "Yesterday" },
];

const TYPE_DOT = { info: "#0EA5E9", warning: "#F59E0B", success: "#10B981", danger: "#EF4444" };

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotif,   setShowNotif]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [read,        setRead]        = useState([]);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const unread = NOTIFICATIONS.filter((n) => !read.includes(n.id)).length;

  const markRead = (id) => setRead((p) => [...p, id]);
  const markAll  = () => setRead(NOTIFICATIONS.map((n) => n.id));

  return (
    <header className="ud-header">
      {/* Left */}
      <div className="ud-header__left">
        <button className="ud-header__menu-btn" onClick={onMenuClick} aria-label="Menu">
          <Menu size={20} />
        </button>
        <div className="ud-header__search">
          <Search size={15} className="ud-header__search-icon" />
          <input placeholder="Search records, appointments…" />
        </div>
      </div>

      {/* Right */}
      <div className="ud-header__right">

        {/* Bell */}
        <div className="ud-header__dropdown-wrap">
          <button
            className="ud-header__icon-btn"
            onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unread > 0 && <span className="ud-header__notif-dot">{unread}</span>}
          </button>

          {showNotif && (
            <div className="ud-header__dropdown ud-header__dropdown--notif">
              <div className="ud-header__dropdown-head">
                <span>Notifications</span>
                {unread > 0 && (
                  <button className="ud-header__mark-all" onClick={markAll}>Mark all read</button>
                )}
              </div>
              <div className="ud-notif-list">
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className={`ud-notif-item ${read.includes(n.id) ? "ud-notif-item--read" : ""}`}
                    onClick={() => markRead(n.id)}
                  >
                    <span className="ud-notif-dot" style={{ background: TYPE_DOT[n.type] }} />
                    <div className="ud-notif-body">
                      <p>{n.text}</p>
                      <span>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="ud-header__dropdown-wrap">
          <button
            className="ud-header__profile-btn"
            onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
          >
            <div className="ud-header__avatar">{initials}</div>
            <div className="ud-header__profile-text">
              <strong>{user?.name ?? "User"}</strong>
              <span>Patient</span>
            </div>
            <ChevronDown size={15} className={showProfile ? "ud-header__chevron--open" : ""} />
          </button>

          {showProfile && (
            <div className="ud-header__dropdown ud-header__dropdown--profile">
              <div className="ud-header__profile-info">
                <div className="ud-header__avatar ud-header__avatar--lg">{initials}</div>
                <div>
                  <strong>{user?.name ?? "User"}</strong>
                  <span>{user?.email ?? ""}</span>
                </div>
              </div>
              <hr />
              <button className="ud-header__menu-item">View Profile</button>
              <button className="ud-header__menu-item">Settings</button>
              <button className="ud-header__menu-item ud-header__menu-item--danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
