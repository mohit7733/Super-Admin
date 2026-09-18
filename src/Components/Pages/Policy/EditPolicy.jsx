import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
} from "react-icons/fa";

import { toast } from "react-toastify";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

import BASE_URL from "../../../Base";
import "./AddPolicy.css";


const cloneObject = (value) => {
  if (value === undefined || value === null) return value;

  if (typeof structuredClone === "function") {
    try {
      return structuredClone(value);
    } catch (error) {}
  }

  return JSON.parse(JSON.stringify(value));
};

const isPlainObject = (value) => {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
};

const formatLabel = (key) => {
  if (!key) return "";

  return key
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};



const convertPolicyContentToHtml = (content = []) => {
  if (!Array.isArray(content)) return "";

  return content
    .map((item) => {
      if (!item) return "";

      const text = escapeHtml(item.text || "");

      if (item.type === "title") {
        return `<h2 data-content-type="title">${text}</h2>`;
      }

      if (item.type === "text") {
        return `<p data-content-type="text">${text}</p>`;
      }

      if (item.type === "heading") {
        return `<h2>${text}</h2>`;
      }

      if (item.type === "paragraph") {
        return `<p>${text}</p>`;
      }

      if (
        item.type === "list" &&
        Array.isArray(item.items)
      ) {
        return `
          <ul>
            ${item.items
              .map(
                (listItem) =>
                  `<li>${escapeHtml(
                    listItem?.text || ""
                  )}</li>`
              )
              .join("")}
          </ul>
        `;
      }

      return "";
    })
    .join("");
};


const convertHtmlToPolicyContent = (html) => {
  if (!html) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(
    html,
    "text/html"
  );

  const content = [];

  Array.from(doc.body.children).forEach(
    (element) => {
      const tagName =
        element.tagName.toLowerCase();

      /* HEADING */

      if (
        tagName === "h1" ||
        tagName === "h2" ||
        tagName === "h3"
      ) {
        const contentType =
          element.getAttribute(
            "data-content-type"
          );

        content.push({
          text:
            element.textContent?.trim() || "",
          type:
            contentType === "title"
              ? "title"
              : "heading",
        });

        return;
      }

      /* PARAGRAPH */

      if (tagName === "p") {
        const contentType =
          element.getAttribute(
            "data-content-type"
          );

        content.push({
          text:
            element.textContent?.trim() || "",
          type:
            contentType === "text"
              ? "text"
              : "paragraph",
        });

        return;
      }

      /* LIST */

      if (
        tagName === "ul" ||
        tagName === "ol"
      ) {
        const items = Array.from(
          element.children
        )
          .filter(
            (child) =>
              child.tagName.toLowerCase() ===
              "li"
          )
          .map((li, index) => ({
            text:
              li.textContent?.trim() || "",
            marker:
              tagName === "ol"
                ? `(${String.fromCharCode(
                    97 + index
                  )})`
                : "•",
          }));

        if (items.length > 0) {
          content.push({
            type: "list",
            items,
          });
        }
      }
    }
  );

  return content;
};



const setNestedValue = (
  object,
  path,
  value
) => {
  const keys = path.split(".");
  const result = cloneObject(object);

  let current = result;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      if (
        !current[key] ||
        typeof current[key] !== "object" ||
        Array.isArray(current[key])
      ) {
        current[key] = {};
      }

      current = current[key];
    }
  });

  return result;
};

const deleteNestedValue = (
  object,
  path
) => {
  const keys = path.split(".");
  const result = cloneObject(object);

  let current = result;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      delete current[key];
    } else {
      if (!current[key]) return;

      current = current[key];
    }
  });

  return result;
};


const createFieldKey = (value = "") => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

