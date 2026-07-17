import React, { useState, useEffect, useRef } from "react";
import BASE_URL from "../../../Base";
import { useNavigate } from "react-router-dom";
import { BiPlus } from "react-icons/bi";

import { toast } from 'react-toastify'
import { BsSearch } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import { FiShield } from "react-icons/fi";
import {
  FaUsers,
  FaUserCheck,
  FaUserTimes,
} from "react-icons/fa";
const initalAdminform = {
  phone_number: '',
  role: '',
  password: '',
  approval_status:'',
}
const Admin = () => {

  const [loading, setLoading] = useState(true);
  const [Error, setError] = useState("");
  const [verifiersearch, setVerifiersearch] = useState("");
  const [AdminData, setAdminData] = useState([]);
  const [DeleteModal, setDeleteModal] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedVerifier, setSelectedVerifier] = useState(null);
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [AddAdminModal, setAdminModal] = useState(false);
  const [AddAdminForm, setAddAdminForm] = useState(initalAdminform)
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [actionType, setActionType] = useState("");
  const [AddError, setAddError] = useState({});
  const [EditError, setEditError] = useState({});
  const [roleData, setRoleData] = useState([]);
  const [AddNewRoleModal,setAddNewRoleModal]=useState(false);
  const[NewRole,setNewRole]=useState();
  const [addAdminLoading, setAddAdminLoading] = useState(false);
const [addRoleLoading, setAddRoleLoading] = useState(false);
const[SaveStatusLoading,setSaveStatusLoading]=useState(false);
const [editPermissionSearch, setEditPermissionSearch] = useState("");
const [showPermissionModal, setShowPermissionModal] = useState(false);

const [showPassword, setShowPassword] = useState(false);

  const fetchedOnce = useRef(false);
  const navigate = useNavigate();
 
const generateCode = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_");
};
 
  const Status = {
    APPROVED: "Approved",
    REJECTED: "Rejected",
    PENDING: "Pending",
    REJECTED: "Rejected",
    SUSPENDED: "Suspended"
  }
  const getAdminlist = async () => {
    const token = sessionStorage.getItem("superadmin_token");
      if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/user/superadmin/admins/`, {
        method: 'GET',
        headers: {
          Accept: "application/json",
            'ngrok-skip-browser-warning': 'true',
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,

        }
      });

       if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }
      const data = await response.json();
      console.log("API Response:", data);
      setAdminData(data.data)
    }
    catch (err) {
      console.error(err.message)
      setError("Something went wrong while fetching data.")
      toast.error("Failed to fetch Admin Data")

    }
    finally {
      setLoading(false)
    }
  }


  const filteredAdmins = AdminData.filter((admin) => {
  
  let phone = (admin.phone_number || "").replace(/\D/g, "");

 
  if (phone.length === 12 && phone.startsWith("91")) {
    phone = phone.slice(2);
  }

  const search = verifiersearch.replace(/\D/g, "");

  if (!search) return true;

  return phone.includes(search);
});

  
 



  const handleinputchange = (e) => {
    const { name, value } = e.target;
    setAddAdminForm(prev => ({
      ...prev,
      [name]: value,
    }));
    setAddError(prev => ({
      ...prev,
      [name]: ""
    }));
  };



   const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    let errors = {};

    if (!AddAdminForm.phone_number.trim()) {
     errors.phone_number = " please Enter Valid Phone Number"
    } else if (!/[0-9]{10}$/.test(AddAdminForm.phone_number)) {
     errors.phone_number = "Phone Number Must be Exactly10 digits"
   }

    const password = AddAdminForm.password;
    if (!password.trim()) {
      errors.password = "please Enter a Password";

     } else if (password.length < 12) {
       errors.password = "password must be at least 12 characters"
  } else if (!/[0-9]/.test(password)) {
     errors.password = "passwordmust contain at least one number"
     } else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
     errors.password = "password must contain atleast one special character"
   } else if (!/[A-Za-z]/.test(password)) {
       errors.password = "Password must contain at least one letter";
  }

    if (!AddAdminForm.role.trim()) {
       errors.role = "please select any role"
     }

   if (Object.keys(errors).length > 0) {
      setAddError(errors);
       return;
    }

    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }
     if (addAdminLoading) return;

  setAddAdminLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/user/admin/register/`, {
       method: "POST",
       headers: {
        "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
             'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify(AddAdminForm),
      });
 if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

  
     const data = await response.json();
         if (!response.ok || data.success === false) {
  toast.error(
    data?.error?.details?.non_field_errors ||
    data?.error?.message ||
    "Failed to create admin"
  );
  return;
}
     toast.success("Admin created successfully ");
     setAddAdminForm(initalAdminform);
      setAdminModal(false);
     getAdminlist();
   } catch (err) {
     toast.error("Failed to create admin");
   }
   finally{
    setAddAdminLoading(false);
   }
  };


 
  const getRole = async () => {
  const token = sessionStorage.getItem("superadmin_token");
  if(!token){
    toast.error("Session Expired,Please Login Again");
    navigate("/login");
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/user/admin/roles/`,
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

    console.log("Role Response:", data);

    setRoleData(data.data);
  } catch (err) {
    console.error(err.message);
    setError("Something went wrong while fetching roles.");
  } 
};

useEffect(() => {
    if (!fetchedOnce.current) {
      getAdminlist();
      getRole();
      
      fetchedOnce.current = true;
    }
  }, []);



 




const handleEditClick = (verifier) => {
  setEditingUser(verifier);
  setPermissionModalOpen(true);
  
};

 const handleSavePermissions = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session Expired. Please Login Again");
    return;
  }

  if (!editingUser) {
    toast.error("No user selected");
    return;
  }

  // Suspended ke liye save button se call mat karo
  if (editingUser.admin_approval_status === "SUSPENDED") {
    setSelectedVerifier(editingUser);
    setActionType("SUSPENDED");
    setPermissionModalOpen(false);
    setRejectModalOpen(true);
    return;
  }

  try {
   
setSaveStatusLoading(true);
    const response = await fetch(
      `${BASE_URL}/user/admin/${editingUser.id}/review-status/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          status: editingUser.admin_approval_status,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to update status");
      return;
    }

    toast.success("Status Updated Successfully");
    setPermissionModalOpen(false);
    getAdminlist();
  } catch (err) {
    toast.error("Failed to update status");
  } 
  finally{
    setSaveStatusLoading(false);
  }
};

