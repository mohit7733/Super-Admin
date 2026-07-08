import React, { useState ,useEffect } from 'react'
import {
  FaChartLine,
  FaCalendarAlt,
  FaTags,
  FaCheckCircle,
  FaEdit,
  FaTag,
} from "react-icons/fa";

import { BsSearch,BsPlus } from "react-icons/bs";
import { FiTrash2 } from "react-icons/fi";
import { toast } from 'react-toastify'
import BASE_URL from "../../../Base";
import { useNavigate } from 'react-router-dom';

const Brand = () => {
    const[BrandData,setBrandData]=useState([]);
    const[Error,setError]=useState(null);
    const[Loading,setLoading]=useState(false);
    const[BrandModal,setBrandModal]=useState(false);
    const[addErrors,setAddErrors]=useState({});
    const navigate = useNavigate();

const [ BrandForm, setBrandForm] = useState({
  name: "",
  description: "",
  is_active: false,
});

  const [deleteModal, setDeleteModal] = useState(false);
const [BrandId, setBrandId] = useState(null);


const handleEditChange = (e) => {
  const { name, value, type, checked } = e.target;

  setEditForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));

  setEditErrors((prev) => ({
    ...prev,
    [name]: "",
  }));
};

const [editModal, setEditModal] = useState(false);

