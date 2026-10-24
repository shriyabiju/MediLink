import React, { useState, useEffect, useCallback } from 'react';
import { MdSearch, MdPeople } from 'react-icons/md';
import { hospitalApi } from '../../services/api';

const BLOOD_GROUPS = ['all', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const STATUS_OPTS  = ['all', 'approved', 'pending', 'rejected'];

const donorStatusBadge = {
  approved: { bg: '#D1FAE5', color: '#065F46', label: 'Verified' },
  pending:  { bg: '#FEF3C7', color: '#92400E', label: 'Pending'  },
  rejected: { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected' },
};

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function DonorDirectory() {
  const [donors,  setDonors]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [bgFilter, setBgFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchDonors = useCallback(() => {
    setLoading(true);
    const params = {};
    if (bgFilter !== 'all')     params.bloodGroup = bgFilter;
    if (statusFilter !== 'all') params.status     = statusFilter;
    hospitalApi.getDonors(params)
      .then((d) => setDonors(d.donors))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bgFilter, statusFilter]);

  useEffect(() => { fetchDonors(); }, [fetchDonors]);

  const filtered = donors.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.city || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Donor Directory</h1>
          <p>View registered blood donors on the platform</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <div className="tbl-search" style={{ flex: 1, minWidth: 200 }}>
          <MdSearch className="si" />
          <input placeholder="Search by name or city…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          className="form-control form-control-select"
          style={{ width: 140 }}
          value={bgFilter}
          onChange={(e) => setBgFilter(e.target.value)}
        >
          {BLOOD_GROUPS.map((g) => (
            <option key={g} value={g}>{g === 'all' ? 'All Blood Groups' : g}</option>
          ))}
        </select>
        <select
          className="form-control form-control-select"
          style={{ width: 140 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_OPTS.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
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

      {/* Notice about donor eligibility */}
      <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: '.82rem', color: '#92400E' }}>
        ⚠️ Registration does not confirm medical eligibility or current availability. Always verify directly with the donor before requesting a donation.
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <MdPeople className="es-icon" />
          <p>{search ? 'No donors match your search.' : 'No donors found with the selected filters.'}</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Blood Group</th>
                  <th>City</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const badge = donorStatusBadge[d.donorStatus] || donorStatusBadge.pending;
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
                      <td>{d.city || '—'}</td>
                      <td>{d.phone || '—'}</td>
                      <td>
                        <span style={{ background: badge.bg, color: badge.color, padding: '3px 10px', borderRadius: 20, fontSize: '.72rem', fontWeight: 700 }}>
                          {badge.label}
                        </span>
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
