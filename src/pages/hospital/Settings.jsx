import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { hospitalApi } from '../../services/api';

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
    email:        true,
    sms:          false,
    criticalBlood:true,
    lowMedicine:  true,
    bedUpdates:   false,
    emergency:    true,
  });
  const toggle = (key) => setNotifs((n) => ({ ...n, [key]: !n[key] }));

  /* Notification preference persistence state */
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError,   setNotifError]    = useState('');
  const [notifSuccess, setNotifSuccess]  = useState('');

  /* ── Load persisted settings from backend ── */
  useEffect(() => {
    hospitalApi.getSettings()
      .then(({ settings }) => {
        if (settings?.notifications) {
          setNotifs({
            email:        settings.notifications.email        ?? true,
            sms:          settings.notifications.sms          ?? false,
            criticalBlood:settings.notifications.criticalBlood?? true,
            lowMedicine:  settings.notifications.lowMedicine  ?? true,
            bedUpdates:   settings.notifications.bedUpdates   ?? false,
            emergency:    settings.notifications.emergency    ?? true,
          });
        }
      })
      .catch(() => { /* Settings API failed — use defaults */ });
  }, []);

  /* ── Save notification preferences to MongoDB ── */
  const handleNotifSave = async () => {
    setNotifLoading(true);
    setNotifError(''); setNotifSuccess('');
    try {
      const d = await hospitalApi.saveSettings({ notifications: notifs });
      setNotifSuccess(d.message || 'Settings saved.');
      setTimeout(() => setNotifSuccess(''), 4000);
    } catch (e) {
      setNotifError(e.message || 'Failed to save settings.');
    } finally {
      setNotifLoading(false);
    }
  };

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError,   setPwError]   = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const f = (key) => ({ value: passwords[key], onChange: (e) => setPasswords({ ...passwords, [key]: e.target.value }) });

  const handlePwSave = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    setPwLoading(true);
    try {
      const d = await hospitalApi.changePassword({
        currentPassword: passwords.current,
        newPassword:     passwords.next,
        confirmPassword: passwords.confirm,
      });
      setPwSuccess(d.message);
      setPasswords({ current: '', next: '', confirm: '' });
      setTimeout(() => setPwSuccess(''), 4000);
    } catch (e) {
      setPwError(e.message);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div><h1>Settings</h1><p>Manage your account and notification preferences</p></div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Notification preferences — local state only (no backend model for this yet) */}
        <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Notification Preferences</h2>
          <SettingItem label="Email Alerts"         desc="Receive alerts via email"           on={notifs.email}         onToggle={() => toggle('email')} />
          <SettingItem label="SMS Alerts"           desc="Receive alerts via SMS"             on={notifs.sms}           onToggle={() => toggle('sms')} />
          <SettingItem label="Critical Blood Stock" desc="Alert when blood type is critical"  on={notifs.criticalBlood} onToggle={() => toggle('criticalBlood')} />
          <SettingItem label="Low Medicine Stock"   desc="Alert when medicine stock is low"   on={notifs.lowMedicine}   onToggle={() => toggle('lowMedicine')} />
          <SettingItem label="Bed Status Updates"   desc="Notify on bed availability changes" on={notifs.bedUpdates}    onToggle={() => toggle('bedUpdates')} />
          <SettingItem label="Emergency Requests"   desc="Alert on new emergency requests"    on={notifs.emergency}     onToggle={() => toggle('emergency')} />
          {notifError   && <div style={{ color: 'var(--danger)', padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, marginBottom: 8, fontSize: '.85rem' }}>{notifError}</div>}
          {notifSuccess && <div style={{ color: 'var(--success)', padding: '8px 12px', background: '#ECFDF5', borderRadius: 8, marginBottom: 8, fontSize: '.85rem' }}>{notifSuccess}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button className="btn btn-primary" onClick={handleNotifSave} disabled={notifLoading}>
              {notifLoading ? 'Saving…' : 'Save Preferences'}
            </button>
          </div>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Change password — connected to real API */}
          <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Change Password</h2>

            {pwError   && <div style={{ color: 'var(--danger)',  padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, marginBottom: 12, fontSize: '.85rem' }}>{pwError}</div>}
            {pwSuccess && <div style={{ color: 'var(--success)', padding: '8px 12px', background: '#ECFDF5', borderRadius: 8, marginBottom: 12, fontSize: '.85rem' }}>{pwSuccess}</div>}

            <form onSubmit={handlePwSave}>
              <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
                <div className="form-group">
                  <label className="form-label">Current Password <span className="req">*</span></label>
                  <input type="password" className="form-control" placeholder="••••••••" {...f('current')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password <span className="req">*</span></label>
                  <input type="password" className="form-control" placeholder="Min. 8 characters" {...f('next')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password <span className="req">*</span></label>
                  <input type="password" className="form-control" placeholder="••••••••" {...f('confirm')} required />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="submit" className="btn btn-primary" disabled={pwLoading}>{pwLoading ? 'Updating…' : 'Update Password'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
