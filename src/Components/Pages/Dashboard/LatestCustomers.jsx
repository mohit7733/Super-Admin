
import React from "react";
import { useNavigate } from "react-router-dom";
import { UserRound } from "lucide-react";

const LatestCustomers = ({ customers = [] }) => {
  const navigate = useNavigate();
  const safeCustomers = Array.isArray(customers) ? customers : [];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="panel latest-customers">
      <div className="panel-heading">
        <h2>Latest Customers</h2>

        <button
          type="button"
          className="link-button"
          onClick={() => navigate("/customer")}
        >
          View All
        </button>
      </div>

      <div className="customer-list">
        {safeCustomers.length > 0 ? (
          safeCustomers.map((customer, index) => (
            <div key={customer.customer_id || customer.id || index}>
              <div className="round-avatar blue-photo">
                {customer.profile_picture ? (
                  <img
                    src={customer.profile_picture}
                    alt={customer.name || "Customer"}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                  />
                ) : (
                  <UserRound size={16} />
                )}
              </div>

              <div>
                <strong>{customer.name || "N/A"}</strong>
                <small>
                  {customer.email ||
                    customer.phone_number ||
                    "No contact information"}
                </small>
              </div>

              <small
                style={{
                  marginLeft: "auto",
                  textAlign: "right",
                }}
              >
                {formatDate(customer.created_at)}
              </small>
            </div>
          ))
        ) : (
          <p className="empty-state">No customers available.</p>
        )}
      </div>
    </div>
  );
};

export default LatestCustomers;
