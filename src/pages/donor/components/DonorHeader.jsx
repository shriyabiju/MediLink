import { useState } from "react";
import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../css/header.css";

const TYPE_DOT = { request: "#EF4444", appointment: "#F59E0B", eligible: "#10B981", verified: "#2563EB", donation: "#8B5CF6" };

export default function DonorHeader({ onMenuClick, notifications, onMarkRead, onMarkAll }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [showNotif,   setShowNotif]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "D";

  const unread = (notifications || []).filter((n) => !n.read).length;

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const toggle = (which) => {
    if (which === "notif")   { setShowNotif((p) => !p); setShowProfile(false); }
    if (which === "profile") { setShowProfile((p) => !p); setShowNotif(false); }
  };

  /* Close dropdowns on outside-click */
  const closeAll = () => { setShowNotif(false); setShowProfile(false); };

  return (
    <header className="donor-header">
      {/* Left */}
      <div className="donor-header__left">
        <button
          className="donor-header__menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div className="donor-header__title-wrap">
          <h2>Donor Dashboard</h2>
          <p>Blood Donor Portal</p>
        </div>
      </div>

      {/* Right */}
      <div className="donor-header__right">
        {/* Search */}
        <div className="donor-header__search">
          <Search size={15} className="donor-header__search-icon" />
          <input type="search" placeholder="Search requests, history…" aria-label="Search" />
        </div>

        {/* Notifications bell */}
        <div className="donor-header__dropdown-wrap">
          <button
            className="donor-header__icon-btn"
            onClick={() => toggle("notif")}
            aria-label="Notifications"
            aria-expanded={showNotif}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="donor-header__notif-dot" aria-hidden="true">{unread}</span>
            )}
          </button>

          <AnimatePresence>
            {showNotif && (
              <motion.div
                className="donor-header__dropdown"
                initial={{ opacity: 0, y: -8, scale: .95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: .95 }}
                transition={{ duration: 0.18 }}
              >
                <div className="donor-header__dropdown-head">
                  <span>Notifications {unread > 0 && `(${unread} unread)`}</span>
                  {unread > 0 && (
                    <button className="donor-header__mark-all" onClick={() => { onMarkAll?.(); closeAll(); }}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="donor-header__notif-list">
                  {(notifications || []).slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`donor-header__notif-item ${n.read ? "read" : ""}`}
                      onClick={() => { onMarkRead?.(n.id); closeAll(); }}
                    >
                      <span
                        className="donor-header__notif-dot-color"
                        style={{ background: TYPE_DOT[n.type] ?? "#64748B" }}
                      />
                      <div className="donor-header__notif-body">
                        <p>{n.message}</p>
                        <span>{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile button */}
        <div className="donor-header__dropdown-wrap">
          <button
            className="donor-header__profile-btn"
            onClick={() => toggle("profile")}
            aria-expanded={showProfile}
          >
            <div className="donor-header__avatar">{initials}</div>
            <div className="donor-header__profile-text">
              <strong>{user?.name ?? "Donor"}</strong>
              <span>Blood Donor</span>
            </div>
            <ChevronDown size={14} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                className="donor-header__dropdown donor-header__dropdown--profile"
                initial={{ opacity: 0, y: -8, scale: .95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: .95 }}
                transition={{ duration: 0.18 }}
              >
                <div className="donor-header__profile-info">
                  <div className="donor-header__avatar" style={{ width: 40, height: 40, fontSize: ".9rem" }}>
                    {initials}
                  </div>
                  <div>
                    <strong>{user?.name ?? "Donor"}</strong>
                    <span>{user?.email ?? ""}</span>
                  </div>
                </div>
                <hr />
                <button className="donor-header__menu-item" onClick={closeAll}>
                  My Profile
                </button>
                <button className="donor-header__menu-item" onClick={closeAll}>
                  Settings
                </button>
                <button
                  className="donor-header__menu-item donor-header__menu-item--danger"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
