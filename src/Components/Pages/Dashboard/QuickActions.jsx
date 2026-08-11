import React from "react";
import {
  Box,
  Grid2X2,
  Store,
  Stethoscope,
  TicketPercent,
  Download,
} from "lucide-react";

const QuickActions = () => {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Quick Actions</h2>
      </div>

      <div className="quick-grid">
        <button>
          <Box size={22} />
          Add Product
        </button>

        <button>
          <Grid2X2 size={22} />
          Add Category
        </button>

        <button>
          <Store size={22} />
          Add Vendor
        </button>

        <button>
          <Stethoscope size={22} />
          Add Doctor
        </button>

        <button>
          <TicketPercent size={22} />
          Create Coupon
        </button>

        <button>
          <Download size={22} />
          Export Report
        </button>
      </div>
    </section>
  );
};

export default QuickActions;