import { useState } from "react";
import { ChevronDown } from "lucide-react";
import "../css/faq.css";

const faqs = [
  { q: "How do I book an appointment?",        a: "Search for a doctor or specialty, pick an available time slot, and confirm. You'll receive a booking confirmation via email and SMS." },
  { q: "Is my data secure?",                   a: "Absolutely. We use HIPAA-compliant, end-to-end encryption to keep all your health data private and secure at all times." },
  { q: "Can I cancel appointments?",           a: "Yes. You can cancel or reschedule appointments up to 2 hours before the scheduled time from your dashboard." },
  { q: "Do you support online consultation?",  a: "Yes — all registered doctors support secure HD video consultations through our platform." },
  { q: "Is MediLink free to use?",             a: "Creating an account and browsing doctors is free. Consultation fees depend on the doctor and service type." },
  { q: "How does the AI symptom checker work?", a: "Describe your symptoms in plain language and our AI analyzes them against medical data to suggest possible conditions and next steps." },
];

const FAQ = () => {
  const [open, setOpen] = useState(null);
  return (
    <section className="faq">
      <div className="faq-inner">
        <div className="section-tag">FAQ</div>
        <h2>Frequently Asked Questions</h2>
        <p>Everything you need to know about MediLink.</p>
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div className={`faq-item ${open === i ? "faq-item--open" : ""}`} key={i}>
              <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                <span>{f.q}</span>
                <ChevronDown size={20} className="faq-chevron" />
              </button>
              <div className="faq-answer-wrap">
                <p className="faq-answer">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
