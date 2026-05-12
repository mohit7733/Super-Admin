import React, { useEffect ,useState} from 'react'


const Paymenthistory = () => {
  const[Loading,setLoading]=useState(false);
  const[Data,setData]=useState([]);
  const[Error,setError]=useState(null);
  const paymentHistoryData = [
  {
    paymentId: "PAY1001",
    orderType: "Product Order",
    orderId: "ORD2301",
    date: "08 May 2026",
    amount: 1250,
    paymentMethod: "UPI",
    status: "Paid",
    transactionId: "TXN789451",
  },
  {
    paymentId: "PAY1002",
    orderType: "Consultation",
    orderId: "CON540",
    date: "09 May 2026",
    amount: 799,
    paymentMethod: "Card",
    status: "Pending",
    transactionId: "TXN789452",
  },
  {
    paymentId: "PAY1003",
    orderType: "Product Order",
    orderId: "ORD2302",
    date: "10 May 2026",
    amount: 2100,
    paymentMethod: "COD",
    status: "Failed",
    transactionId: "TXN789453",
  },
  {
    paymentId: "PAY1004",
    orderType: "Consultation",
    orderId: "CON541",
    date: "11 May 2026",
    amount: 599,
    paymentMethod: "Net Banking",
    status: "Paid",
    transactionId: "TXN789454",
  },
  {
    paymentId: "PAY1005",
    orderType: "Product Order",
    orderId: "ORD2303",
    date: "12 May 2026",
    amount: 3400,
    paymentMethod: "UPI",
    status: "Refunded",
    transactionId: "TXN789455",
  },
  {
    paymentId: "PAY1006",
    orderType: "Consultation",
    orderId: "CON542",
    date: "13 May 2026",
    amount: 999,
    paymentMethod: "Wallet",
    status: "Paid",
    transactionId: "TXN789456",
  },
  {
    paymentId: "PAY1007",
    orderType: "Product Order",
    orderId: "ORD2304",
    date: "14 May 2026",
    amount: 1850,
    paymentMethod: "Card",
    status: "Pending",
    transactionId: "TXN789457",
  },
  {
    paymentId: "PAY1008",
    orderType: "Consultation",
    orderId: "CON543",
    date: "15 May 2026",
    amount: 450,
    paymentMethod: "UPI",
    status: "Paid",
    transactionId: "TXN789458",
  },
];
  return (
    <>
       <div className='table-wrapper1'>
 
  
    <table className="data-table">
      <thead>
        <tr>
          <th>Payment Id</th>
          <th>Order Type</th>
          <th>Order Id</th>
          <th>Date</th>
          <th>Amount</th>
          <th> payment Method</th>
          
          <th>Payment Status</th>
          <th> Transaction Id</th>
          
        
        </tr>
      </thead>
      <tbody>
     
        { Loading? (
  <tr><td colSpan="9">Loading Payment Data...</td></tr>
) 
: paymentHistoryData?.length > 0 ? (
 paymentHistoryData.map((order, index) => (
      <tr key={order?.id || index}>
        <td>{order?.paymentId}</td>
        <td>{order?.orderType}</td>
        <td>₹{order?.orderId}</td>
        <td>{order?.date}</td>
        <td>{order?.amount}</td>
        <td>{order?.paymentMethod}</td>
        <td>{order?.status}</td>
        <td>{order?.transactionId}</td>
         

      </tr>
    ))
) : (
  <tr><td colSpan="9" style={{ textAlign: "center" }}>No Payment Data</td></tr>
)
       
}
      </tbody>
    </table>
     
      
      </div>
    
    </>
  )
}

export default Paymenthistory