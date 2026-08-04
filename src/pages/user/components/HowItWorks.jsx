import { UserPlus, Search, CalendarCheck, HeartPulse } from "lucide-react";
import "../css/howitworks.css";

const steps = [
  { icon: UserPlus,      step: "01", title: "Create Account",    description: "Sign up for free in under a minute and build your personal health profile." },
  { icon: Search,        step: "02", title: "Choose a Doctor",   description: "Browse verified specialists by specialty, location, ratings, and availability." },
  { icon: CalendarCheck, step: "03", title: "Book Appointment",  description: "Pick a convenient time slot and confirm your booking with one click." },
  { icon: HeartPulse,    step: "04", title: "Get Consultation",  description: "Meet your doctor in person or online and receive personalized care." },
];

const HowItWorks = () => {
  return (
    <section className="how-it-works" id="about">
      <div className="hiw-inner">
        <div className="section-tag">Simple process</div>
        <h2>How MediLink Works</h2>
        <p>Get the care you need in just four easy steps.</p>
        <div className="hiw-steps">
          {steps.map(({ icon: Icon, step, title, description }, i) => (
            <div className="hiw-step" key={i}>
              <div className="hiw-step-num">{step}</div>
              <div className="hiw-icon-wrap">
                <Icon size={28} color="#2563EB" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              {i < steps.length - 1 && <div className="hiw-connector" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
