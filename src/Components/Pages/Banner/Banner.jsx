import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaImages,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaEye,
  FaLink,
  FaTag,
  FaCalendarAlt,
  FaUserCheck,
} from "react-icons/fa";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { BsPlus } from "react-icons/bs";
import { FiUpload } from "react-icons/fi";
import BASE_URL from "../../../Base";
import { toast } from 'react-toastify';
import './Banner.css'; // We'll create this file for custom styles

const Banner = () => {
  const [BannerData, setBannerData] = useState([]);
  const [BannerLoading, setBannerLoading] = useState(false);
  const [Error, setError] = useState(null);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [addbannerLoading, setaddbannerloading] = useState(false);
  
  const intialbannerform = {
    image_url: null,
    redirect_url: "",
    service_category_id: "",
    is_active: false,
  };
  
  const [bannerForm, setBannerForm] = useState(intialbannerform);
  const [editBannerError, setEditBannerError] = useState({});
  const [CategoryData, setCategoryData] = useState([]);
  const [CategoryLoading, setCategoryLoading] = useState(false);
  const [CategoryError, setCategoryError] = useState(null);
  const navigate = useNavigate();
  const [BannerError, setBannerError] = useState({});
  const [BannerImage, setBannerImage] = useState(null);
  const [ShowDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBannerId, setEditBannerId] = useState(null);
  const [editBannerImage, setEditBannerImage] = useState(null);
  const [DeleteBannerModal, setDeleteBannerModal] = useState(false);
  const [SelectedBanner, setSelectedBanner] = useState(null);
  const [BannerPreviewImage, setBannerPreviewImage] = useState("");
  const [hoveredBanner, setHoveredBanner] = useState(null);

  const initialEditBannerForm = {
    image_url: "",
    redirect_url: "",
    service_category_id: "",
    is_active: false,
  };

  const [editBannerForm, setEditBannerForm] = useState(initialEditBannerForm);

  const resetBannerForm = () => {
    setBannerForm(intialbannerform);
    setBannerImage(null);
    setBannerError({});
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setBannerForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setBannerError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const getCategoryList = async (page = 1) => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }
    setCategoryLoading(true);
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
        setCategoryData(data.data);
      } else {
        toast.error(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Category Fetch Error:", error);
      setCategoryError("Something went wrong while fetching data.");
      toast.error("Failed to fetch category data");
    } finally {
      setCategoryLoading(false);
    }
  };

  const uploadImage = async (file) => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session Expired, Please Login Again");
      navigate("/login");
      return;
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
        return;
      }
      const data = await response.json();
      return data?.data?.url;
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed");
      return null;
    }
  };

  const getBannerList = async () => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }
    setBannerLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/banner/`,
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
        setBannerData(data?.data);
      } else {
        setError(data.message || "Failed to fetch banners");
        toast.error(data.message || "Failed to fetch banners");
      }
    } catch (error) {
      console.error("Banner Fetch Error:", error);
      setError("Something went wrong while fetching banners.");
      toast.error("Failed to fetch banner data");
    } finally {
      setBannerLoading(false);
    }
  };

  useEffect(() => {
    getCategoryList();
    getBannerList();
  }, []);

  const handleEditChange = (e) => {
    const { name, value, checked, type } = e.target;
    setEditBannerForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setEditBannerError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    if (addbannerLoading) return;
    const token = sessionStorage.getItem("superadmin_token");
    const errors = {};
    if (!bannerForm.service_category_id) {
      errors.service_category_id = "Please select a category";
    }
    if (!bannerForm.redirect_url.trim()) {
      errors.redirect_url = "Redirect URL is required";
    }
    if (!BannerImage) {
      errors.image_url = "Banner image is required";
    }
    if (Object.keys(errors).length > 0) {
      setBannerError(errors);
      return;
    }
    setBannerError({});
    setaddbannerloading(true);
    try {
      setBannerLoading(true);
      let uploadedImageUrl = null;
      if (BannerImage) {
        uploadedImageUrl = await uploadImage(BannerImage);
      }
      const payload = {
        image_url: uploadedImageUrl,
        redirect_url: bannerForm.redirect_url,
        service_category_id: bannerForm.service_category_id,
        is_active: bannerForm.is_active,
      };
      const response = await fetch(
        `${BASE_URL}/user/admin/banner/`,
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
        toast.success("Banner Added Successfully");
        setBannerForm({
          image_url: null,
          redirect_url: "",
          service_category_id: "",
          is_active: true,
        });
        setBannerImage(null);
        setShowBannerModal(false);
        getBannerList();
      } else {
        toast.error(data?.message || "Failed to add banner");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setaddbannerloading(false);
    }
  };

  const handleUpdateBanner = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!editBannerForm.service_category_id) {
      errors.service_category_id = "Please select a category";
    }
    if (!editBannerForm.redirect_url.trim()) {
      errors.redirect_url = "Redirect URL is required";
    }
    if (!editBannerImage && !editBannerForm.image_url) {
      errors.image_url = "Banner image is required";
    }
    if (Object.keys(errors).length > 0) {
      setEditBannerError(errors);
      return;
    }
    setEditBannerError({});
    const token = sessionStorage.getItem("superadmin_token");
    try {
      let imageUrl = editBannerForm.image_url;
      if (editBannerImage) {
        imageUrl = await uploadImage(editBannerImage);
      }
      const payload = {
        image_url: imageUrl,
        redirect_url: editBannerForm.redirect_url,
        service_category_id: editBannerForm.service_category_id,
        is_active: editBannerForm.is_active,
      };
      const response = await fetch(
        `${BASE_URL}/user/admin/banner/?id=${editBannerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Banner Updated Successfully");
        setShowEditModal(false);
        getBannerList();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleDeleteBanner = async () => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session Expired,Please ");
      navigate("/login");
      return;
    }
    if (!SelectedBanner) return;
    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/banner/?id=${SelectedBanner.id}`,
        {
          method: "DELETE",
          headers: {
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
      toast.success("Banner deleted successfully 🗑️");
      setDeleteBannerModal(false);
      setSelectedBanner(null);
      getBannerList();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete banner");
    }
  };

  const handleToggleBannerStatus = async (bannerId, currentStatus) => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }
    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/banner/?id=${bannerId}`,
        {
          method: "PATCH",
          headers: {
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
          `Banner ${!currentStatus ? "Activated" : "Deactivated"} Successfully`
        );
        setBannerData(prev =>
          prev.map(item =>
            item.id === bannerId
              ? { ...item, is_active: !currentStatus }
              : item
          )
        );
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  // Calculate statistics
  const totalBanners = BannerData?.length || 0;
  const activeBanners = BannerData?.filter(item => item.is_active).length || 0;
  const inactiveBanners = BannerData?.filter(item => !item.is_active).length || 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Banner Management</h1>
          <p className="page-paragraph">Manage banners, status, and redirects</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            resetBannerForm();
            setShowBannerModal(true);
          }}
        >
          <BsPlus size={16} />
          Add Banner
        </button>
      </div>

      <div className="stats2-grid">
        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaImages size={16} />
          </div>
          <div className="stat2-info">
            <h3>Total Banners</h3>
            <div className="stat2-value">{totalBanners}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaCheckCircle size={16} />
          </div>
          <div className="stat2-info">
            <h3>Active</h3>
            <div className="stat2-value">{activeBanners}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaTimesCircle size={16} />
          </div>
          <div className="stat2-info">
            <h3>Inactive</h3>
            <div className="stat2-value">{inactiveBanners}</div>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th className="banner-col-sno">#</th>
                <th className="banner-col-image">Banner</th>
                <th className="banner-col-category">Category</th>
                <th className="banner-col-redirect">Redirect URL</th>
                <th className="banner-col-status">Status</th>
                <th className="banner-col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {BannerLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6">
                      <div className="banner-skeleton-row"></div>
                    </td>
                  </tr>
                ))
              ) : Error ? (
                <tr>
                  <td colSpan="6" className="banner-error-message">
                    {Error}
                  </td>
                </tr>
              ) : BannerData?.length > 0 ? (
                BannerData.map((item, index) => (
                  <tr 
                    key={item.id}
                    className="banner-table-row"
                    onMouseEnter={() => setHoveredBanner(item.id)}
                    onMouseLeave={() => setHoveredBanner(null)}
                  >
                    <td className="banner-col-sno">
                      <span className="banner-sno">{index + 1}</span>
                    </td>
                    <td className="banner-col-image">
                      <div className="banner-image-wrapper">
                        <img
                          src={item.image_url}
                          alt={`Banner ${index + 1}`}
                          className="banner-thumbnail"
                          onClick={() => setBannerPreviewImage(item.image_url)}
                        />
                        {hoveredBanner === item.id && (
                          <div className="banner-image-overlay">
                            <FaEye onClick={() => setBannerPreviewImage(item.image_url)} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="banner-col-category">
                      <div className="banner-category-badge">
                        <FaTag size={12} />
                        <span>{item.service_category_name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="banner-col-redirect">
                      <div className="banner-redirect-link">
                        <FaLink size={12} />
                        <span title={item.redirect_url}>
                          {item.redirect_url?.length > 30 
                            ? `${item.redirect_url.substring(0, 30)}...` 
                            : item.redirect_url || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="banner-col-status">
                      <div className="banner-status-wrapper">
                        <label className="banner-toggle-switch">
                          <input
                            type="checkbox"
                            checked={item.is_active}
                            onChange={() =>
                              handleToggleBannerStatus(item.id, item.is_active)
                            }
                          />
                          <span className="banner-toggle-slider"></span>
                        </label>
                        <span className={`banner-status-badge ${item.is_active ? 'active' : 'inactive'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="banner-col-actions">
                      <div className="banner-action-buttons">
                        <button
                          className="banner-action-btn edit"
                          onClick={() => {
                            setEditBannerId(item.id);
                            setEditBannerForm({
                              image_url: item.image_url,
                              redirect_url: item.redirect_url || "",
                              service_category_id: item.service_category_id,
                              is_active: item.is_active,
                            });
                            setEditBannerImage(null);
                            setShowEditModal(true);
                          }}
                          title="Edit Banner"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="banner-action-btn delete"
                          onClick={() => {
                            setSelectedBanner(item);
                            setDeleteBannerModal(true);
                          }}
                          title="Delete Banner"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="banner-empty-state">
                    <div className="banner-empty-content">
                      <FaImages size={48} />
                      <h4>No Banners Found</h4>
                      <p>Click the "Add New Banner" button to create your first banner</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>

      {/* Add Banner Modal */}
      {showBannerModal && (
        <div className="banner-modal-overlay"
          onClick={() => {
            resetBannerForm();
            setShowBannerModal(false);
          }}
        >
          <div className="banner-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="banner-modal-header">
              <h2>Add New Banner</h2>
              <button
                className="banner-modal-close"
                onClick={() => {
                  resetBannerForm();
                  setShowBannerModal(false);
                }}
              >
                ✕
              </button>
            </div>

            <form className="banner-form" onSubmit={handleAddBanner}>
              <div className="banner-form-group">
                <label>Category <span className="required">*</span></label>
                <select
                  name="service_category_id"
                  value={bannerForm.service_category_id}
                  onChange={handleChange}
                  className="banner-form-select"
                >
                  <option value="">Select Category</option>
                  {CategoryData
                    ?.filter((cat) => cat.is_active === true)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
                {BannerError.service_category_id && (
                  <p className="banner-error-text">{BannerError.service_category_id}</p>
                )}
              </div>

              <div className="banner-form-group">
                <label>Redirect URL <span className="required">*</span></label>
                <input
                  type="text"
                  name="redirect_url"
                  value={bannerForm.redirect_url}
                  onChange={handleChange}
                  placeholder="https://www.example.com/product"
                  className="banner-form-input"
                />
                {BannerError.redirect_url && (
                  <p className="banner-error-text">{BannerError.redirect_url}</p>
                )}
              </div>

              <div className="banner-form-group">
                <label>Banner Image <span className="required">*</span></label>
                <div className="banner-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    id="bannerUpload"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setBannerImage(file);
                      setBannerForm((prev) => ({
                        ...prev,
                        image_url: file,
                      }));
                    }}
                    className="banner-file-input"
                  />
                  {BannerImage ? (
                    <div className="banner-preview-container">
                      <div className="banner-preview-image-wrapper">
                        <img
                          src={URL.createObjectURL(BannerImage)}
                          alt="Banner preview"
                          className="banner-preview-img"
                        />
                      </div>
                      <div className="banner-preview-actions">
                        <button
                          type="button"
                          className="banner-preview-btn"
                          onClick={() =>
                            window.open(URL.createObjectURL(BannerImage), "_blank")
                          }
                        >
                          <FiEye />
                        </button>
                        <button
                          type="button"
                          className="banner-preview-btn danger"
                          onClick={() => {
                            setBannerImage(null);
                            setBannerForm((prev) => ({
                              ...prev,
                              image_url: null,
                            }));
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="bannerUpload" className="banner-upload-label">
                      <div className="banner-upload-content">
                        <FiUpload size={32} />
                        <p>Click to upload banner image</p>
                        <small>PNG, JPG up to 2MB</small>
                      </div>
                    </label>
                  )}
                </div>
                {BannerError.image_url && (
                  <p className="banner-error-text">{BannerError.image_url}</p>
                )}
              </div>

              <div className="banner-form-group">
                <label>Status</label>
                <div className="banner-checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={bannerForm.is_active}
                    onChange={handleChange}
                    id="bannerActive"
                    className="banner-checkbox"
                  />
                  <label htmlFor="bannerActive" className="banner-checkbox-label">
                    {bannerForm.is_active ? 'Active' : 'Inactive'}
                  </label>
                </div>
              </div>

              <div className="banner-modal-footer">
                <button
                  type="button"
                  className="banner-btn cancel"
                  onClick={() => {
                    resetBannerForm();
                    setShowBannerModal(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="banner-btn submit" disabled={addbannerLoading}>
                  {addbannerLoading ? "Adding..." : "Add Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Banner Modal */}
      {showEditModal && (
        <div className="banner-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="banner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="banner-modal-header">
              <h2>Edit Banner</h2>
              <button className="banner-modal-close" onClick={() => setShowEditModal(false)}>
                ✕
              </button>
            </div>

            <form className="banner-form" onSubmit={handleUpdateBanner}>
              <div className="banner-form-group">
                <label>Category <span className="required">*</span></label>
                <select
                  name="service_category_id"
                  value={editBannerForm.service_category_id}
                  onChange={handleEditChange}
                  className="banner-form-select"
                >
                  <option value="">Select Category</option>
                  {CategoryData?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {editBannerError.service_category_id && (
                  <p className="banner-error-text">{editBannerError.service_category_id}</p>
                )}
              </div>

              <div className="banner-form-group">
                <label>Redirect URL <span className="required">*</span></label>
                <input
                  type="text"
                  name="redirect_url"
                  value={editBannerForm.redirect_url}
                  onChange={handleEditChange}
                  className="banner-form-input"
                />
                {editBannerError.redirect_url && (
                  <p className="banner-error-text">{editBannerError.redirect_url}</p>
                )}
              </div>

              <div className="banner-form-group">
                <label>Banner Image <span className="required">*</span></label>
                <div className="banner-upload-area">
                  <input
                    type="file"
                    accept="image/*"
                    id="editBannerUpload"
                    className="banner-file-input"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setEditBannerImage(file);
                    }}
                  />
                  {(editBannerImage || editBannerForm.image_url) ? (
                    <div className="banner-preview-container">
                      <div className="banner-preview-image-wrapper">
                        <img
                          src={
                            editBannerImage
                              ? URL.createObjectURL(editBannerImage)
                              : editBannerForm.image_url
                          }
                          alt="Banner preview"
                          className="banner-preview-img"
                        />
                      </div>
                      <div className="banner-preview-actions">
                        <button
                          type="button"
                          className="banner-preview-btn"
                          onClick={() =>
                            window.open(
                              editBannerImage
                                ? URL.createObjectURL(editBannerImage)
                                : editBannerForm.image_url,
                              "_blank"
                            )
                          }
                        >
                          <FiEye />
                        </button>
                        <button
                          type="button"
                          className="banner-preview-btn"
                          onClick={() =>
                            document.getElementById("editBannerUpload").click()
                          }
                        >
                          <FiUpload />
                        </button>
                        <button
                          type="button"
                          className="banner-preview-btn danger"
                          onClick={() => {
                            setEditBannerImage(null);
                            setEditBannerForm((prev) => ({
                              ...prev,
                              image_url: "",
                            }));
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="editBannerUpload" className="banner-upload-label">
                      <div className="banner-upload-content">
                        <FiUpload size={32} />
                        <p>Click to upload banner image</p>
                        <small>PNG, JPG</small>
                      </div>
                    </label>
                  )}
                </div>
                {editBannerError.image_url && (
                  <p className="banner-error-text">{editBannerError.image_url}</p>
                )}
              </div>

              <div className="banner-form-group">
                <label>Status</label>
                <div className="banner-checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={editBannerForm.is_active}
                    onChange={handleEditChange}
                    id="editBannerActive"
                    className="banner-checkbox"
                  />
                  <label htmlFor="editBannerActive" className="banner-checkbox-label">
                    {editBannerForm.is_active ? 'Active' : 'Inactive'}
                  </label>
                </div>
              </div>

              <div className="banner-modal-footer">
                <button
                  type="button"
                  className="banner-btn cancel"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="banner-btn submit">
                  Update Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {DeleteBannerModal && (
        <div className="banner-modal-overlay" onClick={() => setDeleteBannerModal(false)}>
          <div className="banner-modal delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="banner-modal-header">
              <h2>Confirm Delete</h2>
              <button className="banner-modal-close" onClick={() => setDeleteBannerModal(false)}>
                ✕
              </button>
            </div>
            <div className="banner-modal-body">
              <div className="banner-delete-icon">🗑️</div>
              <h3>Are you sure you want to delete this banner?</h3>
              <p>This action cannot be undone.</p>
            </div>
            <div className="banner-modal-footer">
              <button
                className="banner-btn cancel"
                onClick={() => setDeleteBannerModal(false)}
              >
                No, Keep It
              </button>
              <button className="banner-btn delete-btn" onClick={handleDeleteBanner}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {BannerPreviewImage && (
        <div
          className="banner-modal-overlay"
          onClick={() => setBannerPreviewImage("")}
        >
          <div className="banner-modal preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="banner-modal-header">
              <h2>Banner Preview</h2>
              <button className="banner-modal-close" onClick={() => setBannerPreviewImage("")}>
                ✕
              </button>
            </div>
            <div className="banner-preview-full">
              <img
                src={BannerPreviewImage}
                alt="Banner preview"
                className="banner-preview-full-image"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Banner;