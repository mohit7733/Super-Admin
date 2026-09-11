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

const handleEditReward = (id) => {
  navigate(`/reward/edit/${id}`);
};
  return (
   
<>
  <div className="page-header">

        <h1>
          Reward  Management
        </h1>

      </div>
   <div className="stats2-grid">



        <div
          className="stat2-card"
          style={{
            borderTopColor:
              "#0D614E",
          }}
        >

          <div
            className="stat2-icon"
            style={{
              background:
                "#0D614E20",

              color:
                "#0D614E",
            }}
          >

            <FaGift
              size={16}
            />

          </div>


          <div className="stat2-info">

            <h3>
              Total Reward
            </h3>

            <div className="stat2-value">
            0
            </div>

          </div>

        </div>


       

        <div
          className="stat2-card"
          style={{
            borderTopColor:
              "#0D614E",
          }}
        >

          <div
            className="stat2-icon"
            style={{
              background:
                "#0D614E20",

              color:
                "#0D614E",
            }}
          >

            <FaCircleCheck
              size={16}
            />

          </div>


          <div className="stat2-info">

            <h3>
              Active Coupons
            </h3>

            <div className="stat2-value">
            0
            </div>

          </div>

        </div>


       

        <div
          className="stat2-card"
          style={{
            borderTopColor:
              "#0D614E",
          }}
        >

          <div
            className="stat2-icon"
            style={{
              background:
                "#0D614E20",

              color:
                "#0D614E",
            }}
          >

            <FaCircleXmark
              size={16}
            />

          </div>


          <div className="stat2-info">

            <h3>
              Inactive Coupons
            </h3>

            <div className="stat2-value">
            0
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

                      {/* REWARD */}

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

                      {/* ACTIONS */}

                      <td>

                        <div className="reward-actions">

                       
<button
  className="coupon-action-btn coupon-edit-btn"
  title="Edit Reward"
  onClick={() => handleEditReward(reward.id)}
>
  <FaEdit />
</button>

                          <button
                         className="coupon-action-btn coupon-delete-btn"
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