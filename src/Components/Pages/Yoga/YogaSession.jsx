import React, { useState, useEffect } from 'react';

import { FaThLarge, FaCheckCircle, FaTimesCircle,FaEdit,FaTimes,FaClock } from "react-icons/fa";
import { FiTrash2 } from 'react-icons/fi';



import {
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaSearch,
} from "react-icons/fa";

import { BiPlus } from "react-icons/bi";

import { MdFilterAltOff } from "react-icons/md";

import { HiOutlineFilter } from "react-icons/hi";


import { FiEye } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { ToastContainer,toast} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import { FiUpload } from 'react-icons/fi';

const YogaSession = () => {

  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const[YogaSessionData,setYogaSessionData]=useState([]);
  const[YogaSessionError,setYogaSessionError]=useState(null);
  const[YogaSessionLoading,setYogaSessionLoading]=useState(false);
  const[PreviewImage,setPreviewImage]=useState(null);
  const [showYogaVideoModal, setShowYogaVideoModal] = useState(false);
  const [YogaCategoryData, setYogaCategoryData] = useState([]);
  const[YogaCategoryLoading,setYogaCategoryLoading] = useState(false);
  const[YogCategoryError,setYogaCategoryError]=useState(null);
  const [diseaseListData, setDiseaseListData] = useState([]);
const [selectedDiseases, setSelectedDiseases] = useState([]);
const [showDiseaseDropdown, setShowDiseaseDropdown] = useState(false);
const[DiseaseLoading,setDiseeaseLoading]=useState(false);
const[DiseaseError,setDiseaseError]=useState(null);
const [video, setVideo] = useState(null);
const videoRef = useRef(null);
const[deleteModal,setDeleteModal]=useState(false);
const[YogaSessionId,setYogaSessionId]=useState(null);



  

const [videoForm, setVideoForm] = useState({
  yoga_category: "",
  title: "",
  duration_minutes: "",
  difficulty: "",
  video_url: "",
  short_description: "",
  description: "",
    status: "inactive",
   health_diseases: [],
});

const [thumbnail, setThumbnail] = useState(null);

const thumbnailRef = useRef(null);



const handleThumbnailChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  
  if (!file.type.startsWith("image/")) {
    toast.error("Please select an image");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Image size should be less than 5 MB");
    return;
  }

  setThumbnail(file);
};
const handleVideoFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setVideo(file);
};


  
  const handleFilter = () => {
    setIsFilterApplied(true);

  }

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setDifficultyFilter("");



    setIsFilterApplied(false);
  };

  const navigate = useNavigate();
  const handleVideoChange = (e) => {
  const { name, value } = e.target;

  setVideoForm((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleDiseaseChange = (id) => {
  if (selectedDiseases.includes(id)) {
    setSelectedDiseases(
      selectedDiseases.filter((item) => item !== id)
    );
  } else {
    setSelectedDiseases([...selectedDiseases, id]);
  }
};
const resetVideoModal = () => {
  setShowYogaVideoModal(false);

  setVideoForm({
    yoga_category: "",
    title: "",
    duration_minutes: "",
    difficulty: "",
    video_url: "",
    short_description: "",
    description: "",
    status: false,
  });

  setThumbnail(null);
  setVideo(null);
  setSelectedDiseases([]);

  if (thumbnailRef.current) {
    thumbnailRef.current.value = "";
  }

  if (videoRef.current) {
    videoRef.current.value = "";
  }
};

  const getYogasessionlist = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setYogaSessionLoading(true);
   

    try {
      const response = await fetch(
        `${BASE_URL}/yoga/admin/sessions/`,
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
console.log(data);

if (data.status === "success") {
  setYogaSessionData(data.data);
} else {
  toast.error(data.message || "Failed to fetch yoga sessions");
  setYogaSessionError(data.message);
}
    } catch (error) {
      console.error("Category Fetch Error:", error);
      setYogaSessionError("Something went wrong while fetching data.");
      toast.error("Failed to fetch  Yoga category data");
    } finally {
      setYogaSessionLoading(false);
    }
  };
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
console.log(data);

if (data.status === "success") {
  setYogaCategoryData(data.data);
} else {
  toast.error(data.message || "Failed to fetch yoga sessions");
  setYogaCategoryError(data.message);
}
    } catch (error) {
      console.error("Category Fetch Error:", error);
      setYogaCategoryError("Something went wrong while fetching data.");
      toast.error("Failed to fetch  Yoga category data");
    } finally {
      setYogaCategoryLoading(false);
    }
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
        console.error("Upload Error:", error);
        toast.error("Image upload failed");
        return null;
      }
    };
  
  const getdiseaselist = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setYogaCategoryLoading(true);
   

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
console.log("Disease API:", data);
console.log("Disease List:", data.data?.results);

