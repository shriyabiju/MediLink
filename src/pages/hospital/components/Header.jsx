import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MdMenu, MdSearch, MdNotifications, MdLogout } from 'react-icons/md';
import { useAuth } from '../../../context/AuthContext';
import '../css/cards.css';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'H';

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <motion.header
      className="hd-header"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Left */}
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
          <MdMenu />
        </button>
        <div>
          <h1 className="header-title">City General Hospital</h1>
          <p className="header-subtitle">Emergency Resource Coordination</p>
        </div>
      </div>

      {/* Right */}
      <div className="header-right">
        {/* Search */}
        <div className="header-search">
          <MdSearch className="search-icon" />
          <input type="search" placeholder="Search..." />
        </div>

        {/* Notifications */}
        <button
          className="header-icon-btn"
          onClick={() => setNotifOpen(!notifOpen)}
          aria-label="Notifications"
        >
          <MdNotifications />
          <span className="header-notif-dot">3</span>
        </button>

        {/* Avatar */}
        <div className="header-avatar">
          <div className="td-avatar-initials" style={{ borderRadius: '50%', width: 38, height: 38, fontSize: '.8rem' }}>
            {initials}
          </div>
          <div className="header-avatar-info">
            <strong>{user?.name ?? 'Hospital Staff'}</strong>
            <span>Hospital Staff</span>
          </div>
        </div>

        {/* Logout */}
        <button
          className="header-icon-btn"
          onClick={handleLogout}
          aria-label="Logout"
          title="Logout"
        >
          <MdLogout />
        </button>
      </div>

      {/* Notification dropdown */}
      <AnimatePresence>
        {notifOpen && (
          <motion.div
            style={{
              position: 'absolute',
              top: 72, right: 28,
              width: 320,
              background: '#fff',
              borderRadius: 14,
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 300,
              padding: 14,
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: 12 }}>
              Notifications (3)
            </div>
            <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
              <p style={{ padding: 10, background: '#F9FAFB', borderRadius: 8, marginBottom: 6 }}>
                <strong>Emergency:</strong> O- Blood needed.
              </p>
              <p style={{ padding: 10, background: '#F9FAFB', borderRadius: 8, marginBottom: 6 }}>
                <strong>Low Stock:</strong> Epinephrine critical.
              </p>
              <p style={{ padding: 10, background: '#F9FAFB', borderRadius: 8 }}>
                <strong>Bed Available:</strong> ICU #4 now free.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
