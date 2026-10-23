import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets, CheckCircle, Clock, AlertCircle,
  Info, CalendarCheck, X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { donorApi } from "../../services/api";
import StatCard from "./components/StatCard";
import { BLOOD_GROUPS, ELIGIBILITY_DISCLAIMER } from "./data/sampleData";
import "./css/donor.css";

/* ─────────────────────────────────────────────
   Static info blocks (no backend needed)
───────────────────────────────────────────── */
const INFO_ITEMS = [
  { emoji: "💉", title: "Whole Blood",     body: "The most common type. Collected in full and separated into components. Takes about 8–10 minutes." },
  { emoji: "🩸", title: "Plasma Donation", body: "Only the liquid portion is collected. Takes about 1.5 hours. Donors can give more frequently." },
  { emoji: "🔬", title: "Platelets",       body: "Only platelets are collected. Helps cancer and surgery patients. Takes about 2–3 hours." },
  { emoji: "❤️", title: "Why Donate?",    body: "One donation can save up to 3 lives. Blood cannot be manufactured — it can only come from donors." },
];

const GUIDELINES = [
  "Generally aged between 18 and 65 (varies by region and donation type)",
  "Generally weigh at least 50 kg",
  "In good general health on the day of donation",
  "Have not donated whole blood in the past 90 days",
  "Do not have certain medical conditions or take certain medications",
  "Have not recently travelled to high-risk malaria areas",
];

const DONATION_TYPES = ["Whole Blood", "Plasma", "Platelets", "Other"];

/* ─────────────────────────────────────────────
   Interest Form — connected to real API
───────────────────────────────────────────── */
function InterestForm({ donorBloodGroup, onSuccess, onClose }) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    bloodGroup:   donorBloodGroup || "",
    donationType: "Whole Blood",
    preferredDate: "",
    centre:        "",
    notes:         "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    /* Client-side pre-validation */
    if (!form.bloodGroup) { setError("Please select your blood group."); return; }
    if (!form.preferredDate) { setError("Please select a preferred donation date."); return; }
    if (!form.centre.trim()) { setError("Please enter the donation centre or hospital name."); return; }

    setSubmitting(true);
    try {
      const data = await donorApi.submitDonation({
        bloodGroup:    form.bloodGroup,
        donationType:  form.donationType,
        preferredDate: form.preferredDate,
        centre:        form.centre,
        notes:         form.notes,
      });
      onSuccess(data.donation);
    } catch (err) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", padding: "var(--space-5) 0" }}>

        {error && (
          <div style={{
            background: "var(--danger-soft)", border: "1px solid var(--danger)",
            borderRadius: "var(--radius-sm)", padding: "10px 14px",
            color: "#991B1B", fontSize: "var(--text-sm)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Blood group */}
        <div className="dd-form-group">
          <label className="dd-form-label" htmlFor="don-bg">
            Blood Group <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <select
            id="don-bg"
            className="dd-form-input dd-form-select"
            value={form.bloodGroup}
            onChange={(e) => set("bloodGroup", e.target.value)}
            required
          >
            <option value="">— Select —</option>
            {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Donation type */}
        <div className="dd-form-group">
          <label className="dd-form-label" htmlFor="don-type">Donation Type</label>
          <select
            id="don-type"
            className="dd-form-input dd-form-select"
            value={form.donationType}
            onChange={(e) => set("donationType", e.target.value)}
          >
            {DONATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Preferred date */}
        <div className="dd-form-group">
          <label className="dd-form-label" htmlFor="don-date">
            Preferred Date <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            id="don-date"
            type="date"
            className="dd-form-input"
            value={form.preferredDate}
            min={today}
            onChange={(e) => set("preferredDate", e.target.value)}
            required
          />
        </div>

        {/* Donation centre */}
        <div className="dd-form-group">
          <label className="dd-form-label" htmlFor="don-centre">
            Donation Centre / Hospital <span style={{ color: "var(--danger)" }}>*</span>
          </label>
          <input
            id="don-centre"
            type="text"
            className="dd-form-input"
            placeholder="e.g. Apollo Blood Bank, Bengaluru"
            value={form.centre}
            onChange={(e) => set("centre", e.target.value)}
            required
          />
        </div>

        {/* Notes */}
        <div className="dd-form-group">
          <label className="dd-form-label" htmlFor="don-notes">Notes (optional)</label>
          <textarea
            id="don-notes"
            className="dd-form-input"
            placeholder="e.g. Please confirm a day before"
            rows={3}
            style={{ resize: "vertical" }}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            maxLength={500}
          />
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "right" }}>
            {form.notes.length}/500
          </p>
        </div>

        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", fontStyle: "italic" }}>
          {ELIGIBILITY_DISCLAIMER}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            className="dd-quick-btn dd-quick-btn--outline"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="dd-quick-btn dd-quick-btn--primary"
            disabled={submitting}
          >
            {submitting ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  width: 13, height: 13,
                  border: "2px solid rgba(255,255,255,.4)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  animation: "spin .6s linear infinite",
                  display: "inline-block",
                }} />
                Submitting…
              </span>
            ) : (
              <><Droplets size={15} /> Submit Interest</>
            )}
          </button>
        </div>

      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────
   Success screen shown after form submission
