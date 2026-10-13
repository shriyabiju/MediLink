/**
 * PageHeader — consistent page-level heading across all dashboards
 * Usage: <PageHeader title="Blood Inventory" sub="Manage blood units" action={<button>Add</button>} />
 */
export default function PageHeader({ title, sub, action }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        {sub && <p className="page-header__sub">{sub}</p>}
      </div>
      {action && <div className="page-header__action">{action}</div>}
    </div>
  );
}
