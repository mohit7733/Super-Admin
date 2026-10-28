
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
import { FiTrash2, FiEye, FiUpload } from "react-icons/fi";
import { BiPlus } from "react-icons/bi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import BASE_URL from "../../../Base";

const ProductCategory = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const editFileRef = useRef(null);

  const [HealthCategoryData, setHealthCategoryData] = useState([]);
  const [FilteredData, setFilteredData] = useState([]);
  const [HealthLoading, setHealthLoading] = useState(false);
  const [HealthError, setHealthError] = useState(null);

  const [ServiceCategoryData, setServiceCategoryData] = useState([]);
  const [ServiceCategoryLoading, setServiceCategoryLoading] = useState(false);
  const [ServiceCategoryError, setServiceCategoryError] = useState(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [productCategoryStatusModal, setProductCategoryStatusModal] =
    useState(false);
const [serviceCategoryFilter, setServiceCategoryFilter] = useState("all");
  const [categoryId, setCategoryId] = useState(null);
  const [selectedProductCategory, setSelectedProductCategory] = useState(null);
  const [ProductPreviewImage, setProductPreviewImage] = useState("");

  const [SubCategoryImage, setSubCategoryImage] = useState(null);
  const [EditImage, setEditImage] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [IsUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  const initialCategoryForm = {
    name: "",
    description: "",
    is_active: false,
    service_category_id: "",
    image_url: "",
    code: "",
    sequence: "",
  };

  const [categoryForm, setCategoryForm] = useState(initialCategoryForm);

  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    description: "",
    image_url: "",
    service_category_id: "",
    is_active: false,
    sequence: "",
  });

  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  

  const getToken = () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return null;
    }

    return token;
  };

  const handleUnauthorized = (response) => {
    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return true;
    }

    return false;
  };

  const parseResponse = async (response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return {
        success: false,
        message: "Invalid server response. Please check the API endpoint.",
      };
    }
  };

  

  const showApiErrors = (errors, setErrors) => {
    const fieldErrors = {};

    if (!errors || typeof errors !== "object") {
      toast.error("Something went wrong. Please try again.");
      return;
    }

    Object.entries(errors).forEach(([field, messages]) => {
      const message = Array.isArray(messages)
        ? messages.join(", ")
        : String(messages ?? "");

      if (!message) return;

      fieldErrors[field] = message;
      toast.error(message);
    });

    setErrors((prev) => ({
      ...prev,
      ...fieldErrors,
    }));

    if (Object.keys(fieldErrors).length === 0) {
      toast.error("Invalid data provided");
    }
  };

  const showRequestError = (data, fallback, setErrors) => {
    if (data?.errors && typeof data.errors === "object") {
      showApiErrors(data.errors, setErrors);
    } else {
      toast.error(data?.message || fallback);
    }
  };

  // --------------------------------------------------
  // STATS AND FILTERS
  // --------------------------------------------------

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      active: data.filter(
        (item) => item.is_active === true || item.is_active === "true"
      ).length,
      inactive: data.filter(
        (item) => item.is_active === false || item.is_active === "false"
      ).length,
    });
  };

 

const filterData = (data, search, status, serviceCategory) => {
  let filtered = [...data];

  // Search filter
  if (search.trim()) {
    const term = search.toLowerCase().trim();

    filtered = filtered.filter(
      (item) =>
        item.name?.toLowerCase().includes(term) ||
        item.code?.toLowerCase().includes(term) ||
        item.service_category_name?.toLowerCase().includes(term)
    );
  }

  // Status filter
  if (status === "active") {
    filtered = filtered.filter(
      (item) =>
        item.is_active === true || item.is_active === "true"
    );
  } else if (status === "inactive") {
    filtered = filtered.filter(
      (item) =>
        item.is_active === false || item.is_active === "false"
    );
  }

  // Service category filter
  if (serviceCategory !== "all") {
    filtered = filtered.filter((item) => {
      const itemServiceCategoryId =
        item.service_category_id ??
        item.service_category?.id ??
        item.service_category;

      return (
        String(itemServiceCategoryId ?? "") ===
        String(serviceCategory)
      );
    });
  }

  return filtered;
};

useEffect(() => {
  const result = filterData(
    HealthCategoryData,
    searchTerm,
    statusFilter,
    serviceCategoryFilter
  );

  setFilteredData(result);
}, [
  HealthCategoryData,
  searchTerm,
  statusFilter,
  serviceCategoryFilter,
]);

