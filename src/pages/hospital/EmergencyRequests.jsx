import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdSearch, MdCheck, MdClose, MdDone } from 'react-icons/md';
import Table from './components/Table';

const INITIAL = [
  { id: 1, patient: 'John Kariuki',  service: 'Blood — O-',    blood: 'O-',  priority: 'Critical', time: '2 min ago',   status: 'Pending' },
  { id: 2, patient: 'Mary Wambui',   service: 'ICU Bed',       blood: '—',   priority: 'High',     time: '18 min ago',  status: 'Accepted' },
  { id: 3, patient: 'Carlos Reyes',  service: 'Ambulance',     blood: 'B+',  priority: 'High',     time: '35 min ago',  status: 'Accepted' },
  { id: 4, patient: 'Aisha Okafor',  service: 'Blood — A+',    blood: 'A+',  priority: 'Medium',   time: '1 hr ago',    status: 'Completed' },
  { id: 5, patient: 'Priya Sharma',  service: 'Epinephrine',   blood: '—',   priority: 'Critical', time: '5 min ago',   status: 'Pending' },
  { id: 6, patient: 'Tom Nguyen',    service: 'Surgery Room',  blood: 'AB-', priority: 'High',     time: '50 min ago',  status: 'Completed' },
];

const priorityMap = { Critical: 'badge-danger', High: 'badge-warning', Medium: 'badge-info' };
const statusMap   = { Pending: 'badge-warning', Accepted: 'badge-info', Completed: 'badge-success', Rejected: 'badge-neutral' };

export default function EmergencyRequests() {
  const [data, setData]   = useState(INITIAL);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = data.filter((r) => {
    const matchS = r.patient.toLowerCase().includes(search.toLowerCase()) || r.service.toLowerCase().includes(search.toLowerCase());
    const matchF = filter === 'All' || r.status === filter;
    return matchS && matchF;
  });

  const updateStatus = (id, status) => setData((d) => d.map((r) => r.id === id ? { ...r, status } : r));

  const columns = [
    { key: 'patient',  label: 'Patient Name', render: (v) => <strong>{v}</strong> },
    { key: 'service',  label: 'Required Service' },
    { key: 'blood',    label: 'Blood Group' },
    { key: 'priority', label: 'Priority', render: (v) => <span className={`badge ${priorityMap[v] || 'badge-neutral'}`}>{v}</span> },
    { key: 'time',     label: 'Time' },
    { key: 'status',   label: 'Status', render: (v) => <span className={`badge ${statusMap[v] || 'badge-neutral'}`}>{v}</span> },
    {
      key: 'id', label: 'Actions',
      render: (_, row) => (
        <div className="action-btns">
          {row.status === 'Pending' && (
            <>
              <motion.button className="btn btn-success btn-sm btn-icon" title="Accept" whileHover={{ scale: 1.1 }} onClick={() => updateStatus(row.id, 'Accepted')}><MdCheck /></motion.button>
              <motion.button className="btn btn-danger btn-sm btn-icon" title="Reject" whileHover={{ scale: 1.1 }} onClick={() => updateStatus(row.id, 'Rejected')}><MdClose /></motion.button>
            </>
          )}
          {row.status === 'Accepted' && (
            <motion.button className="btn btn-primary btn-sm" whileHover={{ scale: 1.05 }} onClick={() => updateStatus(row.id, 'Completed')}>
              <MdDone /> Complete
            </motion.button>
          )}
          {(row.status === 'Completed' || row.status === 'Rejected') && (
            <span style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>—</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div><h1>Emergency Requests</h1><p>Review and respond to incoming emergency cases</p></div>
      </div>

      {/* Status summary chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {['All', 'Pending', 'Accepted', 'Completed', 'Rejected'].map((s) => (
          <motion.button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(s)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {s}
            {s !== 'All' && <span style={{ marginLeft: 5, opacity: .7 }}>({data.filter((r) => r.status === s).length})</span>}
          </motion.button>
        ))}
      </div>

      <Table
        title="Emergency Requests"
        columns={columns}
        rows={filtered}
        toolbar={
          <div className="tbl-search">
            <MdSearch className="si" />
            <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        }
      />
    </div>
  );
}
