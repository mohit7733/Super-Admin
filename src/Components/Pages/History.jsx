// import React, { useState } from 'react';
// import { useRef } from "react";
// import { useEffect } from 'react';
// import * as XLSX from "xlsx";


// const History = () => {
//   const [selectedPayment, setSelectedPayment] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const[paymentData,setPaymentData]=useState([]);
//   const[paymenterror,setPaymenterror]=useState(null);
//   const[paymentloading,setPaymentloading]=useState(true);
//   const[paymentstatus,setpaymentstatus]=useState(false)
//  const[payStatus, setPayStatus] = useState('');
//  const[Refundform,setRefundForm]=useState(false);
//  const[currentpage,setCurrentpage]=useState(1);
//  const[Historyperpage,setHistoryperpage]=useState(5);
//  const [refundForm, setRefundedForm] = useState({
//     first_name: "",
//     reason: "",
//   });

// const [refundFormErrors, setRefundFormErrors] = useState({
//   first_name: "",
//   reason: ""
// });


//   const handleRefundInputChange = (e) => {
//     const { name, value } = e.target;
//     setRefundForm((prev) => ({ ...prev, [name]: value }));
//      setRefundFormErrors({ ...refundFormErrors, [name]: "" });
//   };


// //   const filteredHistory = paymentData?.filter((item) => {
// //   const matchSearch =
// //     item.razorpay_order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //     item.user?.toLowerCase().includes(searchTerm.toLowerCase());

// //   return  matchSearch;
// // });
// const indexoflasthistory=currentpage*Historyperpage;
// const indexofirsthistory=indexoflasthistory - Historyperpage
// const currenthistory=paymentData.slice(indexofirsthistory,indexoflasthistory)
// const totalPages = Math.ceil(paymentData.length / Historyperpage);



//  const totalAmount = paymentData.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
// const pending = paymentData
//   .filter((item) => item.payment_status === 'pending')
//   .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

// const refunded = paymentData
//   .filter((item) => item.payment_status === 'Refunded')
//   .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

//  const handlePageChange = (pageNumber) => {
// setCurrentpage(pageNumber);
//  };

  

// const exportToExcel = () => {
//   if (!paymentData || paymentData.length === 0) {
//     alert("No payment data to export!");
//     return;
//   }


//   const exportData = paymentData.map((item) => ({
//     "Payment ID": item.razorpay_order_id,
//     "User": item.user,
//     "Amount": item.amount,
//     "Method": item.payment_method,
//     "Date": item.created_at,
//     "Status": item.payment_status,
//   }));


//   const worksheet = XLSX.utils.json_to_sheet(exportData);

 
//   const workbook = XLSX.utils.book_new();

 
//   XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

//   XLSX.writeFile(workbook, "payment_history.xlsx");
// };





//   const getpaymentlist= async()=>{

//     try{
//   const getpaymentlist = await fetch('https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/payment/')
//   const data= await getpaymentlist.json();
//   setPaymentData(data);
//   console.log(data,"datya")


//     }
//     catch (err) {
//       console.error(err.message);
//       setPaymenterror('Something went wrong while fetching data.');
//   }
//   finally{
//     setPaymentloading(false)
//   }
//   };

// useEffect(()=>{
//   getpaymentlist();
// },[])

// const tableRef = useRef(null);


//   const handleStatusChange = (e) =>{
// const{value} = e.target;

// setPayStatus(value);
// }
//   return (
//     <>
//       <div className="page-header">
//         <h2>Payment History</h2>

//         <div className="history-controls">
//           <div className="search-bar">
//             {/* <input
//               type="text"
//               placeholder="Search by user or payment ID..."
//               className="search-input"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             /> */}
//           </div>

//           <div className="filter-controls">
            

//           <button className="export-btn" onClick={exportToExcel}>Export Details</button>

//           </div>
//         </div>

//         <div className="vendors-stats">
//           <div className="stat-card">
//             <h3>Total Payment</h3>
//             <div className="stat-value">₹{totalAmount.toFixed(2)}
// </div>
//           </div>
//           <div className="stat-card">
//             <h3>Pending Amount</h3>
//             <div className="stat-value">₹{pending.toFixed(2)}</div>
//           </div>
//           <div className="stat-card">
//             <h3>Refunded</h3>
//             <div className="stat-value">₹{refunded.toFixed(2)}</div>
//           </div>
//         </div>
//       </div>

