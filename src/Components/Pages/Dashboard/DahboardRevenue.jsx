import React from "react";
import { ChevronDown } from "lucide-react";

const DahboardRevenue = ({ revenueOverview = {} }) => {
  const overview =
    revenueOverview &&
    typeof revenueOverview === "object" &&
    !Array.isArray(revenueOverview)
      ? revenueOverview
      : {};

  const months = Array.isArray(overview.months)
    ? overview.months
    : [];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  const formatLakh = (value) => {
    const amount = Number(value) || 0;

    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }

    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(0)}K`;
    }

    return `₹${amount}`;
  };

  const maxRevenue = Math.max(
    1,
    ...months.map((item) => Number(item.revenue) || 0)
  );

  // Keep the Y-axis scale rounded and readable.
  const axisMax = Math.ceil(maxRevenue / 4 / 1000) * 1000 || 1000;
  const yMax = axisMax * 4;

  const chartWidth = 720;
  const chartHeight = 210;
  const topPadding = 12;
  const bottomPadding = 10;

  const points = months.map((item, index) => {
    const revenue = Number(item.revenue) || 0;

    const x =
      months.length <= 1
        ? chartWidth / 2
        : (index / (months.length - 1)) * chartWidth;

    const y =
      chartHeight -
      bottomPadding -
      (revenue / yMax) * (chartHeight - topPadding - bottomPadding);

    return {
      x,
      y,
      month: item.month || "",
      revenue,
    };
  });

  const linePath = points
    .map((point, index) =>
      `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`
      : "";

  const yLabels = [4, 3, 2, 1, 0].map((factor) => ({
    value: (yMax / 4) * factor,
    label: formatLakh((yMax / 4) * factor),
  }));

  return (
    <section className="panel revenue-panel">
      <div className="panel-heading">
        <div>
          <h2>Revenue Overview</h2>
          <small>
            {overview.year || new Date().getFullYear()} · Total Revenue:{" "}
            {formatCurrency(overview.total)}
          </small>
        </div>

        <button type="button" className="link-button">
          This Year
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="line-chart">
        <div className="y-labels">
          {yLabels.map((label, index) => (
            <span key={index}>{label.label}</span>
          ))}
        </div>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="revenue-svg"
          role="img"
          aria-label="Monthly revenue chart"
        >
          <defs>
            <linearGradient
              id="revenueFillGradient"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#0d9f2d"
                stopOpacity="0.22"
              />
              <stop
                offset="100%"
                stopColor="#061602"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {yLabels.map((label, index) => {
            const y = (index / 4) * chartHeight;

            return (
              <line
                key={label.value}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4 5"
              />
            );
          })}

          {points.length > 0 && (
            <>
              <path
                d={areaPath}
                fill="url(#revenueFillGradient)"
              />

              <path
                d={linePath}
                fill="none"
                stroke="#16a34a"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />

              {points.map((point, index) => (
                <circle
                  key={`${point.month}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="3.5"
                  fill="#16a34a"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                >
                  <title>
                    {point.month}: {formatCurrency(point.revenue)}
                  </title>
                </circle>
              ))}
            </>
          )}
        </svg>

        <div className="x-labels">
          {months.map((item, index) => (
            <span key={item.month_number || index}>
              {item.month}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DahboardRevenue;