import { useState } from "react";
import { bloodBankApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function BloodBankSettings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [loading,  setLoading]  = useState(false);
  const [success, setSuccess]  = useState("");
  const [error,    setError]    = useState("");

  const set = (k, v) => setPasswords((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const d = await bloodBankApi.changePassword({
        currentPassword: passwords.current,
        newPassword:     passwords.next,
        confirmPassword: passwords.confirm,
      });
      setSuccess(d.message);
      setPasswords({ current: "", next: "", confirm: "" });
      setTimeout(() => setSuccess(""), 4000);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const inputStyle = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: "0.875rem", outline: "none", fontFamily: "inherit" };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0F172A", fontFamily: "Poppins, sans-serif" }}>Settings</h1>
        <p style={{ color: "#64748B", fontSize: "0.85rem" }}>Manage your account</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: 24, maxWidth: 480, marginBottom: 20 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 16 }}>🔒 Change Password</h2>
        {error   && <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: "0.85rem" }}>{error}</div>}
        {success && <div style={{ background: "#D1FAE5", color: "#065F46", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: "0.85rem" }}>✅ {success}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[["Current Password", "current"], ["New Password", "next"], ["Confirm Password", "confirm"]].map(([label, key]) => (
            <div key={key}>
              <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 5, display: "block" }}>{label}</label>
              <input type="password" placeholder="••••••••" style={inputStyle} value={passwords[key]} onChange={(e) => set(key, e.target.value)} required />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ padding: "11px", background: loading ? "#94A3B8" : "#2563EB", color: "#fff", borderRadius: 10, border: "none", fontWeight: 700, fontSize: "0.875rem", cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Updating…" : "Update Password"}</button>
        </form>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #FECACA", padding: 24, maxWidth: 480 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#EF4444", marginBottom: 12 }}>⚠️ Account</h2>
        <p style={{ color: "#64748B", fontSize: "0.85rem", marginBottom: 14 }}>Logging out will remove your session from this device.</p>
        <button onClick={handleLogout} style={{ padding: "10px 24px", background: "#FEF2F2", color: "#EF4444", border: "1.5px solid #FECACA", borderRadius: 10, fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>🚪 Logout</button>
      </div>
    </div>
  );
}
