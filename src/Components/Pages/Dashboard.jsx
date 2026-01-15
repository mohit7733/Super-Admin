import React, { useState, useEffect } from "react";
import WeeklyOrdersChart from "../Charts/WeeklyOrdersChart";
import { FaUsers, FaStore, FaBox, FaUserMd } from "react-icons/fa";
import BASE_URL from "../../Base";

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

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orderData.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orderData.length / ordersPerPage);

    const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);


  // Metrics
  const metrics = [
    { title: "TOTAL CUSTOMERS", value: customerData.length, color: "purple", icon: <FaUsers /> },
    {
      title: "ACTIVE VENDORS",
      value: vendorData.filter((v) => v.is_approved === true).length,
      color: "red",
      icon: <FaStore />,
    },
    { title: "TOTAL PRODUCTS", value: productData.length, color: "blue", icon: <FaBox /> },
    {
      title: "VERIFIED DOCTOR",
      value: doctorData.filter((d) => d.assured_muni).length,
      color: "green",
      icon: <FaUserMd />,
    },
  ];

  const getOrderList = async () => {
    try {
      const response = await fetch(`${BASE_URL}/ecom/order/`);
      const data = await response.json();
      setOrderData(data.data || []);
    } catch (err) {
      console.error(err.message);
      setOrderError("Something went wrong while fetching data.");
    } finally {
      setOrderLoading(false);
    }
  };

  const getCustomerList = async () => {
    try {
      const response = await fetch(`${BASE_URL}/ecom/customer/`);
      const data = await response.json();
      setCustomerData(data.data || []);
    } catch (err) {
      console.error(err.message);
      setCustomerError("Something went wrong while fetching data.");
    } finally {
      setCustomerLoading(false);
    }
  };

  const getVendorList = async () => {
    try {
      const res = await fetch(`${BASE_URL}/ecom/vendor/`);
      const data = await res.json();
      setVendorData(data.data || []);
    } catch (err) {
      console.error(err.message);
      setVendorError("Something went wrong while fetching data.");
    } finally {
      setVendorLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${BASE_URL}/ecom/product/`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err.message);
      setProductError("Something went wrong while fetching data.");
    } finally {
      setLoadingProduct(false);
    }
  };

  const getDoctorList = async () => {
    try {
      const res = await fetch(`${BASE_URL}/ecom/doctor/`);
      const data = await res.json();
      setDoctorData(data.data || []);
    } catch (err) {
      console.error(err.message);
      setErrorDoctor("Something went wrong while fetching data.");
    } finally {
      setLoadingDoctor(false);
    }
  };

  useEffect(() => {
    getOrderList();
    getCustomerList();
    getVendorList();
    fetchProducts();
    getDoctorList();
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
                  <td colSpan="5">Loading Orders...</td>
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
                      <span className={`status-badge ${order.order_status}`}>{order.order_status}</span>
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
    </div>
  );
};

export default Dashboard;
