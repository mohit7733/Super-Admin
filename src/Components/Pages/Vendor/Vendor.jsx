import * as XLSX from "xlsx";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { countries, statesByCountry } from "../../data/locationData"
import BASE_URL from "../../../Base";

import { FiFileText } from "react-icons/fi";
import {  BsThreeDotsVertical } from "react-icons/bs";



const userId = localStorage.getItem("USER_ID")
const initialFormState = {
  user: userId,
  first_name:"",
  last_name:"",
  store_name: "",
  phone_number: "",
  profile_picture: null,
  gst_number:"",
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
  const [ISUserID, setISUserID] = useState(false)
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""])
  const otpRefs = useRef([])
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState(null)
  const [addressErrors, setAddressErrors] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [phoneErrors, setPhoneErrors] = useState({})
  const [otpErrors, setOtpErrors] = useState({})
  const bulktableRef = useRef(null)
  const [selectedVendors, setSelectedVendors] = useState([]);
  const fetchedOnce = useRef(false);
   const [userId, setUserId] = useState(null);
   const [currentpage,setcurentpage]=useState(1);
   const[Vendorperpage,setVendorperpage]=useState(5);
  const [previewImage, setPreviewImage] = useState(null);
const [imageModal, setimageModal] = useState(false);
 const [uploadedDocs, setUploadedDocs] = useState([]);
 const[VendoropenModal,setVendorModal] = useState(false);
 const[SelectedVendorId,setSelectedIdVendor] = useState(null);
 const [RejectionVendorModal,setRejectionModal] = useState(false);
 const[Reason,setReason]=useState("");
 const [selectedStatus, setSelectedStatus] = useState("");
 const[ActionButtonModal,setActionModal] = useState(false);
 const [openMenuId, setOpenMenuId] = useState(null);


 

const documentOptions = [
    { value: "gst_certificate", label: "GST Certificate" },
    { value: "shop_license", label: " Shop License" },
    { value: "owner_id_proof", label: "Government ID Proof" },
  ];
 
  
  
  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const navigate = useNavigate()

  useEffect(() => {
    if (!fetchedOnce.current) {
      getVendorList();
      fetchedOnce.current = true; 
    }
  }, []);


  const getVendorList = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/vendors/vendor/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();
    const sortedData = data.data;
    setVendorData(sortedData);
    console.log("vendordata---->", sortedData);

  } catch (err) {
    console.error(err.message);
    setError("Something went wrong while fetching vendor data.");
    toast.error("Failed to fetch vendor data");
  } finally {
    setLoading(false);
  }
};
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
    navigate(`/vendorproduct/${id}`)
  }

  const validateAddressForm = () => {
    const errors = {}

    if (!Addform.pincode || !/^\d{6}$/.test(Addform.pincode)) {
      errors.pincode = "Pincode must be exactly 6 digits"
    }

    if (!Addform.country) {
      errors.country = "Please select a country"
    }

    if (!Addform.state) {
      errors.state = "Please select a state"
    }

    if (!Addform.city) {
      errors.city = "Please select a city"
    }

    if (!Addform.address_line1 || Addform.address_line1.trim()?.length < 5) {
      errors.address_line1 = "Address line 1 must be at least 5 characters long"
    }

    setAddressErrors(errors)
    return Object.keys(errors)?.length === 0
  }

 
  const validateVendorForm = () => {
  const errors = {};

  
  if (!form.store_name || form.store_name.trim()?.length < 2) {
    errors.store_name = "Store name must be at least 2 characters long";
  }

  
  if (!form.gst_number || form.gst_number.trim() === "") {
    errors.gst_number = "GST number is required";
  } else {
    const gst = form.gst_number.trim().toUpperCase();

    
    if (gst?.length !== 15) {
      errors.gst_number = "GST number must be exactly 15 characters";
    }

   
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

    if (!gstRegex.test(gst)) {
      errors.gst_number = "Invalid GST format. Example: 27ABCDE1234F1Z5";
    }
  }

  setFormErrors(errors);
  return Object.keys(errors)?.length === 0;
};


  

 const handleStatusChange = async (vendorId, newStatus) => {
    
    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(`${BASE_URL}/vendors/approvevendor/${vendorId}/`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:`bearer${token}`
        },
        body: JSON.stringify({
      status: newStatus
        }),
      })
      if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      setVendorData((prev) =>
        prev.map((vendor) =>
          vendor.id === vendorId ? { ...vendor,status :newStatus } : vendor,
        ),
      )
    } catch (err) {
      console.error(err)
      toast.error("Error updating vendor status")
    }
  }

