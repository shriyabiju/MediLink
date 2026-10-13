import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./auth.css";

const ROLES = [
  {
    value:   "patient",
    label:   "Patient",
    emoji:   "🩺",
    desc:    "Book appointments, manage prescriptions and medical records",
  },
  {
    value:   "hospital",
    label:   "Hospital Staff",
    emoji:   "🏥",
    desc:    "Manage resources, emergency requests and hospital operations",
  },
  {
    value:   "admin",
    label:   "Administrator",
    emoji:   "🛡️",
    desc:    "Verify hospitals, manage users and oversee platform operations",
  },
];

const STRENGTH = (pw) => {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0-4
};

const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];

export default function Signup() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "", role: "patient" });
  const [showPw,  setShowPw]  = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const strength = STRENGTH(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields."); return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    setLoading(true);
    /* --- replace this block with a real API call when backend is ready --- */
    await new Promise((r) => setTimeout(r, 700));
    const dest = login(form.name, form.email, form.role);
    /* --------------------------------------------------------------------- */
    setLoading(false);
    navigate(dest, { replace: true });
  };

  const selectedRole = ROLES.find((r) => r.value === form.role);

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel">
        <div className="auth-panel__brand">
          <div className="auth-panel__icon"><Heart size={28} fill="#fff" color="#fff" /></div>
          <h1>MediLink</h1>
          <p>Emergency Healthcare Coordination Platform</p>
        </div>
        <ul className="auth-panel__bullets">
          <li>✅ Free to sign up — no credit card needed</li>
          <li>🔐 Your data is encrypted and private</li>
          <li>🌍 Available across the country</li>
          <li>🤝 Trusted by 10,000+ users</li>
        </ul>
      </div>

      {/* Form card */}
      <div className="auth-form-side">
        <div className="auth-card auth-card--wide">
          {/* Header */}
          <div className="auth-card__head">
            <div className="auth-card__logo"><Heart size={22} fill="#2563EB" color="#2563EB" /></div>
            <h2>Create your account</h2>
            <p>Join MediLink — choose your role to get started</p>
          </div>

          {/* Role selector cards */}
          <div className="auth-role-cards">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                className={`auth-role-card ${form.role === r.value ? "active" : ""}`}
                onClick={() => set("role", r.value)}
              >
                <span className="auth-role-card__emoji">{r.emoji}</span>
                <span className="auth-role-card__label">{r.label}</span>
                <span className="auth-role-card__desc">{r.desc}</span>
                {form.role === r.value && (
                  <CheckCircle2 size={16} className="auth-role-card__check" />
                )}
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
            <div className="auth-fields-row">
              <div className="auth-field">
                <label>Full name</label>
                <div className="auth-input-wrap">
                  <User size={15} className="auth-input-icon" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </div>
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
            </div>

            <div className="auth-fields-row">
              <div className="auth-field">
                <label>Password</label>
                <div className="auth-input-wrap">
                  <Lock size={15} className="auth-input-icon" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-pw-toggle" onClick={() => setShowPw((p) => !p)}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {form.password && (
                  <div className="auth-strength">
                    <div className="auth-strength__bars">
                      {[1,2,3,4].map((i) => (
                        <div
                          key={i}
                          className="auth-strength__bar"
                          style={{ background: i <= strength ? STRENGTH_COLOR[strength] : "var(--border)" }}
                        />
                      ))}
                    </div>
                    <span style={{ color: STRENGTH_COLOR[strength], fontSize: "var(--text-xs)", fontWeight: 600 }}>
                      {STRENGTH_LABEL[strength]}
                    </span>
                  </div>
                )}
              </div>

              <div className="auth-field">
                <label>Confirm password</label>
                <div className="auth-input-wrap">
                  <Lock size={15} className="auth-input-icon" />
                  <input
                    type={showCPw ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={form.confirm}
                    onChange={(e) => set("confirm", e.target.value)}
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-pw-toggle" onClick={() => setShowCPw((p) => !p)}>
                    {showCPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : null}
              {loading ? "Creating account…" : `Create ${selectedRole?.label} Account`}
            </button>

            <p className="auth-terms">
              By signing up you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
