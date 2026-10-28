
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
  const navigate = useNavigate();

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

  const [RejectionVendorModal, setRejectionModal] = useState(false);
  const [Reason, setReason] = useState("");

  const [ProductData, setProductData] = useState([]);
  const [ProductLoading, setProductLoading] = useState(false);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [expandedSearchProducts, setExpandedSearchProducts] = useState({});

  // --------------------------------------------------
  // HELPERS
  // --------------------------------------------------

  const normalizeId = (id) =>
    id === undefined || id === null ? "" : String(id).trim();

  const normalizeText = (value) =>
    String(value ?? "").trim().toLowerCase();

  const getVariantId = (variant) =>
    variant?.id ??
    variant?.variant_id ??
    variant?.variantId ??
    variant?.product_variant_id ??
    null;

  const getVariantStock = (variant) => {
    if (!variant) return null;

    const stockFields = [
      "quantity",
      "stock_quantity",
      "available_stock",
      "stock",
    ];

    for (const field of stockFields) {
      const value = variant[field];

      if (value !== undefined && value !== null && value !== "") {
        const stock = Number(value);

        if (Number.isFinite(stock) && stock >= 0) {
          return stock;
        }
      }
    }

    return null;
  };

  const getVariantTitle = (variant) =>
    variant?.title ||
    variant?.variant_title ||
    variant?.name ||
    "";

  // --------------------------------------------------
  // IMPORTANT FIX:
  // Find the same variant that is shown in search results.
  // First match IDs, then use medicine details if IDs differ.
  // --------------------------------------------------

  const getProductVariantById = (variantId, medicine = null) => {
    const targetId = normalizeId(variantId);

    const allVariants = (ProductData || []).flatMap((product) =>
      (product?.variants || []).map((variant) => ({
        ...variant,
        __parentProduct: product,
      }))
    );

    // 1. Exact variant ID match
    if (targetId) {
      const matchedById = allVariants.find((variant) => {
        const possibleIds = [
          variant?.id,
          variant?.variant_id,
          variant?.variantId,
          variant?.product_variant_id,
        ];

        return possibleIds.some(
          (id) => normalizeId(id) === targetId
        );
      });

      if (matchedById) return matchedById;
    }

    // 2. If IDs differ, match using variant title + size.
    // Brand is also checked when both sides provide it.
    if (medicine) {
      const requestedTitle = normalizeText(
        medicine?.variant_title ||
        medicine?.title ||
        medicine?.name
      );

      const requestedSize = normalizeText(medicine?.size);
      const requestedBrand = normalizeText(medicine?.brand_name);

      if (requestedTitle) {
        const matchedByDetails = allVariants.find((variant) => {
          const product = variant.__parentProduct;

          const productTitle = normalizeText(getVariantTitle(variant));
          const productSize = normalizeText(variant?.size);
          const productBrand = normalizeText(
            variant?.brand_name || product?.brand_name
          );

          const titleMatches = productTitle === requestedTitle;

          const sizeMatches =
            !requestedSize ||
            !productSize ||
            productSize === requestedSize;

          const brandMatches =
            !requestedBrand ||
            !productBrand ||
            productBrand === requestedBrand;

          return titleMatches && sizeMatches && brandMatches;
        });

        if (matchedByDetails) return matchedByDetails;
      }
    }

    return null;
  };

  const getStockForVariant = (variantId, medicine = null) => {
    const productVariant = getProductVariantById(variantId, medicine);

    // Use the exact same stock field as the search variant.
    if (productVariant) {
      return getVariantStock(productVariant);
    }

    // No matching product variant means stock is unknown.
    // Do not assume requested quantity is actual inventory.
    return null;
  };

  // --------------------------------------------------
  // FETCH APPROVAL REQUESTS
  // --------------------------------------------------

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

      if (data.success) {
        setApprovalRequestData(data.data || []);
      } else {
        setApprovalRequestError(
          data.message || "Failed to fetch medicine approval requests"
        );
        toast.error(data.message || "Failed to fetch medicine approval requests");
      }
    } catch (error) {
      console.error("Medicine Approval Fetch Error:", error);
      setApprovalRequestError("Unable to fetch prescription requests.");
      toast.error("Failed to fetch medicine approval data");
    } finally {
      setApprovalRequestLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCH PRODUCTS
  // --------------------------------------------------

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
        `${BASE_URL}/vendors/admin/product/?page=1&page_size=1000`,
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

      const products = data.data?.results || data.data || [];

      setProductData(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error("Get Products Error:", error);
      toast.error("Failed to fetch products");
    } finally {
      setProductLoading(false);
    }
  };

  useEffect(() => {
    getMedicineApprovalList();
    getAllProducts();
  }, []);

  // --------------------------------------------------
  // SELECTED MEDICINES
  // --------------------------------------------------

  const getSelectedMedicineDetails = () => {
    const medicines = [];

    // Already requested medicines
    (SelectedApprovalRequest?.requested_variants || []).forEach(
      (requestedItem) => {
        const medicine = requestedItem?.variant;
        const variantId = getVariantId(medicine);

        if (!variantId) return;

        const isSelected = selectedVariantIds.some(
          (id) => normalizeId(id) === normalizeId(variantId)
        );

        if (!isSelected) return;

        const productVariant = getProductVariantById(
          variantId,
          medicine
        );

        const stock = getStockForVariant(variantId, medicine);

        medicines.push({
          variantId,
          name:
            getVariantTitle(productVariant) ||
            getVariantTitle(medicine) ||
            "Medicine",
          brand:
            productVariant?.brand_name ||
            productVariant?.__parentProduct?.brand_name ||
            medicine?.brand_name ||
            "No Brand",
          size: productVariant?.size || medicine?.size || "-",
          sellingPrice:
            productVariant?.selling_price ??
            medicine?.selling_price ??
            productVariant?.price ??
            0,
          stock,
        });
      }
    );

    // Medicines added from product search
    (ProductData || []).forEach((product) => {
      (product?.variants || []).forEach((variant) => {
        const variantId = getVariantId(variant);

        if (!variantId) return;

        const isSelected = selectedVariantIds.some(
          (id) => normalizeId(id) === normalizeId(variantId)
        );

        if (!isSelected) return;

        const alreadyExists = medicines.some(
          (item) =>
            normalizeId(item.variantId) === normalizeId(variantId)
        );

        if (alreadyExists) return;

        medicines.push({
          variantId,
          name: getVariantTitle(variant) || product?.name || "Medicine",
          brand: variant?.brand_name || product?.brand_name || "No Brand",
          size: variant?.size || "-",
          sellingPrice: variant?.selling_price ?? variant?.price ?? 0,
          stock: getStockForVariant(variantId, variant),
        });
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

  

  const handleVariantSelection = (variantId, medicine = null) => {
    const normalizedId = normalizeId(variantId);

    setSelectedVariantIds((prev) => {
      const alreadySelected = prev.some(
        (id) => normalizeId(id) === normalizedId
      );

      if (alreadySelected) {
        setApprovedQuantities((prevQuantities) => {
          const updated = { ...prevQuantities };
          delete updated[normalizedId];
          delete updated[variantId];
          return updated;
        });

        return prev.filter(
          (id) => normalizeId(id) !== normalizedId
        );
      }

      const stock = getStockForVariant(variantId, medicine);

      if (stock === null) {
        toast.error(
          "Stock could not be verified for this medicine. Please check the product variant."
        );
        return prev;
      }

      if (stock <= 0) {
        toast.error("This medicine is out of stock.");
        return prev;
      }

      setApprovedQuantities((prevQuantities) => ({
        ...prevQuantities,
        [normalizedId]: 1,
      }));

      return [...prev, variantId];
    });
  };

  const handleQuantityChange = (variantId, value, stock) => {
    const key = normalizeId(variantId);

    if (stock === null || !Number.isFinite(Number(stock))) {
      toast.error("Stock is unavailable for this medicine.");
      return;
    }

    const availableStock = Number(stock);

    if (value === "") {
      setApprovedQuantities((prev) => ({
        ...prev,
        [key]: "",
      }));
      return;
    }

    const quantity = Number(value);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setApprovedQuantities((prev) => ({
        ...prev,
        [key]: "",
      }));
      return;
    }

    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} units are available in stock.`);

      setApprovedQuantities((prev) => ({
        ...prev,
        [key]: availableStock,
      }));
      return;
    }

    setApprovedQuantities((prev) => ({
      ...prev,
      [key]: quantity,
    }));
  };

  // --------------------------------------------------
  // OPEN APPROVAL MODAL
  // --------------------------------------------------

  const handleOpenApproveModal = (item) => {
    setSelectedApprovalRequest(item);

    const initialVariantIds = [];
    const initialQuantities = {};

    (item?.requested_variants || []).forEach((requestedItem) => {
      const medicine = requestedItem?.variant;
      const variantId = getVariantId(medicine);

      if (!variantId) return;

      initialVariantIds.push(variantId);

      // Resolve stock using the same lookup as search results.
      const stock = getStockForVariant(variantId, medicine);
      const requestedQuantity = Number(requestedItem?.quantity ?? 1);

      if (stock !== null && stock > 0) {
        initialQuantities[normalizeId(variantId)] = Math.min(
          Math.max(1, requestedQuantity),
          stock
        );
      } else {
        // Keep the item selected, but do not pretend stock is 0.
        initialQuantities[normalizeId(variantId)] = "";
      }
    });

    setSelectedVariantIds(initialVariantIds);
    setApprovedQuantities(initialQuantities);
    setAdminNotes("");
    setMedicineSearch("");
    setExpandedSearchProducts({});
    setApproveModal(true);
  };

  const closeApproveModal = () => {
    if (isApproving) return;

    setApproveModal(false);
    setSelectedApprovalRequest(null);
    setSelectedVariantIds([]);
    setApprovedQuantities({});
    setAdminNotes("");
    setMedicineSearch("");
    setExpandedSearchProducts({});
  };

  

  const handleApproveRequest = async () => {
    if (!SelectedApprovalRequest) return;

    if (selectedVariantIds.length === 0) {
      toast.error("Please select at least one medicine");
      return;
    }

    const quantities = {};

    for (const variantId of selectedVariantIds) {
      const medicine = (
        SelectedApprovalRequest?.requested_variants || []
      ).find(
        (item) =>
          normalizeId(getVariantId(item?.variant)) ===
          normalizeId(variantId)
      )?.variant;

      const stock = getStockForVariant(variantId, medicine);

      if (stock === null) {
        toast.error(
          "Stock could not be verified for a selected medicine."
        );
        return;
      }

      const quantity = Number(
        approvedQuantities[normalizeId(variantId)] ??
        approvedQuantities[variantId]
      );

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > stock
      ) {
        toast.error(
          `Enter a valid quantity between 1 and ${stock}.`
        );
        return;
      }

      quantities[variantId] = quantity;
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
        quantities,
      };

      if (adminNotes.trim()) {
        payload.admin_notes = adminNotes.trim();
      }

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

      if (data.success) {
        toast.success(data.message || "Prescription approved successfully");

        setApproveModal(false);
        setSelectedApprovalRequest(null);
        setSelectedVariantIds([]);
        setApprovedQuantities({});
        setAdminNotes("");

        getMedicineApprovalList();
        getAllProducts();
      } else {
        toast.error(data.message || "Failed to approve prescription");
      }
    } catch (error) {
      console.error("Approve Prescription Error:", error);
      toast.error("Something went wrong while approving prescription");
    } finally {
      setIsApproving(false);
    }
  };

  // --------------------------------------------------
  // REJECT PRESCRIPTION
  // --------------------------------------------------

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
          body: JSON.stringify({
            status: "rejected",
            rejection_reason: Reason.trim(),
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

      if (data.success) {
        toast.success(data.message || "Prescription rejected successfully");

        setRejectionModal(false);
        setReason("");
        setSelectedApprovalRequest(null);

        getMedicineApprovalList();
      } else {
        toast.error(data.message || "Failed to reject prescription");
      }
    } catch (error) {
      console.error("Reject Prescription Error:", error);
      toast.error("Something went wrong while rejecting prescription");
    }
  };

  // --------------------------------------------------
  // SEARCH PRODUCTS
  // --------------------------------------------------

  const searchedProducts = ProductData.filter((product) => {
    const search = medicineSearch.trim().toLowerCase();

    if (!search) return false;

    const productName = product?.name?.toLowerCase() || "";
    const brandName = product?.brand_name?.toLowerCase() || "";

    const variantMatch = (product?.variants || []).some((variant) => {
      return [
        variant?.title,
        variant?.variant_title,
        variant?.name,
        variant?.size,
      ].some((value) => String(value || "").toLowerCase().includes(search));
    });

    return (
      productName.includes(search) ||
      brandName.includes(search) ||
      variantMatch
    );
  }).slice(0, 8);

  // --------------------------------------------------
  // TABLE HELPERS
  // --------------------------------------------------

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "-";

    return parsed.toLocaleString("en-GB", {
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
        return status ? status.replaceAll("_", " ") : "-";
    }
  };

  const filteredRequests = ApprovalRequestData.filter((item) => {
    const medicines = item.requested_variants || [];

    const medicineText = medicines
      .map((requestedItem) => {
        const medicine = requestedItem?.variant;

        return [
          medicine?.brand_name,
          medicine?.variant_title,
          medicine?.size,
        ].join(" ");
      })
      .join(" ");

    const searchText = [
      item.patient_name,
      medicineText,
      item.status,
    ]
      .join(" ")
      .toLowerCase();

    return searchText.includes(approvalSearch.trim().toLowerCase());
  });

  const totalRequests = ApprovalRequestData.length;

  const pendingRequests = ApprovalRequestData.filter(
    (item) => item.status === "pending_review"
  ).length;

  const approvedRequests = ApprovalRequestData.filter(
    (item) => item.status === "approved"
  ).length;

  const rejectedRequests = ApprovalRequestData.filter(
    (item) =>
      item.status === "cancelled" || item.status === "rejected"
  ).length;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      <div className="page-header">
        <h1>Medicine Approval</h1>
        <p className="page-paragraph">
          Review and approve medicines submitted for users
        </p>
      </div>

      <div className="vendors-stats stats2-grid">
        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaClipboardList size={20} />
          </div>
          <div className="stat2-info">
            <h3>Total Requests</h3>
            <div className="stat2-value">{totalRequests}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaClock size={16} />
          </div>
          <div className="stat2-info">
            <h3>Pending Requests</h3>
            <div className="stat2-value">{pendingRequests}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaCheckCircle size={16} />
          </div>
          <div className="stat2-info">
            <h3>Approved Requests</h3>
            <div className="stat2-value">{approvedRequests}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaTimesCircle size={16} />
          </div>
          <div className="stat2-info">
            <h3>Rejected Requests</h3>
            <div className="stat2-value">{rejectedRequests}</div>
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
              <th>Price</th>
              <th>Requested Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {ApprovalRequestLoading ? (
              Array(4).fill(0).map((_, index) => (
                <tr key={index}>
                  <td colSpan="8"><div className="skeleton-row" /></td>
                </tr>
              ))
            ) : ApprovalRequestError ? (
              <tr>
                <td colSpan="8" style={{ color: "red", textAlign: "center" }}>
                  {ApprovalRequestError}
                </td>
              </tr>
            ) : filteredRequests.length > 0 ? (
              filteredRequests.map((item, index) => {
                const medicines = item.requested_variants || [];

                const totalPrice = medicines.reduce(
                  (total, requestedItem) => {
                    const price = Number(
                      requestedItem?.variant?.selling_price || 0
                    );
                    const quantity = Number(requestedItem?.quantity || 1);

                    return total + price * quantity;
                  },
                  0
                );

                return (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <strong>{item.patient_name || "-"}</strong>
                        <span style={{ fontSize: 11, color: "#777" }}>
                          Patient ID: {item.patient_id || "-"}
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
                            gap: 6,
                            color: "#0D614E",
                            textDecoration: "none",
                            fontWeight: 600,
                          }}
                        >
                          <FaFilePrescription /> View
                        </a>
                      ) : "-"}
                    </td>

                    <td>
                      <div className="medicine-table-list">
                        {medicines.length ? medicines.map((requestedItem, i) => (
                          <span key={requestedItem?.id || getVariantId(requestedItem?.variant) || i}>
                            {requestedItem?.variant?.size ||
                              getVariantTitle(requestedItem?.variant) ||
                              "-"}
                          </span>
                        )) : "-"}
                      </div>
                    </td>

                    <td>₹{totalPrice.toFixed(2)}</td>

                    <td>
                      <div className="created-cell">
                        <span>{formatDate(item.created_at)}</span>
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
                            <FaCheckCircle /> Approved
                          </span>
                        )}

                        {item.status === "rejected" && (
                          <span className="medicine-action-status medicine-rejected-text">
                            <FaTimesCircle /> Rejected
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center" }}>
                  No Medicine Approval Requests Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* APPROVE MODAL */}
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

            <h2 className="confirm-title">Approve Prescription</h2>

            <p className="confirm-description">
              Select the medicines you want to approve and update quantities if required.
            </p>

            <div className="vendor-info-card medicine-patient-card">
              <div className="vendor-row">
                <span className="label">Patient Name</span>
                <span className="value approve-text">
                  {SelectedApprovalRequest.patient_name || "N/A"}
                </span>
              </div>
            </div>

            <div className="medicine-approval-section">
              <div className="medicine-section-header">
                <div>
                  <h3>Select Medicines</h3>
                  <p>Select the medicines to include in approval.</p>
                </div>
                <span className="medicine-selected-count">
                  {selectedVariantIds.length} Selected
                </span>
              </div>

              <div className="medicine-approval-list">
                {(SelectedApprovalRequest.requested_variants || []).map(
                  (requestedItem, index) => {
                    const medicine = requestedItem?.variant;
                    const variantId = getVariantId(medicine);

                    if (!variantId) return null;

                    const key = normalizeId(variantId);
                    const isSelected = selectedVariantIds.some(
                      (id) => normalizeId(id) === key
                    );

                    const productVariant = getProductVariantById(
                      variantId,
                      medicine
                    );

                    const stock = getStockForVariant(variantId, medicine);

                    const title =
                      getVariantTitle(productVariant) ||
                      getVariantTitle(medicine) ||
                      "Medicine";

                    const price =
                      productVariant?.selling_price ??
                      medicine?.selling_price ??
                      productVariant?.price ??
                      0;

                    return (
                      <div
                        key={key || index}
                        className={`medicine-approval-item ${
                          isSelected ? "medicine-approval-item-selected" : ""
                        }`}
                      >
                        <label className="medicine-select-checkbox">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleVariantSelection(variantId, medicine)}
                          />
                          <span className="medicine-checkmark">
                            {isSelected && <FaCheckCircle />}
                          </span>
                        </label>

                        <div className="medicine-details">
                          <strong>{title}</strong>
                          <div className="medicine-meta">
                            <span>
                              {productVariant?.brand_name ||
                                productVariant?.__parentProduct?.brand_name ||
                                medicine?.brand_name ||
                                "No Brand"}
                            </span>
                            <span>₹{Number(price).toFixed(2)}</span>
                            <span>
                              Stock: {stock === null ? "Unavailable" : stock}
                            </span>
                          </div>
                        </div>

                        <div className="medicine-quantity">
                          <label>Quantity</label>
                          <input
                            type="number"
                            min="1"
                            max={stock ?? undefined}
                            value={approvedQuantities[key] ?? ""}
                            disabled={!isSelected || stock === null || stock <= 0}
                            onChange={(e) =>
                              handleQuantityChange(variantId, e.target.value, stock)
                            }
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* SELECTED MEDICINES */}
            <div className="add-medicine-section">
              {getSelectedMedicineDetails().length > 0 && (
                <div className="selected-medicines-section">
                  <div className="selected-medicines-header">
                    <div>
                      <h3>Selected Medicines</h3>
                      <p>These medicines will be included in the approval.</p>
                    </div>
                    <span className="selected-medicines-count">
                      {getSelectedMedicineDetails().length} Selected
                    </span>
                  </div>

                  <div className="selected-medicines-list">
                    {getSelectedMedicineDetails().map((medicine) => {
                      const key = normalizeId(medicine.variantId);

                      return (
                        <div
                          key={key}
                          className="selected-medicine-item"
                        >
                          <div className="selected-medicine-check">
                            <FaCheckCircle />
                          </div>

                          <div className="selected-medicine-details">
                            <strong>{medicine.name}</strong>
                            <div className="selected-medicine-meta">
                              <span>{medicine.brand}</span>
                              <span>Size: {medicine.size}</span>
                              <span>
                                Stock: {medicine.stock === null ? "Unavailable" : medicine.stock}
                              </span>
                              <span className="selected-medicine-price">
                                ₹{Number(medicine.sellingPrice).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <div className="selected-medicine-quantity">
                            <label>Qty</label>
                            <input
                              type="number"
                              min="1"
                              max={medicine.stock ?? undefined}
                              value={approvedQuantities[key] ?? ""}
                              disabled={
                                medicine.stock === null ||
                                medicine.stock <= 0
                              }
                              onChange={(e) =>
                                handleQuantityChange(
                                  medicine.variantId,
                                  e.target.value,
                                  medicine.stock
                                )
                              }
                            />
                          </div>

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
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SEARCH */}
              <div className="add-medicine-search-wrapper">
                <BsSearch className="add-medicine-search-icon" />

                <input
                  type="text"
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
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

              {medicineSearch.trim() && (
                <div className="add-medicine-results">
                  {ProductLoading ? (
                    <div className="add-medicine-empty">Loading medicines...</div>
                  ) : searchedProducts.length > 0 ? (
                    searchedProducts.map((product) => {
                      const allVariants = product?.variants || [];
                      const isExpanded = expandedSearchProducts[product.id];

                      return (
                        <div key={product.id} className="add-medicine-product">
                          <div className="add-medicine-product-row">
                            <div className="add-medicine-result-info">
                              <strong>{product?.name || "Unnamed Product"}</strong>
                              <span>{product?.brand_name || "No Brand"}</span>
                            </div>

                            <button
                              type="button"
                              className="view-variants-btn"
                              disabled={allVariants.length === 0}
                              onClick={() =>
                                toggleSearchProductVariants(product.id)
                              }
                            >
                              <FaEye />
                              {isExpanded ? "Hide Variants" : "View Variants"}
                            </button>
                          </div>

                          {allVariants.length === 0 && (
                            <div className="variant-unavailable-message">
                              No variants available for this product.
                            </div>
                          )}

                          {isExpanded && allVariants.length > 0 && (
                            <div className="add-medicine-variants">
                              {allVariants.map((variant, index) => {
                                const variantId = getVariantId(variant);

                                if (!variantId) return null;

                                const key = normalizeId(variantId);
                                const quantity = getVariantStock(variant);
                                const approvalStatus =
                                  variant?.approval_status || "";

                                const isOutOfStock =
                                  quantity === null || quantity <= 0;

                                const isApproved =
                                  approvalStatus === "approved";

                                const canSelect =
                                  isApproved && !isOutOfStock;

                                const isSelected = selectedVariantIds.some(
                                  (id) => normalizeId(id) === key
                                );

                                let unavailableReason = "";

                                if (!isApproved) {
                                  unavailableReason =
                                    approvalStatus === "rejected"
                                      ? "This variant is rejected."
                                      : approvalStatus === "suspended"
                                      ? "This variant is suspended."
                                      : approvalStatus === "pending" ||
                                        approvalStatus === "pending_review"
                                      ? "This variant is pending approval."
                                      : "This variant is not approved.";
                                } else if (isOutOfStock) {
                                  unavailableReason =
                                    "Stock is unavailable or out of stock.";
                                }

                                return (
                                  <div
                                    key={key || index}
                                    className={`add-medicine-variant-row ${
                                      isSelected ? "add-medicine-variant-selected" : ""
                                    } ${
                                      !canSelect ? "add-medicine-variant-disabled" : ""
                                    }`}
                                  >
                                    <label
                                      className={`medicine-select-checkbox ${
                                        !canSelect ? "medicine-checkbox-disabled" : ""
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        disabled={!canSelect && !isSelected}
                                        onChange={() =>
                                          handleVariantSelection(variantId, variant)
                                        }
                                      />
                                      <span className="medicine-checkmark">
                                        {isSelected && <FaCheckCircle />}
                                      </span>
                                    </label>

                                    <div className="add-medicine-variant-info">
                                      <strong>
                                        {getVariantTitle(variant) || "Variant"}
                                      </strong>

                                      <div className="add-medicine-variant-meta">
                                        <span>
                                          Stock: {quantity === null ? "Unavailable" : quantity}
                                        </span>
                                        <span>
                                          ₹{Number(variant?.selling_price ?? variant?.price ?? 0).toFixed(2)}
                                        </span>
                                        <span
                                          className={
                                            !isOutOfStock
                                              ? "variant-status-approved"
                                              : "variant-status-rejected"
                                          }
                                        >
                                          {isOutOfStock ? "Out of Stock" : "Available"}
                                        </span>
                                      </div>

                                      {approvalStatus &&
                                        approvalStatus !== "approved" && (
                                          <div className="variant-unavailable-reason">
                                            Status: {approvalStatus.replace(/_/g, " ")}
                                          </div>
                                        )}

                                      {!canSelect && (
                                        <div className="variant-unavailable-reason">
                                          {unavailableReason}
                                        </div>
                                      )}
                                    </div>

                                    {isSelected && canSelect && (
                                      <div className="medicine-quantity">
                                        <label>Quantity</label>
                                        <input
                                          type="number"
                                          min="1"
                                          max={quantity}
                                          value={approvedQuantities[key] ?? ""}
                                          onChange={(e) =>
                                            handleQuantityChange(
                                              variantId,
                                              e.target.value,
                                              quantity
                                            )
                                          }
                                        />
                                        <small
                                          style={{
                                            display: "block",
                                            marginTop: 4,
                                            fontSize: 9,
                                            color: "#7b8582",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          Max: {quantity}
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="add-medicine-empty">No medicine found</div>
                  )}
                </div>
              )}
            </div>

            <div className="medicine-admin-notes">
              <label>Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add an optional internal note..."
                rows="3"
              />
            </div>

            {selectedVariantIds.length === 0 && (
              <div className="policy-warning">
                <span className="policy-warning-icon">i</span>
                <span>
                  Please select at least one medicine before approving this prescription.
                </span>
              </div>
            )}

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
                  isApproving || selectedVariantIds.length === 0
                    ? "approve-btn-disabled"
                    : ""
                }`}
                disabled={isApproving || selectedVariantIds.length === 0}
                onClick={handleApproveRequest}
              >
                {isApproving
                  ? "Approving..."
                  : `Approve ${selectedVariantIds.length} Medicine${
                      selectedVariantIds.length !== 1 ? "s" : ""
                    }`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION MODAL */}
      {RejectionVendorModal && SelectedApprovalRequest && (
        <div className="confirm-overlay">
          <div className="reason-modal modern-reason-modal medicine-reject-modal">
            <button
              className="closes-modal"
              onClick={() => {
                setRejectionModal(false);
                setReason("");
              }}
            >
              <IoClose />
            </button>

            <div className="reason-icon reject-bg">✕</div>

            <h2>Reject Prescription</h2>

            <p className="reason-subtitle">
              Please provide a reason for rejecting this prescription request.
            </p>

            <div className="vendor-info-card reject-card">
              <div className="vendor-row">
                <span className="label">Patient Name</span>
                <span className="value reject-text">
                  {SelectedApprovalRequest.patient_name || "N/A"}
                </span>
              </div>
            </div>

            <div className="reject-medicines-section">
              <div className="reject-medicines-header">
                <div>
                  <h3>Requested Medicines</h3>
                  <p>Medicines included in this prescription request.</p>
                </div>

                <span className="reject-medicine-count">
                  {SelectedApprovalRequest.requested_variants?.length || 0} Medicines
                </span>
              </div>

              <div className="reject-medicines-list">
                {(SelectedApprovalRequest.requested_variants || []).map(
                  (requestedItem, index) => {
                    const medicine = requestedItem?.variant;
                    const variantId = getVariantId(medicine);

                    if (!variantId) return null;

                    return (
                      <div
                        key={normalizeId(variantId) || index}
                        className="reject-medicine-item"
                      >
                        <div className="reject-medicine-info">
                          <div className="reject-medicine-name">
                            {getVariantTitle(medicine) || "Medicine"}
                          </div>

                          <div className="reject-medicine-meta">
                            <span>{medicine?.brand_name || "No Brand"}</span>
                            <span>Size: {medicine?.size || "N/A"}</span>
                            <span>
                              ₹{Number(medicine?.selling_price ?? 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

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

            <div className="info-box reject-info-box">
              <span className="infos-icon reject-infos-icon">✕</span>
              <span>
                The customer will be notified about the rejection reason.
              </span>
            </div>

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
                onClick={submitRejection}
              >
                Reject Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={1000} />
    </>
  );
};

export default DiseaseMangement;
