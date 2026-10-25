import { useState, useEffect, useCallback } from "react";
import { Search, Droplet, Phone, MapPin, Building, Banknote, AlertCircle } from "lucide-react";
import { patientApi } from "../../services/api";

const BLOOD_GROUPS = ["all", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const SOURCES = ["all", "hospital", "bloodbank"];

function formatPrice(price) {
  if (!price || price <= 0) return "Price not available";
  return `₹${price}/unit`;
}

export default function BloodSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [bloodGroup, setBloodGroup] = useState("all");
  const [location,   setLocation]   = useState("");
  const [source,     setSource]     = useState("all");
  const [requestModal, setRequestModal] = useState(null);
  const [requestQty,   setRequestQty]   = useState(1);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitResult,  setSubmitResult]  = useState("");

  const fetchResults = useCallback(() => {
    setLoading(true);
    setError("");
    const params = {};
    if (bloodGroup !== "all") params.bloodGroup = bloodGroup;
    if (location.trim())       params.location  = location.trim();
    if (source !== "all")      params.source    = source;

    patientApi.bloodSearch(params)
      .then((d) => setResults(d.results))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bloodGroup, location, source]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const openRequestModal = (item, stockEntry) => {
    setRequestModal({ item, stockEntry });
    setRequestQty(1);
    setSubmitResult("");
  };

  const handleSubmitRequest = async () => {
    if (!requestModal) return;
    setSubmitLoading(true);
    setSubmitResult("");
    try {
      const { item, stockEntry } = requestModal;
      await patientApi.submitEmergency({
        hospitalName: item.name,
        hospitalCity: item.city || "",
        bloodGroup:   stockEntry.bloodGroup,
        unitsNeeded:  requestQty,
        urgency:     "High",
        notes:        `Request to ${item.source === "hospital" ? "hospital" : "blood bank"}: ${item.name}. ${stockEntry.units} units available. ${formatPrice(stockEntry.pricePerUnit)}.`,
      });
      setSubmitResult("✅ Request submitted! The hospital/blood bank will be notified.");
      setTimeout(() => setRequestModal(null), 2500);
    } catch (e) {
      setSubmitResult(`❌ ${e.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const estimateCost = (price, qty) => {
    if (!price || price <= 0) return "Price not available";
    return `₹${price * qty} (₹${price} × ${qty})`;
  };

  return (
    <div className="page-body">
      <div className="page-header animate-fade-up">
        <h1>🩸 Blood Search</h1>
        <p>Find available blood across hospitals and blood banks</p>
      </div>

      {/* Filters */}
      <div className="section-card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {/* Blood group */}
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 4, display: "block" }}>Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", background: "#fff", fontFamily: "inherit" }}
            >
              {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g === "all" ? "All Groups" : g}</option>)}
            </select>
          </div>

          {/* Source */}
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 4, display: "block" }}>Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", background: "#fff", fontFamily: "inherit" }}
            >
              {SOURCES.map((s) => <option key={s} value={s}>{s === "all" ? "All Sources" : s === "hospital" ? "Hospitals" : "Blood Banks"}</option>)}
            </select>
          </div>

          {/* Location */}
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 4, display: "block" }}>Location</label>
            <div style={{ position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
              <input
                placeholder="Search by city or name…"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", fontFamily: "inherit" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "12px 16px", borderRadius: 10, marginBottom: 16 }}>
          <AlertCircle size={15} style={{ display: "inline", marginRight: 6 }} />{error}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#94A3B8", marginTop: 24 }}>Loading…</p>
      ) : results.length === 0 ? (
        <div className="section-card" style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>
          <Droplet size={28} style={{ marginBottom: 10, color: "#CBD5E1" }} />
          <p>No blood available with the selected filters.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {results.map((item) => (
            <div key={`${item.source}-${item.sourceId}`} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ padding: "14px 18px", background: item.source === "hospital" ? "linear-gradient(135deg, #0F2462, #1E3A8A)" : "linear-gradient(135deg, #1E3A8A, #2563EB)", color: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                    {item.source === "hospital" ? "🏥" : "🏦"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                    <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)" }}>{item.source === "hospital" ? "Hospital" : "Blood Bank"}</p>
                  </div>
                </div>
                {(item.city || item.address) && (
                  <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                    <MapPin size={11} /> {[item.address, item.city, item.state].filter(Boolean).join(", ")}
                  </p>
                )}
                {item.phone && (
                  <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.8)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                    <Phone size={11} /> {item.phone}
                  </p>
                )}
              </div>

              {/* Stock entries */}
              <div style={{ padding: "14px 18px" }}>
                {item.bloodStock.map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < item.bloodStock.length - 1 ? "1px solid #F1F5F9" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: "50%", background: "#FEE2E2", border: "2px solid #EF4444", fontWeight: 800, fontSize: "0.72rem", color: "#991B1B" }}>{s.bloodGroup}</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0F172A" }}>{s.units} unit{s.units !== 1 ? "s" : ""}</p>
                        <p style={{ fontSize: "0.7rem", color: s.pricePerUnit > 0 ? "#065F46" : "#94A3B8", fontWeight: 600 }}>
                          <Banknote size={10} style={{ display: "inline", marginRight: 3 }} />{formatPrice(s.pricePerUnit)}
                        </p>
                        {s.updatedAt && (
                          <p style={{ fontSize: "0.65rem", color: "#94A3B8", marginTop: 2 }}>
                            Updated {new Date(s.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => openRequestModal(item, s)}
                      style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      Request
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {requestModal && (
        <div onClick={() => setRequestModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440, boxShadow: "0 24px 64px rgba(15,23,42,0.18)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #E2E8F0" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A" }}>Request Blood</h3>
              <button onClick={() => setRequestModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: "0.9rem", color: "#64748B" }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              {submitResult && (
                <div style={{ padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: "0.85rem", fontWeight: 500, background: submitResult.startsWith("✅") ? "#D1FAE5" : "#FEE2E2", color: submitResult.startsWith("✅") ? "#065F46" : "#991B1B" }}>
                  {submitResult}
                </div>
              )}

              {/* Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B", fontSize: "0.82rem" }}>Source</span>
                  <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{requestModal.item.source === "hospital" ? "🏥 Hospital" : "🏦 Blood Bank"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B", fontSize: "0.82rem" }}>Name</span>
                  <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{requestModal.item.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B", fontSize: "0.82rem" }}>Blood Group</span>
                  <span style={{ fontWeight: 800, color: "#EF4444", fontSize: "0.85rem" }}>{requestModal.stockEntry.bloodGroup}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B", fontSize: "0.82rem" }}>Available</span>
                  <span style={{ fontWeight: 600, fontSize: "0.82rem" }}>{requestModal.stockEntry.units} units</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B", fontSize: "0.82rem" }}>Price per Unit</span>
                  <span style={{ fontWeight: 600, fontSize: "0.82rem", color: requestModal.stockEntry.pricePerUnit > 0 ? "#065F46" : "#94A3B8" }}>{formatPrice(requestModal.stockEntry.pricePerUnit)}</span>
                </div>
              </div>

              {/* Quantity */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 6, display: "block" }}>Units Needed</label>
                <input
                  type="number" min="1" max={requestModal.stockEntry.units}
                  value={requestQty}
                  onChange={(e) => setRequestQty(Math.max(1, Math.min(requestModal.stockEntry.units, +e.target.value)))}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", fontFamily: "inherit" }}
                />
              </div>

              {/* Price estimate */}
              <div style={{ background: "#F8FAFC", borderRadius: 10, padding: "12px 16px", marginBottom: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.82rem", color: "#64748B", fontWeight: 600 }}>Estimated Cost</span>
                  <span style={{ fontSize: "1rem", fontWeight: 800, color: requestModal.stockEntry.pricePerUnit > 0 ? "#065F46" : "#94A3B8" }}>
                    {estimateCost(requestModal.stockEntry.pricePerUnit, requestQty)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmitRequest}
                disabled={submitLoading || submitResult.startsWith("✅")}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: submitLoading || submitResult.startsWith("✅") ? "#94A3B8" : "#EF4444", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: submitLoading || submitResult.startsWith("✅") ? "not-allowed" : "pointer" }}
              >
                {submitLoading ? "Submitting…" : "🩸 Submit Blood Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
