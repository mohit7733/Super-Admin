
import React, { useEffect, useState } from "react";
import {
  FaTimesCircle,
  FaClipboardList,
  FaCheckCircle,
  FaClock,
  FaTimes,
} from "react-icons/fa";
import { MdEventRepeat, MdClose } from "react-icons/md";
import { BsSearch } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";


const ManagementHistory = () => {
  const navigate = useNavigate();

 

  const [appointmentSearch, setAppointmentSearch] = useState("");

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
const [nextPage, setNextPage] = useState(null);
const [previousPage, setPreviousPage] = useState(null);

const totalPages = Math.ceil(totalCount / pageSize);

  

  

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "-";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatStatus = (status) => {
    if (!status) return "-";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

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

  const getCurrentSlot = (item) => {
    
    if (item?.slot?.length > 0) {
      return item.slot[0];
    }

  
    if (item?.status_history?.length > 0) {
      for (let i = item.status_history.length - 1; i >= 0; i--) {
        const history = item.status_history[i];

     
        if (history?.new_slot) {
          return history.new_slot;
        }

       
        if (history?.slot) {
          return history.slot;
        }
      }
    }

    return null;
  };


  const getLatestHistory = (item) => {
    if (!item?.status_history?.length) {
      return null;
    }

    return item.status_history[item.status_history.length - 1];
  };



  const getConsultationHistory = async (page = 1) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setAppointmentLoading(true);
  setAppointmentError(null);

  try {
    const response = await fetch(
      `${BASE_URL}/doctors/admin/consultation-history/?page=${page}&page_size=${pageSize}`,
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

    if (data.success) {
      setAppointmentData(data.data?.results || []);

      setTotalCount(data.data?.count || 0);

      setNextPage(data.data?.next || null);
      setPreviousPage(data.data?.previous || null);

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
      toast.error(
        data.message || "Failed to fetch consultation history"
      );
    }
  } catch (error) {
    console.error("Consultation History Error:", error);

    setAppointmentError(
      "Something went wrong while fetching consultation history."
    );

    toast.error("Failed to fetch consultation history");
  } finally {
    setAppointmentLoading(false);
  }
};
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

  <div className="order-pagination-buttons">

    {/* PREVIOUS */}
    <button
      className="order-pagination-btn order-pagination-arrow"
      disabled={currentPage === 1 || appointmentLoading}
      onClick={() => {
        const newPage = currentPage - 1;

        setCurrentPage(newPage);

        getConsultationHistory(newPage);
      }}
    >
      ‹
    </button>

   
    {totalPages > 0 && (
      <button
        className={`order-pagination-btn ${
          currentPage === 1
            ? "order-pagination-active"
            : ""
        }`}
        disabled={appointmentLoading}
        onClick={() => {
          setCurrentPage(1);
          getConsultationHistory(1);
        }}
      >
        1
      </button>
    )}


    {currentPage > 3 && (
      <span className="order-pagination-dots">
        ...
      </span>
    )}

   
    {Array.from(
      { length: totalPages },
      (_, index) => index + 1
    )
      .filter((page) => {
        return (
          page !== 1 &&
          page !== totalPages &&
          page >= currentPage - 1 &&
          page <= currentPage + 1
        );
      })
      .map((page) => (
        <button
          key={page}
          className={`order-pagination-btn ${
            currentPage === page
              ? "order-pagination-active"
              : ""
          }`}
          disabled={appointmentLoading}
          onClick={() => {
            setCurrentPage(page);
            getConsultationHistory(page);
          }}
        >
          {page}
        </button>
      ))}

    {/* RIGHT DOTS */}
    {currentPage < totalPages - 2 && (
      <span className="order-pagination-dots">
        ...
      </span>
    )}

    {/* LAST PAGE */}
    {totalPages > 1 && (
      <button
        className={`order-pagination-btn ${
          currentPage === totalPages
            ? "order-pagination-active"
            : ""
        }`}
        disabled={appointmentLoading}
        onClick={() => {
          setCurrentPage(totalPages);
          getConsultationHistory(totalPages);
        }}
      >
        {totalPages}
      </button>
    )}

    {/* NEXT */}
    <button
      className="order-pagination-btn order-pagination-arrow"
      disabled={
        currentPage === totalPages ||
        appointmentLoading
      }
      onClick={() => {
        const newPage = currentPage + 1;

        setCurrentPage(newPage);

        getConsultationHistory(newPage);
      }}
    >
      ›
    </button>

  </div>
</div>

 

  useEffect(() => {
    getConsultationHistory();
  }, []);

 


  const filteredAppointments = appointmentData.filter((item) => {
    const search = appointmentSearch.toLowerCase().trim();

    if (!search) {
      return true;
    }

    return (
      item.patient_name?.toLowerCase().includes(search) ||
      item.doctor_name?.toLowerCase().includes(search) ||
      item.patient_number?.toLowerCase().includes(search) ||
      item.status?.toLowerCase().includes(search)
    );
  });

  /* =========================
     RENDER
  ========================= */

  return (
    <>
      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="page-header">
        <h1>Appointment Management</h1>

        <p className="page-paragraph">
          Manage consultation history, appointment status and
          rescheduling requests.
        </p>
      </div>

      {/* =========================
          STATS
      ========================= */}

      <div className="vendors-stats stats2-grid">

        {/* Total */}
        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaClipboardList size={24} />
          </div>

          <div className="stat2-info">
            <h3>Total Consultations</h3>

            <div className="stat2-value">
              {consultationCounts.total}
            </div>
          </div>
        </div>

        {/* Confirmed */}
        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaClock size={24} />
          </div>

          <div className="stat2-info">
            <h3>Confirmed</h3>

            <div className="stat2-value">
              {consultationCounts.confirmed}
            </div>
          </div>
        </div>

        {/* Rescheduled */}
        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <MdEventRepeat size={25} />
          </div>

          <div className="stat2-info">
            <h3>Rescheduled</h3>

            <div className="stat2-value">
              {consultationCounts.rescheduled}
            </div>
          </div>
        </div>

        {/* Cancelled */}
        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaTimesCircle size={24} />
          </div>

          <div className="stat2-info">
            <h3>Cancelled</h3>

            <div className="stat2-value">
              {consultationCounts.cancelled}
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="controls-section">
        <div className="search-wrapper">
          <BsSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search by patient, doctor, phone or status..."
            value={appointmentSearch}
            onChange={(e) =>
              setAppointmentSearch(e.target.value)
            }
            className="search-input"
          />
        </div>
      </div>

      {/* =========================
          TABLE
      ========================= */}

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
              <th>Last Updated</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {appointmentLoading ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <tr key={index}>
                    <td colSpan="9">
                      <div className="skeleton-row"></div>
                    </td>
                  </tr>
                ))
            ) : appointmentError ? (
              <tr>
                <td
                  colSpan="9"
                  style={{
                    color: "red",
                    textAlign: "center",
                  }}
                >
                  {appointmentError}
                </td>
              </tr>
            ) : filteredAppointments.length > 0 ? (
              filteredAppointments.map((item, index) => {
             

                const slot = getCurrentSlot(item);

               

                const latestHistory =
                  getLatestHistory(item);

                return (
                  <tr key={item.id}>
                  
                    <td>{index + 1}</td>

                  
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
                        ? `${formatTime(
                            slot.start_time
                          )} - ${formatTime(
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
                      {item.updated_at
                        ? formatDate(item.updated_at)
                        : "-"}
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
                  colSpan="9"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No Consultation History Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

  <div className="order-pagination-buttons">

    {/* PREVIOUS */}
    <button
      className="order-pagination-btn order-pagination-arrow"
      disabled={currentPage === 1 || appointmentLoading}
      onClick={() => {
        const newPage = currentPage - 1;

        setCurrentPage(newPage);

        getConsultationHistory(newPage);
      }}
    >
      ‹
    </button>

    {/* FIRST PAGE */}
    {totalPages > 0 && (
      <button
        className={`order-pagination-btn ${
          currentPage === 1
            ? "order-pagination-active"
            : ""
        }`}
        disabled={appointmentLoading}
        onClick={() => {
          setCurrentPage(1);
          getConsultationHistory(1);
        }}
      >
        1
      </button>
    )}

    {/* LEFT DOTS */}
    {currentPage > 3 && (
      <span className="order-pagination-dots">
        ...
      </span>
    )}

    {/* MIDDLE PAGES */}
    {Array.from(
      { length: totalPages },
      (_, index) => index + 1
    )
      .filter((page) => {
        return (
          page !== 1 &&
          page !== totalPages &&
          page >= currentPage - 1 &&
          page <= currentPage + 1
        );
      })
      .map((page) => (
        <button
          key={page}
          className={`order-pagination-btn ${
            currentPage === page
              ? "order-pagination-active"
              : ""
          }`}
          disabled={appointmentLoading}
          onClick={() => {
            setCurrentPage(page);
            getConsultationHistory(page);
          }}
        >
          {page}
        </button>
      ))}

    {/* RIGHT DOTS */}
    {currentPage < totalPages - 2 && (
      <span className="order-pagination-dots">
        ...
      </span>
    )}

    {/* LAST PAGE */}
    {totalPages > 1 && (
      <button
        className={`order-pagination-btn ${
          currentPage === totalPages
            ? "order-pagination-active"
            : ""
        }`}
        disabled={appointmentLoading}
        onClick={() => {
          setCurrentPage(totalPages);
          getConsultationHistory(totalPages);
        }}
      >
        {totalPages}
      </button>
    )}

    {/* NEXT */}
    <button
      className="order-pagination-btn order-pagination-arrow"
      disabled={
        currentPage === totalPages ||
        appointmentLoading
      }
      onClick={() => {
        const newPage = currentPage + 1;

        setCurrentPage(newPage);

        getConsultationHistory(newPage);
      }}
    >
      ›
    </button>

  </div>
</div>
      </div>

   

      <ToastContainer
        position="top-center"
        autoClose={1000}
      />
    </>
  );
};

export default ManagementHistory;