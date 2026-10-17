
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  FaAndroid,
  FaApple,
  FaEye,
  FaSearch,
  FaTimes,
  FaStar,
  FaRegStar,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaBan,
  FaMobileAlt,
  FaClipboardList,
  FaFilter,
  FaExclamationTriangle,
} from "react-icons/fa";

import "react-toastify/dist/ReactToastify.css";
import "./AppReview.css";
import BASE_URL from "../../../Base";

const PAGE_SIZE = 10;
const APP_REVIEW_API = `${String(BASE_URL).replace(/\/+$/, "")}/review/admin/app/`;

const getToken = () => sessionStorage.getItem("superadmin_token");

const getReviewId = (review) =>
  review?.id ?? review?.review_id ?? review?.uuid ?? "";

const getPlatform = (review) =>
  String(review?.platform ?? review?.app_platform ?? "android").toLowerCase();

const getStatus = (review) =>
  String(review?.status ?? review?.review_status ?? "active").toLowerCase();

const getRating = (review) => {
  const rating = Number(review?.rating ?? review?.stars ?? review?.review_rating);
  return Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0;
};

const getReviewText = (review) =>
  review?.review ??
  review?.review_text ??
  review?.comment ??
  review?.feedback ??
  review?.description ??
  "No review text available";

const getReviewerName = (review) =>
  review?.user_name ??
  review?.customer_name ??
  review?.name ??
  review?.user?.name ??
  review?.customer?.name ??
  "Anonymous User";

const getReviewerEmail = (review) =>
  review?.email ??
  review?.user_email ??
  review?.user?.email ??
  review?.customer?.email ??
  "—";

const getDate = (review) => {
  const rawDate =
    review?.created_at ??
    review?.created ??
    review?.review_date ??
    review?.date;

  if (!rawDate) return "—";

  const parsedDate = new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) return String(rawDate);

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const extractReviews = (payload) => {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.reviews)) return payload.reviews;
  if (Array.isArray(payload?.data?.results)) return payload.data.results;
  if (Array.isArray(payload?.data?.reviews)) return payload.data.reviews;

  return [];
};

const getErrorMessage = (payload, fallback) =>
  payload?.detail ??
  payload?.message ??
  payload?.error ??
  fallback;

