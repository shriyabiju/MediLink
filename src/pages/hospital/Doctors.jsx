import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import Table from './components/Table';
import { hospitalApi } from '../../services/api';

const statusMap = { Available: 'badge-success', Busy: 'badge-warning', 'On Leave': 'badge-neutral' };
const EMPTY = { name: '', dept: '', spec: '', shift: 'Morning', status: 'Available', phone: '' };

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('');
}

export default function Doctors() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);

  const fetchDoctors = useCallback(() => {
    setLoading(true);
    hospitalApi.getDoctors()
      .then((d) => setData(d.doctors))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDoctors(); }, [fetchDoctors]);

  const filtered = data.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase()) ||
           r.dept.toLowerCase().includes(search.toLowerCase()) ||
           (r.spec || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (row) => {
    setForm({ name: row.name, dept: row.dept, spec: row.spec || '', shift: row.shift, status: row.status, phone: row.phone || '' });
    setEditing(row._id);
    setModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this doctor?')) return;
    try { await hospitalApi.deleteDoctor(id); fetchDoctors(); }
    catch (e) { alert(e.message); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await hospitalApi.updateDoctor(editing, form);
      else         await hospitalApi.createDoctor(form);
      setModal(false);
      fetchDoctors();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const columns = [
    {
      key: 'name', label: 'Doctor Name',
      render: (v) => (
        <div className="td-avatar">
          <div className="td-avatar-initials">{initials(v)}</div>
          <div><p className="td-name">{v}</p></div>
        </div>
      ),
    },
    { key: 'dept',   label: 'Department' },
    { key: 'spec',   label: 'Specialization' },
    { key: 'shift',  label: 'Shift' },
    { key: 'status', label: 'Availability', render: (v) => <span className={`badge ${statusMap[v] || 'badge-neutral'}`}>{v}</span> },
    { key: 'phone',  label: 'Phone' },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div className="action-btns">
          <motion.button className="btn btn-outline btn-sm btn-icon" whileHover={{ scale: 1.1 }} onClick={() => openEdit(row)}><MdEdit /></motion.button>
          <motion.button className="btn btn-danger  btn-sm btn-icon" whileHover={{ scale: 1.1 }} onClick={() => handleDelete(row._id)}><MdDelete /></motion.button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div><h1>Doctors</h1><p>Manage hospital medical staff</p></div>
        <motion.button className="btn btn-primary" onClick={openAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><MdAdd /> Add Doctor</motion.button>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 8 }}>{error}</div>}

      {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
        <Table title="Medical Staff" columns={columns} rows={filtered}
          toolbar={<div className="tbl-search"><MdSearch className="si" /><input placeholder="Search doctors..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>}
        />
      )}

      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}>
            <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editing ? 'Edit Doctor' : 'Add Doctor'}</h3>
                <button className="modal-close" onClick={() => setModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group full">
                      <label className="form-label">Full Name <span className="req">*</span></label>
                      <input className="form-control" placeholder="Dr. Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department <span className="req">*</span></label>
                      <input className="form-control" placeholder="e.g. Cardiology" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Specialization</label>
                      <input className="form-control" placeholder="e.g. Heart Surgery" value={form.spec} onChange={(e) => setForm({ ...form, spec: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Shift</label>
                      <select className="form-control form-control-select" value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}>
                        <option>Morning</option><option>Evening</option><option>Night</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-control form-control-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option>Available</option><option>Busy</option><option>On Leave</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input type="tel" className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Doctor'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
