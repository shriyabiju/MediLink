import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdDashboard, MdLocalHospital, MdOpacity, MdPeople,
  MdMedication, MdBedroomParent, MdEmergency,
  MdBarChart, MdNotifications, MdSettings, MdLogout,
} from 'react-icons/md';
import '../css/sidebar.css';

const NAV = [
  { id: 'dashboard',         label: 'Dashboard',         icon: MdDashboard },
  { id: 'profile',           label: 'Hospital Profile',  icon: MdLocalHospital },
  { id: 'blood',             label: 'Blood Inventory',   icon: MdOpacity,         badge: 2 },
  { id: 'doctors',           label: 'Doctors',           icon: MdPeople },
  { id: 'medicines',         label: 'Medicine Inventory', icon: MdMedication },
  { id: 'beds',              label: 'Bed Management',    icon: MdBedroomParent },
  { id: 'emergency',         label: 'Emergency Requests', icon: MdEmergency,       badge: 5 },
  { id: 'reports',           label: 'Reports',           icon: MdBarChart },
  { id: 'notifications',     label: 'Notifications',     icon: MdNotifications,   badge: 3 },
  { id: 'settings',          label: 'Settings',          icon: MdSettings },
];

const sidebarVariants = {
  open:   { x: 0,    opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  closed: { x: -280, opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

export default function Sidebar({ active, setActive, isOpen, onClose }) {
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
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=80&auto=format&fit=crop"
              alt="Admin"
            />
            <div className="sidebar-user-info">
              <strong>Dr. A. Pendelton</strong>
              <span>Administrator</span>
            </div>
          </div>
          <button className="logout-btn">
            <MdLogout />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
