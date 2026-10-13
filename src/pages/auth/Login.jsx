import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./auth.css";

const ROLES = [
  { value: "patient",  label: "Patient",         emoji: "🩺" },
  { value: "hospital", label: "Hospital Staff",   emoji: "🏥" },
  { value: "admin",    label: "Administrator",    emoji: "🛡️" },
];

export default function Login() {
  const navigate   = useNavigate();
  const { login }  = useAuth();

  const [form, setForm]       = useState({ email: "", password: "", role: "patient" });
  const [showPw, setShowPw]   = useState(false);
  const [error,  setError]    = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    /* --- replace this block with a real API call when backend is ready --- */
    await new Promise((r) => setTimeout(r, 700));
    const name = form.email.split("@")[0];
    const dest  = login(name, form.email, form.role);
    /* --------------------------------------------------------------------- */
    setLoading(false);
    navigate(dest, { replace: true });
  };

  return (
    <div className="auth-page">
      {/* Left decorative panel */}
      <div className="auth-panel">
        <div className="auth-panel__brand">
          <div className="auth-panel__icon"><Heart size={28} fill="#fff" color="#fff" /></div>
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
            <div className="auth-card__logo"><Heart size={22} fill="#2563EB" color="#2563EB" /></div>
            <h2>Welcome back</h2>
            <p>Sign in to continue to MediLink</p>
          </div>

          {/* Role tabs */}
          <div className="auth-role-tabs">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                className={`auth-role-tab ${form.role === r.value ? "active" : ""}`}
                onClick={() => set("role", r.value)}
              >
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="auth-error">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-field">
              <label>Email address</label>
              <div className="auth-input-wrap">
                <Mail size={15} className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <div className="auth-field__row">
                <label>Password</label>
                <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
              </div>
              <div className="auth-input-wrap">
                <Lock size={15} className="auth-input-icon" />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" className="auth-pw-toggle" onClick={() => setShowPw((p) => !p)}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : null}
              {loading ? "Signing in…" : `Sign in as ${ROLES.find(r => r.value === form.role)?.label}`}
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
