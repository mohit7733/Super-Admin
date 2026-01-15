import React from 'react'
import { useState,useEffect } from 'react';
import BASE_URL from '../../Base';
const Center = () => {
   const [filterType, setFilterType] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState("");
  const[Showcenterform,setShowcenterform]=useState(false);
  const[ShowEditform,setShowEditform]=useState(false);
  const[Deleteform,setDeleteform]=useState(false);
  const[WellnessCenterData,setWellnessCenterData]=useState([])
  const[CenterError,setCenterError]=useState(null)
  const[Loading,setLoading]=useState(true)
  // const[CenterForm,setCenterForm]=useState(initalCenterform)
  // const initalCenterform ={
  // name:"" ,
  // location:"",
  // type:"",
  // price:"",

  // }
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

const getcenterData = async()=>{
  try{
const CenterData = await fetch( `${BASE_URL}`,{
 method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
})
const data = await CenterData.json();
setWellnessCenterData(data);

  }
  catch(err){
console.log("Error", err.message)
setCenterError("Something went wrong while fetching data")
  }
  finally{
    setLoading(false)
  }
}
useEffect(()=>{
getcenterData();
},[]);



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
              <button className="add-customer-btn" onClick={()=>setShowcenterform(true)}>
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
                      onClick={()=>setShowEditform(true)}
                    >
                      ✏️
                    </button>
                    <button
                    title="Delete Center"
                      className="action-btn delete"
                   onClick={()=>setDeleteform(true)}

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
{Showcenterform &&(
  <div className='modal'>
   <form className='customer-form'>
    <h1>Add New Center</h1>
    <label>Center Name</label>
    <input
  type="text"
 placeholder="Enter the Center Name"
 
    />
    <label>Location</label>
    <input
    type="text"
    placeholder="Enter Center Location"
   
    />
    <label> Center Type </label>
    <input
    type="text"
placeholder="Enter Type of center"

    />
    <label> Price
    </label>
    <input
    type="number"
    placeholder='Enter price of Center'
  
    />

 <div className="form-buttons">
                <button type="submit">Add Center</button>
                <button
                  type="button"
                  onClick={()=>setShowcenterform(false)}
                >
                  Cancel
                </button>
              </div>
   </form>
  </div>
)}
{ShowEditform && (
  <div className='modal'>
    <form className='customer-form'>
      <h1>Edit Center Details</h1>
        <label>Center Name</label>
    <input
  type="text"
 placeholder="Enter the Center Name"
    />
    <label>Location</label>
    <input
    type="text"
    placeholder="Enter Center Location"
    />
    
    <label> Center Type </label>
    
    <input
    type="text"
placeholder="Enter Type of center"

    />
    <label> Price
    </label>
    <input
    type="number"
    placeholder='Enter price of Center'

    />
 <div className="form-buttons">
                <button type="submit">Edit Center Details</button>
                <button
                  type="button"
                  onClick={()=>setShowEditform(false)}
                >
                  Cancel
                </button>
              </div>
           
    
      </form> 

  </div>
)}
{
  Deleteform &&(
    <div className='modal' >
     <div className="modal-content">
            <h3>Are you sure you want to delete this customer?</h3>
            <div className="form-buttons">
              <button className="otp-btn verify-btn"
              >
                Yes
              </button>
              <button onClick={()=>setDeleteform(false)}>No</button>
            </div>
          </div>  
      
    </div>
  )
}
 
    </>
  )
}

export default Center