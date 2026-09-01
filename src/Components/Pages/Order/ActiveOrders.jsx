import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BASE_URL from "../../../Base";
import OrderModal from "../Customer/OrderModal";
import { FaTruck } from "react-icons/fa";




import {
  FaShoppingBag,
  FaClock,
  FaCog,
  FaCheckCircle,
  FaUndoAlt,
  FaWallet,
  FaEye,
   FaCalendarAlt,
   FaTimes,
} from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
const ActiveOrders = () => {
  const orderStats = {
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
    returned: 0,
    refunded: 0,
  };
  const [orderSearch, setOrderSearch] = useState("");
const [orderStatusFilter, setOrderStatusFilter] = useState("All");
const [paymentTypeFilter, setPaymentTypeFilter] = useState("All");
const [dateFilter, setDateFilter] = useState("");
const [sortBy, setSortBy] = useState("newest");
const [orderData, setOrderData] = useState([]);
const [orderLoading, setOrderLoading] = useState(false);
const [orderError, setOrderError] = useState(null);
const [selectedOrder, setSelectedOrder] = useState(null);
const [orderModalOpen, setOrderModalOpen] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [pageSize] = useState(5);
const [totalPages, setTotalPages] = useState(1);
const [totalCount, setTotalCount] = useState(0);
const [debouncedOrderSearch, setDebouncedOrderSearch] = useState("");
const navigate = useNavigate();
const apiStatus =
  orderStatusFilter === "All"
    ? ""
    : orderStatusFilter;

const apiPaymentType =
  paymentTypeFilter === "All"
    ? ""
    : paymentTypeFilter;

const getOrderList = async (
  page = 1,
  search = "",
  status = "",
  paymentType = "",
  fromDate = "",
  toDate = ""
) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session Expired, Login Again");
    navigate("/login");
    return;
  }

  try {
    setOrderLoading(true);
    setOrderError(null);

    const response = await fetch(
      `${BASE_URL}/order/admin/?page=${page}&page_size=${pageSize}` +
        `&status=${encodeURIComponent(status)}` +
        `&search=${encodeURIComponent(search)}` +
        `&payment_type=${encodeURIComponent(paymentType)}` +
        `&from_date=${encodeURIComponent(fromDate)}` +
        `&to_date=${encodeURIComponent(toDate)}`,
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
      toast.error("Session expired, please login again");
      navigate("/login");
      return;
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    setOrderData(data?.data?.results || []);

    const count = Number(data?.data?.count || 0);

    setTotalCount(count);
    setTotalPages(Math.ceil(count / pageSize));
  } catch (error) {
    console.error("Order Fetch Error:", error);

    setOrderError(
      "Something went wrong while fetching orders"
    );

    toast.error("Failed to fetch order data");
  } finally {
    setOrderLoading(false);
  }
};

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedOrderSearch(orderSearch);
    setCurrentPage(1);
  }, 500);

  return () => clearTimeout(timer);
}, [orderSearch]);

