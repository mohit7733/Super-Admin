import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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




const CustomerDetailPage = () => {
  const[Loading,setLoading]=useState(false);
  const[Error,setError]=useState(null);
  const Navigate =useNavigate();
  const [activeTab,setActiveTab] =useState("overview")
  const ordersData = [
  {
    id: "#ORD001",
    date: "08 May 2026",
    items: 3,
    amount: "₹1,250",
    status: "Pending",
  },
  {
    id: "#ORD002",
    date: "07 May 2026",
    items: 1,
    amount: "₹599",
    status: "Delivered",
  },
  {
    id: "#ORD003",
    date: "06 May 2026",
    items: 5,
    amount: "₹2,340",
    status: "Packing",
  },
  {
    id: "#ORD004",
    date: "05 May 2026",
    items: 2,
    amount: "₹899",
    status: "Shipped",
  },
  {
    id: "#ORD005",
    date: "04 May 2026",
    items: 4,
    amount: "₹1,780",
    status: "Cancelled",
  },
];

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

      
    <div className="tabs-section">

  <button
    className={activeTab === "overview" ? "active" : ""}
    onClick={() => setActiveTab("overview")}
  >
    Overview
  </button>

  <button
    className={activeTab === "orders" ? "active" : ""}
    onClick={() => setActiveTab("orders")}
  >
    Orders History
  </button>

  <button
    className={activeTab === "consultation" ? "active" : ""}
    onClick={() => setActiveTab("consultation")}
  >
    Consultation Order
  </button>

  

  <button
    className={activeTab === "payment" ? "active" : ""}
    onClick={() => setActiveTab("payment")}
  >
    Payment History
  </button>

  <button
    className={activeTab === "activity" ? "active" : ""}
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

             <div className="health-row">
  <span>
    <FaSpa className="health-icon" />
    Prakriti (Body Type)
  </span>
  <p>Pitta-Vata</p>
</div>

<div className="health-row">
  <span>
    <FaHeart className="health-icon" />
    Current Health Concern
  </span>
  <p>Acidity, Hair Fall, Stress</p>
</div>

<div className="health-row">
  <span>
    <FaLeaf className="health-icon" />
    Allergies
  </span>
  <p>Dust, Pollen</p>
</div>

<div className="health-row">
  <span>
    <FaRunning className="health-icon" />
    Lifestyle
  </span>
  <p>Sedentary</p>
</div>

<div className="health-row">
  <span>
    <FaUtensils className="health-icon" />
    Diet Preference
  </span>
  <p>Vegetarian</p>
</div>

              <button className="medical-btn">
                View Full Medical History
              </button>
            </div>
          </div>

         
          <div className="orders-history-card">

            <div className="orders-head">
              <h3>Orders History</h3>

              <button className="medical-btn">View All Orders</button>
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

                <button className="medical-btn">
                  View Prescription
                </button>

              

              </div>
            </div>
          </div>

          
          <div className="side-card">

            <div className="side-card-top">
              <h3>Recent Order</h3>

              <button className="medical-btn">View All</button>
            </div>

            <div className="recent-order-box">

              <h4>Ashwagandha Tablets</h4>

              <div className="recent-order-row">
                <span>Qty :</span>
                <p>2</p>
              </div>

              <div className="recent-order-row">
                <span>Amount :</span>
                <p>₹499</p>
              </div>

              <button className="medical-btn">
                View Order Details
              </button>
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