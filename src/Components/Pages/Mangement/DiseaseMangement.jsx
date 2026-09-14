import React, { useEffect, useState } from "react";
import {
  FaTimesCircle,
  FaClock,
  FaClipboardList,
  FaCheckCircle,
  FaEye,
  FaFilePrescription,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { BsSearch } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";

const DiseaseMangement = () => {
  const [ApprovalRequestData, setApprovalRequestData] = useState([]);
  const [ApprovalRequestLoading, setApprovalRequestLoading] = useState(false);
  const [ApprovalRequestError, setApprovalRequestError] = useState(null);
  const [approvalSearch, setApprovalSearch] = useState("");
const [approveModal, setApproveModal] = useState(false);
const [SelectedApprovalRequest, setSelectedApprovalRequest] = useState(null);

const [selectedVariantIds, setSelectedVariantIds] = useState([]);
const [approvedQuantities, setApprovedQuantities] = useState({});
const [adminNotes, setAdminNotes] = useState("");

const [isApproving, setIsApproving] = useState(false);
  const navigate = useNavigate();
  const [RejectionVendorModal, setRejectionModal] = useState(false);
const [Reason, setReason] = useState("");

  const getMedicineApprovalList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setApprovalRequestLoading(true);
    setApprovalRequestError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/customers/admin/prescription-requests/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
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

      console.log("Medicine Approval API Response:", data);

      if (data.success) {
        // API response mein data direct array hai
        setApprovalRequestData(data.data || []);
      } else {
        toast.error(
          data.message || "Failed to fetch medicine approval requests"
        );
      }
    } catch (error) {
      console.error("Medicine Approval Fetch Error:", error);

      setApprovalRequestError(
        "Something went wrong while fetching medicine approval requests."
      );

      toast.error("Failed to fetch medicine approval data");
    } finally {
      setApprovalRequestLoading(false);
    }
  };
  const handleApproveRequest = async () => {
  if (!SelectedApprovalRequest) return;

  if (selectedVariantIds.length === 0) {
    toast.error("Please select at least one medicine");
    return;
  }

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setIsApproving(true);

  try {
    const payload = {
      status: "approved",
      variant_ids: selectedVariantIds,
    };

    // quantities optional hai
    const quantities = {};

    selectedVariantIds.forEach((variantId) => {
      const quantity = approvedQuantities[variantId];

      if (quantity !== "" && Number(quantity) > 0) {
        quantities[variantId] = Number(quantity);
      }
    });

    if (Object.keys(quantities).length > 0) {
      payload.quantities = quantities;
    }

    // admin_notes optional hai
    if (adminNotes.trim()) {
      payload.admin_notes = adminNotes.trim();
    }

    console.log("Approve Payload:", payload);

    const response = await fetch(
      `${BASE_URL}/customers/admin/prescription-requests/?id=${SelectedApprovalRequest.id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log("Approve Prescription Response:", data);

    if (data.success) {
      toast.success(
        data.message || "Prescription approved successfully"
      );

      closeApproveModal();

      getMedicineApprovalList();
    } else {
      toast.error(
        data.message || "Failed to approve prescription"
      );
    }
  } catch (error) {
    console.error("Approve Prescription Error:", error);

    toast.error(
      "Something went wrong while approving prescription"
    );
  } finally {
    setIsApproving(false);
  }
};
const closeApproveModal = () => {
  if (isApproving) return;

  setApproveModal(false);
  setSelectedApprovalRequest(null);
  setSelectedVariantIds([]);
  setApprovedQuantities({});
  setAdminNotes("");
};const handleVariantSelection = (variantId) => {
  setSelectedVariantIds((prev) => {
    if (prev.includes(variantId)) {
      return prev.filter((id) => id !== variantId);
    }

    return [...prev, variantId];
  });
};const handleQuantityChange = (variantId, value) => {
  setApprovedQuantities((prev) => ({
    ...prev,
    [variantId]:
      value === "" ? "" : Math.max(1, Number(value)),
  }));
};

  useEffect(() => {
    getMedicineApprovalList();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "pending_review":
        return "Pending Review";

      case "approved":
        return "Approved";

      case "rejected":
        return "Rejected";

      case "cancelled":
        return "Cancelled";

      default:
        return status
          ? status.replaceAll("_", " ")
          : "-";
    }
  };
  const submitRejection = async () => {
  if (!SelectedApprovalRequest) return;

  if (!Reason.trim()) {
    toast.error("Please enter rejection reason");
    return;
  }

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    const payload = {
      status: "rejected",
      rejection_reason: Reason.trim(),
    };

    console.log("Reject Payload:", payload);

    const response = await fetch(
      `${BASE_URL}/customers/admin/prescription-requests/?id=${SelectedApprovalRequest.id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log("Reject Prescription Response:", data);

    if (data.success) {
      toast.success(
        data.message || "Prescription rejected successfully"
      );

      setRejectionModal(false);
      setReason("");
      setSelectedApprovalRequest(null);

      getMedicineApprovalList();
    } else {
      toast.error(
        data.message || "Failed to reject prescription"
      );
    }

  } catch (error) {
    console.error("Reject Prescription Error:", error);

    toast.error(
      "Something went wrong while rejecting prescription"
    );
  }
};

  const filteredRequests = ApprovalRequestData.filter((item) => {
    const medicine = item.requested_variants?.[0]?.variant;

    const searchText = `
      ${item.patient_name || ""}
      ${medicine?.brand_name || ""}
      ${medicine?.variant_title || ""}
      ${medicine?.size || ""}
      ${item.status || ""}
    `.toLowerCase();

    return searchText.includes(approvalSearch.toLowerCase());
  });

  // Stats
  const totalRequests = ApprovalRequestData.length;

  const pendingRequests = ApprovalRequestData.filter(
    (item) => item.status === "pending_review"
  ).length;

  const approvedRequests = ApprovalRequestData.filter(
    (item) => item.status === "approved"
  ).length;

  const cancelledRequests = ApprovalRequestData.filter(
    (item) =>
      item.status === "cancelled" ||
      item.status === "rejected"
  ).length;

  return (
    <>
      <div className="page-header">
        <h1>Medicine Approval</h1>

        <p className="page-paragraph">
          Review and approve medicines submitted for users
        </p>
      </div>

      {/* ================= STATS ================= */}

      <div className="vendors-stats stats2-grid">

        {/* Total */}
        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaClipboardList size={20} />
          </div>

          <div className="stat2-info">
            <h3>Total Requests</h3>

            <div className="stat2-value">
              {totalRequests}
            </div>
          </div>
        </div>

       
        <div className="stat2-card">
          <div
            className="stat2-icon"
           style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaClock size={16} />
          </div>

          <div className="stat2-info">
            <h3>Pending Requests</h3>

            <div className="stat2-value">
              {pendingRequests}
            </div>
          </div>
        </div>

        <div className="stat2-card">
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
            <h3>Approved Requests</h3>

            <div className="stat2-value">
              {approvedRequests}
            </div>
          </div>
        </div>

       
        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaTimesCircle size={16} />
          </div>

          <div className="stat2-info">
            <h3> Rejected  Requests</h3>

            <div className="stat2-value">
              {cancelledRequests}
            </div>
          </div>
        </div>

      </div>

    

      <div className="controls-section">
        <div className="search-wrapper">
          <BsSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search patient, medicine, brand..."
            value={approvalSearch}
            onChange={(e) => setApprovalSearch(e.target.value)}
            className="search-input"
          />
        </div>
      </div>



      <div className="table-wrapper">
        <table className="data-table">

          <thead>
            <tr>
              <th>ID</th>

              <th>Patient</th>

              <th>Prescription</th>

              <th>Medicine</th>

              <th>Brand</th>

              <th>Size</th>

              <th>Price</th>

              <th>Requested Date</th>

              <th>Status</th>

              <th>Action</th>
            </tr>
          </thead>

          <tbody>


            {ApprovalRequestLoading ? (
              Array(4)
                .fill(0)
                .map((_, index) => (
                  <tr key={index}>
                    <td colSpan="10">
                      <div className="skeleton-row"></div>
                    </td>
                  </tr>
                ))
            ) : ApprovalRequestError ? (

            
              <tr>
                <td
                  colSpan="10"
                  style={{
                    color: "red",
                    textAlign: "center",
                  }}
                >
                  {ApprovalRequestError}
                </td>
              </tr>

            ) : filteredRequests.length > 0 ? (

           

              filteredRequests.map((item, index) => {

                const medicine =
                  item.requested_variants?.[0]?.variant;

                return (
                  <tr key={item.id}>

                    {/* ID */}

                    <td>
                      {index + 1}
                    </td>

                    {/* Patient */}

                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "3px",
                        }}
                      >
                        <strong>
                          {item.patient_name || "-"}
                        </strong>

                        <span
                          style={{
                            fontSize: "11px",
                            color: "#777",
                          }}
                        >
                          Patient ID:{" "}
                          {item.patient_id}
                           
                        </span>
                      </div>
                    </td>

                    

                    <td>
                      {item.file_url ? (
                        <a
                          href={item.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            color: "#0D614E",
                            textDecoration: "none",
                            fontWeight: "600",
                          }}
                        >
                          <FaFilePrescription />

                          View
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "3px",
                        }}
                      >
                        <strong>
                          {medicine?.variant_title || "-"}
                        </strong>

                        {medicine?.prescription_required }
                      </div>
                    </td>

              

                    <td>
                      {medicine?.brand_name || "-"}
                    </td>

                  

                    <td>
                      {medicine?.size || "-"}
                    </td>


                    <td>
                      {medicine?.selling_price !== undefined
                        ? `₹${Number(
                            medicine.selling_price
                          ).toFixed(2)}`
                        : "-"}
                    </td>

   <td>
  <div className="created-cell">
    <span>
      {formatDate(item.created_at)}
    </span>

    <small>
      {formatDateTime(item.created_at).split(",")[1]?.trim() || "-"}
    </small>
  </div>
</td>


                    <td>
                      <span
                        className={`status-badge ${
                          item.status === "approved"
                            ? "status-active"
                            : item.status === "pending_review"
                            ? "status-pending"
                            : "status-inactive"
                        }`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </td>

   <td>
  <div className="medicine-action-group">

    {item.status === "pending_review" && (
      <>
    <button
  type="button"
  className="medicine-action-btn medicine-approve-btn"
  title="Approve Request"
 onClick={() => {
  setSelectedApprovalRequest(item);

  const initialQuantities = {};

  (item.requested_variants || []).forEach((requestedItem) => {
    const variantId = requestedItem?.variant?.variant_id;

    if (variantId) {
      initialQuantities[variantId] = 1;
    }
  });

  setSelectedVariantIds([]);
  setApprovedQuantities(initialQuantities);
  setAdminNotes("");
  setApproveModal(true);
}}
>
  <FaCheckCircle />
</button>

       <button
  type="button"
  className="medicine-action-btn medicine-reject-btn"
  title="Reject Request"
  onClick={() => {
    setSelectedApprovalRequest(item);
    setReason("");
    setRejectionModal(true);
  }}
>
  <FaTimesCircle />
</button>
      </>
    )}

    {item.status === "approved" && (
      <span className="medicine-action-status medicine-approved-text">
        <FaCheckCircle />
        Approved
      </span>
    )}

    {item.status === "rejected" && (
      <span className="medicine-action-status medicine-rejected-text">
        <FaTimesCircle />
        Rejected
      </span>
    )}

  </div>
</td>
                  </tr>
                );
              })

            ) : (

              /* Empty */

              <tr>
                <td
                  colSpan="10"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No Medicine Approval Requests Found
                </td>
              </tr>
            )}

          </tbody>

        </table>
      </div>
{approveModal && SelectedApprovalRequest && (
  <div className="confirm-overlay">
    <div className="confirm-modal medicine-approval-modal">

      <button
        className="closes-modal"
        onClick={closeApproveModal}
        disabled={isApproving}
      >
        <IoClose />
      </button>

      <div className="approval-icon-wrapper">
        <FaCheckCircle className="approval-icon" />
      </div>

      <h2 className="confirm-title">
        Approve Prescription
      </h2>

      <p className="confirm-description">
        Select the medicines you want to approve and update
        quantities if required.
      </p>

      {/* Patient */}
      <div className="vendor-info-card medicine-patient-card">

        <div className="vendor-row">
          <span className="label">
            Patient Name
          </span>

          <span className="value approve-text">
            {SelectedApprovalRequest.patient_name || "N/A"}
          </span>
        </div>


      </div>

    
      <div className="medicine-approval-section">

        <div className="medicine-section-header">

          <div>
            <h3>Select Medicines</h3>

            <p>
              Select the medicines to include in approval.
            </p>
          </div>

          <span className="medicine-selected-count">
            {selectedVariantIds.length} Selected
          </span>

        </div>

        <div className="medicine-approval-list">

      {(SelectedApprovalRequest.requested_variants || []).map(
  (requestedItem) => {
    const medicine = requestedItem?.variant;

   
    const variantId = medicine?.variant_id;

    if (!variantId) return null;

    const isSelected = selectedVariantIds.includes(variantId);

    return (
      <div
        key={variantId}
        className={`medicine-approval-item ${
          isSelected ? "medicine-approval-item-selected" : ""
        }`}
      >
        <label className="medicine-select-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => handleVariantSelection(variantId)}
          />

          <span className="medicine-checkmark">
            {isSelected && <FaCheckCircle />}
          </span>
        </label>

        <div className="medicine-details">
          <strong>
            {medicine?.variant_title || "Medicine"}
          </strong>

          <div className="medicine-meta">
            <span>
              {medicine?.brand_name || "No Brand"}
            </span>

            

            <span>
              ₹
              {medicine?.selling_price !== undefined
                ? Number(medicine.selling_price).toFixed(2)
                : "0.00"}
            </span>
          </div>
        </div>

        <div className="medicine-quantity">
          <label>Quantity</label>

          <input
            type="number"
            min="1"
            value={approvedQuantities[variantId] ?? 1}
            disabled={!isSelected}
            onChange={(e) =>
              handleQuantityChange(
                variantId,
                e.target.value
              )
            }
          />
        </div>
      </div>
    );
  }
)}
        </div>
      </div>

   
      <div className="medicine-admin-notes">

        <label>
          Admin Notes
        </label>

        <textarea
          value={adminNotes}
          onChange={(e) =>
            setAdminNotes(e.target.value)
          }
          placeholder="Add an optional internal note..."
          rows="3"
        />

      </div>

      {/* Validation */}
      {selectedVariantIds.length === 0 && (
        <div className="policy-warning">

          <span className="policy-warning-icon">
            i
          </span>

          <span>
            Please select at least one medicine before
            approving this prescription.
          </span>

        </div>
      )}

      {/* Buttons */}
      <div className="confirm-buttons">

        <button
          className="cancels-btn"
          disabled={isApproving}
          onClick={closeApproveModal}
        >
          Cancel
        </button>

        <button
          className={`approve-btn ${
            isApproving ||
            selectedVariantIds.length === 0
              ? "approve-btn-disabled"
              : ""
          }`}
          disabled={
            isApproving ||
            selectedVariantIds.length === 0
          }
          onClick={handleApproveRequest}
        >
          {isApproving
            ? "Approving..."
            : `Approve ${selectedVariantIds.length} Medicine${
                selectedVariantIds.length !== 1
                  ? "s"
                  : ""
              }`}
        </button>

      </div>

    </div>
  </div>
)}
{RejectionVendorModal && SelectedApprovalRequest && (
  <div className="confirm-overlay">
    <div className="reason-modal modern-reason-modal medicine-reject-modal">

      {/* Close */}
      <button
        className="closes-modal"
        onClick={() => {
          setRejectionModal(false);
          setReason("");
        }}
      >
        <IoClose />
      </button>

      {/* Reject Icon */}
      <div className="reason-icon reject-bg">
        ✕
      </div>

      {/* Heading */}
      <h2>
        Reject Prescription
      </h2>

      <p className="reason-subtitle">
        Please provide a reason for rejecting this prescription request.
      </p>

      {/* Patient Info */}
      <div className="vendor-info-card reject-card">

        <div className="vendor-row">
          <span className="label">
            Patient Name
          </span>

          <span className="value reject-text">
            {SelectedApprovalRequest?.patient_name || "N/A"}
          </span>
        </div>

       
      </div>

      {/* Requested Medicines */}
      <div className="reject-medicines-section">

        <div className="reject-medicines-header">
          <div>
            <h3>Requested Medicines</h3>
            <p>
              Medicines included in this prescription request.
            </p>
          </div>

          <span className="reject-medicine-count">
            {SelectedApprovalRequest?.requested_variants?.length || 0}
            {" "}
            Medicine
            {(SelectedApprovalRequest?.requested_variants?.length || 0) !== 1
              ? "s"
              : ""}
          </span>
        </div>

        <div className="reject-medicines-list">

          {(SelectedApprovalRequest?.requested_variants || []).map(
            (requestedItem) => {

              const medicine = requestedItem?.variant;

              if (!medicine?.variant_id) return null;

              return (
                <div
                  key={medicine.variant_id}
                  className="reject-medicine-item"
                >

                  <div className="reject-medicine-info">

                    <div className="reject-medicine-name">
                      {medicine?.variant_title || "Medicine"}
                    </div>

                    <div className="reject-medicine-meta">

                      <span>
                        {medicine?.brand_name || "No Brand"}
                      </span>

                      <span>
                        Size: {medicine?.size || "N/A"}
                      </span>

                      <span>
                        ₹
                        {medicine?.selling_price !== undefined
                          ? Number(
                              medicine.selling_price
                            ).toFixed(2)
                          : "0.00"}
                      </span>

                    </div>

                  </div>

                  {medicine?.quantity !== undefined && (
                    <div className="reject-medicine-stock">
                      Stock
                      <strong>
                        {medicine.quantity}
                      </strong>
                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>

      </div>

      {/* Reason */}
      <div className="reason-field">

        <label>
          Rejection Reason <span>*</span>
        </label>

        <textarea
          className="reason-box reject-reason-box"
          value={Reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for rejection..."
          rows="4"
        />

      </div>

      {/* Info */}
      <div className="info-box reject-info-box">

        <span className="infos-icon reject-infos-icon">
          ✕
        </span>

        <span>
          The customer will be notified about the rejection reason.
        </span>

      </div>

      {/* Buttons */}
      <div className="confirm-buttons">

        <button
          className="cancels-btn"
          onClick={() => {
            setRejectionModal(false);
            setReason("");
          }}
        >
          Cancel
        </button>

        <button
          className="approve-btn rejects-btn"
          onClick={(e) => {

            if (!Reason.trim()) {
              toast.error(
                "Please enter rejection reason"
              );
              return;
            }

            submitRejection(e);
          }}
        >
          Reject Prescription
        </button>

      </div>

    </div>
  </div>
)}
      <ToastContainer
        position="top-center"
        autoClose={1000}
      />
    </>
  );
};

export default DiseaseMangement;