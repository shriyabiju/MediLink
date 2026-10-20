import { ClipboardList } from "lucide-react";
import "../admin/css/admin.css";

/**
 * RequestsOverview — placeholder for the emergency/blood request admin view.
 * This requires a Request model in the backend which is out of scope for the
 * current sprint. Implement when the hospital Emergency Requests feature has
 * been wired to the database.
 */
export default function RequestsOverview() {
  return (
    <div>
      <div className="ad-page-header">
        <div>
          <h1>Requests Overview</h1>
          <p>Monitor emergency blood and resource requests across all hospitals.</p>
        </div>
      </div>

      <div className="ad-empty" style={{ background: "var(--card)", borderRadius: "var(--radius)", border: "1px solid var(--border)", padding: "var(--space-12)" }}>
        <div className="ad-empty__icon"><ClipboardList size={30} /></div>
        <h3>Coming Soon</h3>
        <p>
          The Requests Overview page will display live emergency and blood
          donation requests once the hospital Emergency Requests module has
          been connected to the database. This page is reserved and ready to
          be implemented.
        </p>
      </div>
    </div>
  );
}
