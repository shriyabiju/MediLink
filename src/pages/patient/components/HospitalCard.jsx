import React from "react";
import "../css/cards.css";

const HospitalCard = ({
  name,
  rating,
  distance,
  bedsAvailable,
  doctors = [],
  bloodAvailability = {},
}) => {
  return (
    <div className="hospital-card">

      {/* Hospital Header */}
      <div className="hospital-card-header">
        <div>
          <span className="hospital-icon">🏥</span>
          <h3>{name}</h3>
        </div>

        <span className={`badge ${bedsAvailable ? "green" : "red"}`}>
          {bedsAvailable ? "Beds Available" : "Hospital Full"}
        </span>
      </div>

      {/* Rating & Distance */}
      <div className="hospital-meta">
        <span>⭐ {rating}</span>
        <span>📍 {distance} km away</span>
      </div>

      {/* Doctors */}
      <div className="hospital-section">
        <h4>👨‍⚕️ Available Doctors</h4>

        <ul>
          {doctors.map((doctor, index) => (
            <li key={index}>{doctor}</li>
          ))}
        </ul>
      </div>

      {/* Blood Availability */}
      <div className="hospital-section">
        <h4>🩸 Blood Availability</h4>

        <div className="blood-grid">
          {Object.entries(bloodAvailability).map(([group, status]) => (
            <span key={group} className="blood-item">
              <strong>{group}</strong> : {status}
            </span>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="hospital-buttons">
        <button className="btn-primary">
          View Details
        </button>

        <button className="btn-secondary">
          Book Appointment
        </button>
      </div>

    </div>
  );
};

export default HospitalCard;