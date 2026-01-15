
import * as XLSX from "xlsx";
import { useRef } from "react";
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import BASE_URL from "../../Base";
import "react-toastify/dist/ReactToastify.css";

const OrderModal = ({ order, onClose }) => {
  if (!order) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Order Details</h2>
        <p><strong>Name:</strong> {order.customer_name}</p>
        <p><strong>Date:</strong> {order.created_at}</p>
        <p>
          <strong>Address:</strong>{" "}
          {order.delivery_address_details?.house_details},{" "}
          {order.delivery_address_details?.city},{" "}
          {order.delivery_address_details?.pincode}
        </p>
        <p><strong>Amount:</strong> ₹{order.total_amount}</p>
        <p><strong>Status:</strong> {order.order_status}</p>
        <p><strong>Payment Method:</strong> {order.payment_method}</p>
        <button onClick={onClose} className="close-btn">Close</button>
      </div>
    </div>
  );
};

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
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(5);
  const [activeType, setActiveType] = useState("product");

  const tableRef = useRef();


  const getOrderList = async () => {
    try {
      const response = await fetch(`${BASE_URL}/ecom/order/`, {
        method: "GET",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      });

      const data = await response.json();
      setOrderData(data.data);
    } catch (err) {
      console.error(err.message);
      setOrderError("Something went wrong while fetching data.");
    } finally {
      setOrderloading(false);
    }
  };

  useEffect(() => {
    getOrderList();
  }, []);

 
  useEffect(() => {
    setCurrentPage(1);
  }, [searchOrderTerm, statusOrderFilter, SelectedDate]);


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
      const response = await fetch(`${BASE_URL}/ecom/order/${id}/`, {
        method: "DELETE",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
      });

      if (response.ok) {
        setOrderData(prev => prev.filter(order => order.id !== id));
        toast.success("Order deleted successfully!");
        setDeleteModal(false);
        setOrderToDelete(null);
      } else toast.error("Failed to delete order");
    } catch (err) {
      console.error(err.message);
      toast.error("Something went wrong while deleting the order");
    }
  };

 
  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/ecom/order/${id}/`, {
        method: "PUT",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ order_status: newStatus }),
      });

      if (response.ok) {
        setOrderData(prev => prev.map(order => order.id === id ? { ...order, order_status: newStatus } : order));
        toast.success(`Order status updated to ${newStatus}`);
        setIsModal(false);
      } else toast.error("Failed to update status!");
    } catch (err) {
      console.error(err);
      toast.error("Error updating status");
    }
  };


 
  const filteredOrder = orderData.filter(order => {
  const matchesType = order.order_type === activeType;

  const matchesStatus =
    statusOrderFilter === "all" || order.order_status === statusOrderFilter;

  const matchesDate =
    !SelectedDate ||
    (order.created_at &&
      (() => {
        const orderDate = new Date(order.created_at);
        const selectedDate = new Date(SelectedDate);
        return (
          orderDate.getFullYear() === selectedDate.getFullYear() &&
          orderDate.getMonth() === selectedDate.getMonth() &&
          orderDate.getDate() === selectedDate.getDate()
        );
      })());

  const matchesSearch =
    !searchOrderTerm ||
    (order.customer_name &&
      order.customer_name
        .toLowerCase()
        .includes(searchOrderTerm.toLowerCase()));

  return matchesType && matchesStatus && matchesDate && matchesSearch;
});


  
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrder.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrder.length / ordersPerPage);
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleStatusClick = (order) => { setSelectedOrder(order); setSelectedStatus(order.order_status); setIsModal(true); };
  const handleModalClose = () => { setIsModal(false); setSelectedOrder(null); };

  return (
    <>
      <div className="page-header"><h1>Order List</h1></div>

      <div className="order-controls1">
        <input
          type="text"
          placeholder="Search order by customer name..."
          value={searchOrderTerm}
          onChange={e => setSearchOrderTerm(e.target.value)}
          className="search-input1"
        />
        <div className="filter-controls">
          <input type="date" value={SelectedDate} onChange={e => SetSelectedDate(e.target.value)} className="status-filter" />
          <select value={statusOrderFilter} onChange={e => setStatusOrderFilter(e.target.value)} className="status-filter">
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
          </select>
          <button className="export-btn" onClick={() => exportToXLSX(filteredOrder)}>Export Details</button>
        </div>
      </div>
       <div className="order-stats">
      <div className="stat-card">
         <h3>Total Orders</h3>
         <div className="stat-value">{orderData.length}</div>
      </div>
     <div className="stat-card">
        <h3>Active Orders</h3>
        <div className="stat-value">
           {orderData.filter((o) => o.order_status === 'confirmed').length}
        </div>
        </div>
     <div className="stat-card">
      <h3>Successful Orders</h3>   
            <div className="stat-value">
           {orderData.filter((o) => o.order_status === 'delivered').length}
         </div>
        </div>
     </div>
<div className="filter-buttons">
  <button
    onClick={() => setActiveType("product")}
  >
    Product Orders
  </button>
  <button
    onClick={() => setActiveType("consultation")}
  >
    Consultation Orders
  </button>
</div>


      <div className="table-container">
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
              <tr><td colSpan="9">Loading Order data...</td></tr>
            ) : ordererror ? (
              <tr><td colSpan="9" style={{ color: "red" }}>{ordererror}</td></tr>
            ) : currentOrders.length > 0 ? (
              currentOrders.map((order, index) => (
                <tr key={order.id}>
                  <td>{indexOfFirstOrder + index + 1}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.created_at ? new Date(order.created_at).toISOString().split("T")[0] : ""}</td>
                  <td>{order.delivery_address_details?.house_details}, {order.delivery_address_details?.city}, {order.delivery_address_details?.pincode}</td>
      
                  <td>₹{order.total_amount}</td>
                  <td>{order.payment_method}</td>
                  <td>{order.payment_status}</td>
                  <td style={{ color: "blue", cursor: "pointer" }} onClick={() => handleStatusClick(order)}>{order.order_status}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn delete" title="Delete" onClick={() => { setOrderToDelete(order); setDeleteModal(true); }}>🗑</button>
                      <button className="action-btn view" title="View" onClick={() => { setSelectedOrder(order); setShowModal(true); }}>👁</button>
                      {order.order_status === "returned" && <button className="action-btn view" title="Approve Refund">✅</button>}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9" style={{ textAlign: "center" }}>No Data Found</td></tr>
            )}
          </tbody>
        </table>

    
        {filteredOrder.length > ordersPerPage && (
          <div className="pagination">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button key={number} className={currentPage === number ? "active" : ""} onClick={() => handlePageChange(number)}>{number}</button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
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
