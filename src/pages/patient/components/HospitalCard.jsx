import "../css/cards.css";

const HospitalCard = ({
  name,
  rating,
  distance,
  bedsAvailable,
  doctors = [],
  bloodAvailability = {},
  delay = 0,
}) => {
  return (
    <div className="hospital-card animate-fade-up" style={{ animationDelay: `${delay}s` }}>

      {/* Hospital Header */}
      <div className="hospital-card-header">
        <div>
          <span className="hospital-icon">🏥</span>
          <h4>{name}</h4>
        </div>
        <span className={`badge ${bedsAvailable ? "green" : "red"}`}>
          {bedsAvailable ? "🛏 Beds Available" : "🛏 Full"}
        </span>
      </div>

      {/* Rating & Distance */}
      <div className="hospital-meta">
        <span className="rating">⭐ {rating}</span>
        <span>📍 {distance} km away</span>
      </div>

      {/* Doctors — only shown if provided */}
      {doctors.length > 0 && (
        <div className="hospital-section">
          <h4>👨‍⚕️ Available Doctors</h4>
          <ul className="hospital-section-list">
            {doctors.map((doctor, index) => (
              <li key={index}>{doctor}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Blood Availability — only shown if provided */}
      {Object.keys(bloodAvailability).length > 0 && (
        <div className="hospital-section">
          <h4>🩸 Blood Availability</h4>
          <div className="hospital-blood-grid">
            {Object.entries(bloodAvailability).map(([group, status]) => (
              <span key={group} className="blood-item">
                <strong>{group}</strong>: {status}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="hospital-buttons">
        <button className="btn-primary">View Details</button>
        <button className="btn-secondary">Book Appointment</button>
      </div>

    </div>
  );
};

export default HospitalCard;