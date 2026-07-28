import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../css/forms.css';

/* ── Animated Bar Chart ── */
export function BarChart({ title, subtitle, data = [], height = 160 }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height, paddingBottom: 24, position: 'relative' }}>
        {/* Y-axis hint */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: 8 }}>
          {[max, Math.round(max / 2), 0].map((v) => (
            <span key={v} style={{ fontSize: '.65rem', color: 'var(--text-muted)' }}>{v}</span>
          ))}
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 10, paddingLeft: 28, height: '100%' }}>
          {data.map((item, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <motion.div
                style={{
                  width: '100%',
                  background: item.color || 'var(--primary-light)',
                  borderRadius: '6px 6px 0 0',
                  minHeight: 4,
                }}
                initial={{ height: 0 }}
                animate={{ height: animated ? `${(item.value / max) * (height - 30)}px` : 0 }}
                transition={{ duration: 0.7, delay: i * 0.06, ease: [0.4, 0, 0.2, 1] }}
              />
              <span style={{ fontSize: '.68rem', color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Donut Chart ── */
export function DonutChart({ title, subtitle, segments = [], size = 140 }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  const r = 52;
  const circ = 2 * Math.PI * r;
  let offset = -circ / 4;

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0, overflow: 'visible' }}>
          <circle cx="60" cy="60" r={r} fill="none" stroke="#F3F4F6" strokeWidth="14" />
          {segments.map((seg, i) => {
            const dash = animated ? (seg.value / total) * circ : 0;
            const gap  = circ - dash;
            const el = (
              <motion.circle
                key={i}
                cx="60" cy="60" r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 ' + circ }}
                animate={{ strokeDasharray: `${dash} ${gap}` }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: 'easeOut' }}
              />
            );
            offset += dash;
            return el;
          })}
          <text x="60" y="56" textAnchor="middle" fontSize="16" fontWeight="800" fill="var(--text)">{total}</text>
          <text x="60" y="70" textAnchor="middle" fontSize="9" fill="var(--text-muted)">Total</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {segments.map((seg, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.8rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
              <span style={{ color: 'var(--text-muted)' }}>{seg.label}</span>
              <span style={{ fontWeight: 700, color: 'var(--text)', marginLeft: 'auto', paddingLeft: 16 }}>{seg.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Horizontal Progress Bars ── */
export function ProgressChart({ title, subtitle, data = [] }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 200); return () => clearTimeout(t); }, []);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {data.map((item, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text)' }}>{item.label}</span>
              <span style={{ fontSize: '.8rem', color: 'var(--text-muted)' }}>{item.value}</span>
            </div>
            <div style={{ height: 8, background: '#F3F4F6', borderRadius: 6, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: item.color || 'var(--primary-light)', borderRadius: 6 }}
                initial={{ width: 0 }}
                animate={{ width: animated ? `${(item.value / max) * 100}%` : 0 }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