//       <table className="customers-table" ref={tableRef}>
//         <thead>
//           <tr>
           
//        <th>Id</th>
//        <th> Customer </th>
//        <th> Product </th>
//        <th>  Image </th>
//        <th>Address</th>
//        <th>Amount</th>
//             <th>Method</th>
//             <th>Date</th>
//             <th>Status</th>
//             <th>Action</th>
//           </tr>
//         </thead>
// <tbody>
//   {paymentloading ? (
//     <tr><td colSpan="7">Loading payment data...</td></tr>
//   ) : paymenterror ? (
//     <tr><td colSpan="7" style={{ color: "red" }}>{paymenterror}</td></tr>
//   ) : (
//    currenthistory.map((item, index) => ( 
//       <tr key={item.id}>
//         <td>{indexofirsthistory + index + 1}</td>
//           {/* <td>{item.order.customer_name}</td> */}
//              <td>{item?.customer_name || "N/A"}</td>
// {/* 
//         <td>{item.order.items[0]?.product_name}</td> */}
//         <td>
//   {item.order.items?.length > 1 
//     ? `${item.order.items[0]?.product_name} +${item.order.items.length - 1} more`
//     : item.order.items[0]?.product_name || "N/A"
//   }
// </td>
// {/* <td>
//   <img 
//     src={item.order.items[0]?.product_image} 
//     alt={item.order.items[0]?.product_name} 
//     width="50" 
//     height="50"
//   />
// </td> */}

// <td>
//   {item.order.items?.length > 0 ? (
//     <div style={{ display: 'flex', gap: '5px' }}>
//       <img 
//         src={item.order.items[0]?.product_image} 
//         alt={item.order.items[0]?.product_name} 
//         width="50" 
//         height="50"
//       />
//       {item.order.items.length > 1 && (
//         <span style={{ alignSelf: 'center', fontSize: '12px' }}>
//           +{item.order.items.length - 1}
//         </span>
//       )}
//     </div>
//   ) : "N/A"}
// </td>

// <td>
//   {item.order.delivery_address.house_details}, 
//   {item.order.delivery_address.city}, 
//   {item.order.delivery_address.state} , {item.order.delivery_address.pincode}
// </td>
//         <td>₹{item.amount}</td>
//         <td>{item.payment_method}</td>
//         <td>
//           {item.created_at
//           ? new Date(item.created_at).toISOString().split("T")[0]
//           : ""}
//           </td>
//         <td style={{ color: 'blue', cursor: 'pointer' }}onClick={()=>setpaymentstatus(true)}>{item.payment_status }</td>
//         <td>
//           <div className='action-buttons'>
//             <button className="action-btn view" onClick={() => setSelectedPayment(item)}>👁</button>

//            <button title="Refund" className="action-btn view"onClick={()=>setRefundForm(true)} >↩</button>
//           </div>
//         </td>
//       </tr>
//     ))
//   )}
// </tbody>


//       </table>
//       {paymentData.length>Historyperpage&&(
//         <div className="pagination"> 
//           <button onClick={() => handlePageChange(currentpage - 1)} disabled={currentpage === 1}>Prev</button>
//             {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
//               <button key={number} className={currentpage === number ? "active" : ""} onClick={() => handlePageChange(number)}>{number}</button>
//             ))}
//             <button onClick={() => handlePageChange(currentpage + 1)} disabled={currentpage === totalPages}>Next</button>
//         </div>
//       )}

//     {selectedPayment && (
//   <div className="modal-overlay">
//     <div className="modal-content">
//       <h2>Payment Details</h2>
      

//       <p><strong>Customer:</strong> {selectedPayment.order?.customer_name}</p>
//       <p><strong>Amount:</strong> ₹{selectedPayment.amount}</p>
//       <p><strong>Method:</strong> {selectedPayment.payment_method}</p>
//       <p><strong>Date:</strong> 
//         {selectedPayment.created_at
//           ? new Date(selectedPayment.created_at).toLocaleString()
//           : ""}
//       </p>
//       {selectedPayment.order?.items?.map((item, index) => (
//   <div key={index} style={{ marginBottom: "15px" }}>
//     <p><strong>Product Name:</strong> {item.product_name}</p>
//     <p>
//       <strong>Product Image:</strong><br />
//       <img 
//         src={item.product_image} 
//         alt={item.product_name} 
//         style={{ width: "100px", height: "100px", objectFit: "cover" }}
//       />
//     </p>
//   </div>
// ))}
//       <p><strong>Delivery Address:</strong>
//         {selectedPayment.order?.delivery_address?.house_details}, 
//         {selectedPayment.order?.delivery_address?.city}, 
//         {selectedPayment.order?.delivery_address?.state} - 
//         {selectedPayment.order?.delivery_address?.pincode}
//       </p>
     
