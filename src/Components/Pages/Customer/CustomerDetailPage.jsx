import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./CustomerDetailpage.css";
import { FaFileMedical } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import {
  FaSpa, FaHeart,FaLeaf,FaRunning,FaUtensils
} from "react-icons/fa";
import ConsultationOrder from "../../Pages/Customer/ConsultationOrder";
import Paymenthistory from "./Paymenthistory";
import Producthistory from "./Producthistory";
import ActivityLog from "./ActivityLog";
import aayushi from "../../Assests/aayushi.jpeg";
import { FaDownload } from "react-icons/fa";
import OrderModal from "../Order/OrderModal";
import { ToastContainer, toast } from "react-toastify";
import BASE_URL from "../../../Base";




const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const[Loading,setLoading]=useState(false);
  const[Error,setError]=useState(null);
  const navigate =useNavigate();
  const [activeTab,setActiveTab] =useState("overview");
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
 const [customer, setCustomer] = useState(null);
const [summary, setSummary] = useState(null);
const [healthOverview, setHealthOverview] = useState(null);
const [ordersData, setOrdersData] = useState([]);
const [prescriptions, setPrescriptions] = useState([]);
 
 const getCustomerDetail = async () => {

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired");
      navigate("/login");
      return;
    }

    try {

      setLoading(true);


      const response = await fetch(
        `${BASE_URL}/doctors/admin/doctor?id=${customerId}`,
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
     
    if (data.success) {
  setCustomer(data.data.customer);

  setSummary(data.data.summary);

  setHealthOverview(data.data.overview.health_overview);

  setOrdersData(data.data.history.product_orders.results);

  setPrescriptions(data.data.history.prescriptions.results);
}
    } catch (err) {

      console.error(err);

      setError("Failed to fetch doctor");

      toast.error("Failed to fetch doctor");

    } finally {

      setLoading(false);

    }
  };
  return (
    <>
      
      <div className="customer-details-wrapper">

        <div className="customer-profile-card">

          <div className="customer-left">
            <div className="customer-avatar1">
              <div className="avatar-circle"></div>
            </div>

            <div className="customer-info">

              <div className="customer-top">
                <h2>Amit Sharma</h2>
              </div>

              <div className="customer-contact">
                <span>amitsharma95@gmail.com</span>
                <span>•</span>
                <span>+91 98765 43210</span>
              </div>

              <div className="customer-meta">
                <span>Male</span>
                <span>•</span>
                <span>29 Years</span>
                <span>•</span>
                <span>Blood Group O+</span>
              </div>

              <div className="registered-date">
                Registered on: 12 Feb 2024 • 10:30 AM
              </div>

              <button className="patient-btn">Patient</button>
            </div>
          </div>

          <div className="customer-id">
            <p>Customer ID</p>
            <h4>CUS100245</h4>
          </div>
        </div>

       
        <div className="customer-stats-card">

          <div className="stat-box">
            <div className="stat-icon1 green">🛍</div>

            <div>
              <p>Total Orders</p>
              <h3>12</h3>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon1 green">₹</div>

            <div>
              <p>Total Spent</p>
              <h3>₹18,450</h3>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon1 green"><FaFileMedical/></div>

            <div>
              <p>Total Prescriptions</p>
              <h3>8</h3>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon1 green"><FaCalendarAlt/></div>

            <div>
              <p>Last Order Date</p>
              <h3>18 May 2024</h3>
            </div>
          </div>
        </div>
      </div>

      
   <div className="tabs">

  <button
    className={activeTab === "overview" ? "active-tab" : ""}
    onClick={() => setActiveTab("overview")}
  >
    Overview
  </button>

  <button
    className={activeTab === "orders" ? "active-tab" : ""}
    onClick={() => setActiveTab("orders")}
  >
    Orders History
  </button>

  <button
    className={activeTab === "consultation" ? "active-tab" : ""}
    onClick={() => setActiveTab("consultation")}
  >
    Consultation Order
  </button>

  <button
    className={activeTab === "payment" ? "active-tab" : ""}
    onClick={() => setActiveTab("payment")}
  >
    Payment History
  </button>

  <button
    className={activeTab === "activity" ? "active-tab" : ""}
    onClick={() => setActiveTab("activity")}
  >
    Activity Log
  </button>

</div>
{activeTab==="overview" && (
   <div className="customer-content-wrapper">

       
        <div className="customer-left-content">

       
          <div className="info-grid">

           
            <div className="info-card">

              <h3>About Customer</h3>

              <div className="info-row">
                <span>Full Name</span>
                <p>Amit Sharma</p>
              </div>

              <div className="info-row">
                <span>Email</span>
                <p>amitsharma95@gmail.com</p>
              </div>

              <div className="info-row">
                <span>Phone</span>
                <p>+91 98765 43210</p>
              </div>

              <div className="info-row">
                <span>Date of Birth</span>
                <p>15 Aug 1994</p>
              </div>

              <div className="info-row">
                <span>Gender</span>
                <p>Male</p>
              </div>

              <div className="info-row">
                <span>Blood Group</span>
                <p>O+</p>
              </div>

              <div className="info-row">
                <span>Address</span>
                <p>123, Green Park, Indore</p>
              </div>
            </div>

          
            <div className="info-card">

              <h3>Health Overview</h3>

             <div className="info-row">
  <span>
 
    Prakriti (Body Type)
  </span>
  <p>Pitta-Vata</p>
</div>

<div className="info-row">
  <span>
 
    Current Health Concern
  </span>
  <p>Acidity, Hair Fall, Stress</p>
</div>

<div className="info-row">
  <span>
  
    Allergies
  </span>
  <p>Dust, Pollen</p>
</div>

<div className="info-row">
  <span>
  
    Lifestyle
  </span>
  <p>Sedentary</p>
</div>
<div className="info-row">
  <span>
  
    Lifestyle
  </span>
  <p>Sedentary</p>
</div>

<div className="info-row">
  <span>
    Diet Preference
  </span>
  <p>Vegetarian</p>
</div>
<div className="info-row">
  <span>
  
    Allergies
  </span>
  <p>Dust, Pollen</p>
</div>

              {/* <button className="medical-btn">
                View Full Medical History
              </button> */}
            </div>
          </div>

         
          <div className="orders-history-card">

            <div className="orders-head">
              <h3>Orders History</h3>
<button
  className="medical-btn"
  onClick={() => setActiveTab("orders")}
>
  View All Orders
</button>
            </div>
<div className="table-wrapper">
  <table className="data-table">
    
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Date</th>
        <th>Items</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      {Loading ? (
        Array(3)
          .fill(0)
          .map((_, i) => (
            <tr key={i}>
              <td colSpan="5">
                <div className="skeleton-row"></div>
              </td>
            </tr>
          ))
      ) : Error ? (
        <tr>
          <td colSpan="5" style={{ color: "red" }}>
            {Error}
          </td>
        </tr>
      ) : ordersData?.length > 0 ? (
        ordersData.map((order, index) => (
          <tr key={index}>
            <td>{order.id}</td>
            <td>{order.date}</td>
            <td>{order.items}</td>
            <td>{order.amount}</td>
            <td>
              <span className={`status ${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5">No Orders Found</td>
        </tr>
      )}
    </tbody>

  </table>
</div>
          
          </div>
        </div>

       
        <div className="customer-right-content">

        
          <div className="side-card">

            <div className="side-card-top">
              <h3>Recent Prescription</h3>

              <button className="medical-btn">View All</button>

            </div>

            <div className="prescription-box">

              <div className="prescription-row">
                <span>Prescription ID</span>
                <p>PRX100289</p>
              </div>

              <div className="prescription-row">
                <span>Doctor</span>
                <p className="doctor-name">Dr. Neha Verma</p>
              </div>

              <div className="prescription-row">
                <span>Date</span>
                <p>15 May 2024</p>
              </div>

              <div className="prescription-footer">

               <button
  className="medical-btn"
  onClick={() => setShowPrescriptionModal(true)}
>
  View Prescription
</button>

              

              </div>
            </div>
          </div>

          
          <div className="side-card">
  <div className="side-card-top">
    <h3>Recent Order</h3>
   <button
  className="medical-btn"
  onClick={() => setActiveTab("orders")}
>
  View All 
</button>
  </div>

  <div className="recent-order-box">
    {/* Center Image */}
    <div className="recent-order-image">
      <img
        src={aayushi}
        alt="Product"
      />
    </div>

    <h4>Ashwagandha Tablets</h4>

    <div className="recent-order-row">
      <span>Qty :</span>
      <p>2</p>
    </div>

    <div className="recent-order-row">
      <span>Amount :</span>
      <p>₹499</p>
    </div>

  <button
  className="medical-btn"
  onClick={() => setShowOrderModal(true)}
>
  View Order Details
</button>
  </div>
</div>

         

        </div>
      </div>
)}

{showPrescriptionModal && (
  <div
    className="prescription-modal-overlay"
    onClick={() => setShowPrescriptionModal(false)}
  >
    <div
      className="prescription-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="prescription-modal-header">
        <h2>Prescription Details</h2>

        <button
          className="close-btn"
          onClick={() => setShowPrescriptionModal(false)}
        >
          ✕
        </button>
      </div>

      <div className="prescription-modal-body">

        <div className="prescription-left">
          <div className="detail-box">
            <span>Prescription ID</span>
            <h4>PRX100289</h4>
          </div>

          <div className="detail-box">
            <span>Doctor</span>
            <h4>Dr. Neha Verma</h4>
          </div>

          <div className="detail-box">
            <span>Date</span>
            <h4>15 May 2024</h4>
          </div>

         <button className="download-btn">
  <FaDownload />
  <span>Download PDF</span>
</button>
        </div>

        <div className="prescription-right">
          <h3>Medicines Prescribed</h3>

          <table className="medicine-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>Ashwagandha Tablets</td>
                <td>1 Tablet</td>
                <td>Twice Daily</td>
                <td>30 Days</td>
              </tr>

              <tr>
                <td>Triphala Churna</td>
                <td>1 Tsp</td>
                <td>Night</td>
                <td>30 Days</td>
              </tr>

              <tr>
                <td>Brahmi Syrup</td>
                <td>10 ml</td>
                <td>Twice Daily</td>
                <td>30 Days</td>
              </tr>
            </tbody>
          </table>

          <div className="instructions">
            <h4>Instructions</h4>

            <ul>
              <li>Take medicines after meals.</li>
              <li>Drink warm water.</li>
              <li>Avoid oily foods.</li>
              <li>Maintain proper sleep.</li>
            </ul>
          </div>
        </div>

      
      </div>
        <div className="prescription-modal-footer">
  <button
    className="closeee-btn"
    onClick={()=>setShowPrescriptionModal(false)} // ya setShowModal(false)
  >
    Close
  </button>
</div>
    </div>
  </div>
)}

{showOrderModal && (
  <div
    className="order-modal-overlay"
    onClick={() => setShowOrderModal(false)}
  >
  <div className="order-modal">

  {/* Header */}
  <div className="order-header">
    <h2>Order Details</h2>
    <button
      className="close-btn"
      onClick={() => setShowOrderModal(false)}
    >
      ✕
    </button>
  </div>

  {/* Top Section */}
  <div className="order-top-info">

    <div className="top-item">
      <span>Order ID</span>
      <h3>#ORD001</h3>
    </div>

    <div className="top-item">
      <span>Order Date</span>
      <h3>08 May 2026</h3>
    </div>

    <div className="top-item">
      <span>Order Status</span>
      <div className="status-badge pending">
        ● Pending
      </div>
    </div>

  </div>

  <div className="order-grid">

    {/* LEFT */}

    <div className="left-column">

      <div className="card">
        <h3>Order Items</h3>

        <div className="table-header">
          <span>Product</span>
          <span>Price</span>
          <span>Qty</span>
          <span>Total</span>
        </div>

        <div className="item-row">
          <div className="product-info">
            <img src={aayushi} alt="" />

            <div>
              <h4>Ashwagandha Tablets</h4>
              <p>Himalaya Wellness</p>
              <span>Pack of 60 Tablets</span>
            </div>
          </div>

          <div>₹249</div>
          <div>2</div>
          <div>₹499</div>
        </div>
      </div>

      <div className="card">
        <h3>Order Summary</h3>

        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹499</span>
        </div>

        <div className="summary-row">
          <span>Shipping Charges</span>
          <span>₹50</span>
        </div>

        <div className="summary-row">
          <span>Discount</span>
          <span className="discount">-₹50</span>
        </div>

        <div className="total-row">
          <span>Total Amount</span>
          <span>₹499</span>
        </div>
      </div>

      <div className="card">
        <h3>Order Timeline</h3>

        <div className="timeline">

          <div className="timeline-step active">
            <div className="circle"></div>
            <h5>Order Placed</h5>
          </div>

          <div className="timeline-line"></div>

          <div className="timeline-step active">
            <div className="circle"></div>
            <h5>Packed</h5>
          </div>

          <div className="timeline-line"></div>

          <div className="timeline-step active">
            <div className="circle"></div>
            <h5>Shipped</h5>
          </div>

          <div className="timeline-line"></div>

          <div className="timeline-step">
            <div className="circle"></div>
            <h5>Delivered</h5>
          </div>

        </div>
      </div>

    </div>

    {/* RIGHT */}

    <div className="right-column">

      <div className="card">
        <h3>Shipping Address</h3>

        <p>Amit Sharma</p>
        <p>+91 9876543210</p>
        <p>123 Green Park, Indore</p>
      </div>

      <div className="card">
        <h3>Payment Information</h3>

        <div className="summary-row">
          <span>Payment Method</span>
          <span>UPI</span>
        </div>

        <div className="summary-row">
          <span>Payment Status</span>
          <span className="paid">Paid</span>
        </div>

        <div className="summary-row">
          <span>Transaction ID</span>
          <span>UPI123456789</span>
        </div>
      </div>

      <div className="card action-card">

        <h3>Order Actions</h3>

        <button className="invoice-btn">
          Download Invoice
        </button>

        <button className="close-order-btn">
          Close
        </button>

      </div>

    </div>

  </div>

</div>
    </div>
  
)}
{
  activeTab==="orders"&&(
    <Producthistory/>
  )

  
}
    {
      activeTab==="consultation" &&(
        <ConsultationOrder/>
      )
    } 

    {
      activeTab==="payment" &&(
        <Paymenthistory/>
      )
    }

    {
      activeTab==="activity" &&(
        <ActivityLog/>
      )
    }
    </>
  );
};

export default CustomerDetailPage;