import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import BASE_URL from "../../../Base";
import { FaFileMedical } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import {  BsSearch } from "react-icons/bs";


const Producthistory = () => { const params = useParams();
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



      {/* <div className="page-header">
        <h2>Customer Product Order Detail</h2>
      </div>
<div className="customers-controls">



    <div className="search-wrapper">
                <BsSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by Product name...."
                  value={SearchOrderlistTerm}
                  onChange={(e) => setSearchOrderlistTerm(e.target.value)}
                  className="search-input"
                />
              </div>
        <div className="filter-controls">
          <button className="export-btn">Export Details</button>
        </div>
      </div>
      


<div className='consultationOrder'>
  <div className="customer-profile-card1">

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

       
        <div className="customer-stats-card1">

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

</div> */}




      <div className='table-wrapper1'>

        
    
    <table className="data-table">
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
 

  
 
      </div>


      </>
  );
 
};
export default Producthistory;