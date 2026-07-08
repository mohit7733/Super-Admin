import React, { useState, useEffect } from 'react';
import { BsPlus } from 'react-icons/bs';
import { FaThLarge, FaCheckCircle, FaTimesCircle,FaEdit,FaTimes } from "react-icons/fa";
import { FiTrash2 } from 'react-icons/fi';
import { BiPlus } from 'react-icons/bi';


import { FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { ToastContainer,toast} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import { FiUpload } from 'react-icons/fi';





const YogaCategory = () => {
    const[YogaCategoryData,setYogaCategoryData]=useState([]);
    const[Loading,setLoading]=useState(false);
    const[Error,setError]=useState(null);
    const[PreviewImage,setPreviewImage]=useState("");
    const[ShowYogaModal,setShowYogaModal]=useState(false);
    const[ServiceData,setServiceData]=useState([]);
    const[ServiceLoading,setServiceLoading]=useState(false);
    const[ServiceError,setServiceError]=useState(null);
    const[showYogaCategoryModal,setShowYogaCategoryModal]=useState(false);
    const[YogaCategoryImage,setYogaCategoryImage]=useState(null);
    const[AddError,setAddError]=useState({});
    const[isSubmitting,setIsSubmitting]=useState(false);
    const[editModal,setEditModal]=useState(false);
    const[editErrors,setEditErrors]=useState({});
    const[EditImage,setEditImage]=useState(null);
    const[IsUpdating,setIsUpdating]=useState(false);
    const[statusModal,setStatusModal]=useState(false);
    const[SelectedYogaCategory,setSelectedYogacategory]=useState();
    const[YogaCategoryId,setYogaCategoryId]=useState("");

   const[deleteModal,setDeleteModal]=useState(null);
   const [isFilterApplied, setIsFilterApplied] = useState(false);
   
  
    
   
    
      const [YogaCategoryForm, setYogaCategoryForm] = useState({
        name: "",
        description: "",
        is_active: false,
        service_category_id: "",
        image_url: "",
        code: "",
      });

       const [editYogaForm, setEditYogaForm] = useState({
          id: "",
          name: "",
          description: "",
          image_url: "",
          service_category_id: "",
          is_active: false,
          code:"",
        });

      
  const resetForm = () => {
    setYogaCategoryForm({
      name: "",
      description: "",
      is_active: false,
      service_category_id: "",
      image_url: "",
      code: "",
    });
    setYogaCategoryImage(null);
    setAddError({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };



    
    
  const fileInputRef = useRef(null);
      const editFileRef = useRef(null);
      const navigate = useNavigate();

      
  const handleCategoryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setYogaCategoryForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setAddError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleFilter = () => {

   // filtering logic

   setIsFilterApplied(true);

}


const getCategoryList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setServiceLoading(true);
    setServiceError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/service-category/`,
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

      if (data.success) {
        setServiceData(data.data);
      
      } else {
        toast.error(data.message || "Failed to get yoga categories");
        setServiceError(data.message || "Failed to fetch  Yoga categories");
      }

    } catch (error) {
      console.error("Category Fetch Error:", error);
      setServiceError("Something went wrong while fetching data.");
      toast.error("Failed to fetch  Yoga category data");
    } finally {
      setServiceLoading(false);
    }
  };


const getYogaCategoryList = async () => {
const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoading(true);


  try {
    const response = await fetch(
      `${BASE_URL}/yoga/admin/categories/`,
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

    console.log("Category API Response:", data);

  if (response.ok && data.status === "success") {
  setYogaCategoryData(data.data || []);
} else {
  toast.error(data.message || "Failed to get categories");
} 

  } catch (error) {

    console.error("Category Fetch Error:", error);

    setError("Something went wrong while fetching data.");

    toast.error("Failed to fetch category data");

  } finally {
    setLoading(false);
  }
};

useEffect(()=>{
    getYogaCategoryList();
    getCategoryList();
},[])

 const uploadImage = async (file) => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session Expired, Please Login Again");
      navigate("/login");
      return null;
    }

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

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return null;
      }

      const data = await response.json();
      return data?.data?.url;
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed");
      return null;
    }
  };

  const AddYogaCategory = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    let newErrors = {};

    if (!YogaCategoryForm.service_category_id) {
      newErrors.service_category_id = "Please select a service category";
    }

    if (!YogaCategoryForm.name.trim()) {
      newErrors.name = "Yoga category name is required";
    }
if (!YogaCategoryImage) {
  newErrors.image_url = "Please upload an image";
}

   const code = YogaCategoryForm.code.trim();

if (!code) {
  newErrors.code = "Please enter yoga category code";
} else if (code.length >5) {
  newErrors.code = "Code must be  5 characters";
} else if (!/^[A-Z]{5,10}$/.test(code)) {
  newErrors.code =
    "Code must contain only uppercase letters (5-10 characters)";
}

    setAddError(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((msg) => toast.error(msg));
      setIsSubmitting(false);
      return;
    }

    try {
      setIsSubmitting(true);
      let imageUrl = "";

      if (YogaCategoryImage) {
        imageUrl = await uploadImage(YogaCategoryImage);
        if (!imageUrl) {
          toast.error("Image upload failed");
          return;
        }
      }

      const payload = {
        ...YogaCategoryForm,
        image_url: imageUrl,
        // code: YogaCategoryForm.code.toUpperCase().trim(),
      };

      const token = sessionStorage.getItem("superadmin_token");

      const response = await fetch(
        `${BASE_URL}/yoga/admin/categories/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Product Category Added Successfully");
        setShowYogaCategoryModal(false);
        resetForm();
        getYogaCategoryList();
      } else {
        toast.error(data?.message || "Failed to add category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };


    const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditYogaForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setEditErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

   const handleYogaUpdateCategory = async (e) => {
    e.preventDefault();
    if (IsUpdating) return;

    let newErrors = {};
    if (!editYogaForm.name.trim()) {
      newErrors.name = " Yoga Category name is required";
    }

    setEditErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");
    setIsUpdating(true);

    try {
      let imageUrl = editYogaForm.image;

      if (EditImage) {
        imageUrl = await uploadImage(EditImage);
        if (!imageUrl) {
          toast.error("Image upload failed");
          return;
        }
      }

      const response = await fetch(
        `${BASE_URL}/yoga/admin/categories/?id=${editYogaForm.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            name: editYogaForm.name,
            description: editYogaForm.description,
            is_active: editYogaForm.is_active,
            service_category_id: editYogaForm.service_category_id,
            image_url: imageUrl,
            code:editYogaForm.code,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("yoga Category Updated Successfully");
        setEditModal(false);
        setEditImage(null);
        getYogaCategoryList();
      } else {
        toast.error(data?.message || "Failed to update yoga category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

   const updateCategoryStatus = async (id, currentStatus) => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session Expired, please login Again");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/yoga/admin/categories/?id=${id}`,
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

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (response.ok) {
        toast.success(
          !currentStatus ? " Yoga Category Activated Successfully" : " Yoga Category Deactivated Successfully"
        );
        getYogaCategoryList();
      } else {
        toast.error(data.message || "Failed to update yoga category status");
      }
    } catch (error) {
      console.error("Status Update Error:", error);
      toast.error("Failed to update yoga category status");
    }
  }

  
  const handleDelete = async (id) => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/yoga/admin/categories/?id=${id}`,
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

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || data.success === false) {
        const errorMsg = data?.message || "Failed to delete yoga category";
        toast.error(errorMsg);
        return;
      }

      toast.success(" Yoga Category deleted successfully");
      setDeleteModal(false);
      getYogaCategoryList();

    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Something went wrong while deleting category");
    }
  };

  return (
    <>
    <div className="page-header">
            <h1>Yoga Category</h1>
            <p className="page-paragraph"> Manage Yoga Category details</p>
          </div>

            <div className="filter-category">
                
          
             <button
                    className="add-customer-btn"
                    onClick={() => {
                      resetForm();
                      setShowYogaCategoryModal(true);
                    }}
                  >
                 <BiPlus/>
                    Add Yoga Category
                  </button>
              
          
                  </div>

                    <div className="vendors-stats stats2-grid">
                              <div className="stat2-card">
                                <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                                  <FaThLarge  size={24} />
                                </div>
                                <div className="stat2-info">
                                  <h3>Total Category</h3>
                                  <div className="stat2-value">0</div>
                                </div>
                              </div>
                      
                              <div className="stat2-card">
                                <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                                  <FaCheckCircle size={24} />
                                </div>
                                <div className="stat2-info">
                                  <h3>Active Category</h3>
                                  <div className="stat2-value">0</div>
                                </div>
                              </div>
                      
                              <div className="stat2-card">
                                <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                                <FaTimesCircle size={24} />
                                </div>
                                <div className="stat2-info">
                                  <h3>Inactive Category</h3>
                                  <div className="stat2-value">0</div>
                                </div>
                              </div>
                      
                            </div>

                                 <div className="table-wrapper">
                                                    <table className="data-table" >
                                                      <thead>
                                                        <tr>
                                                          <th>ID</th>
                                                          <th> Yoga Category </th>
                                                          <th> Service Category</th>
                                                          <th> Code</th>
                                                          <th>Image</th>                
                                                        <th>Status</th>
                                                          <th>Actions</th>
                                            
                                                        </tr>
                                                      </thead>
                                      <tbody>
                                        {Loading ? (
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
                                        ) : YogaCategoryData?.length > 0 ? (
                                          YogaCategoryData.map((item, index) => (
                                            <tr key={item.id}>
                                              <td>{index + 1}</td>
                                      
                                             
                                             <td>
                    <strong>{item.name}</strong>
                    {item.description && (
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                        {item.description.substring(0, 30)}
                        {item.description.length > 30 && "..."}
                      </div>
                    )}
                  </td>

                  <td>{item.service_category_name}</td>
                 <td>
                    <span className="category-code-badge">{item.code || "N/A"}</span>
                  </td>
                                      
                          <td>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        width="50"
                        height="50"
                        style={{
                          objectFit: "cover",
                          borderRadius: "6px",
                          cursor: "pointer",
                          border: "1px solid #e0e0e0",
                        }}
                         onClick={() => setPreviewImage(item.image_url)}
                      />
                    ) : (
                      <span style={{ color: "#999", fontSize: "12px" }}>No image</span>
                    )}
                  </td>
                            
                                <td>
                    <span className={`status-badge ${item.is_active ? 'status-active' : 'status-inactive'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <br />
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={item.is_active}
                        onChange={() => {
                          setSelectedYogacategory(item);
                          setStatusModal(true);
                        }}
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>
                            
                                      
                                            
                                            
                                              
                                              <td>
                                                        <div className="action-buttons">
                                      
                                                 <button
                                                                        className="action-btn edit"
                                                                        onClick={() => {
                                                                          setEditYogaForm({
                                                                            id: item.id,
                                                                            service_category_id: item.service_category_id || "",
                                                                            name: item.name || "",
                                                                            description: item.description || "",
                                                                            image_url: item.image_url || "",
                                                                            is_active: item.is_active,
                                                                            code:item.code,
                                                                          });
                                                                          setEditErrors({});
                                                                          setEditModal(true);
                                                                        }}
                                                                        title="Edit"
                                                                      >
                                                                        <FaEdit />
                                                                      </button>
                                      
                                
                                                <button
                                                  className="action-btn delete"
                                                  onClick={() => {
                                                    setYogaCategoryId(item.id);
                                                    setDeleteModal(true);
                                                  }}
                                                  title="Delete"
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
         {showYogaCategoryModal && (
               <div className="prakriti-modal-overlay" onClick={() => setShowYogaCategoryModal(false)}>
                 <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
                   <div className="prakriti-modal-header">
                     <h2>Add Yoga Category</h2>
                     <button
                       className="modal-close-btn"
                       onClick={() => {
                         setShowYogaCategoryModal(false);
                         resetForm();
                       }}
                     >
                       <FaTimes />
                     </button>
                   </div>
       
                   <form className="prakriti-form" onSubmit={AddYogaCategory}>
                     <div className="form-group">
                       <label>Service Category <span className="required">*</span></label>
                       <select
                         name="service_category_id"
                         value={YogaCategoryForm.service_category_id}
                         onChange={handleCategoryChange}
                         className={AddError.service_category_id ? "error-input" : ""}
                       >
                         <option value="">Select Service Category</option>
                         {ServiceData?.map((cat) => (
                           <option key={cat.id} value={cat.id}>
                             {cat.name} ({cat.code})
                           </option>
                         ))}
                       </select>
                       {AddError.service_category_id && (
                         <p className="error-text">{AddError.service_category_id}</p>
                       )}
                     </div>
       
                     <div className="form-group">
                       <label> Yoga Category Name <span className="required">*</span></label>
                       <input
                         type="text"
                         name="name"
                         value={YogaCategoryForm.name}
                         onChange={handleCategoryChange}
                         placeholder="Enter product category name"
                         className={AddError.name ? "error-input" : ""}
                       />
                       {AddError.name && <p className="error-text">{AddError.name}</p>}
                     </div>
       
                     <div className="form-group">
                       <label>Yoga Category Code <span className="required">*</span></label>
                       <input
                         type="text"
                         name="code"
                         value={YogaCategoryForm.code}
                         onChange={(e) => {
                           let value = e.target.value.toUpperCase();
                           value = value.replace(/[^A-Z]/g, "");
                           setYogaCategoryForm((prev) => ({
                             ...prev,
                             code: value,
                           }));
                           setAddError((prev) => ({
                             ...prev,
                             code: "",
                           }));
                         }}
                         placeholder="Enter category code (A-Z, max 10 characters)"
                         maxLength="10"
                         className={AddError.code ? "error-input" : ""}
                       />
                       {AddError.code && <p className="error-text">{AddError.code}</p>}
                     </div>
       
                     <div className="form-group">
                       <label>Upload Image <span className="required">*</span></label>
                       <div className="upload-box1">
                         <input
                           ref={fileInputRef}
                           type="file"
                           accept="image/*"
                           id="categoryUpload"
                        onChange={(e) => {
  const file = e.target.files[0];

  if (file) {
    setYogaCategoryImage(file);

    setAddError((prev) => ({
      ...prev,
      image_url: "",
    }));
  }
}}
                         />
                         {YogaCategoryImage ? (
                           <div className="banner-preview-wrapper">
                             <div className="banner-preview-left">
                               <img
                                 src={URL.createObjectURL(YogaCategoryImage)}
                                 alt="preview"
                                 className="banner-preview-image"
                               />
                             </div>
                             <div className="banner-preview-actions">
                               <button
                                 type="button"
                                 className="preview-btn"
                                 onClick={() => window.open(URL.createObjectURL(YogaCategoryImage), "_blank")}
                               >
                                 <FiEye />
                               </button>
                               <button
                                 type="button"
                                 className="delete-btn-preview"
                                 onClick={() => {
                                   setYogaCategoryImage(null);
                                   if (fileInputRef.current) {
                                     fileInputRef.current.value = "";
                                   }
                                 }}
                               >
                                 <FiTrash2 />
                               </button>
                             </div>
                           </div>
                         ) : (
                           <label htmlFor="categoryUpload" className="upload-label">
                             <div className="upload-content">
                               <span className="upload-icon">⬆</span>
                               <p>Click to upload category image</p>
                               <span className="upload-hint">PNG, JPG, JPEG (Max 5MB)</span>
                             </div>
                           </label>
                         )}
                       </div>
                       {AddError.image_url && <p className="error-text">{AddError.image_url}</p>}
                     </div>
       
                     <div className="form-group">
                       <label>Description</label>
                       <textarea
                         name="description"
                         value={YogaCategoryForm.description}
                         onChange={handleCategoryChange}
                         placeholder="Enter description"
                         rows="3"
                       />
                     </div>
       
                     <div className="form-group">
                       <label>Status</label>
                       <div className="checkbox-row">
                         <input
                           type="checkbox"
                           name="is_active"
                           checked={YogaCategoryForm.is_active}
                           onChange={handleCategoryChange}
                         />
                         <span>Active</span>
                       </div>
                     </div>
       
                     <div className="modal-footer">
                       <button
                         type="button"
                         className="cancel-btn"
                         onClick={() => {
                           setShowYogaCategoryModal(false);
                           resetForm();
                         }}
                       >
                         Cancel
                       </button>
                       <button type="submit" className="save-btn" disabled={isSubmitting}>
                         {isSubmitting ? "Adding..." : "Add Yoga Category"}
                       </button>
                     </div>
                   </form>
                 </div>
               </div>
             )}


              {editModal && (
                     <div className="prakriti-modal-overlay" onClick={() => setEditModal(false)}>
                       <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
                         <div className="prakriti-modal-header">
                           <h2>Edit Yoga Category</h2>
                           <button className="modal-close-btn" onClick={() => setEditModal(false)}>
                             <FaTimes />
                           </button>
                         </div>
             
                         <form className="prakriti-form" onSubmit={handleYogaUpdateCategory}>
                           <div className="form-group">
                             <label>Service Category <span className="required">*</span></label>
                             <select
                               name="service_category_id"
                               value={editYogaForm.service_category_id}
                               onChange={handleEditChange}
                             >
                               <option value="">Select Service Category</option>
                               {ServiceData?.map((cat) => (
                                 <option key={cat.id} value={cat.id}>
                                   {cat.name} ({cat.code})
                                 </option>
                               ))}
                             </select>
                           </div>
             
                           <div className="form-group">
                             <label>Yoga Category Name <span className="required">*</span></label>
                             <input
                               type="text"
                               name="name"
                               value={editYogaForm.name}
                               onChange={handleEditChange}
                               placeholder="Enter category name"
                               className={editErrors.name ? "error-input" : ""}
                             />
                             {editErrors.name && <p className="error-text">{editErrors.name}</p>}
                           </div>

                             <div className="form-group">
                <label>yoga Category Code <span className="required">*</span></label>
                <input
                  type="text"
                  name="code"
                  value={editYogaForm.code}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase();
                    value = value.replace(/[^A-Z]/g, "");
                    setEditYogaForm((prev) => ({
                      ...prev,
                      code: value,
                    }));
                    setEditErrors((prev) => ({
                      ...prev,
                      code: "",
                    }));
                  }}
                  placeholder="Enter category code (A-Z, max 10 letters)"
                  maxLength="10"
                  className={editErrors.code ? "error-input" : ""}
                />
                {editErrors.code && <p className="error-text">{editErrors.code}</p>}
              </div>
             
                           <div className="form-group">
                             <label>Description</label>
                             <textarea
                               name="description"
                               value={editYogaForm.description}
                               onChange={handleEditChange}
                               rows="3"
                               placeholder="Enter description"
                             />
                           </div>
             
                           <div className="form-group">
                             <label>Upload Image</label>
                             <div className="upload-box1">
                               <input
                                 ref={editFileRef}
                                 type="file"
                                 accept="image/*"
                                 id="editBannerUpload"
                                 style={{ display: "none" }}
                                 onChange={(e) => {
                                   const file = e.target.files[0];
                                   if (file) {
                                     setEditImage(file);
                                   }
                                 }}
                               />
                               {(EditImage || editYogaForm.image_url) ? (
                                 <div className="banner-preview-wrapper">
                                   <div className="banner-preview-left">
                                     <img
                                       src={
                                         EditImage
                                           ? URL.createObjectURL(EditImage)
                                           : editYogaForm.image_url
                                       }
                                       alt="preview"
                                       className="banner-preview-image"
                                     />
                                   </div>
                                   <div className="banner-preview-actions">
                                     <button
                                       type="button"
                                       className="preview-btn"
                                       onClick={() =>
                                         window.open(
                                           EditImage
                                             ? URL.createObjectURL(EditImage)
                                             : editYogaForm.image_url,
                                           "_blank"
                                         )
                                       }
                                     >
                                       <FiEye />
                                     </button>
                                     <button
                                       type="button"
                                       className="preview-btn"
                                       onClick={() => {
                                         document.getElementById("editBannerUpload").click();
                                       }}
                                     >
                                       <FiUpload />
                                     </button>
                                     <button
                                       type="button"
                                       className="delete-btn-preview"
                                       onClick={() => {
                                         setEditImage(null);
                                         setEditYogaForm((prev) => ({
                                           ...prev,
                                           image_url: "",
                                         }));
                                         if (editFileRef.current) {
                                           editFileRef.current.value = "";
                                         }
                                       }}
                                     >
                                       <FiTrash2 />
                                     </button>
                                   </div>
                                 </div>
                               ) : (
                                 <label htmlFor="editBannerUpload" className="upload-label">
                                   <div className="upload-content">
                                     <span className="upload-icon">⬆</span>
                                     <p>Click to upload category image</p>
                                   </div>
                                 </label>
                               )}
                             </div>
                           </div>
             
                           <div className="form-group">
                             <label>Status</label>
                             <div className="checkbox-row">
                               <input
                                 type="checkbox"
                                 name="is_active"
                                 checked={editYogaForm.is_active}
                                 onChange={handleEditChange}
                               />
                               <span>Active</span>
                             </div>
                           </div>
             
                           <div className="modal-footer">
                             <button type="button" className="cancel-btn" onClick={() => setEditModal(false)}>
                               Cancel
                             </button>
                             <button type="submit" className="save-btn" disabled={IsUpdating}>
                               {IsUpdating ? "Updating..." : "Update Category"}
                             </button>
                           </div>
                         </form>
                       </div>
                     </div>
                   )}

{statusModal && SelectedYogaCategory && (
   <div
    className="activeModal-overlay"
    onClick={() => {
      setStatusModal(false);
      setSelectedYogacategory(null);
    }}
  >
    <div
      className="activeModal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="activeModal-close"
        onClick={() => {
          setStatusModal(false);
          setSelectedYogacategory(null);
        }}
      >
        ×
      </button>

      <div className="activeModal-icon">
        ⚠️
      </div>

      <h2 className="activeModal-title">
        Confirm Status Change
      </h2>

      <p className="activeModal-text">
        Are you sure you want to
        <span
          className={
            SelectedYogaCategory.is_active
              ? "inactive-text"
              : "active-text"
          }
        >
          {SelectedYogaCategory.is_active
            ? " Inactive "
            : " Active "}
        </span>
        this category?
      </p>

      <div className="activeModal-card">
        <h4>{SelectedYogaCategory.name}</h4>
     
      </div>

      <div className="activeModal-footer">
        <button
          className="activeModal-cancel"
          onClick={() => {
            setStatusModal(false);
            setSelectedYogacategory(null);
          }}
        >
          Cancel
        </button>

        <button
          className={`activeModal-confirm ${
            SelectedYogaCategory.is_active
              ? "deactivate-btn"
              : "activate-btn"
          }`}
          onClick={() => {
            updateCategoryStatus(
              SelectedYogaCategory.id,
              SelectedYogaCategory.is_active
            );

            setStatusModal(false);
            setSelectedYogacategory(null);
          }}
        >
          Yes,{" "}
          {SelectedYogaCategory.is_active
            ? "Deactivate"
            : "Activate"}
        </button>
      </div>

    </div>
  </div>
)}


   {deleteModal && (
  <div className="modal">
    <div className="modal-content">
      <h3>
        Are you sure you want to delete this  Yoga Category?
      </h3>

      <div className="form-buttons">
        <button
          className="otp-btn verify-btn"
          onClick={() => {
            handleDelete(YogaCategoryId);
            setDeleteModal(false);
          }}
        >
          Yes
        </button>

        <button
          onClick={() => setDeleteModal(false)}
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

export default YogaCategory