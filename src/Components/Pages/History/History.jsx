import * as XLSX from "xlsx";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../Base";

import { toast, ToastContainer } from "react-toastify"
import { BsSearch } from "react-icons/bs";
import { FaRupeeSign } from "react-icons/fa";
import { FiEye } from "react-icons/fi";

const History = () => {
  const [paymentData, setPaymentData] = useState([]);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [previousPage, setPreviousPage] = useState(null);
  const [Nextpage, setNextpage] = useState(null)
  const navigate = useNavigate();
  const tableRef = useRef(null);
  const pagesize = 5;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pagesize);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);



  const getPaymentList = async (page = 1) => {
    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(`${BASE_URL}/payments/payment/?page=${page}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`


        },
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Please login again");
        sessionStorage.removeItem("superadmin_token");
        navigate("/login");
        return;
      }

      const data = await response.json();
      setPaymentData(data.data);
      setNextpage(data.next);
      setPreviousPage(data.previous);
      setCurrentPage(page);
      setTotalCount(data.count);
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


  const STATUS_LABEL_MAP = {
    placed: { label: "Placed", color: "info" },
    confirmed: { label: "Confirmed", color: "success" },
    shipped: { label: "Shipped", color: "primary" },
    out_for_delivery: { label: "Out for Delivery", color: "warning" },
    delivered: { label: "Delivered", color: "success" },
    cancelled: { label: "Cancelled", color: "danger" },
    returned: { label: "Returned", color: "warning" },
    refunded: { label: "Refunded", color: "info" },
    packing: { label: "Packing", color: "primary" },
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



        <div className="vendors-stats stats2-grid">
          <div className="stat2-card">
            <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
              <FaRupeeSign size={24} />
            </div>
            <div className="stat2-info">
              <h3>Total Payment</h3>
              <div className="stat2-value">₹{totalAmount.toFixed(2)}</div>
            </div>
          </div>
          <div className="stat2-card">
            <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
              <FaRupeeSign size={24} />
            </div>
            <div className="stat2-info">
              <h3>Pending Amount</h3>
              <div className="stat2-value">₹{pendingAmount.toFixed(2)}</div>
            </div>
          </div>
          <div className="stat2-card">
            <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
              <FaRupeeSign size={24} />
            </div>
            <div className="stat2-info">
              <h3>Refunded</h3>
              <div className="stat2-value">₹{refundedAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>
        <div className="controls-section">
          <div className="search-wrapper">
            <BsSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
          </div>
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

            <button className="btn-secondary" onClick={exportToExcel}>
              Export Details
            </button>
          </div>
        </div>
      </div>

      <table className="data-table" ref={tableRef}>
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
            Array(3).fill(0).map((_, i) => (
              <tr key={i}>
                <td colSpan="10"><div className="skeleton-row"></div></td>
              </tr>
            ))
          ) : paymentError ? (
            <tr><td colSpan="10" style={{ color: "red" }}>{paymentError}</td></tr>
          ) : paymentData.length === 0 ? (
            <tr><td colSpan="10">No payment records found.</td></tr>
          ) : (
            paymentData.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
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
                <td >
                  <span className={`status-badge ${STATUS_LABEL_MAP[item?.payment_status]?.color || 'secondary'}`}>
                    {STATUS_LABEL_MAP[item?.payment_status]?.label || item?.payment_status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      title="View Details"
                      onClick={() => handleNavigate(item.id)}
                    >
                      <FiEye />
                    </button>

                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="pagination">


          <button
            onClick={() => getPaymentList(currentPage - 1,)}
            disabled={!previousPage}
          >
            Prev
          </button>


          {pages.map((page) => (
            <button
              key={page}
              onClick={() => getPaymentList(page,)}
              style={{

                fontWeight: currentPage === page ? "bold" : "normal",
                background: currentPage === page ? "#0D614E" : "#fff",
                color: currentPage === page ? "#fff" : "#0D614E",
              }}
            >
              {page}
            </button>
          ))}


          <button
            onClick={() => getPaymentList(currentPage + 1,)}
            disabled={!Nextpage}
          >
            Next
          </button>

        </div>
      )}

    </>
  );
};

export default History;
