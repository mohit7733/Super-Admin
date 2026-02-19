import React from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
const Auditlogs = () => {
    const[searchTerm,setSearchTerm]=useState("");
    const[SelectedDate,setSelectedDate]=useState("");
    const[currentpage,setCurrentpage]=useState(1);
    const[logsperpage,setlogperpage]=useState(5);

const auditLogs = [
  {
    id: 1,
    action: "Create",
    user: "customer",
    customerName: "Kavita Sharma",
    date:"2025-10-15 ",
    details: "Created new customer profile with phone +919876543210"
  },
  {
    id: 2,
    action: "Update",
    user: "customer",
    customerName: "Rohan Verma",
    date:"2025-10-15 ",
    details: "Updated email from rohan@gmail.com to rohan.verma@gmail.com"
  },
  {
    id: 3,
    action: "Delete",
    user: "customer",
    customerName: "Pooja Singh",
    date:"2025-10-15 ",
    details: "Deleted customer account due to request"
  },
  {
    id: 4,
    action: "Login",
    user: "vendor",
    customerName: "Rahul",
    date:"2025-10-15 ",
    details: "Logged into the system"
  },
  {
    id: 5,
    action: "Update",
    user: "doctor",
    customerName: "Kavita Sharma",
    date:"2025-10-14 ",
    details: "Changed phone number from +919876543210 to +919691457891"
  },
  {
    id: 6,
    action: "Update",
    user: "doctor",
    customerName: "Kavita Sharma",
    date:"2025-10-14 ",
    details: "Changed phone number from +919876543210 to +919691457891"
  }
];


const filterData=auditLogs.filter((logs)=>{
   const matchsearch =
  (logs?.customerName && logs?.customerName?.toLowerCase().includes(searchTerm?.toLowerCase())) ||
  (logs?.user && logs?.user?.toLowerCase().includes(searchTerm.toLowerCase())) ||
  (!logs?.customerName && !logs?.user && searchTerm === "");
  const matchesDate =
  !SelectedDate ||
  (logs.date &&
    new Date(logs.date.trim()).toISOString().split("T")[0] === SelectedDate);
return matchsearch && matchesDate ;
})

    const indexoflastlog=currentpage*logsperpage;
    const indexoffirstlog=indexoflastlog - logsperpage;
    const Currentlogs=filterData.slice(indexoffirstlog,indexoflastlog);
    const totalpages=Math.ceil(filterData.length/logsperpage);
    const handlepagechange=(pagenumber)=>setCurrentpage(pagenumber);

  return (
    <>
        <div className="page-header">
        <h1>Audit Logs</h1>
      </div>

<div className="customers-controls">
        <div className="search-bar">
         <input
  type="text"  
  placeholder="Search by Customer name..."
  className="search-input"
  value={searchTerm}
  onChange={(e)=>setSearchTerm(e.target.value)}
 
/>

        </div>
        <div className='filter-controls'>
            <input
            type="date"
             className="status-filter"
            value={SelectedDate}
            onChange={(e)=>setSelectedDate(e.target.value)}
            />

        </div>

</div>

<div className='table-container'>
    <table className="customers-table">

    <thead>
        <th>Action</th>
        <th>User</th>
        <th>Custoner Name</th>
        <th>Date</th>
        <th>Details</th>
    </thead>
<tbody>
    {Currentlogs.map((data, index) => (
    <tr key={index}>
      <td>{data.action}</td>
      <td>{data.user}</td>
      <td>{data.customerName}</td>
      <td>{data.date}</td>
      <td>{data.details}</td>
    </tr>
  ))}  
</tbody>
    </table>
    {auditLogs.length > logsperpage &&(
        <div className='pagination'> 
<button onClick={()=>handlepagechange(currentpage - 1)  } disabled={currentpage===1}>Prev</button>
   {Array.from({ length: totalpages }, (_, i) => i + 1).map(number => (
              <button key={number} className={currentpage === number ? "active" : ""} onClick={() => handlepagechange(number)}>{number}</button>
            ))}
<button onClick={()=>handlepagechange(currentpage + 1)} disabled={currentpage===totalpages}>Next</button>

        </div>
    )
    
    }
    </div>
        </>

  )
}

export default Auditlogs