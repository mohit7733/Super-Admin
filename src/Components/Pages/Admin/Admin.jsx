import React, { useState, useEffect, useRef } from "react";
import BASE_URL from "../../../Base";

import { ToastContainer, toast } from "react-toastify"
import { BsSearch } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
const initalAdminform = {
  phone_number: '',
  admin_role: '',
  password: '',


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


  const fetchedOnce = useRef(false);
  const filteredVerifiers = AdminData.filter(v =>
    v.phone_number?.toLowerCase().includes(verifiersearch.toLowerCase())
  );


  const role = {
    SUPERADMIN: "Super Admin",
    ADMIN: "Admin",
    FOLLOWUP: "Followup",
    VERIFIER: "Verifier"
  }

  const Status = {
    APPROVED: "Approved",
    REJECTED: "Rejected",
    PENDING: "Pending",
    REJECTED: "Rejected",
    SUSPENDED: "Suspended"
  }
  const getAdminlist = async () => {
    const token = sessionStorage.getItem("superadmin_token");
    try {
      const response = await fetch(`${BASE_URL}/user/admin-approval/`, {
        method: 'GET',
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,

        }
      });
      const data = await response.json();
      console.log("API Response:", data);
      setAdminData(data)
    }
    catch (err) {
      console.error(err.message)
      setError("Something went wrong while fetching data.")
      toast.error("Failed to fetch Doctor Data")

    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!fetchedOnce.current) {
      getAdminlist();
      fetchedOnce.current = true;
    }
  }, []);



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

    if (!AddAdminForm.admin_role.trim()) {
      errors.admin_role = "please select any role"
    }

    if (Object.keys(errors).length > 0) {
      setAddError(errors);
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");

    try {
      const res = await fetch(`${BASE_URL}/user/admin-register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(AddAdminForm),
      });

      const data = await res.json();
      toast.success("Admin created successfully 🎉");
      setAddAdminForm(initalAdminform);
      setAdminModal(false);
      getAdminlist();
    } catch (err) {
      toast.error("Failed to create admin");
    }
  };


  const getAllPermissions = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    try {
      const res = await fetch(`${BASE_URL}/user/permissions_list/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("Permissions List API Response 👉", data);
      setAllPermissions(data.permissions);

    } catch (err) {
      toast.error("Failed to load permissions");
    }
  };



  const updateStatus = async (id, status, reason = "") => {
    const token = sessionStorage.getItem("superadmin_token");
    try {
      const response = await fetch(`${BASE_URL}/user/super-admin/pending-requests/`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: id,
          action: status,
          reason: reason,
        })
      });
      const data = await response.json();
      toast.success("Status Updated");
      getAdminlist();
    }
    catch (err) {
      toast.error("Failed to update status");

    }
  }




  const handleEditClick = (verifier) => {

    setEditingUser(verifier);
    setSelectedPermissions(
      verifier.permissions?.map((perm) => perm.uid) || []
    );

    setPermissionModalOpen(true);
  };


  const handleSavePermissions = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!editingUser) {
      toast.error("No user selected");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/user/super-admin/pending-requests/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: editingUser.id,
          action: editingUser.admin_approval_status,
          permission_ids: selectedPermissions,

        }),
      });

      const data = await res.json();

      toast.success("Permissions & Status Updated Successfully 🎉");
      setPermissionModalOpen(false);
      getAdminlist();

    } catch (err) {
      console.error(err);
      toast.error("Failed to update permissions");
    }
  };




  useEffect(() => {

    getAllPermissions();

  }, []);


  const handleDeleteAdmin = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!selectedAdmin) return;

    try {
      const res = await fetch(
        `${BASE_URL}/user/deleteuser/${selectedAdmin.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      toast.success("Admin role deleted successfully 🗑️");
      setDeleteModal(false);
      setSelectedAdmin(null);
      getAdminlist();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete admin role");
    }
  };



  return (
    <>
      <div className="page-header">
        <h1>Team Management</h1>
        <p className="page-paragraph"> Manage Admin ,Given Permission and their details & Approvals</p>

      </div>

      <div className="controls-section">
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
        <div className="filter-controls">
          <button
            className="add-customer-btn"
            onClick={() => {
              setAddAdminForm(initalAdminform);
              setAdminModal(true);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="10" cy="7" r="4" />
              <path d="M4 21v-2a6 6 0 0 1 12 0v2" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Add Admin
          </button>



        </div>
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
          ) : filteredVerifiers.length > 0 ? (
            filteredVerifiers.map((verifier, index) => (
              <tr key={verifier.id}>
                <td>{index + 1}</td>
                <td>{role[verifier.role_name] || verifier.role_name}</td>
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
                  updateStatus(selectedVerifier.id, "REJECTED", "reason");
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
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Permissions</h3>


            {allPermissions.map((p) => (
              <div key={p.uid} className="checkbox-row">
                <input
                  type="checkbox"
                  value={p.uid}
                  checked={selectedPermissions.includes(p.uid)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (e.target.checked) {
                      setSelectedPermissions([...selectedPermissions, val]);
                    } else {
                      setSelectedPermissions(
                        selectedPermissions.filter(x => x !== val)
                      );
                    }
                  }}
                />
                <span>{p.name}</span>
              </div>
            ))}


            <div className="form-group">
              <label>Status</label>
              <select
                className="status-select"
                value={editingUser?.admin_approval_status || "PENDING"}
                onChange={(e) => {
                  const newStatus = e.target.value;

                  if (newStatus === "REJECTED" || newStatus === "SUSPENDED") {
                    setSelectedVerifier(editingUser);
                    setRejectModalOpen(true);
                    setPermissionModalOpen(false);
                    setActionType(newStatus)
                  } else {
                    setEditingUser(prev => ({
                      ...prev,
                      admin_approval_status: newStatus,
                    }));
                  }
                }}
              >
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="SUSPENDED"> Suspended</option>
              </select>
            </div>


            <div className="form-buttons">
              <button type="submit" onClick={handleSavePermissions}>Save</button>
              <button type="button" onClick={() => setPermissionModalOpen(false)}>Cancel</button>
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
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={AddAdminForm.password}
              onChange={handleinputchange}
            />
            {AddError.password && <p className="error">{AddError.password}</p>}
            <label>Role</label>
            <select
              name="admin_role"
              value={AddAdminForm.admin_role}
              onChange={handleinputchange}

            >
              <option value="">Select Role</option>
              <option value="ADMIN">Admin</option>
              <option value="VERIFIER">Verifier</option>
              <option value="FOLLOWUP">Followup</option>
              <option value="SUPERADMIN"> SuperAdmin </option>
            </select>
            {AddError.admin_role && <p className="error">{AddError.admin_role}</p>}

            <div className="form-buttons">
              <button type="submit">Add Admin</button>
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
