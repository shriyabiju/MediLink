import { Star, CalendarDays } from "lucide-react";
import "../css/doctors.css";

const doctors = [
  { name: "Dr. Sarah Smith",   specialty: "Cardiologist",      exp: "12 years", rating: 4.9, reviews: 320, avatar: "SS", color: "#2563EB", bg: "#EFF6FF" },
  { name: "Dr. James Lee",     specialty: "General Physician", exp: "8 years",  rating: 4.8, reviews: 215, avatar: "JL", color: "#14B8A6", bg: "#F0FDFA" },
  { name: "Dr. Priya Mehta",   specialty: "Dermatologist",     exp: "10 years", rating: 4.9, reviews: 280, avatar: "PM", color: "#8B5CF6", bg: "#F5F3FF" },
  { name: "Dr. David Chen",    specialty: "Neurologist",       exp: "15 years", rating: 5.0, reviews: 410, avatar: "DC", color: "#F59E0B", bg: "#FFFBEB" },
];

const Doctors = () => {
  return (
    <section className="doctors" id="doctors">
      <div className="doctors-inner">
        <div className="section-tag">Our team</div>
        <h2>Meet Our Doctors</h2>
        <p>Experienced, certified specialists committed to your health and wellbeing.</p>
        <div className="doctors-grid">
          {doctors.map((doc, i) => (
            <div className="doctor-card" key={i}>
              <div className="doctor-avatar" style={{ background: doc.bg, color: doc.color }}>
                {doc.avatar}
              </div>
              <div className="doctor-info">
                <h3>{doc.name}</h3>
                <p className="doctor-specialty">{doc.specialty}</p>
                <p className="doctor-exp">{doc.exp} experience</p>
                <div className="doctor-rating">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} fill={j < Math.floor(doc.rating) ? "#F59E0B" : "none"} color="#F59E0B" />
                  ))}
                  <span>{doc.rating} ({doc.reviews} reviews)</span>
                </div>
              </div>
              <button className="doctor-book-btn">
                <CalendarDays size={15} />
                Book Appointment
              </button>
            </div>
          ))}
        </div>
        <div className="doctors-cta">
          <a href="#" className="doctors-view-all">View All Doctors →</a>
        </div>
      </div>
    </section>
  );
};

export default Doctors;