const AddFieldButton = ({
  parentPath,
  onAddField,
}) => {
  const [showForm, setShowForm] = useState(false);

  const [fieldData, setFieldData] = useState({
    name: "",
    type: "string",
    value: "",
  });

  const reset = () => {
    setFieldData({
      name: "",
      type: "string",
      value: "",
    });

    setShowForm(false);
  };

//   const handleAdd = () => {
//     const fieldKey = createFieldKey(fieldData.name);

//     if (!fieldKey) {
//       toast.error("Please enter field name");
//       return;
//     }

//     let value;

//     if (fieldData.type === "boolean") {
//       value = Boolean(fieldData.value);
//     } else if (fieldData.type === "number") {
//       value = fieldData.value === "" ? "" : Number(fieldData.value);
//     } else if (fieldData.type === "array") {
//       value = String(fieldData.value || "")
//         .split(",")
//         .map((item) => item.trim())
//         .filter(Boolean);
//     } else {
//       value = fieldData.value;
//     }

//     if (typeof onAddField !== "function") {
//       toast.error("Unable to add configuration field");
//       return;
//     }

//     onAddField(parentPath || "", fieldKey, value);
//     reset();
//   };

//   return (
//     <div className="dynamic-add-field-wrapper">
//       {!showForm ? (
//         <button
//           type="button"
//           className="dynamic-add-field-btn"
//           onClick={() => setShowForm(true)}
//         >
//           <FaPlus />
//           Add Field
//         </button>
//       ) : (
//         <div className="dynamic-add-field-form">
//           <div className="dynamic-add-field-header">
//             <div>
//               <strong>Add Configuration Field</strong>
//               <span>Add a new setting inside this section.</span>
//             </div>

//             <button
//               type="button"
//               onClick={reset}
//               className="dynamic-close-btn"
//               aria-label="Close"
//             >
//               <FaTimes />
//             </button>
//           </div>

//           <div className="dynamic-add-field-grid">
//             <div>
//               <label>Field Name</label>
//               <input
//                 type="text"
//                 value={fieldData.name}
//                 onChange={(e) =>
//                   setFieldData((prev) => ({
//                     ...prev,
//                     name: e.target.value,
//                   }))
//                 }
//                 placeholder="e.g. Follow Up Fee"
//               />
//             </div>

//             <div>
//               <label>Field Type</label>
//               <select
//                 value={fieldData.type}
//                 onChange={(e) =>
//                   setFieldData((prev) => ({
//                     ...prev,
//                     type: e.target.value,
//                     value: "",
//                   }))
//                 }
//               >
//                 <option value="string">Text</option>
//                 <option value="number">Number</option>
//                 <option value="boolean">Toggle</option>
//                 <option value="array">Multiple Values</option>
//               </select>
//             </div>
//           </div>

//           {fieldData.type === "string" && (
//             <div>
//               <label>Value</label>
//               <input
//                 type="text"
//                 value={fieldData.value}
//                 onChange={(e) =>
//                   setFieldData((prev) => ({
//                     ...prev,
//                     value: e.target.value,
//                   }))
//                 }
//                 placeholder="Enter value"
//               />
//             </div>
//           )}

//           {fieldData.type === "number" && (
//             <div>
//               <label>Value</label>
//               <input
//                 type="number"
//                 value={fieldData.value}
//                 onChange={(e) =>
//                   setFieldData((prev) => ({
//                     ...prev,
//                     value: e.target.value,
//                   }))
//                 }
//                 placeholder="Enter number"
//               />
//             </div>
//           )}

//           {fieldData.type === "boolean" && (
//             <div className="dynamic-add-toggle">
//               <label>Default Value</label>

//               <label className="dynamic-switch">
//                 <input
//                   type="checkbox"
//                   checked={Boolean(fieldData.value)}
//                   onChange={(e) =>
//                     setFieldData((prev) => ({
//                       ...prev,
//                       value: e.target.checked,
//                     }))
//                   }
//                 />
//                 <span className="dynamic-slider"></span>
//               </label>
//             </div>
//           )}

//           {fieldData.type === "array" && (
//             <div>
//               <label>Values</label>
//               <input
//                 type="text"
//                 value={fieldData.value}
//                 onChange={(e) =>
//                   setFieldData((prev) => ({
//                     ...prev,
//                     value: e.target.value,
//                   }))
//                 }
//                 placeholder="e.g. Audio, Video, Chat"
//               />
//             </div>
//           )}

//           <div className="dynamic-add-field-actions">
//             <button
//               type="button"
//               className="dynamic-secondary-btn"
//               onClick={reset}
//             >
//               Cancel
//             </button>

//             <button
//               type="button"
//               className="dynamic-primary-btn"
//               onClick={handleAdd}
//             >
//               <FaPlus />
//               Add Field
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
};

