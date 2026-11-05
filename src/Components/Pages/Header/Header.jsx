
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../Base";
import "./Header.css";

const NOTIFICATION_API = "/notifications/superadmin";

const Header = ({ sidebarCollapsed, setSidebarCollapsed }) => {
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");
const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  const token = sessionStorage.getItem("superadmin_token");
const UNREAD_COUNT_API =
  "/notifications/superadmin/unread-count";

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
const fetchUnreadCount = async () => {
  try {
    const response = await fetch(
      `${BASE_URL}${UNREAD_COUNT_API}`,
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
      navigate("/login");
      return;
    }

    const result = await response.json();

    if (response.ok && result.success) {
      setUnreadCount(result.data.unread_count || 0);
    }
  } catch (error) {
    console.error("Unread notification error:", error);
  }
};
  
  const fetchNotifications = async () => {
    if (!token) {
      handleUnauthorized();
      return;
    }

    try {
      setLoadingNotifications(true);
      setNotificationError("");

      const response = await fetch(`${BASE_URL}${NOTIFICATION_API}`, {
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
          result.message || "Unable to fetch notifications."
        );
      }

      setNotifications(result?.data?.results || []);
    } catch (error) {
      console.error("Notification API error:", error);
      setNotificationError(error.message || "Something went wrong.");
    } finally {
      setLoadingNotifications(false);
    }
  };

 
  useEffect(() => {
    fetchNotifications();
      fetchUnreadCount();
  }, []);

 
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);

    if (nextState) {
      fetchNotifications();
    }
  };

  const markAsRead = (id) => {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification
      )
    );
  };


  const formatNotificationTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "";

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`head1 ${
        sidebarCollapsed ? "collapsed" : "expanded"
      }`}
    >
      <div className="header-left">
        <button
          className="sidebar-toggle"
          onClick={handleToggleSidebar}
          type="button"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <div className="header-right">
        <div
          className="notification-wrapper"
          ref={notificationRef}
        >
          <button
            className="notification-icon"
            onClick={toggleNotifications}
            type="button"
            aria-label="Notifications"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-modal">
              <div className="notification-header">
                <div>
                  <h3>Notifications</h3>
                  <span className="notification-subtitle">
                    {unreadCount} unread notifications
                  </span>
                </div>

                <button
                  className="close-modal"
                  type="button"
                  onClick={() => setShowNotifications(false)}
                >
                  ✕
                </button>
              </div>

              <div className="notification-list">
                {loadingNotifications ? (
                  <div className="empty-notifications">
                    Loading notifications...
                  </div>
                ) : notificationError ? (
                  <div className="empty-notifications">
                    <p>{notificationError}</p>

                    <button
                      type="button"
                      className="action-btn"
                      onClick={fetchNotifications}
                    >
                      Retry
                    </button>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="empty-notifications">
                    No notifications found
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${
                        !notification.is_read ? "unread" : ""
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="notification-dot" />

                      <div className="notification-content">
                        <div className="notification-title">
                          {notification.title || "Notification"}
                        </div>

                        <div className="notification-message">
                          {notification.message || ""}
                        </div>


                        <div className="notification-time">
                          {formatNotificationTime(
                            notification.created_at
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>


              <div className="notification-footer">
  <button
    type="button"
    className="view-all"
    onClick={() => {
      setShowNotifications(false);
      navigate("/all-notifications");
    }}
  >
    All Notifications →
  </button>
</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
