
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaTimes,
  FaCopy,
  FaBox,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../../Base";
import "./VendorStock.css";

const INVENTORY_URL = `${BASE_URL}/inventory/admin/`;
const LOW_STOCK_THRESHOLD = 10;
const PAGE_SIZE = 10;

const VendorStock = ({ vendorId: vendorIdProp }) => {
  const params = useParams();
  const navigate = useNavigate();

  const vendorId = vendorIdProp ?? params.vendorId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState(null);
  const [previousUrl, setPreviousUrl] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const getQuantity = (item) => Number(item.quantity ?? 0);

  const getStockStatus = (item) => {
    const quantity = getQuantity(item);

    if (quantity <= 0) return "out_of_stock";
    if (quantity <= LOW_STOCK_THRESHOLD) return "low_stock";

    return "in_stock";
  };

  const getApprovalStatus = (item) =>
    String(item.approval_status || "").trim().toLowerCase();

  const statusLabel = (status) => {
    if (!status) return "N/A";

    return String(status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
  };

  const getImage = (item) => item.cover_image?.media_url || "";

  // Build every request with the vendor ID and active filters.
  const buildApiUrl = useCallback(
    (page = 1) => {
      const url = new URL(INVENTORY_URL);

      if (vendorId) {
        url.searchParams.set("vendor_id", vendorId);
      }

      url.searchParams.set("page", String(page));
      url.searchParams.set("page_size", String(PAGE_SIZE));

      if (searchTerm.trim()) {
        url.searchParams.set("search", searchTerm.trim());
      }

      if (stockStatus) {
        url.searchParams.set("filter", stockStatus);
      }

      return url.toString();
    },
    [vendorId, searchTerm, stockStatus]
  );

  // Fetch inventory for the selected vendor.
  const fetchProducts = useCallback(
    async (url) => {
      if (!vendorId) {
        setError("Vendor ID is missing. Please open a valid vendor.");
        setProducts([]);
        setTotalCount(0);
        setNextUrl(null);
        setPreviousUrl(null);
        setLoading(false);
        return;
      }

      const token = sessionStorage.getItem("superadmin_token");

      if (!token) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const requestUrl = new URL(url, INVENTORY_URL);

        // Preserve the vendor filter on every request.
        requestUrl.searchParams.set("vendor_id", vendorId);
        requestUrl.searchParams.set("page_size", String(PAGE_SIZE));

        console.log(
          "Vendor Stock API Request:",
          requestUrl.toString()
        );

        const response = await fetch(requestUrl.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        });

        console.log("Vendor Stock API Status:", response.status);

        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem("superadmin_token");
          toast.error("Session expired. Please login again");
          navigate("/login");
          return;
        }

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const responseText = await response.text();

          console.error(
            "Non-JSON inventory response:",
            responseText
          );

          throw new Error(
            `Inventory API returned a non-JSON response (${response.status}). Check the API URL.`
          );
        }

        const result = await response.json();

        console.log("Vendor Stock API Response:", result);

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message ||
              `Failed to fetch stock (${response.status})`
          );
        }

        // Support common API response formats.
        const inventory = result.data ?? result;

        let records = [];

        if (Array.isArray(inventory)) {
          records = inventory;
        } else if (Array.isArray(inventory.results)) {
          records = inventory.results;
        } else if (Array.isArray(inventory.data)) {
          records = inventory.data;
        } else if (Array.isArray(result.results)) {
          records = result.results;
        } else if (Array.isArray(result.data)) {
          records = result.data;
        }

        setProducts(records);

        const count =
          inventory.count ??
          result.count ??
          inventory.total_count ??
          result.total_count ??
          records.length;

        setTotalCount(Number(count));

        setNextUrl(inventory.next ?? result.next ?? null);
        setPreviousUrl(
          inventory.previous ?? result.previous ?? null
        );

        setCurrentPage(
          Number(requestUrl.searchParams.get("page")) || 1
        );

        console.log("Inventory records:", records.length);
        console.log("Total inventory records:", count);
      } catch (err) {
        console.error("Vendor Product Stock Error:", err);

        setError(err.message || "Failed to fetch vendor products");
        setProducts([]);
        setTotalCount(0);
        setNextUrl(null);
        setPreviousUrl(null);

        toast.error(err.message || "Failed to fetch vendor stock");
      } finally {
        setLoading(false);
      }
    },
    [vendorId, navigate]
  );

  // Fetch page 1 when vendor, search, filter, or refresh changes.
  useEffect(() => {
    if (!vendorId) {
      setError("Vendor ID is missing from the URL.");
      setProducts([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(
      () => {
        fetchProducts(buildApiUrl(1));
      },
      searchTerm.trim() ? 400 : 0
    );

    return () => clearTimeout(timer);
  }, [
    vendorId,
    searchTerm,
    stockStatus,
    buildApiUrl,
    fetchProducts,
    refreshKey,
  ]);

  const handleRefresh = () => {
    if (!loading) {
      fetchProducts(buildApiUrl(currentPage));
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStockStatus("");
    setCurrentPage(1);
  };

  const copyInventoryId = async (id) => {
    try {
      await navigator.clipboard.writeText(String(id));
      toast.success("Inventory ID copied!");
    } catch {
      toast.error("Unable to copy inventory ID");
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const lowStockCount = products.filter(
    (item) => getStockStatus(item) === "low_stock"
  ).length;

  const outOfStockCount = products.filter(
    (item) => getStockStatus(item) === "out_of_stock"
  ).length;

  const approvedCount = products.filter(
    (item) => getApprovalStatus(item) === "approved"
  ).length;

  const hasActiveFilters = Boolean(
    searchTerm.trim() || stockStatus
  );

  const handlePageChange = (page) => {
    if (loading || page < 1) return;

    if (totalPages > 0 && page > totalPages) return;

    fetchProducts(buildApiUrl(page));
  };

  return (
    <div className="vendor-stock-container">
      {/* Page Heading */}
      <div className="page-header">
        <h1>Vendor Product Stock</h1>
        <p className="page-paragraph">
          Manage inventory and monitor stock for Vendor ID:{" "}
          <strong>{vendorId || "N/A"}</strong>
        </p>
      </div>

      {/* Summary Cards */}
      <div className="stats2-grid">
        <div
          className="stat2-card"
          style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaBox size={16} />
          </div>
          <div className="stat2-info">
            <h3>Total Product Records</h3>
            <div className="stat2-value">{totalCount}</div>
          </div>
        </div>

        <div
          className="stat2-card"
          style={{ borderTopColor: "#d97706" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#d9770620",
              color: "#d97706",
            }}
          >
            <FaExclamationTriangle size={16} />
          </div>
          <div className="stat2-info">
            <h3>Low Stock (Current Page)</h3>
            <div className="stat2-value">{lowStockCount}</div>
          </div>
        </div>

        <div
          className="stat2-card"
          style={{ borderTopColor: "#dc2626" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#dc262620",
              color: "#dc2626",
            }}
          >
            <FaBox size={16} />
          </div>
          <div className="stat2-info">
            <h3>Out of Stock (Current Page)</h3>
            <div className="stat2-value">{outOfStockCount}</div>
          </div>
        </div>

        <div
          className="stat2-card"
          style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaCheckCircle size={16} />
          </div>
          <div className="stat2-info">
            <h3>Approved Products (Current Page)</h3>
            <div className="stat2-value">{approvedCount}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search SKU, variant or product..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            value={stockStatus}
            onChange={(e) => {
              setStockStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="status-filter-select"
          >
            <option value="">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="pending_approval">
              Pending Approval
            </option>
            <option value="approved">Approved</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={handleResetFilters}
            >
              <FiRefreshCw /> Reset
            </button>
          )}
        </div>

        <div className="category-action-buttons">
          <button
            type="button"
            className="add-customer-btn"
            onClick={handleRefresh}
            disabled={loading}
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>MRP</th>
              <th>Selling Price</th>
              <th>Stock Status</th>
              <th>Approval Status</th>
              <th>Created At</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan="9">
                    <div className="skeleton-row" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan="9">
                  <div className="empty-filter-state">
                    <h3>Unable to Load Stock</h3>
                    <p>{error}</p>
                    <button
                      type="button"
                      onClick={handleRefresh}
                    >
                      <FiRefreshCw /> Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : products.length > 0 ? (
              products.map((item, index) => {
                const quantity = getQuantity(item);
                const stock = getStockStatus(item);
                const approval = getApprovalStatus(item);
                const imageUrl = getImage(item);

                const badgeStyle = {
                  background:
                    stock === "out_of_stock"
                      ? "#fee2e2"
                      : stock === "low_stock"
                      ? "#fef3c7"
                      : "#dcfce7",
                  color:
                    stock === "out_of_stock"
                      ? "#b91c1c"
                      : stock === "low_stock"
                      ? "#92400e"
                      : "#166534",
                };

                const approvalStyle = {
                  textTransform: "capitalize",
                  background:
                    approval === "approved"
                      ? "#dcfce7"
                      : ["rejected", "suspended"].includes(
                          approval
                        )
                      ? "#fee2e2"
                      : [
                          "pending",
                          "pending_approval",
                        ].includes(approval)
                      ? "#fef3c7"
                      : "#f3f4f6",
                  color:
                    approval === "approved"
                      ? "#166534"
                      : ["rejected", "suspended"].includes(
                          approval
                        )
                      ? "#b91c1c"
                      : [
                          "pending",
                          "pending_approval",
                        ].includes(approval)
                      ? "#92400e"
                      : "#374151",
                };

                return (
                  <tr
                    key={
                      item.id ??
                      `${item.product_id ?? "product"}-${index}`
                    }
                  >
                    <td>
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          minWidth: 230,
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product_name || "Product"}
                            width="48"
                            height="52"
                            style={{
                              objectFit: "contain",
                              padding: 3,
                              background: "#f8faf9",
                              borderRadius: 9,
                              border: "1px solid #e5e7eb",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                            onClick={() =>
                              setPreviewImage(imageUrl)
                            }
                            onError={(e) => {
                              e.currentTarget.style.visibility =
                                "hidden";
                            }}
                          />
                        ) : (
                          <FaBox
                            size={23}
                            style={{
                              color: "#9ca3af",
                              flexShrink: 0,
                            }}
                          />
                        )}

                        <div>
                          <strong>
                            {item.product_name || "N/A"}
                          </strong>

                          <div
                            style={{
                              color: "#64748b",
                              fontSize: 12,
                              marginTop: 4,
                            }}
                          >
                            {item.variant_title || "N/A"}
                          </div>

                          <div className="category-id-wrapper">
                            <span className="category-id-text">
                              {item.id ?? "N/A"}
                            </span>

                            {item.id != null && (
                              <button
                                type="button"
                                className="copy-id-btn"
                                title="Copy inventory ID"
                                onClick={() =>
                                  copyInventoryId(item.id)
                                }
                              >
                                <FaCopy size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      {item.sku_code ||
                        item.vendor_sku_code ||
                        "N/A"}
                    </td>

                    <td>
                      <span
                        className="category-code-badge"
                        style={badgeStyle}
                      >
                        {quantity}
                      </span>
                    </td>

                    <td>{formatCurrency(item.mrp)}</td>
                    <td>{formatCurrency(item.selling_price)}</td>

                    <td>
                      <span
                        className="category-code-badge"
                        style={{
                          ...badgeStyle,
                          textTransform: "capitalize",
                        }}
                      >
                        {statusLabel(stock)}
                      </span>
                    </td>

                    <td>
                      <span
                        className="category-code-badge"
                        style={approvalStyle}
                      >
                        {statusLabel(approval)}
                      </span>
                    </td>

                    <td
                      style={{
                        color: "#64748b",
                        fontSize: 12,
                      }}
                    >
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9">
                  <div className="empty-filter-state">
                    <div className="empty-filter-icon">
                      <FiSearch />
                    </div>

                    <h3>No Products Found</h3>
                    <p>
                      No inventory records found for this vendor.
                    </p>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                      >
                        <FiRefreshCw /> Reset Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="stock-pagination">
        <div className="stock-pagination-info">
          <span>
            Showing{" "}
            <strong>
              {totalCount === 0
                ? 0
                : (currentPage - 1) * PAGE_SIZE + 1}
              {" - "}
              {Math.min(
                (currentPage - 1) * PAGE_SIZE + products.length,
                totalCount
              )}
            </strong>{" "}
            of <strong>{totalCount}</strong> products
          </span>
        </div>

        <div className="stock-pagination-controls">
          <button
            type="button"
            className="stock-page-btn stock-prev-next"
            disabled={loading || currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>

          <span className="stock-page-ellipsis">
            Page {currentPage} of {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            className="stock-page-btn stock-prev-next"
            disabled={
              loading ||
              (totalCount > 0 && currentPage >= totalPages) ||
              (totalCount === 0 && !nextUrl)
            }
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Product Image Preview */}
      {previewImage && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => setPreviewImage("")}
        >
          <div
            className="prakriti-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="prakriti-modal-header">
              <h2>Product Image Preview</h2>

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPreviewImage("")}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ textAlign: "center", padding: 20 }}>
              <img
                src={previewImage}
                alt="Product preview"
                style={{
                  display: "block",
                  maxWidth: "100%",
                  maxHeight: "75vh",
                  margin: "0 auto",
                  objectFit: "contain",
                  borderRadius: 10,
                }}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setPreviewImage("")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        style={{ zIndex: 999999 }}
      />
    </div>
  );
};

export default VendorStock;