───────────────────────────────────────────── */
function SuccessScreen({ donation, onClose }) {
  return (
    <div style={{ textAlign: "center", padding: "var(--space-7) var(--space-5)" }}>
      <CheckCircle size={52} color="var(--success)" style={{ margin: "0 auto var(--space-4)" }} />
      <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-lg)", color: "var(--text)", marginBottom: 8 }}>
        Interest Registered!
      </h3>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 8, lineHeight: 1.6 }}>
        Your donation interest has been saved. A coordinator will contact you to confirm your appointment.
      </p>
      <div style={{
        background: "var(--bg-alt)", border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)", padding: "12px 16px",
        marginBottom: "var(--space-5)", textAlign: "left",
        fontSize: "var(--text-sm)",
      }}>
        <p><strong>Centre:</strong> {donation.centre}</p>
        <p><strong>Preferred Date:</strong> {new Date(donation.preferredDate).toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
        <p><strong>Blood Group:</strong> {donation.bloodGroup}</p>
        <p><strong>Type:</strong> {donation.donationType}</p>
        <p style={{ marginTop: 6 }}>
          <strong>Status:</strong>{" "}
          <span style={{
            background: "var(--warning-soft)", color: "#92400E",
            borderRadius: 20, padding: "2px 10px",
            fontWeight: 700, fontSize: "var(--text-xs)",
          }}>
            ⏳ Pending Confirmation
          </span>
        </p>
      </div>
      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "var(--space-5)", fontStyle: "italic" }}>
        {ELIGIBILITY_DISCLAIMER}
      </p>
      <button className="dd-quick-btn dd-quick-btn--outline" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main BloodDonation page
