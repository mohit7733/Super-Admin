
import React, { useState } from "react";
import {
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";


const DoctorDietplans = () => {
    const[DietData,setDietData]=useState([]);
    const[DietLoading,setDietLoading]=useState(false);
    const[DietError,setDietError]=useState(null);

    
  return (
    <>
     

 <div className="consultation-main-card">
    
    
                  <div className="consultation-header">
    
                    <div className="consultation-title-wrap">
    
                      <div className="consultation-line"></div>
    
                      <div>
                        <h2>Diet Plans</h2>
    
                        <p>
                          Track all Diet Plans of doctor
                       
                        </p>
                      </div>
    
                    </div>
    
                  </div>
    
    <div className="stats2-grid">

  <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
    <div
      className="stat2-icon"
      style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaClipboardList size={16} />
    </div>
    <div className="stat2-info">
      <h3>Total Diet Plans</h3>
     
    </div>
  </div>

 
  <div className="stat2-card" style={{ borderTopColor:"#0D614E" }}>
    <div
      className="stat2-icon"
        style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaCheckCircle size={16} />
    </div>
    <div className="stat2-info">
      <h3>Active Plans</h3>
  
    </div>
  </div>

  {/* Inactive Plans */}
  <div className="stat2-card" style={{ borderTopColor:"#0D614E" }}>
    <div
      className="stat2-icon"
     style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaTimesCircle size={16} />
    </div>
    <div className="stat2-info">
      <h3>Inactive Plans</h3>
      {/* <div className="stat2-value">{stats.inactive}</div> */}
    </div>
  </div>
</div>
{/*             
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
        )} */}

                </div>

    </>
  )
}

export default DoctorDietplans