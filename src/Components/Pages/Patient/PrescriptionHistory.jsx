import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import BASE_URL from "../../../Base";

import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiCalendar,
  FiFileText,
  FiActivity,
  FiCheckCircle,
  FiThermometer,
  FiDroplet,
  FiEdit3,
  FiChevronDown,
  FiAlertCircle,
  FiHeart,
} from "react-icons/fi";

import {
  FaWeight,
  FaRulerVertical,
} from "react-icons/fa";

import "../Doctor/PatientHistory.css";

const PrescriptionHistory = () => {
  const navigate = useNavigate();
  const { PatientHistoryId } = useParams();

  const [openHistory, setOpenHistory] = useState(null);

  const [prescriptionData, setPrescriptionData] = useState(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [prescriptionError, setPrescriptionError] = useState(null);

  console.log("========== PRESCRIPTION HISTORY ==========");
  console.log("PatientHistoryId:", PatientHistoryId);
  console.log("BASE_URL:", BASE_URL);

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // FULL DATE FORMAT
  // =========================================================

  const formatFullDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(`${date}T00:00:00`);

    if (isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // =========================================================
  // TIME FORMAT
  // =========================================================

  const formatTime = (time) => {
    if (!time) return "N/A";

    const parsedTime = new Date(`1970-01-01T${time}`);

    if (isNaN(parsedTime.getTime())) {
      return "N/A";
    }

    return parsedTime.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // =========================================================
  // GET PRESCRIPTION DATA
  // =========================================================

  const getPatientPrescription = async (patientId) => {
    const token = sessionStorage.getItem("superadmin_token");

    console.log("Token:", token);

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setPrescriptionLoading(true);
    setPrescriptionError(null);

    try {
      const url = `${BASE_URL}/customers/admin/prescriptions/?patient_id=${encodeURIComponent(
        patientId
      )}`;

      console.log("API URL:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("Prescription API Response:", data);

      if (response.ok && data?.success) {
        setPrescriptionData(data?.data || null);
      } else {
        setPrescriptionError(
          data?.message || "Failed to fetch prescription"
        );

        toast.error(
          data?.message || "Failed to fetch prescription"
        );
      }
    } catch (error) {
      console.error("API ERROR:", error);

      setPrescriptionError(
        "Failed to fetch prescription data"
      );

      toast.error("Failed to fetch prescription data");
    } finally {
      setPrescriptionLoading(false);
    }
  };

  // =========================================================
  // API CALL
  // =========================================================

  useEffect(() => {
    if (PatientHistoryId) {
      getPatientPrescription(PatientHistoryId);
    } else {
      console.log("PatientHistoryId not found");
    }
  }, [PatientHistoryId]);

  // =========================================================
  // PATIENT DATA
  // =========================================================

  const patient = prescriptionData?.patient;

  // =========================================================
  // PRESCRIPTION RESULTS
  // =========================================================

  const prescriptions =
    prescriptionData?.prescriptions?.results || [];

  // =========================================================
  // FIRST / LATEST PRESCRIPTION
  // =========================================================

  const latestPrescription = prescriptions[0];

  // =========================================================
  // TOGGLE HISTORY
  // =========================================================

  const toggleHistory = (id) => {
    setOpenHistory((previous) =>
      previous === id ? null : id
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (prescriptionLoading) {
    return (
      <div className="patient-history-page">
        <div className="medical-history-empty">
          <FiFileText />

          <p>
            Loading patient medical history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-history-page">

      <ToastContainer />

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <button
        type="button"
        className="patient-history-back"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft />
        Back
      </button>

      {/* =====================================================
          PATIENT HEADER
      ===================================================== */}

      <div className="patient-history-header">

        <div className="patient-profile-left">

          {/* AVATAR */}

          <div className="patient-history-avatar">
            <span>
              {patient?.name
                ? patient.name
                    .split(" ")
                    .filter(Boolean)
                    .map((name) => name.charAt(0))
                    .join("")
                    .toUpperCase()
                : "P"}
            </span>
          </div>

          {/* PATIENT INFO */}

          <div className="patient-header-content">

            <div className="patient-name-row">

              <h1>
                {patient?.name || "N/A"}
              </h1>

              {latestPrescription?.status && (
                <span className="patient-completed-badge">
                  <FiCheckCircle />

                  {latestPrescription.status
                    .charAt(0)
                    .toUpperCase() +
                    latestPrescription.status.slice(1)}
                </span>
              )}

            </div>

            <p className="patient-id">
              Patient ID: {patient?.id || "N/A"}
            </p>

            <div className="patient-basic-info">

              <span>
                <FiCalendar />

                DOB:{" "}
                {patient?.dob
                  ? formatFullDate(patient.dob)
                  : "N/A"}
              </span>

              <span>
                <FiUser />

                Gender:{" "}
                {patient?.gender
                  ? patient.gender
                      .charAt(0)
                      .toUpperCase() +
                    patient.gender.slice(1)
                  : "N/A"}
              </span>

              <span>
                <FiPhone />

                {patient?.phone_number || "N/A"}
              </span>

            </div>

          </div>

        </div>

        {/* =====================================================
            CURRENT CONSULTATION
        ===================================================== */}

        <div className="current-consultation-box">

          <span className="consultation-box-label">
            CURRENT CONSULTATION
          </span>

          <strong>
            {latestPrescription?.appointment_id ||
              "N/A"}
          </strong>

          <span>
            {latestPrescription?.appointment_date
              ? formatFullDate(
                  latestPrescription.appointment_date
                )
              : "N/A"}
          </span>

          <span>
            {latestPrescription?.start_time &&
            latestPrescription?.end_time
              ? `${formatTime(
                  latestPrescription.start_time
                )} - ${formatTime(
                  latestPrescription.end_time
                )}`
              : "N/A"}
          </span>

        </div>

      </div>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

      <div className="patient-summary-grid">

        {/* TOTAL CONSULTATIONS */}

        <div className="patient-summary-card">

          <div className="summary-icon">
            <FiFileText />
          </div>

          <div>
            <span>
              Total Consultations
            </span>

            <strong>
              {prescriptionData?.prescriptions
                ?.count || 0}
            </strong>
          </div>

        </div>

        {/* COMPLETED */}

        <div className="patient-summary-card">

          <div className="summary-icon">
            <FiCheckCircle />
          </div>

          <div>
            <span>
              Completed
            </span>

            <strong>
              {
                prescriptions.filter(
                  (item) =>
                    item.status?.toLowerCase() ===
                    "completed"
                ).length
              }
            </strong>
          </div>

        </div>

        {/* LAST CONSULTATION */}

        <div className="patient-summary-card">

          <div className="summary-icon">
            <FiActivity />
          </div>

          <div>
            <span>
              Last Consultation
            </span>

            <strong>
              {latestPrescription?.appointment_date
                ? formatDate(
                    latestPrescription.appointment_date
                  )
                : "N/A"}
            </strong>
          </div>

        </div>

        {/* PATIENT SINCE */}

        <div className="patient-summary-card">

          <div className="summary-icon">
            <FiCalendar />
          </div>

          <div>
            <span>
              Patient Since
            </span>

            <strong>
              N/A
            </strong>
          </div>

        </div>

      </div>

      {/* =====================================================
          PATIENT INFORMATION + MEASUREMENTS
      ===================================================== */}

      <div className="patient-history-content">

        {/* ===================================================
            PERSONAL INFORMATION
        =================================================== */}

        <div className="patient-history-left">

          <div className="history-card">

            <div className="history-card-header">

              <div className="history-title">

                <div className="history-title-icon">
                  <FiUser />
                </div>

                <div>
                  <h2>
                    Personal Information
                  </h2>

                  <p>
                    Patient personal and contact details
                  </p>
                </div>

              </div>

            </div>

            <div className="personal-info-grid">

              {/* FULL NAME */}

              <div className="personal-info-item">

                <span>
                  Full Name
                </span>

                <strong>
                  {patient?.name || "N/A"}
                </strong>

              </div>

              {/* GENDER */}

              <div className="personal-info-item">

                <span>
                  Gender
                </span>

                <strong>
                  {patient?.gender
                    ? patient.gender
                        .charAt(0)
                        .toUpperCase() +
                      patient.gender.slice(1)
                    : "N/A"}
                </strong>

              </div>

              {/* DOB */}

              <div className="personal-info-item">

                <span>
                  Date of Birth
                </span>

                <strong>
                  {patient?.dob
                    ? formatFullDate(patient.dob)
                    : "N/A"}
                </strong>

              </div>

              {/* RELATION */}

              <div className="personal-info-item">

                <span>
                  Relation
                </span>

                <strong>
                  {patient?.relation
                    ? patient.relation
                        .charAt(0)
                        .toUpperCase() +
                      patient.relation.slice(1)
                    : "N/A"}
                </strong>

              </div>

              {/* PHONE */}

              <div className="personal-info-item">

                <span>
                  <FiPhone />
                  Phone
                </span>

                <strong>
                  {patient?.phone_number || "N/A"}
                </strong>

              </div>

              {/* EMAIL */}

              <div className="personal-info-item">

                <span>
                  <FiMail />
                  Email
                </span>

                <strong>
                  {patient?.email || "N/A"}
                </strong>

              </div>

              {/* CUSTOMER ID */}

              <div className="personal-info-item">

                <span>
                  Customer ID
                </span>

                <strong>
                  {patient?.customer_id || "N/A"}
                </strong>

              </div>

              {/* ADDRESS */}

              <div className="personal-info-item full-width">

                <span>
                  <FiMapPin />
                  Address
                </span>

                <strong>
                  N/A
                </strong>

              </div>

            </div>

          </div>

        </div>

        {/* ===================================================
            MEASUREMENTS
        =================================================== */}

        <div className="patient-history-right">

          <div className="history-card">

            <div className="history-card-header">

              <div className="history-title">

                <div className="history-title-icon">
                  <FaRulerVertical />
                </div>

                <div>
                  <h2>
                    Patient Measurements
                  </h2>

                  <p>
                    Latest recorded measurements
                  </p>
                </div>

              </div>

            </div>

            <div className="measurement-grid">

              {/* HEIGHT */}

              <div className="measurement-item">

                <FaRulerVertical />

                <span>
                  Height
                </span>

                <strong>
                  {patient?.height &&
                  Number(patient.height) > 0
                    ? `${patient.height} cm`
                    : "N/A"}
                </strong>

              </div>

              {/* WEIGHT */}

              <div className="measurement-item">

                <FaWeight />

                <span>
                  Weight
                </span>

                <strong>
                  {patient?.weight &&
                  Number(patient.weight) > 0
                    ? `${patient.weight} kg`
                    : "N/A"}
                </strong>

              </div>

              {/* BLOOD GROUP */}

              <div className="measurement-item">

                <FiDroplet />

                <span>
                  Blood Group
                </span>

                <strong>
                  {patient?.blood_group || "N/A"}
                </strong>

              </div>

              {/* BMI */}

              <div className="measurement-item">

                <FiActivity />

                <span>
                  BMI
                </span>

                <strong>
                  N/A
                </strong>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          MEDICAL HISTORY
      ===================================================== */}

      <div className="medical-history-wrapper">

        <div className="medical-history-section">

          {/* HEADER */}

          <div className="medical-history-header">

            <div>

              <h2>
                Medical History
              </h2>

              <p>
                {prescriptions.length > 0
                  ? `${prescriptions.length} consultation${
                      prescriptions.length > 1
                        ? "s"
                        : ""
                    } on record`
                  : "No consultation record found"}
              </p>

            </div>

            {/* LAST VISIT */}

            <div className="last-visit-box">

              <span>
                LAST VISIT
              </span>

              <strong>

                {latestPrescription?.appointment_date
                  ? `${formatDate(
                      latestPrescription.appointment_date
                    )} ${
                      latestPrescription.start_time
                        ? formatTime(
                            latestPrescription.start_time
                          )
                        : ""
                    }`
                  : "N/A"}

              </strong>

            </div>

          </div>

          {/* =================================================
              TIMELINE
          ================================================= */}

          <div className="medical-history-timeline">

            {prescriptions.length > 0 ? (

              prescriptions.map((prescription) => (

                <div
                  className="medical-history-item"
                  key={prescription.id}
                >

                  {/* TIMELINE */}

                  <div className="timeline-column">

                    <div className="timeline-dot">
                      <span />
                    </div>

                  </div>

                  {/* CONSULTATION CARD */}

                  <div className="medical-consultation-card">

                    {/* HEADER */}

                    <div
                      className="medical-consultation-header"
                      onClick={() =>
                        toggleHistory(
                          prescription.id
                        )
                      }
                    >

                      {/* DATE */}

                      <div className="medical-date-wrapper">

                        <FiCalendar />

                        <div>

                          <strong>
                            {formatDate(
                              prescription.appointment_date
                            )}
                          </strong>

                          <span>
                            {prescription.symptom_description ||
                              "Consultation"}
                          </span>

                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="medical-actions">

                        {/* MEDICINE COUNT */}

                        <span className="attachment-badge">

                          <FiFileText />

                          {prescription
                            .prescription_items
                            ?.length || 0}

                        </span>

                        {/* STATUS */}

                        <span className="sent-badge">

                          {prescription.status
                            ? prescription.status
                                .charAt(0)
                                .toUpperCase() +
                              prescription.status.slice(
                                1
                              )
                            : "N/A"}

                        </span>

                        {/* DROPDOWN */}

                        <button
                          type="button"
                          className={`history-dropdown-btn ${
                            openHistory ===
                            prescription.id
                              ? "open"
                              : ""
                          }`}
                          onClick={(event) => {

                            event.stopPropagation();

                            toggleHistory(
                              prescription.id
                            );

                          }}
                        >
                          <FiChevronDown />
                        </button>

                      </div>

                    </div>

                    {/* =================================================
                        DETAILS
                    ================================================= */}

                    {openHistory ===
                      prescription.id && (

                      <div className="medical-history-details">

                        {/* CHIEF COMPLAINT */}

                        <div className="history-detail-box complaint-box">

                          <div className="detail-box-title">

                            <FiAlertCircle />

                            <span>
                              CHIEF COMPLAINT
                            </span>

                          </div>

                          <p>
                            {prescription.symptom_description ||
                              "N/A"}
                          </p>

                        </div>

                        {/* DIAGNOSIS */}

                        <div className="history-detail-box diagnosis-detail-box">

                          <div className="detail-box-title">

                            <FiActivity />

                            <span>
                              DIAGNOSIS
                            </span>

                          </div>

                          <p>
                            {prescription.diagnosis_advice ||
                              "N/A"}
                          </p>

                        </div>

                        {/* =================================================
                            MEDICINES
                        ================================================= */}

                        <div className="prescribed-section">

                          <div className="prescribed-title">

                            <FiFileText />

                            <h3>
                              Prescribed Medicines
                            </h3>

                          </div>

                          <div className="medicine-table-wrapper">

                            <table className="medicine-table">

                              <thead>

                                <tr>

                                  <th>
                                    Medicine
                                  </th>

                                  <th>
                                    Dosage
                                  </th>

                                  <th>
                                    Frequency
                                  </th>

                                  <th>
                                    Duration
                                  </th>

                                  <th>
                                    Instructions
                                  </th>

                                </tr>

                              </thead>

                              <tbody>

                                {prescription
                                  .prescription_items
                                  ?.length > 0 ? (

                                  prescription.prescription_items.map(
                                    (medicine) => (

                                      <tr
                                        key={
                                          medicine.id
                                        }
                                      >

                                        <td>

                                          <strong>
                                            {medicine.product_name ||
                                              "N/A"}
                                          </strong>

                                        </td>

                                        <td>
                                          {medicine.dosage ||
                                            "N/A"}
                                        </td>

                                        <td>
                                          {medicine.frequency ||
                                            "N/A"}
                                        </td>

                                        <td>
                                          {medicine.duration
                                            ? `${medicine.duration} days`
                                            : "N/A"}
                                        </td>

                                        <td>
                                          {medicine.instruction ||
                                            "N/A"}
                                        </td>

                                      </tr>

                                    )
                                  )

                                ) : (

                                  <tr>

                                    <td colSpan="5">
                                      No medicines prescribed
                                    </td>

                                  </tr>

                                )}

                              </tbody>

                            </table>

                          </div>

                        </div>

                        {/* =================================================
                            DIET PLANS
                        ================================================= */}

                        {prescription.diets
                          ?.length > 0 && (

                          <div className="diet-plan-section">

                            <div className="prescribed-title">

                              <FiHeart />

                              <h3>
                                Diet Plans
                              </h3>

                            </div>

                            {prescription.diets.map(
                              (diet) => (

                                <div
                                  className="diet-plan-card"
                                  key={diet.id}
                                >

                                  <div className="diet-plan-icon">
                                    <FiEdit3 />
                                  </div>

                                  <div className="diet-plan-content">

                                    <strong>
                                      {diet.name ||
                                        "Diet Plan"}
                                    </strong>

                                    <span>
                                      Assigned with this prescription
                                    </span>

                                  </div>

                                  <div className="diet-plan-meta">

                                    <span>

                                      {diet.duration} day
                                      {Number(
                                        diet.duration
                                      ) > 1
                                        ? "s"
                                        : ""}

                                    </span>

                                    <span>
                                      {
                                        diet.meals_per_day
                                      }{" "}
                                      meals/day
                                    </span>

                                  </div>

                                </div>

                              )
                            )}

                          </div>

                        )}

                        {/* =================================================
                            CLINICAL NOTES
                        ================================================= */}

                        <div className="history-detail-box observation-box">

                          <div className="detail-box-title">

                            <FiThermometer />

                            <span>
                              CLINICAL NOTES & OBSERVATIONS
                            </span>

                          </div>

                          <p>
                            {prescription.clinical_notes ||
                              "N/A"}
                          </p>

                        </div>

                        {/* =================================================
                            DOS & DONTS
                        ================================================= */}

                        <div className="dos-donts-section">

                          <div className="dos-donts-header">

                            <div className="prescribed-title">

                              <FiEdit3 />

                              <h3>
                                Diet & Lifestyle
                              </h3>

                            </div>

                          </div>

                          <div className="dos-donts-grid">

                            {/* DOS */}

                            <div className="dos-card">

                              <div className="dos-card-header">

                                <div className="dos-icon">
                                  ✓
                                </div>

                                <div>

                                  <h4>
                                    Do's
                                  </h4>

                                  <span>
                                    Advice the patient what they should follow.
                                  </span>

                                </div>

                              </div>

                              <div className="dos-list">

                                {prescription.dos
                                  ?.length > 0 ? (

                                  prescription.dos.map(
                                    (
                                      doItem,
                                      index
                                    ) => (

                                      <div
                                        className="dos-item"
                                        key={index}
                                      >

                                        <span className="dos-check">
                                          ✓
                                        </span>

                                        <p>
                                          {doItem}
                                        </p>

                                      </div>

                                    )
                                  )

                                ) : (

                                  <p>
                                    No recommendations available.
                                  </p>

                                )}

                              </div>

                            </div>

                            {/* DONTS */}

                            <div className="donts-card">

                              <div className="donts-card-header">

                                <div className="donts-icon">
                                  ×
                                </div>

                                <div>

                                  <h4>
                                    Don'ts
                                  </h4>

                                  <span>
                                    Mention activities or foods to avoid.
                                  </span>

                                </div>

                              </div>

                              <div className="donts-list">

                                {prescription.donts
                                  ?.length > 0 ? (

                                  prescription.donts.map(
                                    (
                                      dontItem,
                                      index
                                    ) => (

                                      <div
                                        className="donts-item"
                                        key={index}
                                      >

                                        <span className="donts-cross">
                                          ×
                                        </span>

                                        <p>
                                          {dontItem}
                                        </p>

                                      </div>

                                    )
                                  )

                                ) : (

                                  <p>
                                    No restrictions available.
                                  </p>

                                )}

                              </div>

                            </div>

                          </div>

                        </div>

                        {/* =================================================
                            ALLERGIES / FAMILY HISTORY / PAST ILLNESS
                        ================================================= */}

                        <div className="history-bottom-grid">

                          {/* ALLERGIES */}

                          <div className="history-detail-box allergy-box">

                            <div className="detail-box-title">

                              <FiAlertCircle />

                              <span>
                                ALLERGIES
                              </span>

                            </div>

                            <p>
                              {prescription.allergies ||
                                "N/A"}
                            </p>

                          </div>

                          {/* FAMILY HISTORY */}

                          <div className="history-detail-box family-box">

                            <div className="detail-box-title">

                              <FiUser />

                              <span>
                                FAMILY HISTORY
                              </span>

                            </div>

                            <p>
                              {prescription.family_history ||
                                "N/A"}
                            </p>

                          </div>

                          {/* PAST ILLNESS */}

                          <div className="history-detail-box illness-box">

                            <div className="detail-box-title">

                              <FiFileText />

                              <span>
                                PAST ILLNESS
                              </span>

                            </div>

                            <p>
                              {prescription.history_of_past_illness ||
                                "N/A"}
                            </p>

                          </div>

                        </div>

                        {/* =================================================
                            FOLLOW UP
                        ================================================= */}

                        {prescription.follow_up && (

                          <div className="history-detail-box">

                            <div className="detail-box-title">

                              <FiCalendar />

                              <span>
                                FOLLOW UP
                              </span>

                            </div>

                            <p>

                              {prescription.follow_up.date
                                ? formatFullDate(
                                    prescription
                                      .follow_up
                                      .date
                                  )
                                : "N/A"}

                              {" - "}

                              {prescription.follow_up
                                .reason || "N/A"}

                            </p>

                          </div>

                        )}

                        {/* =================================================
                            CONSULTATION TIME
                        ================================================= */}

                        <div className="history-detail-box">

                          <div className="detail-box-title">

                            <FiCalendar />

                            <span>
                              CONSULTATION TIME
                            </span>

                          </div>

                          <p>

                            {formatTime(
                              prescription.start_time
                            )}

                            {" - "}

                            {formatTime(
                              prescription.end_time
                            )}

                          </p>

                        </div>

                        {/* =================================================
                            CREATED AT
                        ================================================= */}

                        <div className="history-detail-box">

                          <div className="detail-box-title">

                            <FiFileText />

                            <span>
                              PRESCRIPTION CREATED
                            </span>

                          </div>

                          <p>

                            {prescription.created_at
                              ? new Date(
                                  prescription.created_at
                                ).toLocaleString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )
                              : "N/A"}

                          </p>

                        </div>

                      </div>

                    )}

                  </div>

                </div>

              ))

            ) : (

              <div className="medical-history-empty">

                <FiFileText />

                <p>
                  No medical history found.
                </p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default PrescriptionHistory;