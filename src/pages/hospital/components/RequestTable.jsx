import React, { useState } from 'react';
import '../css/tables.css';

const initialData = [
  { id: 1, requestId: 'ER-001', type: 'Blood',     detail: 'O- Blood — 3 units',       requester: 'Trauma Ward',     priority: 'Critical', status: 'Pending',    time: '2 mins ago' },
  { id: 2, requestId: 'ER-002', type: 'Medicine',  detail: 'Epinephrine — 5 vials',    requester: 'ICU',             priority: 'High',     status: 'In Progress', time: '18 mins ago' },
  { id: 3, requestId: 'ER-003', type: 'Ambulance', detail: 'Pickup: 45 Elm St',        requester: 'Patient Intake',  priority: 'High',     status: 'Dispatched', time: '35 mins ago' },
  { id: 4, requestId: 'ER-004', type: 'Blood',     detail: 'A+ Blood — 2 units',       requester: 'Surgery OT',      priority: 'Medium',   status: 'Fulfilled',  time: '1 hr ago' },
  { id: 5, requestId: 'ER-005', type: 'Bed',       detail: 'ICU Bed required',         requester: 'Emergency Dept',  priority: 'Critical', status: 'Pending',    time: '5 mins ago' },
];

const priorityBadge = {
  Critical: 'badge-danger',
  High:     'badge-warning',
  Medium:   'badge-info',
  Low:      'badge-neutral',
};

const statusBadge = {
  Pending:      'badge-warning',
  'In Progress': 'badge-info',
  Dispatched:   'badge-info',
  Fulfilled:    'badge-success',
  Cancelled:    'badge-neutral',
};

export default function RequestTable() {
  const [search, setSearch] = useState('');

  const filtered = initialData.filter(
    (r) =>
      r.requestId.toLowerCase().includes(search.toLowerCase()) ||
      r.type.toLowerCase().includes(search.toLowerCase()) ||
      r.requester.toLowerCase().includes(search.toLowerCase()) ||
      r.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="table-container">
      <div className="table-toolbar">
        <h2>Emergency Requests</h2>
        <div className="table-actions">
          <div className="table-search">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="search"
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm">
            <i className="fa-solid fa-plus"></i> New Request
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Type</th>
            <th>Details</th>
            <th>Requester</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((req) => (
            <tr key={req.id}>
              <td><strong>{req.requestId}</strong></td>
              <td>{req.type}</td>
              <td>{req.detail}</td>
              <td>{req.requester}</td>
              <td>
                <span className={`badge ${priorityBadge[req.priority] || 'badge-neutral'}`}>
                  {req.priority}
                </span>
              </td>
              <td>
                <span className={`badge ${statusBadge[req.status] || 'badge-neutral'}`}>
                  {req.status}
                </span>
              </td>
              <td>{req.time}</td>
              <td>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-outline btn-sm" title="View">
                    <i className="fa-solid fa-eye"></i>
                  </button>
                  <button className="btn btn-primary btn-sm" title="Fulfill">
                    <i className="fa-solid fa-check"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', color: '#94A3B8', padding: '24px' }}>
                No requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
