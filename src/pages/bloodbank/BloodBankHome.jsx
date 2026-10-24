import { useState, useEffect } from "react";
import { Droplet, ClipboardList, CheckCircle, AlertTriangle } from "lucide-react";
import { bloodBankApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function BloodBankHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bloodBankApi.getStats()
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: "center", color: "#94A3B8", marginTop: 40 }}>Loading…</div>;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = user?.name?.split(" ")[0] || "there";

  const cards = [
    { label: "Total Units",       value: stats?.totalUnits ?? 0,         icon: Droplet,        color: "#EF4444", bg: "#FEE2E2" },
    { label: "Blood Groups",      value: stats?.bloodGroups ?? 0,        icon: Droplet,        color: "#2563EB", bg: "#EFF6FF" },
    { label: "Pending Requests",  value: stats?.pendingRequests ?? 0,   icon: ClipboardList,  color: "#F59E0B", bg: "#FFFBEB" },
    { label: "Completed",         value: stats?.completedRequests ?? 0, icon: CheckCircle,     color: "#10B981", bg: "#ECFDF5" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#0F172A", fontFamily: "Poppins, sans-serif", marginBottom: 4 }}>{greeting}, {name} 👋</h1>
        <p style={{ color: "#64748B", fontSize: "0.875rem" }}>Here's your Blood Bank overview.</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 20, marginBottom: 28 }}>
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: 24, display: "flex", alignItems: "flex-start", gap: 16, transition: "transform 0.2s, box-shadow 0.2s" }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon size={22} />
            </div>
            <div>
              <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0F172A", fontFamily: "Poppins, sans-serif", lineHeight: 1 }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Expired stock warning */}
      {(stats?.expiredStockCount ?? 0) > 0 && (
        <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={18} color="#EF4444" />
          <span style={{ color: "#991B1B", fontSize: "0.875rem", fontWeight: 600 }}>{stats.expiredStockCount} stock record(s) have expired. Please remove them from your inventory.</span>
        </div>
      )}
    </div>
  );
}
