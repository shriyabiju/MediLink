import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import Table from './components/Table';
import { hospitalApi } from '../../services/api';

const statusMap = { Available: 'badge-success', 'Low Stock': 'badge-warning', Critical: 'badge-danger' };
const EMPTY = { name: '', category: '', qty: '', expiry: '', status: 'Available' };

export default function Medicines() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [saving,  setSaving]  = useState(false);

  const fetchMedicines = useCallback(() => {
    setLoading(true);
    hospitalApi.getMedicines()
      .then((d) => setData(d.medicines))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  const filtered = data.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase()) ||
           r.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (row) => {
    setForm({ name: row.name, category: row.category, qty: row.qty, expiry: row.expiry || '', status: row.status });
    setEditing(row._id);
    setModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this medicine?')) return;
    try { await hospitalApi.deleteMedicine(id); fetchMedicines(); }
    catch (e) { alert(e.message); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await hospitalApi.updateMedicine(editing, { ...form, qty: +form.qty });
      else         await hospitalApi.createMedicine({ ...form, qty: +form.qty });
      setModal(false);
      fetchMedicines();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'name',     label: 'Medicine Name', render: (v) => <strong>{v}</strong> },
    { key: 'category', label: 'Category' },
    { key: 'qty',      label: 'Quantity' },
    { key: 'expiry',   label: 'Expiry Date', render: (v) => v || '—' },
    { key: 'status',   label: 'Status', render: (v) => <span className={`badge ${statusMap[v] || 'badge-neutral'}`}>{v}</span> },
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
        <div><h1>Medicine Inventory</h1><p>Track and manage pharmaceutical stock</p></div>
        <motion.button className="btn btn-primary" onClick={openAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}><MdAdd /> Add Medicine</motion.button>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 8 }}>{error}</div>}

      {loading ? <div className="spinner-wrap"><div className="spinner" /></div> : (
        <Table title="Medicine Stock" columns={columns} rows={filtered}
          toolbar={<div className="tbl-search"><MdSearch className="si" /><input placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>}
        />
      )}

      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}>
            <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editing ? 'Edit Medicine' : 'Add Medicine'}</h3>
                <button className="modal-close" onClick={() => setModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group full">
                      <label className="form-label">Medicine Name <span className="req">*</span></label>
                      <input className="form-control" placeholder="e.g. Amoxicillin" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category <span className="req">*</span></label>
                      <select className="form-control form-control-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                        <option value="">Select</option>
                        {['Antibiotic','Analgesic','Emergency','Hormone','Antidiabetic','Antiviral','Other'].map((c) => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quantity <span className="req">*</span></label>
                      <input type="number" min="0" className="form-control" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Expiry Date</label>
                      <input type="date" className="form-control" value={form.expiry} onChange={(e) => setForm({ ...form, expiry: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-control form-control-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option>Available</option><option>Low Stock</option><option>Critical</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Medicine'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
