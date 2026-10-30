import { useState, useEffect, useCallback } from "react";
import {
  Droplet, ClipboardList, CheckCircle, AlertTriangle, RefreshCw, Package,
} from "lucide-react";
import { bloodBankApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

/* ── Blood group colours ── */
const BG_COLORS = {
  "A+": "#2563EB", "A-": "#7C3AED", "B+": "#0891B2", "B-": "#DC2626",
  "O+": "#16A34A", "O-": "#EF4444", "AB+": "#D97706", "AB-": "#6B7280",
};
const BG_LIGHT = {
  "A+": "#EFF6FF", "A-": "#EDE9FE", "B+": "#E0F2FE", "B-": "#FEF2F2",
  "O+": "#ECFDF5", "O-": "#FEE2E2", "AB+": "#FFFBEB", "AB-": "#F9FAFB",
};

const URGENCY_STYLE = {
  Critical: { bg: "#FEE2E2", color: "#991B1B" },
  High:     { bg: "#FEF3C7", color: "#92400E" },
  Medium:   { bg: "#DBEAFE", color: "#1E40AF" },
  Low:      { bg: "#F3F4F6", color: "#374151" },
};
const STATUS_STYLE = {
  open:             { bg: "#D1FAE5", color: "#065F46", label: "Open" },
  partially_filled: { bg: "#DBEAFE", color: "#1E40AF", label: "Partial" },
  fulfilled:        { bg: "#F3F4F6", color: "#374151", label: "Fulfilled" },
  cancelled:        { bg: "#FEE2E2", color: "#991B1B", label: "Cancelled" },
};

/* ── Simple inline bar chart ── */
function BloodStockBar({ label, value, max }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const color = BG_COLORS[label] || "#2563EB";
  const light = BG_LIGHT[label]  || "#EFF6FF";
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: "50%", background: light, border: `2px solid ${color}`, fontWeight: 800, fontSize: "0.7rem", color }}>{label}</span>
          <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0F172A" }}>{value} unit{value !== 1 ? "s" : ""}</span>
        </div>
        <span style={{ fontSize: "0.72rem", color: "#64748B" }}>{pct.toFixed(0)}%</span>
      </div>
      <div style={{ height: 8, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

export default function BloodBankHome() {
  const { user } = useAuth();
  const [stats,    setStats]    = useState(null);
  const [stock,    setStock]    = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const fetchAll = useCallback(() => {
    setLoading(true);
    setError("");
    Promise.all([
      bloodBankApi.getStats(),
      bloodBankApi.getStock(),
      bloodBankApi.getRequests("all"),
    ])
      .then(([s, inv, req]) => {
        setStats(s);
        setStock(inv.stock || []);
        setRequests((req.requests || []).slice(0, 6));
      })
      .catch((e) => setError(e.message || "Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] || "there";

  /* Aggregate stock by blood group (non-expired, units > 0) */
  const now = new Date();
  const activeStock = stock.filter((s) => s.units > 0 && new Date(s.expiresOn) > now);
  const stockByGroup = {};
  activeStock.forEach((s) => {
    stockByGroup[s.bloodGroup] = (stockByGroup[s.bloodGroup] || 0) + s.units;
  });
  const stockEntries = Object.entries(stockByGroup).sort((a, b) => b[1] - a[1]);
  const maxUnits = stockEntries.length > 0 ? stockEntries[0][1] : 1;

  const CARDS = stats ? [
    {
      label: "Total Units",      value: stats.totalUnits ?? 0,
      icon: Droplet,       color: "#EF4444", bg: "#FEE2E2",
      sub: "Non-expired units in stock",
    },
    {
      label: "Blood Groups",     value: stats.bloodGroups ?? 0,
      icon: Package,       color: "#2563EB", bg: "#EFF6FF",
      sub: "Active blood group types",
    },
    {
      label: "Pending Requests", value: stats.pendingRequests ?? 0,
      icon: ClipboardList,  color: "#F59E0B", bg: "#FFFBEB",
      sub: "Open & partially filled",
    },
    {
      label: "Completed",        value: stats.completedRequests ?? 0,
      icon: CheckCircle,   color: "#10B981", bg: "#ECFDF5",
      sub: "Fulfilled requests",
    },
  ] : [];

  return (
    <div style={{ minWidth: 0 }}>

      {/* ── Greeting ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.55rem", fontWeight: 700, color: "#0F172A", fontFamily: "Poppins, sans-serif", marginBottom: 4 }}>
            {greeting}, {firstName} 👋
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.875rem" }}>Here's your Blood Bank overview for today.</p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", color: "#475569", fontSize: "0.82rem", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}
        >
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: 10, marginBottom: 20, fontSize: "0.875rem", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* ── Expired stock warning ── */}
      {!loading && (stats?.expiredStockCount ?? 0) > 0 && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 12, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={16} color="#EF4444" />
          <span style={{ color: "#991B1B", fontSize: "0.875rem", fontWeight: 600 }}>
            {stats.expiredStockCount} expired stock record{stats.expiredStockCount > 1 ? "s" : ""}. Go to Blood Inventory to remove them.
          </span>
        </div>
      )}

      {/* ── Stat cards — 4 equal columns ── */}
      <div className="bb-stat-grid">
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", height: 110, animation: "pulse 1.5s ease infinite" }} />
            ))
          : CARDS.map(({ label, value, icon: Icon, color, bg, sub }) => (
              <div key={label} className="bb-stat-card">
                <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={22} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4, whiteSpace: "nowrap" }}>{label}</p>
                  <p style={{ fontSize: "1.9rem", fontWeight: 800, color: "#0F172A", fontFamily: "Poppins, sans-serif", lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: "0.68rem", color: "#94A3B8", marginTop: 4 }}>{sub}</p>
                </div>
              </div>
            ))
        }
      </div>

      {/* ── Two-column section: blood inventory chart + recent requests ── */}
      <div className="bb-two-col">

        {/* Blood Inventory Chart */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A" }}>🩸 Blood Inventory</h3>
              <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>Available units by blood group (non-expired)</p>
            </div>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#2563EB", background: "#EFF6FF", padding: "4px 10px", borderRadius: 20 }}>
              {activeStock.length} active record{activeStock.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[1,2,3,4].map((i) => <div key={i} style={{ height: 36, background: "#F1F5F9", borderRadius: 8, animation: "pulse 1.5s ease infinite" }} />)}
            </div>
          ) : stockEntries.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#94A3B8" }}>
              <Droplet size={28} style={{ marginBottom: 8, color: "#CBD5E1" }} />
              <p style={{ fontSize: "0.85rem" }}>No active blood stock. Add inventory using Blood Inventory.</p>
            </div>
          ) : (
            <div>
              {stockEntries.map(([group, units]) => (
                <BloodStockBar key={group} label={group} value={units} max={maxUnits} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Blood Requests */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", padding: "22px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0F172A" }}>📋 Recent Requests</h3>
              <p style={{ fontSize: "0.75rem", color: "#64748B", marginTop: 2 }}>Last 6 blood requests on the platform</p>
            </div>
          </div>

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1,2,3].map((i) => <div key={i} style={{ height: 54, background: "#F1F5F9", borderRadius: 10, animation: "pulse 1.5s ease infinite" }} />)}
            </div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 16px", color: "#94A3B8" }}>
              <ClipboardList size={28} style={{ marginBottom: 8, color: "#CBD5E1" }} />
              <p style={{ fontSize: "0.85rem" }}>No blood requests yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {requests.map((r) => {
                const urgStyle  = URGENCY_STYLE[r.urgency]  || URGENCY_STYLE.Medium;
                const statStyle = STATUS_STYLE[r.status]    || STATUS_STYLE.open;
                const bgColor   = BG_COLORS[r.bloodGroup]   || "#2563EB";
                const ltColor   = BG_LIGHT[r.bloodGroup]    || "#EFF6FF";
                return (
                  <div key={r._id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#F8FAFC", borderRadius: 10, border: "1px solid #E2E8F0" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: "50%", background: ltColor, border: `2px solid ${bgColor}`, fontWeight: 800, fontSize: "0.72rem", color: bgColor, flexShrink: 0 }}>
                      {r.bloodGroup}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.hospitalName || "—"}</p>
                      <p style={{ fontSize: "0.7rem", color: "#64748B" }}>
                        {r.unitsNeeded} unit{r.unitsNeeded !== 1 ? "s" : ""}
                        {r.createdAt ? " · " + new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: urgStyle.bg, color: urgStyle.color }}>{r.urgency}</span>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: statStyle.bg, color: statStyle.color }}>{statStyle.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* ── Responsive + animation styles ── */}
      <style>{`
        .bb-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 28px;
        }
        .bb-stat-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          padding: 22px 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .bb-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(30,58,138,0.10);
        }
        .bb-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 28px;
        }
        @media (max-width: 1100px) {
          .bb-stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .bb-stat-grid { grid-template-columns: 1fr; }
          .bb-two-col   { grid-template-columns: 1fr; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
