import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdDownload } from 'react-icons/md';
import { BarChart, ProgressChart } from './components/Chart';
import DashboardCard from './components/DashboardCard';
import { hospitalApi } from '../../services/api';

const BLOOD_COLORS = {
  'A+': '#2563EB', 'A-': '#7C3AED', 'B+': '#0891B2', 'B-': '#DC2626',
  'O+': '#16A34A', 'O-': '#EF4444', 'AB+': '#D97706', 'AB-': '#6B7280',
};
const CAT_COLORS = ['#2563EB','#10B981','#EF4444','#F59E0B','#8B5CF6','#0891B2','#6B7280'];

export default function Reports() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    hospitalApi.getReports()
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const bloodChart = (data?.bloodData || []).map((b) => ({ ...b, color: BLOOD_COLORS[b.label] || '#6B7280' }));
  const medChart   = (data?.medicineData || []).map((m, i) => ({ ...m, color: CAT_COLORS[i % CAT_COLORS.length] }));
  const bedChart   = (data?.bedData || []).map((b) => ({ label: b.label, value: b.value }));

  const rs = data?.requestStats  || { total: 0, open: 0, fulfilled: 0, cancelled: 0 };
  const ds = data?.doctorStats   || { total: 0, available: 0, busy: 0, onLeave: 0 };
  const ms = data?.medicineAlerts || { total: 0, low: 0, critical: 0 };

  return (
    <div>
      <div className="page-header">
        <div><h1>Reports &amp; Analytics</h1><p>Real insights from your hospital's database</p></div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 8 }}>{error}</div>}

      {/* Summary stat cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <DashboardCard label="Total Blood Requests" value={rs.total}     color="c-blue"   bg="bg-blue"   trend={`${rs.open}`}     trendType="up"   trendLabel="open"          delay={0}    />
        <DashboardCard label="Requests Fulfilled"   value={rs.fulfilled} color="c-green"  bg="bg-green"  trend={`${rs.cancelled}`} trendType="down" trendLabel="cancelled"     delay={0.06} />
        <DashboardCard label="Total Doctors"        value={ds.total}     color="c-teal"   bg="bg-blue"   trend={`${ds.available}`} trendType="up"   trendLabel="available now" delay={0.12} />
        <DashboardCard label="Medicine Alerts"      value={ms.low + ms.critical} color="c-amber" bg="bg-amber" trend={`${ms.critical}`} trendType="down" trendLabel="critical" delay={0.18} />
      </div>

      {/* Charts */}
      {bloodChart.length > 0 && (
        <div className="grid-2" style={{ marginBottom: 28 }}>
          <BarChart title="Blood Stock Availability" subtitle="Current units by blood group" data={bloodChart} height={200} />
          {medChart.length > 0
            ? <ProgressChart title="Medicine Stock by Category" subtitle="Total quantity per category" data={medChart} />
            : <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><p>No medicine data yet.</p></div>
          }
        </div>
      )}

      {bedChart.length > 0 && (
        <div className="grid-2" style={{ marginBottom: 28 }}>
          <ProgressChart title="Bed Occupancy" subtitle="Occupied beds by ward" data={bedChart} />
          <div className="card">
            <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: 14 }}>Summary at a Glance</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '.85rem' }}>
              {[
                ['Total Blood Requests',  rs.total],
                ['Open Requests',         rs.open],
                ['Fulfilled Requests',    rs.fulfilled],
                ['Cancelled Requests',    rs.cancelled],
                ['Total Doctors',         ds.total],
                ['Available Doctors',     ds.available],
                ['Doctors on Leave',      ds.onLeave],
                ['Total Medicines',       ms.total],
                ['Low Stock Medicines',   ms.low],
                ['Critical Medicines',    ms.critical],
                ['Total Beds',            data?.totalBeds || 0],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F3F4F6', paddingBottom: 8 }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!data || (bloodChart.length === 0 && bedChart.length === 0) && (
        <div className="card" style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
          <p>No data yet. Add blood stock, medicines, and bed information to see reports.</p>
        </div>
      )}
    </div>
  );
}
