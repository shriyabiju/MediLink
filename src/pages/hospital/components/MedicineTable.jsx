import React, { useState } from 'react';
import '../css/tables.css';

const initialData = [
  { id: 1, name: 'Epinephrine',    category: 'Emergency',    stock: 8,   unit: 'vials',  expiryDate: '2025-03-01', status: 'Critical' },
  { id: 2, name: 'Morphine',       category: 'Analgesic',    stock: 45,  unit: 'ampoules', expiryDate: '2025-09-15', status: 'Available' },
  { id: 3, name: 'Amoxicillin',    category: 'Antibiotic',   stock: 120, unit: 'capsules', expiryDate: '2026-01-20', status: 'Available' },
  { id: 4, name: 'Insulin',        category: 'Hormone',      stock: 30,  unit: 'vials',  expiryDate: '2024-12-01', status: 'Low' },
  { id: 5, name: 'Paracetamol',    category: 'Analgesic',    stock: 200, unit: 'tablets', expiryDate: '2026-06-10', status: 'Available' },
  { id: 6, name: 'Metformin',      category: 'Antidiabetic', stock: 18,  unit: 'tablets', expiryDate: '2025-11-05', status: 'Low' },
];

const statusBadge = {
  Available: 'badge-success',
  Low:       'badge-warning',
  Critical:  'badge-danger',
};

export default function MedicineTable() {
  const [search, setSearch] = useState('');

  const filtered = initialData.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <h2>Medicines</h2>
        <div className="table-actions">
          <div className="table-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="search"
              placeholder="Search medicines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus"></i> Add Medicine
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Medicine Name</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Unit</th>
            <th>Expiry Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((med, idx) => (
            <tr key={med.id}>
              <td>{idx + 1}</td>
              <td><strong>{med.name}</strong></td>
              <td>{med.category}</td>
              <td>{med.stock}</td>
              <td>{med.unit}</td>
              <td>{med.expiryDate}</td>
              <td>
                <span className={`badge ${statusBadge[med.status] || 'badge-neutral'}`}>
                  {med.status}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-outline btn-sm">
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button className="btn btn-danger btn-sm">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                No medicines found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
