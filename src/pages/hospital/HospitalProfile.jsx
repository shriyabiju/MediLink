import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdEdit, MdSave, MdClose, MdLocalHospital } from 'react-icons/md';

const INITIAL = {
  name:        'City General Hospital',
  regNumber:   'HOS-2024-00142',
  type:        'Multi-Specialty',
  email:       'admin@citygeneralhospital.org',
  phone:       '+1 555-200-3000',
  emergency:   '+1 555-200-9911',
  address:     '101 Medical Drive',
  city:        'Springfield',
  state:       'Illinois',
  departments: 'Cardiology, Neurology, Pediatrics, Orthopedics, Emergency, Radiology',
  ambulance:   true,
  hours:       '24/7 — Emergency services always available',
};

function ProfileField({ label, value }) {
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid #F3F4F6' }}>
      <p style={{ fontSize: '.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: '.9rem', color: 'var(--text)', fontWeight: 500 }}>{value}</p>
    </div>
  );
}

export default function HospitalProfile() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState(INITIAL);
  const [draft,   setDraft]   = useState(INITIAL);

  const handleSave = (e) => {
    e.preventDefault();
    setProfile(draft);
    setEditing(false);
  };

  const f = (key) => ({ value: draft[key], onChange: (e) => setDraft({ ...draft, [key]: e.target.value }) });

  return (
    <div>
      <div className="page-header">
        <div><h1>Hospital Profile</h1><p>View and manage hospital information</p></div>
        {!editing
          ? <motion.button className="btn btn-primary" onClick={() => { setDraft(profile); setEditing(true); }} whileHover={{ scale: 1.03 }}><MdEdit /> Edit Profile</motion.button>
          : <button className="btn btn-outline" onClick={() => setEditing(false)}><MdClose /> Cancel</button>
        }
      </div>

      {/* Hero banner */}
      <div className="profile-hero" style={{ marginBottom: 24 }}>
        <div className="profile-logo"><MdLocalHospital /></div>
        <div>
          <h2>{profile.name}</h2>
          <p>Reg: {profile.regNumber} &nbsp;·&nbsp; {profile.type}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span className="badge badge-white" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>
              🚑 {profile.ambulance ? 'Ambulance Available' : 'No Ambulance'}
            </span>
            <span className="badge badge-white" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>
              🕐 {profile.hours}
            </span>
          </div>
        </div>
      </div>

      {!editing ? (
        <div className="grid-2">
          <div className="card">
            <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 4 }}>Contact Information</h3>
            <ProfileField label="Phone"            value={profile.phone} />
            <ProfileField label="Emergency Contact" value={profile.emergency} />
            <ProfileField label="Email"            value={profile.email} />
            <ProfileField label="Address"          value={`${profile.address}, ${profile.city}, ${profile.state}`} />
          </div>
          <div className="card">
            <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 4 }}>Hospital Details</h3>
            <ProfileField label="Hospital Type"   value={profile.type} />
            <ProfileField label="Working Hours"   value={profile.hours} />
            <ProfileField label="Ambulance"       value={profile.ambulance ? 'Available' : 'Not Available'} />
            <ProfileField label="Departments"     value={profile.departments} />
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
                <input className="form-control" {...f('regNumber')} />
              </div>
              <div className="form-group">
                <label className="form-label">Hospital Type</label>
                <select className="form-control form-control-select" {...f('type')}>
                  {['Multi-Specialty','General','Specialty','Teaching','Community'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" {...f('email')} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-control" {...f('phone')} />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact</label>
                <input type="tel" className="form-control" {...f('emergency')} />
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
                <label className="form-label">Departments</label>
                <textarea className="form-control" rows={2} {...f('departments')} />
              </div>
              <div className="form-group">
                <label className="form-label">Working Hours</label>
                <input className="form-control" {...f('hours')} />
              </div>
              <div className="form-group" style={{ justifyContent: 'center' }}>
                <label className="form-label">Ambulance Available</label>
                <div style={{ display: 'flex', gap: 12 }}>
                  {[true, false].map((v) => (
                    <label key={String(v)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '.875rem' }}>
                      <input type="radio" checked={draft.ambulance === v} onChange={() => setDraft({ ...draft, ambulance: v })} />
                      {v ? 'Yes' : 'No'}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><MdSave /> Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
