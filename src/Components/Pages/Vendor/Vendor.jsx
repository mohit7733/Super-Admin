import * as XLSX from "xlsx";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify";
import { countries, statesByCountry } from "../../data/locationData"
import BASE_URL from "../../../Base";

import { FiFileText } from "react-icons/fi";
import { BsDownload, BsPlus, BsSearch, BsThreeDotsVertical } from "react-icons/bs";

import { MdEditLocationAlt } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaEdit, FaMapMarkerAlt, FaPlusCircle } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";



const userId = localStorage.getItem("USER_ID")
const initialFormState = {
  user: userId,
  first_name: "",
  last_name: "",
  store_name: "",
  phone_number: "",
  profile_picture: null,
  gst_number: "",
  documentType: "",
  documentFile: null,
  documents: [],
}
const intialAddressform = {
  pincode: "",
  country: "",
  state: "",
  city: "",
  address_line1: "",
  address_line2: "",
}

const Vendor = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [vendorData, setVendorData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(initialFormState)
  const [viewVendor, setViewVendor] = useState(null)
  const [vendorverifiedmodal, setVendorverifiedModal] = useState(false)
  const [vendorotp, setVendorotp] = useState(false)
  const [AddModal, setAddModal] = useState(false)
  const [Addform, setAddform] = useState(intialAddressform)
  const [addressVendorId, setAddressVendorId] = useState(null)
  const [addressEditingId, setAddressEditingId] = useState(null)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const[SelectedVendor,setSelectedVendor]=useState("");
  const [addressErrors, setAddressErrors] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [phoneErrors, setPhoneErrors] = useState({})

  const bulktableRef = useRef(null)

  const fetchedOnce = useRef(false);
  const [userId, setUserId] = useState(null);
  const [currentpage, setcurentpage] = useState(1);
  const [previousPage, setPreviousPage] = useState(null);
  const [Nextpage, setNextPage] = useState(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [imageModal, setimageModal] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [VendoropenModal, setVendorModal] = useState(false);
  const [SelectedVendorId, setSelectedIdVendor] = useState(null);
  const [RejectionVendorModal, setRejectionModal] = useState(false);
  const [Reason, setReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  
  const pageSize = 5;
 const [vendorStats, setVendorStats] = useState({
  vendors: 0,
  approved: 0,
  pending: 0,
  suspended: 0,
  rejected: 0,
});

  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pageSize);
  const [approveModal, setApproveModal] = useState(false);


  const navigate = useNavigate();
  const [isApproving, setIsApproving] = useState(false);



 const getVendorList = async (page = 1,search = searchTerm) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/vendors/admin/vendors-list/?page=${page}&search=${encodeURIComponent(search)}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
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

      setVendorData(data.data.results);
      setTotalCount(data.data.count);
      setPreviousPage(data.data.previous);
      setNextPage(data.data.next);
      setcurentpage(page)
      setVendorStats(data.data.total_counts);



    } catch (err) {
      console.error(err.message);
      setError("Something went wrong while fetching vendor data.");
      toast.error("Failed to fetch vendor data");
    } finally {
      setLoading(false);
    }
  };
 
  const handleApproveClick = (vendor) => {
  setSelectedVendorId(vendor.id);
  setSelectedVendor(vendor);      
  setApproveModal(true);
};

 useEffect(() => {
  const delay = setTimeout(() => {
    if (searchTerm.trim() === "") {
      getVendorList(1, "");
      return;
    }

    if (searchTerm.trim().length >= 2) {
      getVendorList(1, searchTerm);
    }
  }, 1000);

  return () => clearTimeout(delay);
}, [searchTerm]);


  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, documentFile: file });
  };


 


  const openDocumentModal = (i) => {

    setVendorModal(true);
    setSelectedIdVendor(i);
  }

  const handleNavigate = (id) => {
    console.log(id)
    navigate(`/VendorDetail/${id}`)
  }

  

  const handleStatusChange = async (vendorId, newStatus, Reason = "") => {
  const token = sessionStorage.getItem("superadmin_token");


  try {
    const bodyData = {
      status: newStatus,
      vendor_id: vendorId,
      ...(
        (newStatus === "rejected" || newStatus === "suspended") && {
          reason: Reason,
        }
      ),
    };

    const response = await fetch(
        `${BASE_URL}/vendors/admin/vendor/${vendorId}/review-status/`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      }
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    if (!response.ok) {
      toast.error("Failed to update status");
      return;
    }


    setVendorData((prev) =>
      prev.map((vendor) =>
        vendor.id === vendorId
          ? { ...vendor, approval_status: newStatus }
          : vendor
      )
    );

await getVendorList();
console.log("Vendor list fetched");

    if (newStatus === "approved") {
      toast.success("Vendor approved successfully ✅");
    } else if (newStatus === "rejected") {
      toast.error("Vendor rejected successfully ❌");
    } else if (newStatus === "suspended") {
      toast.warning("Vendor suspended successfully ");
    } else {
      toast.success("Status updated successfully ✅");
    }

  } catch (err) {
    console.error(err);
    toast.error("Error updating vendor status");
  }
};

  const updateVendor = (updatedVendor) => {
    setVendorData((prevVendors) =>
      prevVendors.map((v) => (v.id === updatedVendor.id ? updatedVendor : v))
    )
  }


  
  const submitRejection = async (e) => {
  e.preventDefault();

  if (!Reason.trim()) {
    toast.error("Please enter a reason");
    return;
  }

  await handleStatusChange(
    selectedVendorId,
    selectedStatus,
    Reason
  );

  setRejectionModal(false);
  setSelectedVendorId(null);
  setSelectedStatus("");
  setReason("");
};

   
  const handleRejectClick = (Vendor, statusType) => {
      setRejectionModal(true);
    setSelectedVendorId(Vendor.id);
   setSelectedVendor(Vendor)
    setSelectedStatus(statusType);
    setRejectionModal(true);
  };




  const handleAddaddress = (e) => {
    const { name, value } = e.target;

    setAddform((prev) => ({
      ...prev,
      [name]: value,
    }));


    let errorMsg = "";

    if (name === "pincode") {
      if (!/^\d{6}$/.test(value)) {
        errorMsg = "Pincode must be exactly 6 digits";
      }
    }

    if (name === "country" && !value) {
      errorMsg = "Please select a country";

    }

    if (name === "state" && !value) {
      errorMsg = "Please select a state";
    }

    if (name === "city" && value.trim()?.length === 0) {
      errorMsg = "Please select a city";
    }

    if (name === "address_line1" && value.trim()?.length < 5) {
      errorMsg = "Address line 1 must be at least 5 characters long";
    }

    setAddressErrors((prev) => ({
      ...prev,
      [name]: errorMsg,
    }));
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

    if (phoneErrors[name]) {
      setPhoneErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm((prev) => ({
        ...prev,
        profile_picture: file,
      }))
    }
  }

  

  const handleRemoveDocument = (type) => {
    setUploadedDocs((prev) => prev.filter((doc) => doc.type !== type));
    toast.info("Document removed successfully");
  };

  const handleCloseAdddModal = () => {
    setAddModal(false)
    setAddform(intialAddressform)
    setAddressEditingId(null)
    setAddressVendorId(null)
  }





  const handleAddDocument = (e) => {
    e.preventDefault();

    if (!form.documentType || !form.documentFile) {
      toast.error("Please select document type and upload file");
      return;
    }

    const newDoc = {
      type: form.documentType,
      file: form.documentFile,
    };

    setUploadedDocs((prev) => {

      const existing = prev.find((d) => d.type === newDoc.type);
      if (existing) {
        return prev.map((d) => (d.type === newDoc.type ? newDoc : d));
      }
      return [...prev, newDoc];
    });


    setForm((prev) => ({
      ...prev,
      documentType: "",
      documentFile: null,
    }));

    toast.success("Document added!");
  };




  const handlevendorverifiedSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("superadmin_token");

    try {
      const payload = {
        phone_number: `+91${form.verified_phone_number}`,
        role: "vendor",
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
        toast.error(data?.error)
        return;
      }

      const uid = data?.user?.id;
      toast.success("vendor Created. please Complete your vendor registration");
      if (uid) {
        setUserId(uid);
        localStorage.setItem("USER_ID", uid);
        setVendorverifiedModal(false);
        setModalOpen(true);
      }
    } catch (err) {
      toast.error("Failed to create user. Please try again");
      console.error("Vendor creation failed", err);
    }
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);


  const exportToCSV = () => {
    if (!vendorData || vendorData?.length === 0) {
      toast.error("No vendor data to export");
      return;
    }

    const exportData = vendorData.map((vendor, index) => ({
      "S.No": index + 1,
      "Store Name": vendor.store_name || "NA",
      "Phone Number": vendor.verified_phone_number || "NA",
      "Status": vendor.status || "NA",
      "Location": vendor.pickup_locations?.map(
        (loc) =>
          `${loc.pincode || ""}, ${loc.country || ""}, ${loc.state || ""}, ${loc.city || ""}, ${loc.address_line1 || ""}, ${loc.address_line2 || ""}`
      ).join(" | ") || "NA"
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendors");

    XLSX.writeFile(wb, "Vendors_List.xlsx");
  };





  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingId(null)
    setForm(initialFormState)
    setFormErrors({})
  }





  const getInitials = (firstName = "", lastName = "") => {
    return (
      (firstName?.[0] || "").toUpperCase() +
      (lastName?.[0] || "").toUpperCase()
    );
  };




  const availableStates = statesByCountry[Addform.country] || []



  return (
    <>
      <div className="page-header">
        <h1>Vendors Management</h1>
        <p className="page-paragraph"> Manage Vendor ,Vendor Detalis and their Approvals   </p>
      </div>

      <div className="vendors-stats stats2-grid">
        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={24} />
          </div>
          <div className="stat2-info">
            <h3>Total Vendors</h3>
      <div className="stat2-value">{vendorStats.vendors}</div>

          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={24} />
          </div>
          <div className="stat2-info">
            <h3>Approved Vendors</h3>
          
<div className="stat2-value">{vendorStats.approved || 0}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={24} />
          </div>
          <div className="stat2-info">
            <h3>Pending Vendors</h3>
        
<div className="stat2-value">{vendorStats.pending || 0}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={24} />
          </div>
          <div className="stat2-info">
            <h3>Rejected Vendors</h3>
           <div className="stat2-value">{vendorStats.rejected || 0}</div>
          </div>
        </div>
      </div>
      <div className="controls-section">
        <div className="search-wrapper">
          <BsSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search vendors by storename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="action-buttons">
          {/* <button
            className="btn-primary"
            onClick={() => {
              setVendorverifiedModal(true);
              setUploadedDocs([]);
              setEditingId(null);
              setForm(initialFormState);
            }}
          >
            <BsPlus size={18} />
            Add Vendor
          </button> */}

        </div>
      </div>
     <div className="table-wrapper">
  <table className="data-table" ref={bulktableRef}>
    <thead>
      <tr>
        <th>Id</th>
        <th>Profile</th>
        <th>Store Name</th>
        <th>Gst Number</th>
        <th>Location</th>
        <th>Phone Number</th>
        <th>Status</th>
        <th>Document</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      {loading ? (
        Array(3)
          .fill(0)
          .map((_, i) => (
            <tr key={i}>
              <td colSpan="9">
                <div className="skeleton-row"></div>
              </td>
            </tr>
          ))
      ) : error ? (
        <tr>
          <td
            colSpan="9"
            style={{ color: "red", textAlign: "center" }}
          >
            {error}
          </td>
        </tr>
      ) : vendorData && vendorData.length > 0 ? (
        vendorData.map((vendor, index) => (
          <tr key={vendor.id}>
            <td className="id1">{index + 1}</td>

            <td>
              <div className="customer-avatar-wrapper">
                {vendor?.documents?.company_logo ? (
                  <img
                    src={vendor.documents.company_logo}
                    alt="company logo"
                    className="customer-avatar-img"
                    onClick={() => {
                      setPreviewImage(vendor.documents.company_logo);
                      setimageModal(true);
                    }}
                  />
                ) : (
                  <div className="customer-avatar">
                    {getInitials(vendor?.business_name)}
                  </div>
                )}
              </div>
            </td>

            <td>{vendor?.business_name}</td>

            <td>{vendor?.gst_number ?? "NA"}</td>

            <td>
              {vendor?.street_address}, {vendor?.city},{" "}
              {vendor?.state} - {vendor?.pincode}
            </td>

            <td>{vendor?.verified_phone_number}</td>

            <td>
              <select
                value={vendor.approval_status}
                className="status-dropdown"
                onChange={(e) => {
                  const newStatus = e.target.value;

                  if (newStatus === "approved") {
                    handleApproveClick(vendor);
                  } else if (
                    newStatus === "rejected" ||
                    newStatus === "suspended"
                  ) {
                    handleRejectClick(vendor, newStatus);
                  }
                }}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </td>

            <td style={{ textAlign: "center" }}>
              <FiFileText
                size={20}
                color="#0D614E"
                onClick={() => openDocumentModal(vendor)}
                style={{ cursor: "pointer" }}
              />
            </td>

            <td
              style={{ position: "relative" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="action-menu-toggle"
                onClick={() =>
                  setOpenMenuId(
                    openMenuId === vendor.id ? null : vendor.id
                  )
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

              {openMenuId === vendor.id && (
                <div className="action-buttons-modal">
                  <button
                    className="action-btn1"
                    title="View Vendor Product"
                    onClick={() => handleNavigate(vendor.id)}
                  >
                    <span className="icon">
                      <FaEye />
                    </span>
                    <span>Detail Page</span>
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="9" style={{ textAlign: "center" }}>
            No Data Found
          </td>
        </tr>
      )}
    </tbody>
  </table>

  {totalPages > 1 && (
    <div className="pagination">
      <button
        onClick={() => getVendorList(currentpage - 1, searchTerm)}
        disabled={!previousPage}
      >
        Prev
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => getVendorList(page, searchTerm)}
          style={{
            fontWeight: currentpage === page ? "bold" : "normal",
            background:
              currentpage === page ? "#0D614E" : "#fff",
            color:
              currentpage === page ? "#fff" : "#0D614E",
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => getVendorList(currentpage + 1, searchTerm)}
        disabled={!Nextpage}
      >
        Next
      </button>
    </div>
  )}
</div>
      {/* {modalOpen && (
        <div className="modal">
          <form className="product-form" onSubmit={handleFormSubmit}>
            <h3>{editingId ? "Edit Vendor" : "Add Vendor"}</h3>


            <div className="form-grid">

              <div className="form-column-1">
                <div className="form-field">
                  <label> First Name :</label>
                  <input
                    name="first_name"
                    value={form.first_name}
                    onChange={handleInputChange}

                  />
                  {formErrors.first_name && <span className="error-msg">{formErrors.first_name}</span>}
                </div>
                <div className="form-field">
                  <label> Last Name :</label>
                  <input
                    name="last_name"
                    value={form.last_name}
                    onChange={handleInputChange}

                  />
                </div>

                <div className="form-field">
                  <label>Store Name:</label>
                  <input
                    name="store_name"
                    value={form.store_name}
                    onChange={handleInputChange}

                  />
                  {formErrors.store_name && <span className="error-msg">{formErrors.store_name}</span>}
                </div>

                <div className="form-field">
                  <label>Contact Number:</label>
                  <input
                    type="text"
                    disabled
                    name="verified_phone_number"
                    value={form.verified_phone_number}
                    onChange={handleInputChange}

                  />
                  {formErrors.verified_phone_number && <span className="error-msg">{formErrors.verified_phone_number}</span>}
                </div>

                <div className="form-field">
                  <label>Profile Picture:</label>
                  <input type="file" onChange={handleImageUpload} accept="image/*" />
                  {formErrors.profile_picture && <span className="error-msg">{formErrors.profile_picture}</span>}
                </div>
                <div className="form-field">
                  <label>GST Number:</label>
                  <input
                    type="text"
                    value={form.gst_number}
                    onChange={handleInputChange}
                    placeholder="Enter GST Number"
                    name="gst_number"
                  />
                  {formErrors.gst_number && <span className="error-msg">{formErrors.gst_number}</span>}
                </div>

              </div>
              <div className="form-column-2">


                <div className="form-field">
                  <label>Documents: *</label>
                  <select
                    name="documentType"
                    value={form.documentType}
                    onChange={handleInputChange}

                  >
                    <option value="">-- Select Document --</option>

                    {documentOptions
                      .filter((opt) => !uploadedDocs.some((doc) => doc.type === opt.value))
                      .map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}

                  </select>

                </div>


                <div className="form-field">
                  <label>Upload Document (PDF)</label>
                  <input
                    type="file"
                    name="documentFile"
                    accept="application/pdf"
                    onChange={handleDocumentUpload}
                  />


                  <button
                    type="button"
                    onClick={handleAddDocument}
                    style={{
                      padding: "4px 10px",
                      background: "#0D614E",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginTop: "5px",
                    }}
                  >
                    Add
                  </button>


                  {uploadedDocs?.length > 0 && (
                    <div className="uploaded-doc-list" style={{ marginTop: "10px" }}>
                      <ul style={{ listStyle: "none", padding: 0 }}>
                        {uploadedDocs.map((doc, i) => (
                          <li
                            key={i}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "5px",
                              borderBottom: "1px solid #ddd",
                              paddingBottom: "3px",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-block",
                                maxWidth: "200px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              ✅ <strong>{doc.type}</strong> —{" "}
                              {doc.file
                                ? doc.file.name
                                : doc.existingUrl
                                  ? "Previously uploaded"
                                  : "No file"}
                            </span>

                            <div style={{ display: "flex", alignItems: "center" }}>

                              {doc.existingUrl && (
                                <a
                                  href={doc.existingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "blue",
                                    textDecoration: "underline",
                                    marginRight: "10px",
                                  }}
                                >
                                  View
                                </a>
                              )}



                              <label
                                style={{
                                  cursor: "pointer",
                                  color: "green",
                                  marginRight: "10px",
                                }}
                              >
                                Replace
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  style={{ display: "none" }}
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      setUploadedDocs((prev) =>
                                        prev.map((d) =>
                                          d.type === doc.type
                                            ? { ...d, file, existingUrl: null }
                                            : d
                                        )
                                      );
                                      toast.success("Document replaced!");
                                    }
                                  }}
                                />
                              </label>


                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(doc.type)}
                                style={{
                                  color: "red",
                                  border: "none",
                                  background: "transparent",
                                  cursor: "pointer",
                                }}
                              >
                                🗑
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit">Save</button>
              <button type="button" onClick={handleCloseModal}>Cancel</button>
            </div>
          </form>
        </div>
      )} */}


      {/* {viewVendor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Vendor Details</h3>

            <p>
              <strong>ID:</strong> {viewVendor.id}
            </p>
            <p>
              <strong>Store Name:</strong> {viewVendor.store_name}
            </p>
            <p>
              <strong>Address:</strong>
              {viewVendor.pickup_locations?.map(
                (loc) => `${loc.city + " " + loc.state + " " + loc.country + "" + loc.pincode}`,
              )}
            </p>
            <p>
              <strong>Contact Number:</strong> {viewVendor.mobile_number}
            </p>
            <p>
              <strong>Status:</strong> {viewVendor.status}
            </p>

            <p>
              <strong>Profile:</strong>
              {viewVendor.profile_picture ? (
                <img
                  src={viewVendor.profile_picture || "/placeholder.svg"}
                  alt="profile"
                  style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
                />
              ) : (
                "No Image"
              )}
            </p>
            <button className="close1-btn1" onClick={() => setViewVendor(null)}>
              Close
            </button>
          </div>
        </div>
      )} */}
      {/* {vendorverifiedmodal && (
        <div className="modal">
          <form className="customer-form" onSubmit={handlevendorverifiedSubmit}>
            <h2> Enter your phone number</h2>
            <input
              type="number"
              name="verified_phone_number"
              placeholder="Enter your phone Number"
              value={form.verified_phone_number}
              onChange={handleInputChange}
            // style={{ borderColor: phoneErrors.verified_phone_number ? "red" : "" }}

            />
            {phoneErrors.verified_phone_number && (
              <span style={{ color: "red", fontSize: "17px" }}>{phoneErrors.verified_phone_number}</span>
            )}
            <div className="form-buttons">
              <button type="submit"> Create Vendor</button>
              <button

                type="button"
                onClick={() => {
                  setVendorverifiedModal(false)
                  setPhoneErrors({})
                  setForm(initialFormState)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )} */}

      {/* {deleteConfirmModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this vendor?</h3>
            <div className="form-buttons">
              <button
                className="otp-btn verify-btn"
                onClick={() => {
                  handleDelete(selectedVendorId)
                  setDeleteConfirmModal(false)
                }}
              >
                Yes
              </button>
              <button onClick={() => setDeleteConfirmModal(false)}>No</button>
            </div>
          </div>
        </div>
      )} */}

      {imageModal && (
        <div className="image-preview-overlay" onClick={() => setimageModal(false)}>
          <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Preview" />

          </div>
        </div>)}

      {/* {AddModal && (
        <div className="modal">
          <form className="address-form" onSubmit={handleAddressSubmit}>
            <h3>{addressEditingId ? "Edit Address" : "Add Address"}</h3>

            <label>Pincode:</label>



            <input
              type="text"
              name="pincode"
              placeholder="Enter your pincode"
              value={Addform.pincode}
              onChange={handleAddaddress}
              style={{ borderColor: addressErrors.pincode ? "red" : "" }}
            />
            {addressErrors.pincode && <span>{addressErrors.pincode}</span>}

            <label>Country:</label>
            <select
              name="country"

              value={Addform.country}
              onChange={handleAddaddress}
              style={{ borderColor: addressErrors.country ? "red" : "" }}
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {addressErrors.country && <span>{addressErrors.country}</span>}

            <label>State:</label>
            <select
              name="state"
              value={Addform.state}
              onChange={handleAddaddress}
              disabled={!Addform.country}
              style={{ borderColor: addressErrors.state ? "red" : "" }}
            >
              <option value="">Select State</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {addressErrors.state && <span>{addressErrors.state}</span>}

            <label>City:</label>
            <input
              type="text"
              name="city"
              placeholder="Enter your City"
              value={Addform.city}
              onChange={handleAddaddress}
              style={{ borderColor: addressErrors.city ? "red" : "" }}
            />
            {addressErrors.city && <span>{addressErrors.city}</span>}

            <label>Address 1:</label>
            <input
              type="text"
              name="address_line1"
              placeholder="Enter your address"
              value={Addform.address_line1}
              onChange={handleAddaddress}
              style={{ borderColor: addressErrors.address_line1 ? "red" : "" }}
            />
            {addressErrors.address_line1 && <span>{addressErrors.address_line1}</span>}

            <label>Address 2:</label>
            <input
              type="text"
              name="address_line2"
              placeholder="Enter your address"
              value={Addform.address_line2}
              onChange={handleAddaddress}
            />

            <div className="address-buttons">
              <button type="submit">Save</button>
              <button type="button" onClick={handleCloseAdddModal}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )} */}


       {VendoropenModal && (
        <div className="modal-overlay" onClick={() => setVendorData(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Uploaded Documents</h3>

            {/* {SelectedVendorId?.documents && SelectedVendorId.documents?.length > 0 ? (
              <ul className="doc-list">
                {SelectedVendorId.documents.map((doc, i) => (
                  <li key={i}>
                    {doc.file_url ? (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        📄 {doc.document_type_display || doc.document_type}
                      </a>
                    ) : (
                      <span className="docno">📄 No Document Uploaded</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-docs">No documents uploaded.</p>
            )} */}

            {SelectedVendorId?.documents ? (
  <ul className="doc-list">
    {Object.entries(SelectedVendorId.documents)
      .filter(([key]) => key !== "id" && key !== "vendor")
      .map(([key, value]) => (
        <li key={key}>
          {value ? (
            <a href={value} target="_blank" rel="noopener noreferrer">
              📄 {key.replace(/_/g, " ").toUpperCase()}
            </a>
          ) : (
            <span className="docno">
              📄 {key.replace(/_/g, " ").toUpperCase()} - Not Uploaded
            </span>
          )}
        </li>
      ))}
  </ul>
) : (
  <p className="no-docs">No documents uploaded.</p>
)}
            <button className="close1-btn1" onClick={() => setVendorModal(false)}>
              Close
            </button>
          </div>
        </div>
      )} 
   {RejectionVendorModal && (
  <div className="confirm-overlay">
    <div className="reason-modal modern-reason-modal">

      <button
        className="closes-modal"
        onClick={() => {
          setRejectionModal(false);
          setReason("");
        }}
      >
        <IoClose />
      </button>

      <div
        className={`reason-icon ${
          selectedStatus === "rejected"
            ? "reject-bg"
            : "suspend-bg"
        }`}
      >
        {selectedStatus === "rejected" ? "✕" : "❚❚"}
      </div>

      <h2>
        {selectedStatus === "rejected"
          ? "Reject Vendor"
          : "Suspend Vendor"}
      </h2>

      <p className="reason-subtitle">
        {selectedStatus === "rejected"
          ? "Please provide a reason for rejection."
          : "Please provide a reason for suspension."}
      </p>

  <div
  className={`vendor-info-card ${
    selectedStatus === "rejected"
      ? "reject-card"
      : "suspend-card"
  }`}
>
  <div className="vendor-row">
    <span className="label">Vendor Name</span>

    <span
      className={`value ${
        selectedStatus === "rejected"
          ? "reject-text"
          : "suspend-text"
      }`}
    >
      {SelectedVendor?.business_name || "N/A"}
    </span>
  </div>
</div>

      {/* Reason Box */}
      <div className="reason-field">
        <label>
          Reason <span>*</span>
        </label>

        <textarea
 className={`reason-box ${
    selectedStatus === "rejected"
      ? "reject-reason-box"
      : "suspend-reason-box"
  }`}
          value={Reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={
            selectedStatus === "rejected"
              ? "Enter reason for rejection..."
              : "Enter reason for suspension..."
          }
        />
      </div>

     
      <div
  className={`info-box ${
    selectedStatus === "rejected"
      ? "reject-info-box"
      : "suspend-info-box"
  }`}
>
  <span
    className={`infos-icon ${
      selectedStatus === "rejected"
        ? "reject-infos-icon"
        : "suspend-infos-icon"
    }`}
  >
    {selectedStatus === "rejected" ? "✕" : "⏸"}
  </span>

  <span>
    {selectedStatus === "rejected"
      ? "The vendor will be notified about the rejection reason."
      : "The vendor will temporarily lose access to the platform."}
  </span>
</div>

    <div className="confirm-buttons">
        <button
          className="cancels-btn"
          onClick={() => {
            setRejectionModal(false);
            setReason("");
          }}
        >
          Cancel
        </button>

    <button
  className={`approve-btn ${
    selectedStatus === "rejected"
      ? "rejects-btn"
      : "suspend-btn"
  }`}
  onClick={(e) => {
    if (!Reason.trim()) {
      toast.error(
        selectedStatus === "rejected"
          ? "Please enter rejection reason"
          : "Please enter suspension reason"
      );
      return;
    }

    submitRejection(e);
  }}
>
  {selectedStatus === "rejected" ? "Reject" : "Suspend"}
</button>
      </div>
    </div>
  </div>
)}
      {approveModal && (
  <div className="confirm-overlay">
    <div className="confirm-modal">

      <button
        className="closes-modal"
        onClick={() => {
          setApproveModal(false);
          setSelectedVendorId(null);
        }}
      >
        <IoClose />
      </button>

      <div className="approval-icon-wrapper">
        <FaCheckCircle className="approval-icon" />
      </div>

      <h2 className="confirm-title">
        Approve Vendor
      </h2>

      <p className="confirm-description">
        Are you sure you want to approve this vendor?
      </p>

   <div className="vendor-info-card">
  <div className="vendor-row">
    <span className="label">Vendor Name</span>

    <span
      className={`value ${
        selectedStatus === "rejected"
          ? "reject-text"
          : selectedStatus === "suspended"
          ? "suspend-text"
          : "approve-text"
      }`}
    >
      {SelectedVendor?.business_name || "N/A"}
    </span>
  </div>
</div>

      <div className="info-box">
        <span className="info-icon">ℹ</span>

        <span>
          This action will grant vendor access to the platform.
        </span>
      </div>

      <div className="confirm-buttons">

        <button
          className="cancels-btn"
          onClick={() => {
            setApproveModal(false);
            setSelectedVendorId(null);
          }}
        >
          Cancel
        </button>

       <button
  className="approve-btn"
  disabled={isApproving}
  onClick={async () => {
    if (isApproving) return;

    setIsApproving(true);

    try {
      await handleStatusChange(
        selectedVendorId,
        "approved"
      );

      setApproveModal(false);
      setSelectedVendorId(null);
    } finally {
      setIsApproving(false);
    }
  }}
>
  {isApproving ? "Approving..." : "Approve"}
</button>

      </div>

    </div>
  </div>
)}
   <ToastContainer position="top-center" autoClose={2000} />
      </>
  )
}

export default Vendor;

