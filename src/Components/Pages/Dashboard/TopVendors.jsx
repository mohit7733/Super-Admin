
import React from "react";
import { useNavigate } from "react-router-dom";

const TopVendors = ({ vendors = [] }) => {
  const navigate = useNavigate();
  const safeVendors = Array.isArray(vendors) ? vendors : [];

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const getVendorName = (vendor) =>
    vendor.vendor_name ||
    vendor.store_name ||
    vendor.name ||
    vendor.business_name ||
    "N/A";

  const getVendorSales = (vendor) =>
    vendor.total_sales ??
    vendor.total_revenue ??
    vendor.sales ??
    vendor.revenue ??
    vendor.amount ??
    0;

  const getMedalClass = (index) => {
    if (index === 0) return "gold";
    if (index === 1) return "silver";
    if (index === 2) return "bronze";
    return "";
  };

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Top Vendors</h2>

        <button
          type="button"
          className="link-button"
          onClick={() => navigate("/vendor")}
        >
          View All
        </button>
      </div>

      <div className="rank-list">
        {safeVendors.length > 0 ? (
          safeVendors.map((vendor, index) => (
            <div key={vendor.id || vendor.vendor_id || index}>
              <span className={`medal ${getMedalClass(index)}`}>
                {index + 1}
              </span>

              <strong>{getVendorName(vendor)}</strong>

              <small>
                {formatCurrency(getVendorSales(vendor))}
                <br />
                Total Sales
              </small>
            </div>
          ))
        ) : (
          <p className="empty-state">
            No vendor data available.
          </p>
        )}
      </div>
    </section>
  );
};

export default TopVendors;
