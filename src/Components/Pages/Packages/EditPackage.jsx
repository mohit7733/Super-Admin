import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaSave,
  FaTimes,
  FaChevronDown,
  FaQuestionCircle,
  FaCreditCard,
  FaSyncAlt,
} from "react-icons/fa";

import BASE_URL from "../../../Base";
import "./AddPackages.css";


// ============================================================
// EMPTY CONFIGURATION
// ============================================================

const createEmptyConfiguration = () => ({
  name: "",
  label: "",
  type: "flag",

  count: "",

  tags: [],
  tagInput: "",

  match_rules: {
    is_followup: false,
    is_dietitian: false,
  },

  eligible_after_days: "",
  requires_completed_capability: "",
});


// ============================================================
// EDIT PACKAGE
// ============================================================

const EditPackage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [fetchingPackage, setFetchingPackage] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [
    showBillingModeDropdown,
    setShowBillingModeDropdown,
  ] = useState(false);


  // ============================================================
  // FORM
  // ============================================================

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


  // ============================================================
  // AUTH HEADERS
  // ============================================================

  const getHeaders = () => {
    const token =
      sessionStorage.getItem("superadmin_token");

    return {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      "ngrok-skip-browser-warning": "true",
    };
  };


  // ============================================================
  // FETCH CATEGORIES
  // ============================================================

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
                (item) =>
                  item.id &&
                  item.name
              )
          : [];

      setCategories(
        normalizedCategories
      );

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


  // ============================================================
  // NORMALIZE CONFIGURATION
  // ============================================================

  const normalizeConfiguration = (
    configuration
  ) => {
    if (!Array.isArray(configuration)) {
      return [];
    }

    return configuration.map(
      (config) => ({
        name:
          config?.name || "",

        label:
          config?.label || "",

        type:
          config?.type || "flag",

        count:
          config?.count ??
          "",

        tags:
          Array.isArray(config?.tags)
            ? config.tags
            : [],

        tagInput: "",

        match_rules: {
          is_followup:
            Boolean(
              config?.match_rules
                ?.is_followup
            ),

          is_dietitian:
            Boolean(
              config?.match_rules
                ?.is_dietitian
            ),
        },

        eligible_after_days:
          config?.eligible_after_days ??
          "",

        requires_completed_capability:
          config?.requires_completed_capability ||
          "",
      })
    );
  };


  // ============================================================
  // FETCH PACKAGE
  // ============================================================

  const fetchPackage = async () => {
    try {
      setFetchingPackage(true);
      setError("");

      const response = await fetch(
        `${BASE_URL}/packages/admin/?id=${id}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Failed to fetch package."
        );
      }

      // --------------------------------------------------------
      // HANDLE DIFFERENT POSSIBLE API RESPONSE STRUCTURES
      // --------------------------------------------------------

      const packageData =
        result?.data?.results?.[0] ||
        result?.data?.result ||
        result?.data ||
        result?.result ||
        result;

      if (
        !packageData ||
        Array.isArray(packageData)
      ) {
        throw new Error(
          "Package details were not found."
        );
      }


      // --------------------------------------------------------
      // CATEGORY ID
      // --------------------------------------------------------

      let categoryId =
        packageData?.category;

      if (
        typeof categoryId === "object" &&
        categoryId !== null
      ) {
        categoryId =
          categoryId?.id ||
          categoryId?.category_id ||
          "";
      }


      // --------------------------------------------------------
      // PREFILL FORM
      // --------------------------------------------------------

      setForm({
        name:
          packageData?.name || "",

        description:
          packageData?.description || "",

        category:
          categoryId || "",

        original_price:
          packageData?.original_price ??
          "",

        selling_price:
          packageData?.selling_price ??
          "",

        purchase_type:
          packageData?.purchase_type ||
          "prepaid_package",

        button_action:
          packageData?.button_action ||
          "purchase_package",

        billing_mode:
          packageData?.billing_mode ||
          "one_time",

        billing_period:
          packageData?.billing_period ||
          "",

        billing_interval:
          packageData?.billing_interval ??
          "",

        billing_cycle_count:
          packageData?.billing_cycle_count ??
          "",

        validity_days:
          packageData?.validity_days ??
          "",

        tags:
          Array.isArray(packageData?.tags)
            ? packageData.tags
            : [],

        tagInput: "",

        sequence:
          packageData?.sequence ??
          0,

        is_active:
          Boolean(packageData?.is_active),

        available_to_all_users:
          packageData?.available_to_all_users ??
          true,

        can_be_purchased:
          packageData?.can_be_purchased ??
          true,

        configuration:
          normalizeConfiguration(
            packageData?.configuration
          ),
      });

    } catch (err) {
      console.error(
        "Fetch Package Error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while fetching package."
      );

    } finally {
      setFetchingPackage(false);
    }
  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (!id) {
      setError("Invalid package ID.");
      setFetchingPackage(false);
      return;
    }

    fetchCategories();
    fetchPackage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  // ============================================================
  // BASIC FORM CHANGE
  // ============================================================

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


  // ============================================================
  // PURCHASE TYPE
  // ============================================================

  const handlePurchaseTypeChange = (
    value
  ) => {
    const isOpenPlan =
      value === "open_plan";

    setForm((prev) => ({
      ...prev,

      purchase_type:
        value,

      button_action:
        isOpenPlan
          ? "book_consultation"
          : "purchase_package",

      can_be_purchased:
        !isOpenPlan,
    }));
  };


  // ============================================================
  // BILLING MODE
  // ============================================================

  const handleBillingModeChange = (
    value
  ) => {
    setForm((prev) => ({
      ...prev,

      billing_mode:
        value,

      ...(value === "one_time"
        ? {
            billing_period: "",
            billing_interval: "",
            billing_cycle_count: "",
          }
        : {}),
    }));
  };


  // ============================================================
  // PACKAGE TAGS
  // ============================================================

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

      tags:
        prev.tags.filter(
          (_, i) =>
            i !== index
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


  // ============================================================
  // ADD CONFIGURATION
  // ============================================================

  const addConfiguration = () => {
    setForm((prev) => ({
      ...prev,

      configuration: [
        ...prev.configuration,
        createEmptyConfiguration(),
      ],
    }));
  };


  // ============================================================
  // REMOVE CONFIGURATION
  // ============================================================

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


  // ============================================================
  // UPDATE CONFIGURATION
  // ============================================================

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
                  [field]: value,
                }
              : item
        ),
    }));
  };


  // ============================================================
  // CHANGE CONFIGURATION TYPE
  // ============================================================

  const changeConfigurationType = (
    index,
    type
  ) => {
    setForm((prev) => ({
      ...prev,

      configuration:
        prev.configuration.map(
          (item, i) => {
            if (i !== index) {
              return item;
            }

            return {
              ...item,

              type,

              count:
                type === "consumable" ||
                type === "chat_pool"
                  ? item.count || 1
                  : "",

              match_rules:
                item.match_rules || {
                  is_followup: false,
                  is_dietitian: false,
                },

              eligible_after_days:
                item.eligible_after_days ||
                "",

              requires_completed_capability:
                item.requires_completed_capability ||
                "",
            };
          }
        ),
    }));
  };


  // ============================================================
  // MATCH RULES
  // ============================================================

  const updateMatchRule = (
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

                  match_rules: {
                    ...(item.match_rules ||
                      {}),

                    [field]: value,
                  },
                }
              : item
        ),
    }));
  };


  // ============================================================
  // CONFIGURATION TAGS
  // ============================================================

  const addConfigurationTag = (
    index
  ) => {
    const config =
      form.configuration[index];

    const tag =
      config?.tagInput?.trim();

    if (!tag) return;

    const alreadyExists =
      config.tags?.some(
        (existingTag) =>
          existingTag.toLowerCase() ===
          tag.toLowerCase()
      );

    if (alreadyExists) {
      return;
    }

    setForm((prev) => ({
      ...prev,

      configuration:
        prev.configuration.map(
          (item, i) =>
            i === index
              ? {
                  ...item,

                  tags: [
                    ...(item.tags || []),
                    tag,
                  ],

                  tagInput: "",
                }
              : item
        ),
    }));
  };


  const removeConfigurationTag = (
    configIndex,
    tagIndex
  ) => {
    setForm((prev) => ({
      ...prev,

      configuration:
        prev.configuration.map(
          (item, i) =>
            i === configIndex
              ? {
                  ...item,

                  tags:
                    item.tags.filter(
                      (_, index) =>
                        index !==
                        tagIndex
                    ),
                }
              : item
        ),
    }));
  };


  const handleConfigurationTagKeyDown = (
    e,
    index
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      addConfigurationTag(index);
    }
  };


  // ============================================================
  // VALIDATION
  // ============================================================

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


    // ----------------------------------------------------------
    // AUTOPAY
    // ----------------------------------------------------------

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

      if (!form.billing_cycle_count) {
        return "Billing cycle count is required for autopay.";
      }

      if (
        Number(form.billing_cycle_count) < 1
      ) {
        return "Billing cycle count must be at least 1.";
      }
    }


    // ----------------------------------------------------------
    // CONFIGURATION
    // ----------------------------------------------------------

    for (
      let i = 0;
      i < form.configuration.length;
      i++
    ) {
      const config =
        form.configuration[i];

      if (
        !config.name ||
        !config.name.trim()
      ) {
        return `Benefit ${i + 1}: name is required.`;
      }

      if (
        !config.label ||
        !config.label.trim()
      ) {
        return `Benefit ${i + 1}: customer label is required.`;
      }

      if (
        config.type === "consumable" ||
        config.type === "chat_pool"
      ) {
        if (
          !config.count ||
          Number(config.count) < 1
        ) {
          return `Benefit ${i + 1}: count must be at least 1.`;
        }
      }
    }

    return "";
  };


  // ============================================================
  // CLEAN CONFIGURATION
  // ============================================================

  const buildConfiguration = () => {
    return form.configuration.map(
      (config) => {
        const cleanConfig = {
          name:
            config.name.trim(),

          label:
            config.label.trim(),

          type:
            config.type,
        };


        // COUNT

        if (
          config.type ===
            "consumable" ||
          config.type ===
            "chat_pool"
        ) {
          cleanConfig.count =
            Number(config.count);
        }


        // TAGS

        if (
          config.tags &&
          config.tags.length > 0
        ) {
          cleanConfig.tags =
            config.tags;
        }


        // MATCH RULES

        const hasMatchRules =
          config.match_rules
            ?.is_followup === true ||
          config.match_rules
            ?.is_dietitian === true;

        if (hasMatchRules) {
          cleanConfig.match_rules = {
            is_followup:
              Boolean(
                config.match_rules
                  ?.is_followup
              ),

            is_dietitian:
              Boolean(
                config.match_rules
                  ?.is_dietitian
              ),
          };
        }


        // ELIGIBLE AFTER DAYS

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


        // REQUIRED COMPLETED CAPABILITY

        if (
          config.requires_completed_capability &&
          config
            .requires_completed_capability
            .trim()
        ) {
          cleanConfig.requires_completed_capability =
            config
              .requires_completed_capability
              .trim();
        }

        return cleanConfig;
      }
    );
  };


  // ============================================================
  // UPDATE PACKAGE
  // ============================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }


    try {
      setLoading(true);

      const configuration =
        buildConfiguration();


      // ========================================================
      // PAYLOAD
      // ========================================================

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
          form.validity_days === ""
            ? null
            : Number(
                form.validity_days
              ),

        tags:
          form.tags,

        sequence:
          Number(form.sequence),

        is_active:
          form.is_active,

        available_to_all_users:
          form.available_to_all_users,

        can_be_purchased:
          form.can_be_purchased,

        configuration,
      };


      console.log(
        "UPDATE PACKAGE PAYLOAD:",
        payload
      );


      // ========================================================
      // PATCH API
      // ========================================================

      const response =
        await fetch(
          `${BASE_URL}/packages/admin/?id=${id}`,
          {
            method: "PATCH",

            headers:
              getHeaders(),

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
            "Failed to update package."
        );
      }


      // ========================================================
      // SUCCESS
      // ========================================================

      setSuccess(
        "Package updated successfully."
      );


      setTimeout(() => {
        navigate("/packages");
      }, 800);

    } catch (err) {
      console.error(
        "Update Package Error:",
        err
      );

      setError(
        err?.message ||
          "Something went wrong while updating package."
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (fetchingPackage) {
    return (
      <div className="package-page add-package-page">

        <div className="package-loading-wrapper">

          <div className="package-loader">
            <FaSyncAlt />
          </div>

          <h3>
            Loading Package...
          </h3>

          <p>
            Please wait while we fetch
            package information.
          </p>

        </div>

      </div>
    );
  }


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="package-page add-package-page">


      {/* ======================================================
          HEADER
      ====================================================== */}

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
              Edit Package
            </h1>

            <p>
              Update and configure your
              package details.
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          ERROR
      ====================================================== */}

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


      {/* ======================================================
          SUCCESS
      ====================================================== */}

      {success && (
        <div className="package-success">

          <strong>
            {success}
          </strong>

        </div>
      )}


      {/* ======================================================
          FORM
      ====================================================== */}

      <form
        className="add-package-form"
        onSubmit={handleSubmit}
      >


        {/* ====================================================
            BASIC DETAILS
        ==================================================== */}

        <section className="add-package-section">

          <div className="add-section-header">

            <h2>
              Basic Details
            </h2>

            <p>
              Update the basic package
              information.
            </p>

          </div>


          <div className="add-form-grid">


            {/* PACKAGE NAME */}

            <div className="add-form-group full-width">

              <label>
                Package Name *
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter package name"
              />

            </div>


            {/* DESCRIPTION */}

            <div className="add-form-group full-width">

              <label>
                Description
              </label>

              <textarea
                name="description"
                value={
                  form.description
                }
                onChange={handleChange}
                placeholder="Enter package description"
                rows={4}
              />

            </div>


            {/* CATEGORY */}

            <div className="add-form-group">

              <label>
                Category *
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

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
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
                value={form.sequence}
                onChange={handleChange}
              />

            </div>

          </div>

        </section>


        {/* ====================================================
            PRICING
        ==================================================== */}

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
                onChange={handleChange}
                placeholder="0.00"
              />

            </div>


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
                onChange={handleChange}
                placeholder="0.00"
              />

            </div>

          </div>

        </section>


        {/* ====================================================
            PURCHASE TYPE
        ==================================================== */}

        <section className="add-package-section">

          <div className="add-section-header">

            <h2>
              Purchase Type
            </h2>

            <p>
              Select how this package is
              available to customers.
            </p>

          </div>


          <div className="add-form-grid">

            <div className="add-form-group">

              <label>
                Purchase Type *
              </label>

              <select
                value={
                  form.purchase_type
                }
                onChange={(e) =>
                  handlePurchaseTypeChange(
                    e.target.value
                  )
                }
              >

                <option value="prepaid_package">
                  Prepaid Package
                </option>

                <option value="open_plan">
                  Open Plan
                </option>

              </select>

            </div>


            <div className="add-form-group">

              <label>
                Button Action
              </label>

              <input
                type="text"
                value={
                  form.button_action
                    ? form.button_action
                        .replaceAll(
                          "_",
                          " "
                        )
                        .replace(
                          /\b\w/g,
                          (char) =>
                            char.toUpperCase()
                        )
                    : ""
                }
                readOnly
              />

            </div>

          </div>

        </section>


        {/* ====================================================
            BILLING
        ==================================================== */}

        <section className="add-package-section billing-section">

          <div className="add-section-header">

            <h2>
              Billing
            </h2>

            <p>
              Configure how and when the
              customer will be charged.
            </p>

          </div>


          <div className="add-form-grid">


            {/* BILLING MODE */}

            <div className="add-form-group full-width">

              <label>
                Billing Mode{" "}
                <span>*</span>
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

                    {form.billing_mode ===
                    "one_time"
                      ? "One Time"
                      : form.billing_mode ===
                        "autopay"
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

                    <div className="billing-info-box">

                      <FaQuestionCircle />

                      <div>

                        <strong>
                          Choose how the customer pays
                        </strong>

                        <span>
                          One Time means one payment.
                          Autopay means recurring
                          automatic payments.
                        </span>

                      </div>

                    </div>


                    {/* ONE TIME */}

                    <button
                      type="button"
                      className={`billing-option ${
                        form.billing_mode ===
                        "one_time"
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
                          Example: ₹2,000 package
                          → customer pays ₹2,000
                          only once.
                        </small>

                      </div>

                    </button>


                    {/* AUTOPAY */}

                    <button
                      type="button"
                      className={`billing-option ${
                        form.billing_mode ===
                        "autopay"
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
                          automatically according
                          to the billing schedule.
                        </span>

                        <small>
                          Example: ₹2,000 every month
                          → payment is automatically
                          collected each month.
                        </small>

                      </div>

                    </button>

                  </div>

                )}

              </div>

            </div>


            {/* AUTOPAY FIELDS */}

            {form.billing_mode ===
              "autopay" && (
              <>

                <div className="add-form-group">

                  <label>
                    Billing Period *
                  </label>

                  <select
                    name="billing_period"
                    value={
                      form.billing_period
                    }
                    onChange={handleChange}
                  >

                    <option value="">
                      Select Billing Period
                    </option>

                    <option value="monthly">
                      Monthly
                    </option>

                    <option value="quarterly">
                      Quarterly
                    </option>

                    <option value="yearly">
                      Yearly
                    </option>

                  </select>

                </div>


                <div className="add-form-group">

                  <label>
                    Billing Interval *
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="billing_interval"
                    value={
                      form.billing_interval
                    }
                    onChange={handleChange}
                    placeholder="e.g. 1"
                  />

                </div>


                <div className="add-form-group">

                  <label>
                    Billing Cycle Count *
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="billing_cycle_count"
                    value={
                      form.billing_cycle_count
                    }
                    onChange={handleChange}
                    placeholder="e.g. 12"
                  />

                </div>


                <div className="add-form-group">

                  <label>
                    Validity Days
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="validity_days"
                    value={
                      form.validity_days
                    }
                    onChange={handleChange}
                    placeholder="e.g. 365"
                  />

                </div>

              </>
            )}


            {/* ONE TIME VALIDITY */}

            {form.billing_mode ===
              "one_time" && (

              <div className="add-form-group">

                <label>
                  Validity Days
                </label>

                <input
                  type="number"
                  min="1"
                  name="validity_days"
                  value={
                    form.validity_days
                  }
                  onChange={handleChange}
                  placeholder="e.g. 30"
                />

              </div>

            )}

          </div>

        </section>


        {/* ====================================================
            TAGS
        ==================================================== */}

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
                setForm((prev) => ({
                  ...prev,
                  tagInput:
                    e.target.value,
                }))
              }
              onKeyDown={
                handlePackageTagKeyDown
              }
              placeholder="Type tag and press Enter"
            />

          </div>

        </section>


        {/* ====================================================
            CONFIGURATION
        ==================================================== */}

        <section className="add-package-section">

          <div className="add-section-header configuration-header">

            <div>

              <h2>
                Package Configuration
              </h2>

              <p>
                Update the benefits included
                in this package.
              </p>

            </div>


            <button
              type="button"
              className="add-benefit-button"
              onClick={
                addConfiguration
              }
            >
              <FaPlus />
              Add Benefit
            </button>

          </div>


          {form.configuration.length ===
          0 ? (

            <div className="configuration-empty">

              <h3>
                No Benefits Added
              </h3>

              <p>
                Click "Add Benefit" to
                configure what customers
                receive.
              </p>

              <button
                type="button"
                className="add-benefit-button"
                onClick={
                  addConfiguration
                }
              >
                <FaPlus />
                Add First Benefit
              </button>

            </div>

          ) : (

            <div className="configuration-list">

              {form.configuration.map(
                (config, index) => (

                  <div
                    className="configuration-card"
                    key={index}
                  >


                    {/* BENEFIT HEADER */}

                    <div className="configuration-card-header">

                      <div>

                        <span>
                          Benefit{" "}
                          {index + 1}
                        </span>

                        <h3>
                          {config.label ||
                            "Benefit"}
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


                    {/* BASIC BENEFIT */}

                    <div className="add-form-grid">


                      {/* NAME */}

                      <div className="add-form-group">

                        <label>
                          Benefit Name *
                        </label>

                        <input
                          type="text"
                          value={
                            config.name
                          }
                          onChange={(e) =>
                            updateConfiguration(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="e.g. Doctor Consultation"
                        />

                      </div>


                      {/* LABEL */}

                      <div className="add-form-group">

                        <label>
                          Customer Label *
                        </label>

                        <input
                          type="text"
                          value={
                            config.label
                          }
                          onChange={(e) =>
                            updateConfiguration(
                              index,
                              "label",
                              e.target.value
                            )
                          }
                          placeholder="e.g. Doctor Consultation"
                        />

                      </div>


                      {/* TYPE */}

                      <div className="add-form-group">

                        <label>
                          Benefit Type *
                        </label>

                        <select
                          value={
                            config.type
                          }
                          onChange={(e) =>
                            changeConfigurationType(
                              index,
                              e.target.value
                            )
                          }
                        >

                          <option value="flag">
                            Flag
                          </option>

                          <option value="consumable">
                            Consumable
                          </option>

                          <option value="chat_pool">
                            Chat Pool
                          </option>

                          <option value="rule">
                            Rule
                          </option>

                        </select>


                        <div className="benefit-type-help">

                          {config.type ===
                            "flag" && (
                            <>
                              <div className="benefit-help-title">
                                Flag Benefit
                              </div>

                              <p>
                                Use this when
                                the benefit is
                                simply included
                                in the package.
                              </p>

                              <div className="benefit-help-example">
                                <strong>
                                  Example:
                                </strong>{" "}
                                Premium Support
                                → Included in
                                package.
                              </div>
                            </>
                          )}


                          {config.type ===
                            "consumable" && (
                            <>
                              <div className="benefit-help-title">
                                Consumable Benefit
                              </div>

                              <p>
                                Customer gets
                                a fixed number
                                of uses.
                              </p>

                              <div className="benefit-help-example">
                                <strong>
                                  Example:
                                </strong>{" "}
                                Doctor
                                Consultation
                                → Count 5.
                              </div>
                            </>
                          )}

                        </div>

                      </div>


                      {/* COUNT */}

                      {config.type ===
                        "consumable" && (

                        <div className="add-form-group">

                          <label>
                            Count *
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
                              How many times
                              can the
                              customer use
                              this benefit?
                            </small>

                          </div>

                        </div>

                      )}

                    </div>


                    {/* ELIGIBILITY */}

                    <div className="add-form-grid">

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
                            Benefit becomes
                            available after
                            this many days.
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
                            completed first.
                          </small>

                        </div>

                      </div>

                    </div>


                    {/* MATCH RULES */}

                    <div className="match-rules-box">

                      <div className="match-rules-header">

                        <div>

                          <h4>
                            Match Rules
                          </h4>

                          <p>
                            Select when this
                            benefit should
                            apply.
                          </p>

                        </div>

                      </div>


                      <div className="add-form-grid">


                        {/* FOLLOW UP */}

                        <div className="add-form-group">

                          <label>
                            Is Follow-up?
                          </label>

                          <select
                            value={
                              config
                                .match_rules
                                ?.is_followup
                                ? "true"
                                : "false"
                            }
                            onChange={(e) =>
                              updateMatchRule(
                                index,
                                "is_followup",
                                e.target.value ===
                                  "true"
                              )
                            }
                          >

                            <option value="false">
                              No
                            </option>

                            <option value="true">
                              Yes
                            </option>

                          </select>

                          <div className="benefit-field-help">

                            <small>
                              Select Yes if
                              this benefit
                              applies only
                              to follow-up
                              consultations.
                            </small>

                          </div>

                        </div>


                        {/* DIETITIAN */}

                        <div className="add-form-group">

                          <label>
                            Is Dietitian?
                          </label>

                          <select
                            value={
                              config
                                .match_rules
                                ?.is_dietitian
                                ? "true"
                                : "false"
                            }
                            onChange={(e) =>
                              updateMatchRule(
                                index,
                                "is_dietitian",
                                e.target.value ===
                                  "true"
                              )
                            }
                          >

                            <option value="false">
                              No
                            </option>

                            <option value="true">
                              Yes
                            </option>

                          </select>

                          <div className="benefit-field-help">

                            <small>
                              Select Yes if
                              this benefit
                              applies to
                              dietitian
                              services.
                            </small>

                          </div>

                        </div>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>


        {/* ====================================================
            STATUS
        ==================================================== */}

        <section className="add-package-section">

          <div className="add-section-header">

            <h2>
              Status & Availability
            </h2>

            <p>
              Control package availability.
            </p>

          </div>


          <div className="status-checkbox-row">


            {/* ACTIVE */}

            <label>

              <input
                type="checkbox"
                checked={
                  form.is_active
                }
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,

                    is_active:
                      e.target.checked,
                  }))
                }
              />

              Active

            </label>


            {/* AVAILABLE TO ALL */}

            <label>

              <input
                type="checkbox"
                checked={
                  form.available_to_all_users
                }
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,

                    available_to_all_users:
                      e.target.checked,
                  }))
                }
              />

              Available To All Users

            </label>


            {/* CAN PURCHASE */}

            <label>

              <input
                type="checkbox"
                checked={
                  form.can_be_purchased
                }
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,

                    can_be_purchased:
                      e.target.checked,
                  }))
                }
              />

              Can Be Purchased

            </label>

          </div>

        </section>


        {/* ====================================================
            FOOTER
        ==================================================== */}

        <div className="add-package-footer">


          <button
            type="button"
            className="package-cancel-button"
            onClick={() =>
              navigate("/packages")
            }
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

            {loading
              ? "Updating..."
              : "Update Package"}

          </button>

        </div>

      </form>

    </div>
  );
};


export default EditPackage;