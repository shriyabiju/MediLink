import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Download, Search, Droplets, Award } from "lucide-react";
import { DONATION_HISTORY } from "./data/sampleData";
import StatCard from "./components/StatCard";
import "./css/donor.css";

const STATUS_CLS = {
  Completed: "dd-badge--success",
  Pending:   "dd-badge--warning",
  Cancelled: "dd-badge--danger",
};

export default function DonationHistory() {
  const [search, setSearch] = useState("");

  const filtered = DONATION_HISTORY.filter((d) =>
    d.centre.toLowerCase().includes(search.toLowerCase()) ||
    d.date.toLowerCase().includes(search.toLowerCase()) ||
    d.bloodGroup.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnits = DONATION_HISTORY.reduce((sum, d) => sum + d.units, 0);

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>Donation History</h1>
          <p>A record of all your previous blood donations.</p>
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className="dd-stats-grid" style={{ marginBottom: "var(--space-5)" }}>
        {[
          { label: "Total Donations",  value: DONATION_HISTORY.length, icon: Droplets, iconColor: "#EF4444", iconBg: "#FEE2E2", sub: "All time" },
          { label: "Total Units",      value: totalUnits,              icon: Award,    iconColor: "#8B5CF6", iconBg: "#EDE9FE", sub: "Units donated" },
          { label: "Lives Impacted",   value: totalUnits * 3,          icon: Clock,    iconColor: "#10B981", iconBg: "#D1FAE5", sub: "Estimated (≈3× units)" },
        ].map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.1} />
        ))}
      </div>

      {/* ── Table card ── */}
      <motion.div
        className="dd-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="dd-card__header" style={{ marginBottom: "var(--space-4)" }}>
          <h3 className="dd-card__title"><Clock size={16} /> All Donations</h3>
          <div className="dd-search-wrap" style={{ minWidth: "auto", width: 240 }}>
            <Search size={14} className="dd-search-wrap__icon" />
            <input
              placeholder="Search donations…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search donations"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="dd-empty">
            <div className="dd-empty__icon"><Search size={26} /></div>
            <h3>No donations found</h3>
            <p>Try a different search term.</p>
          </div>
        ) : (
          <div className="dd-history-table-wrap">
            <table className="dd-history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Centre / Hospital</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Status</th>
                  <th>Certificate</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d.id}>
                    <td style={{ color: "var(--text-muted)", fontWeight: 600 }}>{i + 1}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: "var(--text)" }}>{d.date}</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: "var(--danger-soft)", color: "var(--danger)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Droplets size={14} />
                        </div>
                        <span style={{ fontSize: "var(--text-sm)" }}>{d.centre}</span>
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 40, height: 40, borderRadius: "50%",
                          background: "var(--danger-soft)", border: "2px solid var(--danger)",
                          fontSize: ".8rem", fontWeight: 800, color: "var(--danger)",
                        }}
                      >
                        {d.bloodGroup}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.units}</td>
                    <td>
                      <span className={`dd-badge ${STATUS_CLS[d.status] ?? "dd-badge--neutral"}`}>
                        {d.status}
                      </span>
                    </td>
                    <td>
                      {d.certificate ? (
                        <button
                          className="dd-quick-btn dd-quick-btn--outline"
                          style={{ padding: "6px 12px", fontSize: "var(--text-xs)" }}
                          title="Download certificate (feature coming soon)"
                          onClick={() => alert("Certificate download will be available once the backend is connected.")}
                        >
                          <Download size={13} /> Download
                        </button>
                      ) : (
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <p className="dd-disclaimer" style={{ marginTop: "var(--space-4)" }}>
        Donation records are sample data. In production, verified records will be fetched from the backend.
      </p>
    </div>
  );
}
