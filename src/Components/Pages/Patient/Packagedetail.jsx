
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBoxOpen,
  FaCalendarAlt,
  FaCreditCard,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaEye,
  FaTag,
} from "react-icons/fa";
import BASE_URL from "../../../Base";
import "./PackageDetail.css";

const PackageDetail = ({ patientId }) => {
  const navigate = useNavigate();

  const [packageData, setPackageData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  useEffect(() => {
    if (patientId) {
      getPatientPackages();
    } else {
      setPackageData([]);
    }
  }, [patientId]);

  useEffect(() => {
    if (!selectedPurchase) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") setSelectedPurchase(null);
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [selectedPurchase]);

  const getPatientPackages = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${BASE_URL}/packages/admin/purchases/?patient_id=${encodeURIComponent(
          patientId
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch package purchases"
        );
      }

      setPackageData(result?.data?.results || []);
    } catch (err) {
      console.error("Package Purchase API Error:", err);
      setError(err.message || "Failed to fetch package purchases");
      setPackageData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount, currency = "INR") => {
    if (amount === null || amount === undefined || amount === "") {
      return "N/A";
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) return "N/A";

    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(numericAmount);
    } catch {
      return `₹${numericAmount.toLocaleString("en-IN")}`;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "success":
      case "completed":
      case "paid":
        return "package-status-active";

      case "pending":
      case "processing":
        return "package-status-pending";

      case "expired":
        return "package-status-expired";

      case "cancelled":
      case "failed":
      case "rejected":
        return "package-status-failed";

      default:
        return "package-status-default";
    }
  };

  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const displayMode = (value) => {
    if (!value) return "N/A";

    return String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const getEntitlements = (purchase) =>
    Array.isArray(purchase?.entitlements) ? purchase.entitlements : [];

  const getIncludes = (purchase) =>
    Array.isArray(purchase?.benefits_snapshot?.includes)
      ? purchase.benefits_snapshot.includes
      : [];

  const renderDetail = (label, value) => (
    <div className="package-modal-detail" key={label}>
      <span>{label}</span>
      <strong>{displayValue(value)}</strong>
    </div>
  );

  const renderDateDetail = (label, value, icon) => (
    <div className="package-modal-date" key={label}>
      {icon}
      <div>
        <span>{label}</span>
        <strong>{formatDate(value)}</strong>
      </div>
    </div>
  );

  return (
    <div className="package-purchase-page">
      <div className="package-purchase-header">
        <div className="package-purchase-heading">
          <div className="package-purchase-heading-icon">
            <FaBoxOpen />
          </div>

          <div>
            <h2>Package Purchase History</h2>
            <p>View all packages purchased by this patient.</p>
          </div>
        </div>

        <div className="package-total-count">
          Total Purchases <span>{packageData.length}</span>
        </div>
      </div>

      {loading ? (
        <div className="package-state">
          <div className="package-loader" />
          <p>Loading package purchases...</p>
        </div>
      ) : error ? (
        <div className="package-state package-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={getPatientPackages}
            className="package-retry-btn"
          >
            Retry
          </button>
        </div>
      ) : packageData.length === 0 ? (
        <div className="package-state">
          <FaBoxOpen className="package-empty-icon" />
          <h3>No Package Purchases Found</h3>
          <p>This patient has not purchased any packages.</p>
        </div>
      ) : (
        <div className="package-table-container">
          <div className="package-table-wrapper">
            <table className="package-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Package Name</th>
                  <th>Paid Amount</th>
                  <th>Billing Mode</th>
                  <th>Purchase Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {packageData.map((purchase, index) => {
                  const snapshot = purchase.package_snapshot || {};

                  return (
                    <tr key={purchase.id || index}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="package-table-name">
                          <div className="package-table-icon">
                            <FaBoxOpen />
                          </div>

                          <div>
                            <strong>
                              {purchase.package_name_snapshot ||
                                snapshot.name ||
                                "Unnamed Package"}
                            </strong>

                            <small>
                              ID: {purchase.id || "N/A"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong className="package-table-amount">
                          {formatAmount(
                            purchase.paid_price,
                            purchase.currency || "INR"
                          )}
                        </strong>
                      </td>

                      <td>
                        <span className="package-mode-text">
                          {displayMode(
                            purchase.billing_mode || snapshot.billing_mode
                          )}
                        </span>
                      </td>

                      <td className="package-table-date">
                        {formatDate(purchase.created_at)}
                      </td>

                      <td>
                        <span
                          className={`package-status ${getStatusClass(
                            purchase.status
                          )}`}
                        >
                          {purchase.status || "Unknown"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="package-view-btn"
                          onClick={() => setSelectedPurchase(purchase)}
                        >
                          <FaEye />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="package-table-footer">
            Showing {packageData.length} purchase
            {packageData.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {selectedPurchase && (
        <div
          className="package-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPurchase(null);
            }
          }}
        >
          <div
            className="package-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="package-modal-title"
          >
            <div className="package-modal-header">
              <div className="package-modal-heading">
                <div className="package-modal-icon">
                  <FaBoxOpen />
                </div>

                <div>
                  <h2 id="package-modal-title">
                    Package Purchase Details
                  </h2>
                  <p>
                    {selectedPurchase.package_name_snapshot ||
                      selectedPurchase.package_snapshot?.name ||
                      "Unnamed Package"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="package-modal-close"
                aria-label="Close details"
                onClick={() => setSelectedPurchase(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="package-modal-body">
              <section className="package-modal-summary">
                <div>
                  <span>Paid Amount</span>
                  <strong className="package-modal-paid">
                    {formatAmount(
                      selectedPurchase.paid_price,
                      selectedPurchase.currency || "INR"
                    )}
                  </strong>
                </div>

                <div>
                  <span>Original Price</span>
                  <strong className="package-modal-original">
                    {formatAmount(
                      selectedPurchase.original_price,
                      selectedPurchase.currency || "INR"
                    )}
                  </strong>
                </div>

                <div>
                  <span>Purchase Status</span>
                  <span
                    className={`package-status ${getStatusClass(
                      selectedPurchase.status
                    )}`}
                  >
                    {selectedPurchase.status || "Unknown"}
                  </span>
                </div>
              </section>

              <section className="package-modal-section">
                <h3>
                  <FaBoxOpen /> Package Information
                </h3>

                <div className="package-modal-grid">
                  {renderDetail(
                    "Purchase ID",
                    selectedPurchase.id
                  )}
                  {renderDetail(
                    "Package Name",
                    selectedPurchase.package_name_snapshot ||
                      selectedPurchase.package_snapshot?.name
                  )}
                  {renderDetail(
                    "Category",
                    selectedPurchase.package_snapshot?.category_name
                  )}
                  {renderDetail(
                    "Purchase Type",
                    displayMode(
                      selectedPurchase.package_snapshot?.purchase_type
                    )
                  )}
                  {renderDetail(
                    "Billing Mode",
                    displayMode(
                      selectedPurchase.billing_mode ||
                        selectedPurchase.package_snapshot?.billing_mode
                    )
                  )}
                  {renderDetail(
                    "Validity",
                    selectedPurchase.package_snapshot?.validity_days
                      ? `${selectedPurchase.package_snapshot.validity_days} days`
                      : selectedPurchase.expires_at
                      ? formatDate(selectedPurchase.expires_at)
                      : "No expiry date"
                  )}
                  {renderDetail(
                    "Fulfillment",
                    displayMode(
                      selectedPurchase.package_snapshot?.fulfillment
                    )
                  )}
                  {renderDetail(
                    "Currency",
                    selectedPurchase.currency || "INR"
                  )}
                </div>
              </section>

              <section className="package-modal-section">
                <h3>
                  <FaCalendarAlt /> Purchase Timeline
                </h3>

                <div className="package-modal-dates">
                  {renderDateDetail(
                    "Purchase Date",
                    selectedPurchase.created_at,
                    <FaCalendarAlt />
                  )}
                  {renderDateDetail(
                    "Paid At",
                    selectedPurchase.paid_at,
                    <FaCheckCircle />
                  )}
                  {renderDateDetail(
                    "Start Date",
                    selectedPurchase.starts_at,
                    <FaClock />
                  )}
                  {renderDateDetail(
                    "Expiry Date",
                    selectedPurchase.expires_at,
                    <FaCalendarAlt />
                  )}
                </div>
              </section>

              <section className="package-modal-section">
                <h3>
                  <FaCreditCard /> Payment Details
                </h3>

                <div className="package-modal-grid">
                  {renderDetail(
                    "Razorpay Order ID",
                    selectedPurchase.razorpay_order_id
                  )}
                  {renderDetail(
                    "Razorpay Payment ID",
                    selectedPurchase.razorpay_payment_id
                  )}
                  {renderDetail(
                    "Subscription ID",
                    selectedPurchase.razorpay_subscription_id
                  )}
                  {renderDetail(
                    "Autopay Status",
                    displayMode(selectedPurchase.autopay_status)
                  )}
                  {renderDetail(
                    "Shift Status",
                    displayMode(selectedPurchase.shift_status)
                  )}
                </div>
              </section>

              <section className="package-modal-section">
                <h3>
                  <FaTag /> Package Benefits
                </h3>

                {getIncludes(selectedPurchase).length > 0 ? (
                  <div className="package-modal-includes">
                    {getIncludes(selectedPurchase).map(
                      (benefit, index) => (
                        <span key={index}>
                          <FaCheckCircle />
                          {typeof benefit === "string"
                            ? benefit
                            : displayValue(benefit)}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="package-modal-empty">
                    No included benefits available.
                  </p>
                )}
              </section>

            </div>

            <div className="package-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedPurchase(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageDetail;
