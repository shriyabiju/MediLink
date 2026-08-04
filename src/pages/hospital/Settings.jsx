import React, { useState } from 'react';
import { motion } from 'framer-motion';

function Toggle({ on, onToggle }) {
  return (
    <button type="button" className={`toggle-switch ${on ? 'on' : 'off'}`} onClick={onToggle} aria-pressed={on}>
      <div className="toggle-thumb" />
    </button>
  );
}

function SettingItem({ label, desc, on, onToggle }) {
  return (
    <div className="toggle-wrap">
      <div className="toggle-label">
        <strong>{label}</strong>
        {desc && <span>{desc}</span>}
      </div>
      <Toggle on={on} onToggle={onToggle} />
    </div>
  );
}

export default function Settings() {
  const [notifs, setNotifs] = useState({
    email:       true,
    sms:         false,
    criticalBlood: true,
    lowMedicine: true,
    bedUpdates:  false,
    emergency:   true,
  });

  const toggle = (key) => setNotifs((n) => ({ ...n, [key]: !n[key] }));

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const f = (key) => ({ value: passwords[key], onChange: (e) => setPasswords({ ...passwords, [key]: e.target.value }) });

  const handlePwSave = (e) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) { alert('Passwords do not match.'); return; }
    alert('Password updated successfully.');
    setPasswords({ current: '', next: '', confirm: '' });
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Settings</h1><p>Manage your account and notification preferences</p></div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Notification preferences */}
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Notification Preferences</h2>
          <SettingItem label="Email Alerts"         desc="Receive alerts via email"              on={notifs.email}        onToggle={() => toggle('email')} />
          <SettingItem label="SMS Alerts"            desc="Receive alerts via SMS"                on={notifs.sms}          onToggle={() => toggle('sms')} />
          <SettingItem label="Critical Blood Stock"  desc="Alert when blood type is critical"     on={notifs.criticalBlood} onToggle={() => toggle('criticalBlood')} />
          <SettingItem label="Low Medicine Stock"    desc="Alert when medicine stock is low"      on={notifs.lowMedicine}  onToggle={() => toggle('lowMedicine')} />
          <SettingItem label="Bed Status Updates"    desc="Notify on bed availability changes"    on={notifs.bedUpdates}   onToggle={() => toggle('bedUpdates')} />
          <SettingItem label="Emergency Requests"    desc="Alert on new emergency requests"       on={notifs.emergency}    onToggle={() => toggle('emergency')} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-primary" onClick={() => alert('Preferences saved.')}>Save Preferences</button>
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Change password */}
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Change Password</h2>
            <form onSubmit={handlePwSave}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label className="form-label">Current Password <span className="req">*</span></label>
                  <input type="password" className="form-control" placeholder="••••••••" {...f('current')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password <span className="req">*</span></label>
                  <input type="password" className="form-control" placeholder="••••••••" {...f('next')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password <span className="req">*</span></label>
                  <input type="password" className="form-control" placeholder="••••••••" {...f('confirm')} required />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="submit" className="btn btn-primary">Update Password</button>
              </div>
            </form>
          </motion.div>

          {/* Danger zone */}
          <motion.div className="card" style={{ borderColor: '#FECACA' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger)', marginBottom: 16 }}>Danger Zone</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Clear All Notifications', desc: 'Permanently remove all notification history' },
                { label: 'Deactivate Account',      desc: 'Temporarily disable hospital dashboard access' },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: '#FEF2F2', borderRadius: 10 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '.875rem' }}>{item.label}</p>
                    <p style={{ fontSize: '.77rem', color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                  <motion.button className="btn btn-danger btn-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => alert('Action blocked in demo.')}>
                    Proceed
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
