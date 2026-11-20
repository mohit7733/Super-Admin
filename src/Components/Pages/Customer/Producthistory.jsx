
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import BASE_URL from "../../../Base";
import {
  FaEye,
  FaShoppingBag,
  FaClock,
  FaCog,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
  FaUndoAlt,
  FaClipboardCheck,
} from "react-icons/fa";
import { toast } from "react-toastify";
import OrderModal from "./OrderModal";

const Producthistory = () => {
  const { customerId } = useParams();

  const [OrderData, setOrderData] = useState([]);
  const [OrderLoading, setOrderLoading] = useState(false);

  const [totalCount, setTotalCount] = useState(0);

  const [OrderStats, setOrderStats] = useState({
    total_orders: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
  });

  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const pageSize = 10;

  const [currentpage, setCurrentPage] = useState(1);
  const [Nextpage, setNextpage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  
  const getStatusStyle = (status) => {
    const value = status?.toLowerCase();

    switch (value) {
      case "success":
      case "booked":
      case "completed":
      case "approved":
      case "confirmed":
      case "delivered":
        return {
          background: "#0D614E20",
          color: "#0D614E",
        };

      case "pending":
      
      case "shipped":
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

      case "returned":
        return {
          background: "#fff7ed",
          color: "#c2410c",
        };

      case "refunded":
        return {
          background: "#ede9fe",
          color: "#7c3aed",
        };

      default:
        return {
          background: "#f3f4f6",
          color: "#374151",
        };
    }
  };

  // FETCH PRODUCT ORDERS
  const fetchProductOrders = async (page = 1) => {
    try {
      setOrderLoading(true);

      const token = sessionStorage.getItem("superadmin_token");

      const response = await fetch(
        `${BASE_URL}/customers/admin/customers/?id=${customerId}&type=product&page=${page}&page_size=${pageSize}`,
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
        const productOrders = data?.data?.product_orders;

        setOrderData(productOrders?.results || []);

        // All API stats
        setOrderStats({
          total_orders: data?.data?.stats?.total_orders || 0,
          pending: data?.data?.stats?.pending || 0,
          confirmed: data?.data?.stats?.confirmed || 0,
          processing: data?.data?.stats?.processing || 0,
          shipped: data?.data?.stats?.shipped || 0,
          delivered: data?.data?.stats?.delivered || 0,
          cancelled: data?.data?.stats?.cancelled || 0,
          returned: data?.data?.stats?.returned || 0,
        });

        setTotalCount(productOrders?.count || 0);
        setNextpage(productOrders?.next ?? null);
        setPreviousPage(productOrders?.previous ?? null);
        setCurrentPage(page);
      } else {
        toast.error(data?.message || "Failed to fetch Product orders");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    fetchProductOrders(1);
  }, [customerId]);

  // STATS CARDS
  const statsCards = [
    {
      title: "Total Orders",
      value: OrderStats.total_orders,
      icon: <FaShoppingBag size={16} />,
      background: "#0D614E20",
      color: "#0D614E",
    },
    {
      title: "Pending",
      value: OrderStats.pending,
      icon: <FaClock size={16} />,
     background: "#0D614E20",
      color: "#0D614E",
    },
    {
      title: "Confirmed",
      value: OrderStats.confirmed,
      icon: <FaClipboardCheck size={16} />,
     background: "#0D614E20",
      color: "#0D614E",
    },
   
    {
      title: "Shipped",
      value: OrderStats.shipped,
      icon: <FaShippingFast size={16} />,
     background: "#0D614E20",
      color: "#0D614E",
    },
    {
      title: "Delivered",
      value: OrderStats.delivered,
      icon: <FaCheckCircle size={16} />,
    background: "#0D614E20",
      color: "#0D614E",
    },
    {
      title: "Cancelled",
      value: OrderStats.cancelled,
      icon: <FaTimesCircle size={16} />,
      background: "#fee2e2",
      color: "#dc2626",
    },
    {
      title: "Returned",
      value: OrderStats.returned,
      icon: <FaUndoAlt size={16} />,
      background: "#ffedd5",
      color: "#c2410c",
    },
  ];

  return (
    <>
      <div className="consultation-main-card">

        <div className="consultation-header">
          <div className="consultation-title-wrap">
            <div className="consultation-line"></div>

            <div>
              <h2>Product Order History</h2>
              <p>
                Track all product activities and order statuses
              </p>
            </div>
          </div>
        </div>

       {/* ALL ORDER STATS */}
<div className="stats-scroll">
  <div className="vendors-stats stats2-grid">
    {statsCards.map((stat, index) => (
      <div className="stat2-card" key={index}>
        <div
          className="stat2-icon"
          style={{
            background: stat.background,
            color: stat.color,
          }}
        >
          {stat.icon}
        </div>

        <div className="stat2-info">
          <h3>{stat.title}</h3>
          <div className="stat2-value">
            {stat.value}
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

        {/* ORDERS TABLE */}
        <div className="table-wrapper">
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
                    <td>
                      {(currentpage - 1) * pageSize + index + 1}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600 }}>
                        {order.order_display_code || order.order_code}
                      </div>
                      <small>
                        {order.items_count} Items
                      </small>
                    </td>

                  <td className="products-cell">
  {order.items?.length > 0 && (
    <div className="product-card">
      <img
        src={order.items[0].cover_image}
        alt={order.items[0].product_name}
        className="product-image"
      />

      <div className="product-content">
        <h5>
          {order.items[0].product_name}
        </h5>

        <span className="qty">
          Qty: {order.items[0].quantity}
        </span>

        {order.items.length > 1 && (
          <span className="more-products-btn">
            +{order.items.length - 1} More Products
          </span>
        )}
      </div>
    </div>
  )}
</td>

                    <td>
                      ₹{Number(order.total_amount || 0).toFixed(2)}
                    </td>

                    <td>
                      <div>
                        {order.payment_method?.toUpperCase() || "-"}
                      </div>
                      <small>
                        {order.payment_type?.toUpperCase() || "-"}
                      </small>
                    </td>

                    <td>
                      <span
                        className="status-badge"
                        style={getStatusStyle(order.status)}
                      >
                        {order.status?.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td>
                      {order.date
                        ? new Date(order.date).toLocaleDateString("en-IN")
                        : "-"}
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
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    No Product Orders Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="order-pagination-container">
            <div className="order-pagination-info">
              Showing{" "}
              <strong>
                {totalCount === 0
                  ? 0
                  : (currentpage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong>
                {Math.min(currentpage * pageSize, totalCount)}
              </strong>{" "}
              of <strong>{totalCount}</strong> orders
            </div>

            <div className="order-pagination-buttons">
              <button
                className="order-pagination-btn order-pagination-arrow"
                disabled={currentpage === 1 || OrderLoading}
                onClick={() => fetchProductOrders(currentpage - 1)}
              >
                ‹
              </button>

              {currentpage > 2 && (
                <>
                  <button
                    className="order-pagination-btn"
                    disabled={OrderLoading}
                    onClick={() => fetchProductOrders(1)}
                  >
                    1
                  </button>

                  {currentpage > 3 && (
                    <span className="order-pagination-dots">...</span>
                  )}
                </>
              )}

              {currentpage > 1 && (
                <button
                  className="order-pagination-btn"
                  disabled={OrderLoading}
                  onClick={() => fetchProductOrders(currentpage - 1)}
                >
                  {currentpage - 1}
                </button>
              )}

              {totalPages > 0 && (
                <button className="order-pagination-btn order-pagination-active" disabled>
                  {currentpage}
                </button>
              )}

              {currentpage < totalPages && (
                <button
                  className="order-pagination-btn"
                  disabled={OrderLoading}
                  onClick={() => fetchProductOrders(currentpage + 1)}
                >
                  {currentpage + 1}
                </button>
              )}

              {currentpage < totalPages - 1 && (
                <>
                  {currentpage < totalPages - 2 && (
                    <span className="order-pagination-dots">...</span>
                  )}

                  <button
                    className="order-pagination-btn"
                    disabled={OrderLoading}
                    onClick={() => fetchProductOrders(totalPages)}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                className="order-pagination-btn order-pagination-arrow"
                disabled={
                  currentpage === totalPages ||
                  totalPages === 0 ||
                  OrderLoading
                }
                onClick={() => fetchProductOrders(currentpage + 1)}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ORDER DETAIL MODAL */}
      {showOrderModal && (
        <OrderModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </>
  );
};

export default Producthistory;
