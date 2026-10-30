import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "../css/navbar.css";

export default function Navbar({ title = "Dashboard", onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "P";

  const handleLogout = () => {
    setShowProfile(false);
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="pt-header">
      {/* Left: hamburger + title */}
      <div className="pt-header__left">
        <button
          className="pt-header__menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div>
          <p className="pt-header__title">{title}</p>
          <p className="pt-header__subtitle">Patient Portal</p>
        </div>
      </div>

      {/* Right: avatar + dropdown */}
      <div className="pt-header__right">
        <div style={{ position: "relative" }}>
          <button
            className="pt-header__avatar-btn"
            onClick={() => setShowProfile((p) => !p)}
            aria-label="Profile menu"
          >
            <div className="pt-header__avatar">{initials}</div>
            <div className="pt-header__avatar-info">
              <strong>{user?.name ?? "Patient"}</strong>
              <span>Patient</span>
            </div>
          </button>

          {showProfile && (
            <div className="pt-header__dropdown">
              <p className="pt-header__dropdown-email">{user?.email ?? ""}</p>
              <button className="pt-header__logout" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
