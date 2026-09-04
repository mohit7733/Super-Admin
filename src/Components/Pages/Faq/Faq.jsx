import React, { useEffect, useState } from "react";

import {
  FaCircleQuestion,
  FaCircleCheck,
  FaCircleXmark,


} from "react-icons/fa6";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { FiTrash2 } from "react-icons/fi";
import { BiPlus } from "react-icons/bi";
import { FaSearch,FaTimes,FaEdit } from "react-icons/fa";

import "./Faq.css";
import { useNavigate } from "react-router-dom";


import "./Faq.css";
import BASE_URL from "../../../Base";

const Faq = () => {
  const navigate = useNavigate();

 

  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const[searchTerm,setSearchTerm]=useState("");
  const initialFaqForm = {
  question: "",
  answer: "",
  image_urls: [],
  category: "",
  display_order: "",
  is_active: false,
};
const [faqForm, setFaqForm] = useState(initialFaqForm);
const [faqErrors, setFaqErrors] = useState({});
const [showFaqModal, setShowFaqModal] = useState(false);
const [submitLoading, setSubmitLoading] = useState(false);
const [showEditFaqModal, setShowEditFaqModal] = useState(false);
const [editFaqForm, setEditFaqForm] = useState({
  id: "",
  question: "",
  answer: "",
  category: "",
  display_order: "",
  is_active: false,
});
const [deleteModal, setDeleteModal] = useState(false);
const [selectedFaq, setSelectedFaq] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);

const [editFaqErrors, setEditFaqErrors] = useState({});
const [editSubmitLoading, setEditSubmitLoading] = useState(false);

const faqCategories = [
  { label: "General", value: "general" },
  { label: "Account", value: "account" },
  { label: "Appointments", value: "appointments" },
  { label: "Orders", value: "orders" },
  { label: "Payments", value: "payments" },
  { label: "Products", value: "products" },
  { label: "Diet Plans", value: "diet_plans" },
  { label: "Yoga", value: "yoga" },
  { label: "Medical Records", value: "medical_records" },
  { label: "Prakriti", value: "prakriti" },
];


  const getFaqs = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/customers/admin/faqs/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

     
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");

        toast.error("Session expired. Please login again");

        navigate("/login");

        return;
      }

      const data = await response.json();

      console.log("FAQ API Response:", data);


      if (data.success) {
        const faqData = Array.isArray(data.data)
          ? data.data
          : [];

       
        const sortedData = [...faqData].sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        );

        setFaqs(sortedData);
      } else {
        toast.error(
          data.message || "Failed to get FAQs"
        );

        setError(
          data.message || "Failed to fetch FAQs"
        );

        setFaqs([]);
      }
    } catch (error) {
      console.error("FAQ Fetch Error:", error);

      setError(
        "Something went wrong while fetching FAQ data."
      );

      toast.error("Failed to fetch FAQ data");

      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    getFaqs();
  }, []);

  const filteredFaqs = faqs.filter((faq) =>
  faq.question?.toLowerCase().includes(searchTerm.toLowerCase())
);

  const handleAddFaq = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  let newErrors = {};

  

  if (!faqForm.question.trim()) {
    newErrors.question = "Question is required";
  }

  if (!faqForm.answer.trim()) {
    newErrors.answer = "Answer is required";
  }

  if (!faqForm.category) {
    newErrors.category = "Category is required";
  }

  if (
    faqForm.display_order === "" ||
    faqForm.display_order === null
  ) {
    newErrors.display_order = "Display order is required";
  } else if (Number(faqForm.display_order) < 0) {
    newErrors.display_order =
      "Display order cannot be negative";
  }

  setFaqErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    return;
  }

  try {
    setSubmitLoading(true);


    const payload = {
      question: faqForm.question.trim(),
      answer: faqForm.answer.trim(),
      category: faqForm.category,
      display_order: Number(faqForm.display_order),
      is_active: faqForm.is_active,
    };

    console.log("FAQ POST Payload:", payload);

  

    const response = await fetch(
      `${BASE_URL}/customers/admin/faqs/`,
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

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      sessionStorage.removeItem("superadmin_token");

      toast.error(
        "Session expired. Please login again"
      );

      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log("FAQ POST Response:", data);



    if (response.ok) {
      toast.success(
        data.message || "FAQ added successfully"
      );

      setShowFaqModal(false);

      setFaqForm(initialFaqForm);

      setFaqErrors({});

      getFaqs();

    } else {

     

      let apiErrors = {};

      if (data.errors) {

        Object.keys(data.errors).forEach((key) => {

          if (key === "question") {
            apiErrors.question =
              Array.isArray(data.errors[key])
                ? data.errors[key][0]
                : data.errors[key];
          }

          if (key === "answer") {
            apiErrors.answer =
              Array.isArray(data.errors[key])
                ? data.errors[key][0]
                : data.errors[key];
          }

          if (key === "category") {
            apiErrors.category =
              Array.isArray(data.errors[key])
                ? data.errors[key][0]
                : data.errors[key];
          }

          if (key === "display_order") {
            apiErrors.display_order =
              Array.isArray(data.errors[key])
                ? data.errors[key][0]
                : data.errors[key];
          }

          if (key === "is_active") {
            apiErrors.is_active =
              Array.isArray(data.errors[key])
                ? data.errors[key][0]
                : data.errors[key];
          }

        });

        setFaqErrors(apiErrors);

        Object.values(apiErrors).forEach((msg) => {
          toast.error(msg);
        });

      } else {
        toast.error(
          data.message || "Failed to add FAQ"
        );
      }
    }

  } catch (error) {

    console.error("Add FAQ Error:", error);

    toast.error(
      "Something went wrong while adding FAQ"
    );

  } finally {
    setSubmitLoading(false);
  }
};
const handleEditFaq = (faq) => {
  setEditFaqForm({
    id: faq.id || "",
    question: faq.question || "",
    answer: faq.answer || "",
    category: faq.category || "",
    display_order:
      faq.display_order !== null &&
      faq.display_order !== undefined
        ? String(faq.display_order)
        : "",
    is_active: faq.is_active ?? false,
  });

  setEditFaqErrors({});
  setShowEditFaqModal(true);
};

