import React from 'react';
import { useState,useEffect ,useRef } from 'react';
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaEdit,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { FiTrash2, FiEye, FiUpload } from "react-icons/fi";
import { toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";

const Healthcategory = () => {
  const[HealthCategoryData,setHealthCategoryData]=useState([]);
     const[HealthLoading,setHealthLoading]=useState(false);
     const[HealthError,setHealthError]=useState(null);
     const [showCategoryModal, setShowCategoryModal] = useState(false);
     const [deleteModal, setDeleteModal] = useState(false);
 const [categoryId, setCategoryId] = useState(null);
 const[ServiceCategoryData,setServiceCategoryData]=useState([]);
 const[SeviceCategoryLoading,setServiceCategoryLoading]=useState(false);
 const[ServiceCategoryError,setServiceCategoryError]=useState(null);
 const[SubCategoryImage,setSubCategoryImage]=useState(null);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const[EditImage,setEditImage]=useState(null);
 const[IsUpdating,setIsUpdating]=useState(false);
 const editFileRef = useRef(null);
 
 
 
 
 const [categoryForm, setCategoryForm] = useState({
   name: "",
   description: "",
   is_active: false,
   service_category_id:"",
   image_url:"",
   code:"",
 });

 
 
 const [editModal, setEditModal] = useState(false);
 
 const [editForm, setEditForm] = useState({
   id: "",
   name: "",
   description: "",
   image_url:"",
   service_category_id:"",
   is_active: false,
   code:"",
 
 });
 
 const [editErrors, setEditErrors] = useState({});
 const [addErrors, setAddErrors] = useState({});
 const navigate = useNavigate();
     
    
const handleCategoryChange = (e) => {
  const { name, value, type, checked } = e.target;

    setCategoryForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

  setAddErrors((prev) => ({
    ...prev,
    [name]: "",
  }));
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
const uploadImage = async (file) => {
const token = sessionStorage.getItem("superadmin_token");
if(!token){

    toast.error("Session Expired, Please Login Again");
    navigate("/login");
    return;
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

    console.log("Upload Response:", data);

   return data?.data?.url;
  } catch (error) {
    console.error(error);
    toast.error("Image upload failed");

    return null;
  }
};

  const handleToggle = async (id, currentStatus) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session Expired, please login again");
      navigate("/login");
      return;
    }

    setIsStatusChanging(true);

    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/health-category/?id=${id}`,
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

      if (response.ok && data.success) {
        toast.success(
          !currentStatus
            ? "Category Activated Successfully"
            : "Category Deactivated Successfully"
        );
        getHealthCategoryList();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status");
    } finally {
      setIsStatusChanging(false);
    }
  };

  const getCategoryList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setServiceCategoryLoading(true);

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
        setServiceCategoryData(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Category Fetch Error:", error);
      setServiceCategoryError("Something went wrong while fetching data.");
      toast.error("Failed to fetch category data");
    } finally {
      setServiceCategoryLoading(false);
    }
  };

  const getHealthCategoryList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setHealthLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/health-category/`,
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
        setHealthCategoryData(data.data);
        calculateStats(data.data);
        setFilteredData(filterData(data.data, searchTerm, statusFilter));
      } else {
        toast.error(data.message || "Failed to fetch categories");
        setHealthError(data.message || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Health Category Fetch Error:", err);
      setHealthError("Something went wrong while fetching categories.");
      toast.error("Failed to fetch health categories");
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    getHealthCategoryList();
    getCategoryList();
  }, []);

  useEffect(() => {
    setFilteredData(filterData(HealthCategoryData, searchTerm, statusFilter));
  }, [HealthCategoryData, searchTerm, statusFilter]);

  const AddHealthCategory = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);

    let newErrors = {};

    if (!categoryForm.service_category_id) {
      newErrors.service_category_id = "Please select a service category";
    }

    if (!categoryForm.name.trim()) {
      newErrors.name = "Health category name is required";
    }

    const code = categoryForm.code;
    if (!code) {
      newErrors.code = "Please enter category code";
    } else if (!/^[A-Z]{1,10}$/.test(code)) {
      newErrors.code = "Code must be 1-10 uppercase letters (A-Z)";
    }

    if (!SubCategoryImage) {
      newErrors.image_url = "Please upload an image";
    }

    setAddErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((msg) => toast.error(msg));
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = "";

      if (SubCategoryImage) {
        imageUrl = await uploadImage(SubCategoryImage);
        if (!imageUrl) {
          toast.error("Image upload failed");
          return;
        }
      }

      const payload = {
        service_category_id: categoryForm.service_category_id,
        name: categoryForm.name.trim(),
        description: categoryForm.description,
        image_url: imageUrl,
        is_active: categoryForm.is_active,
        code: categoryForm.code.toUpperCase().trim(),
      };

      const token = sessionStorage.getItem("superadmin_token");

      const response = await fetch(
        `${BASE_URL}/user/admin/health-category/`,
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
        toast.success("Health Category Added Successfully");
        setShowCategoryModal(false);
        resetForm();
        getHealthCategoryList();
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

useEffect(()=>{
getHealthCategoryList();
getCategoryList();
},[])


const handleUpdateCategory = async (e) => {
  e.preventDefault();
  if(IsUpdating)return;

  let newErrors = {};

  if (!editForm.name.trim()) {
    newErrors.name = " Service Category name is required";
  }

  setEditErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    toast.error(Object.values(newErrors)[0]);
    return;
  }

  const token = sessionStorage.getItem("superadmin_token");
  setIsUpdating(false);

  try {
    let imageUrl = editForm.image_url;

    // New image selected hai to upload karo
    if (EditImage) {
      imageUrl = await uploadImage(EditImage);

      if (!imageUrl) {
        toast.error("Image upload failed");
        return;
      }
    }

    const response = await fetch(
      `${BASE_URL}/vendors/admin/product-category/?id=${editForm.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          name: editForm.name,
          description: editForm.description,
          is_active: editForm.is_active,
          category_id: editForm.category_id,
          image_url: imageUrl, // updated url
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success("Product Category Updated Successfully");

      setEditModal(false);
      setEditImage(null);
      getHealthCategoryList();
    } else {
      toast.error(
        data?.errors?.name?.[0] ||
        data?.message ||
        "Failed to update category"
      );
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
  finally{
    setIsUpdating(false);
  }
};

  return (
    <>
    <div className="page-header">
                     <h1> Health Category </h1>
                     <p className="page-paragraph"> Manage Sub Product Category  and their details</p>
                   </div>
    
    
                      <div className="filter-category">
      <button
        className="add-customer-btn"
      onClick={() => {
  setCategoryForm({
    name: "",
    description: "",
    is_active: false,
    service_category_id: "",
    code:"",
    image_url: "",
  });
  setSubCategoryImage(null);

  setShowCategoryModal(true);
  setAddErrors({});
}}
      >
        + Add  Health  Category
      </button>
    </div>
    
                             <div className="stats2-grid">
                                            <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
                                              <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                                                <FaUsers size={24} />
                                              </div>
                                              <div className="stat2-info">
                                                <h3>Total Category</h3>
                                                <div className="stat2-value">0</div>
                                              </div>
                                            </div>
                                            <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
                                              <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                                                <FaChartLine size={24} />
                                              </div>
                                              <div className="stat2-info">
                                                <h3>This Year</h3>
                                                <div className="stat2-value">0</div>
                                              </div>
                                            </div>
                                            <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
                                              <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                                                <FaCalendarAlt size={24} />
                                              </div>
                                              <div className="stat2-info">
                                                <h3>This Month</h3>
                                                <div className="stat2-value">0</div>
                                              </div>
                                            </div>
                                          </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Service Category</th>
              <th>Code</th>
              <th>Image</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {HealthLoading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan="7">
                    <div className="skeleton-row"></div>
                  </td>
                </tr>
              ))
            ) : HealthError ? (
              <tr>
                <td colSpan="7" style={{ color: "red", textAlign: "center" }}>
                  {HealthError}
                </td>
              </tr>
            ) : FilteredData?.length > 0 ? (
              FilteredData.map((item, index) => (
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
                  <td>
                    <span className="service-category-badge">
                      {item.service_category_name || "N/A"}
                    </span>
                  </td>
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
                    <span className={`status-badge ${item.is_active ? "status-active" : "status-inactive"}`}>
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                    <br />
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
                            service_category_id: item.service_category_id || "",
                            name: item.name || "",
                            description: item.description || "",
                            image_url: item.image_url || "",
                            is_active: item.is_active,
                          });
                          setEditErrors({});
                          setEditImage(null);
                          setEditModal(true);
                        }}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="action-btn delete"
                        onClick={() => {
                          setCategoryId(item.id);
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
                <td colSpan="7" style={{ textAlign: "center", padding: "40px" }}>
                  {searchTerm || statusFilter !== "all" ? (
                    <div>
                      <p>No matching categories found</p>
                      <button className="clear-filters-btn" onClick={clearFilters}>
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <p>No health categories found. Click "Add Health Category" to create one.</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showCategoryModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => {
            setShowCategoryModal(false);
            resetForm();
          }}
        >
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Add Health Category</h2>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowCategoryModal(false);
                  resetForm();
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form className="prakriti-form" onSubmit={AddHealthCategory}>
              <div className="form-group">
                <label>Service Category <span className="required">*</span></label>
                <select
                  name="service_category_id"
                  value={categoryForm.service_category_id}
                  onChange={handleCategoryChange}
                  className={addErrors.service_category_id ? "error-input" : ""}
                >
                  <option value="">Select Service Category</option>
                  {ServiceCategoryData?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>
                {addErrors.service_category_id && (
                  <p className="error-text">{addErrors.service_category_id}</p>
                )}
              </div>

              <div className="form-group">
                <label>Health Category Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={(e) => {
                    handleCategoryChange(e);
                    setAddErrors((prev) => ({
                      ...prev,
                      name: "",
                    }));
                  }}
                  placeholder="Enter health category name"
                  className={addErrors.name ? "error-input" : ""}
                />
                {addErrors.name && <p className="error-text">{addErrors.name}</p>}
              </div>

              <div className="form-group">
                <label>Category Code <span className="required">*</span></label>
                <input
                  type="text"
                  name="code"
                  value={categoryForm.code}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase();
                    value = value.replace(/[^A-Z]/g, "");
                    setCategoryForm((prev) => ({
                      ...prev,
                      code: value,
                    }));
                    setAddErrors((prev) => ({
                      ...prev,
                      code: "",
                    }));
                  }}
                  placeholder="Enter category code (A-Z, max 10 letters)"
                  maxLength="10"
                  className={addErrors.code ? "error-input" : ""}
                />
                {addErrors.code && <p className="error-text">{addErrors.code}</p>}
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
                        setSubCategoryImage(file);
                        setAddErrors((prev) => ({
                          ...prev,
                          image_url: "",
                        }));
                      }
                    }}
                  />
                  {SubCategoryImage ? (
                    <div className="banner-preview-wrapper">
                      <div className="banner-preview-left">
                        <img
                          src={URL.createObjectURL(SubCategoryImage)}
                          alt="preview"
                          className="banner-preview-image"
                        />
                      </div>
                      <div className="banner-preview-actions">
                    <button
                      type="button"
                      className="preview-btn"
                      onClick={() =>
                        window.open(URL.createObjectURL(SubCategoryImage), "_blank")
                      }
                    >
                      <FiEye />
                     
                    </button>
                  
                    <button
                      type="button"
                      className="delete-btn-preview"
                      onClick={() => {
                        setSubCategoryImage(null);
                  
                        setCategoryForm((prev) => ({
                          ...prev,
                          image_url: null,
                        }));
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
                            <p>Click to upload banner image</p>
                            <small>PNG, JPG up to 2MB</small>
                          </div>
                        </label>
                      )}
                    </div>
                  
                    {addErrors.image_url && (
                    <p className="error-text">{addErrors.image_url}</p>
                  )}
                  </div>
                      <div className="form-group">
                            <label>Description</label>
                            <textarea
                              name="description"
                              value={categoryForm.description}
                              onChange={handleCategoryChange}
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
                                checked={categoryForm.is_active}
                               onChange={handleCategoryChange}
                              />
                  
                              
                  
                            </div>
                          </div>
                  
                  
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="cancel-btn"
                                onClick={() => {
  setCategoryForm({
    name: "",
    description: "",
    is_active: false,
    service_category_id: "",
    image_url: "",
    code:"",
  });

  setShowCategoryModal(false);
  setAddErrors({});
}}
                           
                            >
                              Cancel
                            </button>
                  
                           <button
                    type="submit"
                    className="save-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Health Category"}
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
                  
                        <form className="prakriti-form" onSubmit={handleUpdateCategory}>
                  
                          <div className="form-group">
                              <label>Select Service Category</label>
                  
                              <div className="category-row">
                  
                                <select
                                  name="category_id"
                                  value={editForm.service_category_id}
                                  onChange={handleEditChange}
                                >
                                  <option value="">
                                    Select  Service Category
                                  </option>
                  
                                  {ServiceCategoryData?.map((cat) => (
                                    <option
                                      key={cat.id}
                                      value={cat.id}
                                    >
                                      {cat.name}
                                    </option>
                                  ))}
                                </select>
                  
                  
                              </div>
                              </div>
                          <div className="form-group">
                  
                  
                            <label> Product Category Name</label>
                  
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
                  
                        setEditForm((prev) => ({
                          ...prev,
                          image_url: URL.createObjectURL(file),
                        }));
                      }
                    }}
                  />
                          
                              {(EditImage || editForm.image_url) ? (
                          
                                <div className="banner-preview-wrapper">
                          
                                  <div className="banner-preview-left">
                                   <img
                    src={
                      EditImage
                        ? URL.createObjectURL(EditImage)
                        : editForm.image_url
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
                                            : editForm.image_url,
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
                  
                    setEditForm((prev) => ({
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
                          
                                <label
                                  htmlFor="editBannerUpload"
                                  className="upload-label"
                                >
                                  <div className="upload-content">
                                    <span className="upload-icon">⬆</span>
                                    <p>Click to upload category image</p>
                                 
                                  </div>
                                </label>
                          
                              )}
                          
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
                            {IsUpdating ? "Updating":"Update Product"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                  

    
     <ToastContainer position="top-center" autoClose={1000} />
    </>
  )
}

export default Healthcategory;