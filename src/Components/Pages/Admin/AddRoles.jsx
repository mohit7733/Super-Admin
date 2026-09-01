import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
import { FiShield } from "react-icons/fi";
import { BiPlus } from "react-icons/bi";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";


import BASE_URL from "../../../Base";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddRoles = () => {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
const [roleName, setRoleName] = useState("");
const [permissionSearch, setPermissionSearch] = useState("");
const [selectedPermissions, setSelectedPermissions] = useState([]);
const [status, setStatus] = useState("PENDING");
const [permissions, setPermissions] = useState([]);
const [loadingPermissions, setLoadingPermissions] = useState(false);
const[ErrorPermiission,setErrorPermissiion]=useState(null);
const [loadingRole, setLoadingRole] = useState(false);
const [roleError, setRoleError] = useState(null);
const navigate = useNavigate();
const[RoleData,setRoleData]=useState([]);
const [editRoleName, setEditRoleName] = useState("");
const [editSelectedPermissions, setEditSelectedPermissions] = useState([]);
const [editRoleId, setEditRoleId] = useState(null);
const [editLoading, setEditLoading] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [editPermissionSearch, setEditPermissionSearch] = useState("");
const [showPermissionModal, setShowPermissionModal] = useState(false);
const [permissionName, setPermissionName] = useState("");
const [permissionCode, setPermissionCode] = useState("");
const [permissionDescription, setPermissionDescription] = useState("");
const [permissionIsSubmitting, setPermissionIsSubmitting] = useState(false);

const generateCode = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_");
};




