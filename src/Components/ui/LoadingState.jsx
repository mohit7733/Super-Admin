export default function LoadingState({ rows = 6, label = "Loading..." }) {
  return (
    <div className="sa-loading-state" role="status" aria-live="polite" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="skeleton-row sa-skeleton-row" />
      ))}
    </div>
  );
}