const updateVendor = (updatedVendor) => {
  setVendorData((prevVendors) =>
    prevVendors.map((v) => (v.id === updatedVendor.id ? updatedVendor : v))
  )
}


const handleDelete = async (id) => {
  const token = sessionStorage.getItem("superadmin_token");

  
  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/vendors/vendor/${id}/`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

   
    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    if (!res.ok) {
      toast.error("Failed to delete vendor");
      return;
    }

    
    setVendorData((prev) => prev.filter((v) => v.id !== id));
    toast.success("Vendor deleted successfully");

  } catch (err) {
    console.error(err);
    toast.error("Something went wrong while deleting vendor");
  }
};

 const submitRejection = async (e) => {
  e.preventDefault();

  await handleStatusChange(selectedVendorId, selectedStatus, Reason);
  setRejectionModal(false);
  setReason("");
  setSelectedIdVendor(null);
  setSelectedStatus("");
};
const handleRejectClick = (VendorId, statusType) => {
  setSelectedVendorId(VendorId);
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

  const handleAddressSubmit = async (e) => {
    e.preventDefault()

    if (!validateAddressForm()) {
      toast.error("Please Enter valid Input")
      return
    }

    const { ...rest } = Addform
    const finalData = {
      vendor: addressVendorId,
      ...rest,
    }

    if (!addressVendorId) {
      toast.error("Vendor not selected for address")
      return
    }
    const token = sessionStorage.getItem("superadmin_token");


   
    const method = addressEditingId ? "PUT" : "POST";
const url = addressEditingId
  ? `${BASE_URL}/vendors/vendoraddress/${addressEditingId}/`
  : `${BASE_URL}/vendors/vendoraddress/`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(finalData),
      })

      if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

      if (!response.ok) throw new Error("Server responded with an error.")

      await getVendorList()
      handleCloseAdddModal()
      toast.success(`Address ${addressEditingId ? "updated" : "added"} successfully`)
    } catch (err) {
      console.error("Submit Error:", err)
      toast.error("Failed to save address")
        handleCloseAdddModal()
    setAddform(intialAddressform) 
    }
  }


const handleFormSubmit = async (e) => {
  e.preventDefault();

  const token = sessionStorage.getItem("superadmin_token");

  const formData = new FormData();
  formData.append("first_name",form.first_name);
  formData.append("last_name",form.last_name);
  formData.append("store_name", form.store_name);
  formData.append("secondary_number", `+91${form.verified_phone_number}`);
  formData.append("gst_number", form.gst_number);
  
 
  if (form.profile_picture && typeof form.profile_picture !== "string") {
    formData.append("profile_picture", form.profile_picture);
  }

  
  let docIndex = 0;
  uploadedDocs.forEach((item) => {
    if (item.file) {
      formData.append(`document_types[${docIndex}]`, item.type);
      formData.append(`documents[${docIndex}]`, item.file); 
      
      docIndex++;
    }
  });

  const method = editingId ? "PUT" : "POST";

  if (method === "POST") {
    const uid = userId || localStorage.getItem("USER_ID");
    if (uid) formData.append("user_id", uid);
  }

  const url = editingId
    ? `${BASE_URL}/vendors/vendor/${editingId}/`
    : `${BASE_URL}/vendors/vendor/`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
       
      },
      body: formData,
    });

    if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again.");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }

    if (!response.ok) {
      throw new Error("Server error");
    }

    const data = await response.json();

    if (editingId) {
      updateVendor(data);
    } else {
      setVendorData((prev) => [...prev, data]);
    }

    await getVendorList();
    handleCloseModal();

    toast.success(`Vendor ${editingId ? "updated" : "added"} successfully`);
  } catch (err) {
    console.error("Submit Error:", err);
    toast.error("Failed to save vendor");
    handleCloseModal();
    setForm(initialFormState);
  }
};


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
    if(uid){
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


const handleCheckboxChange = (vendorId) => {
  setSelectedVendors(prev =>
    prev.includes(vendorId)
      ? prev.filter(id => id !== vendorId)
      : [...prev, vendorId]                 
  );
};


const getInitials = (firstName = "", lastName = "") => {
  return (
    (firstName?.[0] || "").toUpperCase() +
    (lastName?.[0] || "").toUpperCase()
  );
};


  const filteredVendors = vendorData?.filter((vendor) => {
    const matchesSearch =
      vendor?.store_name === null || vendor?.store_name?.toLowerCase().includes(searchTerm?.toLowerCase())
    return matchesSearch
   
  })

  .sort((a, b) => {
    if (!a.store_name) return 1;  
    if (!b.store_name) return -1;
    return a.store_name.localeCompare(b.store_name);
  })
  const availableStates = statesByCountry[Addform.country] || []
  
const indexoflastvendor = currentpage*Vendorperpage;
const indexoffirstvendor= indexoflastvendor - Vendorperpage;
const totalPages = Math.ceil(filteredVendors?.length/Vendorperpage);
const CurrentVendorpage =filteredVendors.slice(indexoffirstvendor,indexoflastvendor)
const handlePageChange =(pageNumber)=>setcurentpage(pageNumber);


  return (
    <>
        <div className="page-header">
        <h2>Vendors List</h2>

        <div className="vendors-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search vendors by storename..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
          <button
  className="add-vendor-btn"
  onClick={() => {
    setVendorverifiedModal(true);

    
    setUploadedDocs([]);     
    setEditingId(null);      
    setForm(initialFormState);
  }}
>
  + Add Vendor
</button>

           <button className="export-btn" onClick={exportToCSV}>
  Export Details
</button>

          </div>
        </div>
        <div className="vendors-stats">
          <div className="stat-card">
            <h3>Total Vendors</h3>
            <div className="stat-value">{vendorData?.length}</div>
          </div>
          <div className="stat-card">
            <h3>Active Vendors</h3>
            <div className="stat-value">{vendorData?.filter((v) => v.is_approved === true)?.length}</div>
          </div>
          <div className="stat-card">
            <h3>Pending Approval</h3>
            <div className="stat-value">{vendorData?.filter((v) => v.is_approved === false)?.length}</div>
          </div>
        </div>
        <div classsName="table-container">
        <table className="customers-table" ref={bulktableRef}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Profile</th>
              <th> vendor</th>
              <th>Store Name</th>
              <th>Location</th>
              <th>Gst Number</th>
              <th>Phone Number</th>
                <th>Status</th>
                 <th> Documents </th>

              <th>Action</th>
             
              
            </tr>
          </thead>
          {loading ? (
             <tr>
            <td colSpan="10" style={{ textAlign: "center", padding: "20px" }}>
              <div className="circular-loader"></div>
            </td>
          </tr>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <tbody>
              {CurrentVendorpage.map((vendor,index) => (
                <tr key={vendor.id}>
                
                  <td className="id1">{indexoffirstvendor+index+1}</td>
 <td>
  <div className="customer-avatar-wrapper">
    {vendor.profile_picture ? (
      <img
        src={vendor.profile_picture}
        alt="profile"
        className="customer-avatar-img"
        onClick={() => {
          setPreviewImage(vendor.profile_picture);
        setimageModal(true);
        }}
      />
    ) : (
      <div className="customer-avatar">
        {getInitials(vendor.first_name, vendor.last_name)}
      </div>
    )}
  </div>
</td>
<td>{vendor.first_name && vendor.last_name ?`${vendor.first_name} ${vendor.last_name}`:"NA"}</td>
  

 
<td>{vendor.store_name ?? "NA"}</td>
                  <td>
                    {vendor.pickup_locations?.map(
                      (loc) =>
                        `${loc.pincode + "," + loc.country + " ," + loc.state + "," + loc.city + "" + loc.address_line1 + "," + loc.address_line2}`,
                    )}
                  </td>
                                    <td>{vendor.gst_number}</td>
                                     
                                    <td>{vendor.verified_phone_number}</td>
                                  <td>
                                  <select
  value={vendor.status}
  onChange={(e) => {
   const newStatus = e.target.value;
    if (newStatus === "rejected" || newStatus === "suspended") {
      handleRejectClick(vendor.id, newStatus);  
    } else {
      handleStatusChange(vendor.id, newStatus);
    }
  }}
  className="status-dropdown"
>
  <option value="pending">Pending</option>
  <option value="approved">Approved</option>
  <option value="rejected">Rejected</option>
  <option value="suspended">Suspended</option>
</select>
                  </td>

    <td style={{ textAlign: "center" }}>
                                    <FiFileText size={20} color="#71a33f"
                                      onClick={() => openDocumentModal(vendor)}
                                    />
                                  </td>                            
               
 <td style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>

  <button
    className="action-menu-toggle"
    onClick={() =>
      setOpenMenuId(openMenuId === vendor.id ? null : vendor.id)
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
    <div
      className="action-buttons-modal"
      
    >
      {vendor.status === "approved" && (
        <button
          className="action-btn1"
          title="View vendor product"
          onClick={() => handleNavigate(vendor.id)}
        >
         <span className="icon">👁</span> 
  <span>Detail Page</span>
        </button>
      )}

      <button
        title="Edit Vendor Details"
        className="action-btn1 "
        onClick={() => {
          const existingDocs = [];
          if (vendor?.documents?.length > 0) {
            vendor?.documents?.forEach((doc) => {
              existingDocs.push({
                type: doc.document_type,
                file: null,
                existingUrl: doc.file_url,
              });
            });
          }

          setForm({
            first_name: vendor.first_name || "",
            last_name: vendor.last_name || "",
            store_name: vendor.store_name || "",
            gst_number: vendor.gst_number || "",
            verified_phone_number: vendor.verified_phone_number
              ? vendor.verified_phone_number.startsWith("+91")
                ? vendor.verified_phone_number.slice(3)
                : vendor.verified_phone_number
              : "",
            profile_picture: vendor.profile_picture || null,
            documentType: "",
            documentFile: null,
          });

          setUploadedDocs(
            vendor.documents?.map((doc) => ({
              type: doc.document_type,
              file: null,
              existingUrl: doc.file_url,
            })) || []
          );

          setEditingId(vendor.id);
          setModalOpen(true);
        }}
      >
 <span className="icon">✏️</span>
  <span>Edit Detail</span>
      </button>

      <button
        className="action-btn1"
        title="Delete vendor"
        onClick={() => {
          setSelectedVendorId(vendor.id);
          setDeleteConfirmModal(true);
        }}
      >
  <span className="icon">🗑</span>
  <span>Delete</span>
      </button>

      {vendor.pickup_locations?.length === 0 && (
        <button
          className="action-btn1"
          title="Add Address"
          onClick={() => {
            setAddModal(true);
            setAddressVendorId(vendor.id);
            setAddform(intialAddressform);
            setAddressEditingId(null);
          }}
        >
  <span className="icon">➕</span>
  <span>Add Address</span>
        </button>
      )}
{vendor.pickup_locations?.length > 0 &&(
   <button
        title="Edit Address "
        className="action-btn1"
        onClick={() => {
          const addr = vendor.pickup_locations?.[0];
          setAddModal(true);
          setAddressVendorId(vendor.id);

          if (addr) {
            setAddressEditingId(addr.id);
            setAddform({
              pincode: addr.pincode ?? "",
              country: addr.country ?? "",
              state: addr.state ?? "",
              city: addr.city ?? "",
              address_line1: addr.address_line1 ?? "",
              address_line2: addr.address_line2 ?? "",
            });
          } else {
            setAddressEditingId(null);
            setAddform(intialAddressform);
            setAddressErrors({});
          }
        }}
      >
   <span className="icon">📍</span>
  <span>Edit Address</span>

      </button>
)}
      
    </div>
  )}
</td>    
                </tr>
              ))}
            </tbody>
          )}
        </table>
          {filteredVendors?.length> Vendorperpage &&(
          < div className="pagination"> 

<button onClick={()=>handlePageChange(currentpage-1)} disabled={currentpage === 1}> Prev</button>
 
{Array.from({ length: totalPages}, (_, i) => i + 1).map(number => (
  <button
    key={number} 
    className={currentpage === number ? "active" : ""} 
    onClick={() => handlePageChange(number)}
  >
    {number}
  </button>
))}

<button onClick={()=>handlePageChange(currentpage +1)} disabled={currentpage === totalPages}> Next</button>

          </div>
        )}

        </div>

       {modalOpen && (
  <div className="modal">
    <form className="product-form" onSubmit={handleFormSubmit}>
      <h3>{editingId ? "Edit Vendor" : "Add Vendor"}</h3>


<div className="form-grid">

      <div className="form-column-1">
        <div className="form-field">
          <label> First Name :</label>
        <input
        name = "first_name"
        value ={form.first_name}
        onChange={handleInputChange}
        
        />
        </div>
        <div className="form-field">
          <label> Last Name :</label>
          <input
          name = "last_name"
          value ={form.last_name}
          onChange ={handleInputChange}
          
          />
        </div>

        <div className="form-field">
          <label>Store Name:</label>
          <input
            name="store_name"
            value={form.store_name}
            onChange={handleInputChange}
            style={{ borderColor: formErrors.store_name ? "red" : "" }}
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
      background: "#71a33f",
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
)}


        {viewVendor && (
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
              <button className="close-btn" onClick={() => setViewVendor(null)}>
                Close
              </button>
            </div>
          </div>
        )}
        {vendorverifiedmodal && (
          <div className="modal">
            <form className="customer-form" onSubmit={handlevendorverifiedSubmit}>
              <h2> Enter your phone number</h2>
              <input
                type="number"
                name="verified_phone_number"
                placeholder="Enter your phone Number"
                value={form.verified_phone_number}
                onChange={handleInputChange}
                style={{ borderColor: phoneErrors.verified_phone_number ? "red" : "" }}
               
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
        )}
      
        {deleteConfirmModal && (
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
        )}

        {imageModal && (
 <div className="image-preview-overlay" onClick={() => setimageModal(false)}>
    <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
      <img src={previewImage} alt="Preview" />
      
    </div>
  </div>)}

{AddModal && (
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
)}
{}

 {VendoropenModal && (
        <div className="modal-overlay" onClick={() => setVendorData(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Uploaded Documents</h3>

            {SelectedVendorId?.documents && SelectedVendorId.documents?.length > 0 ? (
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
            )}
            <button className="close-btn" onClick={() => setVendorModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
{RejectionVendorModal &&(
  <div className=" modal">
    <div className="modal-content">
    <form classsName="customer-form">
      <h3> Enter Rejection Reason </h3>
      <textarea
      value={Reason}
      placeholder ="enter the reason "
      onChange={(e)=>setReason(e.target.value)}
      />
      <div className="form-buttons">
        <button onClick={submitRejection} type = "submit">   Submit  </button>
        <button type="button" onClick ={()=>setRejectionModal(false)}> Cancel </button>
      </div>

    </form>
    </div>
    </div>
)}


        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          closeButton
        />
      </div>
    </>
  )
}

export default Vendor;