const handleCreateRole = async (e) => {
  e.preventDefault();

  if (!roleName.trim()) {
    toast.error("Role name is required");
    return;
  }

  if (selectedPermissions.length === 0) {
    toast.error("Please select at least one permission");
    return;
  }

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoadingRole(true);

  try {
    const payload = {
      name: roleName.trim(),
      permission_ids: selectedPermissions,
    };

    console.log("Create Role Payload =>", payload);

    const response = await fetch(`${BASE_URL}/user/admin/roles/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log("Create Role Response =>", data);

    if (response.ok) {
      toast.success(data.message || "Role created successfully");

      setRoleName("");
      setPermissionSearch("");
      setSelectedPermissions([]);
      setShowModal(false);
      getRole();

    } else {
      toast.error(data.message || "Failed to create role");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setLoadingRole(false);
  }
};
const handleUpdateRole = async (e) => {
  e.preventDefault();

  if (!editRoleName.trim()) {
    toast.error("Role name is required");
    return;
  }

  if (editSelectedPermissions.length === 0) {
    toast.error("Please select at least one permission");
    return;
  }

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setEditLoading(true);

  try {
    const payload = {
      name: editRoleName.trim(),
      permission_ids: editSelectedPermissions,
    };

    console.log("Update Payload:", payload);

    const response = await fetch(
      `${BASE_URL}/user/admin/roles/${editRoleId}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success(data.message || "Role updated successfully");

      setShowEditModal(false);
      getRole(); // Refresh Role List
    } else {
      toast.error(data.message || "Failed to update role");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setEditLoading(false);
  }
};

const handleEdit = (role) => {
  setEditRoleId(role.id);
  setEditRoleName(role.name);

  setEditSelectedPermissions(
    role.permissions.map((permission) => permission.id)
  );

  setShowEditModal(true);
};

 const getPermissions = async () => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }


    try {
      const response = await fetch(`${BASE_URL}/user/admin/permissions/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
             "ngrok-skip-browser-warning": "true",
        },
      });

         if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const data = await response.json();
      console.log("Permissions List API Response 👉", data);
      setPermissions(data);

    } catch (err) {
      toast.error("Failed to load permissions");
      setErrorPermissiion("something went wrong")
    }
    finally {
    setLoadingPermissions(false);
  }

  };

 const getRole = async () => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }
setLoadingRole(true)

    try {
      const response = await fetch(`${BASE_URL}/user/admin/roles/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
             "ngrok-skip-browser-warning": "true",
        },
      });

         if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const data = await response.json();
      console.log("Permissions List API Response 👉", data);
      if (data.success) {
        setRoleData(data.data);
       
      }
    } catch (err) {
      toast.error("Failed to load permissions");
      setRoleError("something went wrong")
    }
    finally {
    setLoadingRole(false);
  }

  };

  const handleCreatePermission = async (e) => {
  e.preventDefault();

  if (!permissionName.trim()) {
    toast.error("Permission name is required");
    return;
  }

  if (!permissionDescription.trim()) {
    toast.error("Description is required");
    return;
  }

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired");
    navigate("/login");
    return;
  }

  setPermissionIsSubmitting(true);

  try {
    const payload = {
      name: permissionName.trim(),
      codename: permissionCode,
      description: permissionDescription.trim(),
    };

    console.log("Permission Payload =>", payload);

    const response = await fetch(
      `${BASE_URL}/user/admin/permissions/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success("Permission created successfully");

      setPermissionName("");
      setPermissionCode("");
      setPermissionDescription("");

      setShowPermissionModal(false);

      getPermissions();
    } else {
      toast.error(data.message || "Failed to create permission");
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong");
  } finally {
    setPermissionIsSubmitting(false);
  }
};

useEffect(()=>{
    getPermissions();
    getRole();
},[])
  return (
    <>
      <div className="page-header">
        <h1>Add Role</h1>
        <p className="page-paragraph">
          Manage Roles, give permissions to roles, and edit permissions.
        </p>
      </div>

     <div className="filter-category">
          <div className="filter-controls">
            <div className="search-wrapper">
              <BsSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
           
            </div>
  
  
        
          </div>
  
          <button
  className="add-customer-btn"
  onClick={() => setShowModal(true)}
>
  <BiPlus />
  Add Role
</button>
        </div>

<div className="table-wrapper">
  <table className="data-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Role Name</th>
        <th>Permissions</th>
        <th>Total Permissions</th>
        <th>Actions</th>
      </tr>
    </thead>

    <tbody>
      {loadingRole? (
        Array(3)
          .fill(0)
          .map((_, index) => (
            <tr key={index}>
              <td colSpan="5">
                <div className="skeleton-row"></div>
              </td>
            </tr>
          ))
      ) :roleError ? (
        <tr>
          <td colSpan="5" style={{ textAlign: "center", color: "red" }}>
            {roleError}
          </td>
        </tr>
      ) : RoleData.length > 0 ? (
        RoleData.map((item, index) => (
          <tr key={item.id}>
            <td>{index + 1}</td>

            <td>
              <strong>{item.name}</strong>
            </td>

            <td>
              {item.permissions?.length > 0 ? (
                item.permissions.map((permission) => (
                  <span
                    key={permission.id}
                    className="category-code-badge"
                    style={{ marginRight: "6px", marginBottom: "5px" }}
                  >
                    {permission.name}
                  </span>
                ))
              ) : (
                "No Permission"
              )}
            </td>

            <td>{item.permissions?.length || 0}</td>

            <td>
              <div className="action-buttons">
             <button
  type="button"
  className="action-btn edit"
  onClick={() => handleEdit(item)}
>
  <FaEdit />
</button>

               
              </div>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5" style={{ textAlign: "center" }}>
            No Roles Found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>



        {showModal && (
  <div className="prakriti-modal-overlay">
    <div className="prakriti-modal role-modal">

      <div className="prakriti-modal-header">
        <h2>Add Role</h2>

        <button
          className="modal-close-btn"
          onClick={() => {
            setShowModal(false);
            setRoleName("");
            setPermissionSearch("");
            setSelectedPermissions([]);
          }}
        >
          <FaTimes />
        </button>
      </div>

<form className="prakriti-form" onSubmit={handleCreateRole}>

        {/* Role Name */}

        <div className="form-group">
          <label>
            Role Name <span className="required">*</span>
          </label>

          <input
            type="text"
            placeholder="Enter role name (e.g. Reviewer)"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
          />
        </div>
       
        {/* Search */}

        <div className="form-group3">
          <label>Search Permission</label>

          <div className="permission-search1">

            <BsSearch />

            <input
              type="text"
              placeholder="Search permission..."
              value={permissionSearch}
              onChange={(e) => setPermissionSearch(e.target.value)}
            />

          </div>
        </div>

        {/* Permission Header */}

       <div className="permission-header">

  <h4>Permissions</h4>

  <div className="permission-header-right">

    <span className="selected-count">
      {selectedPermissions.length} selected
    </span>
<button
  type="button"
  className="add-permission-btn"
  onClick={() => setShowPermissionModal(true)}
>
  <BiPlus size={18} />
  Add Permission
</button>

  </div>

</div>
      

        <div className="permission-list">

          {permissions
            .filter(
              (item) =>
                item.name
                  .toLowerCase()
                  .includes(permissionSearch.toLowerCase()) ||
               item.codename
  .toLowerCase()
  .includes(permissionSearch.toLowerCase())
)
            .map((item) => (
              <div className="permission-card" key={item.id}>

                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(item.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPermissions([
                        ...selectedPermissions,
                        item.id
                      ]);
                    } else {
                      setSelectedPermissions(
                        selectedPermissions.filter(
                          (id) => id !== item.id
                        )
                      );
                    }
                  }}
                />

                <div className="permission-info">

                  <div className="permission-title">

                    <h5>{item.name}</h5>

                    <span>{item.codename}</span>

                  </div>

                  <p>{item.description}</p>

                </div>

              </div>
            ))}
        </div>

       



        <div className="modal-footer">

          <button
            type="button"
            className="cancel-btn"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>

         
            <button
  type="submit"
  className="save-btn"
  disabled={loadingRole}
>
  <FiShield />
  {loadingRole ? "Creating..." : "Create Role"}
</button>
       
          

        </div>

      </form>

    </div>
  </div>
)}


{showEditModal && (
  <div className="prakriti-modal-overlay">
    <div className="prakriti-modal role-modal">

      <div className="prakriti-modal-header">
        <h2>Edit Role</h2>

        <button
          className="modal-close-btn"
          onClick={() => {
            setShowEditModal(false);
            setEditRoleId(null);
            setEditRoleName("");
            setEditPermissionSearch("");
            setEditSelectedPermissions([]);
          }}
        >
          <FaTimes />
        </button>
      </div>

      <form className="prakriti-form" onSubmit={handleUpdateRole}>

        {/* Role Name */}

        <div className="form-group">
          <label>
            Role Name <span className="required">*</span>
          </label>

          <input
            type="text"
            placeholder="Enter role name"
            value={editRoleName}
            onChange={(e) => setEditRoleName(e.target.value)}
          />
        </div>

        {/* Search Permission */}

        <div className="form-group3">
          <label>Search Permission</label>

          <div className="permission-search1">
            <BsSearch />

            <input
              type="text"
              placeholder="Search permission..."
              value={editPermissionSearch}
              onChange={(e) =>
                setEditPermissionSearch(e.target.value)
              }
            />
          </div>
        </div>

        {/* Header */}

        <div className="permission-header">
          <h4>Permissions</h4>

          <div className="permission-header-right">
            <span className="selected-count">
              {editSelectedPermissions.length} selected
            </span>
          </div>
        </div>

        {/* Permission List */}

        <div className="permission-list">

          {permissions
            .filter(
              (item) =>
                item.name
                  .toLowerCase()
                  .includes(editPermissionSearch.toLowerCase()) ||
                item.codename
                  .toLowerCase()
                  .includes(editPermissionSearch.toLowerCase())
            )
            .map((item) => (
              <div className="permission-card" key={item.id}>

                <input
                  type="checkbox"
                  checked={editSelectedPermissions.includes(item.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setEditSelectedPermissions([
                        ...editSelectedPermissions,
                        item.id,
                      ]);
                    } else {
                      setEditSelectedPermissions(
                        editSelectedPermissions.filter(
                          (id) => id !== item.id
                        )
                      );
                    }
                  }}
                />

                <div className="permission-info">

                  <div className="permission-title">
                    <h5>{item.name}</h5>
                    <span>{item.codename}</span>
                  </div>

                  <p>{item.description}</p>

                </div>

              </div>
            ))}

        </div>

        {/* Footer */}

        <div className="modal-footer">

          <button
            type="button"
            className="cancel-btn"
            onClick={() => setShowEditModal(false)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
            disabled={editLoading}
          >
            <FiShield />
            {editLoading ? "Updating..." : "Update Role"}
          </button>

        </div>

      </form>

    </div>
  </div>
)}

{showPermissionModal && (
  <div className="prakriti-modal-overlay">
    <div className="prakriti-modal">

      <div className="prakriti-modal-header">
        <h2>Add Permission</h2>

        <button
          className="modal-close-btn"
          onClick={() => {
            setShowPermissionModal(false);
            setPermissionName("");
            setPermissionCode("");
            setPermissionDescription("");
          }}
        >
          <FaTimes />
        </button>
      </div>

      <form
        className="prakriti-form"
        onSubmit={handleCreatePermission}
      >

        <div className="form-group">
          <label>
            Permission Name <span className="required">*</span>
          </label>

          <input
            type="text"
            placeholder="Enter permission name"
            value={permissionName}
            onChange={(e) => {
              const value = e.target.value;

              setPermissionName(value);
              setPermissionCode(generateCode(value));
            }}
          />
        </div>

        <div className="form-group">
          <label>Code Name</label>

          <input
            type="text"
            value={permissionCode}
            readOnly
          />
        </div>

        <div className="form-group">
          <label>
            Description <span className="required">*</span>
          </label>

          <textarea
            rows={4}
            placeholder="Enter description"
            value={permissionDescription}
            onChange={(e) =>
              setPermissionDescription(e.target.value)
            }
          />
        </div>

        <div className="modal-footer">

          <button
            type="button"
            className="cancel-btn"
            onClick={() => setShowPermissionModal(false)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="save-btn"
            disabled={permissionIsSubmitting}
          >
            <FiShield />

            {permissionIsSubmitting
              ? "Creating..."
              : "Create Permission"}
          </button>

        </div>

      </form>

    </div>
  </div>
)}
<ToastContainer position="top-center" autoClose={2000} />

    </>
  );
};

export default AddRoles;