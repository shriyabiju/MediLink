import { useState, useEffect } from "react";
import { ClipboardList, RefreshCw } from "lucide-react";
import { patientApi } from "../../services/api";

const REVIEW_LABELS = {
  pending:      { label: "Pending",      bg: "#FEF3C7", color: "#92400E" },
  under_review: { label: "Under Review", bg: "#DBEAFE", color: "#1E40AF" },
  approved:     { label: "Approved",     bg: "#D1FAE5", color: "#065F46" },
  rejected:     { label: "Rejected",     bg: "#FEE2E2", color: "#991B1B" },
  fulfilled:    { label: "Fulfilled",    bg: "#ECFDF5", color: "#065F46" },
};

const URGENCY_COLORS = { Normal: "#10B981", Urgent: "#F59E0B", Emergency: "#EF4444", High: "#F97316", Critical: "#DC2626", Medium: "#3B82F6", Low: "#6B7280" };

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const fetchRequests = () => {
    setLoading(true);
    setError("");
    patientApi.getMyRequests()
      .then((d) => setRequests(d.requests || []))
      .catch((e) => setError(e.message || "Failed to load requests."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  return (
    <div className="page-body">
      <div className="page-header animate-fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>📋 My Blood Requests</h1>
          <p>Track the status of your blood requests to hospitals.</p>
        </div>
        <button
          onClick={fetchRequests}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", color: "#475569", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: "0.875rem" }}>
          ❌ {error}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: "center", color: "#94A3B8", marginTop: 32 }}>Loading…</p>
      ) : requests.length === 0 ? (
        <div className="section-card" style={{ textAlign: "center", padding: 48 }}>
          <ClipboardList size={36} style={{ color: "#CBD5E1", marginBottom: 12 }} />
          <p style={{ color: "#94A3B8", fontSize: "0.9rem", marginBottom: 16 }}>
            You haven't submitted any blood requests yet.
          </p>
          <p style={{ color: "#64748B", fontSize: "0.82rem" }}>
            Go to <strong>Hospitals</strong> and click <strong>Book Appointment</strong> to submit a blood request.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {requests.map((r) => {
            const rv = REVIEW_LABELS[r.reviewStatus] || REVIEW_LABELS.pending;
            const urgColor = URGENCY_COLORS[r.urgency] || "#64748B";
            return (
              <div key={r._id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", background: "#FEE2E2", border: "2px solid #EF4444", fontWeight: 800, fontSize: "0.78rem", color: "#991B1B", flexShrink: 0 }}>
                        {r.bloodGroup}
                      </span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#0F172A" }}>{r.hospitalName}</p>
                        {r.hospitalCity && <p style={{ fontSize: "0.75rem", color: "#64748B" }}>📍 {r.hospitalCity}</p>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: "0.75rem", color: "#475569" }}>
                        <strong>{r.unitsNeeded}</strong> unit{r.unitsNeeded !== 1 ? "s" : ""} needed
                      </span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: urgColor }}>
                        ⚡ {r.urgency}
                      </span>
                      {r.requiredDate && (
                        <span style={{ fontSize: "0.75rem", color: "#475569" }}>
                          📅 {new Date(r.requiredDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </span>
                      )}
                    </div>
                    {r.reason && (
                      <p style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 6, fontStyle: "italic" }}>
                        Reason: {r.reason}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    <span style={{ padding: "4px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, background: rv.bg, color: rv.color }}>
                      {rv.label}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
