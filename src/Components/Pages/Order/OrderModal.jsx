
import React, { useState } from "react";
import { FiPhone } from "react-icons/fi";


const OrderModal = ({ order, onClose }) => {
  const [openInvoiceModal, setOpenInvoiceModal] = useState(false);

  if (!order) return null;

  return (
    <>
     
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="order-modal"
          onClick={(e) => e.stopPropagation()}
        >
          
          <div className="modal-header">
            <h2>Order Details</h2>

            <div className="header-right1">
              <button className="close-btn" onClick={onClose}>✕</button>

              <button
                className="icon-btn"
                title="View Invoice"
                onClick={() => setOpenInvoiceModal(true)}
              >
                📄
              </button>
            </div>
          </div>

          <div className="section">
            <h4>Product Details</h4>
            {order.items?.length ? (
              order.items.map((item, index) => (
                <div key={index} className="row">
                  <span>{item.product_name}</span>
                  <span>₹{item.price}</span>
                  <span>Qty: {item.quantity}</span>
                </div>
              ))
            ) : (
              <p>No product available</p>
            )}
          </div>

          <div className="section">
            <h4>Price Details</h4>
            <div className="row">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="row">
              <span>Delivery</span>
              <span>₹{order.delivery_charges ?? "0.00"}</span>
            </div>
            <div className="row total">
              <span>Total</span>
              <span>₹{order.total_amount}</span>
            </div>
          </div>

          <div className="section">
            <h4>Payment</h4>
            <div className="row">
              <span>Method</span>
              <span>{order.payment_method}</span>
            </div>
            <div className="row">
              <span>Status</span>
              <span className="status pending">{order.payment_status}</span>
            </div>
          </div>

         
          <div className="section">
            <h4>Customer</h4>
            <p><strong>{order.customer_name}</strong></p>
            <p className="muted">
              {order.delivery_address_details?.house_details},{" "}
              {order.delivery_address_details?.city} -{" "}
              {order.delivery_address_details?.pincode}
            </p>
            <p className="customer-phone">
              <FiPhone size={14} />
              {order.delivery_address_details?.mobile_number}
            </p>
          </div>
        </div>
      </div>

      
      {openInvoiceModal && (
        <div
          className="modal-overlay"
          onClick={() => setOpenInvoiceModal(false)}
        >
          <div
            className="invoice-modal"
            onClick={(e) => e.stopPropagation()}
          >
         
            <div className="invoice-header">
              <h2>Invoice</h2>
              <button
                className="close-btn"
                onClick={() => setOpenInvoiceModal(false)}
              >
                ✕
              </button>
            </div>

          
            <div className="company-info">
              <strong>ABC E-Commerce Pvt. Ltd.</strong>
              <p>#101, MG Road, Bengaluru – 560001</p>
              <p>+91 9876543210</p>
              <p>support@abccommerce.com</p>
            </div>

            
            <div className="info-grid">
              <div className="info-card">
                <h4>Billing Information</h4>
                <p><strong>{order.customer_name}</strong></p>
                <p>
                  {order.delivery_address_details?.house_details},{" "}
                  {order.delivery_address_details?.city}
                </p>
                <p>{order.delivery_address_details?.pincode}</p>
              </div>

              <div className="info-card">
                <h4>Payment</h4>
                <p>{order.payment_method}</p>
                <span className="status pending">{order.payment_status}</span>
              </div>
            </div>

          
            <div className="order-summary">
              <div className="summary-header">
                <span>Item</span>
                <span>Qty</span>
                <span>Amount</span>
              </div>

              {order.items?.length ? (
                order.items.map((item, i) => (
                  <div className="summary-row" key={i}>
                    <span>{item.product_name}</span>
                    <span>{item.quantity}</span>
                    <span>₹{item.price}</span>
                  </div>
                ))
              ) : (
                <div className="summary-row">
                  <span>No product</span>
                  <span>-</span>
                  <span>₹{order.total_amount}</span>
                </div>
              )}

              <div className="summary-total">
                <span>Total Amount</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>

            
            <div className="invoice-footer">
              <p>Thank you for your purchase!</p>
              <small>This is a computer-generated invoice.</small>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderModal;
