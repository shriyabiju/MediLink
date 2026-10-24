import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MdDashboard, MdLocalHospital, MdOpacity, MdPeople,
  MdMedication, MdBedroomParent, MdEmergency,
  MdBarChart, MdNotifications, MdSettings, MdLogout,
  MdBloodtype, MdBusinessCenter,
} from 'react-icons/md';
import { useAuth } from '../../../context/AuthContext';
import '../css/sidebar.css';

const NAV = [
  { id: 'dashboard',      label: 'Dashboard',         icon: MdDashboard },
  { id: 'profile',        label: 'Hospital Profile',  icon: MdLocalHospital },
  { id: 'blood',          label: 'Blood Inventory',   icon: MdOpacity },
  { id: 'doctors',        label: 'Doctors',           icon: MdPeople },
  { id: 'medicines',      label: 'Medicine Inventory', icon: MdMedication },
  { id: 'beds',           label: 'Bed Management',    icon: MdBedroomParent },
  { id: 'emergency',      label: 'Emergency Requests', icon: MdEmergency },
  { id: 'otherhospitals', label: 'Other Hospitals',   icon: MdBusinessCenter },
  { id: 'donors',         label: 'Donor Directory',   icon: MdBloodtype },
  { id: 'allrequests',    label: 'All Blood Requests', icon: MdOpacity },
  { id: 'reports',        label: 'Reports',           icon: MdBarChart },
  { id: 'notifications',  label: 'Notifications',     icon: MdNotifications },
  { id: 'settings',       label: 'Settings',          icon: MdSettings },
];

const sidebarVariants = {
  open:   { x: 0,    opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  closed: { x: -280, opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

export default function Sidebar({ active, setActive, isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'H';

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ zIndex: 199 }}
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`hd-sidebar ${isOpen ? 'open' : ''}`}
        variants={sidebarVariants}
        initial={false}
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon-wrap">
            <MdLocalHospital />
          </div>
          <div className="brand-text">
            <h2>MediLink</h2>
            <span>Hospital Portal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <p className="nav-section-label">Main Menu</p>
          {NAV.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                className={`nav-item ${active === item.id ? 'active' : ''}`}
                onClick={() => { setActive(item.id); onClose(); }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                whileHover={{ x: 4 }}
              >
                <span className="nav-icon"><Icon /></span>
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </motion.div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="td-avatar-initials" style={{ borderRadius: 10, width: 34, height: 34 }}>
              {initials}
            </div>
            <div className="sidebar-user-info">
              <strong>{user?.name ?? 'Hospital Staff'}</strong>
              <span>Hospital Staff</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <MdLogout />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
