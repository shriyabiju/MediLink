import "../css/cards.css";

const AppointmentCard = ({ doctor, date, time, department, delay = 0 }) => {
  return (
    <div className="appointment-card animate-fade-up" style={{ animationDelay: `${delay}s` }}>
      <div className="appt-info">
        <h4>👨‍⚕️ {doctor}</h4>
        <p>📅 {date}</p>
      </div>
      <div className="appt-time">
        <div className="time">{time}</div>
        <div className="dept">{department}</div>
      </div>
      <button className="btn-primary" style={{ marginLeft: "16px" }}>View</button>
    </div>
  );
};

export default AppointmentCard;
