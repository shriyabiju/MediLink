import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCircle, MdWarning, MdInfo, MdCheckCircle, MdDelete } from 'react-icons/md';
import { hospitalApi } from '../../services/api';

const iconColors = {
  danger:  { bg: '#FEE2E2', icon: '#DC2626' },
  warning: { bg: '#FEF3C7', icon: '#D97706' },
  info:    { bg: '#DBEAFE', icon: '#2563EB' },
  success: { bg: '#D1FAE5', icon: '#10B981' },
  request: { bg: '#DBEAFE', icon: '#2563EB' },
  system:  { bg: '#F3F4F6', icon: '#6B7280' },
};

const typeToDisplay = (type) => iconColors[type] || iconColors.info;

export default function Notifications() {
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [unread,  setUnread]  = useState(0);

  const fetchNotifs = useCallback(() => {
    setLoading(true);
    hospitalApi.getNotifications(filter)
      .then((d) => { setNotifs(d.notifications); setUnread(d.unreadCount); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markRead = async (id) => {
    await hospitalApi.markRead(id).catch(() => {});
    fetchNotifs();
  };

  const markAllRead = async () => {
    await hospitalApi.markAllRead().catch(() => {});
    fetchNotifs();
  };

  const dismiss = async (id) => {
    await hospitalApi.deleteNotif(id).catch(() => {});
    setNotifs((n) => n.filter((x) => x._id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notifications {unread > 0 && <span style={{ fontSize: '.9rem', color: 'var(--primary-light)' }}>({unread} unread)</span>}</h1>
          <p>Stay updated on critical alerts and system messages</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['all', 'unread'].map((f) => (
            <motion.button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
          <button className="btn btn-sm btn-outline" onClick={markAllRead}>Mark all read</button>
        </div>
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notifs.length === 0 && (
            <div className="empty-state">
              <MdInfo className="es-icon" />
              <p>No notifications here.</p>
            </div>
          )}
          <AnimatePresence>
            {notifs.map((n, i) => {
              const colors = typeToDisplay(n.type);
              return (
                <motion.div
                  key={n._id}
                  className={`notif-card ${!n.read ? 'unread notif-info' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                >
                  <div className="notif-icon" style={{ background: colors.bg, color: colors.icon }}>
                    <MdInfo />
                  </div>
                  <div className="notif-body">
                    <p className="notif-title">{n.title}</p>
                    <p className="notif-desc">{n.message}</p>
                    <span className="notif-time">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="notif-actions">
                    {!n.read && (
                      <motion.button className="btn btn-outline btn-sm btn-icon" title="Mark as read" onClick={() => markRead(n._id)} whileHover={{ scale: 1.1 }}>
                        <MdCheckCircle />
                      </motion.button>
                    )}
                    <motion.button className="btn btn-danger btn-sm btn-icon" title="Dismiss" onClick={() => dismiss(n._id)} whileHover={{ scale: 1.1 }}>
                      <MdDelete />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
