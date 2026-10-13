import { useState } from "react";
import {
  CalendarDays, Pill, FlaskConical, Clock,
  User, Download, Send, Bot, TrendingUp,
} from "lucide-react";
import "./css/dashboardHome.css";

/* ── Mock data (unchanged) ────────────────────── */

const STATS = [
  {
    id: 1, label: "Next Appointment", value: "Jul 24, 2026",
    sub: "Dr. Sarah Smith · Cardiology",
    icon: CalendarDays, color: "var(--primary-light)", bg: "var(--primary-soft)",
  },
  {
    id: 2, label: "Active Prescriptions", value: "4 Medicines",
    sub: "Last updated 2 days ago",
    icon: Pill, color: "var(--success)", bg: "var(--success-soft)",
  },
  {
    id: 3, label: "Recent Lab Reports", value: "3 Reports",
    sub: "1 new result available",
    icon: FlaskConical, color: "var(--warning)", bg: "var(--warning-soft)",
  },
];

const APPOINTMENTS = [
  { id: 1, doctor: "Dr. Sarah Smith",  specialty: "Cardiology",       date: "Jul 24, 2026", time: "10:00 AM", mode: "In-person", avatar: "SS" },
  { id: 2, doctor: "Dr. James Lee",    specialty: "General Physician", date: "Jul 28, 2026", time: "2:30 PM",  mode: "Online",    avatar: "JL" },
  { id: 3, doctor: "Dr. Priya Mehta",  specialty: "Dermatology",       date: "Aug 3, 2026",  time: "11:00 AM", mode: "In-person", avatar: "PM" },
];

const PRESCRIPTIONS = [
  { id: 1, medicine: "Metformin",    dosage: "500mg — Twice daily",   doctor: "Dr. James Lee",   date: "Jul 10, 2026" },
  { id: 2, medicine: "Amlodipine",   dosage: "5mg — Once daily",      doctor: "Dr. Sarah Smith", date: "Jul 15, 2026" },
  { id: 3, medicine: "Atorvastatin", dosage: "10mg — Once at night",  doctor: "Dr. Sarah Smith", date: "Jul 15, 2026" },
  { id: 4, medicine: "Cetirizine",   dosage: "10mg — As needed",      doctor: "Dr. Priya Mehta", date: "Jul 18, 2026" },
];

const AI_WELCOME = "Hi John! I'm your AI Health Assistant. Ask me anything about your health, symptoms, or medications.";
const AI_REPLY   = "Thanks for your question. Please consult your doctor for personalised medical advice. I can help you understand general health information.";

/* ── Component ──────────────────────────────── */

export default function DashboardHome() {
  const [aiInput,    setAiInput]    = useState("");
  const [aiMessages, setAiMessages] = useState([{ from: "ai", text: AI_WELCOME }]);

  const sendAi = () => {
    const t = aiInput.trim();
    if (!t) return;
    setAiMessages((p) => [...p, { from: "user", text: t }, { from: "ai", text: AI_REPLY }]);
    setAiInput("");
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAi(); } };

  return (
    <div className="dh-root">

      {/* ── Page header ── */}
      <div className="dh-page-header">
        <div>
          <h1>Good morning, John 👋</h1>
          <p>Here's an overview of your health activity today.</p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="dh-stats-grid">
        {STATS.map(({ id, label, value, sub, icon: Icon, color, bg }) => (
          <div className="dh-stat" key={id}>
            <div className="dh-stat__icon" style={{ background: bg, color }}>
              <Icon size={22} />
            </div>
            <div className="dh-stat__body">
              <p className="dh-stat__label">{label}</p>
              <p className="dh-stat__value" style={{ color }}>{value}</p>
              <p className="dh-stat__sub">{sub}</p>
            </div>
            <TrendingUp size={14} className="dh-stat__trend" style={{ color }} />
          </div>
        ))}
      </div>

      {/* ── Two-column: Appointments + AI ── */}
      <div className="dh-two-col">

        {/* Appointments */}
        <div className="dh-card">
          <div className="dh-card__header">
            <h3 className="dh-card__title">
              <CalendarDays size={16} /> Upcoming Appointments
            </h3>
            <button className="dh-link-btn">View all</button>
          </div>
          <div className="dh-appt-list">
            {APPOINTMENTS.map((a) => (
              <div className="dh-appt" key={a.id}>
                <div className="dh-appt__avatar">{a.avatar}</div>
                <div className="dh-appt__info">
                  <p className="dh-appt__name">{a.doctor}</p>
                  <p className="dh-appt__spec">{a.specialty}</p>
                  <div className="dh-appt__meta">
                    <span><CalendarDays size={12} />{a.date}</span>
                    <span><Clock size={12} />{a.time}</span>
                    <span className={`dh-mode ${a.mode === "Online" ? "dh-mode--online" : "dh-mode--inperson"}`}>
                      {a.mode}
                    </span>
                  </div>
                </div>
                <div className="dh-appt__actions">
                  <button className="dh-appt__btn dh-appt__btn--reschedule">Reschedule</button>
                  <button className="dh-appt__btn dh-appt__btn--cancel">Cancel</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI widget */}
        <div className="dh-card dh-ai">
          <div className="dh-card__header">
            <h3 className="dh-card__title"><Bot size={16} /> AI Health Assistant</h3>
            <button className="dh-link-btn">Full chat</button>
          </div>
          <div className="dh-ai__msgs">
            {aiMessages.map((m, i) => (
              <div key={i} className={`dh-ai__bubble dh-ai__bubble--${m.from}`}>
                {m.from === "ai" && (
                  <div className="dh-ai__bot-icon"><Bot size={13} /></div>
                )}
                <p>{m.text}</p>
              </div>
            ))}
          </div>
          <div className="dh-ai__input-row">
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask a health question…"
            />
            <button onClick={sendAi} aria-label="Send"><Send size={15} /></button>
          </div>
        </div>

      </div>

      {/* ── Prescriptions table ── */}
      <div className="dh-card">
        <div className="dh-card__header">
          <h3 className="dh-card__title"><Pill size={16} /> Recent Prescriptions</h3>
          <button className="dh-link-btn">View all</button>
        </div>
        <div className="dh-table-wrap">
          <table className="dh-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th><User size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />Doctor</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {PRESCRIPTIONS.map((rx, i) => (
                <tr key={rx.id}>
                  <td className="dh-table__num">{i + 1}</td>
                  <td className="dh-table__strong">{rx.medicine}</td>
                  <td>{rx.dosage}</td>
                  <td>{rx.doctor}</td>
                  <td>{rx.date}</td>
                  <td>
                    <button className="dh-dl-btn">
                      <Download size={13} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
