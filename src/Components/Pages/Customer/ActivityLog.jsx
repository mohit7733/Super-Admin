import React, { useEffect ,useState} from 'react'


const Paymenthistory = () => {
  const[Loading,setLoading]=useState(false);
  const[Data,setData]=useState([]);
  const[Error,setError]=useState(null);
 const activityLogData = [
  {
    id: 1,
    activity: "Logged In",
    performedBy: "Customer",
    status: "Success",
    dateTime: "11 May 2026, 10:30 AM",
  },
  {
    id: 2,
    activity: "Consultation Booked",
    performedBy: "Customer",
    status: "Completed",
    dateTime: "11 May 2026, 11:00 AM",
  },
  {
    id: 3,
    activity: "Payment Completed",
    performedBy: "Customer",
    status: "Paid",
    dateTime: "11 May 2026, 11:05 AM",
  },
  {
    id: 4,
    activity: "Prescription Uploaded",
    performedBy: "Admin",
    status: "Uploaded",
    dateTime: "11 May 2026, 12:20 PM",
  },
  {
    id: 5,
    activity: "Order Shipped",
    performedBy: "Admin",
    status: "Success",
    dateTime: "12 May 2026, 09:10 AM",
  },
  {
    id: 6,
    activity: "Address Updated",
    performedBy: "Customer",
    status: "Updated",
    dateTime: "12 May 2026, 05:00 PM",
  },
];
  return (
    <>
       <div className='table-wrapper1'>
 
  
    <table className="data-table">
      <thead>
        <tr>
          <th> Id</th>
          <th>Activity</th>
          <th>Performed By</th>
          <th>Status</th>
          <th>Date & Time</th>
          

          
        
        </tr>
      </thead>
      <tbody>
     
        { Loading? (
  <tr><td colSpan="9">Loading Activity Logo...</td></tr>
) 
: activityLogData?.length > 0 ? (
 activityLogData.map((activity, index) => (
      <tr key={activity?.id || index}>
        <td>{index+1}</td>
        <td>{activity?.activity}</td>
        <td>₹{activity?.performedBy}</td>
        <td>{activity?.status}</td>
        <td>{activity?. dateTime}</td>
      
         

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
