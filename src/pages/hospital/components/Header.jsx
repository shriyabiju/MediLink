import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MdMenu, MdSearch, MdNotifications, MdLogout, MdCheckCircle } from 'react-icons/md';
import { useAuth } from '../../../context/AuthContext';
import { hospitalApi } from '../../../services/api';
import '../css/cards.css';

/* ── Relative time, e.g. "2 min ago" ── */
function relativeTime(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.floor(hr / 24);
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);

  /* Real hospital name + notifications from the API */
  const [hospitalName, setHospitalName] = useState(user?.name ?? 'Hospital');
  const [notifs,        setNotifs]        = useState([]);
  const [unread,        setUnread]        = useState(0);

  /* Fetch the authenticated hospital's profile for the header title */
  useEffect(() => {
    let active = true;
    hospitalApi.getProfile()
      .then((d) => { if (active && d?.hospital?.name) setHospitalName(d.hospital.name); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  /* Fetch notifications (unread count + latest items) */
  const fetchNotifs = useCallback(() => {
    hospitalApi.getNotifications()
      .then((d) => {
        setNotifs(d.notifications || []);
        setUnread(d.unreadCount || 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'H';

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  /* Mark a single notification read */
  const handleMarkRead = async (id) => {
    try {
      await hospitalApi.markRead(id);
      setNotifs((n) => n.map((x) => x._id === id ? { ...x, read: true } : x));
      setUnread((u) => Math.max(0, u - 1));
    } catch { /* ignore */ }
  };

  /* Mark all as read */
  const handleMarkAllRead = async () => {
    try {
      await hospitalApi.markAllRead();
      setNotifs((n) => n.map((x) => ({ ...x, read: true })));
      setUnread(0);
    } catch { /* ignore */ }
  };

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
          <h1 className="header-title">{hospitalName}</h1>
          <p className="header-subtitle">Emergency Resource Coordination</p>
        </div>
      </div>

      {/* Right */}
      <div className="header-right">
        {/* Search */}
        <div className="header-search">
          <MdSearch className="search-icon" />
          <input type="search" placeholder="Search..." aria-label="Search" />
        </div>

        {/* Notifications */}
        <button
          className="header-icon-btn"
          onClick={() => { setNotifOpen((o) => !o); if (!notifOpen) fetchNotifs(); }}
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ''}`}
        >
          <MdNotifications />
          {unread > 0 && <span className="header-notif-dot">{unread}</span>}
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
        <button className="header-icon-btn" onClick={handleLogout} aria-label="Logout" title="Logout">
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
              width: 340,
              maxHeight: 420,
              background: '#fff',
              borderRadius: 14,
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 300,
              padding: 14,
              overflowY: 'auto',
            }}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="region"
            aria-label="Notifications"
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: '.85rem', fontWeight: 700 }}>
                Notifications {unread > 0 && <span style={{ color: 'var(--primary-light)' }}>({unread} new)</span>}
              </div>
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{ border: 'none', background: 'transparent', color: 'var(--primary-light)', fontSize: '.72rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifs.length === 0 ? (
              <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                You're all caught up — no notifications.
              </div>
            ) : (
              <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                {notifs.slice(0, 8).map((n) => (
                  <div
                    key={n._id}
                    style={{
                      padding: 10, marginBottom: 6, borderRadius: 8,
                      background: n.read ? '#F9FAFB' : '#EFF6FF',
                      borderLeft: n.read ? '3px solid transparent' : '3px solid var(--primary-light)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                      <strong style={{ color: 'var(--text)', fontSize: '.78rem' }}>{n.title || 'Notification'}</strong>
                      <span style={{ fontSize: '.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{relativeTime(n.createdAt)}</span>
                    </div>
                    {n.message && <p style={{ marginTop: 3, fontSize: '.75rem', lineHeight: 1.45 }}>{n.message}</p>}
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n._id)}
                        style={{
                          marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4,
                          border: 'none', background: 'transparent',
                          color: 'var(--primary-light)', fontSize: '.7rem', fontWeight: 600, cursor: 'pointer', padding: 0,
                        }}
                        aria-label="Mark notification as read"
                      >
                        <MdCheckCircle size={13} /> Mark read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
