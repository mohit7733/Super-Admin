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
   const [totalCount, setTotalCount] = useState(0);
   const pagesize = 5;
    const totalPages = Math.ceil(totalCount / pagesize);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
    const [currentpage, setCurrentPage] = useState(1);
      const [Nextpage, setNextpage] = useState(null);
       const [previousPage, setPreviousPage] = useState(null);
    
    const [AppointmentStats, setAppointmentStats] = useState({
     "total": 0,
              "pending": 0,
              "confirmed": 0,
              "completed": 0,
              "cancelled": 0,
              "rescheduled": 0,
              "cancellation_requested": 0,
              "missed":0
  });
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
      };

   
   
    

    // Red
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


  const fetchConsultationOrders = async (page = 1) => {
    try {
      setLoading(true);

      const token = sessionStorage.getItem("superadmin_token");

      const response = await fetch(
        `${BASE_URL}/customers/admin/customers/?id=${customerId}&type=consultation&page=${page}`,
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
        setAppointmentStats(
  data?.data?.stats?.consultation_status || {}
);
setTotalCount(data?.data?.consultation_orders?.count || 0);
setNextpage(data?.data?.consultation_orders?.next);
setPreviousPage(data?.data?.consultation_orders?.previous);
setCurrentPage(data?.data?.consultation_orders?.page);
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
          <FaCalendarCheck size={15} />
        </div>
        <div className="stat2-info">
          <h3>Total</h3>
          <div className="stat2-value">{AppointmentStats?.total || 0}</div>
        </div>
      </div>
    
      {/* Confirmed */}
      <div className="stat2-card">
        <div
          className="stat2-icon"
         style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaCheckCircle size={15} />
        </div>
        <div className="stat2-info">
          <h3>Confirmed</h3>
          <div className="stat2-value">{AppointmentStats?.confirmed || 0}</div>
        </div>
      </div>
    
  
      <div className="stat2-card">
        <div
          className="stat2-icon"
      style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaSyncAlt size={15} />
        </div>
        <div className="stat2-info">
          <h3>Rescheduled</h3>
          <div className="stat2-value">{AppointmentStats?.rescheduled || 0}</div>
        </div>
      </div>
   
      <div className="stat2-card">
        <div
          className="stat2-icon"
          style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaExclamationTriangle size={15} />
        </div>
        <div className="stat2-info">
          <h3>Missed</h3>
          <div className="stat2-value">{AppointmentStats?.missed || 0}</div>
        </div>
      </div>
    
      <div className="stat2-card">
        <div
          className="stat2-icon"
         style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaTimesCircle size={15} />
        </div>
        <div className="stat2-info">
          <h3>Cancelled</h3>
          <div className="stat2-value">{AppointmentStats?.cancelled || 0}</div>
        </div>
      </div>
    
      
    
    </div>
                  <div className="table-wrapper1">
                <table className="data-table">
  <thead>
    <tr>
      <th> ID</th>
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
      orders.map((item,index) => (
        <tr key={item.id}>
     <td> {index + 1}</td>
          <td>{item.doctor_name}</td>
            <td>{item.amount ? `₹${item.amount}` : "₹0"}</td>
          <td>{item.date}</td>
          <td>
            {formatTime(item.start_time)} - {formatTime(item.end_time)}
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
  <span
    className="status-badge"
    style={getStatusStyle(
      item.payment?.status || item.payment_status || "pending"
    )}
  >
    {item.payment?.status || item.payment_status || "Pending"}
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
                 {totalPages > 1 && (
          <div className="pagination">


            <button
             onClick={() =>fetchConsultationOrders(currentpage - 1)}
              disabled={!previousPage}
            >
              Prev
            </button>


            {pages.map((page) => (
              <button
                key={page}
                onClick={() => fetchConsultationOrders(page)}
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
              onClick={() =>fetchConsultationOrders(currentpage + 1)}
              disabled={!Nextpage}
            >
              Next
            </button>

          </div>
        )}

                </div>
   

      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
};

export default ConsultationOrder;