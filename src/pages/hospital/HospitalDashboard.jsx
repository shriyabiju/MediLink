import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardHome from './DashboardHome';
import HospitalProfile from './HospitalProfile';
import BloodInventory from './BloodInventory';
import Doctors from './Doctors';
import Medicines from './Medicines';
import BedManagement from './BedManagement';
import EmergencyRequests from './EmergencyRequests';
import Reports from './Reports';
import Notifications from './Notifications';
import Settings from './Settings';
import OtherHospitals from './OtherHospitals';
import DonorDirectory from './DonorDirectory';
import AllBloodRequests from './AllBloodRequests';
import './css/dashboard.css';

const PAGE_MAP = {
  dashboard:      DashboardHome,
  profile:        HospitalProfile,
  blood:          BloodInventory,
  doctors:        Doctors,
  medicines:      Medicines,
  beds:           BedManagement,
  emergency:      EmergencyRequests,
  reports:        Reports,
  notifications:  Notifications,
  settings:       Settings,
  otherhospitals: OtherHospitals,
  donors:         DonorDirectory,
  allrequests:    AllBloodRequests,
};

const pageTransition = {
  initial:   { opacity: 0, y: 18 },
  animate:   { opacity: 1, y: 0 },
  exit:      { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export default function HospitalDashboard() {
  const [active, setActive]   = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const PageComponent = PAGE_MAP[active] || DashboardHome;

  return (
    <div className="hd-shell">
      <Sidebar
        active={active}
        setActive={setActive}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="hd-main">
        <Header onMenuClick={() => setSidebarOpen((p) => !p)} />

        <main className="hd-content">
          <AnimatePresence mode="wait">
            <motion.div key={active} {...pageTransition}>
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