const updateStatus = async (id, status, reason = "") => {
  const token = sessionStorage.getItem("superadmin_token");

  try {
    const response = await fetch(
      `${BASE_URL}/user/admin/${id}/review-status/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          status: status,
          reason: reason,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      toast.error(data.message || "Failed to update status");
      return;
    }

    toast.success("Status Updated Successfully");
    getAdminlist();
  } catch (err) {
    toast.error("Failed to update status");
  }
  
};


  


 const handleDeleteAdmin = async () => {
  const token = sessionStorage.getItem("superadmin_token");
  if(!token){
    toast.error("Session Expired,Please ");
    navigate("/login");
    return;
  }

  if (!selectedAdmin) return;

  try {
    const response = await fetch(
      `${BASE_URL}/user/superadmin/admin/?admin_id=${selectedAdmin.id}`,
      {
        method: "DELETE",
        headers: {
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
    

    toast.success("Admin deleted successfully 🗑️");

    setDeleteModal(false);
    setSelectedAdmin(null);

    getAdminlist();
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete admin");
  }
};

const totalAdmins = AdminData.length;

const approvedAdmins = AdminData.filter(
  (item) => item.admin_approval_status === "APPROVED"
).length;

const pendingAdmins = AdminData.filter(
  (item) => item.admin_approval_status === "PENDING"
).length;



  return (
    <>
      <div className="page-header">
        <h1>Team Management</h1>
        <p className="page-paragraph"> Manage Admin ,Given Permission and their details & Approvals</p>

      </div>
      <div className="stats2-grid">
  <div
    className="stat2-card"
    style={{ borderTopColor: "#0D614E" }}
  >
    <div
      className="stat2-icon"
      style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaUsers size={24} />
    </div>
    <div className="stat2-info">
      <h3>Total Admin</h3>
  <div className="stat2-value">{totalAdmins}</div>
    </div>
  </div>

  <div
    className="stat2-card"
    style={{ borderTopColor: "#0D614E" }}
  >
    <div
      className="stat2-icon"
      style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaUserCheck size={24} />
    </div>
    <div className="stat2-info">
      <h3>Approve  Admin</h3>
    <div className="stat2-value">{approvedAdmins}</div>
    </div>
  </div>

  <div
    className="stat2-card"
    style={{ borderTopColor: "#0D614E" }}
  >
    <div
      className="stat2-icon"
      style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaUserTimes size={24} />
    </div>
    <div className="stat2-info">
      <h3>Pending Admin</h3>
<div className="stat2-value">{pendingAdmins}</div>
    </div>
  </div>
</div>

      <div className="filter-category">
  <div className="filter-controls">
    <div className="search-wrapper">
      <BsSearch className="search-icon" />
      <input
        type="text"
        placeholder="Search Admin by their phone number"
        value={verifiersearch}
        onChange={(e) => setVerifiersearch(e.target.value)}
        className="search-input"
      />
    </div>
  </div>

  <button
    className="add-customer-btn"
    onClick={() => {
      setAddAdminForm(initalAdminform);
      setAdminModal(true);
    }}
  >
    <BiPlus />
    Add Admin
  </button>
</div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Id</th>
            <th> Role</th>
            <th>Mobile Number</th>
            <th> Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <tr key={i}>
                <td colSpan="10"><div className="skeleton-row"></div></td>
              </tr>
            ))
          ) : Error ? (
            <tr>
              <td colSpan="5" style={{ color: "red", textAlign: "center" }}>
                {Error}
              </td>
            </tr>
          ) : filteredAdmins?.length > 0 ? (
            filteredAdmins.map((verifier, index) => (
              <tr key={verifier.id}>
                <td>{index + 1}</td>
            <td>{verifier.role?.name || "-"}</td>
                <td>{verifier?.phone_number}</td>

             <td>
  {Status[verifier.admin_approval_status]}
</td>
                <td>
                  <div className="action-buttons">


                  
  <button className="action-btn edit" onClick={() => handleEditClick(verifier)}>
    <FaEdit/>
</button>

                    <button
                      className="action-btn delete"
                      onClick={() => {
                        setSelectedAdmin(verifier);
                        setDeleteModal(true);
                      }}
                    >
                    <span className="icon-delete"> <FiTrash2/></span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>





       {rejectModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{actionType === "REJECTED" ? " Enter Rejected Reason " : " Entr Suspended Reason"}</h3>
            <textarea
              placeholder={
                actionType === "SUSPENDED"
                  ? "Enter reason for suspension"
                  : "Enter reason for rejection"
              }
              name="reason"
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="form-buttons">
              <button type="submit"
                onClick={() => {
                  if (!rejectReason) {
                    toast.error("Please enter a reason");
                    return;

                  }
              updateStatus(
  selectedVerifier.id,
  actionType,
  rejectReason
);
                  setRejectModalOpen(false);
                  setRejectReason("");
                }}

              >
                Submit
              </button>

              <button onClick={() => setRejectModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )} 


  {permissionModalOpen && (
  <div className="prakriti-modal-overlay">
    <div className="prakriti-modal role-modal">

      <div className="prakriti-modal-header">
        <h2>Edit  Status</h2>

        <button
          className="modal-close-btn"
          onClick={() => {
            setPermissionModalOpen(false);
            setEditPermissionSearch("");
          }}
        >
          <FaTimes />
        </button>
      </div>

      <div className="prakriti-form">

  

       

      
        <div className="form-group">
          <label>Status</label>

          <select
            className="status-select"
            value={editingUser?.admin_approval_status || "PENDING"}
          onChange={(e) => {
  const newStatus = e.target.value;

  setEditingUser((prev) => ({
    ...prev,
    admin_approval_status: newStatus,
  }));

  if (newStatus === "SUSPENDED") {
    setSelectedVerifier({
      ...editingUser,
      admin_approval_status: newStatus,
    });
    setActionType("SUSPENDED");
    setPermissionModalOpen(false);
    setRejectModalOpen(true);
  }
}}
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            {/* <option value="REJECTED">Rejected</option> */}
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        {/* Footer */}

        <div className="modal-footer">

          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setPermissionModalOpen(false);
              setEditPermissionSearch("");
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            className="save-btn"
            disabled={loading}
            onClick={SaveStatusLoading}
          >
            <FiShield />

            {SaveStatusLoading
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </div>

    </div>
  </div>
)}
      {AddAdminModal && (
        <div className="modal">



          <form className="customer-form" onSubmit={handleAddAdminSubmit}>
            <h3>Add New Admin</h3>
            <label>Phone Number</label>
            <input
              type="text"
              name="phone_number"
              placeholder="Enter the 10 digit number"
              value={AddAdminForm.phone_number}
              onChange={handleinputchange}
              maxLength="10"
            />
            {AddError.phone_number && <p className="error">{AddError.phone_number}</p>}
              <label>password</label>
         <div className="password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Enter your password"
    value={AddAdminForm.password}
    onChange={handleinputchange}
  />

  <span
    className="password-toggle"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
  
  {AddError.password && <p className="error">{AddError.password}</p>}  
          
</div>
            <label>Role</label>
        <div className="role-select-wrapper">
  <select
    name="role"
    value={AddAdminForm.role}
    onChange={handleinputchange}
  >
    <option value="">Select Role</option>

    {roleData?.map((role) => (
      <option key={role.id} value={role.id}>
        {role.name}
      </option>
    ))}
  </select>

  <button
  type="button"
  className="add-role-btn"
  onClick={() => navigate("/admin/role")}
>
  + Add Role
</button>

</div>
            {AddError.role && <p className="error">{AddError.role}</p>}


                     
      <label>Status</label>
<select
  name="approval_status"
  value={AddAdminForm.approval_status}
  onChange={handleinputchange}
>
  <option value="">Select Status</option>
  <option value="pending">Pending</option>
  <option value="approved">Approved</option>
</select>

            <div className="form-buttons">
         <button
  type="submit"
  disabled={addAdminLoading}
>
  {addAdminLoading ? "Adding..." : "Add Admin"}
</button>
              <button type="button" onClick={() => {
                setAdminModal(false);
                setAddAdminForm(initalAdminform);
                setAddError({})
              }}>

                Cancel

              </button>

            </div>
          </form>

        </div>
      )}

  




      {DeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this admin?</h3>
            <div className="form-buttons">
              <button
                className="otp-btn verify-btn"
                onClick={handleDeleteAdmin}
              >
                Yes
              </button>
              <button onClick={() => setDeleteModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
</>
  );
};


export default Admin;