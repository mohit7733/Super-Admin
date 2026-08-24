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
  FiClipboard,
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

import "./PatientHistory.css";

const PatientHistory = () => {
  const navigate = useNavigate();
  const { consultationId } = useParams();

  const [openHistory, setOpenHistory] = useState(null);

  const [prescriptionData, setPrescriptionData] = useState(null);
const [prescriptionLoading, setPrescriptionLoading] = useState(false);
const [prescriptionError, setPrescriptionError] = useState(null);

 const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "N/A";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const patient = {
    id: "PAT-10245",
    firstName: "Diksha",
    lastName: "Yadav",
    gender: "Female",
    dob: "29 May 2000",
    age: 26,
    phone: "+91 98765 43210",
    email: "diksha.yadav@gmail.com",
    address: "Gurgaon, Haryana, India",
    profileImage: null,

    height: "165 cm",
    weight: "62 kg",
    bloodGroup: "B+",
    maritalStatus: "Single",

    totalConsultations: 8,
    completedConsultations: 6,
  };



  const currentConsultation = {
    consultationId: consultationId || "CONS-2026-0082",
    date: "20 August 2026",
    time: "11:30 AM - 12:00 PM",
    type: "Video Consultation",
    status: "Completed",
    amount: "₹800",
    doctor: "Dr. Rajesh Sharma",
    specialization: "Ayurvedic Physician",
  };



  const medicalHistory = [
    {
      id: "CONS-2026-0082",
      date: "Wed, 19 Aug, 2026, 05:00 pm",
      time: "05:00 pm - 05:30 pm",
      complaint: "fever",
      attachments: 1,

      chiefComplaint: "fever",

      diagnosis: "Ift rft",

      observations: "no",

      medicines: [
        {
          name: "Dolo",
          dosage: "1",
          frequency: "2",
          duration: "8 days",
          instructions: "ff",
        },
      ],

      dietPlan: {
        title: "Joint & Muscle Comfort Support Diet Plan",
        duration: "7 days",
        meals: "3 meals/day",
        description:
          "Assigned with this prescription",
      },

      dos: [
        "Eat warm, freshly cooked meals at regular intervals.",
        "Start the day with warm water or herbal tea.",
        "Include healthy fats such as ghee, sesame oil, and soaked nuts in moderation.",
        "Choose easy-to-digest foods like khichdi, soups, and steamed vegetables.",
        "Consume cooling fruits like pears, pomegranates, sweet lime, and apples.",
        "Practice yoga, meditation, or pranayama for at least 20 minutes daily.",
        "Maintain a consistent sleep schedule and aim for 7–8 hours of sleep.",
        "Stay hydrated with room-temperature or warm water throughout the day.",
        "Include probiotic foods like homemade curd or buttermilk if tolerated.",
        "Take short walks after meals to improve digestion.",
      ],

      donts: [
        "Avoid spicy, oily, fried and very hot foods.",
        "Do not skip meals or stay hungry for long periods.",
        "Avoid spicy, deep-fried, and heavily processed foods.",
        "Avoid excessive tea, coffee, and energy drinks.",
        "Limit carbonated drinks, alcohol, and packaged foods.",
        "Avoid eating late at night.",
        "Do not consume extremely cold foods or beverages.",
        "Avoid excessive consumption of citrus fruits and vinegar if acidity worsens.",
        "Do not overwork or stay under prolonged stress without breaks.",
        "Avoid sleeping immediately after meals.",
        "Do not eat too quickly; chew food thoroughly before swallowing.",
      ],

      allergies: "no",

      familyHistory: "no",

      pastIllness:
        "5 days back caught by throat infection",
    },

    {
      id: "CONS-2026-0071",
      date: "Tue, 11 Aug, 2026, 10:00 am",
      time: "10:00 am - 10:30 am",
      complaint: "test",
      attachments: 1,

      chiefComplaint: "test",

      diagnosis: "Digestive imbalance",

      observations: "no",

      medicines: [
        {
          name: "Avipattikar Churna",
          dosage: "5 gm",
          frequency: "Twice Daily",
          duration: "14 days",
          instructions: "After meals",
        },
        {
          name: "Triphala Tablet",
          dosage: "1 Tablet",
          frequency: "Once Daily",
          duration: "30 days",
          instructions: "Before bedtime",
        },
      ],

      dietPlan: {
        title: "Digestive Balance Diet Plan",
        duration: "14 days",
        meals: "3 meals/day",
        description:
          "Assigned with this prescription",
      },

      dos: [
        "Eat meals at regular intervals.",
        "Prefer freshly prepared and warm food.",
        "Drink sufficient warm water throughout the day.",
        "Include easily digestible vegetables and fruits.",
        "Practice light yoga for 20 minutes daily.",
        "Maintain a regular sleeping schedule.",
        "Take a short walk after meals.",
      ],

      donts: [
        "Avoid spicy and oily food.",
        "Do not skip meals.",
        "Avoid excessive tea and coffee.",
        "Avoid packaged and processed foods.",
        "Do not eat very late at night.",
        "Avoid overeating.",
        "Do not lie down immediately after meals.",
      ],

      allergies: "no",

      familyHistory: "no",

      pastIllness:
        "No significant past illness",
    },

    {
      id: "CONS-2026-0062",
      date: "Wed, 22 Jul, 2026, 04:00 pm",
      time: "04:00 pm - 04:30 pm",
      complaint: "Acidity & bloating",
      attachments: 2,

      chiefComplaint:
        "Acidity and bloating after meals",

      diagnosis: "Digestive imbalance",

      observations:
        "Mild bloating observed",

      medicines: [
        {
          name: "Triphala Tablet",
          dosage: "1 Tablet",
          frequency: "Once Daily",
          duration: "30 days",
          instructions: "Before bedtime",
        },
      ],

      dietPlan: {
        title: "Acidity Relief Diet Plan",
        duration: "30 days",
        meals: "3 meals/day",
        description:
          "Assigned with this prescription",
      },

      dos: [
        "Eat smaller meals at regular intervals.",
        "Drink warm water throughout the day.",
        "Include fresh vegetables in meals.",
        "Practice light walking after meals.",
        "Maintain regular sleep timings.",
      ],

      donts: [
        "Avoid very spicy food.",
        "Avoid fried and oily food.",
        "Avoid excessive caffeine.",
        "Avoid carbonated drinks.",
        "Do not skip meals.",
        "Avoid sleeping immediately after eating.",
      ],

      allergies: "No known allergies",

      familyHistory:
        "No significant family history",

      pastIllness:
        "Irregular digestion",
    },

    {
      id: "CONS-2026-0050",
      date: "Fri, 10 Jul, 2026, 02:30 pm",
      time: "02:30 pm - 03:00 pm",
      complaint: "Irregular digestion",
      attachments: 1,

      chiefComplaint:
        "Irregular digestion",

      diagnosis:
        "Digestive disorder",

      observations:
        "Mild abdominal discomfort",

      medicines: [
        {
          name: "Jeerakadyarishta",
          dosage: "15 ml",
          frequency: "Twice Daily",
          duration: "15 days",
          instructions: "After meals",
        },
      ],

      dietPlan: {
        title: "Healthy Digestion Support Plan",
        duration: "15 days",
        meals: "3 meals/day",
        description:
          "Assigned with this prescription",
      },

      dos: [
        "Eat fresh and warm food.",
        "Maintain proper meal timings.",
        "Drink enough water.",
        "Include fruits and vegetables.",
        "Walk for a few minutes after meals.",
      ],

      donts: [
        "Avoid junk food.",
        "Avoid excessive fried food.",
        "Do not skip breakfast.",
        "Avoid overeating.",
        "Do not sleep immediately after meals.",
      ],

      allergies: "No",

      familyHistory:
        "No significant family history",

      pastIllness:
        "Previous digestive issues",
    },

    {
      id: "CONS-2026-0042",
      date: "Mon, 22 Jun, 2026, 11:00 am",
      time: "11:00 am - 11:30 am",
      complaint: "Fatigue",
      attachments: 1,

      chiefComplaint:
        "Feeling tired and low energy",

      diagnosis:
        "General weakness",

      observations:
        "Patient reported fatigue",

      medicines: [
        {
          name: "Ashwagandha Tablet",
          dosage: "1 Tablet",
          frequency: "Once Daily",
          duration: "30 days",
          instructions: "After dinner",
        },
      ],

      dietPlan: {
        title: "Energy & Wellness Diet Plan",
        duration: "30 days",
        meals: "3 meals/day",
        description:
          "Assigned with this prescription",
      },

      dos: [
        "Maintain regular meals.",
        "Include protein-rich foods.",
        "Drink enough water.",
        "Get adequate sleep.",
        "Practice light physical activity.",
      ],

      donts: [
        "Avoid skipping meals.",
        "Avoid excessive caffeine.",
        "Do not stay awake late at night.",
        "Avoid prolonged stress.",
        "Do not overwork.",
      ],

      allergies: "No known allergies",

      familyHistory:
        "No significant family history",

      pastIllness:
        "No significant illness",
    },
  ];












  
  const toggleHistory = (id) => {
    setOpenHistory((previous) =>
      previous === id ? null : id
    );
  };

 const getPrescription = async (appointmentId) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setPrescriptionLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/customers/admin/prescriptions/?appointment_id=${encodeURIComponent(
        appointmentId
      )}`,
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

    console.log("Prescription API Response:", data);

    if (data?.success) {
      setPrescriptionData(data?.data || null);
    } else {
      toast.error(data?.message || "Failed to fetch prescription");
    }
  } catch (err) {
    console.error("Prescription Fetch Error:", err);

    toast.error("Failed to fetch prescription data", {
      position: "top-center",
      autoClose: 2000,
    });
  } finally {
    setPrescriptionLoading(false);
  }
};
useEffect(() => {
  if (consultationId) {
    getPrescription(consultationId);
  }
}, [consultationId]);

  return (
    <div className="patient-history-page">

 

      <button
        type="button"
        className="patient-history-back"
        onClick={() => navigate(-1)}
      >
        <FiArrowLeft />
        Back
      </button>


     

    <div className="patient-history-header">

  <div className="patient-profile-left">

    <div className="patient-history-avatar">
      <span>
        {prescriptionData?.patient_name
          ? prescriptionData.patient_name
              .split(" ")
              .map((name) => name.charAt(0))
              .join("")
              .toUpperCase()
          : "P"}
      </span>
    </div>

    <div className="patient-header-content">

      <div className="patient-name-row">

        <h1>
          {prescriptionData?.patient_name || "N/A"}
        </h1>

        <span className="patient-completed-badge">
          <FiCheckCircle />

          {prescriptionData?.status
            ? prescriptionData.status
                .charAt(0)
                .toUpperCase() +
              prescriptionData.status.slice(1)
            : "N/A"}
        </span>

      </div>

      <p className="patient-id">
        Patient ID: {prescriptionData?.patient_id || "N/A"}
      </p>

      <div className="patient-basic-info">

        <span>
          <FiCalendar />

        
        </span>

        <span>
          <FiUser />

          Doctor: {prescriptionData?.doctor_name || "N/A"}
        </span>

      </div>

    </div>

  </div>




  <div className="current-consultation-box">

    <span className="consultation-box-label">
      CURRENT CONSULTATION
    </span>

    <strong>
      {prescriptionData?.appointment_id || "N/A"}
    </strong>

    <span>
      {prescriptionData?.appointment_date
        ? new Date(
            prescriptionData.appointment_date
          ).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "N/A"}
    </span>

    <span>
      {prescriptionData?.start_time &&
      prescriptionData?.end_time
        ? `${prescriptionData.start_time.slice(
            0,
            5
          )} - ${prescriptionData.end_time.slice(0, 5)}`
        : "N/A"}
    </span>

  </div>

</div>

   

      <div className="patient-summary-grid">

        <div className="patient-summary-card">

          <div className="summary-icon">
            <FiFileText />
          </div>

          <div>

            <span>
              Total Consultations
            </span>

            <strong>
              {patient.totalConsultations}
            </strong>

          </div>

        </div>


        <div className="patient-summary-card">

          <div className="summary-icon">
            <FiCheckCircle />
          </div>

          <div>

            <span>
              Completed
            </span>

            <strong>
              {patient.completedConsultations}
            </strong>

          </div>

        </div>


        <div className="patient-summary-card">

          <div className="summary-icon">
            <FiActivity />
          </div>

          <div>

            <span>
              Last Consultation
            </span>

            <strong>
              19 Aug 2026
            </strong>

          </div>

        </div>


        <div className="patient-summary-card">

          <div className="summary-icon">
            <FiCalendar />
          </div>

          <div>

            <span>
              Patient Since
            </span>

            <strong>
              Jan 2026
            </strong>

          </div>

        </div>

      </div>




      <div className="patient-history-content">


       

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

              <div className="personal-info-item">

                <span>
                  Full Name
                </span>

                <strong>
                  {patient.firstName}{" "}
                  {patient.lastName}
                </strong>

              </div>


              <div className="personal-info-item">

                <span>
                  Gender
                </span>

                <strong>
                  {patient.gender}
                </strong>

              </div>


              <div className="personal-info-item">

                <span>
                  Date of Birth
                </span>

                <strong>
                  {patient.dob}
                </strong>

              </div>


              <div className="personal-info-item">

                <span>
                  Marital Status
                </span>

                <strong>
                  {patient.maritalStatus}
                </strong>

              </div>


              <div className="personal-info-item">

                <span>

                  <FiPhone />

                  Phone

                </span>

                <strong>
                  {patient.phone}
                </strong>

              </div>


              <div className="personal-info-item">

                <span>

                  <FiMail />

                  Email

                </span>

                <strong>
                  {patient.email}
                </strong>

              </div>


              <div className="personal-info-item full-width">

                <span>

                  <FiMapPin />

                  Address

                </span>

                <strong>
                  {patient.address}
                </strong>

              </div>

            </div>

          </div>


      

        </div>



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


              <div className="measurement-item">

                <FaRulerVertical />

                <span>
                  Height
                </span>

                <strong>
                  {patient.height}
                </strong>

              </div>


              <div className="measurement-item">

                <FaWeight />

                <span>
                  Weight
                </span>

                <strong>
                  {patient.weight}
                </strong>

              </div>


              <div className="measurement-item">

                <FiDroplet />

                <span>
                  Blood Group
                </span>

                <strong>
                  {patient.bloodGroup}
                </strong>

              </div>


              <div className="measurement-item">

                <FiActivity />

                <span>
                  BMI
                </span>

                <strong>
                  22.8
                </strong>

              </div>


            </div>

          </div>

        </div>

      </div>




      <div className="medical-history-wrapper">

        <div className="medical-history-section">


        

       <div className="medical-history-header">

  <div>

    <h2>
      Medical History
    </h2>

    <p>
      {prescriptionData ? "1 consultation on record" : "No consultation record found"}
    </p>

  </div>


  <div className="last-visit-box">

    <span>
      LAST VISIT
    </span>

    <strong>
      {prescriptionData?.appointment_date
        ? new Date(
            `${prescriptionData.appointment_date}T${prescriptionData.start_time}`
          ).toLocaleString("en-IN", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A"}
    </strong>

  </div>

</div>


         

        <div className="medical-history-timeline">

  {prescriptionData ? (

    <div
      className="medical-history-item"
      key={prescriptionData.id}
    >

      {/* TIMELINE */}

      <div className="timeline-column">

        <div className="timeline-dot">
          <span />
        </div>

      </div>


      {/* CONSULTATION */}

      <div className="medical-consultation-card">

        <div
          className="medical-consultation-header"
          onClick={() =>
            toggleHistory(prescriptionData.id)
          }
        >

          <div className="medical-date-wrapper">

            <FiCalendar />

            <div>

              <strong>
                {formatDate(
                  prescriptionData.appointment_date
                )}
              </strong>

              <span>
                {prescriptionData.symptom_description ||
                  "Consultation"}
              </span>

            </div>

          </div>


          <div className="medical-actions">

            <span className="attachment-badge">

              <FiFileText />

              {prescriptionData.prescription_items?.length || 0}

            </span>


            <span className="sent-badge">
              {prescriptionData.status || "Sent"}
            </span>


            <button
              type="button"
              className={`history-dropdown-btn ${
                openHistory === prescriptionData.id
                  ? "open"
                  : ""
              }`}
              onClick={(event) => {

                event.stopPropagation();

                toggleHistory(prescriptionData.id);

              }}
            >

              <FiChevronDown />

            </button>

          </div>

        </div>


        {openHistory === prescriptionData.id && (

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
                {prescriptionData.symptom_description || "N/A"}
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
                {prescriptionData.diagnosis_advice || "N/A"}
              </p>

            </div>


            {/* MEDICINES */}

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

                    {prescriptionData.prescription_items?.length > 0 ? (

                      prescriptionData.prescription_items.map(
                        (medicine) => (

                          <tr key={medicine.id}>

                            <td>

                              <strong>
                                {medicine.product_name || "N/A"}
                              </strong>

                            </td>

                            <td>
                              {medicine.dosage || "N/A"}
                            </td>

                            <td>
                              {medicine.frequency || "N/A"}
                            </td>

                            <td>
                              {medicine.duration
                                ? `${medicine.duration} days`
                                : "N/A"}
                            </td>

                            <td>
                              {medicine.instruction || "N/A"}
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


            {/* DIET PLANS */}

            {prescriptionData.diets?.length > 0 && (

              <div className="diet-plan-section">

                <div className="prescribed-title">

                  <FiHeart />

                  <h3>
                    Diet Plans
                  </h3>

                </div>


                {prescriptionData.diets.map((diet) => (

                  <div
                    className="diet-plan-card"
                    key={diet.id}
                  >

                    <div className="diet-plan-icon">
                      <FiEdit3 />
                    </div>


                    <div className="diet-plan-content">

                      <strong>
                        {diet.name || "Diet Plan"}
                      </strong>

                      <span>
                        Assigned with this prescription
                      </span>

                    </div>


                    <div className="diet-plan-meta">

                      <span>
                        {diet.duration} day
                        {diet.duration > 1 ? "s" : ""}
                      </span>

                      <span>
                        {diet.meals_per_day} meals/day
                      </span>

                    </div>

                  </div>

                ))}

              </div>

            )}


            {/* CLINICAL NOTES */}

            <div className="history-detail-box observation-box">

              <div className="detail-box-title">

                <FiThermometer />

                <span>
                  CLINICAL NOTES & OBSERVATIONS
                </span>

              </div>

              <p>
                {prescriptionData.clinical_notes || "N/A"}
              </p>

            </div>


            {/* DOS & DONTS */}

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

                    {prescriptionData.dos?.length > 0 ? (

                      prescriptionData.dos.map(
                        (doItem, index) => (

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

                    {prescriptionData.donts?.length > 0 ? (

                      prescriptionData.donts.map(
                        (dontItem, index) => (

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


            {/* ALLERGIES / FAMILY HISTORY / PAST ILLNESS */}

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
                  {prescriptionData.allergies || "N/A"}
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
                  {prescriptionData.family_history || "N/A"}
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
                  {prescriptionData.history_of_past_illness || "N/A"}
                </p>

              </div>


            </div>


            {/* CONSULTATION TIME */}

            <div className="history-detail-box">

              <div className="detail-box-title">

                <FiCalendar />

                <span>
                  CONSULTATION TIME
                </span>

              </div>

              <p>

                {formatTime(
                  prescriptionData.start_time
                )}

                {" - "}

                {formatTime(
                  prescriptionData.end_time
                )}

              </p>

            </div>


          </div>

        )}

      </div>

    </div>

  ) : (

    <div className="medical-history-empty">

      <FiFileText />

      <p>
        {prescriptionLoading
          ? "Loading medical history..."
          : "No medical history found."}
      </p>

    </div>

  )}

</div>

        </div>

      </div>

    </div>
  );
};

export default PatientHistory;