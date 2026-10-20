import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Search, MapPin, Phone, Mail,
  Calendar, CheckCircle, XCircle, Eye, AlertTriangle,
} from "lucide-react";
import { adminApi } from "../../services/api";
import "../admin/css/admin.css";

const TAB_STATUS = { pending: "pending", approved: "approved", rejected: "rejected", all: "all" };

const STATUS_BADGE = {
  pending:  <span className="ad-badge ad-badge--pending">⏳ Pending</span>,
  approved: <span className="ad-badge ad-badge--approved">✅ Approved</span>,
  rejected: <span className="ad-badge ad-badge--rejected">✗ Rejected</span>,
};

/* ── Reject modal ── */
function RejectModal({ hospital, onConfirm, onClose, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div className="ad-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        className="ad-modal"
        initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: .92, opacity: 0 }}
      >
        <div className="ad-modal__header">
          <h3>Reject Hospital Registration</h3>
          <button className="ad-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="ad-modal__body">
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", marginBottom: 16 }}>
            You are about to reject <strong>{hospital?.name}</strong>. This will prevent them from logging in.
          </p>
          <div className="ad-form-group">
            <label className="ad-form-label" htmlFor="reject-reason">Reason (optional)</label>
            <textarea
              id="reject-reason"
              className="ad-form-input"
              rows={3}
              style={{ resize: "vertical" }}
              placeholder="e.g. Incomplete registration details..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <div className="ad-modal__footer">
          <button className="ad-btn ad-btn--outline" onClick={onClose}>Cancel</button>
          <button className="ad-btn ad-btn--danger" onClick={() => onConfirm(reason)} disabled={loading}>
            {loading ? "Rejecting…" : <><XCircle size={15} /> Reject</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Detail modal ── */
function DetailModal({ hospital, onClose }) {
  if (!hospital) return null;
  const h = hospital;
  return (
    <div className="ad-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div
        className="ad-modal" style={{ maxWidth: 600 }}
        initial={{ scale: .92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: .92, opacity: 0 }}
      >
        <div className="ad-modal__header">
          <h3>Hospital Details</h3>
          <button className="ad-modal__close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="ad-modal__body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "var(--space-4)" }}>
            {[
              ["Hospital Name",     h.name],
              ["Email",            h.email],
              ["Phone",            h.phone || "—"],
              ["City",             h.city  || "—"],
              ["State",            h.state || "—"],
              ["Type",             h.hospitalType || "—"],
              ["Reg. Number",      h.registrationNumber || "—"],
              ["Total Beds",       h.totalBeds || "—"],
              ["Address",          h.address || "—"],
              ["Status",           h.approvalStatus],
              ["Registered",       h.createdAt ? new Date(h.createdAt).toLocaleDateString() : "—"],
              ["Reviewed At",      h.reviewedAt ? new Date(h.reviewedAt).toLocaleDateString() : "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>{label}</p>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text)", fontWeight: label === "Status" ? 700 : 500 }}>
                  {label === "Status" ? STATUS_BADGE[value] : value}
                </p>
              </div>
            ))}
          </div>
          {h.rejectReason && (
            <div style={{ background: "var(--danger-soft)", borderRadius: "var(--radius-sm)", padding: "12px", border: "1px solid rgba(239,68,68,.2)" }}>
              <p style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "#991B1B", marginBottom: 4 }}>REJECTION REASON</p>
              <p style={{ fontSize: "var(--text-sm)", color: "#991B1B" }}>{h.rejectReason}</p>
            </div>
          )}
        </div>
        <div className="ad-modal__footer">
          <button className="ad-btn ad-btn--outline" onClick={onClose}>Close</button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Hospital card ── */
