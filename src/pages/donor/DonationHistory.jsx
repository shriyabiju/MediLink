import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Search, Droplets, Award, AlertCircle, X } from "lucide-react";
import { donorApi } from "../../services/api";
import StatCard from "./components/StatCard";
import "./css/donor.css";

/* ─────────────────────────────────────────────
   Status → badge class
───────────────────────────────────────────── */
const STATUS_CLS = {
  pending:   "dd-badge--warning",
  confirmed: "dd-badge--info",
  completed: "dd-badge--success",
  cancelled: "dd-badge--danger",
};

const STATUS_LABEL = {
  pending:   "⏳ Pending",
  confirmed: "📅 Confirmed",
  completed: "✅ Completed",
  cancelled: "✗ Cancelled",
};

/* ─────────────────────────────────────────────
   Cancel confirmation modal
───────────────────────────────────────────── */
function CancelModal({ donation, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "rgba(15,23,42,.5)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 500, padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        style={{ background: "#fff", borderRadius: "var(--radius-lg)", width: "100%", maxWidth: 460, boxShadow: "var(--shadow-lg)", overflow: "hidden" }}
        initial={{ scale: .92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: .92, opacity: 0 }}
      >
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-lg)", color: "var(--text)" }}>Cancel Donation</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} aria-label="Close"><X size={18} /></button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 16 }}>
            Cancel donation interest at <strong>{donation.centre}</strong>?
          </p>
          <div className="dd-form-group">
            <label className="dd-form-label" htmlFor="cancel-reason">Reason (optional)</label>
            <textarea
              id="cancel-reason"
              className="dd-form-input"
              rows={3}
              style={{ resize: "vertical" }}
              placeholder="e.g. Change of plans"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="dd-quick-btn dd-quick-btn--outline" onClick={onClose} disabled={loading}>Keep</button>
          <button
            className="dd-quick-btn"
            style={{ background: "linear-gradient(135deg,#F87171,var(--danger))", color: "#fff" }}
            onClick={() => onConfirm(reason)}
            disabled={loading}
          >
            {loading ? "Cancelling…" : "Cancel Donation"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main DonationHistory page
───────────────────────────────────────────── */
export default function DonationHistory() {
  const [donations,    setDonations]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelTarget, setCancelTarget] = useState(null); // donation to cancel
  const [cancelling,   setCancelling]   = useState(false);
  const [toast,        setToast]        = useState("");   // success message

  /* ── Fetch from real API ── */
  const fetchHistory = useCallback(() => {
    setLoading(true);
    setError("");
    donorApi.getMyDonations()
      .then(({ donations }) => setDonations(donations))
      .catch((err) => setError(err.message || "Failed to load donation history."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  /* ── Cancel handler ── */
  const handleCancelConfirm = async (reason) => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await donorApi.cancelDonation(cancelTarget._id, reason);
      setCancelTarget(null);
      setToast("Donation cancelled successfully.");
      setTimeout(() => setToast(""), 4000);
      fetchHistory();
    } catch (err) {
      setError(err.message || "Failed to cancel donation.");
    } finally {
      setCancelling(false);
    }
  };

  /* ── Filter ── */
  const filtered = donations.filter((d) => {
    const matchStatus = statusFilter === "all" || d.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      d.centre.toLowerCase().includes(q) ||
      d.bloodGroup.toLowerCase().includes(q) ||
      d.donationType.toLowerCase().includes(q) ||
      new Date(d.preferredDate).toLocaleDateString("en-IN", { dateStyle: "medium" }).toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  /* ── Summary stats (from all donations, not filtered) ── */
  const completed   = donations.filter((d) => d.status === "completed");
  const totalUnits  = completed.reduce((s, d) => s + (d.units || 0), 0);

  /* ─────────────────────────────────────────
     Render
  ───────────────────────────────────────── */
  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>Donation History</h1>
          <p>All your blood donation submissions and their current status.</p>
        </div>
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              background: "var(--success-soft)", border: "1px solid var(--success)",
              borderRadius: "var(--radius-sm)", padding: "12px 18px",
              marginBottom: "var(--space-5)", color: "#065F46",
              fontSize: "var(--text-sm)", fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            ✅ {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── API error ── */}
      {error && !loading && (
        <div style={{
          background: "var(--danger-soft)", border: "1px solid var(--danger)",
          borderRadius: "var(--radius-sm)", padding: "12px 18px",
          marginBottom: "var(--space-5)", color: "#991B1B",
          fontSize: "var(--text-sm)", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* ── Summary stat cards ── */}
      {!loading && (
        <div className="dd-stats-grid" style={{ marginBottom: "var(--space-5)" }}>
          {[
            {
              label: "Total Submissions", value: donations.length,
              icon: Droplets, iconColor: "#EF4444", iconBg: "#FEE2E2",
              sub: "All interest records", delay: 0,
            },
            {
              label: "Completed",         value: completed.length,
              icon: Award,    iconColor: "#10B981", iconBg: "#D1FAE5",
              sub: "Verified donations",  delay: 0.1,
            },
            {
              label: "Lives Impacted",    value: totalUnits > 0 ? totalUnits * 3 : completed.length * 3,
              icon: Clock,    iconColor: "#8B5CF6", iconBg: "#EDE9FE",
              sub: "Estimated (≈3× donations)", delay: 0.2,
            },
          ].map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      {/* ── Table card ── */}
      <motion.div
        className="dd-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {/* Search + filter toolbar */}
        <div
          className="dd-card__header"
          style={{ marginBottom: "var(--space-4)", flexWrap: "wrap", gap: "var(--space-3)" }}
        >
          <h3 className="dd-card__title"><Clock size={16} /> All Donations</h3>

          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "7px 12px", border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-sm)", fontFamily: "inherit",
                fontSize: "var(--text-sm)", background: "#F9FAFB",
                cursor: "pointer", outline: "none", color: "var(--text)",
              }}
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Search */}
            <div className="dd-search-wrap" style={{ minWidth: "auto", width: 220 }}>
              <Search size={14} className="dd-search-wrap__icon" />
              <input
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search donations"
              />
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: "var(--radius-sm)" }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="dd-empty">
            <div className="dd-empty__icon"><Droplets size={26} /></div>
            <h3>
              {donations.length === 0
                ? "No donation records yet"
                : "No records match your filters"}
            </h3>
            <p>
              {donations.length === 0
                ? "Go to Blood Donation and submit your first donation interest."
                : "Try clearing the search or changing the status filter."}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="dd-history-table-wrap">
            <table className="dd-history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Preferred Date</th>
                  <th>Centre / Hospital</th>
                  <th>Blood Group</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((d, i) => (
                    <motion.tr
                      key={d._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      layout
                    >
                      <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>

                      <td>
                        <span style={{ fontWeight: 600, color: "var(--text)" }}>
                          {new Date(d.preferredDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: "50%",
                            background: "var(--danger-soft)", color: "var(--danger)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            <Droplets size={13} />
                          </div>
                          <span style={{ fontSize: "var(--text-sm)" }}>{d.centre}</span>
                        </div>
                      </td>

                      <td>
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 38, height: 38, borderRadius: "50%",
                          background: "var(--danger-soft)", border: "2px solid var(--danger)",
                          fontSize: ".78rem", fontWeight: 800, color: "var(--danger)",
                        }}>
                          {d.bloodGroup}
                        </span>
                      </td>

                      <td style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                        {d.donationType}
                      </td>

                      <td>
                        <span className={`dd-badge ${STATUS_CLS[d.status] ?? "dd-badge--neutral"}`}>
                          {STATUS_LABEL[d.status] ?? d.status}
                        </span>
                      </td>

                      <td style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                        {new Date(d.createdAt).toLocaleDateString("en-IN", { dateStyle: "short" })}
                      </td>

                      <td>
                        {(d.status === "pending" || d.status === "confirmed") && (
                          <button
                            className="dd-quick-btn dd-quick-btn--outline"
                            style={{
                              padding: "5px 10px", fontSize: "var(--text-xs)",
                              color: "var(--danger)", borderColor: "var(--danger)",
                            }}
                            onClick={() => setCancelTarget(d)}
                            title="Cancel this donation interest"
                          >
                            Cancel
                          </button>
                        )}
                        {d.status === "completed" && d.certificate && (
                          <button
                            className="dd-quick-btn dd-quick-btn--outline"
                            style={{ padding: "5px 10px", fontSize: "var(--text-xs)" }}
                            title="Certificate download — coming soon"
                            onClick={() => alert("Certificate download will be available in a future update.")}
                          >
                            Certificate
                          </button>
                        )}
                        {(d.status === "cancelled" || (d.status === "completed" && !d.certificate)) && (
                          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>—</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Notes ── */}
      {!loading && (
        <p className="dd-disclaimer" style={{ marginTop: "var(--space-4)" }}>
          Donation records are saved in the MediLink database. Status is updated by the donation centre or admin — submitting interest does not automatically mark a donation as completed.
        </p>
      )}

      {/* ── Cancel modal ── */}
      <AnimatePresence>
        {cancelTarget && (
          <CancelModal
            donation={cancelTarget}
            onConfirm={handleCancelConfirm}
            onClose={() => setCancelTarget(null)}
            loading={cancelling}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
