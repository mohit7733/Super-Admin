import React from "react";
import { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify';
import BASE_URL from "../../../Base";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
 import Documents from "../Vendor/Documents"

import {
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";


import {
  FiPhone,
  FiMessageCircle,
  FiVideo,
  FiCalendar,
  FiMail,
  FiDroplet,
  FiUser,
  FiActivity,
  FiMapPin,
} from "react-icons/fi";
import "./PatientDetails.css";

const PatientDetails = () => {
 
  const[activeTab,setActiveTab]=useState("Consultation");
   
   
   const[TransactionLoading,setTransactionLoading]=useState(false);
   const[TransactionError,setTransactionError]=useState(null);
   const[TransactionData,setTransactionData]=useState([]);
   const [patient, setPatientData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
  const [Data, setData] = useState([]);
   const [ConsultationLoading, setConsultationLoading] = useState(false);
    const [ConsultationError, setConsultationError] = useState(null);
     const pagesize = 5;
      const [totalCount, setTotalCount] = useState(0);
      const totalPages = Math.ceil(totalCount / pagesize);
      const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    
      const [currentpage, setCurrentPage] = useState(1);
      const [Nextpage, setNextpage] = useState(null);
    
      const [previousPage, setPreviousPage] = useState(null);
      const [PatientDocuments, setPatientDocuments] = useState([]);
const [DocumentLoading, setDocumentLoading] = useState(false);
const [DocumentError, setDocumentError] = useState(null);


const { PatientId } = useParams();
const navigate = useNavigate();
   
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
      case "reschulded":
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
 const getConsultationhistory = async (page = 1) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session Expired , Login Again")
      navigate("/login");
    }

    try {
      setConsultationLoading(true);

      const response = await fetch(
       `${BASE_URL}/doctors/admin/consultation-history/?patient_id=${PatientId}&page=${page}`,
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

const getPatientDetail = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/patients/admin/patients/?id=${PatientId}`,
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

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log("Patient Detail:", data);

    if (data.success) {
      setPatientData(data.data);
    } else {
      toast.error(data.message);
    }
  } catch (err) {
    console.error(err);
    setError("Failed to fetch patient details");
    toast.error("Failed to fetch patient details");
  } finally {
    setLoading(false);
  }
};
const getPatientDocuments = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    setDocumentLoading(true);

    const response = await fetch(
      `${BASE_URL}/patients/admin/medical-records/?patient_id=${PatientId}`,
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

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log("Patient Documents:", data);

    if (data.success) {
      setPatientDocuments(data.data || []);
    } else {
      toast.error(data.message || "Failed to fetch documents");
      setPatientDocuments([]);
    }
  } catch (err) {
    console.error(err);

    setDocumentError("Something went wrong while fetching documents.");
    toast.error("Failed to fetch patient documents");
  } finally {
    setDocumentLoading(false);
  }
};
useEffect(() => {
  getPatientDetail();
  getConsultationhistory();
  getPatientDocuments();

}, [PatientId]);


  return (
    <div className="patient-page">
      

      <div className="patient-header-card">
        <div className="patient-left">
            <div className="avatar-section">
              <div className="avatar-wrapper">
             {patient?.profile_picture ? (
  <img
    src={patient.profile_picture}
    alt="patient"
    className="avatar-img"
  />
) : (
  <div className="avatar-placeholder">
    {patient?.first_name?.charAt(0)?.toUpperCase()}
    {patient?.last_name?.charAt(0)?.toUpperCase()}
  </div>
)}

              </div>
          
            </div>

          <div className="patient-info">
           
            <h2>
           <h2>
  {patient?.first_name} {patient?.last_name}
</h2>
            </h2>

          <h4>Date of Birth</h4>
                <p>
               <p>
  {patient?.dob
    ? new Date(patient.dob).toLocaleDateString("en-GB")
    : "N/A"}
</p>
                </p>

            <div className="patient-meta">
              <span>
                <FiPhone />
          {patient?.phone_number || "N/A"}
              </span>

              <span>
                <FiCalendar />
                Joined:
                {new Date(patient.created_at).toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>
        </div>

        <div className="patient-right">
          <div className="action-icons">
          

          

           
          </div>

          
        </div>
      </div>

     <div className="info-grid">

  {/* About Patient */}
  <div className="patientinfo-card">
    <div className="card-header">
      <h3>About Patient</h3>
    </div>

    <div className="patient-info-grid">

      <div className="patient-info-item">
        <div className="item-icon">
          <FiCalendar />
        </div>
        <div className="item-content">
          <h4>DOB</h4>
          <p>{new Date(patient.dob).toLocaleDateString("en-GB")}</p>
        </div>
      </div>

      <div className="patient-info-item">
        <div className="item-icon">
          <FiDroplet />
        </div>
        <div className="item-content">
          <h4>Blood Group</h4>
          <p>{patient.blood_group || "N/A"}</p>
        </div>
      </div>

      <div className="patient-info-item">
        <div className="item-icon">
          <FiUser />
        </div>
        <div className="item-content">
          <h4>Gender</h4>
          <p>{patient.gender}</p>
        </div>
      </div>

     <div className="patient-info-item">
  <div className="item-icon">
    <FiPhone />
  </div>
  <div className="item-content">
    <h4>Phone Number</h4>
    <p>{patient.phone_number}</p>
  </div>

   
</div>

<div className="patient-info-item">
  <div className="item-icon">
    <FiMapPin />
  </div>
  <div className="item-content">
    <h4>Address</h4>
    <p>{patient.address}</p>
  </div>
</div>

<div className="patient-info-item">
  <div className="item-icon">
    <FiMail />
  </div>
  <div className="item-content">
    <h4>Email Address</h4>
 <p>{patient?.email || "N/A"}</p>
  </div>
</div>
    </div>
  </div>

 
  <div className="patientinfo-card">
    <div className="card-header">
      <h3>Profile Information</h3>
    </div>

    <div className="patient-info-grid">

      <div className="patient-info-item">
        <div className="item-icon">
          <FiActivity />
        </div>
        <div className="item-content">
          <h4>Height</h4>
          <p>{patient.height || "N/A"}</p>
        </div>
      </div>

      <div className="patient-info-item">
        <div className="item-icon">
          <FiActivity />
        </div>
        <div className="item-content">
          <h4>Weight</h4>
          <p>{patient.weight || "N/A"}</p>
        </div>
      </div>

      <div className="patient-info-item">
        <div className="item-icon">
          <FiActivity />
        </div>
        <div className="item-content">
          <h4>Insurance Provider</h4>
          <p>{patient.insurance_provider || "N/A"}</p>
        </div>
      </div>

      <div className="patient-info-item">
        <div className="item-icon">
          <FiActivity />
        </div>
        <div className="item-content">
          <h4>Policy Number</h4>
          <p>{patient.insurance_policy_number || "N/A"}</p>
        </div>
      </div>

      <div className="patient-info-item">
        <div className="item-icon">
          <FiCalendar />
        </div>
        <div className="item-content">
          <h4>Valid Thru</h4>
          <p>{patient.insurance_valid_thru || "N/A"}</p>
        </div>
      </div>

      <div className="patient-info-item">
        <div className="item-icon">
          <FiActivity />
        </div>
        <div className="item-content">
          <h4>Status</h4>
          <p>{patient.is_active ? "Active" : "Inactive"}</p>
        </div>
      </div>

    </div>
  </div>

</div>

  <div className="tabs">

        



             <button className={activeTab ==="Consultation" ? "active-tab" : ""}
            onClick={() => setActiveTab("Consultation")}
          >

    Consultation
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

          

          
        </div>
     
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

{activeTab === "documents" && (
  <div className="documents-tab">
    {DocumentLoading ? (
      <p>Loading documents...</p>
    ) : (
      <Documents documentsData={PatientDocuments} />
    )}
  </div>
)}

         {
                  activeTab === "Transaction" && (
                    <div className="consultation-main-card">
        
        
                      <div className="consultation-header">
        
                        <div className="consultation-title-wrap">
        
                          <div className="consultation-line"></div>
        
                          <div>
                            <h2>Transaction </h2>
        
                            <p>
                              Track all transaction activities,
                              Completed, Failed, and pending requests
                            </p>
                          </div>
        
                        </div>
        
                      </div>
        
        
                  
        
                      <div classsName="table-wrapper1">
                        <table className="data-table" >
                          <thead>
                            <tr>
                              <th>Id</th>
                              <th>Doctor Name</th>                   
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
     
   
    </div>
  );
};

export default PatientDetails;