import React, { useState, useEffect, useRef } from "react";
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
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import { BiPlus } from "react-icons/bi";

const ProductCategory = () => {
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
  const [productCategoryStatusModal, setProductCategoryStatusModal] = useState(false);
  const [ProductPreviewImage, setProductPreviewImage] = useState("");
  const [selectedProductCategory, setSelectedProductCategory] = useState(null);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [IsUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    is_active: false,
    service_category_id: "",
    image_url: "",
    code: "",
  });

  const [editModal, setEditModal] = useState(false);
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
  const fileInputRef = useRef(null);
  const editFileRef = useRef(null);
  const navigate = useNavigate();

  // Calculate statistics
  const calculateStats = (data) => {
    const total = data.length;
    const active = data.filter((item) => item.is_active === true).length;
    const inactive = data.filter((item) => item.is_active === false).length;
    setStats({ total, active, inactive });
  };

 
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

  const AddProductCategory = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    let newErrors = {};

    if (!categoryForm.service_category_id) {
      newErrors.service_category_id = "Please select a service category";
    }

    if (!categoryForm.name.trim()) {
      newErrors.name = "Product category name is required";
    }

    if (!SubCategoryImage) {
      newErrors.image_url = "Please upload an image";
    }

    const code = categoryForm.code.trim();

