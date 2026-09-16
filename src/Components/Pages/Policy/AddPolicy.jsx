import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave, FaPlus, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
// import { BASE_URL } from "../../../Base";

const CreatePolicy = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    policy_type: "",
    title: "",
    subtitle: "",
    is_mandatory: false,
    target_roles: [],
    document_url: "",
    content: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const policyTypes = [
    {
      value: "privacy_policy",
      label: "Privacy Policy",
    },
    {
      value: "terms_and_conditions",
      label: "Terms and Conditions",
    },
    {
      value: "cancellation",
      label: "Cancellation Policy",
    },
    {
      value: "refund",
      label: "Refund Policy",
    },
    {
      value: "return",
      label: "Return Policy",
    },
    {
      value: "shipping_delivery",
      label: "Shipping & Delivery Policy",
    },
    {
      value: "grievance_redressal",
      label: "Grievance Redressal Policy",
    },
    {
      value: "medical_disclaimer",
      label: "Medical Disclaimer & Telemedicine",
    },
    {
      value: "account_deletion",
      label: "Account Deletion & Data Erasure",
    },
  ];

  const roles = [
    {
      value: "customer",
      label: "Customer",
    },
    {
      value: "doctor",
      label: "Doctor",
    },
    {
      value: "vendor",
      label: "Vendor",
    },
    {
      value: "admin",
      label: "Admin",
    },
    {
      value: "system",
      label: "System",
    },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleToggle = (role) => {
    setFormData((prev) => {
      const exists = prev.target_roles.includes(role);

      return {
        ...prev,
        target_roles: exists
          ? prev.target_roles.filter((item) => item !== role)
          : [...prev.target_roles, role],
      };
    });
  };

  const removeRole = (role) => {
    setFormData((prev) => ({
      ...prev,
      target_roles: prev.target_roles.filter((item) => item !== role),
    }));
  };

  const validateForm = () => {
    if (!formData.policy_type) {
      toast.error("Please select policy type");
      return false;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter policy title");
      return false;
    }

    if (!formData.subtitle.trim()) {
      toast.error("Please enter policy subtitle");
      return false;
    }

    if (formData.target_roles.length === 0) {
      toast.error("Please select at least one target role");
      return false;
    }

    if (!formData.content.trim()) {
      toast.error("Please enter policy content");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        policy_type: formData.policy_type,
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        is_mandatory: formData.is_mandatory,
        target_roles: formData.target_roles,
        content: formData.content.trim(),
      };

      if (formData.document_url.trim()) {
        payload.document_urls = [formData.document_url.trim()];
      }

      const response = await fetch(
        // `${BASE_URL}/policy/admin/policies/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create policy");
      }

      toast.success("Policy created successfully");

      navigate("/LegalPolicies");
    } catch (error) {
      console.error("Create policy error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="policy-create-page">
      {/* Header */}
      <div className="policy-create-header">
        <div className="policy-header-left">
          <button
            type="button"
            className="policy-back-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>

          <div>
            <h2>Create Policy</h2>
            <p>
              Create and publish a legal policy for your platform users.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Policy Information */}
        <div className="policy-card">
          <div className="policy-card-header">
            <div>
              <h3>Policy Information</h3>
              <p>Define the basic information and visibility of this policy.</p>
            </div>
          </div>

          <div className="policy-form-grid">
            {/* Policy Type */}
            <div className="policy-field">
              <label>
                Policy Type <span>*</span>
              </label>

              <select
                name="policy_type"
                value={formData.policy_type}
                onChange={handleChange}
              >
                <option value="">Select policy type</option>

                {policyTypes.map((policy) => (
                  <option key={policy.value} value={policy.value}>
                    {policy.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="policy-field">
              <label>
                Policy Title <span>*</span>
              </label>

              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Privacy Policy"
              />
            </div>

            {/* Subtitle */}
            <div className="policy-field policy-full-width">
              <label>
                Subtitle <span>*</span>
              </label>

              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="Brief description of this policy"
              />

              <small>
                A short description displayed below the policy title.
              </small>
            </div>
          </div>

          {/* Mandatory */}
          <div className="policy-setting-row">
            <div>
              <h4>Mandatory Policy</h4>
              <p>
                Users must acknowledge this policy when applicable.
              </p>
            </div>

            <label className="policy-switch">
              <input
                type="checkbox"
                checked={formData.is_mandatory}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_mandatory: e.target.checked,
                  }))
                }
              />

              <span className="policy-slider"></span>
            </label>
          </div>

          {/* Target Roles */}
          <div className="policy-role-section">
            <label>
              Target Roles <span>*</span>
            </label>

            <p className="policy-field-description">
              Select the users or system roles this policy applies to.
            </p>

            <div className="policy-role-options">
              {roles.map((role) => {
                const selected = formData.target_roles.includes(role.value);

                return (
                  <button
                    type="button"
                    key={role.value}
                    className={`policy-role-option ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => handleRoleToggle(role.value)}
                  >
                    {selected && <span>✓</span>}
                    {role.label}
                  </button>
                );
              })}
            </div>

            {formData.target_roles.length > 0 && (
              <div className="policy-selected-roles">
                {formData.target_roles.map((role) => {
                  const roleData = roles.find(
                    (item) => item.value === role
                  );

                  return (
                    <div className="policy-role-chip" key={role}>
                      {roleData?.label}

                      <button
                        type="button"
                        onClick={() => removeRole(role)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Document */}
        <div className="policy-card">
          <div className="policy-card-header">
            <div>
              <h3>Policy Document</h3>
              <p>
                Add an existing document URL if your policy has an uploaded
                document.
              </p>
            </div>
          </div>

          <div className="policy-field">
            <label>Document URL</label>

            <div className="policy-url-input">
              <input
                type="url"
                name="document_url"
                value={formData.document_url}
                onChange={handleChange}
                placeholder="https://example.com/policy/document.docx"
              />

              <span>Optional</span>
            </div>

            <small>
              You can leave this empty if the policy content is managed
              directly below.
            </small>
          </div>
        </div>

        {/* Content */}
        <div className="policy-card">
          <div className="policy-card-header">
            <div>
              <h3>Policy Content</h3>
              <p>
                Enter the complete legal content of the policy.
              </p>
            </div>

            <span className="policy-required-badge">
              Required
            </span>
          </div>

          <div className="policy-content-editor">
            <div className="policy-editor-toolbar">
              <button type="button">
                <strong>B</strong>
              </button>

              <button type="button">
                <em>I</em>
              </button>

              <button type="button">
                <u>U</u>
              </button>

              <div className="policy-toolbar-divider"></div>

              <span>Plain text editor</span>
            </div>

            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder={`Enter the complete policy content here...

Example:

1. Introduction
2. Definitions
3. User Responsibilities
4. Privacy
5. Cancellation
6. Refunds
7. Contact Information`}
            />

            <div className="policy-editor-footer">
              <span>
                {formData.content.length} characters
              </span>

              <span>
                Make sure the content is reviewed before publishing.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="policy-form-actions">
          <button
            type="button"
            className="policy-cancel-btn"
            onClick={() => navigate(-1)}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="policy-save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="policy-spinner"></span>
                Creating...
              </>
            ) : (
              <>
                <FaSave />
                Create Policy
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePolicy;