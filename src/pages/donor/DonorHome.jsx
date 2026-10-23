import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Droplets, Heart, CalendarCheck, Users,
  Clock, CheckCircle, Info, Zap,
  MapPin, FileText, Bell, AlertCircle, RefreshCw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { donorApi } from "../../services/api";
import StatCard from "./components/StatCard";
import { ELIGIBILITY_DISCLAIMER } from "./data/sampleData";
import "./css/donor.css";

/* ── Eligibility banner ── */
function EligibilityBanner({ status }) {
  const MAP = {
    eligible: {
      cls: "eligible", Icon: CheckCircle,
      title: "You are currently eligible to donate",
      body:  "It has been more than 90 days since your last completed donation.",
    },
    "not-eligible": {
      cls: "not-eligible", Icon: Clock,
      title: "Not yet eligible to donate",
      body:  "Please wait 90 days from your last completed donation.",
    },
    unknown: {
      cls: "unknown", Icon: Info,
      title: "Eligibility status unknown",
      body:  "Complete your profile and log at least one completed donation to calculate eligibility.",
    },
  };
  const { cls, Icon, title, body } = MAP[status] ?? MAP.unknown;

  return (
    <div className={`dd-eligibility-banner ${cls}`}>
      <div className="dd-eligibility-banner__icon"><Icon size={22} /></div>
      <div className="dd-eligibility-banner__body">
        <strong>{title}</strong>
        <p>{body}</p>
      </div>
    </div>
  );
}

/* ── Quick actions ── */
const ACTIONS = [
  { label: "Express Interest to Donate", Icon: Droplets, cls: "dd-quick-btn--primary",  page: "blood"     },
  { label: "View Nearby Requests",       Icon: MapPin,   cls: "dd-quick-btn--success",  page: "requests"  },
  { label: "Donation History",           Icon: FileText, cls: "dd-quick-btn--outline",  page: "history"   },
  { label: "View Notifications",         Icon: Bell,     cls: "dd-quick-btn--outline",  page: "notifications" },
];

/* ── Recent donation activity row ── */
const STATUS_CLS = {
  pending:   "dd-badge--warning",
  confirmed: "dd-badge--info",
  completed: "dd-badge--success",
  cancelled: "dd-badge--danger",
};

