import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Heart, Mail, Lock, Eye, EyeOff, User,
  AlertCircle, CheckCircle2, Building2, Phone, MapPin, Shield, Upload, FileText,
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

/* Inline field error helper */
const FieldError = ({ msg }) => msg
  ? <p style={{ fontSize: "var(--text-xs)", color: "#EF4444", marginTop: 4, fontWeight: 500 }}>⚠ {msg}</p>
  : null;

/* Convert a File to base64 object for MongoDB storage */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve({ data: base64, fileName: file.name, contentType: file.type || "application/pdf" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Signup() {
  const navigate            = useNavigate();
  const { registerWithApi } = useAuth();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "", role: "patient",
    /* Hospital / Blood Bank fields */
    hospitalName: "", phone: "", address: "", city: "", state: "",
    hospitalType: "Other", registrationNumber: "", totalBeds: "",
    /* Donor fields */
    dob: "", bloodGroup: "", weight: "", occupation: "",
  });
  const [showPw,   setShowPw]   = useState(false);
  const [showCPw,  setShowCPw]  = useState(false);
  const [error,    setError]    = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading,  setLoading]  = useState(false);
  const [approved, setApproved] = useState(null);
  const [regDocFile, setRegDocFile] = useState(null);

  const set      = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    /* Clear the field error as the user types */
    if (fieldErrors[k]) setFieldErrors((p) => ({ ...p, [k]: "" }));
  };
  const strength = STRENGTH(form.password);

  /* Handle registration document file selection */
  const handleDocSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Document must be under 5 MB.");
      return;
    }
    setRegDocFile(file);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errs = {};

    /* ── Common fields ── */
    if (!form.name.trim())
      errs.name = "Full name is required.";
    else if (form.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters.";

    if (!form.email.trim())
      errs.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errs.email = "Enter a valid email address.";

    if (!form.password)
      errs.password = "Password is required.";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    else if (!/[A-Z]/.test(form.password))
      errs.password = "Include at least one uppercase letter.";
    else if (!/[0-9]/.test(form.password))
      errs.password = "Include at least one number.";

    if (!form.confirm)
      errs.confirm = "Please confirm your password.";
    else if (form.confirm !== form.password)
      errs.confirm = "Passwords do not match.";

    /* ── Hospital-specific ── */
    if (form.role === "hospital") {
      if (!form.hospitalName.trim())
        errs.hospitalName = "Hospital name is required.";

      if (!form.phone.trim())
        errs.phone = "Contact number is required.";
      else if (!/^[+\d][\d\s\-().]{7,}$/.test(form.phone.trim()))
        errs.phone = "Enter a valid phone number.";

      if (!form.city.trim())
        errs.city = "City is required.";

      if (!form.state.trim())
        errs.state = "State is required.";

      if (!form.address.trim())
        errs.address = "Address is required.";

      if (!form.registrationNumber.trim())
        errs.registrationNumber = "Registration number is required.";
    }

    /* ── Blood bank-specific ── */
    if (form.role === "bloodbank") {
      if (!form.hospitalName.trim())
        errs.hospitalName = "Blood bank name is required.";

      if (!form.phone.trim())
        errs.phone = "Contact number is required.";
      else if (!/^[+\d][\d\s\-().]{7,}$/.test(form.phone.trim()))
        errs.phone = "Enter a valid phone number.";

      if (!form.city.trim())
        errs.city = "City is required.";

      if (!form.state.trim())
        errs.state = "State is required.";
    }

    /* ── Donor-specific ── */
    if (form.role === "donor") {
      if (!form.bloodGroup)
        errs.bloodGroup = "Blood group is required.";

      if (!form.phone.trim())
        errs.phone = "Phone number is required.";
      else if (!/^[+\d][\d\s\-().]{7,}$/.test(form.phone.trim()))
        errs.phone = "Enter a valid phone number.";

      if (!form.dob)
        errs.dob = "Date of birth is required.";
      else {
        const age = Math.floor((Date.now() - new Date(form.dob)) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 18) errs.dob = "Donors must be at least 18 years old.";
        if (age > 65) errs.dob = "Donors must be 65 years old or younger.";
      }

      if (!form.city.trim())
        errs.city = "City is required.";

      if (form.weight && !/^\d{2,3}(\.\d)?\s*(kg|lbs)?$/i.test(form.weight.trim()))
        errs.weight = "Enter a valid weight (e.g. 65 kg).";
    }

    /* Stop if any errors */
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      setError("Please fix the errors below before submitting.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name:               form.name,
        email:              form.email,
        password:           form.password,
        role:               form.role,
        hospitalName:       form.hospitalName,
        phone:              form.phone,
        address:            form.address,
        city:               form.city,
        state:              form.state,
        registrationNumber: form.registrationNumber,
        /* Donor-specific */
        dob:                form.dob,
        bloodGroup:         form.bloodGroup,
        weight:              form.weight,
        occupation:          form.occupation,
      };

      /* Only send hospitalType for hospitals (not blood banks) */
      if (form.role === "hospital") {
        payload.hospitalType = form.hospitalType;
      }

      /* Attach document for hospital, blood bank, AND donor */
      if (regDocFile && (form.role === "hospital" || form.role === "bloodbank" || form.role === "donor")) {
        const doc = await fileToBase64(regDocFile);
        payload.registrationDocument = doc;
      }

      const result = await registerWithApi(payload);
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
                <div className="auth-input-wrap" style={{ borderColor: fieldErrors.name ? "#EF4444" : undefined }}>
                  <User size={15} className="auth-input-icon" />
                  <input id="s-name" type="text" placeholder="John Doe"
                    value={form.name} onChange={(e) => set("name", e.target.value)}
                    autoComplete="name" required />
                </div>
                <FieldError msg={fieldErrors.name} />
              </div>
              <div className="auth-field">
                <label htmlFor="s-email">Email address <span className="auth-required">*</span></label>
                <div className="auth-input-wrap" style={{ borderColor: fieldErrors.email ? "#EF4444" : undefined }}>
                  <Mail size={15} className="auth-input-icon" />
                  <input id="s-email" type="email" placeholder="you@example.com"
                    value={form.email} onChange={(e) => set("email", e.target.value)}
                    autoComplete="email" required />
                </div>
                <FieldError msg={fieldErrors.email} />
              </div>
            </div>

            <div className="auth-fields-row">
              <div className="auth-field">
                <label htmlFor="s-pw">Password <span className="auth-required">*</span></label>
                <div className="auth-input-wrap" style={{ borderColor: fieldErrors.password ? "#EF4444" : undefined }}>
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
                <FieldError msg={fieldErrors.password} />
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
                <div className="auth-input-wrap" style={{ borderColor: fieldErrors.confirm ? "#EF4444" : undefined }}>
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
                <FieldError msg={fieldErrors.confirm} />
              </div>
            </div>

            {/* ── Donor extra fields ── */}
            {form.role === "donor" && (
              <div className="auth-hospital-section">
                <p className="auth-hospital-section__title">
                  <span style={{ fontSize: "1rem" }}>🩸</span> Donor Details
                </p>

                {/* Blood group + DOB */}
                <div className="auth-fields-row">
                  <div className="auth-field">
                    <label htmlFor="d-bg">
                      Blood Group <span className="auth-required">*</span>
                    </label>
                    <div className="auth-input-wrap" style={{ borderColor: fieldErrors.bloodGroup ? "#EF4444" : undefined }}>
                      <select
                        id="d-bg"
                        value={form.bloodGroup}
                        onChange={(e) => set("bloodGroup", e.target.value)}
                        style={{ paddingLeft: 13, width: "100%", border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: "var(--text-sm)" }}
                        required
                      >
                        <option value="">— Select —</option>
                        {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map((g) => (
                          <option key={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                    <FieldError msg={fieldErrors.bloodGroup} />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="d-dob">Date of Birth <span className="auth-required">*</span></label>
                    <div className="auth-input-wrap" style={{ borderColor: fieldErrors.dob ? "#EF4444" : undefined }}>
                      <input
                        id="d-dob"
                        type="date"
                        value={form.dob}
                        onChange={(e) => set("dob", e.target.value)}
                        max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
                        style={{ paddingLeft: 13 }}
                      />
                    </div>
                    <FieldError msg={fieldErrors.dob} />
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 3 }}>
                      Donors must be 18–65 years old.
                    </p>
                  </div>
                </div>

                {/* Phone + City */}
                <div className="auth-fields-row">
                  <div className="auth-field">
                    <label htmlFor="d-phone">
                      Phone Number <span className="auth-required">*</span>
                    </label>
                    <div className="auth-input-wrap" style={{ borderColor: fieldErrors.phone ? "#EF4444" : undefined }}>
                      <Phone size={15} className="auth-input-icon" />
                      <input
                        id="d-phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        required
                      />
                    </div>
                    <FieldError msg={fieldErrors.phone} />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="d-city">City <span className="auth-required">*</span></label>
                    <div className="auth-input-wrap" style={{ borderColor: fieldErrors.city ? "#EF4444" : undefined }}>
                      <MapPin size={15} className="auth-input-icon" />
                      <input
                        id="d-city"
                        type="text"
                        placeholder="e.g. Mumbai"
                        value={form.city}
                        onChange={(e) => set("city", e.target.value)}
                      />
                    </div>
                    <FieldError msg={fieldErrors.city} />
                  </div>
                </div>

                {/* State + Weight */}
                <div className="auth-fields-row">
                  <div className="auth-field">
                    <label htmlFor="d-state">State</label>
                    <div className="auth-input-wrap">
                      <MapPin size={15} className="auth-input-icon" />
                      <input
                        id="d-state"
                        type="text"
                        placeholder="e.g. Karnataka"
                        value={form.state}
                        onChange={(e) => set("state", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="auth-field">
                    <label htmlFor="d-weight">Weight</label>
                    <div className="auth-input-wrap" style={{ borderColor: fieldErrors.weight ? "#EF4444" : undefined }}>
                      <input
                        id="d-weight"
                        type="text"
                        placeholder="e.g. 65 kg"
                        value={form.weight}
                        onChange={(e) => set("weight", e.target.value)}
                        style={{ paddingLeft: 13 }}
                      />
                    </div>
                    <FieldError msg={fieldErrors.weight} />
                  </div>
                </div>

                {/* Occupation */}
                <div className="auth-field">
                  <label htmlFor="d-occ">Occupation</label>
                  <div className="auth-input-wrap">
                    <input
                      id="d-occ"
                      type="text"
                      placeholder="e.g. Software Engineer"
                      value={form.occupation}
                      onChange={(e) => set("occupation", e.target.value)}
                      style={{ paddingLeft: 13 }}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="auth-field">
                  <label htmlFor="d-addr">Full Address</label>
                  <div className="auth-input-wrap">
                    <input
                      id="d-addr"
                      type="text"
                      placeholder="Street, area, city…"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      style={{ paddingLeft: 13 }}
                    />
                  </div>
                </div>

                {/* ID Document Upload */}
                <div className="auth-field" style={{ marginBottom: 14 }}>
                  <label htmlFor="d-doc">
                    Aadhaar Card / Government ID{" "}
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>(optional but recommended)</span>
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleDocSelect}
                      id="d-doc"
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="d-doc"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "8px 14px", borderRadius: 10,
                        border: "1.5px solid var(--border)", background: "var(--bg-alt)",
                        cursor: "pointer", fontSize: "var(--text-sm)", fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Upload size={14} /> Upload ID Document
                    </label>
                    {regDocFile && (
                      <span style={{ fontSize: "var(--text-sm)", color: "var(--primary-light)", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                        <FileText size={14} /> {regDocFile.name} ({(regDocFile.size / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>
                    Upload your Aadhaar card or any government-issued photo ID (image or PDF, max 5 MB).
                    This is only visible to the admin during verification.
                  </p>
                </div>

                <p className="auth-hospital-section__note">
                  ⏳ Donor profiles require admin verification before you can log in.
                  You will be notified once your application is reviewed.
                </p>
              </div>
            )}

            {/* Hospital extra fields */}
            {(form.role === "hospital" || form.role === "bloodbank") && (
              <div className="auth-hospital-section">
                <p className="auth-hospital-section__title">
                  <Building2 size={15} /> {form.role === "hospital" ? "Hospital" : "Blood Bank"} Details
                </p>
                {/* Facility name — separate from the account holder's name */}
                <div className="auth-field" style={{ marginBottom: 14 }}>
                  <label htmlFor="s-hname">
                    {form.role === "hospital" ? "Hospital" : "Blood Bank"} Name <span className="auth-required">*</span>
                  </label>
                  <div className="auth-input-wrap" style={{ borderColor: fieldErrors.hospitalName ? "#EF4444" : undefined }}>
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
                  <FieldError msg={fieldErrors.hospitalName} />
                </div>
                <div className="auth-fields-row">
                  <div className="auth-field">
                    <label htmlFor="s-phone">Contact Number <span className="auth-required">*</span></label>
                    <div className="auth-input-wrap" style={{ borderColor: fieldErrors.phone ? "#EF4444" : undefined }}>
                      <Phone size={15} className="auth-input-icon" />
                      <input id="s-phone" type="tel" placeholder="+91 XXXXX XXXXX"
                        value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                    </div>
                    <FieldError msg={fieldErrors.phone} />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="s-reg">
                      {form.role === "hospital" ? "Hospital Registration No." : "Blood Bank Licence No."}
                      {form.role === "hospital" && <span className="auth-required"> *</span>}
                    </label>
                    <div className="auth-input-wrap" style={{ borderColor: fieldErrors.registrationNumber ? "#EF4444" : undefined }}>
                      <input id="s-reg" type="text" placeholder={form.role === "hospital" ? "e.g. KA-HOS-2024-001" : "e.g. BB-LIC-2024-001"}
                        value={form.registrationNumber}
                        onChange={(e) => set("registrationNumber", e.target.value)}
                        style={{ paddingLeft: 13 }} />
                    </div>
                    <FieldError msg={fieldErrors.registrationNumber} />
                  </div>
                </div>
                <div className="auth-fields-row">
                  <div className="auth-field">
                    <label htmlFor="s-city">City <span className="auth-required">*</span></label>
                    <div className="auth-input-wrap" style={{ borderColor: fieldErrors.city ? "#EF4444" : undefined }}>
                      <MapPin size={15} className="auth-input-icon" />
                      <input id="s-city" type="text" placeholder="City"
                        value={form.city} onChange={(e) => set("city", e.target.value)} />
                    </div>
                    <FieldError msg={fieldErrors.city} />
                  </div>
                  <div className="auth-field">
                    <label htmlFor="s-state">State <span className="auth-required">*</span></label>
                    <div className="auth-input-wrap" style={{ borderColor: fieldErrors.state ? "#EF4444" : undefined }}>
                      <input id="s-state" type="text" placeholder="State"
                        value={form.state} onChange={(e) => set("state", e.target.value)}
                        style={{ paddingLeft: 13 }} />
                    </div>
                    <FieldError msg={fieldErrors.state} />
                  </div>
                </div>
                <div className="auth-field">
                  <label htmlFor="s-addr">Full Address <span className="auth-required">*</span></label>
                  <div className="auth-input-wrap" style={{ borderColor: fieldErrors.address ? "#EF4444" : undefined }}>
                    <input id="s-addr" type="text" placeholder="Street, area, city..."
                      value={form.address} onChange={(e) => set("address", e.target.value)}
                      style={{ paddingLeft: 13 }} />
                  </div>
                  <FieldError msg={fieldErrors.address} />
                </div>

                {/* Hospital Type — only for hospitals, NOT blood banks */}
                {form.role === "hospital" && (
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
                )}

                {/* Registration/Licence Document Upload */}
                <div className="auth-field" style={{ marginBottom: 14 }}>
                  <label htmlFor="s-doc">
                    {form.role === "hospital" ? "Registration Certificate" : "Licence Document"} <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>(optional)</span>
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleDocSelect}
                      id="s-doc"
                      style={{ display: "none" }}
                    />
                    <label
                      htmlFor="s-doc"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        padding: "8px 14px", borderRadius: 10,
                        border: "1.5px solid var(--border)", background: "var(--bg-alt)",
                        cursor: "pointer", fontSize: "var(--text-sm)", fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      <Upload size={14} /> Upload Document
                    </label>
                    {regDocFile && (
                      <span style={{ fontSize: "var(--text-sm)", color: "var(--primary-light)", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                        <FileText size={14} /> {regDocFile.name} ({(regDocFile.size / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 4 }}>
                    Upload an image or PDF of your {form.role === "hospital" ? "registration certificate" : "licence"}. This is reviewed by the admin during approval.
                  </p>
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
