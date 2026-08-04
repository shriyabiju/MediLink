import { useState } from "react";
import {
  CalendarDays,
  Pill,
  FlaskConical,
  Clock,
  User,
  Download,
  Send,
  Bot,
} from "lucide-react";
import "./css/dashboardHome.css";

// ── Mock Data ────────────────────────────────────────────────────────────────

const quickStats = [
  {
    id: 1,
    label: "Next Appointment",
    value: "Jul 24, 2026",
    sub: "Dr. Sarah Smith — Cardiology",
    icon: CalendarDays,
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    id: 2,
    label: "Active Prescriptions",
    value: "4 Medicines",
    sub: "Last updated 2 days ago",
    icon: Pill,
    color: "#14B8A6",
    bg: "#F0FDFA",
  },
  {
    id: 3,
    label: "Recent Lab Reports",
    value: "3 Reports",
    sub: "1 new result available",
    icon: FlaskConical,
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
];

const appointments = [
  {
    id: 1,
    doctor: "Dr. Sarah Smith",
    specialty: "Cardiology",
    date: "Jul 24, 2026",
    time: "10:00 AM",
    mode: "In-person",
    avatar: "SS",
  },
  {
    id: 2,
    doctor: "Dr. James Lee",
    specialty: "General Physician",
    date: "Jul 28, 2026",
    time: "2:30 PM",
    mode: "Online",
    avatar: "JL",
  },
  {
    id: 3,
    doctor: "Dr. Priya Mehta",
    specialty: "Dermatology",
    date: "Aug 3, 2026",
    time: "11:00 AM",
    mode: "In-person",
    avatar: "PM",
  },
];

const prescriptions = [
  {
    id: 1,
    medicine: "Metformin",
    dosage: "500mg — Twice daily",
    doctor: "Dr. James Lee",
    date: "Jul 10, 2026",
  },
  {
    id: 2,
    medicine: "Amlodipine",
    dosage: "5mg — Once daily",
    doctor: "Dr. Sarah Smith",
    date: "Jul 15, 2026",
  },
  {
    id: 3,
    medicine: "Atorvastatin",
    dosage: "10mg — Once at night",
    doctor: "Dr. Sarah Smith",
    date: "Jul 15, 2026",
  },
  {
    id: 4,
    medicine: "Cetirizine",
    dosage: "10mg — As needed",
    doctor: "Dr. Priya Mehta",
    date: "Jul 18, 2026",
  },
];

// ── Component ────────────────────────────────────────────────────────────────

const DashboardHome = () => {
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([
    {
      from: "ai",
      text: "Hi John! I'm your AI Health Assistant. Ask me anything about your health, symptoms, or medications.",
    },
  ]);

  const handleAiSend = () => {
    const trimmed = aiInput.trim();
    if (!trimmed) return;
    setAiMessages((prev) => [
      ...prev,
      { from: "user", text: trimmed },
      {
        from: "ai",
        text: "Thanks for your question. Please consult your doctor for personalized medical advice. I can help you understand general health information.",
      },
    ]);
    setAiInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAiSend();
    }
  };

  return (
    <div className="dashboard-home">

      {/* ── Quick Stats ── */}
      <section className="section">
        <h3 className="section-title">Overview</h3>
        <div className="stats-grid">
          {quickStats.map(({ id, label, value, sub, icon: Icon, color, bg }) => (
            <div className="stat-card" key={id} style={{ borderTopColor: color }}>
              <div className="stat-icon" style={{ background: bg, color }}>
                <Icon size={22} />
              </div>
              <div className="stat-info">
                <p className="stat-label">{label}</p>
                <h3 className="stat-value" style={{ color }}>{value}</h3>
                <p className="stat-sub">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Two-column row: Appointments + AI Widget ── */}
      <div className="two-col-row">

        {/* Upcoming Appointments */}
        <section className="section appointments-section">
          <div className="section-header">
            <h3 className="section-title">Upcoming Appointments</h3>
            <button className="link-btn">View All</button>
          </div>
          <div className="appointments-list">
            {appointments.map((appt) => (
              <div className="appointment-card" key={appt.id}>
                <div className="appt-avatar">{appt.avatar}</div>
                <div className="appt-info">
                  <p className="appt-doctor">{appt.doctor}</p>
                  <p className="appt-specialty">{appt.specialty}</p>
                  <div className="appt-meta">
                    <span><CalendarDays size={13} /> {appt.date}</span>
                    <span><Clock size={13} /> {appt.time}</span>
                    <span className={`appt-mode ${appt.mode === "Online" ? "online" : "inperson"}`}>
                      {appt.mode}
                    </span>
                  </div>
                </div>
                <div className="appt-actions">
                  <button className="btn-reschedule">Reschedule</button>
                  <button className="btn-cancel">Cancel</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Health Assistant Widget */}
        <section className="section ai-section">
          <div className="section-header">
            <h3 className="section-title">
              <Bot size={18} style={{ marginRight: 6 }} />
              AI Health Assistant
            </h3>
            <button className="link-btn">Open Full Chat</button>
          </div>
          <div className="ai-messages">
            {aiMessages.map((msg, i) => (
              <div key={i} className={`ai-bubble ${msg.from}`}>
                {msg.from === "ai" && (
                  <div className="ai-avatar-icon"><Bot size={14} /></div>
                )}
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
          <div className="ai-input-row">
            <input
              type="text"
              placeholder="Ask a health question..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleAiSend} aria-label="Send">
              <Send size={16} />
            </button>
          </div>
        </section>

      </div>

      {/* ── Recent Prescriptions Table ── */}
      <section className="section prescriptions-section">
        <div className="section-header">
          <h3 className="section-title">Recent Prescriptions</h3>
          <button className="link-btn">View All</button>
        </div>
        <div className="table-wrapper">
          <table className="prescriptions-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th><User size={13} style={{ marginRight: 4 }} />Doctor</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((rx, index) => (
                <tr key={rx.id}>
                  <td>{index + 1}</td>
                  <td className="medicine-name">{rx.medicine}</td>
                  <td>{rx.dosage}</td>
                  <td>{rx.doctor}</td>
                  <td>{rx.date}</td>
                  <td>
                    <button className="btn-download" aria-label="Download PDF">
                      <Download size={14} />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default DashboardHome;
