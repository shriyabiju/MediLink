import { useRef, useEffect } from "react";
import { LayoutDashboard, Droplet, ClipboardList, Bell, Settings, LogOut, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const NAV = [
  { id: "home",          label: "Dashboard",     icon: LayoutDashboard },
  { id: "inventory",     label: "Blood Inventory", icon: Droplet },
  { id: "requests",      label: "Blood Requests", icon: ClipboardList },
  { id: "notifications", label: "Notifications",  icon: Bell },
  { id: "settings",      label: "Settings",       icon: Settings },
];

export default function BloodBankSidebar({ active, setActive, isOpen, onClose }) {
  const ref = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user?.name ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "B";
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  useEffect(() => {
    const handler = (e) => { if (isOpen && ref.current && !ref.current.contains(e.target)) onClose?.(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 199 }} onClick={onClose} />}
      <aside
        ref={ref}
        style={{
          position: "fixed", top: 0, left: 0, width: 260, height: "100vh",
          background: "linear-gradient(180deg, #0F2462 0%, #1E3A8A 60%, #1e3895 100%)",
          display: "flex", flexDirection: "column", zIndex: 200,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "22px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ width: 38, height: 38, background: "#2563EB", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>🏦</div>
          <div>
            <span style={{ display: "block", fontFamily: "Poppins, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>MediLink</span>
            <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)" }}>Blood Bank Portal</span>
          </div>
          {isOpen && <button onClick={onClose} style={{ display: "none" }}><X /></button>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 12px", overflowY: "auto" }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", padding: "14px 10px 6px" }}>Menu</p>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActive(id); onClose?.(); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%",
                padding: "10px 12px", borderRadius: 10, border: "none",
                background: active === id ? "rgba(255,255,255,0.12)" : "transparent",
                color: active === id ? "#fff" : "rgba(255,255,255,0.6)",
                fontSize: "0.875rem", fontWeight: active === id ? 600 : 500, textAlign: "left",
                cursor: "pointer", position: "relative", marginBottom: 2,
                transition: "background 0.15s, color 0.15s",
              }}
            >
              {active === id && <span style={{ position: "absolute", left: 0, top: "20%", height: "60%", width: 3, background: "#60A5FA", borderRadius: "0 3px 3px 0" }} />}
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "14px 12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "10px 14px", borderRadius: 10, background: "rgba(255,255,255,0.07)" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#2563EB", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <strong style={{ display: "block", fontSize: "0.8rem", color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name ?? "Blood Bank"}</strong>
              <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)" }}>Blood Bank</span>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", borderRadius: 10, border: "none", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer", transition: "background 0.15s, color 0.15s" }}>
            <LogOut size={16} /> <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
