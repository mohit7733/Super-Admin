import * as XLSX from "xlsx";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const userId = localStorage.getItem("USER_ID")

console.log("USER_ID", userId)

const initialCustomerFormState = {
  // user: userId,
  first_name: "",
  email: "",
  verified_phone_number: "",
}

const initialFormErrors = {
  first_name: "",
  email: "",
  verified_phone_number: "",
  otp: "",
}



const Customers = () => {
  const [searchcustomerTerm, setSearchcustomerTerm] = useState("")
  const [customerData, setCustomerData] = useState([])
  const [error, setCustomerError] = useState(null)
  const [Loading, setCustomerLoading] = useState(true)

  const [CustomerForm, setCustomerForm] = useState(initialCustomerFormState)
  const [editingCustomerId, setEditingCustomerId] = useState(null)
  const [customermodalOpen, setCustomerModalOpen] = useState(false)
  const [customerotpModal, setCustomerOtpModal] = useState(false)
  // const [OTP, setOtp] = useState("")
  const [ISUserID, setISUserID] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const navigate = useNavigate()
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""])
  const otpRefs = useRef([])

  const [formErrors, setFormErrors] = useState(initialFormErrors)
  const [phoneFormErrors, setPhoneFormErrors] = useState({ verified_phone_number: "" })
  const [otpFormErrors, setOtpFormErrors] = useState({ otp: "" })
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const bulktableRef = useRef(null);
  const fetchedOnce = useRef(false);
  const [userId, setUserId] = useState(null);
    




  const validateCustomerForm = () => {
    const errors = {};

    if (!CustomerForm.first_name.trim()) {
      errors.first_name = "First name is required";
    } else if (!/^[a-zA-Z\s]+$/.test(CustomerForm.first_name)) {
      errors.first_name = "First name should contain only letters and spaces";
    }

    if (!CustomerForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CustomerForm.email)) {
      errors.email = "Please enter a valid email address";
    }


    console.log("Validation Errors:", errors);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePhoneForm = () => {
    const errors = {}

    if (!CustomerForm.verified_phone_number.trim()) {
      errors.verified_phone_number = "Phone number is required"
    } else if (!/^\d{10}$/.test(CustomerForm.verified_phone_number)) {
      errors.verified_phone_number = "Phone number must be 10 digits"
    }

    setPhoneFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateOtpForm = () => {
    const errors = {}
    const otpValue = getOtpValue()

    if (!otpValue || otpValue.length !== 4) {
      errors.otp = "Please enter complete 4-digit OTP"
    } else if (!/^\d{4}$/.test(otpValue)) {
      errors.otp = "OTP should contain only numbers"
    }

    setOtpFormErrors(errors)
    return Object.keys(errors).length === 0
  }



  const handleCloseCustomerModal = () => {
    setCustomerModalOpen(false)
    setEditingCustomerId(null)
    setCustomerForm(initialCustomerFormState)
    setFormErrors(initialFormErrors)
  }
  const handleDownload = () => {

    const exportData = customerData.map((c) => ({
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
    navigate(`/Orderlist/${id}`)
  }

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/, "")
    if (!value) return

    const newOtpDigits = [...otpDigits]
    newOtpDigits[index] = value
    setOtpDigits(newOtpDigits)

    if (otpFormErrors.otp) {
      setOtpFormErrors({ otp: "" })
    }

    if (index < 3 && value) {
      otpRefs.current[index + 1].focus()
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newOtpDigits = [...otpDigits]

      if (otpDigits[index]) {
        newOtpDigits[index] = ""
        setOtpDigits(newOtpDigits)
      } else if (index > 0) {
        otpRefs.current[index - 1].focus()
        newOtpDigits[index - 1] = ""
        setOtpDigits(newOtpDigits)
      }
    }
  }

  const getOtpValue = () => otpDigits.join("")

  const send_otp = async (e) => {
    e.preventDefault()

    if (!validatePhoneForm()) {
      return
    }

    console.log("mobilenumber", `+91${CustomerForm.verified_phone_number}`)

    try {
      const response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/user/send-otp/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: `+91${CustomerForm.verified_phone_number}`,
        }),
      })

      console.log("server response", response)
      const data = await response.json()

      if (response.ok) {
        setOtpVerified(false)

        const Is_user = data.is_new_user
        setISUserID(Is_user)
        //         toast.success("OTP sent successfully", {
        //   position: "top-center",
        //   autoClose: 2000,
        //   onClose: () => {
        //     setCustomerOtpModal(true)
        //   },
        // })
        setCustomerOtpModal(true);


        toast.success("OTP sent successfully", {
          position: "top-center",
          autoClose: 2000,
        });

 console.log("sentotp", response)

      }
     
      
      else {
        toast.error(" Invalid phone number", {
          position: "top-center",
          autoClose: 2000,
        })
        setOtpVerified(true)
      }
    } catch (err) {
      toast.error("Failed to send OTP, please try again", {
        position: "top-center",
      })
    }
  }
 

  const handleCustomerDelete = async (id) => {
    console.log("idddddd", id)

    try {
      const response = await fetch(`https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/customer/${id}/`, {
        method: "DELETE",
      })

      console.log("response", response)

      if (response.ok) {
        toast.success(" Customer deleted successfully", {
          position: "top-center",
          autoClose: 2000,
        })
        setCustomerData(customerData.filter((c) => c.id !== id))
      } else {
        toast.error(" Failed to delete customer", {
          position: "top-center",
          autoClose: 2000,
        })
      }
    } catch {
      toast.error(" Failed to delete customer", {
        position: "top-center",
        autoClose: 2000,
      })
    }
  }

  const newThisYearCount = customerData.filter((customer) => {
    if (!customer.created_at) return false
    const createdDate = new Date(customer.created_at)
    const now = new Date()
    return createdDate.getFullYear() === now.getFullYear()
  }).length

  const handleCustomerFormSubmit = async (e) => {
    console.log("aaaa", CustomerForm.verified_phone_number)
    e.preventDefault()


    if (!validateCustomerForm()) {
      return
    }

    console.log("editnfcustomeidd", editingCustomerId)

    const method = editingCustomerId ? "PUT" : "POST"
    const url = editingCustomerId
      ? `https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/customer/${editingCustomerId}/`
      : "https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/customer/"

    console.log("method", method, url, userId)

    const formData = new FormData()
   if (method === "POST") {
   
    const uid = userId || localStorage.getItem("USER_ID");
    if (uid) formData.append("user", uid);
  }

    Object.entries(CustomerForm).forEach(([key, value]) => {
      formData.append(key, value)
    })

    console.log("urlll--->", url, method, formData)

    try {
      const response = await fetch(url, {
        method,
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        if (method === "POST") {
          setCustomerData((prev) => [...prev, data])
          toast.success(" Customer added successfully", {
            position: "top-center",
            autoClose: 2000,
          })
        } else {
          setCustomerData((prev) =>
            prev.map((cust) => (cust.id === editingCustomerId ? { ...cust, ...CustomerForm } : cust)),
          )
          toast.success(" Customer updated successfully", {
            position: "top-center",
            autoClose: 2000,
          })
        }

        handleCloseCustomerModal()
        getCustomerList()
      } else {
        toast.error(" Failed to save customer", {
          position: "top-center",
          autoClose: 2000,
        })
      }
    } catch (err) {
      console.error(err)
      toast.error(" Failed to save customer", {
        position: "top-center",
        autoClose: 2000,
      })
    }
  }
  const resendOtp = async () => {
    if (!validatePhoneForm()) {
      return;
    }

    try {
      const response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/user/send-otp/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: `+91${CustomerForm.verified_phone_number}`,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("OTP resent successfully", {
          position: "top-center",
          autoClose: 2000,
        });
      } else {
        toast.error("Failed to resend OTP", {
          position: "top-center",
          autoClose: 2000,
        });
      }
    } catch (err) {
      toast.error("Error resending OTP", {
        position: "top-center",
      });
    }
  };


  // const handleOtpSubmit = async (e) => {
  //   e.preventDefault()

  //   if (!validateOtpForm()) {
  //     return
  //   }

  //   try {
  //     let response

  //     const OTPValue = getOtpValue()
  //     console.log("Final OTP", OTPValue)

  //     const payload = {
  //       phone_number: `+91${CustomerForm.verified_phone_number}`,
  //       otp: OTPValue,
  //     }

  //     console.log("paloadd", payload);

  //     if (ISUserID) {
  //       response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/user/register/", {
  //         method: "POST",
  //         headers: {
  //           Accept: "application/json",
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(payload),
  //       })
  //     } else {
  //       response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/user/customerlogin/", {
  //         method: "POST",
  //         headers: {
  //           Accept: "application/json",
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(payload),
  //       })
  //     }

  //     const data = await response.json()
  //     console.log("serverreposne1111", response)
  //     console.log("dataaresposne", data)

  //     if (ISUserID) {
  //       localStorage.setItem("USER_ID", data.user_id)
  //     }

  //     if (response.ok) {



  //       if (data.is_new_customer===true|| data?.is_customer===true) {
  //         toast.info(" Customer already exists with this number", {
  //           position: "top-center",
  //           autoClose: 3000,
  //         })
  //         setCustomerOtpModal(false)
  //         setCustomerForm(initialCustomerFormState)
  //         setOtpDigits(["", "", "", ""])
  //       } else {
  //         toast.success(" OTP verified! Please complete registration", {
  //           position: "top-center",
  //           autoClose: 2000,
  //         })
  //         setOtpVerified(false)
  //         setCustomerModalOpen(true)
  //         setCustomerOtpModal(false)
  //         setOtpDigits(["", "", "", ""])
  //       }
  //     } else {
  //       toast.error(" Invalid or expired OTP!", {
  //         position: "top-center",
  //         autoClose: 3000,
  //       })
  //     }
  //   } catch (err) {
  //     console.error("OTP verification failed", err)
  //     toast.error(" Failed to verify OTP. Please try again", {
  //       position: "top-center",
  //       autoClose: 2000,
  //     })
  //   }
  // }



  const handleOtpSubmit = async (e) => {
  e.preventDefault();

  if (!validateOtpForm()) return;

  try {
    const OTPValue = getOtpValue();
    console.log("Final OTP", OTPValue);

    const payload = {
      phone_number: `+91${CustomerForm.verified_phone_number}`,
      otp: OTPValue,
    };

    let response;
    if (ISUserID) {
   
      response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/user/register/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } else {
     
      response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/user/customerlogin/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }

    const data = await response.json();
    console.log("server response", response);
    console.log("data response", data);

    if (response.ok) {
      // if (ISUserID) {
      //   localStorage.setItem("USER_ID", data.user_id);
      // }

      if (ISUserID) {
    
        if (data.is_customer === true) {
          toast.info("Customer already exists with this number");
            setCustomerOtpModal(false)
          setCustomerForm(initialCustomerFormState)
          setOtpDigits(["", "", "", ""])
          
        } else {
          toast.success("OTP verified! Please complete registration");
            setUserId(data.user_id);
             setOtpVerified(false)
          setCustomerModalOpen(true)
          setCustomerOtpModal(false)
          setOtpDigits(["", "", "", ""])
        }
      } else {
     
        if (data.is_new_customer === false) {
          toast.info("Customer already exists, logged in successfully");
         setCustomerOtpModal(false)
          setCustomerForm(initialCustomerFormState)
          setOtpDigits(["", "", "", ""])
        } else {
          toast.success("Customer login successfully");
          localStorage.setItem("USER_ID", data.user_id);
           setOtpVerified(false)
          setCustomerModalOpen(true)
          setCustomerOtpModal(false)
          setOtpDigits(["", "", "", ""])
        }
      }
    } else {
      toast.error(data.message || "Invalid or expired OTP");
    }
  } catch (err) {
    console.error("OTP verification failed", err);
    toast.error("Failed to verify OTP. Please try again");
  }
};


