import React, { useState, useEffect } from 'react';
import { BsPlus } from 'react-icons/bs';
import { FaThLarge, FaCheckCircle, FaTimesCircle,FaEdit } from "react-icons/fa";
import { FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify'
import BASE_URL from "../../../Base";

import { FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';



const YogaCategory = () => {
    const[YogaCategoryData,setYogaCategoryData]=useState([]);
    const[Loading,setLoading]=useState(false);
    const[Error,setError]=useState(null);
    const[PreviewImage,setPreviewImage]=useState("");
    const[ShowYogaModal,setShowYogaModal]=useState(false);
    
    

const navigate = useNavigate();

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

    if (data.success) {
      setYogaCategoryData(data.data);

     

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
},[])

  return (
    <>
    <div className="page-header">
            <h1>Yoga Category</h1>
            <p className="page-paragraph"> Manage Yoga Category details</p>
          </div>

            <div className="filter-category">
                    <button
                      className="add-customer-btn"
                        
                    
                    >
                     <BsPlus/>
                      Add Yoga category
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
                                      
                                             
                                              <td>{item.name}</td>
                                      
                                             
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
                                        
                                        />
                                        <span className="slider round"></span>
                                      </label>
                                    </td>
                            
                                      
                                            
                                            
                                              
                                              <td>
                                                        <div className="action-buttons">
                                      
                                                       <button
                              className="action-btn edit"
                         
                            >
                              <FaEdit />
                            </button>
                                      
                                                       <button
                              className="action-btn delete"
                             
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
             {/* {showModal && (
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
                                                  
                                                  
                                                  )} */}
    </>
                                                 
  )
}

export default YogaCategory