import "../css/navbar.css";

const Navbar = ({ title = "Dashboard", onMenuClick }) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="hamburger" onClick={onMenuClick} aria-label="Open menu">
          ☰
        </button>
        <span className="navbar-title">{title}</span>
      </div>
      <div className="navbar-right">
        <button className="notif-btn" aria-label="Notifications">
          🔔
          <span className="notif-badge" />
        </button>
        <div className="navbar-avatar" title="Vismaya">V</div>
      </div>
    </header>
  );
};

export default Navbar;
