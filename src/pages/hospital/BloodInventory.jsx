import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdSearch } from 'react-icons/md';
import Table from './components/Table';

const INITIAL = [
  { id: 1, group: 'A+',  units: 45, status: 'Available',  updated: '2024-07-20' },
  { id: 2, group: 'A-',  units: 12, status: 'Low Stock',   updated: '2024-07-20' },
  { id: 3, group: 'B+',  units: 30, status: 'Available',  updated: '2024-07-19' },
  { id: 4, group: 'B-',  units: 5,  status: 'Out of Stock', updated: '2024-07-19' },
  { id: 5, group: 'O+',  units: 60, status: 'Available',  updated: '2024-07-21' },
  { id: 6, group: 'O-',  units: 3,  status: 'Out of Stock', updated: '2024-07-21' },
  { id: 7, group: 'AB+', units: 20, status: 'Available',  updated: '2024-07-18' },
  { id: 8, group: 'AB-', units: 8,  status: 'Low Stock',   updated: '2024-07-18' },
];

const statusMap = { Available: 'badge-success', 'Low Stock': 'badge-warning', 'Out of Stock': 'badge-danger' };

const EMPTY_FORM = { group: '', units: '', status: 'Available' };

export default function BloodInventory() {
  const [data, setData]       = useState(INITIAL);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(EMPTY_FORM);
  const [editing, setEditing] = useState(null);

  const filtered = data.filter(
    (r) => r.group.toLowerCase().includes(search.toLowerCase()) || r.status.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm(EMPTY_FORM); setEditing(null); setModal(true); };
  const openEdit = (row) => { setForm({ group: row.group, units: row.units, status: row.status }); setEditing(row.id); setModal(true); };
  const handleDelete = (id) => setData((d) => d.filter((r) => r.id !== id));

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) {
      setData((d) => d.map((r) => r.id === editing ? { ...r, ...form, units: +form.units, updated: new Date().toISOString().slice(0, 10) } : r));
    } else {
      setData((d) => [...d, { id: Date.now(), ...form, units: +form.units, updated: new Date().toISOString().slice(0, 10) }]);
    }
    setModal(false);
  };

  const columns = [
    { key: 'group',   label: 'Blood Group', render: (v) => <strong style={{ fontSize: '1rem', color: 'var(--danger)' }}>{v}</strong> },
    { key: 'units',   label: 'Units Available' },
    { key: 'status',  label: 'Status', render: (v) => <span className={`badge ${statusMap[v] || 'badge-neutral'}`}>{v}</span> },
    { key: 'updated', label: 'Last Updated' },
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
        <div><h1>Blood Inventory</h1><p>Manage and monitor blood stock levels</p></div>
        <motion.button className="btn btn-primary" onClick={openAdd} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <MdAdd /> Add Blood Stock
        </motion.button>
      </div>

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

      {/* Modal */}
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
                      <select className="form-control form-control-select" value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} required>
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
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editing ? 'Save Changes' : 'Add Stock'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
