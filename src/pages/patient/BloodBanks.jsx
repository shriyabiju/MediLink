import { useState, useEffect, useCallback } from "react";
import { Search, Droplet, Phone, MapPin } from "lucide-react";
import { patientApi } from "../../services/api";

function formatPrice(price) {
  if (!price || price <= 0) return "Price not available";
  return `₹${price}/unit`;
}

export default function BloodBanks() {
  const [banks,    setBanks]    = useState([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState("");
  const [search,   setSearch]   = useState("");

  const fetchBanks = useCallback((q = "") => {
    setLoading(true);
    patientApi.getBloodBanks(q)
      .then((d) => setBanks(d.bloodBanks || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBanks(); }, [fetchBanks]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchBanks(e.target.value);
  };

  return (
    <div className="page-body">
      <div className="page-header animate-fade-up">
        <h1>🏦 Blood Banks</h1>
        <p>Browse approved blood banks and their available stock</p>
      </div>

      {error && (
        <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: 10, marginBottom: 16 }}>
          ❌ {error}
        </div>
      )}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 400 }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
        <input
          placeholder="Search by name or city…"
          value={search}
          onChange={handleSearch}
          style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", fontFamily: "inherit" }}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#94A3B8", marginTop: 24 }}>Loading…</p>
      ) : banks.length === 0 ? (
        <div className="section-card" style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>
          <Droplet size={28} style={{ marginBottom: 10, color: "#CBD5E1" }} />
          <p>{search ? "No blood banks match your search." : "No approved blood banks yet."}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {banks.map((b) => (
            <div key={b._id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "16px 18px", background: "linear-gradient(135deg, #1E3A8A, #2563EB)", color: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>🏦</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{b.name}</p>
                    <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.7)" }}>Blood Bank</p>
                  </div>
                </div>
                {b.city && <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 5 }}><MapPin size={12} /> {[b.address, b.city, b.state].filter(Boolean).join(", ")}</p>}
                {b.phone && <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}><Phone size={12} /> {b.phone}</p>}
              </div>

              {/* Stock */}
              <div style={{ padding: "16px 18px" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>Available Blood</p>
                {b.stock.length === 0 ? (
                  <p style={{ color: "#94A3B8", fontSize: "0.82rem", padding: "10px 0" }}>No stock currently available</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {b.stock.map((s, i) => (
                      <div key={i} style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", minWidth: 100 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: "#FEE2E2", border: "2px solid #EF4444", fontWeight: 800, fontSize: "0.72rem", color: "#991B1B" }}>{s.bloodGroup}</span>
                          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0F172A" }}>{s.units}u</span>
                        </div>
                        <p style={{ fontSize: "0.7rem", color: s.pricePerUnit > 0 ? "#065F46" : "#94A3B8", fontWeight: 600 }}>{formatPrice(s.pricePerUnit)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
