import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaEye,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaUserShield,
  FaTimes,
  FaExternalLinkAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { toast } from "react-toastify";

import BASE_URL from "../../../Base";
import "./Policy.css";

const Policy = () => {
  const [policyData, setPolicyData] = useState([]);
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  const [errorPolicy, setErrorPolicy] = useState(null);

  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policyModal, setPolicyModal] = useState(false);

  const [nextUrl, setNextUrl] = useState(null);
  const [previousUrl, setPreviousUrl] = useState(null);

  const navigate = useNavigate();

  const getPolicyList = async (url = null) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoadingPolicy(true);
    setErrorPolicy(null);

    try {
      const requestUrl = url || `${BASE_URL}/policies/admin/legal/`;

      const response = await fetch(requestUrl, {
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

      const data = await response.json();

      console.log("Policy API Response:", data);

      if (data.status === "success") {
        setPolicyData(data.data || []);
        setNextUrl(data.next || null);
        setPreviousUrl(data.previous || null);
      } else {
        toast.error(data.message || "Failed to get policy data");
        setPolicyData([]);
      }
    } catch (error) {
      console.error("Error fetching policy:", error);

      setErrorPolicy(
        "Something went wrong while fetching policy data."
      );

      toast.error("Failed to fetch policy data");
    } finally {
      setLoadingPolicy(false);
    }
  };

  useEffect(() => {
    getPolicyList();
  }, []);

  const formatPolicyType = (value) => {
    if (!value) return "-";

    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    if (status === "published") {
      return "policy-status published";
    }

    if (status === "draft") {
      return "policy-status draft";
    }

    return "policy-status";
  };

  const openPolicyModal = (policy) => {
    setSelectedPolicy(policy);
    setPolicyModal(true);
  };

  const closePolicyModal = () => {
    setPolicyModal(false);
    setSelectedPolicy(null);
  };



  return (
    <>
      
      <div className="page-header">
        <h1>Policy Management</h1>

        <p className="page-paragraph">
          Manage legal policies and their details
        </p>
      </div>

  
      <div className="table-wrapper policy-table-wrapper">
        <table className="data-table policy-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Policy</th>
              <th>Policy Type</th>
              <th>Category</th>
              <th>Version</th>
              <th>Status</th>
              <th>Active</th>
              <th>Effective From</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loadingPolicy ? (
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <tr key={index}>
                    <td colSpan="9">
                      <div className="skeleton-row"></div>
                    </td>
                  </tr>
                ))
            ) : errorPolicy ? (
              <tr>
                <td
                  colSpan="9"
                  className="policy-error"
                >
                  {errorPolicy}
                </td>
              </tr>
            ) : policyData?.length > 0 ? (
              policyData.map((item, index) => (
                <tr key={item.id}>
                  {/* ID */}
                  <td>{index + 1}</td>

                  {/* Policy */}
                  <td>
                    <div className="policy-name-wrapper">
                      <div className="policy-icon">
                        <FaFileAlt />
                      </div>

                      <div className="policy-name-content">
                        <span className="policy-name">
                          {item.name || "-"}
                        </span>

                        <span className="policy-code">
                          {item.code || "-"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Policy Type */}
                  <td>
                    <span className="policy-type">
                      {formatPolicyType(item.policy_type)}
                    </span>
                  </td>

                  {/* Category */}
                  <td>
                    <span className="policy-category">
                      {item.category || "-"}
                    </span>
                  </td>

                  {/* Version */}
                  <td>
                    <span className="policy-version">
                      v{item.version || 1}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={getStatusClass(item.status)}>
                      {item.status === "published" ? (
                        <FaCheckCircle />
                      ) : (
                        <FaFileAlt />
                      )}

                      {formatPolicyType(item.status)}
                    </span>
                  </td>

                  {/* Active */}
                  <td>
                    {item.is_active ? (
                      <span className="policy-active active">
                        <FaCheckCircle />
                        Active
                      </span>
                    ) : (
                      <span className="policy-active inactive">
                        <FaTimesCircle />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Effective */}
                  <td>
                    <div className="policy-date">
                      <FaCalendarAlt />
                      {formatDate(item.effective_from)}
                    </div>
                  </td>

                  {/* Action */}
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn view"
                        title="View Policy"
                        onClick={() => openPolicyModal(item)}
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="policy-empty"
                >
                  <FaFileAlt />
                  <span>No policies found</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loadingPolicy && policyData.length > 0 && (
        <div className="policy-pagination">
          <button
            disabled={!previousUrl}
            onClick={() => getPolicyList(previousUrl)}
            className="policy-pagination-btn"
          >
            <FaChevronLeft />
            Previous
          </button>

          <span className="policy-page-info">
            Showing {policyData.length} policies
          </span>

          <button
            disabled={!nextUrl}
            onClick={() => getPolicyList(nextUrl)}
            className="policy-pagination-btn"
          >
            Next
            <FaChevronRight />
          </button>
        </div>
      )}

      {/* Policy Details Modal */}
      {policyModal && selectedPolicy && (
        <div
          className="policy-modal-overlay"
          onClick={closePolicyModal}
        >
          <div
            className="policy-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="policy-modal-header">
              <div className="policy-modal-title-wrapper">
                <div className="policy-modal-icon">
                  <FaFileAlt />
                </div>

                <div>
                  <h2>
                    {selectedPolicy.title ||
                      selectedPolicy.name ||
                      "Policy Details"}
                  </h2>

                  <span>
                    {selectedPolicy.code || "-"}
                  </span>
                </div>
              </div>

              <button
                className="policy-close-btn"
                onClick={closePolicyModal}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="policy-modal-body">

              {/* Subtitle */}
              {selectedPolicy.subtitle && (
                <div className="policy-subtitle-box">
                  {selectedPolicy.subtitle}
                </div>
              )}

              {/* Basic Information */}
              <div className="policy-section">
                <h3>Basic Information</h3>

                <div className="policy-detail-grid">

                  <div className="policy-detail-item">
                    <label>Policy Name</label>
                    <span>
                      {selectedPolicy.name || "-"}
                    </span>
                  </div>

                  <div className="policy-detail-item">
                    <label>Policy Type</label>
                    <span>
                      {formatPolicyType(
                        selectedPolicy.policy_type
                      )}
                    </span>
                  </div>

                  <div className="policy-detail-item">
                    <label>Category</label>
                    <span>
                      {selectedPolicy.category || "-"}
                    </span>
                  </div>

                  <div className="policy-detail-item">
                    <label>Version</label>
                    <span>
                      v{selectedPolicy.version || 1}
                    </span>
                  </div>

                  <div className="policy-detail-item">
                    <label>Status</label>
                    <span
                      className={getStatusClass(
                        selectedPolicy.status
                      )}
                    >
                      {formatPolicyType(
                        selectedPolicy.status
                      )}
                    </span>
                  </div>

                  <div className="policy-detail-item">
                    <label>Active Status</label>

                    <span
                      className={
                        selectedPolicy.is_active
                          ? "policy-active active"
                          : "policy-active inactive"
                      }
                    >
                      {selectedPolicy.is_active ? (
                        <>
                          <FaCheckCircle />
                          Active
                        </>
                      ) : (
                        <>
                          <FaTimesCircle />
                          Inactive
                        </>
                      )}
                    </span>
                  </div>

                </div>
              </div>

              {/* Target Roles */}
              <div className="policy-section">
                <h3>
                  <FaUserShield />
                  Target Roles
                </h3>

                <div className="policy-role-list">
                  {selectedPolicy.target_roles?.length > 0 ? (
                    selectedPolicy.target_roles.map(
                      (role, index) => (
                        <span
                          className="policy-role"
                          key={index}
                        >
                          {formatPolicyType(role)}
                        </span>
                      )
                    )
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="policy-section">
                <h3>
                  <FaCalendarAlt />
                  Timeline
                </h3>

                <div className="policy-detail-grid">

                  <div className="policy-detail-item">
                    <label>Effective From</label>
                    <span>
                      {formatDate(
                        selectedPolicy.effective_from
                      )}
                    </span>
                  </div>

                  <div className="policy-detail-item">
                    <label>Published At</label>
                    <span>
                      {formatDate(
                        selectedPolicy.published_at
                      )}
                    </span>
                  </div>

                  <div className="policy-detail-item">
                    <label>Created At</label>
                    <span>
                      {formatDate(
                        selectedPolicy.created_at
                      )}
                    </span>
                  </div>

                  <div className="policy-detail-item">
                    <label>Updated At</label>
                    <span>
                      {formatDate(
                        selectedPolicy.updated_at
                      )}
                    </span>
                  </div>

                </div>
              </div>

              {/* Documents */}
              <div className="policy-section">
                <h3>Documents</h3>

                {selectedPolicy.document_urls?.length > 0 ? (
                  <div className="policy-documents">

                    {selectedPolicy.document_urls.map(
                      (url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="policy-document-link"
                        >
                          <FaFileAlt />

                          <span>
                            Document {index + 1}
                          </span>

                          <FaExternalLinkAlt />
                        </a>
                      )
                    )}

                  </div>
                ) : (
                  <div className="policy-no-document">
                    No document available
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="policy-modal-footer">
              <button
                className="policy-modal-close"
                onClick={closePolicyModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Policy;