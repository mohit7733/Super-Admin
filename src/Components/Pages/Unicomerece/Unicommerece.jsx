
import React, { useState ,useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react'
 
import { FaTag,FaChartLine,FaCalendarAlt,FaEdit } from 'react-icons/fa'
import { FiTrash2 } from 'react-icons/fi'
import { BsSearch,BsPlus } from 'react-icons/bs'
import { ToastContainer,toast} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";

const Unicommerece = () => {
  const[TaxClassModal,setTaxClassModal]=useState(false);
  const[TaxClassData,setTaxClassData]=useState([]);
  const[TaxClassLoading,setTaxclasLoading]=useState(false);
  const[TaxClassError,setTaxClassError]=useState(null);
 
const [EditTaxClassModal, setEditTaxClassModal] = useState(false);
const [editingTaxClass, setEditingTaxClass] = useState(null);
  const [errors, setErrors] = useState({});
const [submitLoading, setSubmitLoading] = useState(false);
const[deleteModal,setDeleteModal] = useState(false);
 const [isDeleting, setIsDeleting] = useState(false);
 const [classId, setClassId] = useState(null);
  const initialTaxForm = {
  tax_type: "",
  name: "",
  code: "",
  percentage: "",
  tax_calculated_on: "",
  description: "",
};
const handleInputChange = (field, value) => {
  setTaxForm((prev) => ({
    ...prev,
    [field]: value,
  }));

  setErrors((prev) => ({
    ...prev,
    [field]: "",
  }));
};

const handleUpdateTaxClass = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  const newErrors = {};

  if (!taxForm.tax_type) {
    newErrors.tax_type = "Please select Tax Type";
  }

  if (!taxForm.name.trim()) {
    newErrors.name = "Tax Class Name is required";
  }

  if (!taxForm.code.trim()) {
    newErrors.code = "Tax Code is required";
  }

  if (!taxForm.percentage) {
    newErrors.percentage = "Tax Percentage is required";
  }

  if (!taxForm.tax_calculated_on) {
    newErrors.tax_calculated_on =
      "Please select Tax Calculated On";
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);

    Object.values(newErrors).forEach((message) => {
      toast.error(message);
    });

    return;
  }

  setErrors({});
  setSubmitLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/unicommerce-tax-class/?id=${editingTaxClass.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          tax_type: taxForm.tax_type,
          name: taxForm.name.trim(),
          code: taxForm.code.trim().toUpperCase(),
          percentage: taxForm.percentage,
          tax_calculated_on: taxForm.tax_calculated_on,
          description: taxForm.description.trim(),
        }),
      }
    );

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    if (response.ok && data.success) {
      toast.success(
        data.message || "Tax Class Updated Successfully"
      );

      resetEditTaxForm();

      getTaxClaslist();
    } else {
      toast.error(data.message || "Failed to update Tax Class");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setSubmitLoading(false);
  }
};

