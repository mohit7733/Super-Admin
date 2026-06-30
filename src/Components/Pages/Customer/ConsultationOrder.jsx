import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
;
import BASE_URL from "../../../Base";
import { FaFileMedical } from "react-icons/fa";
import { FaCalendarAlt } from "react-icons/fa";
import {  BsSearch, BsDownload} from "react-icons/bs";



const ConsultationOrder = () => { 
const params = useParams();
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

      <div className='table-wrapper1'>
 
  
    <table className="data-table">
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
     
        { orderlistloading ? (
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
       
}
      </tbody>
    </table>
     
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


      </>
  );
 
};
export default ConsultationOrder