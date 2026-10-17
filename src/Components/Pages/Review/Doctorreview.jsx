
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaTimes,
  FaSearch,
  FaTrash,
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaSyncAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";

import BASE_URL from "../../../Base";
import DoctorReviewModal from "./DoctorReviewModal";

const PAGE_SIZE = 10;

const Doctorreview = () => {
  const [DoctorReviewData, setDoctorReviewData] = useState([]);
  const [LoadingDoctorReview, setLoadingDoctorReview] = useState(false);
  const [ErrorDoctorReview, setErrorDoctorReview] = useState(null);

  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showActiveConfirmModal, setShowActiveConfirmModal] =
    useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [reason, setReason] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  // Normalize API status
  const getStatus = (review) => {
    const status = String(review?.status || "")
      .toLowerCase()
      .trim();

    if (["active", "approved"].includes(status)) {
      return "active";
    }

    if (["unverified", "pending"].includes(status)) {
      return "unverified";
    }

    return "inactive";
  };

  // Render rating stars
  const renderStars = (rating) => {
    const numericRating = Number(rating) || 0;

    return Array.from({ length: 5 }, (_, index) => {
      const starNumber = index + 1;

      if (numericRating >= starNumber) {
        return <FaStar key={index} className="star-filled" />;
      }

      if (numericRating >= starNumber - 0.5) {
        return (
          <FaStarHalfAlt key={index} className="star-filled" />
        );
      }

      return <FaRegStar key={index} className="star-empty" />;
    });
  };

  // Fetch all available API pages
  const getDoctorReviewList = useCallback(async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoadingDoctorReview(true);
    setErrorDoctorReview(null);

    try {
      let page = 1;
      let totalCount = null;
      let totalPagesFromApi = null;

      const allReviews = [];
      const fetchedIds = new Set();

      while (true) {
        const apiUrl =
          `${BASE_URL}/review/admin/?entity_type=doctor&page=${page}`;

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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

        if (!response.ok) {
          throw new Error(
            `Unable to fetch doctor reviews. Status: ${response.status}`
          );
        }

        const data = await response.json();

        if (data?.success === false) {
          throw new Error(
            data.message || "Failed to fetch doctor reviews."
          );
        }

        const reviews = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data?.results)
          ? data.data.results
          : [];

        if (totalCount === null && data.count !== undefined) {
          totalCount = Number(data.count);

          if (Number.isFinite(totalCount)) {
            totalPagesFromApi = Math.ceil(
              totalCount / PAGE_SIZE
            );
          }
        }

        reviews.forEach((review) => {
          if (review?.id && !fetchedIds.has(review.id)) {
            fetchedIds.add(review.id);
            allReviews.push(review);
          }
        });

        // Stop when all API pages have been fetched
        if (totalPagesFromApi !== null) {
          if (page >= totalPagesFromApi) break;
        } else {
          if (reviews.length < PAGE_SIZE) break;
        }

        if (reviews.length === 0) break;

        page += 1;
      }

      setDoctorReviewData(allReviews);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching doctor reviews:", error);

      setErrorDoctorReview(
        error.message ||
          "Something went wrong while fetching reviews."
      );

      toast.error(
        error.message || "Failed to fetch review data"
      );
    } finally {
      setLoadingDoctorReview(false);
    }
  }, [navigate]);

  useEffect(() => {
    getDoctorReviewList();
  }, [getDoctorReviewList]);

  // Statistics intentionally kept at zero for now
  const stats = {
    total: 0,
    active: 0,
    inactive: 0,
  };

  // Search and filter the COMPLETE fetched dataset
  const filteredReviews = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return DoctorReviewData.filter((item) => {
      const searchableText = [
        item.id,
        item.patient_name,
        item.doctor_name,
        item.doctor_id,
        item.appointment_id,
        item.review,
        item.rating,
        item.status,
        item.action_reason,
        item.action_by_name,
        item.doctor_reply,
        item.created_at,
      ]
        .map((value) => value ?? "")
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search || searchableText.includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        getStatus(item) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [DoctorReviewData, searchTerm, statusFilter]);

  // Reset to first page whenever search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination is applied AFTER search and filtering
  const totalPages = Math.ceil(
    filteredReviews.length / PAGE_SIZE
  );

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return filteredReviews.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [filteredReviews, currentPage]);

  // Keep the current page valid when the dataset changes
  useEffect(() => {
    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    } else if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // View review
  const handleViewReview = (review) => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setSelectedReview(null);
    setShowReviewModal(false);
  };

  // Handle status selection
  const handleStatusChange = (review, status) => {
    if (!review?.id) {
      toast.error("Review ID is missing.");
      return;
    }

    if (status === getStatus(review)) return;

    setSelectedItem(review);

    if (status === "inactive") {
      setReason("");
      setShowRejectModal(true);
    } else if (status === "active") {
      setShowActiveConfirmModal(true);
    }
  };

  // Update review status
  const confirmStatusChange = async (
    status,
    rejectionReason = ""
  ) => {
    if (!selectedItem?.id) {
      toast.error("Please select a doctor review.");
      return;
    }

    const action = status === "active" ? "active" : "inactive";

    if (action === "inactive" && !rejectionReason.trim()) {
      toast.error("Reason is required.");
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setUpdatingId(selectedItem.id);

    try {
      const response = await fetch(
        `${BASE_URL}/review/admin/?entity_type=doctor&id=${selectedItem.id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            action,
            ...(action === "inactive" && {
              reason: rejectionReason.trim(),
            }),
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

      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.errors?.action?.[0] ||
            data?.errors?.reason?.[0] ||
            data?.message ||
            "Failed to update review status."
        );
      }

      toast.success(
        action === "active"
          ? "Doctor review activated successfully."
          : "Doctor review marked inactive successfully."
      );

      setShowActiveConfirmModal(false);
      setShowRejectModal(false);
      setReason("");
      setSelectedItem(null);

      // Refresh the complete dataset after updating status
      await getDoctorReviewList();
    } catch (error) {
      console.error("Error updating review status:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Submit inactive reason
  const submitRejection = (event) => {
    event.preventDefault();

    if (!reason.trim()) {
      toast.error("Reason is required.");
      return;
    }

    confirmStatusChange("inactive", reason.trim());
  };

  const closeRejectModal = () => {
    if (updatingId !== null) return;

    setShowRejectModal(false);
    setSelectedItem(null);
    setReason("");
  };

  const closeActiveConfirmModal = () => {
    if (updatingId !== null) return;

    setShowActiveConfirmModal(false);
    setSelectedItem(null);
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Doctor Review Management</h1>
        <p className="page-paragraph">
          Manage doctor reviews and their details.
        </p>
      </div>

      {/* Statistics */}
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
            <FaUsers />
          </div>

          <div className="stat2-info">
            <h3>Total Reviews</h3>
            <div className="stat2-value">{stats.total}</div>
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
            <FaChartLine />
          </div>

          <div className="stat2-info">
            <h3>Active Reviews</h3>
            <div className="stat2-value">{stats.active}</div>
          </div>
        </div>

        <div
          className="stat2-card"
          style={{ borderTopColor: "#dc2626" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#dc262620",
              color: "#dc2626",
            }}
          >
            <FaCalendarAlt />
          </div>

          <div className="stat2-info">
            <h3>Inactive Reviews</h3>
            <div className="stat2-value">{stats.inactive}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />

            <input
              type="text"
              className="search-input"
              placeholder="Search patient, doctor, review, rating..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="status-filter-select"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
          >
            <option value="all">All Status</option>
          
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {(searchTerm || statusFilter !== "all") && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={clearFilters}
              title="Clear filters"
            >
              <FaTrash />
            </button>
          )}

          <button
            type="button"
            className="clear-filters-btn"
            onClick={getDoctorReviewList}
            disabled={LoadingDoctorReview}
            title="Refresh all reviews"
          >
            <FaSyncAlt />
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Doctor</th>
              <th>Review</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {LoadingDoctorReview ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: 30,
                  }}
                >
                  Loading all doctor reviews...
                </td>
              </tr>
            ) : ErrorDoctorReview ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    color: "red",
                    textAlign: "center",
                    padding: 24,
                  }}
                >
                  {ErrorDoctorReview}
                  <br />
                  <button
                    type="button"
                    onClick={getDoctorReviewList}
                    style={{ marginTop: 12 }}
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ) : paginatedReviews.length > 0 ? (
              paginatedReviews.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </td>

                  <td>{item.patient_name || "N/A"}</td>

                  <td>{item.doctor_name || "N/A"}</td>

                  <td>
                    <span title={item.review || ""}>
                      {item.review
                        ? item.review.length > 60
                          ? `${item.review.substring(0, 60)}...`
                          : item.review
                        : "N/A"}
                    </span>
                  </td>

                  <td>
                    <div className="rating-stars">
                      {renderStars(Number(item.rating))}
                      <span className="rating-number">
                        {Number(item.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </td>

                  <td>
                    <select
                      disabled={updatingId === item.id}
                      value={getStatus(item)}
                      onChange={(event) =>
                        handleStatusChange(
                          item,
                          event.target.value
                        )
                      }
                      className="status-dropdown"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="action-btn view"
                        onClick={() => handleViewReview(item)}
                        title="View Review"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: 24,
                  }}
                >
                  {searchTerm || statusFilter !== "all"
                    ? "No reviews match your search or filter."
                    : "No doctor reviews found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Result Count and Pagination */}
      {!LoadingDoctorReview && !ErrorDoctorReview && (
        <div
          style={{
            padding: "16px 4px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            Showing{" "}
            {filteredReviews.length === 0
              ? 0
              : (currentPage - 1) * PAGE_SIZE + 1}
            {" - "}
            {Math.min(
              currentPage * PAGE_SIZE,
              filteredReviews.length
            )}
            {" of "}
            {filteredReviews.length} reviews
            {(searchTerm || statusFilter !== "all") 
}
         
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(1, prev - 1)
                )
              }
            >
              Previous
            </button>

            <span>
              Page {totalPages === 0 ? 0 : currentPage} of{" "}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={
                totalPages === 0 ||
                currentPage >= totalPages
              }
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(totalPages, prev + 1)
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* View Review Modal */}
      {showReviewModal && (
        <DoctorReviewModal
          review={selectedReview}
          onClose={closeReviewModal}
        />
      )}

      {/* Activation Confirmation Modal */}
      {showActiveConfirmModal && selectedItem && (
        <div
          className="confirm-overlay"
          onClick={closeActiveConfirmModal}
        >
          <div
            className="active-confirm-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-active-confirm-title"
          >
            <button
              type="button"
              className="active-confirm-close"
              disabled={updatingId !== null}
              onClick={closeActiveConfirmModal}
              aria-label="Close confirmation"
            >
              <FaTimes />
            </button>

            <div className="active-confirm-icon">✓</div>

            <h2 id="doctor-active-confirm-title">
              Activate Doctor Review?
            </h2>

            <p className="active-confirm-description">
              Are you sure you want to mark this doctor review as
              active? It will be visible and available immediately.
            </p>

            <div className="active-confirm-review-info">
              <span>Patient Name</span>
              <strong>
                {selectedItem.patient_name || "N/A"}
              </strong>

              <span>Doctor Name</span>
              <strong>
                {selectedItem.doctor_name || "N/A"}
              </strong>
            </div>

            <div className="active-confirm-actions">
              <button
                type="button"
                className="active-confirm-cancel"
                disabled={updatingId !== null}
                onClick={closeActiveConfirmModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="active-confirm-submit"
                disabled={updatingId !== null}
                onClick={() => confirmStatusChange("active")}
              >
                {updatingId !== null
                  ? "Activating..."
                  : "Yes, Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inactive Reason Modal */}
      {showRejectModal && selectedItem && (
        <div
          className="confirm-overlay"
          onClick={closeRejectModal}
        >
          <div
            className="reason-modal modern-reason-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-rejection-title"
          >
            <button
              type="button"
              className="closes-modal"
              disabled={updatingId !== null}
              onClick={closeRejectModal}
              aria-label="Close inactive modal"
            >
              <FaTimes />
            </button>

            <div className="reason-icon reject-bg">✕</div>

            <h2 id="doctor-rejection-title">
              Mark Doctor Review Inactive
            </h2>

            <p className="reason-subtitle">
              Please provide a reason for marking this doctor
              review inactive.
            </p>

            <div className="vendor-info-card reject-card">
              <div className="vendor-row">
                <span className="label">Patient Name</span>
                <span className="value reject-text">
                  {selectedItem.patient_name || "N/A"}
                </span>
              </div>

              <div className="vendor-row">
                <span className="label">Doctor Name</span>
                <span className="value reject-text">
                  {selectedItem.doctor_name || "N/A"}
                </span>
              </div>
            </div>

            <form onSubmit={submitRejection}>
              <div className="reason-field">
                <label>
                  Reason <span>*</span>
                </label>

                <textarea
                  className="reason-box reject-reason-box"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  placeholder="Enter reason for marking this review inactive..."
                  rows={4}
                  disabled={updatingId !== null}
                  required
                />
              </div>

              <div className="info-box reject-info-box">
                <span className="infos-icon reject-infos-icon">
                  !
                </span>
                <span>
                  The reason will be submitted along with the
                  inactive status.
                </span>
              </div>

              <div className="confirm-buttons">
                <button
                  type="button"
                  className="cancels-btn"
                  disabled={updatingId !== null}
                  onClick={closeRejectModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="approve-btn rejects-btn"
                  disabled={
                    !reason.trim() || updatingId !== null
                  }
                >
                  {updatingId !== null
                    ? "Updating..."
                    : "Confirm Inactive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Doctorreview;
