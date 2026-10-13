
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaSearch,
  FaTimes,
  FaCopy,
  FaFileExcel,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExcelJS from "exceljs";
import BASE_URL from "../../../Base";

const Customerpurchase = () => {
  const navigate = useNavigate();

  const [Loading, setLoading] = useState(true);
  const [Error, setError] = useState(null);
  const [Data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // --------------------------------------------------
  // Helpers
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price, currency = "INR") => {
    if (price === null || price === undefined || price === "") {
      return "N/A";
    }

    const amount = Number(price);

    if (Number.isNaN(amount)) return String(price);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getCustomerName = (item) => {
    const customer = item.customer || {};

    const name = [
      customer.first_name,
      customer.last_name,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return name || item.patient_name || "N/A";
  };

  const getPatientName = (item) => {
    const patient = item.patient || {};

    return (
      [
        patient.first_name,
        patient.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      item.patient_name ||
      "N/A"
    );
  };

  const getPackageName = (item) =>
    item.package_name_snapshot ||
    item.package_snapshot?.name ||
    "N/A";

  const getStatusClass = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "active") return "active";
    if (normalized === "expired") return "inactive";
    if (normalized === "cancelled" || normalized === "canceled") {
      return "inactive";
    }
    if (normalized === "pending") return "pending";

    return "default";
  };

  const copyText = async (value, label) => {
    if (!value) {
      toast.error(`${label} not available`);
      return;
    }

    try {
      await navigator.clipboard.writeText(String(value));
      toast.success(`${label} copied successfully`);
    } catch {
      toast.error(`Unable to copy ${label}`);
    }
  };

  // --------------------------------------------------
  // Fetch all package purchases, including next pages
  // --------------------------------------------------

  const getPackageBuyers = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let requestUrl = `${BASE_URL}/packages/admin/purchases/`;
      let allBuyers = [];
      const visitedUrls = new Set();

      while (requestUrl && !visitedUrls.has(requestUrl)) {
        visitedUrls.add(requestUrl);

        const response = await fetch(requestUrl, {
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
            result.message || "Failed to fetch package buyers"
          );
        }

        // API format:
        // { success: true, data: { count, next, results: [] } }
        const pageData = result.data;

        const pageResults = Array.isArray(pageData)
          ? pageData
          : Array.isArray(pageData?.results)
          ? pageData.results
          : [];

        allBuyers = [...allBuyers, ...pageResults];

        const nextPage = Array.isArray(pageData)
          ? null
          : pageData?.next;

        if (!nextPage) {
          requestUrl = null;
        } else if (/^https?:\/\//i.test(nextPage)) {
          requestUrl = nextPage;
        } else {
          requestUrl = `${BASE_URL}${nextPage.startsWith("/") ? "" : "/"}${nextPage}`;
        }
      }

      allBuyers.sort(
        (a, b) =>
          new Date(b.created_at || b.paid_at || 0).getTime() -
          new Date(a.created_at || a.paid_at || 0).getTime()
      );

      setData(allBuyers);
    } catch (error) {
      console.error("Package Buyers Fetch Error:", error);
      setError(error.message || "Something went wrong while fetching buyers");
      toast.error(error.message || "Failed to fetch package buyers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPackageBuyers();
    // Fetch on page mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------------------------------
  // Stats
  // --------------------------------------------------

  const stats = useMemo(() => {
    return {
      total: Data.length,
      active: Data.filter(
        (item) => String(item.status || "").toLowerCase() === "active"
      ).length,
      shifted: Data.filter(
        (item) => String(item.shift_status || "").toLowerCase() === "shifted"
      ).length,
    };
  }, [Data]);

  // --------------------------------------------------
  // Search and status filter
  // --------------------------------------------------

  const FilteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return Data.filter((item) => {
      const customer = item.customer || {};
      const patient = item.patient || {};

      const searchableValues = [
        getCustomerName(item),
        getPatientName(item),
        customer.phone_number,
        customer.email,
        getPackageName(item),
        item.id,
        item.patient_id,
        item.package,
        item.razorpay_order_id,
        item.razorpay_payment_id,
        item.status,
        
      ];

      const matchesSearch =
        !term ||
        searchableValues.some((value) =>
          String(value || "").toLowerCase().includes(term)
        );

      const matchesStatus =
        statusFilter === "all" ||
        String(item.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [Data, searchTerm, statusFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // --------------------------------------------------
  // Excel export
  // --------------------------------------------------

  const exportToExcel = async () => {
    if (!FilteredData.length) {
      toast.error("No package buyer records available to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Super Admin";

      const worksheet = workbook.addWorksheet("Package Buyers");

      worksheet.columns = [
        { header: "#", key: "index", width: 8 },
        { header: "Purchase ID", key: "id", width: 38 },
        { header: "Buyer Name", key: "buyer", width: 25 },
        { header: "Phone Number", key: "phone", width: 20 },
        { header: "Email", key: "email", width: 30 },
        { header: "Patient Name", key: "patient", width: 25 },
        { header: "Patient ID", key: "patientId", width: 38 },
        { header: "Package Name", key: "package", width: 38 },
        { header: "Package ID", key: "packageId", width: 38 },
        { header: "Category", key: "category", width: 25 },
        { header: "Paid Price", key: "paid", width: 16 },
        { header: "Original Price", key: "original", width: 16 },
        { header: "Currency", key: "currency", width: 12 },
        { header: "Purchase Status", key: "status", width: 18 },
        { header: "Billing Mode", key: "billing", width: 18 },
        { header: "Purchase Type", key: "purchaseType", width: 20 },
        { header: "Payment Date", key: "paidAt", width: 24 },
        { header: "Start Date", key: "startsAt", width: 24 },
        { header: "Expiry Date", key: "expiresAt", width: 24 },
        { header: "Razorpay Order ID", key: "orderId", width: 30 },
        { header: "Razorpay Payment ID", key: "paymentId", width: 30 },
        { header: "Subscription ID", key: "subscriptionId", width: 30 },
        { header: "Shift Status", key: "shiftStatus", width: 18 },
        { header: "Shifted To", key: "shiftedTo", width: 38 },
        { header: "Benefits", key: "benefits", width: 50 },
        { header: "Entitlements", key: "entitlements", width: 50 },
        { header: "Created At", key: "createdAt", width: 24 },
      ];

      FilteredData.forEach((item, index) => {
        const customer = item.customer || {};
        const patient = item.patient || {};
        const snapshot = item.package_snapshot || {};

        const benefits = Array.isArray(item.benefits_snapshot?.includes)
          ? item.benefits_snapshot.includes.join(", ")
          : "";

        const entitlements = Array.isArray(item.entitlements)
          ? item.entitlements
              .map((entitlement) => {
                const quantity =
                  entitlement.quantity_total !== null &&
                  entitlement.quantity_total !== undefined
                    ? ` (${entitlement.quantity_remaining ?? "N/A"}/${entitlement.quantity_total} remaining)`
                    : "";

                return `${entitlement.label || "Benefit"}${quantity}`;
              })
              .join("; ")
          : "";

        worksheet.addRow({
          index: index + 1,
          id: item.id || "N/A",
          buyer: getCustomerName(item),
          phone: customer.phone_number || "N/A",
          email: customer.email || "N/A",
          patient: getPatientName(item),
          patientId: item.patient_id || patient.id || "N/A",
          package: getPackageName(item),
          packageId: item.package || snapshot.id || "N/A",
          category: snapshot.category_name || snapshot.category || "N/A",
          paid: item.paid_price ?? "N/A",
          original: item.original_price ?? snapshot.original_price ?? "N/A",
          currency: item.currency || "INR",
          status: item.status || "N/A",
          billing: item.billing_mode || snapshot.billing_mode || "N/A",
          purchaseType: snapshot.purchase_type || "N/A",
          paidAt: formatDate(item.paid_at),
          startsAt: formatDate(item.starts_at),
          expiresAt: formatDate(item.expires_at),
          orderId: item.razorpay_order_id || "N/A",
          paymentId: item.razorpay_payment_id || "N/A",
          subscriptionId: item.razorpay_subscription_id || "N/A",
          shiftStatus: item.shift_status || "N/A",
          shiftedTo: item.consumables_shifted_to || "N/A",
          benefits,
          entitlements,
          createdAt: formatDate(item.created_at),
        });
      });

      worksheet.views = [{ state: "frozen", ySplit: 1 }];

      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: worksheet.columns.length },
      };

      worksheet.getRow(1).height = 28;
      worksheet.getRow(1).font = {
        bold: true,
        color: { argb: "FFFFFFFF" },
        size: 11,
      };

      worksheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0D614E" },
      };

      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.alignment = {
            vertical: "middle",
            wrapText: true,
          };

          cell.border = {
            top: { style: "thin", color: { argb: "FFD1D5DB" } },
            left: { style: "thin", color: { argb: "FFD1D5DB" } },
            bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
            right: { style: "thin", color: { argb: "FFD1D5DB" } },
          };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `Package_Buyers_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      toast.success("Package buyer Excel exported successfully");
    } catch (error) {
      console.error("Package Buyer Excel Export Error:", error);
      toast.error("Failed to export package buyer records");
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      <div className="page-header">
        <h1>Package Buyer Management</h1>
        <p className="page-paragraph">
          View customer package purchases, payment details and benefits.
        </p>
      </div>

      <div className="stats2-grid">
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaUsers size={16} />
          </div>
          <div className="stat2-info">
            <h3>Total Purchases</h3>
            <div className="stat2-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaChartLine size={16} />
          </div>
          <div className="stat2-info">
            <h3>Active Purchases</h3>
            <div className="stat2-value">{stats.active}</div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaCalendarAlt size={16} />
          </div>
          <div className="stat2-info">
            <h3>Shifted Purchases</h3>
            <div className="stat2-value">{stats.shifted}</div>
          </div>
        </div>
      </div>

      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search buyer, phone, package, payment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />

            {searchTerm && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="status-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {(searchTerm || statusFilter !== "all") && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={clearFilters}
              title="Reset filters"
            >
              <FiRefreshCw />
            </button>
          )}
        </div>

        <div className="category-action-buttons">
          <button
            type="button"
            className="add-customer-btn"
            onClick={exportToExcel}
            disabled={!FilteredData.length}
          >
            <FaFileExcel />
            Export Excel
          </button>

          <button
            type="button"
            className="add-customer-btn"
            onClick={getPackageBuyers}
            disabled={Loading}
          >
            <FiRefreshCw />
            {Loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Buyer Details</th>
              <th>Package Details</th>
              <th>Paid Price</th>
              <th>Purchase Status</th>
              <th>Billing</th>
              <th>Purchase Date</th>
             
              <th>Payment Details</th>
            </tr>
          </thead>

          <tbody>
            {Loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan="9">
                    <div className="skeleton-row" />
                  </td>
                </tr>
              ))
            ) : Error ? (
              <tr>
                <td
                  colSpan="9"
                  style={{ color: "#dc2626", textAlign: "center" }}
                >
                  {Error}
                </td>
              </tr>
            ) : FilteredData.length > 0 ? (
              FilteredData.map((item, index) => {
                const customer = item.customer || {};
                const snapshot = item.package_snapshot || {};

                return (
                  <tr key={item.id || index}>
                    <td>{index + 1}</td>

                    <td>
                      <strong>{getCustomerName(item)}</strong>

                      <div className="category-id-wrapper">
                        <span className="category-id-text">
                          {customer.phone_number || "No phone"}
                        </span>

                        {customer.phone_number && (
                          <button
                            type="button"
                            className="copy-id-btn"
                            title="Copy phone number"
                            onClick={() =>
                              copyText(customer.phone_number, "Phone number")
                            }
                          >
                           
                          </button>
                        )}
                      </div>

                     

                      <div className="category-id-wrapper">
                        <span className="category-id-text">
                          ID: {item.id || "N/A"}
                        </span>

                        {item.id && (
                          <button
                            type="button"
                            className="copy-id-btn"
                            title="Copy purchase ID"
                            onClick={() =>
                              copyText(item.id, "Purchase ID")
                            }
                          >
                            <FaCopy size={12} />
                          </button>
                        )}
                      </div>
                    </td>

                    <td>
                      <strong>{getPackageName(item)}</strong>

                   

                    
                    </td>

                    <td>
                      <strong style={{ color: "#0D614E" }}>
                        {formatPrice(item.paid_price, item.currency)}
                      </strong>

                      
                    </td>

                    <td>
                      <span
                        className={`category-code-badge ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {item.status || "N/A"}
                      </span>
                    </td>

                    <td>
                      <div>{item.billing_mode || "N/A"}</div>
                     
                    </td>

                    <td>
                      <div>{formatDate(item.paid_at || item.created_at)}</div>


                   
                    </td>

                   

                    <td>
                     

                      <div className="category-id-wrapper">
                        <span className="category-id-text">
                          {item.razorpay_order_id || "N/A"}
                        </span>

                        {item.razorpay_order_id && (
                          <button
                            type="button"
                            className="copy-id-btn"
                            title="Copy order ID"
                            onClick={() =>
                              copyText(item.razorpay_order_id, "Order ID")
                            }
                          >
                            <FaCopy size={12} />
                          </button>
                        )}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          marginTop: "7px",
                          marginBottom: "4px",
                        }}
                      >
                        Payment ID
                      </div>

                      <div className="category-id-wrapper">
                        <span className="category-id-text">
                          {item.razorpay_payment_id || "N/A"}
                        </span>

                        {item.razorpay_payment_id && (
                          <button
                            type="button"
                            className="copy-id-btn"
                            title="Copy payment ID"
                            onClick={() =>
                              copyText(
                                item.razorpay_payment_id,
                                "Payment ID"
                              )
                            }
                          >
                            <FaCopy size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9">
                  <div className="empty-filter-state">
                    <div className="empty-filter-icon">
                      <FaUsers />
                    </div>

                    <h3>
                      {searchTerm || statusFilter !== "all"
                        ? "No Buyers Found"
                        : "No Package Purchases Available"}
                    </h3>

                    <p>
                      {searchTerm || statusFilter !== "all"
                        ? "No purchase records match your search or selected status."
                        : "Customer package purchase records will appear here."}
                    </p>

                    {(searchTerm || statusFilter !== "all") && (
                      <button type="button" onClick={clearFilters}>
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

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export default Customerpurchase;
