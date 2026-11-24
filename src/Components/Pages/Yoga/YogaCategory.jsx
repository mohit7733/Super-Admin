
import React, { useState, useEffect, useRef } from "react";
import {
  FaThLarge,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import { FiTrash2, FiEye, FiUpload, FiSearch } from "react-icons/fi";
import { BiPlus } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";

const YogaCategory = () => {
  const navigate = useNavigate();

  // ================= STATES =================

  const [YogaCategoryData, setYogaCategoryData] = useState([]);
  const [ServiceData, setServiceData] = useState([]);

  const [Loading, setLoading] = useState(false);
  const [ServiceLoading, setServiceLoading] = useState(false);
  const [Error, setError] = useState(null);

  const [PreviewImage, setPreviewImage] = useState("");

  const [ShowYogaCategoryModal, setShowYogaCategoryModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const [YogaCategoryImage, setYogaCategoryImage] = useState(null);
  const [EditImage, setEditImage] = useState(null);

  const [AddError, setAddError] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [IsUpdating, setIsUpdating] = useState(false);

  const [SelectedYogaCategory, setSelectedYogacategory] = useState(null);
  const [YogaCategoryId, setYogaCategoryId] = useState("");

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dynamic statistics
  const [categoryStats, setCategoryStats] = useState({
    total_categories: 0,
    active_categories: 0,
    inactive_categories: 0,
  });

  // Forms
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
    code: "",
  });

  const fileInputRef = useRef(null);
  const editFileRef = useRef(null);

  // ================= RESET ADD FORM =================

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

  // ================= RESET EDIT FORM =================

  const resetEditForm = () => {
    setEditYogaForm({
      id: "",
      name: "",
      description: "",
      image_url: "",
      service_category_id: "",
      is_active: false,
      code: "",
    });

    setEditImage(null);
    setEditErrors({});

    if (editFileRef.current) {
      editFileRef.current.value = "";
    }
  };

  // ================= ADD FORM CHANGE =================

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

  // ================= EDIT FORM CHANGE =================

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

  // ================= CODE CHANGE =================

  const handleAddCodeChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 5);

    setYogaCategoryForm((prev) => ({
      ...prev,
      code: value,
    }));

    setAddError((prev) => ({
      ...prev,
      code: "",
    }));
  };

  const handleEditCodeChange = (e) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 5);

    setEditYogaForm((prev) => ({
      ...prev,
      code: value,
    }));

    setEditErrors((prev) => ({
      ...prev,
      code: "",
    }));
  };

  // ================= API ERROR HANDLER =================

  const handleApiErrors = (errors, setErrors) => {
    if (!errors || typeof errors !== "object") return false;

    const fieldErrors = {};

    Object.entries(errors).forEach(([field, messages]) => {
      const message = Array.isArray(messages)
        ? messages.join(", ")
        : String(messages);

      fieldErrors[field] = Array.isArray(messages)
        ? messages[0]
        : messages;

      toast.error(`${field}: ${message}`);
    });

    setErrors((prev) => ({
      ...prev,
      ...fieldErrors,
    }));

    return true;
  };

  // ================= GET SERVICE CATEGORIES =================

  const getCategoryList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setServiceLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/service-category/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
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

      if (response.ok && data.success) {
        setServiceData(data.data || []);
      } else {
        toast.error(data.message || "Failed to fetch service categories");
      }
    } catch (error) {
      console.error("Service Category Error:", error);
      toast.error("Failed to fetch service categories");
    } finally {
      setServiceLoading(false);
    }
  };

  // ================= GET YOGA CATEGORIES =================

  const getYogaCategoryList = async () => {
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
        `${BASE_URL}/yoga/admin/categories/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
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

      if (response.ok && data.status === "success") {
        setYogaCategoryData(data.data || []);

        const categories = data.data || [];
        const activeCount = categories.filter(
          (item) => item.is_active === true
        ).length;

        setCategoryStats({
          total_categories:
            data.stats?.total_categories ?? data.count ?? categories.length,
          active_categories:
            data.stats?.active_categories ?? activeCount,
          inactive_categories:
            data.stats?.inactive_categories ??
            categories.length - activeCount,
        });
      } else {
        setError(data.message || "Failed to fetch categories");
        toast.error(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Yoga Category Error:", error);
      setError("Something went wrong while fetching data.");
      toast.error("Failed to fetch yoga category data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getYogaCategoryList();
    getCategoryList();
  }, []);

  // ================= IMAGE UPLOAD =================

  const uploadImage = async (file) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
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
          "ngrok-skip-browser-warning": "true",
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

      if (!response.ok || !data?.data?.url) {
        toast.error(data?.message || "Image upload failed");
        return null;
      }

      return data.data.url;
    } catch (error) {
      console.error("Image Upload Error:", error);
      toast.error("Image upload failed");
      return null;
    }
  };

  // ================= ADD YOGA CATEGORY =================

  const AddYogaCategory = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const newErrors = {};

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
    } else if (!/^[A-Z]{5}$/.test(code)) {
      newErrors.code = "Code must contain exactly 5 uppercase letters";
    }

    setAddError(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((msg) => toast.error(msg));
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrl = await uploadImage(YogaCategoryImage);

      if (!imageUrl) return;

      const payload = {
        name: YogaCategoryForm.name.trim(),
        description: YogaCategoryForm.description,
        is_active: YogaCategoryForm.is_active,
        service_category_id: YogaCategoryForm.service_category_id,
        image_url: imageUrl,
        code,
      };

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

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (response.ok && data.status !== "error" && data.success !== false) {
        toast.success("Yoga Category Added Successfully");

        setShowYogaCategoryModal(false);
        resetForm();
        getYogaCategoryList();
      } else {
        const hasFieldErrors = handleApiErrors(
          data?.errors,
          setAddError
        );

        if (!hasFieldErrors) {
          toast.error(data?.message || "Failed to add yoga category");
        }
      }
    } catch (error) {
      console.error("Add Category Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= OPEN EDIT MODAL =================

  const openEditModal = (item) => {
    setEditYogaForm({
      id: item.id,
      name: item.name || "",
      description: item.description || "",
      image_url: item.image_url || "",
      service_category_id: item.service_category_id || "",
      is_active: item.is_active ?? false,
      code: item.code || "",
    });

    setEditImage(null);
    setEditErrors({});
    setEditModal(true);
  };

  // ================= UPDATE YOGA CATEGORY =================

  const handleYogaUpdateCategory = async (e) => {
    e.preventDefault();

    if (IsUpdating) return;

    const newErrors = {};

    if (!editYogaForm.name.trim()) {
      newErrors.name = "Yoga category name is required";
    }

    if (!editYogaForm.service_category_id) {
      newErrors.service_category_id = "Please select service category";
    }

    const code = editYogaForm.code.trim();

    if (!code) {
      newErrors.code = "Please enter yoga category code";
    } else if (!/^[A-Z]{5}$/.test(code)) {
      newErrors.code = "Code must contain exactly 5 uppercase letters";
    }

    setEditErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((msg) => toast.error(msg));
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setIsUpdating(true);

    try {
      // Keep existing image if no new image is selected
      let imageUrl = editYogaForm.image_url;

      if (EditImage) {
        imageUrl = await uploadImage(EditImage);

        if (!imageUrl) return;
      }

      const payload = {
        name: editYogaForm.name.trim(),
        description: editYogaForm.description,
        is_active: editYogaForm.is_active,
        service_category_id: editYogaForm.service_category_id,
        image_url: imageUrl,
        code,
      };

      const response = await fetch(
        `${BASE_URL}/yoga/admin/categories/?id=${editYogaForm.id}`,
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

      if (response.ok && data.status !== "error" && data.success !== false) {
        toast.success("Yoga Category Updated Successfully");

        setEditModal(false);
        resetEditForm();

        getYogaCategoryList();
      } else {
        const hasFieldErrors = handleApiErrors(
          data?.errors,
          setEditErrors
        );

        if (!hasFieldErrors) {
          toast.error(data?.message || "Failed to update yoga category");
        }
      }
    } catch (error) {
      console.error("Update Category Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  // ================= STATUS UPDATE =================

  const updateCategoryStatus = async (id, currentStatus) => {
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

      if (response.ok && data.success !== false && data.status !== "error") {
        toast.success(
          !currentStatus
            ? "Yoga Category Activated Successfully"
            : "Yoga Category Deactivated Successfully"
        );

        getYogaCategoryList();
      } else {
        toast.error(data.message || "Failed to update category status");
      }
    } catch (error) {
      console.error("Status Update Error:", error);
      toast.error("Failed to update yoga category status");
    }
  };

  // ================= DELETE CATEGORY =================

  const handleDelete = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/yoga/admin/categories/?id=${YogaCategoryId}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
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

      if (!response.ok || data.success === false || data.status === "error") {
        toast.error(data?.message || "Failed to delete yoga category");
        return;
      }

      toast.success("Yoga Category Deleted Successfully");

      setDeleteModal(false);
      setYogaCategoryId("");

      getYogaCategoryList();
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Something went wrong while deleting category");
    }
  };

  // ================= SEARCH AND FILTER =================

  const filteredYogaCategories = YogaCategoryData.filter((item) => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch =
      !search ||
      item.name?.toLowerCase().includes(search) ||
      item.code?.toLowerCase().includes(search) ||
      item.service_category_name?.toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && Boolean(item.is_active)) ||
      (statusFilter === "inactive" && !Boolean(item.is_active));

    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const isFilterApplied =
    searchTerm.trim() !== "" || statusFilter !== "all";

  // ================= IMAGE PREVIEW URL =================

  const addPreviewUrl = YogaCategoryImage
    ? URL.createObjectURL(YogaCategoryImage)
    : "";

  const editPreviewUrl = EditImage
    ? URL.createObjectURL(EditImage)
    : editYogaForm.image_url;

  // ================= JSX =================

  return (
    <>
      {/* PAGE HEADER */}

      <div className="page-header">
        <h1>Yoga Category Management</h1>
        <p className="page-paragraph">
          Manage Yoga Category details
        </p>
      </div>

      {/* SEARCH AND FILTER */}

      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FiSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
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
            <button
              type="button"
              className="clear-filters-btn"
              onClick={clearFilters}
              title="Clear filters"
            >
              <FiTrash2 />
            </button>
          )}
        </div>

        <div className="category-action-buttons">
          <button
            type="button"
            className="add-customer-btn"
            onClick={() => {
              resetForm();
              setShowYogaCategoryModal(true);
            }}
          >
            <BiPlus />
            Add Yoga Category
          </button>
        </div>
      </div>

      {/* DYNAMIC STATS */}

      <div className="vendors-stats stats2-grid">

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaThLarge size={12} />
          </div>

          <div className="stat2-info">
            <h3>Total Category</h3>
            <div className="stat2-value">
              {categoryStats.total_categories}
            </div>
          </div>
        </div>

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaCheckCircle size={12} />
          </div>

          <div className="stat2-info">
            <h3>Active Category</h3>
            <div className="stat2-value">
              {categoryStats.active_categories}
            </div>
          </div>
        </div>

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#ffebeb",
              color: "#d32f2f",
            }}
          >
            <FaTimesCircle size={12} />
          </div>

          <div className="stat2-info">
            <h3>Inactive Category</h3>
            <div className="stat2-value">
              {categoryStats.inactive_categories}
            </div>
          </div>
        </div>

      </div>

      {/* CATEGORY TABLE */}

      <div className="table-wrapper">
        <table className="data-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Yoga Category</th>
              <th>Service Category</th>
              <th>Code</th>
              <th>Image</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {Loading ? (
              Array(3)
                .fill(0)
                .map((_, index) => (
                  <tr key={index}>
                    <td colSpan="7">
                      <div className="skeleton-row"></div>
                    </td>
                  </tr>
                ))
            ) : Error ? (
              <tr>
                <td
                  colSpan="7"
                  style={{ color: "red", textAlign: "center" }}
                >
                  {Error}
                </td>
              </tr>
            ) : filteredYogaCategories.length > 0 ? (
              filteredYogaCategories.map((item, index) => (
                <tr key={item.id}>

                  <td>{index + 1}</td>

                  <td>
                    <strong>{item.name}</strong>

                    {item.description && (
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          marginTop: "2px",
                        }}
                      >
                        {item.description.substring(0, 30)}
                        {item.description.length > 30 && "..."}
                      </div>
                    )}
                  </td>

                  <td>{item.service_category_name || "N/A"}</td>

                  <td>
                    <span className="category-code-badge">
                      {item.code || "N/A"}
                    </span>
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
                      <span
                        style={{
                          color: "#999",
                          fontSize: "12px",
                        }}
                      >
                        No image
                      </span>
                    )}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        item.is_active
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {item.is_active ? "Active" : "Inactive"}
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
                        type="button"
                        className="action-btn edit"
                        onClick={() => openEditModal(item)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>

                      <button
                        type="button"
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
                <td
                  colSpan="7"
                  style={{
                    textAlign: "center",
                    padding: "25px",
                  }}
                >
                  {isFilterApplied
                    ? "No matching yoga categories found"
                    : "No yoga categories found"}
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      {/* ADD CATEGORY MODAL */}

      {ShowYogaCategoryModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => {
            setShowYogaCategoryModal(false);
            resetForm();
          }}
        >
          <div
            className="prakriti-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="prakriti-modal-header">
              <h2>Add Yoga Category</h2>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setShowYogaCategoryModal(false);
                  resetForm();
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form
              className="prakriti-form"
              onSubmit={AddYogaCategory}
            >

              {/* SERVICE CATEGORY */}

              <div className="form-group">
                <label>
                  Service Category <span className="required">*</span>
                </label>

                <select
                  name="service_category_id"
                  value={YogaCategoryForm.service_category_id}
                  onChange={handleCategoryChange}
                  className={
                    AddError.service_category_id ? "error-input" : ""
                  }
                >
                  <option value="">Select Service Category</option>

                  {ServiceData.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>

                {AddError.service_category_id && (
                  <p className="error-text">
                    {AddError.service_category_id}
                  </p>
                )}
              </div>

              {/* CATEGORY NAME */}

              <div className="form-group">
                <label>
                  Yoga Category Name <span className="required">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={YogaCategoryForm.name}
                  onChange={handleCategoryChange}
                  placeholder="Enter yoga category name"
                  className={AddError.name ? "error-input" : ""}
                />

                {AddError.name && (
                  <p className="error-text">{AddError.name}</p>
                )}
              </div>

              {/* CATEGORY CODE */}

              <div className="form-group">
                <label>
                  Yoga Category Code <span className="required">*</span>
                </label>

                <input
                  type="text"
                  name="code"
                  value={YogaCategoryForm.code}
                  onChange={handleAddCodeChange}
                  placeholder="Enter exactly 5 uppercase letters"
                  maxLength={5}
                  className={AddError.code ? "error-input" : ""}
                />

                {AddError.code && (
                  <p className="error-text">{AddError.code}</p>
                )}

                <small>
                  {YogaCategoryForm.code.length}/5 characters
                </small>
              </div>

              {/* IMAGE UPLOAD */}

              <div className="form-group">
                <label>
                  Upload Image <span className="required">*</span>
                </label>

                <div className="upload-box1">

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    id="categoryUpload"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];

                      if (file) {
                        if (!file.type.startsWith("image/")) {
                          toast.error("Please select a valid image");
                          e.target.value = "";
                          return;
                        }

                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("Image size should not exceed 5MB");
                          e.target.value = "";
                          return;
                        }

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
                          src={addPreviewUrl}
                          alt="preview"
                          className="banner-preview-image"
                        />
                      </div>

                      <div className="banner-preview-actions">

                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() =>
                            window.open(addPreviewUrl, "_blank")
                          }
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
                    <label
                      htmlFor="categoryUpload"
                      className="upload-label"
                    >
                      <div className="upload-content">
                        <span className="upload-icon">⬆</span>
                        <p>Click to upload category image</p>
                        <span className="upload-hint">
                          PNG, JPG, JPEG (Max 5MB)
                        </span>
                      </div>
                    </label>
                  )}

                </div>

                {AddError.image_url && (
                  <p className="error-text">{AddError.image_url}</p>
                )}
              </div>

              {/* DESCRIPTION */}

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

              {/* STATUS */}

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

              {/* FOOTER */}

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

                <button
                  type="submit"
                  className="save-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Yoga Category"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT CATEGORY MODAL */}

      {editModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => {
            setEditModal(false);
            resetEditForm();
          }}
        >
          <div
            className="prakriti-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="prakriti-modal-header">
              <h2>Edit Yoga Category</h2>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setEditModal(false);
                  resetEditForm();
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form
              className="prakriti-form"
              onSubmit={handleYogaUpdateCategory}
            >

              {/* SERVICE CATEGORY */}

              <div className="form-group">
                <label>
                  Service Category <span className="required">*</span>
                </label>

                <select
                  name="service_category_id"
                  value={editYogaForm.service_category_id}
                  onChange={handleEditChange}
                  className={
                    editErrors.service_category_id ? "error-input" : ""
                  }
                >
                  <option value="">Select Service Category</option>

                  {ServiceData.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>

                {editErrors.service_category_id && (
                  <p className="error-text">
                    {editErrors.service_category_id}
                  </p>
                )}
              </div>

              {/* CATEGORY NAME */}

              <div className="form-group">
                <label>
                  Yoga Category Name <span className="required">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={editYogaForm.name}
                  onChange={handleEditChange}
                  placeholder="Enter category name"
                  className={editErrors.name ? "error-input" : ""}
                />

                {editErrors.name && (
                  <p className="error-text">{editErrors.name}</p>
                )}
              </div>

              {/* CATEGORY CODE */}

              <div className="form-group">
                <label>
                  Yoga Category Code <span className="required">*</span>
                </label>

                <input
                  type="text"
                  name="code"
                  value={editYogaForm.code}
                  onChange={handleEditCodeChange}
                  placeholder="Enter exactly 5 uppercase letters"
                  maxLength={5}
                  className={editErrors.code ? "error-input" : ""}
                />

                {editErrors.code && (
                  <p className="error-text">{editErrors.code}</p>
                )}

                <small>
                  {editYogaForm.code.length}/5 characters
                </small>
              </div>

              {/* DESCRIPTION */}

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

              {/* IMAGE */}

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
                        if (!file.type.startsWith("image/")) {
                          toast.error("Please select a valid image");
                          e.target.value = "";
                          return;
                        }

                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("Image size should not exceed 5MB");
                          e.target.value = "";
                          return;
                        }

                        setEditImage(file);
                      }
                    }}
                  />

                  {editPreviewUrl ? (
                    <div className="banner-preview-wrapper">

                      <div className="banner-preview-left">
                        <img
                          src={editPreviewUrl}
                          alt="preview"
                          className="banner-preview-image"
                        />
                      </div>

                      <div className="banner-preview-actions">

                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() =>
                            window.open(editPreviewUrl, "_blank")
                          }
                        >
                          <FiEye />
                        </button>

                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() => editFileRef.current?.click()}
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
                    <label
                      htmlFor="editBannerUpload"
                      className="upload-label"
                    >
                      <div className="upload-content">
                        <span className="upload-icon">⬆</span>
                        <p>Click to upload category image</p>
                        <span className="upload-hint">
                          PNG, JPG, JPEG (Max 5MB)
                        </span>
                      </div>
                    </label>
                  )}

                </div>
              </div>

              {/* STATUS */}

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

              {/* FOOTER */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditModal(false);
                    resetEditForm();
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={IsUpdating}
                >
                  {IsUpdating ? "Updating..." : "Update Category"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* STATUS CONFIRMATION MODAL */}

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
              type="button"
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
                type="button"
                className="activeModal-cancel"
                onClick={() => {
                  setStatusModal(false);
                  setSelectedYogacategory(null);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className={`activeModal-confirm ${
                  SelectedYogaCategory.is_active
                    ? "deactivate-btn"
                    : "activate-btn"
                }`}
                onClick={() => {
                  const selected = SelectedYogaCategory;

                  setStatusModal(false);
                  setSelectedYogacategory(null);

                  updateCategoryStatus(
                    selected.id,
                    selected.is_active
                  );
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

      {/* DELETE CONFIRMATION MODAL */}

      {deleteModal && (
        <div
          className="modal"
          onClick={() => setDeleteModal(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              Are you sure you want to delete this Yoga Category?
            </h3>

            <div className="form-buttons">

              <button
                type="button"
                className="otp-btn verify-btn"
                onClick={handleDelete}
              >
                Yes
              </button>

              <button
                type="button"
                onClick={() => {
                  setDeleteModal(false);
                  setYogaCategoryId("");
                }}
              >
                No
              </button>

            </div>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW MODAL */}

      {PreviewImage && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => setPreviewImage("")}
        >
          <div
            className="image-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setPreviewImage("")}
            >
              <FaTimes />
            </button>

            <img
              src={PreviewImage}
              alt="Yoga category preview"
              style={{
                maxWidth: "100%",
                maxHeight: "75vh",
                objectFit: "contain",
                borderRadius: "8px",
              }}
            />
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={2000}
      />
    </>
  );
};

export default YogaCategory;
