import React from "react";
import { useState } from "react";
import { FiPhone } from "react-icons/fi";
import logo1 from '../Assests/logo1.png';
const OrderModal = ({ order, onClose }) => {
  const [OpeninvoiceModal,setOpenInvoiceModal]=useState(false)
  if (!order) return null;

 

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="order-modal"
        onClick={(e) => e.stopPropagation()}
      >
       
        <div className="modal-header">
          <h2>Order Details</h2>

          <div className="header-right1">
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>

            <div className="invoice-icons">
              <button
                className="icon-btn"
                title="View Invoice"
               onClick={()=>setOpenInvoiceModal(true)}
              >
                📄
              </button>

            
             
            </div>
          </div>
        </div>

     
        <div className="section">
          <h4>Product Details</h4>

          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => (
              <div key={index} className="row">
                <span>Product Name: {item.product_name}</span>
                <span>Price: ₹{item.price}</span>
                <div className="row muted">
                  Qty: {item.quantity}
                </div>
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
            <span>Delivery Charges</span>
            <span>₹{order?.delivery_charges ?? "0.00"}</span>
          </div>
          <div className="row total">
            <span>Total Amount</span>
            <span>₹{order.total_amount}</span>
          </div>
        </div>
  <div className="section">
          <h4>Payment Details</h4>
          <div className="row">
            <span>Payment Method</span>
            <span>{order.payment_method}</span>
          </div>
          <div className="row">
            <span>Payment Status</span>
            <span className="success">
              {order.payment_status}
            </span>
          </div>
          <div className="row">
            <span>Payment Date</span>
            <span>
              {order.created_at
                ? new Date(order.created_at).toLocaleDateString()
                : "-"}
            </span>
          </div>
        </div>

        
        <div className="section">
          <h4>Shipping & Delivery</h4>
          <div className="row">
            <span>Order Status</span>
            <span className="badge">
              {order.order_status}
            </span>
          </div>
          <div className="row">
            <span>Delivery Method</span>
            <span>Standard</span>
          </div>
        </div>

      
        <div className="section">
          <h4>Customer Details</h4>
          <p>
            <strong className="customer-name">
              {order.customer_name}
            </strong>
          </p>

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
   {OpeninvoiceModal && (
  <div className="invoice-modal-overlay" onClick={() => setOpenInvoiceModal(false)}>
    
    <div
      className="invoice-container"
      onClick={(e) => e.stopPropagation()}   
    >
      
    
      <button
        className="invoice-close"
        onClick={() => setOpenInvoiceModal(false)}
      >
        ✕
      </button>

     
  <div className="invoice-header">
  <div className="logo-title">
    <img
      src={logo1}   
      alt="Company Logo"
      className="invoice-logo"
    />
    <h2>Invoice</h2>
  </div>
</div>


        <div className="invoice-actions">
          <div className="invoice-meta">
            <span>INVOICE #2025</span>
            <small>15/12/2025</small>
          </div>
          <button className="print-btn">🖨 Print Invoice</button>
        </div>
      </div>

     
      <div className="company-info">
        <strong>ABC E-Commerce Pvt. Ltd.</strong>
        <p>#101, MG Road, Bengaluru, Karnataka – 560001</p>
        <p>+91 9876543210</p>
        <p>support@abccommerce.com</p>
      </div>

    
      <div className="info-grid">
        <div className="info-card">
          <h4>Billing Information</h4>
          <p><strong>Toshani None</strong></p>
          <p>Flat No. 101, Sunrise Apartments,</p>
          <p>Bengaluru – 560001</p>
          <p>📞 9876543210</p>
        </div>

        <div className="info-card">
          <h4>Payment Method</h4>
          <div className="payment-row">
            <span>Cash on Delivery</span>
            <span className="status pending">Pending</span>
          </div>
      <p className="billing-row">
  <span>Billing Address:</span>
  <span >560001</span>
</p>
        </div>
      </div>

      
      <div className="order-summary">
        <div className="summary-header">
          <span>Order Summary</span>
          <span>Qty</span>
          <span>Amount</span>
        </div>

        <div className="summary-row">
          <span>No product available</span>
          <span>-</span>
          <span>₹1668.24</span>
        </div>

        <div className="summary-row">
          <span></span>
          <span>Subtotal</span>
          <span>₹1668.24</span>
        </div>

        <div className="summary-row">
          <span></span>
          <span>Delivery Charges</span>
          <span>₹0.00</span>
        </div>

        <div className="summary-total">
          <span>Total Amount</span>
          <span>₹1668.24</span>
        </div>
      </div>

     
      <div className="invoice-footer">
        <h4>Thank you for your purchase!</h4>
        <p>
          Please keep this invoice for your records. You can pay the total
          amount via cash upon delivery.
        </p>
        <small>
          This is a computer-generated document and does not require a
          signature.
        </small>
      </div>

     
    </div>

)}


    </div>





  );
};

export default OrderModal;
