import React, { useState ,useEffect} from "react";
import { useRef } from "react";


import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaEdit,
} from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify"
import BASE_URL from "../../../Base";
import  {FiUpload} from "react-icons/fi";


const Productcategory = () => {
    const[HealthCategoryData,setHealthCategoryData]=useState([]);
    const[HealthLoading,sethealthLoading]=useState(false);
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
const [productCategoryStatusModal, setProductCategoryStatusModal] = useState(false);
const[ProductPreviewImage,setProductPreviewImage]=useState("")
const [selectedProductCategory, setSelectedProductCategory] = useState(null);
const [isStatusChanging, setIsStatusChanging] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);

const[IsUpdating,setIsUpdating]=useState(false);




const [categoryForm, setCategoryForm] = useState({
  name: "",
  description: "",
  is_active: false,
  category_id:"",
  image_url:"",
});

const [editModal, setEditModal] = useState(false);

const [editForm, setEditForm] = useState({
  id: "",
  name: "",
  description: "",
  image_url:"",
  category_id:"",
  is_active: false,

});

const [editErrors, setEditErrors] = useState({});
const [addErrors, setAddErrors] = useState({});
const fileInputRef = useRef(null);
const editFileRef = useRef(null);
    
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

   const handleToggle = async (id, currentStatus) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setIsStatusChanging(true);

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

    const data = await response.json();

    if (!response.ok) {
      toast.error(data?.message || "Failed to update status");
      return;
    }

    toast.success(
      !currentStatus
        ? "Category Activated Successfully"
        : "Category Deactivated Successfully"
    );

    await getProductCategoryList();
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setIsStatusChanging(false);
  }
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

const AddProductCategory = async (e) => {
  e.preventDefault();

  if (isSubmitting) return;

  setIsSubmitting(true);

  let newErrors = {};

  if (!categoryForm.category_id) {
    newErrors.category_id = "Please select a service category";
  }

  if (!categoryForm.name.trim()) {
    newErrors.name = "Sub category name is required";
  }

  if (!SubCategoryImage) {
    newErrors.image_url = "Please upload an image";
  }

  setAddErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    Object.values(newErrors).forEach((msg) => toast.error(msg));
    setIsSubmitting(false); // validation fail
    return;
  }

  try {
    let imageUrl = "";

    if (SubCategoryImage) {
      imageUrl = await uploadImage(SubCategoryImage);
    }

    const payload = {
      ...categoryForm,
      image_url: imageUrl,
    };

    const token = sessionStorage.getItem("superadmin_token");

    const response = await fetch(
      `${BASE_URL}/vendors/admin/product-category/`,
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
      setShowCategoryModal(false);
      getProductCategoryList();
    } else {
      toast.error(
        data?.errors?.image_url?.[0] ||
        data?.message ||
        "Failed to add category"
      );
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setIsSubmitting(false); 
  }
};

const handleDelete = async (id) => {
  if(isDeleting) return;
  const token = sessionStorage.getItem("superadmin_token");


  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }
setIsDeleting(true);

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/product-category/?id=${id}`,
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
      toast.error(data?.message || "Failed to delete category");
      return;
    }

  
    setHealthCategoryData((prev) =>
      prev.filter((item) => item.id !== id)
    );

    toast.success("Category deleted successfully");
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong while deleting");
  }
  finally{
    setIsDeleting(false);
  }
};

const getProductCategoryList = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  sethealthLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/product-category/`,
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

    setHealthCategoryData(data.data);
    

  } catch (err) {
    console.error("Product Category Fetch Error:", err);
    setHealthError("Something went wrong while fetching categories.");
    toast.error("Failed to fetch product categories");
  } finally {
    sethealthLoading(false);
  }
};
useEffect(()=>{
    getProductCategoryList();
},[])

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
      toast.error(data.message );
    }

  } catch (error) {

    console.error("Category Fetch Error:", error);

    setServiceCategoryError("Something went wrong while fetching data.");

    toast.error("Failed to fetch category data");

  } finally {
    setServiceCategoryLoading(false);
  }
};
useEffect(()=>{
    getCategoryList();
},[]);


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

