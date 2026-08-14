 import React, { useState ,useEffect } from 'react';
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { IoClose } from "react-icons/io5";
import { FaArrowLeft } from "react-icons/fa";


import BASE_URL from "../../../Base";
        import { FaStore, FaEnvelope, FaPhone, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaUser, FaVenusMars, FaMapMarkerAlt, FaBox, FaShoppingCart, FaDollarSign, FaWallet, FaPercent, FaBan, FaEye, FaDownload, FaCheck, FaRedoAlt, FaBuilding, FaIdCard, FaCogs, FaSearch } from 'react-icons/fa';
        import { MdVerified, MdBlock, MdWarning } from 'react-icons/md';
        import { useParams } from 'react-router-dom';
        
        import {
  FiEye,
  FiDownload,
  FiCheckCircle,
  FiPauseCircle,
  FiXCircle,
  FiInfo
} from "react-icons/fi";
        import './VendorDetail.css';
        import Documents from "./Documents";
        import { useNavigate } from 'react-router-dom';

        const VendorDetail = () => {
            
            const [activeTab, setActiveTab] = useState('basic');
            const navigate = useNavigate();
            const[Loading,setLoading]=useState(false);
const { vendorId } = useParams();
        
//             const vendor = {
//                 name: "GreenLeaf Organic Store",
//                 owner: "Rajesh Kumar",
//                 email: "rajesh@greenleaf.com",
//                 phone: "+91 98765 43210",
//                 altPhone: "+91 99887 76655",
//                 dob: "15 Aug 1985",
//                 gender: "Male",
//                 address: "123, Sector 14, Gurugram, Haryana - 122001",
//                 storeType: "Grocery Store",
//                 category: "Organic Food, Vegetables, Dairy",
//                 gst: "06AABCU9603R1Z8",
//                 pan: "ABCDE1234F",
//                 regNumber: "UDYAM-HR-01-1234567",
//                 businessAddress: "45, Industrial Area, Phase 2, Gurugram",
//                 joiningDate: "12 Jan 2023",
//                 status: "Approved",
//                 kycStatus: "Verified",
//                 totalProducts: 245,
//                 totalOrders: 1890,
//                 totalSales: 457200,
//                 commission: "10%",
//                 walletBalance: 28500,
//                 vendorStatus: "Active",
//                 accountStatus: "Active",
//             };
// const doc = [
//   {
//     id: 1,
//     name: "Aadhaar Card",
//     status: "Verified",
//     date: "05 Jun 2026",
//   },
//   {
//     id: 2,
//     name: "PAN Card",
//     status: "Verified",
//     date: "05 Jun 2026",
//   },
//   {
//     id: 3,
//     name: "GST Certificate",
//     status: "Verified",
//     date: "05 Jun 2026",
//   },
//   {
//     id: 4,
//     name: "Cancelled Cheque",
//     status: "Pending",
//     date: "02 Jun 2026",
//   },
//   {
//     id: 5,
//     name: "Bank Statement",
//     status: "Pending",
//     date: "02 Jun 2026",
//   },
// ];
const [vendorData, setVendorData] = useState({});
const [vendorLoadingAction, setVendorLoadingAction] = useState(false);
const [vendorActionType, setVendorActionType] = useState(null);
const [vendorReason, setVendorReason] = useState("");
const [approveModal, setApproveModal] = useState(false);
const [Error, setError] = useState(null);

const getVendorDetail = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired");
    navigate("/login");
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(
      `${BASE_URL}/vendors/admin/vendor/?id=${vendorId}`,
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

    const data = await response.json();

    console.log("Vendor Data:", data);

    if (data.success) {
      const v = data.data;

      setVendorData({
        ...v,
        documents: v.documents || {},
        bank_details: Array.isArray(v.bank_details)
          ? v.bank_details
          : [],
      });
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch vendor");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (vendorId) {
    getVendorDetail();
  }
}, [vendorId]);

            const tabs = [
                { key: 'basic', label: 'Overview' },
                { key: 'Documents', label: 'Documents' },
                { key: 'bank', label: 'Bank Details' },
                { key: 'activity', label: 'Activity Log' },
            ];

const handleVendorAction = async ( vendorId,status, reason = "") => {
  setVendorLoadingAction(true);

  try {
    const token = sessionStorage.getItem("superadmin_token");

    const payload = {
    
      status,
    };

    if (status === "rejected" || status === "suspended") {
      payload.reason = reason;
    }

    const res = await fetch(
        `${BASE_URL}/vendors/admin/vendor/${vendorId}/review-status/`,
    
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

    const data = await res.json();

    if (data.success) {
      toast.success(`Vendor ${status} successfully`);

      setVendorData((prev) => ({
        ...prev,
        approval_status: status,
      }));
    } else {
      toast.error(data.message || "Failed to update vendor status");
    }
  } catch (err) {
    toast.error("Something went wrong");
  } finally {
    setVendorLoadingAction(false);
  }
};


const handleVendorReasonSubmit = async () => {
  if (!vendorReason.trim()) {
    toast.error(
      vendorActionType === "rejected"
        ? "Please enter rejection reason"
        : "Please enter suspension reason"
    );
    return;
  }

  await handleVendorAction(
    vendorData?.id,          // Vendor ID
    vendorActionType,        // rejected/suspended
    vendorReason             // reason
  );

  setVendorActionType(null);
  setVendorReason("");
};

              return (
                <div className="vendor-details-page">
                        <button
        className="customer-back-btn"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft />
   
      </button>
                   
                    <div className="vendor-overview">
                
                        <div className="overview-left">
                           <div className="vendor-logo">
                                <FaStore />
                            </div>
                            <div className="vendor-info">
                                <h1 className="vendor-name">  {vendorData?.business_name || "-"}</h1>
                                <div className="vendor-contact">
                                    <span><FaEnvelope />  {vendorData?.business_email || "-"}</span>
                                    <span><FaPhone /> {vendorData?.business_phone || "-"}</span>
                                    <span><FaCalendarAlt /> Joined:  {vendorData?.verified_at
      ? new Date(vendorData.verified_at).toLocaleDateString("en-GB")
      : "-"}</span>
                                </div>
                              <span
  className={`status-badge ${vendorData?.approval_status || "pending"}`}
>
  {vendorData?.approval_status === "approved" && <FiCheckCircle />}
  {vendorData?.approval_status === "rejected" && <FiXCircle />}
  {vendorData?.approval_status === "suspended" && <FiPauseCircle />}

  {vendorData?.approval_status || "pending"}
</span>
                            </div>
                        </div>
                     <div className="overview-right">
  <div className="kyc-card">
    <div className="kyc-header">
      <MdVerified
        className={`kyc-icon ${
          vendorData?.approval_status === "approved"
            ? "icon-approved"
            : vendorData?.approval_status === "rejected"
            ? "icon-rejected"
            : vendorData?.approval_status === "suspended"
            ? "icon-suspended"
            : ""
        }`}
      />

      <span>KYC Status</span>
    </div>

    <span
      className={`kyc-status ${
        vendorData?.approval_status === "approved"
          ? "verified"
          : vendorData?.approval_status === "rejected"
          ? "rejected"
          : vendorData?.approval_status === "suspended"
          ? "suspended"
          : "pending"
      }`}
    >
      {vendorData?.approval_status || "Pending"}
    </span>

    <span className="kyc-subtext">
      {vendorData?.approval_status === "approved" &&
        "Vendor Approved Successfully"}

      {vendorData?.approval_status === "rejected" &&
        "Vendor Rejected"}

      {vendorData?.approval_status === "suspended" &&
        "Vendor Suspended"}

      {!vendorData?.approval_status &&
        "Awaiting Verification"}
    </span>
  </div>
</div>
                    </div>

                   
                  <div className="tabs">
  {tabs.map((tab) => (
    <button
      key={tab.key}
      className={activeTab === tab.key ? "active-tab" : ""}
      onClick={() => setActiveTab(tab.key)}
    >
      {tab.label}
    </button>
  ))}
</div>

                
                    {activeTab === "basic" && (
  <div className="info-cards-section">

   <div className="vendor-card">
  <div className="cards-header">
    <FaUser className="card-icon" />
    <h3>Contact Person</h3>
  </div>

  <div className="card-body">
    <div className="info-row-vendor">
      <span className="label">Name</span>
      <span className="value">
        {vendorData?.contact_person_name || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Designation</span>
      <span className="value">
        {vendorData?.contact_person_designation || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Email</span>
      <span className="value">
        {vendorData?.contact_person_email_address || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Phone</span>
      <span className="value">
        {vendorData?.contact_person_phone_number || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Alt Phone</span>
      <span className="value">
        {vendorData?.contact_person_alternate_phone || "-"}
      </span>
    </div>
  </div>
</div>
 <div className="vendor-card">
  <div className="cards-header">
    <FaBuilding className="card-icon" />
    <h3>Business Information</h3>
  </div>

  <div className="card-body">
    <div className="info-row-vendor">
      <span className="label">Business Name</span>
      <span className="value">
        {vendorData?.business_name || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Legal Name</span>
      <span className="value">
        {vendorData?.legal_name || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Business Type</span>
      <span className="value">
        {vendorData?.business_type || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Established</span>
      <span className="value">
        {vendorData?.year_established || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Employees</span>
      <span className="value">
        {vendorData?.employee_count || "-"}
      </span>
    </div>
  </div>
</div>

    <div className="vendor-card">
  <div className="cards-header">
    <FaPhone className="card-icon" />
    <h3>Business Contact</h3>
  </div>

  <div className="card-body">
    <div className="info-row-vendor">
      <span className="label">Business Email</span>
      <span className="value">
        {vendorData?.business_email || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Business Phone</span>
      <span className="value">
        {vendorData?.business_phone || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Verified Phone</span>
      <span className="value">
        {vendorData?.verified_phone_number || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Website</span>
      <span className="value">
        {vendorData?.website ? (
          <a
            href={vendorData.website}
            target="_blank"
            rel="noopener noreferrer"
          >
            {vendorData.website}
          </a>
        ) : (
          "-"
        )}
      </span>
    </div>
  </div>
</div>



  <div className="vendor-card">
  <div className="cards-header">
    <FaCogs className="card-icon" />
    <h3>Account Status</h3>
  </div>

  <div className="card-body">
    <div className="info-row-vendor">
      <span className="label">Approval Status</span>
      <span
        className={`value ${
          vendorData?.approval_status === "approved"
            ? "status-active"
            : "status-pending"
        }`}
      >
        {vendorData?.approval_status || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Verified</span>
      <span className="value">
        {vendorData?.is_verified ? "Yes" : "No"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Active</span>
      <span className="value">
        {vendorData?.is_active ? "Yes" : "No"}
      </span>
    </div>


    <div className="info-row-vendor">
      <span className="label">Verified At</span>
      <span className="value">
        {vendorData?.verified_at
          ? new Date(vendorData.verified_at).toLocaleDateString("en-GB")
          : "-"}
      </span>
    </div>
  </div>
</div>


   <div className="vendor-card">
  <div className="cards-header">
    <FaIdCard className="card-icon" />
    <h3>Registration Details</h3>
  </div>

  <div className="card-body">
    <div className="info-row-vendor">
      <span className="label">GST Number</span>
      <span className="value">
        {vendorData?.gst_number || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">PAN Number</span>
      <span className="value">
        {vendorData?.pan_number || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">License Number</span>
      <span className="value">
        {vendorData?.license_number || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">FSSAI Number</span>
      <span className="value">
        {vendorData?.fssai_number || "-"}
      </span>
    </div>
  </div>
</div>

   <div className="vendor-card">
  <div className="cards-header">
    <FaMapMarkerAlt className="card-icon" />
    <h3>Business Address</h3>
  </div>

  <div className="card-body">
    <div className="info-row-vendor">
      <span className="label">Street</span>
      <span className="value">
        {vendorData?.street_address || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">City</span>
      <span className="value">
        {vendorData?.city || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">State</span>
      <span className="value">
        {vendorData?.state || "-"}
      </span>
    </div>

    <div className="info-row-vendor">
      <span className="label">Pincode</span>
      <span className="value">
        {vendorData?.pincode || "-"}
      </span>
    </div>
  </div>
</div>

 
  

  

  </div>

  
)}

{activeTab === "bank" && (
  <div className="bank-verification-wrapper">

    {vendorData?.bank_details?.map((bank) => (
      <div className="bank-card" key={bank.id}>
        <div className="bank-top">

          <div>
            <h3>{bank.bank_name}</h3>

            <span
              className={`bank-badge ${
                bank.is_selected ? "primary" : "secondary"
              }`}
            >
              {bank.is_selected
                ? "Primary Account"
                : "Secondary Account"}
            </span>
          </div>

        </div>

        <div className="bank-grid">

          <div>
            <label>Account Holder</label>
            <p>{bank.account_holder_name || "-"}</p>
          </div>

          <div>
            <label>Account Number</label>
            <p>**** **** {bank.account_number?.slice(-4) || "-"}</p>
          </div>

          <div>
            <label>IFSC Code</label>
            <p>{bank.ifsc_code || "-"}</p>
          </div>

          <div>
            <label>Branch Name</label>
            <p>{bank.branch_name || "-"}</p>
          </div>

          <div>
            <label>UPI ID</label>
            <p>{bank.upi_id || "-"}</p>
          </div>

          <div>
            <label>Payment Terms</label>
            <p>
              {bank.payment_terms
                ? `${bank.payment_terms} Days`
                : "-"}
            </p>
          </div>

        </div>
      </div>
    ))}

   
  </div>
)}

{activeTab === "Documents" && (
  <div className="documents-tab">
    {vendorData?.documents && (
      <Documents documentsData={vendorData.documents} />
    )}
  </div>
)}



                    <div className="card footer-action-bar">
        <div className="footer-info">
          <span className="info-icon"><FiInfo size={22} /></span>
          <div>
            <h4>Review the doctor's profile and take appropriate action.</h4>
            <p>Please verify all the details before approving.</p>
          </div>
        </div>
       <div className="action-buttons-row">

 <button
  className="btn btn-reject-outline"
  onClick={() => {
    setVendorActionType("rejected");
    setVendorReason("");
  }}
  disabled={vendorLoadingAction}
>
  <FiXCircle size={16} /> Reject
</button>
<button
  className="btn btn-suspend-outline"
  onClick={() => {
    setVendorActionType("suspended");
    setVendorReason("");
  }}
  disabled={vendorLoadingAction}
>
  <FiPauseCircle size={16} /> Suspend
</button>
 
<button
  className="btn btn-approve"
  onClick={() => setApproveModal(true)}
  disabled={vendorLoadingAction}
>
  <FiCheckCircle size={16} /> Approve
</button>

</div>
      </div>

{approveModal && (
  <div className="confirm-overlay">
    <div className="confirm-modal">

      <button
        className="closes-modal"
        onClick={() => setApproveModal(false)}
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

          <span className="value approve-text">
            {vendorData?.business_name || "N/A"}
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
          onClick={() => setApproveModal(false)}
        >
          Cancel
        </button>



        <button
          className="approve-btn"
          disabled={vendorLoadingAction}
          onClick={async () => {
            await    handleVendorAction(vendorData?.id, "approved")
            setApproveModal(false);
          }}
        >
          {vendorLoadingAction
            ? "Approving..."
            : "Approve"}
        </button>

      </div>

    </div>
  </div>
)}
    
{(vendorActionType === "rejected" ||
  vendorActionType === "suspended") && (
  <div className="confirm-overlay">
    <div className="reason-modal modern-reason-modal">

      <button
        className="closes-modal"
        onClick={() => {
          setVendorActionType(null);
          setVendorReason("");
        }}
      >
        <IoClose />
      </button>

      <div
        className={`reason-icon ${
          vendorActionType === "rejected"
            ? "reject-bg"
            : "suspend-bg"
        }`}
      >
        {vendorActionType === "rejected" ? "✕" : "❚❚"}
      </div>

      <h2>
        {vendorActionType === "rejected"
          ? "Reject Vendor"
          : "Suspend Vendor"}
      </h2>

      <p className="reason-subtitle">
        {vendorActionType === "rejected"
          ? "Please provide a reason for rejection."
          : "Please provide a reason for suspension."}
      </p>

      <div
        className={`vendor-info-card ${
          vendorActionType === "rejected"
            ? "reject-card"
            : "suspend-card"
        }`}
      >
        <div className="vendor-row">
          <span className="label">Vendor Name</span>

          <span
            className={`value ${
              vendorActionType === "rejected"
                ? "reject-text"
                : "suspend-text"
            }`}
          >
            {vendorData?.business_name || "N/A"}
          </span>
        </div>
      </div>

      <div className="reason-field">
        <label>
          Reason <span>*</span>
        </label>

        <textarea
        className={`reason-box ${
    vendorActionType === "rejected"
      ? "reject-reason-box"
      : "suspend-reason-box"
  }`}
          value={vendorReason}
          onChange={(e) =>
            setVendorReason(e.target.value)
          }
          placeholder={
            vendorActionType === "rejected"
              ? "Enter reason for rejection..."
              : "Enter reason for suspension..."
          }
        />
      </div>

      <div
        className={`info-box ${
          vendorActionType === "rejected"
            ? "reject-info-box"
            : "suspend-info-box"
        }`}
      >
        <span
          className={`infos-icon ${
            vendorActionType === "rejected"
              ? "reject-infos-icon"
              : "suspend-infos-icon"
          }`}
        >
          {vendorActionType === "rejected"
            ? "✕"
            : "⏸"}
        </span>

        <span>
          {vendorActionType === "rejected"
            ? "The vendor will be notified about the rejection reason."
            : "The vendor will temporarily lose access to the platform."}
        </span>
      </div>

      <div className="confirm-buttons">

        <button
          className="cancels-btn"
          onClick={() => {
            setVendorActionType(null);
            setVendorReason("");
          }}
        >
          Cancel
        </button>

      <button
  className={`approve-btn ${
    vendorActionType === "rejected"
      ? "rejects-btn"
      : "suspend-btn"
  }`}
  onClick={handleVendorReasonSubmit}
  disabled={vendorLoadingAction}
>
  {vendorLoadingAction
    ? "Processing..."
    : vendorActionType === "rejected"
    ? "Reject"
    : "Suspend"}
</button>
      </div>
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






            );
        };

        export default VendorDetail;