if (data.success) {
  setDiseaseListData(data.data.results);
} else {
  toast.error(data.message);
   setDiseaseError(data.message);
} 
    } catch (error) {
      console.error("Category Fetch Error:", error);
      setDiseaseError("Something went wrong while fetching data.");
      toast.error("Failed to fetch  Yoga category data");
    } finally {
      setDiseeaseLoading(false);
    }
  };
 const handleAddYogaSession = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired");
    navigate("/login");
    return;
  }

  try {
  let thumbnailUrl = "";
let videoUrl = "";

if (thumbnail) {
  thumbnailUrl = await uploadImage(thumbnail);

  if (!thumbnailUrl) {
    toast.error("Thumbnail upload failed");
    return;
  }
}

if (video) {
  videoUrl = await uploadImage(video);

  if (!videoUrl) {
    toast.error("Video upload failed");
    return;
  }
}
    const payload = {
      yoga_category: videoForm.yoga_category,
      title: videoForm.title,
      duration_minutes: Number(videoForm.duration_minutes),
      difficulty: videoForm.difficulty,
       video_url: videoUrl,
      thumbnail_url: thumbnailUrl,
      short_description: videoForm.short_description,
      description: videoForm.description,
      status:videoForm.status ,
      health_diseases: selectedDiseases,
    };

    console.log("Payload:", payload);

    const response = await fetch(`${BASE_URL}/yoga/admin/sessions/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.status === "success") {
      toast.success("Yoga Session Added Successfully");

  resetVideoModal();

      getYogasessionlist();
      
    } else {
      toast.error(data.message || "Failed to add session");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
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

      if (!response.ok || data.success === false) {
        const errorMsg = data?.message || "Failed to delete yoga session";
        toast.error(errorMsg);
        return;
      }

      toast.success(" Yoga session deleted successfully");
      setDeleteModal(false);
      getYogasessionlist();

    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Something went wrong while deleting category");
    }
  };

  useEffect(()=>{
    getYogasessionlist();
    getYogaCategoryList();
    getdiseaselist();

  },[])


  return (
    <>
      <div className="page-header">
        <h1>Yoga Sessions</h1>
        <p className="page-paragraph">
          Manage Yoga Sessions and their details
        </p>
      </div>



      <div className="session-header">

        <div></div>



      </div>


      <div className="stats2-grid">
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={24} />
          </div>
          <div className="stat2-info">
            <h3>Total Yoga Sesssion</h3>
            <div className="stat2-value">0 </div>
          </div>
        </div>
        <div className="stat2-card" style={{ borderTopColor: "#28a745" }}>
          <div className="stat2-icon" style={{ background: "#28a74520", color: "#28a745" }}>
            <FaChartLine size={24} />
          </div>
          <div className="stat2-info">
            <h3>Active</h3>
            <div className="stat2-value"> 0</div>
          </div>
        </div>
        <div className="stat2-card" style={{ borderTopColor: "#dc3545" }}>
          <div className="stat2-icon" style={{ background: "#dc354520", color: "#dc3545" }}>
            <FaCalendarAlt size={24} />
          </div>
          <div className="stat2-info">
            <h3>Inactive</h3>
            <div className="stat2-value">0</div>
          </div>
        </div>
      </div>

      {/* <div className="session-filter">

        <div className="session-search">

          <FaSearch className="session-search-icon" />

          <input
            type="text"
            placeholder="Search session..."
          />

        </div>

        {
          isFilterApplied ?
<button
  className="clear-filter-btn"
  onClick={clearFilters}
>
  <MdFilterAltOff size={18} />
  Remove Filters
</button>
            :

            <button
              className="session-filter-btn"
              onClick={handleFilter}
            >
              <HiOutlineFilter />
              Filter
            </button>

        }

        <select className="session-select">

        <option>All Category</option>

    </select>



        <select className="session-select">

          <option>All Status</option>

          <option>Active</option>

          <option>Inactive</option>

        </select>
       <button
  className="add-session-btn"
  onClick={() => setShowYogaVideoModal(true)}
>
          <BiPlus />
          Add Yoga Session
        </button>



      </div> */}
 <div className="Question-controls">
    <div className="filter-question">
         <button
  className="add-session-btn"
  onClick={() => setShowYogaVideoModal(true)}
>
          <BiPlus />
          Add Yoga Session
        </button>

        </div>
 </div>
     

       <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
    <th>Title</th>
    {/* <th>Duration</th> */}
     <th>Difficulty</th>
   <th>Diseases</th>
  
  
    <th>Status</th>
    <th>Created At</th>
    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {YogaSessionLoading? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td colSpan="7">
                          <div className="skeleton-row"></div>
                        </td>
                      </tr>
                    ))
                  ) : YogaSessionError ? (
                    <tr>
                      <td colSpan="7" style={{ color: "red", textAlign: "center" }}>
                        {YogaSessionError}
                      </td>
                    </tr>
                  ) : YogaSessionData?.length > 0 ? (
                    YogaSessionData.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                       <td>
                    <strong>{item.title}</strong>
                    {item.description && (
                      <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
                        {item.short_description.substring(0, 30)}
                        {item.short_description.length > 30 && "..."}
                      </div>
                    )}
                  </td>
                      
  
                   <td>
  <span
    className={`difficulty-badge ${
      item.difficulty === "beginner"
        ? "difficulty-beginner"
        : item.difficulty === "intermediate"
        ? "difficulty-intermediate"
        : "difficulty-advanced"
    }`}
  >
    {item.difficulty}
  </span>
</td>

<td>
  {item.health_diseases?.length > 0 ? (
    <div className="disease-tags">
      {item.health_diseases.map((disease, index) => (
        <span
          key={disease.id || index}
          className="disease-tag"
        >
          {disease.name || disease}
        </span>
      ))}
    </div>
  ) : (
    <span > No Disease</span>
  )}
</td>
      
                       
                        <td>
                          <span className={`status-badge ${item.is_active ? 'status-active' : 'status-inactive'}`}>
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <br />
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={item.is_active}
                            
                            />
                            <span className="slider round"></span>
                          </label>
                        </td>
                        <td>
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <div className="action-buttons">
                            {/* <button
                              className="action-btn edit"
                             
                              title="Edit"
                            >
                              <FaEdit />
                            </button> */}
        <button
                                                        className="action-btn delete"
                                                        onClick={() => {
                                                          setYogaSessionId(item.id);
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
                                            <td colSpan="6" style={{ textAlign: "center" }}>
                                              No data found
                                            </td>
                                          </tr>
                  )}
                </tbody>
              </table>
            </div>
{showYogaVideoModal && (
  <div className="prakriti-modal-overlay">
    <div className="prakriti-modal">

      <div className="prakriti-modal-header">
        <h2>Add Yoga Session</h2>

        <button
          className="modal-close-btn"
          onClick={() => setShowYogaVideoModal(false)}
        >
          <FaTimes />
        </button>
      </div>

      <form
        className="prakriti-form"
        onSubmit={handleAddYogaSession}
      >

        {/* Category */}
        <div className="form-group">
          <label>
            Category <span className="required">*</span>
          </label>

        <select
  name="yoga_category"
  value={videoForm.yoga_category}
  onChange={handleVideoChange}
>
            <option value="">Select Yoga Category</option>

            {YogaCategoryData?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
  <label>Select Diseases</label>

  <div className="multi-select">

  <div
  className="multi-select-header"
  onClick={() =>
    setShowDiseaseDropdown(!showDiseaseDropdown)
  }
>
  {selectedDiseases.length > 0
    ? diseaseListData
        .filter((item) => selectedDiseases.includes(item.id))
        .map((item) => item.name)
        .join(", ")
    : "Select Diseases"}
</div>

    {showDiseaseDropdown && (
      <div className="multi-select-dropdown">

      {diseaseListData.map((item) => (
  <label
    key={item.id}
    className="checkbox-option"
  >
    <input
      type="checkbox"
      checked={selectedDiseases.includes(item.id)}
      onChange={() => handleDiseaseChange(item.id)}
    />

    <span>{item.name}</span>
  </label>
))}

      </div>
    )}
  </div>
</div>

        {/* Title */}
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
          />
        </div>


        {/* Difficulty */}
        <div className="form-group">
          <label>
            Difficulty <span className="required">*</span>
          </label>

          <select
            name="difficulty"
            value={videoForm.difficulty}
            onChange={handleVideoChange}
          >
            <option value="">Select Difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Video URL */}
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

    {video ? (
      <div className="banner-preview-wrapper">

        <div className="banner-preview-left">
          <video
            src={URL.createObjectURL(video)}
            controls
            className="banner-preview-video"
          />
        </div>

        <div className="banner-preview-actions">

          <button
            type="button"
            className="preview-btn"
            onClick={() =>
              window.open(URL.createObjectURL(video), "_blank")
            }
          >
            <FiEye />
          </button>

          <button
            type="button"
            className="delete-btn-preview"
            onClick={() => {
              setVideo(null);

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
      <label htmlFor="videoUpload" className="upload-label">
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

        {/* Thumbnail */}
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

            {thumbnail ? (
              <div className="banner-preview-wrapper">

                <div className="banner-preview-left">
                  <img
                    src={URL.createObjectURL(thumbnail)}
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
                        URL.createObjectURL(thumbnail),
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

        {/* Short Description */}
        <div className="form-group">
          <label>
            Short Description
          </label>

          <textarea
            rows="2"
            name="short_description"
            value={videoForm.short_description}
            onChange={handleVideoChange}
            placeholder="Short Description"
          />
        </div>

        {/* Description */}
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

        {/* Status */}
        <div className="form-group">
          <label>Status</label>

          <div className="checkbox-row">

           

          <input
  type="checkbox"
  checked={videoForm.status === "active"}
  onChange={(e) =>
    setVideoForm({
      ...videoForm,
      status: e.target.checked ? "active" : "inactive",
    })
  }
/>

<span>{videoForm.status === "active" ? "Active" : "Inactive"}</span>

          </div>
        </div>

        <div className="modal-footer">

          <button
            type="button"
            className="cancel-btn"
        onClick={resetVideoModal}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
          >
            Add Session
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
        Are you sure you want to delete this  Yoga Session?
      </h3>

      <div className="form-buttons">
        <button
          className="otp-btn verify-btn"
          onClick={() => {
            handleDelete(YogaSessionId);
            setDeleteModal(false);
          }}
        >
          Yes
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




    </>
  )
}
export default YogaSession
