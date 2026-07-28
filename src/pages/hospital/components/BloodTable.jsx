import React, { useState } from 'react';
import '../css/tables.css';

const initialData = [
  { id: 1, bloodType: 'A+',  units: 45, status: 'Available',    lastUpdated: '2024-07-20' },
  { id: 2, bloodType: 'A-',  units: 12, status: 'Low',          lastUpdated: '2024-07-20' },
  { id: 3, bloodType: 'B+',  units: 30, status: 'Available',    lastUpdated: '2024-07-19' },
  { id: 4, bloodType: 'B-',  units: 5,  status: 'Critical',     lastUpdated: '2024-07-19' },
  { id: 5, bloodType: 'O+',  units: 60, status: 'Available',    lastUpdated: '2024-07-21' },
  { id: 6, bloodType: 'O-',  units: 3,  status: 'Critical',     lastUpdated: '2024-07-21' },
  { id: 7, bloodType: 'AB+', units: 20, status: 'Available',    lastUpdated: '2024-07-18' },
  { id: 8, bloodType: 'AB-', units: 8,  status: 'Low',          lastUpdated: '2024-07-18' },
];

const statusBadge = {
  Available: 'badge-success',
  Low:       'badge-warning',
  Critical:  'badge-danger',
};

export default function BloodTable() {
  const [search, setSearch] = useState('');

  const filtered = initialData.filter((row) =>
    row.bloodType.toLowerCase().includes(search.toLowerCase()) ||
    row.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <h2>Blood Inventory</h2>
        <div className="table-actions">
          <div className="table-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus"></i> Add Stock
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Blood Type</th>
            <th>Units Available</th>
            <th>Status</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row, idx) => (
            <tr key={row.id}>
              <td>{idx + 1}</td>
              <td><strong>{row.bloodType}</strong></td>
              <td>{row.units}</td>
              <td>
                <span className={`badge ${statusBadge[row.status] || 'badge-neutral'}`}>
                  {row.status}
                </span>
              </td>
              <td>{row.lastUpdated}</td>
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
              <td colSpan={6} style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
