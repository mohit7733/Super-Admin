
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserPlus,
  CheckCircle2,
  Stethoscope,
  Users,
  ShoppingBag,
  CreditCard,
  CalendarCheck,
  XCircle,
  Activity,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";

import BASE_URL from "../../../Base";

const RecentActivities = () => {
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getRecentActivities = useCallback(async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/recent-activities/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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

      if (!response.ok) {
        throw new Error(
          `Failed to fetch activities (${response.status})`
        );
      }

      const result = await response.json();

      if (
        result.status === "success" &&
        Array.isArray(result.data)
      ) {
        const sortedActivities = [...result.data].sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
        );

        setActivities(sortedActivities);
      } else {
        setActivities([]);

        throw new Error(
          result.message || "Failed to fetch recent activities"
        );
      }
    } catch (err) {
      console.error("Recent Activities API Error:", err);

      setError(
        err.message ||
          "Something went wrong while fetching activities"
      );

      toast.error("Failed to fetch recent activities");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    getRecentActivities();
  }, [getRecentActivities]);

  const getActivityIcon = (type) => {
    const iconProps = { size: 13 };

    switch (type) {
      case "consultation_paid":
        return {
          icon: <CreditCard {...iconProps} />,
          color: "green",
        };

      case "appointment_completed":
      case "order_delivered":
        return {
          icon: <CheckCircle2 {...iconProps} />,
          color: "green",
        };

      case "appointment_created":
      case "appointment_booked":
        return {
          icon: <CalendarCheck {...iconProps} />,
          color: "blue",
        };

      case "order_cancelled":
        return {
          icon: <XCircle {...iconProps} />,
          color: "red",
        };

      case "order_created":
      case "order_placed":
        return {
          icon: <ShoppingBag {...iconProps} />,
          color: "blue",
        };

      case "vendor_registered":
      case "vendor_created":
        return {
          icon: <UserPlus {...iconProps} />,
          color: "blue",
        };

      case "doctor_joined":
      case "doctor_registered":
        return {
          icon: <Stethoscope {...iconProps} />,
          color: "blue",
        };

      case "customer_registered":
      case "user_registered":
        return {
          icon: <Users {...iconProps} />,
          color: "blue",
        };

      default:
        return {
          icon: <Activity {...iconProps} />,
          color: "blue",
        };
    }
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "Recently";

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    const diffSeconds = Math.max(
      0,
      Math.floor((Date.now() - date.getTime()) / 1000)
    );

    if (diffSeconds < 60) return "Just now";

    const minutes = Math.floor(diffSeconds / 60);

    if (minutes < 60) {
      return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
      return `${days} day${days === 1 ? "" : "s"} ago`;
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Navigate to the All Activities page
  const handleViewAll = () => {
    navigate("/all-activities");
  };

  const displayedActivities = activities.slice(0, 5);

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Recent Activities</h2>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            type="button"
            className="link-button"
            onClick={getRecentActivities}
            disabled={loading}
            title="Refresh activities"
          >
            <RefreshCw
              size={13}
              style={{
                marginRight: "4px",
                verticalAlign: "middle",
              }}
            />
            Refresh
          </button>

          <button
            type="button"
            className="link-button"
            onClick={handleViewAll}
            disabled={loading}
          >
            View All
          </button>
        </div>
      </div>

      <div className="activity-list">
        {loading ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
            }}
          >
            Loading recent activities...
          </div>
        ) : error ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
            }}
          >
            <p>{error}</p>

            <button
              type="button"
              className="link-button"
              onClick={getRecentActivities}
            >
              Try Again
            </button>
          </div>
        ) : displayedActivities.length === 0 ? (
          <div
            style={{
              padding: "20px",
              textAlign: "center",
            }}
          >
            No recent activities found.
          </div>
        ) : (
          displayedActivities.map((activity, index) => {
            const activityStyle = getActivityIcon(activity.type);

            return (
              <div
                key={
                  activity.ref_id ||
                  `${activity.type}-${activity.timestamp}-${index}`
                }
              >
                <i
                  className={`activity-icon ${activityStyle.color}`}
                >
                  {activityStyle.icon}
                </i>

                <strong>
                  {activity.title || "Activity Update"}

                  <small>
                    {getRelativeTime(activity.timestamp)}
                  </small>

                  {activity.description && (
                    <small
                      style={{
                        display: "block",
                        fontWeight: 400,
                        lineHeight: 1.5,
                        marginTop: "4px",
                        whiteSpace: "normal",
                      }}
                    >
                      {activity.description}
                    </small>
                  )}
                </strong>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default RecentActivities;