const handleUpdateFaq = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  let newErrors = {};

  // =========================
  // VALIDATION
  // =========================

  if (!editFaqForm.question.trim()) {
    newErrors.question = "Question is required";
  }

  if (!editFaqForm.answer.trim()) {
    newErrors.answer = "Answer is required";
  }

  if (!editFaqForm.category) {
    newErrors.category = "Category is required";
  }

  if (
    editFaqForm.display_order === "" ||
    editFaqForm.display_order === null
  ) {
    newErrors.display_order =
      "Display order is required";
  } else if (Number(editFaqForm.display_order) < 0) {
    newErrors.display_order =
      "Display order cannot be negative";
  }

  setEditFaqErrors(newErrors);

  if (Object.keys(newErrors).length > 0) {
    return;
  }

  try {
    setEditSubmitLoading(true);

    

    const payload = {
      question: editFaqForm.question.trim(),
      answer: editFaqForm.answer.trim(),
      category: editFaqForm.category,
      display_order: Number(editFaqForm.display_order),
      is_active: editFaqForm.is_active,
    };

    console.log("FAQ PATCH Payload:", payload);

    

    const response = await fetch(
`${BASE_URL}/customers/admin/faqs/?id=${editFaqForm.id}`,
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

  

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      sessionStorage.removeItem("superadmin_token");

      toast.error(
        "Session expired. Please login again"
      );

      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log("FAQ PATCH Response:", data);

 

    if (response.ok) {
      toast.success(
        data.message || "FAQ updated successfully"
      );

      setShowEditFaqModal(false);

      setEditFaqForm({
        id: "",
        question: "",
        answer: "",
        category: "",
        display_order: "",
        is_active: false,
      });

      setEditFaqErrors({});

      
      getFaqs();

    } else {



      let apiErrors = {};

      if (data.errors) {

        Object.keys(data.errors).forEach((key) => {

          if (key === "question") {
            apiErrors.question =
              Array.isArray(data.errors[key])
                ? data.errors[key][0]
                : data.errors[key];
          }

          if (key === "answer") {
            apiErrors.answer =
              Array.isArray(data.errors[key])
                ? data.errors[key][0]
                : data.errors[key];
          }

          if (key === "category") {
            apiErrors.category =
              Array.isArray(data.errors[key])
                ? data.errors[key][0]
                : data.errors[key];
          }

          if (key === "display_order") {
            apiErrors.display_order =
              Array.isArray(data.errors[key])
                ? data.errors[key][0]
                : data.errors[key];
          }

          if (key === "is_active") {
            apiErrors.is_active =
              Array.isArray(data.errors[key])
                ? data.errors[key][0]
                : data.errors[key];
          }

        });

        setEditFaqErrors(apiErrors);

        Object.values(apiErrors).forEach((msg) => {
          toast.error(msg);
        });

      } else {
        toast.error(
          data.message || "Failed to update FAQ"
        );
      }
    }

  } catch (error) {

    console.error("Update FAQ Error:", error);

    toast.error(
      "Something went wrong while updating FAQ"
    );

  } finally {
    setEditSubmitLoading(false);
  }
};

