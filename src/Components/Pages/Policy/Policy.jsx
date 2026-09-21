import React, { useEffect, useState } from "react";
import { useNavigate ,useParams} from "react-router-dom";
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
  FaSearch, 
  FaPlus,
  FaEdit
} from "react-icons/fa";

import { FiTrash2 } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import { FaArrowRotateLeft } from "react-icons/fa6";
import { FaUndo } from "react-icons/fa";
import { FaEllipsisV } from "react-icons/fa";

import BASE_URL from "../../../Base";

import { BiPlus } from "react-icons/bi";
import "./Policy.css";


const Policy = () => {
  const [policyData, setPolicyData] = useState([]);
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  const [errorPolicy, setErrorPolicy] = useState(null);
  const[deleteLoading,setDeleteLoading]=useState(false);
  const [RollbackModal, setRollbackModal] = useState(false);
const [rollbackLoading, setRollbackLoading] = useState(false);

  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [policyModal, setPolicyModal] = useState(false);

  const [nextUrl, setNextUrl] = useState(null);
  const [previousUrl, setPreviousUrl] = useState(null);
  const[searchTerm,setSearchTerm]=useState("");
  const [DeleteModal,setDeleteModal]=useState(false);
const [PublishModal, setPublishModal] = useState(false);
const [publishLoading, setPublishLoading] = useState(false);

  const navigate = useNavigate();
const { id } = useParams();

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

      if (data.success === true) {
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
const handleDeletePolicy = async (id) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    setDeleteLoading(true);

    const response = await fetch(
      `${BASE_URL}/policies/admin/legal/?id=${id}`,
      {
        method: "DELETE",
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

    console.log("Policy DELETE Response:", data);

   
    if (!response.ok || data.success === false) {
      const errorMessage =
        data?.message ||
        data?.errors?.status?.[0] ||
        data?.errors?.detail?.[0] ||
        data?.errors?.non_field_errors?.[0] ||
        "Failed to delete policy";

      toast.error(errorMessage);
      return;
    }

    toast.success(
      data?.message || "Policy deleted successfully"
    );

    setDeleteModal(false);
    setSelectedPolicy(null);

    getPolicyList();

  } catch (error) {
    console.error("Delete Policy Error:", error);

    toast.error(
      "Something went wrong while deleting the policy"
    );
  } finally {
    setDeleteLoading(false);
  }
};
const handlePublishPolicy = async (id) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    setPublishLoading(true);

    const response = await fetch(
      `${BASE_URL}/policies/admin/legal/publish/?id=${id}`,
      {
        method: "POST",
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

    console.log("Policy Publish Response:", data);

    if (!response.ok || data.success === false) {
      toast.error(
        data?.message || "Failed to publish policy"
      );
      return;
    }

    toast.success(
      data?.message || "Policy published successfully"
    );

    setPublishModal(false);
    setSelectedPolicy(null);

    getPolicyList();

  } catch (error) {
    console.error("Publish Policy Error:", error);

    toast.error(
      "Something went wrong while publishing the policy"
    );
  } finally {
    setPublishLoading(false);
  }
};
const handleRollbackPolicy = async (id) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    setRollbackLoading(true);

    const response = await fetch(
      `${BASE_URL}/policies/admin/legal/rollback/?id=${id}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          id: id,
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

    console.log("Policy Rollback Response:", data);

    if (!response.ok || data.success === false) {
      const errorMessage =
        data?.message ||
        data?.errors?.id?.[0] ||
        data?.errors?.detail?.[0] ||
        data?.errors?.non_field_errors?.[0] ||
        "Failed to rollback policy";

      toast.error(errorMessage);
      return;
    }

    toast.success(
      data?.message || "Policy rolled back successfully"
    );

    setRollbackModal(false);
    setSelectedPolicy(null);

    getPolicyList();

  } catch (error) {
    console.error("Policy Rollback Error:", error);

    toast.error(
      "Something went wrong while rolling back the policy"
    );
  } finally {
    setRollbackLoading(false);
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
      
            
            <div className="filter-category">
              <div className="filter-controls">
                <div className="search-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by Policy Name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm("")}>
                      <FaTimes />
                    </button>
                  )}
                </div>
      
              
      
              </div>
              <div className="category-action-buttons">
       
           <button
  type="button"
   className="add-customer-btn"
  onClick={() => navigate("/AddPolicy")}
>
  <FaPlus />
  Create Policy
</button>
              </div>
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
                 
                  <td>{index + 1}</td>

               
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

                
                  <td>
                    <span className="policy-type">
                      {formatPolicyType(item.policy_type)}
                    </span>
                  </td>

                  <td>
                    <span className="policy-category">
                      {item.category || "-"}
                    </span>
                  </td>

                
                  <td>
                    <span className="policy-version">
                      v{item.version || 1}
                    </span>
                  </td>

               
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

                  
                  <td>
                    <div className="policy-date">
                      <FaCalendarAlt />
                      {formatDate(item.effective_from)}
                    </div>
                  </td>
       <td>
<div className="policy-action-menu">
  <button
    type="button"
    className="policy-menu-trigger"
    title="Actions"
    onClick={(e) => {
      e.stopPropagation();
      setSelectedPolicy(
        selectedPolicy?.id === item.id ? null : item
      );
    }}
  >
    <FaEllipsisV size={14} />
  </button>

  {selectedPolicy?.id === item.id && (
    <div className="policy-dropdown-menu">

      <button
        type="button"
        className="policy-dropdown-item"
        onClick={() => {
          navigate(`/Policy/Edit_Policy/${item.id}`);
          setSelectedPolicy(null);
        }}
      >
        <FaEdit />
        <span>Edit Policy</span>
      </button>

    
      <button
        type="button"
        className="policy-dropdown-item policy-dropdown-delete"
        onClick={() => {
          setSelectedPolicy(item);
          setDeleteModal(true);
        }}
      >
        <FiTrash2 />
        <span>Delete Policy</span>
      </button>
<button
  type="button"
  className="policy-dropdown-item"
  onClick={() => {
    navigate(`/Policy/History/${item.id}`);
    setSelectedPolicy(null);
  }}
>
  <FaFileAlt />
  <span>Policy History</span>
</button>
   
      {item.status === "archived" && (
        <button
          type="button"
          className="policy-dropdown-item"
          onClick={() => {
            setSelectedPolicy(item);
            setRollbackModal(true);
          }}
        >
          <FaArrowRotateLeft />
          <span>Rollback Policy</span>
        </button>
      )}

      {/* Publish */}
      {item.status !== "published" && (
        <button
          type="button"
          className="policy-dropdown-item policy-dropdown-publish"
          onClick={() => {
            setSelectedPolicy(item);
            setPublishModal(true);
          }}
        >
          <FaCheckCircle />
          <span>Publish Policy</span>
        </button>
      )}

    </div>
  )}
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

            
            <div className="policy-modal-body">

           
              {selectedPolicy.subtitle && (
                <div className="policy-subtitle-box">
                  {selectedPolicy.subtitle}
                </div>
              )}

         
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
  {DeleteModal && selectedPolicy && (
  <div
    className="activeModal-overlay"
    onClick={() => {
      if (!deleteLoading) {
        setDeleteModal(false);
        setSelectedPolicy(null);
      }
    }}
  >
    <div
      className="activeModal"
      onClick={(e) => e.stopPropagation()}
    >

    
      <button
        className="activeModal-close"
        disabled={deleteLoading}
        onClick={() => {
          setDeleteModal(false);
          setSelectedPolicy(null);
        }}
      >
        ×
      </button>

    
      <div className="activeModal-icon">
        <FiTrash2 />
      </div>

  
      <h2 className="activeModal-title">
        Confirm Policy Deletion
      </h2>

      {/* Message */}
      <p className="activeModal-text">
        Are you sure you want to
        <span className="inactive-text">
          {" delete "}
        </span>
        this policy?
      </p>

      <div className="activeModal-card">
        <h4>
          {selectedPolicy.name || "Policy"}
        </h4>

        <p>
          {selectedPolicy.policy_type || "No policy type"}
        </p>

        <span>
          {selectedPolicy.category || "-"}
        </span>
      </div>

   
      <div className="activeModal-footer">

        <button
          type="button"
          className="activeModal-cancel"
          disabled={deleteLoading}
          onClick={() => {
            setDeleteModal(false);
            setSelectedPolicy(null);
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          className="activeModal-confirm deactivate-btn"
          disabled={deleteLoading}
          onClick={() => {
            handleDeletePolicy(selectedPolicy.id);
          }}
        >
          {deleteLoading ? (
            "Deleting..."
          ) : (
            <>
              <FiTrash2 />
              Yes, Delete
            </>
          )}
        </button>

      </div>

    </div>
  </div>
)}
{PublishModal && selectedPolicy && (
  <div
    className="policyPublishModal-overlay"
    onClick={() => {
      if (!publishLoading) {
        setPublishModal(false);
        setSelectedPolicy(null);
      }
    }}
  >
    <div
      className="policyPublishModal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        type="button"
        className="policyPublishModal-close"
        disabled={publishLoading}
        onClick={() => {
          setPublishModal(false);
          setSelectedPolicy(null);
        }}
      >
        ×
      </button>

   
      <div className="policyPublishModal-icon">
        <FaCheckCircle />
      </div>

      
      <h2 className="policyPublishModal-title">
        Confirm Policy Publish
      </h2>

   
      <p className="policyPublishModal-text">
        Are you sure you want to
        <span className="policyPublishModal-highlight">
          {" publish "}
        </span>
        this policy?
      </p>

      
      <div className="policyPublishModal-card">

        <div className="policyPublishModal-card-icon">
          <FaFileAlt />
        </div>

        <div className="policyPublishModal-card-content">
          <h4>
            {selectedPolicy.name || "Policy"}
          </h4>

          <p>
            {formatPolicyType(
              selectedPolicy.policy_type
            )}
          </p>

          <span>
            {selectedPolicy.category || "-"}
          </span>
        </div>

      </div>

   
      <div className="policyPublishModal-warning">
        <FaCheckCircle />

        <span>
          Once published, this policy will become
          active and available to users.
        </span>
      </div>

    
      <div className="policyPublishModal-footer">

        <button
          type="button"
          className="policyPublishModal-cancel"
          disabled={publishLoading}
          onClick={() => {
            setPublishModal(false);
            setSelectedPolicy(null);
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          className="policyPublishModal-confirm"
          disabled={publishLoading}
          onClick={() => {
            handlePublishPolicy(selectedPolicy.id);
          }}
        >
          {publishLoading ? (
            "Publishing..."
          ) : (
            <>
              <FaCheckCircle />
              Yes, Publish
            </>
          )}
        </button>

      </div>

    </div>
  </div>
)}
{RollbackModal && selectedPolicy && (
  <div
    className="policyRollbackModal-overlay"
    onClick={() => {
      if (!rollbackLoading) {
        setRollbackModal(false);
        setSelectedPolicy(null);
      }
    }}
  >
    <div
      className="policyRollbackModal"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="policyRollbackModal-close"
        disabled={rollbackLoading}
        onClick={() => {
          setRollbackModal(false);
          setSelectedPolicy(null);
        }}
      >
        ×
      </button>

      <div className="policyRollbackModal-icon">
        <FaUndo />
      </div>

      <h2 className="policyRollbackModal-title">
        Confirm Policy Rollback
      </h2>

      <p className="policyRollbackModal-text">
        Are you sure you want to
        <span className="policyRollbackModal-highlight">
          {" rollback "}
        </span>
        this archived policy?
      </p>

      <div className="policyRollbackModal-card">
        <div className="policyRollbackModal-card-icon">
          <FaFileAlt />
        </div>

        <div className="policyRollbackModal-card-content">
          <h4>
            {selectedPolicy.name || "Policy"}
          </h4>

          <p>
            {formatPolicyType(
              selectedPolicy.policy_type
            )}
          </p>

          <span>
            {selectedPolicy.category || "-"}
          </span>
        </div>
      </div>

      <div className="policyRollbackModal-warning">
        <FaUndo />

        <span>
          This archived version will become the currently
          published version. The existing published version
          will be archived.
        </span>
      </div>

      <div className="policyRollbackModal-footer">
        <button
          type="button"
          className="policyRollbackModal-cancel"
          disabled={rollbackLoading}
          onClick={() => {
            setRollbackModal(false);
            setSelectedPolicy(null);
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          className="policyRollbackModal-confirm"
          disabled={rollbackLoading}
          onClick={() => {
            handleRollbackPolicy(selectedPolicy.id);
          }}
        >
          {rollbackLoading ? (
            "Rolling Back..."
          ) : (
            <>
              <FaUndo />
              Yes, Rollback
            </>
          )}
        </button>
      </div>
    </div>
  </div>
)}
 <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export default Policy;