import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AdminSidebar        from "./components/AdminSidebar";
import AdminHeader         from "./components/AdminHeader";
import Toast               from "./components/Toast";
import AdminHome           from "./AdminHome";
import HospitalVerification from "./HospitalVerification";
import BloodBankManagement  from "./BloodBankManagement";
import DonorManagement     from "./DonorManagement";
import UserManagement      from "./UserManagement";
import RequestsOverview    from "./RequestsOverview";
import { adminApi }        from "../../services/api";
import "./css/admin.css";

const PAGE_MAP = {
  dashboard:  AdminHome,
  hospitals:  HospitalVerification,
  bloodbanks: BloodBankManagement,
  donors:     DonorManagement,
  users:      UserManagement,
  requests:   RequestsOverview,
};

const PAGE_TITLES = {
  dashboard:  "Dashboard",
  hospitals:  "Hospital Verification",
  bloodbanks: "Blood Bank Management",
  donors:     "Donor Management",
  users:      "User Management",
  requests:   "Requests Overview",
};

const transition = {
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  exit:       { opacity: 0, y: -10 },
  transition: { duration: 0.26, ease: [0.4, 0, 0.2, 1] },
};

let toastId = 0;

export default function AdminDashboard() {
  const [active,      setActive]      = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast,       setToast]       = useState(null);
  const [pendingCount,setPendingCount]= useState(0);

  /* Fetch total pending items (hospitals + blood banks + donors)
     so the sidebar badge reflects real data */
  useEffect(() => {
    adminApi.getStats()
      .then((d) => {
        const total = (d.pendingHospitals || 0) + (d.pendingBloodBanks || 0) + (d.pendingDonors || 0);
        setPendingCount(total);
      })
      .catch(() => {}); // non-critical — badge silently stays 0 if stats fail
  }, []);

  const showToast = useCallback((type, message) => {
    setToast({ id: ++toastId, type, message });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const PageComponent = PAGE_MAP[active] ?? AdminHome;

  return (
    <div className="ad-shell">
      <AdminSidebar
        active={active}
        setActive={setActive}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCount={pendingCount}
      />

      <div className="ad-main">
        <AdminHeader
          onMenuClick={() => setSidebarOpen((p) => !p)}
          pageTitle={PAGE_TITLES[active] ?? "Admin"}
        />

        <main className="ad-content" id="main-content">
          <AnimatePresence mode="wait">
            <motion.div key={active} {...transition}>
              <PageComponent
                showToast={showToast}
                onNavigate={setActive}
              />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Toast toast={toast} onClose={dismissToast} />
    </div>
  );
}
