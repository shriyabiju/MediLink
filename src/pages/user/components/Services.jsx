import { Search, AlertCircle, Building2, Droplets } from "lucide-react";
import "../css/services.css";

const services = [
  {
    icon: Search,
    title: "Search Blood Availability",
    description: "Search real-time blood availability across verified hospitals and blood banks. Filter by blood group and location.",
    color: "#2563EB", bg: "#EFF6FF",
  },
  {
    icon: AlertCircle,
    title: "Emergency Blood Requests",
    description: "Submit an emergency blood request instantly. Donors are notified and hospitals can respond directly.",
    color: "#EF4444", bg: "#FEF2F2",
  },
  {
    icon: Building2,
    title: "Verified Hospitals & Blood Banks",
    description: "All hospitals and blood banks on MediLink are reviewed and approved by an administrator before going live.",
    color: "#14B8A6", bg: "#F0FDFA",
  },
  {
    icon: Droplets,
    title: "Donor Support",
    description: "Registered donors can view nearby blood requests, express interest, and track their donation history.",
    color: "#F59E0B", bg: "#FFFBEB",
  },
];

const Services = () => {
  return (
    <section className="services" id="services">
      <div className="services-inner">
        <div className="section-tag">What we offer</div>
        <h2>How MediLink Helps</h2>
        <p>Everything needed to connect patients with blood — fast, verified, and secure.</p>
        <div className="services-grid">
          {services.map(({ icon: Icon, title, description, color, bg }, i) => (
            <div className="service-card" key={i}>
              <div className="service-icon" style={{ background: bg, color }}>
                <Icon size={26} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <a href="/signup" className="service-link" style={{ color }}>Get started →</a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
