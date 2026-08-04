import React from "react";
import {
  FaTimes,
  FaFileMedical,
  FaUserMd,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaClipboardList,
  FaNotesMedical,
  FaHeartbeat,
  FaAllergies,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaPills,
  FaDownload,
} from "react-icons/fa";
import "./Allpresciption.css";

const PresciptionModal = ({
  show,
  prescription,
  onClose,
  onDownload,
}) => {
  if (!show || !prescription) return null;

  const formatTime = (time) => {
    if (!time) return "-";
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
      case "completed":
      case "confirmed":
        return {
          background: "#ecfdf5",
          color: "#059669",
        };
      case "sent":
        return {
          background: "#eff6ff",
          color: "#1d4ed8",
        };
      case "pending":
        return {
          background: "#fffbeb",
          color: "#d97706",
        };
      default:
        return {
          background: "#f9fafb",
          color: "#374151",
        };
    }
  };

  return (
    <div className="drawer-overlay">
      <div className="drawer">
        
        {/* Header */}
        <div className="drawer-header">
          <h2>Prescription Details</h2>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="drawer-content">
          
          {/* Top Details Card */}
          <div className="details-card">
            
            {/* LEFT: Meta Info */}
            <div className="meta-info">
              <div className="meta-item">
                <p>Prescription Code</p>
                <strong style={{ color: "#059669" }}>{prescription.prescription_code}</strong>
              </div>
              
              <div className="meta-item">
                <p>Status</p>
                <span 
                  className="status-badge" 
                  style={getStatusStyle(prescription.status)}
                >
                  {prescription.status}
                </span>
              </div>
              
              <div className="meta-item">
                <p>Doctor</p>
                <strong>{prescription.doctor_name}</strong>
              </div>
              
              <div className="meta-item">
                <p>Patient</p>
                <strong>{prescription.patient_name}</strong>
              </div>
              
              <div className="meta-item">
                <p>Appointment Date</p>
                <strong>{prescription.appointment_date}</strong>
              </div>
              
              <div className="meta-item">
                <p>Time</p>
                <strong>
                  {formatTime(prescription.start_time)} - {formatTime(prescription.end_time)}
                </strong>
              </div>
              
              <div className="meta-item">
                <p>Follow Up</p>
                <strong style={{ color: "#059669" }}>
                  {prescription.follow_up?.required
                    ? `Required after ${prescription.follow_up.after_days} Days`
                    : "Not Required"}
                </strong>
              </div>
            </div>

            {/* RIGHT: Medical Info */}
            <div className="medical-info">
              <div className="med-item">
                <FaHeartbeat className="med-icon" />
                <div>
                  <p>Symptoms</p>
                  <strong>{prescription.symptom_description || "-"}</strong>
                </div>
              </div>
              
              <div className="med-item">
                <FaClipboardList className="med-icon" />
                <div>
                  <p>Diagnosis / Advice</p>
                  <strong>{prescription.diagnosis_advice || "-"}</strong>
                </div>
              </div>
              
              <div className="med-item">
                <FaNotesMedical className="med-icon" />
                <div>
                  <p>History of Past Illness</p>
                  <strong>{prescription.history_of_past_illness || "-"}</strong>
                </div>
              </div>
              
              <div className="med-item">
                <FaAllergies className="med-icon" />
                <div>
                  <p>Allergies</p>
                  <strong>{prescription.allergies || "N/A"}</strong>
                </div>
              </div>
              
              <div className="med-item">
                <FaUsers className="med-icon" />
                <div>
                  <p>Family History</p>
                  <strong>{prescription.family_history || "-"}</strong>
                </div>
              </div>
              
              <div className="med-item">
                <FaNotesMedical className="med-icon" />
                <div>
                  <p>Clinical Notes</p>
                  <strong>{prescription.clinical_notes || "-"}</strong>
                </div>
              </div>
            </div>
          </div>

          
          <div className="dos-donts-grid">
            <div className="dos-box">
              <h4>
                <FaCheckCircle /> DO'S
              </h4>
              <ul>
                {prescription.dos?.length ? (
                  prescription.dos.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <li>No Do's Available</li>
                )}
              </ul>
            </div>
            
            <div className="donts-box">
              <h4>
                <FaTimesCircle /> DON'TS
              </h4>
              <ul>
                {prescription.donts?.length ? (
                  prescription.donts.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))
                ) : (
                  <li>No Don'ts Available</li>
                )}
              </ul>
            </div>
          </div>

        
          <div className="medicines-box">
            <h4>
              <FaPills /> Medicines
            </h4>
            
            {prescription.items?.length ? (
              <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontSize: "12px" }}>
                    <th style={{ padding: "8px 0" }}>Name</th>
                    <th style={{ padding: "8px 0" }}>Dosage</th>
                    <th style={{ padding: "8px 0" }}>Frequency</th>
                    <th style={{ padding: "8px 0" }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {prescription.items.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #f9fafb", fontSize: "14px" }}>
                      <td style={{ padding: "12px 0" }}>{item.name}</td>
                      <td style={{ padding: "12px 0" }}>{item.dosage}</td>
                      <td style={{ padding: "12px 0" }}>{item.frequency}</td>
                      <td style={{ padding: "12px 0" }}>{item.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-medicines">
                <div className="empty-icon">
                  <FaPills size={24} color="#cbd5e1" />
                </div>
                <p>No medicines prescribed.</p>
                <span>There are no medicines added in this prescription.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="drawer-footer">
          <button 
            className="btn-download"
            onClick={() => onDownload(prescription.id)}
          >
            <FaDownload /> Download PDF
          </button>
          <button 
            className="btn-cancel"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PresciptionModal;