import React, { useState, useEffect ,useRef} from "react";
import BASE_URL from "../../../Base";

import { ToastContainer, toast } from "react-toastify"
const initalAdminform ={
    phone_number :'',
    admin_role :'',
    password:'',
    
   
}
const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [Error, setError] = useState("");
  const [verifiersearch, setVerifiersearch] = useState("");
  const [AdminData, setAdminData] = useState([]);

const[DeleteModal,setDeleteModal] =useState(false);
const [rejectModalOpen, setRejectModalOpen] = useState(false);
const [rejectReason, setRejectReason] = useState("");
const [selectedVerifier, setSelectedVerifier] = useState(null);
const [permissionModalOpen, setPermissionModalOpen] = useState(false);
const [selectedPermissions, setSelectedPermissions] = useState([]);
const [editingUser, setEditingUser] = useState(null);
const [allPermissions, setAllPermissions] = useState([]);
const[AddAdminModal,setAdminModal]=useState(false);
const [AddAdminForm,setAddAdminForm]= useState(initalAdminform)
const [selectedAdmin, setSelectedAdmin] = useState(null);



   const fetchedOnce = useRef(false);
 const filteredVerifiers = AdminData.filter(v =>
  v.phone_number?.toLowerCase().includes(verifiersearch.toLowerCase())
);

  const getAdminlist = async()=>{
      const token = sessionStorage.getItem("superadmin_token");
try{
    const response = await fetch(`${BASE_URL}/user/admin-approval/`,{
method:'GET',
headers:{
       Accept: "application/json",
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
  
}});
const data  = await response.json();
console.log("API Response:", data);
setAdminData(data)
}
catch(err){
    console.error(err.message)
          setError("Something went wrong while fetching data.")
          toast.error("Failed to fetch Doctor Data")

}
finally{
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
};

const handleAddAdminSubmit = async (e) => {
  e.preventDefault();

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
    setAddAdminForm(false);
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



  const updateStatus = async(id, status,reason="")=>{
    const token = sessionStorage.getItem("superadmin_token");
    try{
const response = await fetch(`${BASE_URL}/user/admin-approval/`,{
    method:'PUT',
    headers:{
         "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    },
    body:JSON.stringify({
        user_id:id,
        action:status,
        reject_reason:reason,
    })
});
const data = await response.json();
 toast.success("Status Updated");
 getAdminlist();
    }
    catch(err){
         toast.error("Failed to update status");

    }
  }

  

  const handleEditClick = (verifier) => {
  setEditingUser(verifier);
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
        action: editingUser.admin_approval_status || "APPROVE",
        permission_ids: selectedPermissions,   
        group_ids: [],                         
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
    
       getAllPermissions ();
     
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
        <h1>Team</h1>
      </div>

      <div className="customers-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search Admin by their phone number"
            value={verifiersearch}
            onChange={(e) => setVerifiersearch(e.target.value)}
            className="search-input"
            disabled={loading}
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
  + Add Admin
</button>



        </div>
      </div>

      <table className="customers-table">
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
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                <div className="circular-loader"></div>
              </td>
            </tr>
          ) : Error ? (
            <tr>
              <td colSpan="5" style={{ color: "red", textAlign: "center" }}>
                {Error}
              </td>
            </tr>
          ) : filteredVerifiers.length > 0 ? (
            filteredVerifiers.map((verifier,index) => (
              <tr key={verifier.id}>
                <td>{index+1}</td>
             <td>{verifier?.role_name}</td>
                <td>{verifier?.phone_number}</td>
          
<td>
  
     
{verifier.admin_approval_status}
</td>
             
                   <td>
                  <div className="action-buttons">
                   
                 
            <button className="action-btn edit" onClick={() => handleEditClick(verifier)}>
  ✏️
</button>


<button
  className="action-btn delete"
  onClick={() => {
    setSelectedAdmin(verifier);   
    setDeleteModal(true);
  }}
>
  🗑
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
      <h3>Reject Reason</h3>
      <textarea
        placeholder="Enter reason for rejection"
        value={rejectReason}
        onChange={(e) => setRejectReason(e.target.value)}
      />

      <div className="form-buttons">
        <button
          onClick={() => {
            if (!rejectReason) {
              toast.error("Please enter a reason");
              return;

            }
            updateStatus(selectedVerifier.id, "REJECTED", rejectReason);
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

            if (newStatus === "REJECTED") {
              setSelectedVerifier(editingUser);
              setRejectModalOpen(true);
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
        </select>
      </div>

     
      <div className="form-buttons">
        <button onClick={handleSavePermissions}>Save</button>
        <button onClick={() => setPermissionModalOpen(false)}>Cancel</button>
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

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={AddAdminForm.password}
          onChange={handleinputchange}
        />

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
        </select>

        <div className="form-buttons">
          <button type="submit">Add Admin</button>
         <button type="button" onClick={() => setAdminModal(false)}>
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
