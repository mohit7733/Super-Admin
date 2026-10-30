import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaSearch,
  FaPlus,
  FaMinus,
  FaTimes,
  FaFilePrescription,
  FaBoxOpen,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import "./ApproveMedicine.css";

const ApproveMedicine = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [request, setRequest] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedProducts, setExpandedProducts] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [adminNotes, setAdminNotes] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  const token = () => sessionStorage.getItem("superadmin_token");
  const normalizeId = (value) =>
    value === undefined || value === null ? "" : String(value).trim();

  const getVariantId = (variant) =>
    variant?.id ??
    variant?.variant_id ??
    variant?.variantId ??
    variant?.product_variant_id ??
    null;

  const getVariantName = (variant) =>
    variant?.title || variant?.variant_title || variant?.name || "Medicine";

  const getStock = (variant) => {
    if (!variant) return null;
    const value =
      variant.quantity ??
      variant.stock_quantity ??
      variant.available_stock ??
      variant.stock;
    if (value === undefined || value === null || value === "") return null;
    const stock = Number(value);
    return Number.isFinite(stock) && stock >= 0 ? stock : null;
  };

  const handleUnauthorized = () => {
    sessionStorage.removeItem("superadmin_token");
    toast.error("Session expired. Please login again");
    navigate("/login");
  };

  useEffect(() => {
    const loadPage = async () => {
      const authToken = token();
      if (!authToken) {
        handleUnauthorized();
        return;
      }

      setLoading(true);
      setProductsLoading(true);

      try {
        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
          "ngrok-skip-browser-warning": "true",
        };

        const [requestResponse, productResponse] = await Promise.all([
          fetch(`${BASE_URL}/customers/admin/prescription-requests/`, {
            method: "GET",
            headers,
          }),
          fetch(`${BASE_URL}/vendors/admin/product/?page=1&page_size=1000`, {
            method: "GET",
            headers,
          }),
        ]);

        if (
          requestResponse.status === 401 ||
          requestResponse.status === 403 ||
          productResponse.status === 401 ||
          productResponse.status === 403
        ) {
          handleUnauthorized();
          return;
        }

        const [requestData, productData] = await Promise.all([
          requestResponse.json(),
          productResponse.json(),
        ]);

        const requestList = Array.isArray(requestData.data)
          ? requestData.data
          : requestData.data?.results || [];

        const currentRequest = requestList.find(
          (item) => normalizeId(item.id) === normalizeId(id)
        );

        if (!requestData.success || !currentRequest) {
          toast.error(
            requestData.message || "Prescription request could not be found"
          );
          navigate(-1);
          return;
        }

        if (currentRequest.status !== "pending_review") {
          toast.info("This prescription request is no longer pending");
          navigate(-1);
          return;
        }

        const productList = productData.data?.results || productData.data || [];
        const safeProducts = Array.isArray(productList) ? productList : [];

        setRequest(currentRequest);
        setProducts(safeProducts);

        const initialIds = [];
        const initialQuantities = {};

        (currentRequest.requested_variants || []).forEach((item) => {
          const variant = item?.variant;
          const variantId = getVariantId(variant);
          if (!variantId) return;

          const key = normalizeId(variantId);
          initialIds.push(variantId);

          const matchedProductVariant = safeProducts
            .flatMap((product) => product.variants || [])
            .find((productVariant) => normalizeId(getVariantId(productVariant)) === key);

          const stock = getStock(matchedProductVariant || variant);
          const requestedQty = Number(item?.quantity ?? 1);

          initialQuantities[key] =
            stock !== null && stock > 0
              ? Math.min(Math.max(1, requestedQty), stock)
              : "";
        });

        setSelectedIds(initialIds);
        setQuantities(initialQuantities);

        if (!productData.success) {
          toast.error(productData.message || "Products could not be loaded");
        }
      } catch (error) {
        console.error("Approve prescription page load error:", error);
        toast.error("Unable to load prescription details");
      } finally {
        setLoading(false);
        setProductsLoading(false);
      }
    };

    loadPage();
    // Route id identifies the prescription being reviewed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const findProductVariant = (variantId) => {
    const key = normalizeId(variantId);
    for (const product of products) {
      const variant = (product.variants || []).find(
        (item) => normalizeId(getVariantId(item)) === key
      );
      if (variant) return { product, variant };
    }
    return null;
  };

  const getSelectedDetails = () => {
    return selectedIds.map((variantId) => {
      const key = normalizeId(variantId);
      const requestedItem = (request?.requested_variants || []).find(
        (item) =>
          normalizeId(getVariantId(item?.variant)) === key
      );
      const requestedVariant = requestedItem?.variant;
      const match = findProductVariant(variantId);
      const variant = match?.variant || requestedVariant || {};
      const product = match?.product;

      return {
        id: variantId,
        key,
        name: getVariantName(variant),
        brand: variant.brand_name || product?.brand_name || requestedVariant?.brand_name || "No Brand",
        price: Number(variant.selling_price ?? variant.price ?? requestedVariant?.selling_price ?? 0),
        stock: getStock(variant),
        size: variant.size || requestedVariant?.size || "",
      };
    });
  };

  const toggleVariant = (variant) => {
    const variantId = getVariantId(variant);
    if (!variantId) return;

    const key = normalizeId(variantId);
    const alreadySelected = selectedIds.some(
      (item) => normalizeId(item) === key
    );

    if (alreadySelected) {
      setSelectedIds((prev) =>
        prev.filter((item) => normalizeId(item) !== key)
      );
      setQuantities((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    const stock = getStock(variant);
    if (variant.approval_status !== "approved") {
      toast.error("Only approved product variants can be added");
      return;
    }
    if (stock === null || stock <= 0) {
      toast.error("This medicine is out of stock or stock is unavailable");
      return;
    }

    setSelectedIds((prev) => [...prev, variantId]);
    setQuantities((prev) => ({ ...prev, [key]: 1 }));
  };

  const changeQuantity = (variantId, value, stock) => {
    const key = normalizeId(variantId);
    if (value === "") {
      setQuantities((prev) => ({ ...prev, [key]: "" }));
      return;
    }

    const qty = Number(value);
    if (!Number.isInteger(qty) || qty < 1) {
      setQuantities((prev) => ({ ...prev, [key]: "" }));
      return;
    }
    if (stock === null || qty > stock) {
      toast.error(`Available stock is ${stock ?? 0}`);
      setQuantities((prev) => ({ ...prev, [key]: stock > 0 ? stock : "" }));
      return;
    }
    setQuantities((prev) => ({ ...prev, [key]: qty }));
  };

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];

    return products
      .filter((product) => {
        const productMatch = [
          product.name,
          product.brand_name,
          product.product_category_name,
        ].some((value) => String(value || "").toLowerCase().includes(term));

        const variantMatch = (product.variants || []).some((variant) =>
          [variant.title, variant.vendor_sku_code, variant.sku_code].some(
            (value) => String(value || "").toLowerCase().includes(term)
          )
        );
        return productMatch || variantMatch;
      })
      .slice(0, 10);
  }, [products, search]);

  const approvePrescription = async () => {
    if (!request) return;
    if (!selectedIds.length) {
      toast.error("Please select at least one medicine");
      return;
    }

    const payloadQuantities = {};
    for (const variantId of selectedIds) {
      const key = normalizeId(variantId);
      const match = findProductVariant(variantId);
      const requestedVariant = (request.requested_variants || []).find(
        (item) => normalizeId(getVariantId(item?.variant)) === key
      )?.variant;
      const stock = getStock(match?.variant || requestedVariant);
      const qty = Number(quantities[key]);

      if (stock === null || !Number.isInteger(qty) || qty < 1 || qty > stock) {
        toast.error(
          `Enter a valid quantity for ${getVariantName(match?.variant || requestedVariant)}`
        );
        return;
      }
      payloadQuantities[variantId] = qty;
    }

    const authToken = token();
    if (!authToken) {
      handleUnauthorized();
      return;
    }

    setIsApproving(true);
    try {
      const payload = {
        status: "approved",
        variant_ids: selectedIds,
        quantities: payloadQuantities,
      };
      if (adminNotes.trim()) payload.admin_notes = adminNotes.trim();

      const response = await fetch(
        `${BASE_URL}/customers/admin/prescription-requests/?id=${request.id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleUnauthorized();
        return;
      }

      const data = await response.json();
      if (!data.success) {
        toast.error(data.message || "Failed to approve prescription");
        return;
      }

      toast.success(data.message || "Prescription approved successfully");
      setTimeout(() => navigate(-1), 700);
    } catch (error) {
      console.error("Approve prescription error:", error);
      toast.error("Something went wrong while approving prescription");
    } finally {
      setIsApproving(false);
    }
  };

  const selectedDetails = getSelectedDetails();

  if (loading) {
    return (
      <div className="ap-page">
        <div className="ap-loading"><span className="ap-spinner" /> Loading prescription...</div>
        <ToastContainer position="top-right" />
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="ap-page">
      <ToastContainer position="top-right" />
      <div className="ap-topbar">
        <button type="button" className="ap-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back to Prescription Requests
        </button>
        <span className="ap-status">Pending Review</span>
      </div>

      <div className="ap-heading">
        <div className="ap-heading-icon"><FaFilePrescription /></div>
        <div>
          <h1>Approve Prescription</h1>
          <p>Review requested medicines, add products if needed, and confirm quantities.</p>
        </div>
      </div>

      <div className="ap-patient-card">
        <div className="ap-patient-avatar">
          {(request.patient_name || "P").charAt(0).toUpperCase()}
        </div>
        <div className="ap-patient-info">
          <span>Patient</span>
          <strong>{request.patient_name || "N/A"}</strong>
          <small>Patient ID: {request.patient_id || "—"} · Request #{request.id}</small>
        </div>
        {request.file_url && (
          <a className="ap-prescription-link" href={request.file_url} target="_blank" rel="noreferrer">
            <FaFilePrescription /> View Prescription
          </a>
        )}
      </div>

      <div className="ap-layout">
        <main className="ap-main">
          <section className="ap-card">
            <div className="ap-section-heading">
              <div>
                <h2>Requested Medicines</h2>
                <p>Select the medicines to include in this approval.</p>
              </div>
              <span className="ap-count">{selectedIds.length} Selected</span>
            </div>

            <div className="ap-requested-list">
              {(request.requested_variants || []).map((item, index) => {
                const medicine = item?.variant || {};
                const variantId = getVariantId(medicine);
                if (!variantId) return null;

                const key = normalizeId(variantId);
                const match = findProductVariant(variantId);
                const variant = match?.variant || medicine;
                const stock = getStock(variant);
                const selected = selectedIds.some((value) => normalizeId(value) === key);

                return (
                  <div className={`ap-medicine-row ${selected ? "is-selected" : ""}`} key={key || index}>
                    <label className="ap-checkbox">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleVariant(variant)}
                      />
                      <span />
                    </label>
                    <div className="ap-medicine-info">
                      <strong>{getVariantName(variant)}</strong>
                      <small>
                        {variant.brand_name || match?.product?.brand_name || medicine.brand_name || "No Brand"}
                        <i /> ₹{Number(variant.selling_price ?? medicine.selling_price ?? 0).toFixed(2)}
                        <i /> Stock: {stock === null ? "Unavailable" : stock}
                      </small>
                    </div>
                    <div className="ap-qty-field">
                      <label>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        max={stock ?? undefined}
                        value={quantities[key] ?? ""}
                        disabled={!selected || stock === null || stock <= 0}
                        onChange={(event) => changeQuantity(variantId, event.target.value, stock)}
                      />
                    </div>
                  </div>
                );
              })}
              {!(request.requested_variants || []).length && (
                <div className="ap-empty">No medicines were included in the original request.</div>
              )}
            </div>
          </section>

          <section className="ap-card">
            <div className="ap-section-heading">
              <div>
                <h2>Add More Medicines</h2>
                <p>Search the product catalogue and add approved, in-stock variants.</p>
              </div>
              <span className="ap-soft-tag"><FaPlus /> Add product</span>
            </div>

            <div className="ap-search">
              <FaSearch />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by medicine, brand, SKU or variant..."
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                  <FaTimes />
                </button>
              )}
            </div>

            {search.trim() && (
              <div className="ap-search-results">
                {productsLoading ? (
                  <div className="ap-empty">Loading products...</div>
                ) : filteredProducts.length ? (
                  filteredProducts.map((product) => {
                    const expanded = !!expandedProducts[product.id];
                    return (
                      <div className="ap-product" key={product.id}>
                        <div className="ap-product-head">
                          <div className="ap-product-image">
                            {product.cover_image?.media_url ? (
                              <img src={product.cover_image.media_url} alt="" />
                            ) : <FaBoxOpen />}
                          </div>
                          <div className="ap-product-title">
                            <strong>{product.name || "Unnamed Product"}</strong>
                            <small>{product.brand_name || "No Brand"}</small>
                          </div>
                          <button
                            type="button"
                            className="ap-view-variants"
                            onClick={() =>
                              setExpandedProducts((prev) => ({
                                ...prev,
                                [product.id]: !prev[product.id],
                              }))
                            }
                          >
                            {expanded ? <FaMinus /> : <FaPlus />}
                            {expanded ? "Hide variants" : `View ${product.variants?.length || 0} variants`}
                          </button>
                        </div>

                        {expanded && (
                          <div className="ap-variants">
                            {(product.variants || []).map((variant) => {
                              const variantId = getVariantId(variant);
                              if (!variantId) return null;
                              const key = normalizeId(variantId);
                              const selected = selectedIds.some((value) => normalizeId(value) === key);
                              const stock = getStock(variant);
                              const canSelect =
                                variant.approval_status === "approved" &&
                                stock !== null &&
                                stock > 0;

                              return (
                                <div className={`ap-variant ${selected ? "is-selected" : ""}`} key={key}>
                                  <label className="ap-checkbox">
                                    <input
                                      type="checkbox"
                                      checked={selected}
                                      disabled={!canSelect && !selected}
                                      onChange={() => toggleVariant(variant)}
                                    />
                                    <span />
                                  </label>
                                  <div className="ap-variant-info">
                                    <strong>{getVariantName(variant)}</strong>
                                    <small>
                                      SKU: {variant.sku_code || variant.vendor_sku_code || "—"}
                                      <i /> Stock: {stock === null ? "Unavailable" : stock}
                                      <i /> ₹{Number(variant.selling_price ?? 0).toFixed(2)}
                                    </small>
                                    {!canSelect && (
                                      <em>
                                        {variant.approval_status !== "approved"
                                          ? `Variant ${variant.approval_status || "not approved"}`
                                          : "Out of stock"}
                                      </em>
                                    )}
                                  </div>
                                  {selected && (
                                    <div className="ap-qty-field ap-qty-small">
                                      <label>Qty</label>
                                      <input
                                        type="number"
                                        min="1"
                                        max={stock}
                                        value={quantities[key] ?? ""}
                                        onChange={(event) => changeQuantity(variantId, event.target.value, stock)}
                                      />
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
                  <div className="ap-empty">No matching medicines found.</div>
                )}
              </div>
            )}
          </section>

          <section className="ap-card ap-notes-card">
            <label htmlFor="ap-admin-notes">Admin Notes <span>(Optional)</span></label>
            <textarea
              id="ap-admin-notes"
              rows="3"
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Add an internal note for this approval..."
            />
          </section>
        </main>

        <aside className="ap-sidebar">
          <div className="ap-summary-card">
            <div className="ap-summary-top">
              <div>
                <span>Approval Summary</span>
                <h3>{selectedDetails.length} medicines</h3>
              </div>
              <div className="ap-summary-icon"><FaCheckCircle /></div>
            </div>

            {selectedDetails.length ? (
              <div className="ap-summary-list">
                {selectedDetails.map((medicine) => (
                  <div className="ap-summary-item" key={medicine.key}>
                    <div className="ap-summary-item-info">
                      <strong>{medicine.name}</strong>
                      <small>{medicine.brand}</small>
                      <small>
                        {quantities[medicine.key] || 0} × ₹{medicine.price.toFixed(2)}
                      </small>
                    </div>
                    <button
                      type="button"
                      title="Remove medicine"
                      onClick={() => toggleVariant({ id: medicine.id })}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ap-summary-empty">No medicines selected yet.</div>
            )}

            <div className="ap-summary-total">
              <span>Estimated total</span>
              <strong>
                ₹{selectedDetails.reduce(
                  (total, item) => total + item.price * Number(quantities[item.key] || 0),
                  0
                ).toFixed(2)}
              </strong>
            </div>

            <div className="ap-summary-actions">
              <button
                type="button"
                className="ap-cancel-btn"
                disabled={isApproving}
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ap-approve-btn"
                disabled={isApproving || selectedIds.length === 0}
                onClick={approvePrescription}
              >
                <FaCheckCircle />
                {isApproving ? "Approving..." : "Approve Prescription"}
              </button>
            </div>
            <p className="ap-secure-note">Please verify quantities before confirming approval.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default ApproveMedicine;
