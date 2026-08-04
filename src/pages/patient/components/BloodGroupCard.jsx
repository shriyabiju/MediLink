import "../css/cards.css";

const statusMap = {
  available:   { emoji: "🟢", label: "Available"   },
  limited:     { emoji: "🟡", label: "Limited"     },
  unavailable: { emoji: "🔴", label: "Unavailable" },
};

const BloodGroupCard = ({ type, status = "available" }) => {
  const { emoji, label } = statusMap[status] ?? statusMap.available;
  return (
    <div className="blood-card">
      <div className="blood-type">{type}</div>
      <div className="blood-status">{emoji}</div>
      <div className="blood-label">{label}</div>
    </div>
  );
};

export default BloodGroupCard;
