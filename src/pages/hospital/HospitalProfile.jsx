import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdEdit, MdSave, MdClose, MdLocalHospital } from 'react-icons/md';
import { hospitalApi } from '../../services/api';

function ProfileField({ label, value }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
      <p style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: '.9rem', color: 'var(--text)', fontWeight: 500 }}>{value || '—'}</p>
    </div>
  );
}

const EMPTY = { name: '', registrationNumber: '', hospitalType: 'Other', email: '', phone: '', address: '', city: '', state: '', description: '' };

export default function HospitalProfile() {
  const [profile, setProfile] = useState(null);
  const [draft,   setDraft]   = useState(EMPTY);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    hospitalApi.getProfile()
      .then((d) => { setProfile(d.hospital); setDraft(d.hospital); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(''); setSuccess('');
    try {
      const d = await hospitalApi.updateProfile({
        name:               draft.name,
        registrationNumber: draft.registrationNumber,
        hospitalType:       draft.hospitalType,
        phone:              draft.phone,
        address:            draft.address,
        city:               draft.city,
        state:              draft.state,
        description:        draft.description,
      });
      setProfile(d.hospital);
      setEditing(false);
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const f = (key) => ({
    value: draft[key] || '',
    onChange: (e) => setDraft({ ...draft, [key]: e.target.value }),
  });

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Hospital Profile</h1><p>View and manage hospital information</p></div>
        {!editing
          ? <motion.button className="btn btn-primary" onClick={() => { setDraft(profile); setEditing(true); }} whileHover={{ scale: 1.03 }}><MdEdit /> Edit Profile</motion.button>
          : <button className="btn btn-outline" onClick={() => setEditing(false)}><MdClose /> Cancel</button>
        }
      </div>

      {error   && <div style={{ color: 'var(--danger)',  marginBottom: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 8 }}>{error}</div>}
      {success && <div style={{ color: 'var(--success)', marginBottom: 12, padding: '10px 14px', background: '#ECFDF5', borderRadius: 8 }}>{success}</div>}

      {profile && (
        <>
          {/* Hero banner */}
          <div className="profile-hero" style={{ marginBottom: 24 }}>
            <div className="profile-logo"><MdLocalHospital /></div>
            <div>
              <h2>{profile.name}</h2>
              <p>Reg: {profile.registrationNumber || '—'} &nbsp;·&nbsp; {profile.hospitalType}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>
                  📍 {profile.city || '—'}{profile.state ? `, ${profile.state}` : ''}
                </span>
                <span className={`badge ${profile.approvalStatus === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                  {profile.approvalStatus === 'approved' ? '✅ Approved' : '⏳ Pending'}
                </span>
              </div>
            </div>
          </div>

          {!editing ? (
            <div className="grid-2">
              <div className="card">
                <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 4 }}>Contact Information</h3>
                <ProfileField label="Phone"   value={profile.phone} />
                <ProfileField label="Email"   value={profile.email} />
                <ProfileField label="Address" value={[profile.address, profile.city, profile.state].filter(Boolean).join(', ')} />
              </div>
              <div className="card">
                <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 4 }}>Hospital Details</h3>
                <ProfileField label="Hospital Type"      value={profile.hospitalType} />
                <ProfileField label="Registration No."   value={profile.registrationNumber} />
                <ProfileField label="Total Beds"         value={profile.totalBeds} />
                <ProfileField label="Description"        value={profile.description} />
              </div>
            </div>
          ) : (
            <div className="card">
              <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 20 }}>Edit Profile</h3>
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">Hospital Name <span className="req">*</span></label>
                    <input className="form-control" {...f('name')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Registration Number</label>
                    <input className="form-control" {...f('registrationNumber')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hospital Type</label>
                    <select className="form-control form-control-select" {...f('hospitalType')}>
                      {['Government','Private','NGO','Clinic','Other'].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input type="tel" className="form-control" {...f('phone')} />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Address</label>
                    <input className="form-control" {...f('address')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-control" {...f('city')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input className="form-control" {...f('state')} />
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows={2} {...f('description')} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                  <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : <><MdSave /> Save Changes</>}</button>
                </div>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
