import "../css/cards.css";

const DashboardCard = ({ icon, label, value, colorClass = "blue", delay = 0 }) => {
  return (
    <div className="stat-card animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className={`stat-icon ${colorClass}`}>{icon}</div>
      <div className="stat-info">
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