const handleUpdateCategory = async (e) => {
  e.preventDefault();
  if(IsUpdating)return;

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

      getProductCategoryList();
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
const navigate = useNavigate();
  return (
    <>
  <div className="page-header">
                 <h1>  Product Category </h1>
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
    category_id: "",
    image_url: "",
  });
  setSubCategoryImage(null);

  setShowCategoryModal(true);
  setAddErrors({});
}}
  >
    + Add Product  Category
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
                 {HealthLoading? (
                   Array(3).fill(0).map((_, i) => (
                     <tr key={i}>
                       <td colSpan="6">
                         <div className="skeleton-row"></div>
                       </td>
                     </tr>
                   ))
                 ) : HealthError ? (
                   <tr>
                     <td colSpan="6" style={{ color: "red" }}>
                       {HealthError}
                     </td>
                   </tr>
                 ) : HealthCategoryData?.length > 0 ? (
                   HealthCategoryData.map((item, index) => (
                     <tr key={item.id}>
                       <td>{index + 1}</td>
               
                      
                       <td>{item.name}</td>  
                                 <td>
  <img
    src={item.image_url}
    alt="category"
    width="60"
    height="60"
    style={{
      objectFit: "cover",
      borderRadius: "6px"
    }}
     onClick={() => setProductPreviewImage(item.image_url)}
  />
</td>
                       <td>{item.description}</td>
                    <td>
  <label className="switch">
    <input
      type="checkbox"
      checked={item.is_active}
      onChange={() => {
        setSelectedProductCategory(item);
        setProductCategoryStatusModal(true);
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
   setEditForm({
  id: item.id,
  category_id: item.category_id || "",
  name: item.name || "",
  description: item.description || "",
  image_url: item.image_url || "",
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

            {showCategoryModal && (
  
    <div
    className="prakriti-modal-overlay"
    onClick={() => setShowCategoryModal(false)}
  >
    <div
      className="prakriti-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="prakriti-modal-header">
        <h2>Add Product Category</h2>
        <button
          className="close-btn"
          onClick={() => setShowCategoryModal(false)}
        >
          ×
        </button>
      </div>

      <form className="prakriti-form" onSubmit={AddProductCategory}>

   <div className="form-group">
            <label>Select Service Category</label>

            <div className="category-row">

              <select
                name="category_id"
                value={categoryForm.category_id}
                onChange={handleCategoryChange}
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

            {addErrors.category_id && (
              <p className="error-text">
                {addErrors.category_id}
              </p>
            )}
          </div>

        <div className="form-group">
          <label> product Category Name</label>
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
  placeholder="Enter sub product category name"
/>

{addErrors.name && (
  <p className="error-text">{addErrors.name}</p>
)}
        </div>

<div className="form-group">
<label> Upload Image</label>
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

    setCategoryForm((prev) => ({
      ...prev,
      image_url: file,
    }));

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
          <p>Click to upload Product Category image</p>
     
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
    category_id: "",
    image_url: "",
  });
  setSubCategoryImage(null);

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
  {isSubmitting ? "Adding..." : "Add Product Category"}
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
                value={editForm.category_id}
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
  disabled={isDeleting}
  onClick={async () => {
    await handleDelete(categoryId);
    setDeleteModal(false);
    setCategoryId(null);
  }}
>
  {isDeleting ? "Deleting..." : "Yes"}
</button>
        <button
          onClick={() => {
            setDeleteModal(false);
            setCategoryId(null);
          }}
        >
          No
        </button>
      </div>
    </div>
  </div>
)}

{productCategoryStatusModal && selectedProductCategory && (
  <div
    className="activeModal-overlay"
    onClick={() => {
      setProductCategoryStatusModal(false);
      setSelectedProductCategory(null);
    }}
  >
    <div
      className="activeModal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="activeModal-close"
        onClick={() => {
          setProductCategoryStatusModal(false);
          setSelectedProductCategory(null);
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
            selectedProductCategory.is_active
              ? "inactive-text"
              : "active-text"
          }
        >
          {selectedProductCategory.is_active
            ? " Inactive "
            : " Active "}
        </span>
        this Product Category?
      </p>

      <div className="activeModal-card">
        <h4>{selectedProductCategory.name}</h4>
      </div>

      <div className="activeModal-footer">
        <button
          className="activeModal-cancel"
          onClick={() => {
            setProductCategoryStatusModal(false);
            setSelectedProductCategory(null);
          }}
        >
          Cancel
        </button>

        <button
          disabled={isStatusChanging}
          className={`activeModal-confirm ${
            selectedProductCategory.is_active
              ? "deactivate-btn"
              : "activate-btn"
          }`}
          onClick={async () => {
            await handleToggle(
              selectedProductCategory.id,
              selectedProductCategory.is_active
            );

            setProductCategoryStatusModal(false);
            setSelectedProductCategory(null);
          }}
        >
          {isStatusChanging
            ? "Updating..."
            : `Yes, ${
                selectedProductCategory.is_active
                  ? "Deactivate"
                  : "Activate"
              }`}
        </button>
      </div>
    </div>
  </div>
)}

{ProductPreviewImage && (
  <div
    className="prakriti-modal-overlay"
    onClick={() => setProductPreviewImage("")}
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
          src={ProductPreviewImage}
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
          onClick={() => setProductPreviewImage("")}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
 <ToastContainer position="top-center" autoClose={1000} />
    </>
  )
}

export default Productcategory