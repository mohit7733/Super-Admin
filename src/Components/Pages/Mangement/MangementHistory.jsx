
import React, { useEffect, useState } from "react";
import {
  FaTimesCircle,
  FaClipboardList,
  FaClock,
  FaTimes,
} from "react-icons/fa";
import { MdEventRepeat } from "react-icons/md";
import { BsSearch } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";

const ManagementHistory = () => {
  const navigate = useNavigate();

  // =====================================
  // STATES
  // =====================================

  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [appointmentData, setAppointmentData] = useState([]);
  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentError, setAppointmentError] = useState(null);

  const [consultationCounts, setConsultationCounts] = useState({
    total: 0,
    confirmed: 0,
    rescheduled: 0,
    cancelled: 0,
    completed: 0,
    missed: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);

  // =====================================
  // STATUS OPTIONS
  // =====================================

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Completed", value: "completed" },
    { label: "Reschedule", value: "reschedule" },
    { label: "Rescheduled", value: "rescheduled" },
    {
      label: "Cancellation Requested",
      value: "cancellation_requested",
    },
    { label: "Missed", value: "missed" },
  ];

  // =====================================
  // FORMAT DATE
  // =====================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================
  // FORMAT TIME
  // =====================================

  const formatTime = (time) => {
    if (!time) return "-";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // =====================================
  // FORMAT STATUS
  // =====================================

  const formatStatus = (status) => {
    if (!status) return "-";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // =====================================
  // STATUS STYLE
  // =====================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return {
          color: "#9A6700",
          backgroundColor: "#FFF4CC",
        };

      case "confirmed":
        return {
          color: "#18794E",
          backgroundColor: "#E6F6EE",
        };

      case "cancelled":
        return {
          color: "#C62828",
          backgroundColor: "#FDE8E8",
        };

      case "completed":
        return {
          color: "#1769AA",
          backgroundColor: "#E8F1FB",
        };

      case "reschedule":
        return {
          color: "#7A4E00",
          backgroundColor: "#FFF0D6",
        };

      case "rescheduled":
        return {
          color: "#6B46C1",
          backgroundColor: "#F0EAFE",
        };

      case "cancellation_requested":
        return {
          color: "#B54708",
          backgroundColor: "#FFF0E1",
        };

      case "missed":
        return {
          color: "#8B1E3F",
          backgroundColor: "#FCE7EF",
        };

      default:
        return {
          color: "#555",
          backgroundColor: "#F1F1F1",
        };
    }
  };

  // =====================================
  // GET CURRENT SLOT
  // =====================================

  const getCurrentSlot = (item) => {
    if (item?.slot?.length > 0) {
      return item.slot[0];
    }

    if (item?.status_history?.length > 0) {
      for (let i = item.status_history.length - 1; i >= 0; i--) {
        const history = item.status_history[i];

        if (history?.new_slot) return history.new_slot;
        if (history?.slot) return history.slot;
      }
    }

    return null;
  };

  // =====================================
  // GET LATEST HISTORY
  // =====================================

  const getLatestHistory = (item) => {
    if (!item?.status_history?.length) return null;

    return item.status_history[item.status_history.length - 1];
  };

  // =====================================
  // GET CONSULTATION HISTORY API
  // =====================================

  const getConsultationHistory = async (
    page = 1,
    filters = {}
  ) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setAppointmentLoading(true);
    setAppointmentError(null);

    try {
      const params = new URLSearchParams();

      params.append("page", page);
      params.append("page_size", pageSize);

      // SEARCH
      if (filters.search?.trim()) {
        params.append("search", filters.search.trim());
      }

      // APPOINTMENT DATE
      if (filters.date) {
        params.append("date", filters.date);
      }

      // SLOT START TIME
      if (filters.start_time) {
        params.append("start_time", filters.start_time);
      }

      // STATUS FILTER
      if (filters.status) {
        params.append("status", filters.status);
      }

      const response = await fetch(
        `${BASE_URL}/doctors/admin/consultation-history/?${params.toString()}`,
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

      const data = await response.json();

      if (response.ok && data.success) {
        setAppointmentData(data.data?.results || []);
        setTotalCount(data.data?.count || 0);
        setCurrentPage(page);

        setConsultationCounts(
          data.data?.total_counts || {
            total: 0,
            confirmed: 0,
            rescheduled: 0,
            cancelled: 0,
            completed: 0,
            missed: 0,
          }
        );
      } else {
        setAppointmentData([]);
        setTotalCount(0);

        toast.error(
          data.message || "Failed to fetch consultation history"
        );
      }
    } catch (error) {
      console.error("Consultation History Error:", error);

      setAppointmentError(
        "Something went wrong while fetching consultation history."
      );

      setAppointmentData([]);
      setTotalCount(0);
    } finally {
      setAppointmentLoading(false);
    }
  };

  // =====================================
  // DEBOUNCE SEARCH + FILTERS
  // API CALL AFTER 500ms
  // =====================================

  useEffect(() => {
    const timer = setTimeout(() => {
      getConsultationHistory(1, {
        search: appointmentSearch,
        date: selectedDate,
        start_time: selectedStartTime,
        status: selectedStatus,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    appointmentSearch,
    selectedDate,
    selectedStartTime,
    selectedStatus,
  ]);

  // =====================================
  // CLEAR SEARCH
  // =====================================

  const handleClearSearch = () => {
    setAppointmentSearch("");
  };

  // =====================================
  // CLEAR ALL FILTERS
  // =====================================

  const handleClearFilters = () => {
    setAppointmentSearch("");
    setSelectedDate("");
    setSelectedStartTime("");
    setSelectedStatus("");
  };

  // =====================================
  // PAGINATION
  // =====================================

  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      appointmentLoading
    ) {
      return;
    }

    getConsultationHistory(page, {
      search: appointmentSearch,
      date: selectedDate,
      start_time: selectedStartTime,
      status: selectedStatus,
    });
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <>
      {/* PAGE HEADER */}

      <div className="page-header">
        <h1>Appointment Management</h1>

        <p className="page-paragraph">
          Manage consultation history, appointment status and
          rescheduling requests.
        </p>
      </div>

      {/* =====================================
          STATS
      ===================================== */}

      <div className="vendors-stats stats2-grid">
        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaClipboardList size={12} />
          </div>

          <div className="stat2-info">
            <h3>Total Consultations</h3>
            <div className="stat2-value">
              {consultationCounts.total}
            </div>
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
            <h3>Confirmed</h3>
            <div className="stat2-value">
              {consultationCounts.confirmed}
            </div>
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
            <MdEventRepeat size={12} />
          </div>

          <div className="stat2-info">
            <h3>Rescheduled</h3>
            <div className="stat2-value">
              {consultationCounts.rescheduled}
            </div>
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
            <h3>Cancelled</h3>
            <div className="stat2-value">
              {consultationCounts.cancelled}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================
          SEARCH AND FILTERS
      ===================================== */}

      <div className="filter-category">
        <div className="filter-controls">

          {/* SEARCH */}

          <div className="search-wrapper">
            <BsSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search by patient, doctor or phone..."
              value={appointmentSearch}
              onChange={(e) =>
                setAppointmentSearch(e.target.value)
              }
              className="search-input"
            />

            {appointmentSearch && (
              <button
                type="button"
                className="clear-search"
                onClick={handleClearSearch}
                title="Clear Search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* STATUS FILTER */}

          <select
            className="status-filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>

            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {/* APPOINTMENT DATE */}

          <input
            type="date"
            className="status-filter-select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            title="Filter by Appointment Date"
          />

          {/* SLOT START TIME */}

          <input
            type="time"
            className="status-filter-select"
            value={selectedStartTime}
            onChange={(e) =>
              setSelectedStartTime(e.target.value)
            }
            title="Filter by Slot Start Time"
          />

          {/* CLEAR ALL FILTERS */}

          {(appointmentSearch ||
            selectedStatus ||
            selectedDate ||
            selectedStartTime) && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={handleClearFilters}
              title="Clear All Filters"
              disabled={appointmentLoading}
            >
              <FiTrash2 />
           
            </button>
          )}
        </div>
      </div>

      {/* =====================================
          APPOINTMENT TABLE
      ===================================== */}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Patient Number</th>
              <th>Doctor</th>
              <th>Appointment Date</th>
              <th>Slot</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {appointmentLoading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <tr key={index}>
                    <td colSpan="8">
                      <div className="skeleton-row"></div>
                    </td>
                  </tr>
                ))
            ) : appointmentError ? (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    color: "red",
                    textAlign: "center",
                    padding: "25px",
                  }}
                >
                  {appointmentError}
                </td>
              </tr>
            ) : appointmentData.length > 0 ? (
              appointmentData.map((item, index) => {
                const slot = getCurrentSlot(item);
                const latestHistory = getLatestHistory(item);

                return (
                  <tr key={item.id}>
                    <td>
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    <td>{item.patient_name || "-"}</td>

                    <td>{item.patient_number || "-"}</td>

                    <td>{item.doctor_name || "-"}</td>

                    <td>
                      {slot?.date
                        ? formatDate(slot.date)
                        : "-"}
                    </td>

                    <td>
                      {slot
                        ? `${formatTime(slot.start_time)} - ${formatTime(
                            slot.end_time
                          )}`
                        : "-"}
                    </td>

                    <td>
                      {latestHistory?.reason ||
                        item.notes ||
                        "-"}
                    </td>

                    <td>
                      <span
                        className="status-badge"
                        style={getStatusStyle(item.status)}
                      >
                        {formatStatus(item.status)}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="8"
                  style={{
                    textAlign: "center",
                    padding: "25px",
                  }}
                >
                  No Consultation History Found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* =====================================
            PAGINATION
        ===================================== */}

        <div className="order-pagination-container">
          <div className="order-pagination-info">
            Showing{" "}
            <strong>
              {totalCount === 0
                ? 0
                : (currentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(currentPage * pageSize, totalCount)}
            </strong>{" "}
            of <strong>{totalCount}</strong> consultations
          </div>

          {totalPages > 0 && (
            <div className="order-pagination-buttons">
              <button
                className="order-pagination-btn order-pagination-arrow"
                disabled={currentPage === 1 || appointmentLoading}
                onClick={() =>
                  handlePageChange(currentPage - 1)
                }
              >
                ‹
              </button>

              <button
                className={`order-pagination-btn ${
                  currentPage === 1
                    ? "order-pagination-active"
                    : ""
                }`}
                disabled={appointmentLoading}
                onClick={() => handlePageChange(1)}
              >
                1
              </button>

              {currentPage > 3 && (
                <span className="order-pagination-dots">
                  ...
                </span>
              )}

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              )
                .filter(
                  (page) =>
                    page !== 1 &&
                    page !== totalPages &&
                    page >= currentPage - 1 &&
                    page <= currentPage + 1
                )
                .map((page) => (
                  <button
                    key={page}
                    className={`order-pagination-btn ${
                      currentPage === page
                        ? "order-pagination-active"
                        : ""
                    }`}
                    disabled={appointmentLoading}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}

              {currentPage < totalPages - 2 && (
                <span className="order-pagination-dots">
                  ...
                </span>
              )}

              {totalPages > 1 && (
                <button
                  className={`order-pagination-btn ${
                    currentPage === totalPages
                      ? "order-pagination-active"
                      : ""
                  }`}
                  disabled={appointmentLoading}
                  onClick={() =>
                    handlePageChange(totalPages)
                  }
                >
                  {totalPages}
                </button>
              )}

              <button
                className="order-pagination-btn order-pagination-arrow"
                disabled={
                  currentPage === totalPages ||
                  appointmentLoading
                }
                onClick={() =>
                  handlePageChange(currentPage + 1)
                }
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={1000} />
    </>
  );
};

export default ManagementHistory;
