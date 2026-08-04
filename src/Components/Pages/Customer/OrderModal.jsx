import React from "react";
import "./OrderModal.css";
import {
  FiX,
  FiMapPin,
  FiShoppingBag,
  FiCreditCard,
  FiTag,
} from "react-icons/fi";

const OrderModal = ({ order, onClose }) => {
  if (!order) return null;

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="orderDrawerOverlay" onClick={onClose}>
      <div
        className="orderDrawer"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================= Header ================= */}

        <div className="drawerHeader">
          <div>
            <h2>{order.order_display_code || order.order_code}</h2>

            <p>
              {formatDate(order.date)} • {formatTime(order.date)}
            </p>

            <div className="paymentRow">
              <span>{order.payment_method || "N/A"}</span>

              <span className="dot"></span>

              <span>{order.payment_type || "N/A"}</span>
            </div>
          </div>

          <div className="drawerRight">
            <span className={`status ${order.status?.toLowerCase()}`}>
              {order.status || "N/A"}
            </span>

            <button onClick={onClose}>
              <FiX />
            </button>
          </div>
        </div>

        {/* ================= Summary ================= */}

        <div className="summaryCard">
          <div>
            <h3>Customer Order Summary</h3>

            <p>
              Order placed on {formatDate(order.date)}
            </p>
          </div>

          <h1>
            ₹{Number(order.total_amount || 0).toFixed(2)}
          </h1>
        </div>

        {/* ================= Address ================= */}

        <div className="addressCard">
          <div className="addressHeader">
            <h3>Shipping Address</h3>

            <FiMapPin />
          </div>

          <p>{order.address || "No Address Available"}</p>
        </div>

        {/* ================= Products ================= */}

        <h3 className="productsHeading">
          Products ({order.items_count || order.items?.length || 0})
        </h3>

        <div className="products">
          {order.items?.length ? (
            order.items.map((item, index) => (
              <div className="productCard" key={index}>
                <img
                  src={item.cover_image}
                  alt={item.product_name}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/90x90?text=Product";
                  }}
                />

                <div className="productInfo">
                  <h4>{item.product_name}</h4>

                  <p>
                    {item.variant_title || "Product Variant"}
                  </p>

                  <span>
                    SKU : {item.sku_code || "N/A"}
                  </span>
                </div>

                <div className="productRight">
                  <span className="qty">
                    Qty : {item.quantity}
                  </span>

                  <h3>
                    ₹
                    {Number(
                      item.total_amount || item.price || 0
                    ).toFixed(2)}
                  </h3>
                </div>
              </div>
            ))
          ) : (
            <div className="noProducts">
              No Products Found
            </div>
          )}
        </div>

        {/* ================= Footer ================= */}

        <div className="footerSummary">
          <div className="row">
            <div>
              <FiShoppingBag />
              Items
            </div>

            <span>
              {order.items_count || order.items?.length || 0}
            </span>
          </div>

          <div className="row">
            <div>
              <FiCreditCard />
              Payment Method
            </div>

            <span>{order.payment_method || "N/A"}</span>
          </div>

          <div className="row">
            <div>
              <FiTag />
              Payment Type
            </div>

            <span>{order.payment_type || "N/A"}</span>
          </div>

          <div className="row total">
            <div>
              <FiCreditCard />
              Total Amount
            </div>

            <strong>
              ₹{Number(order.total_amount || 0).toFixed(2)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;