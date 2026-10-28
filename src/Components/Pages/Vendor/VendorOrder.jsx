
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaTimes,
  FaShoppingBag,
  FaBox,
  FaClock,
  FaCheckCircle,
  FaUndo,
  FaBan,
  FaEye,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import BASE_URL from "../../../Base";
import "./VendorOrder.css";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "dispatched", label: "Dispatched" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

const PAYMENT_OPTIONS = [
  { value: "", label: "All payment types" },
  { value: "cod", label: "Cash on Delivery" },
  // { value: "online", label: "Online" },
  { value: "prepaid", label: "Prepaid" },
];

const formatCurrency = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) return "₹0.00";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const titleCase = (value) =>
  String(value || "—")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getStatusClass = (status) =>
  String(status || "pending")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

const getCustomerName = (order) =>
  order?.customer?.full_name ||
  order?.customer?.name ||
  order?.customer_name ||
  "Customer";

const getOrderCode = (order) =>
  order?.order_display_code ||
  order?.order_code ||
  order?.order_id ||
  order?.id ||
  "—";

const getOrderTotal = (order) =>
  order?.total_amount ??
  order?.grand_total ??
  order?.amount ??
  0;

const getItems = (order) => {
  if (Array.isArray(order?.items)) return order.items;
  if (Array.isArray(order?.order_items)) return order.order_items;
  return [];
};

const renderAddress = (address) => {
  if (!address) return "Address not available";
  if (typeof address === "string") return address;

  return [
    address.full_name || address.name,
    address.address_line_1 || address.address_line1 || address.street,
    address.address_line_2 || address.address_line2,
    address.landmark,
    address.city,
    address.state,
    address.pincode || address.postal_code || address.zip_code,
    address.phone_number || address.phone,
  ]
    .filter(Boolean)
    .join(", ") || "Address not available";
};

