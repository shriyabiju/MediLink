import { useState, useEffect } from "react";
import { patientApi } from "../../services/api";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState("");
  const [error,   setError]   = useState("");

  useEffect(() => {
    patientApi.getProfile()
      .then((d) => { setProfile(d.user); setDraft(d.user); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      const d = await patientApi.updateProfile({
        name: draft.name, phone: draft.phone, city: draft.city,
        address: draft.address, bloodGroup: draft.bloodGroup,
      });
      setProfile(d.user);
      setEditing(false);
      setSuccess("Profile updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const set = (k, v) => setDraft((p) => ({ ...p, [k]: v }));

  if (loading) return (
    <div className="page-body" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <p style={{ color: "#94A3B8" }}>Loading…</p>
    </div>
  );

  return (
    <div className="page-body">
      <div className="page-header animate-fade-up">
        <h1>👤 My Profile</h1>
        <p>Manage your personal and health information.</p>
      </div>

      <div className="section-card" style={{ maxWidth: 560 }}>
        {success && <div style={{ background: "#D1FAE5", color: "#065F46", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontWeight: 600 }}>✅ {success}</div>}
        {error   && <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "10px 14px", borderRadius: 8, marginBottom: 14 }}>{error}</div>}

        {!editing ? (
          <>
            <div className="profile-details">
              {[
                ["Full Name",    profile?.name       || "—"],
                ["Email",        profile?.email      || "—"],
                ["Phone",        profile?.phone      || "Not set"],
                ["Blood Group",  profile?.bloodGroup || "Not set"],
                ["City",         profile?.city       || "Not set"],
                ["Address",      profile?.address    || "Not set"],
              ].map(([label, value]) => (
                <div key={label} className="profile-row">
                  <span className="label">{label}</span>
                  <span className="value" style={label === "Blood Group" ? { color: "#EF4444", fontWeight: 700 } : {}}>{value}</span>
                </div>
              ))}
            </div>
            <button
              className="btn-primary"
              style={{ marginTop: 20, width: "100%" }}
              onClick={() => { setDraft(profile); setEditing(true); }}
            >
              ✏️ Edit Profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              ["Full Name", "name",    "text", "John Doe"],
              ["Phone",     "phone",   "tel",  "+91 XXXXX XXXXX"],
              ["City",      "city",    "text", "Mumbai"],
              ["Address",   "address", "text", "Street, Area..."],
            ].map(([label, key, type, ph]) => (
              <div key={key}>
                <label style={{ display: "block", fontWeight: 600, marginBottom: 5, fontSize: 14 }}>{label}</label>
                <input
                  type={type}
                  placeholder={ph}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none" }}
                  value={draft[key] || ""}
                  onChange={(e) => set(key, e.target.value)}
                />
              </div>
            ))}

            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 5, fontSize: 14 }}>Blood Group</label>
              <select
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, outline: "none", background: "#fff" }}
                value={draft.bloodGroup || ""}
                onChange={(e) => set("bloodGroup", e.target.value)}
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={() => setEditing(false)}
                style={{ flex: 1, padding: 12, borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#2563EB", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
