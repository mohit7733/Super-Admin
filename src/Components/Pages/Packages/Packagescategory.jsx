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
  FiUpload,
  FiEye,
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

  // =========================
  // LIST STATES
  // =========================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // =========================
  // ADD STATES
  // =========================
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [description, setDescription] = useState("");
  const [sequence, setSequence] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [isActive, setIsActive] = useState(false);

  // =========================
  // EDIT STATES
  // =========================
  const [editModal, setEditModal] = useState(false);

  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryCode, setEditCategoryCode] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSequence, setEditSequence] = useState("");
  const [editCategoryImage, setEditCategoryImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [editIsActive, setEditIsActive] = useState(false);

  // =========================
  // DELETE
  // =========================
  const [deleteModal, setDeleteModal] = useState(false);
  const [categoryId, setCategoryId] = useState(null);

  // =========================
  // STATUS
  // =========================
  const [statusModal, setStatusModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // =========================
  // IMAGE PREVIEW
  // =========================
  const [previewImage, setPreviewImage] = useState("");

  // =========================
  // SEARCH / FILTER
  // =========================
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // =========================
  // ERRORS
  // =========================
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // =========================
  // STATS
  // =========================
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const hasFetched = useRef(false);

  const addFileRef = useRef(null);
  const editFileRef = useRef(null);

  // =========================================================
  // CALCULATE STATS
  // =========================================================

  const calculateStats = (items) => {
    const total = items.length;

    const active = items.filter(
      (item) => item.is_active === true
    ).length;

    const inactive = items.filter(
      (item) => item.is_active === false
    ).length;

    setStats({
      total,
      active,
      inactive,
    });
  };

  // =========================================================
  // FILTER DATA
  // =========================================================

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
        (item) => item.is_active === true
      );
    }

    if (status === "inactive") {
      filtered = filtered.filter(
        (item) => item.is_active === false
      );
    }

    return filtered;
  };

  // =========================================================
  // GET PACKAGE CATEGORY
  // =========================================================

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

        // Sequence wise sorting
        const sortedData = [...categoryData].sort(
          (a, b) => Number(a.sequence || 0) - Number(b.sequence || 0)
        );

        setData(sortedData);

        calculateStats(categoryData);

        setFilteredData(
          filterData(
            sortedData,
            searchTerm,
            statusFilter
          )
        );
      } else {
        toast.error(
          result.message || "Failed to fetch package categories"
        );

        setError(
          result.message || "Failed to fetch package categories"
        );
      }
    } catch (err) {
      console.error("Package Category Fetch Error:", err);

      setError(
        "Something went wrong while fetching package categories."
      );

      toast.error("Failed to fetch package categories");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL API CALL
  // =========================================================

  useEffect(() => {
    if (hasFetched.current) return;

    hasFetched.current = true;

    getPackageCategoryList();
  }, []);

  // =========================================================
  // SEARCH / FILTER EFFECT
  // =========================================================

  useEffect(() => {
    setFilteredData(
      filterData(
        data,
        searchTerm,
        statusFilter
      )
    );
  }, [data, searchTerm, statusFilter]);

  // =========================================================
  // UPLOAD IMAGE
  // =========================================================

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

      formData.append(
        "dir",
        "package_categories"
      );

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

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        sessionStorage.removeItem(
          "superadmin_token"
        );

        toast.error(
          "Session expired. Please login again"
        );

        navigate("/login");

        return null;
      }

      const result = await response.json();

      return result?.data?.url || null;
    } catch (err) {
      console.error("Image Upload Error:", err);

      toast.error("Image upload failed");

      return null;
    }
  };

  // =========================================================
  // ADD CATEGORY
  // =========================================================

  const handleAddCategory = async (e) => {
    e.preventDefault();

    const token =
      sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error(
        "Session expired. Please login again"
      );

      navigate("/login");

      return;
    }

    const newErrors = {};

    if (!categoryName.trim()) {
      newErrors.categoryName =
        "Category name is required";
    }

    

    

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setSubmitLoading(true);

    //   let imageUrl = "";

    //   if (categoryImage) {
    //     imageUrl = await uploadImage(
    //       categoryImage
    //     );

    //     if (!imageUrl) {
    //       toast.error(
    //         "Image upload failed"
    //       );

    //       return;
    //     }
    //   }

      const payload = {
        name: categoryName.trim(),

        // code: categoryCode
        //   .trim()
        //   .toUpperCase(),

        description:
          description.trim(),

        // image_url: imageUrl,

        is_active: isActive,

        sequence:
          sequence === ""
            ? null
            : Number(sequence),
      };

      const response = await fetch(
        `${BASE_URL}/packages/admin/category/`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

            "ngrok-skip-browser-warning":
              "true",
          },

          body: JSON.stringify(payload),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        sessionStorage.removeItem(
          "superadmin_token"
        );

        toast.error(
          "Session expired. Please login again"
        );

        navigate("/login");

        return;
      }

      const result =
        await response.json();

      if (response.ok) {
        toast.success(
          "Package category added successfully"
        );

        closeAddModal();

        getPackageCategoryList();
      } else {
        toast.error(
          result.message ||
            "Failed to add package category"
        );

        if (result.errors) {
          console.error(
            "API Validation Errors:",
            result.errors
          );
        }
      }
    } catch (err) {
      console.error(
        "Add Package Category Error:",
        err
      );

      toast.error(
        "Something went wrong"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // =========================================================
  // EDIT CATEGORY
  // =========================================================

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    const token =
      sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error(
        "Session expired. Please login again"
      );

      navigate("/login");

      return;
    }

    const newErrors = {};

    if (!editCategoryName.trim()) {
      newErrors.categoryName =
        "Category name is required";
    }

    if (!editCategoryCode.trim()) {
      newErrors.categoryCode =
        "Category code is required";
    }

    if (!editDescription.trim()) {
      newErrors.description =
        "Description is required";
    }

    setEditErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setSubmitLoading(true);

      let imageUrl = existingImage;

      if (editCategoryImage) {
        imageUrl = await uploadImage(
          editCategoryImage
        );

        if (!imageUrl) {
          toast.error(
            "Image upload failed"
          );

          return;
        }
      }

      const payload = {
        name:
          editCategoryName.trim(),

        code:
          editCategoryCode
            .trim()
            .toUpperCase(),

        description:
          editDescription.trim(),

        image_url:
          imageUrl || "",

        is_active:
          editIsActive,

        sequence:
          editSequence === ""
            ? null
            : Number(editSequence),
      };

      const response = await fetch(
        `${BASE_URL}/packages/admin/category/?id=${editCategoryId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

            "ngrok-skip-browser-warning":
              "true",
          },

          body: JSON.stringify(payload),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        sessionStorage.removeItem(
          "superadmin_token"
        );

        toast.error(
          "Session expired. Please login again"
        );

        navigate("/login");

        return;
      }

      const result =
        await response.json();

      if (response.ok) {
        toast.success(
          "Package category updated successfully"
        );

        closeEditModal();

        getPackageCategoryList();
      } else {
        toast.error(
          result.message ||
            "Failed to update package category"
        );

        if (result.errors) {
          console.error(
            "API Validation Errors:",
            result.errors
          );
        }
      }
    } catch (err) {
      console.error(
        "Update Package Category Error:",
        err
      );

      toast.error(
        "Something went wrong"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async (id) => {
    const token =
      sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error(
        "Session expired. Please login again"
      );

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

            Authorization:
              `Bearer ${token}`,

            "ngrok-skip-browser-warning":
              "true",
          },
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        sessionStorage.removeItem(
          "superadmin_token"
        );

        toast.error(
          "Session expired. Please login again"
        );

        navigate("/login");

        return;
      }

      const result =
        await response.json();

      if (!response.ok || result.success === false) {
        toast.error(
          result.message ||
            "Failed to delete package category"
        );

        return;
      }

      toast.success(
        "Package category deleted successfully"
      );

      setDeleteModal(false);

      setCategoryId(null);

      getPackageCategoryList();
    } catch (err) {
      console.error(
        "Delete Error:",
        err
      );

      toast.error(
        "Something went wrong while deleting"
      );
    }
  };

  // =========================================================
  // STATUS UPDATE
  // =========================================================

  const updateCategoryStatus = async (
    id,
    currentStatus
  ) => {
    const token =
      sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error(
        "Session expired. Please login again"
      );

      navigate("/login");

      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/packages/admin/category/?id=${id}`,
        {
          method: "PUT",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,

            "ngrok-skip-browser-warning":
              "true",
          },

          body: JSON.stringify({
            is_active:
              !currentStatus,
          }),
        }
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        sessionStorage.removeItem(
          "superadmin_token"
        );

        toast.error(
          "Session expired. Please login again"
        );

        navigate("/login");

        return;
      }

      const result =
        await response.json();

      if (response.ok) {
        toast.success(
          !currentStatus
            ? "Package category activated successfully"
            : "Package category deactivated successfully"
        );

        getPackageCategoryList();
      } else {
        toast.error(
          result.message ||
            "Failed to update status"
        );
      }
    } catch (err) {
      console.error(
        "Status Update Error:",
        err
      );

      toast.error(
        "Failed to update status"
      );
    }
  };

  // =========================================================
  // MODAL HELPERS
  // =========================================================

  const openAddModal = () => {
    setCategoryName("");
    setCategoryCode("");
    setDescription("");
    setSequence("");
    setCategoryImage(null);
    setIsActive(false);
    setErrors({});

    if (addFileRef.current) {
      addFileRef.current.value = "";
    }

    setShowModal(true);
  };

  const closeAddModal = () => {
    setShowModal(false);

    setCategoryName("");
    setCategoryCode("");
    setDescription("");
    setSequence("");
    setCategoryImage(null);
    setIsActive(false);
    setErrors({});

    if (addFileRef.current) {
      addFileRef.current.value = "";
    }
  };

  const openEditModal = (item) => {
    setEditCategoryId(item.id);

    setEditCategoryName(
      item.name || ""
    );

    setEditCategoryCode(
      item.code || ""
    );

    setEditDescription(
      item.description || ""
    );

    setEditSequence(
      item.sequence ?? ""
    );

    setExistingImage(
      item.image_url || ""
    );

    setEditCategoryImage(null);

    setEditIsActive(
      item.is_active === true
    );

    setEditErrors({});

    if (editFileRef.current) {
      editFileRef.current.value = "";
    }

    setEditModal(true);
  };

  const closeEditModal = () => {
    setEditModal(false);

    setEditCategoryId(null);

    setEditCategoryName("");
    setEditCategoryCode("");
    setEditDescription("");
    setEditSequence("");

    setEditCategoryImage(null);
    setExistingImage("");

    setEditIsActive(false);

    setEditErrors({});

    if (editFileRef.current) {
      editFileRef.current.value = "";
    }
  };

  // =========================================================
  // CLEAR FILTER
  // =========================================================

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // =========================================================
  // EXCEL EXPORT
  // =========================================================

  const exportToExcel = async () => {
    if (!filteredData.length) {
      toast.error(
        "No package category data available to export"
      );

      return;
    }

    try {
      const workbook =
        new ExcelJS.Workbook();

      const worksheet =
        workbook.addWorksheet(
          "Package Categories"
        );

      worksheet.columns = [
        {
          header: "#",
          key: "index",
          width: 8,
        },

        {
          header: "Category Name",
          key: "name",
          width: 30,
        },

        {
          header: "Category ID",
          key: "id",
          width: 40,
        },

        {
          header: "Category Code",
          key: "code",
          width: 20,
        },

        {
          header: "Description",
          key: "description",
          width: 40,
        },

        {
          header: "Image Link",
          key: "image",
          width: 50,
        },

        {
          header: "Sequence",
          key: "sequence",
          width: 12,
        },

        {
          header: "Status",
          key: "status",
          width: 15,
        },

        {
          header: "Created At",
          key: "created_at",
          width: 20,
        },
      ];

      filteredData.forEach(
        (item, index) => {
          const row =
            worksheet.addRow({
              index: index + 1,

              name:
                item.name || "N/A",

              id:
                item.id || "N/A",

              code:
                item.code || "N/A",

              description:
                item.description ||
                "N/A",

              image:
                item.image_url ||
                "N/A",

              sequence:
                item.sequence ??
                "N/A",

              status:
                item.is_active
                  ? "Active"
                  : "Inactive",

              created_at:
                item.created_at
                  ? new Date(
                      item.created_at
                    ).toLocaleDateString()
                  : "N/A",
            });

          if (item.image_url) {
            const imageCell =
              row.getCell("image");

            imageCell.value = {
              text: "View Image",
              hyperlink:
                item.image_url,
            };

            imageCell.font = {
              color: {
                argb: "0563C1",
              },
              underline: true,
            };
          }
        }
      );

      worksheet.getRow(1).font = {
        bold: true,
        color: {
          argb: "FFFFFF",
        },
      };

      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {
          argb: "0D614E",
        },
      };

      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      worksheet.eachRow(
        (row) => {
          row.eachCell(
            (cell) => {
              cell.border = {
                top: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },

                left: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },

                bottom: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },

                right: {
                  style: "thin",
                  color: {
                    argb: "D1D5DB",
                  },
                },
              };

              cell.alignment = {
                vertical: "middle",
              };
            }
          );
        }
      );

      const buffer =
        await workbook.xlsx.writeBuffer();

      const blob = new Blob(
        [buffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }
      );

      const url =
        window.URL.createObjectURL(
          blob
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `Package_Categories_${new Date()
          .toISOString()
          .slice(0, 10)}.xlsx`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      toast.success(
        "Excel exported successfully!"
      );
    } catch (err) {
      console.error(
        "Excel Export Error:",
        err
      );

      toast.error(
        "Failed to export Excel"
      );
    }
  };

  // =========================================================
  // JSX
  // =========================================================

  return (
    <>
      {/* ================= HEADER ================= */}

      <div className="page-header">
        <h1>
          Package Category Management
        </h1>

        <p className="page-paragraph">
          Manage package categories and
          their details
        </p>
      </div>

    

      <div className="stats2-grid">

        <div
          className="stat2-card"
          style={{
            borderTopColor:
              "#0D614E",
          }}
        >
          <div
            className="stat2-icon"
            style={{
              background:
                "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaUsers size={16} />
          </div>

          <div className="stat2-info">
            <h3>
              Total Categories
            </h3>

            <div className="stat2-value">
              {stats.total}
            </div>
          </div>
        </div>

        <div
          className="stat2-card"
          style={{
            borderTopColor:
              "#0D614E",
          }}
        >
          <div
            className="stat2-icon"
            style={{
              background:
                "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaChartLine size={16} />
          </div>

          <div className="stat2-info">
            <h3>Active</h3>

            <div className="stat2-value">
              {stats.active}
            </div>
          </div>
        </div>

        <div
          className="stat2-card"
          style={{
            borderTopColor:
              "#0D614E",
          }}
        >
          <div
            className="stat2-icon"
            style={{
              background:
                "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaCalendarAlt size={16} />
          </div>

          <div className="stat2-info">
            <h3>Inactive</h3>

            <div className="stat2-value">
              {stats.inactive}
            </div>
          </div>
        </div>

      </div>

      {/* ================= FILTER ================= */}

      <div className="filter-category">

        <div className="filter-controls">

          <div className="search-wrapper">

            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search by name, code or description..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="search-input"
            />

            {searchTerm && (
              <button
                className="clear-search"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                <FaTimes />
              </button>
            )}

          </div>

          <select
            className="status-filter-select"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <option value="all">
              All Status
            </option>

            <option value="active">
              Active
            </option>

            <option value="inactive">
              Inactive
            </option>
          </select>

          {(searchTerm ||
            statusFilter !==
              "all") && (
            <button
              className="clear-filters-btn"
              onClick={
                clearFilters
              }
            >
              <FiTrash2 />
            </button>
          )}

        </div>

        <div className="category-action-buttons">

          <button
            className="add-customer-btn"
            onClick={
              exportToExcel
            }
            disabled={
              !filteredData.length
            }
          >
            <FaFileExcel />
            Export Excel
          </button>

          <button
            className="add-customer-btn"
            onClick={
              openAddModal
            }
          >
            <BiPlus />
            Add Category
          </button>

        </div>

      </div>

      {/* ================= TABLE ================= */}

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
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td colSpan="9">
                      <div className="skeleton-row" />
                    </td>
                  </tr>
                ))
            ) : error ? (

              <tr>
                <td
                  colSpan="9"
                  style={{
                    color:
                      "#dc2626",
                  }}
                >
                  {error}
                </td>
              </tr>

            ) : filteredData.length >
              0 ? (

              filteredData.map(
                (item, index) => (
                  <tr key={item.id}>

                    <td>
                      {index + 1}
                    </td>

                    {/* NAME + ID */}

                    <td>
                      <strong>
                        {item.name ||
                          "N/A"}
                      </strong>

                      {item.id && (
                        <div className="category-id-wrapper">

                          <span className="category-id-text">
                            {item.id}
                          </span>

                          <button
                            type="button"
                            className="copy-id-btn"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                item.id
                              );

                              toast.success(
                                "Category ID copied!"
                              );
                            }}
                          >
                            <FaCopy
                              size={12}
                            />
                          </button>

                        </div>
                      )}
                    </td>

                    {/* CODE */}

                    <td>
                      <span className="category-code-badge">
                        {item.code ||
                          "N/A"}
                      </span>
                    </td>

                    {/* DESCRIPTION */}

                    <td>
                      <div
                        style={{
                          maxWidth:
                            "250px",
                          whiteSpace:
                            "nowrap",
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                        }}
                        title={
                          item.description ||
                          ""
                        }
                      >
                        {item.description ||
                          "N/A"}
                      </div>
                    </td>

                

                    {/* SEQUENCE */}

                    <td>
                      {item.sequence ??
                        "-"}
                    </td>

                    {/* STATUS */}

                    <td>
                      <label className="switch">

                        <input
                          type="checkbox"
                          checked={
                            item.is_active
                          }
                          onChange={() => {
                            setSelectedCategory(
                              item
                            );

                            setStatusModal(
                              true
                            );
                          }}
                        />

                        <span className="slider round" />

                      </label>
                    </td>

                    {/* CREATED */}

                    <td
                      style={{
                        color:
                          "#6b7280",
                        fontSize:
                          "14px",
                      }}
                    >
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="action-buttons">

                        <button
                          className="action-btn edit"
                          title="Edit"
                          onClick={() =>
                            openEditModal(
                              item
                            )
                          }
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="action-btn delete"
                          title="Delete"
                          onClick={() => {
                            setCategoryId(
                              item.id
                            );

                            setDeleteModal(
                              true
                            );
                          }}
                        >
                          <FiTrash2 />
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )

            ) : (

              <tr>
                <td colSpan="9">

                  <div className="empty-filter-state">

                    <div className="empty-filter-icon">
                      {searchTerm ||
                      statusFilter !==
                        "all"
                        ? (
                          <FiSearch />
                        ) : (
                          "📦"
                        )}
                    </div>

                    <h3>
                      {searchTerm ||
                      statusFilter !==
                        "all"
                        ? "No Categories Found"
                        : "No Package Categories Available"}
                    </h3>

                    <p>
                      {searchTerm ||
                      statusFilter !==
                        "all"
                        ? "We couldn't find any package category matching your search or selected filter."
                        : 'Create your first package category by clicking "Add Category".'}
                    </p>

                    {(searchTerm ||
                      statusFilter !==
                        "all") && (
                      <button
                        onClick={
                          clearFilters
                        }
                      >
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

      {/* =====================================================
          ADD MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={
            closeAddModal
          }
        >

          <div
            className="prakriti-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="prakriti-modal-header">

              <h2>
                Add Package Category
              </h2>

              <button
                className="modal-close-btn"
                onClick={
                  closeAddModal
                }
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={
                handleAddCategory
              }
              className="prakriti-form"
            >


              <div className="form-group">

                <label>
                  Category Name{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={
                    categoryName
                  }
                  onChange={(e) => {
                    setCategoryName(
                      e.target.value
                    );

                    setErrors(
                      (prev) => ({
                        ...prev,
                        categoryName:
                          "",
                      })
                    );
                  }}
                  placeholder="Enter category name"
                  className={
                    errors.categoryName
                      ? "error-input"
                      : ""
                  }
                />

                {errors.categoryName && (
                  <p className="error-text">
                    {
                      errors.categoryName
                    }
                  </p>
                )}

              </div>

          

          
            

              <div className="form-group">

                <label>
                  Description{" "}
                
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(e) => {
                    setDescription(
                      e.target.value
                    );

                    setErrors(
                      (prev) => ({
                        ...prev,
                        description:
                          "",
                      })
                    );
                  }}
                  placeholder="Enter category description"
                  rows={3}
                  className={
                    errors.description
                      ? "error-input"
                      : ""
                  }
                />

              

              </div>

            

              <div className="form-group">

                <label>
                  Sequence
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    sequence
                  }
                  onChange={(e) =>
                    setSequence(
                      e.target.value
                    )
                  }
                  placeholder="Enter sequence"
                />

              </div>

             

            

              <div className="form-group">

                <label>
                  Status
                </label>

                <div className="checkbox-row">

                  <input
                    type="checkbox"
                    checked={
                      isActive
                    }
                    onChange={(e) =>
                      setIsActive(
                        e.target
                          .checked
                      )
                    }
                  />

                  <span>
                    Active
                  </span>

                </div>

              </div>

             

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    closeAddModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={
                    submitLoading
                  }
                >
                  {submitLoading
                    ? "Adding..."
                    : "Add Category"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}


      {editModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={
            closeEditModal
          }
        >

          <div
            className="prakriti-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="prakriti-modal-header">

              <h2>
                Edit Package Category
              </h2>

              <button
                className="modal-close-btn"
                onClick={
                  closeEditModal
                }
              >
                <FaTimes />
              </button>

            </div>

            <form
              onSubmit={
                handleUpdateCategory
              }
              className="prakriti-form"
            >

          

              <div className="form-group">

                <label>
                  Category Name{" "}
                  <span className="required">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={
                    editCategoryName
                  }
                  onChange={(e) => {
                    setEditCategoryName(
                      e.target.value
                    );

                    setEditErrors(
                      (prev) => ({
                        ...prev,
                        categoryName:
                          "",
                      })
                    );
                  }}
                  placeholder="Enter category name"
                  className={
                    editErrors.categoryName
                      ? "error-input"
                      : ""
                  }
                />

                {editErrors.categoryName && (
                  <p className="error-text">
                    {
                      editErrors.categoryName
                    }
                  </p>
                )}

              </div>

           

             

              <div className="form-group">

                <label>
                  Description{" "}
                 
                </label>

                <textarea
                  value={
                    editDescription
                  }
                  onChange={(e) => {
                    setEditDescription(
                      e.target.value
                    );

                    setEditErrors(
                      (prev) => ({
                        ...prev,
                        description:
                          "",
                      })
                    );
                  }}
                  placeholder="Enter category description"
                  rows={3}
                  className={
                    editErrors.description
                      ? "error-input"
                      : ""
                  }
                />

             
              </div>

             
              <div className="form-group">

                <label>
                  Sequence
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    editSequence
                  }
                  onChange={(e) =>
                    setEditSequence(
                      e.target.value
                    )
                  }
                  placeholder="Enter sequence"
                />

              </div>


             

              <div className="form-group">

                <label>
                  Status
                </label>

                <div className="checkbox-row">

                  <input
                    type="checkbox"
                    checked={
                      editIsActive
                    }
                    onChange={(e) =>
                      setEditIsActive(
                        e.target
                          .checked
                      )
                    }
                  />

                  <span>
                    Active
                  </span>

                </div>

              </div>

              {/* FOOTER */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    closeEditModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={
                    submitLoading
                  }
                >
                  {submitLoading
                    ? "Updating..."
                    : "Update Category"}
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
              Are you sure you want to
              delete this package
              category?
            </h3>

            <div className="form-buttons">

              <button
                className="otp-btn verify-btn"
                onClick={() =>
                  handleDelete(
                    categoryId
                  )
                }
              >
                Yes
              </button>

              <button
                onClick={() =>
                  setDeleteModal(
                    false
                  )
                }
              >
                No
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          IMAGE PREVIEW
      ===================================================== */}

      {previewImage && (
        <div
          className="prakriti-modal-overlay"
          onClick={() =>
            setPreviewImage("")
          }
        >

          <div
            className="prakriti-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="prakriti-modal-header">

              <h2>
                Image Preview
              </h2>

              <button
                className="modal-close-btn"
                onClick={() =>
                  setPreviewImage("")
                }
              >
                <FaTimes />
              </button>

            </div>

            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "20px",
              }}
            >

              <img
                src={
                  previewImage
                }
                alt="Preview"
                style={{
                  display:
                    "block",
                  maxWidth:
                    "100%",
                  maxHeight:
                    "80vh",
                  width:
                    "auto",
                  height:
                    "auto",
                  margin:
                    "0 auto",
                  objectFit:
                    "contain",
                  borderRadius:
                    "10px",
                }}
              />

            </div>

            <div className="modal-footer">

              <button
                className="cancel-btn"
                onClick={() =>
                  setPreviewImage("")
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =====================================================
          STATUS MODAL
      ===================================================== */}

      {statusModal &&
        selectedCategory && (
          <div
            className="activeModal-overlay"
            onClick={() => {
              setStatusModal(
                false
              );

              setSelectedCategory(
                null
              );
            }}
          >

            <div
              className="activeModal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <button
                className="activeModal-close"
                onClick={() => {
                  setStatusModal(
                    false
                  );

                  setSelectedCategory(
                    null
                  );
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

                Are you sure you want
                to

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

                this package
                category?

              </p>

              <div className="activeModal-card">

                <h4>
                  {
                    selectedCategory.name
                  }
                </h4>

              </div>

              <div className="activeModal-footer">

                <button
                  className="activeModal-cancel"
                  onClick={() => {
                    setStatusModal(
                      false
                    );

                    setSelectedCategory(
                      null
                    );
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

                    setStatusModal(
                      false
                    );

                    setSelectedCategory(
                      null
                    );

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

      <ToastContainer
        position="top-center"
        autoClose={2000}
      />
    </>
  );
};

export default Packagescategory;