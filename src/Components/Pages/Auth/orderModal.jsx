import React from "react";
import { useState } from "react";
import { FiPhone } from "react-icons/fi";
import logo1 from '';

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
    { OpeninvoiceModal && (

  
 <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="logo-title">
            <img src={logo1} alt="Company Logo" className="company-logo" />
            <h2>Invoice</h2>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="invoice-container">
          <div className="invoice-header">
            <h3>Invoice #: {order.id}</h3>
            <p>Date: {new Date(order.date).toLocaleDateString()}</p>
          </div>

          <div className="invoice-parties">
            <div>
              <h4>Seller</h4>
              <p>{order.seller.name}</p>
              <p>{order.seller.email}</p>
              <p>{order.seller.phone}</p>
            </div>
            <div>
              <h4>Buyer</h4>
              <p>{order.customer.name}</p>
              <p>{order.customer.email}</p>
              <p>{order.customer.phone}</p>
            </div>
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.price}</td>
                  <td>₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-summary">
            <p><strong>Subtotal:</strong> ₹{order.subtotal}</p>
            <p><strong>Tax:</strong> ₹{order.tax}</p>
            <p><strong>Total:</strong> ₹{order.total}</p>
          </div>

          <div className="invoice-footer">
            <p>Thank you for your business!</p>
          </div>
        </div>

        <div className="modal-actions">
          <button  className="action-btn print-btn">Print</button>
          <button className="action-btn download-btn">Download PDF</button>
        </div>
      </div>
    </div>
    
 
  )
};


    </div>





  );
};

export default OrderModal;
