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

// =====================================================
// EMPTY CONFIGURATION
// =====================================================

const createEmptyConfiguration = () => ({
  benefit_id: "",
  name: "",
  label: "",
  type: "flag",

  count: "",

  tags: [],
  tagInput: "",

  // Read-only values coming from Benefit API
  match_rules: {},

  // Editable package-level values
  eligible_after_days: "",
  requires_completed_capability: "",
});

// =====================================================
// COMPONENT
// =====================================================

const AddPackage = () => {
  const navigate = useNavigate();

  // ===================================================
  // CATEGORIES
  // ===================================================

  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);

  // ===================================================
  // BENEFITS
  // ===================================================

  const [benefits, setBenefits] = useState([]);
  const [benefitLoading, setBenefitLoading] = useState(false);
  const [showBenefitDropdown, setShowBenefitDropdown] =
    useState(false);

  // ===================================================
  // GENERAL STATES
  // ===================================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===================================================
  // BILLING DROPDOWN
  // ===================================================

  const [
    showBillingModeDropdown,
    setShowBillingModeDropdown,
  ] = useState(false);

  // ===================================================
  // FORM
  // ===================================================

  const [form, setForm] = useState({
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

    sequence: 0,

    is_active: false,
    available_to_all_users: true,
    can_be_purchased: true,

    configuration: [],
  });

  // =====================================================
  // FETCH CATEGORIES
  // =====================================================

  const fetchCategories = async () => {
    try {
      setCategoryLoading(true);

      const token =
        sessionStorage.getItem("superadmin_token");

      const response = await fetch(
        `${BASE_URL}/packages/admin/category/`,
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),

            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to load package categories."
        );
      }

      const categoryData =
        result?.data?.results ||
        result?.data ||
        result?.results ||
        [];

      const normalizedCategories =
        Array.isArray(categoryData)
          ? categoryData
              .map((item) => ({
                id:
                  item?.id ||
                  item?.category_id ||
                  item?.value,

                name:
                  item?.name ||
                  item?.category_name ||
                  item?.label ||
                  "",
              }))
              .filter(
                (item) => item.id && item.name
              )
          : [];

      setCategories(normalizedCategories);
    } catch (err) {
      console.error(
        "Category Error:",
        err
      );

      setCategories([]);
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

      const token =
        sessionStorage.getItem("superadmin_token");

      const response = await fetch(
        `${BASE_URL}/packages/admin/benefit/`,
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",

            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),

            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      const result = await response.json();

      console.log(
        "BENEFIT API RESPONSE:",
        result
      );

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to load benefits."
        );
      }

      const benefitData =
        result?.data?.results ||
        result?.data ||
        result?.results ||
        [];

      const normalizedBenefits =
        Array.isArray(benefitData)
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

                // =====================================
                // BENEFIT LABEL
                // =====================================

                label:
                  item?.label ||
                  item?.benefit_label ||
                  item?.name ||
                  item?.benefit_name ||
                  "",

                // =====================================
                // BENEFIT TYPE
                // =====================================

                type:
                  item?.fulfillment_mode ||
                  item?.type ||
                  item?.benefit_type ||
                  "flag",

                fulfillment_mode:
                  item?.fulfillment_mode ||
                  "flag",

                // =====================================
                // OTHER API VALUES
                // =====================================

                unit:
                  item?.unit || "none",

                description:
                  item?.description || "",

                tags:
                  Array.isArray(item?.tags)
                    ? item.tags
                    : [],

                // =====================================
                // MATCH RULES
                // READ ONLY
                // =====================================

                match_rules:
                  item?.match_rules || {},

                // =====================================
                // DEFAULT EXTRA DETAILS
                // =====================================

                default_extra_details:
                  item?.default_extra_details || {},
              }))
              .filter(
                (item) =>
                  item.id &&
                  item.name
              )
          : [];

      setBenefits(normalizedBenefits);

      console.log(
        "NORMALIZED BENEFITS:",
        normalizedBenefits
      );
    } catch (err) {
      console.error(
        "Benefit Error:",
        err
      );

      setBenefits([]);

      setError(
        err?.message ||
          "Failed to load benefits."
      );
    } finally {
      setBenefitLoading(false);
    }
  };

  // =====================================================
  // INITIAL API CALLS
  // =====================================================

  useEffect(() => {
    fetchCategories();
    fetchBenefits();
  }, []);

  // =====================================================
  // NORMAL INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // PURCHASE TYPE
  // =====================================================

  const handlePurchaseTypeChange = (
    value
  ) => {
    const isOpenPlan =
      value === "open_plan";

    setForm((prev) => ({
      ...prev,

      purchase_type: value,

      button_action: isOpenPlan
        ? "book_consultation"
        : "purchase_package",

      can_be_purchased:
        !isOpenPlan,
    }));
  };

  // =====================================================
  // BILLING MODE
  // =====================================================

  const handleBillingModeChange = (
    value
  ) => {
    setForm((prev) => ({
      ...prev,

      billing_mode: value,

      ...(value === "one_time"
        ? {
            billing_period: "",
            billing_interval: "",
            billing_cycle_count: "",
          }
        : {}),
    }));
  };

  // =====================================================
  // PACKAGE TAGS
  // =====================================================

  const addPackageTag = () => {
    const tag =
      form.tagInput.trim();

    if (!tag) return;

    const alreadyExists =
      form.tags.some(
        (existingTag) =>
          existingTag.toLowerCase() ===
          tag.toLowerCase()
      );

    if (alreadyExists) {
      return;
    }

    setForm((prev) => ({
      ...prev,

      tags: [
        ...prev.tags,
        tag,
      ],

      tagInput: "",
    }));
  };

  const removePackageTag = (
    index
  ) => {
    setForm((prev) => ({
      ...prev,

      tags: prev.tags.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handlePackageTagKeyDown = (
    e
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      addPackageTag();
    }
  };

  // =====================================================
  // ADD BENEFIT CONFIGURATION
  // =====================================================

  const addConfiguration = (
    benefit
  ) => {
    if (!benefit?.id) return;

    setForm((prev) => {
      const alreadySelected =
        prev.configuration.some(
          (item) =>
            item.benefit_id ===
            benefit.id
        );

      if (alreadySelected) {
        return prev;
      }

      const benefitType =
        benefit.fulfillment_mode ||
        benefit.type ||
        benefit.benefit_type ||
        "flag";

      const defaultDetails =
        benefit.default_extra_details ||
        {};

      return {
        ...prev,

        configuration: [
          ...prev.configuration,

          {
            // ==================================
            // INTERNAL ID
            // ==================================

            benefit_id:
              benefit.id,

            // ==================================
            // BACKEND VALUES
            // ==================================

            // IMPORTANT:
            // Backend expects benefit UUID
            // in "name".
            name:
              benefit.id,

            label:
              benefit.label ||
              benefit.name ||
              "",

            type:
              benefitType,

            // ==================================
            // EDITABLE COUNT
            // ==================================

            count:
              benefitType ===
                "consumable" ||
              benefitType ===
                "chat_pool"
                ? 1
                : "",

            // ==================================
            // EDITABLE ELIGIBILITY
            // ==================================

            eligible_after_days:
              defaultDetails
                ?.eligible_after_days ??
              "",

            requires_completed_capability:
              defaultDetails
                ?.requires_completed_capability ??
              "",

            // ==================================
            // READ-ONLY MATCH RULES
            // ==================================

            // These come directly from
            // the selected Benefit API.
            // Admin cannot edit them here.
            match_rules:
              benefit.match_rules ||
              {},
          },
        ],
      };
    });
  };

  // =====================================================
  // REMOVE BENEFIT
  // =====================================================

  const removeConfiguration = (
    index
  ) => {
    setForm((prev) => ({
      ...prev,

      configuration:
        prev.configuration.filter(
          (_, i) =>
            i !== index
        ),
    }));
  };

  // =====================================================
  // UPDATE BENEFIT
  // =====================================================

  const updateConfiguration = (
    index,
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,

      configuration:
        prev.configuration.map(
          (item, i) =>
            i === index
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item
        ),
    }));
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Package name is required.";
    }

    if (!form.category) {
      return "Please select a category.";
    }

    if (
      form.original_price === "" ||
      form.original_price === null
    ) {
      return "Original price is required.";
    }

    if (
      form.selling_price === "" ||
      form.selling_price === null
    ) {
      return "Selling price is required.";
    }

    if (
      Number(form.original_price) < 0 ||
      Number(form.selling_price) < 0
    ) {
      return "Price cannot be negative.";
    }

    // =========================================
    // AUTOPAY
    // =========================================

    if (
      form.billing_mode ===
      "autopay"
    ) {
      if (!form.billing_period) {
        return "Billing period is required for autopay.";
      }

      if (!form.billing_interval) {
        return "Billing interval is required for autopay.";
      }

      if (
        Number(form.billing_interval) < 1
      ) {
        return "Billing interval must be at least 1.";
      }

      if (
        !form.billing_cycle_count
      ) {
        return "Billing cycle count is required for autopay.";
      }

      if (
        Number(form.billing_cycle_count) < 1
      ) {
        return "Billing cycle count must be at least 1.";
      }
    }

    // =========================================
    // BENEFITS
    // =========================================

    if (
      form.configuration.length === 0
    ) {
      return "Please select at least one benefit.";
    }

    for (
      let i = 0;
      i < form.configuration.length;
      i++
    ) {
      const config =
        form.configuration[i];

      if (
        !config.name ||
        !String(config.name).trim()
      ) {
        return `Benefit ${
          i + 1
        }: name is required.`;
      }

      if (
        !config.label ||
        !String(config.label).trim()
      ) {
        return `Benefit ${
          i + 1
        }: customer label is required.`;
      }

      // =====================================
      // CONSUMABLE / CHAT POOL COUNT
      // =====================================

      if (
        config.type ===
          "consumable" ||
        config.type ===
          "chat_pool"
      ) {
        if (
          config.count === "" ||
          config.count === null ||
          config.count === undefined ||
          Number(config.count) < 1
        ) {
          return `Benefit ${
            i + 1
          }: count must be at least 1.`;
        }
      }

      // =====================================
      // ELIGIBLE AFTER DAYS
      // =====================================

      if (
        config.eligible_after_days !==
          "" &&
        config.eligible_after_days !==
          null &&
        config.eligible_after_days !==
          undefined
      ) {
        if (
          Number(
            config.eligible_after_days
          ) < 0
        ) {
          return `Benefit ${
            i + 1
          }: eligible after days cannot be negative.`;
        }
      }
    }

    return "";
  };

 

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setLoading(true);

      const token =
        sessionStorage.getItem(
          "superadmin_token"
        );


      const configuration =
        form.configuration.map(
          (config) => {
           
            const cleanConfig = {
            
              name:
                String(
                  config.name
                ).trim(),

            
              label:
                String(
                  config.label
                ).trim(),

              // IMPORTANT:
              // Send benefit type as well.
              type:
                config.type,
            };

          
            if (
              config.type ===
                "consumable" ||
              config.type ===
                "chat_pool"
            ) {
              cleanConfig.count =
                Number(
                  config.count
                );
            }


            if (
              config.eligible_after_days !==
                "" &&
              config.eligible_after_days !==
                null &&
              config.eligible_after_days !==
                undefined
            ) {
              cleanConfig.eligible_after_days =
                Number(
                  config.eligible_after_days
                );
            }

            if (
              config.requires_completed_capability &&
              String(
                config.requires_completed_capability
              ).trim()
            ) {
              cleanConfig.requires_completed_capability =
                String(
                  config.requires_completed_capability
                ).trim();
            }

            // =====================================
            // MATCH RULES
            // =====================================

            // IMPORTANT:
            // match_rules are NOT editable from
            // this form.
            //
            // They are copied automatically from
            // the selected Benefit API and sent
            // unchanged in the package payload.

            if (
              config.match_rules &&
              typeof config.match_rules ===
                "object" &&
              !Array.isArray(
                config.match_rules
              ) &&
              Object.keys(
                config.match_rules
              ).length > 0
            ) {
              cleanConfig.match_rules =
                config.match_rules;
            }

            return cleanConfig;
          }
        );

      // ==========================================
      // PAYLOAD
      // ==========================================

      const payload = {
        name:
          form.name.trim(),

        description:
          form.description.trim(),

        category:
          form.category,

        original_price:
          Number(
            form.original_price
          ),

        selling_price:
          Number(
            form.selling_price
          ),

        purchase_type:
          form.purchase_type,

        button_action:
          form.button_action,

        billing_mode:
          form.billing_mode,

        billing_period:
          form.billing_mode ===
          "autopay"
            ? form.billing_period
            : null,

        billing_interval:
          form.billing_mode ===
          "autopay"
            ? Number(
                form.billing_interval
              )
            : null,

        billing_cycle_count:
          form.billing_mode ===
          "autopay"
            ? Number(
                form.billing_cycle_count
              )
            : null,

        validity_days:
          form.validity_days ===
          ""
            ? null
            : Number(
                form.validity_days
              ),

        tags:
          form.tags,

        sequence:
          Number(
            form.sequence
          ),

        is_active:
          form.is_active,

        available_to_all_users:
          form.available_to_all_users,

        can_be_purchased:
          form.can_be_purchased,

        configuration:
          configuration,
      };

      console.log(
        "CREATE PACKAGE PAYLOAD:",
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      // ==========================================
      // API
      // ==========================================

      const response =
        await fetch(
          `${BASE_URL}/packages/admin/`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),

              "ngrok-skip-browser-warning":
                "true",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.detail ||
            "Failed to create package."
        );
      }

      setSuccess(
        "Package created successfully."
      );

      setTimeout(() => {
        navigate("/packages");
      }, 800);
    } catch (err) {
      console.error(
        "Create Package Error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while creating package."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="package-page add-package-page">

      {/* ===============================================
          HEADER
      =============================================== */}

      <div className="package-page-header">

        <div className="package-heading">

          <button
            type="button"
            className="package-back-button"
            onClick={() =>
              navigate("/packages")
            }
          >
            <FaArrowLeft />
          </button>

          <div>

            <h1>
              Add Package
            </h1>

            <p>
              Create and configure a new
              package.
            </p>

          </div>

        </div>

      </div>

      {/* ===============================================
          ERROR
      =============================================== */}

      {error && (
        <div className="package-error">

          <strong>
            Error
          </strong>

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            <FaTimes />
          </button>

        </div>
      )}

      {/* ===============================================
          SUCCESS
      =============================================== */}

      {success && (
        <div className="package-success">
          <strong>
            {success}
          </strong>
        </div>
      )}

      <form
        className="add-package-form"
        onSubmit={
          handleSubmit
        }
      >

        {/* ============================================
            BASIC DETAILS
        ============================================ */}

        <section className="add-package-section">

          <div className="add-section-header">

            <h2>
              Basic Details
            </h2>

            <p>
              Enter the basic package
              information.
            </p>

          </div>

          <div className="add-form-grid basic-details-grid">

            {/* PACKAGE NAME */}

            <div className="add-form-group full-width-field">

              <label>
                Package Name <span>*</span>
              </label>

              <input
                type="text"
                value={
                  form.name
                }
                onChange={(e) =>
                  setForm(
                    (prev) => ({
                      ...prev,
                      name:
                        e.target.value,
                    })
                  )
                }
                placeholder="Enter package name"
              />

            </div>

            {/* DESCRIPTION */}

            <div className="add-form-group full-width-field">

              <label>
                Description
              </label>

              <textarea
                rows="4"
                value={
                  form.description
                }
                onChange={(e) =>
                  setForm(
                    (prev) => ({
                      ...prev,
                      description:
                        e.target.value,
                    })
                  )
                }
                placeholder="Enter package description"
              />

            </div>

            {/* CATEGORY */}

            <div className="add-form-group">

              <label>
                Category *
              </label>

              <select
                name="category"
                value={
                  form.category
                }
                onChange={
                  handleChange
                }
                disabled={
                  categoryLoading
                }
              >

                <option value="">
                  {categoryLoading
                    ? "Loading..."
                    : "Select Category"}
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.id
                      }
                      value={
                        category.id
                      }
                    >
                      {
                        category.name
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            {/* SEQUENCE */}

            <div className="add-form-group">

              <label>
                Sequence *
              </label>

              <input
                type="number"
                min="1"
                name="sequence"
                value={
                  form.sequence
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>

        </section>

        {/* ============================================
            PRICING
        ============================================ */}

        <section className="add-package-section">

          <div className="add-section-header">

            <h2>
              Pricing
            </h2>

            <p>
              Configure original and
              selling price.
            </p>

          </div>

          <div className="add-form-grid">

            {/* ORIGINAL PRICE */}

            <div className="add-form-group">

              <label>
                Original Price *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="original_price"
                value={
                  form.original_price
                }
                onChange={
                  handleChange
                }
                placeholder="0.00"
              />

            </div>

            {/* SELLING PRICE */}

            <div className="add-form-group">

              <label>
                Selling Price *
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                name="selling_price"
                value={
                  form.selling_price
                }
                onChange={
                  handleChange
                }
                placeholder="0.00"
              />

            </div>

          </div>

        </section>

       

<section className="add-package-section billing-section">

  <div className="add-section-header">

    <h2>
      Billing
    </h2>

    <p>
      Configure how and when the customer will be charged.
    </p>

  </div>

  <div className="add-form-grid">

    {/* ==========================================
        BILLING MODE
    ========================================== */}

    <div className="add-form-group full-width">

      <label>
        Billing Mode <span>*</span>
      </label>

      <div className="billing-select-wrapper">

        <button
          type="button"
          className="billing-select-trigger"
          onClick={() =>
            setShowBillingModeDropdown(
              (prev) => !prev
            )
          }
        >

          <span>
            {form.billing_mode === "one_time"
              ? "One Time"
              : form.billing_mode === "autopay"
              ? "Autopay"
              : "Select Billing Mode"}
          </span>

          <FaChevronDown
            className={
              showBillingModeDropdown
                ? "billing-arrow-up"
                : ""
            }
          />

        </button>

        {showBillingModeDropdown && (

          <div className="billing-select-dropdown">

            {/* INFO */}

            <div className="billing-info-box">

              <FaQuestionCircle />

              <div>

                <strong>
                  Choose how the customer pays
                </strong>

                <span>
                  One Time means one payment.
                  Autopay means recurring automatic
                  payments.
                </span>

              </div>

            </div>

            {/* ==================================
                ONE TIME
            ================================== */}

            <button
              type="button"
              className={`billing-option ${
                form.billing_mode === "one_time"
                  ? "billing-option-selected"
                  : ""
              }`}
              onClick={() => {

                handleBillingModeChange(
                  "one_time"
                );

                setShowBillingModeDropdown(
                  false
                );

              }}
            >

              <div className="billing-option-icon">
                <FaCreditCard />
              </div>

              <div className="billing-option-content">

                <strong>
                  One Time
                </strong>

                <span>
                  Customer pays once.
                  No recurring payment
                  will be made.
                </span>

                <small>
                  Example: ₹2,000 package →
                  customer pays ₹2,000 only once.
                </small>

              </div>

            </button>

            {/* ==================================
                AUTOPAY - DISABLED FOR NOW
            ================================== */}

            {/*
            <button
              type="button"
              className={`billing-option ${
                form.billing_mode === "autopay"
                  ? "billing-option-selected"
                  : ""
              }`}
              onClick={() => {

                handleBillingModeChange(
                  "autopay"
                );

                setShowBillingModeDropdown(
                  false
                );

              }}
            >

              <div className="billing-option-icon">
                <FaSyncAlt />
              </div>

              <div className="billing-option-content">

                <strong>
                  Autopay
                </strong>

                <span>
                  Customer is charged
                  automatically.
                </span>

              </div>

            </button>
            */}

          </div>

        )}

      </div>

    </div>

    

    <div className="add-form-group">

      <label>
        Validity Days <span>*</span>
      </label>

      <input
        type="number"
        min="1"
        name="validity_days"
        value={form.validity_days}
        onChange={handleChange}
        placeholder="e.g. 365"
      />

      <div className="benefit-field-help">

        <small>
          Number of days the package remains
          valid after purchase.
        </small>

      </div>

    </div>

  </div>

</section>

      

        <section className="add-package-section">

          <div className="add-section-header">

            <h2>
              Tags
            </h2>

            <p>
              Add tags for this package.
            </p>

          </div>

          <div className="tag-input-wrapper">

            <div className="package-tags">

              {form.tags.map(
                (tag, index) => (

                  <span
                    className="package-tag"
                    key={`${tag}-${index}`}
                  >

                    {tag}

                    <button
                      type="button"
                      onClick={() =>
                        removePackageTag(
                          index
                        )
                      }
                    >
                      <FaTimes />
                    </button>

                  </span>

                )
              )}

            </div>

            <input
              type="text"
              value={
                form.tagInput
              }
              onChange={(e) =>
                setForm(
                  (prev) => ({
                    ...prev,

                    tagInput:
                      e.target.value,
                  })
                )
              }
              onKeyDown={
                handlePackageTagKeyDown
              }
              placeholder="Type tag and press Enter"
            />

          </div>

        </section>

       
        <section className="add-package-section">

          <div className="add-section-header configuration-header">

            <div>

              <h2>
                Package Configuration
              </h2>

              <p>
                Select the benefits included
                in this package.
              </p>

            </div>

          </div>

          {/* ==========================================
              BENEFIT MULTI SELECT
          ========================================== */}

          <div className="add-form-group full-width-field">

            <label>
              Select Benefits{" "}
              <span>*</span>
            </label>

            <div className="benefit-multiselect-wrapper">

              {/* TRIGGER */}

              <button
                type="button"
                className="benefit-multiselect-trigger"
                onClick={() =>
                  setShowBenefitDropdown(
                    (prev) =>
                      !prev
                  )
                }
              >

                <div className="selected-benefit-values">

                  {form.configuration
                    .length === 0 ? (

                    <span className="benefit-placeholder">

                      {benefitLoading
                        ? "Loading benefits..."
                        : "Select benefits"}

                    </span>

                  ) : (

                    form.configuration.map(
                      (config) => (

                        <span
                          key={
                            config.benefit_id
                          }
                          className="selected-benefit-chip"
                        >

                          {config.label ||
                            config.name}

                          <span
                            className="selected-benefit-chip-remove"
                            onClick={(e) => {

                              e.stopPropagation();

                              const selectedIndex =
                                form.configuration.findIndex(
                                  (item) =>
                                    item.benefit_id ===
                                    config.benefit_id
                                );

                              if (
                                selectedIndex !==
                                -1
                              ) {
                                removeConfiguration(
                                  selectedIndex
                                );
                              }

                            }}
                          >
                            <FaTimes />
                          </span>

                        </span>

                      )
                    )

                  )}

                </div>

                <FaChevronDown
                  className={
                    showBenefitDropdown
                      ? "benefit-arrow-up"
                      : ""
                  }
                />

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
        const isSelected = form.configuration.some(
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
                const selectedIndex =
                  form.configuration.findIndex(
                    (item) => item.benefit_id === benefit.id
                  );

                if (selectedIndex !== -1) {
                  removeConfiguration(selectedIndex);
                }

                return;
              }

              addConfiguration(benefit);
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

            <div className="benefit-selection-help">

              <small>
                Select one or more benefits
                from the list. You can select
                multiple benefits for the same
                package.
              </small>

            </div>

          </div>

          {/* ==========================================
              SELECTED BENEFITS
          ========================================== */}

          {form.configuration.length ===
          0 ? (

            <div className="configuration-empty">

              <h3>
                No Benefits Selected
              </h3>

              <p>
                Select one or more benefits
                from the dropdown above.
              </p>

            </div>

          ) : (

            <div className="configuration-list">

              {form.configuration.map(
                (config, index) => (

                  <div
                    className="configuration-card"
                    key={
                      config.benefit_id ||
                      index
                    }
                  >

                 
                    <div className="configuration-card-header">

                      <div>

                        <span>
                          Benefit{" "}
                          {index + 1}
                        </span>

                        <h3>
                          {config.label ||
                            config.name}
                        </h3>

                      </div>

                      <button
                        type="button"
                        className="remove-benefit-button"
                        onClick={() =>
                          removeConfiguration(
                            index
                          )
                        }
                      >
                        <FaTrash />
                      </button>

                    </div>

                    {/* ==================================
                        BENEFIT BASIC DETAILS
                    ================================== */}

                    <div className="add-form-grid">


                     

                      <div className="add-form-group">

                        <label>
                        Benefit
                        </label>

                        <input
                          type="text"
                          value={
                            config.label
                          }
                          readOnly
                        />

                      </div>

                      

                      <div className="add-form-group">

                        <label>
                          Benefit Type
                        </label>

                        <input
                          type="text"
                          value={
                            config.type ===
                            "consumable"
                              ? "Consumable"
                              : config.type ===
                                "chat_pool"
                              ? "Chat Pool"
                              : config.type ===
                                "rule"
                              ? "Rule"
                              : "Flag"
                          }
                          readOnly
                        />

                      </div>

                      

                      {config.type ===
                        "consumable" && (

                        <div className="add-form-group">

                          <label>
                            Usage Count *
                          </label>

                          <input
                            type="number"
                            min="1"
                            value={
                              config.count
                            }
                            onChange={(e) =>
                              updateConfiguration(
                                index,
                                "count",
                                e.target.value
                              )
                            }
                            placeholder="e.g. 5"
                          />

                          <div className="benefit-field-help">

                            <small>
                              Enter how many
                              times the
                              customer can
                              use this
                              benefit.
                            </small>

                          </div>

                        </div>

                      )}

                    </div>

                    {/* =================================
                        ELIGIBILITY
                    ================================= */}

                    {config.type ===
                      "consumable" && (

                      <div className="add-form-grid">

                        {/* ELIGIBLE AFTER DAYS */}

                        <div className="add-form-group">

                          <label>
                            Eligible After Days
                          </label>

                          <input
                            type="number"
                            min="0"
                            value={
                              config.eligible_after_days
                            }
                            onChange={(e) =>
                              updateConfiguration(
                                index,
                                "eligible_after_days",
                                e.target.value
                              )
                            }
                            placeholder="e.g. 15"
                          />

                          <div className="benefit-field-help">

                            <small>
                              The benefit
                              becomes
                              available
                              after this
                              many days.
                            </small>

                            <small>
                              Example: 15 means
                              the benefit becomes
                              available after
                              15 days.
                            </small>

                          </div>

                        </div>


                        <div className="add-form-group">

                          <label>
                            Requires Completed Benefit
                          </label>

                          <input
                            type="text"
                            value={
                              config.requires_completed_capability ||
                              ""
                            }
                            onChange={(e) =>
                              updateConfiguration(
                                index,
                                "requires_completed_capability",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Diet consultation"
                          />

                          <div className="benefit-field-help">

                            <small>
                              Enter the benefit
                              that must be
                              completed before
                              this benefit
                              becomes
                              available.
                            </small>

                            <small>
                              Example: Diet
                              consultation
                            </small>

                          </div>

                        </div>

                      </div>

                    )}

                    {/* =================================
                        MATCH RULES - READ ONLY
                    ================================= */}

                    {config.match_rules &&
                      Object.keys(
                        config.match_rules
                      ).length > 0 && (

                      <div className="match-rules-box">

                        <div className="match-rules-header">

                          <div>

                            <h4>
                              Match Rules
                            </h4>

                            <p>
                              These rules are
                              automatically taken
                              from the selected
                              benefit and cannot
                              be edited here.
                            </p>

                          </div>

                        </div>

                        <div className="add-form-grid">

                          {Object.entries(
                            config.match_rules
                          ).map(
                            (
                              [
                                ruleKey,
                                ruleValue,
                              ]
                            ) => (

                              <div
                                className="add-form-group"
                                key={
                                  ruleKey
                                }
                              >

                                <label>
                                  {ruleKey
                                    .replace(
                                      /_/g,
                                      " "
                                    )
                                    .replace(
                                      /\b\w/g,
                                      (char) =>
                                        char.toUpperCase()
                                    )}
                                </label>

                                <input
                                  type="text"
                                  value={
                                    typeof ruleValue ===
                                    "boolean"
                                      ? ruleValue
                                        ? "Yes"
                                        : "No"
                                      : String(
                                          ruleValue ??
                                            ""
                                        )
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

                )
              )}

            </div>

          )}

        </section>

       

        <section className="add-package-section">

          <div className="add-section-header">

            <h2>
              Status & Availability
            </h2>

          </div>

          <div className="status-checkbox-row">

            <label>

              <input
                type="checkbox"
                checked={
                  form.is_active
                }
                onChange={(e) =>
                  setForm(
                    (prev) => ({
                      ...prev,

                      is_active:
                        e.target.checked,
                    })
                  )
                }
              />

              Active

            </label>

          </div>

        </section>

        
        

        <div className="add-package-footer">

          <button
            type="button"
            className="package-cancel-button"
            onClick={() =>
              navigate("/packages")
            }
            disabled={
              loading
            }
          >

            <FaTimes />

            Cancel

          </button>

          <button
            type="submit"
            className="package-save-button"
            disabled={
              loading
            }
          >

            <FaSave />

            {loading
              ? "Creating..."
              : "Create Package"}

          </button>

        </div>

      </form>

    </div>
  );
};

export default AddPackage;