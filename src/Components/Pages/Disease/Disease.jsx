import React, { useState, useEffect, useRef } from "react";
import { FaDisease, FaThLarge } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { FaTimesCircle } from "react-icons/fa";
import { BsPlus, BsDownload ,BsSearch} from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import BASE_URL from "../../../Base";
import { ToastContainer, toast } from "react-toastify"

import './Disease.css';
import { useNavigate } from "react-router-dom";



const Disease = () => {
  const[Loading,setLoading]=useState(false);
  const[Error,setError]=useState(null);
  const[Data,setData]=useState([]);
  const[AddDiseaseformModal,setAddDiseaseformModal]=useState(false);
  const [AddcategoryModal, setAddCategoryModal] = useState(false);
 const [imageFile, setImageFile] = useState(null);
const [healthcategoryname, setHealthcategory] = useState("");
const [Slug, setSlug] = useState("");
const [Description, setDescription] = useState("");
const [HealthCategoryImage, setHealthCategoryImage] =useState(null);
const[HealthCategoryData,setHealthcategoryData]=useState([]);
const [catLoading, setCatLoading] = useState(false);
const [catError, setCatError] = useState(null);
const pagesize = 5;
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

const [editForm, setEditForm] = useState({
  category_id: "",
  name: "",
  alternate_name: "",
  description: "",
  prakriti: "",
  symptoms: [""],
  is_active: false,
  image_url: null,
});
const openEditModal = (item) => {
  setEditDiseaseId(item.id);

  setEditForm({
    category_id: item.category_id,
    name: item.name,
    alternate_name: item.alternate_name,
    description: item.description,
    prakriti: item.prakriti,
    symptoms: item.symptoms?.length ? item.symptoms : [""],
    is_active: item.is_active,
    image_url: item.image_url,
  });

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


   const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    alternate_name: "",
    description: "",
    prakriti: "",
    symptoms: [""],
    is_active:false ,
    image_url:null,
  });

 
const validateDiseaseForm = () => {
  let errors = {};

  if (!formData.category_id) {
    errors.category_id = "Category is required";
    toast.error("Category is required");
  }

  if (!formData.prakriti) {
    errors.prakriti = "Prakriti is required";
    toast.error("Prakriti is required");
  }

  if (!formData.name.trim()) {
    errors.name = "Disease name is required";
    toast.error("Disease name is required");
  }


  if (!imageFile) {
    errors.image = "Disease image is required";
    toast.error("Disease image is required");
  }

  const validSymptoms = formData.symptoms.filter(
    (item) => item.trim() !== ""
  );

  if (validSymptoms.length === 0) {
    errors.symptoms = "At least one symptom is required";
    toast.error("At least one symptom is required");
  }

  setDiseaseErrors(errors);

  return Object.keys(errors).length === 0;
};


const validateCategoryForm = () => {
  let errors = {};

  if (!healthcategoryname.trim()) {
    errors.healthcategoryname =
      "Category name is required";

    toast.error("Category name is required");
  }

  if (!HealthCategoryImage) {
    errors.HealthCategoryImage =
      "Category image is required";

    toast.error("Category image is required");
  }

  setCategoryErrors(errors);

  return Object.keys(errors).length === 0;
};




  const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") 
    .replace(/\s+/g, "_"); 
};




const getCategoryList = async () => {
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

    const data = await response.json();

    console.log("Category API Response:", data);

  
    setHealthcategoryData(data.data );
  } catch (error) {
    console.error(error.message);

    setCatError("Something went wrong while fetching categories");

    toast.error("Failed to fetch Category Data");
  } finally {
    setCatLoading(false);
  }
};

useEffect(() => {
  getCategoryList();
  
}, []);


const getPrakritiAnalysisContent = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/customers/prakriti/analysis-contents/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
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

    console.log("Prakriti Analysis Content Response:", data);

    setData(data.data);
    

  } catch (err) {
    console.error("Prakriti Analysis Fetch Error:", err);
    setError("Something went wrong while fetching data.");
   
  } finally {
    setLoading(false);
  }
};

