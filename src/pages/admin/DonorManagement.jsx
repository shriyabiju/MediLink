import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Search, CheckCircle, XCircle, AlertTriangle, User, Eye, FileText, Download } from "lucide-react";
import { adminApi } from "../../services/api";
import "../admin/css/admin.css";

const STATUS_BADGE = {
  pending:  <span className="ad-badge ad-badge--pending">⏳ Pending</span>,
  approved: <span className="ad-badge ad-badge--approved">✅ Verified</span>,
  rejected: <span className="ad-badge ad-badge--rejected">✗ Rejected</span>,
};

/* Calculate age from DOB string */
function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d)) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export default function DonorManagement({ showToast }) {
  const [tab,          setTab]          = useState("pending");
  const [donors,       setDonors]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [actionLoading,setActionLoading]= useState("");
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");
  const [viewDonor,    setViewDonor]    = useState(null);   // donor in detail modal
  const [viewLoading,  setViewLoading]  = useState(false);
  const [rejectModal,  setRejectModal]  = useState(null);   // donor being rejected
  const [rejectReason,  setRejectReason] = useState("");

  const fetchDonors = useCallback((status) => {
    setLoading(true);
    setError("");
    adminApi.getDonors(status)
      .then((d) => setDonors(d.donors || []))
      .catch((e) => { setError(e.message || "Failed to load donors."); setDonors([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDonors(tab); }, [tab, fetchDonors]);

  const handleApprove = async (id) => {
    setActionLoading(id + "_a");
    try {
      const d = await adminApi.approveDonor(id);
      showToast("success", d.message);
      fetchDonors(tab);
    } catch (e) {
      showToast("error", e.message);
    } finally { setActionLoading(""); }
  };

  /* Open the reject modal with a reason input */
  const openRejectModal = (donor) => {
    setRejectModal(donor);
    setRejectReason("");
  };

  /* Submit the rejection with a reason */
  const handleRejectConfirm = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal._id + "_r");
    try {
      const d = await adminApi.rejectDonor(rejectModal._id, rejectReason);
      showToast("success", d.message);
      setRejectModal(null);
      setRejectReason("");
      fetchDonors(tab);
    } catch (e) {
      showToast("error", e.message);
    } finally { setActionLoading(""); }
  };

  /* View donor details (with ID document) */
  const handleView = async (id) => {
    setViewLoading(true);
    setViewDonor(null);
    try {
      const d = await adminApi.getDonor(id);
      setViewDonor(d.donor);
    } catch (e) {
      showToast("error", e.message);
    } finally { setViewLoading(false); }
  };

  const filtered = donors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase()) ||
    (d.bloodGroup || "").toLowerCase().includes(search.toLowerCase()) ||
    (d.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: "pending",  label: "Pending"  },
    { id: "approved", label: "Verified" },
    { id: "rejected", label: "Rejected" },
    { id: "all",      label: "All"      },
  ];

  return (
    <div>
      <div className="ad-page-header">
        <div>
          <h1>Donor Management</h1>
          <p>Review and verify blood donor registrations.</p>
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
          <input placeholder="Search by name, email, blood group…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search donors" />
        </div>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          {filtered.length} donor{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="ad-loading"><div className="ad-spinner" /><span>Loading donors…</span></div>
      ) : filtered.length === 0 ? (
        <div className="ad-empty">
          <div className="ad-empty__icon"><Droplets size={28} /></div>
          <h3>No donors found</h3>
          <p>{search ? "Try a different search." : `No ${tab === "all" ? "" : tab} donor registrations.`}</p>
        </div>
      ) : (
        <div className="ad-card" style={{ padding: 0 }}>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Blood Group</th>
                  <th>City</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((d) => (
                    <motion.tr
                      key={d._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }} layout
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--danger-soft)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <User size={16} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: "var(--text)", fontSize: "var(--text-sm)" }}>{d.name}</p>
                            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{d.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {d.bloodGroup ? (
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "50%", background: "var(--danger-soft)", border: "2px solid var(--danger)", fontWeight: 800, fontSize: ".8rem", color: "var(--danger)" }}>
                            {d.bloodGroup}
                          </span>
                        ) : <span style={{ color: "var(--text-faint)" }}>—</span>}
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{d.city || "—"}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{d.phone || "—"}</td>
                      <td>{STATUS_BADGE[d.donorStatus] ?? STATUS_BADGE.pending}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          {/* View details */}
                          <button className="ad-btn ad-btn--outline ad-btn--sm" onClick={() => handleView(d._id)} title="View details">
                            <Eye size={13} /> View
                          </button>
                          {d.donorStatus !== "approved" && (
                            <button className="ad-btn ad-btn--success ad-btn--sm" onClick={() => handleApprove(d._id)} disabled={actionLoading.startsWith(d._id)}>
                              <CheckCircle size={13} /> Verify
                            </button>
                          )}
                          {d.donorStatus !== "rejected" && (
                            <button className="ad-btn ad-btn--danger ad-btn--sm" onClick={() => openRejectModal(d)} disabled={actionLoading.startsWith(d._id)}>
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

      {/* ── Donor Details Modal ── */}
      <AnimatePresence>
        {viewDonor && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setViewDonor(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}
            >
              {/* Modal header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #E2E8F0" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A" }}>Donor Details</h3>
                <button onClick={() => setViewDonor(null)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: "1rem" }}>✕</button>
              </div>

              {/* Modal body */}
              <div style={{ padding: 24 }}>
                {/* Name + badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--danger-soft)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem" }}>
                    {viewDonor.name?.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "1rem" }}>{viewDonor.name}</p>
                    <p style={{ fontSize: "0.8rem", color: "#64748B" }}>{viewDonor.email}</p>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    {STATUS_BADGE[viewDonor.donorStatus]}
                  </div>
                </div>

                {/* Details grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <DetailRow label="Blood Group" value={viewDonor.bloodGroup || "—"} />
                  <DetailRow label="Age" value={calcAge(viewDonor.dob) ? `${calcAge(viewDonor.dob)} years` : "—"} />
                  <DetailRow label="Phone" value={viewDonor.phone || "—"} />
                  <DetailRow label="City" value={viewDonor.city || "—"} />
                  <DetailRow label="State" value={viewDonor.state || "—"} />
                  <DetailRow label="Weight" value={viewDonor.weight || "—"} />
                  <DetailRow label="Occupation" value={viewDonor.occupation || "—"} />
                  <DetailRow label="Available" value={viewDonor.availability === false ? "No" : "Yes"} />
                  <DetailRow label="Address" value={viewDonor.address || "—"} />
                  <DetailRow label="Emergency Contact" value={viewDonor.emergencyName ? `${viewDonor.emergencyName}: ${viewDonor.emergencyContact || "—"}` : "—"} />
                </div>

                {/* Rejection reason if applicable */}
                {viewDonor.donorStatus === "rejected" && viewDonor.rejectionReason && (
                  <div style={{ background: "#FEE2E2", border: "1px solid #EF4444", borderRadius: 8, padding: "12px 14px", marginBottom: 20 }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#991B1B", marginBottom: 4 }}>Rejection Reason:</p>
                    <p style={{ fontSize: "0.82rem", color: "#7F1D1D" }}>{viewDonor.rejectionReason}</p>
                  </div>
                )}

                {/* ID Document */}
                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 16 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <FileText size={15} /> Uploaded ID Document
                  </p>
                  {viewDonor.idDocument && viewDonor.idDocument.data ? (
                    <div>
                      <p style={{ fontSize: "0.82rem", color: "#64748B", marginBottom: 8 }}>
                        {viewDonor.idDocument.fileName || "Document"} — uploaded {viewDonor.idDocument.uploadedAt ? new Date(viewDonor.idDocument.uploadedAt).toLocaleDateString() : "—"}
                      </p>
                      {/* Show image preview if it's an image, otherwise a download link */}
                      {viewDonor.idDocument.contentType?.startsWith("image/") ? (
                        <img
                          src={`data:${viewDonor.idDocument.contentType};base64,${viewDonor.idDocument.data}`}
                          alt="ID Document"
                          style={{ width: "100%", borderRadius: 8, border: "1px solid #E2E8F0" }}
                        />
                      ) : (
                        <a
                          href={`data:${viewDonor.idDocument.contentType || "application/octet-stream"};base64,${viewDonor.idDocument.data}`}
                          download={viewDonor.idDocument.fileName || "id-document"}
                          style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: "#2563EB", color: "#fff", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600 }}
                        >
                          <Download size={14} /> Download Document
                        </a>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.82rem", color: "#94A3B8" }}>No ID document uploaded.</p>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
                  {viewDonor.donorStatus !== "approved" && (
                    <button
                      className="ad-btn ad-btn--success"
                      onClick={async () => { await handleApprove(viewDonor._id); setViewDonor(null); }}
                    >
                      <CheckCircle size={15} /> Approve Donor
                    </button>
                  )}
                  {viewDonor.donorStatus !== "rejected" && (
                    <button
                      className="ad-btn ad-btn--danger"
                      onClick={() => { setRejectModal(viewDonor); setRejectReason(""); setViewDonor(null); }}
                    >
                      <XCircle size={15} /> Reject Donor
                    </button>
                  )}
                  <button className="ad-btn ad-btn--outline" onClick={() => setViewDonor(null)}>Close</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reject with Reason Modal ── */}
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
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A" }}>Reject Donor</h3>
                <button onClick={() => setRejectModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: "1rem" }}>✕</button>
              </div>
              <div style={{ padding: 24 }}>
                <p style={{ fontSize: "0.88rem", color: "#475569", marginBottom: 12 }}>
                  You are about to reject <strong>{rejectModal.name}</strong>. Please provide a reason so the donor can correct their details.
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. ID document is not clear. Please upload a valid Aadhaar card."
                  rows={3}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: "0.85rem", fontFamily: "inherit", resize: "vertical", outline: "none" }}
                />
                <div style={{ display: "flex", gap: 10, marginTop: 18, justifyContent: "flex-end" }}>
                  <button className="ad-btn ad-btn--outline" onClick={() => setRejectModal(null)}>Cancel</button>
                  <button className="ad-btn ad-btn--danger" onClick={handleRejectConfirm} disabled={actionLoading.startsWith(rejectModal._id)}>
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

/* ── Small helper component for detail rows ── */
function DetailRow({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</p>
      <p style={{ fontSize: "0.85rem", color: "#0F172A", fontWeight: 500 }}>{value}</p>
    </div>
  );
}
