import React, { useState ,useEffect} from "react";
import {
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaUndoAlt,
  FaWallet,
} from "react-icons/fa";
import BASE_URL from "../../../Base";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CustomerTransaction = () => {
  const[TransactionData,setTransactionData]=useState([]);
  const[TransactionError,setTransactionError]=useState(null);
  const[TransactionLoading,setTransactionLoading]=useState(false);
    const { customerId } = useParams();
      const pagesize = 5;
      const [totalCount, setTotalCount] = useState(0);
      const totalPages = Math.ceil(totalCount / pagesize);
      const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    
      const [currentpage, setCurrentPage] = useState(1);
      const [Nextpage, setNextpage] = useState(null);
    
      const [previousPage, setPreviousPage] = useState(null);
    
const navigate = useNavigate();
const getTransactionlist = async (page = 1) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session Expired , Login Again")
      navigate("/login");
    }

    try {
      setTransactionLoading(true);

      const response = await fetch(
     `${BASE_URL}/payments/admin/transactions/?customer_id=${customerId}&type=all`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Category API Response:", data);


      setTransactionData(data.data.results);
    } catch (error) {
      console.error(error.message);

      setTransactionError("Something went wrong while fetching categories");

      toast.error("Failed to fetch Category Data");
    } finally {
      setTransactionLoading(false);
    }
  };

  useEffect(()=>{
    getTransactionlist();
  },[])
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


  return (
    <>
     <div className="transaction-main-card">
    
    
       <div className="transaction-header">
    
      <div className="transaction-header-top">
        <div className="transaction-title-wrap">
          <div>
            <h2>Transaction History</h2>
            <p>Track all payment activities for Consultation and Orders</p>
          </div>
        </div>
    
      
      </div>
    
     
    
    </div>
       
    
       
    
     <div className="vendors-stats stats2-grid">
    
      {/* Pending */}
      <div className="stat2-card">
        <div
          className="stat2-icon"
           style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaClock size={16} />
        </div>
    
        <div className="stat2-info">
          <h3>Pending</h3>
          {/* <div className="stat2-value">{TransactionStats?.pending || 0}</div> */}
          {/* <p>₹ {TransactionStats?.pending_amount || 0}</p> */}
        </div>
      </div>
    
      {/* Success */}
      <div className="stat2-card">
        <div
          className="stat2-icon"
       style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaCheckCircle size={16} />
        </div>
    
        <div className="stat2-info">
          <h3>Success</h3>
          {/* <div className="stat2-value">{TransactionStats?.success || 0}</div> */}
          {/* <p>₹ {TransactionStats?.success_amount || 0}</p> */}
        </div>
      </div>
    
      {/* Failed */}
      <div className="stat2-card">
        <div
          className="stat2-icon"
          style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaTimesCircle size={16} />
        </div>
    
        <div className="stat2-info">
          <h3>Failed</h3>
          {/* <div className="stat2-value">{TransactionStats?.failed || 0}</div> */}
          {/* <p>₹ {TransactionStats?.failed_amount || 0}</p> */}
        </div>
      </div>
    
      {/* Refunded */}
      <div className="stat2-card">
        <div
          className="stat2-icon"
           style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaUndoAlt size={16} />
        </div>
    
        <div className="stat2-info">
          <h3>Refunded</h3>
          {/* <div className="stat2-value">{TransactionStats?.refunded || 0}</div>
          <p>₹ {TransactionStats?.refunded_amount || 0}</p> */}
        </div>
      </div>
    
      {/* Total Revenue */}
      <div className="stat2-card">
        <div
          className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
        >
          <FaWallet size={16} />
        </div>
    
        <div className="stat2-info">
          <h3>Total Revenue</h3>

        </div>
      </div>
    
    </div>
    
        {/* Filters */}
    
      
        
    
        <div className="table-wrapper">
    
          <table className="data-table">
    
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Patient Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>
    
            {TransactionLoading ? (
    
              Array(4).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan="7">
                    <div className="transaction-skeleton-row"></div>
                  </td>
                </tr>
              ))
    
            ) : TransactionError ? (
    
              <tbody>
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      textAlign: "center",
                      color: "red"
                    }}
                  >
                    {TransactionError}
                  </td>
                </tr>
              </tbody>
    
            ) : (
    
              <tbody>
    
                {TransactionData && TransactionData.length > 0 ? (
    
                  TransactionData.map((transaction) => (
    
                    <tr key={transaction.id}>
    
                     <td>{transaction.transaction_id}</td>

<td>
  <span
    className={`transaction-type ${
      transaction.type?.toLowerCase() === "order"
        ? "order"
        : "consultation"
    }`}
  >
    {transaction.type || "Consultation"}
  </span>
</td>

<td>
  {transaction.customer_name ||
    transaction.patient_name ||
    "N/A"}
</td>

<td>₹ {transaction.amount || 0}</td>

<td>{transaction.date || "N/A"}</td>

<td>
  {transaction.payment_method || "N/A"}
</td>

<td>
  <span
    className="transaction-status-badge"
    style={getStatusStyle(transaction.status)}
  >
    {transaction.status || "N/A"}
  </span>
</td>
    
                    </tr>
    
                  ))
    
                ) : (
    
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        textAlign: "center",
                        padding: "40px"
                      }}
                    >
                      No Transaction Found
                    </td>
                  </tr>
    
                )}
    
              </tbody>
    
            )}
    
          </table>

          {totalPages > 1 && (
          <div className="pagination">


            <button
             onClick={() => getTransactionlist(currentpage - 1)}
              disabled={!previousPage}
            >
              Prev
            </button>


            {pages.map((page) => (
              <button
                key={page}
                onClick={() => getTransactionlist(page)}
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
              onClick={() => getTransactionlist(currentpage + 1)}
              disabled={!Nextpage}
            >
              Next
            </button>

          </div>
        )}
    
        </div>
    
      </div>
    
    </>
  )
}

export default CustomerTransaction;