import { CalendarDays, Video, Bot, FolderOpen, Bell, Ambulance } from "lucide-react";
import "../css/services.css";

const services = [
  { icon: CalendarDays, title: "Book Appointment",       description: "Schedule visits with top doctors and specialists near you in seconds.", color: "#2563EB", bg: "#EFF6FF" },
  { icon: Video,        title: "Online Consultation",    description: "Connect with certified doctors via secure video calls from home.", color: "#14B8A6", bg: "#F0FDFA" },
  { icon: Bot,          title: "AI Symptom Checker",     description: "Describe your symptoms and get an instant AI-powered health assessment.", color: "#8B5CF6", bg: "#F5F3FF" },
  { icon: FolderOpen,   title: "Digital Health Records", description: "Store, access, and share your medical history securely from anywhere.", color: "#F59E0B", bg: "#FFFBEB" },
  { icon: Bell,         title: "Medicine Reminder",      description: "Never miss a dose with smart reminders and prescription tracking.", color: "#EF4444", bg: "#FEF2F2" },
  { icon: Ambulance,    title: "Emergency Support",      description: "One-tap emergency alerts with real-time ambulance tracking.", color: "#0EA5E9", bg: "#F0F9FF" },
];

const Services = () => {
  return (
    <section className="services" id="services">
      <div className="services-inner">
        <div className="section-tag">What we offer</div>
        <h2>Our Services</h2>
        <p>Everything you need for your health journey — in one place.</p>
        <div className="services-grid">
          {services.map(({ icon: Icon, title, description, color, bg }, i) => (
            <div className="service-card" key={i}>
              <div className="service-icon" style={{ background: bg, color }}>
                <Icon size={26} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <a href="#" className="service-link" style={{ color }}>Learn more →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
