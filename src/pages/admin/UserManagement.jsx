import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Search, AlertTriangle, UserX } from "lucide-react";
import { adminApi } from "../../services/api";
import "../admin/css/admin.css";

const ROLE_BADGE = {
  patient:  <span className="ad-badge ad-badge--info">Patient</span>,
  donor:    <span className="ad-badge" style={{ background: "var(--danger-soft)", color: "#991B1B" }}>Donor</span>,
  admin:    <span className="ad-badge ad-badge--purple">Admin</span>,
  hospital: <span className="ad-badge" style={{ background: "var(--info-soft)", color: "#075985" }}>Hospital</span>,
};

export default function UserManagement({ showToast }) {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState("");

  const fetchUsers = useCallback(() => {
    setLoading(true);
    setError("");
    const params = roleFilter !== "all" ? { role: roleFilter } : {};
    adminApi.getUsers(params)
      .then((d) => setUsers(d.users))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}? They will no longer be able to log in.`)) return;
    setActionLoading(id);
    try {
      await adminApi.deactivateUser(id);
      showToast("success", `${name} has been deactivated.`);
      fetchUsers();
    } catch (e) {
      showToast("error", e.message);
    } finally { setActionLoading(""); }
  };

  const handleReactivate = async (id, name) => {
    if (!window.confirm(`Reactivate ${name}? They will be able to log in again.`)) return;
    setActionLoading(id);
    try {
      await adminApi.reactivateUser(id);
      showToast("success", `${name} has been reactivated.`);
      fetchUsers();
    } catch (e) {
      showToast("error", e.message);
    } finally { setActionLoading(""); }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="ad-page-header">
        <div>
          <h1>User Management</h1>
          <p>View and manage all registered MediLink users.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "var(--danger-soft)", border: "1px solid var(--danger)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: "var(--space-5)", color: "#991B1B", fontSize: "var(--text-sm)", display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      <div className="ad-search-bar">
        <div className="ad-search-wrap">
          <Search size={15} className="ad-search-icon" />
          <input placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search users" />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{ padding: "9px 14px", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontFamily: "inherit", fontSize: "var(--text-sm)", background: "#F9FAFB", cursor: "pointer", outline: "none" }}
          aria-label="Filter by role"
        >
          <option value="all">All Roles</option>
          <option value="patient">Patients</option>
          <option value="donor">Donors</option>
          <option value="admin">Admins</option>
        </select>
        <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading ? (
        <div className="ad-loading"><div className="ad-spinner" /><span>Loading users…</span></div>
      ) : filtered.length === 0 ? (
        <div className="ad-empty">
          <div className="ad-empty__icon"><Users size={28} /></div>
          <h3>No users found</h3>
          <p>{search ? "Try a different search term." : "No users registered yet."}</p>
        </div>
      ) : (
        <div className="ad-card" style={{ padding: 0 }}>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--primary-soft)", color: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: ".75rem", flexShrink: 0 }}>
                          {u.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text)" }}>{u.name}</p>
                          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{ROLE_BADGE[u.role] ?? <span className="ad-badge ad-badge--neutral">{u.role}</span>}</td>
                    <td>
                      {u.isActive
                        ? <span className="ad-badge ad-badge--approved">Active</span>
                        : <span className="ad-badge ad-badge--rejected">Inactive</span>}
                    </td>
                    <td style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {u.isActive && u.role !== "admin" && (
                          <button
                            className="ad-btn ad-btn--outline ad-btn--sm"
                            onClick={() => handleDeactivate(u._id, u.name)}
                            disabled={actionLoading === u._id}
                            style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
                          >
                            <UserX size={13} /> {actionLoading === u._id ? "…" : "Deactivate"}
                          </button>
                        )}
                        {!u.isActive && (
                          <button
                            className="ad-btn ad-btn--success ad-btn--sm"
                            onClick={() => handleReactivate(u._id, u.name)}
                            disabled={actionLoading === u._id}
                          >
                            {actionLoading === u._id ? "…" : "Reactivate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
