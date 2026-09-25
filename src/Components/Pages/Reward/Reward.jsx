import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaCircleCheck,
  FaCircleXmark,
  FaGift,
 
  FaEye,

  FaTrash,
  FaBolt,
} from "react-icons/fa6";

import { FaSearch , FaEdit, } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { FaSave } from "react-icons/fa";

import { BiPlus } from "react-icons/bi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import "./Reward.css";

const Reward = () => {
  const navigate = useNavigate();



  const [rewards, setRewards] = useState([]);
  const [filteredRewards, setFilteredRewards] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
const [deleteModal, setDeleteModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
   const [RewardId, setRewardId] = useState(null);
  const initialEditForm = {
  name: "",
  trigger: "",
  coupon_id: "",
  complete_on: "",
  min_amount: "",
  min_count: "",
  window: "",
  max_times_per_customer: "",
  is_active: false,
};

const [showEditModal, setShowEditModal] = useState(false);
const [editForm, setEditForm] = useState(initialEditForm);
const [editErrors, setEditErrors] = useState({});
const [editLoading, setEditLoading] = useState(false);

const [coupons, setCoupons] = useState([]);
const [couponLoading, setCouponLoading] = useState(false);
const [currentPage, setCurrentPage] = useState(1);
const [pageSize] = useState(5);
const [totalPages, setTotalPages] = useState(1);
const [totalCount, setTotalCount] = useState(0);
const [debouncedSearch, setDebouncedSearch] = useState("");

  const getRewards = async (page = 1, search = "") => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const response = await fetch(
      `${BASE_URL}/promotions/admin/reward-rules/?page=${page}&page_size=${pageSize}&search=${encodeURIComponent(search)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    console.log("Reward HTTP Status:", response.status);

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    console.log("FULL REWARD RESPONSE:", data);

    if (data.status === "success") {
     const responseData = data?.data;

const rewardData = Array.isArray(responseData)
  ? responseData
  : responseData?.results || [];


const count = Number(data?.count || 0);

      const sortedData = [...rewardData].sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );

      setRewards(sortedData);
      setFilteredRewards(sortedData);

      setTotalCount(count);
      setTotalPages(
        Math.max(1, Math.ceil(count / pageSize))
      );

      const activeCount = sortedData.filter(
        (item) => item.is_active === true
      ).length;

      const inactiveCount = sortedData.filter(
        (item) => item.is_active === false
      ).length;

      setStats({
        total: count,
        active: activeCount,
        inactive: inactiveCount,
      });
    } else {
      const message =
        data.message || "Failed to get rewards";

      toast.error(message);
      setError(message);

      setRewards([]);
      setFilteredRewards([]);

      setTotalCount(0);
      setTotalPages(1);

      setStats({
        total: 0,
        active: 0,
        inactive: 0,
      });
    }
  } catch (error) {
    console.error("Reward Fetch Error:", error);

    const message =
      "Something went wrong while fetching reward data.";

    setError(message);

    toast.error("Failed to fetch reward data");

    setRewards([]);
    setFilteredRewards([]);

    setTotalCount(0);
    setTotalPages(1);

    setStats({
      total: 0,
      active: 0,
      inactive: 0,
    });
  } finally {
    setLoading(false);
  }
};
  const getCoupons = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setCouponLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/promotions/admin/coupons/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
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

    if (data.success === true) {
      setCoupons(data.data?.results || data.data || []);
    } else {
      toast.error(data.message || "Failed to fetch coupons");
    }
  } catch (error) {
    console.error("Coupon Error:", error);
    toast.error("Failed to fetch coupons");
  } finally {
    setCouponLoading(false);
  }
};


useEffect(() => {
  getRewards(currentPage, debouncedSearch);
}, [currentPage, debouncedSearch]);

useEffect(() => {
  getCoupons();
}, []);
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm.trim());
    setCurrentPage(1);
  }, 500);

  return () => clearTimeout(timer);
}, [searchTerm]);
const handleEditChange = (e) => {
  const { name, value, type, checked } = e.target;

  setEditForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));

  if (editErrors[name]) {
    setEditErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }
};
const handleEditTriggerChange = (e) => {
  const trigger = e.target.value;

  setEditForm((prev) => ({
    ...prev,
    trigger,
    complete_on: "",
    min_amount: "",
    min_count: "",
    window: "",
  }));

  setEditErrors({});
};
const validateEditForm = () => {
  const errors = {};

  if (!editForm.name.trim()) {
    errors.name = "Reward name is required";
  }

  if (!editForm.trigger) {
    errors.trigger = "Please select a trigger";
  }

  if (!editForm.coupon_id) {
    errors.coupon_id = "Private coupon is required";
  }

  if (editForm.trigger === "referral") {
    if (!editForm.complete_on) {
      errors.complete_on = "Please select completion event";
    }
  }

  if (
    editForm.trigger === "order" ||
    editForm.trigger === "consultation"
  ) {
    if (!editForm.window) {
      errors.window = "Please select a window";
    }

    if (!editForm.min_amount && !editForm.min_count) {
      errors.ruleCondition =
        "Enter either minimum amount or minimum count";
    }

    if (
      editForm.min_amount !== "" &&
      (Number(editForm.min_amount) < 0 ||
        Number.isNaN(Number(editForm.min_amount)))
    ) {
      errors.min_amount = "Enter a valid amount";
    }

    if (
      editForm.min_count !== "" &&
      (Number(editForm.min_count) < 1 ||
        !Number.isInteger(Number(editForm.min_count)))
    ) {
      errors.min_count =
        "Minimum count must be a positive whole number";
    }
  }

  if (
    editForm.max_times_per_customer !== "" &&
    (Number(editForm.max_times_per_customer) < 1 ||
      !Number.isInteger(
        Number(editForm.max_times_per_customer)
      ))
  ) {
    errors.max_times_per_customer =
      "Enter a valid positive whole number";
  }

  setEditErrors(errors);

  if (Object.keys(errors).length > 0) {
    toast.error(Object.values(errors)[0]);
    return false;
  }

  return true;
};
const handleUpdateReward = async (e) => {
  e.preventDefault();

  if (!validateEditForm()) return;

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setEditLoading(true);

  try {
    const payload = {
      name: editForm.name.trim(),
      trigger: editForm.trigger,
      coupon_id: editForm.coupon_id,
      is_active: editForm.is_active,
    };

    if (editForm.trigger === "referral") {
      payload.complete_on = editForm.complete_on;
    }

    if (
      editForm.trigger === "order" ||
      editForm.trigger === "consultation"
    ) {
      payload.window = editForm.window;

      if (editForm.min_amount !== "") {
        payload.min_amount = Number(editForm.min_amount);
      }

      if (editForm.min_count !== "") {
        payload.min_count = Number(editForm.min_count);
      }
    }

    if (editForm.max_times_per_customer !== "") {
      payload.max_times_per_customer = Number(
        editForm.max_times_per_customer
      );
    }

    console.log("REWARD UPDATE PAYLOAD:", payload);

    const response = await fetch(
      `${BASE_URL}/promotions/admin/reward-rules/?id=${editForm.id}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log("REWARD UPDATE RESPONSE:", data);

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    if (data.success === true || data.status === "success") {
      toast.success(
        data.message || "Reward updated successfully"
      );

      setShowEditModal(false);
      getRewards();
    } else {
      toast.error(
        data.message || "Failed to update reward"
      );
    }
  } catch (error) {
    console.error("Update Reward Error:", error);
    toast.error("Something went wrong while updating reward");
  } finally {
    setEditLoading(false);
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
        `${BASE_URL}/promotions/admin/reward-rules/?id=${id}`,
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
        const errorMsg = data?.message || "Failed to delete Reward";
        toast.error(errorMsg);
        return;
      }

      toast.success("Reward deleted successfully");
      setDeleteModal(false);
    getRewards();

     } catch (error) {
    console.error("Delete Error:", error);
    toast.error("Something went wrong while deleting Reward");
  }
};

  
  useEffect(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) {
      setFilteredRewards(rewards);
      return;
    }

    const filtered = rewards.filter((item) => {
      return (
        item.name?.toLowerCase().includes(search) ||
        item.coupon_code?.toLowerCase().includes(search) ||
        item.trigger?.toLowerCase().includes(search) ||
        item.complete_on?.toLowerCase().includes(search)
      );
    });

    setFilteredRewards(filtered);
  }, [searchTerm, rewards]);



  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  

  const formatTrigger = (trigger) => {
    if (!trigger) return "-";

    return trigger
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };
  
  const handleAddReward = () => {
    navigate("/Add-Reward");
  };

