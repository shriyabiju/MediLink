import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle, XCircle, AlertTriangle, User, Eye, FileText, Download, Building2 } from "lucide-react";
import { adminApi } from "../../services/api";
import "../admin/css/admin.css";

const STATUS_BADGE = {
  pending:  <span className="ad-badge ad-badge--pending">⏳ Pending</span>,
  approved: <span className="ad-badge ad-badge--approved">✅ Approved</span>,
  rejected: <span className="ad-badge ad-badge--rejected">✗ Rejected</span>,
};

export default function BloodBankManagement({ showToast }) {
  const [tab,          setTab]          = useState("pending");
  const [banks,        setBanks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [actionLoading,setActionLoading]= useState("");
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [viewBank,     setViewBank]     = useState(null);
  const [rejectModal,  setRejectModal]  = useState(null);

  const fetchBanks = useCallback((status) => {
    setLoading(true);
    setError("");
    adminApi.getBloodBanks(status)
      .then((d) => setBanks(d.bloodbanks))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBanks(tab); }, [tab, fetchBanks]);

  const handleApprove = async (id) => {
    setActionLoading(id + "_a");
    try {
      const d = await adminApi.approveBloodBank(id);
      showToast("success", d.message);
      fetchBanks(tab);
    } catch (e) {
      showToast("error", e.message);
    } finally { setActionLoading(""); }
  };

  const handleReject = async (id) => {
    setActionLoading(id + "_r");
    try {
      const d = await adminApi.rejectBloodBank(id);
      showToast("success", d.message);
      setRejectModal(null);
      fetchBanks(tab);
    } catch (e) {
      showToast("error", e.message);
    } finally { setActionLoading(""); }
  };

  /* View blood bank details — fetches full user document including registration document */
  const handleView = async (id) => {
    setViewBank({ loading: true });
    try {
      /* Use the existing admin users API to fetch the blood bank's full record */
      const allBanks = await adminApi.getBloodBanks("all");
      const bank = allBanks.bloodbanks.find((b) => b._id === id);
      setViewBank({ bank, loading: false });
    } catch (e) {
      setViewBank({ error: e.message, loading: false });
    }
  };

  const filtered = banks.filter((b) =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.email?.toLowerCase().includes(search.toLowerCase()) ||
    (b.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: "pending",  label: "Pending"  },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
    { id: "all",      label: "All"      },
  ];

  return (
    <div>
      <div className="ad-page-header">
        <div>
          <h1>Blood Bank Management</h1>
          <p>Review and approve blood bank registrations.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "var(--danger-soft)", border: "1px solid var(--danger)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: "var(--space-5)", color: "#991B1B", fontSize: "var(--text-sm)", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      <div className="ad-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`ad-tab ${tab === t.id ? "active" : ""}`} onClick={() => { setTab(t.id); setSearch(""); }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="ad-search-bar">
        <div className="ad-search-wrap">
          <Search size={15} className="ad-search-icon" />
          <input placeholder="Search by name, email, city…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search blood banks" />
        </div>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          {filtered.length} blood bank{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="ad-loading"><div className="ad-spinner" /><span>Loading blood banks…</span></div>
      ) : filtered.length === 0 ? (
        <div className="ad-empty">
          <div className="ad-empty__icon"><Building2 size={28} /></div>
          <h3>No blood banks found</h3>
          <p>{search ? "Try a different search." : `No ${tab === "all" ? "" : tab} blood bank registrations.`}</p>
        </div>
      ) : (
        <div className="ad-card" style={{ padding: 0 }}>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Blood Bank</th>
                  <th>City</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((b) => (
                    <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} layout>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Building2 size={16} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: "var(--text)", fontSize: "var(--text-sm)" }}>{b.name}</p>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{b.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{b.city || "—"}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{b.phone || "—"}</td>
                      <td>{STATUS_BADGE[b.approvalStatus] ?? STATUS_BADGE.pending}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="ad-btn ad-btn--outline ad-btn--sm" onClick={() => handleView(b._id)} title="View details">
                            <Eye size={13} /> View
                          </button>
                          {b.approvalStatus !== "approved" && (
                            <button className="ad-btn ad-btn--success ad-btn--sm" onClick={() => handleApprove(b._id)} disabled={actionLoading.startsWith(b._id)}>
                              <CheckCircle size={13} /> Approve
                            </button>
                          )}
                          {b.approvalStatus !== "rejected" && (
                            <button className="ad-btn ad-btn--danger ad-btn--sm" onClick={() => setRejectModal(b)} disabled={actionLoading.startsWith(b._id)}>
                              <XCircle size={13} /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── View Details Modal ── */}
      <AnimatePresence>
        {viewBank && !viewBank.loading && viewBank.bank && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setViewBank(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #E2E8F0" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A" }}>Blood Bank Details</h3>
                <button onClick={() => setViewBank(null)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: "1rem" }}>✕</button>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>{viewBank.bank.name}</p>
                    <p style={{ fontSize: "0.8rem", color: "#64748B" }}>{viewBank.bank.email}</p>
                  </div>
                  <div style={{ marginLeft: "auto" }}>{STATUS_BADGE[viewBank.bank.approvalStatus]}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <DetailRow label="Phone" value={viewBank.bank.phone || "—"} />
                  <DetailRow label="City" value={viewBank.bank.city || "—"} />
                  <DetailRow label="Registered" value={viewBank.bank.createdAt ? new Date(viewBank.bank.createdAt).toLocaleDateString() : "—"} />
                  <DetailRow label="Status" value={viewBank.bank.approvalStatus || "—"} />
                </div>

                {/* Registration document */}
                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 16 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <FileText size={15} /> Registration Document
                  </p>
                  {viewBank.bank.registrationDocument && viewBank.bank.registrationDocument.data ? (
                    <div>
                      <p style={{ fontSize: "0.82rem", color: "#64748B", marginBottom: 8 }}>
                        {viewBank.bank.registrationDocument.fileName || "Document"} — uploaded {viewBank.bank.registrationDocument.uploadedAt ? new Date(viewBank.bank.registrationDocument.uploadedAt).toLocaleDateString() : "—"}
                      </p>
                      {viewBank.bank.registrationDocument.contentType?.startsWith("image/") ? (
                        <img
                          src={`data:${viewBank.bank.registrationDocument.contentType};base64,${viewBank.bank.registrationDocument.data}`}
                          alt="Registration Document"
                          style={{ width: "100%", borderRadius: 8, border: "1px solid #E2E8F0" }}
                        />
                      ) : (
                        <a
                          href={`data:${viewBank.bank.registrationDocument.contentType || "application/octet-stream"};base64,${viewBank.bank.registrationDocument.data}`}
                          download={viewBank.bank.registrationDocument.fileName || "registration-document"}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "#2563EB", color: "#fff", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600 }}
                        >
                          <Download size={14} /> Download Document
                        </a>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.82rem", color: "#94A3B8" }}>No registration document uploaded.</p>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
                  {viewBank.bank.approvalStatus !== "approved" && (
                    <button className="ad-btn ad-btn--success" onClick={async () => { await handleApprove(viewBank.bank._id); setViewBank(null); }}>
                      <CheckCircle size={15} /> Approve
                    </button>
                  )}
                  {viewBank.bank.approvalStatus !== "rejected" && (
                    <button className="ad-btn ad-btn--danger" onClick={() => { setRejectModal(viewBank.bank); setViewBank(null); }}>
                      <XCircle size={15} /> Reject
                    </button>
                  )}
                  <button className="ad-btn ad-btn--outline" onClick={() => setViewBank(null)}>Close</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reject confirmation ── */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setRejectModal(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 600, padding: 20 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #E2E8F0" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A" }}>Reject Blood Bank</h3>
                <button onClick={() => setRejectModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: "1rem" }}>✕</button>
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ fontSize: "0.88rem", color: "#475569", marginBottom: 16 }}>
                  You are about to reject <strong>{rejectModal.name}</strong>. They will not be able to log in until approved.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="ad-btn ad-btn--outline" onClick={() => setRejectModal(null)}>Cancel</button>
                  <button className="ad-btn ad-btn--danger" onClick={() => handleReject(rejectModal._id)} disabled={actionLoading.startsWith(rejectModal._id)}>
                    <XCircle size={15} /> Confirm Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: "0.85rem", color: "#0F172A", fontWeight: 500 }}>{value}</p>
    </div>
  );
}
