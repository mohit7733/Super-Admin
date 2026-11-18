
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";

import {
  FaCalendarCheck,
  FaCheckCircle,
  FaSyncAlt,
  FaUserClock,
  FaExclamationTriangle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

const ConsultationOrder = () => {
  const { customerId } = useParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [Error, setError] = useState(null);

  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  const [currentpage, setCurrentPage] = useState(1);
  const [Nextpage, setNextpage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  // Dynamic consultation statistics
  const [AppointmentStats, setAppointmentStats] = useState({
    total_consultations: 0,
    pending: 0,
    confirmed: 0,
    rescheduled: 0,
    patient_reschedule: 0,
    missed: 0,
    cancelled: 0,
    completed: 0,
  });

  // Status badge styling
  const getStatusStyle = (status) => {
    const value = status?.toLowerCase();

    switch (value) {
      case "success":
      case "booked":
      case "completed":
      case "approved":
      case "confirmed":
        return {
          background: "#0D614E20",
          color: "#0D614E",
        };

      case "pending":
      case "processing":
      case "reschedule":
      case "rescheduled":
      case "patient_reschedule":
        return {
          background: "#fef3c7",
          color: "#b45309",
        };

      case "failed":
      case "rejected":
      case "cancelled":
      case "expired":
      case "missed":
      case "cancellation_requested":
        return {
          background: "#fee2e2",
          color: "#dc2626",
        };

      case "refunded":
        return {
          background: "#ede9fe",
          color: "#7c3aed",
        };

      default:
        return {
          background: "#f3f4f6",
          color: "#374151",
        };
    }
  };

  // Fetch consultation orders
  const fetchConsultationOrders = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const token = sessionStorage.getItem("superadmin_token");

      const response = await fetch(
        `${BASE_URL}/customers/admin/customers/?id=${customerId}&type=consultation&page=${page}&page_size=${pageSize}`,
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

      const data = await response.json();

      if (response.ok && data?.success) {
        const consultationData = data?.data?.consultation_orders;
        const stats = data?.data?.stats;

        // Orders
        setOrders(consultationData?.results || []);

        // Dynamic statistics
        setAppointmentStats({
          total_consultations: stats?.total_consultations || 0,
          pending: stats?.pending || 0,
          confirmed: stats?.confirmed || 0,
          rescheduled: stats?.rescheduled || 0,
          patient_reschedule: stats?.patient_reschedule || 0,
          missed: stats?.missed || 0,
          cancelled: stats?.cancelled || 0,
          completed: stats?.completed || 0,
        });

        // Pagination
        setTotalCount(consultationData?.count || 0);
        setNextpage(consultationData?.next);
        setPreviousPage(consultationData?.previous);
        setCurrentPage(page);
      } else {
        setOrders([]);
        setError(data?.message || "Failed to fetch consultation orders");
        toast.error(data?.message || "Failed to fetch consultation orders");
      }
    } catch (error) {
      console.error("Consultation API Error:", error);
      setOrders([]);
      setError("Something went wrong while fetching consultation orders.");
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchConsultationOrders(1);
    }
  }, [customerId]);

  // Format time
  const formatTime = (time) => {
    if (!time) return "-";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination handler
  const handlePageChange = (page) => {
    if (
      page >= 1 &&
      page <= totalPages &&
      page !== currentpage &&
      !loading
    ) {
      fetchConsultationOrders(page);
    }
  };

  // Statistics cards
  const statsCards = [
    {
      title: "Total Consultations",
      value: AppointmentStats.total_consultations,
      icon: <FaCalendarCheck size={15} />,
      background: "#0D614E20",
      color: "#0D614E",
    },
    {
      title: "Pending",
      value: AppointmentStats.pending,
      icon: <FaClock size={15} />,
     background: "#0D614E20",
      color: "#0D614E",
    },
    {
      title: "Confirmed",
      value: AppointmentStats.confirmed,
      icon: <FaCheckCircle size={15} />,
     background: "#0D614E20",
      color: "#0D614E",
    },
    {
      title: "Completed",
      value: AppointmentStats.completed,
      icon: <FaCheckCircle size={15} />,
      background: "#0D614E20",
      color: "#0D614E",
    },
    {
      title: "Rescheduled",
      value: AppointmentStats.rescheduled,
      icon: <FaSyncAlt size={15} />,
   background: "#0D614E20",
      color: "#0D614E",
    },
   
    {
      title: "Missed",
      value: AppointmentStats.missed,
      icon: <FaExclamationTriangle size={15} />,
     background: "#0D614E20",
      color: "#0D614E",
    },
    {
      title: "Cancelled",
      value: AppointmentStats.cancelled,
      icon: <FaTimesCircle size={15} />,
      background: "#fee2e2",
      color: "#dc2626",
    },
  ];

  return (
    <>
      <div className="consultation-main-card">

        {/* Header */}
        <div className="consultation-header">
          <div className="consultation-title-wrap">
            <div className="consultation-line"></div>

            <div>
              <h2>Consultation History</h2>
              <p>Track all consultation activities</p>
            </div>
          </div>
        </div>

        {/* Dynamic Statistics */}
        <div className="vendors-stats stats2-grid">
          {statsCards.map((stat, index) => (
            <div className="stat2-card" key={index}>
              <div
                className="stat2-icon"
                style={{
                  background: stat.background,
                  color: stat.color,
                }}
              >
                {stat.icon}
              </div>

              <div className="stat2-info">
                <h3>{stat.title}</h3>
                <div className="stat2-value">
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Consultation Table */}
        <div className="table-wrapper1">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Doctor Name</th>
                <th>Consultation Fee</th>
                <th>Date</th>
                <th>Time</th>
                <th>Consultation Status</th>
                <th>Payment Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan="7">
                        <div className="skeleton-row"></div>
                      </td>
                    </tr>
                  ))
              ) : Error ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      color: "red",
                    }}
                  >
                    {Error}
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>
                      {(currentpage - 1) * pageSize + index + 1}
                    </td>

                    <td>
                      {item.doctor_name || "-"}
                    </td>

                    <td>
                      ₹{Number(item.amount || 0).toFixed(2)}
                    </td>

                    <td>
                      {item.date || "-"}
                    </td>

                    <td>
                      {formatTime(item.start_time)} -{" "}
                      {formatTime(item.end_time)}
                    </td>

                    <td>
                      <span
                        className="status-badge"
                        style={getStatusStyle(item.status)}
                      >
                        {item.status || "Pending"}
                      </span>
                    </td>

                    <td>
                      <span
                        className="status-badge"
                        style={getStatusStyle(
                          item.payment?.status ||
                          item.payment_status ||
                          "pending"
                        )}
                      >
                        {item.payment?.status ||
                          item.payment_status ||
                          "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No consultation found for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="order-pagination-container">
          <div className="order-pagination-info">
            Showing{" "}
            <strong>
              {totalCount === 0
                ? 0
                : (currentpage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(currentpage * pageSize, totalCount)}
            </strong>{" "}
            of <strong>{totalCount}</strong> consultations
          </div>

          <div className="order-pagination-buttons">
            {/* Previous */}
            <button
              className="order-pagination-btn order-pagination-arrow"
              disabled={!previousPage || loading}
              onClick={() => handlePageChange(currentpage - 1)}
            >
              ‹
            </button>

            {/* First Page */}
            {totalPages > 0 && (
              <button
                className={`order-pagination-btn ${
                  currentpage === 1
                    ? "order-pagination-active"
                    : ""
                }`}
                disabled={loading}
                onClick={() => handlePageChange(1)}
              >
                1
              </button>
            )}

            {/* Left Dots */}
            {currentpage > 3 && (
              <span className="order-pagination-dots">
                ...
              </span>
            )}

            {/* Middle Pages */}
            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            )
              .filter(
                (page) =>
                  page !== 1 &&
                  page !== totalPages &&
                  page >= currentpage - 1 &&
                  page <= currentpage + 1
              )
              .map((page) => (
                <button
                  key={page}
                  className={`order-pagination-btn ${
                    currentpage === page
                      ? "order-pagination-active"
                      : ""
                  }`}
                  disabled={loading}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

            {/* Right Dots */}
            {currentpage < totalPages - 2 && (
              <span className="order-pagination-dots">
                ...
              </span>
            )}

            {/* Last Page */}
            {totalPages > 1 && (
              <button
                className={`order-pagination-btn ${
                  currentpage === totalPages
                    ? "order-pagination-active"
                    : ""
                }`}
                disabled={loading}
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            )}

            {/* Next */}
            <button
              className="order-pagination-btn order-pagination-arrow"
              disabled={!Nextpage || loading}
              onClick={() => handlePageChange(currentpage + 1)}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={3000}
      />
    </>
  );
};

export default ConsultationOrder;