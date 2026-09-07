export default function EmptyState({
  title = "No data found",
  description = "There is nothing to show here yet.",
  action,
}) {
  return (
    <div className="empty-state sa-empty-state">
      <div className="empty-state-content sa-empty-content">
        <h4>{title}</h4>
        <p>{description}</p>
        {action}
      </div>
    </div>
  );
}