//       <button className="close-btn" onClick={() => setSelectedPayment(null)}>Close</button>
//     </div>
//   </div>
// )}
// {Refundform &&(
//    <div className="modal">
//           <form className="customer-form" >
//             <h3>Refund Form</h3>
          
//         <label>Customer Name:</label>
//         <input
//           type="text"
//           name="first_name"
//           placeholder="Enter customer name"
//           value={refundForm.first_name}
//           onChange={handleRefundInputChange}
//           required
//         />
// {refundFormErrors.first_name && (
//       <p className="error">{refundFormErrors.first_name}</p>
//     )}

  
//         <label>Reason for Refund:</label
//         >
//         <textarea
//           name="reason"
//           placeholder="Enter refund reason"
//           value={refundForm.reason}
//           onChange={handleRefundInputChange}
//           required
//         />

//         {refundFormErrors.reason && (
//       <p className="error">{refundFormErrors.reason}</p>
//     )}


//       <div className="form-buttons">
//               <button type="submit">Save</button>
//               <button type="button"onClick={()=>setRefundForm(false)}>
//                 Cancel
//               </button>
//             </div>
// </form>
// </div>
// )}

      
//     </>
//   );
// };

// export default History;
import * as XLSX from "xlsx";
import React, { useState, useEffect, useRef } from 'react';
 import { useNavigate } from "react-router-dom"


const History = () => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentData, setPaymentData] = useState([]);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [historyPerPage] = useState(5);

  const [refundForm, setRefundForm] = useState(false);

  const [refundFormData, setRefundFormData] = useState({
    first_name: "",
    reason: "",
  });
  const [refundFormErrors, setRefundFormErrors] = useState({
    first_name: "",
    reason: ""
  });
