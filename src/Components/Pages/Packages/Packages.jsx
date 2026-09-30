import React, { useEffect, useMemo, useState } from "react";
import {
  FaBoxOpen,
  FaEye,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaTag,
  FaClock,
  FaShoppingBag,
  FaSearch,
  FaFilter,
  FaTimes,
  FaCalendarAlt,
  FaUsers,
  FaRupeeSign,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import BASE_URL from "../../../Base";
import "./packages.css";

const Package = () => {
  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* Search */
  const [searchTerm, setSearchTerm] = useState("");

  /* Filters */
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  /* Pagination */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalCount, setTotalCount] = useState(0);

  /* Details */
  const [expandedId, setExpandedId] = useState(null);

  /* Delete */
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = sessionStorage.getItem("superadmin_token");

  /* =========================================================
     FETCH PACKAGES
  ========================================================= */

  const fetchPackages = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const params = new URLSearchParams();

      params.append("page", currentPage);
      params.append("page_size", pageSize);

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      const response = await fetch(
        `${BASE_URL}/packages/admin/?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        throw new Error("Session expired. Please login again.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to fetch packages."
        );
      }

      if (data?.success) {
        const packageData = data?.data || {};

        setPackages(packageData?.results || []);
        setTotalCount(Number(packageData?.count || 0));
      } else {
        throw new Error(
          data?.message || "Unable to fetch packages."
        );
      }
    } catch (err) {
      console.error("Package Fetch Error:", err);

      setError(
        err?.message || "Something went wrong while fetching packages."
      );

      setPackages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     FETCH ON PAGE / PAGE SIZE
  ========================================================= */

  useEffect(() => {
    fetchPackages(true);
  }, [currentPage, pageSize]);

  /* =========================================================
     SEARCH DEBOUNCE
  ========================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);

      fetchPackages(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* =========================================================
     CATEGORY OPTIONS
  ========================================================= */

  const categories = useMemo(() => {
    const map = new Map();

    packages.forEach((item) => {
      const id = item?.category;

      const name =
        item?.category_name ||
        item?.category_details?.name ||
        "Uncategorized";

      if (id && !map.has(id)) {
        map.set(id, name);
      }
    });

    return Array.from(map.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }, [packages]);

  /* =========================================================
     FILTERED PACKAGES
  ========================================================= */

  const filteredPackages = useMemo(() => {
    return packages.filter((item) => {
      const statusMatch =
        statusFilter === "all" ||
        (statusFilter === "active" && item?.is_active === true) ||
        (statusFilter === "inactive" && item?.is_active === false);

      const categoryMatch =
        categoryFilter === "all" ||
        item?.category === categoryFilter;

      return statusMatch && categoryMatch;
    });
  }, [packages, statusFilter, categoryFilter]);

  /* =========================================================
     STATS
  ========================================================= */

  const activeCount = packages.filter(
    (item) => item?.is_active === true
  ).length;

  const inactiveCount = packages.filter(
    (item) => item?.is_active === false
  ).length;

  /* =========================================================
     HELPERS
  ========================================================= */

  const formatText = (value) => {
    if (!value) return "-";

    return String(value)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatPrice = (price) => {
    if (
      price === null ||
      price === undefined ||
      price === ""
    ) {
      return "₹0.00";
    }

    return `₹${Number(price).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getValidity = (days) => {
    if (!days) return "No expiry";

    return `${days} Days`;
  };

  /* =========================================================
     VIEW DETAILS
  ========================================================= */

  const toggleDetails = (id) => {
    setExpandedId((prev) =>
      prev === id ? null : id
    );
  };

  /* =========================================================
     CLEAR FILTERS
  ========================================================= */

  const clearFilters = () => {
    setStatusFilter("all");
    setCategoryFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
    setExpandedId(null);
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleteLoading(true);

      /*
        NOTE:
        This assumes DELETE endpoint:

        DELETE /packages/admin/{id}/

        If your backend uses:
        /packages/admin/?id={id}

        then only change the URL below.
      */

      const response = await fetch(
        `${BASE_URL}/packages/admin/${deleteId}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to delete package."
        );
      }

      setDeleteId(null);
      setExpandedId(null);

      await fetchPackages(false);
    } catch (err) {
      console.error("Delete Package Error:", err);

      alert(
        err?.message || "Unable to delete package."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.ceil(
    totalCount / pageSize
  );

  const pageNumbers = [];

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="package-page">
        <div className="package-loading-wrapper">
          <div className="package-loader">
            <FiRefreshCw />
          </div>

          <h3>Loading Packages</h3>

          <p>
            Please wait while we load your packages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="package-page">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="package-page-header">

        <div className="package-heading">

          <div className="package-heading-icon">
            <FaBoxOpen />
          </div>

          <div>
            <h1>Package Management</h1>

            <p>
              Create, manage and configure packages,
              plans and offers.
            </p>
          </div>

        </div>

        <div className="package-header-tools">

          {/* Search */}

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
                onClick={() => setSearchTerm("")}
              >
                <FaTimes />
              </button>
            )}

          </div>

          {/* Filter */}

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

      {/* =====================================================
          FILTER PANEL
      ===================================================== */}

      {showFilters && (
        <div className="package-filter-wrapper">

          <div className="package-filter-item">

            <label>Status</label>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setExpandedId(null);
              }}
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
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setExpandedId(null);
              }}
            >
              <option value="all">
                All Categories
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
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

      {/* =====================================================
          SUMMARY BAR
      ===================================================== */}

      <div className="package-summary">

        <div className="package-summary-left">

          <div className="package-summary-icon">
            <FaBoxOpen />
          </div>

          <div>
            <span>Packages</span>

            <strong>
              {totalCount}
            </strong>
          </div>

        </div>

        <div className="package-summary-right">

          <div className="summary-status active-status">
            <FaCheckCircle />
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>

          <div className="summary-status inactive-status">
            <FaTimesCircle />
            <span>Inactive</span>
            <strong>{inactiveCount}</strong>
          </div>

          <div className="summary-divider"></div>

          <div className="package-per-page">

            <span>Per page</span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(
                  Number(e.target.value)
                );

                setCurrentPage(1);
              }}
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
            onClick={() =>
              fetchPackages(false)
            }
            disabled={refreshing}
            title="Refresh"
          >
            <FiRefreshCw
              className={
                refreshing
                  ? "package-refresh-spin"
                  : ""
              }
            />
          </button>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="package-error">

          <FaTimesCircle />

          <div>
            <strong>
              Unable to load packages
            </strong>

            <span>{error}</span>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchPackages(true)
            }
          >
            Try Again
          </button>

        </div>
      )}

      {/* =====================================================
          PACKAGE GRID
      ===================================================== */}

      {!error &&
      filteredPackages.length > 0 ? (
        <div className="package-grid">

          {filteredPackages.map((item) => {

            const isExpanded =
              expandedId === item.id;

            return (
              <div
                className={`package-card ${
                  isExpanded
                    ? "package-card-expanded"
                    : ""
                }`}
                key={item.id}
              >

                {/* Top accent */}

                <div className="package-card-accent"></div>

                {/* =================================================
                    CARD HEADER
                ================================================= */}

                <div className="package-card-header">

                  <div className="package-icon">

                    <FaBoxOpen />

                  </div>

                  <div className="package-name-area">

                    <h3 title={item.name}>
                      {item.name}
                    </h3>

                    <span className="package-category">
                      {item.category_name ||
                        item.category_details?.name ||
                        "Uncategorized"}
                    </span>

                    <span
                      className={`package-status ${
                        item.is_active
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      <span className="status-dot"></span>

                      {item.is_active
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                </div>

                {/* =================================================
                    ACTION BUTTONS
                ================================================= */}

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
                        item
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
                      setDeleteId(item.id)
                    }
                  >
                    <FaTrash />
                  </button>

                </div>

                {/* =================================================
                    PRICE
                ================================================= */}

                <div className="package-price-section">

                  <div>

                    <span className="price-label">
                      Selling Price
                    </span>

                    <div className="package-price">
                      {formatPrice(
                        item.selling_price
                      )}
                    </div>

                  </div>

                  <span className="purchase-type-badge">
                    {formatText(
                      item.purchase_type
                    )}
                  </span>

                </div>

                {/* =================================================
                    INFO
                ================================================= */}

                <div className="package-info-grid">

                  <div className="package-info-box">

                    <div className="package-info-icon">
                      <FaShoppingBag />
                    </div>

                    <div>
                      <span>
                        Purchase Type
                      </span>

                      <strong>
                        {formatText(
                          item.purchase_type
                        )}
                      </strong>
                    </div>

                  </div>

                  <div className="package-info-box">

                    <div className="package-info-icon">
                      <FaClock />
                    </div>

                    <div>
                      <span>
                        Billing Mode
                      </span>

                      <strong>
                        {formatText(
                          item.billing_mode
                        )}
                      </strong>
                    </div>

                  </div>

                  <div className="package-info-box">

                    <div className="package-info-icon">
                      <FaCalendarAlt />
                    </div>

                    <div>
                      <span>
                        Validity
                      </span>

                      <strong>
                        {getValidity(
                          item.validity_days
                        )}
                      </strong>
                    </div>

                  </div>

                  <div className="package-info-box">

                    <div className="package-info-icon">
                      <FaUsers />
                    </div>

                    <div>
                      <span>
                        Availability
                      </span>

                      <strong>
                        {item.available_to_all_users
                          ? "All Users"
                          : "Selected Users"}
                      </strong>
                    </div>

                  </div>

                </div>

                {/* =================================================
                    TAGS
                ================================================= */}

                <div className="package-tags-section">

                  <div className="tags-title">
                    <FaTag />
                    <span>Tags</span>
                  </div>

                  <div className="package-tags">

                    {item.tags?.length > 0 ? (
                      item.tags.map(
                        (tag, index) => (
                          <span
                            className="package-tag"
                            key={`${tag}-${index}`}
                          >
                            {tag}
                          </span>
                        )
                      )
                    ) : (
                      <span className="no-tags">
                        No tags
                      </span>
                    )}

                  </div>

                </div>

                {/* =================================================
                    VIEW DETAILS
                ================================================= */}

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
                      ? "View Less"
                      : "View Details"}
                  </span>

                  {isExpanded ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}

                </button>

                {/* =================================================
                    EXPANDED DETAILS
                ================================================= */}

                {isExpanded && (
                  <div className="package-expanded-details">

                    {/* Description */}

                    <div className="expanded-block">

                      <div className="expanded-heading">
                        <span className="expanded-heading-icon">
                          <FaBoxOpen />
                        </span>

                        <div>
                          <h4>
                            Package Overview
                          </h4>

                          <span>
                            Complete package information
                          </span>
                        </div>
                      </div>

                      <p className="package-description">
                        {item.description ||
                          "No description available for this package."}
                      </p>

                    </div>

                    {/* Package Details */}

                    <div className="expanded-block">

                      <div className="expanded-heading">

                        <span className="expanded-heading-icon">
                          <FaRupeeSign />
                        </span>

                        <div>
                          <h4>
                            Package Details
                          </h4>

                          <span>
                            Pricing and purchase configuration
                          </span>
                        </div>

                      </div>

                      <div className="detail-grid">

                        <div>
                          <span>
                            Category
                          </span>

                          <strong>
                            {item.category_name ||
                              item.category_details?.name ||
                              "-"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Category Code
                          </span>

                          <strong>
                            {item.category_code ||
                              "-"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Original Price
                          </span>

                          <strong>
                            {formatPrice(
                              item.original_price
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Selling Price
                          </span>

                          <strong>
                            {formatPrice(
                              item.selling_price
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Button Action
                          </span>

                          <strong>
                            {formatText(
                              item.button_action
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Can Be Purchased
                          </span>

                          <strong>
                            {item.can_be_purchased
                              ? "Yes"
                              : "No"}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Billing Mode
                          </span>

                          <strong>
                            {formatText(
                              item.billing_mode
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Sequence
                          </span>

                          <strong>
                            {item.sequence ?? "-"}
                          </strong>
                        </div>

                      </div>

                    </div>

                    {/* Benefits */}

                    <div className="expanded-block">

                      <div className="expanded-heading">

                        <span className="expanded-heading-icon benefit-icon">
                          <FaCheckCircle />
                        </span>

                        <div>
                          <h4>
                            Benefits
                          </h4>

                          <span>
                            What's included in this package
                          </span>
                        </div>

                      </div>

                      {item.benefits?.includes?.length >
                      0 ? (
                        <div className="benefits-list">

                          {item.benefits.includes.map(
                            (benefit, index) => (
                              <div
                                className="benefit-row"
                                key={index}
                              >
                                <FaCheckCircle />

                                <span>
                                  {benefit}
                                </span>
                              </div>
                            )
                          )}

                        </div>
                      ) : (
                        <div className="detail-empty">
                          No benefits configured.
                        </div>
                      )}

                    </div>

                    {/* Configuration */}

                    <div className="expanded-block">

                      <div className="expanded-heading">

                        <span className="expanded-heading-icon">
                          <FaBoxOpen />
                        </span>

                        <div>
                          <h4>
                            Configuration
                          </h4>

                          <span>
                            Package capabilities
                          </span>
                        </div>

                      </div>

                      {item.configuration?.length >
                      0 ? (
                        <div className="configuration-list">

                          {item.configuration.map(
                            (config, index) => (
                              <div
                                className="configuration-row"
                                key={
                                  config.capability_id ||
                                  index
                                }
                              >

                                <div className="configuration-left">

                                  <strong>
                                    {config.label ||
                                      config.name}
                                  </strong>

                                  <span>
                                    {formatText(
                                      config.type
                                    )}
                                  </span>

                                </div>

                                <div>

                                  {config.type ===
                                    "consumable" &&
                                  config.count !==
                                    undefined ? (
                                    <span className="config-count">
                                      × {config.count}
                                    </span>
                                  ) : config.included ? (
                                    <span className="config-included">
                                      <FaCheckCircle />
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

              </div>
            );
          })}

        </div>
      ) : (
        /* =====================================================
           EMPTY STATE
        ===================================================== */

        <div className="package-empty-state">

          <div className="empty-icon">
            <FaBoxOpen />
          </div>

          <h3>
            No Packages Found
          </h3>

          <p>
            {searchTerm ||
            statusFilter !== "all" ||
            categoryFilter !== "all"
              ? "Try changing your search or filters."
              : "There are no packages available yet."}
          </p>

          {(searchTerm ||
            statusFilter !== "all" ||
            categoryFilter !== "all") && (
            <button
              type="button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}

        </div>
      )}

      {/* =====================================================
          PAGINATION
      ===================================================== */}

      {totalPages > 1 && (
        <div className="package-pagination">

          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage(
                (prev) => prev - 1
              )
            }
          >
            ←
          </button>

          {pageNumbers.map((page) => (
            <button
              type="button"
              key={page}
              className={
                currentPage === page
                  ? "pagination-active"
                  : ""
              }
              onClick={() =>
                setCurrentPage(page)
              }
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setCurrentPage(
                (prev) => prev + 1
              )
            }
          >
            →
          </button>

        </div>
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteId && (
        <div className="package-modal-overlay">

          <div className="package-delete-modal">

            <div className="delete-icon-wrapper">
              <FaTrash />
            </div>

            <h3>
              Delete Package?
            </h3>

            <p>
              Are you sure you want to delete
              this package? This action cannot
              be undone.
            </p>

            <div className="delete-modal-buttons">

              <button
                type="button"
                className="cancel-delete"
                disabled={deleteLoading}
                onClick={() =>
                  setDeleteId(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-delete"
                disabled={deleteLoading}
                onClick={handleDelete}
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete Package"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default Package;