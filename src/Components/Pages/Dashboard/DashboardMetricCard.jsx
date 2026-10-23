
import React from "react";
import {
  Users,
  Stethoscope,
  Store,
  ShoppingBag,
  WalletCards,
  Box,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const icons = {
  Users,
  Stethoscope,
  Store,
  ShoppingBag,
  WalletCards,
  Box,
};

const colors = {
  blue: "#2563eb",
  green: "#16a34a",
  purple: "#7c3aed",
  orange: "#ea580c",
  mint: "#0d9488",
};

const createPoints = (values = []) => {
  if (!values.length) return "";

  const width = 214;
  const height = 48;
  const padding = 4;

  const numbers = values.map((value) => Number(value) || 0);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const difference = max - min;

  return numbers
    .map((value, index) => {
      const x =
        numbers.length === 1
          ? width / 2
          : (index / (numbers.length - 1)) * width;

      const y =
        difference === 0
          ? height / 2
          : height -
            padding -
            ((value - min) / difference) * (height - padding * 2);

      return `${x},${y}`;
    })
    .join(" ");
};

const DashboardMetricCard = ({ metric }) => {
  const Icon = icons[metric.icon] || Box;
  const change = Number(metric.change) || 0;
  const isPositive = change > 0;
  const isNegative = change < 0;
  const TrendIcon = isNegative ? TrendingDown : TrendingUp;

  const chartPoints = createPoints(metric.trend);
  const chartColor = colors[metric.tone] || colors.green;

  return (
    <article className={`metric-card ${metric.tone || ""}`}>
      <div className="metric-card-top">
        <div className={`metric-icon ${metric.tone || ""}`}>
          <Icon size={22} />
        </div>

        <div className="metric-trend-badge">
          {metric.trend?.length > 0 ? (
            <span className="metric-period">
              This month:{" "}
              {metric.currency
                ? new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 2,
                  }).format(Number(metric.thisMonth) || 0)
                : new Intl.NumberFormat("en-IN").format(
                    Number(metric.thisMonth) || 0
                  )}
            </span>
          ) : null}
        </div>
      </div>

      <div className="metric-name">{metric.title}</div>

      <div className="metric-value">{metric.value}</div>

      <div
        className={`metric-change ${
          isPositive
            ? "positive"
            : isNegative
            ? "negative"
            : "neutral"
        }`}
      >
        <TrendIcon size={14} />
        <span>
          {isPositive ? "+" : ""}
          {change.toFixed(1)}%
        </span>
        <span className="metric-change-label">vs last month</span>
      </div>

      <div className="metric-chart-wrap">
        <svg
          className="mini-chart"
          viewBox="0 0 214 55"
          preserveAspectRatio="none"
          role="img"
          aria-label={`${metric.title} trend`}
        >
          {chartPoints && (
            <>
              <polyline
                points={chartPoints}
                fill="none"
                stroke={chartColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
              {metric.trend.length > 0 && (
                <circle
                  cx={
                    metric.trend.length === 1
                      ? 107
                      : 214
                  }
                  cy={(() => {
                    const values = metric.trend.map(
                      (value) => Number(value) || 0
                    );
                    const min = Math.min(...values);
                    const max = Math.max(...values);

                    return max === min
                      ? 28
                      : 51 -
                          ((values[values.length - 1] - min) /
                            (max - min)) *
                            43;
                  })()}
                  r="3"
                  fill={chartColor}
                />
              )}
            </>
          )}
        </svg>
      </div>
    </article>
  );
};

export default DashboardMetricCard;
