import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaSearch,
  FaSyncAlt,
  FaExclamationCircle,
  FaCircle,
  FaArrowLeft,
  FaTimes,
} from "react-icons/fa";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../../Base";
import "./AllNotification.css";

const NOTIFICATION_API = "/notifications/superadmin";
const UNREAD_COUNT_API = "/notifications/superadmin/unread-count";
const MARK_ALL_READ_API = "/notifications/superadmin/read-all/";

const PAGE_SIZE = 10;

const AllNotification = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [activeTab, setActiveTab] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [unreadCount, setUnreadCount] = useState(0);
  const [priorityCounts, setPriorityCounts] = useState({
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });

  const token = sessionStorage.getItem("superadmin_token");

  const getHeaders = () => ({
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "ngrok-skip-browser-warning": "true",
  });

  const handleUnauthorized = () => {
    sessionStorage.removeItem("superadmin_token");
    navigate("/login");
  };

  // GET UNREAD COUNT
  const fetchUnreadCount = useCallback(async () => {
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}${UNREAD_COUNT_API}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        setUnreadCount(
          Number(result.data?.unread_count || 0)
        );

        setPriorityCounts({
          critical: Number(result.data?.by_priority?.critical || 0),
          high: Number(result.data?.by_priority?.high || 0),
          medium: Number(result.data?.by_priority?.medium || 0),
          low: Number(result.data?.by_priority?.low || 0),
        });
      }
    } catch (error) {
      console.error("Unread Count Error:", error);
    }
  }, [token, navigate]);

  // GET ALL NOTIFICATIONS
  const getNotifications = useCallback(
    async (page = 1, search = "") => {
      if (!token) {
        handleUnauthorized();
        return;
      }

      setLoading(true);
      setError("");

      try {
        const url =
          `${BASE_URL}${NOTIFICATION_API}` +
          `?page=${page}&page_size=${PAGE_SIZE}` +
          `&search=${encodeURIComponent(search)}`;

        const response = await fetch(url, {
          method: "GET",
          headers: getHeaders(),
        });

        if (response.status === 401 || response.status === 403) {
          handleUnauthorized();
          return;
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to fetch notifications"
          );
        }

        const responseData = result.data;

        const notificationData = Array.isArray(responseData)
          ? responseData
          : responseData?.results || [];

        const count = Number(
          responseData?.count ?? result.count ?? notificationData.length
        );

        setNotifications(notificationData);
        setTotalCount(count);
        setTotalPages(
          Math.max(1, Math.ceil(count / PAGE_SIZE))
        );
      } catch (error) {
        console.error("Notification Error:", error);
        setError(error.message || "Something went wrong");

        setNotifications([]);
        setTotalCount(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [token, navigate]
  );

  // INITIAL LOAD
  useEffect(() => {
    getNotifications(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, getNotifications]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // SEARCH DEBOUNCE
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(searchTerm.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // MARK ALL AS READ
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      toast.info("All notifications are already read");
      return;
    }

    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setMarkAllLoading(true);

      const response = await fetch(
        `${BASE_URL}${MARK_ALL_READ_API}`,
        {
          method: "POST",
          headers: getHeaders(),
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Failed to mark all as read"
        );
      }

      toast.success(
        result.message || "All notifications marked as read"
      );

      // Update current page immediately
      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          is_read: true,
        }))
      );

      // Update unread count
      setUnreadCount(0);

      setPriorityCounts({
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      });

      // Refresh latest server data
      await getNotifications(currentPage, debouncedSearch);
      await fetchUnreadCount();
    } catch (error) {
      console.error("Mark All Read Error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setMarkAllLoading(false);
    }
  };

  // REFRESH
  const handleRefresh = async () => {
    await Promise.all([
      getNotifications(currentPage, debouncedSearch),
      fetchUnreadCount(),
    ]);
  };

  // DATE FORMAT
  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "-";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // PRIORITY FORMAT
  const getPriority = (notification) => {
    return (
      notification.priority ||
      notification.level ||
      "medium"
    ).toLowerCase();
  };

  const getPriorityClass = (priority) => {
    const value = priority.toLowerCase();

    if (value === "critical") return "critical";
    if (value === "high") return "high";
    if (value === "medium") return "medium";

    return "low";
  };

  const formatText = (value) => {
    if (!value) return "-";

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // TAB FILTER
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") {
      return item.is_read === false;
    }

    if (activeTab === "read") {
      return item.is_read === true;
    }

    return true;
  });

  // PAGINATION
  const startItem =
    totalCount === 0
      ? 0
      : (currentPage - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(
    currentPage * PAGE_SIZE,
    totalCount
  );

  const getPaginationNumbers = () => {
    const pages = [];

    for (let page = 1; page <= totalPages; page++) {
      if (
        page === 1 ||
        page === totalPages ||
        (page >= currentPage - 1 &&
          page <= currentPage + 1)
      ) {
        pages.push(page);
      }
    }

    return pages.reduce((result, page, index) => {
      if (
        index > 0 &&
        page - pages[index - 1] > 1
      ) {
        result.push("...");
      }

      result.push(page);
      return result;
    }, []);
  };

  return (
    <div className="all-notification-page">

      <ToastContainer
        position="top-right"
        autoClose={2500}
      />

      {/* PAGE HEADER */}
      <div className="all-notification-heading">
        <div className="notification-heading-left">
          <div className="notification-heading-icon">
            <FaBell />
          </div>

          <div>
            <h1>All Notifications</h1>
            <p>
              Manage and track all your superadmin notifications
            </p>
          </div>
        </div>

        <button
          type="button"
          className="notification-refresh-btn"
          onClick={handleRefresh}
          disabled={loading || markAllLoading}
        >
          <FaSyncAlt className={loading ? "rotate-icon" : ""} />
          Refresh
        </button>
      </div>

      {/* STATISTICS */}
      <div className="notification-stats-grid">

        <div className="notification-stat-card">
          <div className="notification-stat-icon total-icon">
            <FaBell />
          </div>
          <div>
            <p>Total Notifications</p>
            <h3>{totalCount}</h3>
          </div>
        </div>

        <div className="notification-stat-card">
          <div className="notification-stat-icon unread-icon">
            <FaExclamationCircle />
          </div>
          <div>
            <p>Unread Notifications</p>
            <h3>{unreadCount}</h3>
          </div>
        </div>

        <div className="notification-stat-card">
          <div className="notification-stat-icon critical-icon">
            <FaCircle />
          </div>
          <div>
            <p>Critical Priority</p>
            <h3>{priorityCounts.critical}</h3>
          </div>
        </div>

        <div className="notification-stat-card">
          <div className="notification-stat-icon high-icon">
            <FaCircle />
          </div>
          <div>
            <p>High Priority</p>
            <h3>{priorityCounts.high}</h3>
          </div>
        </div>

      </div>

      {/* NOTIFICATION CONTENT */}
      <div className="notification-main-card">

        <div className="notification-toolbar">

          <div className="notification-tabs">

            <button
              type="button"
              className={activeTab === "all" ? "active" : ""}
              onClick={() => setActiveTab("all")}
            >
              All
              <span>{totalCount}</span>
            </button>

            <button
              type="button"
              className={activeTab === "unread" ? "active" : ""}
              onClick={() => setActiveTab("unread")}
            >
              Unread
              <span>{unreadCount}</span>
            </button>

            <button
              type="button"
              className={activeTab === "read" ? "active" : ""}
              onClick={() => setActiveTab("read")}
            >
              Read
            </button>

          </div>

          <div className="notification-toolbar-actions">

            {/* <div className="notification-search">
              <FaSearch />

              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div> */}

            <button
              type="button"
              className="mark-all-notification-btn"
              onClick={handleMarkAllAsRead}
              disabled={markAllLoading || unreadCount === 0}
            >
              {markAllLoading ? (
                <span className="notification-button-spinner" />
              ) : (
                <FaCheckDouble />
              )}

              {markAllLoading
                ? "Processing..."
                : "Mark All as Read"}
            </button>

          </div>
        </div>

        {/* TABLE */}
        <div className="all-notification-table-wrapper">

          <table className="all-notification-table">

            <thead>
              <tr>
                <th>#</th>
                <th>Notification</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Date & Time</th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td colSpan="5">
                    <div className="notification-loading">
                      <div className="notification-spinner" />
                      <p>Loading notifications...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5">
                    <div className="notification-empty">
                      <FaExclamationCircle />
                      <h3>Unable to load notifications</h3>
                      <p>{error}</p>

                      <button
                        type="button"
                        onClick={handleRefresh}
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="notification-empty">
                      <FaBell />
                      <h3>No notifications found</h3>
                      <p>
                        {searchTerm
                          ? "Try changing your search."
                          : `There are no ${activeTab} notifications on this page.`}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((item, index) => {
                  const priority = getPriority(item);

                  return (
                    <tr
                      key={item.id}
                      className={!item.is_read ? "notification-unread-row" : ""}
                    >
                      <td>
                        <span className="notification-row-number">
                          {String(
                            (currentPage - 1) * PAGE_SIZE +
                              index +
                              1
                          ).padStart(2, "0")}
                        </span>
                      </td>

                      <td>
                        <div className="notification-table-content">

                          <div className="notification-table-title">
                            {!item.is_read && (
                              <span className="notification-unread-dot" />
                            )}

                            {item.title || "Notification"}
                          </div>

                          <p>
                            {item.message || "-"}
                          </p>

                          {item.type && (
                            <span className="notification-type">
                              {formatText(item.type)}
                            </span>
                          )}

                        </div>
                      </td>

                      <td>
                        <span
                          className={`notification-priority ${getPriorityClass(
                            priority
                          )}`}
                        >
                          {formatText(priority)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`notification-status ${
                            item.is_read ? "read" : "unread"
                          }`}
                        >
                          {item.is_read ? (
                            <>
                              <FaCheck />
                              Read
                            </>
                          ) : (
                            <>
                              <FaCircle />
                              Unread
                            </>
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="notification-date-cell">
                          <span>
                            {formatDate(item.created_at)}
                          </span>
                          <small>
                            {formatTime(item.created_at)}
                          </small>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

            </tbody>
          </table>

        </div>

        {/* PAGINATION */}
        <div className="all-notification-pagination">

          <div className="notification-pagination-info">
            Showing <strong>{startItem}</strong> to{" "}
            <strong>{endItem}</strong> of{" "}
            <strong>{totalCount}</strong> notifications
          </div>

          <div className="notification-pagination-buttons">

            <button
              type="button"
              className="notification-page-arrow"
              disabled={currentPage === 1 || loading}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              ‹
            </button>

            {getPaginationNumbers().map((page, index) => (
              page === "..." ? (
                <span
                  key={`dots-${index}`}
                  className="notification-page-dots"
                >
                  ...
                </span>
              ) : (
                <button
                  type="button"
                  key={page}
                  disabled={loading}
                  className={
                    currentPage === page
                      ? "notification-page-number active"
                      : "notification-page-number"
                  }
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              )
            ))}

            <button
              type="button"
              className="notification-page-arrow"
              disabled={currentPage >= totalPages || loading}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              ›
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AllNotification;