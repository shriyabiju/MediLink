import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import Table from './components/Table';
import { hospitalApi } from '../../services/api';

const statusMap = { Available: 'badge-success', 'Low Stock': 'badge-warning', 'Out of Stock': 'badge-danger' };
const EMPTY_FORM = { group: '', units: '', status: 'Available', pricePerUnit: 0 };

export default function BloodInventory() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null); // stores the record _id
  const [saving,  setSaving]  = useState(false);

  const fetchStock = useCallback(() => {
    setLoading(true);
    hospitalApi.getBloodStock()
      .then((d) => setData(d.stock || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const filtered = data.filter(
    (r) => r.group.toLowerCase().includes(search.toLowerCase()) ||
           r.status.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm(EMPTY_FORM); setEditing(null); setModal(true); };
  const openEdit = (row) => {
    setForm({ group: row.group, units: row.units, status: row.status, pricePerUnit: row.pricePerUnit || 0 });
    setEditing(row._id);
    setModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this blood stock entry?')) return;
    try {
      await hospitalApi.deleteBloodStock(id);
      fetchStock();
    } catch (e) { alert(e.message); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await hospitalApi.upsertBloodStock({ group: form.group, units: +form.units, status: form.status, pricePerUnit: +form.pricePerUnit });
      setModal(false);
      fetchStock();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const columns = [
    { key: 'group',      label: 'Blood Group',    render: (v) => <strong style={{ fontSize: '1rem', color: 'var(--danger)' }}>{v}</strong> },
    { key: 'units',      label: 'Units Available' },
    { key: 'pricePerUnit', label: 'Price / Unit', render: (v) => v > 0 ? `₹${v}` : <span style={{ color: 'var(--text-muted)' }}>Not set</span> },
    { key: 'status',     label: 'Status',         render: (v) => <span className={`badge ${statusMap[v] || 'badge-neutral'}`}>{v}</span> },
    { key: 'updatedAt',  label: 'Last Updated',   render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
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
        <div><h1>Blood Inventory</h1><p>Manage and monitor blood stock levels</p></div>
        <motion.button className="btn btn-primary" onClick={openAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <MdAdd /> Add Blood Stock
        </motion.button>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 8 }}>{error}</div>}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <Table
          title="Blood Stock"
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

      <AnimatePresence>
        {modal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModal(false)}>
            <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editing ? 'Edit Blood Stock' : 'Add Blood Stock'}</h3>
                <button className="modal-close" onClick={() => setModal(false)}>✕</button>
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Blood Group <span className="req">*</span></label>
                      <select className="form-control form-control-select" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} required disabled={!!editing}>
                        <option value="">Select</option>
                        {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map((g) => <option key={g}>{g}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Units <span className="req">*</span></label>
                      <input type="number" min="0" className="form-control" value={form.units} onChange={(e) => setForm({ ...form, units: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select className="form-control form-control-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                        <option>Available</option><option>Low Stock</option><option>Out of Stock</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price per Unit (₹)</label>
                      <input type="number" min="0" className="form-control" placeholder="0 = not set" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: +e.target.value })} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Stock'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
