import { ArrowRight, Play } from "lucide-react";
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
          Trusted by 10,000+ patients worldwide
        </div>

        <h1 className="hero-heading">
          Healthcare Connected.<br />
          <span className="hero-heading-accent">Anytime. Anywhere.</span>
        </h1>

        <p className="hero-subheading">
          MediLink is your all-in-one healthcare platform to book appointments,
          manage medical records, consult doctors online, and receive
          AI-powered health assistance.
        </p>

        <div className="hero-buttons">
          <a href="/register" className="hero-btn-primary">
            Get Started <ArrowRight size={18} />
          </a>
          <a href="#services" className="hero-btn-secondary">
            <span className="hero-play-icon"><Play size={14} fill="#2563EB" color="#2563EB" /></span>
            Learn More
          </a>
        </div>

        <div className="hero-trust">
          <div className="hero-avatars">
            {["A","B","C","D"].map((l, i) => (
              <div key={i} className="hero-avatar" style={{ background: ["#2563EB","#14B8A6","#F59E0B","#EF4444"][i] }}>{l}</div>
            ))}
          </div>
          <p><strong>500+</strong> doctors ready to help you today</p>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-card hero-card--main">
          <div className="hero-card-icon" style={{ background: "#EFF6FF", color: "#2563EB" }}>🩺</div>
          <div>
            <p className="hero-card-label">Next Appointment</p>
            <p className="hero-card-value">Dr. Sarah Smith</p>
            <p className="hero-card-sub">Today, 10:00 AM · Cardiology</p>
          </div>
        </div>
        <div className="hero-card hero-card--stat">
          <span className="hero-stat-emoji">😊</span>
          <div>
            <p className="hero-card-value">10,000+</p>
            <p className="hero-card-label">Happy Patients</p>
          </div>
        </div>
        <div className="hero-card hero-card--ai">
          <span>🤖</span>
          <div>
            <p className="hero-card-value">AI Assistant</p>
            <p className="hero-card-label">Ask health questions 24/7</p>
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