function HospitalCard({ hospital: h, onApprove, onReject, onView, actionLoading }) {
  return (
    <motion.div
      className="ad-hosp-card"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }} layout
    >
      <div className="ad-hosp-card__top">
        <div className="ad-hosp-avatar">🏥</div>
        <div className="ad-hosp-card__info" style={{ flex: 1, minWidth: 0 }}>
          <h4>{h.name}</h4>
          <p>{h.hospitalType || "Hospital"}</p>
          {STATUS_BADGE[h.approvalStatus]}
        </div>
      </div>

      <div className="ad-hosp-card__meta">
        <div className="ad-meta-row"><Mail size={12} /> {h.email}</div>
        {h.phone   && <div className="ad-meta-row"><Phone   size={12} /> {h.phone}</div>}
        {h.city    && <div className="ad-meta-row"><MapPin  size={12} /> {h.city}{h.state ? `, ${h.state}` : ""}</div>}
        {h.registrationNumber && <div className="ad-meta-row"><Building2 size={12} /> Reg: {h.registrationNumber}</div>}
        <div className="ad-meta-row">
          <Calendar size={12} />
          Registered: {h.createdAt ? new Date(h.createdAt).toLocaleDateString() : "—"}
        </div>
        {h.rejectReason && (
          <div className="ad-meta-row" style={{ color: "var(--danger)" }}>
            <AlertTriangle size={12} /> {h.rejectReason}
          </div>
        )}
      </div>

      <div className="ad-hosp-card__actions">
        <button className="ad-btn ad-btn--outline ad-btn--sm" onClick={() => onView(h)}>
          <Eye size={13} /> Details
        </button>
        {h.approvalStatus !== "approved" && (
          <button
            className="ad-btn ad-btn--success ad-btn--sm"
            onClick={() => onApprove(h._id)}
            disabled={actionLoading === h._id + "_approve"}
          >
            <CheckCircle size={13} />
            {actionLoading === h._id + "_approve" ? "Approving…" : "Approve"}
          </button>
        )}
        {h.approvalStatus !== "rejected" && (
          <button
            className="ad-btn ad-btn--danger ad-btn--sm"
            onClick={() => onReject(h)}
            disabled={actionLoading === h._id + "_reject"}
          >
            <XCircle size={13} />
            {actionLoading === h._id + "_reject" ? "Rejecting…" : "Reject"}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function HospitalVerification({ showToast }) {
  const [tab,          setTab]          = useState("pending");
  const [hospitals,    setHospitals]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [actionLoading,setActionLoading]= useState("");
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [rejectModal,  setRejectModal]  = useState(null); // hospital object
  const [detailModal,  setDetailModal]  = useState(null);

  const fetchHospitals = useCallback((status) => {
    setLoading(true);
    setError("");
    adminApi.getHospitals(status)
      .then((d) => setHospitals(d.hospitals))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchHospitals(tab); }, [tab, fetchHospitals]);

  const handleApprove = async (id) => {
    setActionLoading(id + "_approve");
    try {
      const d = await adminApi.approveHospital(id);
      showToast("success", d.message);
      fetchHospitals(tab);
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setActionLoading("");
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectModal) return;
    setActionLoading(rejectModal._id + "_reject");
    try {
      const d = await adminApi.rejectHospital(rejectModal._id, reason);
      showToast("success", d.message);
      setRejectModal(null);
      fetchHospitals(tab);
    } catch (e) {
      showToast("error", e.message);
    } finally {
      setActionLoading("");
    }
  };

  const filtered = hospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.email.toLowerCase().includes(search.toLowerCase()) ||
    (h.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: "pending",  label: "Pending",  count: hospitals.filter((h) => h.approvalStatus === "pending").length },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "all",      label: "All" },
  ];

  return (
    <div>
      <div className="ad-page-header">
        <div>
          <h1>Hospital Verification</h1>
          <p>Review and approve hospital registrations. Approved hospitals can log in and access their dashboard.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "var(--danger-soft)", border: "1px solid var(--danger)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: "var(--space-5)", color: "#991B1B", fontSize: "var(--text-sm)", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="ad-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`ad-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => { setTab(t.id); setSearch(""); }}
          >
            {t.label}
            {t.count > 0 && <span className="ad-tab-count">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="ad-search-bar">
        <div className="ad-search-wrap">
          <Search size={15} className="ad-search-icon" />
          <input
            placeholder="Search by name, email or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search hospitals"
          />
        </div>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          {filtered.length} hospital{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="ad-loading"><div className="ad-spinner" /><span>Loading hospitals…</span></div>
      ) : filtered.length === 0 ? (
        <div className="ad-empty">
          <div className="ad-empty__icon"><Building2 size={28} /></div>
          <h3>No hospitals found</h3>
          <p>{search ? "Try a different search term." : `No ${tab === "all" ? "" : tab} hospital registrations yet.`}</p>
        </div>
      ) : (
        <div className="ad-hosp-grid">
          <AnimatePresence>
            {filtered.map((h) => (
              <HospitalCard
                key={h._id}
                hospital={h}
                onApprove={handleApprove}
                onReject={(hosp) => setRejectModal(hosp)}
                onView={(hosp) => setDetailModal(hosp)}
                actionLoading={actionLoading}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Reject modal */}
      <AnimatePresence>
        {rejectModal && (
          <RejectModal
            hospital={rejectModal}
            onConfirm={handleRejectConfirm}
            onClose={() => setRejectModal(null)}
            loading={actionLoading.startsWith(rejectModal._id)}
          />
        )}
      </AnimatePresence>

      {/* Detail modal */}
      <AnimatePresence>
        {detailModal && (
          <DetailModal hospital={detailModal} onClose={() => setDetailModal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
