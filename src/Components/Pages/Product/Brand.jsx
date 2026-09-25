import React, { useState ,useEffect,useRef } from 'react'
import { FiEye ,FiUpload} from 'react-icons/fi';
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

import BASE_URL from "../../../Base";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";

const Brand = () => {
   
    const[Error,setError]=useState(null);
    const[Loading,setLoading]=useState(false);
    const[BrandModal,setBrandModal]=useState(false);
    const[addErrors,setAddErrors]=useState({});
    const navigate = useNavigate();
    const [addLoading, setAddLoading] = useState(false);
    const[UpdateLoading,setUpdateLoading]=useState(false);
    
const [allBrandData, setAllBrandData] = useState([]);
const [ BrandForm, setBrandForm] = useState({
  name: "",
  description: "",
  is_active: false,
   logo: null,
   sequence:"",
});
const [searchTerm, setSearchTerm] = useState("");
const [existingLogo, setExistingLogo] = useState("");
const editLogoRef = useRef(null);


  const [deleteModal, setDeleteModal] = useState(false);
const [BrandId, setBrandId] = useState(null);
const brandLogoRef = useRef(null);
const resetBrandForm = () => {
  setBrandForm({
    name: "",
    description: "",
    is_active: false,
    logo: null,
  });

  setAddErrors({});

  if (brandLogoRef.current) {
    brandLogoRef.current.value = "";
  }
};


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
  sequence:"",

});
const [editErrors, setEditErrors] = useState({});

