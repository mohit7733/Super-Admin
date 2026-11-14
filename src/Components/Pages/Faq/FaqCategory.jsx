
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaEdit,
  FaSearch,
  FaTimes,
  FaCopy,
  FaFileExcel,
} from "react-icons/fa";

import { FiTrash2, FiUpload, FiEye, FiSearch as SearchIcon, FiRefreshCw } from "react-icons/fi";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../../Base";
import { BiPlus } from "react-icons/bi";
import ExcelJS from "exceljs";

const FaqCategory = () => {
  const [Loading, setLoading] = useState(true);
  const [Error, setError] = useState(null);

  const [Data, setData] = useState([]);
  const [FilteredData, setFilteredData] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [isActive, setIsActive] = useState(false);

  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryImage, setEditCategoryImage] = useState(null);
  const [editCategoryId, setEditCategoryId] = useState(null);

  const [categoryId, setCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [previewImage, setPreviewImage] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const navigate = useNavigate();

  const addFileRef = useRef(null);
  const editFileRef = useRef(null);
  const hasFetched = useRef(false);

  const API_URL = `${BASE_URL}/customers/admin/faq-categories/`;

  
  const calculateStats = (data) => {
    setStats({
      total: data.length,
      active: data.filter((item) => item.is_active === true).length,
      inactive: data.filter((item) => item.is_active === false).length,
    });
  };

  
  const filterData = (data, search, status) => {
    let filtered = [...data];

    if (search.trim()) {
      const term = search.toLowerCase().trim();

      filtered = filtered.filter((item) =>
        item.name?.toLowerCase().includes(term)
      );
    }

    if (status === "active") {
      filtered = filtered.filter((item) => item.is_active === true);
    } else if (status === "inactive") {
      filtered = filtered.filter((item) => item.is_active === false);
    }

    return filtered;
  };

  // Get FAQ Category List
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
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        const sortedData = [...(result.data || [])].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setData(sortedData);
        calculateStats(sortedData);
        setFilteredData(filterData(sortedData, searchTerm, statusFilter));
      } else {
        setError(result.message || "Failed to fetch FAQ categories");
        toast.error(result.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("FAQ Category Fetch Error:", error);
      setError("Something went wrong while fetching data.");
      toast.error("Failed to fetch FAQ categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;
    getCategoryList();
  }, []);

  useEffect(() => {
    setFilteredData(filterData(Data, searchTerm, statusFilter));
  }, [Data, searchTerm, statusFilter]);

  // Upload Image
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
        },
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return null;
      }

      const result = await response.json();

      if (!response.ok || !result?.data?.url) {
        toast.error(result.message || "Image upload failed");
        return null;
      }

      return result.data.url;
    } catch (error) {
      console.error("Image Upload Error:", error);
      toast.error("Image upload failed");
      return null;
    }
  };

 
  const resetAddForm = () => {
    setCategoryName("");
    setCategoryImage(null);
    setIsActive(false);
    setErrors({});

    if (addFileRef.current) {
      addFileRef.current.value = "";
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

    const newErrors = {};

    if (!categoryName.trim()) {
      newErrors.categoryName = "Category name is required";
    }

   

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setSubmitLoading(true);

      let imageUrl = "";

      if (categoryImage) {
        imageUrl = await uploadImage(categoryImage);

        if (!imageUrl) return;
      }

      const payload = {
        name: categoryName.trim(),
        image_url: imageUrl,
        is_active: isActive,
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (response.ok && result.success !== false) {
        toast.success("FAQ Category added successfully");

        setShowModal(false);
        resetAddForm();
        getCategoryList();
      } else {
        if (result.errors) {
          Object.entries(result.errors).forEach(([key, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            toast.error(`${key}: ${message}`);
          });
        } else {
          toast.error(result.message || "Failed to add category");
        }
      }
    } catch (error) {
      console.error("Add FAQ Category Error:", error);
      toast.error("Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  
  const resetEditForm = () => {
    setEditCategoryName("");
    setEditCategoryImage(null);
    setExistingImage("");
    setEditCategoryId(null);
    setIsActive(false);
    setEditErrors({});

    if (editFileRef.current) {
      editFileRef.current.value = "";
    }
  };

  // Update FAQ Category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const newErrors = {};

    if (!editCategoryName.trim()) {
      newErrors.categoryName = "Category name is required";
    }

    if (!editCategoryImage && !existingImage) {
      newErrors.categoryImage = "Category image is required";
    }

    setEditErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setSubmitLoading(true);

      let imageUrl = existingImage;

      if (editCategoryImage) {
        imageUrl = await uploadImage(editCategoryImage);

        if (!imageUrl) return;
      }

      const payload = {
        name: editCategoryName.trim(),
        image_url: imageUrl || null,
        is_active: isActive,
      };

      const response = await fetch(
        `${API_URL}?id=${editCategoryId}`,
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

      const result = await response.json();

      if (response.ok && result.success !== false) {
        toast.success("FAQ Category updated successfully");

        setEditModal(false);
        resetEditForm();
        getCategoryList();
      } else {
        if (result.errors) {
          Object.entries(result.errors).forEach(([key, value]) => {
            const message = Array.isArray(value)
              ? value.join(", ")
              : String(value);

            toast.error(`${key}: ${message}`);
          });
        } else {
          toast.error(result.message || "Failed to update category");
        }
      }
    } catch (error) {
      console.error("Update FAQ Category Error:", error);
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
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || result.success === false) {
        toast.error(result.message || "Failed to delete category");
        return;
      }

      toast.success("FAQ Category deleted successfully");
      setDeleteModal(false);
      setCategoryId(null);
      getCategoryList();
    } catch (error) {
      console.error("Delete FAQ Category Error:", error);
      toast.error("Something went wrong while deleting category");
    }
  };

 
  const updateCategoryStatus = async (id, currentStatus) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (response.ok && result.success !== false) {
        toast.success(
          !currentStatus
            ? "FAQ Category activated successfully"
            : "FAQ Category deactivated successfully"
        );

        getCategoryList();
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (error) {
      console.error("FAQ Status Error:", error);
      toast.error("Failed to update status");
    }
  };

  // Clear Filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Export Excel
  const exportToExcel = async () => {
    if (!FilteredData.length) {
      toast.error("No category data available to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("FAQ Categories");

      worksheet.columns = [
        { header: "#", key: "index", width: 8 },
        { header: "Category Name", key: "name", width: 30 },
        { header: "FAQ Category ID", key: "id", width: 40 },
        { header: "Image Link", key: "image", width: 50 },
        { header: "Status", key: "status", width: 15 },
        { header: "Created At", key: "created_at", width: 20 },
      ];

      FilteredData.forEach((item, index) => {
        const row = worksheet.addRow({
          index: index + 1,
          name: item.name || "N/A",
          id: item.id || "N/A",
          image: item.image_url || "N/A",
          status: item.is_active ? "Active" : "Inactive",
          created_at: item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "N/A",
        });

        if (item.image_url) {
          const imageCell = row.getCell("image");

          imageCell.value = {
            text: "View Image",
            hyperlink: item.image_url,
          };

          imageCell.font = {
            color: { argb: "0563C1" },
            underline: true,
          };
        }
      });

      worksheet.getRow(1).font = {
        bold: true,
        color: { argb: "FFFFFF" },
      };

      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "0D614E" },
      };

      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "D1D5DB" } },
            left: { style: "thin", color: { argb: "D1D5DB" } },
            bottom: { style: "thin", color: { argb: "D1D5DB" } },
            right: { style: "thin", color: { argb: "D1D5DB" } },
          };

          cell.alignment = { vertical: "middle" };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `FAQ_Categories_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast.success("Excel exported successfully!");
    } catch (error) {
      console.error("Excel Export Error:", error);
      toast.error("Failed to export Excel");
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>FAQ Category Management</h1>
        <p className="page-paragraph">
          Manage FAQ categories and their details
        </p>
      </div>

      {/* Statistics */}
      <div className="stats2-grid">
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaUsers size={16} />
          </div>
          <div className="stat2-info">
            <h3>Total Categories</h3>
            <div className="stat2-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaChartLine size={16} />
          </div>
          <div className="stat2-info">
            <h3>Active</h3>
            <div className="stat2-value">{stats.active}</div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaCalendarAlt size={16} />
          </div>
          <div className="stat2-info">
            <h3>Inactive</h3>
            <div className="stat2-value">{stats.inactive}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search by category name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => setSearchTerm("")}
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
            <button className="clear-filters-btn" onClick={clearFilters}>
              <FiTrash2 />
            </button>
          )}
        </div>

        <div className="category-action-buttons">
          <button
            className="add-customer-btn"
            onClick={exportToExcel}
            disabled={!FilteredData.length}
          >
            <FaFileExcel />
            Export Excel
          </button>

          <button
            className="add-customer-btn"
            onClick={() => {
              resetAddForm();
              setShowModal(true);
            }}
          >
            <BiPlus />
            Add FAQ Category
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Category Name</th>
              <th>FAQ Category ID</th>
              <th>Image</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {Loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td colSpan="7">
                      <div className="skeleton-row"></div>
                    </td>
                  </tr>
                ))
            ) : Error ? (
              <tr>
                <td colSpan="7" style={{ color: "#dc2626" }}>
                  {Error}
                </td>
              </tr>
            ) : FilteredData.length > 0 ? (
              FilteredData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>

                  <td>
                    <strong>{item.name || "N/A"}</strong>
                  </td>

                  <td>
                    <div className="category-id-wrapper">
                      <span className="category-id-text">
                        {item.id}
                      </span>

                      <button
                        type="button"
                        className="copy-id-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(item.id);
                          toast.success("FAQ Category ID copied!");
                        }}
                        title="Copy Category ID"
                      >
                        <FaCopy size={12} />
                      </button>
                    </div>
                  </td>

                  <td>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        width="34"
                        height="34"
                        style={{
                          objectFit: "cover",
                          borderRadius: "8px",
                          cursor: "pointer",
                          border: "1px solid #e5e7eb",
                        }}
                        onClick={() => setPreviewImage(item.image_url)}
                      />
                    ) : (
                      <span style={{ color: "#9ca3af", fontSize: "13px" }}>
                        No Image
                      </span>
                    )}
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

                  <td style={{ color: "#6b7280", fontSize: "14px" }}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        title="Edit"
                        onClick={() => {
                          setEditCategoryId(item.id);
                          setEditCategoryName(item.name || "");
                          setExistingImage(item.image_url || "");
                          setEditCategoryImage(null);
                          setIsActive(item.is_active);
                          setEditErrors({});
                          setEditModal(true);
                        }}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="action-btn delete"
                        title="Delete"
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
                <td colSpan="7">
                  <div className="empty-filter-state">
                    <div className="empty-filter-icon">📂</div>

                    <h3>No FAQ Categories Found</h3>

                    <p>
                      {searchTerm || statusFilter !== "all"
                        ? "No category matches your search or selected filters."
                        : "Create your first FAQ category to get started."}
                    </p>

                    {(searchTerm || statusFilter !== "all") && (
                      <button onClick={clearFilters}>
                        <FiRefreshCw />
                        Reset Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => {
            setShowModal(false);
            resetAddForm();
          }}
        >
          <div
            className="prakriti-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="prakriti-modal-header">
              <h2>Add FAQ Category</h2>

              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowModal(false);
                  resetAddForm();
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="prakriti-form">
              <div className="form-group">
                <label>
                  Category Name <span className="required">*</span>
                </label>

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
                  placeholder="Enter FAQ category name"
                  className={errors.categoryName ? "error-input" : ""}
                />

                {errors.categoryName && (
                  <p className="error-text">{errors.categoryName}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  Category Image 
                </label>

                <div className="upload-box1">
                  <input
                    ref={addFileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    id="faqCategoryUpload"
                    style={{ display: "none" }}
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
                      htmlFor="faqCategoryUpload"
                      className="upload-label"
                    >
                      <div className="upload-content">
                        <span className="upload-icon">⬆</span>
                        <p>Click to upload FAQ category image</p>
                        <span className="upload-hint">
                          PNG, JPG, JPEG, WEBP
                        </span>
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
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowModal(false);
                    resetAddForm();
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

      {/* Edit Modal */}
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
              <h2>Edit FAQ Category</h2>

              <button
                className="modal-close-btn"
                onClick={() => {
                  setEditModal(false);
                  resetEditForm();
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="prakriti-form">
              <div className="form-group">
                <label>
                  Category Name <span className="required">*</span>
                </label>

                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => {
                    setEditCategoryName(e.target.value);

                    if (e.target.value.trim()) {
                      setEditErrors((prev) => ({
                        ...prev,
                        categoryName: "",
                      }));
                    }
                  }}
                  className={editErrors.categoryName ? "error-input" : ""}
                  placeholder="Enter FAQ category name"
                />

                {editErrors.categoryName && (
                  <p className="error-text">
                    {editErrors.categoryName}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Category Image</label>

                <div className="upload-box1">
                  <input
                    ref={editFileRef}
                    type="file"
                    accept="image/*"
                    id="editFaqCategoryUpload"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];

                      if (file) {
                        setEditCategoryImage(file);
                        setEditErrors((prev) => ({
                          ...prev,
                          categoryImage: "",
                        }));
                      }
                    }}
                  />

                  {editCategoryImage || existingImage ? (
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
                          htmlFor="editFaqCategoryUpload"
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
                      htmlFor="editFaqCategoryUpload"
                      className="upload-label"
                    >
                      <div className="upload-content">
                        <span className="upload-icon">⬆</span>
                        <p>Click to upload FAQ category image</p>
                        <span className="upload-hint">PNG, JPG, JPEG</span>
                      </div>
                    </label>
                  )}
                </div>

                {editErrors.categoryImage && (
                  <p className="error-text">
                    {editErrors.categoryImage}
                  </p>
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
                    setEditModal(false);
                    resetEditForm();
                  }}
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

      {/* Delete Confirmation */}
      {deleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>
              Are you sure you want to delete this FAQ Category?
            </h3>

            <div className="form-buttons">
              <button
                className="otp-btn verify-btn"
                onClick={() => handleDelete(categoryId)}
              >
                Yes
              </button>

              <button onClick={() => setDeleteModal(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
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
                alt="Preview"
                style={{
                  display: "block",
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  width: "auto",
                  height: "auto",
                  margin: "0 auto",
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

      {/* Status Confirmation */}
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

            <div className="activeModal-icon">⚠️</div>

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
                {selectedCategory.is_active ? " Inactive " : " Active "}
              </span>
              this FAQ category?
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
                Yes, {selectedCategory.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={5000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        style={{ zIndex: 999999 }}
      />
    </>
  );
};

export default FaqCategory;
