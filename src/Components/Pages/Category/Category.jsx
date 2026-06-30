import React, { useState,useRef, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaChartLine,FaCalendarAlt,FaEdit } from 'react-icons/fa'
import { FiTrash2, FiUpload } from 'react-icons/fi';
import { ToastContainer, toast } from "react-toastify"
import BASE_URL from "../../../Base";
import { use } from 'react';
import { FiEye } from 'react-icons/fi';



const Category = () => {
const[Loading,setLoading]=useState(true);
const[Error,setError]=useState(null);
const[Data,setData] = useState([]);
const [showModal, setShowModal] = useState(false);
 const [submitLoading, setSubmitLoading] = useState(false);
const [categoryName, setCategoryName] = useState("");
const[CategoryCode,setCategoryCode]=useState("")
const [categoryImage, setCategoryImage] = useState(null);
const [isActive, setIsActive] = useState(false);
const [deleteModal, setDeleteModal] = useState(false);
const [categoryId, setCategoryId] = useState(null);
const [existingImage, setExistingImage] = useState("");
const [editModal, setEditModal] = useState(false);
const [editCategoryName, setEditCategoryName] = useState("");
const [editCategoryImage, setEditCategoryImage] = useState(null);
const [editCategoryId, setEditCategoryId] = useState(null);
const [errors, setErrors] = useState({});
const navigate = useNavigate();
const[isSubmitting,setIsSubmitting]=useState(false);
const [previewImage, setPreviewImage] = useState("");
const [statusModal, setStatusModal] = useState(false);

const [selectedCategory, setSelectedCategory] = useState(null);


const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") 
    .replace(/\s+/g, "_"); 
};


const editFileRef = useRef(null);


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
    
const getCategoryList = async () => {
const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoading(true);


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

    console.log("Category API Response:", data);

    if (data.success) {
      setData(data.data);

     

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
    getCategoryList();
},[]);
const addFileRef = useRef(null);


const handleAddCategory = async (e) => {
  e.preventDefault();
  
 


  const token = sessionStorage.getItem("superadmin_token");


  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }
  let newErrors = {};

  if (!categoryName.trim()) {
  newErrors.categoryName = "Category name is required";

  toast.error("Category name is required");
}


if (!CategoryCode.trim()) {
  newErrors.CategoryCode = "Category Code is required";
} else if (!/^[A-Z]{1,5}$/.test(CategoryCode)) {
  newErrors.CategoryCode =
    "Code must be 1-5 uppercase letters (A-Z).";
}

if (!categoryImage) {
  newErrors.categoryImage = "Category image is required";

  toast.error("Category image is required");
}

  setErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    return;
  }

  try {
    setSubmitLoading(true);
   

    let imageUrl = "";

    if (categoryImage) {
      imageUrl = await uploadImage(categoryImage);

      if (!imageUrl) {
        toast.error("Image upload failed");
        return;
      }
    }

    const payload = {
      name: categoryName,
      image_url: imageUrl,
      is_active: isActive,
      code:CategoryCode,
    };

    const response = await fetch(
      `${BASE_URL}/user/admin/service-category/`,
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

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");

      toast.error("Session expired. Please login again");

      navigate("/login");

      return;
    }

    const data = await response.json();

    console.log("ADD CATEGORY RESPONSE:", data);

    if (response.ok) {

      toast.success("Category added successfully");

      setShowModal(false);

      setCategoryName("");

      setCategoryImage(null);

      setErrors({});

      getCategoryList();
    }
else {
  const errorMessage =
    data?.message || "Failed to add category";

  toast.error(errorMessage);
}
  } catch (error) {

    console.log("ADD CATEGORY ERROR:", error);

    toast.error("Something went wrong");

  } finally {

    setSubmitLoading(false);
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
      `${BASE_URL}/user/admin/service-category/?id=${id}`,
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

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");

      toast.error("Session expired. Please login again");

      navigate("/login");

      return;
    }

     if (!response.ok || data.success === false) {
      const errorMsg =
        data?.message ||
        data?.errors?.id?.[0] ||
        "Failed to delete category";

      toast.error(errorMsg);
      return;
    }


    setData((prev) =>
      prev.filter((item) => item.id !== id)
    );

    toast.success("Category deleted successfully");

  } catch (error) {
    console.error(error);

    toast.error(
      "Something went wrong while deleting category"
    );
  }
};


const handleUpdateCategory = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem("superadmin_token");

 

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

//     let newErrors = {};

//   if (!editCategoryName.trim()) {
//     newErrors.editCategoryName =
//       "Category name is required";
//   }

//   if (!existingImage && !editCategoryImage) {
//     newErrors.editCategoryImage =
//       "Category image is required";
//   }

//   setErrors(newErrors);

