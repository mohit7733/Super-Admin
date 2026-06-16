
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaEdit,

}from "react-icons/fa";
import { FiTrash2 } from 'react-icons/fi';
import { FiEye ,FiUpload} from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify"
import BASE_URL from "../../../Base";

const SubProductCategory = () => {
  const[Data,setData]=useState([]);
  const[Loading,setLoading]=useState(false);
  const[Error,setError]=useState(null);
  const[ShowCategoryModal,setShowCategoryModal]=useState(false);
  const navigate = useNavigate();


  const [SubCategoryForm, setSubCategoryForm] = useState({
  name: "",
  description: "",
  is_active: false,
  category_id: "",
  product_id: "", 
  image_url: "",
});
const[isSubmitting,setIsSubmitting]=useState(false);
const[ServiceCategoryData,setServiceCategoryData]=useState([]);
const[ServiceCategoryLoading,setServiceCategoryLoading]=useState(false);
const[ServiceCategoryError,setServiceCategoryError]=useState(null);
const[SubCategoryData,SetSubCategoryData]=useState([]);
const[SubCategoryLoading,setSubCategoryLoading]=useState(false);
const[SubCategoryError,setSubCategoryError]=useState(null);
const[AddError,setAddError]=useState({});
const[SubCategoryImage,setSubCategoryImage]=useState(null);
const [showEditModal, setShowEditModal] = useState(false);
const [editId, setEditId] = useState(null);

const [EditForm, setEditForm] = useState({
  name: "",
  description: "",
  is_active: false,
  category_id: "",
  product_id: "",
  image_url: "",
});

const [EditImage, setEditImage] = useState(null);

  const handleToggle = async (id, currentStatus) => {
  const token = sessionStorage.getItem("superadmin_token");
  if(!token){
    toast.error("Session Expired,please login Again");
    navigate("/login");
    return;
  }

  try {
    const response = await fetch(
     `${BASE_URL}/vendors/admin/product-category/?id=${id}`,
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
    console.log(data);

    toast.success("Status updated successfully");

getSubProductCategoryList();
  } catch (error) {
    console.error(error);
    toast.error("Failed to update status");
  }
};
const handleCategoryChange = (e) => {
  const { name, value, type, checked } = e.target;

  setSubCategoryForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
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

    const response = await fetch(
      `${BASE_URL}/user/upload/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
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
   

const handleEditChange = (e) => {
  const { name, value, type, checked } = e.target;

  setEditForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
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
      `${BASE_URL}/user/admin/categories/`,
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

    if (data.success) {
      setServiceCategoryData(data.data);

     

    } else {
      toast.error(data.message || "Failed to get categories");
    }

  } catch (error) {

    console.error("Category Fetch Error:", error);

    setError("Something went wrong while fetching data.");

    toast.error("Failed to fetch category data");

  } finally {
    setServiceCategoryLoading(false);
  }
};
const handleEdit = async (item) => {
    console.log("EDIT ITEM =>", item);
  setEditId(item.id);

  setEditForm({
    name: item.name || "",
    description: item.description || "",
    is_active: item.is_active || false,
    category_id: item.category_id || "",
    product_id: item.product_category_id || "",
    image_url: item.image_url || "",
  });

 
  if (item.category_id) {
    await getSubProductCategoryList(item.category_id);
  }

  setShowEditModal(true);
};

const handleUpdateSubSubCategory = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem("superadmin_token");

  try {
    setIsSubmitting(true);

    let imageUrl = EditForm.image_url;

    // New image selected hai toh pehle upload karo
    if (EditImage) {
      imageUrl = await uploadImage(EditImage);

      if (!imageUrl) {
        toast.error("Image upload failed");
        return;
      }
    }

    const payload = {
      product_category_id: EditForm.product_id,
      name: EditForm.name,
      description: EditForm.description,
      image_url: imageUrl,
      is_active: EditForm.is_active,
    };

    console.log("UPDATE PAYLOAD =>", payload);

    const response = await fetch(
      `${BASE_URL}/vendors/admin/product-subcategory/?id=${editId}`,
      {
        method: "PATCH",
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
      toast.success("Category updated successfully");

      setEditImage(null);
      setShowEditModal(false);

      getSubSubProductCategoryList();
    } else {
      toast.error(data.message || "Update failed");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setIsSubmitting(false);
  }
};

const handleAddSubSubCategory = async (e) => {
  e.preventDefault();

  let errors = {};

  if (!SubCategoryForm.category_id) {
    errors.category_id = "Please select service category";
  }

  if (!SubCategoryForm.product_id) {
    errors.product_id = "Please select sub service category";
  }

  if (!SubCategoryForm.name.trim()) {
    errors.name = "Name is required";
  }

  setAddError(errors);

  if (Object.keys(errors).length > 0) return;

  const token = sessionStorage.getItem("superadmin_token");

  try {
    setIsSubmitting(true);

    let imageUrl = "";

    // Upload image first
    if (SubCategoryImage) {
      imageUrl = await uploadImage(SubCategoryImage);

      if (!imageUrl) {
        toast.error("Image upload failed");
        return;
      }
    }

    const payload = {
      product_category_id: SubCategoryForm.product_id,
      name: SubCategoryForm.name,
      description: SubCategoryForm.description,
      image_url: imageUrl, // <-- URL yaha jayega
      is_active: SubCategoryForm.is_active,
    };

    console.log("Payload:", payload);

    const response = await fetch(
      `${BASE_URL}/vendors/admin/product-subcategory/`,
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
      toast.success("Sub Sub Category added successfully");

      setShowCategoryModal(false);

      setSubCategoryForm({
        name: "",
        description: "",
        is_active: false,
        category_id: "",
        product_id: "",
        image_url: "",
      });

      setSubCategoryImage(null);

      getSubSubProductCategoryList();
    } else {
      toast.error(data.message || "Failed to add category");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setIsSubmitting(false);
  }
};


const getSubSubProductCategoryList = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/product-subcategory/`,
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

    console.log("Product Categorysub API Response:", data);

    setData(data.data);
    

  } catch (err) {
    console.error("Product Category Fetch Error:", err);
    setError("Something went wrong while fetching categories.");
    toast.error("Failed to fetch product categories");
  } finally {
    setLoading(false);
  }
};
const getSubProductCategoryList = async (categoryId) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setSubCategoryLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/product-category/?category_id=${categoryId}`,
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

    console.log("Product Category API Response:", data);

    SetSubCategoryData(data.data || []);
  } catch (err) {
    console.error(err);
  } finally {
    setSubCategoryLoading(false);
  }
};
useEffect(()=>{
    getSubProductCategoryList();
    getCategoryList();
    getSubSubProductCategoryList();
},[])

  return (
    <>
 <div className="page-header">
                 <h1> Sub-Sub Service Category </h1>
                 <p className="page-paragraph"> Manage Sub Service Category  and their details</p>
               </div>
    
        <div className="filter-category">
  <button
    className="add-customer-btn"
    onClick={() => setShowCategoryModal(true)}
  >
    + Add Sub-Sub Service Category
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
                                                                 <table className="data-table" >
                                                                   <thead>
                                                                     <tr>
                                                                       <th>ID</th>
                                                                       <th>Name </th>
                                                                       <th>Image</th>
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
                                                     ) : Data?.length > 0 ? (
                                                       Data.map((item, index) => (
                                                         <tr key={item.id}>
                                                           <td>{index + 1}</td>
                                                   
                                                          
                                                           <td>{item.name}</td> 
                                                                                        <td>
  <img
    src={item.image_url}
    alt="sub-category"
    width="60"
    height="60"
    style={{
      objectFit: "cover",
      borderRadius: "6px"
    }}
  />
</td> 
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
  onClick={() => handleEdit(item)}
>
  <FaEdit />
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

                                                          {ShowCategoryModal && (
                                                    
                                                      <div
                                                      className="prakriti-modal-overlay"
                                                      onClick={() => setShowCategoryModal(false)}
                                                    >
                                                      <div
                                                        className="prakriti-modal"
                                                        onClick={(e) => e.stopPropagation()}
                                                      >
                                                        <div className="prakriti-modal-header">
                                                          <h2>Add Sub-Sub service Category</h2>
                                                          <button
                                                            className="close-btn"
                                                            onClick={() => setShowCategoryModal(false)}
                                                          >
                                                            ×
                                                          </button>
                                                        </div>
                                                  
                                                        <form className="prakriti-form"
                                                          onSubmit={handleAddSubSubCategory} >
                                                  
                                                     <div className="form-group">
                                                              <label>Select Service Category</label>
                                                  
                                                              <div className="category-row">
                                                  
                                                               <select
  name="category_id"
  value={SubCategoryForm.category_id}
  onChange={(e) => {
    console.log("Selected ID:", e.target.value);

    handleCategoryChange(e);

    getSubProductCategoryList(e.target.value);
  }}
>
  <option value="">Select Service Category</option>

  {ServiceCategoryData?.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>
                                                  
                                                              </div>
                                                  
                                                              {AddError.category_id && (
                                                                <p className="error-text">
                                                                  {AddError.category_id}
                                                                </p>
                                                              )}
                                                            </div>
                                                             <div className="form-group">
                                                              <label>Select Sub Service Category</label>
                                                  
                                                              <div className="category-row">
                                                  
                                                           <select
  name="product_id"
  value={SubCategoryForm.product_id}
  onChange={handleCategoryChange}
>
  <option value="">
    Select Sub Service Category
  </option>

  {SubCategoryData?.length > 0 ? (
    SubCategoryData.map((cat) => (
      <option
        key={cat.id}
        value={cat.id}
      >
        {cat.name}
      </option>
    ))
  ) : (
    <option value="" disabled>
      No Sub Service Category Found
    </option>
  )}
</select>
                                                                                                  
                                                              </div>
                                                  
                                                              {AddError.Product_id && (
                                                                <p className="error-text">
                                                                  {AddError.Product_id}
                                                                </p>
                                                              )}
                                                            </div>
                                                  
                                                          <div className="form-group">
                                                            <label>Sub-Service Category  Name</label>
                                                           <input
                                                    type="text"
                                                    name="name"
                                                    value={SubCategoryForm.name}
                                                    onChange={(e) => {
                                                      handleCategoryChange(e);
                                                  
                                                      setAddError((prev) => ({
                                                        ...prev,
                                                        name: "",
                                                      }));
                                                    }}
                                                    placeholder="Enter category name"
                                                  />
                                                  
                                                  {AddError.name && (
                                                    <p className="error-text">{AddError.name}</p>
                                                  )}
                                                          </div>
                                                  
                                                  <div className="form-group">
                                                  <label> Upload Image</label>
                                                     <div className="upload-box1">
                                                      <input
                                                        type="file"
                                                        accept="image/*"
                                                        id="categoryUpload"
                                                        onChange={(e) => {
                                                          const file = e.target.files[0];
                                                  
                                                          setSubCategoryImage(file);
                                                  
                                                          setSubCategoryForm((prev) => ({
                                                            ...prev,
                                                            image_url: file,
                                                          }));
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
                                                  
                                                        setSubCategoryForm((prev) => ({
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
                                                  
                                                    {AddError.image_url && (
                                                    <p className="error-text">{AddError.image_url}</p>
                                                  )}
                                                  </div>
                                                      <div className="form-group">
                                                            <label>Description</label>
                                                            <textarea
                                                              name="description"
                                                              value={SubCategoryForm.description}
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
                                                                checked={SubCategoryForm.is_active}
                                                               onChange={handleCategoryChange}
                                                              />
                                                  
                                                              
                                                  
                                                            </div>
                                                          </div>
                                                  
                                                  
                                                          <div className="modal-footer">
                                                            <button
                                                              type="button"
                                                              className="cancel-btn"
                                                              onClick={() => setShowCategoryModal(false)}
                                                            >
                                                              Cancel
                                                            </button>
                                                  
                                                           <button
                                                    type="submit"
                                                    className="save-btn"
                                                    disabled={isSubmitting}
                                                  >
                                                    {isSubmitting ? "Adding..." : "Add Product Category"}
                                                  </button>
                                                          </div>
                                                        </form>
                                                      </div>
                                                    </div>
                                                  )} 

                                                  {showEditModal && (
  <div
    className="prakriti-modal-overlay"
    onClick={() => setShowEditModal(false)}
  >
    <div
      className="prakriti-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="prakriti-modal-header">
        <h2>Edit Sub-Sub Service Category</h2>

        <button
          className="close-btn"
          onClick={() => setShowEditModal(false)}
        >
          ×
        </button>
      </div>

      <form
        className="prakriti-form"
        onSubmit={handleUpdateSubSubCategory}
      >
        {/* Service Category */}

        <div className="form-group">
          <label>Select Service Category</label>

          <div className="category-row">
            <select
              name="category_id"
              value={EditForm.category_id}
              onChange={(e) => {
                handleEditChange(e);

                getSubProductCategoryList(e.target.value);
              }}
            >
              <option value="">
                Select Service Category
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

        {/* Sub Service Category */}

        <div className="form-group">
          <label>Select Sub Service Category</label>

          <div className="category-row">
            <select
              name="product_id"
              value={EditForm.product_id}
              onChange={handleEditChange}
            >
              <option value="">
                Select Sub Service Category
              </option>

              {SubCategoryData?.length > 0 ? (
                SubCategoryData.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                  >
                    {cat.name}
                  </option>
                ))
              ) : (
                <option
                  value=""
                  disabled
                >
                  No Sub Service Category Found
                </option>
              )}
            </select>
          </div>
        </div>

        {/* Name */}

        <div className="form-group">
          <label>Sub-Service Category Name</label>

          <input
            type="text"
            name="name"
            value={EditForm.name}
            onChange={handleEditChange}
            placeholder="Enter category name"
          />
        </div>

        {/* Image Upload */}

   <div className="form-group">
  <label>Upload Image</label>

  <div className="upload-box1">

    <input
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

    {(EditImage || EditForm.image_url) ? (
      <div className="banner-preview-wrapper">

        <div className="banner-preview-left">
          <img
            src={
              EditImage
                ? URL.createObjectURL(EditImage)
                : EditForm.image_url
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
                  : EditForm.image_url,
                "_blank"
              )
            }
          >
            <FiEye />
          </button>

          <button
            type="button"
            className="preview-btn"
            onClick={() =>
              document.getElementById("editBannerUpload").click()
            }
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
          <p>Click to upload banner image</p>
          <small>PNG, JPG up to 2MB</small>
        </div>
      </label>
    )}

  </div>
</div>

        {/* Description */}

        <div className="form-group">
          <label>Description</label>

          <textarea
            name="description"
            value={EditForm.description}
            onChange={handleEditChange}
            placeholder="Enter description"
            rows="4"
          />
        </div>

        {/* Status */}

        <div className="form-group">
          <label>Is Active</label>

          <div className="checkbox-row">
            <input
              type="checkbox"
              name="is_active"
              checked={EditForm.is_active}
              onChange={handleEditChange}
            />
          </div>
        </div>

        {/* Footer */}

        <div className="modal-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Category"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </>
  )
}

export default SubProductCategory