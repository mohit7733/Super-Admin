import * as XLSX from "xlsx";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import BASE_URL from "../../../Base";
import { apiFetch } from "../../../fetchapi";
import {  BsThreeDotsVertical } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { FiUserPlus } from "react-icons/fi";
import { MdCalendarMonth } from "react-icons/md";






const userId = localStorage.getItem("USER_ID")

console.log("USER_ID", userId)

const initialCustomerFormState = {
 profile_picture:"" ,
  first_name: "",
  email: "",
  verified_phone_number: "",
  gender:"",
}

const initialFormErrors = {
  first_name: "",
  email: "",
  verified_phone_number: "",
  otp: "",
  gender:"",
}



const Customers = () => {
  const [searchcustomerTerm, setSearchcustomerTerm] = useState("")
  const [customerData, setCustomerData] = useState([])
  const [error, setCustomerError] = useState(null)
  const [Loading, setCustomerLoading] = useState(true)
  const [CustomerForm, setCustomerForm] = useState(initialCustomerFormState)
  const [editingCustomerId, setEditingCustomerId] = useState(null)
  const [customermodalOpen, setCustomerModalOpen] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState(initialFormErrors)
  const [phoneFormErrors, setPhoneFormErrors] = useState({ verified_phone_number: "" })
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const bulktableRef = useRef(null);
  const [userId, setUserId] = useState(null);
  
const [thisMonthCount, setThisMonthCount] = useState(0);
const [thisYearCount, setThisYearCount] = useState(0);

  const[ImageCustomerModal,setImageCustomerModal]=useState(false);
  const[ImageCustomerPreview,setImageCustomerPreview]=useState(null);
 const [openMenuId, setOpenMenuId] = useState(null);
 const [currentPage, setCurrentPage] = useState(1);
 const pageSize = 5;
 
const [totalCount, setTotalCount] = useState(0);
const totalPages = Math.ceil(totalCount / pageSize);
const [nextPage, setNextPage] = useState(null);
const [previousPage, setPreviousPage] = useState(null);

  
 const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
    
  const validateCustomerForm = () => {
    const errors = {};

    if (!CustomerForm.first_name.trim()) {
  errors.first_name = "First name is required";
} else if (!/^[A-Z][a-zA-Z\s]*$/.test(CustomerForm.first_name)) {
  errors.first_name = "First name should start with a capital letter and contain only letters and spaces";
}


    if (!CustomerForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CustomerForm.email)) {
      errors.email = "Please enter a valid email address";
    }


    console.log("Validation Errors:", errors);
    setFormErrors(errors);
    return Object.keys(errors)?.length === 0;
  };


  
  const validatePhoneForm = () => {
    const errors = {}

    if (!CustomerForm.verified_phone_number.trim()) {
      errors.verified_phone_number = "Phone number is required"
    } else if (!/^\d{10}$/.test(CustomerForm.verified_phone_number)) {
      errors.verified_phone_number = "Phone number must be 10 digits"
    }

    setPhoneFormErrors(errors)
    return Object.keys(errors)?.length === 0
  }

 
  const handleCloseCustomerModal = () => {
    setCustomerModalOpen(false)
    setEditingCustomerId(null)
    setCustomerForm(initialCustomerFormState)
    setFormErrors(initialFormErrors)
  }
  const handleDownload = () => {

    const exportData = customerData?.map((c) => ({
      Name: c.first_name,
      Email: c.email,
      "Phone Number": c.verified_phone_number,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");

    XLSX.writeFile(wb, "Customers.xlsx");
  };

  const handleNavigate = (id) => {
    navigate(`/CustomerDetailPage/${id}`)
  }


const handleCreateCustomer = async (e) => {
  e.preventDefault();

  if (!validatePhoneForm()) {
    return;
  }


  
  try {
    const token = sessionStorage.getItem("superadmin_token");
    const payload = {
      phone_number: `+91${CustomerForm.verified_phone_number}`,
      role: "customer",
    };

    const response = await fetch(`${BASE_URL}/user/super-admin/create-user/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    
    if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }

    const data = await response.json();
   
   
    if (!response.ok) {
      toast.error( data?.error);
      return;
    }

    
    const uid = data?.user?.id;

    toast.success("Customer created. Please complete your registration");

    if (uid) {
      setUserId(uid);
      localStorage.setItem("USER_ID", uid);
      setOtpVerified(false);
      setCustomerModalOpen(true);
    }

  } catch (err) {
    console.error("Customer create error:", err);
    toast.error("Something went wrong. Please try again", {
      position: "top-center",
    });
  }
};

 

  const handleCustomerDelete = async (id) => {
  try {
    const response = await apiFetch(`${BASE_URL}/customers/customer/${id}/`, {
      method: "DELETE",
    });

    
    if (!response) return;

    
    toast.success("Customer deleted successfully", {
      position: "top-center",
      autoClose: 2000,
    });

    setCustomerData((prev) => prev.filter((c) => c.id !== id));

  } catch (err) {
    console.error("Delete Error:", err);

    toast.error("Failed to delete customer", {
      position: "top-center",
      autoClose: 2000,
    });
  }
};


  

  const handleCustomerFormSubmit = async (e) => {
  e.preventDefault();

  if (!validateCustomerForm()) return;

  const method = editingCustomerId ? "PUT" : "POST";
  const url = editingCustomerId
    ? `${BASE_URL}/customers/customer/${editingCustomerId}/`
    : `${BASE_URL}/customers/customer/`;

  const formData = new FormData();

  if (method === "POST") {
    const uid = userId || localStorage.getItem("USER_ID");
    if (uid) formData.append("user", uid);
  }

  Object.entries(CustomerForm).forEach(([key, value]) => {
    formData.append(key, value);
  });

  try {
    const data = await apiFetch(url, {
      method,
      body: formData,

      headers: {},
    });

    
    if (!data) return;

    if (method === "POST") {
      setCustomerData((prev) => [...prev, data]);
      toast.success("Customer added successfully", {
        position: "top-center",
        autoClose: 2000,
      });
    } else {
      setCustomerData((prev) =>
        prev.map((cust) =>
          cust.id === editingCustomerId ? { ...cust, ...CustomerForm } : cust
        )
      );
      toast.success("Customer updated successfully", {
        position: "top-center",
        autoClose: 2000,
      });
    }

    handleCloseCustomerModal();
    getCustomerList();

  } catch (err) {
    console.error("Customer save error:", err);
    toast.error("Failed to save customer", {
      position: "top-center",
      autoClose: 2000,
    });
  }
};
const getInitials = (firstName = "", lastName = "") => {
  return (
    (firstName?.[0] || "").toUpperCase() +
    (lastName?.[0] || "").toUpperCase()
  );
};


 
 
const handleCustomerFileChange = (e) => {
  const file = e.target.files[0];

  setCustomerForm((prev) => ({
    ...prev,
    profile_picture: file,
  }));
};


  const handleCustomerInputChange = (e) => {
    const { name, value } = e.target;

    let updatedValue = value;

    if (name === "verified_phone_number") {

      const digitsOnly = value.replace(/\D/g, "");

      updatedValue = digitsOnly;
    }

    setCustomerForm((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));

  

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

    if (phoneFormErrors[name]) {
      setPhoneFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }



const getCustomerList = async (page = 1, searchTerm = "") => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setCustomerLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/customers/customer/?page=${page}&search=${searchTerm}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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

    console.log("Customer API Response:", data);

    setCustomerData(data.data || []);
    setTotalCount(data.count || 0);
    setNextPage(data.next);
    setPreviousPage(data.previous);
    setCurrentPage(page);
    setThisMonthCount(data.this_month_count || 0);
    setThisYearCount(data.this_year_count || 0);

  } catch (err) {
    console.error("Customer Fetch Error:", err);
    setCustomerError("Something went wrong while fetching data.");
    toast.error("Failed to fetch customer data");
  } finally {
    setCustomerLoading(false);
  }
};

useEffect(() => {
  const delay = setTimeout(() => {
    getCustomerList(1, searchcustomerTerm);
  }, 100);

  return () => clearTimeout(delay);
}, [searchcustomerTerm]);


 

  return (
    <>
      <div className="page-header">
        <h1>Customer Management</h1>
        <p className="page-paragraph"> Manage Customers and their details</p>
      </div>

      <div className="customers-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search customers by name..."
            value={searchcustomerTerm}
            onChange={(e) => setSearchcustomerTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <button
          
            className="add-customer-btn"m 
            onClick={() => {
              setOtpVerified(true);
              setCustomerForm(initialCustomerFormState);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="10" cy="7" r="4"/>
  <path d="M4 21v-2a6 6 0 0 1 12 0v2"/>
  <line x1="19" y1="8" x2="19" y2="14"/>
  <line x1="22" y1="11" x2="16" y2="11"/>
</svg>
            Add Customer
          </button>

          <button className="export-btn" onClick={handleDownload}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="7 10 12 15 17 10"/>
  <line x1="12" y1="15" x2="12" y2="3"/>
</svg>
            Export Details
          </button>
        </div>
      </div>

      <div className="customers-stats">
        <div className="stat-card">

          <h3>Total Customers</h3>
         <div className="stat-value">{totalCount}</div>

        </div>

        <div className="stat-card">

          <h3>New This Year</h3>

          <div className="stat-value">{thisYearCount}</div>
        </div>



        <div className="stat-card">

          <h3>New This Month</h3>
          <div className="stat-value">{thisMonthCount}</div>
        </div>
      </div>
      <div className="table-container">
        <table className="customers-table" ref={bulktableRef}>
          <thead>git fetch
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Phone Number</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Loading ? (
             <tr>
            <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
              <div className="circular-loader"></div>
            </td>
          </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : customerData?.length > 0 ? (
              customerData.map((customer) =>
              (
                <tr key={customer.id}>
   <td>
  <div className="customer-avatar-wrapper">
    {customer.profile_picture ? (
      <img
        src={customer.profile_picture}
        alt="profile"
        className="customer-avatar-img"
        onClick={() => {
          setImageCustomerPreview(customer.profile_picture);
          setImageCustomerModal(true);
        }}
      />
    ) : (
      <div className="customer-avatar">
        {getInitials(customer.first_name, customer.last_name)}
      </div>
    )}
  </div>
</td>


                  <td>{customer.first_name} </td>
                  <td>{customer.email}</td>
                   <td>{customer.gender}</td>
                  <td>{customer.verified_phone_number}</td>
                 
                

<td style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>

  <button
    className="action-menu-toggle"
    onClick={() =>
      setOpenMenuId(openMenuId ===customer.id ? null : customer.id)
    }
    style={{
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontSize: "20px",
    }}
  >
    <BsThreeDotsVertical />
  </button>



 
  {openMenuId === customer.id && (
    <div
      className="action-buttons-modal"
       
    >

        <button className="action-btn1" title=" View Customer Order " onClick={() => handleNavigate(customer.id)}>
                        
                        <span className="icon">  👁</span>
  <span>Detail page</span>
                      </button>
     
 <button
                        className="action-btn1"
                        title="Edit Customer Details"
                        onClick={() => {
                          setCustomerModalOpen(true)
                          setEditingCustomerId(customer.id)
                          setCustomerForm({
                            id: customer.id,
                            first_name: customer.first_name,
                            email: customer.email,
                            verified_phone_number: customer?.verified_phone_number,
                            gender:customer?.gender
                          })
                        }}
                      >
 <span className="icon">✏️</span>
  <span>Edit Detail</span>
      </button>

        <button
                        className="action-btn1"
                        title="Delete Customer"
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          setDeleteConfirmModal(true);
                        }}
                        >
  <span className="icon">🗑</span>
  <span>Delete</span>
      </button>

     

      
    </div>
  )}
</td>


                </tr>
              )
              )
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
    {totalPages > 1 && (
  <div className="pagination">

   
    <button
      onClick={() => getCustomerList(currentPage - 1, searchcustomerTerm)}
      disabled={!previousPage}
    >
      Prev
    </button>

   
    {pages.map((page) => (
      <button
        key={page}
        onClick={() => getCustomerList(page, searchcustomerTerm)}
        style={{
         
          fontWeight: currentPage === page ? "bold" : "normal",
          background: currentPage === page ? "#71a33f" : "#fff",
          color: currentPage === page ? "#fff" : "#71a33f",
        }}
      >
        {page}
      </button>
    ))}

    
    <button
      onClick={() => getCustomerList(currentPage + 1, searchcustomerTerm)}
      disabled={!nextPage}
    >
      Next
    </button>

  </div>
)}

      </div>

      {customermodalOpen && (
        <div className="modal">
          <form className="customer-form" onSubmit={handleCustomerFormSubmit}>
            <h3>{editingCustomerId ? "Edit Customer" : "Add Customer"}</h3>
             
             <label>Profile</label>
            <input

            name="profile_picture"
            type="file"
            placeholder="Upload your profile"
           
           onChange={handleCustomerFileChange}
            />


            <label htmlFor="first_name">First Name:</label>
            <input
              type="text"
              name="first_name"
              id="first_name"
              placeholder="Enter your first name"
              title="Only alphabets are allowed"
              value={CustomerForm.first_name}
              onChange={handleCustomerInputChange}

            />
            {formErrors.first_name && (
              <div style={{ color: "red", fontSize: "17px", marginTop: "4px" }}>{formErrors.first_name}</div>
            )}

          


            <label htmlFor="email">Email:</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={CustomerForm.email}
              onChange={handleCustomerInputChange}
            />
            {formErrors.email && (
              <div style={{ color: "red", fontSize: "17px", marginTop: "4px" }}>{formErrors.email}</div>
            )}

            <label htmlFor="gender">Gender</label>
           <select 
          
           name="gender"
           value={CustomerForm.gender}
            onChange={handleCustomerInputChange}
           >
              <option value="">Select Gender</option>
            <option value="male"> Male</option>
            <option value="female"> Female</option>
           </select>

            <label htmlFor="phone_number">Mobile Number:</label>
            <input
              type="text"
              name="verified_phone_number"
              readOnly={editingCustomerId ? true : false}
              maxLength={10}
              placeholder="Enter your phone number"
              value={CustomerForm.verified_phone_number}
              onChange={handleCustomerInputChange}
              
            />
            


            <div className="form-buttons">
              <button type="submit">Save</button>
              <button type="button" onClick={handleCloseCustomerModal}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {otpVerified && (
        <div className="modal">
          <form className="customer-form" onSubmit={handleCreateCustomer}>
            <h2>Enter your Phone Number</h2>

            <input
              type="text"
              name="verified_phone_number"
              placeholder="Enter your phone number"
              value={CustomerForm.verified_phone_number}
              onChange={handleCustomerInputChange}
              maxLength={10}
              inputMode="numeric"
            />
            {phoneFormErrors.verified_phone_number && (
              <div style={{ color: "red", fontSize: "17px", marginTop: "4px" }}>
                {phoneFormErrors.verified_phone_number}
              </div>
            )}

            <div className="form-buttons">
              <button type="submit">Create Customer</button>
              <button
                type="button"
                onClick={() => {
                  setOtpVerified(false)
                  setPhoneFormErrors({ verified_phone_number: "" })
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}


      {deleteConfirmModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this customer?</h3>
            <div className="form-buttons">
              <button className="otp-btn verify-btn"
                onClick={() => {
                  handleCustomerDelete(selectedCustomerId);
                  setDeleteConfirmModal(false);
                }}
              >
                Yes
              </button>
              <button onClick={() => setDeleteConfirmModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}



     
{
  ImageCustomerModal && (
     <div className="image-preview-overlay" onClick={() => setImageCustomerModal(false)}>
    <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
      <img src={ImageCustomerPreview} alt="Preview" />
      
    </div>
  </div>
  )
}


      <ToastContainer position="top-center" autoClose={1000} />
    </>
  )


}

export default Customers
