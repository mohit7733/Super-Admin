import React, { useState, useEffect } from "react";

import { FaUsers, FaStore, FaBox, FaUserMd } from "react-icons/fa";
import BASE_URL from "../../../Base";
import { useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify"
import { useRef } from "react";
import WeeklyOrdersChart from "./WeeklyOrdersChart";
import { apiFetch } from "../../../fetchapi";



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
const[activeType,setActiveType]=useState("product")
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


const paymentstatusLabel ={
pending : "Pending",
success : "Success",
failed : " Failed",
processing :"Processing",
refund :"Refund"

}

const paymentMethodLabel = {
  cash_on_delivery: "Cash on Delivery",
  online: "Online",
  net_banking: "Net Banking",
  upi: "UPI",
  card: "Card",
  wallet: "Wallet",
};

const [productPage, setProductPage] = useState(1);
const [consultationPage, setConsultationPage] = useState(1);

const [nextPage, setNextPage] = useState(null);
const [previousPage, setPreviousPage] = useState(null);
const pagesize = 5;
  const[totalCount,setTotalCount]=useState(0);
const totalPages = Math.ceil(totalCount / pagesize);
const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

 const getOrderList = async (page = 1, type = activeType, search = "") => {
  setOrderLoading(true);
  setOrderError("");

  try {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired! Please login again");
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
    setTotalCount(response?.count)

    if (type === "product") {
      setProductPage(page);
    } else {
      setConsultationPage(page);
    }

  } catch (err) {
    console.error(err);
    setOrderError("Something went wrong while fetching data.");
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

  getDashboardStats();
}, []);

useEffect(() => {
  if (activeType === "product") {
    getOrderList(productPage, "product");
  } else {
    getOrderList(consultationPage, "consultation");
  }
}, [activeType, productPage, consultationPage]);

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
        <div className="filter-buttons">
          <button
          className={activeType === "product"?"active":""}
          onClick={() =>{
            setActiveType("product");
            setProductPage(1);
          }}
          >
Product Orders
          </button>

           <button
    className={activeType === "consultation" ? "active" : ""}
    onClick={() => {
      setActiveType("consultation");
     setConsultationPage(1);
    }}
  >
    Consultation Orders
  </button>
</div>
         
        
         <div className="table-container">
  
  {activeType==="product"&&(
    <table className="order-table">
      <thead>
        <tr>
          <th>Id</th>
          <th>Customer</th>
          <th>Product Name</th>
          <th>Date</th>
          <th>Address</th>
          <th>Amount</th>
          <th>Payment Method</th>
          <th>Payment Status</th>
          <th>Status</th>
        
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
          <tr><td colSpan="9" style={{ color: "red" }}>{orderError}</td></tr>
        ) : orderData.length > 0 ? (
          orderData.map((order, index) => (
            <tr key={order.id}>
              <td>{  index + 1}</td>
              <td>{order?.customer_name}</td>
             
              <td>{order?.items?.map(item=>item.product_name).join(",")}</td>
              <td>{order?.created_at ? new Date(order?.created_at).toISOString().split("T")[0] : ""}</td>
              <td>
                {order?.delivery_address_details?.house_details}, 
                {order?.delivery_address_details?.city}, 
                {order?.delivery_address_details?.pincode}
              </td>
              <td>₹{order?.total_amount}</td>
              <td>{paymentMethodLabel[order?.payment_method] || order?.payment_method}</td>
              <td>{paymentstatusLabel[order?.payment_status] || order?.payment_status}</td>
              <td
                style={{ color: "blue", cursor: "pointer" }}
                
              >
                {statusLabelMap[order?.order_status] || order?.order_status}
              </td>
            
              
            </tr>
          ))
        ) : (
          <tr><td colSpan="9" style={{ textAlign: "center" }}>No Data Found</td></tr>
        )}
      </tbody>
    </table>
  )}

  {activeType==="consultation"&&(
    <table  className="order-table">
      <thead>
        <tr>
          <th>Id</th>
          <th>Doctor</th>
          <th> Specilization</th>
          <th>Date</th>
          <th>Time</th>
          <th>Fee</th>
          <th>Payment Method</th>
          <th>Payment Status</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {orderLoading ? (
          <tr>
            <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
              <div className="circular-loader"></div>
            </td>
          </tr>
        ) : orderError? (
          <tr><td colSpan="9" style={{ color: "red" }}>{orderError}</td></tr>
        ) : orderData?.length > 0 ? (
          orderData.map((order, index) => (
            <tr key={order.id}>
              <td>{ index + 1}</td>
              <td>{order?.doctor_name}</td>
              <td> {order?.doctor_specializations?.join(", ")}</td>
              <td>{order?.consultation_date}</td>
              <td>{order?.consultation_time}</td>
              <td>₹{order?.consultation_fee}</td>
              <td>{order?.payment_method}</td>
              <td>{order?.payment_status}</td>
              <td
                style={{ color: "blue", cursor: "pointer" }}
               
              >
                {order.booking_status}
              </td>
              <td>
                <div className="action-buttons">
    
                  {order.order_status }
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr><td colSpan="9" style={{ textAlign: "center" }}>No Data Found</td></tr>
        )}
      </tbody>
    </table>
  )}

</div>
{totalPages > 1 && (
  <div className="pagination">

    
    <button
      onClick={() =>
        getOrderList(
          (activeType === "product" ? productPage : consultationPage) - 1,
          activeType,
         
        )
      }
      disabled={!previousPage}
    >
      Prev
    </button>

  
    {pages.map((page) => (
      <button
        key={page}
        onClick={() =>
          getOrderList(
            page,
            activeType,
           
          )
        }
        style={{
          fontWeight:
            (activeType === "product" ? productPage : consultationPage) === page
              ? "bold"
              : "normal",
          background:
            (activeType === "product" ? productPage : consultationPage) === page
              ? "#71a33f"
              : "#fff",
          color:
            (activeType === "product" ? productPage : consultationPage) === page
              ? "#fff"
              : "#71a33f",
        }}
      >
        {page}
      </button>
    ))}

    
    <button
      onClick={() =>
        getOrderList(
          (activeType === "product" ? productPage : consultationPage) + 1,
          activeType,
        
        )
      }
      disabled={!nextPage}
    >
      Next
    </button>

  </div>
)}
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
