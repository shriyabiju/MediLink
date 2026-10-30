import { AlertCircle, ArrowRight, Heart } from "lucide-react";

/**
 * Emergency / Need Blood page.
 * Patients cannot send emergency requests directly to donors.
 * Only approved hospitals manage emergency donor requests.
 * Patients submit blood requests to hospitals via Book Appointment.
 */
const Emergency = ({ onNavigate }) => {
  const steps = [
    "Go to Hospitals and find a hospital near you.",
    "Click Book Appointment on the hospital card.",
    "Fill in your blood group, units needed, and urgency.",
    "Submit — the hospital receives your request immediately.",
    "Track your request status in My Requests.",
  ];

  return (
    <div className="page-body">
      <div className="page-header animate-fade-up">
        <h1>🚨 Need Blood Urgently?</h1>
        <p>Here is how to get help as quickly as possible.</p>
      </div>

      {/* Main guidance card */}
      <div className="section-card" style={{ maxWidth: 640, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "#FEE2E2", color: "#EF4444",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Heart size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>
              Submit a Blood Request to a Hospital
            </h2>
            <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.6 }}>
              Emergency blood requests to donors are managed by hospitals only.
              To request blood urgently, submit a request to a hospital.
              The hospital will review your request and coordinate with verified donors on your behalf.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
          <p style={{
            fontSize: "0.8rem", fontWeight: 700, color: "#64748B",
            textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12,
          }}>
            Steps to get blood quickly
          </p>
          <ol style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            {steps.map((step, i) => (
              <li key={i} style={{ color: "#334155", fontSize: "0.875rem", lineHeight: 1.5 }}>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => onNavigate?.("hospitals")}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "11px 20px", borderRadius: 10, border: "none",
              background: "#EF4444", color: "#fff", fontWeight: 700,
              fontSize: "0.875rem", cursor: "pointer",
            }}
          >
            <span>🏥</span> Find Hospitals &amp; Book Appointment <ArrowRight size={16} />
          </button>
          <button
            onClick={() => onNavigate?.("my-requests")}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "11px 20px", borderRadius: 10,
              border: "1.5px solid #E2E8F0", background: "#fff",
              color: "#475569", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer",
            }}
          >
            View My Requests
          </button>
        </div>
      </div>

      {/* Info note */}
      <div className="section-card" style={{ maxWidth: 640, background: "#FFF7ED", borderColor: "#FED7AA" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertCircle size={18} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontWeight: 700, color: "#92400E", fontSize: "0.875rem", marginBottom: 4 }}>
              Why can patients not send requests directly to donors?
            </p>
            <p style={{ color: "#78350F", fontSize: "0.82rem", lineHeight: 1.6 }}>
              MediLink protects donor privacy. Donor contact details and identity documents are only
              accessible to verified hospitals. When you submit a request to a hospital, they
              coordinate with suitable donors directly. This ensures donors are contacted safely
              and requests are properly verified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
