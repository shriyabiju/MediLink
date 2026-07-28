import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdCircle, MdWarning, MdInfo, MdCheckCircle, MdDelete } from 'react-icons/md';

const INITIAL = [
  { id: 1, type: 'danger',  icon: MdCircle,      title: 'Emergency: O- Blood Needed',  body: 'O- blood stock critically low (3 units). Immediate restock required in Trauma Ward.', time: '2 mins ago',  read: false },
  { id: 2, type: 'warning', icon: MdWarning,     title: 'Low Stock: Epinephrine',       body: 'Epinephrine vials down to 8 units. Restock recommended within 24 hours.', time: '18 mins ago', read: false },
  { id: 3, type: 'info',    icon: MdInfo,        title: 'ICU Bed Available',            body: 'ICU Bed #4 is now available after patient discharge. Ready for next admission.', time: '1 hr ago',    read: false },
  { id: 4, type: 'success', icon: MdCheckCircle, title: 'Request Fulfilled',            body: 'Emergency request ER-004 (A+ blood, 2 units) has been successfully fulfilled.', time: '2 hrs ago',   read: true },
  { id: 5, type: 'info',    icon: MdInfo,        title: 'Doctor Schedule Update',       body: 'Dr. Leo Fernandez is now back from leave starting Monday. Updated shift roster.', time: '3 hrs ago',   read: true },
  { id: 6, type: 'warning', icon: MdWarning,     title: 'Medicine Expiring Soon',       body: 'Insulin (3 vials) expires on 2024-12-01. Please restock with fresh batch soon.', time: '5 hrs ago',   read: true },
];

const iconColors = {
  danger:  { bg: '#FEE2E2', icon: '#DC2626' },
  warning: { bg: '#FEF3C7', icon: '#D97706' },
  info:    { bg: '#DBEAFE', icon: '#2563EB' },
  success: { bg: '#D1FAE5', icon: '#10B981' },
};

export default function Notifications() {
  const [notifs, setNotifs]   = useState(INITIAL);
  const [filter, setFilter]   = useState('all');

  const markRead   = (id) => setNotifs((n) => n.map((x) => x.id === id ? { ...x, read: true } : x));
  const markAllRead = () => setNotifs((n) => n.map((x) => ({ ...x, read: true })));
  const dismiss     = (id) => setNotifs((n) => n.filter((x) => x.id !== id));

  const visible = filter === 'all' ? notifs : notifs.filter((n) => !n.read);
  const unread  = notifs.filter((n) => !n.read).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Notifications {unread > 0 && <span style={{ fontSize: '.9rem', color: 'var(--primary-light)' }}>({unread} unread)</span>}</h1>
          <p>Stay updated on critical alerts and system messages</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['all', 'unread'].map((f) => (
            <motion.button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setFilter(f)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
          <button className="btn btn-sm btn-outline" onClick={markAllRead}>
            Mark all read
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.length === 0 && (
          <div className="empty-state">
            <MdInfo className="es-icon" />
            <p>No notifications here.</p>
          </div>
        )}

        <AnimatePresence>
          {visible.map((n, i) => {
            const Icon = n.icon;
            const colors = iconColors[n.type] || iconColors.info;
            return (
              <motion.div
                key={n.id}
                className={`notif-card ${!n.read ? 'unread notif-' + n.type : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <div className="notif-icon" style={{ background: colors.bg, color: colors.icon }}>
                  <Icon />
                </div>
                <div className="notif-body">
                  <p className="notif-title">{n.title}</p>
                  <p className="notif-desc">{n.body}</p>
                  <span className="notif-time">{n.time}</span>
                </div>
                <div className="notif-actions">
                  {!n.read && (
                    <motion.button
                      className="btn btn-outline btn-sm btn-icon"
                      title="Mark as read"
                      onClick={() => markRead(n.id)}
                      whileHover={{ scale: 1.1 }}
                    >
                      <MdCheckCircle />
                    </motion.button>
                  )}
                  <motion.button
                    className="btn btn-danger btn-sm btn-icon"
                    title="Dismiss"
                    onClick={() => dismiss(n.id)}
                    whileHover={{ scale: 1.1 }}
                  >
                    <MdDelete />
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
