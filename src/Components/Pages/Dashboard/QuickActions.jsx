import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid2X2,
  PackagePlus,
  Tags,
  HeartPulse,
  Activity,
  TicketPercent,
} from "lucide-react";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Add Service",
      icon: Grid2X2,
      path: "/main/category",
    },
    {
      label: "Add Product Category",
      icon: PackagePlus,
      path: "/main/productcategory",
    },
    {
      label: "Add Brand",
      icon: Tags,
      path: "/product/brandname",
    },
    {
      label: "Add Health Category",
      icon: HeartPulse,
      path: "/category/healthcategory",
    },
    {
      label: "Add Disease",
      icon: Activity,
      path: "/disease",
    },
    {
      label: "Create Coupon",
      icon: TicketPercent,
      path: "/coupons",
    },
  ];

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Quick Actions</h2>
      </div>

      <div className="quick-grid">
        {actions.map(({ label, icon: Icon, path }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(path)}
            className="quick-action-btn"
            title={label}
          >
            <Icon size={22} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;