
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CreditCard,
  CalendarCheck,
  ShoppingCart,
  XCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Receipt,
  CircleDollarSign,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../../Base";
import "./AllActivities.css";

const PAGE_SIZE = 10;
const API_ENDPOINT = "/user/admin/recent-activities/";

const getActivityIcon = (type = "") => {
  if (type.includes("consultation_paid")) return CreditCard;
  if (type.includes("appointment_completed")) return CalendarCheck;
  if (type.includes("order_cancelled")) return XCircle;
  if (type.includes("order")) return ShoppingCart;
  if (type.includes("payment")) return CircleDollarSign;
  return Activity;
};

const getActivityClass = (type = "") => {
  if (type.includes("consultation_paid")) return "payment";
  if (type.includes("appointment_completed")) return "completed";
  if (type.includes("order_cancelled")) return "cancelled";
  if (type.includes("order")) return "order";
  return "default";
};

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (timestamp) => {
  if (!timestamp) return "N/A";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatActivityType = (type = "") => {
  if (!type) return "General Activity";

  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const AllActivities = () => {
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState(null);
  const [previousUrl, setPreviousUrl] = useState(null);

  const getPageUrl = useCallback((url) => {
    const base = BASE_URL.replace(/\/+$/, "");

    if (!url) {
      return `${base}${API_ENDPOINT}?page=1&page_size=${PAGE_SIZE}`;
    }

    // Keep pagination links on the configured API origin.
    // This also avoids mixed-content issues if the API returns HTTP links.
    try {
      const parsedUrl = new URL(url, `${base}/`);
      return `${base}${parsedUrl.pathname}${parsedUrl.search}`;
    } catch {
      return url;
    }
  }, []);

  const fetchActivities = useCallback(
    async (url = null, isRefresh = false) => {
      const token = sessionStorage.getItem("superadmin_token");

      if (!token) {
        toast.error("Session expired. Please login again");
        navigate("/login");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const requestUrl = getPageUrl(url);

        const response = await fetch(requestUrl, {
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

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            "The server returned a non-JSON response. Please check the API endpoint."
          );
        }

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
          throw new Error(
            result.message || "Failed to fetch recent activities."
          );
        }

        const list = Array.isArray(result.data) ? result.data : [];

        setActivities(list);
        setTotalCount(Number(result.count) || 0);
        setNextUrl(result.next || null);
        setPreviousUrl(result.previous || null);

        // Determine the page from the API's pagination URL.
        const pageUrl = url || requestUrl;
        const parsedUrl = new URL(pageUrl, `${BASE_URL}/`);
        const pageFromUrl = Number(parsedUrl.searchParams.get("page"));

        setCurrentPage(
          Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1
        );
      } catch (err) {
        console.error("Recent Activities API Error:", err);
        setError(err.message || "Something went wrong while fetching activities.");
        setActivities([]);
        toast.error(err.message || "Failed to fetch activities");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getPageUrl, navigate]
  );

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handlePageChange = (url) => {
    if (!url || loading) return;
    fetchActivities(url);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRefresh = () => {
    // Refresh the currently selected page.
    const currentUrl = getPageUrl(
      `${API_ENDPOINT}?page=${currentPage}&page_size=${PAGE_SIZE}`
    );
    fetchActivities(currentUrl, true);
  };

  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalCount);
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="recent-activities-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        theme="colored"
      />

      {/* Page Header */}
      <div className="ra-page-header">
        <div className="ra-heading">
          <div className="ra-heading-icon">
            <Activity size={25} />
          </div>

          <div>
            <h1>Recent Activities</h1>
            <p>Track payments, consultations, orders and other activities.</p>
          </div>
        </div>

        <button
          type="button"
          className="ra-refresh-btn"
          onClick={handleRefresh}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? "ra-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Summary */}
      <div className="ra-summary-grid">
        <div className="ra-summary-card">
          <div className="ra-summary-icon ra-icon-green">
            <Activity size={21} />
          </div>
          <div>
            <span>Total Activities</span>
            <h3>{totalCount.toLocaleString("en-IN")}</h3>
          </div>
        </div>

        <div className="ra-summary-card">
          <div className="ra-summary-icon ra-icon-blue">
            <Receipt size={21} />
          </div>
          <div>
            <span>Activities on This Page</span>
            <h3>{loading ? "—" : activities.length}</h3>
          </div>
        </div>

        <div className="ra-summary-card">
          <div className="ra-summary-icon ra-icon-purple">
            <CalendarCheck size={21} />
          </div>
          <div>
            <span>Current Page</span>
            <h3>{totalCount ? `${currentPage} / ${totalPages}` : "0 / 0"}</h3>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="ra-list-card">
        <div className="ra-list-header">
          <div>
            <h2>Activity Timeline</h2>
            <p>Latest activity records from your platform</p>
          </div>

          <span className="ra-page-size">
            <Clock size={14} />
            {PAGE_SIZE} per page
          </span>
        </div>

        {loading ? (
          <div className="ra-loading-list">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div className="ra-skeleton-row" key={index}>
                <div className="ra-skeleton-icon" />
                <div className="ra-skeleton-content">
                  <div className="ra-skeleton-line ra-line-title" />
                  <div className="ra-skeleton-line ra-line-description" />
                  <div className="ra-skeleton-line ra-line-date" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="ra-state">
            <div className="ra-state-icon ra-error-icon">
              <AlertCircle size={28} />
            </div>
            <h3>Unable to load activities</h3>
            <p>{error}</p>
            <button
              type="button"
              className="ra-primary-btn"
              onClick={() => fetchActivities()}
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="ra-state">
            <div className="ra-state-icon">
              <Activity size={28} />
            </div>
            <h3>No Activities Found</h3>
            <p>There are no activity records to display on this page.</p>
          </div>
        ) : (
          <div className="ra-activity-list">
            {activities.map((item, index) => {
              const Icon = getActivityIcon(item.type);
              const activityClass = getActivityClass(item.type);

              return (
                <div
                  className="ra-activity-item"
                  key={item.ref_id || `${item.timestamp}-${index}`}
                >
                  <div className={`ra-activity-icon ${activityClass}`}>
                    <Icon size={19} />
                  </div>

                  <div className="ra-activity-content">
                    <div className="ra-activity-top">
                      <h3>{item.title || "Activity"}</h3>
                      <span className={`ra-type-badge ${activityClass}`}>
                        {formatActivityType(item.type)}
                      </span>
                    </div>

                    <p className="ra-activity-description">
                      {item.description || "No description available."}
                    </p>

                    <div className="ra-activity-meta">
                      <span>
                        <CalendarCheck size={14} />
                        {formatDate(item.timestamp)}
                      </span>

                      <span>
                        <Clock size={14} />
                        {formatTime(item.timestamp)}
                      </span>

                      {item.entity && (
                        <span className="ra-entity-label">
                          {item.entity.replaceAll("_", " ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalCount > 0 && (
          <div className="ra-pagination">
            <p className="ra-pagination-info">
              Showing <strong>{startItem}</strong>–<strong>{endItem}</strong>{" "}
              of <strong>{totalCount.toLocaleString("en-IN")}</strong> activities
            </p>

            <div className="ra-pagination-controls">
              <button
                type="button"
                className="ra-page-btn"
                disabled={!previousUrl || loading}
                onClick={() => handlePageChange(previousUrl)}
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
                <span>Previous</span>
              </button>

              <span className="ra-page-indicator">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                className="ra-page-btn ra-next-btn"
                disabled={!nextUrl || loading}
                onClick={() => handlePageChange(nextUrl)}
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllActivities;
