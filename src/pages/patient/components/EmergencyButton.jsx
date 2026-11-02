import "../css/emergency.css";

const EmergencyButton = ({ onRequest, sending = false, sent = false }) => {
  return (
    <div className="sos-card">
      <span className="sos-icon">🚨</span>
      <h2>EMERGENCY</h2>
      <p>Need immediate help?</p>
      <p style={{ fontSize: "0.82rem", opacity: 0.8, marginTop: -8, marginBottom: 20 }}>
        Request emergency healthcare assistance through MediLink.
      </p>
      <button
        className="sos-btn"
        onClick={onRequest}
        disabled={sending || sent}
        aria-label="Request emergency help"
        style={{ opacity: (sending || sent) ? 0.75 : 1, cursor: (sending || sent) ? "not-allowed" : "pointer" }}
      >
        {sending ? "Sending…" : sent ? "Request Sent ✓" : "REQUEST HELP"}
      </button>
    </div>
  );
};

export default EmergencyButton;
