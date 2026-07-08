import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaChartLine, FaCalendarAlt, FaEdit, FaSearch, FaTimes } from 'react-icons/fa';
import { FiTrash2, FiUpload, FiEye } from 'react-icons/fi';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import { BiPlus } from 'react-icons/bi';


const Category = () => {
  const [Loading, setLoading] = useState(true);
  const [Error, setError] = useState(null);
  const [Data, setData] = useState([]);
  const [FilteredData, setFilteredData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [CategoryCode, setCategoryCode] = useState("");
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
  const [previewImage, setPreviewImage] = useState("");
  const [statusModal, setStatusModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });

  const addFileRef = useRef(null);
  const editFileRef = useRef(null);

  
  const calculateStats = (data) => {
    const total = data.length;
    const active = data.filter(item => item.is_active === true).length;
    const inactive = data.filter(item => item.is_active === false).length;
    setStats({ total, active, inactive });
  };

 
  const filterData = (data, search, status) => {
    let filtered = data;

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(term) ||
        item.code?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (status === "active") {
      filtered = filtered.filter(item => item.is_active === true);
    } else if (status === "inactive") {
      filtered = filtered.filter(item => item.is_active === false);
    }

    return filtered;
  };

  const getCategoryList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

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
        setData(data.data);
        calculateStats(data.data);
        setFilteredData(filterData(data.data, searchTerm, statusFilter));
      } else {
        toast.error(data.message || "Failed to get categories");
        setError(data.message || "Failed to fetch categories");
      }

    } catch (error) {
      console.error("Category Fetch Error:", error);
      setError("Something went wrong while fetching data.");
      toast.error("Failed to fetch category data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategoryList();
  }, []);

  useEffect(() => {
    setFilteredData(filterData(Data, searchTerm, statusFilter));
  }, [Data, searchTerm, statusFilter]);

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
        return null;
      }

      const data = await response.json();
      return data?.data?.url;
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Image upload failed");
      return null;
    }
  };

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
    }
  const code = CategoryCode.trim().toUpperCase();