if (!code) {
  newErrors.code = "Please enter product category code";
} else if (code.length !== 5) {
  newErrors.code = "Code must be exactly 5 characters";
} else if (!/^[A-Z]{5}$/.test(code)) {
  newErrors.code = "Code must contain only uppercase letters";
}

    setAddErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((msg) => toast.error(msg));
      setIsSubmitting(false);
      return;
    }

    try {
      setIsSubmitting(true);
      let imageUrl = "";

      if (SubCategoryImage) {
        imageUrl = await uploadImage(SubCategoryImage);
        if (!imageUrl) {
          toast.error("Image upload failed");
          return;
        }
      }

      const payload = {
        ...categoryForm,
        image_url: imageUrl,
        code: categoryForm.code.toUpperCase().trim(),
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
        resetForm();
        getProductCategoryList();
      }  else {
  let apiErrors = {};

  if (data.errors) {
    if (data.errors.name) {
      apiErrors.categoryName = data.errors.name[0];
    }

    if (data.errors.code) {
      apiErrors.CategoryCode = data.errors.code[0];
    }

    if (data.errors.image_url) {
      apiErrors.categoryImage = data.errors.image_url[0];
    }

    setEditErrors(apiErrors);

    Object.values(apiErrors).forEach((msg) => toast.error(msg));
  } else {
    toast.error(data.message || "Failed to update category");
  }
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

      toast.success("Category deleted successfully");
      setDeleteModal(false);
      getProductCategoryList();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while deleting");
    } finally {
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

    setHealthLoading(true);

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

      if (data.success) {
        setHealthCategoryData(data.data);
        calculateStats(data.data);
        setFilteredData(filterData(data.data, searchTerm, statusFilter));
      } else {
        toast.error(data.message || "Failed to fetch categories");
        setHealthError(data.message || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Product Category Fetch Error:", err);
      setHealthError("Something went wrong while fetching categories.");
      toast.error("Failed to fetch product categories");
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    getProductCategoryList();
  }, []);

  useEffect(() => {
    setFilteredData(filterData(HealthCategoryData, searchTerm, statusFilter));
  }, [HealthCategoryData, searchTerm, statusFilter]);

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

  useEffect(() => {
    getCategoryList();
  }, []);

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
    if (IsUpdating) return;

    let newErrors = {};

if (!editForm.service_category_id) {
  newErrors.service_category_id = "Please select a service category";
}

if (!editForm.name.trim()) {
  newErrors.name = "Product category name is required";
}

if (!editForm.image_url && !EditImage) {
  newErrors.image_url = "Please upload an image";
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
            service_category_id: editForm.service_category_id,
            image_url: imageUrl,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Product Category Updated Successfully");
        setEditModal(false);
        setEditImage(null);
        getProductCategoryList();
      }  else {
  let apiErrors = {};

  if (data.errors) {
    if (data.errors.name) {
      apiErrors.categoryName = data.errors.name[0];
    }

    if (data.errors.code) {
      apiErrors.CategoryCode = data.errors.code[0];
    }

    if (data.errors.image_url) {
      apiErrors.categoryImage = data.errors.image_url[0];
    }

    setEditErrors(apiErrors);

    Object.values(apiErrors).forEach((msg) => toast.error(msg));
  } else {
    toast.error(data.message || "Failed to update category");
  }
}
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <>
      <div className="page-header">
        <h1>Product Category</h1>
        <p className="page-paragraph">Manage product categories and their details</p>
      </div>

      {/* Stats Cards */}
      <div className="stats2-grid">
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={16} />
          </div>
          <div className="stat2-info">
            <h3>Total Categories</h3>
            <div className="stat2-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat2-card" style={{ borderTopColor: "#28a745" }}>
          <div className="stat2-icon" style={{ background: "#28a74520", color: "#28a745" }}>
            <FaChartLine size={16} />
          </div>
          <div className="stat2-info">
            <h3>Active</h3>
            <div className="stat2-value">{stats.active}</div>
          </div>
        </div>
        <div className="stat2-card" style={{ borderTopColor: "#dc3545" }}>
          <div className="stat2-icon" style={{ background: "#dc354520", color: "#dc3545" }}>
            <FaCalendarAlt size={16} />
          </div>
          <div className="stat2-info">
            <h3>Inactive</h3>
            <div className="stat2-value">{stats.inactive}</div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, code or service category..."
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
          Add Product Category
        </button>
      </div>

      {/* Table */}
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
                        width="30"
                        height="30"
                        style={{
                          objectFit: "cover",
                          borderRadius: "6px",
                          cursor: "pointer",
                          border: "1px solid #e0e0e0",
                        }}
                        onClick={() => setProductPreviewImage(item.image_url)}
                      />
                    ) : (
                      <span style={{ color: "#999", fontSize: "12px" }}>No image</span>
                    )}
                  </td>
                  <td>
                    {/* <span className={`status-badge ${item.is_active ? "status-active" : "status-inactive"}`}>
                      {item.is_active ? "Active" : "Inactive"}
                    </span> */}
                    <br />
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
                            service_category_id: item.service_category_id || "",
                            name: item.name || "",
                            description: item.description || "",
                            image_url: item.image_url || "",
                            is_active: item.is_active,
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
                    <p>No product categories found. Click "Add Product Category" to create one.</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

     
      {showCategoryModal && (
        <div className="prakriti-modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Add Product Category</h2>
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

            <form className="prakriti-form" onSubmit={AddProductCategory}>
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
                <label>Product Category Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryChange}
                  placeholder="Enter product category name"
                  className={addErrors.name ? "error-input" : ""}
                />
                {addErrors.name && <p className="error-text">{addErrors.name}</p>}
              </div>
<div className="form-group">
  <label>
    Product Category Code <span className="required">*</span>
  </label>

  <input
    type="text"
    name="code"
    value={categoryForm.code}
    onChange={(e) => {
      const input = e.target.value.toUpperCase();

      // Show toast if invalid character is entered
      if (/[^A-Z]/.test(input)) {
        toast.error("Only uppercase letters (A-Z) are allowed");
        return;
      }

      setCategoryForm((prev) => ({
        ...prev,
        code: input.slice(0, 5),
      }));

      setAddErrors((prev) => ({
        ...prev,
        code: "",
      }));
    }}
    placeholder="Enter category code (A-Z, max 5 characters)"
    maxLength={5}
    className={addErrors.code ? "error-input" : ""}
  />

  {addErrors.code && (
    <p className="error-text">{addErrors.code}</p>
  )}
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
                          onClick={() => window.open(URL.createObjectURL(SubCategoryImage), "_blank")}
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
                        <span className="upload-hint">PNG, JPG, JPEG </span>
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
                  {isSubmitting ? "Adding..." : "Add Product Category"}
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
              <h2>Edit Product Category</h2>
              <button className="modal-close-btn" onClick={() => setEditModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form className="prakriti-form" onSubmit={handleUpdateCategory}>
              <div className="form-group">
                <label>Service Category <span className="required">*</span></label>
                <select
                  name="service_category_id"
                  value={editForm.service_category_id}
                  onChange={handleEditChange}
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
                <label>Product Category Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Enter category name"
                  className={editErrors.name ? "error-input" : ""}
                />
                {editErrors.name && <p className="error-text">{editErrors.name}</p>}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
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
                {editErrors.image_url && (
  <p className="error-text">{editErrors.image_url}</p>
)}
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

      {/* Status Change Modal */}
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
        <div className="prakriti-modal-overlay" onClick={() => setProductPreviewImage("")}>
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Image Preview</h2>
              <button className="modal-close-btn" onClick={() => setProductPreviewImage("")}>
                <FaTimes />
              </button>
            </div>
            <div style={{ textAlign: "center", padding: "20px" }}>
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
              <button className="cancel-btn" onClick={() => setProductPreviewImage("")}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

         <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export default ProductCategory;