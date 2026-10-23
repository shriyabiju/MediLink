import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Bell, Shield, User, LogOut,
  Save, Lock, Eye, EyeOff, AlertCircle, CheckCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { donorApi } from "../../services/api";
import "./css/donor.css";

/* ── Toggle Row ── */
function ToggleRow({ label, desc, checked, onChange, disabled }) {
  return (
    <div className="dd-toggle-row">
      <div className="dd-toggle-row__info">
        <strong>{label}</strong>
        {desc && <p>{desc}</p>}
      </div>
      <label className="dd-toggle" aria-label={label}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <span className="dd-toggle-slider" />
      </label>
    </div>
  );
}

/* ── Inline feedback banner ── */
function Feedback({ type, message }) {
  if (!message) return null;
  const isSuccess = type === "success";
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background:   isSuccess ? "var(--success-soft)" : "var(--danger-soft)",
        border:       `1px solid ${isSuccess ? "var(--success)" : "var(--danger)"}`,
        borderRadius: "var(--radius-sm)",
        padding:      "11px 16px",
        marginBottom: "var(--space-4)",
        color:        isSuccess ? "#065F46" : "#991B1B",
        fontSize:     "var(--text-sm)",
        fontWeight:   600,
        display:      "flex",
        alignItems:   "center",
        gap:          8,
      }}
    >
      {isSuccess ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      {message}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main DonorSettings
───────────────────────────────────────────── */
export default function DonorSettings() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  /* ── Settings state ── */
  const [notifPrefs, setNotifPrefs] = useState({
    bloodRequests: true, appointments: true, eligibility: true,
    weeklyDigest: false, smsAlerts: false, emailAlerts: true,
  });
  const [privacyPrefs, setPrivacyPrefs] = useState({
    profileVisible: true, showBloodGroup: true, allowContact: true,
  });

  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving,  setSettingsSaving]  = useState(false);
  const [settingsFeedback,setSettingsFeedback]= useState({ type: "", msg: "" });

  /* ── Password change state ── */
  const [pwForm, setPwForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving,    setPwSaving]    = useState(false);
  const [pwFeedback,  setPwFeedback]  = useState({ type: "", msg: "" });

  const setPw = (k, v) => setPwForm((p) => ({ ...p, [k]: v }));

  /* ── Load settings from API on mount ── */
  useEffect(() => {
    donorApi.getSettings()
      .then(({ settings }) => {
        if (settings?.notifications) setNotifPrefs((p) => ({ ...p, ...settings.notifications }));
        if (settings?.privacy)       setPrivacyPrefs((p) => ({ ...p, ...settings.privacy }));
      })
      .catch(() => { /* Use local defaults if API fails */ })
      .finally(() => setSettingsLoading(false));
  }, []);

  /* ── Save settings ── */
  const handleSaveSettings = async () => {
    setSettingsFeedback({ type: "", msg: "" });
    setSettingsSaving(true);
    try {
      await donorApi.saveSettings({
        notifications: notifPrefs,
        privacy:       privacyPrefs,
      });
      setSettingsFeedback({ type: "success", msg: "Settings saved successfully." });
      setTimeout(() => setSettingsFeedback({ type: "", msg: "" }), 5000);
    } catch (err) {
      setSettingsFeedback({ type: "error", msg: err.message || "Failed to save settings." });
    } finally {
      setSettingsSaving(false);
    }
  };

  /* ── Change password ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwFeedback({ type: "", msg: "" });

    /* Client-side validation */
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwFeedback({ type: "error", msg: "All password fields are required." });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwFeedback({ type: "error", msg: "New password must be at least 8 characters." });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwFeedback({ type: "error", msg: "New passwords do not match." });
      return;
    }
    if (pwForm.currentPassword === pwForm.newPassword) {
      setPwFeedback({ type: "error", msg: "New password must differ from the current one." });
      return;
    }

    setPwSaving(true);
    try {
      await donorApi.changePassword({
        currentPassword:  pwForm.currentPassword,
        newPassword:      pwForm.newPassword,
        confirmPassword:  pwForm.confirmPassword,
      });
      setPwFeedback({ type: "success", msg: "Password changed successfully." });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwFeedback({ type: "", msg: "" }), 6000);
    } catch (err) {
      setPwFeedback({ type: "error", msg: err.message || "Failed to change password." });
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  /* ── Password strength ── */
  const strength = (() => {
    let s = 0;
    const p = pwForm.newPassword;
    if (p.length >= 8)          s++;
    if (/[A-Z]/.test(p))        s++;
    if (/[0-9]/.test(p))        s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const STRENGTH_COLOR = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>Settings</h1>
          <p>Manage your account preferences, notifications, and security.</p>
        </div>
        <button
          className="dd-quick-btn dd-quick-btn--primary"
          onClick={handleSaveSettings}
          disabled={settingsSaving || settingsLoading}
        >
          {settingsSaving ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .6s linear infinite", display: "inline-block" }} />
              Saving…
            </span>
          ) : (
            <><Save size={15} /> Save Settings</>
          )}
        </button>
      </div>

      {/* ── Settings feedback ── */}
      <AnimatePresence>
        {settingsFeedback.msg && (
          <Feedback type={settingsFeedback.type} message={settingsFeedback.msg} />
        )}
      </AnimatePresence>

      {/* ── Account Info (read-only) ── */}
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
          To update your name, visit the <strong>My Profile</strong> page.
        </p>
      </div>

      {/* ── Change Password ── */}
      <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="dd-card__header">
          <h3 className="dd-card__title"><Lock size={16} /> Change Password</h3>
        </div>

        <AnimatePresence>
          {pwFeedback.msg && (
            <Feedback type={pwFeedback.type} message={pwFeedback.msg} />
          )}
        </AnimatePresence>

        <form onSubmit={handleChangePassword} noValidate>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "var(--space-4)" }}>

            {/* Current password */}
            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="pw-current">
                Current Password <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="pw-current"
                  type={showCurrent ? "text" : "password"}
                  className="dd-form-input"
                  placeholder="Enter current password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPw("currentPassword", e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((p) => !p)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                  aria-label={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="pw-new">
                New Password <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="pw-new"
                  type={showNew ? "text" : "password"}
                  className="dd-form-input"
                  placeholder="Min. 8 characters"
                  value={pwForm.newPassword}
                  onChange={(e) => setPw("newPassword", e.target.value)}
                  autoComplete="new-password"
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                  aria-label={showNew ? "Hide new password" : "Show new password"}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Strength bar */}
              {pwForm.newPassword && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                  <div style={{ display: "flex", gap: 3, flex: 1 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          height: 4, flex: 1, borderRadius: 2,
                          background: i <= strength ? STRENGTH_COLOR[strength] : "var(--border)",
                          transition: "background var(--transition)",
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: STRENGTH_COLOR[strength] || "var(--text-muted)", whiteSpace: "nowrap" }}>
                    {STRENGTH_LABEL[strength] || ""}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm new password */}
            <div className="dd-form-group">
              <label className="dd-form-label" htmlFor="pw-confirm">
                Confirm New Password <span style={{ color: "var(--danger)" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="pw-confirm"
                  type={showConfirm ? "text" : "password"}
                  className="dd-form-input"
                  placeholder="Re-enter new password"
                  value={pwForm.confirmPassword}
                  onChange={(e) => setPw("confirmPassword", e.target.value)}
                  autoComplete="new-password"
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Match indicator */}
              {pwForm.confirmPassword && pwForm.newPassword && (
                <p style={{ fontSize: "var(--text-xs)", marginTop: 5, fontWeight: 600, color: pwForm.confirmPassword === pwForm.newPassword ? "var(--success)" : "var(--danger)" }}>
                  {pwForm.confirmPassword === pwForm.newPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

          </div>

          <div style={{ marginTop: "var(--space-4)", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit"
              className="dd-quick-btn dd-quick-btn--primary"
              disabled={pwSaving}
            >
              {pwSaving ? (
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .6s linear infinite", display: "inline-block" }} />
                  Changing…
                </span>
              ) : (
                <><Lock size={15} /> Change Password</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Notification preferences ── */}
      <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="dd-card__header">
          <h3 className="dd-card__title"><Bell size={16} /> Notification Preferences</h3>
        </div>
        {settingsLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: "var(--radius-sm)" }} />)}
          </div>
        ) : (
          <div className="dd-settings-section">
            <ToggleRow label="Nearby Blood Requests"  desc="Get notified when a matching blood request is posted."     checked={notifPrefs.bloodRequests}  onChange={(v) => setNotifPrefs((p) => ({ ...p, bloodRequests: v }))}  />
            <ToggleRow label="Appointment Reminders"  desc="Reminders for your upcoming donation appointments."        checked={notifPrefs.appointments}   onChange={(v) => setNotifPrefs((p) => ({ ...p, appointments: v }))}   />
            <ToggleRow label="Eligibility Alerts"     desc="Notify me when I become eligible to donate again."        checked={notifPrefs.eligibility}    onChange={(v) => setNotifPrefs((p) => ({ ...p, eligibility: v }))}    />
            <ToggleRow label="Weekly Digest"          desc="A weekly summary of your donation activity."              checked={notifPrefs.weeklyDigest}   onChange={(v) => setNotifPrefs((p) => ({ ...p, weeklyDigest: v }))}   />
            <ToggleRow label="Email Notifications"    desc="Receive notifications via email."                         checked={notifPrefs.emailAlerts}    onChange={(v) => setNotifPrefs((p) => ({ ...p, emailAlerts: v }))}    />
            <ToggleRow label="SMS Alerts"             desc="Receive urgent alerts via SMS (requires verified phone)." checked={notifPrefs.smsAlerts}      onChange={(v) => setNotifPrefs((p) => ({ ...p, smsAlerts: v }))}      />
          </div>
        )}
      </div>

      {/* ── Privacy preferences ── */}
      <div className="dd-card" style={{ marginBottom: "var(--space-5)" }}>
        <div className="dd-card__header">
          <h3 className="dd-card__title"><Shield size={16} /> Privacy Preferences</h3>
        </div>
        {settingsLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: "var(--radius-sm)" }} />)}
          </div>
        ) : (
          <div className="dd-settings-section">
            <ToggleRow label="Make Profile Visible to Hospitals" desc="Hospitals and blood banks can see your donor profile."   checked={privacyPrefs.profileVisible} onChange={(v) => setPrivacyPrefs((p) => ({ ...p, profileVisible: v }))} />
            <ToggleRow label="Show Blood Group Publicly"         desc="Your blood group is shown in your public donor profile." checked={privacyPrefs.showBloodGroup} onChange={(v) => setPrivacyPrefs((p) => ({ ...p, showBloodGroup: v }))} />
            <ToggleRow label="Allow Hospitals to Contact Me"     desc="Hospitals can send you donation requests directly."      checked={privacyPrefs.allowContact}   onChange={(v) => setPrivacyPrefs((p) => ({ ...p, allowContact: v }))}   />
          </div>
        )}
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-3)", fontStyle: "italic" }}>
          Privacy settings are persisted to your account. Backend enforcement will be added in a future sprint.
        </p>
      </div>

      {/* ── Account actions ── */}
      <div className="dd-card" style={{ border: "1px solid rgba(239,68,68,.3)", background: "var(--danger-soft)" }}>
        <div className="dd-card__header">
          <h3 className="dd-card__title" style={{ color: "var(--danger)" }}>
            <LogOut size={16} /> Account Actions
          </h3>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <button className="dd-quick-btn dd-quick-btn--danger" onClick={handleLogout}>
            <LogOut size={15} /> Logout of MediLink
          </button>
        </div>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "var(--space-3)" }}>
          Logging out will clear your session.
        </p>
      </div>
    </div>
  );
}
