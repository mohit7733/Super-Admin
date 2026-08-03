import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import './Allpresciption.css'
import PresciptionModal from "./PresciptionModal";

import {
  FaFileMedical,
  FaEye,
  FaCheckCircle,
  FaPaperPlane,
} from "react-icons/fa";

const AllPrescription= () => {
  const { customerId } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [prescriptions, setPrescriptions] = useState([]);

  const [stats, setStats] = useState({});
  const [statusStats, setStatusStats] = useState({
    sent: 0,
    accepted: 0,
  });

  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 5;
  const totalPages = Math.ceil(totalCount / pageSize);
const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  
  const formatTime = (time) => {
    if (!time) return "-";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const getStatusStyle = (status) => {
  const value = status?.toLowerCase();

  switch (value) {
    
    case "success":
      case "booked":
    case "completed":
    case "approved":
       case "confirmed":
      return {
    background: "#0D614E20", color: "#0D614E" 
      };

  
    case "pending":
    case "processing":  
    case "reschedule":
    case "rescheduled":
  
   
      return {
        background: "#fef3c7",
        color: "#b45309",
      }
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

   
  }
};
  const fetchPrescriptions = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("superadmin_token");

      const response = await fetch(
         `${BASE_URL}/customers/admin/prescriptions/?customer_id=${customerId}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        const prescriptionData =
          data?.data?.prescriptions || {};

        const list = prescriptionData.results || [];

        setPrescriptions(list);

        setStats(data?.data?.stats || {});

        setStatusStats({
          sent: list.filter(
            (item) => item.status === "sent"
          ).length,

          accepted: list.filter(
            (item) => item.status === "accepted"
          ).length,
        });

        setTotalCount(prescriptionData.count || 0);
        setCurrentPage(prescriptionData.page || 1);
        setNextPage(prescriptionData.next);
        setPreviousPage(prescriptionData.previous);
      } else {
        setError(data.message);
        toast.error(data.message);
      }
    } catch (err) {
      console.log(err);
      setError("Something went wrong.");
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const handleViewPrescription = (item) => {
    console.log(item);

  };

  return (
    <>
      <div className="consultation-main-card">

        <div className="consultation-header">
          <div className="consultation-title-wrap">
            <div className="consultation-line"></div>

            <div>
              <h2>Prescription History</h2>
              <p>Track all customer prescriptions.</p>
            </div>
          </div>
        </div>


    

        {/* Table */}

        <div className="table-wrapper1">

          <table className="data-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Prescription Code</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
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

              ) : error ? (

                <tr>
                  <td colSpan="7">{error}</td>
                </tr>

              ) : prescriptions.length > 0 ? (

                prescriptions.map((item, index) => (

                  <tr key={item.id}>

                    <td>{index + 1}</td>

                    <td>{item.prescription_code}</td>

                    <td>{item.doctor_name}</td>

                    <td>{item.appointment_date}</td>

                    <td>
                      {formatTime(item.start_time)} -{" "}
                      {formatTime(item.end_time)}
                    </td>

                    <td>
                      <span
                        className="status-badge"
                        style={getStatusStyle(item.status)}
                      >
                        {item.status}
                      </span>
                    </td>

                   <td>
  <div className="action-buttons">
    <button
  className="action-btn edit"
  title="View Prescription"
 onClick={() => {
  setSelectedPrescription(item);
  setShowModal(true);
}}
>
  <FaEye />
</button>
  </div>
</td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="7">
                    No Prescription Found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {totalPages > 1 && (
          <div className="pagination">

            <button
              disabled={!previousPage}
              onClick={() =>
                fetchPrescriptions(currentPage - 1)
              }
            >
              Prev
            </button>

            {pages.map((page) => (
              <button
                key={page}
                onClick={() =>
                  fetchPrescriptions(page)
                }
                style={{
                  background:
                    currentPage === page
                      ? "#0D614E"
                      : "#fff",
                  color:
                    currentPage === page
                      ? "#fff"
                      : "#0D614E",
                }}
              >
                {page}
              </button>
            ))}

            <button
              disabled={!nextPage}
              onClick={() =>
                fetchPrescriptions(currentPage + 1)
              }
            >
              Next
            </button>

          </div>
        )}

      </div>
<PresciptionModal
  show={showModal}
  prescription={selectedPrescription}
  onClose={() => {
    setShowModal(false);
    setSelectedPrescription(null);
  }}
  onDownload={() => {}}
/>


    

      <ToastContainer />
    </>
  );
};

export default AllPrescription;