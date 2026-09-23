import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaEdit, FaTimes } from "react-icons/fa";
import { FiTrash2, FiEye } from "react-icons/fi";
import { BiPlus } from "react-icons/bi";
import { MdCardMembership } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../../Base";
import {
  subscriptionConfig,
  emptyPackageForm,
  emptyBenefit,
  packageToForm,
  buildSubscriptionPayload,
  validateSubscriptionForm,
  COMMERCE_MODES,
  CTA_ACTIONS,
  FULFILLMENT_MODES,
  BENEFIT_UNITS,
} from "./subscriptionConfig";
import "./Subscription.css";

const authHeaders = (token) => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  "ngrok-skip-browser-warning": "true",
});

const TABLE_COLUMNS = [
  { key: "name", label: "Package" },
  { key: "code", label: "Code" },
  { key: "kind", label: "Kind" },
  { key: "commerce_mode", label: "Commerce" },
  { key: "list_price", label: "List price" },
  { key: "sale_price", label: "Sale price" },
  { key: "duration_days", label: "Days" },
  { key: "is_active", label: "Status", type: "status" },
];

const labelFor = (key) => {
  const labels = {
    commerce_mode: "Commerce",
    is_active: "Status",
    kind: "Kind",
    package_name: "Package",
  };

  if (labels[key]) return labels[key];

  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ") || "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const readList = (data) => {
  const payload = data?.data;
  if (Array.isArray(payload?.results)) {
    return {
      results: payload.results,
      count: Number(payload.count || 0),
    };
  }
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return { results: [payload], count: 1 };
  }
  return { results: [], count: 0 };
};

const isSuccess = (data, response) => {
  if (!response.ok) return false;
  if (data?.success === false) return false;
  if (data?.status && data.status !== "success") return false;
  return true;
};

const cellValue = (item, column) => {
  const value = item?.[column.key];

  if (column.type === "status") {
    if (value === null || value === undefined || value === "") return "-";
    const active = value === true || value === "active" || value === "true";
    return active ? "Active" : "Inactive";
  }

  if (column.key === "kind") {
    if (!value) return "-";
    if (typeof value === "string") return value;
    return value.name || value.code || "-";
  }

  if (column.key === "duration_days") {
    if (value === null || value === undefined || value === "") return "None";
    return String(value);
  }

  if (column.key === "commerce_mode" && typeof value === "string") {
    return value.replace(/_/g, " ");
  }

  return formatValue(value);
};

