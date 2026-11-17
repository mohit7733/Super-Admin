
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
 
  FaSearch,
  FaTimes,
  FaEdit,
} from "react-icons/fa";
import {
  FaCircleCheck,
  FaCircleXmark,
    FaCircleQuestion,
} from "react-icons/fa6";

import { FiTrash2 } from "react-icons/fi";
import { BiPlus } from "react-icons/bi";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./Faq.css";
import BASE_URL from "../../../Base";

const initialFaqForm = {
  question: "",
  answer: "",
  image_urls: [],
  category: "",
  display_order: "",
  is_active: false,
};

const initialEditFaqForm = {
  id: "",
  question: "",
  answer: "",
  category: "",
  display_order: "",
  is_active: false,
};


const getCategoryValue = (category) => {
  if (category === null || category === undefined) return "";

  if (typeof category === "string" || typeof category === "number") {
    return String(category);
  }

  return String(
    category.value ??
    category.slug ??
    category.id ??
    category.name ??
    category.title ??
    ""
  );
};

// Safely get category display name
const getCategoryName = (category) => {
  if (!category) return "General";

  if (typeof category === "string" || typeof category === "number") {
    return String(category);
  }

  return (
    category.name ||
    category.title ||
    category.label ||
    category.category_name ||
    category.value ||
    category.slug ||
    "General"
  );
};

