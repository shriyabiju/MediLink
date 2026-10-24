import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MdSearch, MdEdit, MdSave, MdAdd, MdDelete } from 'react-icons/md';
import Table from './components/Table';
import { DonutChart } from './components/Chart';
import { hospitalApi } from '../../services/api';

const WARD_COLORS = { ICU: '#2563EB', General: '#10B981', Emergency: '#EF4444', Private: '#8B5CF6' };
const DEFAULT_COLOR = '#6B7280';

const statusMap = { Available: 'badge-success', 'Almost Full': 'badge-warning', Full: 'badge-danger' };

function getStatus(occupied, total) {
  if (total === 0) return 'Available';
  const pct = occupied / total;
  if (pct >= 1) return 'Full';
  if (pct >= 0.8) return 'Almost Full';
  return 'Available';
}

export default function BedManagement() {
  const [beds,    setBeds]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState([]);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');

  const fetchBeds = useCallback(() => {
    setLoading(true);
    hospitalApi.getBeds()
      .then((d) => setBeds(d.beds))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBeds(); }, [fetchBeds]);

  const startEdit = () => {
    setDraft(beds.length > 0 ? beds.map((b) => ({ ...b })) : [
      { type: 'ICU',       total: 20, occupied: 0, color: '#2563EB' },
      { type: 'General',   total: 60, occupied: 0, color: '#10B981' },
      { type: 'Emergency', total: 15, occupied: 0, color: '#EF4444' },
      { type: 'Private',   total: 25, occupied: 0, color: '#8B5CF6' },
    ]);
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const d = await hospitalApi.updateBeds({ beds: draft.map((b) => ({ type: b.type, total: +b.total, occupied: +b.occupied, color: b.color || DEFAULT_COLOR })) });
      setBeds(d.beds);
      setEditing(false);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const updateDraft = (idx, key, val) => setDraft((d) => d.map((b, i) => i === idx ? { ...b, [key]: val } : b));
  const addRow  = () => setDraft((d) => [...d, { type: '', total: 0, occupied: 0, color: DEFAULT_COLOR }]);
  const removeRow = (idx) => setDraft((d) => d.filter((_, i) => i !== idx));

  const displayBeds = beds.map((b) => ({ ...b, available: b.total - b.occupied, status: getStatus(b.occupied, b.total) }));
  const filtered = displayBeds.filter((r) =>
    r.type.toLowerCase().includes(search.toLowerCase()) ||
    getStatus(r.occupied, r.total).toLowerCase().includes(search.toLowerCase())
  );

  const donutData = displayBeds.map((b) => ({
    label: b.type,
    value: b.occupied,
    color: b.color || WARD_COLORS[b.type] || DEFAULT_COLOR,
  }));

  const columns = [
    {
      key: 'type', label: 'Bed Type',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: row.color || WARD_COLORS[v] || DEFAULT_COLOR }} />
          <strong>{v}</strong>
        </div>
      ),
    },
    { key: 'total',     label: 'Total Beds' },
    { key: 'occupied',  label: 'Occupied',  render: (v) => <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{v}</span> },
    { key: 'available', label: 'Available', render: (v) => <span style={{ fontWeight: 700, color: 'var(--success)' }}>{v}</span> },
    {
      key: 'type', label: 'Occupancy',
      render: (_, row) => {
        const pct = row.total > 0 ? Math.round((row.occupied / row.total) * 100) : 0;
        return (
          <div style={{ width: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>{pct}%</span>
            </div>
            <div style={{ height: 6, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', borderRadius: 4, background: pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#10B981' }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        );
      },
    },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge ${statusMap[v] || 'badge-neutral'}`}>{v}</span> },
  ];

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1>Bed Management</h1><p>Monitor bed occupancy across all wards</p></div>
        {!editing
          ? <button className="btn btn-primary" onClick={startEdit}><MdEdit /> Update Beds</button>
          : <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : <><MdSave /> Save</>}</button>
            </div>
        }
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 8 }}>{error}</div>}

      {/* Edit form */}
      {editing && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 14 }}>Edit Bed Data</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {draft.map((row, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 36px', gap: 10, alignItems: 'center' }}>
                <input className="form-control" placeholder="Ward type (e.g. ICU)" value={row.type} onChange={(e) => updateDraft(idx, 'type', e.target.value)} />
                <input type="number" min="0" className="form-control" placeholder="Total" value={row.total} onChange={(e) => updateDraft(idx, 'total', e.target.value)} />
                <input type="number" min="0" className="form-control" placeholder="Occupied" value={row.occupied} onChange={(e) => updateDraft(idx, 'occupied', e.target.value)} />
                <button className="btn btn-danger btn-icon" onClick={() => removeRow(idx)} style={{ width: 36, height: 36, padding: 0, justifyContent: 'center' }}><MdDelete /></button>
              </div>
            ))}
            <button className="btn btn-outline btn-sm" onClick={addRow} style={{ alignSelf: 'flex-start' }}><MdAdd /> Add Ward</button>
          </div>
        </div>
      )}

      {beds.length === 0 && !editing ? (
        <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
          <p>No bed data yet. Click <strong>Update Beds</strong> to add ward information.</p>
        </div>
      ) : (
        <>
          <div className="grid-2" style={{ marginBottom: 24 }}>
            {donutData.length > 0 && <DonutChart title="Current Bed Occupancy" subtitle="Occupied beds by ward" segments={donutData} size={150} />}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <h3 style={{ fontSize: '.95rem', fontWeight: 700 }}>Summary</h3>
              {displayBeds.map((row) => (
                <div key={row.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: '.85rem', fontWeight: 600, minWidth: 90 }}>{row.type}</span>
                  <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', borderRadius: 4, background: row.color || WARD_COLORS[row.type] || DEFAULT_COLOR }}
                      initial={{ width: 0 }}
                      animate={{ width: `${row.total > 0 ? (row.occupied / row.total) * 100 : 0}%` }}
                      transition={{ duration: 0.8, delay: 0.1 }}
                    />
                  </div>
                  <span style={{ fontSize: '.78rem', color: 'var(--text-muted)', minWidth: 60, textAlign: 'right' }}>{row.occupied}/{row.total}</span>
                </div>
              ))}
            </div>
          </div>
          <Table
            title="Bed Availability"
            columns={columns}
            rows={filtered}
            toolbar={<div className="tbl-search"><MdSearch className="si" /><input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>}
          />
        </>
      )}
    </div>
  );
}
