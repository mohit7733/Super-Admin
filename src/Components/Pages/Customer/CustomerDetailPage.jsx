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

import ActivityLog from "./ActivityLog";
import Allprescription from "./AllPrescription";
import aayushi from "../../Assests/aayushi.jpeg";
import { FaDownload } from "react-icons/fa";

import { ToastContainer, toast } from "react-toastify";
import BASE_URL from "../../../Base";
import prescriptionEmpty from "../../Assests/orderempty.svg";
import orderEmpty from "../../Assests/fff.svg";
import CustomerSkeleton from "./CustomerSkeleton";
import Producthistory from "./Producthistory";
import OrderModal from "./OrderModal"




const CustomerDetailPage = () => {
  const { customerId } = useParams();
  const[Loading,setLoading]=useState(false);
  const[Error,setError]=useState(null);
  const navigate =useNavigate();
  const [activeTab,setActiveTab] =useState("overview");
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
const [customerData, setCustomerData] = useState(null);
const [summary, setSummary] = useState(null);
const [healthOverview, setHealthOverview] = useState(null);
const [ordersData, setOrdersData] = useState([]);
const [prescriptions, setPrescriptions] = useState([]);

const [selectedOrder, setSelectedOrder] = useState(null);

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
 
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
        `${BASE_URL}/customers/admin/customers/?id=${customerId}`,
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
  setCustomerData(data.data.customer);
  setSummary(data.data.summary);
  setHealthOverview(data.data.overview.health_overview);
    setOrdersData(data.data.recent_orders || []);  
   setPrescriptions(data.data.prescriptions || []);
 
}
    } catch (err) {

      console.error(err);

      setError("Failed to fetch doctor");

      toast.error("Failed to fetch doctor");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
  console.log("useEffect Called");
  getCustomerDetail();
}, [customerId]);
useEffect(() => {
  console.table(
    ordersData.map((order) => ({
      order_id: order.order_id,
      order_code: order.order_display_code,
    }))
  );
}, [ordersData]);
if (Loading) {
  return <CustomerSkeleton />;
}

