import { useState, useEffect } from "react";
import { X, Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { patientApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const URGENCY_LEVELS = [
  { value: "Normal",   label: "Normal",   color: "#10B981", bg: "#ECFDF5" },
  { value: "Urgent",   label: "Urgent",   color: "#F59E0B", bg: "#FFFBEB" },
  { value: "Emergency", label: "Emergency", color: "#EF4444", bg: "#FEF2F2" },
];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve({ data: base64, fileName: file.name, contentType: file.type || "application/octet-stream" });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function BloodRequestForm({ preselectedHospital, onClose, onSuccess }) {
  const { user } = useAuth();

  const [form, setForm] = useState({
    hospitalId:   preselectedHospital?._id || "",
    patientName:   user?.name  || "",
    patientAge:    "",
    patientGender: "",
    patientPhone:  user?.phone || "",
    patientEmail:  user?.email || "",
    patientCity:   user?.city  || "",
    patientAddress:"",
    bloodGroup:    user?.bloodGroup || "",
    unitsNeeded:   1,
    urgency:       "Normal",
    requiredDate:  "",
    requiredTime:  "",
    reason:        "",
    notes:         "",
  });
  const [hospitals, setHospitals] = useState([]);
  const [hospLoading, setHospLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* Fetch available hospitals if none preselected */
  useEffect(() => {
    if (preselectedHospital) { setHospLoading(false); return; }
    patientApi.getHospitals()
      .then((d) => setHospitals(d.hospitals || []))
      .catch(() => {})
      .finally(() => setHospLoading(false));
  }, [preselectedHospital]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    const valid = [];
    for (const f of files) {
      if (f.size > 5 * 1024 * 1024) { setError(`"${f.name}" exceeds 5 MB limit.`); continue; }
      const okType = ["application/pdf", "image/png", "image/jpeg", "image/jpg"].includes(f.type);
      if (!okType) { setError(`"${f.name}" is not a supported type. Use PDF, JPG, or PNG.`); continue; }
      const base64 = await fileToBase64(f);
      valid.push(base64);
    }
    if (valid.length > 0) { setDocs((p) => [...p, ...valid]); setError(""); }
  };

  const removeDoc = (idx) => setDocs((p) => p.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");

    if (!form.hospitalId)  { setError("Please select a hospital."); return; }
    if (!form.bloodGroup)  { setError("Please select a blood group."); return; }
    if (!form.patientName.trim()) { setError("Patient name is required."); return; }
    if (!form.patientPhone.trim()) { setError("Contact number is required."); return; }

    setLoading(true);
    try {
      const res = await patientApi.submitBloodRequest({
        ...form,
        documents: docs.length > 0 ? docs : undefined,
      });
      setSuccess(res.message || "Blood request submitted successfully!");
      setTimeout(() => { onSuccess?.(); onClose?.(); }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "9px 13px", borderRadius: 10,
    border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none",
    fontFamily: "inherit", background: "#fff",
  };

  const labelStyle = {
    fontSize: "0.78rem", fontWeight: 600, color: "#334155",
    marginBottom: 5, display: "block",
  };

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 600, padding: "20px 16px", overflowY: "auto" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 640, boxShadow: "0 24px 64px rgba(15,23,42,0.18)", overflow: "hidden", marginBottom: 20 }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0F172A" }}>🩸 Blood Request Form</h3>
            <p style={{ fontSize: "0.78rem", color: "#64748B" }}>Submit a blood request to a hospital</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: "1rem", color: "#64748B" }}>✕</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          {error && (
            <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {success && (
            <div style={{ background: "#D1FAE5", color: "#065F46", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle size={15} /> {success}
            </div>
          )}

          {/* ── A. Patient Information ── */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#2563EB", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #EFF6FF" }}>A. Patient Information</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Full Name <span style={{ color: "#EF4444" }}>*</span></label>
                <input style={inputStyle} value={form.patientName} onChange={(e) => set("patientName", e.target.value)} required />
              </div>
              <div>
                <label style={labelStyle}>Age</label>
                <input type="number" min="0" max="120" style={inputStyle} value={form.patientAge} onChange={(e) => set("patientAge", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Gender</label>
                <select style={inputStyle} value={form.patientGender} onChange={(e) => set("patientGender", e.target.value)}>
                  <option value="">— Select —</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Contact Number <span style={{ color: "#EF4444" }}>*</span></label>
                <input type="tel" style={inputStyle} value={form.patientPhone} onChange={(e) => set("patientPhone", e.target.value)} required />
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" style={inputStyle} value={form.patientEmail} onChange={(e) => set("patientEmail", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Current City</label>
                <input style={inputStyle} value={form.patientCity} onChange={(e) => set("patientCity", e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Full Address</label>
                <input style={inputStyle} value={form.patientAddress} onChange={(e) => set("patientAddress", e.target.value)} placeholder="Street, area, locality…" />
              </div>
            </div>
          </div>

          {/* ── B. Blood Requirement Details ── */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#2563EB", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #EFF6FF" }}>B. Blood Requirement Details</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Required Blood Group <span style={{ color: "#EF4444" }}>*</span></label>
                <select style={inputStyle} value={form.bloodGroup} onChange={(e) => set("bloodGroup", e.target.value)} required>
                  <option value="">— Select —</option>
                  {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Units Required <span style={{ color: "#EF4444" }}>*</span></label>
                <input type="number" min="1" style={inputStyle} value={form.unitsNeeded} onChange={(e) => set("unitsNeeded", +e.target.value)} required />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Urgency</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {URGENCY_LEVELS.map((u) => (
                    <button key={u.value} type="button" onClick={() => set("urgency", u.value)}
                      style={{
                        padding: "8px 16px", borderRadius: 10, border: "1.5px solid",
                        fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
                        borderColor: form.urgency === u.value ? u.color : "#E2E8F0",
                        background: form.urgency === u.value ? u.bg : "#fff",
                        color: form.urgency === u.value ? u.color : "#64748B",
                      }}>
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Required Date</label>
                <input type="date" style={inputStyle} value={form.requiredDate} onChange={(e) => set("requiredDate", e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Required Time</label>
                <input type="time" style={inputStyle} value={form.requiredTime} onChange={(e) => set("requiredTime", e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Reason for Requiring Blood</label>
                <input style={inputStyle} value={form.reason} onChange={(e) => set("reason", e.target.value)} placeholder="e.g. Surgery, anemia, accident…" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Additional Medical Notes</label>
                <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any additional information for the hospital…" />
              </div>
            </div>
          </div>

          {/* ── C. Hospital Information ── */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#2563EB", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #EFF6FF" }}>C. Hospital Information</h4>
            {preselectedHospital ? (
              <div style={{ background: "#EFF6FF", borderRadius: 10, padding: "12px 16px", border: "1.5px solid #BFDBFE" }}>
                <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E40AF" }}>🏥 {preselectedHospital.name}</p>
                <p style={{ fontSize: "0.78rem", color: "#3B82F6" }}>{[preselectedHospital.city, preselectedHospital.state].filter(Boolean).join(", ")}</p>
                <input type="hidden" value={form.hospitalId} />
              </div>
            ) : hospLoading ? (
              <p style={{ color: "#94A3B8", fontSize: "0.85rem" }}>Loading hospitals…</p>
            ) : (
              <div>
                <label style={labelStyle}>Select Hospital <span style={{ color: "#EF4444" }}>*</span></label>
                <select style={inputStyle} value={form.hospitalId} onChange={(e) => set("hospitalId", e.target.value)} required>
                  <option value="">— Select a hospital —</option>
                  {hospitals.map((h) => (
                    <option key={h._id} value={h._id}>{h.name} — {h.city || "N/A"}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ── D. Required Documents ── */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#2563EB", marginBottom: 12, paddingBottom: 8, borderBottom: "2px solid #EFF6FF" }}>D. Required Documents</h4>
            <p style={{ fontSize: "0.75rem", color: "#64748B", marginBottom: 10 }}>
              Upload your doctor's prescription or blood request documents (PDF, JPG, PNG). Max 5 MB per file.
            </p>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" multiple onChange={handleFileSelect} id="doc-upload" style={{ display: "none" }} />
            <label htmlFor="doc-upload" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, border: "1.5px dashed #CBD5E1", background: "#F8FAFC", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, color: "#475569", marginBottom: 10 }}>
              <Upload size={15} /> Upload Documents
            </label>
            {docs.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {docs.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", borderRadius: 8, padding: "8px 12px", border: "1px solid #E2E8F0" }}>
                    <FileText size={15} style={{ color: "#2563EB", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.8rem", color: "#334155", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.fileName}</span>
                    <button type="button" onClick={() => removeDoc(i)} style={{ border: "none", background: "transparent", color: "#EF4444", cursor: "pointer", fontSize: "1rem", fontWeight: 700 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid #E2E8F0", paddingTop: 16 }}>
            <button type="button" onClick={onClose} style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", color: "#475569" }}>Cancel</button>
            <button type="submit" disabled={loading || !!success} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: loading || success ? "#94A3B8" : "#EF4444", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: loading || success ? "not-allowed" : "pointer" }}>
              {loading ? "Submitting…" : success ? "Submitted ✓" : "🩸 Submit Blood Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
