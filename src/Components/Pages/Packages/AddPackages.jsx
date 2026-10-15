
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaTrash,
  FaSave,
  FaTimes,
  FaChevronDown,
  FaQuestionCircle,
  FaCreditCard,
  FaCheck,
} from "react-icons/fa";

import BASE_URL from "../../../Base";
import "./AddPackages.css";

const createEmptyForm = () => ({
  name: "",
  description: "",
  category: "",
  original_price: "",
  selling_price: "",
  purchase_type: "prepaid_package",
  button_action: "purchase_package",
  billing_mode: "one_time",
  billing_period: "",
  billing_interval: "",
  billing_cycle_count: "",
  validity_days: "",
  tags: [],
  tagInput: "",
  sequence: 1,
  is_active: false,
  available_to_all_users: true,
  can_be_purchased: true,
  configuration: [],
});

const AddPackage = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [benefits, setBenefits] = useState([]);

  const [categoryLoading, setCategoryLoading] = useState(false);
  const [benefitLoading, setBenefitLoading] = useState(false);
  const [showBenefitDropdown, setShowBenefitDropdown] = useState(false);
  const [showBillingModeDropdown, setShowBillingModeDropdown] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState(createEmptyForm);

  // =====================================================
  // FIELD-LEVEL VALIDATION HELPERS
  // =====================================================

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;

      const updated = { ...prev };
      delete updated[field];
      return updated;
    });
  };

  const clearConfigurationErrors = (index) => {
    setFieldErrors((prev) => {
      const updated = { ...prev };

      [
        `benefit_${index}_label`,
        `benefit_${index}_count`,
        `benefit_${index}_eligible_after_days`,
      ].forEach((key) => {
        delete updated[key];
      });

      delete updated.configuration;
      return updated;
    });
  };

  const renderFieldError = (field) =>
    fieldErrors[field] ? (
      <small
        role="alert"
        style={{
          display: "block",
          width: "100%",
          marginTop: "5px",
          color: "#dc3545",
          fontSize: "12px",
          lineHeight: "1.4",
          fontWeight: 500,
        }}
      >
        {fieldErrors[field]}
      </small>
    ) : null;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    clearFieldError(field);
    setError("");
  };

  // =====================================================
  // COMMON API HEADERS
  // =====================================================

  const getHeaders = () => {
    const token = sessionStorage.getItem("superadmin_token");

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "ngrok-skip-browser-warning": "true",
    };
  };

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);

      const response = await fetch(
        `${BASE_URL}/packages/admin/category/`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.detail ||
            "Failed to load package categories."
        );
      }

      const categoryData =
        result?.data?.results ??
        result?.data ??
        result?.results ??
        [];

      const normalized = Array.isArray(categoryData)
        ? categoryData
            .map((item) => ({
              id: item?.id || item?.category_id || item?.value,
              name:
                item?.name ||
                item?.category_name ||
                item?.label ||
                "",
            }))
            .filter((item) => item.id && item.name)
        : [];

      setCategories(normalized);
    } catch (err) {
      console.error("Category Error:", err);
      setCategories([]);
      setError(err.message || "Failed to load categories.");
    } finally {
      setCategoryLoading(false);
    }
  };

  // =====================================================
  // FETCH BENEFITS
  // =====================================================

  const fetchBenefits = async () => {
    try {
      setBenefitLoading(true);

      const response = await fetch(
        `${BASE_URL}/packages/admin/benefit/`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const result = await response.json();

      console.log("BENEFIT API RESPONSE:", result);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.detail ||
            "Failed to load benefits."
        );
      }

      const benefitData =
        result?.data?.results ??
        result?.data ??
        result?.results ??
        [];

      const normalized = Array.isArray(benefitData)
        ? benefitData
            .map((item) => ({
              id:
                item?.id ||
                item?.benefit_id ||
                item?.value,

              name:
                item?.name ||
                item?.benefit_name ||
                item?.title ||
                item?.label ||
                "",

              label:
                item?.label ||
                item?.benefit_label ||
                item?.name ||
                item?.benefit_name ||
                "",

              fulfillment_mode:
                item?.fulfillment_mode ||
                item?.type ||
                item?.benefit_type ||
                "flag",

              unit: item?.unit || "none",
              description: item?.description || "",

              tags: Array.isArray(item?.tags)
                ? item.tags
                : [],

              match_rules: item?.match_rules || {},

              default_extra_details:
                item?.default_extra_details || {},
            }))
            .filter((item) => item.id && item.name)
        : [];

      setBenefits(normalized);
      console.log("NORMALIZED BENEFITS:", normalized);
    } catch (err) {
      console.error("Benefit Error:", err);
      setBenefits([]);
      setError(err.message || "Failed to load benefits.");
    } finally {
      setBenefitLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBenefits();
  }, []);

  // =====================================================
  // INPUT HANDLERS
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateField(name, value);
  };

  const handlePurchaseTypeChange = (value) => {
    const isOpenPlan = value === "open_plan";

    setForm((prev) => ({
      ...prev,
      purchase_type: value,
      button_action: isOpenPlan
        ? "book_consultation"
        : "purchase_package",
      can_be_purchased: !isOpenPlan,
      billing_mode: isOpenPlan ? "one_time" : prev.billing_mode,
      billing_period: isOpenPlan ? "" : prev.billing_period,
      billing_interval: isOpenPlan ? "" : prev.billing_interval,
      billing_cycle_count: isOpenPlan
        ? ""
        : prev.billing_cycle_count,
    }));

    setFieldErrors((prev) => {
      const updated = { ...prev };

      if (isOpenPlan) {
        delete updated.billing_period;
        delete updated.billing_interval;
        delete updated.billing_cycle_count;
      }

      return updated;
    });
  };

  const handleBillingModeChange = (value) => {
    setForm((prev) => ({
      ...prev,
      billing_mode: value,
      billing_period: value === "one_time" ? "" : prev.billing_period,
      billing_interval:
        value === "one_time" ? "" : prev.billing_interval,
      billing_cycle_count:
        value === "one_time" ? "" : prev.billing_cycle_count,
    }));

    if (value === "one_time") {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated.billing_period;
        delete updated.billing_interval;
        delete updated.billing_cycle_count;
        return updated;
      });
    }

    setError("");
  };

  // =====================================================
  // PACKAGE TAGS
  // =====================================================

  const addPackageTag = () => {
    const tag = form.tagInput.trim();

    if (!tag) return;

    if (
      form.tags.some(
        (existing) => existing.toLowerCase() === tag.toLowerCase()
      )
    ) {
      setForm((prev) => ({ ...prev, tagInput: "" }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
      tagInput: "",
    }));
  };

  const removePackageTag = (index) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handlePackageTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPackageTag();
    }
  };

  // =====================================================
  // ADD BENEFIT CONFIGURATION
  // =====================================================

  const addConfiguration = (benefit) => {
    if (!benefit?.id) return;

    setForm((prev) => {
      const alreadySelected = prev.configuration.some(
        (item) => item.benefit_id === benefit.id
      );

      if (alreadySelected) return prev;

      const defaultDetails = benefit.default_extra_details || {};
      const type = benefit.fulfillment_mode || "flag";

      return {
        ...prev,
        configuration: [
          ...prev.configuration,
          {
            benefit_id: benefit.id,
            name: benefit.id,
            label: benefit.label || benefit.name || "",
            type,
            count:
              type === "consumable" || type === "chat_pool"
                ? 1
                : "",
            eligible_after_days:
              defaultDetails.eligible_after_days ?? "",
            requires_completed_capability:
              defaultDetails.requires_completed_capability ?? "",
            match_rules: benefit.match_rules || {},
            Service_name: benefit.name || "",
          },
        ],
      };
    });

    clearFieldError("configuration");
    setError("");
  };

  // =====================================================
  // REMOVE BENEFIT
  // =====================================================

  const removeConfiguration = (index) => {
    setForm((prev) => ({
      ...prev,
      configuration: prev.configuration.filter(
        (_, i) => i !== index
      ),
    }));

    setFieldErrors((prev) => {
      const updated = {};

      Object.entries(prev).forEach(([key, value]) => {
        if (!key.startsWith("benefit_")) {
          if (key !== "configuration") updated[key] = value;
          return;
        }

        const match = key.match(/^benefit_(\d+)_(.+)$/);

        if (!match) {
          updated[key] = value;
          return;
        }

        const currentIndex = Number(match[1]);

        if (currentIndex < index) {
          updated[key] = value;
        } else if (currentIndex > index) {
          updated[`benefit_${currentIndex - 1}_${match[2]}`] =
            value;
        }
      });

      return updated;
    });

    setError("");
  };

  // =====================================================
  // UPDATE CONFIGURATION FIELDS
  // =====================================================

  const updateConfiguration = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      configuration: prev.configuration.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));

    clearFieldError(`benefit_${index}_${field}`);
    clearFieldError("configuration");
    setError("");
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = "Package name is required.";
    }

    if (!form.category) {
      errors.category = "Please select a category.";
    }

    if (
      form.original_price === "" ||
      form.original_price === null
    ) {
      errors.original_price = "Original price is required.";
    } else if (
      !Number.isFinite(Number(form.original_price)) ||
      Number(form.original_price) < 0
    ) {
      errors.original_price =
        "Please enter a valid, non-negative original price.";
    }

    if (
      form.selling_price === "" ||
      form.selling_price === null
    ) {
      errors.selling_price = "Selling price is required.";
    } else if (
      !Number.isFinite(Number(form.selling_price)) ||
      Number(form.selling_price) < 0
    ) {
      errors.selling_price =
        "Please enter a valid, non-negative selling price.";
    }

    if (
      form.purchase_type === "prepaid_package" &&
      form.billing_mode === "autopay"
    ) {
      if (!form.billing_period) {
        errors.billing_period =
          "Billing period is required for autopay.";
      }

      if (
        form.billing_interval === "" ||
        !Number.isInteger(Number(form.billing_interval)) ||
        Number(form.billing_interval) < 1
      ) {
        errors.billing_interval =
          "Billing interval must be a whole number of at least 1.";
      }

      if (
        form.billing_cycle_count === "" ||
        !Number.isInteger(Number(form.billing_cycle_count)) ||
        Number(form.billing_cycle_count) < 1
      ) {
        errors.billing_cycle_count =
          "Billing cycle count must be a whole number of at least 1.";
      }
    }

    if (
      form.validity_days !== "" &&
      (!Number.isInteger(Number(form.validity_days)) ||
        Number(form.validity_days) < 1)
    ) {
      errors.validity_days =
        "Validity days must be a whole number of at least 1.";
    }

    if (
      form.sequence === "" ||
      !Number.isInteger(Number(form.sequence)) ||
      Number(form.sequence) < 1
    ) {
      errors.sequence =
        "Sequence must be a whole number of at least 1.";
    }

    if (form.configuration.length === 0) {
      errors.configuration = "Please select at least one benefit.";
    }

    form.configuration.forEach((config, index) => {
      if (!config.benefit_id || !String(config.name).trim()) {
        errors.configuration =
          "Please select at least one valid benefit.";
      }

      if (!config.label?.trim()) {
        errors[`benefit_${index}_label`] =
          "Benefit label is required.";
      }

      if (
        config.type === "consumable" ||
        config.type === "chat_pool"
      ) {
        if (
          config.count === "" ||
          !Number.isInteger(Number(config.count)) ||
          Number(config.count) < 1
        ) {
          errors[`benefit_${index}_count`] =
            "Count must be a whole number of at least 1.";
        }
      }

      if (
        config.eligible_after_days !== "" &&
        config.eligible_after_days !== null &&
        config.eligible_after_days !== undefined &&
        (!Number.isInteger(Number(config.eligible_after_days)) ||
          Number(config.eligible_after_days) < 0)
      ) {
        errors[`benefit_${index}_eligible_after_days`] =
          "Eligible after days must be zero or greater.";
      }
    });

    return errors;
  };

  // =====================================================
  // SUBMIT PACKAGE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationErrors = validateForm();
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstField = Object.keys(validationErrors)[0];

      const element = document.querySelector(
        `[name="${firstField}"]`
      );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      return;
    }

    try {
      setLoading(true);

      const configuration = form.configuration.map((config) => {
        const cleanConfig = {
          name: String(config.benefit_id).trim(),
          label: String(config.label).trim(),
        };

        if (
          config.type === "consumable" ||
          config.type === "chat_pool"
        ) {
          cleanConfig.count = Number(config.count);
        }

        if (
          config.eligible_after_days !== "" &&
          config.eligible_after_days !== null &&
          config.eligible_after_days !== undefined
        ) {
          cleanConfig.eligible_after_days = Number(
            config.eligible_after_days
          );
        }

        if (
          config.requires_completed_capability &&
          String(config.requires_completed_capability).trim()
        ) {
          cleanConfig.requires_completed_capability = String(
            config.requires_completed_capability
          ).trim();
        }

        return cleanConfig;
      });

      const isAutopay =
        form.purchase_type === "prepaid_package" &&
        form.billing_mode === "autopay";

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        purchase_type: form.purchase_type,
        button_action: form.button_action,
        billing_mode: isAutopay ? "autopay" : "one_time",
        billing_period: isAutopay ? form.billing_period : null,
        billing_interval: isAutopay
          ? Number(form.billing_interval)
          : null,
        billing_cycle_count: isAutopay
          ? Number(form.billing_cycle_count)
          : null,
        original_price: Number(form.original_price),
        selling_price: Number(form.selling_price),
        validity_days:
          form.validity_days === ""
            ? null
            : Number(form.validity_days),
        sequence: Number(form.sequence),
        tags: form.tags,
        is_active: form.is_active,
        can_be_purchased:
          form.purchase_type === "open_plan"
            ? false
            : form.can_be_purchased,
        available_to_all_users: form.available_to_all_users,
        configuration,
      };

      console.log(
        "CREATE PACKAGE PAYLOAD:",
        JSON.stringify(payload, null, 2)
      );

      const response = await fetch(`${BASE_URL}/packages/admin/`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result?.message ||
          result?.detail ||
          (typeof result === "string" ? result : "") ||
          (result && typeof result === "object"
            ? JSON.stringify(result)
            : "") ||
          "Failed to create package.";

        throw new Error(errorMessage);
      }

      setSuccess("Package created successfully.");

      setTimeout(() => {
        navigate("/packages");
      }, 800);
    } catch (err) {
      console.error("Create Package Error:", err);
      setError(
        err?.message ||
          "Something went wrong while creating package."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="package-page add-package-page">
      <div className="package-page-header">
        <div className="package-heading">
          <button
            type="button"
            className="package-back-button"
            onClick={() => navigate("/packages")}
          >
            <FaArrowLeft />
          </button>

          <div>
            <h1>Add Package</h1>
            <p>Create and configure a new package.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="package-error">
          <strong>Error</strong>
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <FaTimes />
          </button>
        </div>
      )}

      {success && (
        <div className="package-success">
          <strong>{success}</strong>
        </div>
      )}

      <form
        className="add-package-form"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* BASIC DETAILS */}

        <section className="add-package-section">
          <div className="add-section-header">
            <h2>Basic Details</h2>
            <p>Enter the basic package information.</p>
          </div>

          <div className="add-form-grid basic-details-grid">
            <div className="add-form-group full-width-field">
              <label>
                Package Name <span>*</span>
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter package name"
              />

              {renderFieldError("name")}
            </div>

            <div className="add-form-group full-width-field">
              <label>Description</label>

              <textarea
                rows="4"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter package description"
              />
            </div>

            <div className="add-form-group">
              <label>
                Category <span>*</span>
              </label>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                disabled={categoryLoading}
              >
                <option value="">
                  {categoryLoading
                    ? "Loading..."
                    : "Select Category"}
                </option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {renderFieldError("category")}
            </div>

            <div className="add-form-group">
              <label>
                Sequence <span>*</span>
              </label>

              <input
                type="number"
                min="1"
                step="1"
                name="sequence"
                value={form.sequence}
                onChange={handleChange}
              />

              {renderFieldError("sequence")}
            </div>
          </div>
        </section>

        {/* PRICING */}

        <section className="add-package-section">
          <div className="add-section-header">
            <h2>Pricing</h2>
            <p>Configure original and selling price.</p>
          </div>

          <div className="add-form-grid">
            <div className="add-form-group">
              <label>
                Original Price <span>*</span>
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="original_price"
                value={form.original_price}
                onChange={handleChange}
                placeholder="0.00"
              />

              {renderFieldError("original_price")}
            </div>

            <div className="add-form-group">
              <label>
                Selling Price <span>*</span>
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="selling_price"
                value={form.selling_price}
                onChange={handleChange}
                placeholder="0.00"
              />

              {renderFieldError("selling_price")}
            </div>
          </div>
        </section>

        {/* BILLING */}

        <section className="add-package-section billing-section">
          <div className="add-section-header">
            <h2>Billing</h2>
            <p>Configure how and when the customer will be charged.</p>
          </div>

          <div className="add-form-grid">
            <div className="add-form-group full-width">
              <label>
                Billing Mode <span>*</span>
              </label>

              <div className="billing-select-wrapper">
                <button
                  type="button"
                  className="billing-select-trigger"
                  onClick={() =>
                    setShowBillingModeDropdown((prev) => !prev)
                  }
                  disabled={form.purchase_type === "open_plan"}
                >
                  <span>
                    {form.billing_mode === "one_time"
                      ? "One Time"
                      : "Autopay"}
                  </span>

                  <FaChevronDown />
                </button>

                {showBillingModeDropdown && (
                  <div className="billing-select-dropdown">
                    <div className="billing-info-box">
                      <FaQuestionCircle />
                      <div>
                        <strong>Choose how the customer pays</strong>
                        <span>
                          One Time means one payment. Autopay means
                          recurring automatic payments.
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`billing-option ${
                        form.billing_mode === "one_time"
                          ? "billing-option-selected"
                          : ""
                      }`}
                      onClick={() => {
                        handleBillingModeChange("one_time");
                        setShowBillingModeDropdown(false);
                      }}
                    >
                      <div className="billing-option-icon">
                        <FaCreditCard />
                      </div>

                      <div className="billing-option-content">
                        <strong>One Time</strong>
                        <span>Customer pays once.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`billing-option ${
                        form.billing_mode === "autopay"
                          ? "billing-option-selected"
                          : ""
                      }`}
                      onClick={() => {
                        handleBillingModeChange("autopay");
                        setShowBillingModeDropdown(false);
                      }}
                    >
                      <div className="billing-option-icon">
                        <FaCreditCard />
                      </div>

                      <div className="billing-option-content">
                        <strong>Autopay</strong>
                        <span>
                          Customer is charged automatically.
                        </span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {form.billing_mode === "autopay" &&
              form.purchase_type === "prepaid_package" && (
                <>
                  <div className="add-form-group">
                    <label>
                      Billing Period <span>*</span>
                    </label>

                    <select
                      name="billing_period"
                      value={form.billing_period}
                      onChange={handleChange}
                    >
                      <option value="">Select Period</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>

                    {renderFieldError("billing_period")}
                  </div>

                  <div className="add-form-group">
                    <label>
                      Billing Interval <span>*</span>
                    </label>

                    <input
                      type="number"
                      name="billing_interval"
                      min="1"
                      step="1"
                      value={form.billing_interval}
                      onChange={handleChange}
                      placeholder="e.g. 1"
                    />

                    {renderFieldError("billing_interval")}
                  </div>

                  <div className="add-form-group">
                    <label>
                      Billing Cycle Count <span>*</span>
                    </label>

                    <input
                      type="number"
                      name="billing_cycle_count"
                      min="1"
                      step="1"
                      value={form.billing_cycle_count}
                      onChange={handleChange}
                      placeholder="e.g. 12"
                    />

                    {renderFieldError("billing_cycle_count")}
                  </div>
                </>
              )}

            <div className="add-form-group">
              <label>Validity Days</label>

              <input
                type="number"
                min="1"
                step="1"
                name="validity_days"
                value={form.validity_days}
                onChange={handleChange}
                placeholder="e.g. 30 or 365"
              />

              {renderFieldError("validity_days")}

              <div className="benefit-field-help">
                <small>
                  For autopay, this is the length of one paid
                  period. For one-time packages, enter the
                  package validity if applicable.
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* PACKAGE TAGS */}

        <section className="add-package-section">
          <div className="add-section-header">
            <h2>Tags</h2>
            <p>Add tags for this package.</p>
          </div>

          <div className="tag-input-wrapper">
            <div className="package-tags">
              {form.tags.map((tag, index) => (
                <span
                  className="package-tag"
                  key={`${tag}-${index}`}
                >
                  {tag}

                  <button
                    type="button"
                    onClick={() => removePackageTag(index)}
                  >
                    <FaTimes />
                  </button>
                </span>
              ))}
            </div>

            <input
              type="text"
              value={form.tagInput}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  tagInput: e.target.value,
                }))
              }
              onKeyDown={handlePackageTagKeyDown}
              placeholder="Type tag and press Enter"
            />

            <button type="button" onClick={addPackageTag}>
              Add Tag
            </button>
          </div>
        </section>

        {/* PACKAGE CONFIGURATION */}

        <section className="add-package-section">
          <div className="add-section-header configuration-header">
            <div>
              <h2>Package Configuration</h2>
              <p>
                Select benefits and customize their customer-facing
                labels for this package.
              </p>
            </div>
          </div>

          <div className="add-form-group full-width-field">
            <label>
              Select Benefits <span>*</span>
            </label>

            <div className="benefit-multiselect-wrapper">
              <button
                type="button"
                className="benefit-multiselect-trigger"
                onClick={() =>
                  setShowBenefitDropdown((prev) => !prev)
                }
              >
                <div className="selected-benefit-values">
                  {form.configuration.length === 0 ? (
                    <span className="benefit-placeholder">
                      {benefitLoading
                        ? "Loading benefits..."
                        : "Select benefits"}
                    </span>
                  ) : (
                    form.configuration.map((config) => (
                      <span
                        key={config.benefit_id}
                        className="selected-benefit-chip"
                      >
                        {config.Service_name}

                        <span
                          className="selected-benefit-chip-remove"
                          onClick={(e) => {
                            e.stopPropagation();

                            const index =
                              form.configuration.findIndex(
                                (item) =>
                                  item.benefit_id === config.benefit_id
                              );

                            if (index !== -1) {
                              removeConfiguration(index);
                            }
                          }}
                        >
                          <FaTimes />
                        </span>
                      </span>
                    ))
                  )}
                </div>

                <FaChevronDown />
              </button>

              {showBenefitDropdown && (
                <div className="benefit-multiselect-dropdown">
                  {benefitLoading ? (
                    <div className="benefit-dropdown-loading">
                      Loading benefits...
                    </div>
                  ) : benefits.length === 0 ? (
                    <div className="benefit-dropdown-empty">
                      No benefits available.
                    </div>
                  ) : (
                    benefits.map((benefit) => {
                      const isSelected =
                        form.configuration.some(
                          (item) => item.benefit_id === benefit.id
                        );

                      return (
                        <button
                          type="button"
                          key={benefit.id}
                          className={`benefit-dropdown-option ${
                            isSelected ? "benefit-option-selected" : ""
                          }`}
                          onClick={() => {
                            if (isSelected) {
                              const index =
                                form.configuration.findIndex(
                                  (item) =>
                                    item.benefit_id === benefit.id
                                );

                              if (index !== -1) {
                                removeConfiguration(index);
                              }
                            } else {
                              addConfiguration(benefit);
                            }
                          }}
                        >
                          <span
                            className={`benefit-checkbox ${
                              isSelected ? "checked" : ""
                            }`}
                          >
                            {isSelected && <FaCheck />}
                          </span>

                          <span className="benefit-option-text">
                            <strong>{benefit.name}</strong>

                            {benefit.label &&
                              benefit.label !== benefit.name && (
                                <small>{benefit.label}</small>
                              )}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {renderFieldError("configuration")}

            <div className="benefit-selection-help">
              <small>
                Select one or more benefits. Each benefit can have
                its own custom label in this package.
              </small>
            </div>
          </div>

          {form.configuration.length === 0 ? (
            <div className="configuration-empty">
              <h3>No Benefits Selected</h3>
              <p>Select benefits from the dropdown above.</p>
            </div>
          ) : (
            <div className="configuration-list">
              {form.configuration.map((config, index) => (
                <div
                  className="configuration-card"
                  key={config.benefit_id}
                >
                  <div className="configuration-card-header">
                    <div>
                      <span>Benefit {index + 1}</span>
                      <h3>{config.Service_name}</h3>
                    </div>

                    <button
                      type="button"
                      className="remove-benefit-button"
                      onClick={() => removeConfiguration(index)}
                    >
                      <FaTrash />
                    </button>
                  </div>

                  <div className="add-form-grid">
                    <div className="add-form-group">
                      <label>Benefit Name</label>

                      <input
                        type="text"
                        value={config.Service_name}
                        readOnly
                      />
                    </div>

                    <div className="add-form-group">
                      <label>
                        Benefit Label <span>*</span>
                      </label>

                      <input
                        type="text"
                        name={`benefit_${index}_label`}
                        value={config.label || ""}
                        onChange={(e) =>
                          updateConfiguration(
                            index,
                            "label",
                            e.target.value
                          )
                        }
                        placeholder="Enter customer-facing label"
                      />

                      {renderFieldError(`benefit_${index}_label`)}

                      <div className="benefit-field-help">
                        <small>
                          This exact text will be sent as the
                          configuration label in the API payload.
                        </small>
                      </div>
                    </div>

                    <div className="add-form-group">
                      <label>Benefit Type</label>

                      <input
                        type="text"
                        value={
                          config.type === "consumable"
                            ? "Consumable"
                            : config.type === "chat_pool"
                              ? "Chat Pool"
                              : config.type === "rule"
                                ? "Rule"
                                : "Flag"
                        }
                        readOnly
                      />
                    </div>

                    {(config.type === "consumable" ||
                      config.type === "chat_pool") && (
                      <div className="add-form-group">
                        <label>
                          Usage Count <span>*</span>
                        </label>

                        <input
                          type="number"
                          name={`benefit_${index}_count`}
                          min="1"
                          step="1"
                          value={config.count}
                          onChange={(e) =>
                            updateConfiguration(
                              index,
                              "count",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 5"
                        />

                        {renderFieldError(`benefit_${index}_count`)}

                        <div className="benefit-field-help">
                          <small>
                            Number of times the customer can use
                            this benefit.
                          </small>
                        </div>
                      </div>
                    )}
                  </div>

                  {(config.type === "consumable" ||
                    config.type === "chat_pool") && (
                    <div className="add-form-grid">
                      <div className="add-form-group">
                        <label>Eligible After Days</label>

                        <input
                          type="number"
                          name={`benefit_${index}_eligible_after_days`}
                          min="0"
                          step="1"
                          value={config.eligible_after_days}
                          onChange={(e) =>
                            updateConfiguration(
                              index,
                              "eligible_after_days",
                              e.target.value
                            )
                          }
                          placeholder="e.g. 15"
                        />

                        {renderFieldError(
                          `benefit_${index}_eligible_after_days`
                        )}

                        <div className="benefit-field-help">
                          <small>
                            Number of days before this benefit
                            becomes available.
                          </small>
                        </div>
                      </div>

                      <div className="add-form-group">
                        <label>
                          Requires Completed Benefit ID
                        </label>

                        <select
                          value={
                            config.requires_completed_capability || ""
                          }
                          onChange={(e) =>
                            updateConfiguration(
                              index,
                              "requires_completed_capability",
                              e.target.value
                            )
                          }
                        >
                          <option value="">No prerequisite</option>

                          {benefits.map((benefit) => (
                            <option
                              key={benefit.id}
                              value={benefit.id}
                            >
                              {benefit.name}
                            </option>
                          ))}
                        </select>

                        <div className="benefit-field-help">
                          <small>
                            Select the capability UUID that must
                            be completed before this benefit
                            becomes available.
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {config.match_rules &&
                    Object.keys(config.match_rules).length > 0 && (
                      <div className="match-rules-box">
                        <div className="match-rules-header">
                          <div>
                            <h4>Match Rules</h4>
                            <p>
                              Read-only rules from the selected
                              benefit. They are not sent when
                              creating this package.
                            </p>
                          </div>
                        </div>

                        <div className="add-form-grid">
                          {Object.entries(config.match_rules).map(
                            ([ruleKey, ruleValue]) => (
                              <div
                                className="add-form-group"
                                key={ruleKey}
                              >
                                <label>
                                  {ruleKey
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (char) =>
                                      char.toUpperCase()
                                    )}
                                </label>

                                <input
                                  type="text"
                                  value={
                                    typeof ruleValue === "boolean"
                                      ? ruleValue
                                        ? "Yes"
                                        : "No"
                                      : typeof ruleValue === "object"
                                        ? JSON.stringify(ruleValue)
                                        : String(ruleValue ?? "")
                                  }
                                  readOnly
                                />
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* STATUS */}

        <section className="add-package-section">
          <div className="add-section-header">
            <h2>Status & Availability</h2>
          </div>

          <div className="status-checkbox-row">
            <label>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
              />
              Active
            </label>
          </div>
        </section>

        {/* FOOTER */}

        <div className="add-package-footer">
          <button
            type="button"
            className="package-cancel-button"
            onClick={() => navigate("/packages")}
            disabled={loading}
          >
            <FaTimes />
            Cancel
          </button>

          <button
            type="submit"
            className="package-save-button"
            disabled={loading}
          >
            <FaSave />
            {loading ? "Creating..." : "Create Package"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPackage;
