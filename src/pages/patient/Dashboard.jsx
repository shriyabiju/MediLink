import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PatientSidebar from "./components/PatientSidebar";
import PatientHeader  from "./components/PatientHeader";
import PatientHome    from "./PatientHome";

/* ── Placeholder for pages not yet built ── */
const Placeholder = ({ title }) => (
  <div style={{ padding: "var(--space-7) var(--space-8)" }}>
    <div style={{
      background: "#fff",
      borderRadius: "var(--radius)",
      border: "1px solid var(--border)",
      padding: "var(--space-10)",
      textAlign: "center",
      boxShadow: "var(--shadow-sm)",
    }}>
      <div style={{ fontSize: "3rem", marginBottom: "var(--space-4)" }}>🚧</div>
      <h2 style={{
        fontFamily: "var(--font-heading)",
        fontSize: "var(--text-xl)",
        fontWeight: 700,
        color: "var(--text)",
        marginBottom: "var(--space-2)",
      }}>
        {title}
      </h2>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
        This section is coming soon.
      </p>
    </div>
  </div>
);

/* ── Page map ── */
const PAGE_MAP = {
  dashboard:        () => <PatientHome />,
  hospitals:        () => <Placeholder title="Hospitals" />,
  "blood-banks":    () => <Placeholder title="Blood Banks" />,
  emergency:        () => <Placeholder title="Emergency" />,
  appointments:     () => <Placeholder title="Appointments" />,
  "medical-history":() => <Placeholder title="Medical History" />,
  notifications:    () => <Placeholder title="Notifications" />,
  profile:          () => <Placeholder title="Profile" />,
  settings:         () => <Placeholder title="Settings" />,
};

/* ── Page transition ── */
const pageTransition = {
  initial:    { opacity: 0, y: 16  },
  animate:    { opacity: 1, y: 0   },
  exit:       { opacity: 0, y: -10 },
  transition: { duration: 0.26, ease: [0.4, 0, 0.2, 1] },
};

export default function PatientDashboard() {
  const [active,      setActive]      = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const PageComponent = PAGE_MAP[active] ?? PAGE_MAP.dashboard;

  return (
    <div className="pd-shell">
      <PatientSidebar
        active={active}
        setActive={setActive}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="pd-main">
        <PatientHeader
          onMenuClick={() => setSidebarOpen((p) => !p)}
        />

        <main className="pd-content" id="main-content">
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
