import React from 'react'
import { useState,useEffect } from 'react';
import BASE_URL from '../../Base';
import StarRating from "./StarRating";
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import * as XLSX from "xlsx";
import { useNavigate } from 'react-router-dom';


const intialcenterform={
    name:"",
    location:"",
    average_rating:"",
    price:"",
    amenities:"",
    main_image:"",
  }

const Center = () => {
   const [filterType, setFilterType] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState("");
  const[Showcenterform,setShowcenterform]=useState(false);
  const[ShowEditform,setShowEditform]=useState(false);
  const[Deleteform,setDeleteform]=useState(false);
  const[WellnessCenterData,setWellnessCenterData]=useState([])
  const[CenterError,setCenterError]=useState(null)
  const[Loading,setLoading]=useState(true)
  const[Selectedcenter,setSelectedcenter]=useState(null)
  const[AddCenterform,setAddCenterform]=useState(intialcenterform)
  const[EditCenterform,setEditCenterform]=useState(intialcenterform)
  const [centerPreviewImage, setCenterPreviewImage] = useState(null);
  const [AddCenterErrors, setAddCenterErrors] = useState({});
  const [EditCenterErrors, setEditCenterErrors] = useState({});
 const  navigate =useNavigate();

const filteredData =WellnessCenterData
  .filter(center =>
    filterType === "all" ? true : center.type === filterType
  )
  .filter(center =>
    center.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

const getcenterData = async()=>{
  const token = sessionStorage.getItem("superadmin_token")

  try{
const response = await fetch( `${BASE_URL}/wellness/wellness-centres/`,{
 method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
       Authorization: `Bearer ${token}`,

        },
})
 if (response.status === 401 || response.status === 403) {
            toast.error("Session expired. Please login again");
            sessionStorage.removeItem("superadmin_token");
            navigate("/login");
            return;
        }
const data = await response.json();
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





const handleDeleteCenter = async (id) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/ecom/wellness-centres/${id}/`, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, 
      },
    });

    
    if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Delete Error:", errorText);
      toast.error("Failed to delete center");
      return;
    }

    toast.success("Deleted successfully");
    getcenterData();

  } catch (err) {
    console.log("Delete Catch Error:", err.message);
    toast.error("Something went wrong while deleting");
  }
};




const  handleStatusChange = async(id,newStatus)=>{
  console.log(id,"id")
  const token = sessionStorage.getItem("superadmin_token")
  try{

const formData = new FormData();
formData.append("status",newStatus)
const response = await fetch (`${BASE_URL}/ecom/wellness-centres-status/${id}/`,{
   method:"PUT",
   headers:{
Authorization:`Bearer ${token}`,
   },
    body:formData,
    })

     if (response.status === 401 || response.status === 403) {
                toast.error("Session expired. Please login again");
                sessionStorage.removeItem("superadmin_token");
                navigate("/login");
                return;
            }
if (response.ok){
  toast.success(`Status Updated to ${newStatus}`);
  setWellnessCenterData((prev)=>
    prev.map((c) =>c.id===id?{...c,status:newStatus}:c)

);

}
else{
toast.error("Failed to Update a Status ")
}
  }
  catch(err){
    console.error(err)
    toast.error("Something Went Wrong!")

  }
}


const handleCenterinputchange = (e) => {
  const { name, value, files } = e.target;

  if (name === "main_image") {
    const file = files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload a valid image");
        return;
      }
      setAddCenterform((prev) => ({ ...prev, main_image: file }));
      toast.success("Image uploaded successfully");
    }
  } else if (name === "average_rating") {

    if (value === "" || (value >= 1 && value <= 5)) {
      setAddCenterform((prev) => ({ ...prev, average_rating: value }));
    } else {
      toast.error("Rating must be between 1 and 5");
    }
  } else {
    setAddCenterform((prev) => ({ ...prev, [name]: value }));
  }
  if (AddCenterErrors[name]) {
    setAddCenterErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }
};

const handleEditCenterSubmit = async (e) => {
  e.preventDefault();

  if (!Selectedcenter) {
    toast.error("No center selected for editing!");
    return;
  }

  const formData = new FormData();
  formData.append("name", EditCenterform.name);
  formData.append("location", EditCenterform.location);
  formData.append("amenities", EditCenterform.amenities);
  formData.append("price", EditCenterform.price);
  formData.append("average_rating", EditCenterform.average_rating || 0);

  if (EditCenterform.main_image instanceof File) {
    formData.append("main_image", EditCenterform.main_image);
  }
  const token = sessionStorage.getItem("superadmin_token")

  try {
    const response = await fetch(`${BASE_URL}/wellness/wellness-centres/${Selectedcenter}/`, {
      method: "PUT",
      headers:{
        Authorization:`Bearer ${token}`,
      },
      body: formData,
    });
     if (response.status === 401 || response.status === 403) {
                toast.error("Session expired. Please login again");
                sessionStorage.removeItem("superadmin_token");
                navigate("/login");
                return;
            }

    if (response.ok) {
      const updatedCenter = await response.json();

      setWellnessCenterData((prevData) =>
        prevData.map((center) =>
          center.id === Selectedcenter ? updatedCenter : center
        )
      );



      toast.success("Center updated successfully!");
      setShowEditform(false);
      setSelectedcenter(null);
      setEditCenterform(intialcenterform);
      setCenterPreviewImage(null);
    } else {
      const errorData = await response.json();
      console.error("Error response:", errorData);
      toast.error("Failed to update center. Try again!");
    }
  } catch (error) {
    console.error("Error updating center:", error);
    toast.error("Something went wrong while updating center.");
  }
};



const handleInputChange =(e)=>{
  const{name,value,files}=e.target;
  if(name==="main_image"){
    const file = files[0];
    if(file){
if(!file.type.startsWith("image/")){
  toast.error("please Upload a vaild image")
  return;
}
setEditCenterform((prev)=>({...prev,main_image:file}))
    toast.success("Image Uploaded Sucessfully")
}
  }
  else{
    setEditCenterform((prev)=>({...prev,[name]:value}))
  }
}


const handleAddCenterSubmit = async (e) => {
  e.preventDefault();
  let errors = {};

  if (!AddCenterform.name.trim()) errors.name = "Center name is required";
  if (!AddCenterform.location.trim()) errors.location = "Location is required";
  if (!AddCenterform.price) errors.price = "Price is required";
  if (!AddCenterform.amenities.trim()) errors.amenities = "Amenities are required";
  if (!AddCenterform.average_rating) errors.average_rating = "Rating is required";
  if(!AddCenterform.main_image) errors.main_image="Please Upload a Image"

  setAddCenterErrors(errors);
  if (Object.keys(errors).length > 0) return; 
  const formData = new FormData();
  formData.append("name", AddCenterform.name);
  formData.append("location", AddCenterform.location);
  formData.append("amenities", AddCenterform.amenities);
  formData.append("price", AddCenterform.price);
  formData.append("average_rating", AddCenterform.average_rating);
  if (AddCenterform.main_image) {
    formData.append("main_image", AddCenterform.main_image);
  }
const token = sessionStorage.getItem("superadmin_token")
  try {
    const response = await fetch(`${BASE_URL}/wellness/wellness-centres/`, {
      method: "POST",
      headers:{
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

     if (response.status === 401 || response.status === 403) {
                toast.error("Session expired. Please login again");
                sessionStorage.removeItem("superadmin_token");
                navigate("/login");
                return;
            }
    if (response.ok) {
      const newCenter = await response.json();
      setWellnessCenterData((prev) => [...prev, newCenter]);
      setShowcenterform(false);
      setAddCenterform(intialcenterform);
      setAddCenterErrors({});
      toast.success("Center added successfully!");
    } else {
      toast.error("Failed to add center. Try again!");
    }
  } catch (error) {
    console.error("Error adding center:", error);
    toast.error("Something went wrong while adding center.");
  }
};



const handleDownload = () => {
  if (!WellnessCenterData || WellnessCenterData.length === 0) {
    toast.error("No data available to export!");
    return;
  }

  const exportData = WellnessCenterData.map((center, index) => ({
    ID: index + 1,
    Name: center.name,
    Location: center.location,
    Amenities: center.amenities,
    Price: `₹${center.price}`,
    Rating: center.average_rating,
    "Image URL": center.main_image || "N/A",
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Wellness Centers");

  XLSX.writeFile(wb, "Wellness_Centers.xlsx");
  toast.success("Exported successfully!");
};

const handleNavigate=(id) =>{
 navigate(`/Wellnessdetail/${id}`)
}


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
          <button className="add-customer-btn" onClick={handleDownload}>
  Export Details
</button>


</div>

        </div>
         <div className="customers-stats">
        <div className="stat-card">
           
          <h3>All Center</h3>
           <div className="stat-value">{WellnessCenterData.length}</div> 
        </div>
       
       <div className="stat-card">
       
          <h3>Top Center</h3>
          <div className="stat-value">{WellnessCenterData.filter((c)=> c.type==="top").length}</div>
        </div>

        <div className="stat-card">
            
          <h3>Trending Detox Center</h3>
           <div className="stat-value">{WellnessCenterData.filter((c)=>c.type==="trending").length}</div> 
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
            <th>Image</th>
            <th>Location</th>
            <th>Amenities</th>
            <th>₹Price</th>
            <th> Status</th>
            <th>Rating</th>
            <th>Action</th>
            
           </tr>
 </thead>
<tbody>
  {Loading? (
     <tr>
            <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
              <div className="circular-loader"></div>
            </td>
          </tr>
  ) : CenterError ? (
    <tr>
      <td colSpan="9" style={{ color: "red", textAlign: "center" }}>
        { CenterError}
      </td>
    </tr>
  ) : filteredData.length > 0 ? (
    filteredData.map((center, index) => (
      <tr key={center.id}>
        <td>{index + 1}</td>
        <td>{center.name}</td>
        <td>
          <img
            src={`${center.main_image}`}
            alt="Center"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "8px",
              objectFit: "cover",
            }}
          />
        </td>
        <td>{center.location}</td>
        <td>{center.amenities}</td>
        <td>₹ {center.price}</td>

        <td>
          <select
            value={center.status}
            onChange={(e) => handleStatusChange(center.id, e.target.value)}
            className="status-dropdown"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </td>

        <td><StarRating rating={center.average_rating} /></td>

        <td>
          <div className="action-buttons">
            <button
              title="View Details"
              className="action-btn view"
              onClick={()=>handleNavigate(center.id)}
            >
              👁
            </button>
            <button
              title="Edit Details"
              className="action-btn edit"
              onClick={() => {
                setShowEditform(true);
                setSelectedcenter(center.id);
                setEditCenterform(center);
                setCenterPreviewImage(center.main_image);
              }}
            >
              ✏️
            </button>
            <button
              title="Delete Center"
              className="action-btn delete"
              onClick={() => {
                setDeleteform(true);
                setSelectedcenter(center.id);
              }}
            >
              🗑
            </button>
          </div>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="9" style={{ textAlign: "center" }}>
        No Data Found
      </td>
    </tr>
  )}
</tbody>


      </table>
      </div>
{Showcenterform &&(
  <div className='modal'>
   <form className='product-form' onSubmit={handleAddCenterSubmit}>
    <h1>Add New Center</h1>
    <div className='form-grid'>
      <div className='form-column-1'>
        <div className='form-field'>
    <label>Center Name</label>
    <input
  type="text"
  name="name"
 placeholder="Enter the Center Name"
 value={AddCenterform.name}
 onChange={handleCenterinputchange}
 
    />
      {AddCenterErrors.name && <p className="error-msg">{AddCenterErrors.name}</p>}

    </div>
    <div className='form-field'>
    <label>Location</label>
    <input
    type="text"
    name="location"
    placeholder="Enter Center Location"
    value={AddCenterform.location}
    onChange={handleCenterinputchange}
   
    />
      {AddCenterErrors.location && <p className="error-msg">{AddCenterErrors.location}</p>}

    </div>
  <div className='form-field'>
    <label> Price
    </label>
    <input
    type="number"
    placeholder='Enter price of Center'
    name='price'
    value={AddCenterform.price}
    onChange={handleCenterinputchange}
  
    />
      {AddCenterErrors.price && <p className="error-msg">{AddCenterErrors.price}</p>}

    </div>
    </div>
    <div className='form-column-2'>
      <div className='form-field'>
    <label> Image</label>


    <input
    type="file"
    name="main_image"
      accept="image/*"  
    onChange={handleCenterinputchange}
    />
        {AddCenterErrors.main_image && (
        <p className="error-msg">{AddCenterErrors.main_image}</p> )}

    </div>
    <div className='form-field'>
    <label> Amenities</label>
    <input
    type="text"
    name="amenities"
    placeholder='Please Enter Amenities'
    value={AddCenterform.amenities}
    onChange={handleCenterinputchange}
    />
      {AddCenterErrors.amenities&& <p className="error-msg">{AddCenterErrors.amenities}</p>}

   </div>
   <div className='form-field'>
<label>Rating</label>
<input
  type="number"
  name="average_rating"
  value={AddCenterform.average_rating}
  placeholder="Enter rating (1 to 5)"
  min="1"
  max="5"
  onChange={handleCenterinputchange}
/>
  {AddCenterErrors.average_rating && <p className="error-msg">{AddCenterErrors.average_rating}</p>}

</div>
</div>
</div>
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
    <form className='product-form' onSubmit={handleEditCenterSubmit}>
      <h1>Edit Center Details</h1>
      <div className='form-grid'>
        <div className='form-column-1'>
          <div className='form-field'>
        <label>Center Name</label>
    <input
  type="text"
 placeholder="Enter the Center Name"
 name="name"
 value={EditCenterform.name}
 onChange={handleInputChange}
    />
      {EditCenterErrors.name && <p className="error-msg">{EditCenterErrors.name}</p>}

    </div>
    <div className='form-field'>
    <label>Location</label>
    <input
    type="text"
    placeholder="Enter Center Location"
    name="location"
    value={EditCenterform.location}
    onChange={handleInputChange}
    
    />
      {EditCenterErrors.location && <p className="error-msg">{EditCenterErrors.location}</p>}

    </div>
    <div className='form-field'>
    <label> Amenities </label>
    
    <input
    type="text"
placeholder="Enter Type of center"
name="amenities"
value={EditCenterform.amenities}
onClick={handleInputChange}
    />
      {EditCenterErrors.amenities && <p className="error-msg">{EditCenterErrors.amenities}</p>}

    </div>
    </div>



    <div className='form-column-2'>
      <div className='form-field'>
    <label> Price
    </label>
    <input
    type="number"
    placeholder='Enter price of Center'
    name="price"
    value={EditCenterform.price}
    onClick={handleInputChange}
    />
      {EditCenterErrors.price && <p className="error-msg">{EditCenterErrors.price}</p>}
    </div>

<div className='form-field'>
 <label>Image</label>
      <input
        type="file"
        name="main_image"
        accept="image/*"
        onChange={handleInputChange}
      />
      {EditCenterErrors.main_image && <p className="error-msg">{EditCenterErrors.main_image}</p>}

      </div>
      {centerPreviewImage && !AddCenterform.main_image && (
          <div className="image-preview">
            <p>Current Image:</p>
            <img src={centerPreviewImage} alt="Current" width="100" />
          </div>
        )}

      </div>
      </div>

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
        <h3>Are you sure you want to delete this center?</h3>
        <div className="form-buttons">
          <button
            className="otp-btn verify-btn"
            onClick={() => handleDeleteCenter(Selectedcenter)}
          >
            Yes
          </button>

          <button onClick={() => setDeleteform(false)}>No</button>
        </div>
      </div>
    </div>
  )
}

                
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
  )
}

export default Center






