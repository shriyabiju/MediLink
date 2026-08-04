import "../css/emergency.css";

const EmergencyButton = ({ onRequest }) => {
  return (
    <div className="sos-card">
      <span className="sos-icon">🚨</span>
      <h2>EMERGENCY</h2>
      <p>Need immediate help?</p>
      <button
        className="sos-btn"
        onClick={onRequest}
        aria-label="Request emergency help"
      >
        REQUEST HELP
      </button>
    </div>
  );
};

export default EmergencyButton;
