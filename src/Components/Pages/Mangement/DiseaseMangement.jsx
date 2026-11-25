
import React, { useEffect, useState } from "react";
import {
  FaTimesCircle,
  FaClock,
  FaClipboardList,
  FaCheckCircle,
  FaFilePrescription,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { BsSearch } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";

const DiseaseMangement = () => {
  const navigate = useNavigate();

  // ----------------------------------------
  // STATES
  // ----------------------------------------

  const [ApprovalRequestData, setApprovalRequestData] = useState([]);
  const [ApprovalRequestLoading, setApprovalRequestLoading] = useState(false);
  const [ApprovalRequestError, setApprovalRequestError] = useState(null);

  // Search and filters
  const [approvalSearch, setApprovalSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Frontend pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Rejection modal
  const [RejectionVendorModal, setRejectionModal] = useState(false);
  const [SelectedApprovalRequest, setSelectedApprovalRequest] = useState(null);
  const [Reason, setReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // ----------------------------------------
  // FETCH APPROVAL REQUESTS
  // ----------------------------------------

  const getMedicineApprovalList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setApprovalRequestLoading(true);
    setApprovalRequestError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/customers/admin/prescription-requests/`,
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

      const data = await response.json();

      if (data.success) {
        const requests = Array.isArray(data.data)
          ? data.data
          : data.data?.results || [];

        setApprovalRequestData(requests);
      } else {
        setApprovalRequestError(
          data.message || "Failed to fetch medicine approval requests"
        );
        toast.error(
          data.message || "Failed to fetch medicine approval requests"
        );
      }
    } catch (error) {
      console.error("Medicine Approval Fetch Error:", error);
      setApprovalRequestError("Unable to fetch prescription requests.");
      toast.error("Failed to fetch medicine approval data");
    } finally {
      setApprovalRequestLoading(false);
    }
  };

  useEffect(() => {
    getMedicineApprovalList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------
  // SEARCH AND STATUS FILTER
  // ----------------------------------------

  const filteredRequests = ApprovalRequestData.filter((item) => {
    const medicines = item.requested_variants || [];

    const medicineText = medicines
      .map((requestedItem) => {
        const medicine = requestedItem?.variant;

        return [
          medicine?.brand_name,
          medicine?.variant_title,
          medicine?.title,
          medicine?.name,
          medicine?.size,
        ]
          .filter(Boolean)
          .join(" ");
      })
      .join(" ");

    const searchText = [
      item.patient_name,
      item.patient_id,
      item.status,
      item.id,
      medicineText,
    ]
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchText.includes(
      approvalSearch.trim().toLowerCase()
    );

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ----------------------------------------
  // FRONTEND PAGINATION
  // ----------------------------------------

  const totalFilteredRequests = filteredRequests.length;

  const totalPages = Math.ceil(
    totalFilteredRequests / itemsPerPage
  );

  const safeCurrentPage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;

  const visibleRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSearchChange = (value) => {
    setApprovalSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) =>
      Math.min(prev + 1, totalPages)
    );
  };

  // ----------------------------------------
  // TABLE HELPERS
  // ----------------------------------------

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending_review":
        return "Pending Review";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "cancelled":
        return "Cancelled";
      default:
        return status
          ? status.replaceAll("_", " ")
          : "-";
    }
  };

  const getVariantTitle = (variant) =>
    variant?.title ||
    variant?.variant_title ||
    variant?.name ||
    "";

  // ----------------------------------------
  // STATISTICS
  // ----------------------------------------

  const totalRequests = ApprovalRequestData.length;

  const pendingRequests = ApprovalRequestData.filter(
    (item) => item.status === "pending_review"
  ).length;

  const approvedRequests = ApprovalRequestData.filter(
    (item) => item.status === "approved"
  ).length;

  const rejectedRequests = ApprovalRequestData.filter(
    (item) =>
      item.status === "cancelled" ||
      item.status === "rejected"
  ).length;

  // ----------------------------------------
  // OPEN APPROVAL PAGE
  // ----------------------------------------

  const handleOpenApprovePage = (item) => {
    navigate(`/ApprovePrescription/${item.id}`);
  };

  // ----------------------------------------
  // REJECTION MODAL
  // ----------------------------------------

  const openRejectionModal = (item) => {
    setSelectedApprovalRequest(item);
    setReason("");
    setRejectionModal(true);
  };

  const closeRejectionModal = () => {
    if (isRejecting) return;

    setRejectionModal(false);
    setReason("");
    setSelectedApprovalRequest(null);
  };

  // ----------------------------------------
  // REJECT PRESCRIPTION API
  // ----------------------------------------

  const submitRejection = async () => {
    if (!SelectedApprovalRequest) return;

    if (!Reason.trim()) {
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
        `${BASE_URL}/customers/admin/prescription-requests/?id=${SelectedApprovalRequest.id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            status: "rejected",
            rejection_reason: Reason.trim(),
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

      if (data.success) {
        toast.success(
          data.message || "Prescription rejected successfully"
        );

        closeRejectionModal();
        getMedicineApprovalList();
      } else {
        toast.error(
          data.message || "Failed to reject prescription"
        );
      }
    } catch (error) {
      console.error("Reject Prescription Error:", error);
      toast.error(
        "Something went wrong while rejecting prescription"
      );
    } finally {
      setIsRejecting(false);
    }
  };

  // ----------------------------------------
  // PAGINATION BUTTONS
  // ----------------------------------------

  const getPaginationNumbers = () => {
    const pages = [];

    for (let page = 1; page <= totalPages; page++) {
      if (
        page === 1 ||
        page === totalPages ||
        Math.abs(page - safeCurrentPage) <= 1
      ) {
        pages.push(page);
      }
    }

    return pages;
  };

  const paginationNumbers = getPaginationNumbers();

  // ----------------------------------------
  // UI
  // ----------------------------------------

  return (
    <>
      {/* PAGE HEADER */}

      <div className="page-header">
        <h1>Medicine Approval</h1>
        <p className="page-paragraph">
          Review and approve medicines submitted for users
        </p>
      </div>

      {/* STATISTICS */}

      <div className="vendors-stats stats2-grid">
        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaClipboardList size={16} />
          </div>

          <div className="stat2-info">
            <h3>Total Requests</h3>
            <div className="stat2-value">{totalRequests}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaClock size={12} />
          </div>

          <div className="stat2-info">
            <h3>Pending Requests</h3>
            <div className="stat2-value">{pendingRequests}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaCheckCircle size={12} />
          </div>

          <div className="stat2-info">
            <h3>Approved Requests</h3>
            <div className="stat2-value">{approvedRequests}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaTimesCircle size={12} />
          </div>

          <div className="stat2-info">
            <h3>Rejected Requests</h3>
            <div className="stat2-value">{rejectedRequests}</div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER */}
<div className="filter-category">
  <div className="filter-controls">
    {/* SEARCH */}
    <div className="search-wrapper">
      <BsSearch className="search-icon" />

      <input
        type="text"
        placeholder="Search by patient, ID, medicine or brand..."
        value={approvalSearch}
        onChange={(e) => {
          setApprovalSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="search-input"
      />

      {approvalSearch && (
        <button
          type="button"
          className="clear-search"
          onClick={() => {
            setApprovalSearch("");
            setCurrentPage(1);
          }}
        >
          <IoClose />
        </button>
      )}
    </div>

    {/* STATUS FILTER */}
    <select
      className="status-filter-select"
      value={statusFilter}
      onChange={(e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
      }}
    >
      <option value="all">All Status</option>
      <option value="pending_review">Pending Review</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
      <option value="cancelled">Cancelled</option>
    </select>

    {/* CLEAR FILTERS */}
    {(approvalSearch || statusFilter !== "all") && (
      <button
        type="button"
        className="clear-filters-btn"
        title="Clear Filters"
        onClick={() => {
          setApprovalSearch("");
          setStatusFilter("all");
          setCurrentPage(1);
        }}
      >
        <IoClose />
      </button>
    )}
  </div>
</div>
      {/* TABLE */}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Prescription</th>
              <th>Medicine</th>
              <th>Price</th>
              <th>Requested Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {ApprovalRequestLoading ? (
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <tr key={index}>
                    <td colSpan="8">
                      <div className="skeleton-row" />
                    </td>
                  </tr>
                ))
            ) : ApprovalRequestError ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    color: "red",
                    textAlign: "center",
                  }}
                >
                  {ApprovalRequestError}
                </td>
              </tr>
            ) : visibleRequests.length > 0 ? (
              visibleRequests.map((item, index) => {
                const medicines = item.requested_variants || [];

                const totalPrice = medicines.reduce(
                  (total, requestedItem) => {
                    const price = Number(
                      requestedItem?.variant?.selling_price || 0
                    );

                    const quantity = Number(
                      requestedItem?.quantity || 1
                    );

                    return total + price * quantity;
                  },
                  0
                );

                return (
                  <tr key={item.id}>
                    {/* SERIAL NUMBER */}

                    <td>{startIndex + index + 1}</td>

                    {/* PATIENT */}

                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        <strong>
                          {item.patient_name || "-"}
                        </strong>

                        <span
                          style={{
                            fontSize: 11,
                            color: "#777",
                          }}
                        >
                          Patient ID: {item.patient_id || "-"}
                        </span>
                      </div>
                    </td>

                    {/* PRESCRIPTION */}

                    <td>
                      {item.file_url ? (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#0D614E",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          <FaFilePrescription />
                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* MEDICINES */}

                  <td>
  {(
    item.approved_cart_items?.length
      ? item.approved_cart_items
      : item.requested_variants || []
  )
    .map((medicine) => medicine.variant?.variant_title)
    .filter(Boolean)
    .join(", ") || "N/A"}
</td>
                    {/* PRICE */}

                    <td>₹{totalPrice.toFixed(2)}</td>

                    {/* DATE */}

                    <td>
                      <div className="created-cell">
                        <span>
                          {formatDate(item.created_at)}
                        </span>

                        <small>
                          {formatDateTime(item.created_at)
                            .split(",")[1]
                            ?.trim() || "-"}
                        </small>
                      </div>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`status-badge ${
                          item.status === "approved"
                            ? "status-active"
                            : item.status === "pending_review"
                            ? "status-pending"
                            : "status-inactive"
                        }`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="medicine-action-group">
                        {item.status === "pending_review" && (
                          <>
                            <button
                              type="button"
                              className="medicine-action-btn medicine-approve-btn"
                              title="Approve Request"
                              onClick={() =>
                                handleOpenApprovePage(item)
                              }
                            >
                              <FaCheckCircle />
                            </button>

                            <button
                              type="button"
                              className="medicine-action-btn medicine-reject-btn"
                              title="Reject Request"
                              onClick={() =>
                                openRejectionModal(item)
                              }
                            >
                              <FaTimesCircle />
                            </button>
                          </>
                        )}

                        {item.status === "approved" && (
                          <span className="medicine-action-status medicine-approved-text">
                            <FaCheckCircle /> Approved
                          </span>
                        )}

                        {item.status === "rejected" && (
                          <span className="medicine-action-status medicine-rejected-text">
                            <FaTimesCircle /> Rejected
                          </span>
                        )}

                        {item.status === "cancelled" && (
                          <span className="medicine-action-status">
                            Cancelled
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="8"
                  style={{ textAlign: "center", padding: "25px" }}
                >
                  No Medicine Approval Requests Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

      {!ApprovalRequestLoading &&
        !ApprovalRequestError &&
        totalFilteredRequests > 0 && (
          <div
            className="medicine-pagination"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "15px",
              padding: "16px 5px",
              marginTop: "10px",
            }}
          >
            {/* RECORD INFORMATION */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  color: "#666",
                }}
              >
                Showing <strong>{startIndex + 1}</strong> to{" "}
                <strong>
                  {Math.min(
                    startIndex + itemsPerPage,
                    totalFilteredRequests
                  )}
                </strong>{" "}
                of <strong>{totalFilteredRequests}</strong> requests
              </span>

              <select
                value={itemsPerPage}
                onChange={(e) =>
                  handlePageSizeChange(e.target.value)
                }
                style={{
                  padding: "7px 10px",
                  border: "1px solid #dce5e1",
                  borderRadius: "6px",
                  outline: "none",
                  color: "#333",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <option value={5}>5 / Page</option>
                <option value={10}>10 / Page</option>
                <option value={20}>20 / Page</option>
                <option value={50}>50 / Page</option>
              </select>
            </div>

            {/* PAGE BUTTONS */}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                disabled={safeCurrentPage === 1}
                onClick={handlePreviousPage}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #dce5e1",
                  borderRadius: "6px",
                  background:
                    safeCurrentPage === 1 ? "#f5f5f5" : "#fff",
                  color:
                    safeCurrentPage === 1 ? "#aaa" : "#0D614E",
                  cursor:
                    safeCurrentPage === 1
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Previous
              </button>

              {paginationNumbers.map((page, index) => {
                const previousPage =
                  paginationNumbers[index - 1];

                return (
                  <React.Fragment key={page}>
                    {index > 0 &&
                      previousPage !== page - 1 && (
                        <span
                          style={{
                            padding: "0 3px",
                            color: "#777",
                          }}
                        >
                          ...
                        </span>
                      )}

                    <button
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      style={{
                        minWidth: "34px",
                        height: "34px",
                        border: "1px solid #dce5e1",
                        borderRadius: "6px",
                        background:
                          safeCurrentPage === page
                            ? "#0D614E"
                            : "#fff",
                        color:
                          safeCurrentPage === page
                            ? "#fff"
                            : "#333",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

              <button
                type="button"
                disabled={safeCurrentPage === totalPages}
                onClick={handleNextPage}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #dce5e1",
                  borderRadius: "6px",
                  background:
                    safeCurrentPage === totalPages
                      ? "#f5f5f5"
                      : "#fff",
                  color:
                    safeCurrentPage === totalPages
                      ? "#aaa"
                      : "#0D614E",
                  cursor:
                    safeCurrentPage === totalPages
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

      {/* REJECTION MODAL */}

      {RejectionVendorModal && SelectedApprovalRequest && (
        <div className="confirm-overlay">
          <div className="reason-modal modern-reason-modal medicine-reject-modal">
            <button
              type="button"
              className="closes-modal"
              onClick={closeRejectionModal}
              disabled={isRejecting}
            >
              <IoClose />
            </button>

            <div className="reason-icon reject-bg">✕</div>

            <h2>Reject Prescription</h2>

            <p className="reason-subtitle">
              Please provide a reason for rejecting this prescription request.
            </p>

            <div className="vendor-info-card reject-card">
              <div className="vendor-row">
                <span className="label">Patient Name</span>

                <span className="value reject-text">
                  {SelectedApprovalRequest.patient_name || "N/A"}
                </span>
              </div>
            </div>

            <div className="reject-medicines-section">
              <div className="reject-medicines-header">
                <div>
                  <h3>Requested Medicines</h3>
                  <p>
                    Medicines included in this prescription request.
                  </p>
                </div>

                <span className="reject-medicine-count">
                  {SelectedApprovalRequest.requested_variants?.length || 0}{" "}
                  Medicines
                </span>
              </div>

              <div className="reject-medicines-list">
                {(
                  SelectedApprovalRequest.requested_variants || []
                ).map((requestedItem, index) => {
                  const medicine = requestedItem?.variant;

                  return (
                    <div
                      key={
                        medicine?.id ||
                        requestedItem?.id ||
                        index
                      }
                      className="reject-medicine-item"
                    >
                      <div className="reject-medicine-info">
                        <div className="reject-medicine-name">
                          {getVariantTitle(medicine) || "Medicine"}
                        </div>

                        <div className="reject-medicine-meta">
                          <span>
                            {medicine?.brand_name || "No Brand"}
                          </span>

                          <span>
                            Size: {medicine?.size || "N/A"}
                          </span>

                          <span>
                            ₹
                            {Number(
                              medicine?.selling_price ?? 0
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* REJECTION REASON */}

            <div className="reason-field">
              <label>
                Rejection Reason <span>*</span>
              </label>

              <textarea
                className="reason-box reject-reason-box"
                value={Reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows="4"
              />
            </div>

            <div className="info-box reject-info-box">
              <span className="infos-icon reject-infos-icon">
                ✕
              </span>

              <span>
                The customer will be notified about the rejection reason.
              </span>
            </div>

            {/* MODAL BUTTONS */}

            <div className="confirm-buttons">
              <button
                type="button"
                className="cancels-btn"
                onClick={closeRejectionModal}
                disabled={isRejecting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="approve-btn rejects-btn"
                onClick={submitRejection}
                disabled={isRejecting || !Reason.trim()}
              >
                {isRejecting
                  ? "Rejecting..."
                  : "Reject Prescription"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={1000}
      />
    </>
  );
};

export default DiseaseMangement;
