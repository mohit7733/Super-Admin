import React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
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
  const patient = {
    id: "b2ccc5d9-ff69-48b6-9261-5adae30cd466",
    first_name: "Diksha",
    last_name: "Yadav",
    dob: "2000-05-29",
    gender: "Female",
    blood_group: null,
    relation: "Self",
    height: null,
    weight: null,
    phone_number: "+91 8585920220",
    email: "devimanjudevi038@gmail.com",
    profile_picture: null,
    emergency_contact_name: null,
    emergency_contact_relation: null,
    emergency_contact_phone: null,
    insurance_provider: null,
    insurance_policy_number: null,
    insurance_valid_thru: null,
    created_at: "2026-06-23T08:23:20.018962Z",
    is_active: false,
  };
  const[activeTab,setActiveTab]=useState("Appointment");
   const {PatientId} = useParams();
   const[AppointmentLoading,setAppointmentLoading]=useState(false);
   const[AppointmentError,setAppointmentError]=useState(null);
   const[AppointmentData,setAppintmentData]=useState([]);
   const[TransactionLoading,setTransactionLoading]=useState(false);
   const[TransactionError,setTransactionError]=useState(null);
   const[TransactionData,setTransactionData]=useState([]);
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



  return (
    <div className="patient-page">
      {/* Header */}
      <div className="patient-header-card">
        <div className="patient-left">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                {patient?.profile_image ? (
                  <img
                    src={patient.profile_image}
                    alt="doctor"
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
              {patient.first_name} {patient.last_name}
            </h2>

          <h4>Date of Birth</h4>
                <p>
                  {new Date(patient.dob).toLocaleDateString("en-GB")}
                </p>

            <div className="patient-meta">
              <span>
                <FiPhone />
                {patient.phone_number}
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
    <p>{patient.email}</p>
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

        



             <button className={activeTab === "Appointment" ? "active-tab" : ""}
            onClick={() => setActiveTab("Appointment")}
          >

      Appointment
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
          activeTab === "Appointment" && (
            <div className="consultation-main-card">


              <div className="consultation-header">

                <div className="consultation-title-wrap">

                  <div className="consultation-line"></div>

                  <div>
                    <h2>Appointment History </h2>

                    <p>
                      Track all Appointment activities,
                      approvals, rejections and pending requests
                    </p>
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
                  {AppointmentLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td colSpan="10"><div className="skeleton-row"></div></td>
                      </tr>
                    ))
                  ) : AppointmentError ? (
                    <p colSpan="6" style={{ color: "red" }}>{AppointmentError}</p>
                  ) : (
                    <tbody>
                      {AppointmentData && AppointmentError?.length > 0 ? (
                        AppointmentData?.map((appointment, index) => (
                          <tr key={appointment.id}>
                            <td className="id1">{index + 1}</td>
                            <td> {appointment.patient_name}</td>
                            <td>{appointment.doctor_name}</td>
                            <td>{appointment.amount}</td>
                            <td>{appointment.appointment_date}</td>
                            <td>{appointment.start_time}</td>
                            <td>{appointment.end_time}</td>
                            <td>{appointment.consultation_type}</td>
<td>
  <span
    className="status-badge"
    style={getStatusStyle(appointment.status)}
  >
    {appointment.status}
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