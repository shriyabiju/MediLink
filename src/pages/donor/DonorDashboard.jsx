import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DonorSidebar       from "./components/DonorSidebar";
import DonorHeader        from "./components/DonorHeader";
import DonorHome          from "./DonorHome";
import DonorProfile       from "./DonorProfile";
import BloodDonation      from "./BloodDonation";
import NearbyRequests     from "./NearbyRequests";
import DonationHistory    from "./DonationHistory";
import DonorNotifications from "./DonorNotifications";
import DonorSettings      from "./DonorSettings";
import { NOTIFICATIONS as INITIAL_NOTIFS } from "./data/sampleData";
import "./css/donor.css";

const PAGE_MAP = {
  home:          DonorHome,
  profile:       DonorProfile,
  blood:         BloodDonation,
  requests:      NearbyRequests,
  history:       DonationHistory,
  notifications: DonorNotifications,
  settings:      DonorSettings,
};

const pageTransition = {
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -10 },
  transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
};

export default function DonorDashboard() {
  const [active,      setActive]      = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifs,      setNotifs]      = useState(INITIAL_NOTIFS);

  const markRead = (id) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAll  = ()   => setNotifs((p) => p.map((n) => ({ ...n, read: true })));

  const PageComponent = PAGE_MAP[active] ?? DonorHome;

  return (
    <div className="dd-shell">
      <DonorSidebar
        active={active}
        setActive={setActive}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dd-main">
        <DonorHeader
          onMenuClick={() => setSidebarOpen((p) => !p)}
          notifications={notifs}
          onMarkRead={markRead}
          onMarkAll={markAll}
        />

        <main className="dd-content" id="main-content">
          <AnimatePresence mode="wait">
            <motion.div key={active} {...pageTransition}>
              <PageComponent onNavigate={setActive} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
