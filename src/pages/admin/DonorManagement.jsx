import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Search, CheckCircle, XCircle, AlertTriangle, User } from "lucide-react";
import { adminApi } from "../../services/api";
import "../admin/css/admin.css";

const STATUS_BADGE = {
  pending:  <span className="ad-badge ad-badge--pending">⏳ Pending</span>,
  approved: <span className="ad-badge ad-badge--approved">✅ Verified</span>,
  rejected: <span className="ad-badge ad-badge--rejected">✗ Rejected</span>,
};

export default function DonorManagement({ showToast }) {
  const [tab,          setTab]          = useState("pending");
  const [donors,       setDonors]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [actionLoading,setActionLoading]= useState("");
  const [error,        setError]        = useState("");
  const [search,       setSearch]       = useState("");

  const fetchDonors = useCallback((status) => {
    setLoading(true);
    setError("");
    adminApi.getDonors(status)
      .then((d) => setDonors(d.donors))
      .catch((e) => setError(e.message))
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

  const handleReject = async (id) => {
    if (!window.confirm("Reject this donor?")) return;
    setActionLoading(id + "_r");
    try {
      const d = await adminApi.rejectDonor(id);
      showToast("success", d.message);
      fetchDonors(tab);
    } catch (e) {
      showToast("error", e.message);
    } finally { setActionLoading(""); }
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
                          {d.donorStatus !== "approved" && (
                            <button className="ad-btn ad-btn--success ad-btn--sm" onClick={() => handleApprove(d._id)} disabled={actionLoading.startsWith(d._id)}>
                              <CheckCircle size={13} /> Verify
                            </button>
                          )}
                          {d.donorStatus !== "rejected" && (
                            <button className="ad-btn ad-btn--danger ad-btn--sm" onClick={() => handleReject(d._id)} disabled={actionLoading.startsWith(d._id)}>
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
    </div>
  );
}