if (Error) {
  return (
    <div className="customer-error-page">
      <div className="customer-error-card">
        <img
          src="https://cdn-icons-png.flaticon.com/512/564/564619.png"
          alt="Error"
          className="customer-error-image"
        />

        <h2>Unable to Load Customer Details</h2>

        <p>
          Something went wrong while fetching the customer information.
          Please try again in a few moments.
        </p>

        <button
          className="customer-retry-btn"
          onClick={getCustomerDetail}
        >
          Retry
        </button>
      </div>
    </div>
  );
}


  return (
    <>
     <div className="customer-details-wrapper">

  <div className="customer-profile-card">

    <div className="customer-left">
       <div className="avatar-section">
              <div className="avatar-wrapper">
                {customerData?.profile_image ? (
                  <img
                    src={customerData.profile_image}
                    alt="doctor"
                    className="avatar-img"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {customerData?.first_name?.charAt(0)?.toUpperCase()}
                    {customerData?.last_name?.charAt(0)?.toUpperCase()}
                  </div>
                )}

              </div>
              <div className="status-badges">
             


              </div>
            </div>

      <div className="customer-info">

        <div className="customer-top">
          <h2>
            {customerData?.first_name} {customerData?.last_name}
          </h2>
        </div>

        <div className="customer-contact">
          <span>{customerData?.email || "N/A"}</span>
          <span>•</span>
          <span>{customerData?.phone_number || "N/A"}</span>
        </div>

        <div className="customer-meta">
          <span>{customerData?.gender || "N/A"}</span>
          <span>•</span>
          <span>{customerData?.age ? `${customerData.age} Years` : "N/A"}</span>
          <span>•</span>
          <span>
            Blood Group {customerData?.blood_group || "N/A"}
          </span>
        </div>

        <div className="registered-date">
          Registered on:{" "}
          {customerData?.created_at
            ? formatDate(customerData.created_at)
            : "N/A"}
        </div>

        <button className="patient-btn">
          {customerData?.role || "Customer"}
        </button>

      </div>
    </div>

    <div className="customer-id">
      <p>Customer ID</p>
      <h4>{customerData?.id|| "N/A"}</h4>
    </div>

  </div>

 <div className="customer-stats-card">

  <div className="stat-box">
    <div className="stat-icon1 green">🛍</div>
    <div>
      <p>Total Orders</p>
      <h3>{summary?.total_orders ?? 0}</h3>
    </div>
  </div>

  <div className="stat-box">
    <div className="stat-icon1 green">₹</div>
    <div>
      <p>Total Spent</p>
      <h3>₹{summary?.total_spent ?? 0}</h3>
    </div>
  </div>

  <div className="stat-box">
    <div className="stat-icon1 green">
      <FaFileMedical />
    </div>
    <div>
      <p>Total Prescriptions</p>
      <h3>{summary?.total_prescriptions ?? 0}</h3>
    </div>
  </div>

  <div className="stat-box">
    <div className="stat-icon1 green">
      <FaCalendarAlt />
    </div>
    <div>
      <p>Last Order Date</p>
      <h3>
        {summary?.last_order_date
          ? formatDate(summary.last_order_date)
          : "N/A"}
      </h3>
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
  Orders
</button>
<button
    className={activeTab === "Consultation" ? "active-tab" : ""}
    onClick={() => setActiveTab("Consultation")}
  >
  Consultation
  </button>
  <button
    className={activeTab === "payment" ? "active-tab" : ""}
    onClick={() => setActiveTab("payment")}
  >
   Transaction
  </button>

 

   <button
    className={activeTab === "Prescription" ? "active-tab" : ""}
    onClick={() => setActiveTab("Prescription")}
  >
    Prescription
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
    <p>{customerData?.full_name || "N/A"}</p>
  </div>

  <div className="info-row">
    <span>Email</span>
    <p>{customerData?.email || "N/A"}</p>
  </div>

  <div className="info-row">
    <span>Phone</span>
    <p>{customerData?.phone_number || "N/A"}</p>
  </div>

  <div className="info-row">
    <span>Date of Birth</span>
    <p>{formatDate(customerData?.date_of_birth)}</p>
  </div>

  <div className="info-row">
    <span>Age</span>
    <p>{customerData?.age || "N/A"}</p>
  </div>

  <div className="info-row">
    <span>Gender</span>
    <p>{customerData?.gender || "N/A"}</p>
  </div>

  

  

 

  <div className="info-row">
    <span>Address</span>
 <p>
  {customerData?.address
    ? `${customerData.address.address_line_1},
       ${customerData.address.address_line_2},
       ${customerData.address.city},
       ${customerData.address.state},
       ${customerData.address.zipcode},
       ${customerData.address.country}`
    : "N/A"}
</p>
  </div>

  
</div>

          
       <div className="info-card">
  <h3>Health Overview</h3>

 <div className="info-row">
  <span>Prakriti (Body Type)</span>
  <p>{healthOverview?.prakriti_analysis?.result || "N/A"}</p>
</div>

 <div className="info-row">
  <span>Current Health Concern</span>
  <p>
    {healthOverview?.current_health_concerns?.length
      ? healthOverview.current_health_concerns.join(", ")
      : "N/A"}
  </p>
</div>
  <div className="info-row">
    <span>Allergies</span>
    <p>{healthOverview?.allergies || "N/A"}</p>
  </div>

  <div className="info-row">
    <span>Lifestyle</span>
    <p>{healthOverview?.lifestyle || "N/A"}</p>
  </div>

  <div className="info-row">
    <span>Diet Preference</span>
    <p>{healthOverview?.diet_preference || "N/A"}</p>
  </div>

  <div className="info-row">
    <span>Sleep Duration</span>
    <p>{healthOverview?.sleep_duration || "N/A"}</p>
  </div>

  <div className="info-row">
    <span>Sleep Quality</span>
    <p>{healthOverview?.sleep_quality || "N/A"}</p>
  </div>
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
        <th>Order code</th>
        <th>Date</th>
        <th>Items</th>
        <th>Amount</th>
        <th>Status</th>
      </tr>
    </thead>

  <tbody>
  {Loading ? (
    Array.from({ length: 3 }).map((_, i) => (
      <tr key={i}>
        <td colSpan="5">
          <div className="skeleton-row"></div>
        </td>
      </tr>
    ))
  ) : Error ? (
    <tr>
      <td colSpan="5">
        <div className="empty-card">
          <img
            src={orderEmpty}
            alt="Error"
            className="empty-image"
          />

          <h4>Unable to Load Orders</h4>

          <p>
            Something went wrong while fetching order history.
          </p>

          <button
            className="medical-btn"
            onClick={getCustomerDetail}
          >
            Retry
          </button>
        </div>
      </td>
    </tr>
  ) : ordersData?.length ? (
    ordersData.map((order) => (
      <tr key={order.order_item_id}>
        <td>{order.order_display_code}</td>

        <td>
          {new Date(order.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </td>

     <td className="items-cell">
  <div className="items-count">
    {order.items_count} {order.items_count > 1 ? "Items" : "Item"}
  </div>

  <div className="items-list">
    {order.items?.slice(0, 2).map((item) => (
      <div key={item.product_id || item.product_name}>
        {item.product_name}
      </div>
    ))}

    {order.items?.length > 2 && (
     <button
  className="more-items-btn"
  onClick={() => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  }}
>
  +{order.items.length - 2} More
</button>
    )}
  </div>
</td>
        <td>₹{Number(order.total_amount).toFixed(2)}</td>

        <td>
          <span className={`status ${order.status.toLowerCase()}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5">
        <div className="empty-card">
          <img
            src={orderEmpty}
            alt="No Orders"
            className="empty-image"
          />

          <h4>No Orders Found</h4>

          <p>
            This customer has not placed any orders yet.
          </p>
        </div>
      </td>
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

    {prescriptions.length > 0 && (
      <button
        className="medical-btn"
        onClick={() => setActiveTab("prescription")}
      >
        View All
      </button>
    )}
  </div>

  {prescriptions.length > 0 ? (
    <div className="prescription-box">

      <div className="prescription-row">
        <span>Prescription ID</span>
        <p>{prescriptions[0].prescription_code}</p>
      </div>

      <div className="prescription-row">
        <span>Doctor</span>
        <p className="doctor-name">
          {prescriptions[0].doctor_name}
        </p>
      </div>

      <div className="prescription-row">
        <span>Date</span>
        <p>{prescriptions[0].appointment_date}</p>
      </div>

      <div className="prescription-footer">
        <button
          className="medical-btn"
          onClick={() => {
          
            setShowPrescriptionModal(true);
          }}
        >
          View Prescription
        </button>
      </div>

    </div>
  ) : (
    <div className="empty-card">

    <img src={prescriptionEmpty} alt="No Prescription" className="empty-image" />

      <h4>No Prescription Found</h4>

      <p>
        There is no prescription available for this customer yet.
      </p>

    </div>
  )}
</div>

          
          <div className="side-card">

  <div className="side-card-top">
    <h3>Recent Order</h3>

    {ordersData.length > 0 && (
      <button
        className="medical-btn"
        onClick={() => setActiveTab("orders")}
      >
        View All
      </button>
    )}
  </div>

  {ordersData.length > 0 ? (

    <div className="recent-order-box">
<div className="recent-order-image">
  <img
    src={ordersData?.[0]?.items?.[0]?.cover_image}
    alt={ordersData?.[0]?.items?.[0]?.product_name || "Product"}
    className="recent-order-img"
    onError={(e) => {
      e.target.src = orderEmpty; // optional fallback
    }}
  />
</div>

      <h4>{ordersData[0].items?.[0]?.product_name}</h4>

      <div className="recent-order-row">
        <span>Qty :</span>
        <p>{ordersData[0].items?.[0]?.quantity}</p>
      </div>

      <div className="recent-order-row">
        <span>Amount :</span>
        <p>₹{ordersData[0].total_amount}</p>
      </div>

      <button
        className="medical-btn"
        onClick={() => {
          setShowOrderModal(true);
        }}
      >
        View Order Details
      </button>

    </div>

  ) : (

    <div className="empty-card">
<img src={orderEmpty} alt="No Orders" className="empty-image" />
      <h4>No Orders Found</h4>

      <p>
        This customer has not placed any orders yet.
      </p>

    </div>

  )}

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

{showOrderModal && selectedOrder && (
  <OrderModal
    order={selectedOrder}
    onClose={() => {
      setShowOrderModal(false);
      setSelectedOrder(null);
    }}
  />
)}
{
  activeTab==="Consultation"&&(
    <ConsultationOrder/>
  )

}

 
    {
      activeTab==="Prescription" &&(
        <Allprescription/>
      )
    }
      {
      activeTab==="orders" &&(
        <Producthistory/>
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