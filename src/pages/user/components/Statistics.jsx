import { useEffect, useRef, useState } from "react";
import { Users, Building2, Star, Stethoscope } from "lucide-react";
import "../css/statistics.css";

const stats = [
  { value: 500,  suffix: "+", label: "Doctors",          icon: Stethoscope, color: "#2563EB", bg: "#EFF6FF" },
  { value: 100,  suffix: "+", label: "Hospitals",         icon: Building2,   color: "#14B8A6", bg: "#F0FDFA" },
  { value: 10000, suffix: "+", label: "Patients Served",  icon: Users,       color: "#F59E0B", bg: "#FFFBEB" },
  { value: 4.9,  suffix: "",  label: "Average Rating",    icon: Star,        color: "#EF4444", bg: "#FEF2F2" },
];

const useCounter = (target, duration = 1800, start = false) => {
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
  const count = useCounter(stat.value, 1800, animate);
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
        <div className="section-tag">By the numbers</div>
        <h2>MediLink in Numbers</h2>
        <p>Thousands of patients trust MediLink for their healthcare needs every day.</p>
        <div className="stats-grid">
          {stats.map((s, i) => <StatCard key={i} stat={s} animate={animate} />)}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
