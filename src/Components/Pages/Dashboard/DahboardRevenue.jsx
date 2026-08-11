
import React from "react";
import { ChevronDown } from "lucide-react";

const DahboardRevenue = () => {
  return (
    <section className="panel revenue-panel">

      <div className="panel-heading">
        <h2>Revenue Overview</h2>

        <button className="link-button">
          This Year
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="line-chart">

        <div className="y-labels">
          <span>₹20L</span>
          <span>₹15L</span>
          <span>₹10L</span>
          <span>₹5L</span>
          <span>₹0</span>
        </div>

        <svg
          viewBox="0 0 720 230"
          preserveAspectRatio="none"
          className="revenue-svg"
        >
          <defs>
            <linearGradient
              id="fill"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop
                offset="0"
                stopColor="#0d9f2d"
                stopOpacity=".22"
              />

              <stop
                offset="1"
                stopColor="#061602"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <path
            d="M0 182 C24 156 40 175 62 162 S95 111 120 120 S163 135 190 111 S224 65 252 66 S303 39 337 43 S383 20 414 28 S447 85 475 91 S530 77 556 92 S600 139 626 142 S669 171 695 140 S715 118 720 111 L720 230 L0 230 Z"
            fill="url(#fill)"
          />

          <path
            d="M0 182 C24 156 40 175 62 162 S95 111 120 120 S163 135 190 111 S224 65 252 66 S303 39 337 43 S383 20 414 28 S447 85 475 91 S530 77 556 92 S600 139 626 142 S669 171 695 140 S715 118 720 111"
            fill="none"
            stroke="#113707"
            strokeWidth="3"
          />
        </svg>

        <div className="x-labels">
          <span>Jan</span>
          <span>Feb</span>
          <span>Mar</span>
          <span>Apr</span>
          <span>May</span>
          <span>Jun</span>
          <span>Jul</span>
          <span>Aug</span>
        </div>

      </div>
    </section>
  );
};

export default DahboardRevenue;