// const resetCustomerOtpFlow = () => {
//   setCustomerOtpModal(false);
//   setCustomerForm(initialCustomerFormState);
//   setOtpDigits(["", "", "", ""]);
// };


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

    // setCustomerForm((prev) => ({
    //   ...prev,
    //   [name]: value,
    // }))

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


  const getCustomerList = async () => {
    try {
      const response = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/customer/", {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      const sortedData = data.data


      setCustomerData(sortedData)

      console.log("customerrdatta---->", sortedData)
    } catch (err) {
      console.error(err.message)
      setCustomerError("Something went wrong while fetching data.")
      // toast.error(" Failed to fetch customer data", {
      //   position: "top-center",
      //   autoClose: 2000,
      // })
    } finally {
      setCustomerLoading(false)
    }
  }

  useEffect(() => {
    if (!fetchedOnce.current) {
      getCustomerList();
      fetchedOnce.current = true; // mark as fetched
    }
  }, []);


  // const filteredCustomers = customerData?.filter(
  //   (customer) =>
  //     customer?.first_name === null ||
  //     customer?.first_name?.toLowerCase().includes(searchcustomerTerm.toLowerCase())
  // ).sort((a, b) => a.first_name.localeCompare(b.first_name))

  // console.log('customerData-',customerData)
  const filteredCustomers = [...customerData] // copy first
    .filter((customer) =>
      !customer?.first_name ||
      customer?.first_name?.toLowerCase().includes(searchcustomerTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!a.first_name) return 1;
      if (!b.first_name) return -1;
      return a.first_name.localeCompare(b.first_name);
    });




  const newThisMonthCount = customerData.filter((customer) => {
    if (!customer.created_at) return false
    const createdDate = new Date(customer.created_at)
    const now = new Date()
    return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
  }).length

  return (
    <>
      <div className="page-header">
        <h1>Customers</h1>
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


          {/* <button className="add-customer-btn" onClick={() => setOtpVerified(true)}>
            + Add Customer
          </button> */}

          {/* <button className="export-btn" onClick={() => exportToCSV(filteredCustomers)}>
            Export Details
          </button> */}

          <button
            className="add-customer-btn"
            onClick={() => {
              setOtpVerified(true);
              setCustomerForm(initialCustomerFormState);
            }}
          >
            + Add Customer
          </button>

          <button className="export-btn" onClick={handleDownload}>
            Export Details
          </button>
        </div>
      </div>

      <div className="customers-stats">
        <div className="stat-card">

          <h3>Total Customers</h3>
          <div className="stat-value">{customerData.length}</div>
        </div>

        <div className="stat-card">

          <h3>New This Year</h3>
          <div className="stat-value">{newThisYearCount}</div>
        </div>



        <div className="stat-card">

          <h3>New This Month</h3>
          <div className="stat-value">{newThisMonthCount}</div>
        </div>
      </div>
      <div className="table-container">
        <table className="customers-table" ref={bulktableRef}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Loading ? (
              <tr>
                <td colSpan="6">Loading customer data...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="6" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) =>
              (
                <tr key={customer.id}>
                  <td>{customer.first_name} </td>
                  <td>{customer.email}</td>
                  <td>{customer.verified_phone_number}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" title=" View Customer Order " onClick={() => handleNavigate(customer.id)}>
                        👁
                      </button>
                      <button
                        className="action-btn edit"
                        title="Edit Customer Details"
                        onClick={() => {
                          setCustomerModalOpen(true)
                          setEditingCustomerId(customer.id)
                          setCustomerForm({
                            id: customer.id,
                            first_name: customer.first_name,
                            email: customer.email,
                            verified_phone_number: customer?.verified_phone_number,
                          })
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete"
                        title="Delete Customer"
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          setDeleteConfirmModal(true);
                        }}
                      >
                        🗑
                      </button>

                    </div>
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
      </div>

      {customermodalOpen && (
        <div className="modal">
          <form className="customer-form" onSubmit={handleCustomerFormSubmit}>
            <h3>{editingCustomerId ? "Edit Customer" : "Add Customer"}</h3>

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

            <label htmlFor="phone_number">Mobile Number:</label>
            <input
              type="text"
              name="verified_phone_number"
              readOnly={editingCustomerId ? true : false}
              maxLength={10}
              placeholder="Enter your phone number"
              value={CustomerForm.verified_phone_number}
              onChange={handleCustomerInputChange}
              required
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
          <form className="customer-form" onSubmit={send_otp}>
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
              <button type="submit">Send OTP</button>
              <button
                type="button"
                onClick={() => {
                  setOtpVerified(false)
                  setCustomerForm(initialCustomerFormState)
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






      {customerotpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal">
            <form onSubmit={handleOtpSubmit} className="otp-form">
              <h2 className="otp-title">Enter Your OTP</h2>

              <div className="otp-input-group">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    inputMode="numeric"
                    className="otp-input"
                    autoComplete="off"
                    value={digit}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    ref={(el) => (otpRefs.current[index] = el)}
                  />
                ))}
              </div>
              {otpFormErrors.otp && (
                <div style={{ color: "red", fontSize: "17px", marginTop: "-13px", textAlign: "center", marginBottom: "7px" }}>
                  {otpFormErrors.otp}
                </div>
              )}

              <div className="otp-button-group">
                <button type="button" className="otp-btn resend-btn" onClick={resendOtp}>Resend OTP</button>
                <button type="submit" className="otp-btn verify-btn">
                  Verify
                </button>
                <button
                  className="otp-btn resend-btn"
                  type="button"
                  onClick={() => {
                    setCustomerOtpModal(false)
                    setOtpDigits(["", "", "", ""])
                    setOtpFormErrors({ otp: "" })
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={1000} />
    </>
  )


}

export default Customers