const navigate = useNavigate()

  const handleNavigate = (id) => {
    console.log(id)
    navigate(`/Items/${id}`)
  }

  // Pagination calculations
  const indexOfLastHistory = currentPage * historyPerPage;
  const indexOfFirstHistory = indexOfLastHistory - historyPerPage;
  const currentHistory = paymentData.slice(indexOfFirstHistory, indexOfLastHistory);
  const totalPages = Math.ceil(paymentData.length / historyPerPage);

  // Totals
  const totalAmount = paymentData.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const pendingAmount = paymentData
    .filter((item) => item.payment_status === 'pending')
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  const refundedAmount = paymentData
    .filter((item) => item.payment_status === 'Refunded')
    .reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

  // Fetch payment data
  const getPaymentList = async () => {
    try {
      const response = await fetch('https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/payment/');
      const data = await response.json();
      setPaymentData(data);
    } catch (err) {
      console.error(err.message);
      setPaymentError('Something went wrong while fetching data.');
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    getPaymentList();
  }, []);

  // Export to Excel
  const exportToExcel = () => {
    if (!paymentData || paymentData.length === 0) {
      alert("No payment data to export!");
      return;
    }

    const exportData = paymentData.map((item) => ({
      "Payment ID": item.razorpay_order_id || "N/A",
      "Customer": item.customer_name || "N/A",
      "Amount": item.amount || 0,
      "Method": item.payment_method || "N/A",
      "Date": item.created_at || "N/A",
      "Status": item.payment_status || "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "payment_history.xlsx");
  };

  // Refund form handlers
  const handleRefundInputChange = (e) => {
    const { name, value } = e.target;
    setRefundFormData((prev) => ({ ...prev, [name]: value }));
    setRefundFormErrors({ ...refundFormErrors, [name]: "" });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const tableRef = useRef(null);

  return (
    <>
      <div className="page-header">
        <h2>Payment History</h2>

        <div className="history-controls">
          <div className="filter-controls">
            <button className="export-btn" onClick={exportToExcel}>Export Details</button>
          </div>
        </div>

        <div className="vendors-stats">
          <div className="stat-card">
            <h3>Total Payment</h3>
            <div className="stat-value">₹{totalAmount.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <h3>Pending Amount</h3>
            <div className="stat-value">₹{pendingAmount.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <h3>Refunded</h3>
            <div className="stat-value">₹{refundedAmount.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <table className="customers-table" ref={tableRef}>
        <thead>
          <tr>
            <th>Id</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Image</th>
            <th>Address</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Date</th>
            <th>payment</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {paymentLoading ? (
            <tr><td colSpan="10">Loading payment data...</td></tr>
          ) : paymentError ? (
            <tr><td colSpan="10" style={{ color: "red" }}>{paymentError}</td></tr>
          ) : currentHistory.length === 0 ? (
            <tr><td colSpan="10">No payment records found.</td></tr>
          ) : (
            currentHistory.map((item, index) => (
              <tr key={item.id}>
                <td>{indexOfFirstHistory + index + 1}</td>
                <td>{item.customer_name || "N/A"}</td>
                <td>
                  {item.order?.items?.length > 1
                    ? `${item.order.items[0]?.product_name || "N/A"} +${item.order.items.length - 1} more`
                    : item.order?.items[0]?.product_name || "N/A"
                  }
                </td>
                <td>
                  {item.order?.items?.length > 0 ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <img 
                        src={item.order.items[0]?.product_image} 
                        alt={item.order.items[0]?.product_name} 
                        width="50" 
                        height="50"
                      />
                      {item.order.items.length > 1 && (
                        <span style={{ alignSelf: 'center', fontSize: '12px' }}>
                          +{item.order.items.length - 1}
                        </span>
                      )}
                    </div>
                  ) : "N/A"}
                </td>
                <td>
                  {item.order?.delivery_address
                    ? `${item.order.delivery_address.house_details}, ${item.order.delivery_address.city}, ${item.order.delivery_address.state} - ${item.order.delivery_address.pincode}`
                    : "N/A"}
                </td>
                <td>₹{item.amount}</td>
                <td>{item.payment_method}</td>
                <td>{item.created_at ? new Date(item.created_at).toISOString().split("T")[0] : ""}</td>
                <td style={{ color: 'blue', cursor: 'pointer' }} onClick={() => {}}> {item.payment_status || "N/A"} </td>
                <td>
                  <div className='action-buttons'>
                     <button className="action-btn view" title="View vendor product" onClick={() => handleNavigate(item.id)}>
                        👁
                      </button>
                    
                    <button className="action-btn view" onClick={() => setRefundForm(true)}>↩</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {paymentData.length > historyPerPage && (
        <div className="pagination">
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button key={number} className={currentPage === number ? "active" : ""} onClick={() => handlePageChange(number)}>{number}</button>
          ))}
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}

      {/* Payment Details Modal
      {selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Payment Details</h2>
            <p><strong>Customer:</strong> {selectedPayment.order?.customer_name || "N/A"}</p>
            <p><strong>Amount:</strong> ₹{selectedPayment.amount}</p>
            <p><strong>Method:</strong> {selectedPayment.payment_method}</p>
            <p><strong>Date:</strong> {selectedPayment.created_at ? new Date(selectedPayment.created_at).toLocaleString() : ""}</p>

            {selectedPayment.order?.items?.map((item, index) => (
              <div key={index} style={{ marginBottom: "15px" }}>
                <p><strong>Product Name:</strong> {item.product_name}</p>
                <p>
                  <strong>Product Image:</strong><br />
                  <img 
                    src={item.product_image} 
                    alt={item.product_name} 
                    style={{ width: "100px", height: "100px", objectFit: "cover" }}
                  />
                </p>
              </div>
            ))}

            <p><strong>Delivery Address:</strong> {selectedPayment.order?.delivery_address 
              ? `${selectedPayment.order.delivery_address.house_details}, ${selectedPayment.order.delivery_address.city}, ${selectedPayment.order.delivery_address.state} - ${selectedPayment.order.delivery_address.pincode}`
              : "N/A"}</p>

            <button className="close-btn" onClick={() => setSelectedPayment(null)}>Close</button>
          </div>
        </div>
      )} */}

      {/* Refund Form Modal */}
      {refundForm && (
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
              required
            />
            {refundFormErrors.first_name && <p className="error">{refundFormErrors.first_name}</p>}

            <label>Reason for Refund:</label>
            <textarea
              name="reason"
              placeholder="Enter refund reason"
              value={refundFormData.reason}
              onChange={handleRefundInputChange}
              required
            />
            {refundFormErrors.reason && <p className="error">{refundFormErrors.reason}</p>}

            <div className="form-buttons">
              <button type="submit">Save</button>
              <button type="button" onClick={() => setRefundForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default History;

