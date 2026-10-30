import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MdSearch, MdCheck, MdClose, MdDone, MdAdd } from 'react-icons/md';
import Table from './components/Table';
import { hospitalApi, bloodRequestApi } from '../../services/api';

const priorityMap = { Critical: 'badge-danger', High: 'badge-warning', Medium: 'badge-info', Low: 'badge-neutral' };
const statusMap   = { open: 'badge-warning', partially_filled: 'badge-info', fulfilled: 'badge-success', cancelled: 'badge-neutral' };
const statusLabel = { open: 'Open', partially_filled: 'Partial', fulfilled: 'Fulfilled', cancelled: 'Cancelled' };

const EMPTY_FORM = { hospitalName: '', hospitalCity: '', bloodGroup: 'A+', unitsNeeded: 1, urgency: 'Medium', notes: '' };

export default function EmergencyRequests() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('All');
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [saving,  setSaving]  = useState(false);

  const fetchRequests = useCallback(() => {
    setLoading(true);
    hospitalApi.getRequests(filter !== 'All' ? filter : '')
      .then((d) => setData(d.requests || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const updateStatus = async (id, status) => {
    try {
      await hospitalApi.updateRequestStatus(id, status);
      fetchRequests();
    } catch (e) { alert(e.message); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await bloodRequestApi.create(form);
      setModal(false);
      setForm(EMPTY_FORM);
      fetchRequests();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const filtered = data.filter((r) =>
    (r.hospitalName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.bloodGroup   || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'hospitalName', label: 'Hospital',    render: (v) => <strong>{v}</strong> },
    { key: 'bloodGroup',   label: 'Blood Group', render: (v) => <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{v}</span> },
    { key: 'unitsNeeded',  label: 'Units',       render: (v, r) => `${r.unitsFilled || 0}/${v}` },
    { key: 'urgency',      label: 'Priority',    render: (v) => <span className={`badge ${priorityMap[v] || 'badge-neutral'}`}>{v}</span> },
    { key: 'createdAt',    label: 'Time',        render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
    { key: 'status',       label: 'Status',      render: (v) => <span className={`badge ${statusMap[v] || 'badge-neutral'}`}>{statusLabel[v] || v}</span> },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="action-btns">
          {row.status === 'open' && (
            <motion.button className="btn btn-success btn-sm" whileHover={{ scale: 1.05 }} onClick={() => updateStatus(row._id, 'fulfilled')}>
              <MdDone /> Fulfill
            </motion.button>
          )}
          {(row.status === 'open' || row.status === 'partially_filled') && (
            <motion.button className="btn btn-danger btn-sm btn-icon" whileHover={{ scale: 1.1 }} onClick={() => updateStatus(row._id, 'cancelled')}>
              <MdClose />
            </motion.button>
          )}
          {(row.status === 'fulfilled' || row.status === 'cancelled') && (
            <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>—</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div><h1>Emergency Requests</h1><p>Manage blood requests and emergency cases</p></div>
        <motion.button className="btn btn-primary" onClick={() => setModal(true)} whileHover={{ scale: 1.03 }}>
          <MdAdd /> New Request
        </motion.button>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 8 }}>{error}</div>}

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {['All', 'open', 'partially_filled', 'fulfilled', 'cancelled'].map((s) => (
          <motion.button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(s)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            {s === 'All' ? 'All' : statusLabel[s]}
          </motion.button>
        ))}
      </div>

      {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
        <Table
          title="Blood / Emergency Requests"
          columns={columns}
          rows={filtered}
          toolbar={
            <div className="tbl-search">
              <MdSearch className="si" />
              <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          }
        />
      )}

      {/* New request modal */}
      {modal && (
        <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}>
          <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Blood Request</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">Hospital Name <span className="req">*</span></label>
                    <input className="form-control" value={form.hospitalName} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-control" value={form.hospitalCity} onChange={(e) => setForm({ ...form, hospitalCity: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Blood Group <span className="req">*</span></label>
                    <select className="form-control form-control-select" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} required>
                      {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map((g) => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Units Needed <span className="req">*</span></label>
                    <input type="number" min="1" className="form-control" value={form.unitsNeeded} onChange={(e) => setForm({ ...form, unitsNeeded: +e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Urgency</label>
                    <select className="form-control form-control-select" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                      <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                    </select>
                  </div>
                  <div className="form-group full">
                    <label className="form-label">Notes</label>
                    <textarea className="form-control" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Posting…' : 'Post Request'}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
