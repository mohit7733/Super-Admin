
import * as XLSX from "xlsx";
import { useRef } from "react";
import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import BASE_URL from "../../../Base";
;
import { apiFetch } from "../../../fetchapi";
import OrderModal from "./OrderModal";
import { BsSearch, } from "react-icons/bs";
import { FaUsers, } from "react-icons/fa";
import { FiEye, FiTrash2 } from "react-icons/fi";



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


  const [activeType, setActiveType] = useState("product")
  const [OpenConfirmModal, SetOpenConfirmModal] = useState(false);
  const [refundFormData, setRefundFormData] = useState({ first_name: "", reason: "" });
  const [productPage, setProductPage] = useState(1);
  const [consultationPage, setConsultationPage] = useState(1);

  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const pagesize = 5;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pagesize);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const searchPlaceholder =
    activeType === "product"
      ? "Search by product name..."
      : "Search by doctor name or specialization...";


  const tableRef = useRef();

  const STATUS_LABEL_MAP = {
    placed: { label: "Placed", color: "info" },
    confirmed: { label: "Confirmed", color: "success" },
    shipped: { label: "Shipped", color: "primary" },
    out_for_delivery: { label: "Out for Delivery", color: "warning" },
    delivered: { label: "Delivered", color: "success" },
    cancelled: { label: "Cancelled", color: "danger" },
    returned: { label: "Returned", color: "warning" },
    refunded: { label: "Refunded", color: "info" },
    packing: { label: "Packing", color: "primary" },
  };
  const getOrderList = async (page = 1, type = activeType, search = "") => {
    setOrderloading(true);
    setOrderError("");

    try {
      const token = sessionStorage.getItem("superadmin_token");

      if (!token) {
        toast.error("Session expired! Please login again");
        return;
      }


      let searchParam = "";

      if (search) {
        if (type === "product") {
          searchParam = `&product_name=${search}`;
        } else {

          searchParam = `&doctor_name=${search}&specialization=${search}`;
        }
      }
      const url = `${BASE_URL}/orders/order/?page=${page}&order_type=${type}${searchParam}`;

      const response = await apiFetch(url, {
        method: "GET",
        headers: { Accept: "application/json" }
      });

      setOrderData(response?.data || []);
      setNextPage(response?.next);
      setPreviousPage(response?.previous);
      setTotalCount(response?.count)

      if (type === "product") {
        setProductPage(page);
      } else {
        setConsultationPage(page);
      }

    } catch (err) {
      console.error(err);
      setOrderError("Something went wrong while fetching data.");
    } finally {
      setOrderloading(false);
    }
  };





  useEffect(() => {
    if (activeType === "product") {
      getOrderList(productPage, "product", searchOrderTerm);
    } else {
      getOrderList(consultationPage, "consultation", searchOrderTerm);
    }
  }, [activeType, productPage, consultationPage, searchOrderTerm]);

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
  const paymentstatusLabel = {
    pending: "Pending",
    success: "Success",
    failed: " Failed",
    processing: "Processing",
    refund: "Refund"

  }

  const paymentMethodLabel = {
    cash_on_delivery: "Cash on Delivery",
    online: "Online",
    net_banking: "Net Banking",
    upi: "UPI",
    card: "Card",
    wallet: "Wallet",
  };


  const handleSearch = (e) => {

    const value = e.target.value;
    console.log("valueee....", value)
    setSearchOrderTerm(value);
    console.log("searchorderterm", searchOrderTerm)

    if (activeType === "product") {
      setProductPage(1);
    } else {
      setConsultationPage(1);
    }
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


  const handleConfirmModal = () => {
    SetOpenConfirmModal(true);
  }

  const handleStatusClick = (order) => { setSelectedOrder(order); setSelectedStatus(order.order_status); setIsModal(true); };
  const handleModalClose = () => { setIsModal(false); setSelectedOrder(null); };

  return (
    <>
      <div className="page-header"><h1>Order List</h1></div>



      <div className="order-stats stats2-grid">
        {activeType === "product" ? (
          <>
            <div className="stat2-card">
              <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                <FaUsers size={24} />
              </div>
              <div className="stat2-info">
                <h3>Total Product Orders</h3>
                <div className="stat2-value">
                  {orderData.filter((v) => v.order_type === "product").length}
                </div>
              </div>
            </div>
            <div className="stat2-card">
              <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                <FaUsers size={24} />
              </div>
              <div className="stat2-info">
                <h3>Active Orders</h3>
                <div className="stat2-value">
                  {orderData.filter(
                    (v) => v.order_type === "product" && v.order_status === "placed"
                  ).length}
                </div>
              </div>
            </div>
            <div className="stat2-card">
              <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                <FaUsers size={24} />
              </div>
              <div className="stat2-info">
                <h3>Delivered Orders</h3>
                <div className="stat2-value">
                  {orderData.filter(
                    (v) => v.order_type === "product" && v.order_status === "delivered"
                  ).length}
                </div>
              </div>
            </div>

          </>
        ) : (
          <>
            <div className="stat2-card">
              <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                <FaUsers size={24} />
              </div>
              <div className="stat2-info">
                <h3>Total Consultation Orders</h3>
                <div className="stat2-value">
                  {orderData.filter((v) => v.order_type === "consultation").length}
                </div>
              </div>
            </div>
            <div className="stat2-card">
              <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                <FaUsers size={24} />
              </div>
              <div className="stat2-info">
                <h3>Confirmed Bookings</h3>
                <div className="stat2-value">
                  {orderData.filter(
                    (v) =>
                      v.order_type === "consultation" &&
                      v.booking_status?.toLowerCase() === "approved"
                  ).length}
                </div>
              </div>
            </div>
            <div className="stat2-card">
              <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                <FaUsers size={24} />
              </div>
              <div className="stat2-info">
                <h3>Pending Bookings</h3>
                <div className="stat2-value">
                  {orderData.filter(
                    (v) =>
                      v.order_type === "consultation" &&
                      v.booking_status?.toLowerCase() === "pending"
                  ).length}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="controls-section">
        <div className="search-wrapper">
          <BsSearch className="search-icon" />
          <input
            type="text"
            placeholder={
              activeType === "product"
                ? "Search by product name..."
                : "Search by doctor or specialization..."
            }
            value={searchOrderTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <input type="date" value={SelectedDate} onChange={e => SetSelectedDate(e.target.value)} className="status-filter" />
          <select value={statusOrderFilter} onChange={e => setStatusOrderFilter(e.target.value)} className="status-filter">
            {activeType === "product" ? (
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
            ) :
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
          <button className="btn-secondary" onClick={() => exportToXLSX(orderData)}>Export Details</button>
        </div>
      </div>
      <div className="filter-buttons">
        <button
          className={activeType === "product" ? "active" : ""}
          onClick={() => {
            setActiveType("product");
            setProductPage(1);
          }}
        >
          Product Orders
        </button>

        <button
          className={activeType === "consultation" ? "active" : ""}
          onClick={() => {
            setActiveType("consultation");
            setConsultationPage(1);
          }}
        >
          Consultation Orders
        </button>
      </div>



      <div className="table-wrapper">

        {activeType === "product" && (
          <table ref={tableRef} className="data-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Customer</th>
                <th>Product Name</th>
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
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="10"><div className="skeleton-row"></div></td>
                  </tr>
                ))
              ) : ordererror ? (
                <tr><td colSpan="9" style={{ color: "red" }}>{ordererror}</td></tr>
              ) : orderData.length > 0 ? (
                orderData.map((order, index) => (
                  <tr key={order.id}>
                    <td>{index + 1}</td>
                    <td>{order?.customer_name}</td>

                    <td>{order?.items?.map(item => item.product_name).join(",")}</td>
                    <td>{order?.created_at ? new Date(order?.created_at).toISOString().split("T")[0] : ""}</td>
                    <td>
                      {order?.delivery_address_details?.house_details},
                      {order?.delivery_address_details?.city},
                      {order?.delivery_address_details?.pincode}
                    </td>
                    <td>₹{order?.total_amount}</td>
                    <td>{paymentMethodLabel[order?.payment_method] || order?.payment_method}</td>
                    <td>
                      <span className={`status-badge ${STATUS_LABEL_MAP[order?.payment_status]?.color || 'secondary'}`}>
                        {STATUS_LABEL_MAP[order?.payment_status]?.label || order?.payment_status}
                      </span>
                    </td>

                    <td
                      style={{ color: "blue", cursor: "pointer" }}
                      onClick={() => handleStatusClick(order)}
                    >
                      {statusLabelMap[order?.order_status] || order?.order_status}
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button className="action-btn delete" onClick={() => { setOrderToDelete(order); setDeleteModal(true); }}><FiTrash2 /></button>
                        <button className="action-btn view" onClick={() => { setSelectedOrder(order); setShowModal(true); }}><FiEye /></button>
                        {order.order_status === "cancelled" && (
                          <button className="action-btn view" onClick={handleConfirmModal}>✅</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" style={{ textAlign: "center" }}>No Data Found</td></tr>
              )}
            </tbody>
          </table>
        )}

        {activeType === "consultation" && (
          <table ref={tableRef} className="data-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Doctor</th>
                <th> Specilization</th>
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
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="10"><div className="skeleton-row"></div></td>
                  </tr>
                ))
              ) : ordererror ? (
                <tr><td colSpan="9" style={{ color: "red" }}>{ordererror}</td></tr>
              ) : orderData?.length > 0 ? (
                orderData.map((order, index) => (
                  <tr key={order.id}>
                    <td>{index + 1}</td>
                    <td>{order?.doctor_name}</td>
                    <td> {order?.doctor_specializations?.join(", ")}</td>
                    <td>{order?.consultation_date}</td>
                    <td>{order?.consultation_time}</td>
                    <td>₹{order?.consultation_fee}</td>
                    <td>{order?.payment_method}</td>
                    <td>
                      <span className={`status-badge ${STATUS_LABEL_MAP[order?.payment_status]?.color || 'secondary'}`}>
                        {STATUS_LABEL_MAP[order?.payment_status]?.label || order?.payment_status}
                      </span>
                    </td>
                    <td
                      style={{ color: "blue", cursor: "pointer" }}
                      onClick={() => handleStatusClick(order)}
                    >
                      {order.booking_status}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn delete" onClick={() => { setOrderToDelete(order); setDeleteModal(true); }}><FiTrash2 /></button>
                        {order.order_status === "cancelled" && (
                          <button className="action-btn view" onClick={handleConfirmModal}><FiEye /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" style={{ textAlign: "center" }}>No Data Found</td></tr>
              )}
            </tbody>
          </table>
        )}

      </div>

      {totalPages > 1 && (
        <div className="pagination">


          <button
            onClick={() =>
              getOrderList(
                (activeType === "product" ? productPage : consultationPage) - 1,
                activeType,
                searchOrderTerm
              )
            }
            disabled={!previousPage}
          >
            Prev
          </button>


          {pages.map((page) => (
            <button
              key={page}
              onClick={() =>
                getOrderList(
                  page,
                  activeType,
                  searchOrderTerm
                )
              }
              style={{
                fontWeight:
                  (activeType === "product" ? productPage : consultationPage) === page
                    ? "bold"
                    : "normal",
                background:
                  (activeType === "product" ? productPage : consultationPage) === page
                    ? "#0D614E"
                    : "#fff",
                color:
                  (activeType === "product" ? productPage : consultationPage) === page
                    ? "#fff"
                    : "#0D614E",
              }}
            >
              {page}
            </button>
          ))}


          <button
            onClick={() =>
              getOrderList(
                (activeType === "product" ? productPage : consultationPage) + 1,
                activeType,
                searchOrderTerm
              )
            }
            disabled={!nextPage}
          >
            Next
          </button>

        </div>
      )}

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

      {OpenConfirmModal && (
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
              <button type="button" onClick={() => SetOpenConfirmModal(false)}>Cancel</button>
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

      </>
  );
};


export default Order;