if (!code) {
  newErrors.CategoryCode = "Category Code is required";
} else if (code.length !== 5) {
  newErrors.CategoryCode = "Code must be exactly 5 characters";
} else if (!/^[A-Z]+$/.test(code)) {
  newErrors.CategoryCode = "Only uppercase letters are allowed";
}
    if (!categoryImage) {
      newErrors.categoryImage = "Category image is required";
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
        name: categoryName.trim(),
        image_url: imageUrl,
        is_active: isActive,
        code: CategoryCode.toUpperCase().trim(),
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

      if (response.ok) {
        toast.success("Category added successfully");
        setShowModal(false);
        setCategoryName("");
        setCategoryCode("");
        setCategoryImage(null);
        setIsActive(false);
        setErrors({});
        getCategoryList();
      } else {
        const errorMessage = data?.message || "Failed to add category";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Add Category Error:", error);
      toast.error("Something went wrong");
    } finally {
      setSubmitLoading(false);
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

    if (!editCategoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

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
        name: editCategoryName.trim(),
        image_url: imageUrl,
        is_active: isActive,
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

      if (response.ok) {
        toast.success("Category updated successfully");
        setEditModal(false);
        setEditCategoryName("");
        setEditCategoryImage(null);
        setEditCategoryId(null);
        setExistingImage("");
        getCategoryList();
      } else {
        toast.error(data.message || "Failed to update category");
      }
    } catch (error) {
      console.error("Update Category Error:", error);
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

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || data.success === false) {
        const errorMsg = data?.message || "Failed to delete category";
        toast.error(errorMsg);
        return;
      }

      toast.success("Category deleted successfully");
      setDeleteModal(false);
      getCategoryList();

    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Something went wrong while deleting category");
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

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (response.ok) {
        toast.success(
          !currentStatus ? "Category Activated Successfully" : "Category Deactivated Successfully"
        );
        getCategoryList();
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Status Update Error:", error);
      toast.error("Failed to update status");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <>
      <div className="page-header">
        <h1>Service Category Management</h1>
        <p className="page-paragraph">Manage categories and their details</p>
      </div>

     
      <div className="stats2-grid">
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={24} />
          </div>
          <div className="stat2-info">
            <h3>Total Categories</h3>
            <div className="stat2-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat2-card" style={{ borderTopColor: "#28a745" }}>
          <div className="stat2-icon" style={{ background: "#28a74520", color: "#28a745" }}>
            <FaChartLine size={24} />
          </div>
          <div className="stat2-info">
            <h3>Active</h3>
            <div className="stat2-value">{stats.active}</div>
          </div>
        </div>
        <div className="stat2-card" style={{ borderTopColor: "#dc3545" }}>
          <div className="stat2-icon" style={{ background: "#dc354520", color: "#dc3545" }}>
            <FaCalendarAlt size={24} />
          </div>
          <div className="stat2-info">
            <h3>Inactive</h3>
            <div className="stat2-value">{stats.inactive}</div>
          </div>
        </div>
      </div>

      
      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm("")}>
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="status-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {(searchTerm || statusFilter !== "all") && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        <button
          className="add-customer-btn"
          onClick={() => {
            setShowModal(true);
            setCategoryName("");
            setCategoryCode("");
            setCategoryImage(null);
            setErrors({});
            setIsActive(false);
          }}
        >
        <BiPlus/>
          Add Category
        </button>
      </div>

     
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Category Name</th>
              <th>Code</th>
              <th>Image</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan="7">
                    <div className="skeleton-row"></div>
                  </td>
                </tr>
              ))
            ) : Error ? (
              <tr>
                <td colSpan="7" style={{ color: "red", textAlign: "center" }}>
                  {Error}
                </td>
              </tr>
            ) : FilteredData?.length > 0 ? (
              FilteredData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td><strong>{item.name ||"N/A"}</strong></td>
                
                  <td><span className="category-code-badge">{item.code || "N/A"}</span></td>
             

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
                          setSelectedCategory(item);
                          setStatusModal(true);
                        }}
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td style={{ fontSize: "14px", color: "#666" }}>
                    {new Date(item.created_at).toLocaleDateString()}
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
                    <p>No categories found. Click "Add Category" to create one.</p>
                  )}
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
              <button className="modal-close-btn" onClick={() => {
                setShowModal(false);
                setCategoryName("");
                setCategoryCode("");
                setCategoryImage(null);
                setErrors({});
              }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="prakriti-form">
              <div className="form-group">
                <label>Category Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (e.target.value.trim()) {
                      setErrors((prev) => ({ ...prev, categoryName: "" }));
                    }
                  }}
                  placeholder="Enter category name"
                  className={errors.categoryName ? "error-input" : ""}
                />
                {errors.categoryName && (
                  <p className="error-text">{errors.categoryName}</p>
                )}
              </div>

              <div className="form-group">
                <label>Category Code <span className="required">*</span></label>
               <input
  type="text"
  value={CategoryCode}
  onChange={(e) => {
    let value = e.target.value.toUpperCase();
    value = value.replace(/[^A-Z]/g, "");

    setCategoryCode(value);

    setErrors((prev) => ({
      ...prev,
      CategoryCode: "",
    }));
  }}
  maxLength={5}
  placeholder="Enter category code (max 5 letters)"
  className={errors.CategoryCode ? "error-input" : ""}
/>
                {errors.CategoryCode && (
                  <p className="error-text">{errors.CategoryCode}</p>
                )}
              </div>

              <div className="form-group">
                <label>Category Image <span className="required">*</span></label>
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
                        setErrors((prev) => ({ ...prev, categoryImage: "" }));
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
                          onClick={() => window.open(URL.createObjectURL(categoryImage), "_blank")}
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
                    <label htmlFor="categoryUpload" className="upload-label">
                      <div className="upload-content">
                        <span className="upload-icon">⬆</span>
                        <p>Click to upload category image</p>
                        <span className="upload-hint">PNG, JPG, JPEG (Max 5MB)</span>
                      </div>
                    </label>
                  )}
                </div>
                {errors.categoryImage && (
                  <p className="error-text">{errors.categoryImage}</p>
                )}
              </div>

              <div className="form-group">
                <label>Status</label>
                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Active</span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    setCategoryName("");
                    setCategoryCode("");
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
              <button className="modal-close-btn" onClick={() => setEditModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="prakriti-form">
              <div className="form-group">
                <label>Category Name <span className="required">*</span></label>
                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
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
                          onClick={() => window.open(
                            editCategoryImage
                              ? URL.createObjectURL(editCategoryImage)
                              : existingImage,
                            "_blank"
                          )}
                        >
                          <FiEye />
                        </button>
                        <label htmlFor="editCategoryUpload" className="preview-btn" style={{ cursor: "pointer" }}>
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
                    <label htmlFor="editCategoryUpload" className="upload-label">
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
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Active</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={submitLoading}>
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
        <div className="prakriti-modal-overlay" onClick={() => setPreviewImage("")}>
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Image Preview</h2>
              <button className="modal-close-btn" onClick={() => setPreviewImage("")}>
                <FaTimes />
              </button>
            </div>
            <div style={{ textAlign: "center", padding: "20px" }}>
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
              <button className="cancel-btn" onClick={() => setPreviewImage("")}>
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
      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export default Category;