import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { bloodBankApi } from "../../services/api";

const URGENCY_BADGE = { Critical: { bg: "#FEE2E2", color: "#991B1B" }, High: { bg: "#FEF3C7", color: "#92400E" }, Medium: { bg: "#DBEAFE", color: "#1E40AF" }, Low: { bg: "#F3F4F6", color: "#374151" } };
const STATUS_BADGE = { open: { bg: "#D1FAE5", color: "#065F46", label: "Open" }, partially_filled: { bg: "#DBEAFE", color: "#1E40AF", label: "Partial" }, fulfilled: { bg: "#F3F4F6", color: "#374151", label: "Fulfilled" }, cancelled: { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" } };
const STATUS_OPTS = ["all", "open", "partially_filled", "fulfilled", "cancelled"];

export default function BloodBankRequests() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fulfillModal, setFulfillModal] = useState(null);
  const [stockList,    setStockList]    = useState([]);
  const [selectedStock, setSelectedStock] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchRequests = useCallback(() => {
    setLoading(true);
    bloodBankApi.getRequests(statusFilter !== "all" ? statusFilter : "all")
      .then((d) => setRequests(d.requests))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const openFulfill = async (req) => {
    setFulfillModal(req);
    const d = await bloodBankApi.getStock();
    setStockList(d.stock.filter((s) => s.bloodGroup === req.bloodGroup && s.units > 0 && new Date(s.expiresOn) > new Date()));
    setSelectedStock("");
  };

  const handleFulfill = async () => {
    if (!fulfillModal) return;
    if (!selectedStock) { alert("Please select a stock record."); return; }
    setActionLoading(fulfillModal._id);
    try {
      await bloodBankApi.fulfillRequest(fulfillModal._id, { stockId: selectedStock });
      setFulfillModal(null);
      fetchRequests();
    } catch (e) { alert(e.message); }
    finally { setActionLoading(""); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this request?")) return;
    setActionLoading(id);
    try { await bloodBankApi.cancelRequest(id); fetchRequests(); }
    catch (e) { alert(e.message); }
    finally { setActionLoading(""); }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0F172A", fontFamily: "Poppins, sans-serif" }}>Blood Requests</h1>
        <p style={{ color: "#64748B", fontSize: "0.85rem" }}>View and respond to blood requests from hospitals and patients</p>
      </div>

      {error && <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: "0.875rem" }}>{error}</div>}

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUS_OPTS.map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1.5px solid", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer",
            borderColor: statusFilter === s ? "#2563EB" : "#E2E8F0", background: statusFilter === s ? "#EFF6FF" : "#fff", color: statusFilter === s ? "#2563EB" : "#64748B",
          }}>{s === "all" ? "All" : (STATUS_BADGE[s]?.label || s)}</button>
        ))}
      </div>

      {loading ? <p style={{ textAlign: "center", color: "#94A3B8" }}>Loading…</p> : requests.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>No blood requests found.</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead><tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                {["Hospital", "Blood Group", "Units", "Urgency", "Status", "Posted By", "Date", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {requests.map((r) => {
                  const ub = URGENCY_BADGE[r.urgency] || URGENCY_BADGE.Medium;
                  const sb = STATUS_BADGE[r.status] || STATUS_BADGE.open;
                  return (
                    <tr key={r._id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "14px 18px" }}><strong style={{ fontSize: "0.85rem" }}>{r.hospitalName}</strong>{r.hospitalCity && <p style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{r.hospitalCity}</p>}</td>
                      <td style={{ padding: "14px 18px" }}><span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", background: "#FEE2E2", border: "2px solid #EF4444", fontWeight: 800, fontSize: "0.78rem", color: "#991B1B" }}>{r.bloodGroup}</span></td>
                      <td style={{ padding: "14px 18px", fontWeight: 600 }}>{r.unitsFilled}/{r.unitsNeeded}</td>
                      <td style={{ padding: "14px 18px" }}><span style={{ background: ub.bg, color: ub.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>{r.urgency}</span></td>
                      <td style={{ padding: "14px 18px" }}><span style={{ background: sb.bg, color: sb.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>{sb.label}</span></td>
                      <td style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#64748B" }}>{r.postedBy?.name || "—"}<br /><span style={{ fontSize: "0.7rem" }}>{r.postedBy?.role || ""}</span></td>
                      <td style={{ padding: "14px 18px", fontSize: "0.78rem", color: "#94A3B8" }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}</td>
                      <td style={{ padding: "14px 18px" }}>
                        {(r.status === "open" || r.status === "partially_filled") && (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => openFulfill(r)} disabled={actionLoading === r._id} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "none", background: "#D1FAE5", color: "#065F46", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}><CheckCircle size={13} /> Fulfill</button>
                            <button onClick={() => handleCancel(r._id)} disabled={actionLoading === r._id} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8, border: "none", background: "#FEE2E2", color: "#991B1B", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}><XCircle size={13} /> Cancel</button>
                          </div>
                        )}
                        {(r.status === "fulfilled" || r.status === "cancelled") && <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fulfill modal */}
      {fulfillModal && (
        <div onClick={() => setFulfillModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420, boxShadow: "0 24px 64px rgba(15,23,42,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #E2E8F0" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Fulfill Request</h3>
              <button onClick={() => setFulfillModal(null)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: "1rem", color: "#64748B" }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: "0.875rem", color: "#64748B", marginBottom: 14 }}>Request: <strong style={{ color: "#EF4444" }}>{fulfillModal.bloodGroup}</strong> — {fulfillModal.unitsNeeded} unit(s) from {fulfillModal.hospitalName}</p>
              {stockList.length === 0 ? (
                <p style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 8, fontSize: "0.875rem" }}>No available stock for {fulfillModal.bloodGroup}. Please add stock first.</p>
              ) : (
                <>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6, display: "block" }}>Select stock to deduct from:</label>
                  <select style={{ width: "100%", padding: "9px 13px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: "0.875rem", outline: "none", fontFamily: "inherit" }} value={selectedStock} onChange={(e) => setSelectedStock(e.target.value)}>
                    <option value="">Select stock…</option>
                    {stockList.map((s) => <option key={s._id} value={s._id}>{s.bloodGroup} — {s.units} units — expires {new Date(s.expiresOn).toLocaleDateString()}</option>)}
                  </select>
                </>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid #E2E8F0" }}>
              <button onClick={() => setFulfillModal(null)} style={{ padding: "9px 18px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>Cancel</button>
              {stockList.length > 0 && <button onClick={handleFulfill} disabled={actionLoading === fulfillModal._id} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: actionLoading === fulfillModal._id ? "#94A3B8" : "#10B981", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>{actionLoading === fulfillModal._id ? "Fulfilling…" : "Confirm Fulfill"}</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