//   if (Object.keys(newErrors).length > 0) {
//     return;
//   }

  try {
    setSubmitLoading(true);
    
  
    let imageUrl = existingImage;

  
    if (editCategoryImage) {

      imageUrl = await uploadImage(editCategoryImage);

      if (!imageUrl) {
        toast.error("Image upload failed");
        return;
      }
    }

    const payload = {
      name: editCategoryName,
      image_url: imageUrl,
      is_active:isActive,
    };

    const response = await fetch(
      `${BASE_URL}/user/admin/service-category/?id=${editCategoryId}`,
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },

        body: JSON.stringify(payload),
      }
    );
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

    const data = await response.json();

    console.log("UPDATE CATEGORY RESPONSE:", data);

    if (response.ok) {

      toast.success("Category updated successfully");

      setEditModal(false);
      setEditCategoryName("");
      setEditCategoryImage(null);
      setEditCategoryId(null);
      setExistingImage("");
      getCategoryList();

    } else {

      toast.error(
        data.message || "Failed to update category"
      );
    }

  } catch (error) {

    console.log("UPDATE CATEGORY ERROR:", error);

    toast.error("Something went wrong");

  } finally {

    setSubmitLoading(false);
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
      `${BASE_URL}/user/admin/service-category/?id=${id}`,
      {
        method: "PUT",
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

    toast.success(
      !currentStatus
        ? "Category Activated Successfully"
        : "Category Deactivated Successfully"
    );

    getCategoryList();

  } catch (error) {
    console.error(error);
    toast.error("Failed to update status");
  }
};

    return (
    <>
      <div className="page-header">
            <h1>Category </h1>
            <p className="page-paragraph"> Manage Category  and their details</p>
          </div>

         
                 
                  <div className="filter-category">
                    <button
                      className="add-customer-btn"
                        onClick={() => {
                          setShowModal(true);
                          setCategoryName("");
                          setCategoryImage(null);
                          setErrors({});
                          setIsActive(false);
                        }}
                    
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="10" cy="7" r="4" />
                        <path d="M4 21v-2a6 6 0 0 1 12 0v2" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                      </svg>
                      Add category
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
                              <th>Category </th>
                              <th>Code</th>
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
            ) : Data?.length > 0 ? (
              Data.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
          
                 
                  <td>{item.name}</td>
                  <td>{item.code}</td>
          
                 
         <td>
  <img
    src={item.image_url}
    alt="category"
    width="60"
    height="60"
    style={{
      objectFit: "cover",
      borderRadius: "6px",
      cursor: "pointer"
    }} onClick={() => setPreviewImage(item.image_url)}
   
  />
</td>

   <td>
          <label className="switch">
            <input
              type="checkbox"
              checked={item.is_active}
             onChange={() => {
  setSelectedCategory(item);
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
  setEditCategoryId(item.id);
  setEditCategoryName(item.name);
  setExistingImage(item.image_url);
  setIsActive(item.is_active);
  setEditModal(true);
}}
>
  <FaEdit />
</button>
          
                           <button
  className="action-btn delete"
  onClick={() => {
    setCategoryId(item.id);
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

                      {showModal && (
   <div className="prakriti-modal-overlay">
      <div className="prakriti-modal">

       
      <div className="prakriti-modal-header">
          <h2>Add Category</h2>

        
        </div>


      <form onSubmit={handleAddCategory} className="prakriti-form">

        <div className="form-group">
          <label>Category Name</label>

         <input
  type="text"
  value={categoryName}
  onChange={(e) => {
    setCategoryName(e.target.value);

    if (e.target.value.trim()) {
      setErrors((prev) => ({
        ...prev,
        categoryName: "",
      }));
    }
  }}
  placeholder="Enter category name"
/>
          {errors.categoryName && (
  <p className="error-text">
    {errors.categoryName}
  </p>
)}
        </div>
          <div className="form-group">
          <label>Category Code</label>

         <input
  type="text"
  value={CategoryCode}
  onChange={(e) => {
    setCategoryCode(e.target.value);

    if (e.target.value.trim()) {
      setErrors((prev) => ({
        ...prev,
        CategoryCode: "",
      }));
    }
  }}
 placeholder="Enter category code (e.g., CAT001)"
/>
          {errors.CategoryCode && (
  <p className="error-text">
    {errors.CategoryCode}
  </p>
)}
        </div>

    <div className="form-group">
  <label>Category Image</label>

  <div className="upload-box1">
 <input
  ref={addFileRef}
  type="file"
  accept="image/*"
  id="categoryUpload"
  onChange={(e) => {
    const file = e.target.files[0];

    if (file) {
      setCategoryImage(file);

      setErrors((prev) => ({
        ...prev,
        categoryImage: "",
      }));
    }
  }}
/>
    {categoryImage ? (
      <div className="banner-preview-wrapper">
        <div className="banner-preview-left">
          <img
            src={URL.createObjectURL(categoryImage)}
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
                URL.createObjectURL(categoryImage),
                "_blank"
              )
            }
          >
           <FiEye />
          </button>

         <button
  type="button"
  className="delete-btn-preview"
  onClick={() => {
    setCategoryImage(null);

    if (addFileRef.current) {
      addFileRef.current.value = "";
    }
  }}
>
  <FiTrash2 />
</button>
        </div>
      </div>
    ) : (
      <label
        htmlFor="categoryUpload"
        className="upload-label"
      >
        <div className="upload-content">
          <span className="upload-icon">⬆</span>
          <p>Click to upload category image</p>
       
        </div>
      </label>
    )}
  </div>

  {errors.categoryImage && (
    <p className="error-text">
      {errors.categoryImage}
    </p>
  )} 
</div>


      <div className="form-group">
  <label>Is Active</label>

  <div className="checkbox-row">
    <input
      type="checkbox"
      name="is_active"
      checked={isActive}
      onChange={(e) => setIsActive(e.target.checked)}
    />

   
  </div>
</div>

        
<div className="modal-footer">

          <button
            type="button"
            className="cancel-btn"
            onClick={() =>{
              setShowModal(false);
              setCategoryName("");
              setCategoryImage(null);
              setErrors({});
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
          className="save-btn"
            disabled={submitLoading}
          >
            {submitLoading ? "Adding..." : "Add Category"}
          </button>

        </div>
      </form>
      
    </div>
  </div>


)}

{editModal && (
 <div className="prakriti-modal-overlay">
      <div className="prakriti-modal">

       
      <div className="prakriti-modal-header">
          <h2>Edit Category</h2>

        
        </div>


      <form onSubmit={handleUpdateCategory} className='prakriti-form'>

        
      
<div className="form-group">
  <label>Category Name</label>

  <input
    type="text"
    value={editCategoryName}
    onChange={(e) => {
      setEditCategoryName(e.target.value);
    }}
    placeholder="Enter category name"
  />
</div>
      
  

 <div className="form-group">
  <label>Category Image</label>

  <div className="upload-box1">
     <input
  ref={editFileRef}
  type="file"
  accept="image/*"
  id="editCategoryUpload"
  style={{ display: "none" }}
  onChange={(e) => {
    const file = e.target.files[0];

    if (file) {
      setEditCategoryImage(file);
    }
  }}
  />
    {(editCategoryImage || existingImage) ? (
      <div className="banner-preview-wrapper">

        <div className="banner-preview-left">
          <img
            src={
              editCategoryImage
                ? URL.createObjectURL(editCategoryImage)
                : existingImage
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
                editCategoryImage
                  ? URL.createObjectURL(editCategoryImage)
                  : existingImage,
                "_blank"
              )
            }
          >
            <FiEye />
          </button>

          <label
            htmlFor="editCategoryUpload"
            className="preview-btn"
            style={{ cursor: "pointer" }}
          >
            <FiUpload />
          </label>

          <button
            type="button"
            className="delete-btn-preview"
        onClick={() => {
  setEditCategoryImage(null);
  setExistingImage("");

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
        htmlFor="editCategoryUpload"
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
      checked={isActive}
      onChange={(e) =>
        setIsActive(e.target.checked)
      }
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
            disabled={submitLoading}
          >
            {submitLoading ? "Updating..." : "Update Category"}
          </button>

        </div>

      </form>
    </div>
  </div>
)}
    {deleteModal && (
  <div className="modal">
    <div className="modal-content">
      <h3>
        Are you sure you want to delete this Category?
      </h3>

      <div className="form-buttons">
        <button
          className="otp-btn verify-btn"
          onClick={() => {
            handleDelete(categoryId);
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

{previewImage && (
  <div
    className="prakriti-modal-overlay"
    onClick={() => setPreviewImage("")}
  >
    <div
      className="prakriti-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="prakriti-modal-header">
        <h2>Image Preview</h2>
      </div>

      <div style={{ textAlign: "center" }}>
        <img
          src={previewImage}
          alt="preview"
          style={{
            width: "100%",
            maxHeight: "500px",
            objectFit: "contain",
            borderRadius: "10px",
          }}
        />
      </div>

      <div className="modal-footer">
        <button
          className="cancel-btn"
          onClick={() => setPreviewImage("")}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
{statusModal && selectedCategory && (
   <div
    className="activeModal-overlay"
    onClick={() => {
      setStatusModal(false);
      setSelectedCategory(null);
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
          setSelectedCategory(null);
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
            selectedCategory.is_active
              ? "inactive-text"
              : "active-text"
          }
        >
          {selectedCategory.is_active
            ? " Inactive "
            : " Active "}
        </span>
        this category?
      </p>

      <div className="activeModal-card">
        <h4>{selectedCategory.name}</h4>
     
      </div>

      <div className="activeModal-footer">
        <button
          className="activeModal-cancel"
          onClick={() => {
            setStatusModal(false);
            setSelectedCategory(null);
          }}
        >
          Cancel
        </button>

        <button
          className={`activeModal-confirm ${
            selectedCategory.is_active
              ? "deactivate-btn"
              : "activate-btn"
          }`}
          onClick={() => {
            updateCategoryStatus(
              selectedCategory.id,
              selectedCategory.is_active
            );

            setStatusModal(false);
            setSelectedCategory(null);
          }}
        >
          Yes,{" "}
          {selectedCategory.is_active
            ? "Deactivate"
            : "Activate"}
        </button>
      </div>

    </div>
  </div>
)}
<ToastContainer position="top-center" autoClose={1000} />
    
    </>
  )
}

export default Category