const clearFilters = () => {
  setSearchTerm("");
  setStatusFilter("all");
  setServiceCategoryFilter("all");
};
const availableServiceCategories = ServiceCategoryData.filter(
  (cat) => cat.is_active === true && cat.is_product_sale === true
);


  // --------------------------------------------------
  // FORM CHANGE HANDLERS
  // --------------------------------------------------

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

  const resetForm = () => {
    setCategoryForm({ ...initialCategoryForm });
    setSubCategoryImage(null);
    setAddErrors({});

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateSequence = (value, errors) => {
    const sequence = String(value ?? "").trim();

    if (!sequence) {
      errors.sequence = "Sequence is required";
    } else if (!/^[1-9]\d*$/.test(sequence)) {
      errors.sequence = "Sequence must be a positive integer";
    }
  };


  const getProductCategoryList = async () => {
    const token = getToken();
    if (!token) return;

    setHealthLoading(true);
    setHealthError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/vendors/admin/product-category/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await parseResponse(response);

      if (!response.ok || data.success === false) {
        const message = data.message || "Failed to fetch categories";
        setHealthError(message);
        toast.error(message);
        return;
      }

      const categories = Array.isArray(data.data) ? data.data : [];

      setHealthCategoryData(categories);
      calculateStats(categories);
    } catch (error) {
      console.error("Product Category Fetch Error:", error);
      setHealthError("Something went wrong while fetching categories.");
      toast.error("Failed to fetch product categories");
    } finally {
      setHealthLoading(false);
    }
  };

 

  const getCategoryList = async () => {
    const token = getToken();
    if (!token) return;

    setServiceCategoryLoading(true);
    setServiceCategoryError(null);

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

      if (handleUnauthorized(response)) return;

      const data = await parseResponse(response);

      if (!response.ok || data.success === false) {
        const message = data.message || "Failed to fetch service categories";
        setServiceCategoryError(message);
        toast.error(message);
        return;
      }

      setServiceCategoryData(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Service Category Fetch Error:", error);
      setServiceCategoryError("Something went wrong while fetching data.");
      toast.error("Failed to fetch category data");
    } finally {
      setServiceCategoryLoading(false);
    }
  };

  useEffect(() => {
    getProductCategoryList();
    getCategoryList();
  }, []);

  


  const uploadImage = async (file) => {
    const token = getToken();
    if (!token) return null;

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

      if (handleUnauthorized(response)) return null;

      const data = await parseResponse(response);

      if (!response.ok || data.success === false || !data?.data?.url) {
        toast.error(data.message || "Image upload failed");
        return null;
      }

      return data.data.url;
    } catch (error) {
      console.error("Image Upload Error:", error);
      toast.error("Image upload failed");
      return null;
    }
  };

 

  const AddProductCategory = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const newErrors = {};

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

    validateSequence(categoryForm.sequence, newErrors);

    setAddErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((message) => toast.error(message));
      return;
    }

    const token = getToken();
    if (!token) return;

    setIsSubmitting(true);

    try {
      const imageUrl = await uploadImage(SubCategoryImage);

      if (!imageUrl) return;

      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description,
        is_active: categoryForm.is_active,
        service_category_id: categoryForm.service_category_id,
        image_url: imageUrl,
        code: code,
        sequence: Number(categoryForm.sequence),
      };

      const response = await fetch(
        `${BASE_URL}/vendors/admin/product-category/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(payload),
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await parseResponse(response);

      if (!response.ok || data.success === false) {
        // FIX: Use setAddErrors for the add form.
        // API errors such as duplicate names now show in toast and under inputs.
        showRequestError(
          data,
          "Failed to add product category",
          setAddErrors
        );
        return;
      }

      toast.success(
        data.message || "Product Category Added Successfully"
      );

      setShowCategoryModal(false);
      resetForm();

      await getProductCategoryList();
    } catch (error) {
      console.error("Add Product Category Error:", error);
      toast.error("Something went wrong while adding category");
    } finally {
      setIsSubmitting(false);
    }
  };


  const openEditModal = (item) => {
    setEditForm({
      id: item.id,
      name: item.name || "",
      description: item.description || "",
      image_url: item.image_url || "",
      service_category_id: item.service_category_id || "",
      is_active: item.is_active === true || item.is_active === "true",
      sequence: item.sequence != null ? String(item.sequence) : "",
    });

    setEditImage(null);
    setEditErrors({});
    setEditModal(true);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (IsUpdating) return;

    const newErrors = {};

    if (!editForm.service_category_id) {
      newErrors.service_category_id = "Please select a service category";
    }

    if (!editForm.name.trim()) {
      newErrors.name = "Product category name is required";
    }

    if (!editForm.image_url && !EditImage) {
      newErrors.image_url = "Please upload an image";
    }

    // FIX: Validate editForm.sequence, not categoryForm.sequence.
    validateSequence(editForm.sequence, newErrors);

    setEditErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach((message) => toast.error(message));
      return;
    }

    const token = getToken();
    if (!token) return;

    setIsUpdating(true);

    try {
      let imageUrl = editForm.image_url;

      if (EditImage) {
        imageUrl = await uploadImage(EditImage);
        if (!imageUrl) return;
      }

      const payload = {
        name: editForm.name.trim(),
        description: editForm.description,
        is_active: editForm.is_active,
        service_category_id: editForm.service_category_id,
        image_url: imageUrl,
        sequence: Number(editForm.sequence),
      };

      const response = await fetch(
        `${BASE_URL}/vendors/admin/product-category/?id=${editForm.id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(payload),
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await parseResponse(response);

      if (!response.ok || data.success === false) {
        // FIX: Map API errors to edit form fields and show toast messages.
        showRequestError(
          data,
          "Failed to update product category",
          setEditErrors
        );
        return;
      }

      toast.success(
        data.message || "Product Category Updated Successfully"
      );

      setEditModal(false);
      setEditImage(null);

      if (editFileRef.current) {
        editFileRef.current.value = "";
      }

      await getProductCategoryList();
    } catch (error) {
      console.error("Update Product Category Error:", error);
      toast.error("Something went wrong while updating category");
    } finally {
      setIsUpdating(false);
    }
  };

  // --------------------------------------------------
  // DELETE PRODUCT CATEGORY
  // --------------------------------------------------

  const handleDelete = async (id) => {
    if (isDeleting) return;

    const token = getToken();
    if (!token) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `${BASE_URL}/vendors/admin/product-category/?id=${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (handleUnauthorized(response)) return;

      const data = await parseResponse(response);

      if (!response.ok || data.success === false) {
        toast.error(data.message || "Failed to delete category");
        return;
      }

      toast.success(data.message || "Category deleted successfully");

      setDeleteModal(false);
      setCategoryId(null);

      await getProductCategoryList();
    } catch (error) {
      console.error("Delete Category Error:", error);
      toast.error("Something went wrong while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  

  const handleToggle = async (id, currentStatus) => {
    if (isStatusChanging) return;

    const token = getToken();
    if (!token) return;

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

      if (handleUnauthorized(response)) return;

      const data = await parseResponse(response);

      if (!response.ok || data.success === false) {
        toast.error(data.message || "Failed to update status");
        return;
      }

      toast.success(
        !currentStatus
          ? "Category Activated Successfully"
          : "Category Deactivated Successfully"
      );

      await getProductCategoryList();
    } catch (error) {
      console.error("Status Update Error:", error);
      toast.error("Something went wrong while updating status");
    } finally {
      setIsStatusChanging(false);
    }
  };

  

  const copyCategoryId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Category ID copied!");
    } catch (error) {
      console.error("Copy ID Error:", error);
      toast.error("Unable to copy category ID");
    }
  };

 
  const exportToExcel = async () => {
    if (!FilteredData.length) {
      toast.warning("No product categories available to export");
      return;
    }

    try {
      toast.info("Preparing Excel file...");

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Product Categories");

      worksheet.columns = [
        { header: "Product Category ID", key: "id", width: 45 },
        { header: "Service Category", key: "service_category_name", width: 28 },
        { header: "Category Name", key: "name", width: 32 },
        { header: "Code", key: "code", width: 15 },
        { header: "Status", key: "is_active", width: 15 },
        { header: "Image", key: "image", width: 25 },
        { header: "Sequence", key: "sequence", width: 15 },
        { header: "Created At", key: "created_at", width: 20 },
      ];

      const headerRow = worksheet.getRow(1);

      headerRow.font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
        size: 12,
      };

      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0D614E" },
      };

      headerRow.alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      headerRow.height = 25;

      for (const item of FilteredData) {
        const row = worksheet.addRow({
          id: item.id || "",
          service_category_name: item.service_category_name || "N/A",
          name: item.name || "",
          code: item.code || "",
          is_active:
            item.is_active === true || item.is_active === "true"
              ? "Active"
              : "Inactive",
          image: item.image_url ? "View Image" : "No Image",
          sequence: item.sequence ?? "",
          created_at: item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "",
        });

        row.height = 65;
        row.alignment = {
          vertical: "middle",
          horizontal: "center",
          wrapText: true,
        };

        if (item.image_url) {
          try {
            const imageResponse = await fetch(item.image_url);

            if (!imageResponse.ok) {
              throw new Error("Unable to fetch image");
            }

            const blob = await imageResponse.blob();

            let extension;
            if (blob.type.includes("jpeg") || blob.type.includes("jpg")) {
              extension = "jpeg";
            } else if (blob.type.includes("png")) {
              extension = "png";
            } else {
              throw new Error("Unsupported image format for Excel embedding");
            }

            const buffer = await blob.arrayBuffer();

            const imageId = workbook.addImage({
              buffer,
              extension,
            });

            worksheet.addImage(imageId, {
              tl: {
                col: 5.15,
                row: row.number - 0.9,
              },
              ext: {
                width: 55,
                height: 55,
              },
            });

            row.getCell(6).value = {
              text: "View Image",
              hyperlink: item.image_url,
            };

            row.getCell(6).font = {
              color: { argb: "FF0563C1" },
              underline: true,
            };
          } catch (imageError) {
            console.warn("Image embedding failed:", imageError);

            row.getCell(6).value = {
              text: "View Image",
              hyperlink: item.image_url,
            };

            row.getCell(6).font = {
              color: { argb: "FF0563C1" },
              underline: true,
            };
          }
        }
      }

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "FFD9E2E0" } },
            left: { style: "thin", color: { argb: "FFD9E2E0" } },
            bottom: { style: "thin", color: { argb: "FFD9E2E0" } },
            right: { style: "thin", color: { argb: "FFD9E2E0" } },
          };
        });
      });

      worksheet.views = [{ state: "frozen", ySplit: 1 }];

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(
        blob,
        `Product_Categories_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      toast.success("Product Categories exported successfully!");
    } catch (error) {
      console.error("Excel Export Error:", error);
      toast.error("Failed to export Excel file");
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <>
      <div className="page-header">
        <h1>Product Category</h1>
        <p className="page-paragraph">
          Manage product categories and their details
        </p>
      </div>

      {/* STATS */}
      <div className="stats2-grid">
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaUsers size={12} />
          </div>
          <div className="stat2-info">
            <h3>Total Categories</h3>
            <div className="stat2-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#28a745" }}>
          <div
            className="stat2-icon"
            style={{ background: "#28a74520", color: "#28a745" }}
          >
            <FaChartLine size={12} />
          </div>
          <div className="stat2-info">
            <h3>Active</h3>
            <div className="stat2-value">{stats.active}</div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#dc3545" }}>
          <div
            className="stat2-icon"
            style={{ background: "#dc354520", color: "#dc3545" }}
          >
            <FaCalendarAlt size={12} />
          </div>
          <div className="stat2-info">
            <h3>Inactive</h3>
            <div className="stat2-value">{stats.inactive}</div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
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
              <button
                type="button"
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

          
<select
  className="status-filter-select"
  value={serviceCategoryFilter}
  onChange={(e) => setServiceCategoryFilter(e.target.value)}
