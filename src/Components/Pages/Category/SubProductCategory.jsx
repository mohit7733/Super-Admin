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

const SubProductCategory = () => {
  const [Data, setData] = useState([]);
  const [FilteredData, setFilteredData] = useState([]);
  const [Loading, setLoading] = useState(false);
  const [Error, setError] = useState(null);
  const [ShowCategoryModal, setShowCategoryModal] = useState(false);
  const navigate = useNavigate();

  const [SubCategoryForm, setSubCategoryForm] = useState({
    name: "",
    description: "",
    is_active: false,
    product_id: "",
    image_url: "",
    hsn_code: "",
    code: "",
    tax_class_id: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ServiceCategoryData, setServiceCategoryData] = useState([]);
  const [ServiceCategoryLoading, setServiceCategoryLoading] = useState(false);
  const [ServiceCategoryError, setServiceCategoryError] = useState(null);
  const [SubCategoryData, SetSubCategoryData] = useState([]);
  const [SubCategoryLoading, setSubCategoryLoading] = useState(false);
  const [SubCategoryError, setSubCategoryError] = useState(null);
  const [AddError, setAddError] = useState({});
  const [SubCategoryImage, setSubCategoryImage] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editErrors, setEditErrors] = useState({});
  const [SubproductcategoryPreviewimage, setSubProductCategoryPreviewImage] =
    useState("");
  const [SubproductCategoryStatusModal, setProductSubCategoryStatusModal] =
    useState(false);
  const [selectedSubProductCategory, setSelectedSubProductCategory] =
    useState(null);
  const [isStatusChanging, setIsStatusChanging] = useState(false);
  const [TaxClassData, setTaxClassData] = useState([]);
  const [TaxClassLoading, setTaxClassLoading] = useState(false);
  const [TaxClassError, setTaxClassError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [EditForm, setEditForm] = useState({
    name: "",
    description: "",
    is_active: false,
    product_id: "",
    image_url: "",
    tax_class_id: "",
  });

  const fileInputRef = useRef(null);
  const editFileRef = useRef(null);
  const [EditImage, setEditImage] = useState(null);

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
          item.hsn_code?.toLowerCase().includes(term) ||
          item.product_category_name?.toLowerCase().includes(term)
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

    setSubCategoryForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setAddError((prev) => ({
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
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setIsStatusChanging(true);

    try {
      const response = await fetch(
        `${BASE_URL}/vendors/admin/product-subcategory/?id=${id}`,
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

      await getSubSubProductCategoryList();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsStatusChanging(false);
    }
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

  const handleEdit = (item) => {
    setEditId(item.id);
    setEditForm({
      name: item.name || "",
      description: item.description || "",
      is_active: item.is_active || false,
      product_id: item.product_category_id || "",
      image_url: item.image_url || "",
      tax_class_id: item.tax_class_id || "",
    });
    setEditImage(null);
    setEditErrors({});
    setShowEditModal(true);
  };

  const validateEdit = () => {
    let errors = {};

    if (!EditForm.product_id) {
      errors.product_id = "Product category is required";
    }

    if (!EditForm.tax_class_id) {
      errors.tax_class_id = "Tax class is required";
    }

    if (!EditForm.name || !EditForm.name.trim()) {
      errors.name = "Name is required";
    }
     if (!EditImage && !EditForm.image_url) {
    errors.image_url = "Please upload image";
  }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateSubSubCategory = async (e) => {
    e.preventDefault();

    if (!validateEdit()) return;

    const token = sessionStorage.getItem("superadmin_token");
    setIsSubmitting(true);

    try {
      let imageUrl = EditForm.image_url;

      if (EditImage) {
        imageUrl = await uploadImage(EditImage);
        if (!imageUrl) return toast.error("Image upload failed");
      }

      const payload = {
        product_category_id: EditForm.product_id,
        name: EditForm.name,
        description: EditForm.description,
        image_url: imageUrl,
        is_active: EditForm.is_active,
        tax_class_id: EditForm.tax_class_id,
      };

      const response = await fetch(
        `${BASE_URL}/vendors/admin/product-subcategory/?id=${editId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Updated successfully");
        setShowEditModal(false);
        getSubSubProductCategoryList();
      }else {

  if (data.errors) {

    const apiErrors = {};

    Object.keys(data.errors).forEach((key) => {

      const message = data.errors[key][0];

      apiErrors[key] = message;

      toast.error(message);

    });

    setEditErrors(apiErrors);

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
        `${BASE_URL}/vendors/admin/product-subcategory/?id=${id}`,
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
      getSubSubProductCategoryList();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while deleting");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddSubSubCategory = async (e) => {
    e.preventDefault();

    let errors = {};

    if (!SubCategoryForm.product_id) {
      errors.product_id = "Please select product category";
    }

    if (!SubCategoryForm.tax_class_id) {
      errors.tax_class_id = "Please select tax class";
    }

    if (!SubCategoryForm.name.trim()) {
      errors.name = "Name is required";
    }

    if (!SubCategoryImage) {
      errors.image_url = "Please upload image";
    }

    const hsnCode = SubCategoryForm.hsn_code.trim();
    if (!hsnCode) {
      errors.hsn_code = "HSN Code is required";
    } else if (hsnCode.length !== 8) {
      errors.hsn_code = "HSN Code must be exactly 8 digits";
    }
    const code = SubCategoryForm.code.trim();

if (!code) {
 errors.code = "Please enter product category code";
} else if (code.length !== 5) {
  errors.code = "Code must be exactly 5 characters";
} else if (!/^[A-Z]{5}$/.test(code)) {
  errors.code = "Code must contain only uppercase letters";
}

    setAddError(errors);

    if (Object.keys(errors).length > 0) {
      Object.values(errors).forEach((msg) => toast.error(msg));
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");

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
        product_category_id: SubCategoryForm.product_id,
        tax_class_id: SubCategoryForm.tax_class_id,
        name: SubCategoryForm.name.trim(),
        description: SubCategoryForm.description,
        image_url: imageUrl,
        is_active: SubCategoryForm.is_active,
        hsn_code: SubCategoryForm.hsn_code,
        code: SubCategoryForm.code.toUpperCase().trim(),
      };

      const response = await fetch(
        `${BASE_URL}/vendors/admin/product-subcategory/`,
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
        toast.success("Sub Product Category added successfully");
        setShowCategoryModal(false);
        resetForm();
        getSubSubProductCategoryList();
      } else {

  if (data.errors) {

    const apiErrors = {};

    Object.keys(data.errors).forEach((key) => {
      const message = data.errors[key][0];

      apiErrors[key] = message;

     
      toast.error(message);

      
    });

    setAddError(apiErrors);

  } else {
    toast.error(data.message || "Failed to add category");
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
    setSubCategoryForm({
      name: "",
      description: "",
      is_active: false,
      product_id: "",
      image_url: "",
      hsn_code: "",
      code: "",
      tax_class_id: "",
    });
    setSubCategoryImage(null);
    setAddError({});
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getSubSubProductCategoryList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/vendors/admin/product-subcategory/`,
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
        toast.error(data.message || "Failed to fetch categories");
        setError(data.message || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Product Category Fetch Error:", err);
      setError("Something went wrong while fetching categories.");
      toast.error("Failed to fetch product categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSubSubProductCategoryList();
  }, []);

  useEffect(() => {
    setFilteredData(filterData(Data, searchTerm, statusFilter));
  }, [Data, searchTerm, statusFilter]);

  const getSubProductCategoryList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setSubCategoryLoading(true);

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

      const data = await response.json();

      if (data.success) {
        SetSubCategoryData(data.data || []);
      }
    } catch (err) {
      console.error(err);
      setSubCategoryError("Failed to fetch product categories");
    } finally {
      setSubCategoryLoading(false);
    }
  };

  useEffect(() => {
    getSubProductCategoryList();
    getTaxClasslist();
  }, []);

  const getTaxClasslist = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setTaxClassLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/vendors/admin/unicommerce-tax-class/`,
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
        setTaxClassData(data.data);
      }
    } catch (err) {
      console.error("Tax Class Fetch Error:", err);
      setTaxClassError("Something went wrong while fetching tax classes.");
      toast.error("Failed to fetch tax classes");
    } finally {
      setTaxClassLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <>
      <div className="page-header">
        <h1>Sub Product Category</h1>
        <p className="page-paragraph">Manage sub product categories and their details</p>
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

      {/* Filters and Actions */}
      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, code, HSN or product category..."
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
          Add Sub Product Category
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Product Category</th>
              <th>Code</th>
              <th>HSN Code</th>
              <th>Image</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan="8">
                    <div className="skeleton-row"></div>
                  </td>
                </tr>
              ))
            ) : Error ? (
              <tr>
                <td colSpan="8" style={{ color: "red", textAlign: "center" }}>
                  {Error}
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
                      {item.product_category_name || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className="category-code-badge">{item.code || "N/A"}</span>
                  </td>
                  <td>
                    <span className="hsn-code-badge">{item.hsn_code || "N/A"}</span>
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
                        onClick={() => setSubProductCategoryPreviewImage(item.image_url)}
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
                        onChange={() => {
                          setSelectedSubProductCategory(item);
                          setProductSubCategoryStatusModal(true);
                        }}
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(item)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="action-btn delete"
                        onClick={() => {
                          setDeleteId(item.id);
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
                <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                  {searchTerm || statusFilter !== "all" ? (
                    <div>
                      <p>No matching sub categories found</p>
                      <button className="clear-filters-btn" onClick={clearFilters}>
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <p>No sub product categories found. Click "Add Sub Product Category" to create one.</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {ShowCategoryModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => {
            setShowCategoryModal(false);
            resetForm();
          }}
        >
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Add Sub Product Category</h2>
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

            <form className="prakriti-form" onSubmit={handleAddSubSubCategory}>
              <div className="form-group">
                <label>Product Category <span className="required">*</span></label>
                <select
                  name="product_id"
                  value={SubCategoryForm.product_id}
                  onChange={handleCategoryChange}
                  className={AddError.product_id ? "error-input" : ""}
                >
                  <option value="">Select Product Category</option>
                  {SubCategoryData?.length > 0 ? (
                    SubCategoryData.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.code})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No Product Category Found
                    </option>
                  )}
                </select>
                {AddError.product_id && (
                  <p className="error-text">{AddError.product_id}</p>
                )}
              </div>

              <div className="form-group">
                <label>Tax Class <span className="required">*</span></label>
                <select
                  name="tax_class_id"
                  value={SubCategoryForm.tax_class_id}
                  onChange={handleCategoryChange}
                  className={AddError.tax_class_id ? "error-input" : ""}
                >
                  <option value="">Select Tax Class</option>
                  {TaxClassData?.length > 0 ? (
                    TaxClassData.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.code})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No Tax Class Found
                    </option>
                  )}
                </select>
                {AddError.tax_class_id && (
                  <p className="error-text">{AddError.tax_class_id}</p>
                )}
              </div>

              <div className="form-group">
                <label>Sub Product Category Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={SubCategoryForm.name}
                  onChange={(e) => {
                    handleCategoryChange(e);
                    setAddError((prev) => ({
                      ...prev,
                      name: "",
                    }));
                  }}
                  placeholder="Enter sub category name"
                  className={AddError.name ? "error-input" : ""}
                />
                {AddError.name && <p className="error-text">{AddError.name}</p>}
              </div>

              <div className="form-group">
                <label>HSN Code <span className="required">*</span></label>
                <input
                  type="text"
                  name="hsn_code"
                  value={SubCategoryForm.hsn_code}
               onChange={(e) => {
  const input = e.target.value;

  if (/[^0-9]/.test(input)) {
    toast.error("HSN Code must contain only numbers");
    return;
  }

  const value = input.slice(0, 8);

  setSubCategoryForm((prev) => ({
    ...prev,
    hsn_code: value,
  }));

  setAddError((prev) => ({
    ...prev,
    hsn_code: "",
  }));
}}
                  placeholder="Enter HSN Code (8 digits)"
                  maxLength="8"
                  className={AddError.hsn_code ? "error-input" : ""}
                />
                {AddError.hsn_code && <p className="error-text">{AddError.hsn_code}</p>}
              </div>

            <div className="form-group">
  <label>
    Sub Category Code <span className="required">*</span>
  </label>

  <input
    type="text"
    name="code"
    value={SubCategoryForm.code}
    onChange={(e) => {
      const value = e.target.value.toUpperCase();

      // Number ya special character enter kare to toast
      if (/[^A-Z]/.test(value)) {
        toast.error("Only letters (A-Z) are allowed in sub category code");
        return;
      }

      setSubCategoryForm((prev) => ({
        ...prev,
        code: value.slice(0, 5),
      }));

      setAddError((prev) => ({
        ...prev,
        code: "",
      }));
    }}
    placeholder="Enter sub category code (A-Z, max 5 letters)"
    maxLength={5}
    className={AddError.code ? "error-input" : ""}
  />

  {AddError.code && (
    <p className="error-text">{AddError.code}</p>
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
                        setAddError((prev) => ({
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
                        <p>Click to upload sub product category image</p>
                        <span className="upload-hint">PNG, JPG, JPEG</span>
                      </div>
                    </label>
                  )}
                </div>
                {AddError.image_url && <p className="error-text">{AddError.image_url}</p>}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={SubCategoryForm.description}
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
                    checked={SubCategoryForm.is_active}
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
                  {isSubmitting ? "Adding..." : "Add Sub Product Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="prakriti-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Edit Sub Product Category</h2>
              <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form className="prakriti-form" onSubmit={handleUpdateSubSubCategory}>
              <div className="form-group">
                <label>Product Category <span className="required">*</span></label>
                <select
                  name="product_id"
                  value={EditForm.product_id}
                  onChange={handleEditChange}
                  className={editErrors.product_id ? "error-input" : ""}
                >
                  <option value="">Select Product Category</option>
                  {SubCategoryData?.length > 0 ? (
                    SubCategoryData.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.code})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No Product Category Found
                    </option>
                  )}
                </select>
                {editErrors.product_id && (
                  <p className="error-text">{editErrors.product_id}</p>
                )}
              </div>

              <div className="form-group">
                <label>Tax Class <span className="required">*</span></label>
                <select
                  name="tax_class_id"
                  value={EditForm.tax_class_id}
                  onChange={handleEditChange}
                  className={editErrors.tax_class_id ? "error-input" : ""}
                >
                  <option value="">Select Tax Class</option>
                  {TaxClassData?.length > 0 ? (
                    TaxClassData.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.code})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No Tax Class Found
                    </option>
                  )}
                </select>
                {editErrors.tax_class_id && (
                  <p className="error-text">{editErrors.tax_class_id}</p>
                )}
              </div>

              <div className="form-group">
                <label>Sub Product Category Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={EditForm.name}
                  onChange={handleEditChange}
                  placeholder="Enter category name"
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
                        setEditErrors((prev) => ({
                          ...prev,
                          image_url: "",
                        }));
                      }
                    }}
                  />
                  {(EditImage || EditForm.image_url) ? (
                    <div className="banner-preview-wrapper">
                      <div className="banner-preview-left">
                        <img
                          src={
                            EditImage
                              ? URL.createObjectURL(EditImage)
                              : EditForm.image_url
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
                                : EditForm.image_url,
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
                <label>Description</label>
                <textarea
                  name="description"
                  value={EditForm.description}
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
                    checked={EditForm.is_active}
                    onChange={handleEditChange}
                  />
                  <span>Active</span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
   
  {/* {deleteModal && (
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
      Delete Modal */}
      {deleteModal && (
        <div className="modal" onClick={() => setDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to delete this sub product category?</h3>
         
            <div className="form-buttons">
              <button
              className="otp-btn verify-btn"
                disabled={isDeleting}
                onClick={() => {
                  handleDelete(deleteId);
                }}
              >
                {isDeleting ? "Deleting..." : "Yes"}
              </button>
              <button
               
  
                onClick={() => {
                  
                  setDeleteModal(false);
                  setDeleteId(null);
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

        {SubproductCategoryStatusModal && selectedSubProductCategory && (
        <div
          className="activeModal-overlay"
          onClick={() => {
            setProductSubCategoryStatusModal(false);
            setSelectedSubProductCategory(null);
          }}
        >
          <div
            className="activeModal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="activeModal-close"
              onClick={() => {
                setProductSubCategoryStatusModal(false);
                setSelectedSubProductCategory(null);
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
                  selectedSubProductCategory.is_active
                    ? "inactive-text"
                    : "active-text"
                }
              >
                {selectedSubProductCategory.is_active
                  ? " Inactive "
                  : " Active "}
              </span>
              this Product Category?
            </p>

            <div className="activeModal-card">
              <h4>{selectedSubProductCategory.name}</h4>
            </div>

            <div className="activeModal-footer">
              <button
                className="activeModal-cancel"
                onClick={() => {
                  setProductSubCategoryStatusModal(false);
                  setSelectedSubProductCategory(null);
                }}
              >
                Cancel
              </button>

              <button
                disabled={isStatusChanging}
                className={`activeModal-confirm ${selectedSubProductCategory.is_active
                  ? "deactivate-btn"
                  : "activate-btn"
                  }`}
                onClick={async () => {
                  await handleToggle(
                    selectedSubProductCategory.id,
                    selectedSubProductCategory.is_active
                  );

                  setProductSubCategoryStatusModal(false);
                  setSelectedSubProductCategory(null);
                }}
              >
                {isStatusChanging
                  ? "Updating..."
                  : `Yes, ${selectedSubProductCategory.is_active
                    ? "Deactivate"
                    : "Activate"
                  }`}
              </button>
            </div>
          </div>
        </div>
      )}


   
      {SubproductcategoryPreviewimage && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => setSubProductCategoryPreviewImage("")}
        >
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Image Preview</h2>
              <button
                className="modal-close-btn"
                onClick={() => setSubProductCategoryPreviewImage("")}
              >
                <FaTimes />
              </button>
            </div>
            <div style={{ textAlign: "center", padding: "20px" }}>
              <img
                src={SubproductcategoryPreviewimage}
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
                onClick={() => setSubProductCategoryPreviewImage("")}
              >
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

export default SubProductCategory;