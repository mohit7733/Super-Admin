import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaGift,
  FaBolt,
  FaCircleCheck,
  FaCircleXmark,
} from "react-icons/fa6";

import { FaSave, FaInfoCircle } from "react-icons/fa";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../../Base";
import "./AddReward.css";

const EditReward = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);

  const [form, setForm] = useState({
    name: "",
    trigger: "",
    coupon_id: "",
    coupon_code: "",
    complete_on: "",
    window: "",
    is_active: true,
    referral_event: "",
    condition: "",
    condition_value: "",
  });

 

  const getToken = () => {
    return sessionStorage.getItem("superadmin_token");
  };

 

  const handleSessionExpired = () => {
    sessionStorage.removeItem("superadmin_token");

    toast.error("Session expired. Please login again");

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  

  const getRewardDetail = async () => {
    const token = getToken();

    if (!token) {
      handleSessionExpired();
      return;
    }

    if (!id) {
      toast.error("Reward ID is missing");
      setLoading(false);

      setTimeout(() => {
        navigate("/reward");
      }, 1000);

      return;
    }

    try {
      setLoading(true);

      console.log("EDIT REWARD ID:", id);

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

      console.log("REWARD DETAIL STATUS:", response.status);

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      console.log("REWARD DETAIL RESPONSE:", data);

      if (!response.ok) {
        toast.error(data.message || "Failed to load reward");
        return;
      }

      if (data.status === "success") {
        const reward = data.data;

        console.log("REWARD OBJECT:", reward);

    
        const rewardCouponId =
          reward?.coupon_id ||
          reward?.coupon?.id ||
          "";

        const rewardCouponCode =
          reward?.coupon_code ||
          reward?.coupon?.code ||
          reward?.coupon?.coupon_code ||
          reward?.coupon?.name ||
          "";

        const rewardReferralEvent =
          reward?.referral_event ||
          reward?.referral?.event ||
          "";

        const rewardCondition =
          reward?.condition ||
          reward?.order_condition ||
          reward?.consultation_condition ||
          "";

        const rewardConditionValue =
          reward?.condition_value ??
          reward?.value ??
          "";

        setForm({
          name: reward?.name || "",

          trigger: reward?.trigger || "",

          coupon_id: rewardCouponId,

          coupon_code: rewardCouponCode,

          complete_on: reward?.complete_on || "",

          window: reward?.window || "",

          is_active:
            typeof reward?.is_active === "boolean"
              ? reward.is_active
              : true,

          referral_event: rewardReferralEvent,

          condition: rewardCondition,

          condition_value:
            rewardConditionValue !== null &&
            rewardConditionValue !== undefined
              ? String(rewardConditionValue)
              : "",
        });
      } else {
        toast.error(
          data.message || "Failed to load reward details"
        );
      }
    } catch (error) {
      console.error("GET REWARD DETAIL ERROR:", error);

      toast.error(
        "Something went wrong while loading reward details"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= GET COUPONS =================

  const getCoupons = async () => {
    const token = getToken();

    if (!token) {
      return;
    }

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
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      console.log("COUPONS RESPONSE:", data);

      if (data.status === "success") {
        const couponData = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data?.results)
          ? data.data.results
          : [];

        setCoupons(couponData);
      }
    } catch (error) {
      console.error("GET COUPONS ERROR:", error);
    }
  };

  // ================= USE EFFECT =================

  useEffect(() => {
    getRewardDetail();
    getCoupons();
  }, [id]);

  // ================= HANDLE INPUT =================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ================= HANDLE COUPON =================

  const handleCouponChange = (e) => {
    const couponId = e.target.value;

    const selectedCoupon = coupons.find(
      (coupon) => String(coupon.id) === String(couponId)
    );

    setForm((prev) => ({
      ...prev,

      coupon_id: couponId,

      coupon_code:
        selectedCoupon?.code ||
        selectedCoupon?.coupon_code ||
        selectedCoupon?.name ||
        "",
    }));
  };

  // ================= FORMAT =================

  const formatValue = (value) => {
    if (!value) {
      return "Not specified";
    }

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // ================= VALIDATION =================

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Reward name is required");
      return false;
    }

    if (!form.trigger) {
      toast.error("Please select a trigger");
      return false;
    }

    if (!form.coupon_id) {
      toast.error("Please select a coupon");
      return false;
    }

    if (
      form.trigger === "referral" &&
      !form.referral_event
    ) {
      toast.error("Please select referral event");
      return false;
    }

    if (
      (form.trigger === "order" ||
        form.trigger === "consultation") &&
      !form.condition
    ) {
      toast.error("Please select condition");
      return false;
    }

    return true;
  };

  // ================= UPDATE REWARD =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const token = getToken();

    if (!token) {
      handleSessionExpired();
      return;
    }

    if (!id) {
      toast.error("Reward ID is missing");
      return;
    }

    setSubmitLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        trigger: form.trigger,
        coupon_id: form.coupon_id,
        complete_on: form.complete_on,
        window: form.window,
        is_active: form.is_active,
      };

      // Referral
      if (form.trigger === "referral") {
        payload.referral_event = form.referral_event;
      }

      // Order / Consultation
      if (
        form.trigger === "order" ||
        form.trigger === "consultation"
      ) {
        payload.condition = form.condition;

        if (form.condition_value !== "") {
          payload.condition_value = form.condition_value;
        }
      }

      console.log("UPDATE REWARD PAYLOAD:", payload);

      const response = await fetch(
        `${BASE_URL}/promotions/admin/reward-rules/${id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log(
        "UPDATE REWARD STATUS:",
        response.status
      );

      const data = await response.json();

      console.log(
        "UPDATE REWARD RESPONSE:",
        data
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        handleSessionExpired();
        return;
      }

      if (
        response.ok &&
        data.status === "success"
      ) {
        toast.success(
          "Reward updated successfully!"
        );

        setTimeout(() => {
          navigate("/reward");
        }, 1000);
      } else {
        toast.error(
          data.message ||
            "Failed to update reward"
        );
      }
    } catch (error) {
      console.error(
        "UPDATE REWARD ERROR:",
        error
      );

      toast.error(
        "Something went wrong while updating reward"
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <>
        <ToastContainer
          position="top-right"
          autoClose={3000}
        />

        <div
          className="add-reward-page"
          style={{
            width: "100%",
            minHeight: "500px",
            padding: "25px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              minHeight: "400px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              color: "#6f7c77",
              fontSize: "13px",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                border: "3px solid #dfeae6",
                borderTop: "3px solid #0d614e",
                borderRadius: "50%",
                animation:
                  "editRewardSpin 0.8s linear infinite",
              }}
            />

            <span>
              Loading reward details...
            </span>
          </div>

          <style>
            {`
              @keyframes editRewardSpin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}
          </style>
        </div>
      </>
    );
  }

  // ================= MAIN UI =================

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
      />

      <div
        className="add-reward-page"
        style={{
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* ================= HEADER ================= */}

        <div
          className="add-reward-header"
          style={{
            display: "block",
            width: "100%",
          }}
        >
          <div className="add-reward-header-left">
            <button
              type="button"
              className="reward-back-btn"
              onClick={() => navigate("/reward")}
              title="Back to Rewards"
            >
              <FaArrowLeft />
            </button>

            <div>
              <h1>Edit Reward</h1>

              <p>
                Update your reward rule configuration
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="add-reward-layout"
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) 330px",
            gap: "20px",
            alignItems: "start",
            width: "100%",
          }}
        >
          {/* =====================================================
              LEFT SIDE
          ====================================================== */}

          <div
            style={{
              minWidth: 0,
              width: "100%",
            }}
          >
            {/* ================= FORM CARD ================= */}

            <div
              className="reward-form-card"
              style={{
                display: "block",
                width: "100%",
              }}
            >
              {/* HEADER */}

              <div className="reward-form-card-header">
                <div className="reward-form-header-icon">
                  <FaGift />
                </div>

                <div>
                  <h2>Reward Rule</h2>

                  <p>
                    Update the basic reward information
                  </p>
                </div>
              </div>

              {/* BODY */}

              <div
                className="reward-form-body"
                style={{
                  display: "block",
                }}
              >
                {/* ================= NAME + TRIGGER ================= */}

                <div className="form-row">
                  <div className="reward-form-group">
                    <label>
                      Reward Name{" "}
                      <span>*</span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter reward name"
                    />
                  </div>

                  <div className="reward-form-group">
                    <label>
                      Trigger{" "}
                      <span>*</span>
                    </label>

                    <select
                      name="trigger"
                      value={form.trigger}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select Trigger
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
                  </div>
                </div>

                {/* ================= COUPON + COMPLETE ON ================= */}

                <div className="form-row">
                  <div className="reward-form-group">
                    <label>
                      Coupon{" "}
                      <span>*</span>
                    </label>

                    <select
                      value={form.coupon_id}
                      onChange={handleCouponChange}
                    >
                      <option value="">
                        Select Coupon
                      </option>

                      {/* Existing coupon from reward API */}
                      {form.coupon_id &&
                        form.coupon_code &&
                        !coupons.some(
                          (coupon) =>
                            String(coupon.id) ===
                            String(form.coupon_id)
                        ) && (
                          <option
                            value={form.coupon_id}
                          >
                            {form.coupon_code}
                          </option>
                        )}

                      {/* Coupon list */}
                      {coupons.map((coupon) => (
                        <option
                          key={coupon.id}
                          value={coupon.id}
                        >
                          {coupon.code ||
                            coupon.coupon_code ||
                            coupon.name ||
                            "Unnamed Coupon"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="reward-form-group">
                    <label>
                      Complete On
                    </label>

                    <select
                      name="complete_on"
                      value={form.complete_on}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select Completion
                      </option>

                      <option value="event">
                        Event
                      </option>

                      <option value="order">
                        Order
                      </option>

                      <option value="consultation">
                        Consultation
                      </option>
                    </select>
                  </div>
                </div>

                {/* ================= WINDOW ================= */}

                <div className="reward-form-group">
                  <label>
                    Window
                  </label>

                  <select
                    name="window"
                    value={form.window}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select Window
                    </option>

                    <option value="once">
                      Once
                    </option>

                    <option value="daily">
                      Daily
                    </option>

                    <option value="weekly">
                      Weekly
                    </option>

                    <option value="monthly">
                      Monthly
                    </option>
                  </select>
                </div>

                {/* =================================================
                    REFERRAL SECTION
                ================================================= */}

                {form.trigger === "referral" && (
                  <div className="dynamic-section">
                    <div className="dynamic-section-title">
                      <FaBolt />

                      <div>
                        <h3>
                          Referral Condition
                        </h3>

                        <p>
                          Configure when the referral
                          reward should be completed
                        </p>
                      </div>
                    </div>

                    <div className="reward-form-group">
                      <label>
                        Referral Event{" "}
                        <span>*</span>
                      </label>

                      <select
                        name="referral_event"
                        value={form.referral_event}
                        onChange={handleChange}
                      >
                        <option value="">
                          Select Referral Event
                        </option>

                        <option value="signup">
                          Signup
                        </option>

                        <option value="first_order">
                          First Order
                        </option>

                        <option value="first_consultation">
                          First Consultation
                        </option>
                      </select>
                    </div>

                    <div className="info-box">
                      <FaInfoCircle />

                      <div>
                        <strong>
                          Referral Rule
                        </strong>

                        <p>
                          The reward will be triggered
                          according to the selected
                          referral event.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================
                    ORDER / CONSULTATION
                ================================================= */}

                {(form.trigger === "order" ||
                  form.trigger ===
                    "consultation") && (
                  <div className="dynamic-section">
                    <div className="dynamic-section-title">
                      <FaBolt />

                      <div>
                        <h3>
                          {form.trigger ===
                          "order"
                            ? "Order Condition"
                            : "Consultation Condition"}
                        </h3>

                        <p>
                          Configure the condition
                          required to complete this
                          reward
                        </p>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="reward-form-group">
                        <label>
                          Condition{" "}
                          <span>*</span>
                        </label>

                        <select
                          name="condition"
                          value={form.condition}
                          onChange={handleChange}
                        >
                          <option value="">
                            Select Condition
                          </option>

                          <option value="count">
                            Count
                          </option>

                          <option value="amount">
                            Amount
                          </option>
                        </select>
                      </div>

                      <div className="reward-form-group">
                        <label>
                          Condition Value
                        </label>

                        <input
                          type="number"
                          name="condition_value"
                          value={
                            form.condition_value
                          }
                          onChange={handleChange}
                          placeholder="Enter condition value"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="info-box">
                      <FaInfoCircle />

                      <div>
                        <strong>
                          Condition Rule
                        </strong>

                        <p>
                          Configure the condition that
                          must be satisfied before this
                          reward is completed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ================= ACTIVE ================= */}

                <div className="active-toggle-box">
                  <div className="active-toggle-content">
                    <div className="active-icon">
                      {form.is_active ? (
                        <FaCircleCheck />
                      ) : (
                        <FaCircleXmark />
                      )}
                    </div>

                    <div>
                      <strong>
                        Reward Status
                      </strong>

                      <p>
                        {form.is_active
                          ? "This reward is currently active"
                          : "This reward is currently inactive"}
                      </p>
                    </div>
                  </div>

                  <label className="reward-switch">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                    />

                    {/* <span className="slider"></span> */}
                  </label>
                </div>
              </div>
            </div>

            {/* ================= FOOTER ================= */}

            <div className="reward-form-footer">
              <button
                type="button"
                className="reward-cancel-btn"
                onClick={() =>
                  navigate("/reward")
                }
                disabled={submitLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="reward-submit-btn"
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <>
                    <div className="button-spinner"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Update Reward
                  </>
                )}
              </button>
            </div>
          </div>

          {/* =====================================================
              RIGHT SIDE PREVIEW
          ====================================================== */}

          <div className="reward-preview-card">
            <div className="reward-preview-header">
              <FaGift />

              <div>
                <h3>
                  Reward Preview
                </h3>

                <p>
                  Live configuration preview
                </p>
              </div>
            </div>

            <div className="preview-content">
              {/* NAME */}

              <div className="preview-item">
                <span>
                  Reward Name
                </span>

                <strong>
                  {form.name ||
                    "Not specified"}
                </strong>
              </div>

              {/* TRIGGER */}

              <div className="preview-item">
                <span>
                  Trigger
                </span>

                <strong>
                  {formatValue(form.trigger)}
                </strong>
              </div>

              {/* COUPON */}

              <div className="preview-item">
                <span>
                  Coupon
                </span>

                <strong className="preview-code">
                  {form.coupon_code ||
                    "Not specified"}
                </strong>
              </div>

              {/* COMPLETE ON */}

              <div className="preview-item">
                <span>
                  Complete On
                </span>

                <strong>
                  {formatValue(
                    form.complete_on
                  )}
                </strong>
              </div>

              {/* WINDOW */}

              <div className="preview-item">
                <span>
                  Window
                </span>

                <strong>
                  {formatValue(
                    form.window
                  )}
                </strong>
              </div>

              {/* REFERRAL EVENT */}

              {form.trigger ===
                "referral" &&
                form.referral_event && (
                  <div className="preview-item">
                    <span>
                      Referral Event
                    </span>

                    <strong>
                      {formatValue(
                        form.referral_event
                      )}
                    </strong>
                  </div>
                )}

              {/* CONDITION */}

              {(form.trigger ===
                "order" ||
                form.trigger ===
                  "consultation") &&
                form.condition && (
                  <div className="preview-item">
                    <span>
                      Condition
                    </span>

                    <strong>
                      {formatValue(
                        form.condition
                      )}

                      {form.condition_value && (
                        <>
                          {" - "}
                          {
                            form.condition_value
                          }
                        </>
                      )}
                    </strong>
                  </div>
                )}

              {/* STATUS */}

              <div className="preview-status">
                <span>
                  Status
                </span>

                {form.is_active ? (
                  <span className="status-active">
                    Active
                  </span>
                ) : (
                  <span className="status-inactive">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            {/* RULE EXAMPLE */}

            <div className="rule-examples">
              <h4>
                Reward Rule
              </h4>

              <p>
                This reward will be triggered
                when{" "}
                <strong>
                  {form.trigger
                    ? formatValue(
                        form.trigger
                      )
                    : "the selected trigger"}
                </strong>{" "}
                conditions are completed.
              </p>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditReward;