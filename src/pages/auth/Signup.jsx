import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Heart, Mail, Lock, Eye, EyeOff, User,
  AlertCircle, CheckCircle2, Building2, Phone, MapPin, Shield,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./auth.css";

const ROLES = [
  {
    value: "patient",
    label: "Patient",
    emoji: "🩺",
    desc:  "Book appointments, manage prescriptions and medical records",
  },
  {
    value: "donor",
    label: "Blood Donor",
    emoji: "🩸",
    desc:  "Register as a blood donor and respond to nearby donation requests",
  },
  {
    value: "hospital",
    label: "Hospital Staff",
    emoji: "🏥",
    desc:  "Manage resources, emergency requests and hospital operations",
  },
  {
    value: "bloodbank",
    label: "Blood Bank",
    emoji: "🏦",
    desc:  "Register a blood bank to manage blood inventory and fulfill requests",
  },
];

const STRENGTH = (pw) => {
  let s = 0;
  if (pw.length >= 8)          s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];

export default function Signup() {
  const navigate            = useNavigate();
  const { registerWithApi } = useAuth();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "", role: "patient",
    hospitalName: "", phone: "", address: "", city: "", state: "",
    hospitalType: "Other", registrationNumber: "", totalBeds: "",
  });
  const [showPw,   setShowPw]   = useState(false);
  const [showCPw,  setShowCPw]  = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [approved, setApproved] = useState(null);

  const set      = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const strength = STRENGTH(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all required fields."); return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    setLoading(true);
    try {
      const result = await registerWithApi({
        name:               form.name,
        email:              form.email,
        password:           form.password,
        role:               form.role,
        hospitalName:       form.hospitalName,
        phone:              form.phone,
        address:            form.address,
        city:               form.city,
        state:              form.state,
        hospitalType:       form.hospitalType,
        registrationNumber: form.registrationNumber,
        totalBeds:          form.totalBeds,
      });
      if (result.approvalPending) {
        setApproved({ message: result.message }); return;
      }
      navigate(result.redirect, { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Hospital submitted — pending approval screen ── */
  if (approved) {
    return (
      <div className="auth-page">
        <div className="auth-panel">
          <div className="auth-panel__brand">
            <div className="auth-panel__icon">
              <Heart size={28} fill="#fff" color="#fff" />
            </div>
            <h1>MediLink</h1>
            <p>Emergency Healthcare Coordination Platform</p>
          </div>
        </div>
        <div className="auth-form-side">
          <div className="auth-card" style={{ textAlign: "center" }}>
            <CheckCircle2 size={52} color="var(--success)" style={{ margin: "0 auto 20px" }} />
            <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: 12 }}>Registration Submitted!</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", lineHeight: 1.7, marginBottom: 24 }}>
              {approved.message}
            </p>
            <Link to="/login" className="auth-submit" style={{ display: "inline-flex", textDecoration: "none" }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <li>✅ Free to sign up — no credit card needed</li>
          <li>🔐 Your data is encrypted and private</li>
          <li>🌍 Available across the country</li>
          <li>🤝 Trusted by 10,000+ users</li>
        </ul>

        {/* Admin note on the left panel */}
        <div className="auth-panel__admin-note">
          <Shield size={16} />
          <div>
            <strong>Are you an Admin?</strong>
            <p>Admin accounts are created by the system. Use your admin credentials on the <Link to="/login" style={{ color: "#93C5FD" }}>login page</Link>.</p>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="auth-form-side">
        <div className="auth-card auth-card--wide">
          <div className="auth-card__head">
            <div className="auth-card__logo">
              <Heart size={22} fill="#2563EB" color="#2563EB" />
            </div>
            <h2>Create your account</h2>
            <p>Choose your role and fill in your details below</p>
          </div>

          {/* Role selector */}
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

          {/* Admin notice below role cards */}
          <div className="auth-admin-banner">
            <Shield size={14} />
            <span>
              Admin accounts are not self-registerable.
              If you are an admin, please <Link to="/login">sign in here</Link>.
            </span>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Common fields */}
            <div className="auth-fields-row">
              <div className="auth-field">
                <label htmlFor="s-name">Full name <span className="auth-required">*</span></label>
                <div className="auth-input-wrap">
                  <User size={15} className="auth-input-icon" />
                  <input id="s-name" type="text" placeholder="John Doe"
                    value={form.name} onChange={(e) => set("name", e.target.value)}
                    autoComplete="name" required />
                </div>
              </div>
              <div className="auth-field">
                <label htmlFor="s-email">Email address <span className="auth-required">*</span></label>
                <div className="auth-input-wrap">
                  <Mail size={15} className="auth-input-icon" />
                  <input id="s-email" type="email" placeholder="you@example.com"
                    value={form.email} onChange={(e) => set("email", e.target.value)}
                    autoComplete="email" required />
                </div>
              </div>
            </div>

            <div className="auth-fields-row">
              <div className="auth-field">
                <label htmlFor="s-pw">Password <span className="auth-required">*</span></label>
                <div className="auth-input-wrap">
                  <Lock size={15} className="auth-input-icon" />
                  <input id="s-pw" type={showPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={form.password} onChange={(e) => set("password", e.target.value)}
                    autoComplete="new-password" required />
                  <button type="button" className="auth-pw-toggle"
                    onClick={() => setShowPw((p) => !p)}
                    aria-label="Toggle password">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {form.password && (
                  <div className="auth-strength">
                    <div className="auth-strength__bars">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="auth-strength__bar"
                          style={{ background: i <= strength ? STRENGTH_COLOR[strength] : "var(--border)" }} />
                      ))}
                    </div>
                    <span style={{ color: STRENGTH_COLOR[strength], fontSize: "var(--text-xs)", fontWeight: 600 }}>
                      {STRENGTH_LABEL[strength]}
                    </span>
                  </div>
                )}
              </div>
              <div className="auth-field">
                <label htmlFor="s-cpw">Confirm password <span className="auth-required">*</span></label>
                <div className="auth-input-wrap">
                  <Lock size={15} className="auth-input-icon" />
                  <input id="s-cpw" type={showCPw ? "text" : "password"}
                    placeholder="Re-enter password"
                    value={form.confirm} onChange={(e) => set("confirm", e.target.value)}
                    autoComplete="new-password" required />
                  <button type="button" className="auth-pw-toggle"
                    onClick={() => setShowCPw((p) => !p)}
                    aria-label="Toggle confirm password">
                    {showCPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Hospital extra fields */}
            {(form.role === "hospital" || form.role === "bloodbank") && (
              <div className="auth-hospital-section">
                <p className="auth-hospital-section__title">
                  <Building2 size={15} /> {form.role === "hospital" ? "Hospital" : "Blood Bank"} Details
                </p>
                {/* Hospital / Blood Bank name — separate from the account holder's name */}
                <div className="auth-field" style={{ marginBottom: 14 }}>
                  <label htmlFor="s-hname">
                    {form.role === "hospital" ? "Hospital" : "Blood Bank"} Name <span className="auth-required">*</span>
                  </label>
                  <div className="auth-input-wrap">
                    <Building2 size={15} className="auth-input-icon" />
                    <input
                      id="s-hname"
                      type="text"
                      placeholder={form.role === "hospital" ? "e.g. Apollo Hospital" : "e.g. City Blood Bank"}
                      value={form.hospitalName}
                      onChange={(e) => set("hospitalName", e.target.value)}
                      required={form.role === "hospital" || form.role === "bloodbank"}
                    />
                  </div>
                </div>
                <div className="auth-fields-row">
                  <div className="auth-field">
                    <label htmlFor="s-phone">Phone</label>
                    <div className="auth-input-wrap">
                      <Phone size={15} className="auth-input-icon" />
                      <input id="s-phone" type="tel" placeholder="+91 XXXXX XXXXX"
                        value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label htmlFor="s-reg">Registration Number</label>
                    <div className="auth-input-wrap">
                      <input id="s-reg" type="text" placeholder="e.g. KA-HOS-2024-001"
                        value={form.registrationNumber}
                        onChange={(e) => set("registrationNumber", e.target.value)}
                        style={{ paddingLeft: 13 }} />
                    </div>
                  </div>
                </div>
                <div className="auth-fields-row">
                  <div className="auth-field">
                    <label htmlFor="s-city">City</label>
                    <div className="auth-input-wrap">
                      <MapPin size={15} className="auth-input-icon" />
                      <input id="s-city" type="text" placeholder="City"
                        value={form.city} onChange={(e) => set("city", e.target.value)} />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label htmlFor="s-state">State</label>
                    <div className="auth-input-wrap">
                      <input id="s-state" type="text" placeholder="State"
                        value={form.state} onChange={(e) => set("state", e.target.value)}
                        style={{ paddingLeft: 13 }} />
                    </div>
                  </div>
                </div>
                <div className="auth-field">
                  <label htmlFor="s-addr">Full Address</label>
                  <div className="auth-input-wrap">
                    <input id="s-addr" type="text" placeholder="Street, area, city..."
                      value={form.address} onChange={(e) => set("address", e.target.value)}
                      style={{ paddingLeft: 13 }} />
                  </div>
                </div>
                <div className="auth-fields-row">
                  <div className="auth-field">
                    <label htmlFor="s-htype">Hospital Type</label>
                    <div className="auth-input-wrap">
                      <select id="s-htype" value={form.hospitalType}
                        onChange={(e) => set("hospitalType", e.target.value)}
                        style={{ paddingLeft: 13, width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: "var(--text-sm)" }}>
                        {["Government","Private","NGO","Clinic","Other"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="auth-field">
                    <label htmlFor="s-beds">Total Beds</label>
                    <div className="auth-input-wrap">
                      <input id="s-beds" type="number" min="0" placeholder="e.g. 200"
                        value={form.totalBeds} onChange={(e) => set("totalBeds", e.target.value)}
                        style={{ paddingLeft: 13 }} />
                    </div>
                  </div>
                </div>
                <p className="auth-hospital-section__note">
                  ⏳ {form.role === "hospital" ? "Hospital" : "Blood Bank"} accounts require admin approval before login is permitted.
                </p>
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading && <span className="auth-spinner" />}
              {loading
                ? "Creating account…"
                : form.role === "hospital"
                  ? "Submit Hospital Registration"
                  : form.role === "bloodbank"
                    ? "Submit Blood Bank Registration"
                    : `Create ${ROLES.find((r) => r.value === form.role)?.label ?? ""} Account`}
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
