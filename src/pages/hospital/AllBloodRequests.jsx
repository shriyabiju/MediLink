import React, { useState, useEffect, useCallback } from 'react';
import { MdSearch, MdBloodtype } from 'react-icons/md';
import { hospitalApi } from '../../services/api';

const URGENCY_BADGE = {
  Critical: { bg: '#FEE2E2', color: '#991B1B' },
  High:     { bg: '#FEF3C7', color: '#92400E' },
  Medium:   { bg: '#DBEAFE', color: '#1E40AF' },
  Low:      { bg: '#F3F4F6', color: '#374151' },
};

const STATUS_BADGE = {
  open:             { bg: '#D1FAE5', color: '#065F46', label: 'Open'     },
  partially_filled: { bg: '#DBEAFE', color: '#1E40AF', label: 'Partial'  },
  fulfilled:        { bg: '#F3F4F6', color: '#374151', label: 'Fulfilled'},
  cancelled:        { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled'},
};

const BLOOD_GROUPS = ['all', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const URGENCY_OPTS = ['all', 'Critical', 'High', 'Medium', 'Low'];
const STATUS_OPTS  = ['all', 'open', 'partially_filled', 'fulfilled', 'cancelled'];

export default function AllBloodRequests() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [search,   setSearch]   = useState('');
  const [bgFilter, setBgFilter]     = useState('all');
  const [urgFilter, setUrgFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchRequests = useCallback(() => {
    setLoading(true);
    const params = {};
    if (bgFilter !== 'all')     params.bloodGroup = bgFilter;
    if (urgFilter !== 'all')    params.urgency    = urgFilter;
    if (statusFilter !== 'all') params.status     = statusFilter;
    hospitalApi.getAllBloodRequests(params)
      .then((d) => setRequests(d.requests || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bgFilter, urgFilter, statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filtered = requests.filter((r) =>
    (r.hospitalName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.hospitalCity || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.bloodGroup   || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>All Blood Requests</h1>
          <p>View all blood requests from hospitals and patients across the platform</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <div className="tbl-search" style={{ flex: 1, minWidth: 200 }}>
          <MdSearch className="si" />
          <input placeholder="Search hospital or city…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {[
          { label: 'Blood Group', opts: BLOOD_GROUPS, val: bgFilter,     set: setBgFilter },
          { label: 'Urgency',     opts: URGENCY_OPTS, val: urgFilter,    set: setUrgFilter },
          { label: 'Status',      opts: STATUS_OPTS,  val: statusFilter, set: setStatusFilter },
        ].map(({ label, opts, val, set }) => (
          <select
            key={label}
            className="form-control form-control-select"
            style={{ width: 150 }}
            value={val}
            onChange={(e) => set(e.target.value)}
            aria-label={label}
          >
            {opts.map((o) => (
              <option key={o} value={o}>
                {o === 'all' ? `All ${label}s` : (STATUS_BADGE[o]?.label || o)}
              </option>
            ))}
          </select>
        ))}
        <span style={{ alignSelf: 'center', fontSize: '.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {filtered.length} request{filtered.length !== 1 ? 's' : ''}
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
          <p>No blood requests found.</p>
        </div>
      ) : (
        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Hospital</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Posted By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const ub = URGENCY_BADGE[r.urgency] || URGENCY_BADGE.Medium;
                  const sb = STATUS_BADGE[r.status]   || STATUS_BADGE.open;
                  return (
                    <tr key={r._id}>
                      <td>
                        <p style={{ fontWeight: 600, fontSize: '.85rem' }}>{r.hospitalName}</p>
                        {r.hospitalCity && <p style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>{r.hospitalCity}</p>}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 36, height: 36, borderRadius: '50%',
                          background: '#FEE2E2', border: '2px solid #EF4444',
                          fontWeight: 800, fontSize: '.78rem', color: '#991B1B',
                        }}>
                          {r.bloodGroup}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {r.unitsFilled}/{r.unitsNeeded}
                      </td>
                      <td>
                        <span style={{ background: ub.bg, color: ub.color, padding: '3px 10px', borderRadius: 20, fontSize: '.72rem', fontWeight: 700 }}>
                          {r.urgency}
                        </span>
                      </td>
                      <td>
                        <span style={{ background: sb.bg, color: sb.color, padding: '3px 10px', borderRadius: 20, fontSize: '.72rem', fontWeight: 700 }}>
                          {sb.label}
                        </span>
                      </td>
                      <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                        {r.postedBy?.name || '—'}
                        <br />
                        <span style={{ fontSize: '.7rem' }}>{r.postedBy?.role || ''}</span>
                      </td>
                      <td style={{ fontSize: '.78rem', color: 'var(--text-muted)' }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
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
