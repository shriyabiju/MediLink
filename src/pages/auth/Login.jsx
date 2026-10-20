import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./auth.css";

const ROLES = [
  { value: "patient",  label: "Patient",         emoji: "🩺" },
  { value: "donor",    label: "Blood Donor",      emoji: "🩸" },
  { value: "hospital", label: "Hospital Staff",   emoji: "🏥" },
  { value: "admin",    label: "Administrator",    emoji: "🛡️" },
];

export default function Login() {
  const navigate         = useNavigate();
  const { loginWithApi } = useAuth();

  const [form, setForm]   = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error,  setError]  = useState("");
  const [info,   setInfo]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const dest = await loginWithApi(form.email, form.password);
      navigate(dest, { replace: true });
    } catch (err) {
      if (err.code === "HOSPITAL_PENDING") {
        setInfo(err.message);
      } else if (err.code === "HOSPITAL_REJECTED") {
        setError(err.message);
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-panel">
        <div className="auth-panel__brand">
          <div className="auth-panel__icon">
            <Heart size={28} fill="#fff" color="#fff" />
          </div>
          <h1>MediLink</h1>
          <p>Emergency Healthcare Coordination Platform</p>
        </div>
        <ul className="auth-panel__bullets">
          <li>🩺 Book appointments with verified doctors</li>
          <li>🏥 Manage hospital resources in real time</li>
          <li>🤖 AI-powered health assistance 24/7</li>
          <li>🔒 Secure, HIPAA-compliant platform</li>
        </ul>
      </div>

      {/* Form card */}
      <div className="auth-form-side">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-card__head">
            <div className="auth-card__logo">
              <Heart size={22} fill="#2563EB" color="#2563EB" />
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to continue to MediLink</p>
          </div>

          {/* Role info tabs (display-only, not selectable — role is determined by credentials) */}
          <div className="auth-role-tabs" style={{ marginBottom: 20 }}>
            {ROLES.map((r) => (
              <div key={r.value} className="auth-role-tab" style={{ cursor: "default", opacity: .75 }}>
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* Info (pending approval) */}
          {info && (
            <div
              className="auth-error"
              style={{
                background: "var(--warning-soft)",
                borderColor: "var(--warning)",
                color: "#92400E",
              }}
            >
              ⏳ {info}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label htmlFor="login-email">Email address</label>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="login-password">Password</label>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPw((p) => !p)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : null}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
