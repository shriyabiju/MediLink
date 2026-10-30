import { useEffect, useState, useCallback } from "react";
import { ClipboardList, Search, AlertTriangle } from "lucide-react";
import { adminApi } from "../../services/api";
import "../admin/css/admin.css";

const STATUS_OPTS   = ["all", "open", "partially_filled", "fulfilled", "cancelled"];
const URGENCY_OPTS  = ["all", "Critical", "High", "Medium", "Low"];
const BG_OPTS       = ["all", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const URGENCY_BADGE = {
  Critical: "ad-badge ad-badge--danger",
  High:     "ad-badge ad-badge--warning",
  Medium:   "ad-badge ad-badge--info",
  Low:      "ad-badge ad-badge--neutral",
};

const STATUS_BADGE = {
  open:             "ad-badge ad-badge--approved",
  partially_filled: "ad-badge ad-badge--info",
  fulfilled:        "ad-badge ad-badge--neutral",
  cancelled:        "ad-badge ad-badge--rejected",
};

const STATUS_LABEL = {
  open:             "Open",
  partially_filled: "Partial",
  fulfilled:        "Fulfilled",
  cancelled:        "Cancelled",
};

export default function RequestsOverview({ showToast }) {
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [search,    setSearch]    = useState("");
  const [statusF,   setStatusF]   = useState("all");
  const [urgencyF,  setUrgencyF]  = useState("all");
  const [bgF,       setBgF]       = useState("all");
  const [actionId,  setActionId]  = useState("");

  const fetchRequests = useCallback(() => {
    setLoading(true);
    setError("");
    const params = {};
    if (statusF  !== "all") params.status     = statusF;
    if (urgencyF !== "all") params.urgency    = urgencyF;
    if (bgF      !== "all") params.bloodGroup = bgF;
    adminApi.getBloodRequests(params)
      .then((d) => setRequests(d.requests || []))
      .catch((e) => { setError(e.message || "Failed to load requests."); setRequests([]); })
      .finally(() => setLoading(false));
  }, [statusF, urgencyF, bgF]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleStatusChange = async (id, newStatus) => {
    setActionId(id);
    try {
      const d = await adminApi.updateBloodRequestStatus(id, newStatus);
      showToast?.("success", d.message);
      fetchRequests();
    } catch (e) {
      showToast?.("error", e.message);
    } finally {
      setActionId("");
    }
  };

  const filtered = requests.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      r.hospitalName?.toLowerCase().includes(q) ||
      r.hospitalCity?.toLowerCase().includes(q) ||
      r.bloodGroup?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="ad-page-header">
        <div>
          <h1>Requests Overview</h1>
          <p>Monitor and manage emergency blood requests posted by hospitals.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "var(--danger-soft)", border: "1px solid var(--danger)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: "var(--space-5)", color: "#991B1B", fontSize: "var(--text-sm)", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Filters */}
      <div className="ad-search-bar" style={{ flexWrap: "wrap", gap: 8, marginBottom: "var(--space-5)" }}>
        <div className="ad-search-wrap">
          <Search size={15} className="ad-search-icon" />
          <input
            placeholder="Search hospital, city, blood group…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {[
          { label: "Status",     opts: STATUS_OPTS,  val: statusF,  set: setStatusF  },
          { label: "Urgency",    opts: URGENCY_OPTS, val: urgencyF, set: setUrgencyF },
          { label: "Blood Group",opts: BG_OPTS,      val: bgF,      set: setBgF      },
        ].map(({ label, opts, val, set }) => (
          <select
            key={label}
            value={val}
            onChange={(e) => set(e.target.value)}
            style={{ padding: "9px 12px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontFamily: "inherit", fontSize: "var(--text-sm)", background: "#F9FAFB", cursor: "pointer", outline: "none" }}
            aria-label={label}
          >
            {opts.map((o) => (
              <option key={o} value={o}>{o === "all" ? `All ${label}s` : (STATUS_LABEL[o] || o)}</option>
            ))}
          </select>
        ))}
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", alignSelf: "center" }}>
          {filtered.length} request{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="ad-loading"><div className="ad-spinner" /><span>Loading requests…</span></div>
      ) : filtered.length === 0 ? (
        <div className="ad-empty" style={{ background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "var(--space-12)" }}>
          <div className="ad-empty__icon"><ClipboardList size={28} /></div>
          <h3>No blood requests found</h3>
          <p>{search ? "Try a different search term." : "No requests match the current filters."}</p>
        </div>
      ) : (
        <div className="ad-card" style={{ padding: 0 }}>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Posted</th>
                  <th>Change Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <p style={{ fontWeight: 600, color: "var(--text)", fontSize: "var(--text-sm)" }}>{r.hospitalName}</p>
                      {r.hospitalCity && <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{r.hospitalCity}{r.hospitalState ? `, ${r.hospitalState}` : ""}</p>}
                    </td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: "50%", background: "var(--danger-soft)", border: "2px solid var(--danger)", fontWeight: 800, fontSize: ".8rem", color: "var(--danger)" }}>
                        {r.bloodGroup}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-secondary)" }}>
                      {r.unitsFilled}/{r.unitsNeeded}
                    </td>
                    <td>
                      <span className={URGENCY_BADGE[r.urgency] || "ad-badge ad-badge--neutral"}>
                        {r.urgency}
                      </span>
                    </td>
                    <td>
                      <span className={STATUS_BADGE[r.status] || "ad-badge ad-badge--neutral"}>
                        {STATUS_LABEL[r.status] || r.status}
                      </span>
                    </td>
                    <td style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <select
                        value={r.status}
                        disabled={actionId === r._id}
                        onChange={(e) => handleStatusChange(r._id, e.target.value)}
                        style={{ padding: "5px 8px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-xs)", fontFamily: "inherit", fontSize: "var(--text-xs)", background: "#F9FAFB", cursor: "pointer", outline: "none" }}
                      >
                        <option value="open">Open</option>
                        <option value="partially_filled">Partial</option>
                        <option value="fulfilled">Fulfilled</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
