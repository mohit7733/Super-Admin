import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import BASE_URL from "../../../Base";


const CustomerPatient = () => {
  const navigate = useNavigate();
  const { customerId } = useParams();

  const [patientData, setPatientData] = useState([]);
  const [patientError, setPatientError] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientModal, setShowPatientModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);


  const [search, setSearch] = useState("");

  const getCustomerPatients = async (page = 1, searchText = "") => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setPatientLoading(true);
    setPatientError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/patients/admin/patients/?customer_id=${customerId}`,
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

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      console.log("Customer Patients API Response:", data);

      if (data?.success) {
        const results = data?.data?.results || [];

        setPatientData(results);
        setTotalCount(data?.data?.count || 0);
        setNextPage(data?.data?.next || null);
        setPreviousPage(data?.data?.previous || null);
        setCurrentPage(page);
      } else {
        setPatientData([]);
        setTotalCount(0);

        const errorMessage =
          data?.message || "Failed to fetch customer patients";

        setPatientError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Customer Patients Fetch Error:", error);

      setPatientError("Something went wrong while fetching patient data.");
      setPatientData([]);

      toast.error("Failed to fetch customer patient data");
    } finally {
      setPatientLoading(false);
    }
  };


  useEffect(() => {
    getCustomerPatients(1, "");
  }, []);

  
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  

  const getStatusStyle = (status) => {
    if (status) {
      return {
        background: "#e8f8ef",
        color: "#198754",
      };
    }

    return {
      background: "#fdecec",
      color: "#dc3545",
    };
  };

 

  const handleNextPage = () => {
    if (nextPage) {
      getCustomerPatients(currentPage + 1, search);
    }
  };

  const handlePreviousPage = () => {
    if (previousPage && currentPage > 1) {
      getCustomerPatients(currentPage - 1, search);
    }
  };

  return (
    <>
      <div className="consultation-main-card">
      

        <div className="consultation-header">
          <div className="consultation-title-wrap">
            <div className="consultation-line"></div>

            <div>
              <h2>Customers As Patient</h2>

              <p>Track all details of the patient</p>
            </div>
          </div>
        </div>

     
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Gender</th>
                <th>DOB</th>
                <th>Relation</th>
                <th>Phone</th>
                <th>Email</th>
               
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
           
              {patientLoading ? (
                Array(5)
                  .fill(null)
                  .map((_, index) => (
                    <tr key={index}>
                      <td colSpan="12">
                        <div className="skeleton-row"></div>
                      </td>
                    </tr>
                  ))
              ) : patientError ? (
                
                <tr>
                  <td
                    colSpan="12"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                      color: "#dc3545",
                    }}
                  >
                    {patientError}
                  </td>
                </tr>
              ) : patientData.length > 0 ? (
               

                patientData.map((patient, index) => (
                  <tr key={patient.id}>
                    {/* ID */}
                    <td>{(currentPage - 1) * 10 + index + 1}</td>

                
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {patient.profile_picture ? (
                          <img
                            src={patient.profile_picture}
                            alt={`${patient.first_name} ${patient.last_name}`}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: "#eee",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "600",
                            }}
                          >
                            {patient.first_name?.charAt(0)?.toUpperCase() ||
                              "P"}
                          </div>
                        )}

                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {patient.first_name} {patient.last_name}
                          </div>

                          <small>
                            {patient.email
                              ? patient.email
                              : "-"}
                          </small>
                        </div>
                      </div>
                    </td>

                
                    <td>
                      {patient.gender
                        ? patient.gender.charAt(0).toUpperCase() +
                          patient.gender.slice(1)
                        : "-"}
                    </td>

                 
                    <td>{formatDate(patient.dob)}</td>
                 
                    <td>
                      {patient.relation
                        ? patient.relation.charAt(0).toUpperCase() +
                          patient.relation.slice(1)
                        : "-"}
                    </td>

                   
                    <td>{patient.phone_number || "-"}</td>

          
                    <td>{patient.email || "-"}</td>

                  
                  
                    <td>
                      <span
                        className="status-badge"
                        style={getStatusStyle(patient.is_active_profile)}
                      >
                        {patient.is_active_profile ? "Active" : "Inactive"}
                      </span>
                    </td>

                   
                    <td>
                      <button
                        className="action-btn edit"
                        title="View Patient Detail"
                        onClick={() => {
                          setSelectedPatient(patient);
                          setShowPatientModal(true);
                        }}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                
                <tr>
                  <td
                    colSpan="12"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    No Customer Patients Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        

      
      </div>

    

      {showPatientModal && selectedPatient && (
        <div
          className="patient-modal-overlay"
          onClick={() => setShowPatientModal(false)}
        >
          <div
            className="patient-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="patient-modal-header">
              <div>
                <h3>Patient Details</h3>
                <p>
                  {selectedPatient.first_name}{" "}
                  {selectedPatient.last_name}
                </p>
              </div>

              <button
                onClick={() => setShowPatientModal(false)}
                className="modal-close-btn"
              >
                ×
              </button>
            </div>

            <div className="patient-detail-grid">
              <div>
                <label>First Name</label>
                <p>{selectedPatient.first_name || "-"}</p>
              </div>

              <div>
                <label>Last Name</label>
                <p>{selectedPatient.last_name || "-"}</p>
              </div>

              <div>
                <label>Date of Birth</label>
                <p>{formatDate(selectedPatient.dob)}</p>
              </div>

              <div>
                <label>Gender</label>
                <p>{selectedPatient.gender || "-"}</p>
              </div>

              <div>
                <label>Relation</label>
                <p>{selectedPatient.relation || "-"}</p>
              </div>

              <div>
                <label>Blood Group</label>
                <p>{selectedPatient.blood_group || "-"}</p>
              </div>

              <div>
                <label>Height</label>
                <p>{selectedPatient.height || "-"}</p>
              </div>

              <div>
                <label>Weight</label>
                <p>{selectedPatient.weight || "-"}</p>
              </div>

              <div>
                <label>Phone Number</label>
                <p>{selectedPatient.phone_number || "-"}</p>
              </div>

              <div>
                <label>Email</label>
                <p>{selectedPatient.email || "-"}</p>
              </div>

              <div>
                <label>Emergency Contact</label>
                <p>{selectedPatient.emergency_contact_name || "-"}</p>
              </div>

              <div>
                <label>Emergency Phone</label>
                <p>{selectedPatient.emergency_contact_phone || "-"}</p>
              </div>

              <div>
                <label>Insurance Provider</label>
                <p>{selectedPatient.insurance_provider || "-"}</p>
              </div>

              <div>
                <label>Insurance Policy Number</label>
                <p>{selectedPatient.insurance_policy_number || "-"}</p>
              </div>

              <div>
                <label>Insurance Valid Thru</label>
                <p>
                  {formatDate(selectedPatient.insurance_valid_thru)}
                </p>
              </div>

              <div>
                <label>Profile Status</label>
                <p>
                  <span
                    className="status-badge"
                    style={getStatusStyle(
                      selectedPatient.is_active_profile
                    )}
                  >
                    {selectedPatient.is_active_profile
                      ? "Active"
                      : "Inactive"}
                  </span>
                </p>
              </div>
            </div>

            <div className="patient-modal-footer">
              <button
                onClick={() => setShowPatientModal(false)}
                className="cancel-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerPatient;