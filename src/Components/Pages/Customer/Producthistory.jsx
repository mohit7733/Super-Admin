import React, { useEffect } from 'react'
import { useState } from 'react';
import { useParams } from "react-router-dom";
import BASE_URL from "../../../Base";
import { FaEye } from 'react-icons/fa';
import OrderModal from "./OrderModal";
import {
  FaShoppingBag,
  FaClock,
  FaCog,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
  FaUndoAlt,
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

const Producthistory = () => {
  const[OrderData,setOrderData]=useState([]);
  const[OrderLoading,setOrderLoading]=useState(false);
  const[OrderError,setError]=useState(null);
   const [totalCount, setTotalCount] = useState(0);
   
   const [OrderStats, setOrderStats] = useState({
       "total": 0,
                "pending": 0,
                "confirmed": 0,
                "completed": 0,
                "cancelled": 0,
                "rescheduled": 0,
                "cancellation_requested": 0,
                "missed":0
    });
      const { customerId } = useParams();
      const [showOrderModal, setShowOrderModal] = useState(false);
const [selectedOrder, setSelectedOrder] = useState(null);


      const pagesize = 5;
        const totalPages = Math.ceil(totalCount / pagesize);
        const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
      
        const [currentpage, setCurrentPage] = useState(1);
          const [Nextpage, setNextpage] = useState(null);
           const [previousPage, setPreviousPage] = useState(null);
   const fetchProductOrders = async (page = 1) => {
    try {
      setOrderLoading(true);

      const token = sessionStorage.getItem("superadmin_token");

      const response = await fetch(
        `${BASE_URL}/customers/admin/customers/?id=${customerId}&type=product&page=${page}`,
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
  setOrderData(data?.data?.product_orders?.results || []);

setOrderStats(data?.data?.stats || {});

setTotalCount(data?.data?.product_orders?.count || 0);
setNextpage(data?.data?.product_orders?.next);
setPreviousPage(data?.data?.product_orders?.previous);
setCurrentPage(data?.data?.product_orders?.page || 1);
      } else {
        toast.error(data.message || "Failed to fetch Product orders");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
     setOrderLoading(false);
    }
  };
  useEffect(()=>{
    fetchProductOrders();
  },[])
  return (
    <>
    
      <div className="consultation-main-card">
        
        
                      <div className="consultation-header">
        
                        <div className="consultation-title-wrap">
        
                          <div className="consultation-line"></div>
        
                          <div>
                            <h2>Product Order History</h2>
        
                            <p>
                              Track all Product activities, all order sataus (shipped,delivery,inprogress)
                           
                            </p>
                          </div>
        
                        </div>
        
                      </div>
        
        
           <div className="vendors-stats stats2-grid">

  <div className="stat2-card">
    <div
      className="stat2-icon"
      style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaShoppingBag size={24} />
    </div>
    <div className="stat2-info">
      <h3>Total Orders</h3>
    
    </div>
  </div>

  
  <div className="stat2-card">
    <div
      className="stat2-icon"
    style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaClock size={24} />
    </div>
    <div className="stat2-info">
      <h3>Pending</h3>
      {/* <div className="stat2-value">{orderStats?.pending || 0}</div> */}
    </div>
  </div>

  {/* Processing */}
  <div className="stat2-card">
    <div
      className="stat2-icon"
     style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaCog size={24} />
    </div>
    <div className="stat2-info">
      <h3>Processing</h3>
      {/* <div className="stat2-value">{orderStats?.processing || 0}</div> */}
    </div>
  </div>

  {/* Shipped */}
  <div className="stat2-card">
    <div
      className="stat2-icon"
 style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaShippingFast size={24} />
    </div>
    <div className="stat2-info">
      <h3>Shipped</h3>
      {/* <div className="stat2-value">{orderStats?.shipped || 0}</div> */}
    </div>
  </div>

  {/* Delivered */}
  <div className="stat2-card">
    <div
      className="stat2-icon"
     style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaCheckCircle size={24} />
    </div>
    <div className="stat2-info">
      <h3>Delivered</h3>
      {/* <div className="stat2-value">{orderStats?.delivered || 0}</div> */}
    </div>
  </div>

  {/* Cancelled */}
  <div className="stat2-card">
    <div
      className="stat2-icon"
     style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaTimesCircle size={24} />
    </div>
    <div className="stat2-info">
      <h3>Cancelled</h3>
      {/* <div className="stat2-value">{orderStats?.cancelled || 0}</div> */}
    </div>
  </div>

  {/* Returned (Optional) */}
  <div className="stat2-card">
    <div
      className="stat2-icon"
     style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaUndoAlt size={24} />
    </div>
    <div className="stat2-info">
      <h3>Returned</h3>
      {/* <div className="stat2-value">{orderStats?.returned || 0}</div> */}
    </div>
  </div>

</div>
                    <div className="table-wrapper1">
  <table className="data-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Order</th>
        <th>Products</th>
        <th>Amount</th>
        <th>Payment</th>
        <th>Status</th>
        <th>Date</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      {OrderLoading ? (
        Array(5)
          .fill()
          .map((_, i) => (
            <tr key={i}>
              <td colSpan="8">
                <div className="skeleton-row"></div>
              </td>
            </tr>
          ))
      ) : OrderData.length > 0 ? (
        OrderData.map((order, index) => (
          <tr key={order.order_id}>
            <td>{index + 1}</td>

            <td>
              <div style={{ fontWeight: 600 }}>
                {order.order_display_code}
              </div>

              <small>{order.items_count} Items</small>
            </td>

   <td className="products-cell">
  {order.items.length > 0 && (
    <div className="product-card">
      <img
        src={order.items[0].cover_image}
        alt={order.items[0].product_name}
        className="product-image"
      />

      <div className="product-content">
        <h5>{order.items[0].product_name}</h5>

        <span className="qty">
          Qty: {order.items[0].quantity}
        </span>

        {order.items.length > 1 && (
          <button className="more-products-btn">
            +{order.items.length - 1} More Products
          </button>
        )}
      </div>
    </div>
  )}
</td>      <td>₹{order.total_amount}</td>

            <td>
              <div>{order.payment_method.toUpperCase()}</div>

              <small>{order.payment_type.toUpperCase()}</small>
            </td>

            <td>
              <span
                className={`status-badge ${order.status.toLowerCase()}`}
              >
                {order.status}
              </span>
            </td>

            <td>
              {new Date(order.date).toLocaleDateString("en-IN")}
            </td>
            
                               <td>
           <button
  className="action-btn edit"
  title="View Order Detail"
  onClick={() => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  }}
>
  <FaEye />
</button>
            </td>
            
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="7" style={{ textAlign: "center" }}>
            No Product Orders Found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
               

                    </div>
    </>
  )
}

export default Producthistory