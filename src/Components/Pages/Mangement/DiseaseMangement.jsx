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
const [ProductData, setProductData] = useState([]);
const [ProductLoading, setProductLoading] = useState(false);

const [addedMedicines, setAddedMedicines] = useState([]);
const [medicineSearch, setMedicineSearch] = useState("");

const [selectedMedicineVariants, setSelectedMedicineVariants] =
  useState({});
  const [expandedSearchProducts, setExpandedSearchProducts] = useState({});

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
  const getAllProducts = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setProductLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/product/?page=1`,
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

    if (!data.success) {
      toast.error(data.message || "Failed to fetch products");
      return;
    }

    // Abhi sirf first page
    setProductData(data.data?.results || []);
  } catch (error) {
    console.error("Get Products Error:", error);
    toast.error("Failed to fetch products");
  } finally {
    setProductLoading(false);
  }
};
const getSelectedMedicineDetails = () => {
  const medicines = [];

  
  (SelectedApprovalRequest?.requested_variants || []).forEach(
    (requestedItem) => {
      const medicine = requestedItem?.variant;
      const variantId = medicine?.variant_id;

      if (!variantId) return;

      if (selectedVariantIds.includes(variantId)) {
        medicines.push({
          variantId,
          name: medicine?.variant_title || "Medicine",
          brand: medicine?.brand_name || "No Brand",
          size: medicine?.size || "-",
          sellingPrice: medicine?.selling_price || 0,
        });
      }
    }
  );


  ProductData.forEach((product) => {
    (product?.variants || []).forEach((variant) => {
      const variantId = variant?.id || variant?.variant_id;

      if (!variantId) return;

      if (
        selectedVariantIds.includes(variantId) &&
        !medicines.some(
          (item) => item.variantId === variantId
        )
      ) {
        medicines.push({
          variantId,
          name:
            variant?.title ||
            variant?.variant_title ||
            variant?.name ||
            "Medicine",
          brand:
            product?.brand_name ||
            variant?.brand_name ||
            "No Brand",
          size: variant?.size || "-",
          sellingPrice:
            variant?.selling_price ||
            variant?.price ||
            0,
        });
      }
    });
  });

  return medicines;
};
const toggleSearchProductVariants = (productId) => {
  setExpandedSearchProducts((prev) => ({
    ...prev,
    [productId]: !prev[productId],
  }));
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
const searchedProducts = ProductData.filter((product) => {
  const search = medicineSearch.trim().toLowerCase();

  if (!search) return false;

  const productName =
    product.name?.toLowerCase() || "";

  const brandName =
    product.brand_name?.toLowerCase() || "";

  const variantMatch =
    product.variants?.some((variant) =>
      variant.title?.toLowerCase().includes(search)
    );

  return (
    productName.includes(search) ||
    brandName.includes(search) ||
    variantMatch
  );
}).slice(0, 8);
  useEffect(() => {
    getMedicineApprovalList();
    getAllProducts();
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
  const medicines = item.requested_variants || [];

  const medicineText = medicines
    .map((requestedItem) => {
      const medicine = requestedItem?.variant;

      return `
        ${medicine?.brand_name || ""}
        ${medicine?.variant_title || ""}
        ${medicine?.size || ""}
      `;
    })
    .join(" ");

  const searchText = `
    ${item.patient_name || ""}
    ${medicineText}
    ${item.status || ""}
  `.toLowerCase();

  return searchText.includes(
    approvalSearch.toLowerCase().trim()
  );
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

  const handleOpenApproveModal = (item) => {
  setSelectedApprovalRequest(item);

  const initialVariantIds = [];
  const initialQuantities = {};

  (item?.requested_variants || []).forEach((requestedItem) => {
    const variantId = requestedItem?.variant?.variant_id;

    if (variantId) {
      initialVariantIds.push(variantId);
      initialQuantities[variantId] = requestedItem?.quantity || 1;
    }
  });

  setSelectedVariantIds(initialVariantIds);
  setApprovedQuantities(initialQuantities);
  setAdminNotes("");
  setMedicineSearch("");
  setExpandedSearchProducts({});
  setApproveModal(true);
};
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

              const medicines = item.requested_variants || [];

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
  <div className="medicine-table-list">
    {medicines.length > 0 ? (
      medicines.map((requestedItem, medicineIndex) => {
        const medicine = requestedItem?.variant;
        const quantity = Number(
          requestedItem?.quantity || 1
        );

        const price = Number(
          medicine?.selling_price || 0
        );

        const itemTotal = price * quantity;

        return (
          <div
            key={
              requestedItem?.id ||
              medicine?.variant_id ||
              medicineIndex
            }
            className="medicine-table-item"
          >
            <strong>
              {medicine?.variant_title || "-"}
            </strong>

           
          </div>
        );
      })
    ) : (
      "-"
    )}
  </div>
</td>
              

                   <td>
  <div className="medicine-table-list">
    {medicines.length > 0 ? (
      medicines.map((requestedItem, medicineIndex) => {
        const medicine = requestedItem?.variant;

        return (
          <span
            key={
              requestedItem?.id ||
              medicine?.variant_id ||
              medicineIndex
            }
          >
            {medicine?.brand_name || "-"}
          </span>
        );
      })
    ) : (
      "-"
    )}
  </div>
</td>

                  
<td>
  <div className="medicine-table-list">
    {medicines.length > 0 ? (
      medicines.map((requestedItem, medicineIndex) => {
        const medicine = requestedItem?.variant;

        return (
          <span
            key={
              requestedItem?.id ||
              medicine?.variant_id ||
              medicineIndex
            }
          >
            {medicine?.size || "-"}
          </span>
        );
      })
    ) : (
      "-"
    )}
  </div>
</td>


     <td>
  ₹
  {medicines
    .reduce((total, requestedItem) => {
      const price = Number(
        requestedItem?.variant?.selling_price || 0
      );

      const quantity = Number(
        requestedItem?.quantity || 1
      );

      return total + price * quantity;
    }, 0)
    .toFixed(2)}
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
onClick={() => handleOpenApproveModal(item)}
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
      <div className="add-medicine-section">

{getSelectedMedicineDetails().length > 0 && (
  <div className="selected-medicines-section">

    <div className="selected-medicines-header">

      <div>
        <h3>Selected Medicines</h3>

        <p>
          These medicines will be included in the approval.
        </p>
      </div>

      <span className="selected-medicines-count">
        {getSelectedMedicineDetails().length} Selected
      </span>

    </div>

    <div className="selected-medicines-list">

      {getSelectedMedicineDetails().map((medicine) => (

        <div
          key={medicine.variantId}
          className="selected-medicine-item"
        >

          {/* CHECK */}
          <div className="selected-medicine-check">
            <FaCheckCircle />
          </div>

          {/* DETAILS */}
          <div className="selected-medicine-details">

            <strong>
              {medicine.name}
            </strong>

            <div className="selected-medicine-meta">

              <span>
                {medicine.brand}
              </span>

              <span>
                Size: {medicine.size}
              </span>

              <span className="selected-medicine-price">
                ₹{Number(medicine.sellingPrice).toFixed(2)}
              </span>

            </div>

          </div>

          {/* QUANTITY */}
          <div className="selected-medicine-quantity">

            <label>
              Qty
            </label>

            <input
              type="number"
              min="1"
              value={
                approvedQuantities[medicine.variantId] ?? 1
              }
              onChange={(e) =>
                handleQuantityChange(
                  medicine.variantId,
                  e.target.value
                )
              }
            />

          </div>

          {/* REMOVE */}
          <button
            type="button"
            className="selected-medicine-remove"
            title="Remove medicine"
            onClick={() =>
              handleVariantSelection(medicine.variantId)
            }
          >
            <IoClose />
          </button>

        </div>

      ))}

    </div>

  </div>
)}

  <div className="add-medicine-search-wrapper">

    <BsSearch className="add-medicine-search-icon" />

    <input
      type="text"
      value={medicineSearch}
      onChange={(e) => {
        setMedicineSearch(e.target.value);
      }}
      placeholder="Search medicine, brand or variant..."
      className="add-medicine-search-input"
    />

    {medicineSearch && (
      <button
        type="button"
        className="add-medicine-clear"
        onClick={() => setMedicineSearch("")}
      >
        <IoClose />
      </button>
    )}

  </div>


 {/* SEARCH RESULT */}

{medicineSearch.trim() && (
  <div className="add-medicine-results">

    {ProductLoading ? (
      <div className="add-medicine-empty">
        Loading medicines...
      </div>
    ) : searchedProducts.length > 0 ? (

      searchedProducts.map((product) => {

        const availableVariants =
          product?.variants?.filter(
            (variant) =>
              variant?.approval_status === "approved" &&
              !variant?.out_of_stock &&
              Number(variant?.quantity) > 0
          ) || [];

        const isExpanded =
          expandedSearchProducts[product.id];

        return (
          <div
            key={product.id}
            className="add-medicine-product"
          >

            {/* PRODUCT ROW */}

            <div className="add-medicine-product-row">

              <div className="add-medicine-result-info">

                <strong>
                  {product?.name || "Unnamed Product"}
                </strong>

                <span>
                  {product?.brand_name || "No Brand"}
                </span>

              </div>

              <button
                type="button"
                className="view-variants-btn"
                disabled={availableVariants.length === 0}
                onClick={() =>
                  toggleSearchProductVariants(product.id)
                }
              >
                <FaEye />

                {isExpanded
                  ? "Hide Variants"
                  : "View Variants"}
              </button>

            </div>


            {/* VARIANTS */}

            {isExpanded && (
              <div className="add-medicine-variants">

                {availableVariants.length > 0 ? (

                  availableVariants.map((variant) => {

                    const variantId =
                      variant?.id || variant?.variant_id;

                    const isSelected =
                      selectedVariantIds.includes(variantId);

                    return (
                      <div
                        key={variantId}
                        className={`add-medicine-variant-row ${
                          isSelected
                            ? "add-medicine-variant-selected"
                            : ""
                        }`}
                      >

                        {/* CHECKBOX */}

                        <label className="medicine-select-checkbox">

                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {

                              if (!variantId) return;

                              handleVariantSelection(
                                variantId
                              );

                            }}
                          />

                          <span className="medicine-checkmark">
                            {isSelected && (
                              <FaCheckCircle />
                            )}
                          </span>

                        </label>


                        {/* VARIANT INFO */}

                        <div className="add-medicine-variant-info">

                          <strong>
                            {variant?.title ||
                              variant?.variant_title ||
                              variant?.name ||
                              "Variant"}
                          </strong>

                          <div className="add-medicine-variant-meta">

                            <span>
                              Size:{" "}
                              {variant?.size || "-"}
                            </span>

                            <span>
                              ₹
                              {variant?.selling_price !==
                              undefined
                                ? Number(
                                    variant.selling_price
                                  ).toFixed(2)
                                : "0.00"}
                            </span>

                          </div>

                        </div>


                        {/* QUANTITY */}

                        {isSelected && (
                          <div className="medicine-quantity">

                            <label>
                              Quantity
                            </label>

                            <input
                              type="number"
                              min="1"
                              value={
                                approvedQuantities[
                                  variantId
                                ] ?? 1
                              }
                              onChange={(e) =>
                                handleQuantityChange(
                                  variantId,
                                  e.target.value
                                )
                              }
                            />

                          </div>
                        )}

                      </div>
                    );

                  })

                ) : (

                  <div className="add-medicine-empty">
                    No approved variants available
                  </div>

                )}

              </div>
            )}

          </div>
        );
      })

    ) : (

      <div className="add-medicine-empty">
        No medicine found
      </div>

    )}

  </div>
)}
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