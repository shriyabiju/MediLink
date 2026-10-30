import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { bloodBankApi } from "../../services/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const statusColor = { Available: { bg: "#D1FAE5", color: "#065F46" }, Expired: { bg: "#FEE2E2", color: "#991B1B" }, Empty: { bg: "#F3F4F6", color: "#374151" } };

function getStatus(record) {
  if (record.units <= 0) return "Empty";
  if (new Date(record.expiresOn) <= new Date()) return "Expired";
  return "Available";
}

export default function BloodBankInventory() {
  const [stock,    setStock]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  const EMPTY = { bloodGroup: "A+", units: 1, pricePerUnit: 0, collectedOn: "", expiresOn: "" };
  const [form, setForm] = useState(EMPTY);

  const fetchStock = useCallback(() => {
    setLoading(true);
    bloodBankApi.getStock()
      .then((d) => setStock(d.stock || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const filtered = stock.filter((r) => r.bloodGroup.toLowerCase().includes(search.toLowerCase()));

  const openAdd  = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (r) => { setForm({ bloodGroup: r.bloodGroup, units: r.units, pricePerUnit: r.pricePerUnit, collectedOn: r.collectedOn ? r.collectedOn.split("T")[0] : "", expiresOn: r.expiresOn ? r.expiresOn.split("T")[0] : "" }); setEditing(r._id); setModal(true); };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this stock record?")) return;
    try { await bloodBankApi.deleteStock(id); fetchStock(); }
    catch (e) { alert(e.message); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await bloodBankApi.updateStock(editing, { units: form.units, pricePerUnit: form.pricePerUnit });
      else         await bloodBankApi.addStock(form);
      setModal(false);
      fetchStock();
    } catch (e) { alert(e.message); }
    finally { setSaving(false); }
  };

  const inputStyle = { width: "100%", padding: "9px 13px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: "0.875rem", outline: "none", fontFamily: "inherit" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0F172A", fontFamily: "Poppins, sans-serif" }}>Blood Inventory</h1>
          <p style={{ color: "#64748B", fontSize: "0.85rem" }}>Manage blood stock — add, update, or remove units</p>
        </div>
        <button onClick={openAdd} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #2563EB, #1E3A8A)", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
          <Plus size={16} /> Add Stock
        </button>
      </div>

      {error && <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: "0.875rem" }}>{error}</div>}

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 20, maxWidth: 300 }}>
        <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
        <input placeholder="Search by blood group…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: 34 }} />
      </div>

      {loading ? <p style={{ textAlign: "center", color: "#94A3B8" }}>Loading…</p> : (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0" }}>
                  {["Blood Group", "Units", "Price/Unit", "Collected", "Expires", "Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: "0.72rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 32, textAlign: "center", color: "#94A3B8" }}>No stock records yet.</td></tr>
                ) : filtered.map((r) => {
                  const st = getStatus(r);
                  const sc = statusColor[st];
                  return (
                    <tr key={r._id} style={{ borderBottom: "1px solid #F1F5F9", transition: "background 0.15s" }}>
                      <td style={{ padding: "14px 18px" }}><span style={{ fontWeight: 700, color: "#EF4444", fontSize: "1rem" }}>{r.bloodGroup}</span></td>
                      <td style={{ padding: "14px 18px", fontWeight: 600 }}>{r.units}</td>
                      <td style={{ padding: "14px 18px" }}>₹{r.pricePerUnit}</td>
                      <td style={{ padding: "14px 18px", color: "#64748B", fontSize: "0.78rem" }}>{r.collectedOn ? new Date(r.collectedOn).toLocaleDateString() : "—"}</td>
                      <td style={{ padding: "14px 18px", color: "#64748B", fontSize: "0.78rem" }}>{new Date(r.expiresOn).toLocaleDateString()}</td>
                      <td style={{ padding: "14px 18px" }}><span style={{ background: sc.bg, color: sc.color, padding: "3px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700 }}>{st}</span></td>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openEdit(r)} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Edit2 size={13} color="#64748B" /></button>
                          <button onClick={() => handleDelete(r._id)} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #FECACA", background: "#FEF2F2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} color="#EF4444" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div onClick={() => setModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(15,23,42,0.18)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #E2E8F0" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0F172A" }}>{editing ? "Edit Stock" : "Add Blood Stock"}</h3>
              <button onClick={() => setModal(false)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#F3F4F6", cursor: "pointer", fontSize: "1rem", color: "#64748B" }}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 5, display: "block" }}>Blood Group *</label>
                  <select style={inputStyle} value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} disabled={!!editing} required>
                    {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 5, display: "block" }}>Units *</label>
                    <input type="number" min="0" style={inputStyle} value={form.units} onChange={(e) => setForm({ ...form, units: +e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 5, display: "block" }}>Price per Unit (₹) *</label>
                    <input type="number" min="0" style={inputStyle} value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: +e.target.value })} required />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 5, display: "block" }}>Collected On</label>
                    <input type="date" style={inputStyle} value={form.collectedOn} onChange={(e) => setForm({ ...form, collectedOn: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", marginBottom: 5, display: "block" }}>Expires On *</label>
                    <input type="date" style={inputStyle} value={form.expiresOn} onChange={(e) => setForm({ ...form, expiresOn: e.target.value })} required />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid #E2E8F0" }}>
                <button type="button" onClick={() => setModal(false)} style={{ padding: "9px 18px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: saving ? "#94A3B8" : "#2563EB", color: "#fff", fontWeight: 700, fontSize: "0.85rem", cursor: saving ? "not-allowed" : "pointer" }}>{saving ? "Saving…" : editing ? "Save" : "Add Stock"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