───────────────────────────────────────────── */
export default function BloodDonation() {
  const { user: authUser }         = useAuth();
  const [showModal,    setShowModal]   = useState(false);
  const [submitted,    setSubmitted]   = useState(null); // donation object after success
  const [profileData,  setProfileData] = useState(null); // real donor data
  const [recentDons,   setRecentDons]  = useState([]);
  const [statsLoading, setStatsLoading]= useState(true);

  /* Load donor profile + recent donations on mount */
  useEffect(() => {
    let alive = true;
    setStatsLoading(true);

    Promise.all([
      donorApi.getProfile().catch(() => null),
      donorApi.getMyDonations().catch(() => ({ donations: [] })),
    ]).then(([profileRes, historyRes]) => {
      if (!alive) return;
      if (profileRes?.user) setProfileData(profileRes.user);
      setRecentDons((historyRes?.donations || []).slice(0, 4));
    }).finally(() => {
      if (alive) setStatsLoading(false);
    });

    return () => { alive = false; };
  }, [submitted]); // re-fetch after a successful submission

  const bloodGroup = profileData?.bloodGroup || authUser?.bloodGroup || "";

  /* Eligibility: "eligible" if last completed donation was >90 days ago */
  const completedDons = recentDons.filter((d) => d.status === "completed");
  const lastCompleted = completedDons[0];
  let eligibilityStatus = "unknown";
  let lastDonationLabel = "—";
  let nextEligibleLabel = "—";

  if (lastCompleted) {
    const lastDate  = new Date(lastCompleted.completedDate || lastCompleted.preferredDate);
    const nextDate  = new Date(lastDate.getTime() + 90 * 24 * 60 * 60 * 1000);
    const today     = new Date();
    eligibilityStatus = today >= nextDate ? "eligible" : "not-eligible";
    lastDonationLabel = lastDate.toLocaleDateString("en-IN", { dateStyle: "medium" });
    nextEligibleLabel = nextDate.toLocaleDateString("en-IN", { dateStyle: "medium" });
  }

  const totalDonations = recentDons.filter((d) => d.status === "completed").length;

  const STATS = [
    {
      label: "Total Donations",  value: totalDonations,
      icon: Droplets, iconColor: "#EF4444", iconBg: "#FEE2E2",
      sub: "Completed donations", delay: 0,
    },
    {
      label: "Last Donation",    value: lastDonationLabel,
      icon: Clock, iconColor: "#0EA5E9", iconBg: "#E0F2FE",
      sub: "Most recent", delay: 0.1,
    },
    {
      label: "Next Eligible",    value: nextEligibleLabel,
      icon: CalendarCheck, iconColor: "#10B981", iconBg: "#D1FAE5",
      sub: "Approx. (90-day rule)", delay: 0.2,
    },
  ];

  const handleModalOpen = () => { setSubmitted(null); setShowModal(true); };
  const handleModalClose = () => setShowModal(false);
  const handleSuccess = (donation) => setSubmitted(donation);

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>Blood Donation</h1>
          <p>Your blood group, donation status, eligibility information, and interest submission.</p>
        </div>
        <button className="dd-quick-btn dd-quick-btn--primary" onClick={handleModalOpen}>
          <Droplets size={15} /> Express Interest to Donate
        </button>
      </div>

      {/* ── Interest modal ── */}
      <AnimatePresence>
        {showModal && (
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
            onClick={(e) => { if (e.target === e.currentTarget) handleModalClose(); }}
          >
            <motion.div
              style={{
                background: "#fff", borderRadius: "var(--radius-lg)",
                width: "100%", maxWidth: 520,
                padding: "var(--space-7)", boxShadow: "var(--shadow-lg)",
                maxHeight: "90vh", overflowY: "auto",
              }}
              initial={{ scale: .92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: .92, opacity: 0 }}
            >
              {submitted ? (
                <SuccessScreen donation={submitted} onClose={handleModalClose} />
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
                    <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-lg)", color: "var(--text)" }}>
                      Express Donation Interest
                    </h3>
                    <button
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                      onClick={handleModalClose}
                      aria-label="Close"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <InterestForm
                    donorBloodGroup={bloodGroup}
                    onSuccess={handleSuccess}
                    onClose={handleModalClose}
                  />
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Blood group + eligibility ── */}
      <div className="dd-two-col" style={{ marginBottom: "var(--space-5)" }}>

        {/* Blood group card */}
        <div className="dd-card">
          <div className="dd-card__header">
            <h3 className="dd-card__title"><Droplets size={16} /> Your Blood Group</h3>
          </div>
          {statsLoading ? (
            <div className="skeleton" style={{ height: 60, borderRadius: "var(--radius-sm)" }} />
          ) : bloodGroup ? (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
              <div className="dd-blood-group-badge">{bloodGroup}</div>
              <div>
                <p style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--text)", marginBottom: 4, fontFamily: "var(--font-heading)" }}>
                  Type {bloodGroup}
                </p>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                  {bloodGroup === "O+" || bloodGroup === "O-"
                    ? "Universal donor to certain blood groups"
                    : "Suitable for compatible recipients"}
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 6, fontStyle: "italic" }}>
                  Always confirm compatibility with a healthcare professional.
                </p>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
              Blood group not set. <a href="#" style={{ color: "var(--primary-light)" }}>Update your profile</a> to add it.
            </p>
          )}
        </div>

        {/* Eligibility card */}
        <div className="dd-card">
          <div className="dd-card__header">
            <h3 className="dd-card__title"><CalendarCheck size={16} /> Eligibility Status</h3>
          </div>
          {statsLoading ? (
            <div className="skeleton" style={{ height: 60, borderRadius: "var(--radius-sm)" }} />
          ) : (
            <>
              <div
                className={`dd-eligibility-banner ${eligibilityStatus}`}
                style={{ marginBottom: 0 }}
              >
                <div className="dd-eligibility-banner__icon">
                  {eligibilityStatus === "eligible"
                    ? <CheckCircle size={20} />
                    : eligibilityStatus === "not-eligible"
                    ? <Clock size={20} />
                    : <Info size={20} />}
                </div>
                <div className="dd-eligibility-banner__body">
                  <strong>
                    {eligibilityStatus === "eligible"   ? "Currently Eligible" :
                     eligibilityStatus === "not-eligible" ? "Not Yet Eligible" :
                     "Status Unknown"}
                  </strong>
                  <p>
                    {eligibilityStatus === "eligible"
                      ? "You can donate whole blood."
                      : eligibilityStatus === "not-eligible"
                      ? `Next eligible: ${nextEligibleLabel}`
                      : "No completed donations on record yet."}
                  </p>
                </div>
              </div>
              <p className="dd-disclaimer" style={{ marginTop: "var(--space-3)" }}>
                {ELIGIBILITY_DISCLAIMER}
              </p>
            </>
          )}
        </div>
      </div>

      {/* ── Stats from real data ── */}
      <div className="dd-stats-grid" style={{ marginBottom: "var(--space-5)" }}>
        {STATS.map((s, i) => <StatCard key={s.label} {...s} delay={i * 0.1} />)}
      </div>

      {/* ── About blood donation info ── */}
      <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="dd-card__header">
          <h3 className="dd-card__title"><Info size={16} /> About Blood Donation</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "var(--space-4)" }}>
          {INFO_ITEMS.map(({ emoji, title, body }) => (
            <div key={title} style={{ background: "var(--bg-alt)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "var(--space-4)" }}>
              <p style={{ fontSize: "1.5rem", marginBottom: 8 }}>{emoji}</p>
              <p style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>{title}</p>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: 1.6 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Eligibility guidelines ── */}
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
        <div style={{ background: "var(--warning-soft)", border: "1px solid var(--warning)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginTop: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--text-xs)", color: "#92400E", fontWeight: 600 }}>
            ⚠ Important: {ELIGIBILITY_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* ── Recent donation activity (real data) ── */}
      <div className="dd-card">
        <div className="dd-card__header">
          <h3 className="dd-card__title"><Clock size={16} /> Recent Donation Activity</h3>
        </div>
        {statsLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 56, borderRadius: "var(--radius-sm)" }} />
            ))}
          </div>
        ) : recentDons.length === 0 ? (
          <div className="dd-empty" style={{ padding: "var(--space-7) var(--space-5)" }}>
            <div className="dd-empty__icon"><Droplets size={24} /></div>
            <p>No donation records yet. Submit your first donation interest above.</p>
          </div>
        ) : (
          <div className="dd-activity-list">
            {recentDons.map((d) => {
              const STATUS_CLS = {
                pending:   "dd-badge--warning",
                confirmed: "dd-badge--info",
                completed: "dd-badge--success",
                cancelled: "dd-badge--danger",
              };
              return (
                <div className="dd-activity-item" key={d._id}>
                  <div className="dd-activity-item__icon" style={{ background: "var(--danger-soft)", color: "var(--danger)" }}>
                    <Droplets size={18} />
                  </div>
                  <div className="dd-activity-item__body">
                    <p className="dd-activity-item__title">{d.centre}</p>
                    <p className="dd-activity-item__sub">
                      {new Date(d.preferredDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      {" · "}{d.bloodGroup}
                      {" · "}{d.donationType}
                    </p>
                  </div>
                  <span className={`dd-badge ${STATUS_CLS[d.status] ?? "dd-badge--neutral"}`}>
                    {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