useEffect(() => {
  const apiStatus =
    orderStatusFilter === "All"
      ? ""
      : orderStatusFilter;

  const apiPaymentType =
    paymentTypeFilter === "All"
      ? ""
      : paymentTypeFilter;

  getOrderList(
    currentPage,
    debouncedOrderSearch,
    apiStatus,
    apiPaymentType,
    dateFilter,
    dateFilter
  );
}, [
  currentPage,
  debouncedOrderSearch,
  orderStatusFilter,
  paymentTypeFilter,
  dateFilter,
]);
  return (
    <>
   
      <div className="page-header">
        <h1>Order Management</h1>

        <p className="page-paragraph">
          Manage customer orders and track their status, payment methods,
          and order details.
        </p>
      </div>

      
      <div className="stats2-grid">

     
        <div
          className="stat2-card"
          style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaShoppingBag size={16} />
          </div>

          <div className="stat2-info">
            <h3>Total Orders</h3>

            <div className="stat2-value">
              {orderStats.total.toLocaleString()}
            </div>
          </div>
        </div>

       
        <div
          className="stat2-card"
         style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
             style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaClock size={16} />
          </div>

          <div className="stat2-info">
            <h3>Pending Orders</h3>

            <div className="stat2-value">
              {orderStats.pending.toLocaleString()}
            </div>
          </div>
        </div>

      
        <div
          className="stat2-card"
       style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
           style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaCog size={16} />
          </div>

          <div className="stat2-info">
            <h3>Processing</h3>

            <div className="stat2-value">
              {orderStats.processing.toLocaleString()}
            </div>
          </div>
        </div>

      
        <div
          className="stat2-card"
          style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaCheckCircle size={16} />
          </div>

          <div className="stat2-info">
            <h3>Delivered</h3>

            <div className="stat2-value">
              {orderStats.delivered.toLocaleString()}
            </div>
          </div>
        </div>

   
        <div
          className="stat2-card"
        style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaUndoAlt size={16} />
          </div>

          <div className="stat2-info">
            <h3>Returned</h3>

            <div className="stat2-value">
              {orderStats.returned.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Refunded Orders */}
        <div
          className="stat2-card"
        style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
           style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaWallet size={16} />
          </div>

          <div className="stat2-info">
            <h3>Refunded</h3>

            <div className="stat2-value">
              {orderStats.refunded.toLocaleString()}
            </div>
          </div>
        </div>

      </div>

      <div className="controls-section">
<div className="search-wrapper">
  <BsSearch className="search-icon" />

  <input
    type="text"
    placeholder="Search order, customer, email, phone, product or SKU..."
    value={orderSearch}
    onChange={(e) => setOrderSearch(e.target.value)}
    className="search-input"
  />

  {orderSearch && (
    <button
      type="button"
      className="clear-search"
      onClick={() => setOrderSearch("")}
    >
      <FaTimes />
    </button>
  )}
</div>

  <div className="action-buttons">

    
    <select
      className="status-filter"
      value={orderStatusFilter}
      onChange={(e) => setOrderStatusFilter(e.target.value)}
    >
      <option value="All">All Status</option>
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="processing">Processing</option>
      <option value="packed">Packed</option>
      <option value="dispatched">Dispatched</option>
      <option value="shipped">Shipped</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
      <option value="returned">Returned</option>
    </select>

    {/* Payment Type */}
    <select
      className="status-filter"
      value={paymentTypeFilter}
      onChange={(e) => setPaymentTypeFilter(e.target.value)}
    >
      <option value="All">All Payment Types</option>
      <option value="cod">COD</option>
      <option value="prepaid">Prepaid</option>
    </select>

    <div className="date-filter-wrapper">
            {/* <FaCalendarAlt className="date-filter-icon" /> */}
<input
  type="date"
  value={dateFilter}
  onChange={(e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  }}
  className="status-filter date-filter"
/>
          </div>
   
 

  </div>
</div>
<div className="table-wrapper">
  <table className="data-table order-data-table">
  <thead>
    <tr>
      <th>Order ID</th>
      <th>Customer</th>
      <th>Product</th>
      
      <th>Brand</th>
      <th>Items</th>
      <th>Order Date</th>
        <th>Status</th>
      <th>Payment</th>
      
      <th>Amount</th>
    
    
      <th className="action-column">Action</th>
    </tr>
  </thead>

  <tbody>
    {orderLoading ? (
      Array(5)
        .fill(0)
        .map((_, index) => (
          <tr key={index}>
            <td colSpan="10">
              <div className="order-skeleton-row"></div>
            </td>
          </tr>
        ))
    ) : orderError ? (
      <tr>
        <td colSpan="10" className="order-error">
          {orderError}
        </td>
      </tr>
    ) : orderData?.length > 0 ? (
      orderData.map((order,index) => {
        const customer = order?.customer || {};
        const product = order?.items?.[0] || {};

        const initials =
          `${customer?.first_name?.[0] || ""}${customer?.last_name?.[0] || ""}`
            .toUpperCase();

        const orderDate = order?.date
          ? new Date(order.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "N/A";

        const orderTime = order?.date
          ? new Date(order.date).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";

        const status = order?.status || "pending";

        return (
          <tr key={order?.order_id}>

            
         <td>
  <span className="order-id">
    {index + 1}
  </span>
</td>

            <td>
              <div className="order-customer">
                <div className="order-customer-avatar">
                  {initials || "NA"}
                </div>

                <div className="order-customer-info">
                  <span className="order-customer-name">
                    {customer?.full_name || "N/A"}
                  </span>

                  <span className="order-customer-email">
                    {customer?.email || "N/A"}
                  </span>
                </div>
              </div>
            </td>

           
            <td>
              <div className="order-product">
                {product?.cover_image ? (
                  <img
                    src={product.cover_image}
                    alt={product?.product_name || "Product"}
                    className="order-product-image"
                  />
                ) : (
                  <div className="order-product-placeholder">
                    No Image
                  </div>
                )}

                <div className="order-product-info">
                  <span className="order-product-name">
                    {product?.product_name || "N/A"}
                  </span>

                  <span className="order-product-variant">
                    {product?.variant_name || "N/A"}
                  </span>
                </div>
              </div>
            </td>

           
            <td>
              <span className="order-brand">
                {product?.brand_name || "N/A"}
              </span>
            </td>

            {/* ITEMS */}
            <td>
              <span className="order-items">
                {order?.items_count || 0}{" "}
                {order?.items_count === 1 ? "Item" : "Items"}
              </span>
            </td>

            {/* DATE */}
            <td>
              <div className="order-date-info">
                <span className="order-date">
                  {orderDate}
                </span>

                <span className="order-time">
                  {orderTime}
                </span>
              </div>
            </td>
<td>
  <span
    className={`order-status-badge ${status} order-status-clickable`}
    title="View Order Tracking"
    onClick={() => {
      navigate(`/OrderTracking/${order.order_id}`);
    }}
  >
    {status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())}
  </span>
</td>
         
            <td>
              <div className="order-payment-info">
                <span className="order-payment-type">
                  {order?.payment_type === "prepaid"
                    ? "Prepaid"
                    : "COD"}
                </span>

                <span className="order-payment-method">
                  {order?.payment_method
                    ? order.payment_method
                        .replaceAll("_", " ")
                        .replace(/\b\w/g, (char) =>
                          char.toUpperCase()
                        )
                    : "N/A"}
                </span>
              </div>
            </td>
   {/* AMOUNT */}
            <td>
              <span className="order-amount">
                ₹
                {Number(order?.total_amount || 0).toLocaleString(
                  "en-IN"
                )}
              </span>
            </td>

            {/* STATUS */}
          

            {/* ACTION */}
           {/* ACTION */}
<td className="order-action-cell">
  <div className="faqorder">
     <button
    type="button"
    className="order-view-btn"
    title="View Order Details"
    onClick={() => {
      setSelectedOrder(order);
      setOrderModalOpen(true);
    }}
  >
    <FaEye size={14} />
  </button>
  
<button
    type="button"
    className="order-view-btn"
    title="Track Order"
    onClick={() => {
  navigate(`/OrderTracking/${order.order_id}`);
}}
  >
    <FaTruck size={14} />
  </button>
  </div>
 

</td>


          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan="10">
          <div className="order-no-data">
            No orders found
          </div>
        </td>
      </tr>
    )}
  </tbody>
</table>
</div>

<div className="order-pagination-container">

  {/* LEFT - SHOWING INFO */}
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
    of <strong>{totalCount}</strong> orders
  </div>


  <div className="order-pagination-buttons">

 
    <button
      className="order-pagination-btn order-pagination-arrow"
      disabled={currentPage === 1 || orderLoading}
      onClick={() =>
        setCurrentPage((prev) => prev - 1)
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
      disabled={orderLoading}
      onClick={() => setCurrentPage(1)}
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
          disabled={orderLoading}
          onClick={() => setCurrentPage(page)}
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
        disabled={orderLoading}
        onClick={() =>
          setCurrentPage(totalPages)
        }
      >
        {totalPages}
      </button>
    )}

  
    <button
      className="order-pagination-btn order-pagination-arrow"
      disabled={
        currentPage === totalPages ||
        orderLoading
      }
      onClick={() =>
        setCurrentPage((prev) => prev + 1)
      }
    >
      ›
    </button>

  </div>
</div>

{orderModalOpen && selectedOrder && (
  <OrderModal
    order={selectedOrder}
    onClose={() => {
      setOrderModalOpen(false);
      setSelectedOrder(null);
    }}
  />
)}
    </>
  );
};

export default ActiveOrders;