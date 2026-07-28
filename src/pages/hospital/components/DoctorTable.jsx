import React, { useState } from 'react';
import '../css/tables.css';

const initialData = [
  { id: 1, name: 'Dr. Sarah Mitchell',  specialization: 'Cardiology',    department: 'Cardiac Care',  status: 'On Duty',   contact: '+1 555-0101' },
  { id: 2, name: 'Dr. James Okafor',    specialization: 'Neurology',      department: 'Neurosciences', status: 'Off Duty',  contact: '+1 555-0102' },
  { id: 3, name: 'Dr. Priya Nair',      specialization: 'Pediatrics',     department: 'Child Health',  status: 'On Duty',   contact: '+1 555-0103' },
  { id: 4, name: 'Dr. Leo Fernandez',   specialization: 'Orthopedics',    department: 'Bone & Joint',  status: 'On Leave',  contact: '+1 555-0104' },
  { id: 5, name: 'Dr. Aisha Kamara',    specialization: 'Emergency Med',  department: 'Emergency',     status: 'On Duty',   contact: '+1 555-0105' },
];

const statusBadge = {
  'On Duty':  'badge-success',
  'Off Duty': 'badge-neutral',
  'On Leave': 'badge-warning',
};

export default function DoctorTable() {
  const [search, setSearch] = useState('');

  const filtered = initialData.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.specialization.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <h2>Doctors</h2>
        <div className="table-actions">
          <div className="table-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="search"
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus"></i> Add Doctor
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Specialization</th>
            <th>Department</th>
            <th>Status</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((doc, idx) => (
            <tr key={doc.id}>
              <td>{idx + 1}</td>
              <td><strong>{doc.name}</strong></td>
              <td>{doc.specialization}</td>
              <td>{doc.department}</td>
              <td>
                <span className={`badge ${statusBadge[doc.status] || 'badge-neutral'}`}>
                  {doc.status}
                </span>
              </td>
              <td>{doc.contact}</td>
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
              <td colSpan={7} style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                No doctors found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
