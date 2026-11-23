
import React, { useEffect, useState, useCallback } from "react";
import {
  FaSearch,
  FaTimes,
  FaEye,
  FaEllipsisV,
  FaClock,
  FaMoneyBillWave,
  FaCheckCircle,
} from "react-icons/fa";
import {
  FaCircleCheck,
  FaCircleXmark,
} from "react-icons/fa6";
import { FiTrash2 } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

import BASE_URL from "../../../Base";
import "./ConsultationRefundRequest.css";

const ConsultationRefundRequest = () => {
  const navigate = useNavigate();

  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [openActionId, setOpenActionId] = useState(null);

  const [approveModal, setApproveModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [viewModal, setViewModal] = useState(null);

  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const [rejectReason, setRejectReason] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const [adminStatusFilter, setAdminStatusFilter] = useState("");
  const [gatewayStatusFilter, setGatewayStatusFilter] = useState("");

  // DYNAMIC BACKEND STATISTICS
  const [stats, setStats] = useState({
    total_requests: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  /* =====================================================
     FETCH REFUND REQUESTS
  ===================================================== */

  const getRefundRequests = useCallback(async (
    page = 1,
    search = "",
    adminStatus = "",
    gatewayStatus = ""
  ) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      params.append("source_type", "consultation");

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (adminStatus) {
        params.append("admin_status", adminStatus);
      }

      if (gatewayStatus) {
        params.append("gateway_status", gatewayStatus);
      }

      params.append("page", page);
      params.append("page_size", pageSize);

      const apiUrl =
        `${BASE_URL}/payments/admin/refund-requests/?${params.toString()}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        const refundData = Array.isArray(data?.data?.results)
          ? data.data.results
          : [];

        setRefundRequests(refundData);

        setTotalCount(Number(data?.data?.count || 0));
        setNextPage(data?.data?.next || null);
        setPreviousPage(data?.data?.previous || null);

        // ==========================================
        // DYNAMIC STATS FROM BACKEND
        // Expected response: data.data.stats
        // ==========================================

        const backendStats = data?.data?.stats || {};

        setStats({
          total_requests: Number(
            backendStats.total_requests ??
            data?.data?.count ??
            0
          ),
          approved: Number(backendStats.approved ?? 0),
          rejected: Number(backendStats.rejected ?? 0),
          pending: Number(backendStats.pending ?? 0),
        });

        setCurrentPage(page);
      } else {
        setRefundRequests([]);
        setTotalCount(0);
        setNextPage(null);
        setPreviousPage(null);

        setStats({
          total_requests: 0,
          approved: 0,
          rejected: 0,
          pending: 0,
        });

        setError(
          data.message || "Failed to fetch consultation refund requests"
        );

        toast.error(
          data.message || "Failed to fetch consultation refund requests"
        );
      }
    } catch (err) {
      console.error("Refund Fetch Error:", err);

      setError("Something went wrong while fetching refund requests.");
      setRefundRequests([]);
      setTotalCount(0);
      setNextPage(null);
      setPreviousPage(null);

      toast.error("Failed to fetch refund requests");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /* =====================================================
     SEARCH AND FILTERS
  ===================================================== */

  useEffect(() => {
    const timer = setTimeout(() => {
      getRefundRequests(
        1,
        searchTerm,
        adminStatusFilter,
        gatewayStatusFilter
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [
    searchTerm,
    adminStatusFilter,
    gatewayStatusFilter,
    getRefundRequests,
  ]);

  
  const handleView = (item) => {
    setOpenActionId(null);
    setViewModal(item);
  };

 
  const handleApprove = (item) => {
    setOpenActionId(null);
    setApproveModal(item);
  };

  const handleApproveRefund = async () => {
    if (!approveModal?.id) {
      toast.error("Refund request ID is missing");
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setIsApproving(true);

    try {
      const response = await fetch(
        `${BASE_URL}/payments/admin/refund-requests/${approveModal.id}/approve/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          data.message || "Refund request approved successfully"
        );

        setApproveModal(null);

        await getRefundRequests(
          currentPage,
          searchTerm,
          adminStatusFilter,
          gatewayStatusFilter
        );
      } else {
        toast.error(data.message || "Failed to approve refund request");
      }
    } catch (err) {
      console.error("Approve Refund Error:", err);
      toast.error("Something went wrong while approving refund request");
    } finally {
      setIsApproving(false);
    }
  };

  /* =====================================================
     REJECT
  ===================================================== */

  const handleReject = (item) => {
    setOpenActionId(null);
    setRejectReason("");
    setRejectModal(item);
  };

  const handleRejectRefund = async () => {
    if (!rejectModal?.id) {
      toast.error("Refund request ID is missing");
      return;
    }

    if (!rejectReason.trim()) {
      toast.error("Please enter rejection reason");
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setIsRejecting(true);

    try {
      const response = await fetch(
        `${BASE_URL}/payments/admin/refund-requests/${rejectModal.id}/reject/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            note: rejectReason.trim(),
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          data.message || "Refund request rejected successfully"
        );

        setRejectModal(null);
        setRejectReason("");

        await getRefundRequests(
          currentPage,
          searchTerm,
          adminStatusFilter,
          gatewayStatusFilter
        );
      } else {
        toast.error(data.message || "Failed to reject refund request");
      }
    } catch (err) {
      console.error("Reject Refund Error:", err);
      toast.error("Something went wrong while rejecting refund request");
    } finally {
      setIsRejecting(false);
    }
  };

  /* =====================================================
     STATUS CLASSES
  ===================================================== */

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "refund-status-approved";
      case "rejected":
        return "refund-status-rejected";
      case "pending":
        return "refund-status-pending";
      default:
        return "refund-status-default";
    }
  };

  const getGatewayStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "processed":
        return "refund-status-approved";
      case "failed":
        return "refund-status-rejected";
      case "pending":
      case "processing":
        return "refund-status-pending";
      case "not_applicable":
        return "refund-status-default";
      default:
        return "refund-status-default";
    }
  };

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  const formatDate = (date) => {
    if (!date) return null;

    const formatted = new Date(date);

    if (Number.isNaN(formatted.getTime())) {
      return null;
    }

    return {
      date: formatted.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),

      time: formatted.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  /* =====================================================
     FORMAT REASON
  ===================================================== */

  const formatReason = (reason) => {
    if (!reason) return "-";

    return String(reason)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  const hasActiveFilters =
    searchTerm || adminStatusFilter || gatewayStatusFilter;

  const handleClearFilters = () => {
    setSearchTerm("");
    setAdminStatusFilter("");
    setGatewayStatusFilter("");
    setCurrentPage(1);
  };

  /* =====================================================
     PAGINATION
  ===================================================== */

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage ||
      loading
    ) {
      return;
    }

    getRefundRequests(
      page,
      searchTerm,
      adminStatusFilter,
      gatewayStatusFilter
    );
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>Consultation Refund Requests</h1>
          <p>Manage refund requests raised for consultations</p>
        </div>
      </div>

      {/* DYNAMIC STATS */}

      <div className="stats2-grid">

        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaMoneyBillWave size={16} />
          </div>

          <div className="stat2-info">
            <h3>Total Requests</h3>
            <div className="stat2-value">
              {stats.total_requests||"0"}
            </div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaCircleCheck size={16} />
          </div>

          <div className="stat2-info">
            <h3>Approved</h3>
            <div className="stat2-value">
              {stats.approved||"0"}
            </div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#dc3545" }}>
          <div
            className="stat2-icon"
            style={{ background: "#dc354520", color: "#dc3545" }}
          >
            <FaCircleXmark size={16} />
          </div>

          <div className="stat2-info">
            <h3>Rejected</h3>
            <div className="stat2-value">
              {stats.rejected ||"0"}
            </div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#d99b00" }}>
          <div
            className="stat2-icon"
            style={{ background: "#d99b0020", color: "#d99b00" }}
          >
            <FaClock size={16} />
          </div>

          <div className="stat2-info">
            <h3>Pending</h3>
            <div className="stat2-value">
              {stats.pending||"0"}
            </div>
          </div>
        </div>

      </div>

      {/* SEARCH AND FILTERS */}

      <div className="refund-filter-bar">

        <div className="refund-search-wrapper">
          <FaSearch className="refund-search-icon" />

          <input
            type="text"
            placeholder="Search by appointment, customer, payment ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="refund-search-input"
          />

          {searchTerm && (
            <button
              type="button"
              className="refund-clear-search"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              title="Clear Search"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="refund-filter-right">

          <select
            className="refund-filter-select"
            value={adminStatusFilter}
            onChange={(e) => {
              setAdminStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Admin Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="refund-filter-select"
            value={gatewayStatusFilter}
            onChange={(e) => {
              setGatewayStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Gateway Status</option>
            <option value="not_applicable">Not Applicable</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="processed">Processed</option>
            <option value="failed">Failed</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="refund-clear-filter-btn"
              onClick={handleClearFilters}
              title="Clear Filters"
            >
              <FiTrash2 />
            </button>
          )}

        </div>
      </div>

      {/* TABLE */}

      <div className="refund-table-wrapper">

        <table className="refund-table">

          <thead className="refund-table-head">
            <tr>
              <th>Customer ID</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Refund Method</th>
              <th>Admin Status</th>
              <th>Gateway Status</th>
              <th>Requested At</th>
              <th>Processed At</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody className="refund-table-body">

            {loading && (
              <tr>
                <td colSpan="9" className="refund-loading">
                  Loading refund requests...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan="9" className="refund-empty">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && refundRequests.length === 0 && (
              <tr>
                <td colSpan="9" className="refund-empty">
                  {searchTerm
                    ? `No refund request found for "${searchTerm}"`
                    : "No consultation refund requests found."}
                </td>
              </tr>
            )}

            {!loading && !error && refundRequests.map((item, index) => (

              <tr key={item.id || index}>

                <td>
                  <div className="refund-customer">

                    <div className="refund-customer-name">
                      {item.customer?.name || "-"}
                    </div>

                    <div className="refund-customer-phone">
                      {item.customer?.phone || "-"}
                    </div>

                    <div className="refund-customer-appointment">
                      Appointment ID:{" "}
                      <span title={item.appointment_id}>
                        {item.appointment_id
                          ? `${item.appointment_id.substring(0, 8)}...`
                          : "-"}
                      </span>
                    </div>

                  </div>
                </td>

                <td>
                  <strong className="refund-amount">
                    ₹{Number(item.amount || 0).toFixed(2)}
                  </strong>
                </td>

                <td>
                  <span className="refund-reason" title={item.reason}>
                    {formatReason(item.reason)}
                  </span>
                </td>

                <td>{formatReason(item.refund_method)}</td>

                <td>
                  <span className={`refund-status ${getStatusClass(item.admin_status)}`}>
                    {formatReason(item.admin_status)}
                  </span>
                </td>

                <td>
                  <span className={`refund-status ${getGatewayStatusClass(item.gateway_status)}`}>
                    {formatReason(item.gateway_status)}
                  </span>
                </td>

                <td>
                  {(() => {
                    const dateTime = formatDate(item.created_at);

                    return dateTime ? (
                      <div className="refund-date-time">
                        <span className="refund-date">{dateTime.date}</span>
                        <span className="refund-time">{dateTime.time}</span>
                      </div>
                    ) : "-";
                  })()}
                </td>

                <td>
                  {(() => {
                    const dateTime = formatDate(item.processed_at);

                    return dateTime ? (
                      <div className="refund-date-time">
                        <span className="refund-date">{dateTime.date}</span>
                        <span className="refund-time">{dateTime.time}</span>
                      </div>
                    ) : "-";
                  })()}
                </td>

                <td>
                  <div className="refund-actions">

                    <button
                      type="button"
                      className="refund-action-btn refund-menu-btn"
                      title="Actions"
                      onClick={() =>
                        setOpenActionId(
                          openActionId === item.id ? null : item.id
                        )
                      }
                    >
                      <FaEllipsisV size={14} />
                    </button>

                    {openActionId === item.id && (
                      <div className="refund-action-menu">

                        <button
                          type="button"
                          className="refund-menu-item"
                          onClick={() => handleView(item)}
                        >
                          <FaEye size={13} />
                          <span>View</span>
                        </button>

                        {item.admin_status === "pending" && (
                          <>
                            <button
                              type="button"
                              className="refund-menu-item refund-approve-item"
                              onClick={() => handleApprove(item)}
                            >
                              <FaCircleCheck size={13} />
                              <span>Approve</span>
                            </button>

                            <button
                              type="button"
                              className="refund-menu-item refund-reject-item"
                              onClick={() => handleReject(item)}
                            >
                              <FaCircleXmark size={13} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                      </div>
                    )}

                  </div>
                </td>

              </tr>

            ))}

          </tbody>
        </table>

        {/* PAGINATION */}

        <div className="refund-pagination-container">

          <div className="refund-pagination-info">
            Showing{" "}
            <strong>
              {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>
            {" "}to{" "}
            <strong>
              {Math.min(currentPage * pageSize, totalCount)}
            </strong>
            {" "}of{" "}
            <strong>{totalCount}</strong>
            {" "}refund requests
          </div>

          <div className="refund-pagination-buttons">

            <button
              className="refund-pagination-btn refund-pagination-arrow"
              disabled={currentPage === 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              ‹
            </button>

            {totalPages > 0 && (
              <button
                className={`refund-pagination-btn ${
                  currentPage === 1 ? "refund-pagination-active" : ""
                }`}
                disabled={loading}
                onClick={() => handlePageChange(1)}
              >
                1
              </button>
            )}

            {currentPage > 3 && (
              <span className="refund-pagination-dots">...</span>
            )}

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter(
                (page) =>
                  page !== 1 &&
                  page !== totalPages &&
                  page >= currentPage - 1 &&
                  page <= currentPage + 1
              )
              .map((page) => (
                <button
                  key={page}
                  className={`refund-pagination-btn ${
                    currentPage === page ? "refund-pagination-active" : ""
                  }`}
                  disabled={loading}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

            {currentPage < totalPages - 2 && (
              <span className="refund-pagination-dots">...</span>
            )}

            {totalPages > 1 && (
              <button
                className={`refund-pagination-btn ${
                  currentPage === totalPages ? "refund-pagination-active" : ""
                }`}
                disabled={loading}
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            )}

            <button
              className="refund-pagination-btn refund-pagination-arrow"
              disabled={currentPage === totalPages || totalPages === 0 || loading}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              ›
            </button>

          </div>
        </div>
      </div>

      {/* APPROVE MODAL */}

      {approveModal && (
        <div className="confirm-overlay">

          <div className="confirm-modal">

            <button
              className="closes-modal"
              disabled={isApproving}
              onClick={() => !isApproving && setApproveModal(null)}
            >
              <IoClose />
            </button>

            <div className="approval-icon-wrapper">
              <FaCheckCircle className="approval-icon" />
            </div>

            <h2 className="confirm-title">Approve Refund</h2>

            <p className="confirm-description">
              Are you sure you want to approve this refund request?
            </p>

            <div className="vendor-info-card">

              <div className="vendor-row">
                <span className="label">Customer Name</span>
                <span className="value approve-text">
                  {approveModal?.customer?.name || "N/A"}
                </span>
              </div>

              <div className="vendor-row">
                <span className="label">Customer Phone</span>
                <span className="value">
                  {approveModal?.customer?.phone || "N/A"}
                </span>
              </div>

              <div className="vendor-row">
                <span className="label">Refund Amount</span>
                <span className="value approve-text">
                  ₹{Number(approveModal?.amount || 0).toFixed(2)}
                </span>
              </div>

              <div className="vendor-row">
                <span className="label">Refund Method</span>
                <span className="value">
                  {formatReason(approveModal?.refund_method)}
                </span>
              </div>

              <div className="vendor-row">
                <span className="label">Reason</span>
                <span className="value">
                  {formatReason(approveModal?.reason)}
                </span>
              </div>

            </div>

            <div className="info-box">
              <span className="info-icon">ℹ</span>
              <span>
                This action will approve the refund request and initiate
                the refund to the customer's original payment method.
              </span>
            </div>

            <div className="confirm-buttons">

              <button
                className="cancels-btn"
                disabled={isApproving}
                onClick={() => setApproveModal(null)}
              >
                Cancel
              </button>

              <button
                className={`approve-btn ${isApproving ? "approve-btn-disabled" : ""}`}
                disabled={isApproving}
                onClick={handleApproveRefund}
              >
                {isApproving ? "Approving..." : "Approve"}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}

      {rejectModal && (
        <div
          className="confirm-overlay"
          onClick={() => {
            if (!isRejecting) {
              setRejectModal(null);
              setRejectReason("");
            }
          }}
        >

          <div
            className="reason-modal modern-reason-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="closes-modal"
              disabled={isRejecting}
              onClick={() => {
                if (!isRejecting) {
                  setRejectModal(null);
                  setRejectReason("");
                }
              }}
            >
              <IoClose />
            </button>

            <div className="reason-icon reject-bg">✕</div>

            <h2>Reject Refund</h2>

            <p className="reason-subtitle">
              Please provide a reason for rejecting this refund request.
            </p>

            <div className="vendor-info-card reject-card">

              <div className="vendor-row">
                <span className="label">Customer Name</span>
                <span className="value reject-text">
                  {rejectModal?.customer?.name || "N/A"}
                </span>
              </div>

              <div className="vendor-row">
                <span className="label">Customer Phone</span>
                <span className="value">
                  {rejectModal?.customer?.phone || "N/A"}
                </span>
              </div>

              <div className="vendor-row">
                <span className="label">Refund Amount</span>
                <span className="value">
                  ₹{Number(rejectModal?.amount || 0).toFixed(2)}
                </span>
              </div>

            </div>

            <div className="reason-field">
              <label>
                Reason <span>*</span>
              </label>

              <textarea
                className="reason-box reject-reason-box"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                disabled={isRejecting}
              />
            </div>

            <div className="info-box reject-info-box">
              <span className="infos-icon reject-infos-icon">✕</span>
              <span>
                The customer will be notified that the refund request has
                been rejected.
              </span>
            </div>

            <div className="confirm-buttons">

              <button
                className="cancels-btn"
                disabled={isRejecting}
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
              >
                Cancel
              </button>

              <button
                className={`approve-btn rejects-btn ${
                  isRejecting ? "approve-btn-disabled" : ""
                }`}
                disabled={isRejecting}
                onClick={handleRejectRefund}
              >
                {isRejecting ? "Rejecting..." : "Reject"}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* VIEW REFUND DETAILS DRAWER */}

      {viewModal && (
        <div
          className="refund-drawer-overlay"
          onClick={() => setViewModal(null)}
        >

          <div
            className="refund-right-drawer"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="refund-drawer-header">
              <div>
                <h2>Refund Details</h2>
                <p>Complete refund request information</p>
              </div>

              <button
                type="button"
                className="refund-drawer-close"
                onClick={() => setViewModal(null)}
              >
                <IoClose />
              </button>
            </div>

            <div className="refund-drawer-body">

              {/* AMOUNT */}

              <div className="refund-drawer-amount-card">
                <div className="refund-amount-icon">
                  <FaMoneyBillWave />
                </div>

                <div>
                  <span>Refund Amount</span>
                  <h2>
                    ₹{Number(viewModal.amount || 0).toFixed(2)}
                  </h2>
                  <small>{viewModal.currency || "INR"}</small>
                </div>
              </div>

              {/* STATUS */}

              <div className="refund-drawer-status-section">
                <div className="refund-drawer-section-title">
                  Status Information
                </div>

                <div className="refund-drawer-status-row">

                  <div>
                    <span>Admin Status</span>
                    <strong className={`refund-status ${getStatusClass(viewModal.admin_status)}`}>
                      {formatReason(viewModal.admin_status)}
                    </strong>
                  </div>

                  <div>
                    <span>Gateway Status</span>
                    <strong className={`refund-status ${getGatewayStatusClass(viewModal.gateway_status)}`}>
                      {formatReason(viewModal.gateway_status)}
                    </strong>
                  </div>

                </div>
              </div>

              {/* CUSTOMER */}

              <div className="refund-drawer-section">
                <h3>
                  <span className="refund-section-icon">
                    <FaEye />
                  </span>
                  Customer Information
                </h3>

                <div className="refund-detail-grid">

                  <div className="refund-detail-item">
                    <label>Customer Name</label>
                    <p>{viewModal.customer?.name || "-"}</p>
                  </div>

                  <div className="refund-detail-item">
                    <label>Phone Number</label>
                    <p>{viewModal.customer?.phone || "-"}</p>
                  </div>

                  <div className="refund-detail-item full-width">
                    <label>Customer ID</label>
                    <p className="refund-id-text">
                      {viewModal.customer?.id || viewModal.customer_id || "-"}
                    </p>
                  </div>

                </div>
              </div>

              {/* REFUND INFORMATION */}

              <div className="refund-drawer-section">
                <h3>
                  <span className="refund-section-icon">
                    <FaMoneyBillWave />
                  </span>
                  Refund Information
                </h3>

                <div className="refund-detail-grid">

                  <div className="refund-detail-item">
                    <label>Source Type</label>
                    <p>{formatReason(viewModal.source_type)}</p>
                  </div>

                  <div className="refund-detail-item">
                    <label>Refund Method</label>
                    <p>{formatReason(viewModal.refund_method)}</p>
                  </div>

                  <div className="refund-detail-item">
                    <label>Requested By</label>
                    <p>{formatReason(viewModal.requested_by)}</p>
                  </div>

                  <div className="refund-detail-item">
                    <label>Reason</label>
                    <p>{formatReason(viewModal.reason)}</p>
                  </div>

                  <div className="refund-detail-item full-width">
                    <label>Appointment ID</label>
                    <p className="refund-id-text">
                      {viewModal.appointment_id || "-"}
                    </p>
                  </div>

                </div>
              </div>

              {/* PAYMENT DETAILS */}

              <div className="refund-drawer-section">
                <h3>
                  <span className="refund-section-icon">
                    <FaMoneyBillWave />
                  </span>
                  Payment & Gateway Details
                </h3>

                <div className="refund-detail-grid">

                  <div className="refund-detail-item full-width">
                    <label>Gateway Payment ID</label>
                    <p className="refund-id-text">
                      {viewModal.gateway_payment_id || "-"}
                    </p>
                  </div>

                  <div className="refund-detail-item full-width">
                    <label>Gateway Refund ID</label>
                    <p className="refund-id-text">
                      {viewModal.gateway_refund_id || "-"}
                    </p>
                  </div>

                  <div className="refund-detail-item full-width">
                    <label>Refund Request ID</label>
                    <p className="refund-id-text">
                      {viewModal.id || "-"}
                    </p>
                  </div>

                </div>
              </div>

              {/* BANK DETAILS */}

              <div className="refund-drawer-section">
                <h3>
                  <span className="refund-section-icon">
                    <FaMoneyBillWave />
                  </span>
                  Bank Information
                </h3>

                {viewModal.bank_detail &&
                Object.keys(viewModal.bank_detail).length > 0 ? (

                  <div className="refund-detail-grid">

                    {Object.entries(viewModal.bank_detail).map(
                      ([key, value]) => (
                        <div className="refund-detail-item" key={key}>
                          <label>{formatReason(key)}</label>
                          <p>{String(value ?? "-")}</p>
                        </div>
                      )
                    )}

                  </div>

                ) : (
                  <div className="refund-no-bank">
                    <span>No bank details available</span>
                  </div>
                )}

              </div>

              {/* FAILED REASON */}

              {viewModal.failed_reason && (
                <div className="refund-failed-reason">
                  <strong>Failed Reason</strong>
                  <p>{viewModal.failed_reason}</p>
                </div>
              )}

              {/* TIMELINE */}

              <div className="refund-drawer-section">
                <h3>
                  <span className="refund-section-icon">
                    <FaClock />
                  </span>
                  Timeline Information
                </h3>

                <div className="refund-timeline">

                  {[
                    ["Requested At", viewModal.created_at],
                    ["Reviewed At", viewModal.reviewed_at],
                    ["Processed At", viewModal.processed_at],
                    ["Last Updated", viewModal.updated_at],
                  ].map(([label, date]) => {

                    const dateTime = formatDate(date);

                    return (
                      <div className="refund-timeline-item" key={label}>

                        <div className="refund-timeline-dot"></div>

                        <div className="refund-timeline-content">
                          <strong>{label}</strong>

                          {dateTime ? (
                            <p>
                              {dateTime.date} at {dateTime.time}
                            </p>
                          ) : (
                            <p className="refund-not-available">
                              Not Available
                            </p>
                          )}

                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>

            </div>

            {/* DRAWER FOOTER */}

            <div className="refund-drawer-footer">

              {viewModal.admin_status === "pending" && (
                <>
                  <button
                    type="button"
                    className="refund-drawer-reject-btn"
                    onClick={() => {
                      const item = viewModal;
                      setViewModal(null);
                      handleReject(item);
                    }}
                  >
                    <FaCircleXmark />
                    Reject
                  </button>

                  <button
                    type="button"
                    className="refund-drawer-approve-btn"
                    onClick={() => {
                      const item = viewModal;
                      setViewModal(null);
                      handleApprove(item);
                    }}
                  >
                    <FaCircleCheck />
                    Approve Refund
                  </button>
                </>
              )}

              <button
                type="button"
                className="refund-drawer-done-btn"
                onClick={() => setViewModal(null)}
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2000} />

    </>
  );
};

export default ConsultationRefundRequest;