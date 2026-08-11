
import React from "react";

const DashboardRecentOrder = ({ orders }) => {
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
            {orders.map((order) => (
              <tr key={order[0]}>

                {order.map((cell, index) => (
                  <td key={`${order[0]}-${index}`}>

                    {index === 4 ? (
                      <span
                        className={`status ${cell.toLowerCase()}`}
                      >
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}

                  </td>
                ))}

              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </section>
  );
};

export default DashboardRecentOrder;