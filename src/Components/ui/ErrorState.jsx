export default function ErrorState({
  title = "Something went wrong",
  message = "Please try again.",
  onRetry,
}) {
  return (
    <div className="sa-error-state" role="alert">
      <h4>{title}</h4>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="btn-primary" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  );
}
