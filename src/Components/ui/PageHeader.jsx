export default function PageHeader({ title, subtitle, actions, children }) {
  return (
    <div className="page-header sa-page-header">
      <div className="sa-page-header-text">
        <h1>{title}</h1>
        {subtitle ? <p className="page-paragraph">{subtitle}</p> : null}
      </div>
      {(actions || children) ? (
        <div className="sa-page-header-actions">{actions || children}</div>
      ) : null}
    </div>
  );
}
