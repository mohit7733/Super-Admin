import React, { useState } from 'react';


const Booking = () => {
    const[filter,setFilter]=useState("all")
    const[searchTerm,setSearchTerm]=useState("")
    const[Bookingform,setBookingform]=useState(false)
    const dummyBookings = [
  {
    id: 1,
    patientName: "John Doe",
    doctorName: "Dr. Smith",
    date: "2025-09-20",
    time: "10:00 AM",
    status: "Pending",
  },
  {
    id: 2,
    patientName: "Jane Roe",
    doctorName: "Dr. Adams",
    date: "2025-09-21",
    time: "02:00 PM",
    status: "Confirmed",
  },
  {
    id: 3,
    patientName: "Alice Lee",
    doctorName: "Dr. Brown",
    date: "2025-09-22",
    time: "11:30 AM",
    status: "Completed",
  },
];
const filterData = dummyBookings
  .filter(center =>
    filter === "all" ? true : center.status === filter
  )
  .filter(booking => 
    booking.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.doctorName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
 <div className="page-header">
        <h1>Consultation Booking</h1>
      </div>
       <div className="doctor-controls">
        <div className="search-bar">
          <input
             type="text"
            placeholder="Search by Doctor Name and Patient Name"
            className="search-input"
            value={searchTerm}
            onChange={(e)=>setSearchTerm(e.target.value)}
            
          />
        </div>
<div className="filter-controls">
   
              <button className="add-customer-btn"  onClick={()=>setBookingform(true)}>
            + Add Consultation 
          </button>
          <button className="add-customer-btn" >
  Export Details
</button>

</div>

        </div>
         <div className="customers-stats">
 <div className="stat-card">
       
          <h3>Total Consultation</h3>
          <div className="stat-value">{dummyBookings.length}</div>
        </div>
       

        <div className="stat-card">
           
          <h3> Completed Consultation</h3>
           <div className="stat-value">{dummyBookings.filter((c)=>c.status==="Completed").length}</div> 
        </div>
       
       <div className="stat-card">
       
          <h3>pending Consultation</h3>

          <div className="stat-value">{dummyBookings.filter((c)=> c.status==="Pending").length}</div>
        </div>
       
       
        
        <div className="stat-card">
            
          <h3>Approve Consultation</h3>
           <div className="stat-value">{dummyBookings.filter((c)=>c.status==="Confirmed").length}</div> 
        </div>
      </div>
         <div className="filter-buttons">
              <button onClick={()=>setFilter ('all')}>All</button>
                <button onClick={()=>setFilter ('Completed')}>Completed</button>
          <button onClick={()=>setFilter('Confirmed')} >Confirmed</button>
        <button onClick={()=>setFilter('Pending')

        }>Pending</button>
        
      </div>

<div className="table-container">
      <table className="customers-table" >
        <thead>
          <tr>
            <th>Id</th>
            <th>Patient Name</th>
            <th>Doctor Name</th>
            <th>Date</th>
      <th>Time</th>
      <th> Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          { 
            filterData.map((book) => 
              (           
                <tr key={book.id}>
                <td>{book.id} </td>
                <td>{book.patientName}</td>
                <td>{book.doctorName}</td>
                <td> {book.date}</td>

                <td> {book.time}</td>
                <td>{book.status} </td>

                <td>
                  <div className="action-buttons">
                    <button className="action-btn view"  >
                      👁
                    </button>
                    <button
                      className="action-btn edit"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn delete"
                      
                    >
                      🗑
                    </button>

                  </div>
                </td>
              </tr>
            ))
        }
        
        </tbody>
      </table>
      </div>
      {Bookingform && (
  <div className="modal">


      <form
        className="customer-form"
      >
        <h2>Consultation Form</h2>
       
          <label>Patient Name</label>
          <input type="text" placeholder="Enter Patient Name" 
           />
          <label>Doctor Name</label>
          <input type="text" placeholder="Enter Doctor Name" />
          <label>Date</label>
          <input type="date"  />
          <label>Time</label>
          <input type="time"  />
        <div className="form-buttons">
          <button type="submit" className="submit-btn">
            Submit
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => setBookingform(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  
)}


    </>
  )
}

export default Booking