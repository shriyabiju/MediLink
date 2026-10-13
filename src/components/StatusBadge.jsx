/**
 * StatusBadge — shared across all dashboards
 * Usage: <StatusBadge status="success" label="Available" />
 * Valid variants: success | warning | danger | info | primary | purple | neutral
 */
export default function StatusBadge({ status = "neutral", label, dot = false }) {
  return (
    <span className={`ml-badge ml-badge--${status}`}>
      {dot && (
        <span style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "currentColor", display: "inline-block",
        }} />
      )}
      {label}
    </span>
  );
}