const handleDeleteFaq = async (id) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    setDeleteLoading(true);

    const response = await fetch(
      `${BASE_URL}/customers/admin/faqs/?id=${id}`,
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

    // Session expired
    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");

      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log("FAQ DELETE Response:", data);

    if (!response.ok || data.success === false) {
      toast.error(
        data?.message || "Failed to delete FAQ"
      );
      return;
    }

    toast.success(
      data?.message || "FAQ deleted successfully"
    );

  
    setDeleteModal(false);
    setSelectedFaq(null);

    getFaqs();

  } catch (error) {
    console.error("Delete FAQ Error:", error);

    toast.error(
      "Something went wrong while deleting FAQ"
    );
  } finally {
    setDeleteLoading(false);
  }
};

  

  return (
    <>


      <div className="page-header">
        <h1>FAQ Management</h1>
      </div>

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
      <FaCircleQuestion size={16} />
    </div>

    <div className="stat2-info">
      <h3>Total FAQ</h3>
      <div className="stat2-value">0</div>
    </div>
  </div>
 

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
      <FaCircleCheck size={16} />
    </div>

    <div className="stat2-info">
      <h3>Active FAQ</h3>
      <div className="stat2-value">0</div>
    </div>
  </div>

  {/* Inactive FAQ */}
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
      <FaCircleXmark size={16} />
    </div>

    <div className="stat2-info">
      <h3>Inactive FAQ</h3>
      <div className="stat2-value">0</div>
    </div>
  </div>
</div>

  <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by question..."
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

         

    
        </div>

      <button
  type="button"
  className="add-customer-btn"
  onClick={() => {
    setFaqForm(initialFaqForm);
    setFaqErrors({});
    setShowFaqModal(true);
  }}
>
  <BiPlus />
  Add FAQ
</button>
      </div>

     <div className="faq-table-wrapper">
  <table className="faq-table">

    <thead className="faq-table-head">
      <tr>
        <th>Question</th>
        <th>Answer</th>
     
        <th>Category</th>
        <th>Display Order</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody className="faq-table-body">

      {loading && (
        <tr>
          <td colSpan="7" className="faq-loading">
            Loading FAQs...
          </td>
        </tr>
      )}

     {!loading && !error && filteredFaqs.length === 0 && (
  <tr>
    <td colSpan="6" className="faq-empty">
      {searchTerm
        ? `No FAQ found for "${searchTerm}"`
        : "No FAQs found."}
    </td>
  </tr>
)}

      {!loading &&
        !error &&
        filteredFaqs.map((faq, index) => (
          <tr key={faq.id || index}>

           
            <td className="faq-question">
              {faq.question || "-"}
            </td>

            <td className="faq-answer">
              {faq.answer || "-"}
            </td>

         

           
            <td>
              <span className="faq-category">
                {faq.category || "General"}
              </span>
            </td>

         
            <td className="faq-order">
              {faq.display_order ?? index + 1}
            </td>

         
            <td>
              <span
                className={`faq-status ${
                  faq.is_active
                    ? "faq-status-active"
                    : "faq-status-inactive"
                }`}
              >
                {faq.is_active
                  ? "Active"
                  : "Inactive"}
              </span>
            </td>

           
            <td>
              <div className="faq-actions">

                <button
                  type="button"
                  className="faq-action-btn faq-edit-btn"
                  title="Edit FAQ"
                 onClick={() => handleEditFaq(faq)}
                >
                  <FaEdit size={12} />
                </button>

               <button
  type="button"
  className="faq-action-btn faq-delete-btn"
  title="Delete FAQ"
  onClick={() => {
    setSelectedFaq(faq);
    setDeleteModal(true);
  }}
>
  <FiTrash2 size={12} />
</button>

              </div>
            </td>

          </tr>
        ))}
    </tbody>
  </table>
</div>
  {showFaqModal && (
  <div
    className="prakriti-modal-overlay"
    onClick={() => setShowFaqModal(false)}
  >
    <div
      className="prakriti-modal"
      onClick={(e) => e.stopPropagation()}
    >

   

      <div className="prakriti-modal-header">
        <div>
          <h2>Add FAQ</h2>
          <p>Add a new frequently asked question</p>
        </div>

        <button
          type="button"
          className="modal-close-btn"
          onClick={() => {
            setShowFaqModal(false);
            setFaqForm(initialFaqForm);
            setFaqErrors({});
          }}
        >
          <FaTimes />
        </button>
      </div>

     
      <form
        className="prakriti-form"
        onSubmit={handleAddFaq}
      >

        

        <div className="form-group">
          <label>
            Question <span className="required">*</span>
          </label>

          <input
            type="text"
            placeholder="Enter FAQ question"
            value={faqForm.question}
            onChange={(e) => {
              setFaqForm({
                ...faqForm,
                question: e.target.value,
              });

              if (faqErrors.question) {
                setFaqErrors({
                  ...faqErrors,
                  question: "",
                });
              }
            }}
          />

          {faqErrors.question && (
            <span className="error-text">
              {faqErrors.question}
            </span>
          )}
        </div>

       

        <div className="form-group">
          <label>
            Answer <span className="required">*</span>
          </label>

          <textarea
            rows="5"
            placeholder="Enter FAQ answer"
            value={faqForm.answer}
            onChange={(e) => {
              setFaqForm({
                ...faqForm,
                answer: e.target.value,
              });

              if (faqErrors.answer) {
                setFaqErrors({
                  ...faqErrors,
                  answer: "",
                });
              }
            }}
          />

          {faqErrors.answer && (
            <span className="error-text">
              {faqErrors.answer}
            </span>
          )}
        </div>

     

       <div className="form-group">
  <label>
    Category <span className="required">*</span>
  </label>

  <select
    value={faqForm.category}
    onChange={(e) => {
      setFaqForm({
        ...faqForm,
        category: e.target.value,
      });

      if (faqErrors.category) {
        setFaqErrors({
          ...faqErrors,
          category: "",
        });
      }
    }}
    className={faqErrors.category ? "error-input" : ""}
  >
    <option value="">Select Category</option>

    {faqCategories.map((category) => (
      <option
        key={category.value}
        value={category.value}
      >
        {category.label}
      </option>
    ))}
  </select>

  {faqErrors.category && (
    <span className="error-text">
      {faqErrors.category}
    </span>
  )}
</div>
    <div className="form-group">
  <label>Display Order</label>

  <input
    type="number"
    min="0"
    value={faqForm.display_order}
    onChange={(e) => {
      setFaqForm({
        ...faqForm,
        display_order: e.target.value,
      });

      if (faqErrors.display_order) {
        setFaqErrors({
          ...faqErrors,
          display_order: "",
        });
      }
    }}
    placeholder="Enter display order"
  />

  {faqErrors.display_order && (
    <span className="error-text">
      {faqErrors.display_order}
    </span>
  )}
</div>

      

    

        <div className="form-group">
          <label>Status</label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={faqForm.is_active}
              onChange={(e) => {
                setFaqForm({
                  ...faqForm,
                  is_active: e.target.checked,
                });
              }}
            />

            <span>Active</span>
          </label>
        </div>


        <div className="modal-footer">

          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setShowFaqModal(false);
              setFaqForm(initialFaqForm);
              setFaqErrors({});
            }}
          >
            Cancel
          </button>
<button
  type="submit"
  className="save-btn"
  disabled={submitLoading}
>
  {submitLoading ? "Adding..." : "Add FAQ"}
</button>

        </div>

      </form>
    </div>
  </div>
)}

