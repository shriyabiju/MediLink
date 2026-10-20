import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/** Animated counter (same pattern as hospital DashboardCard) */
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const start = useRef(null);
  const raf   = useRef(null);

  useEffect(() => {
    const animate = (ts) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);

  return count;
}

/**
 * StatCard — matches hospital DashboardCard visual pattern.
 *
 * Props:
 *   label       string
 *   value       number | string   (numbers get animated counter; strings shown as-is)
 *   icon        Lucide component
 *   iconColor   CSS colour string
 *   iconBg      CSS colour string
 *   sub         string            — small text below value
 *   delay       number            — framer-motion stagger delay (seconds)
 */
export default function StatCard({ label, value, icon: Icon, iconColor, iconBg, sub, delay = 0 }) {
  const isNum  = typeof value === "number";
  const count  = useCounter(isNum ? value : 0);

  return (
    <motion.div
      style={{
        background:    "var(--card)",
        borderRadius:  "var(--radius)",
        border:        "1px solid var(--border)",
        boxShadow:     "var(--shadow-sm)",
        padding:       "var(--space-6)",
        display:       "flex",
        alignItems:    "flex-start",
        gap:           "var(--space-4)",
        position:      "relative",
        overflow:      "hidden",
        cursor:        "default",
      }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -3, boxShadow: "var(--shadow-md)" }}
    >
      {/* Decorative circle */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -24, right: -24,
          width: 90, height: 90,
          borderRadius: "50%",
          background: iconBg,
          opacity: .12,
        }}
      />

      {/* Icon box */}
      <div
        style={{
          width: 48, height: 48,
          borderRadius: "var(--radius-sm)",
          background: iconBg,
          color: iconColor,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          fontSize: "1.2rem",
        }}
      >
        {Icon && <Icon size={22} />}
      </div>

      {/* Text */}
      <div>
        <p style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "var(--text-2xl)", fontWeight: 800, color: "var(--text)", lineHeight: 1, marginBottom: 4 }}>
          {isNum ? count : value}
        </p>
        {sub && (
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{sub}</p>
        )}
      </div>
    </motion.div>
  );
}
