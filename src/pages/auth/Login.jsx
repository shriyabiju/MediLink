import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Mail, Lock, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./auth.css";

export default function Login() {
  const navigate         = useNavigate();
  const { loginWithApi } = useAuth();

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState("");
  const [info,    setInfo]    = useState("");
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
      if (err.code === "HOSPITAL_PENDING") setInfo(err.message);
      else if (err.code === "HOSPITAL_REJECTED") setError(err.message);
      else setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* ── Left panel ── */}
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
          <li>🩸 Connect blood donors with patients</li>
          <li>🔒 Secure, role-based access for everyone</li>
        </ul>
      </div>

      {/* ── Form ── */}
      <div className="auth-form-side">
        <div className="auth-card">

          <div className="auth-card__head">
            <div className="auth-card__logo">
              <Heart size={22} fill="#2563EB" color="#2563EB" />
            </div>
            <h2>Welcome back</h2>
            <p>Sign in with your registered email and password</p>
          </div>

          {/* Who can log in info strip */}
          <div className="auth-roles-info">
            {[
              { emoji: "🩺", label: "Patient" },
              { emoji: "🩸", label: "Donor" },
              { emoji: "🏥", label: "Hospital" },
              { emoji: "🛡️", label: "Admin" },
            ].map((r) => (
              <div key={r.label} className="auth-roles-info__item">
                <span>{r.emoji}</span>
                <span>{r.label}</span>
              </div>
            ))}
          </div>
          <p className="auth-roles-note">
            Your role is detected automatically from your account.
          </p>

          {/* Error / Info */}
          {error && (
            <div className="auth-error">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {info && (
            <div className="auth-info">
              ⏳ {info}
            </div>
          )}

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
              {loading && <span className="auth-spinner" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Admin note */}
          <div className="auth-admin-note">
            <Shield size={14} />
            <span>
              Admin access is granted by a system administrator.
              Contact your admin if you cannot log in.
            </span>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