const [editForm, setEditForm] = useState({
  id: "",
  name: "",
  description: "",
  is_active: true,
});
const [editErrors, setEditErrors] = useState({});

     const handleToggle = async (id, currentStatus) => {
  const token = sessionStorage.getItem("superadmin_token");
  if(!token){
    toast.error("Session Expired,please login Again");
    navigate("/login");
    return;
  }

  try {
    const response = await fetch(
     `${BASE_URL}/vendors/admin/brand-name/?id=${id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
           "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      }
    );

    const data = await response.json();
    console.log(data);

    toast.success("Status updated successfully");

getbrandlist();
  } catch (error) {
    console.error(error);
    toast.error("Failed to update status");
  }
};
const handleBrandChange = (e) => {
  const { name, value, type, checked } = e.target;

  setBrandForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};

const getbrandlist = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/brand-name/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log("Product Category API Response:", data);

    setBrandData(data.data);
    

  } catch (err) {
    console.error("Product Category Fetch Error:", err);
    setError("Something went wrong while fetching categories.");
    toast.error("Failed to fetch product categories");
  } finally {
    setLoading(false);
  }
};
useEffect(()=>{
    getbrandlist();
},{})


const AddProductBrand = async (e) => {
  e.preventDefault();
    let newErrors = {};

  if (!BrandForm.name.trim()) {
    newErrors.name = "Brand name is required";
  }

  

  setAddErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    Object.values(newErrors).forEach((msg) => {
      toast.error(msg);
    });
    return;
  }

  const token = sessionStorage.getItem("superadmin_token");

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/brand-name/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(BrandForm),
      }
    );

    const data = await response.json();
    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }


    if (response.ok) {
      toast.success("Product Brand Added Successfully");

      setBrandModal(false);

      setBrandForm({
        name: "",
        description: "",
        is_active: false,
      });

      getbrandlist();
    }
    else {
  const errorMessage =
    data?.errors?.name?.[0] ||
    data?.message ||
    "Failed to add brand";

  toast.error(errorMessage);
}
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
};

const handleUpdateBrand = async (e) => {
  e.preventDefault();

  let newErrors = {};

  if (!editForm.name.trim()) {
    newErrors.name = "Category name is required";
  }

  
  setEditErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    toast.error(Object.values(newErrors)[0]);
    return;
  }

  const token = sessionStorage.getItem("superadmin_token");

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/brand-name/?id=${editForm.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          is_active: editForm.is_active,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success("Product Brand Updated Successfully");

      setEditModal(false);

      getbrandlist();
    } else {
      const errorMessage =
        data?.errors?.name?.[0] ||
        data?.message ||
        "Failed to update category";

      setEditErrors({
        name: data?.errors?.name?.[0] || "",
      });

      toast.error(errorMessage);
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
};
const handleDelete = async (id) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/brand-name/?id=${id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      toast.error(data?.message || "Failed to delete Brand");
      return;
    }

  
    setBrandData((prev) =>
      prev.filter((item) => item.id !== id)
    );

    toast.success("Brand deleted successfully");
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong while deleting");
  }
};
  return (
    <>
     <div className="page-header">
            <h1>Brand Name  Management</h1>
            <p className="page-paragraph">
              Manage Brand Name, their details
            </p>
          </div>
    
              <div className="vendors-stats stats2-grid">
                <div className="stat2-card">
                  <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                  <FaTag size={24} />
                  </div>
                  <div className="stat2-info">
                    <h3>Total Brand</h3>
                    <div className="stat2-value">0</div>
                  </div>
                </div>
        
                <div className="stat2-card">
                  <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                    <FaChartLine size={24} />
                  </div>
                  <div className="stat2-info">
                    <h3>New This Year</h3>
                    <div className="stat2-value">0</div>
                  </div>
                </div>
        
                <div className="stat2-card">
                  <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                  <FaCalendarAlt size={24} />
                  </div>
                  <div className="stat2-info">
                    <h3>New This Week</h3>
                    <div className="stat2-value">0</div>
                  </div>
                </div>
        
              </div>
      <div className="controls-section">
            <div className="search-wrapper">
              <BsSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by brand name..."
                className="search-input"
              />
            </div>
    
            <div className="action-buttons">
            
    
              <button className="btn-primary"
              onClick={() => setBrandModal(true)}
              > 
                <BsPlus size={18} />
                Add Brand
              </button>
</div>
</div>
 <div className="table-wrapper">
                             <table className="data-table" >
                               <thead>
                                 <tr>
                                   <th>ID</th>
                                   <th>Name </th>
                                   <th>Description</th>               
                                   <th> Status</th>
<th> Action</th>
                                 </tr>
                               </thead>
               <tbody>
                 {Loading? (
                   Array(3).fill(0).map((_, i) => (
                     <tr key={i}>
                       <td colSpan="6">
                         <div className="skeleton-row"></div>
                       </td>
                     </tr>
                   ))
                 ) : Error ? (
                   <tr>
                     <td colSpan="6" style={{ color: "red" }}>
                       {Error}
                     </td>
                   </tr>
                 ) :BrandData?.length > 0 ? (
                   BrandData.map((item, index) => (
                     <tr key={item.id}>
                       <td>{index + 1}</td>
               
                      
                       <td>{item.name}</td>  
                       <td>{item.description}</td>
                        <td>
          <label className="switch">
            <input
              type="checkbox"
              checked={item.is_active}
              onChange={() => handleToggle(item.id, item.is_active)}
            />
            <span className="slider round"></span>
          </label>
        </td>

                       <td>
                                 <div className="action-buttons">
          <button
          className="action-btn edit"
          onClick={() => {
            setEditForm({
              id: item.id,
              name: item.name || "",
              description: item.description || "",
              is_active: item.is_active,
            });
        
            setEditErrors({});
            setEditModal(true);
          }}
        >
          <FaEdit />
        </button>

      <button
       className="action-btn delete"
       onClick={() => {
         setBrandId(item.id);
         setDeleteModal(true);
       }}
     >
       <FiTrash2 />
     </button>
               
               
               
                                 </div>
                               </td>
                     </tr>
                   ))
                 ) : (
                   <tr>
                     <td colSpan="6" style={{ textAlign: "center" }}>
                       No data found
                     </td>
                   </tr>
                 )}
               </tbody>
                             </table>                
                   </div> 

                            {BrandModal && (
  
    <div
    className="prakriti-modal-overlay"
    onClick={() => setBrandModal(false)}
  >
    <div
      className="prakriti-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="prakriti-modal-header">
        <h2>Add New Brand</h2>
        <button
          className="close-btn"
          onClick={() => setBrandModal(false)}
        >
          ×
        </button>
      </div>

      <form onSubmit={AddProductBrand}
      className="prakriti-form">
        <div className="form-group">
          <label>Brand Name <span className="required">*</span></label>
         <input
  type="text"
  name="name"
  value={BrandForm.name}
  onChange={(e) => {
    handleBrandChange(e);

    setAddErrors((prev) => ({
      ...prev,
      name: "",
    }));
  }}
  placeholder="Enter Brand name"
/>

{addErrors.name && (
  <p className="error-text">{addErrors.name}</p>
)}
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={BrandForm.description}
            onChange={handleBrandChange}
            placeholder="Enter description"
            rows="4"
        
          />
        </div>

        <div className="form-group">
          <label>Is Active</label>

          <div className="checkbox-row">

            <input
              type="checkbox"
              name="is_active"
              checked={BrandForm.is_active}
             onChange={handleBrandChange}
            />

            

          </div>
        </div>


        <div className="modal-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => setBrandModal(false)}
          >
            Cancel
          </button>

          <button type="submit" className="save-btn">
            Add Brand
          </button>
        </div>
      </form>
    </div>
  </div>
)} 

{editModal && (
  <div
    className="prakriti-modal-overlay"
    onClick={() => setEditModal(false)}
  >
    <div
      className="prakriti-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="prakriti-modal-header">
        <h2>Edit Product Category</h2>

        <button
          className="close-btn"
          onClick={() => setEditModal(false)}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleUpdateBrand}>
        <div className="form-group">
          <label>Category Name</label>

          <input
            type="text"
            name="name"
            value={editForm.name}
            onChange={handleEditChange}
            placeholder="Enter category name"
          />

          {editErrors.name && (
            <p className="error-text">
              {editErrors.name}
            </p>
          )}
        </div>

        <div className="form-group">
          <label>Description</label>

          <textarea
            name="description"
            value={editForm.description}
            onChange={handleEditChange}
            rows="4"
            placeholder="Enter description"
          />

       
        </div>

        <div className="form-group">
              <label>Is Active</label>
            <div className="checkbox-row">
                 

          <input
            type="checkbox"
            name="is_active"
            checked={editForm.is_active}
            onChange={handleEditChange}
          />
                 </div>
       
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => setEditModal(false)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
          >
            Update Category
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{deleteModal && (
  <div
    className="modal"
    onClick={() => setDeleteModal(false)}
  >
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Are you sure you want to delete this category?</h3>

      <div className="form-buttons">
        <button
          className="otp-btn verify-btn"
          onClick={() => {
            handleDelete(BrandId);
            setDeleteModal(false);
            setBrandId(null);
          }}
        >
          Yes
        </button>

        <button
          onClick={() => {
            setDeleteModal(false);
            setBrandId(null);
          }}
        >
          No
        </button>
      </div>
    </div>
  </div>
)}

</>
  )
}

export default Brand