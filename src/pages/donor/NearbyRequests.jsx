import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Search, Droplets, CheckCircle,
  AlertCircle, RefreshCw, Building2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { donorApi } from "../../services/api";
import { BLOOD_GROUPS, ELIGIBILITY_DISCLAIMER } from "./data/sampleData";
import "./css/donor.css";

const URGENCY_LEVELS = ["All", "Critical", "High", "Medium", "Low"];
const STATUSES       = ["All", "open", "partially_filled"];

const URGENCY_CLS = {
  Critical: "dd-badge--danger",
  High:     "dd-badge--warning",
  Medium:   "dd-badge--info",
  Low:      "dd-badge--neutral",
};

const STATUS_LABEL = {
  open:              "Open",
  partially_filled:  "Partially Filled",
  fulfilled:         "Fulfilled",
  cancelled:         "Cancelled",
};
const STATUS_CLS = {
  open:             "dd-badge--success",
  partially_filled: "dd-badge--warning",
  fulfilled:        "dd-badge--neutral",
  cancelled:        "dd-badge--danger",
};

/* ─────────────────────────────────────────────
   Single request card
───────────────────────────────────────────── */
function RequestCard({ req, donorBloodGroup, onRespond }) {
  const [responding, setResponding] = useState(false);
  const [responded,  setResponded]  = useState(req.alreadyResponded ?? false);
  const [error,      setError]      = useState("");

  const isMatch        = req.bloodGroup === donorBloodGroup;
  const canRespond     = ["open", "partially_filled"].includes(req.status) && !responded;

  const handleRespond = async () => {
    setError("");
    setResponding(true);
    try {
      await onRespond(req._id);
      setResponded(true);
    } catch (err) {
      if (err.status === 409) {
        setResponded(true); // already responded
      } else {
        setError(err.message || "Failed to register interest. Please try again.");
      }
    } finally {
      setResponding(false);
    }
  };

  return (
    <motion.div
      className="dd-request-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      {/* Header row */}
      <div className="dd-request-card__header">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div className="dd-request-card__blood">{req.bloodGroup}</div>
          <div className="dd-request-card__body">
            <h4>{req.hospitalName}</h4>
            <p>
              {new Date(req.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
              {" · "}
              {req.unitsNeeded - (req.unitsFilled || 0)} unit
              {req.unitsNeeded - (req.unitsFilled || 0) !== 1 ? "s" : ""} still needed
            </p>
          </div>
        </div>
        <span className={`dd-badge ${URGENCY_CLS[req.urgency] ?? "dd-badge--neutral"}`}>
          {req.urgency}
        </span>
      </div>

      {/* Meta chips */}
      <div className="dd-request-card__meta">
        {(req.hospitalCity || req.hospitalState) && (
          <span className="dd-meta-chip">
            <MapPin size={12} />
            {[req.hospitalCity, req.hospitalState].filter(Boolean).join(", ")}
          </span>
        )}
        <span className={`dd-badge dd-meta-chip ${STATUS_CLS[req.status] ?? "dd-badge--neutral"}`}>
          {STATUS_LABEL[req.status] ?? req.status}
        </span>
        {isMatch && (
          <span className="dd-meta-chip" style={{
            color: "var(--danger)", borderColor: "var(--danger)",
            background: "var(--danger-soft)", fontWeight: 700,
          }}>
            🩸 Matches your blood group
          </span>
        )}
        {req.unitsNeeded > 1 && (
          <span className="dd-meta-chip">
            <Droplets size={12} /> {req.unitsFilled || 0}/{req.unitsNeeded} units filled
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <p style={{ fontSize: "var(--text-xs)", color: "var(--danger)", display: "flex", alignItems: "center", gap: 5 }}>
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {/* Action */}
      {responded ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "var(--success-soft)", border: "1px solid var(--success)",
          borderRadius: "var(--radius-sm)", padding: "10px 14px",
          fontSize: "var(--text-sm)", fontWeight: 600, color: "#065F46",
        }}>
          <CheckCircle size={15} /> Interest registered — a coordinator will contact you.
        </div>
      ) : req.status === "fulfilled" || req.status === "cancelled" ? (
        <span className="dd-badge dd-badge--neutral" style={{ alignSelf: "flex-start" }}>
          {STATUS_LABEL[req.status]}
        </span>
      ) : (
        <button
          className="dd-quick-btn dd-quick-btn--primary"
          style={{ alignSelf: "flex-start" }}
          onClick={handleRespond}
          disabled={responding || !canRespond}
        >
          {responding ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                width: 12, height: 12,
                border: "2px solid rgba(255,255,255,.4)",
                borderTopColor: "#fff",
                borderRadius: "50%",
                animation: "spin .6s linear infinite",
                display: "inline-block",
              }} />
              Registering…
            </span>
          ) : (
            <><Droplets size={14} /> I Want to Help</>
          )}
        </button>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main NearbyRequests page
───────────────────────────────────────────── */
export default function NearbyRequests() {
  const { user: authUser } = useAuth();

  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [search,     setSearch]     = useState("");
  const [bloodGrp,   setBloodGrp]   = useState("All");
  const [urgency,    setUrgency]    = useState("All");
  const [statusFlt,  setStatusFlt]  = useState("All");
  const [donorBG,    setDonorBG]    = useState(""); // donor's own blood group
  const [donorCity,  setDonorCity]  = useState(""); // donor's saved city
  const [cityFilter, setCityFilter] = useState(""); // city to filter by (defaults to donor's city)

  /* Fetch donor's blood group and city once */
  useEffect(() => {
    donorApi.getProfile()
      .then(({ user }) => {
        if (user?.bloodGroup) setDonorBG(user.bloodGroup);
        if (user?.city) {
          setDonorCity(user.city);
          setCityFilter(user.city); // default to donor's city
        }
      })
      .catch(() => {});
  }, []);

  /* Fetch requests whenever filters change */
  const fetchRequests = useCallback(() => {
    setLoading(true);
    setError("");

    const params = {};
    if (bloodGrp  !== "All") params.bloodGroup = bloodGrp;
    if (urgency   !== "All") params.urgency    = urgency;
    if (statusFlt !== "All") params.status     = statusFlt;
    if (search.trim())       params.search     = search.trim();
    /* Auto-filter by city — uses the donor's city by default */
    if (cityFilter.trim())   params.city       = cityFilter.trim();

    donorApi.getBloodRequests(params)
      .then(({ requests }) => setRequests(requests))
      .catch((err) => setError(err.message || "Failed to load blood requests."))
      .finally(() => setLoading(false));
  }, [bloodGrp, urgency, statusFlt, search, cityFilter]);

  useEffect(() => {
    /* Debounce search input by 350 ms to avoid hammering the API */
    const timer = setTimeout(fetchRequests, search ? 350 : 0);
    return () => clearTimeout(timer);
  }, [fetchRequests, search]);

  const handleRespond = async (id) => {
    const data = await donorApi.respondToRequest(id);
    /* Update local state so the card flips immediately */
    setRequests((prev) =>
      prev.map((r) =>
        r._id === id
          ? { ...r, alreadyResponded: true, status: data.requestStatus ?? r.status }
          : r
      )
    );
    return data;
  };

  const clearFilters = () => {
    setSearch(""); setBloodGrp("All"); setUrgency("All"); setStatusFlt("All");
    setCityFilter(donorCity); // reset to donor's city
  };
  const filtersActive = search || bloodGrp !== "All" || urgency !== "All" || statusFlt !== "All" || (cityFilter !== donorCity);

  return (
    <div>
      {/* ── Page header ── */}
      <div className="dd-page-header">
        <div>
          <h1>Nearby Blood Requests</h1>
          <p>Active blood donation requests from verified hospitals.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {!loading && (
            <span className="dd-badge dd-badge--info">
              {requests.length} request{requests.length !== 1 ? "s" : ""} found
            </span>
          )}
          <button
            className="dd-quick-btn dd-quick-btn--outline"
            onClick={fetchRequests}
            style={{ padding: "7px 12px" }}
            title="Refresh list"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && !loading && (
        <div style={{
          background: "var(--danger-soft)", border: "1px solid var(--danger)",
          borderRadius: "var(--radius-sm)", padding: "12px 16px",
          marginBottom: "var(--space-5)", color: "#991B1B",
          fontSize: "var(--text-sm)", fontWeight: 600,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* ── Search + filters ── */}
      <div className="dd-search-bar">
        <div className="dd-search-wrap">
          <Search size={15} className="dd-search-wrap__icon" />
          <input
            placeholder="Search by hospital…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search blood requests"
          />
        </div>

        {/* City filter — defaults to donor's saved city */}
        <div className="dd-search-wrap" style={{ minWidth: 140 }}>
          <MapPin size={15} className="dd-search-wrap__icon" />
          <input
            placeholder={donorCity ? donorCity : "Select city…"}
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            aria-label="Filter by city"
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
          {URGENCY_LEVELS.map((u) => (
            <option key={u} value={u}>{u === "All" ? "All Urgencies" : u}</option>
          ))}
        </select>

        <select
          className="dd-filter-select"
          value={statusFlt}
          onChange={(e) => setStatusFlt(e.target.value)}
          aria-label="Filter by status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All Statuses" : STATUS_LABEL[s] ?? s}
            </option>
          ))}
        </select>

        {filtersActive && (
          <button
            className="dd-quick-btn dd-quick-btn--outline"
            onClick={clearFilters}
            style={{ padding: "9px 14px" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* ── City filter info ── */}
      {cityFilter ? (
        <div style={{
          background: "var(--danger-soft)", border: "1px solid rgba(239,68,68,.3)",
          borderRadius: "var(--radius-sm)", padding: "10px 16px",
          fontSize: "var(--text-sm)", color: "#991B1B",
          marginBottom: "var(--space-5)",
          display: "flex", alignItems: "center", gap: 8, fontWeight: 500,
        }}>
          <MapPin size={15} />
          Showing requests near <strong>{cityFilter}</strong>. Change the city filter above to see requests from other locations.
        </div>
      ) : !loading && !donorCity && (
        <div style={{
          background: "var(--warning-soft, #FEF3C7)", border: "1px solid rgba(245,158,11,.3)",
          borderRadius: "var(--radius-sm)", padding: "10px 16px",
          fontSize: "var(--text-sm)", color: "#92400E",
          marginBottom: "var(--space-5)",
          display: "flex", alignItems: "center", gap: 8, fontWeight: 500,
        }}>
          <MapPin size={15} />
          No city saved in your profile. Enter a city above to see nearby requests.
        </div>
      )}

      {/* ── Donor blood group reminder ── */}
      {donorBG && (
        <div style={{
          background: "var(--danger-soft)", border: "1px solid rgba(239,68,68,.3)",
          borderRadius: "var(--radius-sm)", padding: "10px 16px",
          fontSize: "var(--text-sm)", color: "#991B1B",
          marginBottom: "var(--space-5)",
          display: "flex", alignItems: "center", gap: 8, fontWeight: 500,
        }}>
          <Droplets size={15} />
          Your blood group is <strong>{donorBG}</strong>. Matching requests are highlighted.
        </div>
      )}

      {/* ── Loading skeleton ── */}
      {loading && (
        <div className="dd-requests-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 220, borderRadius: "var(--radius)" }} />
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && requests.length === 0 && (
        <div className="dd-empty">
          <div className="dd-empty__icon"><Building2 size={28} /></div>
          <h3>
            {filtersActive ? "No requests match your filters" : "No active blood requests"}
          </h3>
          <p>
            {filtersActive
              ? "Try clearing the search or adjusting your filters."
              : "No hospitals have posted blood requests yet. Check back later."}
          </p>
          {filtersActive && (
            <button className="dd-quick-btn dd-quick-btn--outline" onClick={clearFilters} style={{ marginTop: 8 }}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* ── Requests grid ── */}
      {!loading && requests.length > 0 && (
        <div className="dd-requests-grid">
          <AnimatePresence>
            {requests.map((req) => (
              <RequestCard
                key={req._id}
                req={req}
                donorBloodGroup={donorBG}
                onRespond={handleRespond}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Disclaimer ── */}
      {!loading && (
        <p className="dd-disclaimer" style={{ marginTop: "var(--space-6)" }}>
          {ELIGIBILITY_DISCLAIMER} Always consult the receiving hospital before donating.
        </p>
      )}
    </div>
  );
}
