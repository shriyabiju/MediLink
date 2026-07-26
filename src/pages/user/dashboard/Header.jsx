import { useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import "./css/header.css";

const notifications = [
  { id: 1, text: "Your appointment with Dr. Smith is tomorrow at 10:00 AM.", time: "1h ago" },
  { id: 2, text: "Prescription refill reminder: Metformin 500mg.", time: "3h ago" },
  { id: 3, text: "Lab report is ready for download.", time: "Yesterday" },
];

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="dashboard-header">
      {/* Welcome */}
      <div className="header-welcome">
        <h2>Hello, John 👋</h2>
        <p>Here's what's happening with your health today.</p>
      </div>

      {/* Right actions */}
      <div className="header-actions">

        {/* Notification Bell */}
        <div className="header-bell-wrapper">
          <button
            className="header-icon-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="notif-badge">{notifications.length}</span>
          </button>

          {showNotifications && (
            <div className="notif-dropdown">
              <h4>Notifications</h4>
              {notifications.map((n) => (
                <div key={n.id} className="notif-item">
                  <p>{n.text}</p>
                  <span>{n.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="header-profile-wrapper">
          <button
            className="header-avatar-btn"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
          >
            <div className="avatar">JD</div>
            <span>John Doe</span>
            <ChevronDown size={16} />
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <p className="profile-name">John Doe</p>
              <p className="profile-email">john@example.com</p>
              <hr />
              <button className="profile-menu-item">View Profile</button>
              <button className="profile-menu-item">Settings</button>
              <button className="profile-menu-item logout">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
