import "../css/cards.css";

const NotificationCard = ({ message, time, color = "blue", delay = 0 }) => {
  return (
    <div className="notification-card" style={{ animationDelay: `${delay}s` }}>
      <span className={`notif-dot ${color}`} />
      <div className="notif-text">
        <p>🔔 {message}</p>
        <span>{time}</span>
      </div>
    </div>
  );
};

export default NotificationCard;
