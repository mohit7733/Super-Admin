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

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // ==============================
  // GET REWARDS
  // ==============================
  const getRewards = async () => {
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
        `${BASE_URL}/promotions/admin/reward-rules/`,
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

      const data = await response.json();

      console.log("FULL REWARD RESPONSE:", data);
      console.log("REWARD DATA:", data.data);

      if (data.status === "success") {
        const rewardData = Array.isArray(data.data)
          ? data.data
          : [];

        const sortedData = [...rewardData].sort(
          (a, b) =>
            new Date(b.created_at) -
            new Date(a.created_at)
        );

        setRewards(sortedData);
        setFilteredRewards(sortedData);

       

        const activeCount = sortedData.filter(
          (item) => item.is_active === true
        ).length;

        const inactiveCount = sortedData.filter(
          (item) => item.is_active === false
        ).length;

        setStats({
          total: sortedData.length,
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

      setStats({
        total: 0,
        active: 0,
        inactive: 0,
      });
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    getRewards();
  }, []);

  // ==============================
  // SEARCH
  // ==============================

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

  // ==============================
  // DATE FORMAT
  // ==============================

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
    navigate("/reward/add");
  };



  const handleViewReward = (reward) => {
    navigate(`/reward/view/${reward.id}`);
  };

  

  const handleEditReward = (reward) => {
    navigate(`/reward/edit/${reward.id}`);
  };

  return (
  

  
<>
  <div className="page-header">

        <h1>
          Reward  Management
        </h1>

      </div>
  <div className="reward-filter-card">

        <div className="reward-filter-left">

          <div className="reward-search-wrapper">

            <FaSearch className="reward-search-icon" />

            <input
              type="text"
              placeholder="Search by reward name, coupon code or trigger..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="reward-search-input"
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

        <div className="reward-result-count">
          <span>
            {filteredRewards.length}
          </span>{" "}
          reward
          {filteredRewards.length !== 1
            ? "s"
            : ""}
        </div>

      </div>
   <div className="reward-table-card">

     

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

                      {/* NUMBER */}

                      <td>
                        <span className="reward-row-number">
                          {String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </span>
                      </td>

                      {/* REWARD */}

                      <td>
                        <div className="reward-name-cell">

                          <div className="reward-avatar">
                            <FaGift />
                          </div>

                          <div>
                            <div className="reward-name">
                              {reward.name || "-"}
                            </div>

                            <div className="reward-id">
                              ID:{" "}
                              {reward.id
                                ? `${reward.id.slice(
                                    0,
                                    8
                                  )}...`
                                : "-"}
                            </div>
                          </div>

                        </div>
                      </td>

                      {/* TRIGGER */}

                      <td>
                        <span className="trigger-badge">
                          <FaBolt size={11} />

                          {formatTrigger(
                            reward.trigger
                          )}
                        </span>
                      </td>

                      {/* COUPON */}

                      <td>
                        <div className="coupon-cell">

                          <span className="coupon-code">
                            {reward.coupon_code ||
                              "-"}
                          </span>

                          <span className="coupon-id">
                            {reward.coupon_id
                              ? `${reward.coupon_id.slice(
                                  0,
                                  8
                                )}...`
                              : "-"}
                          </span>

                        </div>
                      </td>

                      {/* COMPLETE ON */}

                      <td>
                        <span className="completion-badge">
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

                      {/* ACTIONS */}

                      <td>

                        <div className="reward-actions">

                          <button
                            className="reward-action view"
                            title="View Reward"
                            onClick={() =>
                              handleViewReward(
                                reward
                              )
                            }
                          >
                            <FaEye />
                          </button>

                          <button
                            className="reward-action edit"
                            title="Edit Reward"
                            onClick={() =>
                              handleEditReward(
                                reward
                              )
                            }
                          >
                            <FaEdit />
                          </button>

                          <button
                            className="reward-action delete"
                            title="Delete Reward"
                            onClick={() =>
                              console.log(
                                "Delete:",
                                reward.id
                              )
                            }
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

        </div>

      </div>

</>
    
    

   

     

    


   

   
  );
};

export default Reward;