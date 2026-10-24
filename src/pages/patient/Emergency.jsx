import { useState } from "react";
import { patientApi } from "../../services/api";
import { useAuth }    from "../../context/AuthContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const Emergency = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    hospitalName: "",
    hospitalCity: "",
    bloodGroup:   user?.bloodGroup || "A+",
    unitsNeeded:  1,
    urgency:      "High",
    notes:        "",
  });
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const d = await patientApi.submitEmergency(form);
      setSuccess(d.message || "Emergency request submitted!");
      setForm({ hospitalName: "", hospitalCity: "", bloodGroup: "A+", unitsNeeded: 1, urgency: "High", notes: "" });
    } catch (err) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div className="page-header animate-fade-up">
        <h1>🚨 Emergency Blood Request</h1>
        <p>Submit an emergency request — donors will be notified immediately.</p>
      </div>

      <div className="section-card" style={{ maxWidth: 600 }}>
        {success && (
          <div style={{ background: "#D1FAE5", color: "#065F46", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontWeight: 600 }}>
            ✅ {success}
          </div>
        )}
        {error && (
          <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontWeight: 600 }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
              Hospital Name <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              className="search-input"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
              placeholder="e.g. Apollo Hospital"
              value={form.hospitalName}
              onChange={(e) => set("hospitalName", e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>City</label>
            <input
              className="search-input"
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
              placeholder="e.g. Mumbai"
              value={form.hospitalCity}
              onChange={(e) => set("hospitalCity", e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>
                Blood Group <span style={{ color: "#EF4444" }}>*</span>
              </label>
              <select
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", background: "#fff" }}
                value={form.bloodGroup}
                onChange={(e) => set("bloodGroup", e.target.value)}
                required
              >
                {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Units Needed</label>
              <input
                type="number" min="1"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
                value={form.unitsNeeded}
                onChange={(e) => set("unitsNeeded", +e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Urgency</label>
            <div style={{ display: "flex", gap: 10 }}>
              {["Low", "Medium", "High", "Critical"].map((u) => (
                <button
                  key={u} type="button"
                  onClick={() => set("urgency", u)}
                  style={{
                    padding: "8px 16px", borderRadius: 20, border: "1.5px solid",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    borderColor: form.urgency === u ? ({ Low: "#10B981", Medium: "#F59E0B", High: "#F97316", Critical: "#EF4444" }[u]) : "#E2E8F0",
                    background: form.urgency === u ? ({ Low: "#ECFDF5", Medium: "#FFFBEB", High: "#FFF7ED", Critical: "#FEF2F2" }[u]) : "#fff",
                    color: form.urgency === u ? ({ Low: "#065F46", Medium: "#92400E", High: "#9A3412", Critical: "#991B1B" }[u]) : "#64748B",
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 14 }}>Additional Notes</label>
            <textarea
              style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", resize: "vertical", minHeight: 80 }}
              placeholder="Any additional details..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "13px", background: loading ? "#94A3B8" : "#EF4444", color: "#fff",
              borderRadius: 10, border: "none", fontWeight: 700, fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Submitting…" : "🚨 Submit Emergency Request"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Emergency;
