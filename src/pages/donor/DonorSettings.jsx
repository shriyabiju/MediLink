import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Bell, Shield, User, LogOut, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./css/donor.css";

/* ── Toggle Row ── */
function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="dd-toggle-row">
      <div className="dd-toggle-row__info">
        <strong>{label}</strong>
        {desc && <p>{desc}</p>}
      </div>
      <label className="dd-toggle" aria-label={label}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="dd-toggle-slider" />
      </label>
    </div>
  );
}

export default function DonorSettings() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  /* ── Notification preferences ── */
  const [notifPrefs, setNotifPrefs] = useState({
    bloodRequests:    true,
    appointments:     true,
    eligibility:      true,
    weeklyDigest:     false,
    smsAlerts:        false,
    emailAlerts:      true,
  });

  /* ── Account preferences ── */
  const [accountPrefs, setAccountPrefs] = useState({
    profileVisible:   true,
    showBloodGroup:   true,
    allowContact:     true,
  });

  const [saved, setSaved] = useState(false);

  const setNotif   = (k, v) => setNotifPrefs((p)   => ({ ...p, [k]: v }));
  const setAccount = (k, v) => setAccountPrefs((p)  => ({ ...p, [k]: v }));

  const handleSave = () => {
    /* In production: PATCH /api/donor/settings */
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account preferences and notification settings.</p>
        </div>
        <button className="dd-quick-btn dd-quick-btn--primary" onClick={handleSave}>
          <Save size={15} /> Save Settings
        </button>
      </div>

      {/* ── Saved confirmation ── */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "var(--success-soft)", border: "1px solid var(--success)", borderRadius: "var(--radius-sm)",
            padding: "12px 18px", marginBottom: "var(--space-5)", color: "#065F46",
            fontSize: "var(--text-sm)", fontWeight: 600,
          }}
        >
          ✅ Settings saved. These preferences are stored in frontend state for now.
        </motion.div>
      )}

      {/* ── Account Info ── */}
      <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="dd-card__header">
          <h3 className="dd-card__title"><User size={16} /> Account Information</h3>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "var(--space-4)" }}>
          <div className="dd-form-group">
            <label className="dd-form-label" htmlFor="s-name">Full Name</label>
            <input id="s-name" className="dd-form-input" defaultValue={user?.name ?? ""} disabled />
          </div>
          <div className="dd-form-group">
            <label className="dd-form-label" htmlFor="s-email">Email Address</label>
            <input id="s-email" className="dd-form-input" defaultValue={user?.email ?? ""} disabled />
          </div>
          <div className="dd-form-group">
            <label className="dd-form-label" htmlFor="s-role">Role</label>
            <input id="s-role" className="dd-form-input" defaultValue="Blood Donor" disabled />
          </div>
        </div>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-3)" }}>
          To update your name or email, visit the Profile page.
        </p>
      </div>

      {/* ── Notification preferences ── */}
      <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="dd-card__header">
          <h3 className="dd-card__title"><Bell size={16} /> Notification Preferences</h3>
        </div>
        <div className="dd-settings-section">
          <ToggleRow
            label="Nearby Blood Requests"
            desc="Get notified when a blood request matching your group is posted nearby."
            checked={notifPrefs.bloodRequests}
            onChange={(v) => setNotif("bloodRequests", v)}
          />
          <ToggleRow
            label="Appointment Reminders"
            desc="Reminders for your upcoming donation appointments."
            checked={notifPrefs.appointments}
            onChange={(v) => setNotif("appointments", v)}
          />
          <ToggleRow
            label="Eligibility Alerts"
            desc="Notify me when I become eligible to donate again."
            checked={notifPrefs.eligibility}
            onChange={(v) => setNotif("eligibility", v)}
          />
          <ToggleRow
            label="Weekly Digest"
            desc="A weekly summary of your donation activity and requests."
            checked={notifPrefs.weeklyDigest}
            onChange={(v) => setNotif("weeklyDigest", v)}
          />
          <ToggleRow
            label="Email Notifications"
            desc="Receive notifications via email."
            checked={notifPrefs.emailAlerts}
            onChange={(v) => setNotif("emailAlerts", v)}
          />
          <ToggleRow
            label="SMS Alerts"
            desc="Receive urgent alerts via SMS (requires verified phone number)."
            checked={notifPrefs.smsAlerts}
            onChange={(v) => setNotif("smsAlerts", v)}
          />
        </div>
      </div>

      {/* ── Privacy preferences ── */}
      <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="dd-card__header">
          <h3 className="dd-card__title"><Shield size={16} /> Privacy Preferences</h3>
        </div>
        <div className="dd-settings-section">
          <ToggleRow
            label="Make Profile Visible to Hospitals"
            desc="Hospitals and blood banks can see your donor profile."
            checked={accountPrefs.profileVisible}
            onChange={(v) => setAccount("profileVisible", v)}
          />
          <ToggleRow
            label="Show Blood Group Publicly"
            desc="Your blood group is shown in your public donor profile."
            checked={accountPrefs.showBloodGroup}
            onChange={(v) => setAccount("showBloodGroup", v)}
          />
          <ToggleRow
            label="Allow Hospitals to Contact Me"
            desc="Hospitals can send you donation requests directly."
            checked={accountPrefs.allowContact}
            onChange={(v) => setAccount("allowContact", v)}
          />
        </div>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-3)", fontStyle: "italic" }}>
          Note: Frontend-only settings. These will be enforced server-side once the backend is implemented.
          Frontend-only settings do not provide real privacy protection.
        </p>
      </div>

      {/* ── Danger zone ── */}
      <div
        className="dd-card"
        style={{ border: "1px solid rgba(239,68,68,.3)", background: "var(--danger-soft)" }}
      >
        <div className="dd-card__header">
          <h3 className="dd-card__title" style={{ color: "var(--danger)" }}>
            <LogOut size={16} /> Account Actions
          </h3>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <button
            className="dd-quick-btn dd-quick-btn--danger"
            onClick={handleLogout}
          >
            <LogOut size={15} /> Logout of MediLink
          </button>
          <button
            className="dd-quick-btn dd-quick-btn--outline"
            onClick={() => alert("Account deactivation will be available once the backend is connected.")}
          >
            Deactivate Account
          </button>
        </div>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-3)" }}>
          Logging out will clear your session. Deactivation permanently disables your account (feature coming with backend).
        </p>
      </div>
    </div>
  );
}
