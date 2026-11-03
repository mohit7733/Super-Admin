
import React, { useEffect, useRef, useState } from "react";
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

import {
  FiTrash2,
  FiSearch,
  FiRefreshCw,
} from "react-icons/fi";

import { BiPlus } from "react-icons/bi";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ExcelJS from "exceljs";
import BASE_URL from "../../../Base";

const Packagescategory = () => {
  const navigate = useNavigate();

  // ================= LIST STATES =================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // ================= ADD STATES =================

  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [sequence, setSequence] = useState("");
  const [isActive, setIsActive] = useState(false);

  // ================= EDIT STATES =================

  const [editModal, setEditModal] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSequence, setEditSequence] = useState("");
  const [editIsActive, setEditIsActive] = useState(false);

  // ================= DELETE STATES =================

  const [deleteModal, setDeleteModal] = useState(false);
  const [categoryId, setCategoryId] = useState(null);

  // ================= STATUS CONFIRMATION =================

  const [statusModal, setStatusModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  // ================= SEARCH / FILTER =================

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ================= ERRORS =================

  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // ================= STATS =================

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const hasFetched = useRef(false);

  // ================= HELPER =================

  const isCategoryActive = (item) => {
    return (
      item?.is_active === true ||
      item?.is_active === "true" ||
      item?.is_active === 1
    );
  };

  // ================= CALCULATE STATS =================

  const calculateStats = (items) => {
    const total = items.length;

    const active = items.filter(
      (item) => isCategoryActive(item)
    ).length;

    const inactive = total - active;

    setStats({
      total,
      active,
      inactive,
    });
  };

  // ================= FILTER DATA =================

  const filterData = (items, search, status) => {
    let filtered = [...items];

    if (search.trim()) {
      const term = search.toLowerCase().trim();

      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.code?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term)
      );
    }

    if (status === "active") {
      filtered = filtered.filter(
        (item) => isCategoryActive(item)
      );
    }

    if (status === "inactive") {
      filtered = filtered.filter(
        (item) => !isCategoryActive(item)
      );
    }

    return filtered;
  };

  // ================= GET PACKAGE CATEGORIES =================

  const getPackageCategoryList = async () => {
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
        `${BASE_URL}/packages/admin/category/`,
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

      const result = await response.json();

      if (result.success) {
        const categoryData = Array.isArray(result.data)
          ? result.data
          : [];

        const sortedData = [...categoryData].sort(
          (a, b) =>
            Number(a.sequence || 0) -
            Number(b.sequence || 0)
        );

        setData(sortedData);
        calculateStats(sortedData);

        setFilteredData(
          filterData(sortedData, searchTerm, statusFilter)
        );
      } else {
        setError(
          result.message || "Failed to fetch package categories"
        );

        toast.error(
          result.message || "Failed to fetch package categories"
        );
      }
    } catch (err) {
      console.error("Package Category Fetch Error:", err);

      setError("Something went wrong while fetching package categories.");
      toast.error("Failed to fetch package categories");
    } finally {
      setLoading(false);
    }
  };

  // ================= INITIAL API CALL =================

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;
    getPackageCategoryList();
  }, []);

  // ================= SEARCH FILTER EFFECT =================

  useEffect(() => {
    setFilteredData(
      filterData(data, searchTerm, statusFilter)
    );
  }, [data, searchTerm, statusFilter]);

  // ================= ADD CATEGORY =================

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

      const payload = {
        name: categoryName.trim(),
        description: description.trim(),
        is_active: isActive,
        sequence:
          sequence === "" ? null : Number(sequence),
      };

      const response = await fetch(
        `${BASE_URL}/packages/admin/category/`,
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

      const result = await response.json();

      if (response.ok && result.success !== false) {
        toast.success("Package category added successfully");

        closeAddModal();
        await getPackageCategoryList();
      } else {
        toast.error(
          result.message || "Failed to add package category"
        );
      }
    } catch (err) {
      console.error("Add Package Category Error:", err);
      toast.error("Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ================= UPDATE CATEGORY =================

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

    setEditErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setSubmitLoading(true);

      const payload = {
        name: editCategoryName.trim(),
        description: editDescription.trim(),
        is_active: editIsActive,
        sequence:
          editSequence === "" ? null : Number(editSequence),
      };

      const response = await fetch(
        `${BASE_URL}/packages/admin/category/?id=${editCategoryId}`,
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
        toast.success("Package category updated successfully");

        closeEditModal();
        await getPackageCategoryList();
      } else {
        toast.error(
          result.message || "Failed to update package category"
        );
      }
    } catch (err) {
      console.error("Update Package Category Error:", err);
      toast.error("Something went wrong");
    } finally {
      setSubmitLoading(false);
    }
  };

  // ================= DELETE CATEGORY =================

  const handleDelete = async (id) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/packages/admin/category/?id=${id}`,
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

      const result = await response.json();

      if (!response.ok || result.success === false) {
        toast.error(
          result.message || "Failed to delete package category"
        );
        return;
      }

      toast.success("Package category deleted successfully");

      setDeleteModal(false);
      setCategoryId(null);

      await getPackageCategoryList();
    } catch (err) {
      console.error("Delete Error:", err);
      toast.error("Something went wrong while deleting");
    }
  };

  // ================= UPDATE CATEGORY STATUS =================

  const updateCategoryStatus = async (id, currentStatus) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return false;
    }

    try {
      setStatusLoading(true);

      const response = await fetch(
        `${BASE_URL}/packages/admin/category/?id=${id}`,
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
        return false;
      }

      const result = await response.json();

      if (response.ok && result.success !== false) {
        toast.success(
          result.message ||
            (!currentStatus
              ? "Package category activated successfully"
              : "Package category deactivated successfully")
        );

        await getPackageCategoryList();
        return true;
      }

      toast.error(result.message || "Failed to update status");
      return false;
    } catch (error) {
      console.error("Status Update Error:", error);
      toast.error("Failed to update category status");
      return false;
    } finally {
      setStatusLoading(false);
    }
  };

  // ================= OPEN ADD MODAL =================

  const openAddModal = () => {
    setCategoryName("");
    setDescription("");
    setSequence("");
    setIsActive(false);
    setErrors({});
    setShowModal(true);
  };

  const closeAddModal = () => {
    setShowModal(false);
    setCategoryName("");
    setDescription("");
    setSequence("");
    setIsActive(false);
    setErrors({});
  };

  // ================= OPEN EDIT MODAL =================

  const openEditModal = (item) => {
    setEditCategoryId(item.id);
    setEditCategoryName(item.name || "");
    setEditDescription(item.description || "");
    setEditSequence(item.sequence ?? "");
    setEditIsActive(isCategoryActive(item));
    setEditErrors({});
    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);
    setEditCategoryId(null);
    setEditCategoryName("");
    setEditDescription("");
    setEditSequence("");
    setEditIsActive(false);
    setEditErrors({});
  };

  // ================= OPEN STATUS MODAL =================

  const openStatusModal = (item) => {
    setSelectedCategory(item);
    setStatusModal(true);
  };

  const closeStatusModal = () => {
    if (statusLoading) return;

    setStatusModal(false);
    setSelectedCategory(null);
  };

  // ================= CLEAR FILTERS =================

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // ================= EXCEL EXPORT =================

  const exportToExcel = async () => {
    if (!filteredData.length) {
      toast.error("No package category data available to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();

      const worksheet = workbook.addWorksheet("Package Categories");

      worksheet.columns = [
        { header: "#", key: "index", width: 8 },
        { header: "Category Name", key: "name", width: 30 },
        { header: "Category ID", key: "id", width: 40 },
        { header: "Category Code", key: "code", width: 20 },
        { header: "Description", key: "description", width: 40 },
        { header: "Sequence", key: "sequence", width: 12 },
        { header: "Status", key: "status", width: 15 },
        { header: "Created At", key: "created_at", width: 20 },
      ];

      filteredData.forEach((item, index) => {
        worksheet.addRow({
          index: index + 1,
          name: item.name || "N/A",
          id: item.id || "N/A",
          code: item.code || "N/A",
          description: item.description || "N/A",
          sequence: item.sequence ?? "N/A",
          status: isCategoryActive(item) ? "Active" : "Inactive",
          created_at: item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "N/A",
        });
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
      link.download = `Package_Categories_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast.success("Excel exported successfully!");
    } catch (err) {
      console.error("Excel Export Error:", err);
      toast.error("Failed to export Excel");
    }
  };

  // ================= JSX =================

  return (
    <>
      {/* HEADER */}

      <div className="page-header">
        <h1>Package Category Management</h1>
        <p className="page-paragraph">
          Manage package categories and their details
        </p>
      </div>

      {/* STATS */}

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

        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaChartLine size={16} />
          </div>
          <div className="stat2-info">
            <h3>Active</h3>
            <div className="stat2-value">{stats.active}</div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaCalendarAlt size={16} />
          </div>
          <div className="stat2-info">
            <h3>Inactive</h3>
            <div className="stat2-value">{stats.inactive}</div>
          </div>
        </div>
      </div>

      {/* FILTERS */}

      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search by name, code or description..."
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
            disabled={!filteredData.length}
          >
            <FaFileExcel />
            Export Excel
          </button>

          <button className="add-customer-btn" onClick={openAddModal}>
            <BiPlus />
            Add Category
          </button>
        </div>
      </div>

      {/* TABLE */}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Category Name</th>
              <th>Code</th>
              <th>Description</th>
              <th>Sequence</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan="8">
                    <div className="skeleton-row" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan="8" style={{ color: "#dc2626" }}>
                  {error}
                </td>
              </tr>
            ) : filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>

                  <td>
                    <strong>{item.name || "N/A"}</strong>

                    {item.id && (
                      <div className="category-id-wrapper">
                        <span className="category-id-text">
                          {item.id}
                        </span>

                        <button
                          type="button"
                          className="copy-id-btn"
                          onClick={() => {
                            navigator.clipboard.writeText(item.id);
                            toast.success("Category ID copied!");
                          }}
                        >
                          <FaCopy size={12} />
                        </button>
                      </div>
                    )}
                  </td>

                  <td>
                    <span className="category-code-badge">
                      {item.code || "N/A"}
                    </span>
                  </td>

                  <td>
                    <div
                      style={{
                        maxWidth: "250px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={item.description || ""}
                    >
                      {item.description || "N/A"}
                    </div>
                  </td>

                  <td>{item.sequence ?? "-"}</td>

                  {/* STATUS TOGGLE - FIXED */}

                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={isCategoryActive(item)}
                        disabled={statusLoading}
                        onChange={() => {
                          const currentlyActive = isCategoryActive(item);

                          if (currentlyActive) {
                            // ALWAYS OPEN CONFIRMATION MODAL
                            openStatusModal(item);
                          } else {
                            // DIRECT ACTIVATION
                            updateCategoryStatus(item.id, false);
                          }
                        }}
                      />

                      <span className="slider round" />
                    </label>
                  </td>

                  <td
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "-"}
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        title="Edit"
                        onClick={() => openEditModal(item)}
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
                <td colSpan="8">
                  <div className="empty-filter-state">
                    <div className="empty-filter-icon">
                      {searchTerm || statusFilter !== "all"
                        ? <FiSearch />
                        : "📦"}
                    </div>

                    <h3>
                      {searchTerm || statusFilter !== "all"
                        ? "No Categories Found"
                        : "No Package Categories Available"}
                    </h3>

                    <p>
                      {searchTerm || statusFilter !== "all"
                        ? "We couldn't find any package category matching your search or selected filter."
                        : 'Create your first package category by clicking "Add Category".'}
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

      {/* ADD CATEGORY MODAL */}

      {showModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={closeAddModal}
        >
          <div
            className="prakriti-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="prakriti-modal-header">
              <h2>Add Package Category</h2>

              <button
                className="modal-close-btn"
                onClick={closeAddModal}
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleAddCategory}
              className="prakriti-form"
            >
              <div className="form-group">
                <label>
                  Category Name <span className="required">*</span>
                </label>

                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      categoryName: "",
                    }));
                  }}
                  placeholder="Enter category name"
                  className={errors.categoryName ? "error-input" : ""}
                />

                {errors.categoryName && (
                  <p className="error-text">{errors.categoryName}</p>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Sequence</label>

                <input
                  type="number"
                  min="0"
                  value={sequence}
                  onChange={(e) => setSequence(e.target.value)}
                  placeholder="Enter sequence"
                />
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
                  onClick={closeAddModal}
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

      {/* EDIT CATEGORY MODAL */}

      {editModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={closeEditModal}
        >
          <div
            className="prakriti-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="prakriti-modal-header">
              <h2>Edit Package Category</h2>

              <button
                className="modal-close-btn"
                onClick={closeEditModal}
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleUpdateCategory}
              className="prakriti-form"
            >
              <div className="form-group">
                <label>
                  Category Name <span className="required">*</span>
                </label>

                <input
                  type="text"
                  value={editCategoryName}
                  onChange={(e) => {
                    setEditCategoryName(e.target.value);
                    setEditErrors((prev) => ({
                      ...prev,
                      categoryName: "",
                    }));
                  }}
                  placeholder="Enter category name"
                  className={editErrors.categoryName ? "error-input" : ""}
                />

                {editErrors.categoryName && (
                  <p className="error-text">
                    {editErrors.categoryName}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Sequence</label>

                <input
                  type="number"
                  min="0"
                  value={editSequence}
                  onChange={(e) => setEditSequence(e.target.value)}
                  placeholder="Enter sequence"
                />
              </div>

              <div className="form-group">
                <label>Status</label>

                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                  />
                  <span>Active</span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeEditModal}
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

      {/* DELETE MODAL */}

      {deleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>
              Are you sure you want to delete this package category?
            </h3>

            <div className="form-buttons">
              <button
                className="otp-btn verify-btn"
                onClick={() => handleDelete(categoryId)}
              >
                Yes
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

      {/* STATUS CONFIRMATION MODAL - FIXED */}

      {statusModal && selectedCategory && (
        <div
          className="activeModal-overlay"
          onClick={closeStatusModal}
        >
          <div
            className="activeModal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="activeModal-close"
              disabled={statusLoading}
              onClick={closeStatusModal}
            >
              ×
            </button>

            <div className="activeModal-icon">
              ⚠️
            </div>

            <h2 className="activeModal-title">
              Confirm Category Deactivation
            </h2>

            <p className="activeModal-text">
              Are you sure you want to deactivate this category?
            </p>

            <div className="activeModal-card">
              <h4>{selectedCategory.name}</h4>

              <div className="category-warning-details">
                <p>
                  <strong>Total Packages:</strong>{" "}
                  {selectedCategory.total_packages ?? 0}
                </p>

                <p>
                  <strong>Active Packages:</strong>{" "}
                  {selectedCategory.active_packages ?? "Not available"}
                </p>

                <p>
                  <strong>Inactive Packages:</strong>{" "}
                  {selectedCategory.inactive_packages ?? 0}
                </p>

                <div className="category-deactivate-warning">
                  <strong>⚠️ Important Warning!</strong>

                  <p>
                    {selectedCategory.active_packages !== undefined &&
                    selectedCategory.active_packages !== null
                      ? `This category contains ${selectedCategory.active_packages} active packages.`
                      : "The active package count is not available."}
                  </p>

                  <p>
                    Deactivating this category may also deactivate its active packages.
                  </p>

                  <p>Do you want to continue?</p>
                </div>
              </div>
            </div>

            <div className="activeModal-footer">
              <button
                type="button"
                className="activeModal-cancel"
                disabled={statusLoading}
                onClick={closeStatusModal}
              >
                Cancel
              </button>

              <button
                type="button"
                className="activeModal-confirm deactivate-btn"
                disabled={statusLoading}
                onClick={async () => {
                  if (!selectedCategory || statusLoading) return;

                  const success = await updateCategoryStatus(
                    selectedCategory.id,
                    true
                  );

                  if (success) {
                    setStatusModal(false);
                    setSelectedCategory(null);
                  }
                }}
              >
                {statusLoading ? "Deactivating..." : "Yes, Deactivate"}
              </button>
            </div>
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

export default Packagescategory;
