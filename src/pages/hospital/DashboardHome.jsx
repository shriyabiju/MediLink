import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MdOpacity, MdPeople, MdBedroomParent, MdMedication,
  MdEmergency, MdPersonAdd,
} from 'react-icons/md';
import DashboardCard from './components/DashboardCard';
import { BarChart } from './components/Chart';
import Table from './components/Table';
import { hospitalApi } from '../../services/api';

const BLOOD_COLORS = {
  'A+': '#2563EB', 'A-': '#7C3AED', 'B+': '#0891B2', 'B-': '#DC2626',
  'O+': '#16A34A', 'O-': '#EF4444', 'AB+': '#D97706', 'AB-': '#6B7280',
};

const urgencyBadge = (p) => ({ Critical: 'badge-danger', High: 'badge-warning', Medium: 'badge-info', Low: 'badge-neutral' }[p] || 'badge-neutral');
const statusBadge  = (s) => ({ open: 'badge-warning', partially_filled: 'badge-info', fulfilled: 'badge-success', cancelled: 'badge-neutral' }[s] || 'badge-neutral');
const statusLabel  = { open: 'Pending', partially_filled: 'Partial', fulfilled: 'Fulfilled', cancelled: 'Cancelled' };

const reqColumns = [
  { key: 'hospitalName', label: 'Hospital',    render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
  { key: 'bloodGroup',   label: 'Blood Group', render: (v) => <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{v}</span> },
  { key: 'urgency',      label: 'Priority',    render: (v) => <span className={`badge ${urgencyBadge(v)}`}>{v}</span> },
  { key: 'createdAt',    label: 'Time',        render: (v) => v ? new Date(v).toLocaleDateString() : '—' },
  { key: 'status',       label: 'Status',      render: (v) => <span className={`badge ${statusBadge(v)}`}>{statusLabel[v] || v}</span> },
];

export default function DashboardHome() {
  const [stats,    setStats]    = useState(null);
  const [stock,    setStock]    = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      hospitalApi.getStats(),
      hospitalApi.getBloodStock(),
      hospitalApi.getRequests(),
    ]).then(([s, b, r]) => {
      setStats(s);
      setStock(b.stock);
      setRequests(r.requests.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = stats ? [
    { label: 'Blood Units Available', value: stats.totalBloodUnits,  icon: MdOpacity,       color: 'c-red',    bg: 'bg-red',    trend: '',                   trendType: 'up',   trendLabel: 'in stock' },
    { label: 'Doctors Available',     value: stats.availableDoctors, icon: MdPeople,        color: 'c-blue',   bg: 'bg-blue',   trend: '',                   trendType: 'up',   trendLabel: `of ${stats.totalDoctors} total` },
    { label: 'Total Beds',            value: stats.totalBeds,        icon: MdBedroomParent, color: 'c-green',  bg: 'bg-green',  trend: '',                   trendType: 'up',   trendLabel: 'registered' },
    { label: 'Medicines Available',   value: stats.totalMedicines,   icon: MdMedication,    color: 'c-amber',  bg: 'bg-amber',  trend: `${stats.lowMedicines}`, trendType: 'down', trendLabel: 'low/critical' },
    { label: 'Emergency Requests',    value: stats.pendingRequests,  icon: MdEmergency,     color: 'c-purple', bg: 'bg-purple', trend: '',                   trendType: 'up',   trendLabel: 'pending' },
    { label: 'Total Requests',        value: stats.totalRequests,    icon: MdPersonAdd,     color: 'c-teal',   bg: 'bg-teal',   trend: '',                   trendType: 'up',   trendLabel: 'all time' },
  ] : [];

  const chartData = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((g) => {
    const found = stock.find((s) => s.group === g);
    return { label: g, value: found ? found.units : 0, color: BLOOD_COLORS[g] };
  });

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Here's what's happening at your hospital today.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-cards-grid">
        {STAT_CARDS.map((card, i) => (
          <DashboardCard key={card.label} {...card} delay={i * 0.07} />
        ))}
      </div>

      {/* Blood inventory chart */}
      <div style={{ marginBottom: 24 }}>
        <BarChart title="Blood Inventory" subtitle="Current units by type" data={chartData} height={180} />
      </div>

      {/* Recent requests */}
      {requests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Table
            title="Recent Blood Requests"
            subtitle="Latest requests from this hospital"
            columns={reqColumns}
            rows={requests}
          />
        </motion.div>
      )}

      {requests.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
          <p>No emergency requests yet. Use the Emergency Requests page to post one.</p>
        </div>
      )}
    </div>
  );
}
