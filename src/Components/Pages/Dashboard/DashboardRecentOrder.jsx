import React from "react";

const DashboardRecentOrder = ({ orders = [] }) => {
  const safeOrders = Array.isArray(orders) ? orders : [];

  const formatAmount = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

  const formatStatus = (status) => {
    if (!status) return "Pending";

    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <section className="panel recent-orders">
      <div className="panel-heading">
        <h2>Recent Orders</h2>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Vendor</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {safeOrders.length > 0 ? (
              safeOrders.map((order, index) => {
                const status = String(order.status || "pending")
                  .toLowerCase()
                  .replace(/[^a-z0-9_-]/g, "-");

                return (
                  <tr
                    key={order.id || order.order_code || index}
                  >
                    <td>
                      {order.order_code || order.id || "N/A"}
                    </td>

                    <td>{order.customer_name || "N/A"}</td>

                    <td>{order.vendor_name || "N/A"}</td>

                    <td>{formatAmount(order.amount)}</td>

                    <td>
                      <span className={`status ${status}`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                  No recent orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DashboardRecentOrder;