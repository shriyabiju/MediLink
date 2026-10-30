import { useState } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function BloodBankHeader({ title = "Dashboard", onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const initials = user?.name ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "B";
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100, height: 68,
      background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(229,231,235,0.8)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px", boxShadow: "0 1px 8px rgba(30,58,138,0.06)", flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button onClick={onMenuClick} style={{ display: "none", alignItems: "center", justifyContent: "center", width: 38, height: 38, borderRadius: 10, background: "none", border: "none", cursor: "pointer", color: "#64748B" }} className="bb-menu-btn">
          <Menu size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0F172A", fontFamily: "Poppins, sans-serif" }}>{title}</h2>
          <p style={{ fontSize: "0.73rem", color: "#64748B" }}>Blood Bank Portal</p>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
        <button onClick={() => setShowProfile((p) => !p)} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "1.5px solid #E2E8F0", borderRadius: 11, padding: "5px 12px 5px 6px", cursor: "pointer", fontFamily: "inherit" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #2563EB, #1E3A8A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "#fff" }}>{initials}</div>
          <div style={{ textAlign: "left" }}>
            <strong style={{ display: "block", fontSize: "0.8rem", color: "#0F172A", fontWeight: 600, whiteSpace: "nowrap" }}>{user?.name ?? "Blood Bank"}</strong>
            <span style={{ fontSize: "0.7rem", color: "#64748B" }}>Blood Bank</span>
          </div>
          <ChevronDown size={14} style={{ color: "#64748B" }} />
        </button>

        {showProfile && (
          <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", boxShadow: "0 16px 48px rgba(30,58,138,0.14)", minWidth: 180, zIndex: 300, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #E2E8F0", fontSize: "0.78rem", color: "#64748B" }}>{user?.email ?? ""}</div>
            <button onClick={handleLogout} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: "0.875rem", fontWeight: 500, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Logout</button>
          </div>
        )}
      </div>

      <style>{`@media (max-width: 768px) { .bb-menu-btn { display: flex !important; } }`}</style>
    </header>
  );
}
