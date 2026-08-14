import * as XLSX from "xlsx";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"
import { toast } from 'react-toastify'
import BASE_URL from "../../../Base";
import { apiFetch } from "../../../fetchapi";
import { BsDownload, BsPlus, BsSearch, BsThreeDotsVertical } from "react-icons/bs";
import { FaCalendarAlt, FaChartLine, FaUsers } from "react-icons/fa";
import { FiUserPlus } from "react-icons/fi";
import { MdCalendarMonth } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import { FaCalendarCheck } from "react-icons/fa";



const userId = localStorage.getItem("USER_ID")

console.log("USER_ID", userId)

const initialCustomerFormState = {
  profile_picture: "",
  first_name: "",
  email: "",
  verified_phone_number: "",
  gender: "",
}

const initialFormErrors = {
  first_name: "",
  email: "",
  verified_phone_number: "",
  otp: "",
  gender: "",
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

  const [ImageCustomerModal, setImageCustomerModal] = useState(false);
  const [ImageCustomerPreview, setImageCustomerPreview] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pageSize);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const[CustomerstatusModal,setCustomerstautsModal]=useState(false);
  const[SelectedCustomer,setSelectedCustomer]=useState(null);
const[CustomerStatusModal,setCustomerStatusModal]=useState(false);
const[IsUpdating,setIsUpdating]=useState(false);
const [todayCount, setTodayCount] = useState(0);



  


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
 

  const handleNavigate = (id) => {
    navigate(`/CustomerDetailPage/${id}`)
  }


  

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


  const getInitials = (firstName = "", lastName = "") => {
    return (
      (firstName?.[0] || "").toUpperCase() +
      (lastName?.[0] || "").toUpperCase()
    );
  };


  const getCustomerList = async (page = 1,search = "") => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setCustomerLoading(true);

    try {
      const response = await fetch(
       `${BASE_URL}/customers/admin/customers/?page=${page}&search=${encodeURIComponent(search)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
             'ngrok-skip-browser-warning': 'true',
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
      setCustomerData(data.data.results || []);
      setTotalCount(data.data.count || 0);
      setNextPage(data.data.next);
      setPreviousPage(data.data.previous);
      setCurrentPage(page);
   setThisMonthCount(data.data.this_month_count || 0);
setThisYearCount(data.data.this_year_count || 0);
setTodayCount(data.data.today_count || 0);
    } catch (err) {
      console.error("Customer Fetch Error:", err);
      setCustomerError("Something went wrong while fetching data.");
      toast.error("Failed to fetch customer data");
    } finally {
      setCustomerLoading(false);
    }
  };

// useEffect(() => {
//   const delay = setTimeout(() => {
//     if (searchcustomerTerm.trim() === "") {
//       getCustomerList(1, "");
//       return;
//     }

//     if (searchcustomerTerm.trim().length >= 0) {
//       getCustomerList(1, searchcustomerTerm);
//     }
//   }, 500);

//   return () => clearTimeout(delay);
// }, [searchcustomerTerm]);

useEffect(() => {
  const delay = setTimeout(() => {
    getCustomerList(1, searchcustomerTerm.trim());
  }, 500);

  return () => clearTimeout(delay);
}, [searchcustomerTerm]);

  const handleToggle = async (id, currentStatus) => {
  
  const token = sessionStorage.getItem("superadmin_token");
  if(!token){
    toast.error("Session Expired,please login Again");
    navigate("/login");
    return;
  }
  if (IsUpdating) return;

  setIsUpdating(true);

  try {
    const response = await fetch(
     `${BASE_URL}/customers/admin/customers/?id=${id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
           "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      }
    );

    const data = await response.json();
    console.log(data);

    toast.success("Status updated successfully");

   getCustomerList();

setCustomerStatusModal(false);
setSelectedCustomer(null);
  } catch (error) {
    console.error(error);
    toast.error("Failed to update status");
  }
  finally {
    setIsUpdating(false);
  }
};



  return (
    <>
      <div className="page-header">
        <h1>Customer Management</h1>
        <p className="page-paragraph"> Manage Customers and their details</p>
      </div>


      <div className="stats2-grid">
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={16} />
          </div>
          <div className="stat2-info">
            <h3>Total Customers</h3>
            <div className="stat2-value">{totalCount.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
  <div
    className="stat2-icon"
    style={{ background: "#0D614E20", color: "#0D614E" }}
  >
    <FaCalendarCheck size={16} />
  </div>

  <div className="stat2-info">
    <h3>Today</h3>
    <div className="stat2-value">{todayCount.toLocaleString()}</div>
  </div>
</div>
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaChartLine size={16} />
          </div>
          <div className="stat2-info">
            <h3>This Year</h3>
            <div className="stat2-value">{thisYearCount.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaCalendarAlt size={16} />
          </div>
          <div className="stat2-info">
            <h3>This Month</h3>
            <div className="stat2-value">{thisMonthCount.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-wrapper">
          <BsSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchcustomerTerm}
            onChange={(e) => setSearchcustomerTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="action-buttons">
         
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table" ref={bulktableRef}>
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Gender</th>
              <th>Phone Number</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan="10"><div className="skeleton-row"></div></td>
                </tr>
              ))
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


                  <td>{customer.first_name||"N/A"} </td>
                  <td>{customer.email||"N/A"}</td>
                  <td>{customer.gender||"N/A"}</td>
                  <td>{customer.verified_phone_number||"N/A"}</td>
  <td>
          <label className="switch">
            <input
              type="checkbox"
              checked={customer.is_active}
            
             onChange={() => {
  setSelectedCustomer(customer);
  setCustomerStatusModal(true);
             }} 
            />
            <span className="slider round"></span>
          </label>
        </td>

                  <td style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>

                    <button
                      className="action-menu-toggle"
                      onClick={() =>
                        setOpenMenuId(openMenuId === customer.id ? null : customer.id)
                      }
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "20px",
                      }}
                    >
                   <span className="icon"> <BsThreeDotsVertical /></span>   
                    </button>




                    {openMenuId === customer.id && (
                      <div
                        className="action-buttons-modal"

                      >

                        <button className="action-btn1" title=" View Customer Order " onClick={() => handleNavigate(customer.id)}>

                          <span className="icon"> <FaEye/> </span>
                          <span>Detail page</span>
                        </button>

                        {/* <button
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
                              gender: customer?.gender
                            })
                          }}
                        >
                       <span className="icon">
  <FaEdit  />
</span>
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

                          <span className="icon-delete">< FiTrash2/></span>
                          <span className="delete-text" >Delete</span>
                        </button> */}




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
              onClick={() => getCustomerList(currentPage - 1)}
              disabled={!previousPage}
            >
              Prev
            </button>
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => getCustomerList(page)}
                style={{

                  fontWeight: currentPage === page ? "bold" : "normal",
                  background: currentPage === page ? "#0D614E" : "#fff",
                  color: currentPage === page ? "#fff" : "#0D614E",
                }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => getCustomerList(currentPage + 1)}
              disabled={!nextPage}
            >
              Next
            </button>

          </div>
        )}

      </div>

    


      {
        ImageCustomerModal && (
          <div className="image-preview-overlay" onClick={() => setImageCustomerModal(false)}>
            <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
              <img src={ImageCustomerPreview} alt="Preview" />

            </div>
          </div>
        )
      }

      {CustomerStatusModal && SelectedCustomer && (
   <div
    className="activeModal-overlay"
    onClick={() => {
      setCustomerStatusModal(false);
      setSelectedCustomer(null);
    }}
  >
    <div
      className="activeModal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="activeModal-close"
        onClick={() => {
          setCustomerStatusModal(false);
          setSelectedCustomer(null);
        }}
      >
        ×
      </button>

      <div className="activeModal-icon">
        ⚠️
      </div>

      <h2 className="activeModal-title">
        Confirm Status Change
      </h2>

      <p className="activeModal-text">
        Are you sure you want to
        <span
          className={
            SelectedCustomer.is_active
              ? "inactive-text"
              : "active-text"
          }
        >
          {SelectedCustomer.is_active
            ? " Inactive "
            : " Active "}
        </span>
        this Customer?
      </p>

      <div className="activeModal-card">
        <h4>{SelectedCustomer.first_name}</h4>
     
      </div>

      <div className="activeModal-footer">
        <button
          className="activeModal-cancel"
          onClick={() => {
            setCustomerModalOpen(false);
            setSelectedCustomer(null);
          }}
        >
          Cancel
        </button>

     <button
  disabled={IsUpdating}
  className={`activeModal-confirm ${
    SelectedCustomer.is_active
      ? "deactivate-btn"
      : "activate-btn"
  }`}
  onClick={() => {
    handleToggle(
      SelectedCustomer.id,
      SelectedCustomer.is_active
    );
  }}
>
  {IsUpdating
    ? "Updating..."
    : `Yes, ${
        SelectedCustomer.is_active
          ? "Deactivate"
          : "Activate"
      }`}
</button>
      </div>

    </div>
  </div>
)}


      </>
  )


}

export default Customers
