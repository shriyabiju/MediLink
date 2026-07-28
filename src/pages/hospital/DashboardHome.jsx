import React from 'react';
import { motion } from 'framer-motion';
import {
  MdOpacity, MdPeople, MdBedroomParent, MdMedication,
  MdEmergency, MdPersonAdd,
} from 'react-icons/md';
import DashboardCard from './components/DashboardCard';
import { BarChart, DonutChart } from './components/Chart';
import Table from './components/Table';

const STAT_CARDS = [
  { label: 'Blood Units Available', value: 183,  icon: MdOpacity,       color: 'c-red',    bg: 'bg-red',    trend: '+12',  trendType: 'up',   trendLabel: 'vs last week' },
  { label: 'Doctors Available',     value: 24,   icon: MdPeople,        color: 'c-blue',   bg: 'bg-blue',   trend: '3',    trendType: 'up',   trendLabel: 'on duty now'  },
  { label: 'Beds Available',        value: 25,   icon: MdBedroomParent, color: 'c-green',  bg: 'bg-green',  trend: '8',    trendType: 'down', trendLabel: 'vs yesterday' },
  { label: 'Medicines Available',   value: 421,  icon: MdMedication,    color: 'c-amber',  bg: 'bg-amber',  trend: '3',    trendType: 'down', trendLabel: 'expiring soon'},
  { label: 'Emergency Requests',    value: 5,    icon: MdEmergency,     color: 'c-purple', bg: 'bg-purple', trend: '2',    trendType: 'up',   trendLabel: 'pending'      },
  { label: "Today's Admissions",    value: 87,   icon: MdPersonAdd,     color: 'c-teal',   bg: 'bg-teal',   trend: '+12%', trendType: 'up',   trendLabel: 'vs avg'       },
];

const bloodData = [
  { label: 'A+',  value: 45, color: '#2563EB' },
  { label: 'A-',  value: 12, color: '#7C3AED' },
  { label: 'B+',  value: 30, color: '#0891B2' },
  { label: 'B-',  value: 5,  color: '#DC2626' },
  { label: 'O+',  value: 60, color: '#16A34A' },
  { label: 'O-',  value: 3,  color: '#EF4444' },
  { label: 'AB+', value: 20, color: '#D97706' },
  { label: 'AB-', value: 8,  color: '#6B7280' },
];

const bedData = [
  { label: 'ICU',       value: 15, color: '#2563EB' },
  { label: 'General',   value: 52, color: '#10B981' },
  { label: 'Emergency', value: 12, color: '#EF4444' },
  { label: 'Private',   value: 8,  color: '#8B5CF6' },
];

const recentRequests = [
  { id: 1, patient: 'John Kariuki',   service: 'Blood — O-',     priority: 'Critical', time: '2 min ago',  status: 'Pending' },
  { id: 2, patient: 'Mary Wambui',    service: 'ICU Bed',        priority: 'High',     time: '18 min ago', status: 'In Progress' },
  { id: 3, patient: 'Carlos Reyes',   service: 'Ambulance',      priority: 'High',     time: '35 min ago', status: 'Dispatched' },
  { id: 4, patient: 'Aisha Okafor',   service: 'Blood — A+',     priority: 'Medium',   time: '1 hr ago',   status: 'Fulfilled' },
  { id: 5, patient: 'Priya Sharma',   service: 'Medicine Epinephrine', priority: 'Critical', time: '5 min ago', status: 'Pending' },
];

const priorityBadge = (p) => ({ Critical: 'badge-danger', High: 'badge-warning', Medium: 'badge-info' }[p] || 'badge-neutral');
const statusBadge   = (s) => ({ Pending: 'badge-warning', 'In Progress': 'badge-info', Dispatched: 'badge-info', Fulfilled: 'badge-success' }[s] || 'badge-neutral');

const reqColumns = [
  { key: 'patient',  label: 'Patient',  render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
  { key: 'service',  label: 'Service Required' },
  { key: 'priority', label: 'Priority', render: (v) => <span className={`badge ${priorityBadge(v)}`}>{v}</span> },
  { key: 'time',     label: 'Time' },
  { key: 'status',   label: 'Status',   render: (v) => <span className={`badge ${statusBadge(v)}`}>{v}</span> },
];

export default function DashboardHome() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back — here's what's happening at City General Hospital today.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-cards-grid">
        {STAT_CARDS.map((card, i) => (
          <DashboardCard key={card.label} {...card} delay={i * 0.07} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 24 }}>
        <BarChart title="Blood Inventory" subtitle="Current units by type" data={bloodData} height={180} />
        <DonutChart title="Bed Occupancy" subtitle="Breakdown by ward" segments={bedData} size={150} />
      </div>

      {/* Recent requests */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Table
          title="Recent Emergency Requests"
          subtitle="Latest incoming requests requiring attention"
          columns={reqColumns}
          rows={recentRequests}
        />
      </motion.div>
    </div>
  );
}