const resetTaxForm = () => {
  setTaxForm(initialTaxForm);
  setErrors({});
  setTaxClassModal(false);
};
const [taxForm, setTaxForm] = useState(initialTaxForm);

  const navigate =useNavigate();
  const fetchedOnce = useRef(false);

  const getTaxClaslist = async () => {
const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setTaxclasLoading(true);


  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/unicommerce-tax-class/`,
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

    console.log("Category API Response:", data);

  if (response.ok && data.success) {
  setTaxClassData(Array.isArray(data.data) ? data.data : [data.data]);
} else {
  toast.error(data.message || "Failed to get Tax Class Data");
} 

  } catch (error) {

    console.error("Category Fetch Error:", error);

    setTaxClassError("Something went wrong while fetching data.");

    toast.error("Failed to fetch category data");

  } finally {
    setTaxclasLoading(false);
  }
};
const handleEdit = (item) => {
  setEditingTaxClass(item);

  setTaxForm({
    tax_type: item.tax_type || "",
    name: item.name || "",
    code: item.code || "",
    percentage: item.percentage || "",
    tax_calculated_on: item.tax_calculated_on || "",
    description: item.description || "",
  });

  setErrors({});
  setEditTaxClassModal(true);
};
const handleAddTaxClass = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  const newErrors = {};

  if (!taxForm.tax_type) {
    newErrors.tax_type = "Please select Tax Type";
  }

  if (!taxForm.name.trim()) {
    newErrors.name = "Tax Class Name is required";
  }

  if (!taxForm.code.trim()) {
    newErrors.code = "Tax Code is required";
  }

  if (!taxForm.percentage) {
    newErrors.percentage = "Tax Percentage is required";
  }

  if (!taxForm.tax_calculated_on) {
    newErrors.tax_calculated_on =
      "Please select Tax Calculated On";
  }

if (Object.keys(newErrors).length > 0) {
  setErrors(newErrors);

  Object.values(newErrors).forEach((message) => {
    toast.error(message);
  });

  return;
}
  setErrors({});
  setSubmitLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/unicommerce-tax-class/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          tax_type: taxForm.tax_type,
          name: taxForm.name.trim(),
          code: taxForm.code.trim().toUpperCase(),
          percentage: taxForm.percentage,
          tax_calculated_on: taxForm.tax_calculated_on,
          description: taxForm.description.trim(),
        }),
      }
    );

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    if (response.ok && data.success) {
      toast.success(data.message || "Tax Class Added Successfully");

       resetTaxForm();

      getTaxClaslist(); 
    } else {
      toast.error(data.message || "Failed to add Tax Class");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setSubmitLoading(false);
  }
};

const resetEditTaxForm = () => {
  setTaxForm(initialTaxForm);
  setErrors({});
  setEditingTaxClass(null);
  setEditTaxClassModal(false);
};
useEffect(() => {
    if (!fetchedOnce.current) {
      getTaxClaslist();
  
      
      fetchedOnce.current = true;
    }
  }, []);

  const handleDelete = async (id) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/vendors/admin/unicommerce-tax-class/?id=${id}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    if (response.ok && data.success) {
      toast.success(data.message || "Tax Class deleted successfully");
      setDeleteModal(false);
      setClassId(null);
      getTaxClaslist();
    } else {
      toast.error(data.message || "Failed to delete Tax Class");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
};

  return (
    <>
        <div className="page-header">
            <h1>Tax Class Management</h1>
            <p className="page-paragraph">
              Manage Tax Class, their details
            </p>
          </div>

             <div className="vendors-stats stats2-grid">
                          <div className="stat2-card">
                            <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                            <FaTag size={24} />
                            </div>
                            <div className="stat2-info">
                              <h3>Total Tax Class</h3>
                              <div className="stat2-value">0</div>
                            </div>
                          </div>
                  
                          <div className="stat2-card">
                            <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                              <FaChartLine size={24} />
                            </div>
                            <div className="stat2-info">
                              <h3>New This Year</h3>
                              <div className="stat2-value">0</div>
                            </div>
                          </div>
                  
                          <div className="stat2-card">
                            <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                            <FaCalendarAlt size={24} />
                            </div>
                            <div className="stat2-info">
                              <h3>New This Month</h3>
                              <div className="stat2-value">0</div>
                            </div>
                          </div>
                  
                        </div>

  <div className="controls-section">
            <div className="search-wrapper">
              <BsSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by Tax clas name && code..."
                className="search-input"
              />
            </div>
    
            <div className="action-buttons">
            
    
              <button className="btn-primary"
              onClick={() => setTaxClassModal(true)}
              > 
                <BsPlus size={18} />
                Add Tax Class
              </button>
</div>
</div>


<div className="table-wrapper">
                             <table className="data-table" >
                               <thead>
                                 <tr>
                                   <th>ID</th>
                                   <th>Name </th>
                                   <th>Code</th>               
                                   <th> Tax Type </th>
                                   <th>Percentage</th>
                                   <th> Calcuated on</th>
                                   <th> Created At</th>
<th> Action</th>
                                 </tr>
                               </thead>
               <tbody>
                 {TaxClassLoading? (
                   Array(3).fill(0).map((_, i) => (
                     <tr key={i}>
                       <td colSpan="8">
                         <div className="skeleton-row"></div>
                       </td>
                     </tr>
                   ))
                 ) :TaxClassError ? (
                   <tr>
                     <td colSpan="7" style={{ color: "red" }}>
                       {TaxClassError}
                     </td>
                   </tr>
                 ) :TaxClassData?.length > 0 ? (
                   TaxClassData.map((item, index) => (
                     <tr key={item.id}>
                       <td>{index + 1}</td>
               
                      
                       <td>{item.name}</td>
                          <td><span className="category-code-badge">{item.code || "N/A"}</span></td>
                    <td>{item.tax_type_display}</td>
                    <td>{item.percentage} %</td>

<td>{item.tax_calculated_on_display}</td>

<td>
  {new Date(item.created_at).toLocaleDateString("en-IN")}
</td>

<td>
  <div className="action-buttons">
   <button
  className="action-btn edit"
  onClick={() => handleEdit(item)}
>
  <FaEdit />
</button>
  
<button
  className="action-btn delete"
  onClick={() => {
    setClassId(item.id);
    setDeleteModal(true);
  }}
>
  <FiTrash2 />
</button>

  </div>
</td>
                    

           
                     </tr>
                   ))
                 ) : (
                   <tr>
                     <td colSpan="7" style={{ textAlign: "center" }}>
                       No data found
                     </td>
                   </tr>
                 )}
               </tbody>
                             </table>                
                   </div> 

{TaxClassModal && (
  <div
    className="prakriti-modal-overlay"
   onClick={resetTaxForm}
  >
    <div
      className="prakriti-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="prakriti-modal-header">
        <h2>Add Tax Class</h2>

        <button
          className="modal-close-btn"
         onClick={resetTaxForm}
        >
          ✕
        </button>
      </div>

      <form  onSubmit={handleAddTaxClass} className="prakriti-form">

        {/* Tax Type */}

        <div className="form-group">
          <label>
            Tax Type <span className="required">*</span>
          </label>

          <select
            value={taxForm.tax_type}
           onChange={(e) => handleInputChange("tax_type", e.target.value)}
          >
              <option value="">Select Tax Type</option>
            <option value="GST">GST</option>
            <option value="NON_GST">NON GST</option>
          </select>
          {errors.tax_type && <p className="error-text">{errors.tax_type}</p>}
        </div>

        {/* Name */}

        <div className="form-group">
          <label>
            Tax Class Name <span className="required">*</span>
          </label>

          <input
            type="text"
            placeholder="Enter Tax Class Name"
            value={taxForm.name}
             onChange={(e) => handleInputChange("name", e.target.value)}
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        {/* Code */}

        <div className="form-group">
          <label>
            Tax Code <span className="required">*</span>
          </label>

          <input
            type="text"
            placeholder="GST5"
            maxLength={10}
            value={taxForm.code}
  onChange={(e) => {
  const value = e.target.value.toUpperCase();

  if (/[^A-Z0-9]/.test(value)) {
    toast.error("Only capital letters and numbers are allowed.");
    return;
  }

  setTaxForm({
    ...taxForm,
    code: value,
  });

  setErrors((prev) => ({
    ...prev,
    code: "",
  }));
}}
          />
          {errors.code && <p className="error-text">{errors.code}</p>}
        </div>

        {/* Percentage */}

        <div className="form-group">
          <label>
            Tax Percentage <span className="required">*</span>
          </label>

         <input
  type="number"
   placeholder="Enter Tax Percentage (e.g. 5.00)"
  step="0.01"
  value={taxForm.percentage}
  onBlur={() => {
    if (taxForm.percentage) {
      setTaxForm({
        ...taxForm,
        percentage: Number(taxForm.percentage).toFixed(2),
      });
    }
  }}
  onChange={(e) => handleInputChange("percentage", e.target.value)}
/>
          {errors.percentage && <p className="error-text">{errors.percentage}</p>}
        </div>

        

        <div className="form-group">
          <label>
            Tax Calculated On <span className="required">*</span>
          </label>

          <select
            value={taxForm.tax_calculated_on}
             onChange={(e) =>
    handleInputChange("tax_calculated_on", e.target.value)
  }
          >
              <option value="">Select Calculation Type</option>
            <option value="UNIT_PRICE">
              Unit Price
            </option>

            <option value="MAX_RETAIL_PRICE">
              Max Retail Price
            </option>
          </select>
              {errors.tax_calculated_on && <p className="error-text">{errors.tax_calculated_on}</p>}
        </div>

        {/* Description */}

        <div className="form-group">
          <label>Description</label>

          <textarea
            rows={4}
            placeholder="Enter Description"
            value={taxForm.description}
         onChange={(e) => handleInputChange("description", e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="cancel-btn"
           onClick={resetTaxForm}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
            disabled={submitLoading}
          >
            {submitLoading ? "Saving..." : "Add Tax Class"}
          </button>
        </div>

      </form>
    </div>
  </div>
)}

{EditTaxClassModal && (
  <div
    className="prakriti-modal-overlay"
    onClick={resetEditTaxForm}
  >
    <div
      className="prakriti-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="prakriti-modal-header">
        <h2>Edit Tax Class</h2>

        <button
          className="modal-close-btn"
          onClick={resetEditTaxForm}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleUpdateTaxClass} className="prakriti-form">

        {/* Tax Type */}
        <div className="form-group">
          <label>
            Tax Type <span className="required">*</span>
          </label>

          <select
            value={taxForm.tax_type}
            onChange={(e) =>
              handleInputChange("tax_type", e.target.value)
            }
          >
            <option value="">Select Tax Type</option>
            <option value="GST">GST</option>
            <option value="NON_GST">NON GST</option>
          </select>

          {errors.tax_type && (
            <p className="error-text">{errors.tax_type}</p>
          )}
        </div>

        {/* Name */}
        <div className="form-group">
          <label>
            Tax Class Name <span className="required">*</span>
          </label>

          <input
            type="text"
            placeholder="Enter Tax Class Name"
            value={taxForm.name}
            onChange={(e) =>
              handleInputChange("name", e.target.value)
            }
          />

          {errors.name && (
            <p className="error-text">{errors.name}</p>
          )}
        </div>

        {/* Code */}
        <div className="form-group">
          <label>
            Tax Code <span className="required">*</span>
          </label>

          <input
            type="text"
            placeholder="GST5"
            maxLength={10}
            value={taxForm.code}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();

              if (/[^A-Z0-9]/.test(value)) {
                toast.error(
                  "Only capital letters and numbers are allowed."
                );
                return;
              }

              setTaxForm({
                ...taxForm,
                code: value,
              });

              setErrors((prev) => ({
                ...prev,
                code: "",
              }));
            }}
          />

          {errors.code && (
            <p className="error-text">{errors.code}</p>
          )}
        </div>

        {/* Percentage */}
        <div className="form-group">
          <label>
            Tax Percentage <span className="required">*</span>
          </label>

          <input
            type="number"
            placeholder="Enter Tax Percentage (e.g. 5.00)"
            step="0.01"
            value={taxForm.percentage}
            onBlur={() => {
              if (taxForm.percentage) {
                setTaxForm({
                  ...taxForm,
                  percentage: Number(
                    taxForm.percentage
                  ).toFixed(2),
                });
              }
            }}
            onChange={(e) =>
              handleInputChange("percentage", e.target.value)
            }
          />

          {errors.percentage && (
            <p className="error-text">
              {errors.percentage}
            </p>
          )}
        </div>

        {/* Tax Calculated On */}
        <div className="form-group">
          <label>
            Tax Calculated On <span className="required">*</span>
          </label>

          <select
            value={taxForm.tax_calculated_on}
            onChange={(e) =>
              handleInputChange(
                "tax_calculated_on",
                e.target.value
              )
            }
          >
            <option value="">Select Calculation Type</option>

            <option value="UNIT_PRICE">
              Unit Price
            </option>

            <option value="MAX_RETAIL_PRICE">
              Max Retail Price
            </option>
          </select>

          {errors.tax_calculated_on && (
            <p className="error-text">
              {errors.tax_calculated_on}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description</label>

          <textarea
            rows={4}
            placeholder="Enter Description"
            value={taxForm.description}
            onChange={(e) =>
              handleInputChange(
                "description",
                e.target.value
              )
            }
          />
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={resetEditTaxForm}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
            disabled={submitLoading}
          >
            {submitLoading
              ? "Updating..."
              : "Update Tax Class"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}

   {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Are you sure you want to delete this category?</h3>
        
          

              <div className="form-buttons">
        <button
          className="otp-btn verify-btn"
             disabled={isDeleting}
          onClick={() => {
            handleDelete(classId);
            setDeleteModal(false);
          }}
        >
        {isDeleting ? "Deleting..." : "Yes"}
        </button>

        <button
          onClick={() => setDeleteModal(false)}
        >
          No
        </button>
      </div>
          </div>
        </div>
      )}


        <ToastContainer position="top-center" autoClose={2000} />                
    </>
  )
}

export default Unicommerece