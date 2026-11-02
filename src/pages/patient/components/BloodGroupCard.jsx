import "../css/cards.css";

const statusMap = {
  available:   { emoji: "🟢", label: "Available",   color: "#16A34A" },
  limited:     { emoji: "🟡", label: "Limited",     color: "#D97706" },
  unavailable: { emoji: "🔴", label: "Unavailable", color: "#EF4444" },
};

const BloodGroupCard = ({ type, status = "unavailable", units }) => {
  /* If units === 0 force unavailable regardless of backend status string */
  const resolvedStatus = (units === 0) ? "unavailable" : (status || "unavailable");
  const { emoji, color } = statusMap[resolvedStatus] ?? statusMap.unavailable;

  return (
    <div className="blood-card">
      <div className="blood-type">{type}</div>
      <div className="blood-status">{emoji}</div>
      {units != null ? (
        <div className="blood-label" style={{ color, fontWeight: 600 }}>
          {units > 0 ? `${units} units` : "Unavailable"}
        </div>
      ) : (
        <div className="blood-label" style={{ color }}>
          {statusMap[resolvedStatus]?.label ?? "Unavailable"}
        </div>
      )}
    </div>
  );
};

export default BloodGroupCard;
