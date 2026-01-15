import * as XLSX from "xlsx";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../Base";
import Order from "./Order";
import { toast, ToastContainer } from "react-toastify"

const History = () => {
  const [paymentData, setPaymentData] = useState([]);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [historyPerPage] = useState(5);
  const [refundForm, setRefundForm] = useState(false);
  const[ImagePaymentModal,setImagepaymentModal]=useState(false)
  const[previewpaymentImage,setPrviewImage]=useState(null)
  const navigate = useNavigate();
  const tableRef = useRef(null);

  const getPaymentList = async () => {
    const token= sessionStorage.getItem("superadmin_token")
  try {
    const response = await fetch(`${BASE_URL}/payments/payment/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
     Authorization : `Bearer ${token}`

       
      },
    });

     if (response.status === 401 || response.status === 403) {
                          toast.error("Session expired. Please login again");
                          sessionStorage.removeItem("superadmin_token");
                          navigate("/login");
                          return;
                      }
         
    const data =await response.json();
    setPaymentData(data)
  }
    catch (err) {
      console.error(err.message);
      setPaymentError("Something went wrong while fetching data.");
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    getPaymentList();
  }, []);


  const filteredData = paymentData.filter((payment) => {
    const matchesSearch =
      !searchTerm ||
      (payment?.customer_name &&
        payment?.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDate =
      !selectedDate ||
      (payment.created_at &&
        new Date(payment.created_at).toISOString().split("T")[0] === selectedDate);
    return matchesSearch && matchesDate;
  });

  const indexOfLastHistory = currentPage * historyPerPage;
  const indexOfFirstHistory = indexOfLastHistory - historyPerPage;
  const currentHistory = filteredData.slice(indexOfFirstHistory, indexOfLastHistory);
  const totalPages = Math.ceil(filteredData?.length / historyPerPage);
  const totalAmount = filteredData.reduce(
    (sum, item) => sum + parseFloat(item.amount || 0),
    0
  );
  const pendingAmount = filteredData
    .filter((item) => item.payment_status === "pending")
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const refundedAmount = filteredData
    .filter((item) => item.payment_status === "Refunded")
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  const handleNavigate = (id) => {
    navigate(`/Items/${id}`);
  };



  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  
  const exportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      alert("No payment data to export!");
      return;
    }

    const exportData = filteredData.map((item) => ({
      "Payment ID": item?.razorpay_order_id || "N/A",
      Customer: item?.customer_name || "N/A",
      Amount: item?.amount || 0,
      Method: item?.payment_method || "N/A",
      Date: item?.created_at ? new Date(item.created_at).toISOString().split("T")[0] : "N/A",
      Status: item?.payment_status || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "payment_history.xlsx");
  };

  return (
    <>
      <div className="page-header">
        <h2>Payment History</h2>

        <div className="order-controls1">
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); 
            }}
            className="search-input1"
          />
          <div className="filter-controls">
            <input
              type="date"
              value={selectedDate}
              className="status-filter"
              onChange={(e) => {
  setSelectedDate(e.target.value);
  setCurrentPage(1);
}}

            />
           
            <button className="export-btn" onClick={exportToExcel}>
              Export Details
            </button>
          </div>
        </div>

        <div className="vendors-stats">
          <div className="stat-card">
            <h3>Total Payment</h3>
            <div className="stat-value">₹{totalAmount.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <h3>Pending Amount</h3>
            <div className="stat-value">₹{pendingAmount.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <h3>Refunded</h3>
            <div className="stat-value">₹{refundedAmount.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <table className="customers-table" ref={tableRef}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Image</th>
            <th>Address</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Date</th>
            <th>Payment</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paymentLoading ? (
               <tr>
            <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
              <div className="circular-loader"></div>
            </td>
          </tr>
          ) : paymentError ? (
            <tr><td colSpan="10" style={{ color: "red" }}>{paymentError}</td></tr>
          ) : currentHistory.length === 0 ? (
            <tr><td colSpan="10">No payment records found.</td></tr>
          ) : (
            currentHistory.map((item, index) => (
              <tr key={item.id}>
                <td>{indexOfFirstHistory + index + 1}</td>
                <td>{item.customer_name || "N/A"}</td>
                <td>
                  {item.order?.items?.length > 1
                    ? `${item.order.items[0]?.product_name || "N/A"} +${item.order.items.length - 1} more`
                    : item.order?.items[0]?.product_name || "N/A"}
                </td>
                <td>
                  {item.order?.items?.length > 0 ? (
                    <div style={{ display: "flex", gap: "5px" }}>
                      <img
                        src={item.order.items[0]?.product_image}
                        alt={item.order.items[0]?.product_name}
                        width="50"
                        height="50"
                      />
                      {item.order.items.length > 1 && (
                        <span style={{ alignSelf: "center", fontSize: "12px" }}>
                          +{item.order.items.length - 1}
                        </span>
                      )}
                    </div>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  {item.order?.delivery_address
                    ? `${item.order.delivery_address.house_details}, ${item.order.delivery_address.city}, ${item.order.delivery_address.state} - ${item.order.delivery_address.pincode}`
                    : "N/A"}
                </td>
                <td>₹{item.amount}</td>
                <td>{item.payment_method}</td>
                <td>
                  {item.created_at
                    ? new Date(item.created_at).toISOString().split("T")[0]
                    : ""}
                </td>
                <td style={{ color: "blue" }}>{item.payment_status || "N/A"}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      title="View Details"
                      onClick={() => handleNavigate(item.id)}
                    >
                      👁
                    </button>
                  
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {filteredData.length > historyPerPage && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              className={currentPage === number ? "active" : ""}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* {refundForm && (
        <div className="modal">
          <form className="customer-form">
            <h3>Refund Form</h3>
            <label>Customer Name:</label>
            <input
              type="text"
              name="first_name"
              placeholder="Enter customer name"
              value={refundFormData.first_name}
              onChange={handleRefundInputChange}
              required
            />
            {refundFormErrors.first_name && <p className="error">{refundFormErrors.first_name}</p>}

            <label>Reason for Refund:</label>
            <textarea
              name="reason"
              placeholder="Enter refund reason"
              value={refundFormData.reason}
              onChange={handleRefundInputChange}
              required
            />
            {refundFormErrors.reason && <p className="error">{refundFormErrors.reason}</p>}

            <div className="form-buttons">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setRefundForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )} */}
    </>
  );
};

export default History;
