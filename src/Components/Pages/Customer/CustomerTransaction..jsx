
import React, { useState, useEffect, useCallback } from "react";
import {
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaUndoAlt,
  FaWallet,
} from "react-icons/fa";

import BASE_URL from "../../../Base";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CustomerTransaction = () => {
  const [TransactionData, setTransactionData] = useState([]);
  const [TransactionError, setTransactionError] = useState(null);
  const [TransactionLoading, setTransactionLoading] = useState(false);

  const { customerId } = useParams();
  const navigate = useNavigate();


  const pagesize = 10;

  const [totalCount, setTotalCount] = useState(0);
  const [currentpage, setCurrentPage] = useState(1);
  const [Nextpage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const totalPages = Math.ceil(totalCount / pagesize);

 
  const startItem =
    totalCount === 0 ? 0 : (currentpage - 1) * pagesize + 1;

  const endItem = Math.min(currentpage * pagesize, totalCount);

  const getVisiblePages = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentpage <= 2) {
      return [1, 2, "...", totalPages];
    }

    if (currentpage >= totalPages - 1) {
      return [1, "...", totalPages - 1, totalPages];
    }

    return [
      1,
      "...",
      currentpage,
      "...",
      totalPages,
    ];
  };

  // Fetch transactions
  const getTransactionlist = useCallback(async (page = 1) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session Expired, Login Again");
      navigate("/login");
      return;
    }

    try {
      setTransactionLoading(true);
      setTransactionError(null);

      const response = await fetch(
        `${BASE_URL}/payments/admin/transactions/?customer_id=${customerId}&type=all&page=${page}&page_size=${pagesize}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Transaction API Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch transactions");
      }

      const result = data.data;

      setTransactionData(result?.results || []);
      setTotalCount(result?.count || 0);
      setNextPage(result?.next || null);
      setPreviousPage(result?.previous || null);
      setCurrentPage(page);

    } catch (error) {
      console.error(error);

      setTransactionError(
        "Something went wrong while fetching transactions"
      );

      toast.error("Failed to fetch Transaction Data");

    } finally {
      setTransactionLoading(false);
    }
  }, [customerId, navigate]);

  // Initial API call
  useEffect(() => {
    getTransactionlist(1);
  }, [getTransactionlist]);

  // Status styling
  const getStatusStyle = (status) => {
    const value = status?.toLowerCase();

    switch (value) {
      case "success":
      case "booked":
      case "completed":
      case "approved":
      case "confirmed":
        return {
          background: "#0D614E20",
          color: "#0D614E",
        };

      case "pending":
      case "processing":
      case "reschedule":
      case "rescheduled":
        return {
          background: "#fef3c7",
          color: "#b45309",
        };

      case "failed":
      case "rejected":
      case "cancelled":
      case "expired":
      case "missed":
      case "cancellation_requested":
        return {
          background: "#fee2e2",
          color: "#dc2626",
        };

      case "refunded":
        return {
          background: "#ede9fe",
          color: "#7c3aed",
        };

      default:
        return {
          background: "#f1f5f9",
          color: "#475569",
        };
    }
  };

  return (
    <>
      <div className="transaction-main-card">

        {/* Header */}
        <div className="transaction-header">
          <div className="transaction-header-top">
            <div className="transaction-title-wrap">
              <div>
                <h2>Transaction History</h2>
                <p>
                  Track all payment activities for Consultation and Orders
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="vendors-stats stats2-grid">

          <div className="stat2-card">
            <div
              className="stat2-icon"
              style={{ background: "#0D614E20", color: "#0D614E" }}
            >
              <FaClock size={16} />
            </div>
            <div className="stat2-info">
              <h3>Pending</h3>
            </div>
          </div>

          <div className="stat2-card">
            <div
              className="stat2-icon"
              style={{ background: "#0D614E20", color: "#0D614E" }}
            >
              <FaCheckCircle size={16} />
            </div>
            <div className="stat2-info">
              <h3>Success</h3>
            </div>
          </div>

          <div className="stat2-card">
            <div
              className="stat2-icon"
              style={{ background: "#0D614E20", color: "#0D614E" }}
            >
              <FaTimesCircle size={16} />
            </div>
            <div className="stat2-info">
              <h3>Failed</h3>
            </div>
          </div>

          <div className="stat2-card">
            <div
              className="stat2-icon"
              style={{ background: "#0D614E20", color: "#0D614E" }}
            >
              <FaUndoAlt size={16} />
            </div>
            <div className="stat2-info">
              <h3>Refunded</h3>
            </div>
          </div>

          <div className="stat2-card">
            <div
              className="stat2-icon"
              style={{ background: "#0D614E20", color: "#0D614E" }}
            >
              <FaWallet size={16} />
            </div>
            <div className="stat2-info">
              <h3>Total Revenue</h3>
            </div>
          </div>

        </div>

        {/* Transaction Table */}
        <div className="table-wrapper">

          <table className="data-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Patient Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {TransactionLoading ? (

                Array(4).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="7">
                      <div className="transaction-skeleton-row"></div>
                    </td>
                  </tr>
                ))

              ) : TransactionError ? (

                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      color: "red",
                      padding: "30px",
                    }}
                  >
                    {TransactionError}
                  </td>
                </tr>

              ) : TransactionData.length > 0 ? (

                TransactionData.map((transaction) => (
                  <tr key={transaction.id}>

                    <td>{transaction.transaction_id}</td>

                    <td>
                      <span
                        className={`transaction-type ${
                          transaction.type?.toLowerCase() === "order"
                            ? "order"
                            : "consultation"
                        }`}
                      >
                        {transaction.transaction_type === "product"
                          ? "Product"
                          : "Consultation"}
                      </span>
                    </td>

                    <td>
                      {transaction.transaction_type?.toLowerCase() === "product"
                        ? transaction.customer?.name || "N/A"
                        : transaction.patient?.name || "N/A"}
                    </td>

                    <td>₹ {transaction.amount || 0}</td>

                    <td>
                      {transaction.paid_at
                        ? new Date(transaction.paid_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : transaction.created_at
                        ? new Date(transaction.created_at).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "N/A"}
                    </td>

                    <td>
                      {transaction?.payment_method || "N/A"}
                    </td>

                    <td>
                      <span
                        className="transaction-status-badge"
                        style={getStatusStyle(transaction.status)}
                      >
                        {transaction.status || "N/A"}
                      </span>
                    </td>

                  </tr>
                ))

              ) : (

                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      padding: "40px",
                    }}
                  >
                    No Transaction Found
                  </td>
                </tr>

              )}

            </tbody>
          </table>

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="transaction-pagination">

              <div className="pagination-info">
                Showing <strong>{startItem}</strong> to{" "}
                <strong>{endItem}</strong> of{" "}
                <strong>{totalCount}</strong> transactions
              </div>

              <div className="pagination-controls">

                {/* Previous */}
                <button
                  className="pagination-arrow"
                  onClick={() =>
                    getTransactionlist(currentpage - 1)
                  }
                  disabled={!previousPage || TransactionLoading}
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {/* Page Numbers */}
                {getVisiblePages().map((page, index) => (
                  page === "..." ? (

                    <span
                      key={`dots-${index}`}
                      className="pagination-dots"
                    >
                      ...
                    </span>

                  ) : (

                    <button
                      key={page}
                      className={`pagination-number ${
                        currentpage === page ? "active" : ""
                      }`}
                      onClick={() => getTransactionlist(page)}
                      disabled={TransactionLoading}
                    >
                      {page}
                    </button>

                  )
                ))}

                {/* Next */}
                <button
                  className="pagination-arrow"
                  onClick={() =>
                    getTransactionlist(currentpage + 1)
                  }
                  disabled={!Nextpage || TransactionLoading}
                  aria-label="Next page"
                >
                  ›
                </button>

              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default CustomerTransaction;