const filteredBrands = allBrandData.filter((item) => {
  const keyword = searchTerm.trim().toLowerCase();

  return (
    item.name?.toLowerCase().includes(keyword) 
  
  );
});
const uploadImage = async (file) => {
  const token = sessionStorage.getItem("superadmin_token");

  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("dir", "health_issues");

    const response = await fetch(`${BASE_URL}/user/upload/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    console.log("Upload Response:", data);

    return data?.data?.url;
  } catch (error) {
    console.log(error);
    toast.error("Image upload failed");
    return null;
  }
};

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

const totalBrands = allBrandData.length;

const activeBrands = allBrandData.filter(
  (item) => item.is_active
).length;

const inactiveBrands = allBrandData.filter(
  (item) => !item.is_active
).length;

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

    const data = await response.json();

    console.log("Brand List:", data);

    if (response.ok) {
      setAllBrandData(data.data || []);
    } else {
      toast.error("Failed to fetch brands");
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  getbrandlist();
}, []);



const AddProductBrand = async (e) => {
  e.preventDefault();
 
    let newErrors = {};

  if (!BrandForm.name.trim()) {
    newErrors.name = "Brand name is required";
  }

  let logoUrl = "";

if (BrandForm.logo) {
  logoUrl = await uploadImage(BrandForm.logo);

  if (!logoUrl) {
    toast.error("Logo upload failed");
    return;
  }
}
  

  setAddErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    Object.values(newErrors).forEach((msg) => {
      toast.error(msg);
    });
    return;
  }
 setAddLoading(true);
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
       body: JSON.stringify({
  name: BrandForm.name.trim(),
  description: BrandForm.description,
  is_active: BrandForm.is_active,
  sequence:BrandForm.sequence,
  logo: logoUrl,
 
})
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
  finally{
    setAddLoading(false);
  }
};

const handleUpdateBrand = async (e) => {
  e.preventDefault();

  let newErrors = {};

  if (!editForm.name.trim()) {
    newErrors.name = "Brand name is required";
  }

  setEditErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    toast.error(Object.values(newErrors)[0]);
    return;
  }
setUpdateLoading(true);
  const token = sessionStorage.getItem("superadmin_token");

  try {
    let logoUrl = existingLogo;

    // Agar naya logo select hua hai to upload karo
    if (editForm.logo instanceof File) {
      logoUrl = await uploadImage(editForm.logo);

      if (!logoUrl) {
        toast.error("Logo upload failed");
        return;
      }
    }

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
          name: editForm.name.trim(),
          description: editForm.description,
          is_active: editForm.is_active,
          sequence:editForm.sequence,
          logo: logoUrl, // URL send hoga
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success("Brand Updated Successfully");
      setEditModal(false);
      getbrandlist();
    } else {
      toast.error(
        data?.errors?.name?.[0] ||
        data?.message ||
        "Failed to update brand"
      );
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
  finally{
    setUpdateLoading(false);
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

  
    setAllBrandData((prev) =>
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
                  <FaTag size={12} />
                  </div>
                  <div className="stat2-info">
                    <h3>Total Brand</h3>
                    <div className="stat2-value">{totalBrands}</div>
                  </div>
                </div>
        
                <div className="stat2-card">
                  <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                    <FaChartLine size={12} />
                  </div>
                  <div className="stat2-info">
                   <h3>Active Brands</h3>
<div className="stat2-value">{activeBrands}</div>
                  </div>
                </div>
        
                <div className="stat2-card">
                  <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                  <FaCalendarAlt size={12} />
                  </div>
                  <div className="stat2-info">
               <h3>InActive Brands</h3>
<div className="stat2-value">{inactiveBrands}</div>
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
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
            </div>
    
            <div className="action-buttons">
            
    
              <button className="btn-primary"
             onClick={() => {
    resetBrandForm();
    setBrandModal(true);
  }}
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
                                 
                                   <th>Logo</th>  
                                    <th> Sequence</th>            
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
                 ) :filteredBrands?.length > 0 ? (
                   filteredBrands.map((item, index) => (
                     <tr key={item.id}>
                       <td>{index + 1}</td>
               
                      
                       <td>{item.name}</td>  
                     
                       
                    <td>
                    {item.logo ? (
                      <img
                        src={item.logo}
                        alt={item.name}
                        width="30"
                        height="30"
                        style={{
                          objectFit: "cover",
                          borderRadius: "6px",
                          cursor: "pointer",
                          border: "1px solid #e0e0e0",
                        }}
                      />
                    ) : (
                      <span style={{ color: "#999", fontSize: "12px" }}>No image</span>
                    )}
                  </td>
                  <td>{item.sequence}</td>
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
    sequence:item.sequence,
    logo: null,
  });

  setExistingLogo(item.logo || "");
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
          onClick={() => {
    resetBrandForm();
    setBrandModal(false);
  }}
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
          <label>Sequence</label>
          <input
            name="sequence"
            value={BrandForm.sequence}
            onChange={handleBrandChange}
            placeholder="Enter Sequence"
            type="number"
          />
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
  <label>
    Brand Logo <span className="required">*</span>
  </label>

  <div className="upload-box1">
    <input
      ref={brandLogoRef}
      type="file"
      accept="image/*"
      id="brandLogoUpload"
      onChange={(e) => {
        const file = e.target.files[0];

        if (file) {
          setBrandForm((prev) => ({
            ...prev,
            logo: file,
          }));

          setAddErrors((prev) => ({
            ...prev,
            logo: "",
          }));
        }
      }}
    />

    {BrandForm.logo ? (
      <div className="banner-preview-wrapper">
        <div className="banner-preview-left">
          <img
            src={URL.createObjectURL(BrandForm.logo)}
            alt="Brand Logo"
            className="banner-preview-image"
          />
        </div>

        <div className="banner-preview-actions">
          <button
            type="button"
            className="preview-btn"
            onClick={() =>
              window.open(URL.createObjectURL(BrandForm.logo), "_blank")
            }
          >
            <FiEye />
          </button>

          <button
            type="button"
            className="delete-btn-preview"
            onClick={() => {
              setBrandForm((prev) => ({
                ...prev,
                logo: null,
              }));

              if (brandLogoRef.current) {
                brandLogoRef.current.value = "";
              }
            }}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    ) : (
      <label htmlFor="brandLogoUpload" className="upload-label">
        <div className="upload-content">
          <span className="upload-icon">⬆</span>
          <p>Click to upload brand logo</p>
          <span className="upload-hint">PNG, JPG, JPEG</span>
        </div>
      </label>
    )}
  </div>

  {addErrors.logo && (
    <p className="error-text">{addErrors.logo}</p>
  )}
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
  onClick={() => {
    resetBrandForm();
    setBrandModal(false);
  }}
>
  Cancel
</button>
        
          

          <button
  type="submit"
  className="save-btn"
  disabled={addLoading}
>
  {addLoading ? "Adding Brand..." : "Add Brand"}
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
        <h2>Edit Brand </h2>

        <button
          className="close-btn"
          onClick={() => setEditModal(false)}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleUpdateBrand}
      className='prakriti-form'>
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
          <label>Sequence</label>

          <input
            type="number"
            name="sequence"
            value={editForm.sequence}
            onChange={handleEditChange}
            placeholder="Enter sequence"
          />

        
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
<div className="form-group">
  <label>Brand Logo</label>

  <div className="upload-box1">
    <input
      ref={editLogoRef}
      type="file"
      accept="image/*"
      id="editBrandLogoUpload"
      style={{ display: "none" }}
      onChange={(e) => {
        const file = e.target.files[0];

        if (file) {
          setEditForm((prev) => ({
            ...prev,
            logo: file,
          }));
        }
      }}
    />

    {(editForm.logo || existingLogo) ? (
      <div className="banner-preview-wrapper">
        <div className="banner-preview-left">
          <img
            src={
              editForm.logo
                ? URL.createObjectURL(editForm.logo)
                : existingLogo
            }
            alt="Brand Logo"
            className="banner-preview-image"
          />
        </div>

        <div className="banner-preview-actions">
          <button
            type="button"
            className="preview-btn"
            onClick={() =>
              window.open(
                editForm.logo
                  ? URL.createObjectURL(editForm.logo)
                  : existingLogo,
                "_blank"
              )
            }
          >
            <FiEye />
          </button>

          <label
            htmlFor="editBrandLogoUpload"
            className="preview-btn"
            style={{ cursor: "pointer" }}
          >
            <FiUpload />
          </label>

          <button
            type="button"
            className="delete-btn-preview"
            onClick={() => {
              setEditForm((prev) => ({
                ...prev,
                logo: null,
              }));

              setExistingLogo("");

              if (editLogoRef.current) {
                editLogoRef.current.value = "";
              }
            }}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    ) : (
      <label htmlFor="editBrandLogoUpload" className="upload-label">
        <div className="upload-content">
          <span className="upload-icon">⬆</span>
          <p>Click to upload brand logo</p>
        </div>
      </label>
    )}
  </div>
</div>
       
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
            {UpdateLoading ? "Updating Brand..." : "Update Brand"}
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

 <ToastContainer position="top-center" autoClose={2000} />

</>
  )
}

export default Brand