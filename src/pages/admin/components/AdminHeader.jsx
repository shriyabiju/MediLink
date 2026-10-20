import { useState } from "react";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const HEADER_STYLE = {
  position: "sticky", top: 0, zIndex: 100,
  height: "var(--header-h)",
  background: "rgba(255,255,255,.92)",
  backdropFilter: "blur(16px)",
  borderBottom: "1px solid rgba(229,231,235,.8)",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 var(--space-7)",
  boxShadow: "0 1px 8px rgba(30,58,138,.06)",
  flexShrink: 0,
};

export default function AdminHeader({ onMenuClick, pageTitle = "Dashboard" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  return (
    <header style={HEADER_STYLE}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <button
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          style={{
            width: 38, height: 38, display: "none", alignItems: "center", justifyContent: "center",
            borderRadius: 10, background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)",
          }}
          className="ad-menu-btn"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 style={{ fontSize: ".95rem", fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-heading)" }}>
            {pageTitle}
          </h2>
          <p style={{ fontSize: ".73rem", color: "var(--text-muted)" }}>Admin Portal</p>
        </div>
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Profile */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowProfile((p) => !p)}
            style={{
              display: "flex", alignItems: "center", gap: 9,
              background: "none", border: "1.5px solid var(--border)",
              borderRadius: 11, padding: "5px 12px 5px 6px",
              cursor: "pointer", fontFamily: "inherit",
              transition: "all var(--transition)",
            }}
            aria-expanded={showProfile}
          >
            <div
              style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary-light), var(--primary))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: ".72rem", fontWeight: 700, color: "#fff",
              }}
            >
              {initials}
            </div>
            <div style={{ textAlign: "left" }}>
              <strong style={{ display: "block", fontSize: ".8rem", color: "var(--text)", fontWeight: 600, whiteSpace: "nowrap" }}>
                {user?.name ?? "Admin"}
              </strong>
              <span style={{ fontSize: ".7rem", color: "var(--text-muted)" }}>Administrator</span>
            </div>
            <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0,
                  background: "#fff", borderRadius: "var(--radius)",
                  border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)",
                  minWidth: 180, zIndex: 300, overflow: "hidden",
                }}
                initial={{ opacity: 0, y: -8, scale: .95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: .95 }}
                transition={{ duration: 0.16 }}
              >
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: ".78rem", color: "var(--text-muted)" }}>
                  {user?.email ?? ""}
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "10px 16px", fontSize: "var(--text-sm)", fontWeight: 500,
                    color: "var(--danger)", background: "none", border: "none",
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "background var(--transition)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--danger-soft)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                >
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .ad-menu-btn { display: flex !important; } }
      `}</style>
    </header>
  );
}
