
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
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
  benefit_id: "",
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
// COMPONENT
// ============================================================

const EditPackage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

const [benefitDropdownOpen, setBenefitDropdownOpen] =
  useState(false);
  // ============================================================
  // STATES
  // ============================================================

  const [categories, setCategories] = useState([]);
  const [benefits, setBenefits] = useState([]);

  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [benefitLoading, setBenefitLoading] = useState(false);
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
  // HEADERS
  // ============================================================

  const getHeaders = () => {
    const token = sessionStorage.getItem("superadmin_token");

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
          result?.message || "Failed to load package categories."
        );
      }

      const categoryData =
        result?.data?.results ||
        result?.data ||
        result?.results ||
        [];

      const normalizedCategories = Array.isArray(categoryData)
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
            .filter((item) => item.id && item.name)
        : [];

      setCategories(normalizedCategories);
    } catch (err) {
      console.error("Category Error:", err);
      setCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  };

  // ============================================================
  // FETCH BENEFITS
  // ============================================================

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

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to load benefits."
        );
      }

      const benefitData =
        result?.data?.results ||
        result?.data ||
        result?.results ||
        [];

      const normalizedBenefits = Array.isArray(benefitData)
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

              type:
                item?.fulfillment_mode ||
                item?.type ||
                item?.benefit_type ||
                "flag",

              fulfillment_mode:
                item?.fulfillment_mode ||
                item?.type ||
                "flag",

              unit:
                item?.unit ||
                "none",

              description:
                item?.description ||
                "",

              tags: Array.isArray(item?.tags)
                ? item.tags
                : [],

              match_rules:
                item?.match_rules ||
                {
                  is_followup: false,
                  is_dietitian: false,
                },

              default_extra_details:
                item?.default_extra_details ||
                {},
            }))
            .filter((item) => item.id && item.name)
        : [];

      setBenefits(normalizedBenefits);

      return normalizedBenefits;
    } catch (err) {
      console.error("Benefit Error:", err);

      setBenefits([]);

      throw err;
    } finally {
      setBenefitLoading(false);
    }
  };

  // ============================================================
  // NORMALIZE EXISTING CONFIGURATION
  // ============================================================

  const normalizeConfiguration = (
    configuration,
    benefitList
  ) => {
    if (!Array.isArray(configuration)) {
      return [];
    }

    return configuration.map((config) => {
      const existingBenefitId =
        config?.benefit_id ||
        config?.name ||
        "";

      const benefit =
        benefitList.find(
          (item) =>
            String(item.id) ===
            String(existingBenefitId)
        );

      const benefitId =
        benefit?.id ||
        existingBenefitId ||
        "";

      const benefitType =
        benefit?.fulfillment_mode ||
        benefit?.type ||
        config?.type ||
        "flag";

      const eligibleAfterDays =
        config?.eligible_after_days ??
        benefit?.default_extra_details
          ?.eligible_after_days ??
        "";

      const requiresCompletedCapability =
        config?.requires_completed_capability ??
        benefit?.default_extra_details
          ?.requires_completed_capability ??
        "";

      return {
        benefit_id: benefitId,

        name: benefitId,

        label:
          benefit?.label ||
          config?.label ||
          benefit?.name ||
          "",

        type: benefitType,

        count:
          config?.count ??
          "",

        tags: Array.isArray(config?.tags)
          ? config.tags
          : [],

        tagInput: "",

        match_rules:
          benefit?.match_rules ||
          config?.match_rules ||
          {
            is_followup: false,
            is_dietitian: false,
          },

        eligible_after_days:
          eligibleAfterDays,

        requires_completed_capability:
          requiresCompletedCapability,
      };
    });
  };

  // ============================================================
  // FETCH PACKAGE
  // ============================================================

  const fetchPackage = async (
    benefitList = []
  ) => {
    try {
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
      // CONFIGURATION
      // --------------------------------------------------------

      const normalizedConfiguration =
        normalizeConfiguration(
          packageData?.configuration,
          benefitList
        );

      // --------------------------------------------------------
      // FORM
      // --------------------------------------------------------

      setForm({
        name:
          packageData?.name ||
          "",

        description:
          packageData?.description ||
          "",

        category:
          categoryId ||
          "",

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
          normalizedConfiguration,
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

      throw err;
    }
  };

  // ============================================================
  // LOAD EVERYTHING
  // ============================================================

  useEffect(() => {
    const loadEditData = async () => {
      if (!id) {
        setError("Invalid package ID.");
        setFetchingPackage(false);
        return;
      }

      try {
        setFetchingPackage(true);
        setError("");

        const benefitList =
          await fetchBenefits();

        await fetchCategories();

        await fetchPackage(
          benefitList
        );
      } catch (err) {
        console.error(
          "Edit Package Load Error:",
          err
        );

        setError(
          err?.message ||
            "Failed to load package data."
        );
      } finally {
        setFetchingPackage(false);
      }
    };

    loadEditData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ============================================================
  // BASIC CHANGE
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
  // SELECT BENEFIT FROM DROPDOWN
  // ============================================================

  const handleBenefitChange = (
    index,
    benefitId
  ) => {
    const selectedBenefit =
      benefits.find(
        (benefit) =>
          String(benefit.id) ===
          String(benefitId)
      );

    if (!selectedBenefit) {
      return;
    }

    setForm((prev) => ({
      ...prev,

      configuration:
        prev.configuration.map(
          (config, i) => {
            if (i !== index) {
              return config;
            }

            const benefitType =
              selectedBenefit.fulfillment_mode ||
              selectedBenefit.type ||
              "flag";

            /*
             * Keep the existing count when the
             * selected benefit is consumable.
             *
             * If the previous benefit was not
             * consumable, default count to 1.
             */
            const nextCount =
              benefitType ===
                "consumable" ||
              benefitType === "chat_pool"
                ? config.count || 1
                : "";

            return {
              ...config,

              benefit_id:
                selectedBenefit.id,

              /*
               * Backend expects Benefit UUID
               * inside configuration.name.
               */
              name:
                selectedBenefit.id,

              /*
               * Label comes from Benefit API.
               */
              label:
                selectedBenefit.label ||
                selectedBenefit.name ||
                "",

              /*
               * Type comes from Benefit API.
               */
              type:
                benefitType,

              count:
                nextCount,

              /*
               * Match rules ALWAYS come
               * from Benefit API.
               */
              match_rules:
                selectedBenefit.match_rules ||
                {
                  is_followup: false,
                  is_dietitian: false,
                },

              /*
               * Benefit master tags can be
               * used as the initial tags only
               * when changing the benefit.
               */
              tags:
                Array.isArray(
                  selectedBenefit.tags
                )
                  ? selectedBenefit.tags
                  : [],

              tagInput: "",

              /*
               * Keep package-level editable
               * fields unchanged.
               */
              eligible_after_days:
                config.eligible_after_days ??
                "",

              requires_completed_capability:
                config.requires_completed_capability ??
                "",
            };
          }
        ),
    }));
  };

  // ============================================================
  // PACKAGE CONFIGURATION TAGS
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

      addConfigurationTag(
        index
      );
    }
  };

  // ============================================================
  // NO FRONTEND VALIDATION IN EDIT MODE
  // ============================================================

  /*
   * IMPORTANT:
   *
   * Edit mode does NOT validate the form before PUT.
   *
   * The API/backend is responsible for validation.
   */

  // ============================================================
  // BUILD CONFIGURATION PAYLOAD
  // ============================================================

  const buildConfiguration = () => {
    return form.configuration.map(
      (config) => {
        /*
         * name = Benefit UUID
         * label = Benefit/customer label
         * type = Benefit API type
         */

        const cleanConfig = {
          name:
            config?.name
              ? String(config.name).trim()
              : "",

          label:
            config?.label
              ? String(config.label).trim()
              : "",

          type:
            config?.type ||
            "flag",
        };

        // ------------------------------------------------------
        // COUNT
        // ------------------------------------------------------

        if (
          config?.type ===
            "consumable" ||
          config?.type === "chat_pool"
        ) {
          if (
            config?.count !== "" &&
            config?.count !== null &&
            config?.count !== undefined
          ) {
            cleanConfig.count =
              Number(config.count);
          }
        }

        // ------------------------------------------------------
        // TAGS
        // ------------------------------------------------------

        if (
          Array.isArray(
            config?.tags
          ) &&
          config.tags.length > 0
        ) {
          cleanConfig.tags =
            config.tags;
        }

        // ------------------------------------------------------
        // MATCH RULES
        // ------------------------------------------------------

        if (
          config?.match_rules &&
          typeof config.match_rules ===
            "object" &&
          !Array.isArray(
            config.match_rules
          )
        ) {
          cleanConfig.match_rules = {
            ...config.match_rules,
          };
        }

        // ------------------------------------------------------
        // ELIGIBLE AFTER DAYS
        // ------------------------------------------------------

        if (
          config?.eligible_after_days !==
            "" &&
          config?.eligible_after_days !==
            null &&
          config?.eligible_after_days !==
            undefined
        ) {
          cleanConfig.eligible_after_days =
            Number(
              config.eligible_after_days
            );
        }

        // ------------------------------------------------------
        // REQUIRED COMPLETED CAPABILITY
        // ------------------------------------------------------

        if (
          config?.requires_completed_capability &&
          String(
            config.requires_completed_capability
          ).trim()
        ) {
          cleanConfig.requires_completed_capability =
            String(
              config.requires_completed_capability
            ).trim();
        }

        return cleanConfig;
      }
    );
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    /*
     * NO FRONTEND VALIDATION HERE.
     *
     * Directly build the payload and send it
     * to the backend.
     */

    try {
      setLoading(true);

      const configuration =
        buildConfiguration();

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
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      const response =
        await fetch(
          `${BASE_URL}/packages/admin/?id=${id}`,
          {
            method: "PUT",

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
            Please wait while we
            fetch package
            information.
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
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
              Update and configure
              your package details.
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
        onSubmit={
          handleSubmit
        }
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
              Update the basic
              package information.
            </p>
          </div>

          <div className="add-form-grid basic-details-grid">

            {/* PACKAGE NAME */}

            <div className="add-form-group full-width-field">
              <label>
                Package Name *
              </label>

              <input
                type="text"
                name="name"
                value={
                  form.name
                }
                onChange={
                  handleChange
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
                name="description"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
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
                onChange={
                  handleChange
                }
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
                onChange={
                  handleChange
                }
                placeholder="0.00"
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
              Configure how and when
              the customer will be
              charged.
            </p>
          </div>

          <div className="add-form-grid">

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
                      (prev) =>
                        !prev
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
                          Choose how the
                          customer pays
                        </strong>

                        <span>
                          One Time means
                          one payment.
                          Autopay means
                          recurring
                          automatic
                          payments.
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
                          Customer pays
                          once. No
                          recurring
                          payment will
                          be made.
                        </span>

                        <small>
                          Example:
                          ₹2,000 package
                          → customer
                          pays ₹2,000
                          only once.
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
                    onChange={
                      handleChange
                    }
                  >
                    <option value="">
                      Select Billing
                      Period
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
                    onChange={
                      handleChange
                    }
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
                    onChange={
                      handleChange
                    }
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
                    onChange={
                      handleChange
                    }
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
                  onChange={
                    handleChange
                  }
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
        Select and update the
        benefits included in
        this package.
      </p>
    </div>
  </div>

  {/* ==================================================
      BENEFIT MULTI SELECT DROPDOWN
      ONLY THIS PART IS NEW
  ================================================== */}

  <div className="add-form-group full-width">
    <label>
      Select Benefits
    </label>

    <div className="benefit-multiselect">

      <button
        type="button"
        className="benefit-select-button"
        onClick={() =>
          setBenefitDropdownOpen(
            (prev) => !prev
          )
        }
      >
        <div className="selected-benefits-display">
  {form.configuration.length === 0 ? (
    <span className="benefit-placeholder">
      Select Benefits
    </span>
  ) : (
    form.configuration.map((config, index) => (
      <span
        className="selected-benefit-chip"
        key={`${config.benefit_id || config.name}-${index}`}
      >
        <span className="selected-benefit-name">
          {config.label || config.name || "Benefit"}
        </span>

        <button
          type="button"
          className="selected-benefit-remove"
          onClick={(e) => {
            e.stopPropagation();

            setForm((prev) => ({
              ...prev,
              configuration:
                prev.configuration.filter(
                  (_, i) => i !== index
                ),
            }));
          }}
        >
          ×
        </button>
      </span>
    ))
  )}
</div>

        <FaChevronDown
          className={
            benefitDropdownOpen
              ? "rotate-chevron"
              : ""
          }
        />
      </button>

      {benefitDropdownOpen && (
        <div className="benefit-dropdown-menu">

          {benefitLoading ? (
            <div className="benefit-dropdown-loading">
              Loading Benefits...
            </div>
          ) : benefits.length === 0 ? (
            <div className="benefit-dropdown-empty">
              No Benefits Found
            </div>
          ) : (
            benefits.map((benefit) => {

              const isSelected =
                form.configuration.some(
                  (config) =>
                    String(
                      config.benefit_id ||
                        config.name
                    ) ===
                    String(benefit.id)
                );

              return (
                <label
                  key={benefit.id}
                  className={`benefit-option ${
                    isSelected
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {

                      /* ==========================
                         REMOVE BENEFIT
                      ========================== */

                      if (isSelected) {
                        setForm((prev) => ({
                          ...prev,

                          configuration:
                            prev.configuration.filter(
                              (config) =>
                                String(
                                  config.benefit_id ||
                                    config.name
                                ) !==
                                String(
                                  benefit.id
                                )
                            ),
                        }));

                        return;
                      }

                      /* ==========================
                         ADD BENEFIT
                      ========================== */

                      const type =
                        benefit.fulfillment_mode ||
                        benefit.type ||
                        benefit.benefit_type ||
                        "flag";

                      const newConfiguration = {
                        benefit_id:
                          benefit.id,

                        /*
                          Backend expects UUID
                          in configuration.name
                        */
                        name: benefit.id,

                        label:
                          benefit.label ||
                          benefit.name ||
                          benefit.benefit_name ||
                          benefit.title ||
                          "",

                        type: type,

                        fulfillment_mode:
                          benefit.fulfillment_mode ||
                          type,

                        count:
                          type ===
                            "consumable" ||
                          type ===
                            "chat_pool"
                            ? 1
                            : "",

                        tags:
                          Array.isArray(
                            benefit.tags
                          )
                            ? benefit.tags
                            : [],

                        match_rules:
                          benefit.match_rules || {
                            is_followup: false,
                            is_dietitian: false,
                          },

                        eligible_after_days:
                          benefit.eligible_after_days ??
                          benefit
                            .default_extra_details
                            ?.eligible_after_days ??
                          "",

                        requires_completed_capability:
                          benefit
                            .requires_completed_capability ??
                          benefit
                            .default_extra_details
                            ?.requires_completed_capability ??
                          "",
                      };

                      setForm((prev) => ({
                        ...prev,

                        configuration: [
                          ...prev.configuration,
                          newConfiguration,
                        ],
                      }));
                    }}
                  />

                  <span className="benefit-option-text">
                    {benefit.label ||
                      benefit.name ||
                      benefit.benefit_name ||
                      benefit.title}
                  </span>
                </label>
              );
            })
          )}

        </div>
      )}
    </div>

    <div className="benefit-field-help">
      <small>
        Select multiple benefits from
        the Benefit master.
      </small>
    </div>
  </div>

 
  {form.configuration.length === 0 ? (

    <div className="configuration-empty">

      <h3>
        No Benefits Added
      </h3>

      <p>
        No benefit configuration
        is available for this
        package.
      </p>

    </div>

  ) : (

    <div className="configuration-list">

      {form.configuration.map(
        (config, index) => (

          <div
            className="configuration-card"
            key={`${
              config.benefit_id ||
              config.name ||
              "benefit"
            }-${index}`}
          >

            {/* ================================
                BENEFIT HEADER
            ================================= */}

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


            {/* ================================
                BASIC BENEFIT
            ================================= */}

            <div className="add-form-grid">

              {/* BENEFIT ID */}

              {/* <div className="add-form-group">

                <label>
                  Benefit ID
                </label>

                <input
                  type="text"
                  value={
                    config.benefit_id ||
                    config.name ||
                    ""
                  }
                  readOnly
                  disabled
                />

                <div className="benefit-field-help">
                  <small>
                    Benefit ID is
                    automatically
                    taken from
                    the selected
                    Benefit.
                  </small>
                </div>

              </div> */}


              {/* LABEL */}

              <div className="add-form-group">

                <label>
                  Customer Label
                </label>

                <input
                  type="text"
                  value={
                    config.label || ""
                  }
                  onChange={(e) =>
                    updateConfiguration(
                      index,
                      "label",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 1 Diet Follow-up"
                />

                <div className="benefit-field-help">
                  <small>
                    This is the
                    label shown
                    to the
                    customer.
                  </small>
                </div>

              </div>


              {/* TYPE */}

              <div className="add-form-group">

                <label>
                  Benefit Type
                </label>

                <input
                  type="text"
                  value={
                    config.type || ""
                  }
                  readOnly
                  disabled
                />

                <div className="benefit-field-help">
                  <small>
                    Benefit type
                    comes from
                    the Benefit
                    API.
                  </small>
                </div>

              </div>


              {/* COUNT */}

              {(config.type ===
                "consumable" ||
                config.type ===
                  "chat_pool") && (

                <div className="add-form-group">

                  <label>
                    Count
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      config.count ?? ""
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
                      You can edit
                      how many
                      times the
                      customer can
                      use this
                      benefit.
                    </small>
                  </div>

                </div>
              )}

            </div>


            {/* ==================================
                ELIGIBILITY
            ================================== */}

            <div className="add-form-grid">

             

              <div className="add-form-group">

                <label>
                  Eligible After
                  Days
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    config.eligible_after_days ??
                    ""
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
                    available
                    after this
                    many days.
                  </small>
                </div>

              </div>


              <div className="add-form-group">

                <label>
                  Requires Completed
                  Benefit
                </label>

                <input
                  type="text"
                  value={
                    config
                      .requires_completed_capability ||
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
                    Enter the
                    benefit that
                    must be
                    completed
                    before this
                    benefit becomes
                    available.
                  </small>
                </div>

              </div>

            </div>


            {/* ==================================
                MATCH RULES
            ================================== */}

            <div className="match-rules-box">

              <div className="match-rules-header">

                <div>

                  <h4>
                    Match Rules
                  </h4>

                  <p>
                    These values
                    come directly
                    from the
                    selected
                    Benefit and
                    cannot be
                    changed while
                    editing the
                    package.
                  </p>

                </div>

              </div>


              <div className="add-form-grid">

                {/* FOLLOW UP */}

                <div className="add-form-group">

                  <label>
                    Is Follow-up?
                  </label>

                  <input
                    type="text"
                    value={
                      config
                        .match_rules
                        ?.is_followup
                        ? "Yes"
                        : "No"
                    }
                    readOnly
                    disabled
                  />

                  <div className="benefit-field-help">
                    <small>
                      This value is
                      controlled by
                      the Benefit
                      master.
                    </small>
                  </div>

                </div>


                {/* DIETITIAN */}

                <div className="add-form-group">

                  <label>
                    Is Dietitian?
                  </label>

                  <input
                    type="text"
                    value={
                      config
                        .match_rules
                        ?.is_dietitian
                        ? "Yes"
                        : "No"
                    }
                    readOnly
                    disabled
                  />

                  <div className="benefit-field-help">
                    <small>
                      This value is
                      controlled by
                      the Benefit
                      master.
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
              Control package
              availability.
            </p>
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

