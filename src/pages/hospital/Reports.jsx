import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdDownload } from 'react-icons/md';
import { BarChart, ProgressChart } from './components/Chart';
import DashboardCard from './components/DashboardCard';

const bloodAvail = [
  { label: 'A+',  value: 45, color: '#2563EB' },
  { label: 'A-',  value: 12, color: '#7C3AED' },
  { label: 'B+',  value: 30, color: '#0891B2' },
  { label: 'B-',  value: 5,  color: '#DC2626' },
  { label: 'O+',  value: 60, color: '#16A34A' },
  { label: 'O-',  value: 3,  color: '#EF4444' },
  { label: 'AB+', value: 20, color: '#D97706' },
  { label: 'AB-', value: 8,  color: '#6B7280' },
];

const medicineStock = [
  { label: 'Antibiotics',  value: 120, color: '#2563EB' },
  { label: 'Analgesics',   value: 245, color: '#10B981' },
  { label: 'Emergency',    value: 8,   color: '#EF4444' },
  { label: 'Antidiabetic', value: 48,  color: '#F59E0B' },
  { label: 'Antiviral',    value: 82,  color: '#8B5CF6' },
];

const bedOccupancy = [
  { label: 'ICU',       value: 18, color: '#2563EB' },
  { label: 'General',   value: 42, color: '#10B981' },
  { label: 'Emergency', value: 12, color: '#EF4444' },
  { label: 'Private',   value: 15, color: '#8B5CF6' },
];

export default function Reports() {
  const [range, setRange] = useState('week');

  return (
    <div>
      <div className="page-header">
        <div><h1>Reports & Analytics</h1><p>Visual insights into hospital performance</p></div>
        <div style={{ display: 'flex', gap: 10 }}>
          {['week', 'month', 'year'].map((r) => (
            <motion.button
              key={r}
              className={`btn btn-sm ${range === r ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setRange(r)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </motion.button>
          ))}
          <motion.button className="btn btn-sm btn-outline" whileHover={{ scale: 1.04 }}>
            <MdDownload /> Export
          </motion.button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <DashboardCard label="Total Patients" value={1204} color="c-blue"   bg="bg-blue"   trend="+8%"  trendType="up"   trendLabel="vs last month" delay={0} />
        <DashboardCard label="Emergencies"    value={87}   color="c-red"    bg="bg-red"    trend="+12%" trendType="up"   trendLabel="this month"    delay={0.06} />
        <DashboardCard label="Surgeries"      value={54}   color="c-green"  bg="bg-green"  trend="-4%"  trendType="down" trendLabel="vs last month" delay={0.12} />
        <DashboardCard label="Avg Stay"       value={3.2}  color="c-amber"  bg="bg-amber"  trend="days" trendType="flat" trendLabel="patient avg"   delay={0.18} />
      </div>

      {/* Charts */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        <BarChart title="Blood Availability" subtitle="Current stock by type" data={bloodAvail} height={200} />
        <ProgressChart title="Medicine Stock" subtitle="Inventory by category" data={medicineStock} />
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        <ProgressChart title="Bed Occupancy" subtitle="Current occupancy by ward" data={bedOccupancy} />
        <div className="card">
          <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 14 }}>This Month at a Glance</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Admissions</span>
              <strong>1,204</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Emergency Cases</span>
              <strong>87</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Surgeries Performed</span>
              <strong>54</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Blood Units Used</span>
              <strong>94</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Avg Patient Stay</span>
              <strong>3.2 days</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Medicines Restocked</span>
              <strong>245</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
