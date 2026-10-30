import { useState, useEffect, useCallback } from "react";
import { MapPin, Phone, Mail, Building2, Droplet, Eye, FileText } from "lucide-react";
import SearchBar from "./components/SearchBar";
import { patientApi } from "../../services/api";
import BloodRequestForm from "./BloodRequestForm";

function formatPrice(price) {
  if (!price || price <= 0) return "Price not available";
  return `₹${price}/unit`;
}

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [detailsModal, setDetailsModal] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [requestForm, setRequestForm] = useState(null);

  const fetchHospitals = useCallback((q = "") => {
    setLoading(true);
    patientApi.getHospitals(q)
      .then((d) => setHospitals(d.hospitals || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  const handleViewDetails = async (h) => {
    setDetailsModal({ loading: true });
    setDetailsError("");
    try {
      const d = await patientApi.getHospitalDetails(h._id);
      setDetailsModal({ hospital: d.hospital, loading: false });
    } catch (e) {
      setDetailsModal({ error: e.message, loading: false });
    }
  };

  const handleBookAppointment = (h) => {
    setRequestForm(h);
  };

  return (
    <div className="page-body">
      <div className="page-header animate-fade-up">
        <h1>🏥 Find Hospitals</h1>
        <p>Search for approved hospitals and submit blood requests</p>
      </div>

      <SearchBar placeholder="Search by name or city…" onSearch={(q) => fetchHospitals(q)} />

      {loading ? (
        <p style={{ textAlign: "center", color: "#94A3B8", marginTop: 24 }}>Loading…</p>
      ) : hospitals.length === 0 ? (
        <p style={{ textAlign: "center", color: "#94A3B8", marginTop: 24 }}>No approved hospitals found.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20, marginTop: 20 }}>
          {hospitals.map((h) => (
            <div key={h._id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "16px 18px", background: "linear-gradient(135deg, #0F2462, #1E3A8A)", color: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{h.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.7)" }}>{h.hospitalType || "Hospital"}</p>
                  </div>
                </div>
                {h.city && (
                  <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={12} /> {[h.address, h.city, h.state].filter(Boolean).join(", ")}
                  </p>
                )}
                {h.phone && (
                  <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginTop: 3, display: "flex", alignItems: "center", gap: 5 }}>
                    <Phone size={12} /> {h.phone}
                  </p>
                )}
              </div>
              <div style={{ padding: "14px 18px", flex: 1 }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Contact</p>
                <p style={{ fontSize: "0.82rem", color: "#475569", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <Mail size={13} style={{ color: "#94A3B8" }} /> {h.email || "No email"}
                </p>
                {h.registrationNumber && (
                  <p style={{ fontSize: "0.78rem", color: "#64748B", marginTop: 4 }}>
                    Reg. No: {h.registrationNumber}
                  </p>
                )}
              </div>
              {/* Action buttons */}
              <div style={{ padding: "0 18px 16px", display: "flex", gap: 8 }}>
                <button
                  onClick={() => handleViewDetails(h)}
                  style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                >
                  <Eye size={14} /> View Details
                </button>
                <button
                  onClick={() => handleBookAppointment(h)}
                  style={{ flex: 1.2, padding: "9px 12px", borderRadius: 10, border: "none", background: "#2563EB", color: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}
                >
                  <FileText size={14} /> Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── View Details Modal ── */}
      {detailsModal && (
        <div
          onClick={() => setDetailsModal(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 500, padding: "20px 16px", overflowY: "auto" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, boxShadow: "0 24px 64px rgba(15,23,42,0.18)", overflow: "hidden", marginBottom: 20 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #E2E8F0" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A" }}>🏥 Hospital Details</h3>
              <button onClick={() => setDetailsModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: "1rem" }}>✕</button>
            </div>

            {detailsModal.loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>Loading hospital details…</div>
            ) : detailsModal.error ? (
              <div style={{ padding: 24, color: "#991B1B" }}>❌ {detailsModal.error}</div>
            ) : detailsModal.hospital ? (
              <div style={{ padding: 24 }}>
                {/* Hospital header */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Building2 size={24} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>{detailsModal.hospital.name}</p>
                    <p style={{ fontSize: "0.78rem", color: "#64748B" }}>{detailsModal.hospital.hospitalType || "Hospital"}</p>
                  </div>
                </div>

                {/* Details grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <DetailRow icon={<MapPin size={14} />} label="City" value={detailsModal.hospital.city || "—"} />
                  <DetailRow icon={<Building2 size={14} />} label="State" value={detailsModal.hospital.state || "—"} />
                  <DetailRow icon={<Phone size={14} />} label="Phone" value={detailsModal.hospital.phone || "—"} />
                  <DetailRow icon={<Mail size={14} />} label="Email" value={detailsModal.hospital.email || "—"} />
                  <DetailRow icon={<MapPin size={14} />} label="Address" value={detailsModal.hospital.address || "—"} />
                  <DetailRow icon={<FileText size={14} />} label="Reg. No" value={detailsModal.hospital.registrationNumber || "—"} />
                </div>

                {/* Blood stock */}
                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 16 }}>
                  <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0F172A", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                    <Droplet size={16} style={{ color: "#EF4444" }} /> Available Blood Stock
                  </p>
                  {detailsModal.hospital.bloodStock?.length > 0 ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {detailsModal.hospital.bloodStock.map((s, i) => (
                        <div key={i} style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", minWidth: 110 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "#FEE2E2", border: "2px solid #EF4444", fontWeight: 800, fontSize: "0.72rem", color: "#991B1B" }}>{s.bloodGroup}</span>
                            <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{s.units}u</span>
                          </div>
                          <p style={{ fontSize: "0.68rem", color: s.pricePerUnit > 0 ? "#065F46" : "#94A3B8", fontWeight: 600 }}>{formatPrice(s.pricePerUnit)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "#94A3B8", fontSize: "0.82rem" }}>No blood stock currently available.</p>
                  )}
                </div>

                {/* Book appointment button in modal */}
                <button
                  onClick={() => { setDetailsModal(null); handleBookAppointment(detailsModal.hospital); }}
                  style={{ width: "100%", marginTop: 20, padding: "11px", borderRadius: 10, border: "none", background: "#2563EB", color: "#fff", fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <FileText size={16} /> Book Appointment / Request Blood
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Blood Request Form Modal ── */}
      {requestForm && (
        <BloodRequestForm
          preselectedHospital={requestForm}
          onClose={() => setRequestForm(null)}
          onSuccess={() => setRequestForm(null)}
        />
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div>
      <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3, display: "flex", alignItems: "center", gap: 4 }}>{icon} {label}</p>
      <p style={{ fontSize: "0.85rem", color: "#0F172A", fontWeight: 500 }}>{value}</p>
    </div>
  );
}
