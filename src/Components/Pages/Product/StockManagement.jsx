

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaTimes,
  FaCopy,
  FaFileExcel,
  FaBox,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { FiRefreshCw, FiSearch } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import ExcelJS from "exceljs";
import "./StockManagement.css";

const INVENTORY_URL = `${BASE_URL}/inventory/admin/`;
const LOW_STOCK_THRESHOLD = 10;
const PAGE_SIZE = 10;

const StockManagement = () => {
  const navigate = useNavigate();

  const [Loading, setLoading] = useState(true);
  const [Error, setError] = useState(null);

  const [Data, setData] = useState([]);
  const [FilteredData, setFilteredData] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState("");

  const [summary, setSummary] = useState({
    low_stock: 0,
    out_of_stock: 0,
    pending_approval: 0,
    approved: 0,
    total_value: 0,
  });

  const [totalCount, setTotalCount] = useState(0);
  const [nextUrl, setNextUrl] = useState(null);
  const [previousUrl, setPreviousUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImage, setPreviewImage] = useState("");
  const [stockStatus, setStockStatus] = useState("");
const [approvalStatus, setApprovalStatus] = useState("");

  const getQuantity = (item) => Number(item.quantity ?? 0);

  const getStockStatus = (item) => {
    const quantity = getQuantity(item);

    if (quantity <= 0) return "out_of_stock";
    if (quantity <= LOW_STOCK_THRESHOLD) return "low_stock";

    return "in_stock";
  };

  const getApprovalStatus = (item) =>
    String(item.approval_status || "").trim().toLowerCase();

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

  const statusLabel = (status) => {
    if (!status) return "N/A";

    return String(status)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

const buildApiUrl = useCallback(
  (page = 1) => {
    const url = new URL(INVENTORY_URL);

    url.searchParams.set("page", String(page));
    url.searchParams.set("page_size", String(PAGE_SIZE));

    if (searchTerm.trim()) {
      url.searchParams.set("search", searchTerm.trim());
    }

    // Stock status filter
    if (stockStatus) {
      url.searchParams.set("filter", stockStatus);
    }

    // Pending / approved filter
    // API documentation supports these through "filter"
    if (approvalStatus) {
      url.searchParams.set("filter", approvalStatus);
    }

    return url.toString();
  },
  [searchTerm, stockStatus, approvalStatus]
);

  const getInventoryList = useCallback(
    async (url = buildApiUrl(1)) => {
      const token = sessionStorage.getItem("superadmin_token");

      if (!token) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
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

        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Failed to fetch inventory"
          );
        }

        // Supports the existing response format:
        // { success: true, data: { count, results, next, previous } }
        const inventoryData = result.data || {};

        const records = Array.isArray(inventoryData.results)
          ? inventoryData.results
          : [];

        setData(records);
        setFilteredData(records);

        // Count returned by the backend for the current query.
        setTotalCount(Number(inventoryData.count || 0));

        setNextUrl(inventoryData.next || null);
        setPreviousUrl(inventoryData.previous || null);

        const parsedUrl = new URL(url, window.location.origin);

        setCurrentPage(
          Number(parsedUrl.searchParams.get("page")) || 1
        );

        setSummary({
          low_stock: Number(
            inventoryData.summary?.low_stock ?? 0
          ),
          out_of_stock: Number(
            inventoryData.summary?.out_of_stock ?? 0
          ),
          pending_approval: Number(
            inventoryData.summary?.pending_approval ?? 0
          ),
          approved: Number(
            inventoryData.summary?.approved ?? 0
          ),
          total_value: Number(
            inventoryData.summary?.total_value ?? 0
          ),
        });
      } catch (error) {
        console.error("Inventory Fetch Error:", error);

        setError(
          error.message || "Failed to fetch inventory data"
        );

        setData([]);
        setFilteredData([]);
        setTotalCount(0);
        setNextUrl(null);
        setPreviousUrl(null);

        toast.error(
          error.message || "Failed to fetch inventory"
        );
      } finally {
        setLoading(false);
      }
    },
    [buildApiUrl, navigate]
  );

  // Initial load and backend search/filter.
  // Debounce search so the API is not called on every keystroke.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      getInventoryList(buildApiUrl(1));
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, inventoryFilter, buildApiUrl, getInventoryList]);

  // Reset all search and filter values.
  const clearFilters = () => {
    setSearchTerm("");
    setInventoryFilter("");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" || inventoryFilter !== "";

  // Refresh using the current page and active filters.
  const handleRefresh = () => {
    getInventoryList(buildApiUrl(currentPage));
  };

  // Backend pagination: use returned URLs.
  const handleNextPage = () => {
    if (!Loading && nextUrl) {
      getInventoryList(nextUrl);
    }
  };

  const handlePreviousPage = () => {
    if (!Loading && previousUrl) {
      getInventoryList(previousUrl);
    }
  };

  // Direct navigation uses page and page_size.
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const goToPage = (page) => {
    if (
      Loading ||
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    getInventoryList(buildApiUrl(page));
  };

  const pageNumbers = useMemo(() => {
    const pages = [];

    for (let page = 1; page <= totalPages; page++) {
      if (
        page === 1 ||
        page === totalPages ||
        Math.abs(page - currentPage) <= 1
      ) {
        pages.push(page);
      } else if (
        pages[pages.length - 1] !== "..." &&
        (page === currentPage - 2 ||
          page === currentPage + 2)
      ) {
        pages.push("...");
      }
    }

    return pages;
  }, [totalPages, currentPage]);

  // Copy inventory ID.
  const copyInventoryId = async (id) => {
    try {
      await navigator.clipboard.writeText(String(id ?? ""));
      toast.success("Inventory ID copied!");
    } catch (error) {
      console.error("Copy Error:", error);
      toast.error("Unable to copy inventory ID");
    }
  };

  // Export records currently displayed by the backend.
  const exportToExcel = async () => {
    if (!FilteredData.length) {
      toast.error("No inventory data available to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Stock Management");

      worksheet.columns = [
        { header: "#", key: "index", width: 8 },
        { header: "Product Name", key: "product_name", width: 32 },
        { header: "Variant", key: "variant_title", width: 35 },
        { header: "Inventory ID", key: "id", width: 25 },
        { header: "Vendor", key: "vendor", width: 32 },
        { header: "Vendor Code", key: "vendor_code", width: 18 },
        { header: "Vendor SKU", key: "vendor_sku", width: 22 },
        { header: "SKU Code", key: "sku_code", width: 25 },
        { header: "Brand", key: "brand", width: 22 },
        { header: "Quantity", key: "quantity", width: 14 },
        { header: "MRP (₹)", key: "mrp", width: 16 },
        {
          header: "Selling Price (₹)",
          key: "selling_price",
          width: 20,
        },
        { header: "Stock Status", key: "stock_status", width: 20 },
        {
          header: "Approval Status",
          key: "approval_status",
          width: 20,
        },
        { header: "Created At", key: "created_at", width: 20 },
        { header: "Updated At", key: "updated_at", width: 20 },
        { header: "Image Link", key: "image", width: 50 },
      ];

      FilteredData.forEach((item, index) => {
        const row = worksheet.addRow({
          index: (currentPage - 1) * PAGE_SIZE + index + 1,
          product_name: item.product_name || "N/A",
          variant_title: item.variant_title || "N/A",
          id: item.id || "N/A",
          vendor: item.vendor_business_name || "N/A",
          vendor_code: item.vendor_code || "N/A",
          vendor_sku: item.vendor_sku_code || "N/A",
          sku_code: item.sku_code || "N/A",
          brand: item.brand_name || "N/A",
          quantity: getQuantity(item),
          mrp: Number(item.mrp || 0),
          selling_price: Number(item.selling_price || 0),
          stock_status: statusLabel(getStockStatus(item)),
          approval_status: statusLabel(getApprovalStatus(item)),
          created_at: formatDate(item.created_at),
          updated_at: formatDate(item.updated_at),
          image: item.cover_image?.media_url || "N/A",
        });

        if (item.cover_image?.media_url) {
          const cell = row.getCell("image");

          cell.value = {
            text: "View Image",
            hyperlink: item.cover_image.media_url,
          };

          cell.font = {
            color: { argb: "0563C1" },
            underline: true,
          };
        }
      });

      worksheet.getRow(1).font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
      };

      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "0D614E" },
      };

      worksheet.getRow(1).alignment = {
        vertical: "middle",
        horizontal: "center",
      };

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin", color: { argb: "D1D5DB" } },
            left: { style: "thin", color: { argb: "D1D5DB" } },
            bottom: { style: "thin", color: { argb: "D1D5DB" } },
            right: { style: "thin", color: { argb: "D1D5DB" } },
          };

          cell.alignment = { vertical: "middle" };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `Stock_Management_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Excel exported successfully!");
    } catch (error) {
      console.error("Excel Export Error:", error);
      toast.error("Failed to export Excel");
    }
  };

  return (
    <>
      <div className="page-header">
        <h1>Stock Management</h1>
        <p className="page-paragraph">
          Manage inventory, monitor stock levels and review product approvals.
        </p>
      </div>

   
      <div className="stats2-grid">
        <div
          className="stat2-card"
          style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaBox size={16} />
          </div>
          <div className="stat2-info">
            <h3>Total Inventory Records</h3>
            <div className="stat2-value">{totalCount}</div>
          </div>
        </div>

        <div
          className="stat2-card"
          style={{ borderTopColor: "#d97706" }}
        >
          <div
            className="stat2-icon"
            style={{ background: "#d9770620", color: "#d97706" }}
          >
            <FaExclamationTriangle size={16} />
          </div>
          <div className="stat2-info">
            <h3>Low Stock</h3>
            <div className="stat2-value">{summary.low_stock}</div>
          </div>
        </div>

        <div
          className="stat2-card"
          style={{ borderTopColor: "#dc2626" }}
        >
          <div
            className="stat2-icon"
            style={{ background: "#dc262620", color: "#dc2626" }}
          >
            <FaBox size={16} />
          </div>
          <div className="stat2-info">
            <h3>Out of Stock</h3>
            <div className="stat2-value">{summary.out_of_stock}</div>
          </div>
        </div>

        <div
          className="stat2-card"
          style={{ borderTopColor: "#d97706" }}
        >
          <div
            className="stat2-icon"
            style={{ background: "#d9770620", color: "#d97706" }}
          >
            <FaCalendarAlt size={16} />
          </div>
          <div className="stat2-info">
            <h3>Pending Approval</h3>
            <div className="stat2-value">
              {summary.pending_approval}
            </div>
          </div>
        </div>

        <div
          className="stat2-card"
          style={{ borderTopColor: "#0D614E" }}
        >
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaCheckCircle size={16} />
          </div>
          <div className="stat2-info">
            <h3>Approved</h3>
            <div className="stat2-value">{summary.approved}</div>
          </div>
        </div>
      </div>

     
      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search SKU, variant, product or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

       
<select
  value={stockStatus}
  onChange={(e) => setStockStatus(e.target.value)}
  className="status-filter-select"
>
  <option value="">All Stock Status</option>
  <option value="in_stock">In Stock</option>
  <option value="low_stock">Low Stock</option>
  <option value="out_of_stock">Out of Stock</option>
</select>
<select
  value={approvalStatus}
  onChange={(e) => setApprovalStatus(e.target.value)}
  className="status-filter-select"
>
  <option value="">All Approval Status</option>
  <option value="pending_approval">Pending Approval</option>
  <option value="approved">Approved</option>
</select>


          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={clearFilters}
              title="Clear all filters"
              aria-label="Clear all filters"
            >
              <FiRefreshCw />
              Reset
            </button>
          )}
        </div>

        <div className="category-action-buttons">
          <button
            type="button"
            className="add-customer-btn"
            onClick={handleRefresh}
            disabled={Loading}
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            type="button"
            className="add-customer-btn"
            onClick={exportToExcel}
            disabled={Loading || !FilteredData.length}
          >
            <FaFileExcel />
            Export Excel
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
              <th>Quantity</th>
              <th>MRP</th>
              <th>Selling Price</th>
              <th>Stock Status</th>
              <th>Approval Status</th>
              <th>Created At</th>
            </tr>
          </thead>

          <tbody>
            {Loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan="8">
                    <div className="skeleton-row" />
                  </td>
                </tr>
              ))
            ) : Error ? (
              <tr>
                <td
                  colSpan="8"
                  style={{ color: "#dc2626", textAlign: "center" }}
                >
                  {Error}
                  <button
                    type="button"
                    onClick={handleRefresh}
                    style={{ marginLeft: "12px" }}
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ) : FilteredData.length > 0 ? (
              FilteredData.map((item, index) => {
                const quantity = getQuantity(item);
                const stockStatus = getStockStatus(item);
                const approvalStatus = getApprovalStatus(item);

                return (
                  <tr key={item.id ?? `${item.product_id}-${index}`}>
                    <td>
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>

                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          minWidth: "200px",
                        }}
                      >
                        {getImage(item) ? (
                          <img
                            src={getImage(item)}
                            alt={item.product_name || "Product"}
                            width="42"
                            height="42"
                            style={{
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              cursor: "pointer",
                              flexShrink: 0,
                            }}
                            onClick={() =>
                              setPreviewImage(getImage(item))
                            }
                            onError={(e) => {
                              e.currentTarget.style.visibility = "hidden";
                            }}
                          />
                        ) : (
                          <FaBox
                            style={{
                              color: "#9ca3af",
                              flexShrink: 0,
                            }}
                            size={22}
                          />
                        )}

                        <div>
                          <strong>{item.product_name || "N/A"}</strong>

                          <div
                            style={{
                              color: "#6b7280",
                              fontSize: "12px",
                              marginTop: "4px",
                            }}
                          >
                            {item.variant_title || "N/A"}
                          </div>

                          <div className="category-id-wrapper">
                            <span className="category-id-text">
                              {item.id ?? "N/A"}
                            </span>

                            <button
                              type="button"
                              className="copy-id-btn"
                              title="Copy inventory ID"
                              onClick={() => copyInventoryId(item.id)}
                            >
                              <FaCopy size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className="category-code-badge"
                        style={{
                          background:
                            quantity <= 0
                              ? "#fee2e2"
                              : quantity <= LOW_STOCK_THRESHOLD
                              ? "#fef3c7"
                              : "#dcfce7",
                          color:
                            quantity <= 0
                              ? "#b91c1c"
                              : quantity <= LOW_STOCK_THRESHOLD
                              ? "#92400e"
                              : "#166534",
                        }}
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
                          textTransform: "capitalize",
                          background:
                            stockStatus === "out_of_stock"
                              ? "#fee2e2"
                              : stockStatus === "low_stock"
                              ? "#fef3c7"
                              : "#dcfce7",
                          color:
                            stockStatus === "out_of_stock"
                              ? "#b91c1c"
                              : stockStatus === "low_stock"
                              ? "#92400e"
                              : "#166534",
                        }}
                      >
                        {statusLabel(stockStatus)}
                      </span>
                    </td>

                    <td>
                      <span
                        className="category-code-badge"
                        style={{
                          textTransform: "capitalize",
                          background:
                            approvalStatus === "approved"
                              ? "#dcfce7"
                              : approvalStatus === "rejected"
                              ? "#fee2e2"
                              : approvalStatus === "pending" ||
                                approvalStatus === "pending_approval"
                              ? "#fef3c7"
                              : "#f3f4f6",
                          color:
                            approvalStatus === "approved"
                              ? "#166534"
                              : approvalStatus === "rejected"
                              ? "#b91c1c"
                              : approvalStatus === "pending" ||
                                approvalStatus === "pending_approval"
                              ? "#92400e"
                              : "#374151",
                        }}
                      >
                        {statusLabel(approvalStatus)}
                      </span>
                    </td>

                    <td
                      style={{
                        color: "#6b7280",
                        fontSize: "14px",
                      }}
                    >
                      {formatDate(item.created_at)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8">
                  <div className="empty-filter-state">
                    <div className="empty-filter-icon">
                      <FiSearch />
                    </div>

                    <h3>No Inventory Found</h3>

                    <p>
                      No inventory records match your search or selected
                      filters.
                    </p>

                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                      >
                        <FiRefreshCw />
                        Reset Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    
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
                currentPage * PAGE_SIZE,
                totalCount
              )}
            </strong>{" "}
            of <strong>{totalCount}</strong> inventory records
          </span>
        </div>

        <div className="stock-pagination-controls">
          <button
            type="button"
            className="stock-page-btn stock-prev-next"
            disabled={!previousUrl || Loading}
            onClick={handlePreviousPage}
          >
            Previous
          </button>

          {pageNumbers.map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="stock-page-ellipsis"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                className={`stock-page-btn ${
                  currentPage === page ? "active" : ""
                }`}
                disabled={Loading || currentPage === page}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            className="stock-page-btn stock-prev-next"
            disabled={!nextUrl || Loading}
            onClick={handleNextPage}
          >
            Next
          </button>
        </div>
      </div>

    
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

            <div style={{ textAlign: "center", padding: "20px" }}>
              <img
                src={previewImage}
                alt="Product preview"
                style={{
                  display: "block",
                  maxWidth: "100%",
                  maxHeight: "75vh",
                  margin: "0 auto",
                  objectFit: "contain",
                  borderRadius: "10px",
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
        autoClose={5000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        style={{ zIndex: 999999 }}
      />
    </>
  );
};

export default StockManagement;


