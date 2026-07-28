import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import '../css/cards.css';

/* Animated counter hook */
function useCounter(target, duration = 1400) {
  const [count, setCount] = useState(0);
  const start = useRef(null);
  const raf   = useRef(null);

  useEffect(() => {
    const animate = (ts) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0 },
};

export default function DashboardCard({ label, value, icon: Icon, color, bg, trend, trendType = 'up', trendLabel, delay = 0 }) {
  const count = useCounter(typeof value === 'number' ? value : parseInt(value) || 0);

  return (
    <motion.div
      className="stat-card"
      variants={cardVariants}
      initial="hidden"
      animate="show"
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(30,58,138,.12)' }}
    >
      <div className={`stat-card-bg ${bg}`} />
      <div className={`stat-card-icon ${color}`}>
        {Icon && <Icon />}
      </div>
      <p className="stat-card-label">{label}</p>
      <p className="stat-card-value">{count}</p>
      {trend && (
        <div className={`stat-card-trend ${trendType}`}>
          <span>{trendType === 'up' ? '↑' : trendType === 'down' ? '↓' : '→'}</span>
          <span>{trend}</span>
          {trendLabel && <span className="trend-sub">{trendLabel}</span>}
        </div>
      )}
    </motion.div>
  );
}