{showEditFaqModal && (
  <div
    className="prakriti-modal-overlay"
    onClick={() => setShowEditFaqModal(false)}
  >
    <div
      className="prakriti-modal"
      onClick={(e) => e.stopPropagation()}
    >

      {/* HEADER */}
      <div className="prakriti-modal-header">
        <div>
          <h2>Edit FAQ</h2>
          <p>Update FAQ information</p>
        </div>

        <button
          type="button"
          className="modal-close-btn"
          onClick={() => {
            setShowEditFaqModal(false);
            setEditFaqErrors({});
          }}
        >
          <FaTimes />
        </button>
      </div>

      {/* FORM */}
      <form
        className="prakriti-form"
        onSubmit={handleUpdateFaq}
      >

        {/* QUESTION */}
        <div className="form-group">
          <label>
            Question <span className="required">*</span>
          </label>

          <input
            type="text"
            value={editFaqForm.question}
            placeholder="Enter FAQ question"
            onChange={(e) => {
              setEditFaqForm({
                ...editFaqForm,
                question: e.target.value,
              });

              if (editFaqErrors.question) {
                setEditFaqErrors({
                  ...editFaqErrors,
                  question: "",
                });
              }
            }}
          />

          {editFaqErrors.question && (
            <span className="error-text">
              {editFaqErrors.question}
            </span>
          )}
        </div>

        {/* ANSWER */}
        <div className="form-group">
          <label>
            Answer <span className="required">*</span>
          </label>

          <textarea
            rows="5"
            value={editFaqForm.answer}
            placeholder="Enter FAQ answer"
            onChange={(e) => {
              setEditFaqForm({
                ...editFaqForm,
                answer: e.target.value,
              });

              if (editFaqErrors.answer) {
                setEditFaqErrors({
                  ...editFaqErrors,
                  answer: "",
                });
              }
            }}
          />

          {editFaqErrors.answer && (
            <span className="error-text">
              {editFaqErrors.answer}
            </span>
          )}
        </div>

        {/* CATEGORY */}
        <div className="form-group">
          <label>
            Category <span className="required">*</span>
          </label>

          <select
            value={editFaqForm.category}
            onChange={(e) => {
              setEditFaqForm({
                ...editFaqForm,
                category: e.target.value,
              });

              if (editFaqErrors.category) {
                setEditFaqErrors({
                  ...editFaqErrors,
                  category: "",
                });
              }
            }}
          >
            <option value="">Select Category</option>

            {faqCategories.map((category) => (
              <option
                key={category.value}
                value={category.value}
              >
                {category.label}
              </option>
            ))}
          </select>

          {editFaqErrors.category && (
            <span className="error-text">
              {editFaqErrors.category}
            </span>
          )}
        </div>

        {/* DISPLAY ORDER */}
        <div className="form-group">
          <label>Display Order</label>

          <input
            type="number"
            min="0"
            value={editFaqForm.display_order}
            placeholder="Enter display order"
            onChange={(e) => {
              setEditFaqForm({
                ...editFaqForm,
                display_order: e.target.value,
              });

              if (editFaqErrors.display_order) {
                setEditFaqErrors({
                  ...editFaqErrors,
                  display_order: "",
                });
              }
            }}
          />

          {editFaqErrors.display_order && (
            <span className="error-text">
              {editFaqErrors.display_order}
            </span>
          )}
        </div>

        {/* STATUS */}
        <div className="form-group">
          <label>Status</label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={editFaqForm.is_active}
              onChange={(e) => {
                setEditFaqForm({
                  ...editFaqForm,
                  is_active: e.target.checked,
                });
              }}
            />

            <span>Active</span>
          </label>
        </div>

        {/* FOOTER */}
        <div className="modal-footer">

          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setShowEditFaqModal(false);
              setEditFaqErrors({});
            }}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
            disabled={editSubmitLoading}
          >
            {editSubmitLoading
              ? "Updating..."
              : "Update FAQ"}
          </button>

        </div>

      </form>
    </div>
  </div>
)}

