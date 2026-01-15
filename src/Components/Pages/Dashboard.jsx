import React, { useState, useEffect } from "react";
import WeeklyOrdersChart from "../Charts/WeeklyOrdersChart";
import { FaUsers, FaStore, FaBox, FaUserMd } from "react-icons/fa";
import BASE_URL from "../../Base";
import { useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify"
import { useRef } from "react";



const Dashboard = () => {
  const [customerData, setCustomerData] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(true);
  const [customerError, setCustomerError] = useState(null);

  const [vendorData, setVendorData] = useState([]);
  const [vendorLoading, setVendorLoading] = useState(true);
  const [vendorError, setVendorError] = useState(null);

  const [productData, setProducts] = useState([]);
  const [productLoading, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState(null);

  const [doctorData, setDoctorData] = useState([]);
  const [doctorLoading, setLoadingDoctor] = useState(true);
  const [doctorError, setErrorDoctor] = useState(null);

  const [orderData, setOrderData] = useState([]);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(5);

  const [weekStart, setWeekStart] = useState("sun");
  const [showRevenue, setShowRevenue] = useState(true);
  const [stats, setStats] = useState({
  total_customers: 0,
  active_vendors: 0,
  total_products: 0,
  verified_doctors: 0
});
const [statsLoading, setStatsLoading] = useState(true);
const [statsError, setStatsError] = useState(null);
const navigate = useNavigate();

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orderData.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orderData.length / ordersPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const metrics = [
  { 
    title: "TOTAL CUSTOMERS", 
    value: stats.total_customers, 
    color: "purple", 
    icon: <FaUsers /> 
  },
  { 
    title: "ACTIVE VENDORS", 
    value: stats.active_vendors, 
    color: "red", 
    icon: <FaStore /> 
  },
  { 
    title: "TOTAL PRODUCTS", 
    value: stats.total_products, 
    color: "blue", 
    icon: <FaBox /> 
  },
  { 
    title: "VERIFIED DOCTOR", 
    value: stats.verified_doctors, 
    color: "green", 
    icon: <FaUserMd /> 
  },
];

const statusLabelMap = {
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  refunded: "Refunded",
  packing: "Packing",


};

  const getOrderList = async () => {
  const token = sessionStorage.getItem("superadmin_token");

 

  try {
    const response = await fetch(`${BASE_URL}/orders/order/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }
   

    const data = await response.json();
    setOrderData(data.data || []);
  } catch (err) {
    console.error(err);
    setOrderError("Something went wrong while fetching orders.");
  } finally {
    setOrderLoading(false);
  }
};

const getDashboardStats = async () => {
  const token = sessionStorage.getItem("superadmin_token");

 

  try {
    const response = await fetch(`${BASE_URL}/orders/dashboard/stats/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

   if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }

    const data = await response.json();
    setStats(data || {});
  } catch (err) {
    console.error(err);
    setStatsError("Failed to load dashboard stats");
  } finally {
    setStatsLoading(false);
  }
};

 const apiCalled = useRef(false);

useEffect(() => {
  if (apiCalled.current) return;

  apiCalled.current = true;
  getOrderList();
  getDashboardStats();
}, []);


  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className={`metric-card ${metric.color}`}>
            <div className="metric-content">
              <div className="metric-text">
                <h3>{metric.title}</h3>
                <div className="metric-value">{metric.value}</div>
              </div>
              <div className="metric-icon" style={{ color: "white" }}>
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-card">
        <div className="section-header">
          <h2>Weekly Orders</h2>
          <div className="chart-controls">
            <label htmlFor="weekStartSelect" className="control-label">
              Week starts on
            </label>
            <select
              id="weekStartSelect"
              className="control-select"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
            >
              <option value="sun">Sunday</option>
              <option value="mon">Monday</option>
            </select>

            <label className="toggle-label">
              <input type="checkbox" checked={showRevenue} onChange={(e) => setShowRevenue(e.target.checked)} />
              <span className="toggle-text">Show revenue</span>
            </label>
          </div>
        </div>

        <WeeklyOrdersChart orders={orderData} height={200} weekStart={weekStart} showRevenue={showRevenue} title="Orders by Weekday" />
      </div>

      <div className="recent-orders">
        <div className="section-header">
          <h2>Recent Orders</h2>
        </div>

        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderLoading ? (
                  <tr>
            <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
              <div className="circular-loader"></div>
            </td>
          </tr>
              ) : orderError ? (
                <tr>
                  <td colSpan="5" style={{ color: "red" }}>
                    {orderError}
                  </td>
                </tr>
              ) : currentOrders.length > 0 ? (
                currentOrders.map((order, index) => (
                  <tr key={order.id}>
                    <td>{indexOfFirstOrder + index + 1}</td>
                    <td>{order.customer_name}</td>
                    <td>{order.created_at ? new Date(order.created_at).toISOString().split("T")[0] : ""}</td>
                    <td>
                    {statusLabelMap[order?.order_status] || order?.order_status}
                    </td>
                    <td>₹{order.total_amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No Orders Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {orderData.length > ordersPerPage && (
            <div className="pagination">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button key={number} className={currentPage === number ? "active" : ""} onClick={() => handlePageChange(number)}>
                  {number}
                </button>
              ))}
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>
        <ToastContainer
              position="top-center"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              closeButton
            />
    </div>
    
  );
};

export default Dashboard;
