import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { patientApi } from "../../services/api";
import { useAuth }    from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [show,      setShow]      = useState({ current: false, next: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError,   setPwError]   = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const set    = (k, v) => setPasswords((p) => ({ ...p, [k]: v }));
  const toggle = (k)    => setShow((p) => ({ ...p, [k]: !p[k] }));

  const handlePwSubmit = async (e) => {
    e.preventDefault();
    setPwError(""); setPwSuccess("");

    /* ── Client-side validation ── */
    if (!passwords.current.trim()) {
      setPwError("Current password is required."); return;
    }
    if (passwords.next.length < 8) {
      setPwError("New password must be at least 8 characters."); return;
    }
    if (passwords.next !== passwords.confirm) {
      setPwError("New password and confirmation do not match."); return;
    }
    if (passwords.next === passwords.current) {
      setPwError("New password must be different from your current password."); return;
    }

    setPwLoading(true);
    try {
      const d = await patientApi.changePassword({
        currentPassword: passwords.current,
        newPassword:     passwords.next,
        confirmPassword: passwords.confirm,
      });
      setPwSuccess(d.message || "Password changed successfully.");
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

  const baseInput = {
    flex: 1, padding: "10px 14px", borderRadius: 10,
    border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none",
    fontFamily: "inherit",
  };

  const FIELDS = [
    { label: "Current Password", key: "current", placeholder: "Enter current password"   },
    { label: "New Password",     key: "next",    placeholder: "Min. 8 characters"         },
    { label: "Confirm Password", key: "confirm", placeholder: "Re-enter new password"     },
  ];

  return (
    <div className="page-body">
      <div className="page-header animate-fade-up">
        <h1>⚙️ Settings</h1>
        <p>Manage your account preferences.</p>
      </div>

      {/* Change Password */}
      <div className="section-card" style={{ maxWidth: 480, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🔒 Change Password</h2>

        {pwError   && (
          <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
            ❌ {pwError}
          </div>
        )}
        {pwSuccess && (
          <div style={{ background: "#D1FAE5", color: "#065F46", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
            ✅ {pwSuccess}
          </div>
        )}

        <form onSubmit={handlePwSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {FIELDS.map(({ label, key, placeholder }) => (
            <div key={key}>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 5, fontSize: 13 }}>{label}</label>
              <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1.5px solid #E2E8F0", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                <input
                  type={show[key] ? "text" : "password"}
                  placeholder={placeholder}
                  style={{ ...baseInput, border: "none", flex: 1 }}
                  value={passwords[key]}
                  onChange={(e) => set(key, e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  aria-label={show[key] ? "Hide password" : "Show password"}
                  style={{ padding: "0 12px", background: "none", border: "none", cursor: "pointer", color: "#94A3B8", display: "flex", alignItems: "center" }}
                >
                  {show[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Inline hint for new password */}
              {key === "next" && passwords.next && passwords.next.length < 8 && (
                <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>
                  Password must be at least 8 characters ({passwords.next.length}/8)
                </p>
              )}
              {key === "confirm" && passwords.confirm && passwords.confirm !== passwords.next && (
                <p style={{ fontSize: 11, color: "#EF4444", marginTop: 4 }}>
                  Passwords do not match
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={pwLoading}
            style={{
              padding: "11px", background: pwLoading ? "#94A3B8" : "#2563EB",
              color: "#fff", borderRadius: 10, border: "none",
              fontWeight: 700, fontSize: 14, cursor: pwLoading ? "not-allowed" : "pointer",
            }}
          >
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
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 24px", background: "#FEF2F2", color: "#EF4444",
            border: "1.5px solid #FECACA", borderRadius: 10,
            fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Settings;
