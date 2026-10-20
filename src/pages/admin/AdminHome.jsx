import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Building2, CheckCircle, Clock,
  Droplets, UserCheck, AlertTriangle,
} from "lucide-react";
import { adminApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../admin/css/admin.css";

/* ── Animated counter ── */
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const start = useRef(null);
  const raf   = useRef(null);
  useEffect(() => {
    start.current = null;
    const animate = (ts) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);
  return count;
}

/* ── Single stat card ── */
function StatCard({ label, value, icon: Icon, iconColor, iconBg, sub, delay = 0 }) {
  const count = useCounter(typeof value === "number" ? value : 0);
  return (
    <motion.div
      style={{
        background: "var(--card)", borderRadius: "var(--radius)",
        border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)",
        padding: "var(--space-6)", display: "flex", alignItems: "flex-start",
        gap: "var(--space-4)", position: "relative", overflow: "hidden",
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
    >
      <div aria-hidden style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: iconBg, opacity: .12 }} />
      <div style={{ width: 48, height: 48, borderRadius: "var(--radius-sm)", background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={22} />
      </div>
      <div>
        <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>{label}</p>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text)", lineHeight: 1, marginBottom: 4 }}>
          {typeof value === "number" ? count : value}
        </p>
        {sub && <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function AdminHome({ onNavigate }) {
  const { user }   = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    adminApi.getStats()
      .then((d) => setStats(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const CARDS = stats ? [
    { label: "Total Users",         value: stats.totalUsers,       icon: Users,       iconColor: "#2563EB", iconBg: "#EFF6FF", sub: "All registered users",     delay: 0 },
    { label: "Total Hospitals",     value: stats.totalHospitals,   icon: Building2,   iconColor: "#0EA5E9", iconBg: "#F0F9FF", sub: "Registered hospitals",      delay: .07 },
    { label: "Pending Approvals",   value: stats.pendingHospitals, icon: Clock,       iconColor: "#F59E0B", iconBg: "#FFFBEB", sub: "Awaiting review",           delay: .14 },
    { label: "Approved Hospitals",  value: stats.approvedHospitals,icon: CheckCircle, iconColor: "#10B981", iconBg: "#ECFDF5", sub: "Active on platform",        delay: .21 },
    { label: "Total Donors",        value: stats.totalDonors,      icon: Droplets,    iconColor: "#EF4444", iconBg: "#FEE2E2", sub: "Registered donors",         delay: .28 },
    { label: "Pending Donors",      value: stats.pendingDonors,    icon: UserCheck,   iconColor: "#8B5CF6", iconBg: "#F5F3FF", sub: "Awaiting verification",     delay: .35 },
  ] : [];

  return (
    <div>
      <div className="ad-page-header">
        <div>
          <h1>{greeting}, {user?.name ?? "Admin"} 👋</h1>
          <p>Here's an overview of the MediLink platform.</p>
        </div>
      </div>

      {loading && (
        <div className="ad-loading"><div className="ad-spinner" /><span>Loading statistics…</span></div>
      )}

      {error && (
        <div style={{ background: "var(--danger-soft)", border: "1px solid var(--danger)", borderRadius: "var(--radius-sm)", padding: "14px 18px", marginBottom: "var(--space-5)", color: "#991B1B", fontSize: "var(--text-sm)", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} /> {error} — Is the backend server running?
        </div>
      )}

      {stats && (
        <>
          <div className="ad-stats-grid">
            {CARDS.map((c) => <StatCard key={c.label} {...c} />)}
          </div>

          {/* Quick summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "var(--space-5)" }}>
            {/* Pending hospitals alert */}
            {stats.pendingHospitals > 0 && (
              <motion.div
                className="ad-card"
                style={{ borderLeft: "4px solid var(--warning)" }}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .4 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <Clock size={20} style={{ color: "var(--warning)" }} />
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>Pending Approvals</span>
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 14 }}>
                  {stats.pendingHospitals} hospital{stats.pendingHospitals > 1 ? "s" : ""} waiting for your review.
                </p>
                <button className="ad-btn ad-btn--warning ad-btn--sm" onClick={() => onNavigate("hospitals")}>
                  Review Now →
                </button>
              </motion.div>
            )}

            {/* Rejected hospitals */}
            {stats.rejectedHospitals > 0 && (
              <motion.div
                className="ad-card"
                style={{ borderLeft: "4px solid var(--danger)" }}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .5 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <AlertTriangle size={20} style={{ color: "var(--danger)" }} />
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>Rejected Hospitals</span>
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 14 }}>
                  {stats.rejectedHospitals} hospital registration{stats.rejectedHospitals > 1 ? "s" : ""} rejected.
                </p>
                <button className="ad-btn ad-btn--outline ad-btn--sm" onClick={() => onNavigate("hospitals")}>
                  View Details →
                </button>
              </motion.div>
            )}

            {/* Donor approvals */}
            {stats.pendingDonors > 0 && (
              <motion.div
                className="ad-card"
                style={{ borderLeft: "4px solid var(--purple)" }}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .6 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <Droplets size={20} style={{ color: "var(--purple)" }} />
                  <span style={{ fontWeight: 700, color: "var(--text)" }}>Donor Verifications</span>
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 14 }}>
                  {stats.pendingDonors} donor{stats.pendingDonors > 1 ? "s" : ""} pending verification.
                </p>
                <button className="ad-btn ad-btn--sm" style={{ background: "var(--purple)", color: "#fff" }} onClick={() => onNavigate("donors")}>
                  Manage Donors →
                </button>
              </motion.div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
