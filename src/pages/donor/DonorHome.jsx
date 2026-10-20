import { motion } from "framer-motion";
import {
  Droplets, Heart, CalendarCheck, Users,
  Clock, AlertCircle, CheckCircle, Info,
  Zap, MapPin, FileText, Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import StatCard from "./components/StatCard";
import { DONOR_STATS, DONATION_HISTORY, UPCOMING_APPOINTMENTS, ELIGIBILITY_DISCLAIMER } from "./data/sampleData";
import "./css/donor.css";

/* ── Eligibility banner ── */
function EligibilityBanner({ status }) {
  const MAP = {
    eligible: {
      cls:   "eligible",
      Icon:  CheckCircle,
      title: "You are currently eligible to donate",
      body:  "It has been more than 90 days since your last donation. You can donate whole blood.",
    },
    "not-eligible": {
      cls:   "not-eligible",
      Icon:  Clock,
      title: "Not yet eligible to donate",
      body:  `Next eligible date: ${DONOR_STATS.nextEligibleDate}. Please wait before your next donation.`,
    },
    unknown: {
      cls:   "unknown",
      Icon:  Info,
      title: "Eligibility status unknown",
      body:  "Please complete your profile and consult a healthcare professional to determine eligibility.",
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
  { label: "Express Interest to Donate",  Icon: Droplets,      cls: "dd-quick-btn--primary" },
  { label: "View Nearby Requests",        Icon: MapPin,        cls: "dd-quick-btn--success" },
  { label: "Donation History",            Icon: FileText,      cls: "dd-quick-btn--outline" },
  { label: "View Notifications",          Icon: Bell,          cls: "dd-quick-btn--outline" },
];

/* ── Recent activity items ── */
function ActivityList() {
  const recent = DONATION_HISTORY.slice(0, 3);
  return (
    <div className="dd-activity-list">
      {recent.map((d) => (
        <div className="dd-activity-item" key={d.id}>
          <div
            className="dd-activity-item__icon"
            style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
          >
            <Droplets size={18} />
          </div>
          <div className="dd-activity-item__body">
            <p className="dd-activity-item__title">{d.centre}</p>
            <p className="dd-activity-item__sub">{d.date} · {d.bloodGroup} · {d.units} unit</p>
          </div>
          <span className="dd-badge dd-badge--success">{d.status}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Upcoming appointment ── */
function UpcomingAppointment() {
  if (!UPCOMING_APPOINTMENTS.length) {
    return (
      <div className="dd-empty" style={{ padding: "var(--space-7) var(--space-5)" }}>
        <div className="dd-empty__icon"><CalendarCheck size={26} /></div>
        <p>No upcoming appointments.</p>
      </div>
    );
  }
  const a = UPCOMING_APPOINTMENTS[0];
  return (
    <div
      style={{
        background: "var(--primary-soft)",
        border: "1px solid var(--primary-border)",
        borderRadius: "var(--radius-sm)",
        padding: "16px",
      }}
    >
      <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>
        {a.type}
      </p>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: 2 }}>
        📍 {a.centre}
      </p>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginBottom: 8 }}>
        🗓 {a.date} at {a.time}
      </p>
      <span className="dd-badge dd-badge--success">{a.status}</span>
    </div>
  );
}

/* ── Stat cards data ── */
const STATS = [
  {
    label: "Total Donations",
    value: DONOR_STATS.totalDonations,
    icon:  Droplets,
    iconColor: "#EF4444",
    iconBg:    "#FEE2E2",
    sub:   "Whole blood donations",
    delay: 0,
  },
  {
    label: "Lives Impacted",
    value: DONOR_STATS.livesImpacted,
    icon:  Heart,
    iconColor: "#8B5CF6",
    iconBg:    "#EDE9FE",
    sub:   "Estimated (≈3× donations)",
    delay: 0.07,
  },
  {
    label: "Next Eligible Date",
    value: DONOR_STATS.nextEligibleDate,
    icon:  CalendarCheck,
    iconColor: "#10B981",
    iconBg:    "#D1FAE5",
    sub:   "Based on last donation",
    delay: 0.14,
  },
  {
    label: "Last Donation",
    value: DONOR_STATS.lastDonationDate,
    icon:  Clock,
    iconColor: "#0EA5E9",
    iconBg:    "#E0F2FE",
    sub:   "Most recent record",
    delay: 0.21,
  },
];

export default function DonorHome() {
  const { user } = useAuth();

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>{greeting}, {user?.name ?? "Donor"} 👋</h1>
          <p>Here's an overview of your donor activity and nearby blood requests.</p>
        </div>
      </div>

      {/* ── Eligibility banner ── */}
      <EligibilityBanner status={DONOR_STATS.eligibilityStatus} />
      <p className="dd-disclaimer">{ELIGIBILITY_DISCLAIMER}</p>

      {/* ── Stat cards ── */}
      <div className="dd-stats-grid" style={{ marginTop: "var(--space-5)" }}>
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="dd-card__header">
          <h3 className="dd-card__title"><Zap size={16} /> Quick Actions</h3>
        </div>
        <div className="dd-quick-actions">
          {ACTIONS.map(({ label, Icon, cls }) => (
            <button key={label} className={`dd-quick-btn ${cls}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-column section ── */}
      <div className="dd-two-col">
        {/* Recent activity */}
        <div className="dd-card">
          <div className="dd-card__header">
            <h3 className="dd-card__title"><Clock size={16} /> Recent Donation Activity</h3>
            <button className="dd-link-btn">View all</button>
          </div>
          <ActivityList />
        </div>

        {/* Upcoming appointment */}
        <div className="dd-card">
          <div className="dd-card__header">
            <h3 className="dd-card__title"><CalendarCheck size={16} /> Upcoming Appointment</h3>
          </div>
          <UpcomingAppointment />
        </div>
      </div>

      {/* ── Donor profile summary ── */}
      <motion.div
        className="dd-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="dd-card__header">
          <h3 className="dd-card__title"><Users size={16} /> Your Donor Profile Summary</h3>
          <button className="dd-link-btn">Edit Profile</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "var(--space-4)" }}>
          {[
            { label: "Blood Group",       value: "O+"             },
            { label: "Eligibility",       value: "Eligible ✅"   },
            { label: "Total Donations",   value: "6 times"        },
            { label: "Verification",      value: "Verified ✅"   },
            { label: "City",              value: "Bengaluru"      },
            { label: "Last Donation",     value: "20 Jul 2026"   },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "14px" }}>
              <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)", marginBottom: 4 }}>
                {label}
              </p>
              <p style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--text)" }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
