
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

import {
  FaEye,
  FaStar,
  FaRegStar,
  FaSearch,
  FaTimes,
  FaTrash,
  FaClipboardList,
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
} from "react-icons/fa";

import "react-toastify/dist/ReactToastify.css";
import "./DietReview.css";
import BASE_URL from "../../../Base";

const DietReview = () => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [activeConfirmationModal, setActiveConfirmationModal] =
    useState(false);

  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [rejectionModal, setRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Normalize review status
  const getStatus = (review) => {
    const status = String(review?.status || "unverified")
      .toLowerCase()
      .trim();

    if (["active", "approved"].includes(status)) {
      return "active";
    }

    if (
      ["inactive", "rejected", "declined"].includes(status)
    ) {
      return "inactive";
    }

    return "unverified";
  };

  // Fetch diet reviews
  const fetchReviews = async () => {
    setLoading(true);

    try {
      const token = sessionStorage.getItem("superadmin_token");

      if (!token) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/review/admin/?entity_type=diet_plan`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Failed to fetch diet reviews."
        );
      }

      const data = Array.isArray(result)
        ? result
        : Array.isArray(result.results)
        ? result.results
        : Array.isArray(result.data?.results)
        ? result.data.results
        : Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.reviews)
        ? result.reviews
        : [];

      setReviews(data);
    } catch (error) {
      console.error("Diet reviews fetch error:", error);
      toast.error(error.message || "Unable to fetch diet reviews.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Statistics
  const stats = useMemo(
    () => ({
      total: reviews.length,
      active: reviews.filter(
        (review) => getStatus(review) === "active"
      ).length,
      inactive: reviews.filter(
        (review) => getStatus(review) === "inactive"
      ).length,
    }),
    [reviews]
  );

  // Search and status filters
  const filteredReviews = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return reviews.filter((review) => {
      const searchableText = [
        review.patient_name,
        review.diet_plan_name,
        review.review,
        review.rating,
        review.status,
        review.id,
      ]
        .map((value) => value ?? "")
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !search || searchableText.includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        getStatus(review) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reviews, searchTerm, statusFilter]);

  // Reset pagination when the search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Pagination calculations
  const totalItems = filteredReviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Ensure the current page remains valid after data changes
  useEffect(() => {
    setCurrentPage((page) =>
      Math.max(1, Math.min(page, Math.max(totalPages, 1)))
    );
  }, [totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    totalItems
  );

  const paginatedReviews = filteredReviews.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Generate page numbers and ellipses
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (currentPage <= 3) {
      return [1, 2, 3, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  // Clear search and filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Open and close review details drawer
  const openReviewModal = (review) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const closeReviewModal = () => {
    setShowModal(false);
    setSelectedReview(null);
  };

  // Open inactive reason modal
  const openRejectionModal = (review) => {
    setSelectedReview(review);
    setRejectionReason("");
    setRejectionModal(true);
  };

  const closeRejectionModal = () => {
    if (updatingId !== null) return;

    setRejectionModal(false);
    setRejectionReason("");
    setSelectedReview(null);
  };

  // Update review status
  const updateReviewStatus = async (
    review,
    action,
    reason = ""
  ) => {
    const reviewId = review?.id;

    if (!reviewId) {
      toast.error("Review ID is missing.");
      return;
    }

    if (!["active", "inactive"].includes(action)) {
      toast.error("Invalid review status.");
      return;
    }

    const trimmedReason = reason.trim();

    if (action === "inactive" && !trimmedReason) {
      toast.error("Please enter a reason before confirming.");
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    setUpdatingId(reviewId);

    try {
      const response = await fetch(
        `${BASE_URL}/review/admin/?entity_type=diet_plan&id=${reviewId}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            action,
            reason: action === "inactive" ? trimmedReason : "",
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || result.success === false) {
        const message =
          result?.errors?.action?.[0] ||
          result?.errors?.reason?.[0] ||
          result?.message ||
          `Unable to mark review ${action}.`;

        throw new Error(message);
      }

      toast.success(
        action === "active"
          ? "Diet review activated successfully."
          : "Diet review marked inactive successfully."
      );

      setRejectionModal(false);
      setActiveConfirmationModal(false);
      setRejectionReason("");
      setSelectedReview(null);

      // Refresh the list once after updating
      await fetchReviews();
    } catch (error) {
      console.error("Update diet review error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Status dropdown handler
  const handleStatusChange = (review, value) => {
    const currentStatus = getStatus(review);

    if (value === currentStatus) return;

    if (value === "inactive") {
      openRejectionModal(review);
      return;
    }

    if (value === "active") {
      setSelectedReview(review);
      setActiveConfirmationModal(true);
    }
  };

  // Submit inactive reason
  const submitRejection = (event) => {
    event.preventDefault();

    const reason = rejectionReason.trim();

    if (!reason) {
      toast.error("Please enter a reason before confirming.");
      return;
    }

    if (!selectedReview) {
      toast.error("Please select a diet review.");
      return;
    }

    updateReviewStatus(selectedReview, "inactive", reason);
  };

  // Render rating stars
  const renderStars = (rating) => {
    const value = Math.max(
      0,
      Math.min(5, Number(rating) || 0)
    );

    return (
      <div className="diet-review-rating-stars">
        {[1, 2, 3, 4, 5].map((star) =>
          star <= value ? (
            <FaStar
              key={star}
              className="diet-review-star-filled"
            />
          ) : (
            <FaRegStar
              key={star}
              className="diet-review-star-empty"
            />
          )
        )}

        <span className="diet-review-rating-number">
          ({value}/5)
        </span>
      </div>
    );
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="category-page diet-review-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Diet Plan Review Management</h1>
        <p className="page-paragraph">
          Manage diet plan reviews and their details.
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
            <FaUsers size={16} />
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
            <FaChartLine size={16} />
          </div>

          <div className="stat2-info">
            <h3>Active</h3>
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
            <FaCalendarAlt size={16} />
          </div>

          <div className="stat2-info">
            <h3>Inactive</h3>
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
              placeholder="Search patient, diet plan, review..."
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
            <option value="all">All Statuses</option>
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
        </div>
      </div>

      {/* Reviews Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Patient Name</th>
              <th>Diet Plan</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Status</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={8}>
                    <div className="skeleton-row" />
                  </td>
                </tr>
              ))
            ) : paginatedReviews.length > 0 ? (
              paginatedReviews.map((review, index) => {
                const patientName = review.patient_name || "—";
                const dietName = review.diet_plan_name || "—";
                const reviewText = review.review || "—";
                const status = getStatus(review);

                return (
                  <tr key={review.id || index}>
                    <td>{startIndex + index + 1}</td>

                    <td>
                      <span className="category-name">
                        {patientName}
                      </span>
                    </td>

                    <td>{dietName}</td>

                    <td>{renderStars(review.rating)}</td>

                    <td>
                      <div
                        className="diet-review-table-text"
                        title={reviewText}
                      >
                        {reviewText.length > 70
                          ? `${reviewText.slice(0, 70)}...`
                          : reviewText}
                      </div>
                    </td>

                    <td>
                      <select
                        className="status-dropdown"
                        value={status}
                        disabled={updatingId === review.id}
                        onChange={(event) =>
                          handleStatusChange(
                            review,
                            event.target.value
                          )
                        }
                        aria-label={`Status for review ${review.id}`}
                      >
                        {status === "unverified" && (
                          <option value="unverified" disabled>
                            Unverified
                          </option>
                        )}

                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>

                    <td>
                      {formatDate(
                        review.created_at || review.created
                      )}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="action-btn view"
                          title="View Review"
                          onClick={() => openReviewModal(review)}
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="empty-filter-state">
                    <FaClipboardList />
                    <h3>No Diet Reviews Found</h3>

                    <p>
                      {searchTerm || statusFilter !== "all"
                        ? "Try changing your search or filters."
                        : "There are no diet reviews available yet."}
                    </p>

                    {(searchTerm || statusFilter !== "all") && (
                      <button
                        type="button"
                        className="clear-filters-btn"
                        onClick={clearFilters}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <div className="review-pagination">
          <div className="pagination-info">
            Showing{" "}
            <strong>{startIndex + 1}</strong> to{" "}
            <strong>{endIndex}</strong> of{" "}
            <strong>{totalItems}</strong> reviews
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-arrow"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
              aria-label="Previous page"
            >
              &#8249;
            </button>

            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="pagination-ellipsis"
                >
                  ...
                </span>
              ) : (
                <button
                  type="button"
                  key={page}
                  className={`pagination-page ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={
                    currentPage === page ? "page" : undefined
                  }
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              className="pagination-arrow"
              disabled={
                currentPage === totalPages || totalPages === 0
              }
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1)
                )
              }
              aria-label="Next page"
            >
              &#8250;
            </button>
          </div>
        </div>
      )}

      {/* Right-Side Details Drawer */}
      {showModal && selectedReview && (
        <div
          className="diet-review-drawer-overlay"
          onClick={closeReviewModal}
        >
          <aside
            className="diet-review-details-drawer"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Diet review details"
          >
            <div className="diet-review-drawer-header">
              <div className="diet-review-header-info">
                <h2>Diet Review Details</h2>
                <p>Review ID: {selectedReview.id || "—"}</p>
              </div>

              <div className="diet-review-header-actions">
                <span
                  className={`diet-review-status-badge ${getStatus(
                    selectedReview
                  )}`}
                >
                  {getStatus(selectedReview)}
                </span>

                <button
                  type="button"
                  className="diet-review-drawer-close"
                  onClick={closeReviewModal}
                  aria-label="Close review details"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="diet-review-drawer-body">
              {/* Patient review summary */}
              <div className="diet-review-drawer-card diet-review-summary-card">
                <div className="diet-review-summary-top">
                  <div className="diet-review-summary-info">
                    <span className="diet-review-section-label">
                      PATIENT REVIEW
                    </span>

                    <h3>
                      {selectedReview.patient_name ||
                        "Unknown Patient"}
                    </h3>

                    <p>
                      Submitted on{" "}
                      {formatDate(
                        selectedReview.created_at ||
                          selectedReview.created
                      )}
                    </p>
                  </div>

                  <div className="diet-review-summary-icon">
                    <FaStar />
                  </div>
                </div>

                <div className="diet-review-rating-box">
                  <div>
                    <span className="diet-review-section-label">
                      OVERALL RATING
                    </span>

                    <div className="diet-review-rating-large">
                      {Number(selectedReview.rating) || 0}
                      <span>/5</span>
                    </div>
                  </div>

                  {renderStars(selectedReview.rating)}
                </div>
              </div>

              {/* Diet Plan Information */}
              <div className="diet-review-drawer-card">
                <div className="diet-review-card-heading">
                  <span className="diet-review-card-icon">
                    <FaClipboardList />
                  </span>
                  <h3>Diet Plan Information</h3>
                </div>

                <div className="diet-review-detail-row">
                  <span>Diet Plan Name</span>
                  <strong>
                    {selectedReview.diet_plan_name || "—"}
                  </strong>
                </div>

                <div className="diet-review-detail-row">
                  <span>Review ID</span>
                  <strong className="diet-review-id-text">
                    {selectedReview.id || "—"}
                  </strong>
                </div>

                <div className="diet-review-detail-row">
                  <span>Created Date</span>
                  <strong>
                    {formatDate(
                      selectedReview.created_at ||
                        selectedReview.created
                    )}
                  </strong>
                </div>
              </div>

              {/* Complete Feedback */}
              <div className="diet-review-drawer-card">
                <div className="diet-review-card-heading">
                  <span className="diet-review-card-icon">
                    <FaStar />
                  </span>
                  <h3>Patient Feedback</h3>
                </div>

                <div className="diet-review-feedback-content">
                  {selectedReview.review ||
                    "No review comments provided."}
                </div>

                <div className="diet-review-feedback-rating">
                  <span>Patient Rating</span>
                  {renderStars(selectedReview.rating)}
                </div>
              </div>

              {/* Status Information */}
              <div className="diet-review-drawer-card">
                <div className="diet-review-card-heading">
                  <span className="diet-review-card-icon">
                    <FaChartLine />
                  </span>
                  <h3>Review Status</h3>
                </div>

                <div className="diet-review-status-detail">
                  <div>
                    <span className="diet-review-section-label">
                      CURRENT STATUS
                    </span>

                    <p>
                      {getStatus(selectedReview)
                        .charAt(0)
                        .toUpperCase() +
                        getStatus(selectedReview).slice(1)}
                    </p>
                  </div>

                  <span
                    className={`diet-review-status-badge ${getStatus(
                      selectedReview
                    )}`}
                  >
                    {getStatus(selectedReview)}
                  </span>
                </div>

                {selectedReview.reason && (
                  <div className="diet-review-reason-content">
                    <strong>Inactive Reason</strong>
                    <p>{selectedReview.reason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="diet-review-drawer-footer">
              <button
                type="button"
                className="diet-review-footer-btn"
                onClick={closeReviewModal}
              >
                Close Details
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Inactive Reason Modal */}
      {rejectionModal && selectedReview && (
        <div
          className="confirm-overlay"
          onClick={closeRejectionModal}
        >
          <div
            className="reason-modal modern-reason-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="diet-inactive-title"
          >
            <button
              type="button"
              className="closes-modal"
              disabled={updatingId !== null}
              onClick={closeRejectionModal}
              aria-label="Close inactive modal"
            >
              <FaTimes />
            </button>

            <div className="reason-icon reject-bg">✕</div>

            <h2 id="diet-inactive-title">
              Mark Diet Review Inactive
            </h2>

            <p className="reason-subtitle">
              Please provide a reason for making this review inactive.
            </p>

            <div className="vendor-info-card reject-card">
              <div className="vendor-row">
                <span className="label">Patient Name</span>
                <span className="value reject-text">
                  {selectedReview.patient_name || "N/A"}
                </span>
              </div>
            </div>

            <form onSubmit={submitRejection}>
              <div className="reason-field">
                <label>
                  Inactive Reason <span>*</span>
                </label>

                <textarea
                  className="reason-box reject-reason-box"
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(event.target.value)
                  }
                  placeholder="Enter reason for making this review inactive..."
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
                  The reason will be submitted along with the inactive
                  status.
                </span>
              </div>

              <div className="confirm-buttons">
                <button
                  type="button"
                  className="cancels-btn"
                  disabled={updatingId !== null}
                  onClick={closeRejectionModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="approve-btn rejects-btn"
                  disabled={
                    !rejectionReason.trim() ||
                    updatingId !== null
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

      {/* Active Confirmation Modal */}
      {activeConfirmationModal && selectedReview && (
        <div
          className="confirm-overlay"
          onClick={() => {
            if (updatingId === null) {
              setActiveConfirmationModal(false);
              setSelectedReview(null);
            }
          }}
        >
          <div
            className="active-confirm-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="active-confirm-title"
          >
            <button
              type="button"
              className="active-confirm-close"
              disabled={updatingId !== null}
              onClick={() => {
                setActiveConfirmationModal(false);
                setSelectedReview(null);
              }}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>

            <div className="active-confirm-icon">✓</div>

            <h2 id="active-confirm-title">
              Activate Diet Review?
            </h2>

            <p className="active-confirm-description">
              Are you sure you want to mark this diet review as active?
              It will be visible and available immediately.
            </p>

            <div className="active-confirm-review-info">
              <span>Patient Name</span>
              <strong>
                {selectedReview.patient_name || "N/A"}
              </strong>
            </div>

            <div className="active-confirm-actions">
              <button
                type="button"
                className="active-confirm-cancel"
                disabled={updatingId !== null}
                onClick={() => {
                  setActiveConfirmationModal(false);
                  setSelectedReview(null);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="active-confirm-submit"
                disabled={updatingId !== null}
                onClick={() =>
                  updateReviewStatus(selectedReview, "active")
                }
              >
                {updatingId !== null
                  ? "Activating..."
                  : "Yes, Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={2000}
        newestOnTop
      />
    </div>
  );
};

export default DietReview;
