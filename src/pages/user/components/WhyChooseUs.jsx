import { CheckCircle2 } from "lucide-react";
import "../css/whychooseus.css";

const reasons = [
  "Easy to Use — intuitive interface for all age groups.",
  "Secure Data — HIPAA-compliant end-to-end encryption.",
  "Certified Doctors — all providers are verified and licensed.",
  "Fast Appointment Booking — confirmed in under 60 seconds.",
  "24/7 Support — our team is always here to help you.",
  "AI Assistance — smart health guidance at your fingertips.",
];

const WhyChooseUs = () => {
  return (
    <section className="why-choose-us">
      <div className="why-inner">
        <div className="why-visual">
          <div className="why-blob" />
          <div className="why-img-card">
            <div className="why-img-icon">🏥</div>
            <div>
              <p className="why-img-title">MediLink</p>
              <p className="why-img-sub">Your trusted healthcare partner</p>
            </div>
          </div>
          <div className="why-float-card why-float-card--1">
            <span>⭐ 4.9</span>
            <span>Patient Rating</span>
          </div>
          <div className="why-float-card why-float-card--2">
            <span>✅ Certified</span>
            <span>All Doctors Verified</span>
          </div>
        </div>

        <div className="why-content">
          <div className="section-tag">Why us</div>
          <h2>Why Choose MediLink?</h2>
          <p>We are redefining healthcare accessibility — making quality care available to everyone, everywhere.</p>
          <ul className="why-list">
            {reasons.map((r, i) => (
              <li key={i}>
                <CheckCircle2 size={20} color="#14B8A6" strokeWidth={2.5} />
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <a href="/register" className="why-cta">Start for Free →</a>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
