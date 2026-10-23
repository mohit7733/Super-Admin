import React from "react";

const DashboardOrderOverView = ({ ordersOverview = {} }) => {
  const overview =
    ordersOverview &&
    typeof ordersOverview === "object" &&
    !Array.isArray(ordersOverview)
      ? ordersOverview
      : {};

  const totalOrders = Number(overview.total) || 0;

  const statusConfig = [
    { key: "delivered", label: "Delivered", color: "#16a34a", dot: "green-dot" },
    { key: "pending", label: "Pending", color: "#ea580c", dot: "orange-dot" },
    { key: "cancelled", label: "Cancelled", color: "#dc2626", dot: "red-dot" },
    { key: "returned", label: "Returned", color: "#7c3aed", dot: "purple-dot" },
  ];

  const breakdown = Array.isArray(overview.breakdown)
    ? overview.breakdown
    : [];

  const statuses = statusConfig.map((config) => {
    const item = breakdown.find(
      (entry) =>
        String(entry.status || "").toLowerCase() === config.key
    );

    return {
      ...config,
      count: Number(item?.count) || 0,
      percentage:
        item?.percent !== undefined && item?.percent !== null
          ? Number(item.percent) || 0
          : totalOrders > 0
          ? ((Number(item?.count) || 0) / totalOrders) * 100
          : 0,
    };
  });

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(value);

  const hasOrders = totalOrders > 0;

  const gradient = (() => {
    if (!hasOrders) return "#e5e7eb";

    let current = 0;

    const segments = statuses
      .filter((item) => item.percentage > 0)
      .map((item) => {
        const start = current;
        current += item.percentage;

        return `${item.color} ${start}% ${current}%`;
      });

    return `conic-gradient(${segments.join(", ")})`;
  })();

  return (
    <section className="panel orders-panel">
      <div className="panel-heading">
        <h2>Orders Overview</h2>
      </div>

      <div className="donut-wrap">
        <div
          className="donut"
          style={{
            background: gradient,
          }}
        >
          <div>
            <strong>{formatNumber(totalOrders)}</strong>
            <span>Total Orders</span>
          </div>
        </div>

        <div className="legend">
          {statuses.map((item) => (
            <p key={item.key}>
              <i className={item.dot} />

              {item.label}

              <span>
                {item.percentage.toFixed(1)}% ({formatNumber(item.count)})
              </span>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardOrderOverView;