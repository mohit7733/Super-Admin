import React, { useState, useEffect, useRef } from "react";
import { FaDisease, FaThLarge } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { FaTimesCircle } from "react-icons/fa";
import { BsPlus, BsDownload, BsSearch } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { FiTrash2, FiEye, FiUpload } from "react-icons/fi";
import BASE_URL from "../../../Base";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import './Disease.css';
const Disease = () => {
  const [Loading, setLoading] = useState(false);
  const [Error, setError] = useState(null);
  const [Data, setData] = useState([]);
  const [FilteredData, setFilteredData] = useState([]);
  const [AddDiseaseformModal, setAddDiseaseformModal] = useState(false);
  const [AddcategoryModal, setAddCategoryModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [healthcategoryname, setHealthcategory] = useState("");
  const [Description, setDescription] = useState("");
  const [CategoryCode, setCategoryCode] = useState("");
  const [HealthCategoryImage, setHealthCategoryImage] = useState(null);
  const [HealthCategoryData, setHealthcategoryData] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState(null);
  const [pagesize] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pagesize);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const [currentpage, setCurrentPage] = useState(1);
  const [Nextpage, setNextpage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const navigate = useNavigate();
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(null);
  const [editModal, setEditModal] = useState(false);
  const [editDiseaseId, setEditDiseaseId] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [diseaseErrors, setDiseaseErrors] = useState({});
  const [categoryErrors, setCategoryErrors] = useState({});
  const [ServiceCategoryData, setServiceCategoryData] = useState([]);
  const [ServiceCategoryLoading, setServiceCategoryLoading] = useState(false);
  const [ServiceCategoryError, setServiceCategoryError] = useState(null);
  const [ServicecategoryId, setServiceCategoryId] = useState("");
  const [SelectedDisease, setSelectedDisease] = useState(null);
  const [StatusModal, setStatusModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState(false);

  const diseaseFileRef = useRef(null);
  const healthCategoryInputRef = useRef(null);

  const [editForm, setEditForm] = useState({
    health_category_id: "",
    name: "",
    alternate_name: "",
    description: "",
    prakriti: "",
    symptoms: [""],
    is_active: false,
    image_url: null,
  });

  const [formData, setFormData] = useState({
    health_category_id: "",
    name: "",
    alternate_name: "",
    description: "",
    prakriti: "",
    symptoms: [""],
    is_active: false,
    image_url: null,
    code: "",
  });

  
  const calculateStats = (data) => {
    const total = data?.length || 0;
    const active = data?.filter((item) => item.is_active === true).length || 0;
    const inactive = data?.filter((item) => item.is_active === false).length || 0;
    setStats({ total, active, inactive });
  };

 
  const filterData = (data, search, status) => {
    if (!data) return [];

    let filtered = [...data];

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(term) ||
          item.code?.toLowerCase().includes(term) ||
          item.prakriti?.toLowerCase().includes(term) ||
          item.health_category_name?.toLowerCase().includes(term)
      );
    }

    if (status === "active") {
      filtered = filtered.filter((item) => item.is_active === true);
    } else if (status === "inactive") {
      filtered = filtered.filter((item) => item.is_active === false);
    }

    return filtered;
  };

  const openEditModal = (item) => {
    setEditDiseaseId(item.id);
    setEditForm({
      health_category_id: item.health_category_id || "",
      name: item.name || "",
      alternate_name: item.alternate_name || "",
      description: item.description || "",
      prakriti: item.prakriti || "",
      symptoms: item.symptoms?.length ? item.symptoms : [""],
      is_active: item.is_active || false,
      image_url: item.image_url || null,
    });
    setImageFile(null);
    setEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditSymptom = (index, value) => {
    const updated = [...editForm.symptoms];
    updated[index] = value;
    setEditForm((prev) => ({
      ...prev,
      symptoms: updated,
    }));
  };

  const addEditSymptom = () => {
    setEditForm((prev) => ({
      ...prev,
      symptoms: [...prev.symptoms, ""],
    }));
  };

  const removeEditSymptom = (index) => {
    const updated = editForm.symptoms.filter((_, i) => i !== index);
    setEditForm((prev) => ({
      ...prev,
      symptoms: updated,
    }));
  };

  const validateDiseaseForm = () => {
    let errors = {};

    if (!formData.health_category_id) {
      errors.health_category_id = "Category is required";
    }

    if (!formData.prakriti) {
      errors.prakriti = "Prakriti is required";
    }
if (!formData.name || !formData.name.trim()) {
  errors.name = "Disease name is required";
}
const code = formData.code;

if (!code) {
  errors.code = "Disease code is required";
} 
else if (!/^[A-Z]{5}$/.test(code)) {
  errors.code = "Disease code must be exactly 5 uppercase letters";
}
   
    if (!imageFile) {
      errors.image = "Disease image is required";
    }

    const validSymptoms = formData.symptoms.filter((item) => item.trim() !== "");
    if (validSymptoms.length === 0) {
      errors.symptoms = "At least one symptom is required";
    }

    setDiseaseErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateCategoryForm = () => {
  let errors = {};

  if (!ServicecategoryId) {
    errors.ServicecategoryId = "Please select service category";
  }

  if (!healthcategoryname.trim()) {
    errors.healthcategoryname = "Category name is required";
  }

  const code = CategoryCode;

  if (!code) {
    errors.code = "Disease Code is required";
  } 
  else if (code.length > 10) {
    errors.code = "Code maximum 10 characters allowed";
  } 
  else if (!/^[A-Z]+$/.test(code)) {
    errors.code = "Only uppercase letters are allowed";
  }

  if (!HealthCategoryImage) {
    errors.HealthCategoryImage = "Category image is required";
  }

  setCategoryErrors(errors);

  return Object.keys(errors).length === 0;
};

  const getServiceCategoryList = async () => {
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
        toast.error(data.message || "Failed to get categories");
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

    try {
      setCatLoading(true);

      const response = await fetch(
        `${BASE_URL}/user/admin/health-category/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
        setHealthcategoryData(data.data);
      }
    } catch (error) {
      console.error(error.message);
      setCatError("Something went wrong while fetching categories");
      toast.error("Failed to fetch Category Data");
    } finally {
      setCatLoading(false);
    }
  };

  useEffect(() => {
    getHealthCategoryList();
    getServiceCategoryList();
  }, []);

  const handleCategoryChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "name") {
      setHealthcategory(value);
      setCategoryErrors((prev) => ({
        ...prev,
        healthcategoryname: "",
      }));
    }

    if (name === "description") {
      setDescription(value);
    }

    if (name === "image") {
      setHealthCategoryImage(files[0]);
      setCategoryErrors((prev) => ({
        ...prev,
        HealthCategoryImage: "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setDiseaseErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const getDiseaseList = async (page = 1) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/health-disease/?page=${page}`,
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
        const results = data?.data?.results || [];
        setData(results);
        calculateStats(results);
        setFilteredData(filterData(results, searchTerm, statusFilter));
        setTotalCount(data?.data?.count || 0);
        setNextpage(data?.data?.next);
        setPreviousPage(data?.data?.previous);
        setCurrentPage(page);
      } else {
        toast.error(data.message || "Failed to fetch diseases");
        setError(data.message || "Failed to fetch diseases");
      }
    } catch (err) {
      console.error(err.message);
      toast.error("Failed to fetch Disease Data");
      setError("Something went wrong while fetching disease data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDiseaseList();
  }, []);

  useEffect(() => {
    setFilteredData(filterData(Data, searchTerm, statusFilter));
  }, [Data, searchTerm, statusFilter]);

  const addSymptomField = () => {
    setFormData((prev) => ({
      ...prev,
      symptoms: [...prev.symptoms, ""],
    }));
  };

  const removeSymptomField = (index) => {
    const updatedSymptoms = formData.symptoms.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      symptoms: updatedSymptoms,
    }));
  };

  const handleSymptomChange = (index, value) => {
    const updatedSymptoms = [...formData.symptoms];
    updatedSymptoms[index] = value;
    setFormData((prev) => ({
      ...prev,
      symptoms: updatedSymptoms,
    }));

    if (value.trim() !== "") {
      setDiseaseErrors((prev) => ({
        ...prev,
        symptoms: "",
      }));
    }
  };

  const prakritiTypes = [
    "Vata",
    "Pitta",
    "Kapha",
    "Vata-Pitta",
    "Pitta-Vata",
    "Vata-Kapha",
    "Kapha-Vata",
    "Pitta-Kapha",
    "Kapha-Pitta",
    "Tridosha",
  ];

  const handleToggle = async (id, currentStatus) => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session Expired, please login Again");
      navigate("/login");
      return;
    }

    setIsStatusChanging(true);

    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/health-disease/?id=${id}`,
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

      if (response.ok) {
        toast.success(
          !currentStatus ? "Disease Activated Successfully" : "Disease Deactivated Successfully"
        );
        getDiseaseList(currentpage);
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
      console.error(error);
      toast.error("Image upload failed");
      return null;
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("superadmin_token");
    if (!validateCategoryForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      let uploadedImageUrl = null;
      if (HealthCategoryImage) {
        uploadedImageUrl = await uploadImage(HealthCategoryImage);
        if (!uploadedImageUrl) {
          toast.error("Image upload failed");
          return;
        }
      }

      const payload = {
        name: healthcategoryname.trim(),
        service_category_id: ServicecategoryId,
        description: Description,
        image_url: uploadedImageUrl,
        code: CategoryCode.toUpperCase().trim(),
      };

      const response = await fetch(
        `${BASE_URL}/user/admin/health-category/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

if (response.ok) {
  toast.success("Category Added Successfully");
  setHealthcategory("");
  setCategoryCode("");
  setDescription("");
  setHealthCategoryImage(null);
  setAddCategoryModal(false);
  getHealthCategoryList();
} else {
  if (data?.errors) {
    Object.values(data.errors).forEach((err) => {
      toast.error(Array.isArray(err) ? err[0] : err);
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

  const handleAddDisease = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("superadmin_token");
    if (!validateDiseaseForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      let uploadedImageUrl = null;
      if (imageFile) {
        uploadedImageUrl = await uploadImage(imageFile);
        if (!uploadedImageUrl) {
          toast.error("Image upload failed");
          return;
        }
      }

      const cleanSymptoms = formData.symptoms.filter((item) => item.trim() !== "");

      const payload = {
        health_category_id: formData.health_category_id,
        name: formData.name.trim(),
        code: formData.code.toUpperCase().trim(),
        alternate_name: formData.alternate_name,
        description: formData.description,
        prakriti: formData.prakriti,
        symptoms: cleanSymptoms,
        is_active: formData.is_active,
        image_url: uploadedImageUrl,
      };

      const response = await fetch(
        `${BASE_URL}/user/admin/health-disease/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Disease Added Successfully");
        setFormData({
          health_category_id: "",
          name: "",
          alternate_name: "",
          description: "",
          prakriti: "",
          symptoms: [""],
          code: "",
          is_active: false,
          image_url: null,
        });
        setImageFile(null);
        setAddDiseaseformModal(false);
        getDiseaseList(1);
      } else {
  if (data?.errors) {
    Object.values(data.errors).forEach((err) => {
      toast.error(Array.isArray(err) ? err[0] : err);
    });
  } else {
    toast.error(data?.message || "Failed to add disease");
  }
}
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setDiseaseErrors((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const handleUpdateDisease = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("superadmin_token");

    try {
      setIsUpdating(true);

      let imageUrl = editForm.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          toast.error("Image upload failed");
          return;
        }
      }

      const payload = {
        health_category_id: editForm.health_category_id,
        name: editForm.name.trim(),
        alternate_name: editForm.alternate_name,
        description: editForm.description,
        prakriti: editForm.prakriti,
        symptoms: editForm.symptoms.filter((i) => i.trim() !== ""),
        is_active: editForm.is_active,
        image_url: imageUrl,
      };

      const response = await fetch(
        `${BASE_URL}/user/admin/health-disease/?id=${editDiseaseId}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

    if (response.ok) {
  toast.success("Disease updated successfully");
  setEditModal(false);
  setEditDiseaseId(null);
  setImageFile(null);
  getDiseaseList(currentpage);
} else {
  if (data?.errors) {
    Object.values(data.errors).forEach((err) => {
      toast.error(Array.isArray(err) ? err[0] : err);
    });
  } else {
    toast.error(data?.message || "Update failed");
  }
}
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDiseaseDelete = async (id) => {
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
        `${BASE_URL}/user/admin/health-disease/?id=${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        toast.error("Session expired. Please login again");
        sessionStorage.removeItem("superadmin_token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        toast.error("Failed to delete disease");
        return;
      }

      toast.success("Disease deleted successfully");
      setDeleteConfirmModal(false);
      getDiseaseList(currentpage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete disease");
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <>
      <div className="page-header">
        <h1>Disease Management</h1>
        <p className="page-paragraph">Manage diseases, their category and status</p>
      </div>

      {/* Stats Cards */}
      <div className="stats2-grid">
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaDisease size={24} />
          </div>
          <div className="stat2-info">
            <h3>Total Diseases</h3>
            <div className="stat2-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#28a745" }}>
          <div className="stat2-icon" style={{ background: "#28a74520", color: "#28a745" }}>
            <FaCheckCircle size={24} />
          </div>
          <div className="stat2-info">
            <h3>Active Diseases</h3>
            <div className="stat2-value">{stats.active}</div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#dc3545" }}>
          <div className="stat2-icon" style={{ background: "#dc354520", color: "#dc3545" }}>
            <FaTimesCircle size={24} />
          </div>
          <div className="stat2-info">
            <h3>Inactive Diseases</h3>
            <div className="stat2-value">{stats.inactive}</div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <BsSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, code, prakriti or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm("")}>
                ✕
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
            setFormData({
              health_category_id: "",
              name: "",
              alternate_name: "",
              description: "",
              prakriti: "",
              symptoms: [""],
              is_active: false,
              image_url: null,
              code: "",
            });
            setImageFile(null);
            setDiseaseErrors({});
            setAddDiseaseformModal(true);
          }}
        >
          <BsPlus size={20} />
          Add Disease
        </button>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Disease Name</th>
              <th>Health Category</th>
              <th>Code</th>
              <th>Prakriti</th>
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
                  <td>{(currentpage - 1) * pagesize + index + 1}</td>
                  <td>
                    <strong>{item.name}</strong>
                    {item.alternate_name && (
                      <div style={{ fontSize: "12px", color: "#666" }}>
                        Alt: {item.alternate_name}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className="category-badge">
                      {item.health_category_name || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className="code-badge">{item.code || "N/A"}</span>
                  </td>
                  <td>
                    <span className="prakriti-badge">{item.prakriti || "N/A"}</span>
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
                        onClick={() => setPreviewModal(item.image_url)}
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
                          setSelectedDisease(item);
                          setStatusModal(true);
                        }}
                      />
                      <span className="slider round"></span>
                    </label>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => openEditModal(item)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="action-btn delete"
                        onClick={() => {
                          setSelectedDiseaseId(item.id);
                          setDeleteConfirmModal(true);
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
                      <p>No matching diseases found</p>
                      <button className="clear-filters-btn" onClick={clearFilters}>
                        Clear Filters
                      </button>
                    </div>
                  ) : (
                    <p>No diseases found. Click "Add Disease" to create one.</p>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => getDiseaseList(currentpage - 1)}
              disabled={!previousPage}
              className="pagination-btn"
            >
              Prev
            </button>

            {pages.map((page) => (
              <button
                key={page}
                onClick={() => getDiseaseList(page)}
                className={`pagination-btn ${currentpage === page ? "active" : ""}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => getDiseaseList(currentpage + 1)}
              disabled={!Nextpage}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Add Disease Modal */}
      {AddDiseaseformModal && (
        <div className="prakriti-modal-overlay" onClick={() => {
          setAddDiseaseformModal(false);
          setDiseaseErrors({});
        }}>
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Add Disease</h2>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setAddDiseaseformModal(false);
                  setDiseaseErrors({});
                }}
              >
                ✕
              </button>
            </div>

            <form className="prakriti-form" onSubmit={handleAddDisease}>
              <div className="form-group">
                <label>Health Category <span className="required">*</span></label>
                <div className="category-row">
                  <select
                    name="health_category_id"
                    value={formData.health_category_id}
                    onChange={handleChange}
                    className={diseaseErrors.health_category_id ? "error-input" : ""}
                  >
                    <option value="">Select Health Category</option>
                    {HealthCategoryData?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.code})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="add-category-btn"
                    onClick={() => {
                      setAddCategoryModal(true);
                      setServiceCategoryId("");
                      setHealthcategory("");
                      setCategoryCode("");
                      setDescription("");
                      setHealthCategoryImage(null);
                      setCategoryErrors({});
                    }}
                  >
                    + Add Category
                  </button>
                </div>
                {diseaseErrors.health_category_id && (
                  <p className="error-text">{diseaseErrors.health_category_id}</p>
                )}
              </div>

              <div className="form-group">
                <label>Prakriti <span className="required">*</span></label>
                <select
                  name="prakriti"
                  value={formData.prakriti}
                  onChange={handleChange}
                  className={diseaseErrors.prakriti ? "error-input" : ""}
                >
                  <option value="">Select Prakriti</option>
                  {prakritiTypes.map((prakriti, index) => (
                    <option key={index} value={prakriti}>
                      {prakriti}
                    </option>
                  ))}
                </select>
                {diseaseErrors.prakriti && (
                  <p className="error-text">{diseaseErrors.prakriti}</p>
                )}
              </div>

              <div className="form-group">
                <label>Disease Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  placeholder="Enter disease name"
                  onChange={handleChange}
                  className={diseaseErrors.name ? "error-input" : ""}
                />
                {diseaseErrors.name && (
                  <p className="error-text">{diseaseErrors.name}</p>
                )}
              </div>

              <div className="form-group">
                <label>Alternate Name</label>
                <input
                  type="text"
                  name="alternate_name"
                  value={formData.alternate_name}
                  placeholder="Enter Alternate Name of Disease"
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Disease Code <span className="required">*</span></label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                onChange={(e) => {
  const value = e.target.value.toUpperCase();

  if (/[^A-Z]/.test(value)) {
    toast.error("Disease code should contain only letters (A-Z)");
    return;
  }

  setFormData((prev) => ({
    ...prev,
   code: value.slice(0, 5),
  }));

  setDiseaseErrors((prev) => ({
    ...prev,
    code: "",
  }));
}}
                  placeholder="Enter Category Code (A-Z, Max 5 Letters)"
                  maxLength="5"
                  className={diseaseErrors.code ? "error-input" : ""}
                />
                {diseaseErrors.code && (
                  <p className="error-text">{diseaseErrors.code}</p>
                )}
              </div>

              <div className="form-group">
                <label>Disease Image <span className="required">*</span></label>
                <div className="upload-box1">
                  <input
                    type="file"
                    accept="image/*"
                    id="diseaseUpload"
                    name="image"
                    onChange={handleImageChange}
                  />
                  {imageFile ? (
                    <div className="banner-preview-wrapper">
                      <div className="banner-preview-left">
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="preview"
                          className="banner-preview-image"
                        />
                      </div>
                      <div className="banner-preview-actions">
                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() => window.open(URL.createObjectURL(imageFile), "_blank")}
                        >
                          <FiEye />
                        </button>
                        <button
                          type="button"
                          className="delete-btn-preview"
                          onClick={() => {
                            setImageFile(null);
                            document.getElementById("diseaseUpload").value = "";
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="diseaseUpload" className="upload-label">
                      <div className="upload-content">
                        <span className="upload-icon">⬆</span>
                        <p>Click to upload disease image</p>
                        <span className="upload-hint">PNG, JPG, JPEG (Max 5MB)</span>
                      </div>
                    </label>
                  )}
                </div>
                {diseaseErrors.image && (
                  <p className="error-text">{diseaseErrors.image}</p>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  placeholder="Enter disease description"
                  onChange={handleChange}
                />
              </div>

              <div className="dynamic-section">
                <div className="section-header">
                  <h3>Symptoms <span className="required">*</span></h3>
                  <button type="button" onClick={addSymptomField} className="add-btn">
                    + Add
                  </button>
                </div>

                <div className="dynamic-list">
                  {formData.symptoms.map((item, index) => (
                    <div className="dynamic-input" key={index}>
                      <span>{index + 1}</span>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          placeholder={`Enter symptom ${index + 1}`}
                          value={item}
                          onChange={(e) => handleSymptomChange(index, e.target.value)}
                          className={diseaseErrors.symptoms ? "error-input" : ""}
                        />
                        <button
                          type="button"
                          className="delete-icon-btn"
                          onClick={() => removeSymptomField(index)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {diseaseErrors.symptoms && (
                  <p className="error-text">{diseaseErrors.symptoms}</p>
                )}
              </div>

              <div className="form-group">
                <label>Status</label>
                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <span>{formData.is_active ? "Active" : "Inactive"}</span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setAddDiseaseformModal(false);
                    setDiseaseErrors({});
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Disease"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {AddcategoryModal && (
        <div className="prakriti-modal-overlay" onClick={() => {
          setAddCategoryModal(false);
          setCategoryErrors({});
        }}>
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Add Health Category</h2>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setAddCategoryModal(false);
                  setCategoryErrors({});
                }}
              >
                ✕
              </button>
            </div>

            <form className="prakriti-form" onSubmit={handleAddCategory}>
              <div className="form-group">
                <label>Service Category <span className="required">*</span></label>
                <select
                  value={ServicecategoryId}
                  onChange={(e) => {
                    setServiceCategoryId(e.target.value);
                    setCategoryErrors((prev) => ({
                      ...prev,
                      ServicecategoryId: "",
                    }));
                  }}
                  className={categoryErrors.ServicecategoryId ? "error-input" : ""}
                >
                  <option value="">-- Select Service Category --</option>
                  {ServiceCategoryData.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>
                {categoryErrors.ServicecategoryId && (
                  <p className="error-text">{categoryErrors.ServicecategoryId}</p>
                )}
              </div>

              <div className="form-group">
                <label>Health Category Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter Category Name"
                  value={healthcategoryname}
                  onChange={(e) => {
                    setHealthcategory(e.target.value);
                    setCategoryErrors((prev) => ({
                      ...prev,
                      healthcategoryname: "",
                    }));
                  }}
                  className={categoryErrors.healthcategoryname ? "error-input" : ""}
                />
                {categoryErrors.healthcategoryname && (
                  <p className="error-text">{categoryErrors.healthcategoryname}</p>
                )}
              </div>

              <div className="form-group">
                <label>Category Code <span className="required">*</span></label>
                <input
                  type="text"
                  name="code"
                  value={CategoryCode}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase();
                    value = value.replace(/[^A-Z]/g, "");
                    setCategoryCode(value);
                    setCategoryErrors((prev) => ({
                      ...prev,
                      code: "",
                    }));
                  }}
                  placeholder="Enter Category Code (A-Z, Max 10 Letters)"
                  maxLength="10"
                  className={categoryErrors.code ? "error-input" : ""}
                />
                {categoryErrors.code && (
                  <p className="error-text">{categoryErrors.code}</p>
                )}
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Enter category description"
                  value={Description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Category Image <span className="required">*</span></label>
                <div className="upload-box1">
                  <input
                    ref={healthCategoryInputRef}
                    type="file"
                    accept="image/*"
                    id="healthCategoryUpload"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setHealthCategoryImage(file);
                        setCategoryErrors((prev) => ({
                          ...prev,
                          HealthCategoryImage: "",
                        }));
                      }
                    }}
                  />
                  {HealthCategoryImage ? (
                    <div className="banner-preview-wrapper">
                      <div className="banner-preview-left">
                        <img
                          src={URL.createObjectURL(HealthCategoryImage)}
                          alt="preview"
                          className="banner-preview-image"
                        />
                      </div>
                      <div className="banner-preview-actions">
                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() => window.open(URL.createObjectURL(HealthCategoryImage), "_blank")}
                        >
                          <FiEye />
                        </button>
                        <button
                          type="button"
                          className="delete-btn-preview"
                          onClick={() => {
                            setHealthCategoryImage(null);
                            if (healthCategoryInputRef.current) {
                              healthCategoryInputRef.current.value = "";
                            }
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="healthCategoryUpload" className="upload-label">
                      <div className="upload-content">
                        <span className="upload-icon">⬆</span>
                        <p>Click to upload category image</p>
                        <span className="upload-hint">PNG, JPG, JPEG (Max 5MB)</span>
                      </div>
                    </label>
                  )}
                </div>
                {categoryErrors.HealthCategoryImage && (
                  <p className="error-text">{categoryErrors.HealthCategoryImage}</p>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setAddCategoryModal(false);
                    setHealthcategory("");
                    setCategoryCode("");
                    setDescription("");
                    setHealthCategoryImage(null);
                    setCategoryErrors({});
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Disease Modal */}
      {editModal && (
        <div className="prakriti-modal-overlay" onClick={() => setEditModal(false)}>
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Edit Disease</h2>
              <button className="modal-close-btn" onClick={() => setEditModal(false)}>
                ✕
              </button>
            </div>

            <form className="prakriti-form" onSubmit={handleUpdateDisease}>
              <div className="form-group">
                <label>Health Category <span className="required">*</span></label>
                <select
                  name="health_category_id"
                  value={editForm.health_category_id}
                  onChange={handleEditChange}
                >
                  <option value="">Select Health Category</option>
                  {HealthCategoryData?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Prakriti <span className="required">*</span></label>
                <select
                  name="prakriti"
                  value={editForm.prakriti}
                  onChange={handleEditChange}
                >
                  <option value="">Select Prakriti</option>
                  {prakritiTypes.map((prakriti, index) => (
                    <option key={index} value={prakriti}>
                      {prakriti}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Disease Name <span className="required">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  placeholder="Enter disease name"
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Alternate Name</label>
                <input
                  type="text"
                  name="alternate_name"
                  value={editForm.alternate_name}
                  placeholder="Enter alternate name"
                  onChange={handleEditChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={editForm.description}
                  placeholder="Enter disease description"
                  onChange={handleEditChange}
                />
              </div>

              <div className="dynamic-section">
                <div className="section-header">
                  <h3>Symptoms <span className="required">*</span></h3>
                  <button type="button" onClick={addEditSymptom} className="add-btn">
                    + Add
                  </button>
                </div>

                <div className="dynamic-list">
                  {editForm.symptoms.map((item, index) => (
                    <div className="dynamic-input" key={index}>
                      <span>{index + 1}</span>
                      <div className="input-wrapper">
                        <input
                          type="text"
                          placeholder={`Enter symptom ${index + 1}`}
                          value={item}
                          onChange={(e) => handleEditSymptom(index, e.target.value)}
                        />
                        <button
                          type="button"
                          className="delete-icon-btn"
                          onClick={() => removeEditSymptom(index)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Disease Image</label>
                <div className="upload-box1">
                  <input
                    ref={diseaseFileRef}
                    type="file"
                    accept="image/*"
                    id="editDiseaseUpload"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                      }
                    }}
                  />
                  {(imageFile || editForm.image_url) ? (
                    <div className="banner-preview-wrapper">
                      <div className="banner-preview-left">
                        <img
                          src={
                            imageFile
                              ? URL.createObjectURL(imageFile)
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
                              imageFile
                                ? URL.createObjectURL(imageFile)
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
                            document.getElementById("editDiseaseUpload").click();
                          }}
                        >
                          <FiUpload />
                        </button>
                        <button
                          type="button"
                          className="delete-btn-preview"
                          onClick={() => {
                            setImageFile(null);
                            setEditForm((prev) => ({
                              ...prev,
                              image_url: null,
                            }));
                            if (diseaseFileRef.current) {
                              diseaseFileRef.current.value = "";
                            }
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="editDiseaseUpload" className="upload-label">
                      <div className="upload-content">
                        <span className="upload-icon">⬆</span>
                        <p>Click to upload disease image</p>
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
                    name="is_active"
                    checked={editForm.is_active}
                    onChange={handleEditChange}
                  />
                  <span>{editForm.is_active ? "Active" : "Inactive"}</span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-btn" disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Disease"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

   {deleteConfirmModal && (
  <div className="modal">
    <div className="modal-content">

      <h3>Are you sure you want to delete this disease?</h3>

      <div className="form-buttons">
        
        <button
          className="otp-btn verify-btn"
          onClick={() => {
            handleDiseaseDelete(selectedDiseaseId);
            setDeleteConfirmModal(false);
            setSelectedDiseaseId(null);
          }}
        >
          Yes
        </button>

        <button
          onClick={() => {
            setDeleteConfirmModal(false);
            setSelectedDiseaseId(null);
          }}
        >
          No
        </button>

      </div>

    </div>
  </div>
)}
    
     {StatusModal && SelectedDisease && (
   <div
    className="activeModal-overlay"
    onClick={() => {
      setStatusModal(false);
      setSelectedDisease(null);
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
          setSelectedDisease(null);
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
            SelectedDisease.is_active
              ? "inactive-text"
              : "active-text"
          }
        >
          {SelectedDisease.is_active
            ? " Inactive "
            : " Active "}
        </span>
        this category?
      </p>

      <div className="activeModal-card">
        <h4>{SelectedDisease.name}</h4>
     
      </div>

      <div className="activeModal-footer">
        <button
          className="activeModal-cancel"
          onClick={() => {
            setStatusModal(false);
            setSelectedDisease(null);
          }}
        >
          Cancel
        </button>

        <button
          className={`activeModal-confirm ${
            SelectedDisease.is_active
              ? "deactivate-btn"
              : "activate-btn"
          }`}
          onClick={() => {
        handleToggle(
              SelectedDisease.id,
              SelectedDisease.is_active
            );

            setStatusModal(false);
            setSelectedDisease(null);
          }}
        >
          Yes,{" "}
          {SelectedDisease.is_active
            ? "Deactivate"
            : "Activate"}
        </button>
      </div>

    </div>
  </div>
)}


      {/* Image Preview Modal */}
      {previewModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => setPreviewModal(false)}
        >
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Image Preview</h2>
              <button className="modal-close-btn" onClick={() => setPreviewModal(false)}>
                ✕
              </button>
            </div>
            <div style={{ textAlign: "center", padding: "20px" }}>
              <img
                src={previewModal}
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
              <button className="cancel-btn" onClick={() => setPreviewModal(false)}>
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

export default Disease;