const TONE_MAP = {
  success: "success",
  active: "success",
  approved: "success",
  delivered: "success",
  warning: "warning",
  pending: "warning",
  danger: "danger",
  error: "danger",
  rejected: "danger",
  cancelled: "danger",
  info: "info",
  primary: "primary",
};

export default function StatusBadge({ status, tone, children }) {
  const key = String(tone || status || "").toLowerCase();
  const variant = TONE_MAP[key] || "primary";

  return (
    <span className={`status-badge ${variant}`}>
      {children || status}
    </span>
  );
}