const Subscription = () => {
  const navigate = useNavigate();
  const { endpoints, pageSize } = subscriptionConfig;

  const [packages, setPackages] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [kindInput, setKindInput] = useState("");
  const [debouncedKind, setDebouncedKind] = useState("");
  const [commerceMode, setCommerceMode] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyPackageForm());
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const requireToken = () => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return null;
    }
    return token;
  };

  const loadPackages = useCallback(async () => {
    const token = requireToken();
    if (!token) return;

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("page_size", String(pageSize));

    if (debouncedSearch) params.set("search", debouncedSearch);
    if (debouncedKind) params.set("kind", debouncedKind);
    if (commerceMode) params.set("commerce_mode", commerceMode);

    if (activeFilter === "all") {
      params.set("include_inactive", "true");
    } else {
      params.set("is_active", activeFilter);
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}${endpoints.list}?${params.toString()}`, {
        method: "GET",
        headers: authHeaders(token),
        redirect: "follow",
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!isSuccess(data, response)) {
        toast.error(data?.message || "Failed to load subscription packages");
        setPackages([]);
        setTotalCount(0);
        return;
      }

      const list = readList(data);
      setPackages(list.results);
      setTotalCount(list.count);
    } catch (error) {
      console.error("Subscription list error:", error);
      toast.error("Failed to load subscription packages");
      setPackages([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, debouncedKind, commerceMode, activeFilter, endpoints.list, navigate]);

  const skipFilterReset = useRef(true);

  useEffect(() => {
    if (skipFilterReset.current) {
      skipFilterReset.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setDebouncedKind(kindInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, kindInput]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const rangeStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalCount);

  const fetchPackageById = async (id) => {
    const token = requireToken();
    if (!token || !id) return null;

    const params = new URLSearchParams({ id: String(id) });
    const response = await fetch(`${BASE_URL}${endpoints.list}?${params.toString()}`, {
      method: "GET",
      headers: authHeaders(token),
      redirect: "follow",
    });

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return null;
    }

    const data = await response.json();

    if (!isSuccess(data, response)) {
      toast.error(data?.message || "Failed to load package");
      return null;
    }

    const list = readList(data);
    return list.results[0] || null;
  };

  const openPackage = async (id) => {
    setViewLoading(true);
    setViewItem(null);

    try {
      const item = await fetchPackageById(id);
      if (item) setViewItem(item);
    } catch (error) {
      console.error("Subscription detail error:", error);
      toast.error("Failed to load package");
    } finally {
      setViewLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyPackageForm());
    setErrors({});
    setShowForm(true);
  };

  const openEdit = async (item) => {
    const id = item?.[subscriptionConfig.idKey] ?? null;
    setEditingId(id);
    setErrors({});
    setForm(packageToForm(item));
    setShowForm(true);

    if (!id) return;

    setFormLoading(true);

    try {
      const fullPackage = await fetchPackageById(id);
      if (fullPackage) setForm(packageToForm(fullPackage));
    } catch (error) {
      console.error("Subscription edit load error:", error);
      toast.error("Failed to load package for editing");
    } finally {
      setFormLoading(false);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyPackageForm());
    setErrors({});
    setFormLoading(false);
  };

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const updateKind = (key, value) => {
    setForm((current) => ({
      ...current,
      kind: { ...current.kind, [key]: value },
    }));
    setErrors((current) => ({ ...current, kindCode: "" }));
  };

  const updateInclude = (index, value) => {
    setForm((current) => ({
      ...current,
      includes: current.includes.map((item, itemIndex) => (itemIndex === index ? value : item)),
    }));
  };

  const updateBenefit = (index, patch) => {
    setForm((current) => ({
      ...current,
      benefits: current.benefits.map((benefit, benefitIndex) =>
        benefitIndex === index ? { ...benefit, ...patch } : benefit
      ),
    }));
  };

  const updateBenefitType = (index, key, value) => {
    setForm((current) => ({
      ...current,
      benefits: current.benefits.map((benefit, benefitIndex) => {
        if (benefitIndex !== index) return benefit;

        return {
          ...benefit,
          quantity: key === "unit" && value === "none" ? "" : benefit.quantity,
          benefit_type: { ...benefit.benefit_type, [key]: value },
        };
      }),
    }));
    setErrors((current) => ({
      ...current,
      [`benefit_${index}_code`]: "",
      [`benefit_${index}_quantity`]: "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateSubscriptionForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const token = requireToken();
    if (!token) return;

    const payload = buildSubscriptionPayload(form);
    const url = editingId
      ? `${BASE_URL}${endpoints.update}?id=${encodeURIComponent(editingId)}`
      : `${BASE_URL}${endpoints.create}`;

    setSaving(true);

    try {
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: authHeaders(token),
        redirect: "follow",
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const raw = await response.text();
      const data = raw ? JSON.parse(raw) : {};

      if (!isSuccess(data, response)) {
        toast.error(data?.message || data?.error?.message || data?.detail || "Failed to save subscription package");
        return;
      }

      toast.success(data?.message || (editingId ? "Package updated" : "Package created"));
      closeForm();
      loadPackages();
    } catch (error) {
      console.error("Subscription save error:", error);
      toast.error("Failed to save subscription package");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const token = requireToken();
    if (!token) return;

    const id = deleteTarget[subscriptionConfig.idKey];
    const url = `${BASE_URL}${endpoints.remove}?id=${encodeURIComponent(id)}`;

    setDeleting(true);

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: authHeaders(token),
        redirect: "follow",
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast.error(data?.message || "Failed to delete subscription package");
        return;
      }

      toast.success("Package deleted");
      setDeleteTarget(null);
      loadPackages();
    } catch (error) {
      console.error("Subscription delete error:", error);
      toast.error("Failed to delete subscription package");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <ToastContainer position="top-center" autoClose={1500} />

      <div className="page-header subscription-header">
        <div>
          <h1>Manage Subscription Packages</h1>
          <p>Create and update every subscription package from one place.</p>
        </div>
        <button type="button" className="add-btn subscription-add" onClick={openCreate}>
          <BiPlus size={18} />
          Add Package
        </button>
      </div>

      <div className="subscription-stats">
        <div className="subscription-stat">
          <span>Total Packages</span>
          <strong>{totalCount}</strong>
        </div>
        <div className="subscription-stat">
          <span>Showing</span>
          <strong>
            {rangeStart}-{rangeEnd}
          </strong>
        </div>
        <div className="subscription-stat">
          <span>Page</span>
          <strong>
            {page} / {totalPages}
          </strong>
        </div>
      </div>

      <div className="subscription-toolbar">
        <div className="subscription-search">
          <FaSearch />
          <input
            type="text"
            placeholder="Search packages"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <input
          className="subscription-filter"
          type="text"
          placeholder="Kind code"
          value={kindInput}
          onChange={(event) => setKindInput(event.target.value)}
        />
        <select
          className="subscription-filter"
          value={commerceMode}
          onChange={(event) => {
            setCommerceMode(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All commerce</option>
          <option value="open_plan">Open plan</option>
          <option value="prepaid_package">Prepaid package</option>
        </select>
        <select
          className="subscription-filter"
          value={activeFilter}
          onChange={(event) => {
            setActiveFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="all">Active and inactive</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="subscription-table-wrap">
        <table className="subscription-table">
          <thead>
            <tr>
              {TABLE_COLUMNS.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={TABLE_COLUMNS.length + 1} className="subscription-empty">
                  Loading packages...
                </td>
              </tr>
            ) : packages.length === 0 ? (
              <tr>
                <td colSpan={TABLE_COLUMNS.length + 1} className="subscription-empty">
                  <MdCardMembership size={28} />
                  <p>No subscription packages found.</p>
                </td>
              </tr>
            ) : (
              packages.map((item, index) => (
                <tr key={item?.[subscriptionConfig.idKey] ?? index}>
                  {TABLE_COLUMNS.map((column) => {
                    const value = cellValue(item, column);
                    return (
                      <td key={column.key}>
                        {column.type === "status" && value !== "-" ? (
                          <span className={`subscription-status ${value === "Active" ? "active" : "inactive"}`}>
                            {value}
                          </span>
                        ) : (
                          value
                        )}
                      </td>
                    );
                  })}
                  <td>
                    <div className="subscription-actions">
                      <button
                        type="button"
                        onClick={() => openPackage(item?.[subscriptionConfig.idKey])}
                        aria-label="View package"
                      >
                        <FiEye />
                      </button>
                      <button type="button" onClick={() => openEdit(item)} aria-label="Edit package">
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => setDeleteTarget(item)}
                        aria-label="Delete package"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="subscription-pager">
        <span>
          Showing {rangeStart}-{rangeEnd} of {totalCount}
        </span>
        <div>
          <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>
            Previous
          </button>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {showForm && (
        <div className="prakriti-modal-overlay">
          <div className="prakriti-modal subscription-editor">
            <div className="prakriti-modal-header">
              <div>
                <h2>{editingId ? "Edit Package" : "Add Package"}</h2>
                <p>Saving replaces the full package, including the benefit list.</p>
              </div>
              <button type="button" className="subscription-close" onClick={closeForm}>
                <FaTimes />
              </button>
            </div>

            <form className="prakriti-form" onSubmit={handleSubmit}>
              {formLoading ? (
                <p className="subscription-empty">Loading package...</p>
              ) : (
                <>
                  <div className="subscription-grid">
                    <div className="form-group">
                      <label>
                        Code <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ayurmuni_doctor_consult"
                        value={form.code}
                        onChange={(event) => handleChange("code", event.target.value)}
                      />
                      {errors.code ? <p className="errortext">{errors.code}</p> : null}
                    </div>
                    <div className="form-group">
                      <label>
                        Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="AyurMuni Doctor Consult"
                        value={form.name}
                        onChange={(event) => handleChange("name", event.target.value)}
                      />
                      {errors.name ? <p className="errortext">{errors.name}</p> : null}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(event) => handleChange("description", event.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Includes</label>
                    {form.includes.map((item, index) => (
                      <div className="subscription-inline" key={`include-${index}`}>
                        <input
                          type="text"
                          placeholder="1 Doctor Consultation"
                          value={item}
                          onChange={(event) => updateInclude(index, event.target.value)}
                        />
                        <button
                          type="button"
                          className="subscription-icon-btn"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              includes:
                                current.includes.length === 1
                                  ? [""]
                                  : current.includes.filter((_, itemIndex) => itemIndex !== index),
                            }))
                          }
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="subscription-link"
                      onClick={() => setForm((current) => ({ ...current, includes: [...current.includes, ""] }))}
                    >
                      <BiPlus /> Add include
                    </button>
                  </div>

                  <div className="subscription-section">
                    <h3>Kind</h3>
                    <div className="subscription-grid">
                      <div className="form-group">
                        <label>
                          Kind code <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="ayurmuni_consult"
                          value={form.kind.code}
                          onChange={(event) => updateKind("code", event.target.value)}
                        />
                        {errors.kindCode ? <p className="errortext">{errors.kindCode}</p> : null}
                      </div>
                      <div className="form-group">
                        <label>Kind name</label>
                        <input
                          type="text"
                          placeholder="AyurMuni Consult"
                          value={form.kind.name}
                          onChange={(event) => updateKind("name", event.target.value)}
                        />
                      </div>
                      <div className="form-group subscription-span">
                        <label>Kind description</label>
                        <input
                          type="text"
                          value={form.kind.description}
                          onChange={(event) => updateKind("description", event.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Kind display order</label>
                        <input
                          type="number"
                          value={form.kind.display_order}
                          onChange={(event) => updateKind("display_order", event.target.value)}
                        />
                      </div>
                      <label className="subscription-check">
                        <input
                          type="checkbox"
                          checked={Boolean(form.kind.is_active)}
                          onChange={(event) => updateKind("is_active", event.target.checked)}
                        />
                        Kind is active
                      </label>
                    </div>
                    <p className="subscription-hint">Leave the kind name empty to reuse an existing kind code.</p>
                  </div>

                  <div className="subscription-grid">
                    <div className="form-group">
                      <label>Commerce mode</label>
                      <select
                        value={form.commerce_mode}
                        onChange={(event) => {
                          const value = event.target.value;
                          handleChange("commerce_mode", value);
                          handleChange(
                            "cta_action",
                            value === "open_plan" ? "book_consultation" : "purchase_package"
                          );
                        }}
                      >
                        {COMMERCE_MODES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>CTA action</label>
                      <select value={form.cta_action} onChange={(event) => handleChange("cta_action", event.target.value)}>
                        {CTA_ACTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>
                        List price <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="999.00"
                        value={form.list_price}
                        onChange={(event) => handleChange("list_price", event.target.value)}
                      />
                      {errors.list_price ? <p className="errortext">{errors.list_price}</p> : null}
                    </div>
                    <div className="form-group">
                      <label>
                        Sale price <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="999.00"
                        value={form.sale_price}
                        onChange={(event) => handleChange("sale_price", event.target.value)}
                      />
                      {errors.sale_price ? <p className="errortext">{errors.sale_price}</p> : null}
                    </div>
                    <div className="form-group">
                      <label>Duration days</label>
                      <input
                        type="number"
                        placeholder="Blank for no membership window"
                        value={form.duration_days}
                        onChange={(event) => handleChange("duration_days", event.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Display order</label>
                      <input
                        type="number"
                        value={form.display_order}
                        onChange={(event) => handleChange("display_order", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="text"
                      value={form.image_url}
                      onChange={(event) => handleChange("image_url", event.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      placeholder="consult, open_plan, all_users"
                      value={form.tagsText}
                      onChange={(event) => handleChange("tagsText", event.target.value)}
                    />
                  </div>
                  <label className="subscription-check">
                    <input
                      type="checkbox"
                      checked={Boolean(form.is_active)}
                      onChange={(event) => handleChange("is_active", event.target.checked)}
                    />
                    Package is active
                  </label>

                  <div className="subscription-section">
                    <div className="subscription-section-head">
                      <h3>Benefits</h3>
                      <button
                        type="button"
                        className="subscription-link"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            benefits: [
                              ...current.benefits,
                              { ...emptyBenefit(), display_order: current.benefits.length },
                            ],
                          }))
                        }
                      >
                        <BiPlus /> Add benefit
                      </button>
                    </div>
                    <p className="subscription-hint">
                      One row per benefit code. Quantity is how many times it can be used. Put window length or delays in metadata.
                    </p>
                    {form.benefits.map((benefit, index) => (
                      <div className="subscription-benefit" key={`benefit-${index}`}>
                        <div className="subscription-section-head">
                          <strong>Benefit {index + 1}</strong>
                          <button
                            type="button"
                            className="subscription-icon-btn"
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                benefits:
                                  current.benefits.length === 1
                                    ? [emptyBenefit()]
                                    : current.benefits.filter((_, benefitIndex) => benefitIndex !== index),
                              }))
                            }
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                        <div className="subscription-grid">
                          <div className="form-group">
                            <label>Benefit code</label>
                            <input
                              type="text"
                              placeholder="doctor_consultation"
                              value={benefit.benefit_type.code}
                              onChange={(event) => updateBenefitType(index, "code", event.target.value)}
                            />
                            {errors[`benefit_${index}_code`] ? (
                              <p className="errortext">{errors[`benefit_${index}_code`]}</p>
                            ) : null}
                          </div>
                          <div className="form-group">
                            <label>Benefit name</label>
                            <input
                              type="text"
                              placeholder="Doctor consultation"
                              value={benefit.benefit_type.name}
                              onChange={(event) => updateBenefitType(index, "name", event.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label>Fulfillment</label>
                            <select
                              value={benefit.benefit_type.fulfillment_mode}
                              onChange={(event) => updateBenefitType(index, "fulfillment_mode", event.target.value)}
                            >
                              {FULFILLMENT_MODES.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Unit</label>
                            <select
                              value={benefit.benefit_type.unit}
                              onChange={(event) => updateBenefitType(index, "unit", event.target.value)}
                            >
                              {BENEFIT_UNITS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Quantity</label>
                            <input
                              type="text"
                              placeholder={benefit.benefit_type.unit === "none" ? "Not used for flags" : "1.00"}
                              value={benefit.quantity}
                              disabled={benefit.benefit_type.unit === "none"}
                              onChange={(event) => updateBenefit(index, { quantity: event.target.value })}
                            />
                            {errors[`benefit_${index}_quantity`] ? (
                              <p className="errortext">{errors[`benefit_${index}_quantity`]}</p>
                            ) : null}
                          </div>
                          <div className="form-group">
                            <label>Display order</label>
                            <input
                              type="number"
                              value={benefit.display_order}
                              onChange={(event) => updateBenefit(index, { display_order: event.target.value })}
                            />
                          </div>
                          <div className="form-group subscription-span">
                            <label>Metadata</label>
                            <textarea
                              rows={3}
                              placeholder='{"days": 3, "activations": 1}'
                              value={benefit.metadataText}
                              onChange={(event) => {
                                updateBenefit(index, { metadataText: event.target.value });
                                setErrors((current) => ({ ...current, [`benefit_${index}_metadata`]: "" }));
                              }}
                            />
                            {errors[`benefit_${index}_metadata`] ? (
                              <p className="errortext">{errors[`benefit_${index}_metadata`]}</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="subscription-form-actions">
                <button type="button" className="subscription-cancel" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="add-btn" disabled={saving || formLoading}>
                  {saving ? "Saving..." : editingId ? "Update Package" : "Save Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(viewLoading || viewItem) && (
        <div className="prakriti-modal-overlay">
          <div className="prakriti-modal">
            <div className="prakriti-modal-header">
              <div>
                <h2>Package Details</h2>
                <p>{viewItem?.name || viewItem?.title || viewItem?.id || "Subscription package"}</p>
              </div>
              <button
                type="button"
                className="subscription-close"
                onClick={() => {
                  setViewItem(null);
                  setViewLoading(false);
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div className="prakriti-form">
              {viewLoading ? (
                <p className="subscription-empty">Loading package...</p>
              ) : (
                Object.entries(viewItem || {}).map(([key, value]) => (
                  <div className="subscription-detail-row" key={key}>
                    <span>{labelFor(key)}</span>
                    <strong>{formatValue(value)}</strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="prakriti-modal-overlay">
          <div className="prakriti-modal subscription-delete-modal">
            <div className="prakriti-modal-header">
              <div>
                <h2>Delete Package</h2>
                <p>
                  Delete {deleteTarget.name || "this package"}? This cannot be undone.
                </p>
              </div>
            </div>
            <div className="subscription-form-actions">
              <button type="button" className="subscription-cancel" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button type="button" className="add-btn subscription-delete" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Subscription;
