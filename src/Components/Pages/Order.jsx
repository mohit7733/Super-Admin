
import * as XLSX from "xlsx";
import { useRef } from "react";
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import BASE_URL from "../../Base";
import "react-toastify/dist/ReactToastify.css";
import { apiFetch } from "../../fetchapi";
import OrderModal from "./OrderModal";


const Order = () => {
  const [orderData, setOrderData] = useState([]);
  const [orderloading, setOrderloading] = useState(true);
  const [ordererror, setOrderError] = useState(null);
  const [searchOrderTerm, setSearchOrderTerm] = useState("");
  const [statusOrderFilter, setStatusOrderFilter] = useState("all");
  const [SelectedDate, SetSelectedDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal1, setShowModal] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentProductPage, setCurrentProductPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(5);
  const[consultationCurrentpage,setconsultationCurrentpage]= useState(1);
  const[consultationOrderperpage,setConsultationOrderperpage]=useState(5);
  const [activeType, setActiveType] = useState("product")
  
const[OpenConfirmModal,SetOpenConfirmModal]=useState(false);
const [refundFormData, setRefundFormData] = useState({ first_name: "", reason: "" });


const searchPlaceholder =
    activeType === "product"
      ? "Search by product name..."
      : "Search by doctor name or specialization...";


  const tableRef = useRef();


 const getOrderList = async () => {
  setOrderloading(true);

  try {
    const response = await apiFetch(`${BASE_URL}/orders/order/`, {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    if (response && response.data) {
      setOrderData(response.data);
    } else {
      setOrderError("No data found.");
    }
  } catch (err) {
    console.error(err);
    setOrderError("Something went wrong while fetching data.");
  } finally {
    setOrderloading(false);
  }
};


  useEffect(() => {
    getOrderList();
  }, []);
useEffect(() => {
  setCurrentProductPage(1);
  setconsultationCurrentpage(1); 
}, [searchOrderTerm, statusOrderFilter, SelectedDate, activeType]);



  const handleRefundInputChange = (e) => {
    const { name, value } = e.target;
    setRefundFormData((prev) => ({ ...prev, [name]: value }));

  };

  const exportToXLSX = (orders) => {
    const exportData = orders.map((order) => ({
      "Customer Name": order.customer_name,
      "Date": order.created_at ? new Date(order.created_at).toISOString().split("T")[0] : "",
      "Address": `${order.delivery_address_details?.house_details || ""}, ${order.delivery_address_details?.city || ""}, ${order.delivery_address_details?.pincode || ""}`,
      "Amount": `₹${order.total_amount}`,
      "Payment Status": order.payment_status,
      "Order Status": order.order_status,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "orders.xlsx");
  };

  const statusLabelMap = {
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
  refunded: "Refunded",
  packing: "Packing",


};
const paymentstatusLabel ={
pending : "Pending",
success : "Success",
failed : " Failed",
processing :"Processing",
refund :"Refund"

}

const paymentMethodLabel = {
  cash_on_delivery: "Cash on Delivery",
  online: "Online",
  net_banking: "Net Banking",
  upi: "UPI",
  card: "Card",
  wallet: "Wallet",
};




  const statusOptions = {

    placed: [
      { value: "confirmed", label: "Confirmed" },
      { value: "delivered", label: "Delivered" },
      { value: "out_for_delivery", label: "Out for Delivery" },
      { value: "shipped", label: "Shipped" },
      { value: "packing", label: "Packing" },
      { value: "cancelled", label: "Cancelled" },
    ],
    confirmed: [
      { value: "packing", label: "Packing" },
      { value: "delivered", label: "Delivered" },
      { value: "out_for_delivery", label: "Out for Delivery" },
      { value: "shipped", label: "Shipped" },
      { value: "returned", label: "Returned" },
    ],
    packed: [
      { value: "shipped", label: "Shipped" },
      { value: "delivered", label: "Delivered" },
      { value: "out_for_delivery", label: "Out for Delivery" },
      { value: "returned", label: "Returned" },
    ],
    shipped: [
      { value: "out_for_delivery", label: "Out for Delivery" },
      { value: "delivered", label: "Delivered" },
      { value: "returned", label: "Returned" },
      { value: "refunded", label: "Refunded" },
    ],
    out_for_delivery: [
      { value: "delivered", label: "Delivered" },
      { value: "returned", label: "Returned" },
    ],
    delivered: [{ value: "returned", label: "Returned" }],
    returned: [{ value: "refunded", label: "Refunded" }],
    cancelled: [],
    refunded: [],
  };

  const getAllowedStatuses = (currentStatus) => statusOptions[currentStatus] || [];


 const handleDeleteOrder = async (id) => {
  try {
    const response = await apiFetch(`${BASE_URL}/orders/order/${id}/`, {
      method: "DELETE",
      headers: { Accept: "application/json" }
    });

    if (response && (response.success || response.status === "success" || Object.keys(response).length === 0)) {
   
      setOrderData(prev => prev.filter(order => order.id !== id));
      toast.success("Order deleted successfully!");
      setDeleteModal(false);
      setOrderToDelete(null);
    } else {
      toast.error("Failed to delete order");
    }

  } catch (err) {
    console.error(err);
    toast.error("Something went wrong while deleting the order");
  }
};


 
 const handleStatusChange = async (id, newStatus) => {
  try {
    const response = await apiFetch(`${BASE_URL}/orders/order/${id}/ `, {
      method: "PUT",
      headers: { Accept: "application/json" },
      body: JSON.stringify({ order_status: newStatus })
    });

    if (response && response.data) {
      setOrderData(prev =>
        prev.map(order =>
          order.id === id ? { ...order, order_status: newStatus } : order
        )
      );

      toast.success(`Order status updated to ${newStatus}`);
      setIsModal(false);
    } else {
      toast.error("Failed to update status!");
    }

  } catch (err) {
    console.error(err);
    toast.error("Error updating status");
  }
};


const handleConfirmModal=()=>{
SetOpenConfirmModal(true);
}


 

const filteredOrder = orderData.filter(order => {
  const matchesType = order.order_type === activeType;


  const matchesStatus =
    statusOrderFilter === "all" ||
    (activeType === "product"
      ? order.order_status === statusOrderFilter
      : order.booking_status === statusOrderFilter);

  
  const matchesDate = (() => {
    if (!SelectedDate) return true;

    const selected = new Date(SelectedDate);

    if (activeType === "product") {
      if (!order.created_at) return false;
      const orderDate = new Date(order.created_at);

      return (
        orderDate.getFullYear() === selected.getFullYear() &&
        orderDate.getMonth() === selected.getMonth() &&
        orderDate.getDate() === selected.getDate()
      );
    }

    if (activeType === "consultation") {
      if (!order.consultation_date) return false;
      const consultDate = new Date(order.consultation_date);

      return (
        consultDate.getFullYear() === selected.getFullYear() &&
        consultDate.getMonth() === selected.getMonth() &&
        consultDate.getDate() === selected.getDate()
      );
    }

    return true;
  })();

  
  let matchesSearch = true;
  if (searchOrderTerm) {
    const term = searchOrderTerm.toLowerCase();

    if (activeType === "product") {
      matchesSearch =
        (order.items?.[0]?.vendor_product?.title &&
          order.items[0].vendor_product.title.toLowerCase().includes(term)) ||
        (order.customer_name &&
          order.customer_name.toLowerCase().includes(term));
    } else if (activeType === "consultation") {
      matchesSearch =
        (order.doctor_name &&
          order.doctor_name.toLowerCase().includes(term)) ||
        (order.specialization &&
          order.specialization.toLowerCase().includes(term));
    }
  }

  return matchesType && matchesStatus && matchesDate && matchesSearch;
});



  
  const indexOfLastOrder = currentProductPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrder.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrder.length / ordersPerPage);



const indexOfLastConsultation = consultationCurrentpage * consultationOrderperpage;
const indexOfFirstConsultation = indexOfLastConsultation - consultationOrderperpage;

const currentConsultation = filteredOrder.slice(
  indexOfFirstConsultation,
  indexOfLastConsultation
);

const totalPage = Math.ceil(filteredOrder.length / consultationOrderperpage);

  const handlePageChange = (pageNumber) => setCurrentProductPage(pageNumber)
  const handlePageChanges=(pageNumber)=>setconsultationCurrentpage(pageNumber)
  const handleStatusClick = (order) => { setSelectedOrder(order); setSelectedStatus(order.order_status); setIsModal(true); };
  const handleModalClose = () => { setIsModal(false); setSelectedOrder(null); };

  return (
    <>
      <div className="page-header"><h1>Order List</h1></div>

      <div className="order-controls1">

<input
  type="text"
  placeholder={
    activeType === "product"
      ? "Search by product name..."
      : "Search by doctor or specialization..."
  }
  value={searchOrderTerm}
  onChange={(e) => setSearchOrderTerm(e.target.value)}
  className="search-input1"
/>

        <div className="filter-controls">
          <input type="date" value={SelectedDate} onChange={e => SetSelectedDate(e.target.value)} className="status-filter" />
          <select value={statusOrderFilter} onChange={e => setStatusOrderFilter(e.target.value)} className="status-filter">
            {activeType==="product" ?(
              <>
                          <option value="all">All Status</option>
            <option value="placed">placed</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
            <option value="refunded"> Refunded</option>
            <option value="packing"> Packing</option>
            </>
            ):
            (
<>
<option value="all">All Status</option>
      <option value="pending">Pending</option>
      <option value="approved">Approved</option>
      <option value="rejected">Rejected</option>
    </>
            )
            }
       
          </select>
          <button className="export-btn" onClick={() => exportToXLSX(filteredOrder)}>Export Details</button>
        </div>
      </div>
      
     <div className="order-stats">
  {activeType === "product" ? (
    <>
      <div className="stat-card">
        <h3>Total Product Orders</h3>
        <div className="stat-value">
          {orderData.filter((v) => v.order_type === "product").length}
        </div>
      </div>
      <div className="stat-card">
        <h3>Active Orders</h3>
        <div className="stat-value">
          {orderData.filter(
            (v) => v.order_type === "product" && v.order_status === "placed"
          ).length}
        </div>
      </div>
      <div className="stat-card">
        <h3>Delivered Orders</h3>
        <div className="stat-value">
          {orderData.filter(
            (v) => v.order_type === "product" && v.order_status === "delivered"
          ).length}
        </div>
      </div>
      
    </>
  ) : (
    <>
      <div className="stat-card">
        <h3>Total Consultation Orders</h3>
        <div className="stat-value">
          {orderData.filter((v) => v.order_type === "consultation").length}
        </div>
      </div>
      <div className="stat-card">
        <h3>Confirmed Bookings</h3>
        <div className="stat-value">
          {orderData.filter(
            (v) =>
              v.order_type === "consultation" &&
              v.booking_status?.toLowerCase() === "approved"
          ).length}
        </div>
      </div>
      <div className="stat-card">
        <h3>Pending Bookings</h3>
        <div className="stat-value">
          {orderData.filter(
            (v) =>
              v.order_type === "consultation" &&
              v.booking_status?.toLowerCase() === "pending"
          ).length}
        </div>
      </div>
      
    </>
  )}
</div>
<div className="filter-buttons">
  <button
    className={activeType === "product" ? "active" : ""}
    onClick={() => setActiveType("product")}
  >
    Product Orders
  </button>

  <button
    className={activeType === "consultation" ? "active" : ""}
    onClick={() => setActiveType("consultation")}
  >
    Consultation Orders
  </button>
</div>



      <div className="table-container">
        {activeType==="product"&&(
        <table ref={tableRef} className="order-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Address</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orderloading ? (
 <tr>
            <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
              <div className="circular-loader"></div>
            </td>
          </tr>
            ) : ordererror ? (
              <tr><td colSpan="9" style={{ color: "red" }}>{ordererror}</td></tr>
            ) : currentOrders.length > 0 ? (
                currentOrders.map((order, index) => (
                <tr key={order.id}>
                  <td>{indexOfFirstOrder + index+ 1}</td>

                  <td>{order?.customer_name}</td>
                  <td>{order?.created_at ? new Date(order?.created_at).toISOString().split("T")[0] : ""}</td>
                  <td>{order?.delivery_address_details?.house_details}, {order.delivery_address_details?.city}, {order?.delivery_address_details?.pincode}</td>
      
                  <td>₹{order?.total_amount}</td>
                  <td>
  {paymentMethodLabel[order?.payment_method] || order?.payment_method}
</td>

                    <td>  {paymentstatusLabel[order?.payment_status] || order?.payment_status}</td>
              <td
  style={{ color: "blue", cursor: "pointer" }}
  onClick={() => handleStatusClick(order)}
>
  {statusLabelMap[order?.order_status] || order?.order_status}
</td>

                  <td>
                    <div className="action-buttons">
                      <button className="action-btn delete" title="Delete" onClick={() => { setOrderToDelete(order); setDeleteModal(true); }}>🗑</button>
                     <button className="action-btn view" title="View" onClick={() => { setSelectedOrder(order); setShowModal(true); }}>👁</button>
                      {order.order_status === "cancelled" && <button className="action-btn view" title="Approve Refund" onClick={handleConfirmModal}>✅</button>}
                      
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9" style={{ textAlign: "center" }}>No Data Found</td></tr>
            )}
          </tbody>
        </table>

         ) }
       
        {activeType==="consultation"&&(
        <table ref={tableRef} className="order-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Fee</th>            
              <th>Payment Method</th>
              <th>Payment Status</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orderloading ? (
             <tr>
            <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
              <div className="circular-loader"></div>
            </td>
          </tr>
            ) : ordererror ? (
              <tr><td colSpan="9" style={{ color: "red" }}>{ordererror}</td></tr>
            ) : currentConsultation?.length > 0 ? (
              currentConsultation?.map((order, index) => (
                <tr key={order.id}>
                  <td>{indexOfFirstConsultation + index + 1}</td>
                  <td>{order?.doctor_name}</td>
                  <td>{order?.consultation_date}</td>
                  <td>{order?.consultation_time}</td>
                 <td>₹{order?.consultation_fee}</td>
                  <td>{order?.payment_method}</td>
                  <td>{order?.payment_status}</td>
                  <td style={{ color: "blue", cursor: "pointer" }} onClick={() => handleStatusClick(order)}>{order.booking_status}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn delete" title="Delete" onClick={() => { setOrderToDelete(order); setDeleteModal(true); }}>🗑</button>
                     
                      {order.order_status === "cancelled" && <button className="action-btn view" title="Approve Refund" onClick={handleConfirmModal}>✅</button>}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9" style={{ textAlign: "center" }}>No Data Found</td></tr>
            )}
          </tbody>
        </table>

         ) }

{activeType === "product" && filteredOrder.length > ordersPerPage && (
            < div className="pagination"> 

<button onClick={()=>handlePageChange(currentProductPage-1)} disabled={currentProductPage === 1}> Prev</button>
 
{Array.from({ length: totalPages}, (_, i) => i + 1).map(number => (
  <button
    key={number} 
    className={currentProductPage === number ? "active" : ""} 
    onClick={() => handlePageChange(number)}
  >
    {number}
  </button>
))}

<button onClick={()=>handlePageChange(currentProductPage+1)} disabled={currentProductPage === totalPages}> Next</button>

          </div>

)}

         {activeType === "consultation" && filteredOrder?.length > consultationOrderperpage && (
                    < div className="pagination"> 

<button onClick={()=>handlePageChanges(consultationCurrentpage-1)} disabled={consultationCurrentpage === 1}> Prev</button>
 
{Array.from({ length: totalPage}, (_, i) => i + 1).map(number => (
  <button
    key={number} 
    className={consultationCurrentpage === number ? "active" : ""} 
    onClick={() => handlePageChanges(number)}
  >
    {number}
  </button>
))}

<button onClick={()=>handlePageChanges(consultationCurrentpage +1)} disabled={consultationCurrentpage === totalPage}> Next</button>

          </div>

  
)}
  

      </div>
      
      {showModal1 && <OrderModal order={selectedOrder} onClose={() => { setShowModal(false); setSelectedOrder(null); }} />}
      {isModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Edit Order Status</h2>
            <select value={selectedStatus} onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}>
              {selectedStatus === "refunded" || selectedStatus === "cancelled" ? (
                <>
                  <option value={selectedStatus}>{selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}</option>
                  <option disabled>No further changes allowed</option>
                </>
              ) : (
                <>
                  <option value={selectedStatus}>{selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}</option>
                  {getAllowedStatuses(selectedStatus).map(status => <option key={status.value} value={status.value}>{status.label}</option>)}
                </>
              )}
            </select>
            <button onClick={handleModalClose} className="close-btn">Close</button>
          </div>
        </div>
      )}

      {OpenConfirmModal &&(
        <div className="modal">
          <form className="customer-form">
            <h3>Refund Form</h3>
            <label>Customer Name:</label>
            <input
              type="text"
              name="first_name"
              placeholder="Enter customer name"
              value={refundFormData.first_name}
              onChange={handleRefundInputChange}
              
            />
            <label>Reason for Refund:</label>
            <textarea
              name="reason"
              placeholder="Enter refund reason"
              value={refundFormData.reason}
              onChange={handleRefundInputChange}
             
            />
          

            <div className="form-buttons">
              <button type="submit">Save</button>
              <button type="button" onClick={()=>SetOpenConfirmModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
        
      )}
      {deleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this order details?</h3>
            <div className="form-buttons">
              <button onClick={() => handleDeleteOrder(orderToDelete.id)} className="otp-btn verify-btn">Yes</button>
              <button onClick={() => setDeleteModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover closeButton />
    </>
  );
};


export default Order;





