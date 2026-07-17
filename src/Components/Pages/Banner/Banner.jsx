import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaImages,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
} from "react-icons/fa";

import { FiTrash2 } from "react-icons/fi";
import { FiEye } from "react-icons/fi";
import { BsPlus } from "react-icons/bs";
import { FiUpload } from "react-icons/fi";
import BASE_URL from "../../../Base";
import { toast } from 'react-toastify'

const Banner = () => {
  const[BannerData,setBannerData]=useState([]);
  const[BannerLoading,setBannerLoading]=useState(false);
 const[Error,setError]=useState(null)
  const[showBannerModal,setShowBannerModal]=useState(false);
  const intialbannerform ={
    
  }
 const [bannerForm, setBannerForm] = useState({
  image_url: null,
  redirect_url: "",
  service_category_id: "",
  is_active: false,
});
const[CategoryData,setCategoryData]=useState([]);
const[CategoryLoading,setCategoryLoading]=useState(false);
const[CategoryError,setCategoryError]=useState(null);
const navigate = useNavigate();
const [BannerError, setBannerError] = useState({});
const[BannerImage,setBannerImage]=useState(null);
const[ShowDeleteModal,setShowDeleteModal]=useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [editBannerId, setEditBannerId] = useState(null);
const [editBannerImage, setEditBannerImage] = useState(null);
const[DeleteBannerModal,setDeleteBannerModal]=useState(false);
const[SelectedBanner,setSelectedBanner]=useState(null);
const[BannerPreviewImage,setBannerPreviewImage]=useState("");

const [editBannerForm, setEditBannerForm] = useState({
  image_url: "",
  redirect_url: "",
  service_category_id: "",
  is_active: false,
});


const handleChange = (e) => {
  const { name, value, checked, type } = e.target;

  setBannerForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));

  setBannerError((prev) => ({
    ...prev,
    [name]: "",
  }));
};