const handleCategoryChange = (e) => {
  const { name, value, files } = e.target;

  if (name === "name") {
    setHealthcategory(value);
    setSlug(generateSlug(value));

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

    const data = await response.json();

    console.log("Disease API Response:", data);

    setData(data?.data?.results);
    setTotalCount(data?.data?.count);
    setNextpage(data?.data?.next);
    setPreviousPage(data?.data?.previous);
    setCurrentPage(page);

  } catch (err) {
    console.error(err.message);
    toast.error("Failed to fetch Disease Data");
    setError("Something went wrong while fetching disease data.");
  } finally {
    setLoading(false);
  }
};
const addSymptomField = () => {
  setFormData((prev) => ({
    ...prev,
    symptoms: [...prev.symptoms, ""],
  }));
};

const removeSymptomField = (index) => {
  const updatedSymptoms =
    formData.symptoms.filter(
      (_, i) => i !== index
    );

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

useEffect(()=>{
getDiseaseList();
},[])
const handleToggle = async (id, currentStatus) => {
  const token = sessionStorage.getItem("superadmin_token");
  if(!token){
    toast.error("Session Expired,please login Again");
    navigate("/login");
    return;
  }

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
    console.log(data);

    toast.success("Status updated successfully");

    getDiseaseList();
  } catch (error) {
    console.error(error);
    toast.error("Failed to update status");
  }
};



const uploadImage = async (file) => {
  const token = sessionStorage.getItem("superadmin_token");

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

    const data = await response.json();

    console.log("Upload Response:", data);

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
    setLoading(true);

    let uploadedImageUrl = null;

   
    if (HealthCategoryImage) {
      uploadedImageUrl = await uploadImage(
        HealthCategoryImage
      );
    }

   
    const payload = {
      name: healthcategoryname,
      codename: Slug,
      description: Description,
      image_url: uploadedImageUrl,
    };

    console.log("Payload:", payload);

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

    console.log("Category Response:", data);

    if (response.ok) {
      toast.success("Category Added Successfully");

     
      setHealthcategory("");
      setSlug("");
      setDescription("");
      setHealthCategoryImage(null);

      
      setAddCategoryModal(false);

     
      getCategoryList();
    } else {
      toast.error(
        data.message || "Failed to add category"
      );
    }
  } catch (error) {
    console.error(error);

    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};

