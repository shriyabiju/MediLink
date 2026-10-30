import { useEffect, useRef, useState } from "react";
import { Droplets, Building2, Users, ShieldCheck } from "lucide-react";
import "../css/statistics.css";

const stats = [
  { value: 8,    suffix: "+",  label: "Blood Groups Tracked",      icon: Droplets,    color: "#EF4444", bg: "#FEF2F2" },
  { value: 5,    suffix: "+",  label: "Verified Hospitals",         icon: Building2,   color: "#2563EB", bg: "#EFF6FF" },
  { value: 3,    suffix: "+",  label: "Registered Blood Banks",     icon: ShieldCheck, color: "#14B8A6", bg: "#F0FDFA" },
  { value: 4,    suffix: "",   label: "User Roles Supported",       icon: Users,       color: "#F59E0B", bg: "#FFFBEB" },
];

const useCounter = (target, duration = 1400, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const isDecimal = target % 1 !== 0;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [start, target, duration]);
  return count;
};

const StatCard = ({ stat, animate }) => {
  const count = useCounter(stat.value, 1400, animate);
  const Icon = stat.icon;
  return (
    <div className="stat-card">
      <div className="stat-icon-wrap" style={{ background: stat.bg, color: stat.color }}>
        <Icon size={26} />
      </div>
      <h3 className="stat-number" style={{ color: stat.color }}>
        {count.toLocaleString()}{stat.suffix}
      </h3>
      <p className="stat-label">{stat.label}</p>
    </div>
  );
};

const Statistics = () => {
  const ref = useRef(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimate(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="statistics" ref={ref} id="statistics">
      <div className="statistics-inner">
        <div className="section-tag">The platform</div>
        <h2>MediLink at a Glance</h2>
        <p>A dedicated emergency blood coordination platform connecting every role in the process.</p>
        <div className="stats-grid">
          {stats.map((s, i) => <StatCard key={i} stat={s} animate={animate} />)}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
