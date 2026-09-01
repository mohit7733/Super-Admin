import React, { useEffect, useState } from "react";
import "./OrderTracking.css";
import { useParams, useNavigate } from "react-router-dom";
import BASE_URL from "../../../Base";
import { toast } from "react-toastify";

export default function OrderTracking() {
  const { OrderId } = useParams();
  const navigate = useNavigate();

  const [orderDetail, setOrderDetail] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);

  const getValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (typeof value === "string" && value.trim() === "")
    ) {
      return "N/A";
    }

    return value;
  };

  const formatAmount = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      Number.isNaN(Number(value))
    ) {
      return "N/A";
    }

    return `₹${Number(value).toFixed(2)}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatStatus = (status) => {
    if (!status) return "N/A";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getStatusClass = (status) => {
    if (!status) return "ordertracking-badge-blue";

    const normalizedStatus = status.toLowerCase();

    if (
      normalizedStatus === "delivered" ||
      normalizedStatus === "success" ||
      normalizedStatus === "completed"
    ) {
      return "ordertracking-badge-green";
    }

    if (
      normalizedStatus === "cancelled" ||
      normalizedStatus === "failed" ||
      normalizedStatus === "rejected"
    ) {
      return "ordertracking-badge-red";
    }

    return "ordertracking-badge-blue";
  };

  const getOrderById = async (orderId) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session Expired, Login Again");
      navigate("/login");
      return;
    }

    if (!orderId) {
      toast.error("Order ID not found");
      return;
    }

    try {
      setOrderLoading(true);
      setOrderError(null);

      const response = await fetch(
        `${BASE_URL}/order/admin/?id=${encodeURIComponent(orderId)}`,
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

      console.log("Order Detail Response:", data);

      setOrderDetail(data?.data || null);
    } catch (error) {
      console.error("Order Detail Fetch Error:", error);

      setOrderError("Something went wrong while fetching order details");

      toast.error("Failed to fetch order details");
    } finally {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    if (OrderId) {
      getOrderById(OrderId);
    }
  }, [OrderId]);

  if (orderLoading) {
    return (
      <div className="ordertracking-page">
        <div className="ordertracking-loading">
          Loading order details...
        </div>
      </div>
    );
  }

  if (orderError || !orderDetail) {
    return (
      <div className="ordertracking-page">
        <div className="ordertracking-error">
          {orderError || "Order not found"}
        </div>
      </div>
    );
  }

  const order = orderDetail;

  const customer = order.customer || {};
  const address = order.delivery_address || {};
  const payment = order.payment || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const statusHistory = Array.isArray(order.status_history)
    ? order.status_history
    : [];

const buildTimeline = () => {
  const timeline = [];

  
  if (order.created_at) {
    timeline.push({
      id: "order-placed",
      status: "order_placed",
      source: "system",
      note: "Your order has been placed.",
      created_at: order.created_at,
    });
  }

  
  statusHistory.forEach((history, index) => {
    if (!history?.created_at) return;

    timeline.push({
      id: history.id || `history-${index}`,
      status: history.status || "unknown",
      source: history.source || "system",
      note: history.note || "",
      created_at: history.created_at,
    });
  });

 
  timeline.sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime()
  );

  return timeline;
};
const timelineData = buildTimeline();

  const totalUnits = items.reduce(
    (total, item) => total + Number(item?.quantity || 0),
    0
  );

  const currentStatus = order.order_status;

  return (
    <div className="ordertracking-page">

      {/* ================= TOP BAR ================= */}

      <div className="ordertracking-topbar">

        <div className="ordertracking-topbar-left">

          <div className="ordertracking-topbar-title-row">

            <button
              className="ordertracking-back-btn"
              aria-label="Go back"
              onClick={() => navigate(-1)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="17"
                height="17"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="ordertracking-order-title">
              {getValue(order.order_display_code)}
            </span>

            <span
              className={`ordertracking-badge ${getStatusClass(
                currentStatus
              )}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>

              {formatStatus(currentStatus)}
            </span>

            <span
              className={`ordertracking-badge ${getStatusClass(
                payment.status
              )}`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>

              Payment {formatStatus(payment.status)}
            </span>

          </div>

          <div className="ordertracking-topbar-meta">

            <span className="ordertracking-mono">
              {getValue(order.order_code)}
            </span>

            <span className="ordertracking-dot-sep"></span>

            <span>
              Placed {formatDateTime(order.created_at)}
            </span>

            <span className="ordertracking-dot-sep"></span>

            <span>
              via App
            </span>

          </div>

        </div>

        <div className="ordertracking-topbar-right">

          <div className="ordertracking-subtotal-label">
            Your Subtotal
          </div>

          <div className="ordertracking-subtotal-value">
            {formatAmount(order.total_amount)}
          </div>

          <div className="ordertracking-subtotal-sub">
            Order total {formatAmount(order.total_amount)}
          </div>

        </div>

      </div>


      {/* ================= SUMMARY TILES ================= */}

      <div className="ordertracking-tiles">

        {/* ITEMS */}

        <div className="ordertracking-tile">

          <div className="ordertracking-tile-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              <path d="M3.3 7 12 12l8.7-5M12 22V12" />
            </svg>
          </div>

          <div>
            <div className="ordertracking-tile-label">
              Your Items
            </div>

            <div className="ordertracking-tile-value">
              {items.length || "N/A"}{" "}
              {items.length === 1 ? "item" : "items"}
            </div>

            <div className="ordertracking-tile-sub">
              {totalUnits || "N/A"} units
            </div>
          </div>

        </div>


        {/* PAYMENT */}

        <div className="ordertracking-tile">

          <div className="ordertracking-tile-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <path d="M1 10h22" />
            </svg>
          </div>

          <div>

            <div className="ordertracking-tile-label">
              Payment
            </div>

            <div className="ordertracking-tile-value">
              {getValue(order.payment_type).toUpperCase()}
              {" · "}
              {getValue(order.payment_method).toUpperCase()}
            </div>

            <div
              className={`ordertracking-tile-sub ${
                payment.status === "success"
                  ? "ordertracking-ok"
                  : ""
              }`}
            >
              {formatStatus(payment.status)}
            </div>

          </div>

        </div>


        {/* SHIPPING */}

        <div className="ordertracking-tile">

          <div className="ordertracking-tile-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 3h15v13H1z" />
              <path d="M16 8h4l3 3v5h-7V8Z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
          </div>

          <div>

            <div className="ordertracking-tile-label">
              Shipping
            </div>

            <div className="ordertracking-tile-value">
              {getValue(order.shipping_method)}
            </div>

            <div className="ordertracking-tile-sub">
              {getValue(order.courier_name)}
            </div>

          </div>

        </div>


        {/* UNICOMMERCE */}

        <div className="ordertracking-tile">

          <div className="ordertracking-tile-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z" />
            </svg>
          </div>

          <div>

            <div className="ordertracking-tile-label">
              Unicommerce
            </div>

            <div className="ordertracking-tile-value">
              {formatStatus(order.unicommerce_sync_status)}
            </div>

            <div className="ordertracking-tile-sub ordertracking-mono">
              {getValue(order.unicommerce_sale_order_code)}
            </div>

          </div>

        </div>

      </div>


    

      <div className="ordertracking-main-grid">


 

    <div className="ordertracking-col">


  <div className="ordertracking-card">

    <div className="ordertracking-card-head">
      <span className="ordertracking-card-title">
        Order Items
      </span>

      <span className="ordertracking-card-title-count">
        {items.length} {items.length === 1 ? "line" : "lines"}
      </span>
    </div>

    {items.length > 0 ? (
      items.map((item) => {
        const variant = item.variant || {};

        return (
          <div
            className="ordertracking-item-row"
            key={item.id}
          >
            <div className="ordertracking-item-thumb">
              {variant.image_url ? (
                <img
                  src={variant.image_url}
                  alt={getValue(variant.variant_title)}
                />
              ) : (
                "N/A"
              )}
            </div>

            <div className="ordertracking-item-info">
              <div className="ordertracking-item-name">
                {getValue(variant.variant_title)}
              </div>

              <div className="ordertracking-item-meta">
                {getValue(variant.brand_name)}
                {" · "}
                {getValue(variant.size)}
                {" · "}
                {getValue(item.sku_code)}
              </div>

              <div className="ordertracking-item-qty">
                Qty {getValue(item.quantity)}
                {" × "}
                {formatAmount(item.selling_price)} each
              </div>
            </div>

            <div className="ordertracking-item-price">
              <div className="ordertracking-item-price-now">
                {formatAmount(item.total_price)}
              </div>

              <div className="ordertracking-item-price-mrp">
                MRP {formatAmount(variant.mrp)}
              </div>
            </div>
          </div>
        );
      })
    ) : (
      <div className="ordertracking-empty">
        N/A
      </div>
    )}

  </div>
 <div className="ordertracking-card">

            <div className="ordertracking-card-head">
              <span className="ordertracking-card-title">
                Order Summary
              </span>
            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Status
              </span>

              <span
                className={`ordertracking-badge ${getStatusClass(
                  currentStatus
                )}`}
                style={{
                  padding: "3px 10px 3px 8px",
                  fontSize: "11.5px",
                }}
              >
                {formatStatus(currentStatus)}
              </span>

            </div>

            <div className="ordertracking-kv-row">
              <span className="ordertracking-kv-label">
                Your subtotal
              </span>

              <span className="ordertracking-kv-value">
                {formatAmount(order.total_amount)}
              </span>
            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Discount
              </span>

              <span className="ordertracking-kv-value">
                {formatAmount(order.total_discount)}
              </span>

            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Shipping charges
              </span>

              <span className="ordertracking-kv-value">
                {Number(order.shipping_charges || 0) === 0
                  ? "Free"
                  : formatAmount(order.shipping_charges)}
              </span>

            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Order total
              </span>

              <span className="ordertracking-kv-value">
                {formatAmount(order.total_amount)}
              </span>

            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Prepaid amount
              </span>

              <span className="ordertracking-kv-value">
                {formatAmount(order.prepaid_amount)}
              </span>

            </div>

          </div>

  {/* ================= PAYMENT ================= */}
  <div className="ordertracking-card">

    <div className="ordertracking-card-head">
      <span className="ordertracking-card-title">
        Payment
      </span>
    </div>

    <div className="ordertracking-kv-row">
      <span className="ordertracking-kv-label">
        Method
      </span>

      <span className="ordertracking-kv-value">
        {getValue(order.payment_type).toUpperCase()}
        {" · "}
        {getValue(order.payment_method).toUpperCase()}
      </span>
    </div>

    <div className="ordertracking-kv-row">
      <span className="ordertracking-kv-label">
        Status
      </span>

      <span
        className={`ordertracking-badge ${getStatusClass(
          payment.status
        )}`}
        style={{
          padding: "3px 10px 3px 8px",
          fontSize: "11.5px",
        }}
      >
        {formatStatus(payment.status)}
      </span>
    </div>

    <div className="ordertracking-kv-row">
      <span className="ordertracking-kv-label">
        Amount paid
      </span>

      <span className="ordertracking-kv-value">
        {formatAmount(payment.amount)}
      </span>
    </div>

    <div className="ordertracking-kv-row">
      <span className="ordertracking-kv-label">
        Paid on
      </span>

      <span className="ordertracking-kv-value">
        {formatDateTime(payment.paid_at)}
      </span>
    </div>

    <div className="ordertracking-kv-row">
      <span className="ordertracking-kv-label">
        Payment ID
      </span>

      <span className="ordertracking-kv-value ordertracking-mono">
        {getValue(payment.razorpay_payment_id)}
      </span>
    </div>

  </div>




</div>


        {/* ================= TIMELINE ================= */}

        <div className="ordertracking-col">

          <div className="ordertracking-card">

            <div className="ordertracking-card-head">
              <span className="ordertracking-card-title">
                Order Timeline
              </span>
            </div>

        <div className="ordertracking-timeline">

  {timelineData.length > 0 ? (
    timelineData.map((event, index) => {
      const isLast = index === timelineData.length - 1;

      return (
        <div
          className={`ordertracking-t-item ${
            isLast ? "ordertracking-timeline-current" : ""
          }`}
          key={event.id}
        >

          <div
            className={`ordertracking-t-dot ${
              isLast
                ? "ordertracking-active"
                : "ordertracking-done"
            }`}
          >
            {isLast ? (
              <span className="ordertracking-timeline-dot-inner" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
          </div>

          {!isLast && (
            <div className="ordertracking-t-line" />
          )}

          <div className="ordertracking-t-content">

            <div className="ordertracking-t-header">

              <div className="ordertracking-t-title">
                {formatStatus(event.status)}
              </div>

              {event.source && (
                <span className="ordertracking-t-source">
                  {formatStatus(event.source)}
                </span>
              )}

            </div>

            <div className="ordertracking-t-time">
              {formatDateTime(event.created_at)}
            </div>

            <div className="ordertracking-t-desc">
              {getValue(event.note)}
            </div>

          </div>

        </div>
      );
    })
  ) : (
    <div className="ordertracking-empty">
      N/A
    </div>
  )}

</div>

          </div>

        </div>


        {/* ================= SUMMARY + PAYMENT ================= */}



        {/* ================= ADDRESS + SHIPPING ================= */}

        <div className="ordertracking-col">

          {/* DELIVERY ADDRESS */}

          <div className="ordertracking-card">

            <div className="ordertracking-card-head">
              <span className="ordertracking-card-title">
                Delivery Address
              </span>
            </div>

            <span className="ordertracking-address-tag">

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
                <path d="M9 22V12h6v10" />
              </svg>

              {getValue(address.address_type).toUpperCase()}

            </span>


            <div className="ordertracking-address-text">

              {getValue(address.address_line_1)}

              {address.address_line_2 && (
                <>
                  , {address.address_line_2}
                </>
              )}

              {address.city && (
                <>
                  , {address.city}
                </>
              )}

              {address.state && (
                <>
                  , {address.state}
                </>
              )}

              {address.zipcode && (
                <>
                  , {address.zipcode}
                </>
              )}

              {address.country && (
                <>
                  , {address.country}
                </>
              )}

            </div>


            <div className="ordertracking-address-grid">

              <div>
                <div className="ordertracking-addr-field-label">
                  City
                </div>

                <div className="ordertracking-addr-field-value">
                  {getValue(address.city)}
                </div>
              </div>


              <div>
                <div className="ordertracking-addr-field-label">
                  State
                </div>

                <div className="ordertracking-addr-field-value">
                  {getValue(address.state)}
                </div>
              </div>


              <div>
                <div className="ordertracking-addr-field-label">
                  PIN
                </div>

                <div className="ordertracking-addr-field-value">
                  {getValue(address.zipcode)}
                </div>
              </div>


              <div>
                <div className="ordertracking-addr-field-label">
                  Country
                </div>

                <div className="ordertracking-addr-field-value">
                  {getValue(address.country)}
                </div>
              </div>

            </div>

          </div>


          {/* SHIPPING */}

          <div className="ordertracking-card">

            <div className="ordertracking-card-head">
              <span className="ordertracking-card-title">
                Shipping
              </span>
            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Method
              </span>

              <span className="ordertracking-kv-value">
                {getValue(order.shipping_method)}
              </span>

            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Courier
              </span>

              <span className="ordertracking-kv-value">
                {getValue(order.courier_name)}
              </span>

            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Tracking
              </span>

              <span className="ordertracking-kv-value ordertracking-mono">
                {getValue(order.tracking_number)}
              </span>

            </div>

          </div>


          {/* CUSTOMER */}

          <div className="ordertracking-card">

            <div className="ordertracking-card-head">
              <span className="ordertracking-card-title">
                Customer
              </span>
            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Name
              </span>

              <span className="ordertracking-kv-value">
                {getValue(customer.full_name)}
              </span>

            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Email
              </span>

              <span className="ordertracking-kv-value">
                {getValue(customer.email)}
              </span>

            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Phone
              </span>

              <span className="ordertracking-kv-value">
                {getValue(customer.phone_number)}
              </span>

            </div>

          </div>


          {/* CHANNEL SYNC */}

          <div className="ordertracking-card">

            <div className="ordertracking-card-head">
              <span className="ordertracking-card-title">
                Channel Sync
              </span>
            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Unicommerce
              </span>

              <span
                className={`ordertracking-badge ${getStatusClass(
                  order.unicommerce_sync_status
                )}`}
                style={{
                  padding: "3px 10px 3px 8px",
                  fontSize: "11.5px",
                }}
              >
                {formatStatus(order.unicommerce_sync_status)}
              </span>

            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Sale order
              </span>

              <span className="ordertracking-kv-value ordertracking-mono">
                {getValue(order.unicommerce_sale_order_code)}
              </span>

            </div>

            <div className="ordertracking-kv-row">

              <span className="ordertracking-kv-label">
                Invoice
              </span>

              <span className="ordertracking-kv-value ordertracking-mono">
                {getValue(order.unicommerce_invoice_display_code)}
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* ================= FOOTER ================= */}

      <div className="ordertracking-footer-row">

        <button
          className="ordertracking-back-link"
          onClick={() => navigate(-1)}
          type="button"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>

          Back to all orders
        </button>

      </div>

    </div>
  );
}