import React, { useState, useEffect } from 'react';
import { MdSearch, MdLocalHospital, MdPhone, MdEmail, MdLocationOn } from 'react-icons/md';
import { hospitalApi } from '../../services/api';

const statusColor = {
  Available:      { bg: '#D1FAE5', color: '#065F46' },
  'Low Stock':    { bg: '#FEF3C7', color: '#92400E' },
  'Out of Stock': { bg: '#FEE2E2', color: '#991B1B' },
};

export default function OtherHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    hospitalApi.getOtherHospitals()
      .then((d) => setHospitals(d.hospitals || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = hospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    (h.city  || '').toLowerCase().includes(search.toLowerCase()) ||
    (h.state || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Other Hospitals</h1>
          <p>Browse all approved hospitals on the MediLink platform</p>
        </div>
      </div>

      {/* Search */}
      <div className="tbl-search" style={{ marginBottom: 20, maxWidth: 340 }}>
        <MdSearch className="si" />
        <input
          placeholder="Search by name or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
          <MdLocalHospital className="es-icon" />
          <p>{search ? 'No hospitals match your search.' : 'No other approved hospitals yet.'}</p>
        </div>
      ) : (
        <div className="grid-auto">
          {filtered.map((h) => (
            <div key={h._id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, background: '#EFF6FF',
                  color: '#2563EB', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0,
                }}>
                  🏥
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '.9rem' }}>{h.name}</p>
                  <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{h.hospitalType || 'Hospital'}</p>
                </div>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(h.city || h.state) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', color: 'var(--text-muted)' }}>
                    <MdLocationOn />
                    <span>{[h.address, h.city, h.state].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {h.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', color: 'var(--text-muted)' }}>
                    <MdPhone />
                    <span>{h.phone}</span>
                  </div>
                )}
                {h.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.8rem', color: 'var(--text-muted)' }}>
                    <MdEmail />
                    <span>{h.email}</span>
                  </div>
                )}
                {h.totalBeds > 0 && (
                  <div style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>
                    🛏 Total Beds: <strong style={{ color: 'var(--text)' }}>{h.totalBeds}</strong>
                  </div>
                )}
              </div>

              {/* Blood stock */}
              {h.bloodStock && h.bloodStock.length > 0 && (
                <div>
                  <p style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
                    Blood Available
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {h.bloodStock.filter((s) => s.status !== 'Out of Stock').map((s) => {
                      const c = statusColor[s.status] || statusColor.Available;
                      return (
                        <span key={s.group} style={{
                          background: c.bg, color: c.color,
                          padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        }}>
                          {s.group} · {s.units}u
                        </span>
                      );
                    })}
                    {h.bloodStock.every((s) => s.status === 'Out of Stock') && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No stock currently available</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
