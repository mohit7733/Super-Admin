import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";


const CustomerDetailPage = () => { const params = useParams();
  const { customerId } = params;

  const [SearchOrderlistTerm, setSearchOrderlistTerm] = useState("");
  const [OrderlistData, setOrderlistData] = useState([]);
  const [error, setError] = useState(null);
  const [orderlistloading, setOrderlistloading] = useState(true);
 
  const [Customererror, setCustomererror] = useState(null);
  const [Customerloading, setCustomerloading] = useState(true);
  const[ActiveOrderType,setActiveOrderType]=useState("product")
  const[ProductOrderperpage,setProductOrderperpage]=useState(5)
  const[CurrentProductOrder,setCurrentProductOrder]=useState(1)
  const[consultationperpage,setconsultationperpage]=useState(5)
  const[currentConsultationpage,setCurrentconsultationpage]=useState(1)
  const [previewImage, setPreviewImage] = useState(null);
const [showPreviewModal, setShowPreviewModal] = useState(false);
const[showCustomerDetail,setShowCustomerDetail] = useState([])
const navigate = useNavigate();


const handleNavigate = (id) => {
    navigate(`/Items/${id}`);
  };

    const searchPlaceholder =
    ActiveOrderType === "product"
      ? "Search by product name..."
      : "Search by doctor name or specialization...";

  const fetchOrderlist = async () => {
    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(`${BASE_URL}/orders/getorderbycustomerid/${customerId}/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization:`Bearer ${token}`,
        },
      })
       if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }
      const data = await response.json();
      setOrderlistData(data.orders);
      setShowCustomerDetail(data.customer)
      
    }
    catch (err) {
      console.error(err.message);
      setError('Something went wrong while fetching data.');
    }
    finally {
      setOrderlistloading(false);
    }
  }
  useEffect(() => {
    fetchOrderlist();
  }, [])


  const handlecancelorder = async (orderId) => {
    const token = sessionStorage.getItem("superadmin_token")

    try {
      const response = await fetch(
        `${BASE_URL}/orders/cancelorder/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
             Authorization: `Bearer ${token}`,

          },
          body: JSON.stringify({ order_id: orderId }),
        }
      );
 if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }

      if (!response.ok) {
        throw new Error("Failed to cancel order");
      }

      const result = await response.json();
      console.log("Cancel Order Response:", result);
      toast.success("Order cancelled successfully ")
      fetchOrderlist();



    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel the order. Please try again.");
    }
  };


  console.log(OrderlistData,"orderlist");
  
const filteredOrders = OrderlistData?.filter(order => {
  const matchesType = order.order_type === ActiveOrderType;


  if (!SearchOrderlistTerm.trim()) {
    return matchesType;
  }

  const searchTerm = SearchOrderlistTerm.toLowerCase().trim();

  if (order.order_type === "product" && Array.isArray(order.items) && order?.items?.length > 0) {
    return (
      matchesType &&
      order.items.some(item =>
        item.product_name?.toLowerCase().includes(searchTerm)
      )
    );
  }


  if (order.order_type === "consultation") {
    const doctorName = order.doctor_name?.toLowerCase() || "";
    const specializations = Array.isArray(order.doctor_specializations)
      ? order.doctor_specializations.map(s => s.toLowerCase()).join(" ")
      : (order.doctor_specializations?.toLowerCase() || "");

    return (
      matchesType &&
      (doctorName.includes(searchTerm) || specializations.includes(searchTerm))
    );
  }

  return false;
});


  const showOrders = SearchOrderlistTerm.trim()
    ? filteredOrders
    : OrderlistData;




