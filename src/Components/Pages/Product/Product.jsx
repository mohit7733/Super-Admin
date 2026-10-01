import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  BsSearch,
  BsClockHistory,
  BsArrowRepeat,
  BsCalendar3,
  BsLink45Deg,
  BsBoxSeam,
  BsEye,
  BsCopy,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";

import BASE_URL from "../../../Base";
import "./Product.css";

const Product = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const [expandedProductId, setExpandedProductId] = useState(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );
const handleVariantStatusToggle = async (variant) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  const variantId = variant?.id;

  if (!variantId) {
    toast.error("Variant ID not found");
    return;
  }

  const currentStatus =
    String(variant?.status || "").toLowerCase();

  const newStatus =
    currentStatus === "active"
      ? "inactive"
      : "active";

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/variant/${variantId}/status/`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || "Failed to update variant status"
      );
    }

    toast.success(
      newStatus === "active"
        ? "Variant activated successfully"
        : "Variant deactivated successfully"
    );

    await fetchProducts(currentPage, searchTerm);

  } catch (error) {
    console.error("Variant Status Error:", error);

    toast.error(
      error?.message || "Failed to update variant status"
    );
  }
};
  const fetchProducts = async (page = 1, search = "") => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoadingProduct(true);
    setError(null);

    try {
      let url = `${BASE_URL}/vendors/admin/product/?page=${page}`;

      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");

        toast.error("Session expired. Please login again");
        navigate("/login");

        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      console.log("Product API Response:", data);

      setProducts(data?.data?.results || []);
      setTotalCount(data?.data?.count || 0);
      setNextPage(data?.data?.next || null);
      setPreviousPage(data?.data?.previous || null);
      setCurrentPage(page);
    } catch (err) {
      console.error("Product Fetch Error:", err);

      setError("Something went wrong while fetching data.");
      toast.error("Failed to fetch product data");
    } finally {
      setLoadingProduct(false);
    }
  };

  useEffect(() => {
  const timer = setTimeout(() => {
    setExpandedProductId(null);
    setCurrentPage(1);

    fetchProducts(1, searchTerm);
  }, 500);

  return () => clearTimeout(timer);
}, [searchTerm]);

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (e) => {
    e.preventDefault();

    setCurrentPage(1);
    setExpandedProductId(null);

    fetchProducts(1, searchTerm);
  };

  // =========================================================
  // PRODUCT VIEW
  // =========================================================

  const handleViewProduct = (id) => {
    navigate(`/Productdetail/${id}`);
  };

  

  const handleVariantToggle = (productId) => {
    setExpandedProductId((previousId) =>
      previousId === productId ? null : productId
    );
  };

  

  const getProductImage = (product) => {
    return (
      product?.cover_image?.media_url

    );
  };

  // =========================================================
  // VARIANTS
  // =========================================================

  const getVariants = (product) => {
    if (Array.isArray(product?.variants)) {
      return product.variants;
    }

    if (Array.isArray(product?.product_variants)) {
      return product.product_variants;
    }

    return [];
  };

  const getVariantCount = (product) => {
    const variants = getVariants(product);

    if (variants.length > 0) {
      return variants.length;
    }

    return product?.variant_count ?? product?.variants_count ?? 0;
  };

  // =========================================================
  // VARIANT IMAGE
  // =========================================================

  const getVariantImage = (variant, product) => {
    return (
      variant?.image_url ||
      variant?.image ||
      variant?.thumbnail ||
      variant?.product_image ||
      getProductImage(product)
    );
  };

  // =========================================================
  // VARIANT NAME
  // =========================================================

  const getVariantName = (variant, product) => {
    return (
      variant?.name ||
      variant?.variant_name ||
      variant?.title ||
      `${product?.name || "Product"} Variant`
    );
  };

 const getVendorSku = (variant) => {
  return variant?.vendor_sku_code || "-";
};

const getSystemSku = (variant) => {
  return variant?.sku_code || "-";
};



  const getMrp = (variant) => {
    return (
      variant?.mrp ??
      variant?.maximum_retail_price ??
      variant?.price ??
      "-"
    );
  };

  const getSellingPrice = (variant) => {
    return (
      variant?.selling_price ??
      variant?.sale_price ??
      variant?.discounted_price ??
      variant?.price ??
      "-"
    );
  };



  const getQuantity = (variant) => {
    return (
      variant?.quantity ??
      variant?.stock_quantity ??
      variant?.available_quantity ??
      variant?.stock ??
      0
    );
  };

  

  const getApprovalStatus = (variant) => {
    return (
      variant?.approval_status ||
      variant?.status ||
      "approved"
    );
  };

  const getProductStatus = (product) => {
    return (
      product?.approval_status ||
      product?.status ||
      product?.product_status ||
      "approved"
    );
  };

  const normalizeStatus = (status) => {
    return String(status || "")
      .toLowerCase()
      .replace(/[\s-]/g, "_");
  };

 const isVariantActive = (variant) => {
  return String(variant?.status || "").toLowerCase() === "active";
};

  

  const getVariantStatusCounts = (product) => {
    const variants = getVariants(product);

    const counts = {
      approved: 0,
      pending: 0,
      rejected: 0,
      suspended: 0,
    };

    variants.forEach((variant) => {
      const status = normalizeStatus(
        getApprovalStatus(variant)
      );

      if (status === "approved") {
        counts.approved++;
      } else if (status === "pending") {
        counts.pending++;
      } else if (status === "rejected") {
        counts.rejected++;
      } else if (status === "suspended") {
        counts.suspended++;
      }
    });

    return counts;
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // COPY PRODUCT ID
  // =========================================================

  const handleCopyId = async (id) => {
    if (!id) return;

    try {
      await navigator.clipboard.writeText(id);
      toast.success("Product ID copied");
    } catch (error) {
      toast.error("Unable to copy Product ID");
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="mainproduct-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mainproduct-page-header">
        <div>
          <h1 className="mainproduct-page-title">
            Products
          </h1>

          <p className="mainproduct-page-subtitle">
            Manage your products, variants and status.
          </p>
        </div>
      </div>

      {/* =====================================================
          SEARCH
      ====================================================== */}

      <form
        className="mainproduct-search-section"
        onSubmit={handleSearch}
      ><div className="mainproduct-search-section">
  <div className="mainproduct-search-wrapper">
    <BsSearch className="mainproduct-search-icon" />

    <input
      type="text"
      className="mainproduct-search-input"
      placeholder="Search product name or brand name..."
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setExpandedProductId(null);
      }}
    />
  </div>
</div>

        {/* <button
          type="submit"
          className="mainproduct-search-button"
        >
          Search
        </button> */}
      </form>

      {/* =====================================================
          PRODUCT LIST
      ====================================================== */}

      <div className="mainproduct-list-container">

        {loadingProduct ? (
          Array(3)
            .fill(0)
            .map((_, index) => (
              <div
                className="mainproduct-card mainproduct-skeleton-card"
                key={index}
              >
                <div className="mainproduct-skeleton-image" />

                <div className="mainproduct-skeleton-content">
                  <div className="mainproduct-skeleton-line mainproduct-skeleton-title" />
                  <div className="mainproduct-skeleton-line" />
                  <div className="mainproduct-skeleton-line mainproduct-skeleton-small" />
                </div>
              </div>
            ))
        ) : error ? (
          <div className="mainproduct-empty-state">
            <p>{error}</p>
          </div>
        ) : products.length > 0 ? (
          products.map((product, index) => {
            const variants = getVariants(product);
            const variantCount = getVariantCount(product);

            const isExpanded =
              expandedProductId === product.id;

            const statusCounts =
              getVariantStatusCounts(product);

            const productStatus =
              getProductStatus(product);

            const normalizedProductStatus =
              normalizeStatus(productStatus);

            return (
              <div
                className={`mainproduct-card ${
                  isExpanded
                    ? "mainproduct-card-expanded"
                    : ""
                }`}
                key={product?.id || index}
              >

                {/* =================================================
                    PRODUCT CARD
                ================================================== */}

                <div className="mainproduct-product-card">

                  {/* LEFT PRODUCT IMAGE */}

                  <div className="mainproduct-product-image-section">
                    <div className="mainproduct-image-wrapper">
                      <img
                        src={getProductImage(product)}
                        alt={
                          product?.name || "Product"
                        }
                        className="mainproduct-image"
                     
                      />
                    </div>
                  </div>

                  {/* PRODUCT INFORMATION */}

                  <div className="mainproduct-product-info">

                    <div className="mainproduct-product-title-row">

                      <h3 className="mainproduct-name">
                        {product?.name || "-"}
                      </h3>

                   

                    </div>

                    <div className="mainproduct-product-meta">

                      <span>
                        Brand:
                        <strong>
                          {product?.brand_name || "-"}
                        </strong>
                      </span>

                      <span className="mainproduct-meta-separator">
                        |
                      </span>

                      <span>
                        Category:
                        <strong>
                          {product?.category_name ||
                            product?.product_category_name ||
                            product?.category ||
                            "-"}
                        </strong>
                      </span>

                    </div>

                    <p className="mainproduct-description" title={ product?.short_description || "No product description available."}>
                      {product?.description ||
                        product?.short_description ||
                        "No product description available."}
                    </p>

                  </div>

                  {/* PRODUCT ID / VARIANTS */}

                  <div className="mainproduct-product-identifiers">

                    <div className="mainproduct-identifier-item">

                      <div className="mainproduct-identifier-label">
                        <BsLink45Deg />
                        Product ID
                      </div>

                      <div className="mainproduct-product-id">
                        <span>
                          {product?.product_id ||
                            product?.id ||
                            "-"}
                        </span>

                        {(product?.product_id ||
                          product?.id) && (
                          <button
                            type="button"
                            className="mainproduct-copy-btn"
                            onClick={() =>
                              handleCopyId(
                                product?.product_id ||
                                  product?.id
                              )
                            }
                            title="Copy Product ID"
                          >
                            <BsCopy />
                          </button>
                        )}
                      </div>

                    </div>

                    <div className="mainproduct-identifier-divider" />

                    <div className="mainproduct-identifier-item">

                      <div className="mainproduct-identifier-label">
                        <BsBoxSeam />
                        Variants
                      </div>

                      <div className="mainproduct-variant-count">
                        {variantCount}
                      </div>

                    </div>

                  </div>

                 

                  <div className="mainproduct-status-counts">

                    <div className="mainproduct-status-count-item mainproduct-count-approved">
                      <span className="mainproduct-count-dot" />
                      <span>Approved</span>
                      <strong>
                        {statusCounts.approved}
                      </strong>
                    </div>

                    <div className="mainproduct-status-count-item mainproduct-count-pending">
                      <span className="mainproduct-count-dot" />
                      <span>Pending</span>
                      <strong>
                        {statusCounts.pending}
                      </strong>
                    </div>

                    <div className="mainproduct-status-count-item mainproduct-count-rejected">
                      <span className="mainproduct-count-dot" />
                      <span>Rejected</span>
                      <strong>
                        {statusCounts.rejected}
                      </strong>
                    </div>

                    <div className="mainproduct-status-count-item mainproduct-count-suspended">
                      <span className="mainproduct-count-dot" />
                      <span>Suspended</span>
                      <strong>
                        {statusCounts.suspended}
                      </strong>
                    </div>

                  </div>

                  {/* DATES */}

                  <div className="mainproduct-date-section">

                    <div className="mainproduct-date-item">

                      <div className="mainproduct-date-icon">
                        <BsCalendar3 />
                      </div>

                      <div>
                        <span className="mainproduct-date-label">
                          Created
                        </span>

                        <strong>
                          {formatDate(
                            product?.created_at ||
                              product?.created
                          )}
                        </strong>
                      </div>

                    </div>

                    <div className="mainproduct-date-item">

                      <div className="mainproduct-date-icon">
                        <BsArrowRepeat />
                      </div>

                      <div>
                        <span className="mainproduct-date-label">
                          Last Updated
                        </span>

                        <strong>
                          {formatDate(
                            product?.updated_at ||
                              product?.last_updated
                          )}
                        </strong>
                      </div>

                    </div>

                  </div>

                  {/* RIGHT ACTION AREA */}

                  <div className="mainproduct-card-right">

                

                    <div className="mainproduct-card-buttons">

                      {/* SAME VIEW VARIANT FLOW */}

                      <button
                        type="button"
                        className="mainproduct-view-variants-btn"
                        onClick={() =>
                          handleVariantToggle(
                            product.id
                          )
                        }
                      >
                        <BsBoxSeam />

                        {isExpanded
                          ? "Hide Variants"
                          : "View Variants"}
                      </button>

                      {/* SAME PRODUCT VIEW FLOW */}

                      <button
                        type="button"
                        className="mainproduct-view-btn"
                        onClick={() =>
                          handleViewProduct(
                            product.id
                          )
                        }
                      >
                        <BsEye />
                        View
                      </button>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    EXISTING VARIANT SECTION
                    FLOW REMAINS SAME
                ================================================== */}

                {isExpanded && (
                  <div className="mainproduct-variants-section">

                    <div className="mainproduct-variants-headers">

                      <div>VARIANT</div>

                      <div>
                        SKU (VENDOR / SYSTEM)
                      </div>

                      <div>MRP</div>

                      <div>SELLING PRICE</div>

                      <div>QUANTITY</div>

                      <div>STOCK</div>

                      <div>LIFECYCLE</div>

                    </div>

                    {variants.length > 0 ? (
                      variants.map(
                        (
                          variant,
                          variantIndex
                        ) => {
                          const quantity =
                            Number(
                              getQuantity(
                                variant
                              )
                            ) || 0;

                          const active =
                            isVariantActive(
                              variant
                            );

                          const approvalStatus =
                            getApprovalStatus(
                              variant
                            );

                          const normalizedApproval =
                            normalizeStatus(
                              approvalStatus
                            );

                          return (
                            <div
                              className="mainproduct-variant-row"
                              key={
                                variant?.id ||
                                variantIndex
                              }
                            >

                              {/* VARIANT */}

                              <div className="mainproduct-variant-product-cell">

                                <div className="mainproduct-variant-image-wrapper">

                                  <img
                                    src={getVariantImage(
                                      variant,
                                      product
                                    )}
                                    alt={getVariantName(
                                      variant,
                                      product
                                    )}
                                    className="mainproduct-variant-image"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "/placeholder-product.png";
                                    }}
                                  />

                                </div>

                                <div className="mainproduct-variant-name-wrapper">

                                  <div className="mainproduct-variant-name">
                                    {getVariantName(
                                      variant,
                                      product
                                    )}
                                  </div>

                                  <span
                                    className={`mainproduct-approval-badge mainproduct-${normalizedApproval}`}
                                  >
                                    ✓{" "}
                                    {String(
                                      approvalStatus
                                    )
                                      .charAt(0)
                                      .toUpperCase() +
                                      String(
                                        approvalStatus
                                      ).slice(1)}
                                  </span>

                                </div>

                              </div>

                             

                              <div className="mainproduct-variant-sku-cell">

                                <div className="mainproduct-vendor-sku">
                                  {getVendorSku(
                                    variant
                                  )}
                                </div>

                                <div className="mainproduct-system-sku">
                                  {getSystemSku(
                                    variant
                                  )}
                                </div>

                              </div>

                     

                              <div className="mainproduct-variant-price">
                                ₹{getMrp(variant)}
                              </div>

                             
                              <div className="mainproduct-variant-selling-price">
                                ₹
                                {getSellingPrice(
                                  variant
                                )}
                              </div>

                            

                              <div className="mainproduct-variant-quantity">
                                {quantity} units
                              </div>

                        

                              <div>
                                <span
                                  className={`mainproduct-stock-badge ${
                                    quantity > 0
                                      ? "mainproduct-instock"
                                      : "mainproduct-outstock"
                                  }`}
                                >
                                  <span className="mainproduct-stock-icon">
                                    ◈
                                  </span>

                                  {quantity > 0
                                    ? "Instock"
                                    : "Out of Stock"}
                                </span>
                              </div>

                          

                            <div className="mainproduct-lifecycle-actions">

  {/* CURRENT STATUS */}
  <span
    className={`mainproduct-active-badge ${
      active
        ? "mainproduct-active"
        : "mainproduct-inactive"
    }`}
  >
    {active ? "✓ Active" : "✕ Inactive"}
  </span>

  {/* STATUS ACTION */}
  <button
    type="button"
    className={
      active
        ? "mainproduct-inactive-btn"
        : "mainproduct-active-btn"
    }
    onClick={() => handleVariantStatusToggle(variant)}
  >
    {active ? "Inactive" : "Active"}
  </button>

</div>

                            </div>
                          );
                        }
                      )
                    ) : (
                      <div className="mainproduct-no-variants">
                        No variants found for this product.
                      </div>
                    )}

                  </div>
                )}

              </div>
            );
          })
        ) : (
          <div className="mainproduct-empty-state">
            <p>No Data Found</p>
          </div>
        )}

  {/* PAGINATION */}
{!loadingProduct && totalPages > 1 && (
  <div className="mainproduct-pagination">

    {/* BACK / PREVIOUS */}
    <button
      type="button"
      className="mainproduct-pagination-arrow"
      onClick={() =>
        fetchProducts(currentPage - 1, searchTerm)
      }
      disabled={currentPage === 1 || !previousPage}
      title="Previous Page"
    >
      <BsChevronLeft />
    </button>

    {/* PAGE NUMBERS */}
    {pages.map((page) => (
      <button
        type="button"
        key={page}
        onClick={() =>
          fetchProducts(page, searchTerm)
        }
        className={
          currentPage === page
            ? "mainproduct-pagination-active"
            : ""
        }
      >
        {page}
      </button>
    ))}

    {/* NEXT */}
    <button
      type="button"
      className="mainproduct-pagination-arrow"
      onClick={() =>
        fetchProducts(currentPage + 1, searchTerm)
      }
      disabled={currentPage === totalPages || !nextPage}
      title="Next Page"
    >
      <BsChevronRight />
    </button>

  </div>
)}

      </div>
    </div>
  );
};

export default Product;