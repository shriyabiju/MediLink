import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit2, Save, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { DONOR_PROFILE, BLOOD_GROUPS } from "./data/sampleData";
import "./css/donor.css";

const VERIFICATION_BADGE = {
  verified:   { cls: "dd-badge--success", label: "Verified ✅" },
  pending:    { cls: "dd-badge--warning", label: "Pending Review" },
  unverified: { cls: "dd-badge--neutral", label: "Unverified" },
};

export default function DonorProfile() {
  const { user } = useAuth();

  /* Initialise editable form from sample data, override name from auth */
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    ...DONOR_PROFILE,
    name: user?.name ?? DONOR_PROFILE.name,
    email: user?.email ?? DONOR_PROFILE.email,
  });
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = (e) => {
    e.preventDefault();
    /* In production, POST to /api/donor/profile here */
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = form.name
    ? form.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "D";

  const vBadge = VERIFICATION_BADGE[form.verificationStatus] ?? VERIFICATION_BADGE.unverified;

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>My Profile</h1>
          <p>Manage your donor information and contact details.</p>
        </div>
        {!editing ? (
          <button className="dd-quick-btn dd-quick-btn--primary" onClick={() => setEditing(true)}>
            <Edit2 size={15} /> Edit Profile
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="dd-quick-btn dd-quick-btn--outline" onClick={() => setEditing(false)}>
              <X size={15} /> Cancel
            </button>
          </div>
        )}
      </div>

      {/* ── Saved confirmation ── */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            background: "var(--success-soft)", border: "1px solid var(--success)", borderRadius: "var(--radius-sm)",
            padding: "12px 18px", marginBottom: "var(--space-5)", color: "#065F46",
            fontSize: "var(--text-sm)", fontWeight: 600, display: "flex", alignItems: "center", gap: 8,
          }}
        >
          ✅ Profile saved successfully. Note: changes are stored in frontend state only until the backend is connected.
        </motion.div>
      )}

      {/* ── Hero banner ── */}
      <div className="dd-profile-hero">
        <div className="dd-profile-avatar">{initials}</div>
        <div className="dd-profile-hero__info">
          <h2>{form.name}</h2>
          <p>{form.email}</p>
          <div className="dd-profile-hero__tags">
            <span className="dd-profile-tag">🩸 {form.bloodGroup}</span>
            <span className={`dd-badge ${vBadge.cls}`}>{vBadge.label}</span>
            <span className="dd-profile-tag">📍 {form.city}</span>
            <span className="dd-profile-tag">💉 {DONOR_PROFILE.occupation}</span>
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSave}>
        <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="dd-card__header">
            <h3 className="dd-card__title"><User size={16} /> Personal Information</h3>
          </div>
          <div className="dd-profile-form">
            {/* Full name */}
            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="donor-name">Full Name</label>
              <input
                id="donor-name"
                className="dd-form-input"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                disabled={!editing}
                required
              />
            </div>

            {/* Email */}
            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="donor-email">Email Address</label>
              <input
                id="donor-email"
                type="email"
                className="dd-form-input"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                disabled={!editing}
              />
            </div>

            {/* Phone */}
            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="donor-phone">Phone Number</label>
              <input
                id="donor-phone"
                className="dd-form-input"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                disabled={!editing}
              />
            </div>

            {/* DOB */}
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

            {/* Blood group */}
            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="donor-bg">Blood Group</label>
              <select
                id="donor-bg"
                className="dd-form-input dd-form-select"
                value={form.bloodGroup}
                onChange={(e) => set("bloodGroup", e.target.value)}
                disabled={!editing}
              >
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Weight */}
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

            {/* Occupation */}
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

            {/* City */}
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

            {/* State */}
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

            {/* Address */}
            <div className="dd-form-group full">
              <label className="dd-form-label" htmlFor="donor-address">Full Address</label>
              <input
                id="donor-address"
                className="dd-form-input"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                disabled={!editing}
              />
            </div>
          </div>
        </div>

        {/* ── Emergency contact ── */}
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
                placeholder="e.g. John Doe (Spouse)"
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

        {editing && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="dd-quick-btn dd-quick-btn--outline" onClick={() => setEditing(false)}>
              <X size={15} /> Cancel
            </button>
            <button type="submit" className="dd-quick-btn dd-quick-btn--primary">
              <Save size={15} /> Save Profile
            </button>
          </div>
        )}
      </form>

      {/* ── Disclaimer ── */}
      <p className="dd-disclaimer" style={{ marginTop: "var(--space-4)" }}>
        Profile information is stored locally in your browser session. Backend persistence will be implemented separately.
      </p>
    </div>
  );
}
