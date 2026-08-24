import React from "react";
import {
  FiArrowLeft,
  FiMapPin,
  FiPackage,
  FiCheckCircle,
  FiTruck,
  FiBox,
  FiCreditCard,
  FiPhone,
  FiMessageCircle,
  FiRefreshCw,
  FiClock,
  FiUser,
  FiMail,
  FiCalendar,
  FiNavigation,
  FiDownload,
  FiHeadphones,
  FiChevronRight,
  FiShoppingBag,
  FiHome,
  FiActivity,
} from "react-icons/fi";

import "./OrderTracking.css";

const OrderTracking = () => {
  const order = {
    id: "ORD-1001",
    customer: "Ta Sahu",
    email: "tasahu@gmail.com",
    phone: "+91 9876543210",
    date: "19 Aug 2026",
    time: "04:15 PM",
    payment: "Net Banking",
    paymentStatus: "Paid",
    status: "Out for Delivery",
    total: "₹947.99",
    items: 3,
    estimatedDelivery: "21 Aug 2026",
  };

  const trackingSteps = [
    {
      title: "Order Placed",
      description: "Your order has been placed successfully.",
      date: "19 Aug 2026",
      time: "04:15 PM",
      status: "completed",
      icon: <FiShoppingBag />,
    },
    {
      title: "Payment Confirmed",
      description: "Payment has been received and confirmed.",
      date: "19 Aug 2026",
      time: "04:16 PM",
      status: "completed",
      icon: <FiCreditCard />,
    },
    {
      title: "Order Packed",
      description: "Your items have been packed and are ready.",
      date: "19 Aug 2026",
      time: "05:10 PM",
      status: "completed",
      icon: <FiBox />,
    },
    {
      title: "Shipped",
      description: "Order has been handed over to delivery partner.",
      date: "19 Aug 2026",
      time: "07:30 PM",
      status: "completed",
      icon: <FiTruck />,
    },
    {
      title: "Out for Delivery",
      description: "Delivery partner is on the way.",
      date: "20 Aug 2026",
      time: "10:30 AM",
      status: "active",
      icon: <FiNavigation />,
    },
    {
      title: "Delivered",
      description: "Order will be delivered to the customer.",
      date: "",
      time: "",
      status: "pending",
      icon: <FiHome />,
    },
  ];

  const products = [
    {
      name: "Amrutam Dentkey Manjan",
      subtitle: "Amrutam Dentkey Manjan – 50 g",
      quantity: 1,
      price: "₹299.99",
      image:
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=100",
    },
    {
      name: "Dolo-350",
      subtitle: "Dolo-350",
      quantity: 1,
      price: "₹358.00",
      image:
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100",
    },
    {
      name: "HerbaRoot Herbal Hair Shampoo",
      subtitle: "HerbaRoot Herbal Hair Shampoo – 200 ml",
      quantity: 1,
      price: "₹290.00",
      image:
        "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=100",
    },
  ];

  return (
    <div className="tracking-page">

      {/* ================= HEADER ================= */}
      <div className="tracking-header">

        <div>
          <div className="breadcrumb">
            <span>Dashboard</span>
            <FiChevronRight />
            <span>Orders</span>
            <FiChevronRight />
            <span>Order Tracking</span>
            <FiChevronRight />
            <strong>{order.id}</strong>
          </div>

          <h1>Order Tracking</h1>

          <p>
            Real-time tracking and updates of the customer order.
          </p>
        </div>

        <button className="back-btn">
          <FiArrowLeft />
          Back to Orders
        </button>
      </div>


      {/* ================= ORDER SUMMARY ================= */}
      <div className="order-summary">

        <div className="summary-order">
          <div className="summary-icon">
            <FiPackage />
          </div>

          <div>
            <span>Order ID</span>
            <h2>{order.id}</h2>
            <p>
              Placed on {order.date}, {order.time}
            </p>
            <small>
              by {order.customer} ({order.email})
            </small>
          </div>
        </div>


        <div className="summary-divider" />


        <div className="summary-item">
          <span>Payment Method</span>
          <div className="summary-value">
            <FiCreditCard />
            {order.payment}
          </div>

          <label className="paid-badge">
            {order.paymentStatus}
          </label>
        </div>


        <div className="summary-divider" />


        <div className="summary-item">
          <span>Total Amount</span>
          <h2>{order.total}</h2>
          <p>{order.items} Items</p>
        </div>


        <div className="summary-divider" />


        <div className="summary-item">
          <span>Order Status</span>

          <label className="status-badge active-status">
            <span />
            {order.status}
          </label>
        </div>


        <div className="delivery-estimate">

          <div className="delivery-icon">
            <FiCalendar />
          </div>

          <div>
            <span>Estimated Delivery</span>
            <strong>{order.estimatedDelivery}</strong>
            <small>Expected delivery date</small>
          </div>

        </div>

      </div>


      {/* ================= MAIN CONTENT ================= */}
      <div className="tracking-grid">


        {/* ================= LEFT SIDE ================= */}
        <div className="tracking-left">


          {/* ORDER PROGRESS */}
          <div className="tracking-card">

            <div className="card-heading">

              <div className="heading-icon">
                <FiActivity />
              </div>

              <div>
                <h2>Order Progress</h2>
                <p>Track every stage of this order</p>
              </div>

            </div>


            <div className="timeline">

              {trackingSteps.map((step, index) => (

                <div
                  className={`timeline-item ${step.status}`}
                  key={index}
                >

                  <div className="timeline-icon">
                    {step.icon}
                  </div>

                  {index !== trackingSteps.length - 1 && (
                    <div className="timeline-line" />
                  )}

                  <div className="timeline-content">

                    <div className="timeline-title">

                      <div>
                        <h3>{step.title}</h3>

                        <p>{step.description}</p>

                        {step.date && (
                          <small>
                            <FiClock />
                            {step.date} • {step.time}
                          </small>
                        )}
                      </div>

                      <span className={`step-badge ${step.status}`}>
                        {step.status === "completed"
                          ? "Completed"
                          : step.status === "active"
                          ? "In Transit"
                          : "Pending"}
                      </span>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>


          {/* ================= LIVE TRACKING ================= */}
          <div className="tracking-card live-card">

            <div className="live-header">

              <div className="card-heading">

                <div className="heading-icon">
                  <FiMapPin />
                </div>

                <div>
                  <h2>Live Tracking</h2>

                  <p>
                    Real-time delivery partner location
                  </p>
                </div>

              </div>


              <div className="live-controls">

                <span className="live-badge">
                  <i />
                  LIVE
                </span>

                <span className="last-update">
                  Last updated: 11:24 AM
                </span>

                <button className="refresh-btn">
                  <FiRefreshCw />
                </button>

              </div>

            </div>


            {/* MAP */}
            <div className="live-map">

              <div className="map-grid" />

              <div className="map-location location-one">
                <span>Punjabi Bagh</span>
              </div>

              <div className="map-location location-two">
                <span>Rajouri Garden</span>
              </div>

              <div className="map-location location-three">
                <span>Green Park</span>
              </div>

              {/* Route */}
              <div className="route-line route-one" />
              <div className="route-line route-two" />
              <div className="route-line route-three" />


              {/* Delivery Partner */}
              <div className="driver-marker">
                <FiTruck />
              </div>


              {/* Customer Location */}
              <div className="customer-marker">
                <FiMapPin />
              </div>


              <div className="map-label driver-label">
                Delivery Partner
              </div>

              <div className="map-label customer-label">
                Customer
              </div>


              {/* Map Controls */}
              <div className="map-controls">

                <button>
                  +
                </button>

                <button>
                  −
                </button>

                <button>
                  <FiNavigation />
                </button>

              </div>

            </div>


            {/* DRIVER INFORMATION */}
            <div className="driver-card">

              <div className="driver-info">

                <div className="driver-avatar">
                  <FiUser />
                </div>

                <div>
                  <span>Delivery Partner</span>

                  <h3>
                    Rahul Kumar
                    <b>★ 4.8</b>
                  </h3>

                  <p>
                    <FiPhone />
                    +91 98765 43210
                  </p>
                </div>

              </div>


              <div className="driver-actions">

                <button className="call-btn">
                  <FiPhone />
                  Call
                </button>

                <button className="message-btn">
                  <FiMessageCircle />
                  Message
                </button>

              </div>

            </div>


            <div className="location-info">
              <FiNavigation />

              <div>
                <strong>Current Location</strong>
                <p>
                  Near Green Park, New Delhi
                </p>
              </div>

              <span>
                2.4 km away
              </span>

            </div>

          </div>


          {/* ================= SUPPORT ================= */}
          <div className="support-card">

            <div className="support-icon">
              <FiHeadphones />
            </div>

            <div>
              <h3>Need Help?</h3>
              <p>
                Contact our support team for any order queries.
              </p>
            </div>

            <button>
              Contact Support
            </button>

          </div>

        </div>


        {/* ================= RIGHT SIDE ================= */}
        <div className="tracking-right">


          {/* ORDER DETAILS */}
          <div className="side-card">

            <div className="side-heading">
              <div>
                <FiPackage />
              </div>

              <h2>Order Details</h2>
            </div>


            <div className="detail-list">

              <div>
                <span>Customer</span>
                <strong>{order.customer}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{order.email}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{order.phone}</strong>
              </div>

              <div>
                <span>Order Date</span>
                <strong>
                  {order.date}, {order.time}
                </strong>
              </div>

              <div>
                <span>Payment</span>
                <strong>{order.payment}</strong>
              </div>

              <div>
                <span>Payment Status</span>
                <label className="paid-badge">
                  Paid
                </label>
              </div>

            </div>

          </div>


          {/* SHIPPING ADDRESS */}
          <div className="side-card">

            <div className="side-heading">

              <div>
                <FiMapPin />
              </div>

              <h2>Delivery Address</h2>

            </div>


            <div className="address">

              <strong>{order.customer}</strong>

              <p>
                123, Green Park,
                <br />
                Near Botanical Garden,
                <br />
                New Delhi - 110016,
                India
              </p>

              <a href="/">
                <FiMapPin />
                View on Map
              </a>

            </div>

          </div>


          {/* ITEMS */}
          <div className="side-card">

            <div className="side-heading">

              <div>
                <FiShoppingBag />
              </div>

              <h2>Order Items ({products.length})</h2>

            </div>


            <div className="products">

              {products.map((product, index) => (

                <div className="product-item" key={index}>

                  <img
                    src={product.image}
                    alt={product.name}
                  />

                  <div className="product-info">

                    <h3>{product.name}</h3>

                    <p>{product.subtitle}</p>

                    <small>
                      Qty: {product.quantity}
                    </small>

                  </div>

                  <strong>
                    {product.price}
                  </strong>

                </div>

              ))}

            </div>


            {/* PRICE */}
            <div className="price-section">

              <div>
                <span>Subtotal</span>
                <strong>₹947.99</strong>
              </div>

              <div>
                <span>Discount</span>
                <strong className="discount">
                  -₹0.00
                </strong>
              </div>

              <div>
                <span>Shipping Charges</span>
                <strong>₹0.00</strong>
              </div>

              <div className="total-row">
                <span>Total Amount</span>
                <strong>{order.total}</strong>
              </div>

            </div>


            <button className="invoice-btn">
              <FiDownload />
              Download Invoice
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default OrderTracking;