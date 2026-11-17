
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../../Base";
import { BiPlus } from "react-icons/bi";


import {
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaTimes,
} from "react-icons/fa";

import { FiEye, FiEdit2, FiTrash2, FiMoreVertical } from "react-icons/fi";

import "./Diet.css";

const Diet = () => {
  const navigate = useNavigate();

  const [Data, setData] = useState([]);
  const [Error, setError] = useState(null);
  const [Loading, setLoading] = useState(false);
const [actionMenuId, setActionMenuId] = useState(null);
const [ViewModal, setViewModal] = useState(false);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
const [availabilityModal, setAvailabilityModal] = useState(false);
const [pendingAvailability, setPendingAvailability] = useState("");
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCurrentPage(1);
  };

  const [SelectedDiet, setSelectedDiet] = useState(null);

  const [StatusModal, setStatusModal] = useState(false);
  const [DeleteModal, setDeleteModal] = useState(false);
  const [EditModal, setEditModal] = useState(false);

  // Edit States
  const [EditDiet, setEditDiet] = useState({
    name: "",
    prakriti: "",
    season: "",
    health_diseases: [],
    is_paid: false,
    price: "",
    is_common: false,
    schedule: {},
  });

  // Meal Types
  const mealTypes = [
    "morning",
    "breakfast",
    "midday",
    "lunch",
    "dinner",
  ];
  

  // =====================================================
  // GET DIET PLANS - BACKEND SEARCH AND FILTER
  // =====================================================

  const getDietPlans = async (page = 1) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      params.append("page", page);
      params.append("search", searchTerm.trim());
      params.append("disease", "");

      params.append(
        "plan_type",
        typeFilter === "all" ? "" : typeFilter
      );

      params.append(
        "availability",
        statusFilter === "all" ? "" : statusFilter
      );

      const response = await fetch(
        `${BASE_URL}/diet/plans/?${params.toString()}`,
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

      const result = await response.json();

      if (result.status === "success") {
        const sortedData = [...(result.data || [])].sort(
          (a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        setData(sortedData);

        const count = Number(result.count || 0);

        setTotalCount(count);
        setTotalPages(Math.ceil(count / pageSize) || 1);
      } else {
        setData([]);
        setTotalCount(0);
        setTotalPages(1);
        setError(result.message);
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch diet plans.");
      toast.error("Failed to fetch diet plans.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FILTER EFFECT
  // =====================================================

  useEffect(() => {
    getDietPlans(currentPage);
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  // =====================================================
  // EDIT DIET
  // =====================================================

  const handleEditDiet = (item) => {
    setSelectedDiet(item);

    setEditDiet({
      name: item?.name || "",
      prakriti: item?.prakriti || "",
      season: item?.season || "",
      health_diseases: item?.health_diseases || [],
      is_paid: Boolean(item?.is_paid),
      price: item?.price ?? "",
      is_common: Boolean(item?.is_common),
      schedule: item?.schedule || {},
    });

    setEditModal(true);
  };

const handleAvailabilityChange = async () => {
  if (!SelectedDiet || !pendingAvailability) return;

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(
      `${BASE_URL}/diet/plans/?id=${SelectedDiet.id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          availability: pendingAvailability,
        }),
      }
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const result = await response.json();

    if (response.ok) {
      const statusLabel = {
        active: "Active",
        catalog_inactive: "Catalog Inactive",
        fully_inactive: "Fully Inactive",
      };

      toast.success(
        `Availability changed to ${statusLabel[pendingAvailability]} successfully`
      );

      setAvailabilityModal(false);
      setSelectedDiet(null);
      setPendingAvailability("");

      getDietPlans(currentPage);
    } else {
      toast.error(
        result?.message || "Failed to update availability"
      );
    }
  } catch (error) {
    console.error("Availability Update Error:", error);
    toast.error("Something went wrong while updating availability");
  } finally {
    setLoading(false);
  }
};
  const handleEditChange = (field, value) => {
    setEditDiet((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =====================================================
  // UPDATE MEAL FIELD
  // =====================================================

  const updateMealField = (dayKey, meal, field, value) => {
    setEditDiet((prev) => {
      const oldDay = prev.schedule?.[dayKey] || {};
      const oldMeal = oldDay?.[meal] || {};

      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [dayKey]: {
            ...oldDay,
            [meal]: {
              ...oldMeal,
              [field]: value,
            },
          },
        },
      };
    });
  };

  // =====================================================
  // UPDATE DIET ITEMS
  // =====================================================

  const updateDietItems = (dayKey, meal, value) => {
    const dietArray = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    updateMealField(dayKey, meal, "diet", dietArray);
  };

  // =====================================================
  // UPDATE PREPARATION STEPS
  // =====================================================

  const updatePreparationSteps = (dayKey, meal, value) => {
    const preparationArray = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    updateMealField(
      dayKey,
      meal,
      "preparation_steps",
      preparationArray
    );
  };

  // =====================================================
  // UPDATE NUTRITION
  // =====================================================

  const updateNutrition = (
    dayKey,
    meal,
    nutritionKey,
    value
  ) => {
    setEditDiet((prev) => {
      const oldDay = prev.schedule?.[dayKey] || {};
      const oldMeal = oldDay?.[meal] || {};
      const oldNutrition = oldMeal?.nutrition || {};

      let unit = "g";

      if (nutritionKey === "total_calories") {
        unit = "kcal";
      }

      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [dayKey]: {
            ...oldDay,
            [meal]: {
              ...oldMeal,
              nutrition: {
                ...oldNutrition,
                [nutritionKey]: {
                  value: value === "" ? "" : Number(value),
                  unit,
                },
              },
            },
          },
        },
      };
    });
  };

  // =====================================================
  // UPDATE DIET PLAN
  // =====================================================

  const handleUpdateDiet = async () => {
    if (!SelectedDiet) return;

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    if (!EditDiet.name.trim()) {
      toast.error("Diet Plan Name is required");
      return;
    }

    if (!EditDiet.prakriti) {
      toast.error("Please select Prakriti");
      return;
    }

    if (!EditDiet.season) {
      toast.error("Please select Season");
      return;
    }

    if (EditDiet.is_paid && EditDiet.price === "") {
      toast.error("Please enter price");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/diet/plans/?id=${SelectedDiet.id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            name: EditDiet.name,
            prakriti: EditDiet.prakriti,
            season: EditDiet.season,
            health_diseases: EditDiet.health_diseases.map(
              (item) => item.id
            ),
            is_paid: EditDiet.is_paid,
            price: EditDiet.is_paid
              ? Number(EditDiet.price)
              : 0,
            is_common: EditDiet.is_common,
            schedule: EditDiet.schedule,
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (response.ok) {
        toast.success("Diet Plan Updated Successfully");
        setEditModal(false);
        setSelectedDiet(null);
        getDietPlans(currentPage);
      } else {
        toast.error(
          result?.message || "Failed to update Diet Plan"
        );
      }
    } catch (error) {
      console.error("Update Diet Error:", error);
      toast.error(
        "Something went wrong while updating Diet Plan"
      );
    } finally {
      setLoading(false);
    }
  };


  const handleStatusChange = async (id, currentStatus) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/diet/plans/?id=${id}`,
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

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (response.ok) {
        toast.success(
          !currentStatus
            ? "Diet Activated Successfully"
            : "Diet Deactivated Successfully"
        );

        getDietPlans(currentPage);
      } else {
        toast.error(
          result?.message || "Failed to update status"
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(
        "Something went wrong while updating status"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE DIET
  // =====================================================

  const handleDeleteDiet = async () => {
    if (!SelectedDiet) return;

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${BASE_URL}/diet/plans/?id=${SelectedDiet.id}`,
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

      const result = await response.json();

      if (response.ok) {
        toast.success("Diet Plan Deleted Successfully");

        setDeleteModal(false);
        setSelectedDiet(null);

        if (Data.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          getDietPlans(currentPage);
        }
      } else {
        toast.error(
          result?.message || "Failed to delete Diet Plan"
        );
      }
    } catch (error) {
      console.error("Delete Diet Error:", error);
      toast.error(
        "Something went wrong while deleting Diet Plan"
      );
    } finally {
      setLoading(false);
    }
  };

  

  const renderPagination = () => (
    <div className="order-pagination-container">
      <div className="order-pagination-info">
        Showing{" "}
        <strong>
          {totalCount === 0
            ? 0
            : (currentPage - 1) * pageSize + 1}
        </strong>
        {" "}to{" "}
        <strong>
          {Math.min(currentPage * pageSize, totalCount)}
        </strong>
        {" "}of{" "}
        <strong>{totalCount}</strong>
        {" "}diet plans
      </div>

      <div className="order-pagination-buttons">
        <button
          className="order-pagination-btn order-pagination-arrow"
          disabled={currentPage === 1 || Loading}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          ‹
        </button>

        <button
          className={`order-pagination-btn ${
            currentPage === 1 ? "order-pagination-active" : ""
          }`}
          disabled={Loading}
          onClick={() => setCurrentPage(1)}
        >
          1
        </button>

        {currentPage > 3 && (
          <span className="order-pagination-dots">...</span>
        )}

        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        )
          .filter(
            (page) =>
              page !== 1 &&
              page !== totalPages &&
              page >= currentPage - 1 &&
              page <= currentPage + 1
          )
          .map((page) => (
            <button
              key={page}
              className={`order-pagination-btn ${
                currentPage === page
                  ? "order-pagination-active"
                  : ""
              }`}
              disabled={Loading}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

        {currentPage < totalPages - 2 && (
          <span className="order-pagination-dots">...</span>
        )}

        {totalPages > 1 && (
          <button
            className={`order-pagination-btn ${
              currentPage === totalPages
                ? "order-pagination-active"
                : ""
            }`}
            disabled={Loading}
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </button>
        )}

        <button
          className="order-pagination-btn order-pagination-arrow"
          disabled={currentPage === totalPages || Loading}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );

 

  return (
    <>
      {/* HEADER */}
      <div className="page-header">
        <h1>Diet Plan Management</h1>
        <p className="page-paragraph">
          Manage All Diet Plans and their details
        </p>
      </div>

      {/* SEARCH AND FILTERS */}
    

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
            <FaClipboardList size={16} />
          </div>

          <div className="stat2-info">
            <h3>Total Diet Plans</h3>
            <div className="stat2-value">{totalCount}</div>
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
            <FaCheckCircle size={16} />
          </div>

          <div className="stat2-info">
            <h3>Active Plans</h3>
            <div className="stat2-value">
              {Data.filter((item) => item.is_active).length}
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
            <FaTimesCircle size={16} />
          </div>

          <div className="stat2-info">
            <h3>Inactive Plans</h3>
            <div className="stat2-value">
              {Data.filter((item) => !item.is_active).length}
            </div>
          </div>
        </div>
      </div>
        <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search by diet plan name,price,season,prakirti..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />

            {searchTerm && (
              <button
                className="clear-search"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
              >
                <FaTimes />
              </button>
            )}
          </div>

        <select
  className="status-filter-select"
  value={statusFilter}
  onChange={(e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  }}
>
  <option value="all">All</option>
  <option value="active">Active</option>
  <option value="catalog_inactive">Catalog Inactive</option>
  <option value="fully_inactive">Fully Inactive</option>
</select>
          <select
            className="status-filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Types</option>
            <option value="paid">Paid</option>
            <option value="free">Free</option>
          </select>

          {(searchTerm ||
            statusFilter !== "all" ||
            typeFilter !== "all") && (
            <button
              className="clear-filters-btn"
              onClick={clearFilters}
              title="Clear Filters"
            >
              <FiTrash2 />
            </button>
          )}
        </div>
                <button
  className="add-customer-btn"
  onClick={() => navigate("/diet/add")}
>
  <BiPlus />
  Add Diet
</button>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Diet Plan</th>
              <th>Cover</th>
              <th>Season</th>
              <th>Disease</th>
              <th>Prakriti</th>
              <th>Type</th>
             
              <th>Price</th>
            
              <th>Availability</th>
                <th>Status</th>
              <th>Created At</th>
              <th>Created By</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {Loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td colSpan="12">
                      <div className="skeleton-row" />
                    </td>
                  </tr>
                ))
            ) : Error ? (
              <tr>
                <td colSpan="12">{Error}</td>
              </tr>
            ) : Data.length > 0 ? (
              Data.map((item, index) => {
                const cover = item.diet_plan_gallery?.find(
                  (img) => img.is_cover
                )?.image_url;

                return (
                  <tr key={item.id}>
                    <td>
                      {(currentPage - 1) * pageSize + index + 1}
                    </td>

                    <td>
                      <strong>{item.name}</strong>
                    </td>

                    <td>
                      {cover ? (
                        <img
                          src={cover}
                          alt={item.name}
                          width={30}
                          height={30}
                          style={{
                            borderRadius: "8px",
                            objectFit: "cover",
                            border: "1px solid #e5e7eb",
                          }}
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>

                    <td>
                      <span className="category-code-badge">
                        {item.season}
                      </span>
                    </td>

                    <td>
                      {item.health_diseases?.length
                        ? item.health_diseases
                            .map((d) => d.name)
                            .join(", ")
                        : "-"}
                    </td>

                    <td>{item.prakriti}</td>

                    <td>
                      <span
                        className={
                          item.is_paid
                            ? "paid-badge"
                            : "free-badge"
                        }
                      >
                        {item.is_paid ? "Paid" : "Free"}
                      </span>
                    </td>

                    <td>
                      {item.is_paid
                        ? `₹${Number(item.price).toFixed(2)}`
                        : "₹0.00"}
                    </td>

<td>
  <select
    className="status-dropdown"
    value={item.availability || ""}
    onChange={(e) => {
      const value = e.target.value;

      if (!value || value === item.availability) return;

      setSelectedDiet(item);
      setPendingAvailability(value);
      setAvailabilityModal(true);
    }}
  >
    <option value="">Select Availability</option>
    <option value="active">Active</option>
    <option value="catalog_inactive">Catalog Inactive</option>
    <option value="fully_inactive">Fully Inactive</option>
  </select>
</td>


                    <td>
                      <span
                        className={`status-badge ${
                          item.is_active
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >
                        {item.is_active ? "Active" : "Inactive"}
                      </span>

                      <br />

                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={Boolean(item.is_active)}
                          onChange={() => {
                            setSelectedDiet(item);
                            setStatusModal(true);
                          }}
                        />
                        <span className="slider round" />
                      </label>
                    </td>

                    <td>
                      {item.created_at
                        ? new Date(
                            item.created_at
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <p>{item.created_by_name || "-"}</p>
                    </td>

                 <td>
  <div className="diet-action-wrapper">
    <button
      type="button"
      className="diet-action-toggle"
      title="More Actions"
      onClick={() =>
        setActionMenuId(
          actionMenuId === item.id ? null : item.id
        )
      }
    >
      <FiMoreVertical size={19} />
    </button>

    {actionMenuId === item.id && (
      <div className="diet-action-menu">

        <button
          type="button"
          onClick={() => {
            setSelectedDiet(item);
            setViewModal(true);
            setActionMenuId(null);
          }}
        >
          <FiEye />
          <span>View</span>
        </button>

        <button
          type="button"
          onClick={() => {
            // handleEditDiet(item);
            // setActionMenuId(null);
          }}
        >
          <FiEdit2 />
          <span>Edit</span>
        </button>

        <button
          type="button"
          className="diet-delete-action"
          onClick={() => {
            setSelectedDiet(item);
            setDeleteModal(true);
            setActionMenuId(null);
          }}
        >
          <FiTrash2 />
          <span>Delete</span>
        </button>

      </div>
    )}
  </div>
</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="12">No Diet Plans Found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {renderPagination()}
      </div>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {EditModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => setEditModal(false)}
        >
          <div
            className="edit-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="edit-modal-header">
              <div>
                <h2>Edit Diet Plan</h2>
                <p>Update diet plan details</p>
              </div>

              <button
                type="button"
                className="edit-modal-close"
                onClick={() => {
                  setEditModal(false);
                  setSelectedDiet(null);
                }}
              >
                ×
              </button>
            </div>

            {/* BASIC DETAILS */}
            <div className="edit-form">
              <div className="edit-form-grid">
                <div className="form-group">
                  <label>Diet Plan Name</label>
                  <input
                    type="text"
                    value={EditDiet.name}
                    onChange={(e) =>
                      handleEditChange("name", e.target.value)
                    }
                    placeholder="Enter diet plan name"
                  />
                </div>

                <div className="form-group">
                  <label>Prakriti</label>
                  <select
                    value={EditDiet.prakriti}
                    onChange={(e) =>
                      handleEditChange("prakriti", e.target.value)
                    }
                  >
                    <option value="">Select Prakriti</option>
                    <option value="Vata">Vata</option>
                    <option value="Pitta">Pitta</option>
                    <option value="Kapha">Kapha</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Season</label>
                  <select
                    value={EditDiet.season}
                    onChange={(e) =>
                      handleEditChange("season", e.target.value)
                    }
                  >
                    <option value="">Select Season</option>
                    <option value="summer">Summer</option>
                    <option value="winter">Winter</option>
                    <option value="monsoon">Monsoon</option>
                    <option value="spring">Spring</option>
                    <option value="autumn">Autumn</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Diet Type</label>
                  <select
                    value={EditDiet.is_paid ? "paid" : "free"}
                    onChange={(e) => {
                      const isPaid = e.target.value === "paid";

                      setEditDiet((prev) => ({
                        ...prev,
                        is_paid: isPaid,
                        price: isPaid ? prev.price : "",
                      }));
                    }}
                  >
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {EditDiet.is_paid && (
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      min="0"
                      value={EditDiet.price}
                      onChange={(e) =>
                        handleEditChange("price", e.target.value)
                      }
                      placeholder="Enter price"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Common Diet</label>
                  <div className="edit-checkbox">
                    <input
                      type="checkbox"
                      checked={EditDiet.is_common}
                      onChange={(e) =>
                        handleEditChange(
                          "is_common",
                          e.target.checked
                        )
                      }
                    />
                    <span>This is a common diet plan</span>
                  </div>
                </div>

                <div
                  className="form-group"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <label>Health Disease</label>
                  <div className="disease-list">
                    {EditDiet.health_diseases?.length > 0 ? (
                      EditDiet.health_diseases.map(
                        (disease, index) => (
                          <span
                            className="disease-tag"
                            key={disease.id || index}
                          >
                            {disease.name}
                          </span>
                        )
                      )
                    ) : (
                      <span>No disease selected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* DIET SCHEDULE */}
            <div className="schedule-section">
              <div className="schedule-title">
                <h3>Diet Schedule</h3>
                <p>Update daily meals and nutrition</p>
              </div>

              {Object.entries(EditDiet.schedule || {}).map(
                ([dayKey, dayData]) => (
                  <div className="schedule-day" key={dayKey}>
                    <div className="day-header">
                      <h3>
                        {dayKey.replace("_", " ").toUpperCase()}
                      </h3>
                    </div>

                    {mealTypes.map((meal) => {
                      const mealData = dayData?.[meal];

                      if (!mealData) return null;

                      return (
                        <div className="meal-card" key={meal}>
                          <div className="meal-header">
                            <h4>
                              {meal.charAt(0).toUpperCase() +
                                meal.slice(1)}
                            </h4>
                          </div>

                          <div className="meal-form-grid">
                            <div className="form-group">
                              <label>Diet Items</label>
                              <textarea
                                rows="4"
                                value={
                                  mealData.diet?.join("\n") || ""
                                }
                                onChange={(e) =>
                                  updateDietItems(
                                    dayKey,
                                    meal,
                                    e.target.value
                                  )
                                }
                                placeholder="One item per line"
                              />
                            </div>

                            <div className="form-group">
                              <label>Preparation Steps</label>
                              <textarea
                                rows="4"
                                value={
                                  mealData.preparation_steps?.join(
                                    "\n"
                                  ) || ""
                                }
                                onChange={(e) =>
                                  updatePreparationSteps(
                                    dayKey,
                                    meal,
                                    e.target.value
                                  )
                                }
                                placeholder="One step per line"
                              />
                            </div>
                          </div>

                          <div className="nutrition-section">
                            <h5>Nutrition</h5>

                            <div className="nutrition-grid">
                              <div className="form-group">
                                <label>Calories (kcal)</label>
                                <input
                                  type="number"
                                  value={
                                    mealData.nutrition
                                      ?.total_calories?.value ?? ""
                                  }
                                  onChange={(e) =>
                                    updateNutrition(
                                      dayKey,
                                      meal,
                                      "total_calories",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="form-group">
                                <label>Carbs (g)</label>
                                <input
                                  type="number"
                                  value={
                                    mealData.nutrition?.carbs
                                      ?.value ?? ""
                                  }
                                  onChange={(e) =>
                                    updateNutrition(
                                      dayKey,
                                      meal,
                                      "carbs",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="form-group">
                                <label>Protein (g)</label>
                                <input
                                  type="number"
                                  value={
                                    mealData.nutrition?.protein
                                      ?.value ?? ""
                                  }
                                  onChange={(e) =>
                                    updateNutrition(
                                      dayKey,
                                      meal,
                                      "protein",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>

                              <div className="form-group">
                                <label>Fat (g)</label>
                                <input
                                  type="number"
                                  value={
                                    mealData.nutrition?.fat
                                      ?.value ?? ""
                                  }
                                  onChange={(e) =>
                                    updateNutrition(
                                      dayKey,
                                      meal,
                                      "fat",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>

            {/* EDIT FOOTER */}
            <div className="edit-modal-footer">
              <button
                type="button"
                className="edit-cancel-btn"
                onClick={() => {
                  setEditModal(false);
                  setSelectedDiet(null);
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="edit-save-btn"
                disabled={Loading}
                onClick={handleUpdateDiet}
              >
                {Loading ? "Updating..." : "Update Diet Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          STATUS MODAL
      ===================================================== */}

      {StatusModal && SelectedDiet && (
        <div
          className="activeModal-overlay"
          onClick={() => {
            setStatusModal(false);
            setSelectedDiet(null);
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
                setSelectedDiet(null);
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
                  SelectedDiet.is_active
                    ? "inactive-text"
                    : "active-text"
                }
              >
                {SelectedDiet.is_active
                  ? " Inactive "
                  : " Active "}
              </span>
              this Diet?
            </p>

            <div className="activeModal-card">
              <h4>{SelectedDiet.name}</h4>
            </div>

            <div className="activeModal-footer">
              <button
                className="activeModal-cancel"
                onClick={() => {
                  setStatusModal(false);
                  setSelectedDiet(null);
                }}
              >
                Cancel
              </button>

              <button
                className={`activeModal-confirm ${
                  SelectedDiet.is_active
                    ? "deactivate-btn"
                    : "activate-btn"
                }`}
                onClick={() => {
                  handleStatusChange(
                    SelectedDiet.id,
                    SelectedDiet.is_active
                  );

                  setStatusModal(false);
                  setSelectedDiet(null);
                }}
              >
                Yes,{" "}
                {SelectedDiet.is_active
                  ? "Deactivate"
                  : "Activate"}
              </button>
            </div>
          </div>
        </div>
      )}

{availabilityModal && SelectedDiet && (
  <div
    className="availability-modal-overlay"
    onClick={() => {
      if (Loading) return;
      setAvailabilityModal(false);
      setSelectedDiet(null);
      setPendingAvailability("");
    }}
  >
    <div
      className="availability-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="availability-modal-icon">
        <i className="fa fa-exclamation-circle" />
      </div>

      <h3>Confirm Availability Change</h3>

      <p>
        Are you sure you want to change the availability
        of <strong>{SelectedDiet.name}</strong> to:
      </p>

      <div className="availability-selected-status">
        <strong>
          {pendingAvailability === "active"
            ? "Active"
            : pendingAvailability === "catalog_inactive"
            ? "Catalog Inactive"
            : "Fully Inactive"}
        </strong>
      </div>

      <p className="availability-confirm-description">
        This action will update the diet plan availability.
      </p>

      <div className="availability-modal-actions">
        <button
          type="button"
          className="availability-cancel-btn"
          onClick={() => {
            setAvailabilityModal(false);
            setSelectedDiet(null);
            setPendingAvailability("");
          }}
          disabled={Loading}
        >
          Cancel
        </button>

        <button
          type="button"
          className="availability-confirm-btn"
          onClick={handleAvailabilityChange}
          disabled={Loading || !pendingAvailability}
        >
          {Loading ? "Updating..." : "Confirm"}
        </button>
      </div>
    </div>
  </div>
)}

      {DeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>
              Are you sure you want to delete this Diet Plan?
            </h3>

            <div className="form-buttons">
              <button
                className="otp-btn verify-btn"
                onClick={handleDeleteDiet}
                disabled={Loading}
              >
                {Loading ? "Deleting..." : "Yes"}
              </button>

              <button
                onClick={() => {
                  setDeleteModal(false);
                  setSelectedDiet(null);
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      <ToastContainer
        position="top-center"
        autoClose={2000}
      />
    </>
  );
};

export default Diet;
