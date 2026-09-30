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
    FaCopy,
   FaFileExcel,
} from "react-icons/fa";
import { FiTrash2, FiEye, FiUpload } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import ExcelJS from "exceljs";

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
    symptoms: [""],
    sequence:"",
  });

  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    description: "",
    image_url: "",
    service_category_id: "",
    is_active: false,
    symptoms: [""],
    sequence:"",
  });

  const [editErrors, setEditErrors] = useState({});
  const [addErrors, setAddErrors] = useState({});

 
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
  const exportToExcel = async () => {
  if (!FilteredData?.length) {
    toast.error("No health category data available to export");
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Health Categories");

    worksheet.columns = [
      {
        header: "#",
        key: "index",
        width: 8,
      },
      {
        header: "Health Category Name",
        key: "name",
        width: 30,
      },
      {
        header: "Service Category Name",
        key: "service_category_name",
        width: 30,
      },
      {
        header: "Sub Product Category Code",
        key: "code",
        width: 28,
      },
      {
        header: " Health Category ID",
        key: "id",
        width: 40,
      },
      {
        header: "Image Link",
        key: "image",
        width: 45,
      },
      {
        header: "Active Status",
        key: "status",
        width: 18,
      },
    ];

    FilteredData.forEach((item, index) => {
      const row = worksheet.addRow({
        index: index + 1,
        name: item.name || "N/A",
        service_category_name:
          item.service_category_name || "N/A",
        code: item.code || "N/A",
        id: item.id || "N/A",
        image: item.image_url || "N/A",
        status: item.is_active ? "Active" : "Inactive",
      });

      // Clickable Image Link
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

   
    const headerRow = worksheet.getRow(1);

    headerRow.font = {
      bold: true,
      color: { argb: "FFFFFF" },
    };

    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "0D614E" },
    };

    headerRow.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    headerRow.height = 25;

   
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: {
            style: "thin",
            color: { argb: "D1D5DB" },
          },
          left: {
            style: "thin",
            color: { argb: "D1D5DB" },
          },
          bottom: {
            style: "thin",
            color: { argb: "D1D5DB" },
          },
          right: {
            style: "thin",
            color: { argb: "D1D5DB" },
          },
        };

        cell.alignment = {
          vertical: "middle",
        };
      });
    });

    worksheet.getColumn("index").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.getColumn("code").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    worksheet.getColumn("status").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

  
    worksheet.autoFilter = {
      from: "A1",
      to: "G1",
    };

   
    worksheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    const buffer = await workbook.xlsx.writeBuffer();

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `Health_Categories_${new Date()
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
const symptoms = (categoryForm.symptoms || [])
  .map((symptom) => symptom.trim())
  .filter(Boolean);

if (symptoms.length === 0) {
  newErrors.symptoms = "Please add at least one symptom";
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
         symptoms: symptoms,
         sequence:categoryForm.sequence,
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

  if (data?.errors) {

    Object.keys(data.errors).forEach((key) => {
      const errorMessage = data.errors[key][0];

      toast.error(errorMessage);

      setAddErrors((prev) => ({
        ...prev,
        [key]: errorMessage,
      }));
    });

  } else {
    toast.error(data?.message || "Failed to add category");
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
    symptoms: [""], 
    sequence:"",
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

    if (!EditImage && !editForm.image_url) {
      newErrors.image_url = "Please upload an image";
    }

    const symptoms = (editForm.symptoms || [])
      .map((symptom) => symptom.trim())
      .filter(Boolean);

    if (symptoms.length === 0) {
      newErrors.symptoms = "Please add at least one symptom";
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
        symptoms: symptoms,
        sequence:editForm.sequence,
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


  
const addSymptomField = () => {
  setCategoryForm((prev) => ({
    ...prev,
    symptoms: [
      ...(Array.isArray(prev.symptoms) ? prev.symptoms : []),
      "",
    ],
  }));

  setAddErrors((prev) => ({
    ...prev,
    symptoms: "",
  }));
};

const removeSymptomField = (index) => {
  setCategoryForm((prev) => {
    const symptoms = Array.isArray(prev.symptoms)
      ? prev.symptoms
      : [""];

    const updatedSymptoms = symptoms.filter(
      (_, i) => i !== index
    );

    return {
      ...prev,
      symptoms:
        updatedSymptoms.length > 0 ? updatedSymptoms : [""],
    };
  });
};
  const addEditSymptomField = () => {
    setEditForm((prev) => ({
      ...prev,
      symptoms: [...(Array.isArray(prev.symptoms) ? prev.symptoms : []), ""],
    }));
    setEditErrors((prev) => ({ ...prev, symptoms: "" }));
  };

  const removeEditSymptomField = (index) => {
    setEditForm((prev) => {
      const symptoms = Array.isArray(prev.symptoms) ? prev.symptoms : [""];
      const updatedSymptoms = symptoms.filter((_, i) => i !== index);
      return {
        ...prev,
        symptoms: updatedSymptoms.length > 0 ? updatedSymptoms : [""],
      };
    });
  };

  const handleEditSymptomChange = (index, value) => {
    setEditForm((prev) => {
      const updatedSymptoms = Array.isArray(prev.symptoms)
        ? [...prev.symptoms]
        : [""];
      updatedSymptoms[index] = value;
      return { ...prev, symptoms: updatedSymptoms };
    });
    setEditErrors((prev) => ({ ...prev, symptoms: "" }));
  };

  return (
    <>
      <div className="page-header">
        <h1>Health Category</h1>
        <p className="page-paragraph">Manage health categories and their details</p>
      </div>

    
      <div className="stats2-grid">
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={12} />
          </div>
          <div className="stat2-info">
            <h3>Total Categories</h3>
            <div className="stat2-value">{stats.total}</div>
          </div>
        </div>
        <div className="stat2-card" style={{ borderTopColor: "#28a745" }}>
          <div className="stat2-icon" style={{ background: "#28a74520", color: "#28a745" }}>
            <FaChartLine size={12} />
          </div>
          <div className="stat2-info">
            <h3>Active</h3>
            <div className="stat2-value">{stats.active}</div>
          </div>
        </div>
        <div className="stat2-card" style={{ borderTopColor: "#dc3545" }}>
          <div className="stat2-icon" style={{ background: "#dc354520", color: "#dc3545" }}>
            <FaCalendarAlt size={12} />
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
               <FiTrash2 />
           </button>
          )}
        </div>
        <div className="category-action-buttons">
           <button
                     className="add-customer-btn"
                      onClick={exportToExcel}
                      disabled={!FilteredData?.length}
                    >
                      <FaFileExcel />
                      Export Excel
                    </button>
                      <button
          className="add-customer-btn"
          onClick={() => {
            resetForm();
            setShowCategoryModal(true);
          }}
        >
          <BiPlus />
          Add Health Category
        </button>

        </div>

      
      </div>


      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Service Category</th>
              <th>Code</th>
                 <th>Status</th>
              <th>Image</th>
            <th> Sequence</th>
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
                    <span className="category-code-badge">{item.code || "N/A"}</span>
                  </td>

                      <td>
               
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
                        onClick={() => setPreviewImage(item.image_url)}
                      />
                    ) : (
                      <span style={{ color: "#999", fontSize: "12px" }}>No image</span>
                    )}
                  </td>
              <td>{item.sequence||"-"}</td>
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
    is_active: item.is_active ?? false,
    symptoms:
      Array.isArray(item.symptoms) && item.symptoms.length > 0
        ? item.symptoms
        : [""],
        sequence:item.sequence||"",
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
                 {ServiceCategoryData
  ?.filter(
    (cat) => cat.is_active === true || cat.is_active === "true"
  )
  .map((cat) => (
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

   
    if (/[^A-Z]/.test(value)) {
      toast.error("Only uppercase letters (A-Z) are allowed");
    }

   
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


 <div className="dynamic-section">
  <div className="section-header">
    <h3>
      Symptoms <span className="required">*</span>
    </h3>

    <button
      type="button"
      onClick={addSymptomField}
      className="add-btn"
    >
      + Add
    </button>
  </div>

  <div className="dynamic-list">
    {(Array.isArray(categoryForm.symptoms)
      ? categoryForm.symptoms
      : [""]
    ).map((symptom, index) => (
      <div className="dynamic-input" key={index}>
        <span>{index + 1}</span>

        <div className="input-wrapper">
          <input
            type="text"
            value={symptom}
            onChange={(e) => {
              const value = e.target.value;

              setCategoryForm((prev) => {
                const updatedSymptoms = Array.isArray(prev.symptoms)
                  ? [...prev.symptoms]
                  : [""];

                updatedSymptoms[index] = value;

                return {
                  ...prev,
                  symptoms: updatedSymptoms,
                };
              });

              setAddErrors((prev) => ({
                ...prev,
                symptoms: "",
              }));
            }}
            placeholder={`Enter symptom ${index + 1}`}
            className={
              addErrors.symptoms && !symptom.trim()
                ? "error-input"
                : ""
            }
          />

          {categoryForm.symptoms.length > 1 && (
            <button
              type="button"
              className="delete-icon-btn"
              onClick={() => removeSymptomField(index)}
              title="Remove symptom"
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      </div>
    ))}
  </div>

  {addErrors.symptoms && (
    <p className="error-text">{addErrors.symptoms}</p>
  )}
</div>
  <div className="form-group">
                <label> Sequence </label>
                <input
                  type="number"
                  name="sequence"
                  value={categoryForm.sequence}
                 onChange={handleCategoryChange}
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
                 {ServiceCategoryData
  ?.filter(
    (cat) => cat.is_active === true || cat.is_active === "true"
  )
  .map((cat) => (
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
                <label>Upload Image  <span className="required">*</span></label>
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
   <p className="error-text">
      {editErrors.image_url}
   </p>
)}
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
  
        
<div className="dynamic-section">
  <div className="section-header">
    <h3>
      Symptoms <span className="required">*</span>
    </h3>

    <button
      type="button"
      onClick={addEditSymptomField}
      className="add-btn"
    >
      + Add
    </button>
  </div>

  <div className="dynamic-list">
    {(editForm.symptoms || [""]).map((symptom, index) => (
      <div className="dynamic-input" key={index}>
        <span>{index + 1}</span>

        <div className="input-wrapper">
          <input
            type="text"
            value={symptom}
            onChange={(e) =>
              handleEditSymptomChange(index, e.target.value)
            }
            placeholder={`Enter symptom ${index + 1}`}
            className={
              editErrors.symptoms && !symptom.trim()
                ? "error-input"
                : ""
            }
          />

          <button
            type="button"
            className="delete-icon-btn"
            onClick={() => removeEditSymptomField(index)}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    ))}
  </div>

  {editErrors.symptoms && (
    <p className="error-text">{editErrors.symptoms}</p>
  )}
</div>
<div className="form-group">
                <label>Sequence  </label>
                <input
                  type="number"
                  name="sequence"
                  value={editForm.sequence}
                  onChange={handleEditChange}
                  placeholder="Enter Sequence for the health Category"
                 
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
        
          

              <div className="form-buttons">
        <button
          className="otp-btn verify-btn"
             disabled={isDeleting}
          onClick={() => {
            handleDelete(categoryId);
            setDeleteModal(false);
          }}
        >
        {isDeleting ? "Deleting..." : "Yes"}
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
           <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export default Healthcategory;