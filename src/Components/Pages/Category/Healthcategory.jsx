import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { BiPlus } from 'react-icons/bi';
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
  const [HealthCategoryData, setHealthCategoryData] = useState([]);
  const [FilteredData, setFilteredData] = useState([]);
  const [HealthLoading, setHealthLoading] = useState(false);
  const [HealthError, setHealthError] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [categoryId, setCategoryId] = useState(null);
  const [ServiceCategoryData, setServiceCategoryData] = useState([]);
  const [ServiceCategoryLoading, setServiceCategoryLoading] = useState(false);
  const [ServiceCategoryError, setServiceCategoryError] = useState(null);
  const [SubCategoryImage, setSubCategoryImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [EditImage, setEditImage] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [previewImage, setPreviewImage] = useState("");
  const [statusModal, setStatusModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fileInputRef = useRef(null);
  const editFileRef = useRef(null);
  const navigate = useNavigate();

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    is_active: false,
    service_category_id: "",
    image_url: "",
    code: "",
  });

  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    description: "",
    image_url: "",
    service_category_id: "",
    is_active: false,
  });

  const [editErrors, setEditErrors] = useState({});
  const [addErrors, setAddErrors] = useState({});

  // Calculate statistics
  const calculateStats = (data) => {
    const total = data.length;
    const active = data.filter((item) => item.is_active === true).length;
    const inactive = data.filter((item) => item.is_active === false).length;
    setStats({ total, active, inactive });
  };

  // Filter data based on search and status
  const filterData = (data, search, status) => {
    let filtered = data;

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.code?.toLowerCase().includes(term) ||
          item.service_category_name?.toLowerCase().includes(term)
      );
    }

    if (status === "active") {
      filtered = filtered.filter((item) => item.is_active === true);
    } else if (status === "inactive") {
      filtered = filtered.filter((item) => item.is_active === false);
    }

    return filtered;
  };

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

   const code = categoryForm.code.trim();

if (!code) {
  newErrors.code = "Please enter category code";
} else if (!/^[A-Z]{5}$/.test(code)) {
  newErrors.code = "Code must be exactly 5 uppercase letters (A-Z)";
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

  const resetForm = () => {
    setCategoryForm({
      name: "",
      description: "",
      is_active: false,
      service_category_id: "",
      image_url: "",
      code: "",
    });
    setSubCategoryImage(null);
    setAddErrors({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpdateHealthCategory = async (e) => {
    e.preventDefault();

    if (isUpdating) return;

    let newErrors = {};

    if (!editForm.name.trim()) {
      newErrors.name = "Health category name is required";
    }

    if (!editForm.service_category_id) {
      newErrors.service_category_id = "Please select a service category";
    }

    setEditErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((msg) => toast.error(msg));
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");
    setIsUpdating(true);

    try {
      let imageUrl = editForm.image_url;

      if (EditImage) {
        imageUrl = await uploadImage(EditImage);
        if (!imageUrl) {
          toast.error("Image upload failed");
          return;
        }
      }

      const payload = {
        name: editForm.name.trim(),
        description: editForm.description,
        image_url: imageUrl,
        is_active: editForm.is_active,
        service_category_id: editForm.service_category_id,
      };

      const response = await fetch(
        `${BASE_URL}/user/admin/health-category/?id=${editForm.id}`,
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
        toast.success("Health Category Updated Successfully");
        setEditModal(false);
        setEditImage(null);
        getHealthCategoryList();
      } else {
        toast.error(data?.message || "Failed to update category");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id) => {
    if (isDeleting) return;

    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/health-category/?id=${id}`,
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

      toast.success("Category deleted successfully");
      setDeleteModal(false);
      getHealthCategoryList();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };


const handleUpdateCategory = async (e) => {
  e.preventDefault();
  if(isUpdating)return;

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
          image_url: imageUrl,
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
        <h1>Health Category</h1>
        <p className="page-paragraph">Manage health categories and their details</p>
      </div>

      {/* Stats Cards */}
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
            resetForm();
            setShowCategoryModal(true);
          }}
        >
          <BiPlus/>
          Add Health Category
        </button>
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
    value = value.replace(/[^A-Z]/g, "").slice(0, 5);

    setCategoryForm((prev) => ({
      ...prev,
      code: value,
    }));

    setAddErrors((prev) => ({
      ...prev,
      code: "",
    }));
  }}
  placeholder="Enter 5-letter category code"
  maxLength={5}
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
                {addErrors.image_url && <p className="error-text">{addErrors.image_url}</p>}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={categoryForm.description}
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
                    checked={categoryForm.is_active}
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
                    setShowCategoryModal(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Health Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => setEditModal(false)}
        >
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Edit Health Category</h2>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setEditModal(false);
                  setEditImage(null);
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form className="prakriti-form" onSubmit={handleUpdateHealthCategory}>
              <div className="form-group">
                <label>Service Category <span className="required">*</span></label>
                <select
                  name="service_category_id"
                  value={editForm.service_category_id}
                  onChange={handleEditChange}
                  className={editErrors.service_category_id ? "error-input" : ""}
                >
                  <option value="">Select Service Category</option>
                  {ServiceCategoryData?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>
                {editErrors.service_category_id && (
                  <p className="error-text">{editErrors.service_category_id}</p>
                )}
              </div>

              <div className="form-group">
                <label>Health Category Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Enter health category name"
                  className={editErrors.name ? "error-input" : ""}
                />
                {editErrors.name && <p className="error-text">{editErrors.name}</p>}
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
                <label>Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
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
                    checked={editForm.is_active}
                    onChange={handleEditChange}
                  />
                  <span>Active</span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditModal(false);
                    setEditImage(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to delete this category?</h3>
            <p className="modal-warning">This action cannot be undone.</p>
            <div className="form-buttons">
              <button
                className="btn-danger"
                disabled={isDeleting}
                onClick={() => {
                  handleDelete(categoryId);
                }}
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setDeleteModal(false);
                  setCategoryId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusModal && selectedCategory && (
        <div
          className="modal-overlay"
          onClick={() => {
            setStatusModal(false);
            setSelectedCategory(null);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Status Change</h3>
            <p>
              Are you sure you want to <strong>{selectedCategory.is_active ? "deactivate" : "activate"}</strong>{" "}
              "{selectedCategory.name}"?
            </p>
            <div className="form-buttons">
              <button
                className={`btn-${selectedCategory.is_active ? "danger" : "success"}`}
                disabled={isStatusChanging}
                onClick={() => {
                  handleToggle(selectedCategory.id, selectedCategory.is_active);
                  setStatusModal(false);
                  setSelectedCategory(null);
                }}
              >
                {isStatusChanging
                  ? "Updating..."
                  : `Yes, ${selectedCategory.is_active ? "Deactivate" : "Activate"}`}
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setStatusModal(false);
                  setSelectedCategory(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Image Modal */}
      {previewImage && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => setPreviewImage("")}
        >
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Image Preview</h2>
              <button
                className="modal-close-btn"
                onClick={() => setPreviewImage("")}
              >
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
    </>
  );
};

export default Healthcategory;