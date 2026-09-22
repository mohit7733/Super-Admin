
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaEye,
  FaFileAlt,
  FaSearch,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaUserShield,
  FaHistory,
  FaExchangeAlt,
} from "react-icons/fa";

import { ToastContainer, toast } from "react-toastify";

import BASE_URL from "../../../Base";

import "./PolicyHistory.css";

const PolicyHistory = () => {

   const navigate = useNavigate();
  const { id } = useParams();

  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorHistory, setErrorHistory] = useState(null);

  const [selectedHistory, setSelectedHistory] = useState(null);
  const [historyModal, setHistoryModal] = useState(false);

  const [policyId, setPolicyId] = useState("");
  const [policyType, setPolicyType] = useState("");
  const [action, setAction] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [nextUrl, setNextUrl] = useState(null);
  const [previousUrl, setPreviousUrl] = useState(null);

  const policyTypes = [
    "terms_and_conditions",
    "privacy_policy",
    "cancellation",
    "editorial_policy",
    "return",
    "refund",
    "shipping_delivery",
    "grievance_redressal",
    "account_data_deletion",
    "medical_disclaimer_telemedicine",
    "doctor_services",
    "platform_fee",
    "gst",
    "serviceability",
  ];

  const actionOptions = [
    "create",
    "update",
    "publish",
    "archive",
    "rollback",
    "version_change",
    "delete",
    "activate",
    "deactivate",
  ];

  const formatPolicyType = (value) => {
    if (!value) return "-";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return "null";
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  const getActionClass = (actionValue) => {
    switch (actionValue) {
      case "create":
        return "policy-history-action create";

      case "update":
        return "policy-history-action update";

      case "publish":
        return "policy-history-action publish";

      case "archive":
        return "policy-history-action archive";

      case "rollback":
        return "policy-history-action rollback";

      case "delete":
        return "policy-history-action delete";

      case "activate":
        return "policy-history-action activate";

      case "deactivate":
        return "policy-history-action deactivate";

      default:
        return "policy-history-action";
    }
  };

  const getActionLabel = (actionValue) => {
    return formatPolicyType(actionValue);
  };
const buildHistoryUrl = (currentPage = page) => {
  const params = new URLSearchParams();

  params.append("policy_id", id);
  params.append("page", currentPage);
  params.append("page_size", pageSize);

  if (policyType) {
    params.append("policy_type", policyType);
  }

  if (action) {
    params.append("action", action);
  }

  return `${BASE_URL}/policies/admin/legal/history/?${params.toString()}`;
};

const getPolicyHistory = async (currentPage = 1) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  if (!id) {
    toast.error("Policy ID not found");
    return;
  }

  setLoadingHistory(true);
  setErrorHistory(null);

  try {
    const response = await fetch(
      `${BASE_URL}/policies/admin/legal/history/?policy_id=${id}&page=${currentPage}&page_size=${pageSize}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      toast.error(data?.message || "Failed to fetch policy history");
      setHistoryData([]);
      return;
    }

    setHistoryData(data.data || []);
    setTotalCount(data.count || 0);
    setNextUrl(data.next || null);
    setPreviousUrl(data.previous || null);

  } catch (error) {
    console.error("Policy History Error:", error);
    setErrorHistory("Something went wrong while fetching policy history.");
    toast.error("Failed to fetch policy history");
  } finally {
    setLoadingHistory(false);
  }
};
  useEffect(() => {
    getPolicyHistory();
  }, [page]);

  

 
  const handleNextPage = () => {
    if (!nextUrl || loadingHistory) return;

    setPage((prev) => prev + 1);
    getPolicyHistory(nextUrl);
  };

  const handlePreviousPage = () => {
    if (!previousUrl || loadingHistory) return;

    setPage((prev) => Math.max(1, prev - 1));
    getPolicyHistory(previousUrl);
  };

  const openHistoryModal = (item) => {
    setSelectedHistory(item);
    setHistoryModal(true);
  };

  const closeHistoryModal = () => {
    setHistoryModal(false);
    setSelectedHistory(null);
  };

  const filteredHistory = historyData.filter((item) => {
    if (!searchTerm.trim()) {
      return true;
    }

    const search = searchTerm.toLowerCase();

    return (
      item.policy_code?.toLowerCase().includes(search) ||
      item.policy_uuid?.toLowerCase().includes(search) ||
      item.performed_by_id?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <>
      <div className="page-header">
        <h1>Policy History</h1>

        <p className="page-paragraph">
          View the immutable audit trail of legal policy changes
        </p>
      </div>

      

    
      <div className="table-wrapper policy-history-table-wrapper">
        <table className="data-table policy-history-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Policy</th>
              <th>Policy Type</th>
              <th>Version</th>
              <th>Action</th>
              <th>Performed By</th>
              <th>Date & Time</th>
              <th>Changes</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loadingHistory ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <tr key={index}>
                    <td colSpan="9">
                      <div className="skeleton-row"></div>
                    </td>
                  </tr>
                ))
            ) : errorHistory ? (
              <tr>
                <td
                  colSpan="9"
                  className="policy-history-error"
                >
                  {errorHistory}
                </td>
              </tr>
            ) : filteredHistory.length > 0 ? (
              filteredHistory.map((item, index) => (
                <tr key={item.id}>

                  {/* ID */}
                  <td>
                    {(page - 1) * pageSize + index + 1}
                  </td>

                  {/* Policy */}
                  <td>
                    <div className="policy-history-policy">
                      <div className="policy-history-icon">
                        <FaFileAlt />
                      </div>

                      <div>
                        <span className="policy-history-code">
                          {item.policy_code || "-"}
                        </span>

                        <span className="policy-history-uuid">
                          {item.policy_uuid
                            ? `${item.policy_uuid.slice(0, 8)}...`
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Type */}
                  <td>
                    <span className="policy-history-type">
                      {formatPolicyType(item.policy_type)}
                    </span>
                  </td>

                  {/* Version */}
                  <td>
                    <span className="policy-history-version">
                      v{item.version || 1}
                    </span>
                  </td>

                  {/* Action */}
                  <td>
                    <span className={getActionClass(item.action)}>
                      {getActionLabel(item.action)}
                    </span>
                  </td>

                  {/* Performed By */}
                  <td>
                    <div className="policy-history-user">
                      <FaUserShield />

                      <span
                        title={item.performed_by_id || ""}
                      >
                        {item.performed_by_id
                          ? `${item.performed_by_id.slice(0, 8)}...`
                          : "-"}
                      </span>
                    </div>
                  </td>

                  {/* Date */}
                  <td>
                    <div className="policy-history-date">
                      <FaCalendarAlt />

                      <span>
                        {formatDateTime(item.created_at)}
                      </span>
                    </div>
                  </td>

                  {/* Changes */}
                  <td>
                    <span className="policy-history-change-count">
                      <FaExchangeAlt />

                      {item.changes?.length || 0}{" "}
                      {item.changes?.length === 1
                        ? "Change"
                        : "Changes"}
                    </span>
                  </td>

                  {/* View */}
                  <td>
                    <button
                      type="button"
                      className="policy-history-view-btn"
                      title="View History"
                      onClick={() => openHistoryModal(item)}
                    >
                      <FaEye />
                      View
                    </button>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="policy-history-empty"
                >
                  <FaHistory />

                  <span>
                    No policy history found
                  </span>
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      
      {!loadingHistory && totalCount > 0 && (
        <div className="policy-history-pagination">

          <div className="policy-history-pagination-info">
            Showing{" "}
            <strong>
              {Math.min(
                (page - 1) * pageSize + 1,
                totalCount
              )}
            </strong>{" "}
            -{" "}
            <strong>
              {Math.min(page * pageSize, totalCount)}
            </strong>{" "}
            of <strong>{totalCount}</strong>
          </div>

          <div className="policy-history-pagination-controls">

            <button
              type="button"
              disabled={!previousUrl || loadingHistory}
              onClick={handlePreviousPage}
              className="policy-history-page-btn"
            >
              <FaChevronLeft />
            </button>

            <span className="policy-history-page-number">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={!nextUrl || loadingHistory}
              onClick={handleNextPage}
              className="policy-history-page-btn"
            >
              <FaChevronRight />
            </button>

          </div>
        </div>
      )}

      {/* History Details Modal */}
      {historyModal && selectedHistory && (
        <div
          className="policy-history-modal-overlay"
          onClick={closeHistoryModal}
        >
          <div
            className="policy-history-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}
            <div className="policy-history-modal-header">

              <div className="policy-history-modal-title">

                <div className="policy-history-modal-icon">
                  <FaHistory />
                </div>

                <div>
                  <h2>
                    Policy History Details
                  </h2>

                  <span>
                    {selectedHistory.policy_code || "-"}
                  </span>
                </div>

              </div>

              <button
                type="button"
                className="policy-history-modal-close"
                onClick={closeHistoryModal}
              >
                <FaTimes />
              </button>

            </div>

            {/* Body */}
            <div className="policy-history-modal-body">

              {/* Basic Information */}
              <div className="policy-history-section">

                <h3>
                  <FaFileAlt />
                  Event Information
                </h3>

                <div className="policy-history-detail-grid">

                  <div className="policy-history-detail-item">
                    <label>Policy Code</label>
                    <span>
                      {selectedHistory.policy_code || "-"}
                    </span>
                  </div>

                  <div className="policy-history-detail-item">
                    <label>Policy Type</label>
                    <span>
                      {formatPolicyType(
                        selectedHistory.policy_type
                      )}
                    </span>
                  </div>

                  <div className="policy-history-detail-item">
                    <label>Version</label>
                    <span>
                      v{selectedHistory.version || 1}
                    </span>
                  </div>

                  <div className="policy-history-detail-item">
                    <label>Action</label>

                    <span
                      className={getActionClass(
                        selectedHistory.action
                      )}
                    >
                      {getActionLabel(
                        selectedHistory.action
                      )}
                    </span>
                  </div>

                  <div className="policy-history-detail-item">
                    <label>Performed By</label>
                    <span className="policy-history-break">
                      {selectedHistory.performed_by_id || "-"}
                    </span>
                  </div>

                  <div className="policy-history-detail-item">
                    <label>Created At</label>
                    <span>
                      {formatDateTime(
                        selectedHistory.created_at
                      )}
                    </span>
                  </div>

                  <div className="policy-history-detail-item">
                    <label>Policy UUID</label>
                    <span className="policy-history-break">
                      {selectedHistory.policy_uuid || "-"}
                    </span>
                  </div>

                  <div className="policy-history-detail-item">
                    <label>Related Policy ID</label>
                    <span className="policy-history-break">
                      {selectedHistory.related_policy_id || "-"}
                    </span>
                  </div>

                </div>
              </div>

              {/* Changes */}
              <div className="policy-history-section">

                <h3>
                  <FaExchangeAlt />
                  Field Changes
                </h3>

                {selectedHistory.changes?.length > 0 ? (
                  <div className="policy-history-changes">

                    {selectedHistory.changes.map(
                      (change, index) => (
                        <div
                          className="policy-history-change-card"
                          key={index}
                        >

                          <div className="policy-history-change-field">
                            {change.field || "-"}
                          </div>

                          <div className="policy-history-change-columns">

                            <div className="policy-history-change previous">
                              <span>
                                Previous
                              </span>

                              <pre>
                                {formatValue(
                                  change.previous
                                )}
                              </pre>
                            </div>

                            <div className="policy-history-change new">
                              <span>
                                New
                              </span>

                              <pre>
                                {formatValue(
                                  change.new
                                )}
                              </pre>
                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <div className="policy-history-no-changes">
                    No field-level changes recorded.
                  </div>
                )}

              </div>

              {/* Previous State */}
              <div className="policy-history-section">

                <h3>
                  Previous State
                </h3>

                {selectedHistory.previous_state ? (
                  <div className="policy-history-json-box">
                    <pre>
                      {JSON.stringify(
                        selectedHistory.previous_state,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                ) : (
                  <div className="policy-history-null-state">
                    No previous state. This was the initial
                    creation event.
                  </div>
                )}

              </div>

              {/* New State */}
              <div className="policy-history-section">

                <h3>
                  New State
                </h3>

                {selectedHistory.new_state ? (
                  <div className="policy-history-json-box">
                    <pre>
                      {JSON.stringify(
                        selectedHistory.new_state,
                        null,
                        2
                      )}
                    </pre>
                  </div>
                ) : (
                  <div className="policy-history-null-state">
                    No new state available.
                  </div>
                )}

              </div>

            </div>

            {/* Footer */}
            <div className="policy-history-modal-footer">

              <button
                type="button"
                className="policy-history-modal-close-btn"
                onClick={closeHistoryModal}
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

      <ToastContainer
        position="top-center"
        autoClose={2000}
      />
    </>
  );
};

export default PolicyHistory;



