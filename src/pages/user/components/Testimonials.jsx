import { Star, MessageSquare } from "lucide-react";
import "../css/testimonials.css";

const testimonials = [
  { name: "Sarah Johnson",  role: "Patient",          message: "The booking process was quick and easy. I got a consultation within hours — absolutely amazing!",       rating: 5, avatar: "SJ", color: "#2563EB", bg: "#EFF6FF" },
  { name: "Dr. Michael Lee", role: "Registered Doctor", message: "A fantastic platform that connects me with patients efficiently. The interface is clean and reliable.", rating: 5, avatar: "ML", color: "#14B8A6", bg: "#F0FDFA" },
  { name: "Emma Davis",     role: "Patient",          message: "Ordered medicines through MediLink and they arrived the same day. The AI assistant is genuinely helpful.", rating: 5, avatar: "ED", color: "#8B5CF6", bg: "#F5F3FF" },
  { name: "James Wilson",   role: "Patient",          message: "The emergency service was incredibly fast. MediLink truly saved my life. I can't thank them enough.",    rating: 5, avatar: "JW", color: "#F59E0B", bg: "#FFFBEB" },
];

const Testimonials = () => {
  return (
    <section className="testimonials">
      <div className="testimonials-inner">
        <div className="section-tag">Testimonials</div>
        <h2>What Our Users Say</h2>
        <p>Real stories from real people who trust MediLink with their health.</p>
        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <MessageSquare size={28} className="testimonial-quote-icon" />
              <div className="testimonial-stars">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} size={15} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p className="testimonial-message">{t.message}</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: t.bg, color: t.color }}>{t.avatar}</div>
                <div>
                  <p className="testimonial-name">{t.name}</p>
                  <p className="testimonial-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