const AppReview = () => {
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [platform, setPlatform] = useState("android");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [nextStatus, setNextStatus] = useState("");
  const [reason, setReason] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleSessionExpiry = useCallback(() => {
    sessionStorage.removeItem("superadmin_token");
    toast.error("Session expired. Please login again.");
    navigate("/login");
  }, [navigate]);

  const fetchReviews = useCallback(
    async (showLoader = true) => {
      if (showLoader) setLoading(true);

      try {
        const token = getToken();

        const response = await fetch(
          `${APP_REVIEW_API}?platform=${encodeURIComponent(platform)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "true",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          handleSessionExpiry();
          return;
        }

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            getErrorMessage(payload, "Unable to fetch app reviews.")
          );
        }

        setReviews(extractReviews(payload));
      } catch (error) {
        console.error("App reviews fetch error:", error);
        toast.error(error.message || "Unable to fetch app reviews.");
        setReviews([]);
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    [platform, handleSessionExpiry]
  );

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    setCurrentPage(1);
    setSearch("");
    setStatusFilter("all");
    setSelectedReview(null);
    setShowDetails(false);
  }, [platform]);

  const platformReviews = useMemo(
    () => reviews.filter((review) => getPlatform(review) === platform),
    [reviews, platform]
  );

  const filteredReviews = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return platformReviews.filter((review) => {
      const matchesStatus =
        statusFilter === "all" || getStatus(review) === statusFilter;

      const searchableText = [
        getReviewId(review),
        getReviewerName(review),
        getReviewerEmail(review),
        getReviewText(review),
        review?.app_name,
        review?.version,
        review?.platform,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [platformReviews, statusFilter, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReviews.length / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedReviews = useMemo(() => {
    const startIndex = (safePage - 1) * PAGE_SIZE;
    return filteredReviews.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredReviews, safePage]);

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  const activeCount = platformReviews.filter(
    (review) => getStatus(review) === "active"
  ).length;

  const inactiveCount = platformReviews.filter(
    (review) => getStatus(review) === "inactive"
  ).length;

  const averageRating = useMemo(() => {
    if (!platformReviews.length) return "0.0";

    const total = platformReviews.reduce(
      (sum, review) => sum + getRating(review),
      0
    );

    return (total / platformReviews.length).toFixed(1);
  }, [platformReviews]);

  const openDetails = (review) => {
    setSelectedReview(review);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedReview(null);
  };

  const openStatusModal = (review, status) => {
    setStatusTarget(review);
    setNextStatus(status);
    setReason("");
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    if (updating) return;

    setShowStatusModal(false);
    setStatusTarget(null);
    setNextStatus("");
    setReason("");
  };

  const updateReviewStatus = async () => {
    if (!statusTarget) return;

    const reviewId = getReviewId(statusTarget);

    if (!reviewId) {
      toast.error("Review ID is missing. Unable to update status.");
      return;
    }

    if (nextStatus === "inactive" && !reason.trim()) {
      toast.error("Please enter a reason for deactivating this review.");
      return;
    }

    setUpdating(true);

    try {
      const token = getToken();

      /*
       * IMPORTANT:
       * This PATCH request assumes the backend accepts:
       * PATCH /review/admin/app/?id=<reviewId>&platform=<platform>
       * Body: { status: "active" | "inactive", reason?: "..." }
       *
       * Confirm the PATCH endpoint and payload with your backend team.
       * The GET endpoints alone do not confirm the update contract.
       */
      const updateUrl = new URL(APP_REVIEW_API);
      updateUrl.searchParams.set("id", String(reviewId));
      updateUrl.searchParams.set("platform", platform);

      const payload = {
        status: nextStatus,
        ...(nextStatus === "inactive" ? { reason: reason.trim() } : {}),
      };

      const response = await fetch(updateUrl.toString(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        handleSessionExpiry();
        return;
      }

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            responseData,
            "Unable to update review status. Please verify the update API."
          )
        );
      }

      toast.success(
        `Review ${nextStatus === "active" ? "activated" : "deactivated"} successfully.`
      );

      setShowStatusModal(false);
      setStatusTarget(null);
      setNextStatus("");
      setReason("");

      if (
        selectedReview &&
        String(getReviewId(selectedReview)) === String(reviewId)
      ) {
        setSelectedReview({
          ...selectedReview,
          status: nextStatus,
          ...(nextStatus === "inactive" ? { reason: reason.trim() } : {}),
        });
      }

      await fetchReviews(false);
    } catch (error) {
      console.error("App review status update error:", error);
      toast.error(error.message || "Unable to update review status.");
    } finally {
      setUpdating(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const renderStars = (rating) => (
    <span className="app-review-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) =>
        star <= rating ? (
          <FaStar key={star} />
        ) : (
          <FaRegStar key={star} />
        )
      )}
    </span>
  );

  const statusLabel = (status) =>
    status === "active" ? "Active" : status === "inactive" ? "Inactive" : status;

  return (
    <div className="category-page diet-review-page app-review-page">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="page-header">
        <div>
          <h2>App Reviews Management</h2>
          <p className="page-paragraph">
            Manage and review feedback submitted for the Android and iOS apps.
          </p>
        </div>

        <button
          type="button"
          className="app-review-refresh-btn"
          onClick={() => fetchReviews()}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Reviews"}
        </button>
      </div>

      {/* Platform selection */}
      <div className="app-review-platform-buttons">
        <button
          type="button"
          className={`app-review-platform-btn ${
            platform === "android" ? "active" : ""
          }`}
          onClick={() => setPlatform("android")}
        >
          <FaAndroid />
          Android Reviews
        </button>

        <button
          type="button"
          className={`app-review-platform-btn ${
            platform === "ios" ? "active" : ""
          }`}
          onClick={() => setPlatform("ios")}
        >
          <FaApple />
          iOS Reviews
        </button>
      </div>

      {/* Statistics */}
      <div className="stats2-grid">
        <div className="stat2-card">
          <div className="stat2-icon">
            <FaClipboardList />
          </div>
          <div className="stat2-info">
            <span className="stat2-value">{platformReviews.length}</span>
            <span>Total Reviews</span>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon">
            <FaCheckCircle />
          </div>
          <div className="stat2-info">
            <span className="stat2-value">{activeCount}</span>
            <span>Active Reviews</span>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon">
            <FaBan />
          </div>
          <div className="stat2-info">
            <span className="stat2-value">{inactiveCount}</span>
            <span>Inactive Reviews</span>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon">
            <FaStar />
          </div>
          <div className="stat2-info">
            <span className="stat2-value">{averageRating}</span>
            <span>Average Rating</span>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by user, email, review or ID..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="status-filter-select"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {(search || statusFilter !== "all") && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={clearFilters}
            >
              <FaTimes /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Reviews table */}
      <div className="table-wrapper">
        <table className="data-table app-review-table">
          <thead>
            <tr>
              <th>S. No.</th>
              <th>Reviewer</th>
              <th>Review</th>
              <th>Rating</th>
              <th>Platform</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="app-review-empty">
                  Loading app reviews...
                </td>
              </tr>
            ) : paginatedReviews.length === 0 ? (
              <tr>
                <td colSpan="8" className="app-review-empty">
                  <div className="app-review-empty-content">
                    <FaFilter />
                    <p>No app reviews found.</p>
                    <span>Try changing the search or filter options.</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedReviews.map((review, index) => {
                const reviewStatus = getStatus(review);
                const rating = getRating(review);
                const rowId = getReviewId(review);

                return (
                  <tr key={rowId || `${platform}-${index}`}>
                    <td>
                      {(safePage - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td>
                      <div className="app-review-user">
                        <span className="category-name">
                          {getReviewerName(review)}
                        </span>
                        <span className="app-review-email">
                          {getReviewerEmail(review)}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="diet-review-table-text app-review-text">
                        {getReviewText(review)}
                      </div>
                    </td>

                    <td>
                      <div className="app-review-rating">
                        {renderStars(rating)}
                        <span>{rating.toFixed(1)}</span>
                      </div>
                    </td>

                    <td>
                      <span className="app-review-platform-tag">
                        {getPlatform(review) === "ios" ? (
                          <FaApple />
                        ) : (
                          <FaAndroid />
                        )}
                        {getPlatform(review).toUpperCase()}
                      </span>
                    </td>

                    <td>{getDate(review)}</td>

                    <td>
                      <span
                        className={`diet-review-status-badge ${
                          reviewStatus === "active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {statusLabel(reviewStatus)}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="action-btn view"
                          title="View review details"
                          onClick={() => openDetails(review)}
                        >
                          <FaEye />
                        </button>

                        <button
                          type="button"
                          className={`app-review-toggle-btn ${
                            reviewStatus === "active"
                              ? "deactivate"
                              : "activate"
                          }`}
                          title={
                            reviewStatus === "active"
                              ? "Deactivate review"
                              : "Activate review"
                          }
                          onClick={() =>
                            openStatusModal(
                              review,
                              reviewStatus === "active" ? "inactive" : "active"
                            )
                          }
                        >
                          {reviewStatus === "active" ? (
                            <FaBan />
                          ) : (
                            <FaCheckCircle />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredReviews.length > 0 && (
        <div className="review-pagination">
          <div className="pagination-info">
            Showing {(safePage - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(safePage * PAGE_SIZE, filteredReviews.length)} of{" "}
            {filteredReviews.length} reviews
          </div>

          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-arrow"
              disabled={safePage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              aria-label="Previous page"
            >
              <FaChevronLeft />
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - safePage) <= 1
              )
              .reduce((items, page, index, pages) => {
                if (index > 0 && page - pages[index - 1] > 1) {
                  items.push("ellipsis-" + page);
                }
                items.push(page);
                return items;
              }, [])
              .map((page) =>
                typeof page === "string" ? (
                  <span className="app-review-pagination-dots" key={page}>
                    ...
                  </span>
                ) : (
                  <button
                    type="button"
                    key={page}
                    className={`pagination-page ${
                      safePage === page ? "active" : ""
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}

            <button
              type="button"
              className="pagination-arrow"
              disabled={safePage === totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              aria-label="Next page"
            >
              Next
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Review details drawer */}
      {showDetails && selectedReview && (
        <div
          className="diet-review-drawer-overlay"
          onClick={closeDetails}
          role="presentation"
        >
          <aside
            className="diet-review-details-drawer"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="App review details"
          >
            <div className="diet-review-drawer-header">
              <div className="diet-review-header-info">
                <h3>App Review Details</h3>
                <p>Review ID: {getReviewId(selectedReview) || "—"}</p>
              </div>

              <div className="diet-review-header-actions">
                <button
                  type="button"
                  className="diet-review-drawer-close"
                  onClick={closeDetails}
                  aria-label="Close details"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="diet-review-drawer-body">
              <div className="diet-review-drawer-card diet-review-summary-card">
                <div className="diet-review-summary-top">
                  <div className="diet-review-summary-icon">
                    <FaMobileAlt />
                  </div>

                  <div className="diet-review-summary-info">
                    <h3>{getReviewerName(selectedReview)}</h3>
                    <p>{getReviewerEmail(selectedReview)}</p>
                    <span className="app-review-platform-tag">
                      {getPlatform(selectedReview) === "ios" ? (
                        <FaApple />
                      ) : (
                        <FaAndroid />
                      )}
                      {getPlatform(selectedReview).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="diet-review-detail-row">
                  <span className="diet-review-section-label">Rating</span>
                  <div className="app-review-rating">
                    {renderStars(getRating(selectedReview))}
                    <strong>{getRating(selectedReview)} / 5</strong>
                  </div>
                </div>

                <div className="diet-review-detail-row">
                  <span className="diet-review-section-label">Date</span>
                  <span>{getDate(selectedReview)}</span>
                </div>

                <div className="diet-review-detail-row">
                  <span className="diet-review-section-label">Status</span>
                  <span
                    className={`diet-review-status-badge ${
                      getStatus(selectedReview) === "active"
                        ? "active"
                        : "inactive"
                    }`}
                  >
                    {statusLabel(getStatus(selectedReview))}
                  </span>
                </div>
              </div>

              <div className="diet-review-drawer-card">
                <h4 className="diet-review-card-heading">Review Feedback</h4>
                <div className="diet-review-feedback-content">
                  {getReviewText(selectedReview)}
                </div>
              </div>

              <div className="diet-review-drawer-card">
                <h4 className="diet-review-card-heading">Additional Details</h4>

                <div className="diet-review-detail-row">
                  <span className="diet-review-section-label">Review ID</span>
                  <span className="diet-review-id-text">
                    {getReviewId(selectedReview) || "—"}
                  </span>
                </div>

                <div className="diet-review-detail-row">
                  <span className="diet-review-section-label">App Name</span>
                  <span>{selectedReview.app_name || "—"}</span>
                </div>

                <div className="diet-review-detail-row">
                  <span className="diet-review-section-label">App Version</span>
                  <span>{selectedReview.version || "—"}</span>
                </div>

                <div className="diet-review-detail-row">
                  <span className="diet-review-section-label">Reason</span>
                  <span>
                    {selectedReview.reason ||
                      selectedReview.rejection_reason ||
                      "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="diet-review-drawer-footer">
              <button
                type="button"
                className="diet-review-footer-btn"
                onClick={closeDetails}
              >
                Close
              </button>

              <button
                type="button"
                className={`diet-review-footer-btn ${
                  getStatus(selectedReview) === "active"
                    ? "app-review-footer-deactivate"
                    : "app-review-footer-activate"
                }`}
                onClick={() =>
                  openStatusModal(
                    selectedReview,
                    getStatus(selectedReview) === "active"
                      ? "inactive"
                      : "active"
                  )
                }
              >
                {getStatus(selectedReview) === "active"
                  ? "Deactivate Review"
                  : "Activate Review"}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Activate / deactivate modal */}
      {showStatusModal && statusTarget && (
        <div className="confirm-overlay" onClick={closeStatusModal}>
          <div
            className="reason-modal modern-reason-modal app-review-status-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Update app review status"
          >
            <button
              type="button"
              className="closes-modal"
              onClick={closeStatusModal}
              disabled={updating}
              aria-label="Close modal"
            >
              <FaTimes />
            </button>

            <div
              className={`reason-icon ${
                nextStatus === "inactive" ? "reject-bg" : "app-review-activate-bg"
              }`}
            >
              {nextStatus === "inactive" ? (
                <FaExclamationTriangle />
              ) : (
                <FaCheckCircle />
              )}
            </div>

            <h3>
              {nextStatus === "active"
                ? "Activate App Review"
                : "Deactivate App Review"}
            </h3>

            <p className="reason-subtitle">
              {nextStatus === "active"
                ? "Are you sure you want to activate this review?"
                : "Please provide a reason for deactivating this review."}
            </p>

            <div className="vendor-info-card">
              <div className="vendor-row">
                <span className="label">Reviewer</span>
                <span className="value">
                  {getReviewerName(statusTarget)}
                </span>
              </div>

              <div className="vendor-row">
                <span className="label">Review ID</span>
                <span className="value">
                  {getReviewId(statusTarget) || "—"}
                </span>
              </div>

              <div className="vendor-row">
                <span className="label">Current Status</span>
                <span className="value">
                  {statusLabel(getStatus(statusTarget))}
                </span>
              </div>

              <div className="vendor-row">
                <span className="label">New Status</span>
                <span className="value">
                  {statusLabel(nextStatus)}
                </span>
              </div>
            </div>

            {nextStatus === "inactive" && (
              <div className="reason-field">
                <label htmlFor="app-review-reason">
                  Reason <span className="app-review-required">*</span>
                </label>
                <textarea
                  id="app-review-reason"
                  className="reason-box reject-reason-box"
                  rows={4}
                  placeholder="Enter reason for deactivating this review..."
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  disabled={updating}
                />
              </div>
            )}

            <div className="confirm-buttons">
              <button
                type="button"
                className="cancels-btn"
                onClick={closeStatusModal}
                disabled={updating}
              >
                Cancel
              </button>

              <button
                type="button"
                className={`approve-btn ${
                  nextStatus === "inactive" ? "rejects-btn" : ""
                }`}
                onClick={updateReviewStatus}
                disabled={updating}
              >
                {updating
                  ? "Updating..."
                  : nextStatus === "active"
                  ? "Confirm Activate"
                  : "Confirm Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppReview;