const Faq = () => {
  const navigate = useNavigate();

  
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);

  
  const [faqCategories, setFaqCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

 
  const [faqForm, setFaqForm] = useState(initialFaqForm);
  const [faqErrors, setFaqErrors] = useState({});
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showEditFaqModal, setShowEditFaqModal] = useState(false);
  const [editFaqForm, setEditFaqForm] = useState(initialEditFaqForm);
  const [editFaqErrors, setEditFaqErrors] = useState({});
  const [editSubmitLoading, setEditSubmitLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [faqStats, setFaqStats] = useState({
    total_faqs: 0,
    active_faqs: 0,
    inactive_faqs: 0,
  });
  const [statusModal, setStatusModal] = useState(false);
const [selectedStatusFaq, setSelectedStatusFaq] = useState(null);
const [statusLoading, setStatusLoading] = useState(false);

  // Common headers
  const getHeaders = () => {
    const token = sessionStorage.getItem("superadmin_token");

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    };
  };

  const handleSessionExpired = () => {
    sessionStorage.removeItem("superadmin_token");
    toast.error("Session expired. Please login again");
    navigate("/login");
  };

 

  const getFaqCategories = async () => {
    try {
      setCategoryLoading(true);

      const token = sessionStorage.getItem("superadmin_token");

      const response = await fetch(
        `${BASE_URL}/customers/admin/faq-categories/`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      console.log("FAQ Categories Response:", data);

      if (response.ok && data.success) {
        // Support different possible API response structures
        const categories =
          Array.isArray(data.data?.results)
            ? data.data.results
            : Array.isArray(data.data?.categories)
            ? data.data.categories
            : Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.results)
            ? data.results
            : [];

        setFaqCategories(categories);

        console.log("FAQ Categories:", categories);
      } else {
        setFaqCategories([]);
        toast.error(data.message || "Failed to fetch FAQ categories");
      }
    } catch (error) {
      console.error("Get FAQ Categories Error:", error);
      setFaqCategories([]);
      toast.error("Something went wrong while fetching FAQ categories");
    } finally {
      setCategoryLoading(false);
    }
  };

  

  const getFaqs = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/customers/admin/faqs/`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      console.log("FAQ Response:", data);

      if (response.ok && data.success) {
        const faqData = Array.isArray(data.data?.results)
          ? data.data.results
          : Array.isArray(data.data)
          ? data.data
          : [];

        setFaqStats({
          total_faqs: data.data?.total_faqs ?? faqData.length,
          active_faqs:
            data.data?.active_faqs ??
            faqData.filter((faq) => faq.is_active === true).length,
          inactive_faqs:
            data.data?.inactive_faqs ??
            faqData.filter((faq) => faq.is_active === false).length,
        });

       
        const sortedData = [...faqData].sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();

          return dateB - dateA;
        });

        setFaqs(sortedData);
      } else {
        setFaqs([]);

        setFaqStats({
          total_faqs: 0,
          active_faqs: 0,
          inactive_faqs: 0,
        });

        toast.error(data.message || "Failed to fetch FAQs");
      }
    } catch (error) {
      console.error("Get FAQs Error:", error);

      setFaqs([]);

      setFaqStats({
        total_faqs: 0,
        active_faqs: 0,
        inactive_faqs: 0,
      });

      toast.error("Something went wrong while fetching FAQs");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    getFaqs();
    getFaqCategories();
  }, []);

  const filteredFaqs = faqs.filter((faq) => {
    const question = String(faq.question || "").toLowerCase();

    const searchMatch = question.includes(
      searchTerm.trim().toLowerCase()
    );

    const faqCategory = getCategoryValue(faq.category);

    const categoryMatch =
      categoryFilter === "all" ||
      faqCategory === categoryFilter ||
      getCategoryName(faq.category).toLowerCase() ===
        categoryFilter.toLowerCase();

    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "active" && faq.is_active === true) ||
      (statusFilter === "inactive" && faq.is_active === false);

    return searchMatch && categoryMatch && statusMatch;
  });

const handleStatusToggle = async () => {
  if (!selectedStatusFaq) return;

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    handleSessionExpired();
    return;
  }

  try {
    setStatusLoading(true);

    const newStatus = !selectedStatusFaq.is_active;

    const response = await fetch(
      `${BASE_URL}/customers/admin/faqs/?id=${selectedStatusFaq.id}`,
      {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({
          is_active: newStatus,
        }),
      }
    );

    if (response.status === 401 || response.status === 403) {
      handleSessionExpired();
      return;
    }

    const data = await response.json();

    if (response.ok && data.success !== false) {
      toast.success(
        newStatus
          ? "FAQ activated successfully"
          : "FAQ deactivated successfully"
      );

      setStatusModal(false);
      setSelectedStatusFaq(null);

      getFaqs();
    } else {
      toast.error(data.message || "Failed to update FAQ status");
    }
  } catch (error) {
    console.error("FAQ Status Error:", error);
    toast.error("Something went wrong while updating status");
  } finally {
    setStatusLoading(false);
  }
};

  const handleAddFaq = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      handleSessionExpired();
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
      newErrors.display_order = "Display order cannot be negative";
    }

    setFaqErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setSubmitLoading(true);

      const payload = {
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
        category_id: faqForm.category,
        display_order: Number(faqForm.display_order),
        is_active: faqForm.is_active,
      };

      console.log("FAQ POST Payload:", payload);

      const response = await fetch(
        `${BASE_URL}/customers/admin/faqs/`,
        {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      console.log("FAQ POST Response:", data);

      if (response.ok && data.success !== false) {
        toast.success(data.message || "FAQ added successfully");

        setShowFaqModal(false);
        setFaqForm(initialFaqForm);
        setFaqErrors({});

        getFaqs();
      } else {
        const apiErrors = {};

        if (data.errors) {
          Object.keys(data.errors).forEach((key) => {
            const value = data.errors[key];

            apiErrors[key] = Array.isArray(value)
              ? value[0]
              : value;
          });

          setFaqErrors(apiErrors);

          Object.values(apiErrors).forEach((msg) => {
            toast.error(String(msg));
          });
        } else {
          toast.error(data.message || "Failed to add FAQ");
        }
      }
    } catch (error) {
      console.error("Add FAQ Error:", error);
      toast.error("Something went wrong while adding FAQ");
    } finally {
      setSubmitLoading(false);
    }
  };

  

  const handleEditFaq = (faq) => {
    setEditFaqForm({
      id: faq.id || "",
      question: faq.question || "",
      answer: faq.answer || "",
         category: getCategoryValue(faq.category),

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
      handleSessionExpired();
      return;
    }

    let newErrors = {};

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
      newErrors.display_order = "Display order is required";
    } else if (Number(editFaqForm.display_order) < 0) {
      newErrors.display_order = "Display order cannot be negative";
    }

    setEditFaqErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setEditSubmitLoading(true);

      const payload = {
        question: editFaqForm.question.trim(),
        answer: editFaqForm.answer.trim(),
        category_id: editFaqForm.category,
        display_order: Number(editFaqForm.display_order),
        is_active: editFaqForm.is_active,
      };

      console.log("FAQ UPDATE Payload:", payload);

      const response = await fetch(
        `${BASE_URL}/customers/admin/faqs/?id=${editFaqForm.id}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      console.log("FAQ UPDATE Response:", data);

      if (response.ok && data.success !== false) {
        toast.success(data.message || "FAQ updated successfully");

        setShowEditFaqModal(false);
        setEditFaqForm(initialEditFaqForm);
        setEditFaqErrors({});

        getFaqs();
      } else {
        const apiErrors = {};

        if (data.errors) {
          Object.keys(data.errors).forEach((key) => {
            const value = data.errors[key];

            apiErrors[key] = Array.isArray(value)
              ? value[0]
              : value;
          });

          setEditFaqErrors(apiErrors);

          Object.values(apiErrors).forEach((msg) => {
            toast.error(String(msg));
          });
        } else {
          toast.error(data.message || "Failed to update FAQ");
        }
      }
    } catch (error) {
      console.error("Update FAQ Error:", error);
      toast.error("Something went wrong while updating FAQ");
    } finally {
      setEditSubmitLoading(false);
    }
  };


  const handleDeleteFaq = async (id) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      handleSessionExpired();
      return;
    }

    try {
      setDeleteLoading(true);

      const response = await fetch(
        `${BASE_URL}/customers/admin/faqs/?id=${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      console.log("FAQ DELETE Response:", data);

      if (!response.ok || data.success === false) {
        toast.error(data.message || "Failed to delete FAQ");
        return;
      }

      toast.success(data.message || "FAQ deleted successfully");

      setDeleteModal(false);
      setSelectedFaq(null);

      getFaqs();
    } catch (error) {
      console.error("Delete FAQ Error:", error);
      toast.error("Something went wrong while deleting FAQ");
    } finally {
      setDeleteLoading(false);
    }
  };

  

  const renderCategoryOptions = () => {
  return faqCategories
    .filter((category) => category.is_active === true)
    .map((category, index) => {
      const value = getCategoryValue(category);
      const label = getCategoryName(category);

      if (!value) return null;

      return (
        <option key={category.id || value || index} value={value}>
          {label}
        </option>
      );
    });
};
  

  return (
    <>
      <div className="page-header">
        <h1>FAQ Management</h1>
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
            <FaCircleQuestion size={16} />
          </div>

          <div className="stat2-info">
            <h3>Total FAQ</h3>
            <div className="stat2-value">
              {faqStats.total_faqs}
            </div>
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
            <div className="stat2-value">
              {faqStats.active_faqs}
            </div>
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
            <FaCircleXmark size={16} />
          </div>

          <div className="stat2-info">
            <h3>Inactive FAQ</h3>
            <div className="stat2-value">
              {faqStats.inactive_faqs}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="filter-category">
        <div className="filter-controls">
          {/* SEARCH */}
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
              <button
                type="button"
                className="clear-search"
                title="Clear search"
                onClick={() => setSearchTerm("")}
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* CATEGORY FILTER */}
          <select
            className="faq-filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {renderCategoryOptions()}
          </select>

          {/* STATUS FILTER */}
          <select
            className="faq-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* CLEAR FILTERS */}
          {(searchTerm ||
            categoryFilter !== "all" ||
            statusFilter !== "all") && (
            <button
              type="button"
              className="faq-clear-filter"
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("all");
                setStatusFilter("all");
              }}
            >
              <FaTimes /> Clear Filters
            </button>
          )}
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

      {/* FAQ TABLE */}
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
                <td colSpan="6" className="faq-loading">
                  Loading FAQs...
                </td>
              </tr>
            )}

            {!loading && filteredFaqs.length === 0 && (
              <tr>
                <td colSpan="6" className="faq-empty">
                  {faqs.length === 0
                    ? "No FAQs found."
                    : "No FAQs found matching your filters."}
                </td>
              </tr>
            )}

            {!loading &&
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
                      {getCategoryName(faq.category)}
                    </span>
                  </td>

                  <td className="faq-order">
                    {faq.display_order ?? index + 1}
                  </td>

       <td>
  <label className="switch">
    <input
      type="checkbox"
      checked={faq.is_active === true}
      onChange={() => {
        setSelectedStatusFaq(faq);
        setStatusModal(true);
      }}
    />

    <span className="slider round"></span>
  </label>
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
              {/* QUESTION */}
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

              {/* ANSWER */}
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

              {/* DYNAMIC CATEGORY */}
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
                  className={
                    faqErrors.category ? "error-input" : ""
                  }
                >
                  <option value="">
                    {categoryLoading
                      ? "Loading Categories..."
                      : "Select Category"}
                  </option>

                  {renderCategoryOptions()}
                </select>

                {faqErrors.category && (
                  <span className="error-text">
                    {faqErrors.category}
                  </span>
                )}
              </div>

              {/* DISPLAY ORDER */}
              <div className="form-group">
                <label>
                  Display Order <span className="required">*</span>
                </label>

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

              {/* STATUS */}
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

              {/* FOOTER */}
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

      {/* ================================= */}
      {/* EDIT FAQ MODAL */}
      {/* ================================= */}

      {showEditFaqModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => setShowEditFaqModal(false)}
        >
          <div
            className="prakriti-modal"
            onClick={(e) => e.stopPropagation()}
          >
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

              <select
  value={editFaqForm.category}
  onChange={(e) =>
    setEditFaqForm({
      ...editFaqForm,
      category: e.target.value,
    })
  }
>
  <option value="">Select Category</option>

  {renderCategoryOptions()}

  {editFaqForm.category &&
    !faqCategories.some(
      (category) =>
        category.is_active === true &&
        getCategoryValue(category) === editFaqForm.category
    ) && (
      <option value={editFaqForm.category}>
        {getCategoryName(
          faqs.find((faq) => faq.id === editFaqForm.id)?.category
        )} (Inactive)
      </option>
    )}
</select>

              {/* DISPLAY ORDER */}
              <div className="form-group">
                <label>
                  Display Order <span className="required">*</span>
                </label>

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

            <div className="activeModal-card">
              <h4>
                {selectedFaq.question || "FAQ"}
              </h4>

              <p>
                {getCategoryName(selectedFaq.category)}
              </p>
            </div>

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
 {statusModal && selectedStatusFaq && (
  <div
    className="activeModal-overlay"
    onClick={() => {
      if (!statusLoading) {
        setStatusModal(false);
        setSelectedStatusFaq(null);
      }
    }}
  >
    <div
      className="activeModal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="activeModal-close"
        disabled={statusLoading}
        onClick={() => {
          setStatusModal(false);
          setSelectedStatusFaq(null);
        }}
      >
        ×
      </button>

      <div className="activeModal-icon">
        {selectedStatusFaq.is_active ? "⚠️" : "⚠️"}
      </div>

      <h2 className="activeModal-title">
        {selectedStatusFaq.is_active
          ? "Deactivate FAQ"
          : "Activate FAQ"}
      </h2>

      <p className="activeModal-text">
        Are you sure you want to{" "}
        <span
          className={
            selectedStatusFaq.is_active
              ? "inactive-text"
              : "active-text"
          }
        >
          {selectedStatusFaq.is_active
            ? "deactivate"
            : "activate"}
        </span>{" "}
        this FAQ?
      </p>

      <div className="activeModal-card">
        <h4>{selectedStatusFaq.question || "FAQ"}</h4>

        <p>
          {getCategoryName(selectedStatusFaq.category)}
        </p>
      </div>

      <div className="activeModal-footer">
        <button
          type="button"
          className="activeModal-cancel"
          disabled={statusLoading}
          onClick={() => {
            setStatusModal(false);
            setSelectedStatusFaq(null);
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          className={`activeModal-confirm ${
            selectedStatusFaq.is_active
              ? "deactivate-btn"
              : "activate-btn"
          }`}
          disabled={statusLoading}
          onClick={handleStatusToggle}
        >
          {statusLoading
            ? "Please wait..."
            : selectedStatusFaq.is_active
            ? "Yes, Deactivate"
            : "Yes, Activate"}
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
