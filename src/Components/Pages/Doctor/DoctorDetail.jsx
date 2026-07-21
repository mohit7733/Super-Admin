

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify"

import "react-toastify/dist/ReactToastify.css"
import { IoClose } from "react-icons/io5";


import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiUser,
  FiUsers,
  FiAward,
  FiBookOpen,
  FiInstagram,
  FiFacebook,
  FiLinkedin,
  FiFileText,
  FiEye,
  FiDownload,
  FiUpload,
} from "react-icons/fi";

import {
  FiCheckCircle,
  FiPauseCircle,
  FiXCircle,
  FiInfo,
  FiClock
} from "react-icons/fi";

import {
  BiShieldAlt2,
  BiMedal,
  BiRupee,
  BiCalendar,
  BiFirstAid,
  BiLeaf,
  BiUser,
  BiCalendarPlus,
  BiGlobe,
  BiFile,

} from "react-icons/bi";
import { FaUsers,FaBuilding } from "react-icons/fa";

import { IoLanguageOutline } from "react-icons/io5";

import {
  MdVerified,
  MdOutlineMedicalServices,
} from "react-icons/md";

import { BsPatchCheck } from "react-icons/bs";

import "./DoctorDetail.css";
import BASE_URL from "../../../Base";
import Doctor from "./Doctor";
import Calendar from "./Calendar"
import Documents from "../Vendor/Documents"

const DoctorDetail = () => {

  const { DoctorId } = useParams();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("personal");

  const [showAddModal, setShowAddModal] = useState(false);

  const [doctorData, setDoctorData] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [reason, setReason] = useState("");
  const [Data, setData] = useState([]);
  const [Error, setError] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [ConsultationLoading, setConsultationLoading] = useState(false);
  const [ConsultationError, setConsultationError] = useState(null);
  const [approveModal, setApproveModal] = useState(false);
  const[TransactionData,setTransactionData]=useState([]);
const[TransactionLoading,setTransactionLoading]=useState(false);
const[TransactionError,setTransactionError]=useState(null);
const[SlotData,setSlotData]=useState([]);
const[SlotLoading,setSlotLoading]=useState(false);
const[SlotError,setSlotError]=useState(null);


 const pagesize = 5;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pagesize);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const [currentpage, setCurrentPage] = useState(1);
  const [Nextpage, setNextpage] = useState(null);

  const [previousPage, setPreviousPage] = useState(null);
  
const getStatusStyle = (status) => {
  const value = status?.toLowerCase();

  switch (value) {
    case "success":
    case "completed":
    case "approved":
      return {
        background: "#dcfce7",
        color: "#15803d",
      };

    case "pending":
    case "processing":
      return {
        background: "#fef3c7",
        color: "#b45309",
      };

    case "failed":
    case "rejected":
    case "cancelled":
      return {
        background: "#fee2e2",
        color: "#dc2626",
      };

    case "confirmed":
      return {
        background: "#f3f4f6",
        color: "#6b7280",
      };

    case "refunded":
      return {
        background: "#ede9fe",
        color: "#7c3aed",
      };

    default:
      return {
        background: "#f3f4f6",
        color: "#4b5563",
      };
  }
};



  const getApprovalBadge = (status) => {
    switch (status) {
      case "approved":
        return {
          className: "badge-success",
          icon: <FiCheckCircle />,
          text: "Approved",
        };

      case "rejected":
        return {
          className: "badge-danger",
          icon: <FiXCircle />,
          text: "Rejected",
        };

      case "suspended":
        return {
          className: "badge-warning",
          icon: <FiPauseCircle />,
          text: "Suspended",
        };

      default:
        return {
          className: "badge-neutral",
          icon: <FiClock />,
          text: "Pending",
        };
    }
  };
  const approvalBadge = getApprovalBadge(doctorData?.approval_status);
   

 const handleAction = async (status, reason = "") => {
  setLoadingAction(true);

  try {
    const token = sessionStorage.getItem("superadmin_token");

    const payload = {
      doctor_id: DoctorId,
      status,
    };

    if (
      (status === "rejected" || status === "suspended") &&
      reason
    ) {
      payload.reason = reason;
    }

    const res = await fetch(
      `${BASE_URL}/doctors/admin/doctor/status/`,
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
      toast.success(`Doctor ${status} successfully`);

      setDoctorData((prev) => ({
        ...prev,
        approval_status: status,
      }));

      setActionType(null);
      setReason("");
      setApproveModal(false);
    } else {
      toast.error(data.message);
    }
  } catch (err) {
    toast.error("Something went wrong");
  } finally {
    setLoadingAction(false);
  }
};

  const safeJoin = (value) => {
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "string") return value;
    return "";
  };

