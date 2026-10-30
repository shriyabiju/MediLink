import { useState } from "react";
import { patientApi } from "../../services/api";
import { useAuth }    from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError,   setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const set = (k, v) => setPasswords((p) => ({ ...p, [k]: v }));

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    setPwLoading(true);
    try {
      const d = await patientApi.changePassword({
        currentPassword: passwords.current,
        newPassword:     passwords.next,
        confirmPassword: passwords.confirm,
      });
      setPwSuccess(d.message);
      setPasswords({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSuccess(""), 4000);
    } catch (err) {
      setPwError(err.message || "Failed to change password.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div className="page-body">
      <div className="page-header animate-fade-up">
        <h1>⚙️ Settings</h1>
        <p>Manage your account preferences.</p>
      </div>

      {/* Change Password */}
      <div className="section-card" style={{ maxWidth: 480, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🔒 Change Password</h2>

        {pwError   && <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>{pwError}</div>}
        {pwSuccess && <div style={{ background: "#D1FAE5", color: "#065F46", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>✅ {pwSuccess}</div>}

        <form onSubmit={handlePwSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            ["Current Password", "current", "Enter current password"],
            ["New Password",     "next",    "Min. 8 characters"],
            ["Confirm Password", "confirm", "Re-enter new password"],
          ].map(([label, key, placeholder]) => (
            <div key={key}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 5, fontSize: 13 }}>{label}</label>
              <input
                type="password"
                placeholder={placeholder}
                style={inputStyle}
                value={passwords[key]}
                onChange={(e) => set(key, e.target.value)}
                required
              />
            </div>
          ))}
          <button type="submit" disabled={pwLoading} style={{
            padding: "11px", background: pwLoading ? "#94A3B8" : "#2563EB",
            color: "#fff", borderRadius: 10, border: "none",
            fontWeight: 700, fontSize: 14, cursor: pwLoading ? "not-allowed" : "pointer",
          }}>
            {pwLoading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>

      {/* Logout */}
      <div className="section-card" style={{ maxWidth: 480, borderColor: "#FECACA" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#EF4444", marginBottom: 12 }}>⚠️ Account</h2>
        <p style={{ color: "#64748B", fontSize: 13, marginBottom: 14 }}>
          Logging out will remove your session from this device.
        </p>
        <button onClick={handleLogout} style={{
          padding: "10px 24px", background: "#FEF2F2", color: "#EF4444",
          border: "1.5px solid #FECACA", borderRadius: 10,
          fontWeight: 700, fontSize: 14, cursor: "pointer",
        }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;
