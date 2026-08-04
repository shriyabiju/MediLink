import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdSearch } from 'react-icons/md';
import Table from './components/Table';
import { DonutChart } from './components/Chart';

const INITIAL = [
  { id: 1, type: 'ICU',       total: 20, occupied: 18, available: 2,  status: 'Almost Full' },
  { id: 2, type: 'General',   total: 60, occupied: 42, available: 18, status: 'Available'   },
  { id: 3, type: 'Emergency', total: 15, occupied: 12, available: 3,  status: 'Almost Full' },
  { id: 4, type: 'Private',   total: 25, occupied: 15, available: 10, status: 'Available'   },
];

const statusMap = { Available: 'badge-success', 'Almost Full': 'badge-warning', Full: 'badge-danger' };

const donutData = [
  { label: 'ICU',       value: 18, color: '#2563EB' },
  { label: 'General',   value: 42, color: '#10B981' },
  { label: 'Emergency', value: 12, color: '#EF4444' },
  { label: 'Private',   value: 15, color: '#8B5CF6' },
];

export default function BedManagement() {
  const [search, setSearch] = useState('');

  const filtered = INITIAL.filter((r) =>
    r.type.toLowerCase().includes(search.toLowerCase()) ||
    r.status.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: 'type', label: 'Bed Type',
      render: (v) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: { ICU: '#2563EB', General: '#10B981', Emergency: '#EF4444', Private: '#8B5CF6' }[v] || '#ccc'
          }} />
          <strong>{v}</strong>
        </div>
      ),
    },
    { key: 'total',     label: 'Total Beds' },
    { key: 'occupied',  label: 'Occupied', render: (v) => <span style={{ fontWeight: 700, color: 'var(--danger)' }}>{v}</span> },
    { key: 'available', label: 'Available', render: (v) => <span style={{ fontWeight: 700, color: 'var(--success)' }}>{v}</span> },
    {
      key: 'type', label: 'Occupancy',
      render: (_, row) => {
        const pct = Math.round((row.occupied / row.total) * 100);
        return (
          <div style={{ width: 120 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>{pct}%</span>
            </div>
            <div style={{ height: 6, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', borderRadius: 4, background: pct > 90 ? '#EF4444' : pct > 70 ? '#F59E0B' : '#10B981' }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        );
      },
    },
    { key: 'status', label: 'Status', render: (v) => <span className={`badge ${statusMap[v] || 'badge-neutral'}`}>{v}</span> },
  ];

  return (
    <div>
      <div className="page-header">
        <div><h1>Bed Management</h1><p>Monitor bed occupancy across all wards</p></div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <DonutChart title="Current Bed Occupancy" subtitle="Occupied beds by ward" segments={donutData} size={150} />
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontSize: '.95rem', fontWeight: 700 }}>Summary</h3>
          {INITIAL.map((row) => (
            <div key={row.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: '.85rem', fontWeight: 600, minWidth: 90 }}>{row.type}</span>
              <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', borderRadius: 4, background: { ICU: '#2563EB', General: '#10B981', Emergency: '#EF4444', Private: '#8B5CF6' }[row.type] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(row.occupied / row.total) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                />
              </div>
              <span style={{ fontSize: '.78rem', color: 'var(--text-muted)', minWidth: 60, textAlign: 'right' }}>{row.occupied}/{row.total}</span>
            </div>
          ))}
        </div>
      </div>

      <Table
        title="Bed Availability"
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
