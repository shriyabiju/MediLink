/**
 * LoadingState — full-area spinner
 * Usage: <LoadingState />  or  <LoadingState label="Fetching records…" />
 */
export default function LoadingState({ label = "Loading…" }) {
  return (
    <div className="spinner-wrap" style={{ flexDirection: "column", gap: 14 }}>
      <div className="spinner" />
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{label}</p>
    </div>
  );
}
