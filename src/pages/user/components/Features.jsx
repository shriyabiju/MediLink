import { ShieldCheck, Video, Bot, Pill, FlaskConical, CalendarDays, Bell, BarChart2 } from "lucide-react";
import "../css/features.css";

const features = [
  { icon: ShieldCheck,  title: "Secure Medical Records",   description: "End-to-end encryption keeps your health data completely private and safe." },
  { icon: Video,        title: "Video Consultation",       description: "HD video calls with verified doctors from the comfort of your home." },
  { icon: Bot,          title: "AI Chat Assistant",        description: "24/7 AI health assistant to answer questions and guide your care." },
  { icon: Pill,         title: "Prescription Management",  description: "Digital prescriptions accessible anytime, with refill reminders." },
  { icon: FlaskConical, title: "Lab Reports",              description: "Receive and store lab results digitally — no paper, no waiting." },
  { icon: CalendarDays, title: "Appointment Tracking",     description: "Real-time status updates for all your upcoming appointments." },
  { icon: Bell,         title: "Smart Notifications",      description: "Timely reminders for medications, appointments, and health tips." },
  { icon: BarChart2,    title: "Health Analytics",         description: "Visualize your health trends and progress over time." },
];

const Features = () => {
  return (
    <section className="features" id="features">
      <div className="features-inner">
        <div className="section-tag">Built for you</div>
        <h2>Powerful Features</h2>
        <p>A complete healthcare toolkit designed around your needs.</p>
        <div className="features-grid">
          {features.map(({ icon: Icon, title, description }, i) => (
            <div className="feature-card" key={i}>
              <div className="feature-icon"><Icon size={22} /></div>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
