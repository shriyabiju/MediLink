import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, CheckCircle, Clock, AlertCircle, Info, CalendarCheck } from "lucide-react";
import StatCard from "./components/StatCard";
import { DONOR_STATS, DONOR_PROFILE, DONATION_HISTORY, ELIGIBILITY_DISCLAIMER } from "./data/sampleData";
import "./css/donor.css";

/* ── General info about blood donation ── */
const INFO_ITEMS = [
  { emoji: "💉", title: "Whole Blood", body: "The most common type. The entire blood is collected and later separated into components. Takes about 8–10 minutes." },
  { emoji: "🩸", title: "Plasma Donation", body: "Only the liquid portion of blood is collected. Takes about 1.5 hours. Donors can give more frequently." },
  { emoji: "🔬", title: "Platelets", body: "Only platelets are collected. Helps patients with cancer and surgery. Takes about 2–3 hours." },
  { emoji: "❤️", title: "Why Donate?", body: "One donation can save up to 3 lives. Blood cannot be manufactured — it can only come from donors." },
];

/* ── Who can donate (general guidelines — not medical advice) ── */
const GUIDELINES = [
  "Generally aged between 18 and 65 (varies by region and donation type)",
  "Generally weigh at least 50 kg",
  "In good general health on the day of donation",
  "Have not donated whole blood in the past 90 days",
  "Do not have certain medical conditions or take certain medications",
  "Have not recently travelled to high-risk malaria areas",
];

/* ── Interest form ── */
function InterestForm({ onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ date: "", centre: "", notes: "" });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    /* In production: POST /api/donor/interest */
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "var(--space-7) var(--space-5)" }}>
        <CheckCircle size={52} color="var(--success)" style={{ margin: "0 auto var(--space-4)" }} />
        <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-lg)", color: "var(--text)", marginBottom: 8 }}>
          Interest Registered!
        </h3>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: "var(--space-5)" }}>
          We've noted your interest. A coordinator will contact you to confirm your appointment.
          Actual eligibility will be confirmed by a healthcare professional before donation.
        </p>
        <button className="dd-quick-btn dd-quick-btn--outline" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: "var(--space-5) 0" }}>
        <div className="dd-form-group">
          <label className="dd-form-label" htmlFor="don-date">Preferred Date</label>
          <input
            id="don-date"
            type="date"
            className="dd-form-input"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            required
          />
        </div>
        <div className="dd-form-group">
          <label className="dd-form-label" htmlFor="don-centre">Preferred Donation Centre</label>
          <input
            id="don-centre"
            className="dd-form-input"
            placeholder="e.g. Apollo Blood Bank, Bengaluru"
            value={form.centre}
            onChange={(e) => set("centre", e.target.value)}
            required
          />
        </div>
        <div className="dd-form-group">
          <label className="dd-form-label" htmlFor="don-notes">Any notes (optional)</label>
          <textarea
            id="don-notes"
            className="dd-form-input"
            placeholder="e.g. Please confirm a day before"
            rows={3}
            style={{ resize: "vertical" }}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontStyle: "italic" }}>
          {ELIGIBILITY_DISCLAIMER}
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="dd-quick-btn dd-quick-btn--outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="dd-quick-btn dd-quick-btn--primary">
            <Droplets size={15} /> Submit Interest
          </button>
        </div>
      </div>
    </form>
  );
}

