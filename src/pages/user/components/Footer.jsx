import { Heart, Globe, Mail, Share2, MessageSquare, Phone } from "lucide-react";
import "../css/footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="footer-brand-col">
        <div className="footer-brand">
          <div className="footer-brand-icon">
            <Heart size={18} fill="#fff" color="#fff" />
          </div>
          <span>MediLink</span>
        </div>
        <p>
          Your trusted all-in-one healthcare platform — connecting patients
          with doctors, hospitals, and AI-powered health tools.
        </p>
        <div className="footer-socials">
          {[Globe, Mail, Share2, MessageSquare, Phone].map((Icon, i) => (
            <a key={i} href="#" className="footer-social" aria-label="social">
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>

      <div className="footer-col">
        <h4>Company</h4>
        <a href="#">About Us</a>
        <a href="#">Careers</a>
        <a href="#">Press</a>
        <a href="#">Blog</a>
      </div>

      <div className="footer-col">
        <h4>Services</h4>
        <a href="#">Book Appointment</a>
        <a href="#">Online Consultation</a>
        <a href="#">AI Symptom Checker</a>
        <a href="#">Emergency Support</a>
      </div>

      <div className="footer-col">
        <h4>Support</h4>
        <a href="#">Help Center</a>
        <a href="#">Privacy Policy</a>
        <a href="#">Terms &amp; Conditions</a>
        <a href="#">Contact Us</a>
      </div>
    </div>

    <div className="footer-bottom">
      <p>&copy; {new Date().getFullYear()} MediLink. All rights reserved.</p>
      <p>
        Made with{" "}
        <Heart
          size={13}
          fill="#EF4444"
          color="#EF4444"
          style={{ display: "inline", marginBottom: -2 }}
        />{" "}
        for better healthcare.
      </p>
    </div>
  </footer>
);

export default Footer;
