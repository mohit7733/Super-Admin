import React from 'react'
import { useState } from 'react';

const Center = () => {
   const [filterType, setFilterType] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState("");
const wellnessData = [
  { id: 1, name: "Relax Hub", location: "Delhi", price: 1200,  type: "top" },
  { id: 2, name: "Zen Spa", location: "Mumbai", price: 1500,  type: "trending" },
  { id: 3, name: "Wellness Point", location: "Bangalore", price: 1000,  type: "top" },
  { id: 4, name: "Healthy Life", location: "Pune", price: 1300,type: "trending" },
];
const filteredData = wellnessData
  .filter(center =>
    filterType === "all" ? true : center.type === filterType
  )
  .filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <>
          <div className="page-header">
        <h1>Wellness Center</h1>
      </div>
        <div className="doctor-controls">
        <div className="search-bar">
          <input
             type="text"
            placeholder="Search Wellness Center By Name"
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
<div className="filter-controls">
   
              <button className="add-customer-btn" >
            + Add WellnessCenter
          </button>
          <button className="add-customer-btn" >
  Export Detils
</button>

</div>

        </div>
         <div className="customers-stats">
        <div className="stat-card">
           
          <h3>All Center</h3>
           <div className="stat-value">{wellnessData.length}</div> 
        </div>
       
       <div className="stat-card">
       
          <h3>Top Center</h3>
          <div className="stat-value">{wellnessData.filter((c)=> c.type==="top").length}</div>
        </div>
       
       
        
        <div className="stat-card">
            
          <h3>Trending Detox Center</h3>
           <div className="stat-value">{wellnessData.filter((c)=>c.type==="trending").length}</div> 
        </div>
      </div>

      <div className="filter-buttons">
                <button onClick={() => setFilterType('all')}>All</button>
          <button onClick={() => setFilterType('top')}>Top</button>
        <button onClick={() => setFilterType('trending')}>Trending</button>
        
      </div>

<div className="table-container">
      <table className="customers-table" >
        <thead>
          <tr>
            <th>Id</th>
            <th>Center Name</th>
            <th>Location</th>
            <th>Center Type</th>
      <th>₹ Starting Rate</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {
            
            filteredData.map((center) => 
              (           
                <tr key={center.id}>
                <td>{center.id} </td>
                <td>{center.name}</td>
                <td>{center.location}</td>
                <td> {center.type}</td>
                <td> ₹ {center.price}</td>
                <td>
                  <div className="action-buttons">
                    <button
                    title=" view details"
                    className="action-btn view"  >
                      👁
                    </button>
                    <button
                    title="edit details"
                      className="action-btn edit"
                    >
                      ✏️
                    </button>
                    <button
                    title="Delete Center"
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




    
    </>
  )
}

export default Center