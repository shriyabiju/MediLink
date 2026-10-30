import { ArrowRight, Search } from "lucide-react";
import "../css/hero.css";

const Hero = () => {
  return (
    <section className="hero" id="home">
      {/* Blobs */}
      <div className="hero-blob hero-blob--1" />
      <div className="hero-blob hero-blob--2" />

      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Emergency Blood Coordination Platform
        </div>

        <h1 className="hero-heading">
          Emergency Blood Help.<br />
          <span className="hero-heading-accent">When Every Second Counts.</span>
        </h1>

        <p className="hero-subheading">
          MediLink connects patients with hospitals, blood banks, and donors to
          help people find blood availability and request emergency blood support quickly.
        </p>

        <div className="hero-buttons">
          <a href="/signup" className="hero-btn-primary">
            Get Started <ArrowRight size={18} />
          </a>
          <a href="/login" className="hero-btn-secondary">
            <span className="hero-play-icon">
              <Search size={14} color="#2563EB" />
            </span>
            Find Blood
          </a>
        </div>

        <div className="hero-trust">
          <div className="hero-avatars">
            {["P","D","H","B"].map((l, i) => (
              <div key={i} className="hero-avatar" style={{ background: ["#EF4444","#2563EB","#14B8A6","#F59E0B"][i] }}>{l}</div>
            ))}
          </div>
          <p><strong>Patients, Donors, Hospitals &amp; Blood Banks</strong> — all on one platform</p>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-card hero-card--main">
          <div className="hero-card-icon" style={{ background: "#FEE2E2", color: "#EF4444" }}>🩸</div>
          <div>
            <p className="hero-card-label">Emergency Request</p>
            <p className="hero-card-value">O+ Blood Needed</p>
            <p className="hero-card-sub">Mumbai · 2 units · Critical</p>
          </div>
        </div>
        <div className="hero-card hero-card--stat">
          <span className="hero-stat-emoji">🏥</span>
          <div>
            <p className="hero-card-value">Verified</p>
            <p className="hero-card-label">Hospitals &amp; Blood Banks</p>
          </div>
        </div>
        <div className="hero-card hero-card--ai">
          <span>✅</span>
          <div>
            <p className="hero-card-value">Real-time</p>
            <p className="hero-card-label">Blood availability tracking</p>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="hero-deco hero-deco--1" />
        <div className="hero-deco hero-deco--2" />
        <div className="hero-deco hero-deco--3" />
      </div>
    </section>
  );
};

export default Hero;
