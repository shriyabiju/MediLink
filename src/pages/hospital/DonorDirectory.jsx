import React, { useState, useEffect, useCallback } from 'react';
import { MdSearch, MdPeople, MdVerifiedUser } from 'react-icons/md';
import { hospitalApi } from '../../services/api';

const BLOOD_GROUPS = ['all', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

/* Calculate age from DOB string (YYYY-MM-DD) */
function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d)) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function DonorDirectory() {
  const [donors,  setDonors]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [bgFilter, setBgFilter]     = useState('all');

  const fetchDonors = useCallback(() => {
    setLoading(true);
    setError('');
    const params = {};
    if (bgFilter !== 'all') params.bloodGroup = bgFilter;
    /* Backend defaults to approved-only — we don't pass status=all so
       hospitals only see verified donors */
    hospitalApi.getDonors(params)
      .then((d) => setDonors(d.donors || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bgFilter]);

  useEffect(() => { fetchDonors(); }, [fetchDonors]);

  const filtered = donors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.city || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Verified Donor Directory</h1>
          <p>Browse admin-verified blood donors available on the platform</p>
        </div>
      </div>

      {/* Info banner */}
      <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: '.82rem', color: '#065F46', display: 'flex', alignItems: 'center', gap: 8 }}>
        <MdVerifiedUser size={16} /> Only admin-verified donors are shown here. Identity documents are never shared with hospitals.
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <div className="tbl-search" style={{ flex: 1, minWidth: 200 }}>
          <MdSearch className="si" />
          <input placeholder="Search by name or city…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          className="form-control form-control-select"
          style={{ width: 160 }}
          value={bgFilter}
          onChange={(e) => setBgFilter(e.target.value)}
        >
          {BLOOD_GROUPS.map((g) => (
            <option key={g} value={g}>{g === 'all' ? 'All Blood Groups' : g}</option>
          ))}
        </select>
        <span style={{ alignSelf: 'center', fontSize: '.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {filtered.length} donor{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <MdPeople className="es-icon" />
          <p>{search ? 'No donors match your search.' : 'No verified donors found with the selected filters.'}</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Blood Group</th>
                  <th>Age</th>
                  <th>City</th>
                  <th>Phone</th>
                  <th>Available</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const age = calcAge(d.dob);
                  return (
                    <tr key={d._id}>
                      <td>
                        <div className="td-avatar">
                          <div className="td-avatar-initials">{initials(d.name)}</div>
                          <span className="td-name">{d.name}</span>
                        </div>
                      </td>
                      <td>
                        {d.bloodGroup ? (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 36, height: 36, borderRadius: '50%',
                            background: '#FEE2E2', border: '2px solid #EF4444',
                            fontWeight: 800, fontSize: '.78rem', color: '#991B1B',
                          }}>
                            {d.bloodGroup}
                          </span>
                        ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ fontSize: '.82rem', color: 'var(--text-secondary)' }}>
                        {age !== null ? `${age} yrs` : '—'}
                      </td>
                      <td>{d.city || '—'}</td>
                      <td>{d.phone || '—'}</td>
                      <td>
                        {d.availability === false ? (
                          <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 10px', borderRadius: 20, fontSize: '.72rem', fontWeight: 700 }}>
                            Unavailable
                          </span>
                        ) : (
                          <span style={{ background: '#D1FAE5', color: '#065F46', padding: '3px 10px', borderRadius: 20, fontSize: '.72rem', fontWeight: 700 }}>
                            Available
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
