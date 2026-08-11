// import React from 'react'

// const DashboardMetricCard = () => {
//   return (
//     <div>DashboardMetricCard</div>
//   )
// }

// export default DashboardMetricCard
import React from "react";
import {
  Users,
  Stethoscope,
  Store,
  ShoppingBag,
  WalletCards,
  Box,
  TrendingUp,
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
  blue: "#20c37c",
  green: "#18a568",
  purple: "#10a846",
  orange: "#4db313",
  mint: "#41e9a0",
};

const DashboardMetricCard = ({ metric }) => {
  const Icon = icons[metric.icon];

  return (
    <article className="metric-card">

      <div className={`metric-icon ${metric.tone}`}>
        <Icon size={22} />
      </div>

      <div className="metric-name">
        {metric.title}
      </div>

      <div className="metric-value">
        {metric.value}
      </div>

      {metric.change ? (
        <div className="metric-change">
          <TrendingUp size={12} />
          {metric.change}
          <span>vs last month</span>
        </div>
      ) : (
        <div className="metric-change muted">
          <span>vs last month</span>
        </div>
      )}

      <svg
        className="mini-chart"
        viewBox="0 0 214 55"
        preserveAspectRatio="none"
      >
        <polyline
          points={metric.points}
          fill="none"
          stroke={colors[metric.tone]}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

    </article>
  );
};

export default DashboardMetricCard;