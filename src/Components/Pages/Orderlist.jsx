import React, { useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const Orderlist = () => {
  const params = useParams();
  const { customerId } = params;

  const [SearchOrderlistTerm, setSearchOrderlistTerm] = useState("");
  const [OrderlistData, setOrderlistData] = useState([]);
  const [error, setError] = useState(null);
  const [orderlistloading, setOrderlistloading] = useState(true);

  const fetchOrderlist = async () => {
    try {
      const response = await fetch(`https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/getorderbycustomerid/${customerId}/`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json();
      setOrderlistData(data.data);
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
    try {
      const response = await fetch(
        `https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/cancelorder/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ order_id: orderId }),
        }
      );


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

  



const filteredOrders = OrderlistData.filter(order => {
  const title = order.items[0]?.vendor_product?.title;
  if (!title) return false;
  return title.toLowerCase().includes(SearchOrderlistTerm.toLowerCase());
});



const showOrders = SearchOrderlistTerm.trim()
  ? filteredOrders
  : OrderlistData;




  return (
    <>
      <div className="page-header">
   <h2> 
  {OrderlistData.length > 0
    ? OrderlistData[0]?.customer_name
    : "No customer order found"}
</h2>

      </div>

      <div className="customers-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search customer order ny product name......"
            value={SearchOrderlistTerm}
            onChange={(e) => setSearchOrderlistTerm(e.target.value)}
            className="search-input"
          />
        </div>



        <div className="filter-controls">
          <button
            className="export-btn"
          >
            Export Details
          </button>
        </div>
      </div>
      <div className="order-stats">
        <div className="stat-card">
          <h3>Total Orders</h3>
          <div className="stat-value">{OrderlistData.length}</div>
        </div>
        <div className="stat-card">
          <h3>Active Orders</h3>
          <div className="stat-value">
{OrderlistData.filter((v)=> v.order_status === "placed").length}
          </div>

        </div>
        <div className="stat-card">
          <h3>Sucessful order</h3>
          <div className="stat-value">
{OrderlistData.filter((v)=> v.order_status ==="delivered").length}
          </div>
        </div>
      </div>
      <table className="customers-table">
        <thead>
          <tr>
            <th>Order Id</th>
            <th>Product Name</th>
            <th>Product Image</th>
            <th>Quantity</th>
            <th>Total Amount</th>
            <th>Address</th>
            <th>Date</th>
            <th>Order Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {orderlistloading ? (
            <tr>
              <td colSpan="9">Loading Order data...</td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="9" style={{ color: "red" }}>
                {error}
              </td>
            </tr>
          ) : showOrders.length > 0 ? (
            showOrders.map((order,index) => (
              <tr key={order.id}>

                <td>{index+1}</td>
                <td>{order.items[0]?.vendor_product?.title}</td>
                <td>
                  <img
                    src={order.items[0]?.vendor_product?.image}
                    alt={order.items[0]?.vendor_product?.title}
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                </td>
                <td>{order.items[0]?.quantity}</td>
                <td>{order.items[0]?.total}</td>
                <td>
                  {order.delivery_address_details?.house_details},
                  {order.delivery_address_details?.city},
                  {order.delivery_address_details?.pincode}

                </td>
                <td>
                  {order.created_at
                    ? new Date(order.created_at).toISOString().split("T")[0]
                    : ""}
                </td>


                <td>{order.order_status}</td>
                <td>
                  <div className="action-buttons">
                    <button title="btn-cancel" onClick={() => handlecancelorder(order.id)}
                    >
                      Cancel
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>
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

export default Orderlist;