{deleteModal && selectedFaq && (
  <div
    className="activeModal-overlay"
    onClick={() => {
      if (!deleteLoading) {
        setDeleteModal(false);
        setSelectedFaq(null);
      }
    }}
  >
    <div
      className="activeModal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="activeModal-close"
        disabled={deleteLoading}
        onClick={() => {
          setDeleteModal(false);
          setSelectedFaq(null);
        }}
      >
        ×
      </button>

    
      <div className="activeModal-icon">
        ⚠️
      </div>

      
      <h2 className="activeModal-title">
        Confirm FAQ Deletion
      </h2>

      
      <p className="activeModal-text">
        Are you sure you want to
        <span className="inactive-text">
          {" delete "}
        </span>
        this FAQ?
      </p>

      {/* FAQ DETAILS */}
      <div className="activeModal-card">
        <h4>
          {selectedFaq.question || "FAQ"}
        </h4>

        <p>
          {selectedFaq.category || "General"}
        </p>
      </div>

      {/* FOOTER */}
      <div className="activeModal-footer">

        <button
          className="activeModal-cancel"
          disabled={deleteLoading}
          onClick={() => {
            setDeleteModal(false);
            setSelectedFaq(null);
          }}
        >
          Cancel
        </button>

        <button
          className="activeModal-confirm deactivate-btn"
          disabled={deleteLoading}
          onClick={() => {
            handleDeleteFaq(selectedFaq.id);
          }}
        >
          {deleteLoading ? "Deleting..." : "Yes, Delete"}
        </button>

      </div>

    </div>
  </div>
)}
 <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export default Faq;