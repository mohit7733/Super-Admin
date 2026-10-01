import React, { useEffect, useMemo, useState } from "react";
import {
  FaBoxOpen,
  FaSearch,
  FaFilter,
  FaChevronDown,
  FaChevronUp,
  FaEye,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaUsers,
  FaLock,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTag,
  FaGift,
  FaSyncAlt,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import BASE_URL from "../../../Base";
import "./packages.css";

const Package = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showFilters, setShowFilters] = useState(false);

  const [perPage, setPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);

  const [expandedId, setExpandedId] = useState(null);

  const [totalCount, setTotalCount] = useState(0);
 const navigate = useNavigate();
  // =========================================================
  // FETCH PACKAGES
  // =========================================================

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("superadmin_token");

      const response = await fetch(`${BASE_URL}/packages/admin/`, {
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
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to fetch packages."
        );
      }

      const packageData =
        result?.data?.results ||
        result?.data ||
        [];

      setPackages(Array.isArray(packageData) ? packageData : []);

      setTotalCount(
        Number(result?.data?.count || packageData.length || 0)
      );
    } catch (err) {
      console.error("Package API Error:", err);
      setError(
        err?.message || "Something went wrong while fetching packages."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // =========================================================
  // CATEGORY OPTIONS
  // =========================================================

  const categoryOptions = useMemo(() => {
    const categories = packages
      .map(
        (item) =>
          item?.category_name ||
          item?.category_details?.name
      )
      .filter(Boolean);

    return [...new Set(categories)];
  }, [packages]);

  

  const activeCount = useMemo(() => {
    return packages.filter((item) => item?.is_active === true).length;
  }, [packages]);

  const inactiveCount = useMemo(() => {
    return packages.filter((item) => item?.is_active === false).length;
  }, [packages]);

 

  const filteredPackages = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return packages.filter((item) => {
      const packageName = item?.name?.toLowerCase() || "";

      const category =
        (
          item?.category_name ||
          item?.category_details?.name ||
          ""
        ).toLowerCase();

      const tags = Array.isArray(item?.tags)
        ? item.tags.join(" ").toLowerCase()
        : "";

      const description =
        item?.description?.toLowerCase() || "";

      const matchesSearch =
        !search ||
        packageName.includes(search) ||
        category.includes(search) ||
        tags.includes(search) ||
        description.includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && item?.is_active === true) ||
        (statusFilter === "inactive" && item?.is_active === false);

      const itemCategory =
        item?.category_name ||
        item?.category_details?.name ||
        "";

      const matchesCategory =
        categoryFilter === "all" ||
        itemCategory === categoryFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    packages,
    searchTerm,
    statusFilter,
    categoryFilter,
  ]);

  
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPackages.length / perPage)
  );

  const visiblePackages = useMemo(() => {
    const start = (currentPage - 1) * perPage;

    return filteredPackages.slice(
      start,
      start + perPage
    );
  }, [
    filteredPackages,
    currentPage,
    perPage,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    categoryFilter,
    perPage,
  ]);

 

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setCurrentPage(1);
  };

  const formatPrice = (price) => {
    if (
      price === null ||
      price === undefined ||
      price === ""
    ) {
      return "₹0.00";
    }

    const number = Number(price);

    if (Number.isNaN(number)) {
      return `₹${price}`;
    }

    return `₹${number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPurchaseType = (value) => {
    if (!value) return "-";

    if (value === "open_plan") {
      return "Open Plan";
    }

    if (value === "prepaid_package") {
      return "Prepaid Package";
    }

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatBillingMode = (value) => {
    if (!value) return "-";

    if (value === "one_time") {
      return "One Time";
    }

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const formatValidity = (days) => {
    if (
      days === null ||
      days === undefined ||
      days === ""
    ) {
      return "No Expiry";
    }

    return `${days} Days`;
  };


  

  const toggleDetails = (id) => {
    setExpandedId((prev) =>
      prev === id ? null : id
    );
  };

 

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return (
      <div className="package-pagination">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((prev) => prev - 1)
          }
        >
          ‹
        </button>

        {pages.map((page) => (
          <button
            type="button"
            key={page}
            className={
              currentPage === page
                ? "pagination-active"
                : ""
            }
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((prev) => prev + 1)
          }
        >
          ›
        </button>
      </div>
    );
  };

  const PackageCard = ({ item }) => {
    const isExpanded = expandedId === item.id;

    const category =
      item?.category_name ||
      item?.category_details?.name ||
      "Package";

    const benefits =
      item?.benefits?.includes || [];

    const configuration =
      item?.configuration || [];

    return (
      <article
        className={`package-card ${
          isExpanded
            ? "package-card-expanded"
            : ""
        }`}
      >
        {/* GREEN TOP LINE */}
        <div className="package-card-accent" />

        {/* HEADER */}
        <div className="package-card-header">
          <div className="package-icon">
            <FaBoxOpen />
          </div>

          <div className="package-name-area">
            <h3 title={item?.name}>
              {item?.name || "Unnamed Package"}
            </h3>

            <span
              className="package-category"
              title={category}
            >
              {category}
            </span>

            <span
              className={`package-status ${
                item?.is_active
                  ? "status-active"
                  : "status-inactive"
              }`}
            >
              <span className="status-dot" />

              {item?.is_active
                ? "Active"
                : "Inactive"}
            </span>
          </div>

          {/* ACTIONS */}
          <div className="package-card-actions">
            <button
              type="button"
              className="card-action view-action"
              title="View Details"
              onClick={() =>
                toggleDetails(item.id)
              }
            >
              <FaEye />
            </button>

            <button
              type="button"
              className="card-action edit-action"
              title="Edit Package"
              onClick={() =>
                console.log(
                  "Edit Package:",
                  item.id
                )
              }
            >
              <FaEdit />
            </button>

            <button
              type="button"
              className="card-action delete-action"
              title="Delete Package"
              onClick={() =>
                console.log(
                  "Delete Package:",
                  item.id
                )
              }
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {/* PRICE */}
        <div className="package-price-section">
          <div>
            <span className="price-label">
              Selling Price
            </span>

            <strong className="package-price">
              {formatPrice(item?.selling_price)}
            </strong>
          </div>

          <span className="purchase-type-badge">
            {formatPurchaseType(
              item?.purchase_type
            )}
          </span>
        </div>

        {/* BASIC INFORMATION */}
        <div className="package-info-grid">
          <div className="package-info-box">
            <div className="package-info-icon">
              <FaLock />
            </div>

            <div>
              <span>Purchase Type</span>

              <strong>
                {formatPurchaseType(
                  item?.purchase_type
                )}
              </strong>
            </div>
          </div>

          <div className="package-info-box">
            <div className="package-info-icon">
              <FaClock />
            </div>

            <div>
              <span>Billing Mode</span>

              <strong>
                {formatBillingMode(
                  item?.billing_mode
                )}
              </strong>
            </div>
          </div>

          <div className="package-info-box">
            <div className="package-info-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <span>Validity</span>

              <strong>
                {formatValidity(
                  item?.validity_days
                )}
              </strong>
            </div>
          </div>

          <div className="package-info-box">
            <div className="package-info-icon">
              <FaUsers />
            </div>

            <div>
              <span>Original Price</span>

              {/* <strong>
                {formatAvailability(item)}
              </strong> */}
            </div>
          </div>
        </div>

        {/* TAGS */}
        <div className="package-tags-section">
          <div className="tags-title">
            <FaTag />
            <span>Tags</span>
          </div>

          <div className="package-tags">
            {Array.isArray(item?.tags) &&
            item.tags.length > 0 ? (
              item.tags.map((tag, index) => (
                <span
                  className="package-tag"
                  key={`${tag}-${index}`}
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="no-tags">
                No tags
              </span>
            )}
          </div>
        </div>

        {/* VIEW DETAILS BUTTON */}
        <button
          type="button"
          className={`view-details-button ${
            isExpanded
              ? "view-details-open"
              : ""
          }`}
          onClick={() =>
            toggleDetails(item.id)
          }
        >
          <FaEye />

          <span>
            {isExpanded
              ? "Hide Details"
              : "View Details"}
          </span>

          {isExpanded ? (
            <FaChevronUp />
          ) : (
            <FaChevronDown />
          )}
        </button>

        {/* ===================================================
            EXPANDED DETAILS
        =================================================== */}

        {isExpanded && (
          <div className="package-expanded-details">
            {/* DESCRIPTION */}
            <div className="expanded-block">
              <div className="expanded-heading">
                <div className="expanded-heading-icon">
                  <FaBoxOpen />
                </div>

                <div>
                  <h4>Description</h4>

                  <span>
                    Package information
                  </span>
                </div>
              </div>

              <p className="package-description">
                {item?.description ||
                  "No description available."}
              </p>
            </div>

            {/* PACKAGE DETAILS */}
            <div className="expanded-block">
              <div className="expanded-heading">
                <div className="expanded-heading-icon">
                  <FaGift />
                </div>

                <div>
                  <h4>Package Details</h4>

                  <span>
                    Configuration information
                  </span>
                </div>
              </div>

              <div className="detail-grid">
                <div>
                  <span>Original Price</span>

                  <strong>
                    {formatPrice(
                      item?.original_price
                    )}
                  </strong>
                </div>

                <div>
                  <span>Selling Price</span>

                  <strong>
                    {formatPrice(
                      item?.selling_price
                    )}
                  </strong>
                </div>

                <div>
                  <span>Button Action</span>

                  <strong>
                    {item?.button_action
                      ? item.button_action
                          .replaceAll("_", " ")
                          .replace(
                            /\b\w/g,
                            (char) =>
                              char.toUpperCase()
                          )
                      : "-"}
                  </strong>
                </div>

                <div>
                  <span>Available To</span>

                  {/* <strong>
                    {formatAvailability(item)}
                  </strong> */}
                </div>

                <div>
                  <span>Sequence</span>

                  <strong>
                    {item?.sequence ?? "-"}
                  </strong>
                </div>

                <div>
                  <span>Can Be Purchased</span>

                  <strong>
                    {item?.can_be_purchased
                      ? "Yes"
                      : "No"}
                  </strong>
                </div>
              </div>
            </div>

            {/* BENEFITS */}
            <div className="expanded-block">
              <div className="expanded-heading">
                <div className="expanded-heading-icon benefit-icon">
                  <FaCheckCircle />
                </div>

                <div>
                  <h4>Benefits</h4>

                  <span>
                    What's included
                  </span>
                </div>
              </div>

              {benefits.length > 0 ? (
                <div className="benefits-list">
                  {benefits.map(
                    (benefit, index) => (
                      <div
                        className="benefit-row"
                        key={index}
                      >
                        <FaCheck />

                        <span>
                          {benefit}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="detail-empty">
                  No benefits available.
                </div>
              )}
            </div>

            {/* CONFIGURATION */}
            <div className="expanded-block">
              <div className="expanded-heading">
                <div className="expanded-heading-icon">
                  <FaBoxOpen />
                </div>

                <div>
                  <h4>Configuration</h4>

                  <span>
                    Package capabilities
                  </span>
                </div>
              </div>

              {configuration.length > 0 ? (
                <div className="configuration-list">
                  {configuration.map(
                    (config, index) => (
                      <div
                        className="configuration-row"
                        key={
                          config?.capability_id ||
                          index
                        }
                      >
                        <div className="configuration-left">
                          <strong>
                            {config?.label ||
                              config?.name ||
                              "Capability"}
                          </strong>

                          <span>
                            Type:{" "}
                            {config?.type ||
                              "-"}
                          </span>
                        </div>

                        <div>
                          {config?.type ===
                          "consumable" ? (
                            <span className="config-count">
                              ×{" "}
                              {config?.count ??
                                0}
                            </span>
                          ) : config?.included ? (
                            <span className="config-included">
                              <FaCheck />
                              Included
                            </span>
                          ) : (
                            <span className="config-not-included">
                              <FaTimesCircle />
                              Not Included
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="detail-empty">
                  No configuration available.
                </div>
              )}
            </div>
          </div>
        )}
      </article>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && packages.length === 0) {
    return (
      <div className="package-page">
        <div className="package-loading-wrapper">
          <div className="package-loader">
            <FaSyncAlt />
          </div>

          <h3>Loading Packages...</h3>

          <p>
            Please wait while we fetch package
            information.
          </p>
        </div>
      </div>
    );
  }

  

  return (
    <div className="package-page">
     
      <div className="package-page-header">
        <div className="package-heading">
          

          <div>
            <h1>Package Management</h1>

            <p>
              Create, manage and configure
              packages, plans and offers.
            </p>
          </div>
        </div>

        <div className="package-header-tools">
          
          <button
    type="button"
    className="package-add-button"
    onClick={() => navigate("/packages/add")}
  >
    <span>+</span>
    Add Package
  </button>
          <div className="package-search-box">
            <FaSearch />

            <input
              type="text"
              placeholder="Search package, category or tag..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* FILTER */}
          <button
            type="button"
            className={`package-filter-button ${
              showFilters
                ? "package-filter-button-active"
                : ""
            }`}
            onClick={() =>
              setShowFilters((prev) => !prev)
            }
          >
            <FaFilter />

            <span>Show Filters</span>

            {showFilters ? (
              <FaChevronUp />
            ) : (
              <FaChevronDown />
            )}
          </button>
        </div>
      </div>

     
      {showFilters && (
        <div className="package-filter-wrapper">
          <div className="package-filter-item">
            <label>Status</label>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>
          </div>

          <div className="package-filter-item">
            <label>Category</label>

            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value
                )
              }
            >
              <option value="all">
                All Categories
              </option>

              {categoryOptions.map(
                (category) => (
                  <option
                    value={category}
                    key={category}
                  >
                    {category}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="button"
            className="package-clear-filter"
            onClick={clearFilters}
          >
            <FaTimes />

            Clear Filters
          </button>
        </div>
      )}

      
      <div className="package-summary">
        <div className="package-summary-left">
          {/* <div className="package-summary-icon">
            <FaBoxOpen />
          </div> */}

          <div>
            <span>Packages</span>

            <strong>
              {filteredPackages.length}
            </strong>
          </div>
        </div>

        <div className="package-summary-right">
          <div className="summary-status active-status">
            <FaCheckCircle />

            <strong>
              Active {activeCount}
            </strong>
          </div>

          <div className="summary-status inactive-status">
            <FaTimesCircle />

            <strong>
              Inactive {inactiveCount}
            </strong>
          </div>

          <div className="summary-divider" />

          <div className="package-per-page">
            <span>Per page</span>

            <select
              value={perPage}
              onChange={(e) =>
                setPerPage(
                  Number(e.target.value)
                )
              }
            >
              <option value={3}>3</option>
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
            </select>
          </div>

          <button
            type="button"
            className="package-refresh-button"
            onClick={fetchPackages}
            disabled={loading}
            title="Refresh"
          >
            <FaSyncAlt
              className={
                loading
                  ? "package-refresh-spin"
                  : ""
              }
            />
          </button>
        </div>
      </div>

     
      {error && (
        <div className="package-error">
          <FaExclamationTriangle />

          <div>
            <strong>
              Unable to load packages
            </strong>

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={fetchPackages}
          >
            Retry
          </button>
        </div>
      )}

     
      {visiblePackages.length > 0 ? (
        <>
          <div className="package-grid">
            {visiblePackages.map((item) => (
              <PackageCard
                key={item.id}
                item={item}
              />
            ))}
          </div>

          {renderPagination()}
        </>
      ) : (
        <div className="package-empty-state">
          <div className="empty-icon">
            <FaBoxOpen />
          </div>

          <h3>No Packages Found</h3>

          <p>
            No packages match your current
            search or filter.
          </p>

          <button
            type="button"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Package;