const VendorOrder = ({ vendorId }) => {
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalCounts, setTotalCounts] = useState({});
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchOrders = useCallback(
    async (signal) => {
      if (!vendorId) {
        setOrders([]);
        setTotalCount(0);
        setTotalCounts({});
        setError("Vendor ID is missing.");
        setLoading(false);
        return;
      }

      const token = sessionStorage.getItem("superadmin_token");

      if (!token) {
        toast.error("Session expired. Please login again.");
        window.location.assign("/login");
        return;
      }

      setLoading(true);
      setError("");

      try {
        // All filters are sent to the backend.
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(PAGE_SIZE),
          vendor_id: String(vendorId),
          search,
          status: statusFilter,
          payment_type: paymentFilter,
          from_date: fromDate,
          to_date: toDate,
        });

        const response = await fetch(
          `${BASE_URL}/order/admin/?${params.toString()}`,
          {
            method: "GET",
            signal,
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
              "ngrok-skip-browser-warning": "true",
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem("superadmin_token");
          toast.error("Session expired. Please login again.");
          window.location.assign("/login");
          return;
        }

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          throw new Error(
            "The orders API did not return JSON. Please verify the API URL."
          );
        }

        const result = await response.json();

        if (!response.ok || result?.success === false) {
          throw new Error(
            result?.message || "Failed to fetch vendor orders."
          );
        }

        const data = result?.data ?? {};

        // Supports paginated and plain-array response formats.
        const results = Array.isArray(data.results)
          ? data.results
          : Array.isArray(data)
          ? data
          : Array.isArray(result.results)
          ? result.results
          : [];

        const count = Number(
          data.count ?? result.count ?? results.length
        );

        setOrders(results);
        setTotalCount(Number.isFinite(count) ? count : results.length);

        setTotalCounts(
          data.total_counts ??
          result.total_counts ??
          {}
        );
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Vendor orders fetch error:", err);
        setError(err.message || "Unable to load vendor orders.");
        setOrders([]);
        setTotalCount(0);
        setTotalCounts({});
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [
      vendorId,
      page,
      search,
      statusFilter,
      paymentFilter,
      fromDate,
      toDate,
      refreshKey,
    ]
  );

  // Fetch whenever the page, search, or filters change.
  useEffect(() => {
    const controller = new AbortController();

    fetchOrders(controller.signal);

    return () => controller.abort();
  }, [fetchOrders]);

  const maxPage = Math.max(
    1,
    Math.ceil(totalCount / PAGE_SIZE)
  );

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Orders",
        value: totalCounts.orders ?? totalCount,
        icon: <FaShoppingBag />,
        className: "vo-summary-total",
      },
      {
        label: "Pending",
        value: totalCounts.pending ?? 0,
        icon: <FaClock />,
        className: "vo-summary-pending",
      },
      {
        label: "Processing",
        value: totalCounts.processing ?? 0,
        icon: <FaBox />,
        className: "vo-summary-processing",
      },
      {
        label: "Delivered",
        value: totalCounts.delivered ?? 0,
        icon: <FaCheckCircle />,
        className: "vo-summary-delivered",
      },
      {
        label: "Cancelled",
        value: totalCounts.cancelled ?? 0,
        icon: <FaBan />,
        className: "vo-summary-cancelled",
      },
      {
        label: "Returned",
        value: totalCounts.returned ?? 0,
        icon: <FaUndo />,
        className: "vo-summary-returned",
      },
    ],
    [totalCounts, totalCount]
  );

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("");
    setPaymentFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const hasFilters = Boolean(
    searchInput ||
    statusFilter ||
    paymentFilter ||
    fromDate ||
    toDate
  );

  const closeDrawer = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  useEffect(() => {
    if (!selectedOrder) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDrawer();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedOrder, closeDrawer]);

  const refreshOrders = () => {
    setRefreshKey((current) => current + 1);
  };

  return (
    <section className="vendor-orders-page">
      {/* Page heading */}
      <div className="vo-page-heading">
        <div>
          <h2>Vendor Orders</h2>
          <p>View and track orders placed for this vendor.</p>
        </div>

        <button
          type="button"
          className="vo-refresh-btn"
          onClick={refreshOrders}
          disabled={loading}
        >
          <FaSyncAlt
            className={loading ? "vo-spinning" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="vo-summary-grid">
        {summaryCards.map((card) => (
          <div
            className={`vo-summary-card ${card.className}`}
            key={card.label}
          >
            <div className="vo-summary-icon">{card.icon}</div>

            <div className="vo-summary-copy">
              <span>{card.label}</span>
              <strong>
                {Number(card.value || 0).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* Search and filters */}
      <div className="vo-toolbar">
        <div className="vo-search-box">
          <FaSearch />

          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search order ID, code, customer..."
            aria-label="Search vendor orders"
          />

          {searchInput && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setSearchInput("");
                setSearch("");
                setPage(1);
              }}
            >
              <FaTimes />
            </button>
          )}
        </div>

        <select
          className="vo-status-select"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by order status"
        >
          {STATUS_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          className="vo-status-select"
          value={paymentFilter}
          onChange={(event) => {
            setPaymentFilter(event.target.value);
            setPage(1);
          }}
          aria-label="Filter by payment type"
        >
          {PAYMENT_OPTIONS.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="vo-date-filter">
          <label htmlFor="vo-from-date">From</label>
          <input
            id="vo-from-date"
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(event) => {
              setFromDate(event.target.value);
              setPage(1);
            }}
            aria-label="From date"
          />
        </div>

        <div className="vo-date-filter">
          <label htmlFor="vo-to-date">To</label>
          <input
            id="vo-to-date"
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(event) => {
              setToDate(event.target.value);
              setPage(1);
            }}
            aria-label="To date"
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            className="vo-reset-btn"
            onClick={resetFilters}
          >
            <FaTimes /> Clear
          </button>
        )}
      </div>

      {error && (
        <div className="vo-error-state">
          <p>{error}</p>
          <button type="button" onClick={refreshOrders}>
            Try again
          </button>
        </div>
      )}

      {/* Orders table */}
      <div className="vo-table-card">
        <div className="vo-table-scroll">
          <table className="vo-orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="vo-table-message">
                    <span className="vo-loader" />
                    Loading vendor orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="vo-table-message">
                    <div className="vo-empty-icon">
                      <FaShoppingBag />
                    </div>
                    <strong>No orders found</strong>
                    <span>
                      {hasFilters
                        ? "Try changing your search or filters."
                        : "There are no orders for this vendor yet."}
                    </span>
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => {
                  const status = order.status || "pending";
                  const customer = order.customer || {};
                  const items = getItems(order);

                  return (
                    <tr
                      key={
                        order.order_id ||
                        order.id ||
                        `${getOrderCode(order)}-${index}`
                      }
                    >
                      <td>
                        <div className="vo-order-code">
                          <strong>#{getOrderCode(order)}</strong>
                          <span>
                            {order.order_id || order.id || "Order"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="vo-customer-cell">
                          <div className="vo-avatar">
                            {getCustomerName(order)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{getCustomerName(order)}</strong>
                            <span>
                              {customer.phone_number ||
                                customer.phone ||
                                order.customer_phone ||
                                "—"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        {formatDate(
                          order.date ||
                          order.created_at ||
                          order.order_date
                        )}
                      </td>

                      <td>
                        <span className="vo-items-count">
                          <FaBox />{" "}
                          {order.items_count ?? items.length}
                        </span>
                      </td>

                      <td>
                        <span className="vo-payment-type">
                          {titleCase(
                            order.payment_type ||
                            order.payment_method ||
                            "—"
                          )}
                        </span>
                      </td>

                      <td className="vo-amount">
                        {formatCurrency(getOrderTotal(order))}
                      </td>

                      <td>
                        <span
                          className={`vo-status-badge vo-status-${getStatusClass(
                            status
                          )}`}
                        >
                          {titleCase(status)}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="vo-view-btn"
                          onClick={() => setSelectedOrder(order)}
                          aria-label={`View order ${getOrderCode(order)}`}
                        >
                          <FaEye /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-side pagination */}
        <div className="vo-pagination">
          <span>
            Showing{" "}
            {totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
            –
            {Math.min(page * PAGE_SIZE, totalCount)} of{" "}
            {totalCount} orders
          </span>

          <div className="vo-pagination-actions">
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              disabled={page <= 1 || loading}
              aria-label="Previous page"
            >
              <FaChevronLeft /> Previous
            </button>

            <span>
              Page {page} of {maxPage}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(maxPage, current + 1)
                )
              }
              disabled={page >= maxPage || loading}
              aria-label="Next page"
            >
              Next <FaChevronRight />
            </button>
          </div>
        </div>
      </div>

      {/* Order details drawer */}
      {selectedOrder && (
        <div
          className="vo-drawer-overlay"
          onClick={closeDrawer}
        >
          <aside
            className="vo-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Order details ${getOrderCode(selectedOrder)}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="vo-drawer-header">
              <div>
                <span className="vo-drawer-eyebrow">
                  ORDER DETAILS
                </span>

                <h2>#{getOrderCode(selectedOrder)}</h2>

                <span
                  className={`vo-status-badge vo-status-${getStatusClass(
                    selectedOrder.status
                  )}`}
                >
                  {titleCase(selectedOrder.status)}
                </span>
              </div>

              <button
                type="button"
                className="vo-drawer-close"
                onClick={closeDrawer}
                aria-label="Close order details"
              >
                <IoClose />
              </button>
            </div>

            <div className="vo-drawer-body">
              <section className="vo-detail-section">
                <h3>
                  <FaUser /> Customer Information
                </h3>

                <div className="vo-detail-info-card">
                  <strong>{getCustomerName(selectedOrder)}</strong>

                  <p>
                    <FaPhone />
                    {selectedOrder.customer?.phone_number ||
                      selectedOrder.customer?.phone ||
                      selectedOrder.customer_phone ||
                      "Phone not available"}
                  </p>

                  <p>
                    <FaEnvelope />
                    {selectedOrder.customer?.email ||
                      selectedOrder.customer_email ||
                      "Email not available"}
                  </p>
                </div>
              </section>

              <section className="vo-detail-section">
                <h3>
                  <FaCalendarAlt /> Order Information
                </h3>

                <div className="vo-detail-grid">
                  <div>
                    <span>Order Date</span>
                    <strong>
                      {formatDate(
                        selectedOrder.date ||
                        selectedOrder.created_at ||
                        selectedOrder.order_date
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Order ID</span>
                    <strong>
                      {selectedOrder.order_id ||
                        selectedOrder.id ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Payment Method</span>
                    <strong>
                      {titleCase(
                        selectedOrder.payment_method ||
                        selectedOrder.payment_type ||
                        "—"
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Payment Type</span>
                    <strong>
                      {titleCase(selectedOrder.payment_type || "—")}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="vo-detail-section">
                <h3>
                  <FaMapMarkerAlt /> Delivery Address
                </h3>

                <div className="vo-detail-info-card vo-address-card">
                  {renderAddress(
                    selectedOrder.address ||
                    selectedOrder.shipping_address
                  )}
                </div>
              </section>

              <section className="vo-detail-section">
                <h3>
                  <FaShoppingBag /> Products (
                  {getItems(selectedOrder).length})
                </h3>

                {getItems(selectedOrder).length ? (
                  <div className="vo-product-list">
                    {getItems(selectedOrder).map((item, index) => {
                      const quantity = Number(item.quantity ?? 1);
                      const price = Number(item.price ?? 0);

                      return (
                        <div
                          className="vo-product-row"
                          key={
                            item.id ||
                            item.variant_id ||
                            `${item.product_name || "item"}-${index}`
                          }
                        >
                          {item.cover_image ? (
                            <img
                              src={item.cover_image}
                              alt={item.product_name || "Product"}
                            />
                          ) : (
                            <div className="vo-product-placeholder">
                              <FaBox />
                            </div>
                          )}

                          <div className="vo-product-info">
                            <strong>
                              {item.product_name ||
                                item.name ||
                                "Product"}
                            </strong>

                            {item.brand_name && (
                              <span>Brand: {item.brand_name}</span>
                            )}

                            {item.variant_name && (
                              <span>
                                Variant: {item.variant_name}
                              </span>
                            )}

                            {item.sku_code && (
                              <span>SKU: {item.sku_code}</span>
                            )}

                            <span>
                              Qty: {quantity} ×{" "}
                              {formatCurrency(item.price ?? item.total_amount)}
                            </span>
                          </div>

                          <strong className="vo-product-total">
                            {formatCurrency(
                              item.total_amount ??
                              price * quantity
                            )}
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="vo-detail-info-card">
                    Product items are not available in this response.
                  </div>
                )}
              </section>

              <section className="vo-total-card">
                <span>Total Amount</span>
                <strong>
                  {formatCurrency(getOrderTotal(selectedOrder))}
                </strong>
              </section>
            </div>

            <div className="vo-drawer-footer">
              <button
                type="button"
                className="vo-drawer-done"
                onClick={closeDrawer}
              >
                Close Details
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
};

export default VendorOrder;