>
  <option value="all">All Service Categories</option>

  {availableServiceCategories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name} ({cat.code})
    </option>
  ))}
</select>


          {(searchTerm || statusFilter !== "all"|| serviceCategoryFilter !== "all") && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={clearFilters}
            >
             <FiTrash2/>
            </button>
          )}
        </div>

        <div className="category-action-buttons">
          <button
            type="button"
            className="add-customer-btn"
            onClick={exportToExcel}
            disabled={!FilteredData.length}
          >
            <FaFileExcel />
            Export Excel
          </button>

          <button
            type="button"
            className="add-customer-btn"
            onClick={() => {
              resetForm();
              setShowCategoryModal(true);
            }}
          >
            <BiPlus />
            Add Product Category
          </button>
        </div>
      </div>

      {/* CATEGORY TABLE */}
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
              <th>Sequence</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {HealthLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={9}>
                    <div className="skeleton-row" />
                  </td>
                </tr>
              ))
            ) : HealthError ? (
              <tr>
                <td
                  colSpan={9}
                  style={{ color: "red", textAlign: "center" }}
                >
                  {HealthError}
                  <button
                    type="button"
                    className="clear-filters-btn"
                    onClick={getProductCategoryList}
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ) : FilteredData.length > 0 ? (
              FilteredData.map((item, index) => {
                const isActive =
                  item.is_active === true || item.is_active === "true";

                return (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{item.name}</strong>

                      {item.id && (
                        <div className="category-id-wrapper">
                          <span className="category-id-text">{item.id}</span>

                          <button
                            type="button"
                            className="copy-id-btn"
                            onClick={() => copyCategoryId(item.id)}
                            title="Copy Category ID"
                          >
                            <FaCopy size={12} />
                          </button>
                        </div>
                      )}
                    </td>

                    <td>
                      <span className="service-category-badge">
                        {item.service_category_name || "N/A"}
                      </span>
                    </td>

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
                          width="30"
                          height="30"
                          style={{
                            objectFit: "cover",
                            borderRadius: "6px",
                            cursor: "pointer",
                            border: "1px solid #e0e0e0",
                          }}
                          onClick={() =>
                            setProductPreviewImage(item.image_url)
                          }
                        />
                      ) : (
                        <span style={{ color: "#999", fontSize: "12px" }}>
                          No image
                        </span>
                      )}
                    </td>

                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => {
                            setSelectedProductCategory(item);
                            setProductCategoryStatusModal(true);
                          }}
                        />
                        <span className="slider round" />
                      </label>
                    </td>

                    <td>{item.sequence ?? "-"}</td>

                    <td style={{ color: "#6b7280", fontSize: "14px" }}>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "-"}
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
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={9}
                  style={{ textAlign: "center", padding: "40px" }}
                >
                  {searchTerm || statusFilter !== "all" ? (
                    <div>
                      <p>No matching categories found</p>
                      <button
                        type="button"
                        className="clear-filters-btn"
                        onClick={clearFilters}
                      >
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <p>
                      No product categories found. Click "Add Product
                      Category" to create one.
                    </p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD CATEGORY MODAL */}
      {showCategoryModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => {
            setShowCategoryModal(false);
            resetForm();
          }}
        >
          <div
            className="prakriti-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="prakriti-modal-header">
              <h2>Add Product Category</h2>

              <button
                type="button"
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
                <label>
                  Service Category <span className="required">*</span>
                </label>

                <select
                  name="service_category_id"
                  value={categoryForm.service_category_id}
                  onChange={handleCategoryChange}
                  className={
                    addErrors.service_category_id ? "error-input" : ""
                  }
                >
                  <option value="">Select Service Category</option>

                  {availableServiceCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>

                {addErrors.service_category_id && (
                  <p className="error-text">
                    {addErrors.service_category_id}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>
                  Product Category Name <span className="required">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryChange}
                  placeholder="Enter product category name"
                  className={addErrors.name ? "error-input" : ""}
                />

                {addErrors.name && (
                  <p className="error-text">{addErrors.name}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  Product Category Code <span className="required">*</span>
                </label>

                <input
                  type="text"
                  name="code"
                  value={categoryForm.code}
                  maxLength={5}
                  onChange={(e) => {
                    const input = e.target.value.toUpperCase();

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
                  placeholder="Enter 5 uppercase letters"
                  className={addErrors.code ? "error-input" : ""}
                />

                {addErrors.code && (
                  <p className="error-text">{addErrors.code}</p>
                )}
              </div>

              <div className="form-group">
                <label>
                  Sequence <span className="required">*</span>
                </label>

                <input
                  type="number"
                  name="sequence"
                  min="1"
                  step="1"
                  value={categoryForm.sequence}
                  onChange={handleCategoryChange}
                  placeholder="Enter sequence"
                  className={addErrors.sequence ? "error-input" : ""}
                />

                {addErrors.sequence && (
                  <p className="error-text">{addErrors.sequence}</p>
                )}
              </div>

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
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setSubCategoryImage(file);
                      setAddErrors((prev) => ({
                        ...prev,
                        image_url: "",
                      }));
                    }}
                  />

                  {SubCategoryImage ? (
                    <div className="banner-preview-wrapper">
                      <div className="banner-preview-left">
                        <img
                          src={URL.createObjectURL(SubCategoryImage)}
                          alt="Category preview"
                          className="banner-preview-image"
                        />
                      </div>

                      <div className="banner-preview-actions">
                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() =>
                            window.open(
                              URL.createObjectURL(SubCategoryImage),
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
                            setSubCategoryImage(null);

                            setAddErrors((prev) => ({
                              ...prev,
                              image_url: "Please upload an image",
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
                    <label
                      htmlFor="categoryUpload"
                      className="upload-label"
                    >
                      <div className="upload-content">
                        <span className="upload-icon">⬆</span>
                        <p>Click to upload category image</p>
                        <span className="upload-hint">PNG, JPG, JPEG</span>
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

      {/* EDIT CATEGORY MODAL */}
      {editModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => {
            setEditModal(false);
            setEditErrors({});
          }}
        >
          <div
            className="prakriti-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="prakriti-modal-header">
              <h2>Edit Product Category</h2>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setEditModal(false);
                  setEditErrors({});
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form
              className="prakriti-form"
              onSubmit={handleUpdateCategory}
            >
              <div className="form-group">
                <label>
                  Service Category <span className="required">*</span>
                </label>

                <select
                  name="service_category_id"
                  value={editForm.service_category_id}
                  onChange={handleEditChange}
                  className={
                    editErrors.service_category_id ? "error-input" : ""
                  }
                >
                  <option value="">Select Service Category</option>

                  {availableServiceCategories.map((cat) => (
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

              <div className="form-group">
                <label>
                  Product Category Name <span className="required">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Enter category name"
                  className={editErrors.name ? "error-input" : ""}
                />

                {editErrors.name && (
                  <p className="error-text">{editErrors.name}</p>
                )}
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
                <label>
                  Sequence <span className="required">*</span>
                </label>

                <input
                  type="number"
                  name="sequence"
                  min="1"
                  step="1"
                  value={editForm.sequence}
                  onChange={handleEditChange}
                  placeholder="Enter sequence"
                  className={editErrors.sequence ? "error-input" : ""}
                />

                {editErrors.sequence && (
                  <p className="error-text">{editErrors.sequence}</p>
                )}
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
                      const file = e.target.files?.[0];
                      if (!file) return;

                      setEditImage(file);

                      setEditErrors((prev) => ({
                        ...prev,
                        image_url: "",
                      }));
                    }}
                  />

                  {EditImage || editForm.image_url ? (
                    <div className="banner-preview-wrapper">
                      <div className="banner-preview-left">
                        <img
                          src={
                            EditImage
                              ? URL.createObjectURL(EditImage)
                              : editForm.image_url
                          }
                          alt="Category preview"
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
                          onClick={() => editFileRef.current?.click()}
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

                            setEditErrors((prev) => ({
                              ...prev,
                              image_url: "Please upload an image",
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
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setEditModal(false);
                    setEditErrors({});
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

      {/* DELETE CONFIRMATION */}
      {deleteModal && (
        <div className="modal" onClick={() => setDeleteModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Are you sure you want to delete this category?</h3>

            <div className="form-buttons">
              <button
                type="button"
                className="otp-btn verify-btn"
                disabled={isDeleting}
                onClick={() => handleDelete(categoryId)}
              >
                {isDeleting ? "Deleting..." : "Yes"}
              </button>

              <button
                type="button"
                disabled={isDeleting}
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

      {/* STATUS CONFIRMATION */}
      {productCategoryStatusModal && selectedProductCategory && (
        <div
          className="activeModal-overlay"
          onClick={() => {
            if (isStatusChanging) return;

            setProductCategoryStatusModal(false);
            setSelectedProductCategory(null);
          }}
        >
          <div
            className="activeModal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="activeModal-close"
              disabled={isStatusChanging}
              onClick={() => {
                setProductCategoryStatusModal(false);
                setSelectedProductCategory(null);
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
                type="button"
                className="activeModal-cancel"
                disabled={isStatusChanging}
                onClick={() => {
                  setProductCategoryStatusModal(false);
                  setSelectedProductCategory(null);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isStatusChanging}
                className={`activeModal-confirm ${
                  selectedProductCategory.is_active
                    ? "deactivate-btn"
                    : "activate-btn"
                }`}
                onClick={async () => {
                  await handleToggle(
                    selectedProductCategory.id,
                    selectedProductCategory.is_active === true ||
                      selectedProductCategory.is_active === "true"
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

      {/* IMAGE PREVIEW */}
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

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setProductPreviewImage("")}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ textAlign: "center", padding: "20px" }}>
              <img
                src={ProductPreviewImage}
                alt="Product category preview"
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
                type="button"
                className="cancel-btn"
                onClick={() => setProductPreviewImage("")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        closeOnClick
        pauseOnHover
      />
    </>
  );
};

export default ProductCategory;
