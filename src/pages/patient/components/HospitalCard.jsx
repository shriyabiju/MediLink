import "../css/cards.css";

/**
 * HospitalCard — used on the Hospitals page.
 * Only displays data actually returned by the backend.
 * No fake ratings, distances or invented availability.
 */
const HospitalCard = ({
  name,
  city,
  state,
  address,
  phone,
  email,
  hospitalType,
  registrationNumber,
  onViewDetails,
  onBookAppointment,
  delay = 0,
}) => {
  const location = [address, city, state].filter(Boolean).join(", ");

  return (
    <div className="hospital-card animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      {/* Header */}
      <div className="hospital-card-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="hospital-icon">🏥</span>
          <div>
            <h4>{name}</h4>
            {hospitalType && (
              <p style={{ fontSize: "0.72rem", color: "#64748B", marginTop: 1 }}>{hospitalType}</p>
            )}
          </div>
        </div>
        <span className="badge green">✅ Approved</span>
      </div>

      {/* Location */}
      {location && (
        <div className="hospital-meta">
          <span>📍 {location}</span>
        </div>
      )}

      {/* Contact */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
        {phone && (
          <span style={{ fontSize: "0.78rem", color: "#475569", display: "flex", alignItems: "center", gap: 5 }}>
            📞 {phone}
          </span>
        )}
        {email && (
          <span style={{ fontSize: "0.78rem", color: "#475569", display: "flex", alignItems: "center", gap: 5 }}>
            ✉️ {email}
          </span>
        )}
        {registrationNumber && (
          <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>
            Reg: {registrationNumber}
          </span>
        )}
      </div>

      {/* Buttons */}
      <div className="hospital-buttons">
        {onViewDetails && (
          <button className="btn-secondary" onClick={onViewDetails}>View Details</button>
        )}
        {onBookAppointment && (
          <button className="btn-primary" onClick={onBookAppointment}>Book Appointment</button>
        )}
      </div>
    </div>
  );
};

export default HospitalCard;
