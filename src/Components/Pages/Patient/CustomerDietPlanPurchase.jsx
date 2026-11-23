
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaAppleAlt,
  FaCalendarAlt,
  FaCreditCard,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaEye,
  FaTag,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaReceipt,
  FaWallet,
  FaChartBar,
  FaTimesCircle,
  FaUndoAlt,
  FaClipboardList,
} from "react-icons/fa";

import BASE_URL from "../../../Base";
import "./PackageDetail.css";

const CustomerDietPlanPurchase = ({ patientId }) => {
  const navigate = useNavigate();

  const [purchaseData, setPurchaseData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    pending: 0,
    failed: 0,
    cancelled: 0,
    refunded: 0,
    active_assignments: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // GET DIET PLAN PURCHASES
  const getDietPlanPurchases = useCallback(async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const query = patientId
        ? `?patient_id=${encodeURIComponent(patientId)}`
        : "";

      const response = await fetch(
        `${BASE_URL}/diet/admin/purchases/${query}`,
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
          result.message || "Failed to fetch diet plan purchases"
        );
      }

      const data = result?.data || {};

      setPurchaseData(data.results || []);

      setStats({
        total: Number(data.stats?.total ?? data.count ?? 0),
        success: Number(data.stats?.success ?? 0),
        pending: Number(data.stats?.pending ?? 0),
        failed: Number(data.stats?.failed ?? 0),
        cancelled: Number(data.stats?.cancelled ?? 0),
        refunded: Number(data.stats?.refunded ?? 0),
        active_assignments: Number(
          data.stats?.active_assignments ?? 0
        ),
      });
    } catch (err) {
      console.error("Diet Plan Purchase API Error:", err);
      setError(err.message || "Failed to fetch diet plan purchases");
      setPurchaseData([]);
      setStats({
        total: 0,
        success: 0,
        pending: 0,
        failed: 0,
        cancelled: 0,
        refunded: 0,
        active_assignments: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [patientId, navigate]);

  useEffect(() => {
    getDietPlanPurchases();
  }, [getDietPlanPurchases]);

  // CLOSE MODAL ON ESCAPE
  useEffect(() => {
    if (!selectedPurchase) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedPurchase(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [selectedPurchase]);

  // FORMAT DATE
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

  // DISPLAY VALUE
  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // DISPLAY MODE
  const displayMode = (value) => {
    if (!value) return "N/A";

    return String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // STATUS CLASS
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

      case "refunded":
        return "package-status-default";

      default:
        return "package-status-default";
    }
  };

  // RENDER DETAIL
  const renderDetail = (label, value) => (
    <div className="package-modal-detail" key={label}>
      <span>{label}</span>
      <strong>{displayValue(value)}</strong>
    </div>
  );

  // RENDER DATE
  const renderDateDetail = (label, value, icon) => (
    <div className="package-modal-date" key={label}>
      {icon}
      <div>
        <span>{label}</span>
        <strong>{formatDate(value)}</strong>
      </div>
    </div>
  );

  // PAYMENT FEE BREAKDOWN
  const renderFeeDetails = (purchase) => {
    const fees = purchase.fees || {};
    const snapshot = purchase.fee_snapshot || {};

    // Prefer fee_snapshot when populated, otherwise use fees.
    const feeData =
      Object.keys(snapshot).length > 0 ? snapshot : fees;

    const feeRows = [
      {
        label: "Listed Price",
        value: feeData.listed_price ?? purchase.listed_price,
      },
      {
        label: "Selling Price",
        value: feeData.selling_price,
      },
      {
        label: `GST (${feeData.gst_percent ?? "0"}%)`,
        value: feeData.gst_amount,
      },
      {
        label: `Platform Fee (${feeData.platform_fee_percent ?? "0"}%)`,
        value: feeData.platform_fee,
      },
    ];

    return (
      <div className="package-fee-breakdown">
        {feeRows.map((item) => (
          <div className="package-fee-row" key={item.label}>
            <span>{item.label}</span>
            <strong>
              {formatAmount(item.value, purchase.currency || "INR")}
            </strong>
          </div>
        ))}

        <div className="package-fee-row package-fee-total">
          <span>Total Payable Amount</span>
          <strong>
            {formatAmount(
              feeData.total_payable_amount ?? purchase.paid_price,
              purchase.currency || "INR"
            )}
          </strong>
        </div>
      </div>
    );
  };

  return (
    <div className="package-purchase-page">

      {/* HEADER */}
      <div className="package-purchase-header">
        <div className="package-purchase-heading">
          <div className="package-purchase-heading-icon">
            <FaAppleAlt />
          </div>

          <div>
            <h2>Diet Plan Purchase History</h2>
            <p>
              View all diet plans purchased by this patient.
            </p>
          </div>
        </div>

        <div className="package-total-count">
          Total Purchases <span>{stats.total}</span>
        </div>
      </div>

      
      <div className="vendors-stats stats2-grid">

        <div className="stat2-card">
          <div
            className="stat2-icon"
          style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaChartBar />
          </div>
          <div className="stat2-info">
            <h3>Total Purchases</h3>
            <h2>{stats.total}</h2>
          </div>
        </div>

        
       
<div className="stat2-card">
  <div
    className="stat2-icon"
 style={{ background: "#0D614E20", color: "#0D614E" }}
  >
    <FaCheckCircle />
  </div>
  <div className="stat2-info">
    <h3>Success</h3>
    <h2>{stats.success}</h2>
  </div>
</div>


        <div className="stat2-card">
          <div
            className="stat2-icon"
       style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaClock />
          </div>
          <div className="stat2-info">
            <h3>Pending</h3>
            <h2>{stats.pending}</h2>
          </div>
        </div>

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{ background: "#fee2e2", color: "#dc2626" }}
          >
            <FaTimesCircle />
          </div>
          <div className="stat2-info">
            <h3>Failed</h3>
            <h2>{stats.failed}</h2>
          </div>
        </div>

       

       

       
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="package-state">
          <div className="package-loader" />
          <p>Loading diet plan purchases...</p>
        </div>
      ) : error ? (
        <div className="package-state package-error">
          <p>{error}</p>
          <button
            type="button"
            onClick={getDietPlanPurchases}
            className="package-retry-btn"
          >
            Retry
          </button>
        </div>
      ) : purchaseData.length === 0 ? (
        <div className="package-state">
          <FaAppleAlt className="package-empty-icon" />
          <h3>No Diet Plan Purchases Found</h3>
          <p>This patient has not purchased any diet plans.</p>
        </div>
      ) : (

        /* PURCHASE TABLE */
        <div className="package-table-container">
          <div className="package-table-wrapper">
            <table className="package-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Diet Plan Name</th>
                  <th>Patient Name</th>
                  <th>Listed Price</th>
                  <th>Paid Amount</th>
                  <th>Gateway</th>
                  <th>Purchase Date</th>
                  <th>Status</th>
                  {/* <th>Assignment</th> */}
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {purchaseData.map((purchase, index) => (
                  <tr key={purchase.id || index}>
                    <td>{index + 1}</td>

             
<td>
                      <div className="package-table-name">
                        <div className="package-table-icon">
                          <FaAppleAlt />
                        </div>

                        <div>
                          <strong>
                            {purchase.diet_plan_name_snapshot ||
                              "Unnamed Diet Plan"}
                          </strong>

                          <small>
                            ID: {purchase.id || "N/A"}
                          </small>
                        </div>
                      </div>
                    </td>


                    <td>
                      <strong>
                        {purchase.patient_name ||
                          `${purchase.patient?.first_name || ""} ${
                            purchase.patient?.last_name || ""
                          }`.trim() ||
                          "N/A"}
                      </strong>
                    </td>

                    <td>
                      {formatAmount(
                        purchase.listed_price,
                        purchase.currency || "INR"
                      )}
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
                        {displayMode(purchase.payment_gateway)}
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
                        {displayMode(purchase.status)}
                      </span>
                    </td>

                    {/* <td>
                      <span
                        className={`package-status ${getStatusClass(
                          purchase.assignment_status
                        )}`}
                      >
                        {displayMode(
                          purchase.assignment_status
                        )}
                      </span>
                    </td> */}

                    <td>
                      <button
                        type="button"
                        className="package-view-btn"
                        onClick={() =>
                          setSelectedPurchase(purchase)
                        }
                      >
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="package-table-footer">
            Showing {purchaseData.length} purchase
            {purchaseData.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* PURCHASE DETAIL MODAL */}
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
            aria-labelledby="diet-modal-title"
          >

            {/* MODAL HEADER */}
            <div className="package-modal-header">
              <div className="package-modal-heading">
                <div className="package-modal-icon">
                  <FaAppleAlt />
                </div>

                <div>
                  <h2 id="diet-modal-title">
                    Diet Plan Purchase Details
                  </h2>
                  <p>
                    {selectedPurchase.diet_plan_name_snapshot ||
                      "Diet Plan"}
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

              {/* SUMMARY */}
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
                  <span>Listed Price</span>
                  <strong className="package-modal-original">
                    {formatAmount(
                      selectedPurchase.listed_price,
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
                    {displayMode(selectedPurchase.status)}
                  </span>
                </div>
              </section>

              {/* DIET PLAN INFORMATION */}
              <section className="package-modal-section">
                <h3>
                  <FaAppleAlt /> Diet Plan Information
                </h3>

                <div className="package-modal-grid">
                  {renderDetail(
                    "Purchase ID",
                    selectedPurchase.id
                  )}

                  {renderDetail(
                    "Diet Plan Name",
                    selectedPurchase.diet_plan_name_snapshot
                  )}

                  {renderDetail(
                    "Diet Plan ID",
                    selectedPurchase.diet_plan
                  )}

                  {renderDetail(
                    "Patient ID",
                    selectedPurchase.patient_id
                  )}

                  {renderDetail(
                    "Currency",
                    selectedPurchase.currency
                  )}

                  {renderDetail(
                    "Assignment Status",
                    displayMode(
                      selectedPurchase.assignment_status
                    )
                  )}
                </div>
              </section>

              {/* CUSTOMER INFORMATION */}
              <section className="package-modal-section">
                <h3>
                  <FaUser /> Customer Information
                </h3>

                <div className="package-modal-grid">
                  {renderDetail(
                    "Customer Name",
                    `${selectedPurchase.customer?.first_name || ""} ${
                      selectedPurchase.customer?.last_name || ""
                    }`.trim()
                  )}

                  {renderDetail(
                    "Customer ID",
                    selectedPurchase.customer?.id
                  )}

                  {renderDetail(
                    "Phone Number",
                    selectedPurchase.customer?.phone_number
                  )}

                  {renderDetail(
                    "Email",
                    selectedPurchase.customer?.email
                  )}

                  {renderDetail(
                    "Patient Name",
                    selectedPurchase.patient_name
                  )}

                  {renderDetail(
                    "Patient Relation",
                    displayMode(
                      selectedPurchase.patient?.relation
                    )
                  )}

                  {renderDetail(
                    "Patient ID",
                    selectedPurchase.patient?.id
                  )}
                </div>
              </section>

              {/* PURCHASE TIMELINE */}
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
                    "Last Updated",
                    selectedPurchase.updated_at,
                    <FaClock />
                  )}
                </div>
              </section>

              {/* PAYMENT DETAILS */}
              <section className="package-modal-section">
                <h3>
                  <FaCreditCard /> Payment Details
                </h3>

                <div className="package-modal-grid">
                  {renderDetail(
                    "Payment Gateway",
                    displayMode(
                      selectedPurchase.payment_gateway
                    )
                  )}

                  {renderDetail(
                    "Gateway Order ID",
                    selectedPurchase.gateway_order_id
                  )}

                  {renderDetail(
                    "Gateway Payment ID",
                    selectedPurchase.gateway_payment_id
                  )}

                  {renderDetail(
                    "Payment Status",
                    displayMode(selectedPurchase.status)
                  )}

                  {renderDetail(
                    "Paid Amount",
                    formatAmount(
                      selectedPurchase.paid_price,
                      selectedPurchase.currency || "INR"
                    )
                  )}
                </div>
              </section>

              {/* FEE BREAKDOWN */}
              <section className="package-modal-section">
                <h3>
                  <FaReceipt /> Payment Fee Breakdown
                </h3>

                {renderFeeDetails(selectedPurchase)}
              </section>

              {/* FEE SNAPSHOT */}
              <section className="package-modal-section">
                <h3>
                  <FaWallet /> Fee Snapshot
                </h3>

                {Object.keys(
                  selectedPurchase.fee_snapshot || {}
                ).length > 0 ? (
                  <div className="package-modal-grid">
                    {renderDetail(
                      "GST Percentage",
                      `${selectedPurchase.fee_snapshot.gst_percent ?? 0}%`
                    )}

                    {renderDetail(
                      "GST Amount",
                      formatAmount(
                        selectedPurchase.fee_snapshot.gst_amount,
                        selectedPurchase.currency || "INR"
                      )
                    )}

                    {renderDetail(
                      "Platform Fee Percentage",
                      `${
                        selectedPurchase.fee_snapshot
                          .platform_fee_percent ?? 0
                      }%`
                    )}

                    {renderDetail(
                      "Platform Fee",
                      formatAmount(
                        selectedPurchase.fee_snapshot.platform_fee,
                        selectedPurchase.currency || "INR"
                      )
                    )}
                  </div>
                ) : (
                  <p className="package-modal-empty">
                    No fee snapshot available.
                  </p>
                )}
              </section>

            </div>

            {/* MODAL FOOTER */}
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

export default CustomerDietPlanPurchase;