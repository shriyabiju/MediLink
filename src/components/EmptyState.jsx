/**
 * EmptyState — shows when a list/table has no data
 * Usage: <EmptyState icon={Search} title="No results" sub="Try a different search" />
 */
export default function EmptyState({ icon: Icon, title = "Nothing here", sub = "" }) {
  return (
    <div className="ml-placeholder">
      {Icon && (
        <div className="ml-placeholder__icon">
          <Icon size={28} />
        </div>
      )}
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}
