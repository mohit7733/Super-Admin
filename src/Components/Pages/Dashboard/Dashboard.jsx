import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { FaUsers, FaStore, FaBox, FaUserMd, FaSearch, FaFilter, FaDownload, FaEye } from "react-icons/fa";
import { MdRefresh, MdChevronLeft, MdChevronRight } from "react-icons/md";
import BASE_URL from "../../../Base";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import WeeklyOrdersChart from "./WeeklyOrdersChart";
import { apiFetch } from "../../../fetchapi";
import "./Dashboard.css"; // We'll create this

// Constants
const ITEMS_PER_PAGE = 5;
const TOAST_DURATION = 3000;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Status mappings
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

const PAYMENT_STATUS_LABEL = {
  pending: { label: "Pending", color: "warning" },
  success: { label: "Success", color: "success" },
  failed: { label: "Failed", color: "danger" },
  processing: { label: "Processing", color: "info" },
  refund: { label: "Refund", color: "secondary" },
};

const PAYMENT_METHOD_LABEL = {
  cash_on_delivery: "Cash on Delivery",
  online: "Online",
  net_banking: "Net Banking",
  upi: "UPI",
  card: "Card",
  wallet: "Wallet",
};

const Dashboard = () => {
  const navigate = useNavigate();
  
  // State declarations
  const [stats, setStats] = useState({
    total_customers: 0,
    active_vendors: 0,
    total_products: 0,
    verified_doctors: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  
  const [orderData, setOrderData] = useState([]);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  
  const [activeType, setActiveType] = useState("product");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  const [weekStart, setWeekStart] = useState("sun");
  const [showRevenue, setShowRevenue] = useState(true);
  
  const apiCalled = useRef(false);
  const searchTimeoutRef = useRef(null);

  // Memoized metrics
  const metrics = useMemo(() => [
    { 
      title: "TOTAL CUSTOMERS", 
      value: stats.total_customers, 
      color: "purple", 
      icon: <FaUsers />,
      trend: "+12%",
      trendUp: true
    },
    { 
      title: "ACTIVE VENDORS", 
      value: stats.active_vendors, 
      color: "red", 
      icon: <FaStore />,
      trend: "+5%",
      trendUp: true
    },
    { 
      title: "TOTAL PRODUCTS", 
      value: stats.total_products, 
      color: "blue", 
      icon: <FaBox />,
      trend: "+8%",
      trendUp: true
    },
    { 
      title: "VERIFIED DOCTORS", 
      value: stats.verified_doctors, 
      color: "green", 
      icon: <FaUserMd />,
      trend: "+3%",
      trendUp: true
    },
  ], [stats]);

  // Dashboard Stats API Call
  const getDashboardStats = useCallback(async () => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

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
      console.error("Stats fetch error:", err);
      toast.error("Failed to load dashboard statistics");
    } finally {
      setStatsLoading(false);
    }
  }, [navigate]);

  // Orders API Call
  const getOrderList = useCallback(async (page = 1, type = activeType, search = debouncedSearch) => {
    setOrderLoading(true);
    setOrderError(null);

    try {
      const token = sessionStorage.getItem("superadmin_token");
      if (!token) {
        toast.error("Session expired! Please login again");
        navigate("/login");
        return;
      }

      let searchParam = "";
      if (search) {
        if (type === "product") {
          searchParam = `&product_name=${search}`;
        } else {
          searchParam = `&doctor_name=${search}&specialization=${search}`;
        }
      }

      const url = `${BASE_URL}/orders/order/?page=${page}&order_type=${type}${searchParam}`;

      const response = await apiFetch(url, {
        method: "GET",
        headers: { Accept: "application/json" }
      });

      setOrderData(response?.data || []);
      setNextPage(response?.next);
      setPreviousPage(response?.previous);
      setTotalCount(response?.count || 0);

      if (type === "product") {
        setCurrentPage(page);
      }
    } catch (err) {
      console.error("Orders fetch error:", err);
      setOrderError("Failed to load orders. Please try again.");
      toast.error("Failed to load orders");
    } finally {
      setOrderLoading(false);
    }
  }, [activeType, debouncedSearch, navigate]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Initial data load
  useEffect(() => {
    if (apiCalled.current) return;
    apiCalled.current = true;
    getDashboardStats();
  }, [getDashboardStats]);

  // Load orders when dependencies change
  useEffect(() => {
    getOrderList(currentPage, activeType);
  }, [activeType, currentPage, debouncedSearch, getOrderList]);

  // Handlers
  const handleTypeChange = (type) => {
    setActiveType(type);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    getDashboardStats();
    getOrderList(currentPage, activeType);
    toast.info("Refreshing data...");
  };

  const handleExport = () => {
    // Export functionality
    const exportData = orderData.map(order => ({
      ID: order.id,
      Customer: order.customer_name,
      Amount: order.total_amount,
      Status: STATUS_LABEL_MAP[order.order_status]?.label || order.order_status,
      Date: order.created_at?.split("T")[0]
    }));
    
    const csv = convertToCSV(exportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Export started");
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0] || {});
    const csvRows = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ];
    return csvRows.join('\n');
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="dashboard-container">
      <ToastContainer 
        position="top-center"
        autoClose={TOAST_DURATION}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={handleRefresh}>
            <MdRefresh /> Refresh
          </button>
          {/* <button className="export-btn" onClick={handleExport}>
            <FaDownload /> Export
          </button> */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="stat-card skeleton">
              <div className="stat-content">
                <div className="stat-info">
                  <div className="stat-title skeleton-text"></div>
                  <div className="stat-value skeleton-text"></div>
                </div>
                <div className="stat-icon skeleton-icon"></div>
              </div>
            </div>
          ))
        ) : (
          metrics.map((metric, index) => (
            <div key={index} className={`stat-card ${metric.color}`}>
              <div className="stat-content">
                <div className="stat-info">
                  <h3 className="stat-title">{metric.title}</h3>
                  <div className="stat-value">{metric.value?.toLocaleString() || 0}</div>
                  {metric.trend && (
                    <span className={`stat-trend ${metric.trendUp ? 'up' : 'down'}`}>
                      {metric.trend} from last month
                    </span>
                  )}
                </div>
                <div className="stat-icon">{metric.icon}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Weekly Orders Chart */}
      <div className="chart-card">
        <div className="card-header">
          <h2 className="card-title">Weekly Orders Overview</h2>
          <div className="chart-controls">
            <div className="control-group">
              <label htmlFor="weekStartSelect">Week starts on</label>
              <select
                id="weekStartSelect"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
              >
                <option value="sun">Sunday</option>
                <option value="mon">Monday</option>
              </select>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={showRevenue} onChange={(e) => setShowRevenue(e.target.checked)} />
              <span className="toggle-label">Show Revenue</span>
            </label>
          </div>
        </div>
        <WeeklyOrdersChart 
          orders={orderData} 
          height={300} 
          weekStart={weekStart} 
          showRevenue={showRevenue} 
          title="Orders by Weekday" 
        />
      </div>

    
      <div className="orders-card">
        <div className="card-header">
          <div className="header-left-section">
            <h2 className="card-title">Recent Orders</h2>
            <div className="order-type-buttons">
              <button
                className={`type-btn ${activeType === "product" ? "active" : ""}`}
                onClick={() => handleTypeChange("product")}
              >
                Product Orders
                {/* {activeType === "product" && totalCount > 0 && (
                  <span className="badge">{totalCount}</span>
                )} */}
              </button>
              <button
                className={`type-btn ${activeType === "consultation" ? "active" : ""}`}
                onClick={() => handleTypeChange("consultation")}
              >
                Consultation Orders
                {/* {activeType === "consultation" && totalCount > 0 && (
                  <span className="badge">{totalCount}</span>
                )} */}
              </button>
            </div>
          </div>
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={`Search by ${activeType === "product" ? "product name" : "doctor name or specialization"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrapper">
         
          {activeType === "product" && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Product Name</th>
                  <th>Date</th>
                  <th>Address</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                
                </tr>
              </thead>
              <tbody>
                {orderLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="10"><div className="skeleton-row"></div></td>
                    </tr>
                  ))
                ) : orderError ? (
                  <tr>
                    <td colSpan="10" className="error-message">{orderError}</td>
                  </tr>
                ) : orderData.length > 0 ? (
                  orderData.map((order, index) => (
                    <tr key={order.id}>
                      <td>#{index + 1}</td>
                      <td className="customer-name">{order?.customer_name}</td>
                      <td>{order?.items?.map(item => item.product_name).join(", ")}</td>
                      <td>{order?.created_at ? new Date(order?.created_at).toLocaleDateString() : "-"}</td>
                      <td className="address-cell">
                        {order?.delivery_address_details?.city}, {order?.delivery_address_details?.pincode}
                      </td>
                      <td className="amount">₹{order?.total_amount?.toLocaleString()}</td>
                      <td>{PAYMENT_METHOD_LABEL[order?.payment_method] || order?.payment_method}</td>
                      <td>
                        <span className={`status-badge ${PAYMENT_STATUS_LABEL[order?.payment_status]?.color || 'secondary'}`}>
                          {PAYMENT_STATUS_LABEL[order?.payment_status]?.label || order?.payment_status}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${STATUS_LABEL_MAP[order?.order_status]?.color || 'secondary'}`}>
                          {STATUS_LABEL_MAP[order?.order_status]?.label || order?.order_status}
                        </span>
                      </td>
                      <td>
                        {/* <button className="view-btn" onClick={() => navigate(`/order/${order.id}`)}>
                          <FaEye /> View
                        </button> */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="empty-state">
                      <div className="empty-icon">📦</div>
                      <p>No orders found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          
          {activeType === "consultation" && (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Fee</th>
                  <th>Payment Method</th>
                  <th>Payment Status</th>
                  <th>Booking Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orderLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan="10"><div className="skeleton-row"></div></td>
                    </tr>
                  ))
                ) : orderError ? (
                  <tr>
                    <td colSpan="10" className="error-message">{orderError}</td>
                  </tr>
                ) : orderData.length > 0 ? (
                  orderData.map((order, index) => (
                    <tr key={order.id}>
                      <td>#{index + 1}</td>
                      <td className="doctor-name">{order?.doctor_name}</td>
                      <td>{order?.doctor_specializations?.join(", ")}</td>
                      <td>{order?.consultation_date}</td>
                      <td>{order?.consultation_time}</td>
                      <td className="amount">₹{order?.consultation_fee?.toLocaleString()}</td>
                      <td>{PAYMENT_METHOD_LABEL[order?.payment_method] || order?.payment_method}</td>
                      <td>
                        <span className={`status-badge ${PAYMENT_STATUS_LABEL[order?.payment_status]?.color || 'secondary'}`}>
                          {PAYMENT_STATUS_LABEL[order?.payment_status]?.label || order?.payment_status}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${STATUS_LABEL_MAP[order?.booking_status]?.color || 'secondary'}`}>
                          {STATUS_LABEL_MAP[order?.booking_status]?.label || order?.booking_status}
                        </span>
                      </td>
                      <td>
                        <button className="view-btn" onClick={() => navigate(`/consultation/${order.id}`)}>
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="empty-state">
                      <div className="empty-icon">📅</div>
                      <p>No consultations found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        
        {totalPages > 1 && (
          <div className="pagination-wrapper">
            <div className="pagination-info">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} entries
            </div>
            <div className="pagination-controls">
              <button
                className="page-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <MdChevronLeft /> Prev
              </button>
              {pages.slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2)).map(page => (
                <button
                  key={page}
                  className={`page-btn ${currentPage === page ? "active" : ""}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
              <button
                className="page-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next <MdChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;