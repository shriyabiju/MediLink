import { useState, useEffect, useCallback } from "react";
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
import { donorApi }       from "../../services/api";
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

/* ─────────────────────────────────────────────
   DonorDashboard — shell
   Manages:
     • active page
     • sidebar open state
     • notifications (fetched from real API, passed to header)
───────────────────────────────────────────── */
export default function DonorDashboard() {
  const [active,      setActive]      = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Notifications: fetched from real API ── */
  const [notifs,      setNotifs]      = useState([]);

  const fetchNotifs = useCallback(() => {
    donorApi.getNotifications("all")
      .then(({ notifications }) => setNotifs(notifications))
      .catch(() => { /* Header bell degrades gracefully to 0 unread */ });
  }, []);

  /* Fetch on mount */
  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  /* Refresh notifications when user navigates to the Notifications page */
  const handleNavigate = (page) => {
    setActive(page);
    if (page === "notifications") fetchNotifs();
  };

  /* ── Mark read (optimistic — used by the header bell dropdown) ── */
  const markRead = useCallback((id) => {
    setNotifs((p) => p.map((n) => n._id === id ? { ...n, read: true } : n));
    donorApi.markRead(id).catch(() => {});
  }, []);

  const markAll = useCallback(() => {
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));
    donorApi.markAllRead().catch(() => {});
  }, []);

  /* Sidebar badge: number of unread notifications */
  const unreadCount = notifs.filter((n) => !n.read).length;

  const PageComponent = PAGE_MAP[active] ?? DonorHome;

  return (
    <div className="dd-shell">
      <DonorSidebar
        active={active}
        setActive={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        notifBadge={unreadCount}
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
              <PageComponent onNavigate={handleNavigate} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
