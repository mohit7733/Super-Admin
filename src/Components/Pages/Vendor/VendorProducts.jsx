
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBox,
  FaBoxes,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaExclamationCircle,
  FaImage,
  FaRedo,
  FaSearch,
  FaTimesCircle,
} from "react-icons/fa";

import BASE_URL from "../../../Base";
import "./VendorProducts.css";

const PAGE_SIZE = 10;

const EMPTY_COUNTS = {
  products: 0,
  variants: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  suspended: 0,
};

const VendorProducts = ({ vendorId }) => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [totalCounts, setTotalCounts] = useState(EMPTY_COUNTS);
  const [expandedProducts, setExpandedProducts] = useState({});
  const [loading, setLoading] = useState(false);
 const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const getImageUrl = (image) => {
    if (!image) return "";
    if (typeof image === "string") return image;
    return image.media_url || image.url || image.image_url || "";
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const amount = Number(value);
    if (Number.isNaN(amount)) return "—";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const normalizeStatus = (status) =>
    String(status || "unknown").toLowerCase().replace(/\s+/g, "_");

 const fetchProducts = useCallback(async () => {
  if (!vendorId) return;

  setLoading(true);

  try {
    const token = sessionStorage.getItem("superadmin_token");

    const params = new URLSearchParams({
      page: String(page),
      page_size: String(PAGE_SIZE),
    });

    params.set("vendor_id", vendorId);

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    }

    const response = await fetch(
      `${BASE_URL}/vendors/admin/product/?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    const result = await response.json();

    if (!response.ok || result?.success === false) {
      throw new Error(result?.message || "Failed to fetch products.");
    }

    const payload = result?.data || {};
    const list = Array.isArray(payload.results) ? payload.results : [];

    setProducts(list);

    const counts = payload.total_counts || {};

    setTotalCounts({
      products: counts.products ?? payload.count ?? 0,
      variants: counts.variants ?? 0,
      pending: counts.pending ?? 0,
      approved: counts.approved ?? 0,
      rejected: counts.rejected ?? 0,
      suspended: counts.suspended ?? 0,
    });

    setHasNext(Boolean(payload.next));
    setHasPrevious(Boolean(payload.previous));

    setTotalPages(
      Math.max(1, Math.ceil((payload.count || 0) / PAGE_SIZE))
    );

    setExpandedProducts({});
  } catch (error) {
    console.error("Vendor product search error:", error);
    toast.error(error.message || "Unable to fetch products.");
    setProducts([]);
    setHasNext(false);
    setHasPrevious(false);
  } finally {
    setLoading(false);
  }
}, [vendorId, page, debouncedSearch, navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchTerm.trim());
    setPage(1);
  }, 400);

  return () => clearTimeout(timer);
}, [searchTerm]);
  useEffect(() => {
    setPage(1);
    setSearchTerm("");
    setExpandedProducts({});
  }, [vendorId]);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return products;

    return products.filter((product) => {
      const variants = Array.isArray(product.variants)
        ? product.variants
        : [];

      const searchableValues = [
        product.name,
        product.title,
        product.brand_name,
        product.product_category_name,
        product.short_description,
        ...variants.flatMap((variant) => [
          variant.title,
          variant.name,
          variant.vendor_sku_code,
          variant.sku_code,
        ]),
      ];

      return searchableValues.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [products, searchTerm]);

  const toggleProduct = (productId) => {
    setExpandedProducts((previous) => ({
      ...previous,
      [productId]: !previous[productId],
    }));
  };

  const stats = [
    {
      label: "Products",
      value: totalCounts.products,
      icon: <FaBox />,
      className: "vp-stat-products",
    },
    {
      label: "Variants",
      value: totalCounts.variants,
      icon: <FaBoxes />,
      className: "vp-stat-variants",
    },
    {
      label: "Pending",
      value: totalCounts.pending,
      icon: <FaClock />,
      className: "vp-stat-pending",
    },
    {
      label: "Approved",
      value: totalCounts.approved,
      icon: <FaCheckCircle />,
      className: "vp-stat-approved",
    },
    {
      label: "Rejected",
      value: totalCounts.rejected,
      icon: <FaTimesCircle />,
      className: "vp-stat-rejected",
    },
    {
      label: "Suspended",
      value: totalCounts.suspended,
      icon: <FaExclamationCircle />,
      className: "vp-stat-suspended",
    },
  ];

  return (
    <section className="vendor-products-page">
      <div className="vp-header">
        <div>
          <h2>Vendor Products</h2>
          <p>Products and variants associated with this vendor.</p>
        </div>

        <button
          type="button"
          className="vp-refresh-button"
          onClick={fetchProducts}
          disabled={loading}
        >
          <FaRedo className={loading ? "vp-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Statistics: one horizontal row */}
      <div className="vendor-product-stats">
        {stats.map((stat) => (
          <div
            className={`vendor-product-stat-card ${stat.className}`}
            key={stat.label}
          >
            <div className="vp-stat-top">
              <span className="vendor-product-stat-label">
                {stat.label}
              </span>
              <span className="vp-stat-icon">{stat.icon}</span>
            </div>

            <span className="vendor-product-stat-value">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Search bar is always displayed above the product list */}
      <div className="vp-list-heading">
        <h3>Product List</h3>

        <div className="vp-list-actions">
          <div className="vp-search-box">
            <FaSearch className="vp-search-icon" />

            <input
              type="search"
              value={searchTerm}
              placeholder="Search product, brand, category, SKU..."
              aria-label="Search vendor products"
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                className="vp-search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* <span className="vp-result-count">
            {loading
              ? "Loading..."
              : `${filteredProducts.length} found`}
          </span> */}
        </div>
      </div>

      {loading ? (
        <div className="vp-state-box">
          <div className="vp-loader" />
          <p>Loading vendor products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="vp-state-box">
          <FaBox className="vp-empty-icon" />
          <h3>{searchTerm ? "No matching products" : "No products found"}</h3>
          <p>
            {searchTerm
              ? "Try another product name, brand, category or SKU."
              : "This vendor has no products on this page."}
          </p>

          {searchTerm && (
            <button
              type="button"
              className="vp-retry-button"
              onClick={() => setSearchTerm("")}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="vp-product-list">
          {filteredProducts.map((product, index) => {
            const productId =
              product.id ||
              product.product_id ||
              product.uuid ||
              product._id ||
              `${product.name || "product"}-${index}`;

            const variants = Array.isArray(product.variants)
              ? product.variants
              : [];

            const isExpanded = Boolean(expandedProducts[productId]);
            const productImage = getImageUrl(product.cover_image);

            return (
              <article className="vp-product-card" key={productId}>
                <div className="vp-product-main">
                  <div className="vp-product-image">
                    {productImage && (
                      <img
                        src={productImage}
                        alt={product.name || "Product"}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          event.currentTarget.parentElement
                            ?.querySelector(".vp-image-fallback")
                            ?.classList.add("vp-fallback-visible");
                        }}
                      />
                    )}

                    <div
                      className={`vp-image-fallback ${
                        productImage ? "" : "vp-fallback-visible"
                      }`}
                    >
                      <FaImage />
                    </div>
                  </div>

                  <div className="vp-product-info">
                    <div className="vp-product-title-row">
                      <h4>
                        {product.name || product.title || "Unnamed product"}
                      </h4>

                      <span className="vp-variant-count">
                        {product.variants_count ?? variants.length}{" "}
                        {(product.variants_count ?? variants.length) === 1
                          ? "Variant"
                          : "Variants"}
                      </span>
                    </div>

                    <div className="vp-product-meta">
                      <span>
                        <strong>Brand:</strong>{" "}
                        {product.brand_name || product.brand?.name || "—"}
                      </span>

                      <span>
                        <strong>Category:</strong>{" "}
                        {product.product_category_name ||
                          product.category_name ||
                          product.category?.name ||
                          "—"}
                      </span>
                    </div>

                    {product.short_description && (
                      <p className="vp-description">
                        {product.short_description}
                      </p>
                    )}

                    <div className="vp-product-summary">
                      <span>
                        <FaCheckCircle />
                        Approved: {product.approved_count ?? 0}
                      </span>
                      <span>
                        <FaClock />
                        Pending: {product.pending_count ?? 0}
                      </span>
                      <span>
                        <FaTimesCircle />
                        Rejected: {product.rejected_count ?? 0}
                      </span>
                      <span>
                        <FaExclamationCircle />
                        Suspended: {product.suspended_count ?? 0}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`vp-expand-button ${
                      isExpanded ? "is-expanded" : ""
                    }`}
                    onClick={() => toggleProduct(productId)}
                    aria-expanded={isExpanded}
                  >
                    <span>{isExpanded ? "Hide Variants" : "View Variants"}</span>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="vp-variants-section">
                    <div className="vp-variants-heading">
                      <h5>Product Variants</h5>
                      <span>{variants.length} listed</span>
                    </div>

                    {variants.length === 0 ? (
                      <div className="vp-no-variants">
                        No variants were included for this product.
                      </div>
                    ) : (
                      <div className="vp-table-wrapper">
                        <table className="vp-variants-table">
                          <thead>
                            <tr>
                              <th>Variant</th>
                              <th>Vendor SKU</th>
                              <th>SKU</th>
                              <th>MRP</th>
                              <th>Selling Price</th>
                              <th>Quantity</th>
                              <th>Stock</th>
                              <th>Approval Status</th>
                            </tr>
                          </thead>

                          <tbody>
                            {variants.map((variant, variantIndex) => {
                              const variantId =
                                variant.id ||
                                variant.variant_id ||
                                variant.uuid ||
                                variant._id ||
                                `${productId}-variant-${variantIndex}`;

                              const variantImage = getImageUrl(
                                variant.cover_image || variant.image
                              );

                              const status =
                                variant.approval_status ||
                                variant.status ||
                                "unknown";

                              const normalizedStatus = normalizeStatus(status);

                              const isOutOfStock =
                                variant.out_of_stock === true ||
                                String(variant.out_of_stock).toLowerCase() ===
                                  "true" ||
                                (variant.quantity !== null &&
                                  variant.quantity !== undefined &&
                                  Number(variant.quantity) <= 0);

                              return (
                                <tr key={variantId}>
                                  <td>
                                    <div className="vp-variant-name">
                                      {variantImage ? (
                                        <img
                                          src={variantImage}
                                          alt={variant.title || "Variant"}
                                          onError={(event) => {
                                            event.currentTarget.style.display =
                                              "none";
                                          }}
                                        />
                                      ) : (
                                        <span className="vp-mini-image">
                                          <FaImage />
                                        </span>
                                      )}

                                      <span>
                                        {variant.title ||
                                          variant.name ||
                                          `Variant ${variantIndex + 1}`}
                                      </span>
                                    </div>
                                  </td>

                                  <td>{variant.vendor_sku_code || "—"}</td>
                                  <td>{variant.sku_code || "—"}</td>
                                  <td>{formatPrice(variant.mrp)}</td>

                                  <td className="vp-selling-price">
                                    {formatPrice(variant.selling_price)}
                                  </td>

                                  <td>{variant.quantity ?? "—"}</td>

                                  <td>
                                    <span
                                      className={`vp-status-badge ${
                                        isOutOfStock
                                          ? "vp-status-out"
                                          : "vp-status-in"
                                      }`}
                                    >
                                      {isOutOfStock
                                        ? "Out of Stock"
                                        : "In Stock"}
                                    </span>
                                  </td>

                                  <td>
                                    <span
                                      className={`vp-status-badge vp-status-${normalizedStatus}`}
                                    >
                                      {String(status).replace(/_/g, " ")}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Numbered pagination */}
      <div className="vp-pagination">
        <button
          type="button"
          disabled={!hasPrevious || loading}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </button>

        <div className="vp-page-numbers">
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter(
              (pageNumber) =>
                pageNumber === 1 ||
                pageNumber === totalPages ||
                Math.abs(pageNumber - page) <= 1
            )
            .reduce((result, pageNumber, index, numbers) => {
              if (index > 0 && pageNumber - numbers[index - 1] > 1) {
                result.push("ellipsis-" + pageNumber);
              }

              result.push(pageNumber);
              return result;
            }, [])
            .map((item) =>
              typeof item === "string" ? (
                <span className="vp-page-ellipsis" key={item}>
                  …
                </span>
              ) : (
                <button
                  type="button"
                  key={item}
                  className={`vp-page-number ${
                    page === item ? "active" : ""
                  }`}
                  disabled={loading || page === item}
                  onClick={() => setPage(item)}
                >
                  {item}
                </button>
              ))}
        </div>

        <button
          type="button"
          disabled={!hasNext || loading}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
};

export default VendorProducts;
