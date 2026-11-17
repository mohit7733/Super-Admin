
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUsers,
  FaChartLine,
  FaSearch,
  FaTimes,
  FaFileExcel,
  FaEye,
  FaCopy,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";

import {
  FiSearch,
  FiRefreshCw,
  FiCreditCard,
} from "react-icons/fi";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ExcelJS from "exceljs";
import BASE_URL from "../../../Base";
import "./DietPlanPurchase.css";

const DietPlanPurchase = () => {
  const navigate = useNavigate();

  // ================================
  // STATES
  // ================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchases, setPurchases] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    pending: 0,
    failed: 0,
    cancelled: 0,
    refunded: 0,
    active_assignments: 0,
  });

  // Backend search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("");
  const [dietPlanId, setDietPlanId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [paymentGateway, setPaymentGateway] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  // Details modal
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // ================================
  // SEARCH DEBOUNCE
  // ================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ================================
  // GET DIET PURCHASES
  // BACKEND SEARCH + FILTER
  // ================================

  const getPurchases = async (currentPage, signal) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      params.append("page", currentPage);
      params.append("page_size", pageSize);

      // Search
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      // Payment Status
      if (statusFilter) {
        params.append("status", statusFilter);
      }

      // Diet Plan UUID
      if (dietPlanId.trim()) {
        params.append("diet_plan_id", dietPlanId.trim());
      }

      // Customer UUID
      if (customerId.trim()) {
        params.append("customer_id", customerId.trim());
      }

      // Patient UUID
      if (patientId.trim()) {
        params.append("patient_id", patientId.trim());
      }

      // Payment Gateway
      if (paymentGateway.trim()) {
        params.append("payment_gateway", paymentGateway.trim());
      }

      // Assignment Status
      if (assignmentFilter) {
        params.append("assignment_status", assignmentFilter);
      }

      const response = await fetch(
        `${BASE_URL}/diet/admin/purchases/?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          signal,
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to fetch purchases"
        );
      }

      const result = data?.data || {};

      setPurchases(
        Array.isArray(result.results) ? result.results : []
      );

      setTotalCount(Number(result.count) || 0);
      setNextPage(result.next || null);
      setPreviousPage(result.previous || null);

      setStats({
        total: Number(result.stats?.total) || 0,
        success: Number(result.stats?.success) || 0,
        pending: Number(result.stats?.pending) || 0,
        failed: Number(result.stats?.failed) || 0,
        cancelled: Number(result.stats?.cancelled) || 0,
        refunded: Number(result.stats?.refunded) || 0,
        active_assignments:
          Number(result.stats?.active_assignments) || 0,
      });

    } catch (err) {
      if (err.name === "AbortError") return;

      console.error("Diet Purchase Fetch Error:", err);

      setError(err.message || "Something went wrong");
      toast.error(
        err.message || "Failed to fetch diet purchases"
      );

    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  // ================================
  // FETCH EFFECT
  // ================================

  useEffect(() => {
    const controller = new AbortController();

    getPurchases(page, controller.signal);

    return () => controller.abort();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    debouncedSearch,
    statusFilter,
    assignmentFilter,
    dietPlanId,
    customerId,
    patientId,
    paymentGateway,
  ]);

  // Backend already returns filtered records
  const filteredData = purchases;

  // ================================
  // CLEAR FILTERS
  // ================================

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");

    setStatusFilter("");
    setAssignmentFilter("");

    setDietPlanId("");
    setCustomerId("");
    setPatientId("");
    setPaymentGateway("");

    setPage(1);
  };

  // ================================
  // FORMAT PRICE
  // ================================

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  };

  // ================================
  // FORMAT DATE
  // ================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ================================
  // CUSTOMER NAME
  // ================================

  const getCustomerName = (item) => {
    return (
      [
        item.customer?.first_name,
        item.customer?.last_name,
      ]
        .filter(Boolean)
        .join(" ") || "N/A"
    );
  };

  // ================================
  // PATIENT NAME
  // ================================

  const getPatientName = (item) => {
    return (
      item.patient_name ||
      [
        item.patient?.first_name,
        item.patient?.last_name,
      ]
        .filter(Boolean)
        .join(" ") ||
      "N/A"
    );
  };

  // ================================
  // COPY TO CLIPBOARD
  // ================================

  const copyToClipboard = (value, label) => {
    if (!value) return;

    if (!navigator.clipboard?.writeText) {
      toast.error("Clipboard is not available");
      return;
    }

    navigator.clipboard
      .writeText(String(value))
      .then(() => {
        toast.success(`${label} copied successfully`);
      })
      .catch(() => {
        toast.error("Unable to copy");
      });
  };

  // ================================
  // VIEW PURCHASE DETAILS
  // ================================

  const handleViewDetails = (item) => {
    setSelectedPurchase(item);
    setShowDetailModal(true);
  };

  // ================================
  // EXCEL EXPORT
  // ================================

  const exportToExcel = async () => {
    if (!filteredData.length) {
      toast.error("No purchase data available to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();

      const worksheet = workbook.addWorksheet("Diet Purchases");

      worksheet.columns = [
        { header: "#", key: "index", width: 8 },
        { header: "Purchase ID", key: "id", width: 40 },
        { header: "Diet Plan", key: "dietPlan", width: 35 },
        { header: "Customer", key: "customer", width: 25 },
        { header: "Phone Number", key: "phone", width: 20 },
        { header: "Patient", key: "patient", width: 25 },
        { header: "Listed Price", key: "listedPrice", width: 18 },
        { header: "Paid Price", key: "paidPrice", width: 18 },
        { header: "GST Amount", key: "gst", width: 18 },
        { header: "Payment Gateway", key: "gateway", width: 20 },
        { header: "Payment Status", key: "status", width: 18 },
        { header: "Assignment Status", key: "assignment", width: 20 },
        { header: "Gateway Order ID", key: "orderId", width: 38 },
        { header: "Gateway Payment ID", key: "paymentId", width: 30 },
        { header: "Paid At", key: "paidAt", width: 25 },
        { header: "Created At", key: "createdAt", width: 25 },
      ];

      filteredData.forEach((item, index) => {
        worksheet.addRow({
          index: (page - 1) * pageSize + index + 1,
          id: item.id || "N/A",
          dietPlan: item.diet_plan_name_snapshot || "N/A",
          customer: getCustomerName(item),
          phone: item.customer?.phone_number || "N/A",
          patient: getPatientName(item),
          listedPrice: Number(item.listed_price) || 0,
          paidPrice: Number(item.paid_price) || 0,
          gst:
            Number(
              item.fees?.gst_amount ??
              item.fee_snapshot?.gst_amount
            ) || 0,
          gateway: item.payment_gateway || "N/A",
          status: item.status || "N/A",
          assignment: item.assignment_status || "N/A",
          orderId: item.gateway_order_id || "N/A",
          paymentId: item.gateway_payment_id || "N/A",
          paidAt: formatDate(item.paid_at),
          createdAt: formatDate(item.created_at),
        });
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
            top: {
              style: "thin",
              color: { argb: "D1D5DB" },
            },
            left: {
              style: "thin",
              color: { argb: "D1D5DB" },
            },
            bottom: {
              style: "thin",
              color: { argb: "D1D5DB" },
            },
            right: {
              style: "thin",
              color: { argb: "D1D5DB" },
            },
          };

          cell.alignment = { vertical: "middle" };
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();

      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `Diet_Purchases_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Excel exported successfully!");

    } catch (err) {
      console.error("Excel Export Error:", err);
      toast.error("Failed to export Excel");
    }
  };

  // ================================
  // PAGINATION
  // ================================

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // ================================
  // RENDER
  // ================================

  return (
    <>
      {/* PAGE HEADER */}

      <div className="dietpurchase-page-header">
        <h1>Diet Purchase Management</h1>
        <p>Manage diet plan purchases and payment details</p>
      </div>

      {/* STATS */}

      <div className="dietpurchase-stats-grid">

        <div className="dietpurchase-stat-card">
          <div className="dietpurchase-stat-icon">
            <FaUsers />
          </div>

          <div>
            <h3>Total Purchases</h3>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="dietpurchase-stat-card">
          <div className="dietpurchase-stat-icon success">
            <FaCheckCircle />
          </div>

          <div>
            <h3>Successful</h3>
            <strong>{stats.success}</strong>
          </div>
        </div>

        <div className="dietpurchase-stat-card">
          <div className="dietpurchase-stat-icon pending">
            <FaClock />
          </div>

          <div>
            <h3>Pending</h3>
            <strong>{stats.pending}</strong>
          </div>
        </div>

        <div className="dietpurchase-stat-card">
          <div className="dietpurchase-stat-icon failed">
            <FaTimesCircle />
          </div>

          <div>
            <h3>Failed</h3>
            <strong>{stats.failed}</strong>
          </div>
        </div>

        <div className="dietpurchase-stat-card">
          <div className="dietpurchase-stat-icon">
            <FaChartLine />
          </div>

          <div>
            <h3>Active Plans</h3>
            <strong>{stats.active_assignments}</strong>
          </div>
        </div>

      </div>

      {/* SEARCH AND FILTERS */}

      <div className="dietpurchase-toolbar">

        <div className="dietpurchase-filters">

          {/* SEARCH */}

          <div className="dietpurchase-search">
            <FaSearch />

            <input
              type="text"
              placeholder="Search diet plan, customer, phone, order ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* PAYMENT STATUS */}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="dietpurchase-select"
          >
            <option value="">All Payment Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* ASSIGNMENT STATUS */}

          <select
            value={assignmentFilter}
            onChange={(e) => {
              setAssignmentFilter(e.target.value);
              setPage(1);
            }}
            className="dietpurchase-select"
          >
            <option value="">All Assignments</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

        

        

        </div>

        {/* EXCEL EXPORT */}

        <button
          className="dietpurchase-export-btn"
          onClick={exportToExcel}
          disabled={!filteredData.length}
        >
          <FaFileExcel />
          Export Excel
        </button>

      </div>

      {/* PURCHASE TABLE */}

      <div className="dietpurchase-table-wrapper">

        <table className="dietpurchase-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Diet Plan</th>
              <th>Customer Details</th>
              <th>Listed Price</th>
              <th>Paid Price</th>
              <th>Gateway</th>
              <th>Payment Status</th>
              <th>Status</th>
              <th>Paid At</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {loading ? (
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <tr key={index}>
                    <td colSpan="10">
                      <div className="dietpurchase-skeleton" />
                    </td>
                  </tr>
                ))

            ) : error ? (
              <tr>
                <td colSpan="10" className="dietpurchase-error">
                  {error}

                  <button
                    onClick={() => {
                      setPage((prev) => prev);
                      // The current page can also be refreshed by changing
                      // a filter or using the browser's retry action.
                      const controller = new AbortController();
                      getPurchases(page, controller.signal);
                    }}
                    className="dietpurchase-retry-btn"
                  >
                    Retry
                  </button>
                </td>
              </tr>

            ) : filteredData.length > 0 ? (

              filteredData.map((item, index) => (
                <tr key={item.id}>

                  <td>
                    {(page - 1) * pageSize + index + 1}
                  </td>

                  <td>
                    <strong className="dietpurchase-plan-name">
                      {item.diet_plan_name_snapshot || "N/A"}
                    </strong>

                    <div className="dietpurchase-id">
                      {item.id?.slice(0, 13)}...

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(item.id, "Purchase ID")
                        }
                        title="Copy Purchase ID"
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </td>

                  <td>
                    <strong>{getCustomerName(item)}</strong>

                    <div className="dietpurchase-subtext">
                      {item.customer?.phone_number || "N/A"}
                    </div>
                  </td>

                  <td>
                    {formatPrice(item.listed_price)}
                  </td>

                  <td>
                    <strong className="dietpurchase-paid-price">
                      {formatPrice(item.paid_price)}
                    </strong>
                  </td>

                  <td>
                    <span className="dietpurchase-gateway">
                      <FiCreditCard />
                      {item.payment_gateway || "N/A"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`dietpurchase-status ${
                        (item.status || "unknown").toLowerCase()
                      }`}
                    >
                      {item.status || "Unknown"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`dietpurchase-assignment ${
                        item.assignment_status?.toLowerCase() === "active"
                          ? "active"
                          : "inactive"
                      }`}
                    >
                      {item.assignment_status || "N/A"}
                    </span>
                  </td>

                  <td>
                    {formatDate(item.paid_at)}
                  </td>

                  <td>
                    <div className="dietpurchase-actions">
                      <button
                        type="button"
                        title="View Details"
                        onClick={() => handleViewDetails(item)}
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>

                </tr>
              ))

            ) : (

              <tr>
                <td colSpan="10">

                  <div className="dietpurchase-empty">

                    <div className="dietpurchase-empty-icon">
                      <FiSearch />
                    </div>

                    <h3>
                      {searchTerm ||
                      statusFilter ||
                      assignmentFilter ||
                      dietPlanId ||
                      customerId ||
                      patientId ||
                      paymentGateway
                        ? "No Purchases Found"
                        : "No Diet Purchases Available"}
                    </h3>

                    <p>
                      {searchTerm ||
                      statusFilter ||
                      assignmentFilter ||
                      dietPlanId ||
                      customerId ||
                      patientId ||
                      paymentGateway
                        ? "No purchase matches your search or selected filters."
                        : "Diet plan purchases will appear here once customers make a purchase."}
                    </p>

                    {(searchTerm ||
                      statusFilter ||
                      assignmentFilter ||
                      dietPlanId ||
                      customerId ||
                      patientId ||
                      paymentGateway) && (
                      <button onClick={clearFilters}>
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

      {/* PAGINATION */}

      {!loading && totalCount > 0 && (
        <div className="dietpurchase-pagination">

          <span>
            Showing{" "}
            {Math.min((page - 1) * pageSize + 1, totalCount)}
            {" "}to{" "}
            {Math.min(page * pageSize, totalCount)}
            {" "}of {totalCount} purchases
          </span>

          <div className="dietpurchase-pagination-buttons">

            <button
              disabled={!previousPage || page === 1}
              onClick={() =>
                setPage((prev) => Math.max(1, prev - 1))
              }
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              disabled={!nextPage}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </button>

          </div>

        </div>
      )}

      {/* PURCHASE DETAILS MODAL */}

      {showDetailModal && selectedPurchase && (

        <div
          className="dietpurchase-modal-overlay"
          onClick={() => {
            setShowDetailModal(false);
            setSelectedPurchase(null);
          }}
        >

          <div
            className="dietpurchase-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <div className="dietpurchase-modal-header">

              <div>
                <h2>Purchase Details</h2>
                <p>
                  Complete diet purchase and payment information
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedPurchase(null);
                }}
                className="dietpurchase-modal-close"
              >
                <FaTimes />
              </button>

            </div>

            <div className="dietpurchase-modal-body">

              {/* PURCHASE INFORMATION */}

              <div className="dietpurchase-detail-section">

                <h3>Purchase Information</h3>

                <div className="dietpurchase-detail-grid">

                  <div>
                    <label>Purchase ID</label>

                    <div className="dietpurchase-detail-copy">
                      <span>{selectedPurchase.id || "N/A"}</span>

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            selectedPurchase.id,
                            "Purchase ID"
                          )
                        }
                      >
                        <FaCopy />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label>Diet Plan</label>
                    <strong>
                      {selectedPurchase.diet_plan_name_snapshot || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <label>Diet Plan ID</label>
                    <strong>
                      {selectedPurchase.diet_plan || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <label>Payment Gateway</label>
                    <strong>
                      {selectedPurchase.payment_gateway || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <label>Payment Status</label>

                    <span
                      className={`dietpurchase-status ${
                        selectedPurchase.status?.toLowerCase() || "unknown"
                      }`}
                    >
                      {selectedPurchase.status || "N/A"}
                    </span>
                  </div>

                  <div>
                    <label>Assignment Status</label>
                    <strong>
                      {selectedPurchase.assignment_status || "N/A"}
                    </strong>
                  </div>

                </div>
              </div>

              {/* CUSTOMER INFORMATION */}

              <div className="dietpurchase-detail-section">

                <h3>Customer & Patient Information</h3>

                <div className="dietpurchase-detail-grid">

                  <div>
                    <label>Customer Name</label>
                    <strong>
                      {getCustomerName(selectedPurchase)}
                    </strong>
                  </div>

                  <div>
                    <label>Customer Phone</label>
                    <strong>
                      {selectedPurchase.customer?.phone_number || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <label>Customer Email</label>
                    <strong>
                      {selectedPurchase.customer?.email || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <label>Customer ID</label>
                    <strong>
                      {selectedPurchase.customer?.id || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <label>Patient Name</label>
                    <strong>
                      {getPatientName(selectedPurchase)}
                    </strong>
                  </div>

                  <div>
                    <label>Patient Relation</label>
                    <strong>
                      {selectedPurchase.patient?.relation || "N/A"}
                    </strong>
                  </div>

                  <div>
                    <label>Patient ID</label>
                    <strong>
                      {selectedPurchase.patient?.id || "N/A"}
                    </strong>
                  </div>

                </div>
              </div>

              {/* PAYMENT BREAKDOWN */}

              <div className="dietpurchase-detail-section">

                <h3>Payment & Fee Breakdown</h3>

                {(() => {
                  const fees =
                    selectedPurchase.fees &&
                    Object.keys(selectedPurchase.fees).length
                      ? selectedPurchase.fees
                      : selectedPurchase.fee_snapshot || {};

                  return (
                    <>

                      <div className="dietpurchase-fee-row">
                        <span>Listed Price</span>
                        <strong>
                          {formatPrice(
                            fees.listed_price ??
                            selectedPurchase.listed_price
                          )}
                        </strong>
                      </div>

                      <div className="dietpurchase-fee-row">
                        <span>Selling Price</span>
                        <strong>
                          {formatPrice(fees.selling_price)}
                        </strong>
                      </div>

                      <div className="dietpurchase-fee-row">
                        <span>
                          GST ({fees.gst_percent || 0}%)
                        </span>
                        <strong>
                          {formatPrice(fees.gst_amount)}
                        </strong>
                      </div>

                      <div className="dietpurchase-fee-row">
                        <span>
                          Platform Fee ({fees.platform_fee_percent || 0}%)
                        </span>
                        <strong>
                          {formatPrice(fees.platform_fee)}
                        </strong>
                      </div>

                      <div className="dietpurchase-fee-row total">
                        <span>Total Payable Amount</span>
                        <strong>
                          {formatPrice(
                            fees.total_payable_amount ??
                            selectedPurchase.paid_price
                          )}
                        </strong>
                      </div>

                      <div className="dietpurchase-fee-row paid">
                        <span>Actual Paid Amount</span>
                        <strong>
                          {formatPrice(selectedPurchase.paid_price)}
                        </strong>
                      </div>

                    </>
                  );
                })()}

              </div>

              {/* GATEWAY INFORMATION */}

              <div className="dietpurchase-detail-section">

                <h3>Gateway Information</h3>

                <div className="dietpurchase-detail-grid">

                  <div>
                    <label>Gateway Order ID</label>

                    <div className="dietpurchase-detail-copy">
                      <span>
                        {selectedPurchase.gateway_order_id || "N/A"}
                      </span>

                      {selectedPurchase.gateway_order_id && (
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              selectedPurchase.gateway_order_id,
                              "Gateway Order ID"
                            )
                          }
                        >
                          <FaCopy />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label>Gateway Payment ID</label>

                    <div className="dietpurchase-detail-copy">
                      <span>
                        {selectedPurchase.gateway_payment_id || "N/A"}
                      </span>

                      {selectedPurchase.gateway_payment_id && (
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              selectedPurchase.gateway_payment_id,
                              "Gateway Payment ID"
                            )
                          }
                        >
                          <FaCopy />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label>Currency</label>
                    <strong>
                      {selectedPurchase.currency || "INR"}
                    </strong>
                  </div>

                  <div>
                    <label>Paid At</label>
                    <strong>
                      {formatDate(selectedPurchase.paid_at)}
                    </strong>
                  </div>

                  <div>
                    <label>Created At</label>
                    <strong>
                      {formatDate(selectedPurchase.created_at)}
                    </strong>
                  </div>

                  <div>
                    <label>Updated At</label>
                    <strong>
                      {formatDate(selectedPurchase.updated_at)}
                    </strong>
                  </div>

                </div>
              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="dietpurchase-modal-footer">

              <button
                type="button"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedPurchase(null);
                }}
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

      {/* TOAST */}

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

    </>
  );
};

export default DietPlanPurchase;
