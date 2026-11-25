
import React, { useState, useEffect, useRef } from "react";
import {
  FaThLarge,
  FaTimes,
  FaClock,
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaSearch,
} from "react-icons/fa";

import {
  FiTrash2,
  FiEye,
  FiUpload,
  FiEdit2,
} from "react-icons/fi";

import { BiPlus } from "react-icons/bi";
import { MdFilterAltOff } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import "./YogaSession.css";

const YogaSession = () => {
  const navigate = useNavigate();


  const [isFilterApplied, setIsFilterApplied] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [YogaSessionData, setYogaSessionData] = useState([]);
  const [YogaSessionError, setYogaSessionError] = useState(null);
  const [YogaSessionLoading, setYogaSessionLoading] = useState(false);

  const [YogaCategoryData, setYogaCategoryData] = useState([]);
  const [YogaCategoryLoading, setYogaCategoryLoading] = useState(false);
  const [YogCategoryError, setYogaCategoryError] = useState(null);

  const [diseaseListData, setDiseaseListData] = useState([]);
  const [selectedDiseases, setSelectedDiseases] = useState([]);
  const [showDiseaseDropdown, setShowDiseaseDropdown] = useState(false);
  const [DiseaseLoading, setDiseeaseLoading] = useState(false);
  const [DiseaseError, setDiseaseError] = useState(null);

  const [showYogaVideoModal, setShowYogaVideoModal] = useState(false);

  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const videoRef = useRef(null);
  const thumbnailRef = useRef(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [YogaSessionId, setYogaSessionId] = useState(null);

  const [statusModal, setStatusModal] = useState(false);
  const [SelectedYogasession, setSelectedYogasession] = useState(null);

  const [addSessionLoading, setAddSessionLoading] = useState(false);

  // EDIT STATES
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);

  // PAGINATION
  const pagesize = 5;

  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pagesize);

  const pages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  );

  const [currentpage, setCurrentPage] = useState(1);
  const [Nextpage, setNextpage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  
  const [videoForm, setVideoForm] = useState({
    yoga_category: "",
    title: "",
    duration_minutes: "",
    difficulty: "",
    video_url: "",
    thumbnail_url: "",
    short_description: "",
    description: "",
    status: "inactive",
    health_diseases: [],
  });

 

  const handleVideoChange = (e) => {
    const { name, value } = e.target;

    setVideoForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5 MB");
      e.target.value = "";
      return;
    }

    setThumbnail(file);
  };

  // ================= VIDEO CHANGE =================

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video");
      e.target.value = "";
      return;
    }

    setVideo(file);
  };

  // ================= DISEASE CHANGE =================

  const handleDiseaseChange = (id) => {
    setSelectedDiseases((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      return updated;
    });
  };

  // ================= RESET MODAL =================

  const resetVideoModal = () => {
    setShowYogaVideoModal(false);

    setIsEditMode(false);
    setEditingSessionId(null);

    setVideoForm({
      yoga_category: "",
      title: "",
      duration_minutes: "",
      difficulty: "",
      video_url: "",
      thumbnail_url: "",
      short_description: "",
      description: "",
      status: "inactive",
      health_diseases: [],
    });

    setSelectedDiseases([]);
    setThumbnail(null);
    setVideo(null);
    setShowDiseaseDropdown(false);

    if (thumbnailRef.current) {
      thumbnailRef.current.value = "";
    }

    if (videoRef.current) {
      videoRef.current.value = "";
    }
  };

  // ================= GET YOGA SESSION LIST =================

  const getYogasessionlist = async (page = 1) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setYogaSessionLoading(true);
    setYogaSessionError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/yoga/admin/sessions/?page=${page}`,
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

      if (data.status === "success") {
        const sessions = data.data || [];

        setYogaSessionData(sessions);

        setStats({
          total: data.count || 0,
          active: sessions.filter(
            (item) => item.status === "active"
          ).length,
          inactive: sessions.filter(
            (item) => item.status === "inactive"
          ).length,
        });

        setTotalCount(data.count || 0);
        setCurrentPage(page);
        setNextpage(data.next);
        setPreviousPage(data.previous);
      } else {
        toast.error(
          data.message || "Failed to fetch yoga sessions"
        );

        setYogaSessionError(data.message);
      }
    } catch (error) {
      console.error("Yoga Session Fetch Error:", error);

      setYogaSessionError(
        "Something went wrong while fetching data."
      );

      toast.error("Failed to fetch yoga session data");
    } finally {
      setYogaSessionLoading(false);
    }
  };

  // ================= GET YOGA CATEGORY =================

  const getYogaCategoryList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setYogaCategoryLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/yoga/admin/categories/`,
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

      if (data.status === "success") {
        setYogaCategoryData(data.data || []);
      } else {
        toast.error(
          data.message || "Failed to fetch yoga categories"
        );

        setYogaCategoryError(data.message);
      }
    } catch (error) {
      console.error("Category Fetch Error:", error);

      setYogaCategoryError(
        "Something went wrong while fetching categories."
      );

      toast.error("Failed to fetch yoga category data");
    } finally {
      setYogaCategoryLoading(false);
    }
  };

  // ================= GET DISEASE LIST =================

  const getdiseaselist = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setDiseeaseLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/health-disease/`,
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
        setDiseaseListData(data.data?.results || []);
      } else {
        toast.error(data.message || "Failed to fetch diseases");
        setDiseaseError(data.message);
      }
    } catch (error) {
      console.error("Disease Fetch Error:", error);

      setDiseaseError(
        "Something went wrong while fetching diseases."
      );

      toast.error("Failed to fetch disease data");
    } finally {
      setDiseeaseLoading(false);
    }
  };

  // ================= UPLOAD IMAGE / VIDEO =================

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

      if (!response.ok) {
        toast.error(data.message || "File upload failed");
        return null;
      }

      return data?.data?.url || null;
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("File upload failed");
      return null;
    }
  };

  // ================= EDIT YOGA SESSION =================

  const handleEditYogaSession = (item) => {
    const diseaseIds = (item.health_diseases || [])
      .map((disease) =>
        typeof disease === "object"
          ? disease.id
          : disease
      )
      .filter(Boolean);

    const categoryId =
      typeof item.yoga_category === "object"
        ? item.yoga_category?.id
        : item.yoga_category;

    setIsEditMode(true);
    setEditingSessionId(item.id);

    setVideoForm({
      yoga_category: categoryId || "",
      title: item.title || "",
      duration_minutes: item.duration_minutes ?? "",
      difficulty: item.difficulty || "",
      video_url: item.video_url || "",
      thumbnail_url: item.thumbnail_url || "",
      short_description: item.short_description || "",
      description: item.description || "",
      status: item.status || "inactive",
      health_diseases: diseaseIds,
    });

    setSelectedDiseases(diseaseIds);

    setVideo(null);
    setThumbnail(null);

    if (videoRef.current) {
      videoRef.current.value = "";
    }

    if (thumbnailRef.current) {
      thumbnailRef.current.value = "";
    }

    setShowDiseaseDropdown(false);
    setShowYogaVideoModal(true);
  };

  // ================= ADD / UPDATE YOGA SESSION =================

  const handleAddYogaSession = async (e) => {
    e.preventDefault();

    if (addSessionLoading) return;

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    if (!videoForm.yoga_category) {
      toast.error("Please select yoga category");
      return;
    }

    if (!videoForm.title.trim()) {
      toast.error("Please enter session title");
      return;
    }

    if (!videoForm.difficulty) {
      toast.error("Please select difficulty");
      return;
    }

    if (
      !videoForm.duration_minutes ||
      Number(videoForm.duration_minutes) <= 0
    ) {
      toast.error("Please enter a valid duration");
      return;
    }

    setAddSessionLoading(true);

    try {
      let thumbnailUrl = videoForm.thumbnail_url || "";
      let videoUrl = videoForm.video_url || "";

      // Upload new thumbnail
      if (thumbnail) {
        thumbnailUrl = await uploadImage(thumbnail);

        if (!thumbnailUrl) {
          return;
        }
      }

  
      if (video) {
        videoUrl = await uploadImage(video);

        if (!videoUrl) {
          return;
        }
      }

      const payload = {
        yoga_category: videoForm.yoga_category,
        title: videoForm.title.trim(),
        duration_minutes: Number(videoForm.duration_minutes),
        difficulty: videoForm.difficulty,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        short_description: videoForm.short_description,
        description: videoForm.description,
        status: videoForm.status,
        health_diseases: selectedDiseases,
      };

      console.log("Yoga Session Payload:", payload);

      const url = isEditMode
        ? `${BASE_URL}/yoga/admin/sessions/?id=${editingSessionId}`
        : `${BASE_URL}/yoga/admin/sessions/`;

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
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

      const data = await response.json();

      if (response.ok && data.success === true) {
        toast.success(
          isEditMode
            ? "Yoga Session Updated Successfully"
            : "Yoga Session Added Successfully"
        );

        resetVideoModal();

        getYogasessionlist(currentpage);
      } else {
        toast.error(
          data.message ||
            (isEditMode
              ? "Failed to update yoga session"
              : "Failed to add yoga session")
        );
      }
    } catch (error) {
      console.error("Yoga Session Save Error:", error);
      toast.error("Something went wrong");
    } finally {
      setAddSessionLoading(false);
    }
  };

  // ================= UPDATE STATUS =================

  const updateCategoryStatus = async (id, currentStatus) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const newStatus =
      currentStatus === "active"
        ? "inactive"
        : "active";

    try {
      const response = await fetch(
        `${BASE_URL}/yoga/admin/sessions/?id=${id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            status: newStatus,
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

      if (response.ok) {
        toast.success(
          newStatus === "active"
            ? "Yoga Session Activated Successfully"
            : "Yoga Session Deactivated Successfully"
        );

        getYogasessionlist(currentpage);
      } else {
        toast.error(
          data.message || "Failed to update yoga session status"
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update yoga session status");
    }
  };

  // ================= DELETE YOGA SESSION =================

  const handleDelete = async (id) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/yoga/admin/sessions/?id=${id}`,
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

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || data.success === false || data.status === "error") {
        toast.error(
          data.message || "Failed to delete yoga session"
        );
        return;
      }

      toast.success("Yoga session deleted successfully");

      setDeleteModal(false);
      setYogaSessionId(null);

      const nextPage =
        YogaSessionData.length === 1 && currentpage > 1
          ? currentpage - 1
          : currentpage;

      getYogasessionlist(nextPage);
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Something went wrong while deleting session");
    }
  };

  // ================= INITIAL API CALLS =================

  useEffect(() => {
    getYogasessionlist();
    getYogaCategoryList();
    getdiseaselist();
  }, []);

  // ================= FILTER DATA =================

  const filteredYogaSessions = YogaSessionData.filter((item) => {
    const search = searchTerm.trim().toLowerCase();

    const diseaseNames = (item.health_diseases || [])
      .map((disease) =>
        typeof disease === "object"
          ? disease.name || ""
          : disease
      )
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !search ||
      item.title?.toLowerCase().includes(search) ||
      item.short_description?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      diseaseNames.includes(search);

    const categoryId =
      typeof item.yoga_category === "object"
        ? item.yoga_category?.id
        : item.yoga_category;

    const matchesCategory =
      !categoryFilter ||
      String(categoryId) === String(categoryFilter);

    const matchesDifficulty =
      !difficultyFilter ||
      item.difficulty === difficultyFilter;

    const matchesStatus =
      !statusFilter ||
      item.status === statusFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDifficulty &&
      matchesStatus
    );
  });

  // ================= RENDER =================

  return (
    <div className="yoga-session-page">

      {/* PAGE HEADER */}

      <div className="page-header">
        <h1>Yoga Session Management</h1>
        <p className="page-paragraph">
          Manage yoga sessions and their details
        </p>
      </div>

      {/* STATS */}

      <div className="stats2-grid">

        <div
          className="stat2-card"
          style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaUsers size={12} />
          </div>

          <div className="stat2-info">
            <h3>Total Yoga Session</h3>
            <div className="stat2-value">
              {stats.total}
            </div>
          </div>
        </div>

        <div
          className="stat2-card"
          style={{ borderTopColor: "#28a745" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#28a74520",
              color: "#28a745",
            }}
          >
            <FaChartLine size={12} />
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
          style={{ borderTopColor: "#dc3545" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#dc354520",
              color: "#dc3545",
            }}
          >
            <FaCalendarAlt size={12} />
          </div>

          <div className="stat2-info">
            <h3>Inactive</h3>
            <div className="stat2-value">
              {stats.inactive}
            </div>
          </div>
        </div>

      </div>

      {/* TOOLBAR */}

      <div className="yoga-session-toolbar">

        <div className="yoga-session-filters">

          <div className="yoga-search-box">
            <FaSearch />

            <input
              type="text"
              placeholder="Search by session title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="yoga-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>

            {YogaCategoryData.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            className="yoga-filter-select"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <select
            className="yoga-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {(searchTerm ||
            categoryFilter ||
            difficultyFilter ||
            statusFilter) && (
            <button
              type="button"
              className="yoga-clear-filter"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("");
                setDifficultyFilter("");
                setStatusFilter("");
              }}
            >
              <MdFilterAltOff /> Clear
            </button>
          )}

        </div>

        <button
          type="button"
          className="yoga-add-session-btn"
          onClick={() => {
            resetVideoModal();
            setShowYogaVideoModal(true);
          }}
        >
          <BiPlus /> Add Yoga Session
        </button>

      </div>

      {/* TABLE */}

      <div className="yoga-table-card">

        <div className="yoga-table-heading">
          <div>
            <h3>All Yoga Sessions</h3>
            <p>View and manage all your yoga sessions</p>
          </div>

          <span className="yoga-record-count">
            {filteredYogaSessions.length} Sessions
          </span>
        </div>

        <div className="yoga-table-responsive">

          <table className="yoga-professional-table">

            <thead>
              <tr>
                <th>#</th>
                <th>Session Details</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Difficulty</th>
                <th>Health Focus</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {YogaSessionLoading ? (

                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan="9">
                      <div className="yoga-skeleton-row" />
                    </td>
                  </tr>
                ))

              ) : YogaSessionError ? (

                <tr>
                  <td colSpan="9" className="yoga-empty-cell">
                    {YogaSessionError}
                  </td>
                </tr>

              ) : filteredYogaSessions.length > 0 ? (

                filteredYogaSessions.map((item, index) => {

                  const categoryName =
                    item.yoga_category?.name ||
                    item.yoga_category_name ||
                    item.category?.name ||
                    YogaCategoryData.find(
                      (category) =>
                        category.id ===
                        (typeof item.yoga_category === "object"
                          ? item.yoga_category?.id
                          : item.yoga_category)
                    )?.name ||
                    "—";

                  return (
                    <tr key={item.id}>

                      <td className="yoga-row-number">
                        {(currentpage - 1) * pagesize + index + 1}
                      </td>

                      <td>
                        <div className="yoga-session-details">

                          {item.thumbnail_url ? (
                            <img
                              src={item.thumbnail_url}
                              alt={item.title || "Yoga session"}
                              className="yoga-session-thumbnail"
                            />
                          ) : (
                            <div className="yoga-thumbnail-placeholder">
                              <FaThLarge />
                            </div>
                          )}

                          <div className="yoga-session-info">
                            <strong>
                              {item.title || "Untitled Session"}
                            </strong>

                            <span>
                              {item.short_description
                                ? item.short_description.length > 45
                                  ? `${item.short_description.slice(0, 45)}...`
                                  : item.short_description
                                : "No description available"}
                            </span>
                          </div>

                        </div>
                      </td>

                      <td>
                        <span className="yoga-category-label">
                          {categoryName}
                        </span>
                      </td>

                      <td>
                        <span className="yoga-duration">
                          <FaClock />
                          {item.duration_minutes || 0} min
                        </span>
                      </td>

                      <td>
                        <span
                          className={`yoga-difficulty-badge ${
                            item.difficulty === "beginner"
                              ? "beginner"
                              : item.difficulty === "intermediate"
                              ? "intermediate"
                              : "advanced"
                          }`}
                        >
                          {item.difficulty || "—"}
                        </span>
                      </td>

                      <td>
                        <div className="yoga-health-tags">

                          {item.health_diseases?.length > 0 ? (
                            <>
                              {item.health_diseases
                                .slice(0, 2)
                                .map((disease, diseaseIndex) => (
                                  <span
                                    key={
                                      disease.id || diseaseIndex
                                    }
                                  >
                                    {typeof disease === "object"
                                      ? disease.name
                                      : disease}
                                  </span>
                                ))}

                              {item.health_diseases.length > 2 && (
                                <span className="yoga-more-tag">
                                  +{item.health_diseases.length - 2}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="yoga-no-disease">
                              General
                            </span>
                          )}

                        </div>
                      </td>

                      <td>
                        <div className="yoga-status-cell">

                          <span
                            className={`yoga-status-badge ${
                              item.status === "active"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {item.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </span>

                          <label className="yoga-modern-switch">

                            <input
                              type="checkbox"
                              checked={item.status === "active"}
                              onChange={() => {
                                setSelectedYogasession(item);
                                setStatusModal(true);
                              }}
                            />

                            <span className="yoga-switch-slider" />

                          </label>

                        </div>
                      </td>

                      <td className="yoga-created-date">
                        {item.created_at
                          ? new Date(
                              item.created_at
                            ).toLocaleDateString("en-GB")
                          : "—"}
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="yoga-action-buttons">

                          {/* EDIT */}

                          <button
                            type="button"
                            className="yoga-action-edit"
                            title="Edit Yoga Session"
                            onClick={() =>
                              handleEditYogaSession(item)
                            }
                          >
                            <FiEdit2 />
                          </button>

                          {/* DELETE */}

                          <button
                            type="button"
                            className="yoga-action-delete"
                            title="Delete Session"
                            onClick={() => {
                              setYogaSessionId(item.id);
                              setDeleteModal(true);
                            }}
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
                  <td colSpan="9" className="yoga-empty-cell">

                    <div className="yoga-empty-state">
                      <FaThLarge />

                      <h4>No Yoga Sessions Found</h4>

                      <p>
                        Try changing your filters or add a new yoga session.
                      </p>
                    </div>

                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}

        {!YogaSessionLoading && totalPages > 1 && (

          <div className="yoga-pagination">

            <span>
              Page {currentpage} of {totalPages}
            </span>

            <div className="yoga-pagination-buttons">

              <button
                type="button"
                onClick={() => getYogasessionlist(currentpage - 1)}
                disabled={!previousPage}
              >
                Previous
              </button>

              {pages.map((page) => (
                <button
                  type="button"
                  key={page}
                  className={
                    currentpage === page ? "current" : ""
                  }
                  onClick={() => getYogasessionlist(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => getYogasessionlist(currentpage + 1)}
                disabled={!Nextpage}
              >
                Next
              </button>

            </div>

          </div>
        )}

      </div>

      {/* ================= ADD / EDIT MODAL ================= */}

      {showYogaVideoModal && (

        <div className="prakriti-modal-overlay">

          <div className="prakriti-modal">

            <div className="prakriti-modal-header">

              <h2>
                {isEditMode
                  ? "Edit Yoga Session"
                  : "Add Yoga Session"}
              </h2>

              <button
                type="button"
                className="modal-close-btn"
                onClick={resetVideoModal}
              >
                <FaTimes />
              </button>

            </div>

            <form
              className="prakriti-form"
              onSubmit={handleAddYogaSession}
            >

              {/* CATEGORY */}

              <div className="form-group">

                <label>
                  Category <span className="required">*</span>
                </label>

                <select
                  name="yoga_category"
                  value={videoForm.yoga_category}
                  onChange={handleVideoChange}
                  required
                >
                  <option value="">Select Yoga Category</option>

                  {YogaCategoryData.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}

                </select>

              </div>

              {/* DISEASES */}

              <div className="form-group">

                <label>Select Diseases</label>

                <div className="multi-select">

                  <div
                    className="multi-select-header"
                    onClick={() =>
                      setShowDiseaseDropdown(
                        !showDiseaseDropdown
                      )
                    }
                  >
                    {selectedDiseases.length > 0
                      ? diseaseListData
                          .filter((item) =>
                            selectedDiseases.includes(item.id)
                          )
                          .map((item) => item.name)
                          .join(", ")
                      : "Select Diseases"}
                  </div>

                  {showDiseaseDropdown && (

                    <div className="multi-select-dropdown">

                      {DiseaseLoading ? (
                        <p>Loading diseases...</p>
                      ) : DiseaseError ? (
                        <p>{DiseaseError}</p>
                      ) : diseaseListData.length > 0 ? (

                        diseaseListData.map((item) => (

                          <label
                            key={item.id}
                            className="checkbox-option"
                          >

                            <input
                              type="checkbox"
                              checked={selectedDiseases.includes(item.id)}
                              onChange={() =>
                                handleDiseaseChange(item.id)
                              }
                            />

                            <span>{item.name}</span>

                          </label>

                        ))

                      ) : (
                        <p>No diseases available</p>
                      )}

                    </div>

                  )}

                </div>

              </div>

              {/* TITLE */}

              <div className="form-group">

                <label>

                  Title <span className="required">*</span>
                </label>

                <input
                  type="text"
                  name="title"
                  value={videoForm.title}
                  onChange={handleVideoChange}
                  placeholder="Enter session title"
                  required
                />

              </div>

              {/* DURATION */}

              <div className="form-group">

                <label>
                  Duration (Minutes) <span className="required">*</span>
                </label>

                <input
                  type="number"
                  name="duration_minutes"
                  min="1"
                  value={videoForm.duration_minutes}
                  onChange={handleVideoChange}
                  placeholder="Enter duration in minutes"
                  required
                />

              </div>

              {/* DIFFICULTY */}

              <div className="form-group">

                <label>
                  Difficulty <span className="required">*</span>
                </label>

                <select
                  name="difficulty"
                  value={videoForm.difficulty}
                  onChange={handleVideoChange}
                  required
                >
                  <option value="">Select Difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>

              </div>

              {/* VIDEO */}

              <div className="form-group">

                <label>Video</label>

                <div className="upload-box1">

                  <input
                    ref={videoRef}
                    id="videoUpload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                  />

                  {video || videoForm.video_url ? (

                    <div className="banner-preview-wrapper">

                      <div className="banner-preview-left">

                        <video
                          src={
                            video
                              ? URL.createObjectURL(video)
                              : videoForm.video_url
                          }
                          controls
                          className="banner-preview-video"
                        />

                      </div>

                      <div className="banner-preview-actions">

                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() =>
                            window.open(
                              video
                                ? URL.createObjectURL(video)
                                : videoForm.video_url,
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
                            setVideo(null);

                            setVideoForm((prev) => ({
                              ...prev,
                              video_url: "",
                            }));

                            if (videoRef.current) {
                              videoRef.current.value = "";
                            }
                          }}
                        >
                          <FiTrash2 />
                        </button>

                      </div>

                    </div>

                  ) : (

                    <label
                      htmlFor="videoUpload"
                      className="upload-label"
                    >

                      <div className="upload-content">

                        <span className="upload-icon">
                          <FiUpload />
                        </span>

                        <p>Click to upload video</p>

                        <span className="upload-hint">
                          MP4, MOV, AVI
                        </span>

                      </div>

                    </label>

                  )}

                </div>

              </div>

              {/* THUMBNAIL */}

              <div className="form-group">

                <label>Thumbnail</label>

                <div className="upload-box1">

                  <input
                    ref={thumbnailRef}
                    id="thumbnailUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                  />

                  {thumbnail || videoForm.thumbnail_url ? (

                    <div className="banner-preview-wrapper">

                      <div className="banner-preview-left">

                        <img
                          src={
                            thumbnail
                              ? URL.createObjectURL(thumbnail)
                              : videoForm.thumbnail_url
                          }
                          alt="Thumbnail preview"
                          className="banner-preview-image"
                        />

                      </div>

                      <div className="banner-preview-actions">

                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() =>
                            window.open(
                              thumbnail
                                ? URL.createObjectURL(thumbnail)
                                : videoForm.thumbnail_url,
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
                            setThumbnail(null);

                            setVideoForm((prev) => ({
                              ...prev,
                              thumbnail_url: "",
                            }));

                            if (thumbnailRef.current) {
                              thumbnailRef.current.value = "";
                            }
                          }}
                        >
                          <FiTrash2 />
                        </button>

                      </div>

                    </div>

                  ) : (

                    <label
                      htmlFor="thumbnailUpload"
                      className="upload-label"
                    >

                      <div className="upload-content">

                        <span className="upload-icon">
                          <FiUpload />
                        </span>

                        <p>Click to upload thumbnail</p>

                        <span className="upload-hint">
                          PNG, JPG, JPEG (Max 5MB)
                        </span>

                      </div>

                    </label>

                  )}

                </div>

              </div>

              {/* SHORT DESCRIPTION */}

              <div className="form-group">

                <label>Short Description</label>

                <textarea
                  rows="2"
                  name="short_description"
                  value={videoForm.short_description}
                  onChange={handleVideoChange}
                  placeholder="Short Description"
                />

              </div>

              {/* DESCRIPTION */}

              <div className="form-group">

                <label>Description</label>

                <textarea
                  rows="5"
                  name="description"
                  value={videoForm.description}
                  onChange={handleVideoChange}
                  placeholder="Description"
                />

              </div>

              {/* STATUS */}

              <div className="form-group">

                <label>Status</label>

                <div className="checkbox-row">

                  <input
                    type="checkbox"
                    checked={videoForm.status === "active"}
                    onChange={(e) =>
                      setVideoForm((prev) => ({
                        ...prev,
                        status: e.target.checked
                          ? "active"
                          : "inactive",
                      }))
                    }
                  />

                  <span>
                    {videoForm.status === "active"
                      ? "Active"
                      : "Inactive"}
                  </span>

                </div>

              </div>

              {/* FOOTER */}

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetVideoModal}
                  disabled={addSessionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={addSessionLoading}
                >
                  {addSessionLoading
                    ? isEditMode
                      ? "Updating..."
                      : "Adding..."
                    : isEditMode
                    ? "Update Session"
                    : "Add Session"}
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
              Are you sure you want to delete this Yoga Session?
            </h3>

            <div className="form-buttons">

              <button
                className="otp-btn verify-btn"
                onClick={() => handleDelete(YogaSessionId)}
              >
                Yes
              </button>

              <button
                onClick={() => {
                  setDeleteModal(false);
                  setYogaSessionId(null);
                }}
              >
                No
              </button>

            </div>

          </div>

        </div>

      )}

      {/* ================= STATUS CONFIRMATION MODAL ================= */}

      {statusModal && SelectedYogasession && (

        <div
          className="activeModal-overlay"
          onClick={() => {
            setStatusModal(false);
            setSelectedYogasession(null);
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
                setSelectedYogasession(null);
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
                  SelectedYogasession.status === "active"
                    ? "inactive-text"
                    : "active-text"
                }
              >
                {SelectedYogasession.status === "active"
                  ? " Inactive "
                  : " Active "}
              </span>

              this Session?

            </p>

            <div className="activeModal-card">
              <h4>{SelectedYogasession.title}</h4>
            </div>

            <div className="activeModal-footer">

              <button
                className="activeModal-cancel"
                onClick={() => {
                  setStatusModal(false);
                  setSelectedYogasession(null);
                }}
              >
                Cancel
              </button>

              <button
                className={`activeModal-confirm ${
                  SelectedYogasession.status === "active"
                    ? "deactivate-btn"
                    : "activate-btn"
                }`}
                onClick={() => {
                  updateCategoryStatus(
                    SelectedYogasession.id,
                    SelectedYogasession.status
                  );

                  setStatusModal(false);
                  setSelectedYogasession(null);
                }}
              >
                Yes,{" "}
                {SelectedYogasession.status === "active"
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

    </div>
  );
};

export default YogaSession;
