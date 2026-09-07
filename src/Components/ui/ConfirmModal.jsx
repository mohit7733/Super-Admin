import { useEffect } from "react";

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape" && !loading) onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay sa-modal-overlay"
      onClick={() => {
        if (!loading) onClose?.();
      }}
      role="presentation"
    >
      <div
        className="modal-content sa-modal sa-modal-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sa-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sa-modal-header">
          <h3 id="sa-confirm-title">{title}</h3>
          <button
            type="button"
            className="sa-modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        {message ? <p className="sa-modal-message">{message}</p> : null}
        <div className="form-actions sa-modal-footer">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? "btn-delete" : "btn-primary"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
