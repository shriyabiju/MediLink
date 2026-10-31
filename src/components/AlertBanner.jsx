/**
 * AlertBanner — shared inline alert for loading / success / error / info states.
 * Replaces the repeated inline-styled banners scattered across the dashboards.
 * Visually identical to the previous one-off divs (same colour, padding, radius).
 */
export default function AlertBanner({ type = "error", children, style }) {
  if (!children) return null;

  const palette = {
    error:   { color: "var(--danger)",         background: "#FEF2F2" },
    success: { color: "var(--success)",        background: "#ECFDF5" },
    info:    { color: "var(--primary-light)",   background: "#EFF6FF" },
    loading: { color: "var(--primary-light)",   background: "#EFF6FF" },
  };
  const s = palette[type] || palette.error;

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      aria-live={type === "error" ? "assertive" : "polite"}
      style={{
        color: s.color,
        background: s.background,
        marginBottom: 12,
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: ".85rem",
        fontWeight: 500,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
