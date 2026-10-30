import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, CheckCircle, XCircle, AlertTriangle,
  Eye, FileText, Download, Building2, Phone, Mail,
  MapPin, Hash, Calendar,
} from "lucide-react";
import { adminApi } from "../../services/api";
import "../admin/css/admin.css";

const STATUS_BADGE = {
  pending:  <span className="ad-badge ad-badge--pending">⏳ Pending</span>,
  approved: <span className="ad-badge ad-badge--approved">✅ Approved</span>,
  rejected: <span className="ad-badge ad-badge--rejected">✗ Rejected</span>,
};

export default function BloodBankManagement({ showToast }) {
  const [tab,           setTab]           = useState("pending");
  const [banks,         setBanks]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error,         setError]         = useState("");
  const [search,        setSearch]        = useState("");

  /* View details modal */
  const [viewBank,     setViewBank]    = useState(null);   // { bank, loading, error }
  const [rejectModal,  setRejectModal] = useState(null);   // bank being rejected
  const [rejectReason, setRejectReason] = useState("");

  /* ── Fetch list ── */
  const fetchBanks = useCallback((status) => {
    setLoading(true);
    setError("");
    adminApi.getBloodBanks(status)
      .then((d) => setBanks(d.bloodbanks || []))
      .catch((e) => { setError(e.message || "Failed to load blood banks."); setBanks([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBanks(tab); }, [tab, fetchBanks]);

  /* ── Approve ── */
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

  /* ── Reject ── */
  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal._id + "_r");
    try {
      const d = await adminApi.rejectBloodBank(rejectModal._id);
      showToast("success", d.message);
      setRejectModal(null);
      setRejectReason("");
      fetchBanks(tab);
    } catch (e) {
      showToast("error", e.message);
    } finally { setActionLoading(""); }
  };

  /* ── View full details — uses dedicated single-record API ── */
  const handleView = async (id) => {
    setViewBank({ loading: true, bank: null, error: "" });
    try {
      const d = await adminApi.getBloodBank(id);   // GET /api/admin/bloodbanks/:id
      setViewBank({ loading: false, bank: d.bloodbank, error: "" });
    } catch (e) {
      setViewBank({ loading: false, bank: null, error: e.message });
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
          <p>Review registration details and approve or reject blood banks.</p>
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
          <button key={t.id} className={`ad-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => { setTab(t.id); setSearch(""); }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="ad-search-bar">
        <div className="ad-search-wrap">
          <Search size={15} className="ad-search-icon" />
          <input
            placeholder="Search by name, email, city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search blood banks"
          />
        </div>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          {filtered.length} blood bank{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
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
                  <th>Reg. No.</th>
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
                      <td style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{b.city || "—"}</td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{b.phone || "—"}</td>
                      <td style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{b.registrationNumber || "—"}</td>
                      <td>{STATUS_BADGE[b.approvalStatus] ?? STATUS_BADGE.pending}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className="ad-btn ad-btn--outline ad-btn--sm" onClick={() => handleView(b._id)}>
                            <Eye size={13} /> View
                          </button>
                          {b.approvalStatus !== "approved" && (
                            <button className="ad-btn ad-btn--success ad-btn--sm"
                              onClick={() => handleApprove(b._id)}
                              disabled={actionLoading.startsWith(b._id)}>
                              <CheckCircle size={13} /> Approve
                            </button>
                          )}
                          {b.approvalStatus !== "rejected" && (
                            <button className="ad-btn ad-btn--danger ad-btn--sm"
                              onClick={() => { setRejectModal(b); setRejectReason(""); }}
                              disabled={actionLoading.startsWith(b._id)}>
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

      {/* ════════════════════════════════
          VIEW DETAILS MODAL
      ════════════════════════════════ */}
      <AnimatePresence>
        {viewBank && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setViewBank(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 500, padding: 20, overflowY: "auto" }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", marginTop: 20, marginBottom: 20 }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #E2E8F0" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A" }}>🏦 Blood Bank Details</h3>
                <button onClick={() => setViewBank(null)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: "1rem" }}>✕</button>
              </div>

              {/* Body */}
              <div style={{ padding: 24, maxHeight: "75vh", overflowY: "auto" }}>

                {viewBank.loading && (
                  <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>Loading details…</div>
                )}

                {viewBank.error && (
                  <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: 8, fontSize: "0.875rem" }}>
                    ❌ {viewBank.error}
                  </div>
                )}

                {viewBank.bank && (
                  <>
                    {/* Name + status */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 14, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Building2 size={26} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: "1.05rem", color: "#0F172A" }}>{viewBank.bank.name}</p>
                        <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Blood Bank</p>
                      </div>
                      <div>{STATUS_BADGE[viewBank.bank.approvalStatus]}</div>
                    </div>

                    {/* ── Registration Details ── */}
                    <SectionHeading title="Registration Details" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                      <DetailRow icon={<Mail size={13} />}     label="Email"           value={viewBank.bank.email || "—"} />
                      <DetailRow icon={<Phone size={13} />}    label="Contact Number"  value={viewBank.bank.phone || "—"} />
                      <DetailRow icon={<Hash size={13} />}     label="Licence / Reg. No." value={viewBank.bank.registrationNumber || "—"} />
                      <DetailRow icon={<Calendar size={13} />} label="Registered On"   value={viewBank.bank.createdAt ? new Date(viewBank.bank.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"} />
                    </div>

                    {/* ── Location ── */}
                    <SectionHeading title="Location" />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                      <DetailRow icon={<MapPin size={13} />} label="City"    value={viewBank.bank.city    || "—"} />
                      <DetailRow icon={<MapPin size={13} />} label="State"   value={viewBank.bank.state   || "—"} />
                      <div style={{ gridColumn: "1 / -1" }}>
                        <DetailRow icon={<MapPin size={13} />} label="Full Address" value={viewBank.bank.address || "—"} />
                      </div>
                    </div>

                    {/* ── Registration Document ── */}
                    <SectionHeading title="Uploaded Registration Document" />
                    {viewBank.bank.registrationDocument?.data ? (
                      <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: "0.78rem", color: "#64748B", marginBottom: 8 }}>
                          <strong>{viewBank.bank.registrationDocument.fileName || "Document"}</strong>
                          {viewBank.bank.registrationDocument.uploadedAt && (
                            <> — uploaded {new Date(viewBank.bank.registrationDocument.uploadedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</>
                          )}
                        </p>
                        {viewBank.bank.registrationDocument.contentType?.startsWith("image/") ? (
                          <img
                            src={`data:${viewBank.bank.registrationDocument.contentType};base64,${viewBank.bank.registrationDocument.data}`}
                            alt="Registration Document"
                            style={{ width: "100%", borderRadius: 10, border: "1px solid #E2E8F0" }}
                          />
                        ) : (
                          <a
                            href={`data:${viewBank.bank.registrationDocument.contentType || "application/octet-stream"};base64,${viewBank.bank.registrationDocument.data}`}
                            download={viewBank.bank.registrationDocument.fileName || "registration-document"}
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "#2563EB", color: "#fff", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600 }}
                          >
                            <Download size={14} /> Download Document
                          </a>
                        )}
                      </div>
                    ) : (
                      <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                        <FileText size={16} style={{ color: "#F59E0B" }} />
                        <p style={{ fontSize: "0.82rem", color: "#92400E" }}>
                          No registration document uploaded. You may still approve or request resubmission.
                        </p>
                      </div>
                    )}

                    {/* ── Actions ── */}
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 16, borderTop: "1px solid #E2E8F0" }}>
                      {viewBank.bank.approvalStatus !== "approved" && (
                        <button className="ad-btn ad-btn--success"
                          disabled={actionLoading.startsWith(viewBank.bank._id)}
                          onClick={async () => { await handleApprove(viewBank.bank._id); setViewBank(null); }}>
                          <CheckCircle size={15} /> Approve Blood Bank
                        </button>
                      )}
                      {viewBank.bank.approvalStatus !== "rejected" && (
                        <button className="ad-btn ad-btn--danger"
                          onClick={() => { setRejectModal(viewBank.bank); setRejectReason(""); setViewBank(null); }}>
                          <XCircle size={15} /> Reject
                        </button>
                      )}
                      <button className="ad-btn ad-btn--outline" onClick={() => setViewBank(null)}>Close</button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════
          REJECT MODAL
      ════════════════════════════════ */}
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
              style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #E2E8F0" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A" }}>Reject Blood Bank</h3>
                <button onClick={() => setRejectModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: "1rem" }}>✕</button>
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ fontSize: "0.88rem", color: "#475569", marginBottom: 14 }}>
                  You are about to reject <strong>{rejectModal.name}</strong>. They will not be able to log in until approved.
                </p>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button className="ad-btn ad-btn--outline" onClick={() => setRejectModal(null)}>Cancel</button>
                  <button className="ad-btn ad-btn--danger"
                    onClick={handleRejectConfirm}
                    disabled={actionLoading.startsWith(rejectModal._id)}>
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

/* ── Small helper components ── */

function SectionHeading({ title }) {
  return (
    <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
      {title}
    </p>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div>
      <p style={{ fontSize: "0.68rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>
        {icon} {label}
      </p>
      <p style={{ fontSize: "0.875rem", color: "#0F172A", fontWeight: 500, wordBreak: "break-word" }}>{value}</p>
    </div>
  );
}
