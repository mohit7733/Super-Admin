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
} from "react-icons/fa";

const ConsultationOrder = () => {
  const { customerId } = useParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const[Error,setError]=useState(null);

  const fetchConsultationOrders = async () => {
    try {
      setLoading(true);

      const token = sessionStorage.getItem("superadmin_token");

      const response = await fetch(
        `${BASE_URL}/customers/admin/customers/?id=${customerId}&type=consultation`,
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

      if (response.ok) {
        setOrders(data?.data?.consultation_orders?.results || []);
      } else {
        toast.error(data.message || "Failed to fetch consultation orders");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchConsultationOrders();
  },[])

  const formatTime = (time) => {
    if (!time) return "-";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>

      <div className="consultation-main-card">
    
    
                  <div className="consultation-header">
    
                    <div className="consultation-title-wrap">
    
                      <div className="consultation-line"></div>
    
                      <div>
                        <h2>Consultation History</h2>
    
                        <p>
                          Track all consultation activities,
                       
                        </p>
                      </div>
    
                    </div>
    
                  </div>
    
    
             <div className="vendors-stats stats2-grid">
      {/* Total Appointment */}
      <div className="stat2-card">
        <div
          className="stat2-icon"
          style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaCalendarCheck size={24} />
        </div>
        <div className="stat2-info">
          <h3>Appointment</h3>
          {/* <div className="stat2-value">{AppointmentStats?.total || 0}</div> */}
        </div>
      </div>
    
      {/* Confirmed */}
      <div className="stat2-card">
        <div
          className="stat2-icon"
         style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaCheckCircle size={24} />
        </div>
        <div className="stat2-info">
          <h3>Confirmed</h3>
          {/* <div className="stat2-value">{AppointmentStats?.confirmed || 0}</div> */}
        </div>
      </div>
    
      {/* Cancelled */}
      
    
      {/* Rescheduled */}
      <div className="stat2-card">
        <div
          className="stat2-icon"
      style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaSyncAlt size={24} />
        </div>
        <div className="stat2-info">
          <h3>Rescheduled</h3>
          {/* <div className="stat2-value">{AppointmentStats?.rescheduled || 0}</div> */}
        </div>
      </div>
      <div className="stat2-card">
        <div
          className="stat2-icon"
         style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaUserClock size={24} />
        </div>
        <div className="stat2-info">
          <h3>Patient Reschedule</h3>
          {/* <div className="stat2-value">
                 {AppointmentStats?.patient_rescheduled || 0}
          </div> */}
        </div>
      </div>
      <div className="stat2-card">
        <div
          className="stat2-icon"
          style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaExclamationTriangle size={24} />
        </div>
        <div className="stat2-info">
          <h3>Missed</h3>
          {/* <div className="stat2-value">{AppointmentStats?.missed || 0}</div> */}
        </div>
      </div>
    
      <div className="stat2-card">
        <div
          className="stat2-icon"
         style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaTimesCircle size={24} />
        </div>
        <div className="stat2-info">
          <h3>Cancelled</h3>
          {/* <div className="stat2-value">{AppointmentStats?.cancelled || 0}</div> */}
        </div>
      </div>
    
      
    
    </div>
                  <div classsName="table-wrapper1">
                <table className="data-table">
  <thead>
    <tr>
      <th>Order ID</th>
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
    ) : Error? (
      <tr>
        <td colSpan="7" style={{ textAlign: "center", color: "red" }}>
          {Error}
        </td>
      </tr>
    ) : orders.length > 0 ? (
      orders.map((item) => (
        <tr key={item.id}>
          <td>{item.id.slice(0, 8)}...</td>
          <td>{item.doctor_name}</td>
          <td>₹{item.amount}</td>
          <td>{item.date}</td>
          <td>
            {formatTime(item.start_time)} - {formatTime(item.end_time)}
          </td>
          <td>
            <span className={`status-badge ${item.status?.toLowerCase()}`}>
              {item.status}
            </span>
          </td>
          <td>
            <span
              className={`status-badge ${item.payment_status?.toLowerCase()}`}
            >
              {item.payment_status}
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
{/*     
                   {totalPages > 1 && (
              <div className="pagination">
    
    
                <button
                 onClick={() => getConsultationhistory(currentpage - 1)}
                  disabled={!previousPage}
                >
                  Prev
                </button>
    
    
                {pages.map((page) => (
                  <button
                    key={page}
                    onClick={() => getConsultationhistory(page)}
                    style={{
    
                      fontWeight: currentpage === page ? "bold" : "normal",
                      background: currentpage === page ? "#0D614E" : "#fff",
                      color: currentpage === page ? "#fff" : "#0D614E",
                    }}
                  >
                    {page}
                  </button>
                ))}
    
    
                <button
                  onClick={() => getConsultationhistory(currentpage + 1)}
                  disabled={!Nextpage}
                >
                  Next
                </button>
    
              </div>
            )}
     */}
    
                </div>
      {/* <div className="table-wrapper1">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Doctor Name</th>
              <th>Consultation Fee</th>
              <th>Date</th>
              <th>Time</th>
              <th>Booking Status</th>
              <th>Payment Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : orders.length > 0 ? (
              orders.map((item) => (
                <tr key={item.id}>
                  <td>{item.id.slice(0, 8)}...</td>
                  <td>{item.doctor_name}</td>
                  <td>₹{item.amount}</td>
                  <td>{item.date}</td>
                  <td>
                    {formatTime(item.start_time)} -{" "}
                    {formatTime(item.end_time)}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${item.status?.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${item.payment_status?.toLowerCase()}`}
                    >
                      {item.payment_status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No consultation orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div> */}

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default ConsultationOrder;