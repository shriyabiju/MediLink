import React, { useState } from 'react';
import '../css/tables.css';

const initialData = [
  { id: 1, bedNo: 'ICU-01', ward: 'ICU',        type: 'ICU',          status: 'Occupied',    patient: 'John Doe',      admittedOn: '2024-07-18' },
  { id: 2, bedNo: 'ICU-02', ward: 'ICU',        type: 'ICU',          status: 'Available',   patient: '—',             admittedOn: '—' },
  { id: 3, bedNo: 'GW-05',  ward: 'General',    type: 'General',      status: 'Occupied',    patient: 'Mary Smith',    admittedOn: '2024-07-20' },
  { id: 4, bedNo: 'GW-06',  ward: 'General',    type: 'General',      status: 'Available',   patient: '—',             admittedOn: '—' },
  { id: 5, bedNo: 'EM-01',  ward: 'Emergency',  type: 'Emergency',    status: 'Occupied',    patient: 'Carlos Reyes',  admittedOn: '2024-07-21' },
  { id: 6, bedNo: 'MTW-03', ward: 'Maternity',  type: 'Maternity',    status: 'Maintenance', patient: '—',             admittedOn: '—' },
  { id: 7, bedNo: 'PED-02', ward: 'Pediatrics', type: 'Pediatric',    status: 'Available',   patient: '—',             admittedOn: '—' },
];

const statusBadge = {
  Available:   'badge-success',
  Occupied:    'badge-danger',
  Maintenance: 'badge-warning',
};

export default function BedTable() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = initialData.filter((b) => {
    const matchSearch =
      b.bedNo.toLowerCase().includes(search.toLowerCase()) ||
      b.ward.toLowerCase().includes(search.toLowerCase()) ||
      b.patient.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <h2>Bed Management</h2>
        <div className="table-actions">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '7px 12px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '0.82rem' }}
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          <div className="table-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="search"
              placeholder="Search beds..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus"></i> Add Bed
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Bed No.</th>
            <th>Ward</th>
            <th>Type</th>
            <th>Status</th>
            <th>Patient</th>
            <th>Admitted On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((bed, idx) => (
            <tr key={bed.id}>
              <td>{idx + 1}</td>
              <td><strong>{bed.bedNo}</strong></td>
              <td>{bed.ward}</td>
              <td>{bed.type}</td>
              <td>
                <span className={`badge ${statusBadge[bed.status] || 'badge-neutral'}`}>
                  {bed.status}
                </span>
              </td>
              <td>{bed.patient}</td>
              <td>{bed.admittedOn}</td>
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
                No beds found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