const indexoflastorder =CurrentProductOrder*ProductOrderperpage;
const indexoffirstorder =indexoflastorder -ProductOrderperpage;
 const totalPages = Math.ceil(showOrders?.length /ProductOrderperpage);
 const  currentOrder=showOrders?.slice(indexoffirstorder,indexoflastorder);
 const handlePageChange=(pagenumber)=>setCurrentProductOrder(pagenumber);

 const indexoflastconsultationorder=currentConsultationpage*consultationperpage;
 const indexoffirstconsultationorder= indexoflastconsultationorder - consultationperpage;
 const currentConsultation =showOrders?.slice(indexoffirstconsultationorder,indexoflastconsultationorder);
 
 const totalpage=Math.ceil(showOrders ?.length/consultationperpage);
 const handlePagechanges=(pageNumber)=>setCurrentconsultationpage(pageNumber);


  return (
    <>



      <div className="page-header">
        <h2>Customer Detail</h2>
      </div>
<div className="customers-controls">

<div className="search-bar">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={SearchOrderlistTerm}
          onChange={(e) => setSearchOrderlistTerm(e.target.value)}
          className="search-input"
        />
      </div>


        <div className="filter-controls">
          <button className="export-btn">Export Details</button>
        </div>
      </div>
      


<div className="customer-detail-card">
  <div className="customer-header">
    <img
      src={showCustomerDetail?.profile_picture || "https://via.placeholder.com/100"}
      alt="Profile"
      className="customer-profile-img"
    />
    <div>
      <h3 className="customer-name">
        {showCustomerDetail?.first_name || "N/A"} {showCustomerDetail?.last_name || ""}
      </h3>
      <p className="customer-role">Customer</p>
    </div>
  </div>

  <div className="customer-info-grid">
    

    <div className="info-item">
      <label>Verified Phone Number:</label>
      <span>{showCustomerDetail?.verified_phone_number || "N/A"}</span>
    </div>

    <div className="info-item">
      <label>Email:</label>
      <span>{showCustomerDetail?.email || "N/A"}</span>
    </div>

    <div className="info-item">
      <label>Gender:</label>
      <span>{showCustomerDetail?.gender || "N/A"}</span>
    </div>

    <div className="info-item">
      <label>Date Of Birth:</label>
      <span>{showCustomerDetail?.date_of_birth || "N/A"}</span>
    </div>

    

   
  </div>
</div>



      






<div className="order-stats">
  {ActiveOrderType === "product" ? (
    <>
      <div className="stat-card">
        <h3>Total Product Orders</h3>
        <div className="stat-value">
          {OrderlistData?.filter((v) => v.order_type === "product")?.length}
        </div>
      </div>
      <div className="stat-card">
        <h3>Active Orders</h3>
        <div className="stat-value">
          {OrderlistData?.filter(
            (v) => v.order_type === "product" && v.order_status === "placed"
          )?.length}
        </div>
      </div>
      <div className="stat-card">
        <h3>Delivered Orders</h3>
        <div className="stat-value">
          {OrderlistData?.filter(
            (v) => v.order_type === "product" && v.order_status === "delivered"
          )?.length}
        </div>
      </div>
      
    </>
  ) : (
    <>
    
      <div className="stat-card">
        <h3>Total Consultation Orders</h3>
        <div className="stat-value">
          {OrderlistData?.filter((v) => v.order_type === "consultation")?.length}
        </div>
      </div>
      <div className="stat-card">
        <h3>Confirmed Bookings</h3>
        <div className="stat-value">
          {OrderlistData?.filter(
            (v) =>
              v.order_type === "consultation" &&
              v.booking_status?.toLowerCase() === "approved"
          )?.length}
        </div>
      </div>
      <div className="stat-card">
        <h3>Pending Bookings</h3>
        <div className="stat-value">
          {OrderlistData?.filter(
            (v) =>
              v.order_type === "consultation" &&
              v.booking_status?.toLowerCase() === "pending"
          )?.length}
        </div>
      </div>
      
    </>
  )}
</div>




<div className="filter-buttons">
  <button
    className={ActiveOrderType === "product" ? "active" : ""}
    onClick={() => setActiveOrderType("product")}
  >
    Product Orders
  </button>

  <button
    className={ActiveOrderType === "consultation" ? "active" : ""}
    onClick={() => setActiveOrderType("consultation")}
  >
    Consultation Orders
  </button>
</div>

      <div className='table-container'>

           {ActiveOrderType === "product" ? (
    
    <table className="customers-table">
      <thead>
        <tr>
          <th>Order Id</th>
          <th>Product Name</th>
          <th>Product Image</th>
          <th> Price</th>
          <th>Quantity</th>
          <th>Total Amount</th>
          <th>Address</th>
          <th>Date</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
     


      <tbody>
  {orderlistloading ? (
    <tr>
      <td colSpan="9" style={{ textAlign: "center" }}>
        <div className="circular-loader"></div>
      </td>
    </tr>
  ) : currentOrder?.length > 0 ? (
    currentOrder
      .filter((order) => order.order_type === "product")
      .map((order, index) => (
        <tr key={order.id}>
          <td>{indexoffirstorder + index + 1}</td>

          <td>
            {order?.items?.map((item) => item.product_name).join(", ") || "N/A"}
          </td>

         <td>
  <img
    src={order?.product_image}
    alt={order?.product_name}
    style={{
      width: "50px",
      height: "50px",
      objectFit: "cover",
      borderRadius: "6px",
    }}
    onError={(e) => {
      e.target.src = "https://via.placeholder.com/50";
    }}
  />
</td>

   
          <td>
            {order?.items?.reduce((sum, item) => sum + item.quantity, 0)}
          </td>

          <td>₹{order?.total_amount}</td>

          <td>
            {order?.delivery_address_details?.house_details},{" "}
            {order?.delivery_address_details?.city},{" "}
            {order?.delivery_address_details?.pincode}
          </td>

          <td>
            {new Date(order?.created_at).toLocaleDateString()}
          </td>

          <td>
            <span className={`status ${order?.order_status}`}>
              {order?.order_status}
            </span>
          </td>

          <td>
            {order?.order_status !== "cancelled" && (
              <button
                className="cancel-btn"
                onClick={() => handlecancelorder(order.id)}
              >
                Cancel
              </button>
            )}
          </td>
            <td>
          <button className="action-btn view"onClick={()=>handleNavigate(order?.id)} >
                      👁
                    </button>        
                 </td>
          
        </tr>
      ))
  ) : (
    <tr>
      <td colSpan="9" style={{ textAlign: "center" }}>
        No Product Orders Found
      </td>
    </tr>
  )}
</tbody>

       { showOrders?.length >ProductOrderperpage &&(
    <div className="pagination">
       <button onClick={()=>handlePageChange(CurrentProductOrder-1)} disabled={CurrentProductOrder === 1}> Prev</button>
 
{Array.from({ length: totalPages}, (_, i) => i + 1).map(number => (
  <button
    key={number} 
    className={ CurrentProductOrder === number ? "active" : ""} 
    onClick={() => handlePageChange(number)}
  >
    {number}
  </button>
))}

<button onClick={()=>handlePageChange(CurrentProductOrder +1)} disabled={CurrentProductOrder === totalPages}> Next</button>

    </div>
  )
} 
    </table>
 

  ) : (
  
    <table className="customers-table">
      <thead>
        <tr>
          <th>Order Id</th>
          <th>Doctor Name</th>
          <th>Specialization</th>
          <th>Consultation Fee</th>
          <th> Date</th>
          <th> Time</th>
          <th>Booking Status</th>
          <th>Payment Status</th>
          <th>Action</th>
        
        </tr>
      </thead>
      <tbody>
        {ActiveOrderType==="consultation"&&(
           orderlistloading ? (
  <tr><td colSpan="9">Loading Consultation Orders...</td></tr>
) 
: currentConsultation?.length > 0 ? (
  currentConsultation
    .filter((order) => order?.order_type === "consultation")
    .map((order, index) => (
      <tr key={order?.id || index}>
        <td>{indexoffirstconsultationorder + index + 1}</td>
        <td>{order?.doctor_name || "N/A"}</td>
        <td>{order?.doctor_specializations?.join(", ") || "N/A"}</td>
        <td>₹{order?.consultation_fee || 0}</td>
        <td>{order?.consultation_date || "N/A"}</td>
        <td>{order?.consultation_time || "N/A"}</td>
        <td>{order?.booking_status || "N/A"}</td>
        <td>{order?.payment_status || "N/A"}</td>
          <td>
          <button className="action-btn view"onClick={()=>handleNavigate(order?.id)} >
                      👁
                    </button>        
                 </td>

      </tr>
    ))
) : (
  <tr><td colSpan="9" style={{ textAlign: "center" }}>No Consultation Orders Found</td></tr>
)
        )}
     
      </tbody>
    </table>
  )}    
        {filteredOrders?.length > consultationperpage&&(
    <div className="pagination">
       <button onClick={()=>handlePagechanges(currentConsultationpage-1)} disabled={currentConsultationpage === 1}> Prev</button>
 
{Array.from({ length: totalpage}, (_, i) => i + 1).map(number => (
  <button
    key={number} 
    className={currentConsultation === number ? "active" : ""} 
    onClick={() => handlePagechanges(number)}
  >
    {number}
  </button>
))}

<button onClick={()=>handlePagechanges(currentConsultationpage +1)} disabled={currentConsultationpage === totalpage}> Next</button>

    </div>
  )
}
 
      </div>


      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        closeButton
      />
    </>
  );
 
};
export default CustomerDetailPage