import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import "../css/contact.css";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section className="contact" id="contact">
      <div className="contact-inner">
        <div className="section-tag">Get in touch</div>
        <h2>Contact Us</h2>
        <p>Have questions? Our team is happy to help you anytime.</p>

        <div className="contact-wrapper">
          <div className="contact-info">
            <h3>Let's talk about your health</h3>
            <p>Reach out to our support team or send us a message — we respond within 24 hours.</p>
            <ul className="contact-details">
              <li><Mail size={18} color="#2563EB" /><span>support@medilink.com</span></li>
              <li><Phone size={18} color="#14B8A6" /><span>+1 (800) 123-4567</span></li>
              <li><MapPin size={18} color="#EF4444" /><span>123 Health Street, New York, NY 10001</span></li>
            </ul>
            <div className="contact-hours">
              <p className="contact-hours-title">Support Hours</p>
              <p>Monday – Friday: 8:00 AM – 8:00 PM</p>
              <p>Saturday – Sunday: 10:00 AM – 5:00 PM</p>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            {sent && <div className="contact-success">✅ Message sent! We'll get back to you soon.</div>}
            <div className="contact-row">
              <input type="text"  name="name"    placeholder="Your Name"    value={form.name}    onChange={handleChange} required />
              <input type="email" name="email"   placeholder="Your Email"   value={form.email}   onChange={handleChange} required />
            </div>
            <input type="text" name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} required />
            <textarea name="message" placeholder="Your Message" rows={5} value={form.message} onChange={handleChange} required />
            <button type="submit" className="contact-submit">
              <Send size={16} /> Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
