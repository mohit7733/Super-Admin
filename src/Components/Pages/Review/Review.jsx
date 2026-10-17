
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
import "./Review.css";
import ReviewsModal from "./ReviewsModal";

const PAGE_SIZE = 10;

const Review = () => {
  const [ReviewData, setReviewData] = useState([]);
  const [LoadingReview, setLoadingReview] = useState(false);
  const [ErrorReview, setErrorReview] = useState(null);

  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewModal, setReviewModal] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showActiveConfirmModal, setShowActiveConfirmModal] =
    useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [reason, setReason] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  // Normalize review status
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

    if (["inactive", "rejected"].includes(status)) {
      return "inactive";
    }

    return status || "unverified";
  };

  // Render rating stars
  const renderStars = (rating) => {
    const numericRating = Math.min(
      5,
      Math.max(0, Number(rating) || 0)
    );

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

const getReviewList = useCallback(async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoadingReview(true);
  setErrorReview(null);

  try {
    const allReviews = [];
    const fetchedIds = new Set();

    let page = 1;
    let hasMore = true;
    let totalCount = null;

    while (hasMore) {
      // Keep the same API endpoint and pagination pattern
      const apiUrl =
        `${BASE_URL}/review/admin/?entity_type=product&page=${page}`;

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

      if (!response.ok) {
        throw new Error(
          `Product review API failed: ${response.status}`
        );
      }

      const data = await response.json();

      // Support common response structures
      const reviews = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.data?.results)
        ? data.data.results
        : Array.isArray(data.results)
        ? data.results
        : [];

      if (totalCount === null && data.count != null) {
        totalCount = Number(data.count);
      }

      reviews.forEach((review) => {
        const id = review?.id;

        if (!id || !fetchedIds.has(id)) {
          if (id) fetchedIds.add(id);
          allReviews.push(review);
        }
      });

      // Prefer the backend's actual next-page information.
      if (data.next) {
        page += 1;
        hasMore = true;
      } else if (
        Number.isFinite(totalCount) &&
        totalCount !== null
      ) {
        hasMore =
          allReviews.length < totalCount &&
          reviews.length > 0;
        page += 1;
      } else {
        // Without count or next, stop when the page is short.
        hasMore = reviews.length >= PAGE_SIZE;

        if (hasMore) {
          page += 1;
        }
      }

      // Safety guard against an unexpected infinite loop.
      if (page > 1000) {
        console.warn("Stopped review pagination safety limit.");
        break;
      }
    }

    setReviewData(allReviews);
    setCurrentPage(1);
  } catch (error) {
    console.error("Product review fetch error:", error);
    setErrorReview(error.message || "Failed to fetch reviews.");
    toast.error(error.message || "Failed to fetch reviews.");
  } finally {
    setLoadingReview(false);
  }
}, [navigate]);


  // Initial load
  useEffect(() => {
    getReviewList();
  }, [getReviewList]);

  // Statistics from the complete fetched dataset
  const stats = useMemo(
    () => ({
      total: ReviewData.length,

      active: ReviewData.filter(
        (item) => getStatus(item) === "active"
      ).length,

      inactive: ReviewData.filter(
        (item) => getStatus(item) === "inactive"
      ).length,
    }),
    [ReviewData]
  );

  // Search and filter the COMPLETE fetched dataset
  const filteredReviews = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return ReviewData.filter((item) => {
      const searchableText = [
        item.id,
        item.patient_name,
        item.variant_name,
        item.product_name,
        item.review,
        item.rating,
        item.status,
        item.action_reason,
        item.action_by_name,
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
  }, [ReviewData, searchTerm, statusFilter]);

  // Reset to page 1 when the search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Local pagination AFTER filtering
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

  // Keep current page valid when results decrease
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

  // View review details
  const handleViewReview = (review) => {
    setSelectedReview(review);
    setReviewModal(true);
  };

  const closeReviewModal = () => {
    setSelectedReview(null);
    setReviewModal(false);
  };

  // Handle status dropdown
  const handleStatusChange = (review, status) => {
    if (!review?.id) {
      toast.error("Review ID is missing.");
      return;
    }

    if (status === getStatus(review)) {
      return;
    }

    setSelectedItem(review);

    if (status === "active") {
      setShowActiveConfirmModal(true);
      return;
    }

    if (status === "inactive") {
      setReason("");
      setShowRejectModal(true);
    }
  };

  // Update product review status
  const confirmStatusChange = async (
    status,
    rejectionReason = ""
  ) => {
    if (!selectedItem?.id) {
      toast.error("Please select a product review.");
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

    const reviewId = selectedItem.id;
    setUpdatingId(reviewId);

    try {
      const response = await fetch(
        `${BASE_URL}/review/admin/?entity_type=product&id=${reviewId}`,
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
        const errorMessage =
          data?.errors?.action?.[0] ||
          data?.errors?.reason?.[0] ||
          data?.message ||
          "Failed to update product review status.";

        throw new Error(errorMessage);
      }

      toast.success(
        action === "active"
          ? "Product review activated successfully."
          : "Product review marked inactive successfully."
      );

      setShowActiveConfirmModal(false);
      setShowRejectModal(false);
      setReason("");
      setSelectedItem(null);

      // Reload the complete dataset after updating status
      await getReviewList();
    } catch (error) {
      console.error(
        "Error updating product review status:",
        error
      );

      toast.error(error.message || "Something went wrong.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Submit inactivity reason
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

  // Pagination handlers
  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) =>
      Math.min(totalPages, prev + 1)
    );
  };

  // Numbered pages with ellipsis
  const getVisiblePages = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let page = 1; page <= totalPages; page++) {
        pages.push(page);
      }
    } else if (currentPage <= 2) {
      pages.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 1) {
      pages.push(
        1,
        "...",
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(1, "...", currentPage, "...", totalPages);
    }

    return pages;
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Product Review Management</h1>
        <p className="page-paragraph">
          Manage product reviews, ratings and their status.
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
              placeholder="Search customer, product, review..."
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
            <option value="unverified">Unverified</option>
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
            onClick={getReviewList}
            disabled={LoadingReview}
            title="Refresh all reviews"
          >
            <FaSyncAlt />
          </button>
        </div>
      </div>

      {/* Product Reviews Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Review</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {LoadingReview ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan="7">
                    <div className="skeleton-row" />
                  </td>
                </tr>
              ))
            ) : ErrorReview ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    color: "red",
                    textAlign: "center",
                    padding: 24,
                  }}
                >
                  {ErrorReview}
                  <br />
                  <button
                    type="button"
                    onClick={getReviewList}
                    style={{ marginTop: 12 }}
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ) : paginatedReviews.length > 0 ? (
              paginatedReviews.map((item, index) => {
                const currentStatus = getStatus(item);

                return (
                  <tr key={item.id || index}>
                    <td>
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td>{item.patient_name || "N/A"}</td>

                    <td>
                      {item.variant_name ||
                        item.product_name ||
                        "N/A"}
                    </td>

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
                        {renderStars(item.rating)}
                        <span className="rating-number">
                          {Number(item.rating || 0).toFixed(1)}
                        </span>
                      </div>
                    </td>

                    <td>
                      <select
                        disabled={updatingId === item.id}
                        value={currentStatus}
                        onChange={(event) =>
                          handleStatusChange(
                            item,
                            event.target.value
                          )
                        }
                        className="status-dropdown"
                      >
                        {currentStatus === "unverified" && (
                          <option value="unverified" disabled>
                            Unverified
                          </option>
                        )}

                        {currentStatus !== "active" &&
                          currentStatus !== "inactive" &&
                          currentStatus !== "unverified" && (
                            <option
                              value={currentStatus}
                              disabled
                            >
                              {currentStatus}
                            </option>
                          )}

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
                          title="View Product Review"
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
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: 24,
                  }}
                >
                  {searchTerm || statusFilter !== "all"
                    ? "No reviews match your search or filter."
                    : "No product reviews found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Pagination */}
      {!LoadingReview && !ErrorReview && (
        <div className="review-pagination-container">
          <div className="pagination-summary">
            Showing{" "}
            <strong>
              {filteredReviews.length === 0
                ? 0
                : (currentPage - 1) * PAGE_SIZE + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(
                currentPage * PAGE_SIZE,
                filteredReviews.length
              )}
            </strong>{" "}
            of <strong>{filteredReviews.length}</strong> reviews
       
          </div>

          <div className="review-pagination">
            <button
              type="button"
              className="pagination-arrow"
              disabled={currentPage === 1}
              onClick={handlePreviousPage}
              aria-label="Previous page"
            >
              ‹
            </button>

            {getVisiblePages().map((page, index) =>
              page === "..." ? (
                <span
                  key={`dots-${index}`}
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
                  disabled={LoadingReview}
                >
                  {page}
                </button>
              )
            )}

            <button
              type="button"
              className="pagination-arrow"
              disabled={
                totalPages === 0 || currentPage >= totalPages
              }
              onClick={handleNextPage}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* View Review Modal */}
      {reviewModal && selectedReview && (
        <ReviewsModal
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
            aria-labelledby="product-active-confirm-title"
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

            <h2 id="product-active-confirm-title">
              Activate Product Review?
            </h2>

            <p className="active-confirm-description">
              Are you sure you want to activate this product
              review? It may become visible to customers.
            </p>

            <div className="active-confirm-review-info">
              <span>Customer Name</span>
              <strong>
                {selectedItem.patient_name || "N/A"}
              </strong>

              <span>Product Name</span>
              <strong>
                {selectedItem.variant_name ||
                  selectedItem.product_name ||
                  "N/A"}
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
            aria-labelledby="product-inactive-title"
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

            <h2 id="product-inactive-title">
              Mark Product Review Inactive
            </h2>

            <p className="reason-subtitle">
              Please provide a reason for making this
              product review inactive.
            </p>

            <div className="vendor-info-card reject-card">
              <div className="vendor-row">
                <span className="label">Customer Name</span>
                <span className="value reject-text">
                  {selectedItem.patient_name || "N/A"}
                </span>
              </div>

              <div className="vendor-row">
                <span className="label">Product Name</span>
                <span className="value reject-text">
                  {selectedItem.variant_name ||
                    selectedItem.product_name ||
                    "N/A"}
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

export default Review;
