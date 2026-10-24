import { useState, useEffect, useCallback } from "react";
import SearchBar from "./components/SearchBar";
import { patientApi } from "../../services/api";

function formatPrice(price) {
  if (!price || price <= 0) return "Price not available";
  return `₹${price}/unit`;
}

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading,   setLoading]   = useState(true);

  const fetchHospitals = useCallback((q = "") => {
    setLoading(true);
    patientApi.getHospitals(q)
      .then((d) => setHospitals(d.hospitals))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchHospitals(); }, [fetchHospitals]);

  const handleSearch = (q) => { fetchHospitals(q); };

  return (
    <div className="page-body">
      <div className="page-header animate-fade-up">
        <h1>🏥 Find Hospitals</h1>
        <p>Search for approved hospitals near you</p>
      </div>

      <SearchBar placeholder="Search by name or city…" onSearch={handleSearch} />

      {loading ? (
        <p style={{ textAlign: "center", color: "#94A3B8", marginTop: 24 }}>Loading…</p>
      ) : hospitals.length === 0 ? (
        <p style={{ textAlign: "center", color: "#94A3B8", marginTop: 24 }}>
          No approved hospitals found.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20, marginTop: 20 }}>
          {hospitals.map((h) => (
            <div key={h._id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <div style={{ padding: "16px 18px", background: "linear-gradient(135deg, #0F2462, #1E3A8A)", color: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🏥</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{h.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.7)" }}>{h.hospitalType || "Hospital"}</p>
                  </div>
                </div>
                {h.city && <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.8)" }}>📍 {[h.address, h.city, h.state].filter(Boolean).join(", ")}</p>}
                {h.phone && <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginTop: 3 }}>📞 {h.phone}</p>}
                {h.totalBeds > 0 && <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", marginTop: 3 }}>🛏 {h.totalBeds} beds</p>}
              </div>
              <div style={{ padding: "16px 18px" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Contact</p>
                <p style={{ fontSize: "0.82rem", color: "#475569", marginBottom: 4 }}>{h.email || "No email"}</p>
                <p style={{ fontSize: "0.82rem", color: "#475569" }}>{h.phone || "No phone"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Hospitals;
