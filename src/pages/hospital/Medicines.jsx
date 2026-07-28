import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import Table from './components/Table';

const INITIAL = [
  { id: 1, name: 'Epinephrine',  category: 'Emergency',    qty: 8,   expiry: '2025-03-01', status: 'Critical' },
  { id: 2, name: 'Morphine',     category: 'Analgesic',    qty: 45,  expiry: '2025-09-15', status: 'Available' },
  { id: 3, name: 'Amoxicillin',  category: 'Antibiotic',   qty: 120, expiry: '2026-01-20', status: 'Available' },
  { id: 4, name: 'Insulin',      category: 'Hormone',      qty: 30,  expiry: '2024-12-01', status: 'Low Stock' },
  { id: 5, name: 'Paracetamol',  category: 'Analgesic',    qty: 200, expiry: '2026-06-10', status: 'Available' },
  { id: 6, name: 'Metformin',    category: 'Antidiabetic', qty: 18,  expiry: '2025-11-05', status: 'Low Stock' },
  { id: 7, name: 'Ceftriaxone',  category: 'Antibiotic',   qty: 55,  expiry: '2026-03-22', status: 'Available' },
];

const statusMap = { Available: 'badge-success', 'Low Stock': 'badge-warning', Critical: 'badge-danger' };
const EMPTY = { name: '', category: '', qty: '', expiry: '', status: 'Available' };

export default function Medicines() {
  const [data, setData]       = useState(INITIAL);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(EMPTY);
  const [editing, setEditing] = useState(null);

  const filtered = data.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase()) ||
           r.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (row) => { setForm({ name: row.name, category: row.category, qty: row.qty, expiry: row.expiry, status: row.status }); setEditing(row.id); setModal(true); };
  const handleDelete = (id) => setData((d) => d.filter((r) => r.id !== id));

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) {
      setData((d) => d.map((r) => r.id === editing ? { ...r, ...form, qty: +form.qty } : r));
    } else {
      setData((d) => [...d, { id: Date.now(), ...form, qty: +form.qty }]);
    }
    setModal(false);
  };

  const columns = [
    { key: 'name',     label: 'Medicine Name', render: (v) => <strong>{v}</strong> },
    { key: 'category', label: 'Category' },
    { key: 'qty',      label: 'Quantity' },
    { key: 'expiry',   label: 'Expiry Date' },
    { key: 'status',   label: 'Status', render: (v) => <span className={`badge ${statusMap[v] || 'badge-neutral'}`}>{v}</span> },
    {
      key: 'id', label: 'Actions',
      render: (_, row) => (
        <div className="action-btns">
          <motion.button className="btn btn-outline btn-sm btn-icon" whileHover={{ scale: 1.1 }} onClick={() => openEdit(row)}><MdEdit /></motion.button>
          <motion.button className="btn btn-danger btn-sm btn-icon" whileHover={{ scale: 1.1 }} onClick={() => handleDelete(row.id)}><MdDelete /></motion.button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div><h1>Medicine Inventory</h1><p>Track and manage pharmaceutical stock</p></div>
        <motion.button className="btn btn-primary" onClick={openAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <MdAdd /> Add Medicine
        </motion.button>
      </div>

      <Table
        title="Medicine Stock"
        columns={columns}
        rows={filtered}
        toolbar={
          <div className="tbl-search">
            <MdSearch className="si" />
            <input placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        }
      />

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
                  <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Add Medicine'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
