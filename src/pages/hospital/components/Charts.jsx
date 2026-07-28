import React from 'react';

/**
 * Charts.jsx — Lightweight chart placeholders using pure CSS bars.
 * Drop in Recharts / Chart.js later by replacing the inner markup.
 */

/* ── Bar Chart ── */
export function BarChart({ title, data = [] }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={styles.card}>
      {title && <h3 style={styles.title}>{title}</h3>}
      <div style={styles.barGroup}>
        {data.map((item, i) => (
          <div key={i} style={styles.barItem}>
            <div style={styles.barTrack}>
              <div
                style={{
                  ...styles.barFill,
                  height: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color || '#2563EB',
                }}
              />
            </div>
            <span style={styles.barLabel}>{item.label}</span>
            <span style={styles.barValue}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Donut / Ring Chart ── */
export function DonutChart({ title, segments = [], size = 120 }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  const r = 45;
  const circumference = 2 * Math.PI * r;

  return (
    <div style={styles.card}>
      {title && <h3 style={styles.title}>{title}</h3>}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#F1F5F9" strokeWidth="10" />
          {segments.map((seg, i) => {
            const dash = (seg.value / total) * circumference;
            const gap = circumference - dash;
            const el = (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={seg.color || '#2563EB'}
                strokeWidth="10"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
                transform="rotate(-90 50 50)"
              />
            );
            offset += dash;
            return el;
          })}
          <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="700" fill="#0F172A">
            {total}
          </text>
        </svg>

        {/* Legend */}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {segments.map((seg, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.82rem' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: seg.color || '#2563EB', flexShrink: 0 }} />
              <span style={{ color: '#475569' }}>{seg.label}</span>
              <span style={{ fontWeight: 600, color: '#0F172A', marginLeft: 'auto' }}>{seg.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ── Line Sparkline ── */
export function Sparkline({ title, data = [], color = '#2563EB' }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const W = 260;
  const H = 60;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - ((v - min) / range) * H;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={styles.card}>
      {title && <h3 style={styles.title}>{title}</h3>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((v, i) => (
          <circle
            key={i}
            cx={(i / (data.length - 1)) * W}
            cy={H - ((v - min) / range) * H}
            r="3"
            fill={color}
          />
        ))}
      </svg>
    </div>
  );
}

const styles = {
  card: {
    background: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid #E2E8F0',
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#1E293B',
    marginBottom: '16px',
  },
  barGroup: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    height: '120px',
  },
  barItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    height: '100%',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    background: '#F1F5F9',
    borderRadius: '6px 6px 0 0',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: '6px 6px 0 0',
    transition: 'height 0.4s ease',
  },
  barLabel: { fontSize: '0.7rem', color: '#64748B', marginTop: '4px' },
  barValue: { fontSize: '0.75rem', fontWeight: 700, color: '#0F172A' },
};
