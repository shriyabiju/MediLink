import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMenu, MdSearch, MdNotifications } from 'react-icons/md';
import '../css/cards.css';

export default function Header({ onMenuClick }) {
  const [notifOpen, setNotifOpen] = useState(false);

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
          <img
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop"
            alt="User"
          />
          <div className="header-avatar-info">
            <strong>Dr. Arthur P.</strong>
            <span>Admin</span>
          </div>
        </div>
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