const getCategoryList = async (page = 1, ) => {
const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setCategoryLoading(true);


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
      setCategoryData(data.data);

     

    } else {
      toast.error(data.message || "Failed to fetch categories");
    }

  } catch (error) {

    console.error("Category Fetch Error:", error);

    setCategoryError("Something went wrong while fetching data.");

    toast.error("Failed to fetch category data");

  } finally {
    setCategoryLoading(false);
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

const getBannerList = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setBannerLoading(true);
  setError(null);

  try {
    const response = await fetch(
      `${BASE_URL}/user/admin/banner/`,
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

    console.log("Banner API Response:", data);

    if (data.success) {
      setBannerData(data?.data);
    } else {
      setError(data.message || "Failed to fetch banners");
      toast.error(data.message || "Failed to fetch banners");
    }
  } catch (error) {
    console.error("Banner Fetch Error:", error);
    setError("Something went wrong while fetching banners.");
    toast.error("Failed to fetch banner data");
  } finally {
    setBannerLoading(false);
  }
};
useEffect(()=>{
    getCategoryList();
    getBannerList();
},[]);

const handleEditChange = (e) => {
  const { name, value, checked, type } = e.target;

  setEditBannerForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};

const handleAddBanner = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem("superadmin_token");

  

  try {
 setBannerLoading(true);
    let uploadedImageUrl = null;    
    if (BannerImage) {
      uploadedImageUrl = await uploadImage(BannerImage);
    }

   
    const payload = {
  image_url: uploadedImageUrl,
  redirect_url: bannerForm.redirect_url,
  service_category_id: bannerForm.service_category_id,
  is_active: bannerForm.is_active,
};
    console.log("Banner Payload:", payload);

   
    const response = await fetch(
      `${BASE_URL}/user/admin/banner/`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log("Banner Response:", data);

    if (response.ok) {
      toast.success("Banner Added Successfully");

     
      setBannerForm({
        image_url: null,
        redirect_url: "",
      service_category_id: "",
        is_active: true,
      });

      setBannerImage(null);
      setShowBannerModal(false);

      getBannerList();
    } else {
      toast.error(data?.message || "Failed to add banner");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setBannerLoading(false);
  }
};

const handleUpdateBanner = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem("superadmin_token");

  try {
    let imageUrl = editBannerForm.image_url;

    if (editBannerImage) {
      imageUrl = await uploadImage(editBannerImage);
    }

    const payload = {
      image_url: imageUrl,
      redirect_url: editBannerForm.redirect_url,
      service_category_id: editBannerForm.service_category_id,
      is_active: editBannerForm.is_active,
    };

    const response = await fetch(
      `${BASE_URL}/user/admin/banner/?id=${editBannerId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success("Banner Updated Successfully");

      setShowEditModal(false);

      getBannerList();
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error("Something went wrong");
  }
};

 const handleDeleteBanner = async () => {
  const token = sessionStorage.getItem("superadmin_token");
  if(!token){
    toast.error("Session Expired,Please ");
    navigate("/login");
    return;
  }

  if (!SelectedBanner) return;

  try {
    const response = await fetch(
      `${BASE_URL}/user/admin/banner/?id=${SelectedBanner.id}`,
      {
        method: "DELETE",
        headers: {
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
    

    toast.success("Banner deleted successfully 🗑️");

    setDeleteBannerModal(false);
    setSelectedBanner(null);

    getBannerList();
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete admin");
  }
};
  
  return (
    <>
      <div className="page-header">
        <h1>Banner Management</h1>
        <p className="page-paragraph">
          Manage Banner , their details
        </p>
      </div>

      

         <div className="vendors-stats stats2-grid">
                  <div className="stat2-card">
                    <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                      <FaImages size={24} />
                    </div>
                    <div className="stat2-info">
                      <h3>Total Banner</h3>
                      <div className="stat2-value">0</div>
                    </div>
                  </div>
          
                  <div className="stat2-card">
                    <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                      <FaCheckCircle size={24} />
                    </div>
                    <div className="stat2-info">
                      <h3>Active Banner</h3>
                      <div className="stat2-value">0</div>
                    </div>
                  </div>
          
                  <div className="stat2-card">
                    <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                    <FaTimesCircle size={24} />
                    </div>
                    <div className="stat2-info">
                      <h3>Inactive Banner</h3>
                      <div className="stat2-value">0</div>
                    </div>
                 
    </div>
    </div>

    <div className="Question-controls">
              
            
              <div className="filter-controls">
                <button
                  className="add-customer-btn"
                  onClick={() => {
  setBannerImage(null);

  setBannerForm({
    image_url: null,
    redirect_url: "",
    service_category_id: "",
    is_active: false,
  });

  setShowBannerModal(true);
}}
                >
             
                 <BsPlus size={18} />
                  Add Banner
                </button>
      </div>
      </div>

      <div className="table-wrapper">
                                   <table className="data-table" >
                                     <thead>
                                       <tr>
                                         <th>ID</th>
                                         <th> Image </th>    
                                         <th> Status</th>
                                          <th> Action</th>
                                       </tr>
                                     </thead>
                     <tbody>
                       {BannerLoading? (
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
                       ) : BannerData?.length > 0 ? (
                         BannerData.map((item, index) => (
                           <tr key={item.id}>
                             <td>{index + 1}</td>
                     
                      <td>
  <img
    src={item.image_url}
    alt="banner"
    style={{
      width: "80px",
      height: "50px",
      objectFit: "cover",
      borderRadius: "6px",
    }}
    onClick={() => setBannerPreviewImage(item.image_url)}
  />
</td>
                              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={item.is_active}
                
                  />
                  <span className="slider round"></span>
                </label>
              </td>
      
                             <td>
                                       <div className="action-buttons">
           <button
  className="action-btn edit"
  onClick={() => {
    setEditBannerId(item.id);

    setEditBannerForm({
      image_url: item.image_url,
      redirect_url: item.redirect_url || "",
      service_category_id: item.service_category_id,
      is_active: item.is_active,
    });

    setEditBannerImage(null);

    setShowEditModal(true);
  }}
>
  <FaEdit />
</button>
                  <button
                                      className="action-btn delete"
                                      onClick={() => {
                                        setSelectedBanner(item);
                                        setDeleteBannerModal(true);
                                      }}
                                    >
                                    <span className="icon-delete"> <FiTrash2/></span>
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

                 
                                {
                         showBannerModal && (
                            <div className="prakriti-modal-overlay">
                              <div className="prakriti-modal">
                        
                                
                                <div className="prakriti-modal-header">
                                  <h2>Add Banner</h2>
                        
                                  <button
                                    className="close-btn"
                                    onClick={() => {
                                      setShowBannerModal(false);
                                   
                                    }}
                                  >
                                    ✕
                                  </button>
                                </div>
                        
                                
                                <form
                               
                                  className="prakriti-form"
                                  onSubmit={handleAddBanner}
                                >
                        
                              
                                  <div className="form-group">
                                    <label> Select Category</label>
                        
                                    <div className="category-row">
                        
                                      <select
                                        name="service_category_id"
                                        value={bannerForm.service_category_id}
                                        onChange={handleChange}
                                      >
                                        <option value="">
                                          Select Category
                                        </option>
                        
                                        {CategoryData?.map((cat) => (
                                          <option
                                            key={cat.id}
                                            value={cat.id}
                                          >
                                            {cat.name}
                                          </option>
                                        ))}
                                      </select>
                        
                                    
                        
                                    </div>
                        
                                    {BannerError.service_category_id && (
                                      <p className="error-text">
                                        {BannerError.service_category_id}
                                      </p>
                                    )}
                                  </div>
                        
                                
                              
                        
                                 
           
                        
                              
                                
             <div className="form-group">
  <label>Redirect URL</label>
  <input
    type="url"
    name="redirect_url"
    value={bannerForm.redirect_url}
    onChange={handleChange}
    placeholder="https://www.example.com/product/vitamins"
    className="form-control"
  />
</div>   

    
<div className="form-group">

   <div className="upload-box1">
    <input
      type="file"
      accept="image/*"
      id="categoryUpload"
      onChange={(e) => {
        const file = e.target.files[0];

        setBannerImage(file);

        setBannerForm((prev) => ({
          ...prev,
          image_url: file,
        }));
      }}
    />

    {BannerImage ? (
      <div className="banner-preview-wrapper">
        <div className="banner-preview-left">
          <img
            src={URL.createObjectURL(BannerImage)}
            alt="preview"
            className="banner-preview-image"
          />
        </div>

    <div className="banner-preview-actions">
  <button
    type="button"
    className="preview-btn"
    onClick={() =>
      window.open(URL.createObjectURL(BannerImage), "_blank")
    }
  >
    <FiEye />
   
  </button>

  <button
    type="button"
    className="delete-btn-preview"
    onClick={() => {
      setBannerImage(null);

      setBannerForm((prev) => ({
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
</div>
  
                            
                        
                                              
                                  <div className="form-group">
                                    <label>Is Active</label>
                        
                                    <div className="checkbox-row">
                        
                                      <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={bannerForm.is_active}
                                        onChange={handleChange}
                                      />
                        
                                      <span>
                                        {bannerForm.is_active
                                          ? "Active"
                                          : "Inactive"}
                                      </span>
                        
                                    </div>
                                  </div>
                        
                                
                                  <div className="modal-footer">
                        
                                    <button
                                      type="button"
                                      className="cancel-btn"
                                     onClick={() => {
  setShowBannerModal(false);

  setBannerImage(null);

  setBannerForm({
    image_url: null,
    redirect_url: "",
service_category_id: "",
    is_active: false,
  });
}}
                                    >
                                      Cancel
                                    </button>
                        
                                    <button
                                      type="submit"
                                      className="save-btn"
                                    >
                                      Add Banner
                                    </button>
                        
                                  </div>
                        
                                </form>
                              </div>
                            </div>
                          )
                        }   
{
  showEditModal && (
    
    <div className="prakriti-modal-overlay">
      <div className="prakriti-modal">

        <div className="prakriti-modal-header">
          <h2>Edit Banner</h2>

          <button
            className="close-btn"
            onClick={() => setShowEditModal(false)}
          >
            ✕
          </button>
        </div>

        <form
          className="prakriti-form"
          onSubmit={handleUpdateBanner}
        >

       

          <div className="form-group">
            <label>Select Category</label>

            <select
              name="category"
              value={editBannerForm.service_category_id}
              onChange={handleEditChange}
            >
              <option value="">
                Select Category
              </option>

              {CategoryData?.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                >
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Redirect URL */}

          <div className="form-group">
            <label>Redirect URL</label>

            <input
              type="url"
              name="redirect_url"
              value={editBannerForm.redirect_url}
              onChange={handleEditChange}
            />
          </div>

        

        <div className="form-group">
  <label>Banner Image</label>

  <div className="upload-box1">

    <input
      type="file"
      accept="image/*"
      id="editBannerUpload"
      style={{ display: "none" }}
      onChange={(e) => {
        const file = e.target.files[0];

        if (file) {
          setEditBannerImage(file);
        }
      }}
    />

    {(editBannerImage || editBannerForm.image_url) ? (

      <div className="banner-preview-wrapper">

        <div className="banner-preview-left">
          <img
            src={
              editBannerImage
                ? URL.createObjectURL(editBannerImage)
                : editBannerForm.image_url
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
                editBannerImage
                  ? URL.createObjectURL(editBannerImage)
                  : editBannerForm.image_url,
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
              setEditBannerImage(null);

              setEditBannerForm((prev) => ({
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
 
      

         
          <div className="form-group">
            <label>Is Active</label>

            <div className="checkbox-row">
              <input
                type="checkbox"
                name="is_active"
                checked={
                  editBannerForm.is_active
                }
                onChange={handleEditChange}
              />

              <span>
                {editBannerForm.is_active
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>
          </div>

          <div className="modal-footer">

            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                setShowEditModal(false)
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
            >
              Update Banner
            </button>

          </div>

        </form>
      </div>
    </div>
  )
}
              {DeleteBannerModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this Banner?</h3>
            <div className="form-buttons">
              <button
                className="otp-btn verify-btn"
                onClick={handleDeleteBanner}
              >
                Yes
              </button>
              <button onClick={() =>setDeleteBannerModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}


{BannerPreviewImage && (
  <div
    className="prakriti-modal-overlay"
    onClick={() => setBannerPreviewImage("")}
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
          src={BannerPreviewImage}
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
          onClick={() => setBannerPreviewImage("")}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      </>
  )
}

export default Banner