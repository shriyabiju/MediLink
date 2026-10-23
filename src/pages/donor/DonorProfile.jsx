import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Shield, Edit2, Save, X, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { donorApi } from "../../services/api";
import { BLOOD_GROUPS } from "./data/sampleData";
import "./css/donor.css";

/* ── Maps donorStatus from DB to a display badge ── */
const VERIFICATION_BADGE = {
  approved: { cls: "dd-badge--success", label: "Verified ✅" },
  pending:  { cls: "dd-badge--warning", label: "Pending Review ⏳" },
  rejected: { cls: "dd-badge--danger",  label: "Not Verified ✗" },
};

/* ── Empty form shape (all fields the profile page uses) ── */
const EMPTY_FORM = {
  name:             "",
  email:            "",
  phone:            "",
  dob:              "",
  bloodGroup:       "",
  weight:           "",
  occupation:       "",
  city:             "",
  state:            "",
  address:          "",
  emergencyName:    "",
  emergencyContact: "",
};

export default function DonorProfile() {
  const { user: authUser } = useAuth();

  const [form,       setForm]    = useState(EMPTY_FORM);
  const [original,   setOriginal]= useState(EMPTY_FORM); // saved copy for cancel
  const [editing,    setEditing] = useState(false);
  const [loading,    setLoading] = useState(true);
  const [saving,     setSaving]  = useState(false);
  const [error,      setError]   = useState("");
  const [successMsg, setSuccess] = useState("");
  const [donorStatus, setDonorStatus] = useState("pending");

  /* ── Load real profile from API on mount ── */
  useEffect(() => {
    setLoading(true);
    setError("");
    donorApi.getProfile()
      .then(({ user }) => {
        const loaded = {
          name:             user.name             || "",
          email:            user.email            || "",
          phone:            user.phone            || "",
          dob:              user.dob              || "",
          bloodGroup:       user.bloodGroup       || "",
          weight:           user.weight           || "",
          occupation:       user.occupation       || "",
          city:             user.city             || "",
          state:            user.state            || "",
          address:          user.address          || "",
          emergencyName:    user.emergencyName    || "",
          emergencyContact: user.emergencyContact || "",
        };
        setForm(loaded);
        setOriginal(loaded);
        setDonorStatus(user.donorStatus || "pending");
      })
      .catch((err) => {
        setError(err.message || "Failed to load profile. Make sure the backend is running.");
      })
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  /* ── Cancel — restore original values ── */
  const handleCancel = () => {
    setForm(original);
    setEditing(false);
    setError("");
  };

  /* ── Save via PATCH /api/donor/profile ── */
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Full name is required.");
      return;
    }

    setSaving(true);
    try {
      const { user } = await donorApi.updateProfile({
        name:             form.name,
        phone:            form.phone,
        dob:              form.dob,
        bloodGroup:       form.bloodGroup,
        weight:           form.weight,
        occupation:       form.occupation,
        city:             form.city,
        state:            form.state,
        address:          form.address,
        emergencyName:    form.emergencyName,
        emergencyContact: form.emergencyContact,
      });

      /* Update form and saved copy from server response */
      const updated = {
        name:             user.name             || "",
        email:            user.email            || "",
        phone:            user.phone            || "",
        dob:              user.dob              || "",
        bloodGroup:       user.bloodGroup       || "",
        weight:           user.weight           || "",
        occupation:       user.occupation       || "",
        city:             user.city             || "",
        state:            user.state            || "",
        address:          user.address          || "",
        emergencyName:    user.emergencyName    || "",
        emergencyContact: user.emergencyContact || "",
      };
      setForm(updated);
      setOriginal(updated);
      setEditing(false);
      setSuccess("Profile saved successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials = form.name
    ? form.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "D";

  const vBadge = VERIFICATION_BADGE[donorStatus] ?? VERIFICATION_BADGE.pending;

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div>
        <div className="dd-page-header">
          <div><h1>My Profile</h1><p>Loading your profile…</p></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>My Profile</h1>
          <p>View and manage your donor information.</p>
        </div>
        {!editing ? (
          <button
            className="dd-quick-btn dd-quick-btn--primary"
            onClick={() => { setEditing(true); setError(""); setSuccess(""); }}
          >
            <Edit2 size={15} /> Edit Profile
          </button>
        ) : (
          <button className="dd-quick-btn dd-quick-btn--outline" onClick={handleCancel}>
            <X size={15} /> Cancel
          </button>
        )}
      </div>

      {/* ── API error ── */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "var(--danger-soft)", border: "1px solid var(--danger)",
            borderRadius: "var(--radius-sm)", padding: "12px 18px",
            marginBottom: "var(--space-5)", color: "#991B1B",
            fontSize: "var(--text-sm)", fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <AlertCircle size={15} /> {error}
        </motion.div>
      )}

      {/* ── Success message ── */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "var(--success-soft)", border: "1px solid var(--success)",
            borderRadius: "var(--radius-sm)", padding: "12px 18px",
            marginBottom: "var(--space-5)", color: "#065F46",
            fontSize: "var(--text-sm)", fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          ✅ {successMsg}
        </motion.div>
      )}

      {/* ── Hero banner ── */}
      <div className="dd-profile-hero">
        <div className="dd-profile-avatar">{initials}</div>
        <div className="dd-profile-hero__info">
          <h2>{form.name || authUser?.name || "Donor"}</h2>
          <p>{form.email || authUser?.email}</p>
          <div className="dd-profile-hero__tags">
            {form.bloodGroup && (
              <span className="dd-profile-tag">🩸 {form.bloodGroup}</span>
            )}
            <span className={`dd-badge ${vBadge.cls}`}>{vBadge.label}</span>
            {form.city && <span className="dd-profile-tag">📍 {form.city}</span>}
            {form.occupation && <span className="dd-profile-tag">💼 {form.occupation}</span>}
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSave} noValidate>

        {/* ── Personal Information ── */}
        <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="dd-card__header">
            <h3 className="dd-card__title"><User size={16} /> Personal Information</h3>
          </div>
          <div className="dd-profile-form">

            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="donor-name">
                Full Name <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <input
                id="donor-name"
                className="dd-form-input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                disabled={!editing}
                required
              />
            </div>

            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="donor-email">Email Address</label>
              {/* Email is not editable — shown read-only */}
              <input
                id="donor-email"
                type="email"
                className="dd-form-input"
                value={form.email}
                disabled
                title="Email cannot be changed here"
                style={{ opacity: .7, cursor: "not-allowed" }}
              />
            </div>

            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="donor-phone">Phone Number</label>
              <input
                id="donor-phone"
                className="dd-form-input"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                disabled={!editing}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="donor-dob">Date of Birth</label>
              <input
                id="donor-dob"
                type="date"
                className="dd-form-input"
                value={form.dob}
                onChange={(e) => set("dob", e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="donor-bg">Blood Group</label>
              <select
                id="donor-bg"
                className="dd-form-input dd-form-select"
                value={form.bloodGroup}
                onChange={(e) => set("bloodGroup", e.target.value)}
                disabled={!editing}
              >
                <option value="">— Select —</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="donor-weight">Weight</label>
              <input
                id="donor-weight"
                className="dd-form-input"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                disabled={!editing}
                placeholder="e.g. 65 kg"
              />
            </div>

            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="donor-occ">Occupation</label>
              <input
                id="donor-occ"
                className="dd-form-input"
                value={form.occupation}
                onChange={(e) => set("occupation", e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="donor-city">City</label>
              <input
                id="donor-city"
                className="dd-form-input"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="donor-state">State</label>
              <input
                id="donor-state"
                className="dd-form-input"
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
                disabled={!editing}
              />
            </div>

            <div className="dd-form-group full">
              <label className="dd-form-label" htmlFor="donor-address">Full Address</label>
              <input
                id="donor-address"
                className="dd-form-input"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                disabled={!editing}
                placeholder="Street, area, city…"
              />
            </div>

          </div>
        </div>

        {/* ── Emergency Contact ── */}
        <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="dd-card__header">
            <h3 className="dd-card__title"><Shield size={16} /> Emergency Contact</h3>
          </div>
          <div className="dd-profile-form">
            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="ec-name">Contact Name</label>
              <input
                id="ec-name"
                className="dd-form-input"
                value={form.emergencyName}
                onChange={(e) => set("emergencyName", e.target.value)}
                disabled={!editing}
                placeholder="e.g. Jane Doe (Spouse)"
              />
            </div>
            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="ec-phone">Contact Phone</label>
              <input
                id="ec-phone"
                className="dd-form-input"
                value={form.emergencyContact}
                onChange={(e) => set("emergencyContact", e.target.value)}
                disabled={!editing}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>
        </div>

        {/* ── Save / Cancel buttons ── */}
        {editing && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: "var(--space-5)" }}>
            <button
              type="button"
              className="dd-quick-btn dd-quick-btn--outline"
              onClick={handleCancel}
              disabled={saving}
            >
              <X size={15} /> Cancel
            </button>
            <button
              type="submit"
              className="dd-quick-btn dd-quick-btn--primary"
              disabled={saving}
            >
              {saving ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .6s linear infinite", display: "inline-block" }} />
                  Saving…
                </span>
              ) : (
                <><Save size={15} /> Save Profile</>
              )}
            </button>
          </div>
        )}

      </form>

      {/* ── Donor status note ── */}
      {donorStatus === "pending" && (
        <p className="dd-disclaimer">
          ⏳ Your donor profile is pending admin verification. You will be notified once approved.
        </p>
      )}
      {donorStatus === "rejected" && (
        <p className="dd-disclaimer" style={{ color: "var(--danger)" }}>
          ✗ Your donor profile was not approved. Please contact MediLink support.
        </p>
      )}
    </div>
  );
}
