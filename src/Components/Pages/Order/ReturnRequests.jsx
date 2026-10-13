
import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaTimes,
  FaEye,
  FaEllipsisV,
  FaClock,
  FaMoneyBillWave,
} from "react-icons/fa";
import {
  FaCircleCheck,
  FaCircleXmark,
} from "react-icons/fa6";
import { FiTrash2 } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

import BASE_URL from "../../../Base";
import "./ConsultationRefundRequest.css";
import "./ReturnRequests.css"

const PAGE_SIZE = 5;

const ReturnRequests = () => {
  const navigate = useNavigate();

  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openActionId, setOpenActionId] = useState(null);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  const getToken = () =>
    sessionStorage.getItem("superadmin_token");

  const getHeaders = () => ({
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
    "ngrok-skip-browser-warning": "true",
  });

  // --------------------------------------------------
  // FETCH RETURN REQUESTS
  // GET /order/admin/returns/
  // --------------------------------------------------

  const fetchReturnRequests = async (requestedPage = page) => {
    const token = getToken();

    if (!token) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.set("page", String(requestedPage));
      params.set("page_size", String(PAGE_SIZE));

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const response = await fetch(
        `${BASE_URL}/order/admin/returns/?${params.toString()}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || "Failed to fetch return requests"
        );
      }

      const payload = result?.data ?? result;

      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.results)
        ? payload.results
        : Array.isArray(payload?.data?.results)
        ? payload.data.results
        : Array.isArray(result?.results)
        ? result.results
        : [];

      const count = Number(
        payload?.count ??
          payload?.total_count ??
          result?.count ??
          list.length
      );

      setReturnRequests(list);
      setTotalCount(count);
      setPage(requestedPage);

      // If the current page becomes invalid after rejection,
      // navigate back to the previous page.
      if (list.length === 0 && requestedPage > 1 && count > 0) {
        fetchReturnRequests(requestedPage - 1);
      }
    } catch (err) {
      console.error("Fetch Return Requests Error:", err);

      setError(err.message || "Something went wrong");
      setReturnRequests([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnRequests(1);
    // Initial fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // --------------------------------------------------
  // FIELD HELPERS
  // --------------------------------------------------

  const getReturnId = (item) =>
    item?.return_id ??
    item?.return_request_id ??
    item?.id ??
    "";

  const getOrderId = (item) =>
    item?.order_display_code ??
    item?.order_code ??
    item?.order_id ??
    item?.order?.order_code ??
    item?.order?.id ??
    "—";

  const getCustomerName = (item) =>
    item?.customer_name ??
    item?.customer?.full_name ??
    item?.customer?.name ??
    item?.user?.full_name ??
    item?.user?.name ??
    "—";

    const getCustomerEmail = (item) =>
      item?.customer?.email??"_";

  const getCustomerPhone = (item) =>
   item?.customer?.phone_number??
    "—";

  const getStatus = (item) =>
    String(item?.status ?? "pending").toLowerCase();

  const getReason = (item) =>
    item?.reason ??
    item?.return_reason ??
    item?.note ??
    item?.customer_note ??
    "";

  const formatLabel = (value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (value) => {
    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return null;

    return {
      date: date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const getStatusClass = (status) => {
    switch (String(status ?? "").toLowerCase()) {
      case "approved":
      case "completed":
      case "processed":
        return "refund-status-approved";

      case "rejected":
      case "cancelled":
      case "failed":
        return "refund-status-rejected";

      case "pending":
      case "processing":
        return "refund-status-pending";

      default:
        return "refund-status-default";
    }
  };

  const formatDateTime = (value) => {
    const date = formatDate(value);

    return date ? (
      <div className="refund-date-time">
        <span className="refund-date">{date.date}</span>
        <span className="refund-time">{date.time}</span>
      </div>
    ) : (
      "—"
    );
  };

  

  const filteredRequests = returnRequests.filter((item) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return true;

    const searchableFields = [
      getReturnId(item),
      getOrderId(item),
      getCustomerName(item),
      getCustomerPhone(item),
      getReason(item),
      item?.status,
      item?.id,
      item?.order?.order_code,
    ];

    return searchableFields.some((value) =>
      String(value ?? "").toLowerCase().includes(search)
    );
  });

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const pendingCount = returnRequests.filter(
    (item) => getStatus(item) === "pending"
  ).length;

  const approvedCount = returnRequests.filter((item) =>
    ["approved", "completed"].includes(getStatus(item))
  ).length;

  const rejectedCount = returnRequests.filter((item) =>
    ["rejected", "cancelled"].includes(getStatus(item))
  ).length;

  const hasActiveFilters = Boolean(searchTerm || statusFilter);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setPage(1);
  };

  // --------------------------------------------------
  // VIEW RETURN REQUEST
  // --------------------------------------------------

  const handleView = (item) => {
    setOpenActionId(null);
    setSelectedReturn(item);
    setShowViewModal(true);
  };

  // --------------------------------------------------
  // OPEN REJECT MODAL
  // --------------------------------------------------

  const openRejectModal = (item) => {
    setOpenActionId(null);

    const id = getReturnId(item);

    if (!id) {
      toast.error("Return request ID is missing");
      return;
    }

    setSelectedReturn(item);
    setSelectedReturnId(id);
    setRejectNote("");
    setShowRejectModal(true);
  };

  // --------------------------------------------------
  // REJECT RETURN REQUEST
  // POST /order/admin/returns/{return_id}/reject/
  // --------------------------------------------------

  const handleRejectReturn = async () => {
    if (!selectedReturnId) {
      toast.error("Return request ID is missing");
      return;
    }

    if (!rejectNote.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }

    const token = getToken();

    if (!token) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/order/admin/returns/${selectedReturnId}/reject/`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({
            note: rejectNote.trim(),
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || "Failed to reject return request"
        );
      }

      toast.success(
        result?.message || "Return request rejected successfully"
      );

      setShowRejectModal(false);
      setSelectedReturnId(null);
      setRejectNote("");

      await fetchReturnRequests(page);
    } catch (err) {
      console.error("Reject Return Error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  const handlePageChange = (nextPage) => {
    if (
      nextPage < 1 ||
      nextPage > totalPages ||
      nextPage === page ||
      loading
    ) {
      return;
    }

    fetchReturnRequests(nextPage);
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <>
      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>Return Requests</h1>
          <p>View and manage customer return requests</p>
        </div>
      </div>

      {/* STATISTICS */}

      <div className="stats2-grid">
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaMoneyBillWave size={16} />
          </div>

          <div className="stat2-info">
            <h3>Total Requests</h3>
            <div className="stat2-value">{totalCount}</div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaCircleCheck size={16} />
          </div>

          <div className="stat2-info">
            <h3>Approved</h3>
            <div className="stat2-value">{approvedCount}</div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#dc3545" }}>
          <div
            className="stat2-icon"
            style={{
              background: "#dc354520",
              color: "#dc3545",
            }}
          >
            <FaCircleXmark size={16} />
          </div>

          <div className="stat2-info">
            <h3>Rejected</h3>
            <div className="stat2-value">{rejectedCount}</div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#d99b00" }}>
          <div
            className="stat2-icon"
            style={{
              background: "#d99b0020",
              color: "#d99b00",
            }}
          >
            <FaClock size={16} />
          </div>

          <div className="stat2-info">
            <h3>Pending</h3>
            <div className="stat2-value">{pendingCount}</div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}

      <div className="refund-filter-bar">
        <div className="refund-search-wrapper">
          <FaSearch className="refund-search-icon" />

          <input
            type="text"
            className="refund-search-input"
            placeholder="Search return ID, order ID, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {searchTerm && (
            <button
              type="button"
              className="refund-clear-search"
              title="Clear Search"
              onClick={() => setSearchTerm("")}
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className="refund-filter-right">
          <select
            className="refund-filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="refund-clear-filter-btn"
              title="Clear Filters"
              onClick={handleClearFilters}
            >
              <FiTrash2 />
            </button>
          )}

          <button
            type="button"
            className="refund-clear-filter-btn"
            title="Refresh"
            disabled={loading}
            onClick={() => fetchReturnRequests(page)}
          >
            <span style={{ fontSize: 18 }}>↻</span>
          </button>
        </div>
      </div>

      {/* TABLE */}

      <div className="refund-table-wrapper">
        <table className="refund-table">
          <thead className="refund-table-head">
            <tr>
              <th>Return ID</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Reason</th>
              <th>Requested At</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody className="refund-table-body">
            {loading && (
              <tr>
                <td colSpan="7" className="refund-loading">
                  Loading return requests...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan="7" className="refund-empty">
                  {error}
                  <button
                    type="button"
                    className="refund-menu-item"
                    onClick={() => fetchReturnRequests(page)}
                  >
                    Try Again
                  </button>
                </td>
              </tr>
            )}

            {!loading && !error && filteredRequests.length === 0 && (
              <tr>
                <td colSpan="7" className="refund-empty">
                  {searchTerm
                    ? `No return requests found for "${searchTerm}"`
                    : "No return requests found."}
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              filteredRequests.map((item, index) => {
                const returnId = getReturnId(item);
                const status = getStatus(item);

                return (
                  <tr key={returnId || index}>
                    <td>
                      <div className="refund-customer">
                        <div
                          className="refund-customer-name"
                          title={String(returnId)}
                        >
                          {String(returnId || "—")}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span title={String(getOrderId(item))}>
                        {String(getOrderId(item))}
                      </span>
                    </td>

                    <td>
                      <div className="refund-customer">
                        <div className="refund-customer-name">
                          {getCustomerName(item)}
                        </div>

                        <div className="refund-customer-phone">
                          {getCustomerPhone(item)}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className="refund-reason"
                        title={String(getReason(item))}
                      >
                        {formatLabel(getReason(item))}
                      </span>
                    </td>

                    <td>
                      {formatDateTime(
                        item?.created_at ??
                          item?.requested_at ??
                          item?.created
                      )}
                    </td>

                    <td>
                      <span
                        className={`refund-status ${getStatusClass(status)}`}
                      >
                        {formatLabel(status)}
                      </span>
                    </td>

                    <td>
                      <div className="refund-actions">
                        <button
                          type="button"
                          className="refund-action-btn refund-menu-btn"
                          title="Actions"
                          onClick={() =>
                            setOpenActionId(
                              openActionId === returnId ? null : returnId
                            )
                          }
                        >
                          <FaEllipsisV size={14} />
                        </button>

                        {openActionId === returnId && (
                          <div className="refund-action-menu">
                            <button
                              type="button"
                              className="refund-menu-item"
                              onClick={() => handleView(item)}
                            >
                              <FaEye size={13} />
                              <span>View</span>
                            </button>

                            {status === "pending" && (
                              <button
                                type="button"
                                className="refund-menu-item refund-reject-item"
                                onClick={() => openRejectModal(item)}
                              >
                                <FaCircleXmark size={13} />
                                <span>Reject</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {/* PAGINATION */}

        <div className="refund-pagination-container">
          <div className="refund-pagination-info">
            Showing{" "}
            <strong>
              {totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(page * PAGE_SIZE, totalCount)}
            </strong>{" "}
            of <strong>{totalCount}</strong> return requests
          </div>

          <div className="refund-pagination-buttons">
            <button
              type="button"
              className="refund-pagination-btn refund-pagination-arrow"
              disabled={page <= 1 || loading}
              onClick={() => handlePageChange(page - 1)}
            >
              ‹
            </button>

            {totalPages > 0 &&
              Array.from(
                { length: totalPages },
                (_, index) => index + 1
              )
                .filter(
                  (number) =>
                    number === 1 ||
                    number === totalPages ||
                    (number >= page - 1 && number <= page + 1)
                )
                .reduce((result, number, index, pages) => {
                  if (index > 0 && number - pages[index - 1] > 1) {
                    result.push("dots-" + number);
                  }

                  result.push(number);
                  return result;
                }, [])
                .map((number) =>
                  typeof number === "string" ? (
                    <span
                      key={number}
                      className="refund-pagination-dots"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      type="button"
                      key={number}
                      className={`refund-pagination-btn ${
                        page === number
                          ? "refund-pagination-active"
                          : ""
                      }`}
                      disabled={loading}
                      onClick={() => handlePageChange(number)}
                    >
                      {number}
                    </button>
                  )
                )}

            <button
              type="button"
              className="refund-pagination-btn refund-pagination-arrow"
              disabled={page >= totalPages || totalPages === 0 || loading}
              onClick={() => handlePageChange(page + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>

   
{/* ==========================================
    RETURN REQUEST VIEW DRAWER
========================================== */}

{showViewModal && (
  <div
    className="return-view-overlay"
    onClick={() => {
      setShowViewModal(false);
    }}
  >
    <div
      className="return-view-drawer"
      onClick={(e) => e.stopPropagation()}
    >
      {/* FIXED HEADER */}
      <div className="return-view-header">
        <div className="return-view-header-info">
          <h2>
            {String(
              selectedReturn?.id ||
              selectedReturn?.return_id ||
              selectedReturnId ||
              "Return Request"
            )}
          </h2>

          <p>
            Requested on:{" "}
            {selectedReturn?.created_at
              ? new Date(
                  selectedReturn.created_at
                ).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </p>

          <span className="return-view-status">
            {String(
              selectedReturn?.status || "Pending"
            ).replace(/_/g, " ")}
          </span>
        </div>

        <button
          type="button"
          className="return-view-close"
          aria-label="Close return details"
          onClick={() => setShowViewModal(false)}
        >
          <IoClose />
        </button>
      </div>

    
      <div className="return-view-content">

      
        <div className="return-view-card">
          <h3 className="return-view-card-title">
            Return Request Summary
          </h3>

          <p className="return-view-card-subtitle">
            Review the customer's return request details.
          </p>

          <div className="return-view-details">
            <div className="return-view-detail-row">
              <span className="return-view-detail-label">
                Return ID
              </span>

              <span className="return-view-detail-value">
                {String(
                  selectedReturn?.id ||
                  selectedReturn?.return_id ||
                  selectedReturnId ||
                  "—"
                )}
              </span>
            </div>

            <div className="return-view-detail-row">
              <span className="return-view-detail-label">
                Order ID
              </span>

              <span className="return-view-detail-value">
                {String(
                  getOrderId(selectedReturn || {}) || "—"
                )}
              </span>
            </div>

            <div className="return-view-detail-row">
              <span className="return-view-detail-label">
                Customer
              </span>

              <span className="return-view-detail-value">
                {getCustomerName(selectedReturn || {}) || "—"}
              </span>
            </div>
               <div className="return-view-detail-row">
              <span className="return-view-detail-label">
                Phone Number
              </span>

              <span className="return-view-detail-value">
                {getCustomerPhone(selectedReturn || {}) || "—"}
              </span>
            </div>
              <div className="return-view-detail-row">
              <span className="return-view-detail-label">
                Email
              </span>

              <span className="return-view-detail-value">
                {getCustomerEmail(selectedReturn || {}) || "—"}
              </span>
            </div>

            <div className="return-view-detail-row">
              <span className="return-view-detail-label">
                Status
              </span>

              <span className="return-view-detail-value">
                {String(
                  selectedReturn?.status || "Pending"
                ).replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

       
        <div className="return-view-card">
          <h3 className="return-view-card-title">
            Return Reason
          </h3>

          <div className="return-view-reason">
            {selectedReturn?.reason ||
              selectedReturn?.return_reason ||
              selectedReturn?.customer_reason ||
              "No return reason provided."}
          </div>
        </div>

        {/* ADDITIONAL DETAILS */}
        <div className="return-view-card">
          <h3 className="return-view-card-title">
            Additional Details
          </h3>

          <div className="return-view-details">
            <div className="return-view-detail-row">
              <span className="return-view-detail-label">
                Requested Date
              </span>

              <span className="return-view-detail-value">
                {selectedReturn?.created_at
                  ? new Date(
                      selectedReturn.created_at
                    ).toLocaleDateString("en-IN")
                  : "—"}
              </span>
            </div>

            <div className="return-view-detail-row">
              <span className="return-view-detail-label">
                Updated Date
              </span>

              <span className="return-view-detail-value">
                {selectedReturn?.updated_at
                  ? new Date(
                      selectedReturn.updated_at
                    ).toLocaleDateString("en-IN")
                  : "—"}
              </span>
            </div>

            <div className="return-view-detail-row">
              <span className="return-view-detail-label">
                Rejection Reason
              </span>

              <span className="return-view-detail-value">
                {selectedReturn?.rejection_reason ||
                  selectedReturn?.reject_reason ||
                  "—"}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* FIXED FOOTER */}
      <div className="return-view-footer">
        <button
          type="button"
          className="return-view-cancel"
          onClick={() => setShowViewModal(false)}
        >
          Close
        </button>

        {String(selectedReturn?.status || "").toLowerCase() ===
          "pending" && (
          <button
            type="button"
            className="return-view-primary"
            onClick={() => {
              setShowViewModal(false);
              setSelectedReturnId(
                selectedReturn?.id ||
                selectedReturn?.return_id
              );
              setRejectNote("");
              setShowRejectModal(true);
            }}
          >
            Reject Return
          </button>
        )}
      </div>
    </div>
  </div>
)}

 
{showRejectModal && (
  
  <div
    className="return-request-confirm-overlay"
    onClick={() => {
      if (!actionLoading) {
        setShowRejectModal(false);
        setSelectedReturnId(null);
        setRejectNote("");
      }
    }}
  >
    <div
      className="return-request-modal"
      onClick={(e) => e.stopPropagation()}
    >
      
      <div className="return-request-modal-header">
        <button
          type="button"
          className="return-request-modal-close"
          disabled={actionLoading}
          aria-label="Close modal"
          onClick={() => {
            if (actionLoading) return;
            setShowRejectModal(false);
            setSelectedReturnId(null);
            setRejectNote("");
          }}
        >
          <IoClose />
        </button>

        <div className="return-request-reason-icon">
          <FaTimes />
        </div>

        <h2>Reject Return Request</h2>

        <p className="return-request-reason-subtitle">
          Please provide a reason for rejecting this return request.
        </p>
      </div>

    
      <div className="return-request-scroll-content">
        <div className="return-request-info-card">
          <div className="return-request-info-row">
            <span className="return-request-label">Return ID</span>
            <span className="return-request-value return-request-reject-text">
              {String(selectedReturnId || "—")}
            </span>
          </div>

          <div className="return-request-info-row">
            <span className="return-request-label">Order ID</span>
            <span className="return-request-value">
              {String(getOrderId(selectedReturn || {}))}
            </span>
          </div>

          <div className="return-request-info-row">
            <span className="return-request-label">Customer</span>
            <span className="return-request-value">
              {getCustomerName(selectedReturn || {})}
            </span>
          </div>
        </div>

        <div className="return-request-reason-field">
          <label>
            Rejection Reason <span>*</span>
          </label>

          <textarea
            className="return-request-reason-box"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Enter reason for rejecting this return..."
            rows={5}
            maxLength={1000}
            disabled={actionLoading}
          />

          <small>{rejectNote.length}/1000 characters</small>
        </div>

        <div className="return-request-info-box">
          <span className="return-request-info-icon">
            <FaTimes />
          </span>

          <span>
            The rejection reason will be submitted with the return
            request response.
          </span>
        </div>
      </div>

      {/* FIXED FOOTER */}
      <div className="return-request-confirm-buttons">
        <button
          type="button"
          className="return-request-cancel-btn"
          disabled={actionLoading}
          onClick={() => {
            if (actionLoading) return;
            setShowRejectModal(false);
            setSelectedReturnId(null);
            setRejectNote("");
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          className="return-request-reject-btn"
          disabled={actionLoading || !rejectNote.trim()}
          onClick={handleRejectReturn}
        >
          {actionLoading ? "Rejecting..." : "Reject Return"}
        </button>
      </div>
    </div>
  </div>
)}



      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export default ReturnRequests;

