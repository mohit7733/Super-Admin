import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaGift,
  FaBolt,
  FaCircleCheck,
  
} from "react-icons/fa6";
import { FaSave } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../../Base";
import "./AddReward.css";

const AddReward = () => {
  const navigate = useNavigate();
const initialForm = {
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

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [coupons, setCoupons] = useState([]);
const [couponLoading, setCouponLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear field error
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleTriggerChange = (e) => {
  const trigger = e.target.value;

  setForm((prev) => ({
    ...prev,
    trigger,

   
    complete_on: "",

    
    min_amount: "",
    min_count: "",
    window: "",
  }));

  setErrors({});
};

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Reward name is required";
    }

    if (!form.trigger) {
      newErrors.trigger = "Please select a trigger";
    }

    if (!form.coupon_id.trim()) {
      newErrors.coupon_id = "Private coupon ID is required";
    }

    // REFERRAL
    if (form.trigger === "referral") {
      if (!form.complete_on) {
        newErrors.complete_on = "Please select completion event";
      }

      if (
        form.max_times_per_customer !== "" &&
        (Number(form.max_times_per_customer) < 1 ||
          !Number.isInteger(Number(form.max_times_per_customer)))
      ) {
        newErrors.max_times_per_customer =
          "Enter a valid positive whole number";
      }
    }

    // ORDER / CONSULTATION
    if (
      form.trigger === "order" ||
      form.trigger === "consultation"
    ) {
      if (!form.window) {
        newErrors.window = "Please select a window";
      }

      if (!form.min_amount && !form.min_count) {
        newErrors.ruleCondition =
          "Enter either minimum amount or minimum count";
      }

      if (
        form.min_amount !== "" &&
        (Number(form.min_amount) < 0 ||
          Number.isNaN(Number(form.min_amount)))
      ) {
        newErrors.min_amount = "Enter a valid amount";
      }

      if (
        form.min_count !== "" &&
        (Number(form.min_count) < 1 ||
          !Number.isInteger(Number(form.min_count)))
      ) {
        newErrors.min_count =
          "Minimum count must be a positive whole number";
      }

      if (
        form.max_times_per_customer !== "" &&
        (Number(form.max_times_per_customer) < 1 ||
          !Number.isInteger(Number(form.max_times_per_customer)))
      ) {
        newErrors.max_times_per_customer =
          "Enter a valid positive whole number";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
      return false;
    }

    return true;
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

    console.log("COUPON GET RESPONSE:", data);

    if (data.status === "success") {
      setCoupons(data.data?.results || data.data || []);
    } else {
      toast.error(data.message || "Failed to fetch coupons");
    }
  } catch (error) {
    console.error("Get Coupons Error:", error);
    toast.error("Something went wrong while fetching coupons");
  } finally {
    setCouponLoading(false);
  }
};

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setSubmitLoading(true);

  try {
    const payload = {
      name: form.name.trim(),
      trigger: form.trigger,
      coupon_id: form.coupon_id.trim(),
      is_active: form.is_active,
    };

    // Referral fields
    if (form.trigger === "referral") {
      payload.complete_on = form.complete_on;
    }

    // Order / Consultation fields
    if (
      form.trigger === "order" ||
      form.trigger === "consultation"
    ) {
      payload.window = form.window;

      if (form.min_amount !== "") {
        payload.min_amount = Number(form.min_amount);
      }

      if (form.min_count !== "") {
        payload.min_count = Number(form.min_count);
      }
    }

    // Optional field
    if (form.max_times_per_customer !== "") {
      payload.max_times_per_customer = Number(
        form.max_times_per_customer
      );
    }

    console.log("REWARD CREATE PAYLOAD:", payload);

    const response = await fetch(
      `${BASE_URL}/promotions/admin/reward-rules/`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log("Reward Create Status:", response.status);

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log("REWARD CREATE RESPONSE:", data);

    // SUCCESS
    if (data.success === true || data.status === "success") {
      toast.success(
        data.message || "Reward rule created successfully"
      );

      setTimeout(() => {
        navigate("/reward");
      }, 1000);
    }

    // API ERROR
    else {
      if (data.errors && typeof data.errors === "object") {
        const apiErrors = {};

        Object.entries(data.errors).forEach(
          ([field, messages]) => {
            const message = Array.isArray(messages)
              ? messages[0]
              : messages;

            apiErrors[field] = message;
          }
        );

        // Set API errors in state
        setErrors((prev) => ({
          ...prev,
          ...apiErrors,
        }));

        // Show exact API error in toast
        const firstError = Object.values(apiErrors)[0];

        toast.error(
          firstError ||
            data.message ||
            "Invalid data provided"
        );
      } else {
        toast.error(
          data.message ||
            "Failed to create reward rule"
        );
      }
    }
  } catch (error) {
    console.error("Create Reward Error:", error);

    toast.error(
      "Something went wrong while creating reward rule"
    );
  } finally {
    setSubmitLoading(false);
  }
};
  const handleCancel = () => {
    navigate("/reward");
  };
  useEffect(() => {
  getCoupons();
}, []);

  return (
    <>
     <div className="add-reward-page">
      

     
      <div className="add-reward-header">
        <div className="add-reward-header-left">
          <button
            className="reward-back-btn"
            onClick={handleCancel}
            type="button"
          >
            <FaArrowLeft />
          </button>

          <div>
            <h1>Add Reward Rule</h1>
            <p>
              Create a rule that determines when a customer
              receives a private coupon.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="add-reward-layout">
          
          <div className="reward-form-card">
            <div className="reward-form-card-header">
              <div className="reward-form-header-icon">
                <FaGift />
              </div>

              <div>
                <h2>Reward Rule Details</h2>
                <p>
                  Configure the event and conditions for this
                  reward.
                </p>
              </div>
            </div>

            <div className="reward-form-body">
              
              <div className="reward-form-group">
                <label>
                  Reward Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter reward name (e.g. ₹220 Friend Referral Reward)"
                  className={errors.name ? "input-error" : ""}
                />

                {errors.name && (
                  <small className="field-error">
                    {errors.name}
                  </small>
                )}
              </div>

             
              <div className="reward-form-group">
                <label>
                  Trigger <span>*</span>
                </label>

                <select
                  name="trigger"
                  value={form.trigger}
                  onChange={handleTriggerChange}
                  className={
                    errors.trigger ? "input-error" : ""
                  }
                >
                  <option value="">Select trigger</option>
                  <option value="referral">Referral</option>
                  <option value="order">Order</option>
                  <option value="consultation">
                    Consultation
                  </option>
                </select>

                {errors.trigger && (
                  <small className="field-error">
                    {errors.trigger}
                  </small>
                )}
              </div>

              <div className="reward-form-group">
                <label>
                  Private Coupon ID <span>*</span>
                </label>

                 <select
  name="coupon_id"
  value={form.coupon_id}
  onChange={handleChange}
       className={
                    errors.trigger ? "input-error" : ""
                  }
  disabled={couponLoading}
>
  <option value="">
    {couponLoading ? "Loading coupons..." : "Select private coupon"}
  </option>

  {coupons.map((coupon) => (
    <option key={coupon.id} value={coupon.id}>
      {coupon.code} 
    </option>
  ))}
</select>

               

                {errors.coupon_id && (
                  <small className="field-error">
                    {errors.coupon_id}
                  </small>
                )}
              </div>

   
              {form.trigger === "referral" && (
                <div className="dynamic-section">
                  <div className="dynamic-section-title">
                    <FaBolt />
                    <div>
                      <h3>Referral Conditions</h3>
                      <p>
                        Configure when the referral should be
                        considered complete.
                      </p>
                    </div>
                  </div>

                  <div className="reward-form-group">
                    <label>
                      Complete On <span>*</span>
                    </label>

                    <select
                      name="complete_on"
                      value={form.complete_on}
                      onChange={handleChange}
                      className={
                        errors.complete_on
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

                    {errors.complete_on && (
                      <small className="field-error">
                        {errors.complete_on}
                      </small>
                    )}
                  </div>

                  <div className="info-box">
                    <FaCircleCheck />

                    <div>
                      <strong>Referral Rule</strong>
                      <p>
                        {form.complete_on === "register"
                          ? "The referrer receives the coupon immediately after the friend registers using their referral code."
                          : form.complete_on === "first_order"
                          ? "The referral remains pending until the friend's first confirmed order."
                          : "Choose when the referral should be completed."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= ORDER / CONSULTATION ================= */}
              {(form.trigger === "order" ||
                form.trigger === "consultation") && (
                <div className="dynamic-section">
                  <div className="dynamic-section-title">
                    <FaBolt />
                    <div>
                      <h3>
                        {form.trigger === "order"
                          ? "Order Conditions"
                          : "Consultation Conditions"}
                      </h3>

                      <p>
                        Set the qualifying condition for this
                        reward.
                      </p>
                    </div>
                  </div>
  <div className="reward-form-group">
                    <label>
                      Window <span>*</span>
                    </label>

                    <select
                      name="window"
                      value={form.window}
                      onChange={handleChange}
                      className={
                        errors.window ? "input-error" : ""
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

                    {errors.window && (
                      <small className="field-error">
                        {errors.window}
                      </small>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="reward-form-group">
                      <label>Minimum Amount</label>

                      <div className="amount-input">
                        <span>₹</span>

                        <input
                          type="number"
                          name="min_amount"
                          min="0"
                          step="0.01"
                          value={form.min_amount}
                          onChange={handleChange}
                          placeholder="e.g. 500"
                          className={
                            errors.min_amount
                              ? "input-error"
                              : ""
                          }
                        />
                      </div>

                      <small className="field-help">
                        Minimum qualifying payment amount.
                      </small>

                      {errors.min_amount && (
                        <small className="field-error">
                          {errors.min_amount}
                        </small>
                      )}
                    </div>

                    <div className="reward-form-group">
                      <label>Minimum Count</label>

                      <input
                        type="number"
                        name="min_count"
                        min="1"
                        step="1"
                        value={form.min_count}
                        onChange={handleChange}
                        placeholder="e.g. 3"
                        className={
                          errors.min_count
                            ? "input-error"
                            : ""
                        }
                      />

                      <small className="field-help">
                        Number of qualifying{" "}
                        {form.trigger === "order"
                          ? "orders"
                          : "consultations"}{" "}
                        required.
                      </small>

                      {errors.min_count && (
                        <small className="field-error">
                          {errors.min_count}
                        </small>
                      )}
                    </div>
                  </div>

                  {errors.ruleCondition && (
                    <div className="condition-error">
                      {errors.ruleCondition}
                    </div>
                  )}

                  {/* WINDOW */}
                

                  <div className="window-info">
                    <div>
                      <strong>Event</strong>
                      <span>
                        Every qualifying{" "}
                        {form.trigger === "order"
                          ? "order"
                          : "consultation"}{" "}
                        can earn the reward.
                      </span>
                    </div>

                    <div>
                      <strong>Day</strong>
                      <span>
                        Counts qualifying events within the
                        same day.
                      </span>
                    </div>

                    <div>
                      <strong>All Time</strong>
                      <span>
                        Counts qualifying events across the
                        customer's lifetime.
                      </span>
                    </div>
                  </div>
                </div>
              )}

             
              {form.trigger && (
                <div className="reward-form-group">
                  <label>
                    Maximum Times Per Customer
                  </label>

                  <input
                    type="number"
                    name="max_times_per_customer"
                    min="1"
                    step="1"
                    value={form.max_times_per_customer}
                    onChange={handleChange}
                    placeholder="Leave empty for no cap"
                    className={
                      errors.max_times_per_customer
                        ? "input-error"
                        : ""
                    }
                  />

                  <small className="field-help">
                    Leave empty if the customer can earn this
                    reward without an additional lifetime cap.
                  </small>

                  {errors.max_times_per_customer && (
                    <small className="field-error">
                      {errors.max_times_per_customer}
                    </small>
                  )}
                </div>
              )}

              <div className="active-toggle-box">
                <div className="active-toggle-content">
                  <div className="active-icon">
                    <FaCircleCheck />
                  </div>

                  <div>
                    <strong>Active Rule</strong>
                    <p>
                      Customers can earn this reward when
                      the rule conditions are satisfied.
                    </p>
                  </div>
                </div>

                <label className="switch">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                  />

                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* RIGHT SUMMARY */}
          <div className="reward-preview-card">
            <div className="reward-preview-header">
              <FaGift />
              <div>
                <h3>Rule Summary</h3>
                <p>Review your reward configuration</p>
              </div>
            </div>

            <div className="preview-content">
              <div className="preview-item">
                <span>Name</span>
                <strong>
                  {form.name || "Not specified"}
                </strong>
              </div>

              <div className="preview-item">
                <span>Trigger</span>
                <strong>
                  {form.trigger
                    ? form.trigger.charAt(0).toUpperCase() +
                      form.trigger.slice(1)
                    : "Not selected"}
                </strong>
              </div>

              <div className="preview-item">
                <span>Coupon ID</span>
                <strong className="preview-code">
                  {form.coupon_id || "Not specified"}
                </strong>
              </div>

              {form.trigger === "referral" && (
                <div className="preview-item">
                  <span>Complete On</span>
                  <strong>
                    {form.complete_on
                      ? form.complete_on === "register"
                        ? "Registration"
                        : "First Order"
                      : "Not selected"}
                  </strong>
                </div>
              )}

              {(form.trigger === "order" ||
                form.trigger === "consultation") && (
                <>
                  <div className="preview-item">
                    <span>Minimum Amount</span>
                    <strong>
                      {form.min_amount
                        ? `₹${form.min_amount}`
                        : "Not set"}
                    </strong>
                  </div>

                  <div className="preview-item">
                    <span>Minimum Count</span>
                    <strong>
                      {form.min_count || "Not set"}
                    </strong>
                  </div>

                  <div className="preview-item">
                    <span>Window</span>
                    <strong>
                      {form.window
                        ? form.window === "all_time"
                          ? "All Time"
                          : form.window.charAt(0).toUpperCase() +
                            form.window.slice(1)
                        : "Not selected"}
                    </strong>
                  </div>
                </>
              )}

              <div className="preview-item">
                <span>Max Times / Customer</span>
                <strong>
                  {form.max_times_per_customer || "No limit"}
                </strong>
              </div>

              <div className="preview-status">
                <span>Status</span>

                <span
                  className={
                    form.is_active
                      ? "status-active"
                      : "status-inactive"
                  }
                >
                  {form.is_active
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>

            <div className="rule-examples">
              <h4>Examples</h4>

              {!form.trigger && (
                <p>
                  Select a trigger to see an example rule.
                </p>
              )}

              {form.trigger === "referral" && (
                <p>
                  <strong>Referral:</strong> Friend registers
                  or places their first order using the
                  customer's referral code.
                </p>
              )}

              {form.trigger === "order" && (
                <p>
                  <strong>Order:</strong> Customer places a
                  qualifying order based on amount or count.
                </p>
              )}

              {form.trigger === "consultation" && (
                <p>
                  <strong>Consultation:</strong> Customer
                  completes a qualifying consultation payment.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div className="reward-form-footer">
          <button
            type="button"
            className="reward-cancel-btn"
            onClick={handleCancel}
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
                <span className="button-spinner"></span>
                Creating...
              </>
            ) : (
              <>
                <FaSave />
                Create Reward Rule
              </>
            )}
          </button>
        </div>
      </form>
    </div>
     <ToastContainer
            position="top-center"
            autoClose={2000}
          />
    </>
   
  );
};

export default AddReward;