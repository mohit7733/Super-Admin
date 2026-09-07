export default function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
  disabled = false,
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="pagination-wrapper">
      <div className="pagination-info">
        Page {page} of {totalPages}
      </div>
      <div className="pagination-controls" role="navigation" aria-label="Pagination">
        <button
          type="button"
          className="page-btn"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange?.(page - 1)}
        >
          Previous
        </button>
        {pages.map((item) => (
          <button
            key={item}
            type="button"
            className={`page-btn ${item === page ? "active" : ""}`}
            disabled={disabled}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange?.(item)}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          className="page-btn"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange?.(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
