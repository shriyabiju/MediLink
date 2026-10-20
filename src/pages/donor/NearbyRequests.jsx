import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Filter, Droplets, CheckCircle, Clock } from "lucide-react";
import {
  NEARBY_BLOOD_REQUESTS,
  BLOOD_GROUPS,
  URGENCY_LEVELS,
  STATUSES,
  DONOR_PROFILE,
} from "./data/sampleData";
import "./css/donor.css";

const URGENCY_CLS = {
  Critical:       "dd-badge--danger",
  High:           "dd-badge--warning",
  Medium:         "dd-badge--info",
  Low:            "dd-badge--neutral",
};

const STATUS_CLS = {
  Open:              "dd-badge--success",
  "Partially Filled":"dd-badge--warning",
  Fulfilled:         "dd-badge--neutral",
};

/* ── Interest confirmation state per request ── */
function RequestCard({ req }) {
  const [interested, setInterested] = useState(false);

  return (
    <motion.div
      className="dd-request-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      layout
    >
      <div className="dd-request-card__header">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div className="dd-request-card__blood">{req.bloodGroup}</div>
          <div className="dd-request-card__body">
            <h4>{req.hospital}</h4>
            <p>{req.postedAt} · {req.unitsNeeded} unit{req.unitsNeeded > 1 ? "s" : ""} needed</p>
          </div>
        </div>
        <span className={`dd-badge ${URGENCY_CLS[req.urgency] ?? "dd-badge--neutral"}`}>
          {req.urgency}
        </span>
      </div>

      {/* Meta chips */}
      <div className="dd-request-card__meta">
        <span className="dd-meta-chip"><MapPin size={12} /> {req.distance}</span>
        <span className="dd-meta-chip">📍 {req.location}</span>
        <span className={`dd-meta-chip dd-badge ${STATUS_CLS[req.status] ?? "dd-badge--neutral"}`}>
          {req.status}
        </span>
        {req.bloodGroup === DONOR_PROFILE.bloodGroup && (
          <span className="dd-meta-chip" style={{ color: "var(--danger)", borderColor: "var(--danger)", background: "var(--danger-soft)", fontWeight: 700 }}>
            🩸 Matches your group
          </span>
        )}
      </div>

      {/* Action */}
      {interested ? (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "var(--success-soft)", border: "1px solid var(--success)",
            borderRadius: "var(--radius-sm)", padding: "10px 14px",
            fontSize: "var(--text-sm)", fontWeight: 600, color: "#065F46",
          }}
        >
          <CheckCircle size={16} /> Interest registered — a coordinator will contact you.
        </div>
      ) : req.status === "Fulfilled" ? (
        <span className="dd-badge dd-badge--neutral" style={{ alignSelf: "flex-start" }}>
          Request Fulfilled
        </span>
      ) : (
        <button
          className="dd-quick-btn dd-quick-btn--primary"
          style={{ alignSelf: "flex-start" }}
          onClick={() => setInterested(true)}
        >
          <Droplets size={15} /> I Want to Help
        </button>
      )}
    </motion.div>
  );
}

export default function NearbyRequests() {
  const [search,    setSearch]    = useState("");
  const [urgency,   setUrgency]   = useState("All");
  const [bloodGrp,  setBloodGrp]  = useState("All");
  const [statusFlt, setStatusFlt] = useState("All");

  const filtered = NEARBY_BLOOD_REQUESTS.filter((r) => {
    const matchSearch  = r.hospital.toLowerCase().includes(search.toLowerCase()) ||
                         r.location.toLowerCase().includes(search.toLowerCase()) ||
                         r.bloodGroup.toLowerCase().includes(search.toLowerCase());
    const matchUrgency = urgency === "All"   || r.urgency   === urgency;
    const matchBlood   = bloodGrp === "All"  || r.bloodGroup === bloodGrp;
    const matchStatus  = statusFlt === "All" || r.status    === statusFlt;
    return matchSearch && matchUrgency && matchBlood && matchStatus;
  });

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>Nearby Blood Requests</h1>
          <p>Current blood donation requests in your area. Sample data — backend not yet connected.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span className="dd-badge dd-badge--info">
            {filtered.length} request{filtered.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>

      {/* ── Search + filters ── */}
      <div className="dd-search-bar">
        <div className="dd-search-wrap">
          <Search size={15} className="dd-search-wrap__icon" />
          <input
            placeholder="Search by hospital or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search blood requests"
          />
        </div>

        <select
          className="dd-filter-select"
          value={bloodGrp}
          onChange={(e) => setBloodGrp(e.target.value)}
          aria-label="Filter by blood group"
        >
          <option value="All">All Blood Groups</option>
          {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>

        <select
          className="dd-filter-select"
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          aria-label="Filter by urgency"
        >
          {URGENCY_LEVELS.map((u) => <option key={u} value={u}>{u === "All" ? "All Urgencies" : u}</option>)}
        </select>

        <select
          className="dd-filter-select"
          value={statusFlt}
          onChange={(e) => setStatusFlt(e.target.value)}
          aria-label="Filter by status"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s === "All" ? "All Statuses" : s}</option>)}
        </select>

        {(search || urgency !== "All" || bloodGrp !== "All" || statusFlt !== "All") && (
          <button
            className="dd-quick-btn dd-quick-btn--outline"
            onClick={() => { setSearch(""); setUrgency("All"); setBloodGrp("All"); setStatusFlt("All"); }}
            style={{ padding: "9px 14px" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── My blood group highlight ── */}
      <div
        style={{
          background: "var(--danger-soft)", border: "1px solid rgba(239,68,68,.3)",
          borderRadius: "var(--radius-sm)", padding: "10px 16px",
          fontSize: "var(--text-sm)", color: "#991B1B", marginBottom: "var(--space-5)",
          display: "flex", alignItems: "center", gap: 8, fontWeight: 500,
        }}
      >
        <Droplets size={15} />
        Your blood group is <strong>{DONOR_PROFILE.bloodGroup}</strong>. Requests with matching blood groups are highlighted.
      </div>

      {/* ── Requests grid ── */}
      {filtered.length === 0 ? (
        <div className="dd-empty">
          <div className="dd-empty__icon"><Search size={28} /></div>
          <h3>No requests found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="dd-requests-grid">
          <AnimatePresence>
            {filtered.map((req) => (
              <RequestCard key={req.id} req={req} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Disclaimer ── */}
      <p className="dd-disclaimer" style={{ marginTop: "var(--space-6)" }}>
        Blood requests shown are sample data for demonstration purposes. In production, live requests from verified hospitals will appear here.
        Always confirm donation eligibility with a qualified healthcare professional before proceeding.
      </p>
    </div>
  );
}