const handleAddDisease = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem("superadmin_token");
if (!validateDiseaseForm()) {
    return;
  }
  try {
    setLoading(true);

    let uploadedImageUrl = null;

  
    if (imageFile) {
      uploadedImageUrl = await uploadImage(imageFile);
    }

   
    const cleanSymptoms = formData.symptoms.filter(
      (item) => item.trim() !== ""
    );

   
    const payload = {
      category_id: formData.category_id,
      name: formData.name,
      alternate_name: formData.alternate_name,
      description: formData.description,
      prakriti: formData.prakriti,
      symptoms: cleanSymptoms,
      is_active: formData.is_active,
      image_url: uploadedImageUrl,
    };

    console.log("Disease Payload:", payload);

  
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

    console.log("Disease Response:", data);

    if (response.ok) {
      toast.success("Disease Added Successfully");

     
      setFormData({
        category_id: "",
        name: "",
        alternate_name: "",
        description: "",
        prakriti: "",
        symptoms: [""],
        is_active: false,
      });

      setImageFile(null);
      setAddDiseaseformModal(false);

      getDiseaseList();
    } else {
      toast.error(data?.message || "Failed to add disease");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
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
    setLoading(true);

    let imageUrl = editForm.image_url;

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const payload = {
      category_id: editForm.category_id,
      name: editForm.name,
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
        method: "PUT",
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
      toast.error(data?.message || "Update failed");
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};
const handleDiseaseDelete = async (id) => {
  const token = sessionStorage.getItem("superadmin_token");

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

    
    setData((prev) => prev.filter((item) => item.id !== id));

   
    setTotalCount((prev) => prev - 1);

    toast.success("Disease deleted successfully");

  } catch (error) {
    console.error(error);
    toast.error("Failed to delete disease");
  }
};


  return (
    <>
      <div className="page-header">
        <h1>Disease Management</h1>
        <p className="page-paragraph">
          Manage diseases, their category and status
        </p>
      </div>

          <div className="vendors-stats stats2-grid">
            <div className="stat2-card">
              <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                <FaDisease size={24} />
              </div>
              <div className="stat2-info">
                <h3>Total Review</h3>
                <div className="stat2-value">0</div>
              </div>
            </div>
    
            <div className="stat2-card">
              <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                <FaCheckCircle size={24} />
              </div>
              <div className="stat2-info">
                <h3>Active Review</h3>
                <div className="stat2-value">0</div>
              </div>
            </div>
    
            <div className="stat2-card">
              <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
              <FaTimesCircle size={24} />
              </div>
              <div className="stat2-info">
                <h3>Inactive Review</h3>
                <div className="stat2-value">0</div>
              </div>
            </div>
    
          </div>
  <div className="controls-section">
        {/* <div className="search-wrapper">
          <BsSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by ..."
            className="search-input"
          />
        </div> */}

      

  
      </div>
          <div className="table-wrapper">
              <table className="data-table" >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Diseases</th>
                    <th>category</th>                
                   <th>prakriti</th>
                     <th>Status</th>  
                    <th>Actions</th>
      
                  </tr>
                </thead>
<tbody>
  {Loading ? (
    Array(3).fill(0).map((_, i) => (
      <tr key={i}>
        <td colSpan="6">
          <div className="skeleton-row"></div>
        </td>
      </tr>
    ))
  ) : Error ? (
    <tr>
      <td colSpan="6" style={{ color: "red" }}>
        {Error}
      </td>
    </tr>
  ) : Data?.length > 0 ? (
    Data.map((item, index) => (
      <tr key={item.id}>
        <td>{index + 1}</td>

       
        <td>{item.name}</td>

       
        <td>{item.category_name}</td>

      
        <td>{item.prakriti }</td>

       
        <td>
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
                  <div className="action-buttons">

                  <button
  className="action-btn edit"
  onClick={() => openEditModal(item)}
>
  <FaEdit />
</button>

                   <button
  className="action-btn delete"
  onClick={() => {
    setSelectedDiseaseId(item.id);
    setDeleteConfirmModal(true);
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
      <td colSpan="6" style={{ textAlign: "center" }}>
        No data found
      </td>
    </tr>
  )}
</tbody>
              </table>
       {totalPages > 1 && (
          <div className="pagination">


            <button
            onClick={() => getDiseaseList(currentpage - 1)}
              disabled={!previousPage}
            >
              Prev
            </button>


            {pages.map((page) => (
              <button
                key={page}
                onClick={() => getDiseaseList(page)}
                style={{

                  fontWeight: currentpage === page ? "bold" : "normal",
                  background: currentpage === page ? "#0D614E" : "#fff",
                  color: currentpage === page ? "#fff" : "#0D614E",
                }}
              >
                {page}
              </button>
            ))}


            <button
              onClick={() => getDiseaseList(currentpage + 1)}
              disabled={!Nextpage}
            >
              Next
            </button>

          </div>
        )}
      
      
            </div>   

        {
  AddDiseaseformModal && (
    <div className="prakriti-modal-overlay">
      <div className="prakriti-modal">

        
        <div className="prakriti-modal-header">
          <h2>Add Disease</h2>

          <button
            className="close-btn"
            onClick={() => {
              setAddDiseaseformModal(false);
              setDiseaseErrors({});
            }}
          >
            ✕
          </button>
        </div>

        
        <form
          className="prakriti-form"
          onSubmit={handleAddDisease}
        >

          
          <div className="form-group">
            <label>Category</label>

            <div className="category-row">

              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
              >
                <option value="">
                  Select Category
                </option>

                {HealthCategoryData?.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="add-category-btn"
                onClick={() =>
                  setAddCategoryModal(true)
                }
              >
                + Add Category
              </button>

            </div>

            {diseaseErrors.category_id && (
              <p className="error-text">
                {diseaseErrors.category_id}
              </p>
            )}
          </div>

    
          <div className="form-group">
            <label>Prakriti</label>

            <select
              name="prakriti"
              value={formData.prakriti}
              onChange={handleChange}
            >
              <option value="">
                Select Prakriti
              </option>

              {prakritiTypes.map(
                (prakriti, index) => (
                  <option
                    key={index}
                    value={prakriti}
                  >
                    {prakriti}
                  </option>
                )
              )} 
            </select>

            {diseaseErrors.prakriti && (
              <p className="error-text">
                {diseaseErrors.prakriti}
              </p>
            )}
          </div>

         
          <div className="form-group">
            <label>Disease Name</label>

            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Enter disease name"
              onChange={handleChange}
            />

            {diseaseErrors.name && (
              <p className="error-text">
                {diseaseErrors.name}
              </p>
            )}
          </div>

      
          <div className="form-group">
            <label>Alternate Name</label>

            <input
              type="text"
              name="alternate_name"
              value={formData.alternate_name}
              placeholder="Enter alternate name"
              onChange={handleChange}
            />
          </div>

         
          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              rows="4"
              value={formData.description}
              placeholder="Enter disease description"
              onChange={handleChange}
            ></textarea>

            
          </div>

        
          <div className="form-group">
            <label>Disease Image</label>

            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
            />
             {diseaseErrors.image && (
    <p className="error-text">
      {diseaseErrors.image}
    </p>
  )}

            {imageFile && (
              <div className="single-image-card">

                <img
                  src={URL.createObjectURL(
                    imageFile
                  )}
                  alt="preview"
                  className="preview-image"
                  onClick={() =>
                    setPreviewModal(true)
                  }
                />

              

              </div>
            )}
          </div>

         
          <div className="dynamic-section">

            <div className="section-header">
              <h3>Symptoms</h3>

              <button
                type="button"
                onClick={addSymptomField}
                className="add-btn"
              >
                + Add
              </button>
            </div>

            <div className="dynamic-list">

              {formData.symptoms.map(
                (item, index) => (
                  <div
                    className="dynamic-input"
                    key={index}
                  >
                    <span>
                      {index + 1}
                    </span>

                    <div className="input-wrapper">

                      <input
                        type="text"
                        placeholder={`Enter symptom ${
                          index + 1
                        }`}
                        value={item}
                        onChange={(e) =>
                          handleSymptomChange(
                            index,
                            e.target.value
                          )
                        }
                      />

                      <button
                        type="button"
                        className="delete-icon-btn"
                        onClick={() =>
                          removeSymptomField(
                            index
                          )
                        }
                      >
                        <FiTrash2 />
                      </button>

                    </div>
                  </div>
                )
              )}

            </div>

            {diseaseErrors.symptoms && (
              <p className="error-text">
                {diseaseErrors.symptoms}
              </p>
            )}
          </div>

        
          <div className="form-group">
            <label>Is Active</label>

            <div className="checkbox-row">

              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />

              <span>
                {formData.is_active
                  ? "Active"
                  : "Inactive"}
              </span>

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

            <button
              type="submit"
              className="save-btn"
            >
              Add Disease
            </button>

          </div>

        </form>
      </div>
    </div>
  )
}


{
  AddcategoryModal && (
    <div className="prakriti-modal-overlay">
      <div className="prakriti-modal">

        <div className="prakriti-modal-header">
          <h2>Add Category</h2>

          <button
            className="close-btn"
            onClick={() => {
              setAddCategoryModal(false);
              setCategoryErrors({});
            }}
          >
            ✕
          </button>
        </div>

        <form
          className="prakriti-form"
          onSubmit={handleAddCategory}
        >

         
          <div className="form-group">
            <label>
              Health Category Name
              <span className="required">*</span>
            </label>

            <input
              type="text"
              name="name"
              placeholder="Enter Category Name"
              value={healthcategoryname}
              onChange={(e) => {
                const value = e.target.value;

                setHealthcategory(value);
                setSlug(generateSlug(value));
              }}
            />

            {categoryErrors.healthcategoryname && (
              <p className="error-text">
                {categoryErrors.healthcategoryname}
              </p>
            )}
          </div>

      
          <div className="form-group">
            <label>Codename</label>

            <input
              type="text"
              name="codename"
              value={Slug}
              disabled
            />
          </div>

         
          <div className="form-group">
            <label>Description</label>

            <textarea
              rows="4"
              placeholder="Enter category description"
              value={Description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            ></textarea>
          </div>

       
          <div className="form-group">
            <label>Category Image</label>

           <input
  type="file"
  name="image"
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files[0];

    setHealthCategoryImage(file);

    
    setCategoryErrors((prev) => ({
      ...prev,
      HealthCategoryImage: "",
    }));
  }}
/>

            {categoryErrors.HealthCategoryImage && (
              <p className="error-text">
                {categoryErrors.HealthCategoryImage}
              </p>
            )}
          </div>

          
          {HealthCategoryImage && (
            <img
              src={URL.createObjectURL(
                HealthCategoryImage
              )}
              alt="preview"
              className="preview-image"
            />
          )}

         
          <div className="modal-footer">

            <button
              className="save-btn"
              type="submit"
            >
              Add Category
            </button>

            <button
              className="cancel-btn"
              type="button"
              onClick={() => {
                setAddCategoryModal(false);
                setHealthcategory("");
                setSlug("");
                setDescription("");
                setHealthCategoryImage(null);
                setCategoryErrors({});
              }}
            >
              Cancel
            </button>

          </div>

        </form>
      </div>
    </div>
  )
}


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
  
 {editModal && (
  <div className="prakriti-modal-overlay">
    <div className="prakriti-modal">

      {/* Header */}
      <div className="prakriti-modal-header">
        <h2>Edit Disease</h2>

        <button
          className="close-btn"
          onClick={() => setEditModal(false)}
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <form
        className="prakriti-form"
        onSubmit={handleUpdateDisease}
      >

        {/* Category */}
        <div className="form-group">
          <label>Category</label>

          <div className="category-row">

            <select
              name="category_id"
              value={editForm.category_id}
              onChange={handleEditChange}
            >
              <option value="">Select Category</option>

              {HealthCategoryData?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              className="add-category-btn"
              onClick={() => setAddCategoryModal(true)}
            >
              + Add Category
            </button>

          </div>
        </div>

       
        <div className="form-group">
          <label>Prakriti</label>

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
          <label>Disease Name</label>

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

        {/* Description */}
        <div className="form-group">
          <label>Description</label>

          <textarea
            name="description"
            rows="4"
            value={editForm.description}
            placeholder="Enter disease description"
            onChange={handleEditChange}
          ></textarea>
        </div>

      

        
        <div className="dynamic-section">

          <div className="section-header">
            <h3>Symptoms</h3>

            <button
              type="button"
              onClick={addEditSymptom}
              className="add-btn"
            >
              + Add
            </button>
          </div>

          <div className="dynamic-list">

            {editForm.symptoms.map((item, index) => (
              <div
                className="dynamic-input"
                key={index}
              >
                <span>{index + 1}</span>

                <div className="input-wrapper">

                  <input
                    type="text"
                    placeholder={`Enter symptom ${index + 1}`}
                    value={item}
                    onChange={(e) =>
                      handleEditSymptom(
                        index,
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="delete-icon-btn"
                    onClick={() =>
                      removeEditSymptom(index)
                    }
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

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setImageFile(e.target.files[0])
            }
          />

         
          {(imageFile || editForm.image_url) && (
            <div className="single-image-card">

              <img
                src={
                  imageFile
                    ? URL.createObjectURL(imageFile)
                    : editForm.image_url
                }
                alt="preview"
                className="preview-image"
                onClick={() => setPreviewModal(true)}
              />

              <div className="image-actions">

               
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => {
                    setImageFile(null);

                    setEditForm((prev) => ({
                      ...prev,
                      image_url: null,
                    }));
                  }}
                >
                  ✕
                </button>

                {/* Replace */}
                <label className="replace-btn">
                  Replace

                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      setImageFile(e.target.files[0])
                    }
                  />
                </label>

              </div>

              <p className="image-name">
                {imageFile?.name || "Current Image"}
              </p>

            </div>
          )}
        </div>

       
      
        <div className="form-group">
          <label>Is Active</label>

          <div className="checkbox-row">

            <input
              type="checkbox"
              name="is_active"
              checked={editForm.is_active}
              onChange={handleEditChange}
            />

            <span>
              {editForm.is_active
                ? "Active"
                : "Inactive"}
            </span>

          </div>
        </div>

       
        <div className="modal-footer">

          <button
            type="button"
            className="cancel-btn"
            onClick={() => setEditModal(false)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
          >
            Update Disease
          </button>

        </div>

      </form>
    </div>
  </div>
)}    

{previewModal && imageFile && (
  <div
    className="image-preview-modal"
    onClick={() => setPreviewModal(false)}
  >
    <div className="image-preview-content">

      <img
        src={URL.createObjectURL(imageFile)}
        alt="full-preview"
        className="full-preview-image"
      />

    </div>
  </div>
)}


            <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        closeButton
      />
      
    </>
  );
};

export default Disease;