export default function BloodDonation() {
  const [showInterest, setShowInterest] = useState(false);

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>Blood Donation</h1>
          <p>Your blood group, donation status, history, and eligibility information.</p>
        </div>
        <button
          className="dd-quick-btn dd-quick-btn--primary"
          onClick={() => setShowInterest(true)}
        >
          <Droplets size={15} /> Express Interest to Donate
        </button>
      </div>

      {/* ── Interest modal ── */}
      <AnimatePresence>
        {showInterest && (
          <motion.div
            style={{
              position: "fixed", inset: 0,
              background: "rgba(15,23,42,.5)",
              backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 500, padding: 20,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowInterest(false); }}
          >
            <motion.div
              style={{ background: "#fff", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 520, padding: "var(--space-7)", boxShadow: "var(--shadow-lg)" }}
              initial={{ scale: .92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: .92, opacity: 0 }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-lg)", color: "var(--text)" }}>
                  Express Donation Interest
                </h3>
                <button
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.1rem" }}
                  onClick={() => setShowInterest(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <InterestForm onClose={() => setShowInterest(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Blood group + stats ── */}
      <div className="dd-two-col" style={{ marginBottom: "var(--space-5)" }}>
        <div className="dd-card">
          <div className="dd-card__header">
            <h3 className="dd-card__title"><Droplets size={16} /> Your Blood Group</h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
            <div className="dd-blood-group-badge">{DONOR_PROFILE.bloodGroup}</div>
            <div>
              <p style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text)", marginBottom: 4, fontFamily: "var(--font-heading)" }}>
                Type {DONOR_PROFILE.bloodGroup}
              </p>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                {DONOR_PROFILE.bloodGroup === "O+" || DONOR_PROFILE.bloodGroup === "O-"
                  ? "Universal donor to certain blood groups"
                  : "Suitable for recipients of the same or compatible blood group"}
              </p>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 8, fontStyle: "italic" }}>
                Always confirm compatibility with a healthcare professional.
              </p>
            </div>
          </div>
        </div>

        <div className="dd-card">
          <div className="dd-card__header">
            <h3 className="dd-card__title"><CalendarCheck size={16} /> Eligibility Status</h3>
          </div>
          <div
            className={`dd-eligibility-banner ${DONOR_STATS.eligibilityStatus}`}
            style={{ marginBottom: 0 }}
          >
            <div className="dd-eligibility-banner__icon">
              {DONOR_STATS.eligibilityStatus === "eligible"
                ? <CheckCircle size={20} />
                : <Clock size={20} />
              }
            </div>
            <div className="dd-eligibility-banner__body">
              <strong>
                {DONOR_STATS.eligibilityStatus === "eligible"
                  ? "Currently Eligible"
                  : "Not Yet Eligible"}
              </strong>
              <p>Next eligible: {DONOR_STATS.nextEligibleDate}</p>
            </div>
          </div>
          <p className="dd-disclaimer" style={{ marginTop: "var(--space-3)" }}>
            {ELIGIBILITY_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* ── Donation stats ── */}
      <div className="dd-stats-grid" style={{ marginBottom: "var(--space-5)" }}>
        {[
          { label: "Total Donations", value: DONOR_STATS.totalDonations, icon: Droplets, iconColor: "#EF4444", iconBg: "#FEE2E2", sub: "All time" },
          { label: "Last Donation",   value: DONOR_STATS.lastDonationDate, icon: Clock, iconColor: "#0EA5E9", iconBg: "#E0F2FE", sub: "Most recent" },
          { label: "Next Eligible",   value: DONOR_STATS.nextEligibleDate, icon: CalendarCheck, iconColor: "#10B981", iconBg: "#D1FAE5", sub: "Approx. date" },
        ].map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.1} />
        ))}
      </div>

      {/* ── About blood donation ── */}
      <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="dd-card__header">
          <h3 className="dd-card__title"><Info size={16} /> About Blood Donation</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "var(--space-4)" }}>
          {INFO_ITEMS.map(({ emoji, title, body }) => (
            <div
              key={title}
              style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "var(--space-4)" }}
            >
              <p style={{ fontSize: "1.5rem", marginBottom: 8 }}>{emoji}</p>
              <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{title}</p>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.6 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Who can donate ── */}
      <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="dd-card__header">
          <h3 className="dd-card__title"><AlertCircle size={16} /> General Eligibility Guidelines</h3>
        </div>
        <ul style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", paddingLeft: 0, listStyle: "none" }}>
          {GUIDELINES.map((g) => (
            <li key={g} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)", fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--success)", marginTop: 2, flexShrink: 0 }}>✓</span> {g}
            </li>
          ))}
        </ul>
        <div
          style={{ background: "var(--warning-soft)", border: "1px solid var(--warning)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginTop: "var(--space-4)" }}
        >
          <p style={{ fontSize: "var(--text-xs)", color: "#92400E", fontWeight: 600 }}>
            ⚠ Important: {ELIGIBILITY_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* ── Recent donation history ── */}
      <div className="dd-card">
        <div className="dd-card__header">
          <h3 className="dd-card__title"><Clock size={16} /> Recent Donation History</h3>
          <button className="dd-link-btn">View full history</button>
        </div>
        <div className="dd-activity-list">
          {DONATION_HISTORY.slice(0, 4).map((d) => (
            <div className="dd-activity-item" key={d.id}>
              <div className="dd-activity-item__icon" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
                <Droplets size={18} />
              </div>
              <div className="dd-activity-item__body">
                <p className="dd-activity-item__title">{d.centre}</p>
                <p className="dd-activity-item__sub">{d.date} · Blood Group {d.bloodGroup} · {d.units} unit</p>
              </div>
              <span className="dd-badge dd-badge--success">{d.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
