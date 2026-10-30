import { ShieldCheck, MapPin, Bell, UserCheck, Droplets, ClipboardList, AlertCircle } from "lucide-react";
import "../css/features.css";

const features = [
  { icon: ShieldCheck,   title: "Admin-Verified Facilities",   description: "Every hospital and blood bank must be approved by an administrator before they can operate on the platform." },
  { icon: Droplets,      title: "Real-Time Blood Inventory",   description: "Hospitals and blood banks update their blood stock live. Patients always see current availability." },
  { icon: AlertCircle,   title: "Emergency Request Workflow",  description: "Patients submit requests that are immediately visible to donors and the assigned hospital for rapid response." },
  { icon: MapPin,        title: "City-Based Donor Matching",   description: "Donors see nearby blood requests filtered by their saved city, making it easy to help locally." },
  { icon: UserCheck,     title: "Donor Identity Verification", description: "Donors upload an Aadhaar or government ID for admin review. Only verified donors appear in hospital directories." },
  { icon: ClipboardList, title: "Request Status Tracking",     description: "Patients track their blood request status — Pending, Approved, Rejected, or Fulfilled — in real time." },
  { icon: Bell,          title: "Smart Notifications",         description: "Hospitals, blood banks, and donors receive automatic notifications when a relevant request or update occurs." },
  { icon: ShieldCheck,   title: "Role-Based Access Control",   description: "JWT-secured dashboards ensure each user role sees only what they are authorised to view and manage." },
];

const Features = () => {
  return (
    <section className="features" id="features">
      <div className="features-inner">
        <div className="section-tag">Built for blood coordination</div>
        <h2>Platform Features</h2>
        <p>MediLink is purpose-built for emergency blood management — not a generic healthcare app.</p>
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