const DynamicConfiguration = ({
  value,
  path = "",
  onChange,
  onAddField,
  onDelete,
  depth = 0,
}) => {
  if (!isPlainObject(value)) {
    return null;
  }

  const entries = Object.entries(value);

  return (
    <div
      className={`dynamic-config-level ${depth > 0 ? "nested-level" : ""}`}
    >
      {entries.map(([key, fieldValue]) => {
        const currentPath = path ? `${path}.${key}` : key;

        /* ---------------------------------------------
           OBJECT / SECTION
        --------------------------------------------- */
        if (isPlainObject(fieldValue)) {
          return (
            <div
              className="dynamic-config-section"
              key={currentPath}
            >
              <div className="dynamic-config-section-header">
                <div>
                  <h4>{formatLabel(key)}</h4>
                  {depth === 0 && (
                    <span>Configuration section</span>
                  )}
                </div>

                {onDelete && (
                  <button
                    type="button"
                    className="dynamic-delete-btn"
                    onClick={() => onDelete(currentPath)}
                    title="Delete section"
                    aria-label={`Delete ${formatLabel(key)}`}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <div className="dynamic-config-section-body">
                {Object.keys(fieldValue).length === 0 ? (
                  <div className="dynamic-config-empty-inner">
                    No configuration fields available.
                  </div>
                ) : (
                  <DynamicConfiguration
                    value={fieldValue}
                    path={currentPath}
                    onChange={onChange}
                    onAddField={onAddField}
                    onDelete={onDelete}
                    depth={depth + 1}
                  />
                )}

                <AddFieldButton
                  parentPath={currentPath}
                  onAddField={onAddField}
                />
              </div>
            </div>
          );
        }

        /* ---------------------------------------------
           BOOLEAN
        --------------------------------------------- */
        if (typeof fieldValue === "boolean") {
          return (
            <div
              className="dynamic-config-field-row"
              key={currentPath}
            >
              <div className="dynamic-field-info">
                <label>{formatLabel(key)}</label>
                <span>Boolean setting</span>
              </div>

              <div className="dynamic-field-actions">
                <label className="dynamic-switch">
                  <input
                    type="checkbox"
                    checked={fieldValue}
                    onChange={(e) =>
                      onChange(currentPath, e.target.checked)
                    }
                  />
                  <span className="dynamic-slider"></span>
                </label>

                {onDelete && (
                  <button
                    type="button"
                    className="dynamic-inline-delete"
                    onClick={() => onDelete(currentPath)}
                    title="Delete field"
                    aria-label={`Delete ${formatLabel(key)}`}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          );
        }

        /* ---------------------------------------------
           NUMBER
        --------------------------------------------- */
        if (typeof fieldValue === "number") {
          return (
            <div
              className="dynamic-config-field"
              key={currentPath}
            >
              <div className="dynamic-field-label-row">
                <label>{formatLabel(key)}</label>

                {onDelete && (
                  <button
                    type="button"
                    className="dynamic-inline-delete"
                    onClick={() => onDelete(currentPath)}
                    title="Delete field"
                    aria-label={`Delete ${formatLabel(key)}`}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <input
                type="number"
                value={fieldValue}
                placeholder={`Enter ${formatLabel(key).toLowerCase()}`}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  onChange(
                    currentPath,
                    inputValue === "" ? 0 : Number(inputValue)
                  );
                }}
              />
            </div>
          );
        }

        /* ---------------------------------------------
           ARRAY
        --------------------------------------------- */
        if (Array.isArray(fieldValue)) {
          return (
            <div
              className="dynamic-config-field"
              key={currentPath}
            >
              <div className="dynamic-field-label-row">
                <div>
                  <label>{formatLabel(key)}</label>
                  <small>Enter values separated by commas</small>
                </div>

                {onDelete && (
                  <button
                    type="button"
                    className="dynamic-inline-delete"
                    onClick={() => onDelete(currentPath)}
                    title="Delete field"
                    aria-label={`Delete ${formatLabel(key)}`}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <input
                type="text"
                value={fieldValue.join(", ")}
                placeholder={`Enter ${formatLabel(key).toLowerCase()}`}
                onChange={(e) => {
                  const values = e.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);

                  onChange(currentPath, values);
                }}
              />

              {fieldValue.length > 0 && (
                <div className="dynamic-tags">
                  {fieldValue.map((item, index) => (
                    <span key={`${item}-${index}`}>
                      {formatLabel(String(item))}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        }

        /* ---------------------------------------------
           STRING / NULL / DEFAULT
        --------------------------------------------- */
        return (
          <div
            className="dynamic-config-field"
            key={currentPath}
          >
            <div className="dynamic-field-label-row">
              <label>{formatLabel(key)}</label>

              {onDelete && (
                <button
                  type="button"
                  className="dynamic-inline-delete"
                  onClick={() => onDelete(currentPath)}
                  title="Delete field"
                  aria-label={`Delete ${formatLabel(key)}`}
                >
                  <FaTrash />
                </button>
              )}
            </div>

            <input
              type="text"
              value={fieldValue ?? ""}
              placeholder={`Enter ${formatLabel(key).toLowerCase()}`}
              onChange={(e) => onChange(currentPath, e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
};

const EditPolicy = () => {
  const navigate =
    useNavigate();

  const { id } = useParams();

  const [formData, setFormData] =
    useState({
      policy_type: "",
      title: "",
      subtitle: "",
      is_mandatory: false,
      target_roles: [],
      document_url: "",
      content: [],
      configuration: {},
    });
  const policyTypeGroups = [
    {
      category: "Legal",
      options: [
    
        {
          value: "terms_and_conditions",
          label: "Terms and Conditions",
        },

        {
          value: "privacy_policy",
          label: "Privacy Policy",
        },
            {
    value: "cancellation",
    label: "Cancellation Policy"
  },

  {
    value: "editorial_policy",
    label: "Editorial Policy"
  },

     

        {
          value: "return",
          label: "Return Policy",
        },

        {
          value: "refund",
          label: "Refund Policy",
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
          value: "account_data_deletion",
          label: "Account Data Deletion",
        },

        {
          value: "medical_disclaimer_telemedicine",
          label:
            "Medical Disclaimer & Telemedicine",
        },
      ],
    },

    {
      category: "Operational",
      options: [
        {
          value: "doctor_services",
          label: "Doctor Services",
        },
        {
          value: "platform_fee",
          label: "Platform Fee",
        },
        {
          value: "gst",
          label: "GST",
        },
      ],
    },

    {
      category: "System",
      options: [
        {
          value: "serviceability",
          label: "Serviceability",
        },
      ],
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
const removeRole = (role) => {
  setFormData((prev) => ({
    ...prev,
    target_roles: prev.target_roles.filter(
      (item) => item !== role
    ),
  }));
};

  const [errors, setErrors] =
    useState({});

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    initialEditorContent,
    setInitialEditorContent,
  ] = useState("");

  const [
    showSectionForm,
    setShowSectionForm,
  ] = useState(false);

  const [
    newSectionName,
    setNewSectionName,
  ] = useState("");

  

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,

      TextAlign.configure({
        types: [
          "heading",
          "paragraph",
        ],
      }),
    ],

    content: "",

    immediatelyRender: false,

    onUpdate: ({
      editor,
    }) => {
      if (
        !editor ||
        editor.isDestroyed
      ) {
        return;
      }

      const html =
        editor.getHTML();

      const structuredContent =
        convertHtmlToPolicyContent(
          html
        );

      setFormData((prev) => ({
        ...prev,
        content:
          structuredContent,
      }));

      setErrors((prev) => {
        const updatedErrors = {
          ...prev,
        };

        const hasContent =
          structuredContent.some(
            (item) => {
              if (!item)
                return false;

              if (
                item.type ===
                "list"
              ) {
                return (
                  Array.isArray(
                    item.items
                  ) &&
                  item.items.some(
                    (listItem) =>
                      listItem?.text?.trim()
                  )
                );
              }

              return Boolean(
                item.text?.trim()
              );
            }
          );

        if (hasContent) {
          delete updatedErrors.content;
        }

        return updatedErrors;
      });
    },
  });


  useEffect(() => {
    let isMounted = true;

    const fetchPolicy =
      async () => {
        const token =
          sessionStorage.getItem(
            "superadmin_token"
          );

        if (!token) {
          toast.error(
            "Session expired. Please login again"
          );

          navigate("/login");
          return;
        }

        if (!id) {
          toast.error(
            "Policy ID is missing"
          );

          navigate(
            "/LegalPolicies"
          );

          return;
        }

        try {
          setIsLoading(true);

          const response =
            await fetch(
              `${BASE_URL}/policies/admin/legal/?id=${id}`,
              {
                method: "GET",

                headers: {
                  Accept:
                    "application/json",

                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,

                  "ngrok-skip-browser-warning":
                    "true",
                },
              }
            );

          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            sessionStorage.removeItem(
              "superadmin_token"
            );

            toast.error(
              "Session expired. Please login again"
            );

            navigate("/login");

            return;
          }

          const data =
            await response.json();

          console.log(
            "Edit Policy API Response:",
            data
          );

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Failed to fetch policy"
            );
          }

          if (
            data?.status &&
            data.status !==
              "success"
          ) {
            throw new Error(
              data?.message ||
                "Failed to fetch policy"
            );
          }

          const policy =
            data?.data;

          if (!policy) {
            throw new Error(
              "Policy data not found"
            );
          }

          if (!isMounted)
            return;

          setFormData({
            policy_type:
              policy.policy_type ||
              "",

            title:
              policy.title || "",

            subtitle:
              policy.subtitle ||
              "",

            is_mandatory:
              Boolean(
                policy.is_mandatory
              ),

            target_roles:
              Array.isArray(
                policy.target_roles
              )
                ? policy.target_roles
                : [],

            document_url:
              Array.isArray(
                policy.document_urls
              ) &&
              policy
                .document_urls
                .length > 0
                ? policy
                    .document_urls[0]
                : "",

            content:
              Array.isArray(
                policy.content
              )
                ? policy.content
                : [],

            configuration:
              policy.configuration &&
              typeof policy.configuration ===
                "object"
                ? cloneObject(
                    policy.configuration
                  )
                : {},
          });

          setInitialEditorContent(
            convertPolicyContentToHtml(
              policy.content ||
                []
            )
          );
        } catch (error) {
          console.error(
            "Fetch policy error:",
            error
          );

          if (isMounted) {
            toast.error(
              error.message ||
                "Failed to load policy"
            );
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

    fetchPolicy();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

 

  useEffect(() => {
    if (!editor) return;

    if (editor.isDestroyed)
      return;

    if (
      !initialEditorContent
    ) {
      editor.commands.clearContent(
        false
      );

      return;
    }

    if (editor.isDestroyed)
      return;

    editor.commands.setContent(
      initialEditorContent,
      false
    );
  }, [
    editor,
    initialEditorContent,
  ]);

  

  const handleChange = (
    e
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    const finalValue =
      type === "checkbox"
        ? checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]:
        finalValue,
    }));

    setErrors((prev) => {
      const updatedErrors = {
        ...prev,
      };

      if (
        name === "title" &&
        value.trim().length >=
          3
      ) {
        delete updatedErrors.title;
      }

      if (
        name === "subtitle" &&
        value.trim().length >=
          5
      ) {
        delete updatedErrors.subtitle;
      }

      return updatedErrors;
    });
  };



  const handleRoleToggle = (
    role
  ) => {
    setFormData((prev) => {
      const exists =
        prev.target_roles.includes(
          role
        );

      const target_roles =
        exists
          ? prev.target_roles.filter(
              (item) =>
                item !== role
            )
          : [
              ...prev.target_roles,
              role,
            ];

      setErrors(
        (currentErrors) => {
          const updatedErrors =
            {
              ...currentErrors,
            };

          if (
            target_roles.length >
            0
          ) {
            delete updatedErrors.target_roles;
          } else {
            updatedErrors.target_roles =
              "Please select at least one target role";
          }

          return updatedErrors;
        }
      );

      return {
        ...prev,
        target_roles,
      };
    });
  };

  

  const handleConfigurationChange = (path, value) => {
    setFormData((prev) => ({
      ...prev,
      configuration: setNestedValue(
        prev.configuration || {},
        path,
        value
      ),
    }));
  };

  const handleAddConfigurationField = (parentPath, fieldKey, value) => {
    const cleanKey = createFieldKey(fieldKey);

    if (!cleanKey) {
      toast.error("Please enter a valid field name");
      return;
    }

    const fieldPath = parentPath
      ? `${parentPath}.${cleanKey}`
      : cleanKey;

    setFormData((prev) => {
      const updatedConfiguration = setNestedValue(
        prev.configuration || {},
        fieldPath,
        value
      );

      console.log("Added configuration field:", {
        fieldPath,
        value,
        configuration: updatedConfiguration,
      });

      return {
        ...prev,
        configuration: updatedConfiguration,
      };
    });
  };

  

  const handleConfigurationDelete =
    (path) => {
      setFormData((prev) => ({
        ...prev,

        configuration:
          deleteNestedValue(
            prev.configuration,
            path
          ),
      }));
    };

  

  const handleAddSection =
    () => {
      const cleanName =
        newSectionName.trim();

      if (!cleanName) {
        toast.error(
          "Please enter section name"
        );

        return;
      }

      const sectionKey =
        cleanName
          .toLowerCase()
          .replace(
            /\s+/g,
            "_"
          )
          .replace(
            /[^a-zA-Z0-9_]/g,
            ""
          );

      if (!sectionKey) {
        toast.error(
          "Please enter a valid section name"
        );

        return;
      }

      if (
        formData.configuration &&
        Object.prototype.hasOwnProperty.call(
          formData.configuration,
          sectionKey
        )
      ) {
        toast.error(
          "This section already exists"
        );

        return;
      }

      setFormData((prev) => ({
        ...prev,

        configuration: {
          ...prev.configuration,
          [sectionKey]: {},
        },
      }));

      setNewSectionName("");
      setShowSectionForm(false);
    };

 

  const validateForm =
    () => {
      const newErrors = {};

      if (
        !formData.policy_type
      ) {
        newErrors.policy_type =
          "Policy type is required";
      }

      if (
        !formData.title.trim()
      ) {
        newErrors.title =
          "Policy title is required";
      } else if (
        formData.title
          .trim()
          .length < 3
      ) {
        newErrors.title =
          "Policy title must be at least 3 characters";
      } else if (
        formData.title
          .trim()
          .length > 200
      ) {
        newErrors.title =
          "Policy title must not exceed 200 characters";
      }

      if (
        !formData.subtitle.trim()
      ) {
        newErrors.subtitle =
          "Subtitle is required";
      } else if (
        formData.subtitle
          .trim()
          .length < 5
      ) {
        newErrors.subtitle =
          "Subtitle must be at least 5 characters";
      } else if (
        formData.subtitle
          .trim()
          .length > 500
      ) {
        newErrors.subtitle =
          "Subtitle must not exceed 500 characters";
      }

      if (
        !Array.isArray(
          formData.target_roles
        ) ||
        formData.target_roles
          .length === 0
      ) {
        newErrors.target_roles =
          "Please select at least one target role";
      }

      const hasContent =
        Array.isArray(
          formData.content
        ) &&
        formData.content.some(
          (item) => {
            if (!item)
              return false;

            if (
              item.type ===
              "list"
            ) {
              return (
                Array.isArray(
                  item.items
                ) &&
                item.items.some(
                  (listItem) =>
                    listItem?.text?.trim()
                )
              );
            }

            return Boolean(
              item.text?.trim()
            );
          }
        );

      if (!hasContent) {
        newErrors.content =
          "Policy content is required";
      }

      setErrors(
        newErrors
      );

      return (
        Object.keys(
          newErrors
        ).length === 0
      );
    };

  
  const handleSubmit =
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error(
          "Please fix the highlighted fields"
        );

        return;
      }

      const token =
        sessionStorage.getItem(
          "superadmin_token"
        );

      if (!token) {
        toast.error(
          "Session expired. Please login again"
        );

        navigate("/login");

        return;
      }

      try {
        setIsSubmitting(
          true
        );

        const payload = {
          policy_type:
            formData.policy_type,

          title:
            formData.title.trim(),

          subtitle:
            formData.subtitle.trim(),

          is_mandatory:
            formData.is_mandatory,

          target_roles:
            formData.target_roles,

          content:
            formData.content,

          configuration:
            cloneObject(formData.configuration || {}),

          document_urls:
            formData.document_url.trim()
              ? [
                  formData.document_url.trim(),
                ]
              : [],
        };

        console.log(
          "Update Policy Payload:",
          payload
        );
        console.log(
          "Update Policy Payload JSON:",
          JSON.stringify(payload, null, 2)
        );

        const response =
          await fetch(
            `${BASE_URL}/policies/admin/legal/?id=${id}`,
            {
              method: "PUT",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,

                "ngrok-skip-browser-warning":
                  "true",
              },

              body: JSON.stringify(
                payload
              ),
            }
          );

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          sessionStorage.removeItem(
            "superadmin_token"
          );

          toast.error(
            "Session expired. Please login again"
          );

          navigate("/login");

          return;
        }

        const data =
          await response.json();

        console.log(
          "Update Policy Response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to update policy"
          );
        }

        if (
          data?.status &&
          data.status !==
            "success"
        ) {
          throw new Error(
            data?.message ||
              "Failed to update policy"
          );
        }

        toast.success(
          "Policy updated successfully"
        );

        navigate(
          "/LegalPolicies"
        );
      } catch (error) {
        console.error(
          "Update policy error:",
          error
        );

        toast.error(
          error.message ||
            "Failed to update policy"
        );
      } finally {
        setIsSubmitting(
          false
        );
      }
    };

 
  const handleCancel =
    () => {
      navigate(
        "/LegalPolicies"
      );
    };

  

  if (isLoading) {
    return (
      <div className="create-policy-page">
        <div className="page-header">
          <h1>
            Edit Policy
          </h1>

          <p className="page-paragraph">
            Loading policy details...
          </p>
        </div>

        <div className="policy-card">
          <div className="policy-loading-state">
            <div className="policy-loading-spinner"></div>

            <p>
              Loading policy information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  

  return (

<div className="policy-create-page">

 
  <div className="policy-create-header">

    <div className="policy-header-left">

      <button
        type="button"
        className="policy-back-btn"
        onClick={handleCancel}
      >
        <FaArrowLeft />
      </button>

      <div>
        <h2>Edit Policy</h2>

        <p>
          Update policy details, content and
          configuration for your platform users.
        </p>
      </div>

    </div>

  </div>


  <form onSubmit={handleSubmit}>

    

    <div className="policy-card">

      <div className="policy-card-header">

        <div>
          <h3>Policy Information</h3>

          <p>
            Update the basic information and
            visibility of this policy.
          </p>
        </div>

      </div>


      <div className="policy-form-grid">

    

        <div className="policy-field">

          <label>
            Policy Type <span>*</span>
          </label>

          <select
            name="policy_type"
            value={formData.policy_type}
               onChange={handleChange}
          >

            <option value="">
              Select policy type
            </option>

            {policyTypeGroups.map((group) => (
              <optgroup
                key={group.category}
                label={group.category}
              >

                {group.options.map((policy) => (
                  <option
                    key={policy.value}
                    value={policy.value}
                  >
                    {policy.label}
                  </option>
                ))}

              </optgroup>
            ))}

          </select>

          {errors.policy_type && (
            <span className="field-error">
              {errors.policy_type}
            </span>
          )}

        </div>


        {/* ================= POLICY TITLE ================= */}

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
            className={
              errors.title
                ? "policy-input-error"
                : ""
            }
          />

          {errors.title && (
            <span className="field-error">
              {errors.title}
            </span>
          )}

        </div>


        {/* ================= SUBTITLE ================= */}

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
            className={
              errors.subtitle
                ? "policy-input-error"
                : ""
            }
          />

          {errors.subtitle && (
            <span className="field-error">
              {errors.subtitle}
            </span>
          )}

        </div>

      </div>


     
      <div className="policy-setting-row">

        <div>

          <h4>
            Mandatory Policy
          </h4>

          <p>
            Users must acknowledge this
            policy when applicable.
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


   
      <div className="policy-role-section">

        <label>
          Target Roles <span>*</span>
        </label>

        <p className="policy-field-description">
          Select the users or system roles
          this policy applies to.
        </p>


        <div className="policy-role-options">

          {roles.map((role) => {

            const selected =
              formData.target_roles.includes(
                role.value
              );

            return (
              <button
                type="button"
                key={role.value}
                className={`policy-role-option ${
                  selected ? "selected" : ""
                }`}
                onClick={() =>
                  handleRoleToggle(role.value)
                }
              >

                {selected && (
                  <span>✓</span>
                )}

                {role.label}

              </button>
            );

          })}

        </div>


        {errors.target_roles && (
          <span className="field-error">
            {errors.target_roles}
          </span>
        )}


        {/* ================= SELECTED ROLE CHIPS ================= */}

        {formData.target_roles.length > 0 && (

          <div className="policy-selected-roles">

            {formData.target_roles.map((role) => {

              const roleData = roles.find(
                (item) => item.value === role
              );

              return (
                <div
                  className="policy-role-chip"
                  key={role}
                >

                  {roleData?.label || formatLabel(role)}

                  <button
                    type="button"
                    onClick={() =>
                      removeRole(role)
                    }
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


  
    <div className="policy-card">

      <div className="policy-card-header">

        <div>
          <h3>
            Policy Content
          </h3>

          <p>
            Edit the complete legal content
            of the policy.
          </p>
        </div>

        <span className="policy-required-badge">
          Required
        </span>

      </div>


      <div
        className={
          errors.content
            ? "policy-editor-wrapper policy-editor-error"
            : "policy-editor-wrapper"
        }
      >

        {/* ================= TOOLBAR ================= */}

        <div className="policy-editor-toolbar">

          {/* BOLD */}
          <button
            type="button"
            className={
              editor?.isActive("bold")
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleBold()
                .run()
            }
            title="Bold"
          >
            <strong>B</strong>
          </button>


          {/* ITALIC */}
          <button
            type="button"
            className={
              editor?.isActive("italic")
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleItalic()
                .run()
            }
            title="Italic"
          >
            <em>I</em>
          </button>


          {/* UNDERLINE */}
          <button
            type="button"
            className={
              editor?.isActive("underline")
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleUnderline()
                .run()
            }
            title="Underline"
          >
            <u>U</u>
          </button>


          <span className="policy-toolbar-divider" />


          {/* H2 */}
          <button
            type="button"
            className={
              editor?.isActive("heading", {
                level: 2,
              })
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleHeading({
                  level: 2,
                })
                .run()
            }
          >
            H2
          </button>


          {/* H3 */}
          <button
            type="button"
            className={
              editor?.isActive("heading", {
                level: 3,
              })
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleHeading({
                  level: 3,
                })
                .run()
            }
          >
            H3
          </button>


          <span className="policy-toolbar-divider" />


          {/* BULLET LIST */}
          <button
            type="button"
            className={
              editor?.isActive("bulletList")
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleBulletList()
                .run()
            }
          >
            • List
          </button>


          {/* ORDERED LIST */}
          <button
            type="button"
            className={
              editor?.isActive("orderedList")
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .toggleOrderedList()
                .run()
            }
          >
            1. List
          </button>


          <span className="policy-toolbar-divider" />


          {/* LEFT */}
          <button
            type="button"
            className={
              editor?.isActive({
                textAlign: "left",
              })
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .setTextAlign("left")
                .run()
            }
          >
            Left
          </button>


          {/* CENTER */}
          <button
            type="button"
            className={
              editor?.isActive({
                textAlign: "center",
              })
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .setTextAlign("center")
                .run()
            }
          >
            Center
          </button>


          {/* RIGHT */}
          <button
            type="button"
            className={
              editor?.isActive({
                textAlign: "right",
              })
                ? "active"
                : ""
            }
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .setTextAlign("right")
                .run()
            }
          >
            Right
          </button>


          <span className="policy-toolbar-divider" />


          {/* UNDO */}
          <button
            type="button"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .undo()
                .run()
            }
            title="Undo"
          >
            ↶
          </button>


          {/* REDO */}
          <button
            type="button"
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .redo()
                .run()
            }
            title="Redo"
          >
            ↷
          </button>

        </div>


        {/* ================= EDITOR ================= */}

        <EditorContent editor={editor} />

      </div>


      {errors.content && (
        <span className="field-error policy-content-error">
          {errors.content}
        </span>
      )}

    </div>


  


<div className="policy-card">

  <div className="policy-card-header">

    <div>
      <h3>
        Configuration
      </h3>

      <p>
        Configure policy-specific rules,
        limits and operational settings.
      </p>
    </div>

    {formData.policy_type && (
      <span className="configuration-policy-badge">
        {
          policyTypeGroups
            .flatMap((group) => group.options)
            .find(
              (item) =>
                item.value === formData.policy_type
            )?.label
        }
      </span>
    )}

  </div>

  {!formData.policy_type ? (

    <div className="configuration-empty">

      <div className="configuration-empty-icon">
        ⚙
      </div>

      <h4>
        Select a Policy Type
      </h4>

      <p>
        Select a policy type above to
        configure its settings.
      </p>

    </div>

  ) : (

    <>

      {/* ================= CONFIGURATION ================= */}

      {Object.keys(
        formData.configuration || {}
      ).length === 0 ? (

        <div className="configuration-empty">

          <div className="configuration-empty-icon">
            ⚙
          </div>

          <h4>
            No Configuration Added
          </h4>

          <p>
            Add a section and configure
            policy-specific settings.
          </p>

        </div>

      ) : (

        <DynamicConfiguration
          value={formData.configuration || {}}
          onChange={handleConfigurationChange}
          onAddField={handleAddConfigurationField}
          onDelete={handleConfigurationDelete}
        />

      )}

      {/* ================= ADD SECTION ================= */}
{/* 
      {!showSectionForm ? (

        <button
          type="button"
          className="dynamic-add-section-btn"
          onClick={() =>
            setShowSectionForm(true)
          }
        >
          <FaPlus />
          Add Section
        </button>

      ) : (

        <div className="dynamic-root-section-form">

          <div>

            <label>
              Section Name
            </label>

            <input
              type="text"
              value={newSectionName}
              onChange={(e) =>
                setNewSectionName(e.target.value)
              }
              placeholder="e.g. Follow Up"
            />

          </div>

          <div className="dynamic-root-actions">

            <button
              type="button"
              className="dynamic-secondary-btn"
              onClick={() => {
                setShowSectionForm(false);
                setNewSectionName("");
              }}
            >
              <FaTimes />
              Cancel
            </button>

            <button
              type="button"
              className="dynamic-primary-btn"
              onClick={handleAddSection}
            >
              <FaPlus />
              Add Section
            </button>

          </div>

        </div>

      )} */}

    </>

  )}

</div>




    {/* =====================================================
        ACTIONS
    ====================================================== */}

    <div className="policy-form-actions">

      <button
        type="button"
        className="policy-cancel-btn"
        onClick={handleCancel}
        disabled={isSubmitting}
      >
        <FaTimes />
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
            Updating...
          </>

        ) : (

          <>
            <FaSave />
            Update Policy
          </>

        )}

      </button>

    </div>

  </form>

</div>


  );
};

export default EditPolicy;