const handleSubmitReason = async () => {
  if (!reason.trim()) {
    toast.error("Reason required");
    return;
  }

  await handleAction(actionType, reason);

  setActionType(null);
  setReason("");
};
  const getConsultationhistory = async (page = 1) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session Expired , Login Again")
      navigate("/login");
    }

    try {
      setConsultationLoading(true);

      const response = await fetch(
       `${BASE_URL}/doctors/admin/consultation-history/?doctor_id=${DoctorId}&page=${page}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Category API Response:", data);


      setData(data.data.results);
       setTotalCount(data.data.count);
      setCurrentPage(page);
      setNextpage(data.data.next);
      setPreviousPage(data.data.previous);
    } catch (error) {
      console.error(error.message);

      setConsultationError("Something went wrong while fetching categories");
       

      toast.error("Failed to fetch Category Data");
    } finally {
      setConsultationLoading(false);
    }
  };
 const getTransactionlist = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session Expired , Login Again")
      navigate("/login");
    }

    try {
      setTransactionLoading(true);

      const response = await fetch(
       `${BASE_URL}/doctors/admin/doctor/financial-metrics/?doctor_id=${DoctorId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Category API Response:", data);


      setTransactionData(data.data.details);
    } catch (error) {
      console.error(error.message);

      setTransactionError("Something went wrong while fetching categories");

      toast.error("Failed to fetch Category Data");
    } finally {
      setTransactionLoading(false);
    }
  };


  useEffect(() => {
    getConsultationhistory();
    getTransactionlist();
  }, [])

  //   const token = sessionStorage.getItem("superadmin_token");

  //   if (!token) {
  //     toast.error("Session expired. Please login again");
  //     navigate("/login");
  //     return;
  //   }

  //   setLoading(true);

  //   try {

  //     const response = await fetch(
  //       `${BASE_URL}/admin/consultation-history/?page=${page}`,
  //       {
  //         method: "GET",
  //         headers: {
  //           Accept: "application/json",
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${token}`,
  //           "ngrok-skip-browser-warning": "true",
  //         },
  //       }
  //     );

  //     if (response.status === 401 || response.status === 403) {
  //       sessionStorage.removeItem("superadmin_token");

  //       toast.error("Session expired. Please login again");

  //       navigate("/login");

  //       return;
  //     }

  //     const data = await response.json();

  //     console.log("Consultation History:", data);

  //     if (data.success) {

  //       setData(data?.data?.results || []);



  //     } else {

  //       toast.error(data.message || "Failed to fetch consultation history");

  //     }

  //   } catch (err) {

  // console.error(err);

  //     setError("Something went wrong while fetching consultation history.");

  //     toast.error("Failed to fetch consultation history");

  //   } finally {

  //     setLoading(false);

  //   }
  // }
  const getDoctorDetail = async () => {

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired");
      navigate("/login");
      return;
    }

    try {

      setLoading(true);


      const response = await fetch(
        `${BASE_URL}/doctors/admin/doctor?id=${DoctorId}`,
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
      // console.log("API DATA:", data);

      // if (data.success) {
      //   setDoctorData({
      //     ...data.data,
      //     documents: data.data.documents || [],
      //     languages_spoken: data.data.languages_spoken || [],
      //     consultation_modes: data.data.consultation_modes || [],
      //     specialized_therapies: data.data.specialized_therapies || [],
      //   });
      // }
      if (data.success) {
        const d = data.data;

        const safeArray = (val) => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") return [val];
          return [];
        };

       setDoctorData({
  ...d,


  documents: d.documents,

  languages_spoken: Array.isArray(d.languages_spoken)
    ? d.languages_spoken
    : [],

  consultation_modes: Array.isArray(d.consultation_modes)
    ? d.consultation_modes
    : [],

  specialized_therapies: Array.isArray(d.specialized_therapies)
    ? d.specialized_therapies
    : [],

  specializations: Array.isArray(d.specializations)
    ? d.specializations
    : [],
});
      }
    } catch (err) {

      console.error(err);

      setError("Failed to fetch doctor");

      toast.error("Failed to fetch doctor");

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {
    getDoctorDetail();
  }, []);

  if (Loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading doctor details...</p>
      </div>
    );
  }

  if (Error) {
    return (
      <div className="error-container">
        <p>{Error}</p>
        <button onClick={getDoctorDetail}>Retry</button>
      </div>
    );
  }

  if (!doctorData) {
    return <div>No doctor found</div>;
  }

  return (
    <>

      <div className="doctor-page">


        <div className="card profile-top-card">
          <div className="profile-main">

            <div className="avatar-section">
              <div className="avatar-wrapper">
                {doctorData?.profile_image ? (
                  <img
                    src={doctorData.profile_image}
                    alt="doctor"
                    className="avatar-img"
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {doctorData?.first_name?.charAt(0)?.toUpperCase()}
                    {doctorData?.last_name?.charAt(0)?.toUpperCase()}
                  </div>
                )}

              </div>
              <div className="status-badges">
                <span className={`badge ${approvalBadge.className}`}>
                  {approvalBadge.icon} {approvalBadge.text}
                </span>


              </div>
            </div>

            {/* Info Section */}
            <div className="profile-info-section">
              <div className="profile-header">
                <h1>
                  {doctorData?.title} {doctorData?.first_name} {doctorData?.last_name}
                  <MdVerified className="verified-tick" />
                </h1>
                <p className="subtitle">Ayurvedic Doctor</p>
              </div>

              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-icon"><BiMedal size={20} /></span>
                  <div>
                    <strong>{doctorData?.experience_years || 0}+</strong>
                    <p>Years Experience</p>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon"><BiRupee size={20} /></span>
                  <div>
                    <strong>₹{doctorData?.consultation_fee || 0}</strong>
                    <p>Consultation Fee</p>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-icon"><BiCalendar size={20} /></span>
                  <div>
                    <strong>{doctorData?.years_of_practice || 0}+</strong>
                    <p>Practice Years</p>
                  </div>
                </div>
              </div>

              <div className="tags-row">
                <span className="tag"><BiFirstAid size={14} /> {doctorData?.qualification}</span>
                {doctorData?.specialized_therapies?.map((item, i) => (
                  <span className="tag" key={i}>
                    <BiLeaf size={14} /> {item}
                  </span>
                ))}
                {doctorData?.primary_dosha_expertise && (
                  <span className="tag">
                    <BiUser size={14} /> {doctorData.primary_dosha_expertise} Expert
                  </span>
                )}
              </div>
            </div>
          </div>


          <div className="profile-side-info">
            <div className="side-details">
              <div className="detail-item">
                <BiCalendarPlus className="detail-icon" size={20} />
                <div>
                  <p className="detail-label">Date of Birth</p>
                  <p className="detail-value">{doctorData?.dob || "-"}</p>
                </div>
              </div>
              <div className="detail-item">
                <IoLanguageOutline className="detail-icon" size={20} />
                <div>
                  <p className="detail-label">Languages</p>
                  {doctorData?.languages_spoken?.join(", ") || "-"}
                </div>
              </div>
              <div className="detail-item">
                <BiGlobe className="detail-icon" size={20} />
                <div>
                  <p className="detail-label">Nationality</p>
                  <p className="detail-value">{doctorData?.nationality || "-"}</p>
                </div>
              </div>

            </div>
            <div className="action-buttons-column">

             <button
  className="btn btn-approve"
  onClick={() => setApproveModal(true)}
  disabled={loadingAction}
>
  <FiCheckCircle size={16} /> Approve
</button>
   <button
  className="btn btn-suspend"
  onClick={() => {
    setActionType("suspended");
    setReason("");
  }}
>
  <FiPauseCircle size={16} /> Suspend
</button>

<button
  className="btn btn-reject"
  onClick={() => {
    setActionType("rejected");
    setReason("");
  }}
>
  <FiXCircle size={16} /> Reject
</button>
            </div>
          </div>
        </div>

        <div className="tabs">

          <button
            className={activeTab === "personal" ? "active-tab" : ""}
            onClick={() => setActiveTab("personal")}
          >
            Overview
          </button>


 <button
            className={activeTab === "bank" ? "active-tab" : ""}
            onClick={() => setActiveTab("bank")}
          >
 Bank Detail
          </button>
             <button className={activeTab === "Availability" ? "active-tab" : ""}
            onClick={() => setActiveTab("Availability")}
          >

       Availability
          </button>      

          <button className={activeTab === "Consultation" ? "active-tab" : ""}
            onClick={() => setActiveTab("Consultation")}
          >

            Consultation History
          </button>




          <button
            className={activeTab === "Transaction" ? "active-tab" : ""}
            onClick={() => setActiveTab("Transaction")}
          >
         Transaction
          </button>

  <button
            className={activeTab === "documents" ? "active-tab" : ""}
            onClick={() => setActiveTab("documents")}
          >
            Documents
          </button>

          {/* <button
            className={activeTab === "Slots" ? "active-tab" : ""}
            onClick={() => setActiveTab("Slots")}
          >
          Slots
          </button> */}

          

          
        </div>

        {/* {showAddModal && (

          <div className="document-modal-overlay">

            <div className="document-modal">

              <div className="modal-top">

                <h2>Add Document</h2>

                <button
                  className="close-modal-btn"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  ×
                </button>

              </div>

              <div className="form-group">

                <label>Document Name</label>

                <input
                  type="text"
                  placeholder="Enter document name"
                />

              </div>

              <div className="form-group">

                <label>Upload File</label>

                <div className="upload-box">
                  <FiUpload />
                  <span>Choose File</span>
                </div>

              </div>

              <button className="save-document-btn">
                Save Document
              </button>

            </div>

          </div>
        )} */}

        {activeTab === "personal" && (

          <>
            <div className="info-flex">


              <div className="info-card">

                <h3 className="card-title">
                  <FiUser className="title-icon" />
                  Personal Information
                </h3>

                <div className="info-row">
                  <span>Date of Birth</span>
                  <p>{doctorData?.dob}</p>
                </div>

                <div className="info-row">
                  <span>Gender</span>
                  <p>{doctorData?.gender}</p>
                </div>

                <div className="info-row">
                  <span>Nationality</span>
                  <p>{doctorData?.nationality}</p>
                </div>

                <div className="info-row">
                  <span>Languages Spoken</span>
                  <p>
                    {doctorData?.languages_spoken?.join(", ")}
                  </p>
                </div>

                <div className="info-row">
                  <span>Bio</span>
                  <p className="detail-value">
                    {doctorData?.bio
                      ? doctorData.bio.split(" ").slice(0, 10).join(" ") +
                      (doctorData.bio.split(" ").length > 10 ? "..." : "")
                      : "No bio available"}
                  </p>
                </div>

              </div>


              <div className="info-card">

                <h3 className="card-title">
                  <FiPhone className="title-icon" />
                  Contact Information
                </h3>

                <div className="info-row">
                  <span>
                    <FiMail className="row-icon" />
                    Email
                  </span>

                  <p>{doctorData?.email||"N/A"}</p>
                </div>

                <div className="info-row">
                  <span>
                    <FiPhone className="row-icon" />
                    Phone
                  </span>

                  <p>{doctorData?.verified_phone_number||"N/A"}</p>
                </div>
               <div className="info-row">
  <span>
    <FiPhone className="row-icon" />
    Secondary Number
  </span>

  <p>{doctorData?.secondary_number || "N/A"}</p>
</div>

<div className="info-row address-row">
  <span>
    <FiMapPin className="row-icon" />
    Address
  </span>

  <p>
    {[
      doctorData?.address_line,
      doctorData?.city,
      doctorData?.state,
      doctorData?.pincode,
      doctorData?.country,
    ]
      .filter(Boolean)
      .join(", ") || "N/A"}
  </p>
</div>

              </div>



              <div className="info-card">

                <h3 className="card-title">
                  <FiUsers className="title-icon" />
                  Emergency Contact
                </h3>

                <div className="info-row">
                  <span>Contact Name</span>
                  <p>
                    {doctorData?.emergency_contact_name||"N/A"}
                  </p>
                </div>

                <div className="info-row">
                  <span>Relation</span>
                  <p>
                    {doctorData?.emergency_contact_relation||"N/A"}
                  </p>
                </div>

                <div className="info-row">
                  <span>Phone</span>
                  <p>
                    {doctorData?.emergency_contact_phone||"N/A"}
                  </p>
                </div>

              </div>



            </div>
            <div className="info-flex">



              <div className="info-card">

                <h3 className="card-title">
                  <MdOutlineMedicalServices className="title-icon" />
                  Professional Information
                </h3>

                <div className="info-row">
                  <span>Qualification</span>
                  <p>{doctorData?.qualification||"N/A"}</p>
                </div>

                <div className="info-row">
                  <span>Experience</span>
                  <p>
                    {doctorData?.experience_years||"N/A"} Years
                  </p>
                </div>

                <div className="info-row">
                  <span>Registration Number</span>
                  <p>
                    {doctorData?.registration_number||"N/A"}
                  </p>
                </div>

                <div className="info-row">
                  <span>Registration Council</span>
                  <p>
                    {doctorData?.registration_council||"N/A"}
                  </p>
                </div>

                <div className="info-row">
                  <span>Registration Year</span>
                  <p>
                    {doctorData?.registration_year||"N/A"}
                  </p>
                </div>

              </div>


              <div className="info-card">

                <h3 className="card-title">
                  <FiUser className="title-icon" />
                  Ayurvedic Details
                </h3>

                <div className="info-row">
                  <span>Primary Dosha Expertise</span>
                  <p>
                    {doctorData?.primary_dosha_expertise||"N/A"}
                  </p>
                </div>

                <div className="info-row">
                  <span>Therapies</span>
                  <p>
                    {doctorData?.specialized_therapies?.join(", ")||"N/A"}
                  </p>
                </div>

                <div className="info-row">
                  <span>Panchakarma Certified</span>
                  <p>
                    {doctorData?.is_panchakarma_certified
                      ? "Yes"
                      : "No"}
                  </p>
                </div>

                <div className="info-row">
                  <span>Ayurvedic Council ID</span>
                  <p>
                    {doctorData?.ayurvedic_council_id||"N/A"}
                  </p>
                </div>



              </div>



              <div className="info-card">

                <h3 className="card-title">
                  <FiBookOpen className="title-icon" />
                  Practice Details
                </h3>

             <div className="info-row">
  <span>Years of Practice</span>
  <p>
    {doctorData?.years_of_practice
      ? `${doctorData.years_of_practice} Years`
      : "N/A"}
  </p>
</div>
                <div className="info-row">
                  <span>Practicing Since</span>
                  <p>
                    {doctorData?.practicing_since ||"N/A"}
                  </p>
                </div>

                <div className="info-row">
                  <span>Consultation Fee</span>
                  <p>
                    ₹{doctorData?.consultation_fee||"N/A"}
                  </p>
                </div>

                <div className="info-row">
                  <span>Follow-up Fee</span>
                  <p>
                    ₹{doctorData?.followup_fee||"N/A"}
                  </p>
                </div>

                <div className="info-row">
                  <span>Consultation Modes</span>
                  <p>
                    {doctorData?.consultation_modes?.join(", ")||"N/A"}
                  </p>
                </div>

              </div>

              <div className="social-main-wrapper">
  <div className="social-grid">

    {/* LinkedIn */}
    <div className="social-card">
      <div className="social-icon linkedin-icon">
        <FiLinkedin />
      </div>

      <div className="social-content">
        <h3>LinkedIn</h3>

        <p>
          {doctorData?.linkedin_url || "LinkedIn profile not added"}
        </p>

        {doctorData?.linkedin_url ? (
          <a
            href={doctorData.linkedin_url}
            target="_blank"
            rel="noreferrer"
          >
            Visit Profile
          </a>
        ) : (
          <span className="disabled-social-link">
            Profile Not Added
          </span>
        )}
      </div>
    </div>

    {/* Facebook */}
    <div className="social-card">
      <div className="social-icon facebook-icon">
        <FiFacebook />
      </div>

      <div className="social-content">
        <h3>Facebook</h3>

        <p>
          {doctorData?.facebook_url || "Facebook profile not added"}
        </p>

        {doctorData?.facebook_url ? (
          <a
            href={doctorData.facebook_url}
            target="_blank"
            rel="noreferrer"
          >
            Visit Profile
          </a>
        ) : (
          <span className="disabled-social-link">
            Profile Not Added
          </span>
        )}
      </div>
    </div>

    {/* Instagram */}
    <div className="social-card">
      <div className="social-icon instagram-icon">
        <FiInstagram />
      </div>

      <div className="social-content">
        <h3>Instagram</h3>

        <p>
          {doctorData?.instagram_url || "Instagram profile not added"}
        </p>

        {doctorData?.instagram_url ? (
          <a
            href={doctorData.instagram_url}
            target="_blank"
            rel="noreferrer"
          >
            Visit Profile
          </a>
        ) : (
          <span className="disabled-social-link">
            Profile Not Added
          </span>
        )}
      </div>
    </div>

  </div>
</div>
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
  className="btn btn-suspend"
  onClick={() => {
    setActionType("suspended");
    setReason("");
  }}
>
  <FiPauseCircle size={16} /> Suspend
</button>

<button
  className="btn btn-reject"
  onClick={() => {
    setActionType("rejected");
    setReason("");
  }}
>
  <FiXCircle size={16} /> Reject
</button>

                <button
  className="btn btn-approve"
  onClick={() => setApproveModal(true)}
  disabled={loadingAction}
>
  <FiCheckCircle size={16} /> Approve
</button>

                </div>
              </div>

            </div>
          </>
        )}


        {
          activeTab === "Consultation" && (
            <div className="consultation-main-card">


              <div className="consultation-header">

                <div className="consultation-title-wrap">

                  <div className="consultation-line"></div>

                  <div>
                    <h2>Consultation History</h2>

                    <p>
                      Track all consultation activities,
                      approvals, rejections and pending requests
                    </p>
                  </div>

                </div>

              </div>


              <div className="consultation-stats-grid">

                {/* TOTAL */}
                <div className="consultation-stat-card">
                  <div className="consultation-icon-box">
                    <FaUsers />
                  </div>

                  <div className="consultation-stat-content">
                    <h4>TOTAL CONSULTATIONS</h4>
                    <h2>{Data?.data?.count}</h2>
                  </div>
                </div>


                <div className="consultation-stat-card">
                  <div className="consultation-icon-box ">
                    <FiCheckCircle />
                  </div>

                  <div className="consultation-stat-content">
                    <h4>APPROVED</h4>
                    <h2>0</h2>
                  </div>
                </div>


                <div className="consultation-stat-card">
                  <div className="consultation-icon-box ">
                    <FiXCircle />
                  </div>

                  <div className="consultation-stat-content">
                    <h4>REJECTED</h4>
                    <h2>0</h2>
                  </div>
                </div>


                <div className="consultation-stat-card">
                  <div className="consultation-icon-box ">
                    <FiClock />
                  </div>

                  <div className="consultation-stat-content">
                    <h4>PENDING</h4>
                    <h2>0</h2>
                  </div>
                </div>

              </div>

              <div classsName="table-wrapper1">
                <table className="data-table" >
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Patient Name</th>
                      <th>Doctor Name</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Start Time</th>
                      <th>End Time</th>
                      <th>Consultation Type</th>
                      <th>Status</th>

                    </tr>
                  </thead>
                  {ConsultationLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td colSpan="10"><div className="skeleton-row"></div></td>
                      </tr>
                    ))
                  ) : ConsultationError ? (
                    <p colSpan="6" style={{ color: "red" }}>{ConsultationError}</p>
                  ) : (
                    <tbody>
                      {Data && Data.length > 0 ? (
                        Data.map((consultation, index) => (
                          <tr key={consultation.id}>
                            <td className="id1">{index + 1}</td>
                            <td> {consultation.patient_name}</td>
                            <td>{consultation.doctor_name}</td>
                            <td>{consultation.amount}</td>
                        <td>
  {consultation.status_history?.[
    consultation.status_history.length - 1
  ]?.slot?.date || "-"}
</td>

<td>
  {consultation.status_history?.[
    consultation.status_history.length - 1
  ]?.slot?.start_time || "-"}
</td>

<td>
  {consultation.status_history?.[
    consultation.status_history.length - 1
  ]?.slot?.end_time || "-"}
</td>
                            <td>{consultation.consultation_type ||"N/A"}</td>
<td>
  <span
    className="status-badge"
    style={getStatusStyle(consultation.status)}
  >
    {consultation.status}
  </span>
</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" style={{ textAlign: "center" }}>
                            No Data Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  )}
                </table>




              </div>

               {totalPages > 1 && (
          <div className="pagination">


            <button
             onClick={() => getConsultationhistory(currentpage - 1)}
              disabled={!previousPage}
            >
              Prev
            </button>


            {pages.map((page) => (
              <button
                key={page}
                onClick={() => getConsultationhistory(page)}
                style={{

                  fontWeight: currentpage === page ? "bold" : "normal",
                  background: currentpage === page ? "#0D614E" : "#fff",
                  color: currentpage === page ? "#fff" : "#0D614E",
                }}
              >
                {page}
              </button>
            ))}


            <button
              onClick={() => getConsultationhistory(currentpage + 1)}
              disabled={!Nextpage}
            >
              Next
            </button>

          </div>
        )}


            </div>
          )
        }

        {
          activeTab === "Transaction" && (
            <div className="consultation-main-card">


              <div className="consultation-header">

                <div className="consultation-title-wrap">

                  <div className="consultation-line"></div>

                  <div>
                    <h2>Transaction History</h2>

                    <p>
                      Track all transaction activities,
                      Completed, Failed, and pending requests
                    </p>
                  </div>

                </div>

              </div>


              <div className="consultation-stats-grid">

                {/* TOTAL */}
                <div className="consultation-stat-card">
                  <div className="consultation-icon-box">
                    <FaUsers />
                  </div>

                  <div className="consultation-stat-content">
                    <h4>TOTAL </h4>
                    <h2>0</h2>
                  </div>
                </div>


                <div className="consultation-stat-card">
                  <div className="consultation-icon-box ">
                    <FiCheckCircle />
                  </div>

                  <div className="consultation-stat-content">
                    <h4>Completed</h4>
                    <h2>0</h2>
                  </div>
                </div>


                <div className="consultation-stat-card">
                  <div className="consultation-icon-box ">
                    <FiXCircle />
                  </div>

                  <div className="consultation-stat-content">
                    <h4>Failed</h4>
                    <h2>0</h2>
                  </div>
                </div>


                <div className="consultation-stat-card">
                  <div className="consultation-icon-box ">
                    <FiClock />
                  </div>

                  <div className="consultation-stat-content">
                    <h4>PENDING</h4>
                    <h2>0</h2>
                  </div>
                </div>

              </div>

              <div classsName="table-wrapper1">
                <table className="data-table" >
                  <thead>
                    <tr>
                      <th>Id</th>
                      <th>Patient Name</th>                   
                      <th>Amount</th>
                      <th> Date</th>
                      <th> Payment Method</th>
                    
                         <th>Status</th>

                    </tr>
                  </thead>
                  { TransactionLoading? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td colSpan="10"><div className="skeleton-row"></div></td>
                      </tr>
                    ))
                  ) : TransactionError ? (
                    <p colSpan="6" style={{ color: "red" }}>{TransactionError}</p>
                  ) : (
                    <tbody>
                      {TransactionData && TransactionData.length > 0 ? (
                 TransactionData.map((transaction, index) => (
                          <tr key={transaction.id}>
                            <td >{transaction.transaction_id}</td>
                            <td> {transaction.name}</td>
                            <td>{transaction.amount}</td>
                            <td>{transaction.date}</td>
                            <td>{transaction.payment_method}</td>
                          <td>
  <span
    className="status-badge"
    style={getStatusStyle(transaction.status)}
  >
    {transaction.status}
  </span>
</td>
                           

                        
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" style={{ textAlign: "center" }}>
                            No Data Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  )}
                </table>




              </div>

            </div>
          )
        }
       {
  activeTab === "bank" && (
 <div className="bank-verification-wrapper">
  {/* <div className="bank-header">
    <div>
      <h2>Bank Details & Verification</h2>
      <p>Review and verify doctor bank accounts</p>
    </div> */}
  

 

  {doctorData?.bank_details?.length > 0 ? (
  <>
    {doctorData.bank_details.map((bank) => (
      <div className="bank-card" key={bank.id}>
      <div className="bank-top">

        <div>
          <h3>{bank.bank_name}</h3>

          <span
            className={`bank-badge ${
              bank.is_selected ? "primary" : "secondary"
            }`}
          >
            {bank.is_selected ? "Primary Account" : "Secondary Account"}
          </span>
        </div>

        {/* <div>
          {bank.is_verified ? (
            <span className="verified-status">
              ✓ Verified
            </span>
          ) : (
            <span className="pending-status">
              Pending Verification
            </span>
          )}
        </div> */}

      </div>

      <div className="bank-grid">

        <div>
          <label>Account Holder</label>
          <p>{bank.account_holder_name}</p>
        </div>

        <div>
          <label>Account Number</label>
          <p>
            **** **** {bank.account_number?.slice(-4)}
          </p>
        </div>

        <div>
          <label>IFSC Code</label>
          <p>{bank.ifsc_code}</p>
        </div>

        <div>
          <label>Branch Name</label>
          <p>{bank.branch_name}</p>
        </div>

        <div>
          <label>UPI ID</label>
          <p>{bank.upi_id}</p>
        </div>

        <div>
          <label>Payment Terms</label>
          <p>{bank.payment_terms}</p>
        </div>

      </div>

    
    </div>
    ))}
  </>
) : (
  <div className="empty-bank-state">
    <FaBuilding size={50} className="empty-icon" />

    <h3>No Bank Details Available</h3>

    <p>
      This doctor has not added any bank account information yet.
    </p>
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
                      setActionType("rejected");
                      setReason("");
                    }}
                    disabled={loadingAction}
                  >
                    <FiXCircle size={16} /> Reject
                  </button>

                  <button
                    className="btn btn-suspend-outline"
                    onClick={() => {
                      setActionType("suspended");
                      setReason("");
                    }}
                    disabled={loadingAction}
                  >
                    <FiPauseCircle size={16} /> Suspend
                  </button>

                 <button
  className="btn btn-approve"
  onClick={() => setApproveModal(true)}
  disabled={loadingAction}
>
  <FiCheckCircle size={16} /> Approve
</button>

                </div>
              </div>
</div>




  )
}



        {
          activeTab === "Availability" && (
           
            < Calendar/>
          )
        }

    {(actionType === "rejected" ||
  actionType === "suspended") && (
  <div className="confirm-overlay"
   onClick={() => {
          setActionType(null);
          setReason("");
        }}
  >
    <div className="reason-modal modern-reason-modal"
     onClick={(e) => e.stopPropagation()}
    >

      <button
        className="closes-modal"
        onClick={() => {
          setActionType(null);
          setReason("");
        }}
      >
        <IoClose />
      </button>

      <div
        className={`reason-icon ${
          actionType === "rejected"
            ? "reject-bg"
            : "suspend-bg"
        }`}
      >
        {actionType === "rejected" ? "✕" : "❚❚"}
      </div>

      <h2>
        {actionType === "rejected"
          ? "Reject Doctor"
          : "Suspend Doctor"}
      </h2>

      <p className="reason-subtitle">
        {actionType === "rejected"
          ? "Please provide a reason for rejection."
          : "Please provide a reason for suspension."}
      </p>

      <div
        className={`vendor-info-card ${
          actionType === "rejected"
            ? "reject-card"
            : "suspend-card"
        }`}
      >
        <div className="vendor-row">
          <span className="label">Doctor Name</span>

          <span
            className={`value ${
              actionType === "rejected"
                ? "reject-text"
                : "suspend-text"
            }`}
          >
            {doctorData?.first_name} {doctorData?.last_name}
          </span>
        </div>
      </div>

      <div className="reason-field">
        <label>
          Reason <span>*</span>
        </label>

      <textarea
  className={`reason-box ${
    actionType === "rejected"
      ? "reject-reason-box"
      : "suspend-reason-box"
  }`}
  value={reason}
  onChange={(e) => setReason(e.target.value)}
  placeholder={
    actionType === "rejected"
      ? "Enter reason for rejection..."
      : "Enter reason for suspension..."
  }
/>
  
      </div>

      <div
        className={`info-box ${
          actionType === "rejected"
            ? "reject-info-box"
            : "suspend-info-box"
        }`}
      >
        <span
          className={`infos-icon ${
            actionType === "rejected"
              ? "reject-infos-icon"
              : "suspend-infos-icon"
          }`}
        >
          {actionType === "rejected"
            ? "✕"
            : "⏸"}
        </span>

        <span>
          {actionType === "rejected"
            ? "The doctor will be notified about the rejection reason."
            : "The doctor will temporarily lose access to the platform."}
        </span>
      </div>

      <div className="confirm-buttons">

        <button
          className="cancels-btn"
          onClick={() => {
            setActionType(null);
            setReason("");
          }}
        >
          Cancel
        </button>

        <button
          className={`approve-btn ${
            actionType === "rejected"
              ? "rejects-btn"
              : "suspend-btn"
          }`}
          onClick={handleSubmitReason}
          disabled={loadingAction}
        >
          {loadingAction
            ? "Processing..."
            : actionType === "rejected"
            ? "Reject"
            : "Suspend"}
        </button>

      </div>
    </div>
  </div>
)}
{activeTab === "documents" && (
  <div className="documents-tab">
    <Documents documentsData={doctorData?.documents} />
  </div>

  
)}
{approveModal && (
  <div className="confirm-overlay"
   onClick={() => {
    setApproveModal(false);
  
   
  }}
  >
    <div className="confirm-modal"
        onClick={(e) => e.stopPropagation()}
    >

      <button
        className="closes-modal"
        onClick={() => setApproveModal(false)}
      >
        ×
      </button>

      <div className="approval-icon-wrapper">
        <FiCheckCircle className="approval-icon" />
      </div>

      <h2 className="confirm-title">
        Approve Doctor
      </h2>

      <p className="confirm-description">
        Are you sure you want to approve this doctor?
      </p>

      <div className="vendor-info-card">
        <div className="vendor-row">
          <span className="label">Doctor Name</span>

          <span className="value approve-text">
            {doctorData?.first_name} {doctorData?.last_name}
          </span>
        </div>
      </div>

      <div className="info-box">
        <span className="info-icon">ℹ</span>

        <span>
          This action will approve the doctor account.
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
          disabled={loadingAction}
          onClick={async () => {
            await handleAction("approved");
            setApproveModal(false);
          }}
        >
          {loadingAction ? "Approving..." : "Approve"}
        </button>

      </div>

    </div>
  </div>
)}

<ToastContainer position="top-center" autoClose={2000} />

      </div>

    </>



  );
};

export default DoctorDetail;