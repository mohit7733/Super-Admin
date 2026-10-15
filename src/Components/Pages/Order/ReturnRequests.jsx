
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
import "./ReturnRequests.css";

const PAGE_SIZE = 5;

const ReturnRequests = () => {
  const navigate = useNavigate();

  // ==========================================
  // STATES
  // ==========================================

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

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedApproveReturn, setSelectedApproveReturn] =
    useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReturnId, setSelectedReturnId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  const getToken = () =>
    sessionStorage.getItem("superadmin_token");

  const getHeaders = () => ({
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
    "ngrok-skip-browser-warning": "true",
  });

  const handleSessionExpired = () => {
    sessionStorage.removeItem("superadmin_token");
    toast.error("Session expired. Please login again");
    navigate("/login");
  };

  // ==========================================
  // FETCH RETURN REQUESTS
  // GET /order/admin/returns/
  // ==========================================

  const fetchReturnRequests = async (requestedPage = page) => {
    const token = getToken();

    if (!token) {
      handleSessionExpired();
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
        handleSessionExpired();
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

      if (list.length === 0 && requestedPage > 1 && count > 0) {
        await fetchReturnRequests(requestedPage - 1);
        return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // ==========================================
  // FIELD HELPERS
  // ==========================================

  const getReturnId = (item) =>
    item?.return_id ??
    item?.return_request_id ??
    item?.id ??
    "";

  const getOrderId = (item) =>
    item?.order_code ??
    item?.order_display_code ??
    item?.order?.order_code ??
    item?.order_id ??
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
    item?.customer?.email ??
    item?.user?.email ??
    item?.email ??
    "—";

  const getCustomerPhone = (item) =>
    item?.customer?.phone_number ??
    item?.customer?.phone ??
    item?.user?.phone_number ??
    item?.phone_number ??
    "—";

  const getStatus = (item) =>
    String(item?.status ?? "pending").toLowerCase();

  const getReason = (item) =>
    item?.reason ??
    item?.return_reason ??
    item?.note ??
    item?.customer_note ??
    "";

  const getReturnItems = (item) =>
    Array.isArray(item?.items) ? item.items : [];

  const getProductImage = (item) =>
    item?.product_image ||
    item?.cover_image ||
    item?.variant_images?.[0] ||
    "";

  const getReturnAmount = (item) =>
    getReturnItems(item).reduce(
      (total, product) =>
        total + Number(product?.total_price || 0),
      0
    );

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

  const formatFullDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // SEARCH AND STATISTICS
  // ==========================================

  const filteredRequests = returnRequests.filter((item) => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return true;

    const searchableFields = [
      getReturnId(item),
      getOrderId(item),
      getCustomerName(item),
      getCustomerPhone(item),
      getCustomerEmail(item),
      getReason(item),
      item?.status,
      item?.id,
      ...getReturnItems(item).map(
        (product) => product?.product_name
      ),
    ];

    return searchableFields.some((value) =>
      String(value ?? "").toLowerCase().includes(search)
    );
  });

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

  // ==========================================
  // VIEW RETURN REQUEST
  // ==========================================

  const handleView = (item) => {
    setOpenActionId(null);
    setSelectedReturn(item);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
  };

  // ==========================================
  // OPEN APPROVE MODAL
  // ==========================================

  const openApproveModal = (item) => {
    const id = getReturnId(item);

    setOpenActionId(null);

    if (!id) {
      toast.error("Return request ID is missing");
      return;
    }

    setSelectedReturn(item);
    setSelectedApproveReturn(item);
    setShowViewModal(false);
    setShowApproveModal(true);
  };

  const closeApproveModal = () => {
    if (actionLoading) return;

    setShowApproveModal(false);
    setSelectedApproveReturn(null);
  };

  // ==========================================
  // APPROVE RETURN REQUEST
  //
  // Confirm the exact endpoint with your backend.
  // ==========================================

  const handleApproveReturn = async () => {
    const returnItem = selectedApproveReturn;
    const returnId = getReturnId(returnItem);

    if (!returnId) {
      toast.error("Return request ID is missing");
      return;
    }

    const token = getToken();

    if (!token) {
      handleSessionExpired();
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/order/admin/returns/${returnId}/approve/`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || "Failed to approve return request"
        );
      }

      toast.success(
        result?.message || "Return request approved successfully"
      );

      setShowApproveModal(false);
      setSelectedApproveReturn(null);
      setSelectedReturn(null);

      await fetchReturnRequests(page);
    } catch (err) {
      console.error("Approve Return Error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // OPEN REJECT MODAL
  // ==========================================

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
    setShowViewModal(false);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    if (actionLoading) return;

    setShowRejectModal(false);
    setSelectedReturnId(null);
    setRejectNote("");
  };

  

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
      handleSessionExpired();
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
        handleSessionExpired();
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
      setSelectedReturn(null);

      await fetchReturnRequests(page);
    } catch (err) {
      console.error("Reject Return Error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setActionLoading(false);
    }
  };


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
        <div
          className="stat2-card"
          style={{ borderTopColor: "#0D614E" }}
        >
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

        <div
          className="stat2-card"
          style={{ borderTopColor: "#0D614E" }}
        >
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

        <div
          className="stat2-card"
          style={{ borderTopColor: "#dc3545" }}
        >
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

        <div
          className="stat2-card"
          style={{ borderTopColor: "#d99b00" }}
        >
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

      {/* RETURN REQUESTS TABLE */}

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
                              openActionId === returnId
                                ? null
                                : returnId
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
                              <>
                                <button
                                  type="button"
                                  className="refund-menu-item"
                                  onClick={() => openApproveModal(item)}
                                >
                                  <FaCircleCheck size={13} />
                                  <span>Approve Return</span>
                                </button>

                                <button
                                  type="button"
                                  className="refund-menu-item refund-reject-item"
                                  onClick={() => openRejectModal(item)}
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
                  if (
                    index > 0 &&
                    number - pages[index - 1] > 1
                  ) {
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
              disabled={
                page >= totalPages ||
                totalPages === 0 ||
                loading
              }
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

      {showViewModal && selectedReturn && (
        <div
          className="return-view-overlay"
          onClick={closeViewModal}
        >
          <div
            className="return-view-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}

            <div className="return-view-header">
              <div className="return-view-header-info">
                <h2>{String(getReturnId(selectedReturn))}</h2>

                <p>
                  Requested on:{" "}
                  {formatFullDate(
                    selectedReturn?.created_at ??
                      selectedReturn?.requested_at
                  )}
                </p>

                <span
                  className={`refund-status ${getStatusClass(
                    getStatus(selectedReturn)
                  )}`}
                >
                  {formatLabel(getStatus(selectedReturn))}
                </span>
              </div>

              <button
                type="button"
                className="return-view-close"
                aria-label="Close return details"
                onClick={closeViewModal}
              >
                <IoClose />
              </button>
            </div>

            {/* DRAWER CONTENT */}

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
                      {String(getReturnId(selectedReturn))}
                    </span>
                  </div>

                  <div className="return-view-detail-row">
                    <span className="return-view-detail-label">
                      Order ID
                    </span>

                    <span className="return-view-detail-value">
                      {String(getOrderId(selectedReturn))}
                    </span>
                  </div>

                  <div className="return-view-detail-row">
                    <span className="return-view-detail-label">
                      Customer
                    </span>

                    <span className="return-view-detail-value">
                      {getCustomerName(selectedReturn)}
                    </span>
                  </div>

                  <div className="return-view-detail-row">
                    <span className="return-view-detail-label">
                      Phone Number
                    </span>

                    <span className="return-view-detail-value">
                      {getCustomerPhone(selectedReturn)}
                    </span>
                  </div>

                  <div className="return-view-detail-row">
                    <span className="return-view-detail-label">
                      Email
                    </span>

                    <span className="return-view-detail-value">
                      {getCustomerEmail(selectedReturn)}
                    </span>
                  </div>

                  <div className="return-view-detail-row">
                    <span className="return-view-detail-label">
                      Status
                    </span>

                    <span className="return-view-detail-value">
                      {formatLabel(getStatus(selectedReturn))}
                    </span>
                  </div>
                </div>
              </div>

              {/* RETURN REASON */}

              <div className="return-view-card">
                <h3 className="return-view-card-title">
                  Return Reason
                </h3>

                <div className="return-view-reason">
                  {getReason(selectedReturn) ||
                    "No return reason provided."}
                </div>
              </div>

              {/* RETURN PRODUCTS */}

              <div className="return-view-card">
                <h3 className="return-view-card-title">
                  Return Products
                </h3>

                {getReturnItems(selectedReturn).length > 0 ? (
                  <div className="return-approve-product-list">
                    {getReturnItems(selectedReturn).map(
                      (product, index) => (
                        <div
                          className="return-approve-product"
                          key={
                            product.id ||
                            product.order_item_id ||
                            index
                          }
                        >
                          <div className="return-approve-product-image">
                            {getProductImage(product) ? (
                              <img
                                src={getProductImage(product)}
                                alt={
                                  product.product_name ||
                                  "Return product"
                                }
                              />
                            ) : (
                              <FaMoneyBillWave />
                            )}
                          </div>

                          <div className="return-approve-product-details">
                            <h4>
                              {product.product_name ||
                                "Unnamed Product"}
                            </h4>

                            <p>
                              {product.variant_name || "—"}
                            </p>

                            <div className="return-approve-product-meta">
                              <span>
                                SKU: {product.sku_code || "—"}
                              </span>

                              <span>
                                Qty: {Number(product.quantity || 0)}
                              </span>
                            </div>

                            <div className="return-approve-product-price">
                              ₹
                              {Number(
                                product.total_price || 0
                              ).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    <div className="return-approve-total">
                      <span>Total Product Amount</span>

                      <strong>
                        ₹{getReturnAmount(selectedReturn).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p>No product details available.</p>
                )}
              </div>

              {/* RETURN EVIDENCE */}

              {Array.isArray(selectedReturn?.media) &&
                selectedReturn.media.length > 0 && (
                  <div className="return-view-card">
                    <h3 className="return-view-card-title">
                      Return Photos / Evidence
                    </h3>

                    <div className="return-approve-media-list">
                      {selectedReturn.media.map((media, index) => (
                        <a
                          key={media.id || index}
                          href={media.media_url}
                          target="_blank"
                          rel="noreferrer"
                          className="return-approve-media-item"
                        >
                          {media.media_type === "image" ? (
                            <img
                              src={media.media_url}
                              alt={`Return evidence ${index + 1}`}
                            />
                          ) : (
                            <span>
                              View attachment {index + 1}
                            </span>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

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
                      {formatFullDate(selectedReturn?.created_at)}
                    </span>
                  </div>

                  <div className="return-view-detail-row">
                    <span className="return-view-detail-label">
                      Updated Date
                    </span>

                    <span className="return-view-detail-value">
                      {formatFullDate(selectedReturn?.updated_at)}
                    </span>
                  </div>

                  <div className="return-view-detail-row">
                    <span className="return-view-detail-label">
                      Review Note
                    </span>

                    <span className="return-view-detail-value">
                      {selectedReturn?.review_note || "—"}
                    </span>
                  </div>

                  <div className="return-view-detail-row">
                    <span className="return-view-detail-label">
                      Reverse Pickup Code
                    </span>

                    <span className="return-view-detail-value">
                      {selectedReturn?.unicommerce_reverse_pickup_code ||
                        "—"}
                    </span>
                  </div>

                  <div className="return-view-detail-row">
                    <span className="return-view-detail-label">
                      Sync Status
                    </span>

                    <span className="return-view-detail-value">
                      {formatLabel(
                        selectedReturn?.unicommerce_sync_status
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* DRAWER FOOTER */}

            <div className="return-view-footer">
              <button
                type="button"
                className="return-view-cancel"
                onClick={closeViewModal}
              >
                Close
              </button>

              {getStatus(selectedReturn) === "pending" && (
                <>
                  <button
                    type="button"
                    className="return-view-primary"
                    onClick={() => openRejectModal(selectedReturn)}
                  >
                    <FaCircleXmark />
                    Reject Return
                  </button>

                  <button
                    type="button"
                    className="return-approve-confirm-btn"
                    onClick={() => openApproveModal(selectedReturn)}
                  >
                    <FaCircleCheck />
                    Approve Return
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          APPROVE RETURN REQUEST MODAL
      ========================================== */}

      {showApproveModal && selectedApproveReturn && (
        <div
          className="return-approve-overlay"
          onClick={closeApproveModal}
        >
          <div
            className="return-approve-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="return-approve-header">
              <button
                type="button"
                className="return-approve-close"
                disabled={actionLoading}
                aria-label="Close modal"
                onClick={closeApproveModal}
              >
                <IoClose />
              </button>

              <div className="return-approve-icon-wrapper">
                <FaCircleCheck className="return-approve-icon" />
              </div>

              <h2>Approve Return Request</h2>

              <p>
                Are you sure you want to approve this return request?
                Please review the products and customer details before
                proceeding.
              </p>
            </div>

            {/* MODAL CONTENT */}

            <div className="return-approve-content">
              {/* CUSTOMER DETAILS */}

              <div className="return-approve-info-card">
                <h3>Customer &amp; Order Details</h3>

                <div className="return-approve-info-row">
                  <span>Return ID</span>
                  <strong>
                    {String(getReturnId(selectedApproveReturn))}
                  </strong>
                </div>

                <div className="return-approve-info-row">
                  <span>Order ID</span>
                  <strong>
                    {String(getOrderId(selectedApproveReturn))}
                  </strong>
                </div>

                <div className="return-approve-info-row">
                  <span>Customer Name</span>
                  <strong>
                    {getCustomerName(selectedApproveReturn)}
                  </strong>
                </div>

                <div className="return-approve-info-row">
                  <span>Phone Number</span>
                  <strong>
                    {getCustomerPhone(selectedApproveReturn)}
                  </strong>
                </div>

                <div className="return-approve-info-row">
                  <span>Email</span>
                  <strong>
                    {getCustomerEmail(selectedApproveReturn)}
                  </strong>
                </div>

                <div className="return-approve-info-row">
                  <span>Return Reason</span>
                  <strong>
                    {formatLabel(getReason(selectedApproveReturn))}
                  </strong>
                </div>
              </div>

              {/* RETURN PRODUCTS */}

              <div className="return-approve-products-card">
                <div className="return-approve-section-heading">
                  <div>
                    <h3>Return Products</h3>
                    <p>
                      Products included in this return request
                    </p>
                  </div>

                  <span className="return-approve-item-count">
                    {getReturnItems(selectedApproveReturn).length}{" "}
                    {getReturnItems(selectedApproveReturn).length === 1
                      ? "Item"
                      : "Items"}
                  </span>
                </div>

                {getReturnItems(selectedApproveReturn).length > 0 ? (
                  <div className="return-approve-product-list">
                    {getReturnItems(selectedApproveReturn).map(
                      (product, index) => (
                        <div
                          className="return-approve-product"
                          key={
                            product.id ||
                            product.order_item_id ||
                            index
                          }
                        >
                          <div className="return-approve-product-image">
                            {getProductImage(product) ? (
                              <img
                                src={getProductImage(product)}
                                alt={
                                  product.product_name ||
                                  "Return product"
                                }
                              />
                            ) : (
                              <span>
                                <FaMoneyBillWave />
                              </span>
                            )}
                          </div>

                          <div className="return-approve-product-details">
                            <h4>
                              {product.product_name ||
                                "Unnamed Product"}
                            </h4>

                            <p>
                              {product.variant_name || "Default Variant"}
                            </p>

                            <div className="return-approve-product-meta">
                              <span>
                                SKU: {product.sku_code || "—"}
                              </span>

                              <span>
                                Qty: {Number(product.quantity || 0)}
                              </span>
                            </div>

                            <div className="return-approve-product-price">
                              ₹
                              {Number(
                                product.total_price || 0
                              ).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    <div className="return-approve-total">
                      <span>Total Product Amount</span>

                      <strong>
                        ₹
                        {getReturnAmount(
                          selectedApproveReturn
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="return-approve-no-products">
                    No product details available.
                  </div>
                )}
              </div>

              {/* RETURN PHOTOS */}

              {Array.isArray(selectedApproveReturn?.media) &&
                selectedApproveReturn.media.length > 0 && (
                  <div className="return-approve-info-card">
                    <h3>Return Photos / Evidence</h3>

                    <div className="return-approve-media-list">
                      {selectedApproveReturn.media.map(
                        (media, index) => (
                          <a
                            key={media.id || index}
                            href={media.media_url}
                            target="_blank"
                            rel="noreferrer"
                            className="return-approve-media-item"
                          >
                            {media.media_type === "image" ? (
                              <img
                                src={media.media_url}
                                alt={`Return evidence ${index + 1}`}
                              />
                            ) : (
                              <span>
                                View attachment {index + 1}
                              </span>
                            )}
                          </a>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* INFORMATION NOTICE */}

              <div className="return-approve-notice">
                <span className="return-approve-notice-icon">
                  ℹ
                </span>

                <p>
                  Approving this request confirms the return request.
                  Review the product details and customer evidence
                  before proceeding. Reverse pickup and refund
                  processing depend on the backend return workflow.
                </p>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="return-approve-footer">
              <button
                type="button"
                className="return-approve-cancel-btn"
                disabled={actionLoading}
                onClick={closeApproveModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="return-approve-confirm-btn"
                disabled={actionLoading}
                onClick={handleApproveReturn}
              >
                <FaCircleCheck />

                {actionLoading
                  ? "Approving..."
                  : "Approve Return"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          REJECT RETURN REQUEST MODAL
      ========================================== */}

      {showRejectModal && (
        <div
          className="return-request-confirm-overlay"
          onClick={closeRejectModal}
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
                onClick={closeRejectModal}
              >
                <IoClose />
              </button>

              <div className="return-request-reason-icon">
                <FaTimes />
              </div>

              <h2>Reject Return Request</h2>

              <p className="return-request-reason-subtitle">
                Please provide a reason for rejecting this return
                request.
              </p>
            </div>

            <div className="return-request-scroll-content">
              <div className="return-request-info-card">
                <div className="return-request-info-row">
                  <span className="return-request-label">
                    Return ID
                  </span>

                  <span className="return-request-value return-request-reject-text">
                    {String(selectedReturnId || "—")}
                  </span>
                </div>

                <div className="return-request-info-row">
                  <span className="return-request-label">
                    Order ID
                  </span>

                  <span className="return-request-value">
                    {String(getOrderId(selectedReturn || {}))}
                  </span>
                </div>

                <div className="return-request-info-row">
                  <span className="return-request-label">
                    Customer
                  </span>

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
                  The rejection reason will be submitted with the
                  return request response.
                </span>
              </div>
            </div>

            <div className="return-request-confirm-buttons">
              <button
                type="button"
                className="return-request-cancel-btn"
                disabled={actionLoading}
                onClick={closeRejectModal}
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