const handleEditReward = (reward) => {
  setEditForm({
    id: reward.id, // IMPORTANT

    name: reward.name || "",
    trigger: reward.trigger || "",
    coupon_id: reward.coupon_id || "",
    complete_on: reward.complete_on || "",

    min_amount:
      reward.min_amount !== null &&
      reward.min_amount !== undefined
        ? String(reward.min_amount)
        : "",

    min_count:
      reward.min_count !== null &&
      reward.min_count !== undefined
        ? String(reward.min_count)
        : "",

    window: reward.window || "",

    max_times_per_customer:
      reward.max_times_per_customer !== null &&
      reward.max_times_per_customer !== undefined
        ? String(reward.max_times_per_customer)
        : "",

    is_active: reward.is_active === true,
  });

  setEditErrors({});
  setShowEditModal(true);
};
  return (
   
<>
  <div className="page-header">

        <h1>
          Reward  Management
        </h1>

      </div>
   <div className="stats2-grid">

  {/* TOTAL */}
  <div
    className="stat2-card"
    style={{
      borderTopColor: "#0D614E",
    }}
  >
    <div
      className="stat2-icon"
      style={{
        background: "#0D614E20",
        color: "#0D614E",
      }}
    >
      <FaGift size={16} />
    </div>

    <div className="stat2-info">
      <h3>Total Reward</h3>

      <div className="stat2-value">
        {stats.total}
      </div>
    </div>
  </div>


  {/* ACTIVE */}
  <div
    className="stat2-card"
    style={{
      borderTopColor: "#0D614E",
    }}
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
      <h3>Active Rewards</h3>

      <div className="stat2-value">
        {stats.active}
      </div>
    </div>
  </div>


  {/* INACTIVE */}
  <div
    className="stat2-card"
    style={{
      borderTopColor: "#0D614E",
    }}
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
      <h3>Inactive Rewards</h3>

      <div className="stat2-value">
        {stats.inactive}
      </div>
    </div>
  </div>

</div>

  <div className="filter-category">

        <div className="filter-controls">

          <div  className="search-wrapper">

            <FaSearch  className="search-icon" />

            <input
              type="text"
              placeholder="Search by reward name, coupon code or trigger..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
               className="search-input"
            />

            {searchTerm && (
              <button
                type="button"
                className="reward-clear-search"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                <FaTimes />
              </button>
            )}

          </div>

        </div>
<button onClick={handleAddReward}
     className="add-customer-btn"
>
  <BiPlus />
  Add Reward
</button>
      

      </div>
   <div className="filter-category">

     

        <div className="reward-table-wrapper">

          <table className="reward-table">

            <thead>
              <tr>

                <th>#</th>

                <th>Reward</th>

                <th>Trigger</th>

                <th>Coupon</th>

                <th>Completion</th>

                <th>Window</th>

                <th>Status</th>

                <th>Created At</th>

                <th>Actions</th>

              </tr>
            </thead>

            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="9"
                    className="reward-loading"
                  >
                    <div className="reward-spinner"></div>

                    <span>
                      Loading rewards...
                    </span>
                  </td>
                </tr>

              ) : error ? (

                <tr>
                  <td
                    colSpan="9"
                    className="reward-empty"
                  >
                    <div className="reward-empty-icon">
                      <FaCircleXmark />
                    </div>

                    <h3>
                      Unable to load rewards
                    </h3>

                    <p>{error}</p>

                    <button
                      onClick={getRewards}
                      className="reward-retry-btn"
                    >
                      Try Again
                    </button>
                  </td>
                </tr>

              ) : filteredRewards.length === 0 ? (

                <tr>
                  <td
                    colSpan="9"
                    className="reward-empty"
                  >
                    <div className="reward-empty-icon">
                      <FaGift />
                    </div>

                    <h3>
                      No rewards found
                    </h3>

                    <p>
                      {searchTerm
                        ? "Try changing your search criteria."
                        : "No reward rules have been created yet."}
                    </p>

                    {!searchTerm && (
                      <button
                        className="reward-empty-add-btn"
                        onClick={handleAddReward}
                      >
                        <BiPlus />
                        Add Reward
                      </button>
                    )}
                  </td>
                </tr>

              ) : (

                filteredRewards.map(
                  (reward, index) => (

                    <tr key={reward.id}>

                

                      <td>
                        <span className="reward-row-number">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </td>

                     

                      <td>
                        <div className="reward-name-cell">

                         

                          <div>
                            <div className="reward-name">
                              {reward.name || "-"}
                            </div>

                            <div className="reward-id">
                              ID:{" "}
                              {reward.id}
                               
                            </div>
                          </div>

                        </div>
                      </td>

                   
                      <td>
                        <span className="trigger-badge">
                          <FaBolt size={11} />

                          {formatTrigger(
                            reward.trigger
                          )}
                        </span>
                      </td>

                      

                      <td>
                        <div className="coupon-cell">

                          <span className="coupon-code">
                            {reward.coupon_code ||
                              "-"}
                          </span>

                          <span className="coupon-id">
                            {reward.coupon_id}
                             
                          </span>

                        </div>
                      </td>

                     

                      <td>
                        <span className="window-text">
                          {formatTrigger(
                            reward.complete_on
                          )}
                        </span>
                      </td>

                      {/* WINDOW */}

                      <td>
                        <span className="window-text">
                          {formatTrigger(
                            reward.window
                          )}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td>

                        <span
                          className={`reward-status ${
                            reward.is_active
                              ? "active"
                              : "inactive"
                          }`}
                        >

                          {reward.is_active ? (
                            <>
                              <FaCircleCheck
                                size={12}
                              />
                              Active
                            </>
                          ) : (
                            <>
                              <FaCircleXmark
                                size={12}
                              />
                              Inactive
                            </>
                          )}

                        </span>

                      </td>

                      {/* CREATED */}

                      <td>
                        <div className="created-cell">

                          <span>
                            {formatDate(
                              reward.created_at
                            )}
                          </span>

                          <small>
                            {formatDateTime(
                              reward.created_at
                            ).split(",")[1]}
                          </small>

                        </div>
                      </td>

                  

                      <td>

                        <div className="reward-actions">

                       
<button
  className="coupon-action-btn coupon-edit-btn"
  title="Edit Reward"
  onClick={() => handleEditReward(reward)}
>
  <FaEdit />
</button>

                          <button
                         className="coupon-action-btn coupon-delete-btn"
                            title="Delete Reward"
                            onClick={() => {

                            setRewardId(
                            reward.id
                            );

                            setDeleteModal(
                              true
                            );

                          }}
                          >
                            <FaTrash />
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>
          <div className="reward-pagination-container">

  <div className="reward-pagination-info">
    Showing{" "}
    <strong>
      {totalCount === 0
        ? 0
        : (currentPage - 1) * pageSize + 1}
    </strong>{" "}
    to{" "}
    <strong>
      {Math.min(currentPage * pageSize, totalCount)}
    </strong>{" "}
    of <strong>{totalCount}</strong> rewards
  </div>

  <div className="reward-pagination-buttons">

    <button
      type="button"
      className="reward-pagination-btn reward-pagination-arrow"
      disabled={currentPage === 1 || loading}
      onClick={() =>
        setCurrentPage((prev) => prev - 1)
      }
    >
      ‹
    </button>

    <button
      type="button"
      className={`reward-pagination-btn ${
        currentPage === 1
          ? "reward-pagination-active"
          : ""
      }`}
      disabled={loading}
      onClick={() => setCurrentPage(1)}
    >
      1
    </button>

    {currentPage > 3 && (
      <span className="reward-pagination-dots">
        ...
      </span>
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
          type="button"
          key={page}
          className={`reward-pagination-btn ${
            currentPage === page
              ? "reward-pagination-active"
              : ""
          }`}
          disabled={loading}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </button>
      ))}

    {currentPage < totalPages - 2 && (
      <span className="reward-pagination-dots">
        ...
      </span>
    )}

    {totalPages > 1 && (
      <button
        type="button"
        className={`reward-pagination-btn ${
          currentPage === totalPages
            ? "reward-pagination-active"
            : ""
        }`}
        disabled={loading}
        onClick={() => setCurrentPage(totalPages)}
      >
        {totalPages}
      </button>
    )}

    <button
      type="button"
      className="reward-pagination-btn reward-pagination-arrow"
      disabled={
        currentPage === totalPages || loading
      }
      onClick={() =>
        setCurrentPage((prev) => prev + 1)
      }
    >
      ›
    </button>

  </div>
</div>

        </div>

      </div>
      {showEditModal && (
  <div
    className="reward-modal-overlay"
    onClick={() => {
      if (!editLoading) {
        setShowEditModal(false);
      }
    }}
  >
    <div
      className="reward-edit-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="reward-modal-header">
        <div className="reward-modal-title">
          <div className="reward-modal-icon">
            <FaGift />
          </div>

          <div>
            <h2>Edit Reward Rule</h2>
            <p>
              Update your reward configuration
            </p>
          </div>
        </div>

        <button
          type="button"
          className="reward-modal-close"
          onClick={() => setShowEditModal(false)}
          disabled={editLoading}
        >
          <FaTimes />
        </button>
      </div>

      <form onSubmit={handleUpdateReward}>
        <div className="reward-modal-body">

          {/* Reward Name */}
          <div className="reward-modal-group">
            <label>
              Reward Name <span>*</span>
            </label>

            <input
              type="text"
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              placeholder="Enter reward name"
              className={
                editErrors.name ? "input-error" : ""
              }
            />

            {editErrors.name && (
              <small className="field-error">
                {editErrors.name}
              </small>
            )}
          </div>

          {/* Trigger */}
          <div className="reward-modal-group">
            <label>
              Trigger <span>*</span>
            </label>

            <select
              name="trigger"
              value={editForm.trigger}
              onChange={handleEditTriggerChange}
              className={
                editErrors.trigger ? "input-error" : ""
              }
            >
              <option value="">
                Select trigger
              </option>

              <option value="referral">
                Referral
              </option>

              <option value="order">
                Order
              </option>

              <option value="consultation">
                Consultation
              </option>
            </select>

            {editErrors.trigger && (
              <small className="field-error">
                {editErrors.trigger}
              </small>
            )}
          </div>

          {/* Coupon */}
          <div className="reward-modal-group">
            <label>
              Private Coupon <span>*</span>
            </label>

            <select
              name="coupon_id"
              value={editForm.coupon_id}
              onChange={handleEditChange}
              disabled={couponLoading}
              className={
                editErrors.coupon_id
                  ? "input-error"
                  : ""
              }
            >
              <option value="">
                {couponLoading
                  ? "Loading coupons..."
                  : "Select private coupon"}
              </option>

              {coupons.map((coupon) => (
                <option
                  key={coupon.id}
                  value={coupon.id}
                >
                  {coupon.code}
                </option>
              ))}
            </select>

            {editErrors.coupon_id && (
              <small className="field-error">
                {editErrors.coupon_id}
              </small>
            )}
          </div>

          {/* REFERRAL */}
          {editForm.trigger === "referral" && (
            <div className="reward-modal-section">

              <div className="reward-modal-section-title">
                <FaBolt />

                <div>
                  <h3>Referral Conditions</h3>
                  <p>
                    Configure when the referral is completed.
                  </p>
                </div>
              </div>

              <div className="reward-modal-group">
                <label>
                  Complete On <span>*</span>
                </label>

                <select
                  name="complete_on"
                  value={editForm.complete_on}
                  onChange={handleEditChange}
                  className={
                    editErrors.complete_on
                      ? "input-error"
                      : ""
                  }
                >
                  <option value="">
                    Select completion event
                  </option>

                  <option value="register">
                    Friend Registration
                  </option>

                  <option value="first_order">
                    Friend's First Order
                  </option>
                </select>

                {editErrors.complete_on && (
                  <small className="field-error">
                    {editErrors.complete_on}
                  </small>
                )}
              </div>
            </div>
          )}

          {/* ORDER / CONSULTATION */}
          {(editForm.trigger === "order" ||
            editForm.trigger === "consultation") && (
            <div className="reward-modal-section">

              <div className="reward-modal-section-title">
                <FaBolt />

                <div>
                  <h3>
                    {editForm.trigger === "order"
                      ? "Order Conditions"
                      : "Consultation Conditions"}
                  </h3>

                  <p>
                    Set the qualifying condition.
                  </p>
                </div>
              </div>

              {/* Window */}
              <div className="reward-modal-group">
                <label>
                  Window <span>*</span>
                </label>

                <select
                  name="window"
                  value={editForm.window}
                  onChange={handleEditChange}
                  className={
                    editErrors.window
                      ? "input-error"
                      : ""
                  }
                >
                  <option value="">
                    Select window
                  </option>

                  <option value="event">
                    Event
                  </option>

                  <option value="day">
                    Day
                  </option>

                  <option value="all_time">
                    All Time
                  </option>
                </select>

                {editErrors.window && (
                  <small className="field-error">
                    {editErrors.window}
                  </small>
                )}
              </div>

            
              <div className="reward-modal-row">

                <div className="reward-modal-group">
                  <label>Minimum Amount</label>

                  <div className="reward-amount-input">
                    <span>₹</span>

                    <input
                      type="number"
                      name="min_amount"
                      min="0"
                      step="0.01"
                      value={editForm.min_amount}
                      onChange={handleEditChange}
                      placeholder="e.g. 500"
                    />
                  </div>

                  {editErrors.min_amount && (
                    <small className="field-error">
                      {editErrors.min_amount}
                    </small>
                  )}
                </div>

                <div className="reward-modal-group">
                  <label>Minimum Count</label>

                  <input
                    type="number"
                    name="min_count"
                    min="1"
                    step="1"
                    value={editForm.min_count}
                    onChange={handleEditChange}
                    placeholder="e.g. 3"
                  />

                  {editErrors.min_count && (
                    <small className="field-error">
                      {editErrors.min_count}
                    </small>
                  )}
                </div>

              </div>

              {editErrors.ruleCondition && (
                <div className="condition-error">
                  {editErrors.ruleCondition}
                </div>
              )}

            </div>
          )}

          {/* MAX TIMES */}
          {editForm.trigger && (
            <div className="reward-modal-group">
              <label>
                Maximum Times Per Customer
              </label>

              <input
                type="number"
                name="max_times_per_customer"
                min="1"
                step="1"
                value={
                  editForm.max_times_per_customer
                }
                onChange={handleEditChange}
                placeholder="Leave empty for no cap"
                className={
                  editErrors.max_times_per_customer
                    ? "input-error"
                    : ""
                }
              />

              {editErrors.max_times_per_customer && (
                <small className="field-error">
                  {editErrors.max_times_per_customer}
                </small>
              )}
            </div>
          )}

          {/* ACTIVE */}
          <div className="reward-modal-active-box">

            <div className="reward-modal-active-content">
              <div className="reward-modal-active-icon">
                <FaCircleCheck />
              </div>

              <div>
                <strong>Active Rule</strong>
                <p>
                  Customers can earn this reward when
                  conditions are satisfied.
                </p>
              </div>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                name="is_active"
                checked={editForm.is_active}
                onChange={handleEditChange}
              />

              <span className="slider"></span>
            </label>

          </div>

        </div>

      
        <div className="reward-modal-footer">

          <button
            type="button"
            className="reward-modal-cancel"
            onClick={() => setShowEditModal(false)}
            disabled={editLoading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="reward-modal-save"
            disabled={editLoading}
          >
            {editLoading ? (
              <>
                <span className="button-spinner"></span>
                Saving...
              </>
            ) : (
              <>
                <FaSave />
                Save Changes
              </>
            )}
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
        Are you sure you want to delete this Coupon?
      </h3>

      <div className="form-buttons">
        <button
          className="otp-btn verify-btn"
          onClick={() => {
            handleDelete(RewardId);
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
    
    

   


   
  );
};

export default Reward;