function RecentActivity({ donations }) {
  if (!donations.length) {
    return (
      <div className="dd-empty" style={{ padding: "var(--space-6) var(--space-4)" }}>
        <div className="dd-empty__icon"><Droplets size={22} /></div>
        <p>No donation submissions yet. Use the Blood Donation page to express interest.</p>
      </div>
    );
  }
  return (
    <div className="dd-activity-list">
      {donations.slice(0, 4).map((d) => (
        <div className="dd-activity-item" key={d._id}>
          <div className="dd-activity-item__icon" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
            <Droplets size={18} />
          </div>
          <div className="dd-activity-item__body">
            <p className="dd-activity-item__title">{d.centre}</p>
            <p className="dd-activity-item__sub">
              {new Date(d.preferredDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              {" · "}{d.bloodGroup}{" · "}{d.donationType}
            </p>
          </div>
          <span className={`dd-badge ${STATUS_CLS[d.status] ?? "dd-badge--neutral"}`}>
            {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main DonorHome page
───────────────────────────────────────────── */
export default function DonorHome({ onNavigate }) {
  const { user: authUser } = useAuth();

  const [stats,     setStats]     = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");

  const fetchData = () => {
    setLoading(true);
    setError("");

    Promise.all([
      donorApi.getDashboard(),
      donorApi.getMyDonations(),
    ])
      .then(([dashData, histData]) => {
        setStats(dashData);
        setDonations(histData.donations || []);
      })
      .catch((err) => setError(err.message || "Failed to load dashboard data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  /* Greeting */
  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  /* Derived values for display */
  const lastDonationLabel = stats?.lastDonationDate
    ? new Date(stats.lastDonationDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
    : "—";
  const nextEligibleLabel = stats?.nextEligibleDate
    ? new Date(stats.nextEligibleDate).toLocaleDateString("en-IN", { dateStyle: "medium" })
    : "—";

  const STAT_CARDS = stats ? [
    {
      label: "Total Submissions",  value: stats.totalSubmissions,
      icon: Droplets, iconColor: "#EF4444", iconBg: "#FEE2E2",
      sub: "Donation interests", delay: 0,
    },
    {
      label: "Completed Donations",value: stats.completedDonations,
      icon: Heart, iconColor: "#8B5CF6", iconBg: "#EDE9FE",
      sub: "Verified by centre",  delay: 0.07,
    },
    {
      label: "Next Eligible",      value: nextEligibleLabel,
      icon: CalendarCheck, iconColor: "#10B981", iconBg: "#D1FAE5",
      sub: "Based on last donation", delay: 0.14,
    },
    {
      label: "Last Donation",      value: lastDonationLabel,
      icon: Clock, iconColor: "#0EA5E9", iconBg: "#E0F2FE",
      sub: "Most recent completed", delay: 0.21,
    },
  ] : [];

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>{greeting}, {authUser?.name ?? "Donor"} 👋</h1>
          <p>Here's an overview of your donor activity and nearby blood requests.</p>
        </div>
        {!loading && (
          <button
            className="dd-quick-btn dd-quick-btn--outline"
            onClick={fetchData}
            title="Refresh dashboard"
            style={{ padding: "8px 14px" }}
          >
            <RefreshCw size={15} /> Refresh
          </button>
        )}
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{
          background: "var(--danger-soft)", border: "1px solid var(--danger)",
          borderRadius: "var(--radius-sm)", padding: "12px 18px",
          marginBottom: "var(--space-5)", color: "#991B1B",
          fontSize: "var(--text-sm)", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertCircle size={15} /> {error} — Is the backend server running?
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <>
          <div className="skeleton" style={{ height: 68, borderRadius: "var(--radius-sm)", marginBottom: "var(--space-5)" }} />
          <div className="dd-stats-grid" style={{ marginBottom: "var(--space-5)" }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ height: 110, borderRadius: "var(--radius)" }} />
            ))}
          </div>
        </>
      )}

      {/* ── Eligibility banner ── */}
      {!loading && stats && (
        <>
          <EligibilityBanner status={stats.eligibilityStatus} />
          <p className="dd-disclaimer" style={{ marginBottom: "var(--space-5)" }}>
            {ELIGIBILITY_DISCLAIMER}
          </p>
        </>
      )}

      {/* ── Stat cards ── */}
      {!loading && stats && (
        <div className="dd-stats-grid" style={{ marginTop: "var(--space-3)", marginBottom: "var(--space-5)" }}>
          {STAT_CARDS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      {/* ── Blood request alert (if matching requests exist) ── */}
      {!loading && stats && stats.matchingRequestsCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "var(--danger-soft)",
            border: "1.5px solid rgba(239,68,68,.35)",
            borderRadius: "var(--radius-sm)",
            padding: "14px 18px",
            marginBottom: "var(--space-5)",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: "var(--space-4)",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Droplets size={20} style={{ color: "var(--danger)", flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "#991B1B" }}>
                {stats.matchingRequestsCount} blood request{stats.matchingRequestsCount > 1 ? "s" : ""} need{stats.matchingRequestsCount === 1 ? "s" : ""} your blood group ({stats.bloodGroup || "—"})
              </p>
              <p style={{ fontSize: "var(--text-xs)", color: "#991B1B", opacity: .8 }}>
                Respond to help someone in need.
              </p>
            </div>
          </div>
          <button
            className="dd-quick-btn dd-quick-btn--danger"
            onClick={() => onNavigate?.("requests")}
            style={{ flexShrink: 0 }}
          >
            View Requests →
          </button>
        </motion.div>
      )}

      {/* ── Quick actions ── */}
      <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="dd-card__header">
          <h3 className="dd-card__title"><Zap size={16} /> Quick Actions</h3>
        </div>
        <div className="dd-quick-actions">
          {ACTIONS.map(({ label, Icon, cls, page }) => (
            <button
              key={label}
              className={`dd-quick-btn ${cls}`}
              onClick={() => onNavigate?.(page)}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-column: recent activity + profile summary ── */}
      <div className="dd-two-col">

        {/* Recent donation activity */}
        <div className="dd-card">
          <div className="dd-card__header">
            <h3 className="dd-card__title"><Clock size={16} /> Recent Donation Activity</h3>
            <button className="dd-link-btn" onClick={() => onNavigate?.("history")}>View all</button>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 52, borderRadius: "var(--radius-sm)" }} />
              ))}
            </div>
          ) : (
            <RecentActivity donations={donations} />
          )}
        </div>

        {/* Profile summary from real data */}
        <div className="dd-card">
          <div className="dd-card__header">
            <h3 className="dd-card__title"><Users size={16} /> Your Donor Summary</h3>
            <button className="dd-link-btn" onClick={() => onNavigate?.("profile")}>Edit Profile</button>
          </div>
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: 52, borderRadius: "var(--radius-sm)" }} />
              ))}
            </div>
          ) : stats ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "var(--space-3)" }}>
              {[
                { label: "Blood Group",    value: stats.bloodGroup || "Not set" },
                {
                  label: "Verification",
                  value: stats.donorStatus === "approved" ? "Verified ✅"
                       : stats.donorStatus === "pending"  ? "Pending ⏳"
                       : "Rejected ✗",
                },
                { label: "Completed",      value: `${stats.completedDonations} donation${stats.completedDonations !== 1 ? "s" : ""}` },
                { label: "Pending",        value: `${stats.pendingDonations} awaiting` },
                { label: "Lives Impacted", value: `≈ ${stats.livesImpacted}` },
                { label: "City",           value: stats.city || "Not set" },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: "var(--bg-alt)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)", padding: "12px",
                }}>
                  <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 4 }}>
                    {label}
                  </p>
                  <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text)" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
