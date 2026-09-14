import React from 'react';
import { useState,useEffect } from 'react';
 import {
  FaTimesCircle,
  FaUser,
  FaUserMd,
  FaCalendarAlt,
  FaClock,
  FaPhoneAlt,
  FaClipboardList,
  FaCheckCircle,
} from "react-icons/fa";
import { MdEventRepeat } from "react-icons/md";
import { BsSearch } from 'react-icons/bs';
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import BASE_URL from "../../../Base";
import { FaTimes } from "react-icons/fa";
import { MdClose } from "react-icons/md";


const Management = () => {
    const[appointmentsearch,setappointmentsearch]=useState("");
    const[AppointmentData,setAppointmentData]=useState([]);
    const[AppointmentLoading,setAppointmentLoading]=useState(false);
    const[AppointmentError,setApointmentError]=useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
const [selectedAppointment, setSelectedAppointment] = useState(null);
const [cancelReason, setCancelReason] = useState("");
const [selectedAction, setSelectedAction] = useState("");
const [showRescheduleModal, setShowRescheduleModal] = useState(false);
const [selectedSlot, setSelectedSlot] = useState(null);
const[AvailableslotData,setAvailableslotData]=useState([]);
const[AvailableslotLoading,setAvailableslotLoading]=useState(false);
const[AvailableslotError,setAvailableslotError]=useState(null);
const [rescheduleReason, setRescheduleReason] = useState("");


    const navigate = useNavigate();

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time) => {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};



    const getAppointmentCancellationlist = async () => {
const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setAppointmentLoading(true);


  try {
    const response = await fetch(
      `${BASE_URL}/doctors/admin/consultation-history/?status=cancellation_requested`,
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

    console.log("Category API Response:", data);

    if (data.success) {
      setAppointmentData(data.data.results);

     

    } else {
      toast.error(data.message || "Failed to get all cancellation request");
    }

  } catch (error) {

    console.error("Category Fetch Error:", error);

    setApointmentError("Something went wrong while fetching data.");

    toast.error("Failed to fetch all cancellation request data");

  } finally {
    setAppointmentLoading(false);
  }
};
  const getAvaliableSlotlist = async (doctorId) => {
const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setAvailableslotLoading(true);


  try {
    const response = await fetch(
       `${BASE_URL}/doctors/admin/availability/?doctor_id=${doctorId}&status=available`,
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

    console.log("Category API Response:", data);
if (data.success) {
  setAvailableslotData(data.data.availability);
} else {
      toast.error(data.message || "Failed to get all cancellation request");
    }

  } catch (error) {

    console.error("Category Fetch Error:", error);

    setAvailableslotError("Something went wrong while fetching data.");

    toast.error("Failed to fetch all cancellation request data");

  } finally {
    setAvailableslotLoading(false);
  }
};

useEffect(()=>{
    getAppointmentCancellationlist();
   
},[])

const handleAppointmentAction = async (action) => {
  const token = sessionStorage.getItem("superadmin_token");

  let body = {
    action,
  };

  if (action === "cancel") {
    if (!cancelReason.trim()) {
      toast.error("Please enter cancellation reason");
      return;
    }

    body.cancellation_reason = cancelReason;
  }

  if (action === "reschedule") {
    if (!selectedSlot) {
      toast.error("Please select a slot");
      return;
    }

    if (!rescheduleReason.trim()) {
      toast.error("Please enter reschedule reason");
      return;
    }

    body.availability = selectedSlot;
    body.reschedule_reason = rescheduleReason;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/doctors/admin/consultation-history/?id=${selectedAppointment.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (data.success) {
      toast.success(data.message);

      setShowCancelModal(false);
      setShowRescheduleModal(false);

      setCancelReason("");
      setRescheduleReason("");
      setSelectedSlot(null);

      getAppointmentCancellationlist();
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error("Something went wrong");
  }
};

  return (
    <>
     <div className="page-header">
        <h1>Appointment Management</h1>
        <p className="page-paragraph"> Manage Apointment details,Reschedule ,Cancelled appointment</p>
      </div>
    
<div className="vendors-stats stats2-grid">
  {/* Total Requests */}
  <div className="stat2-card">
    <div
      className="stat2-icon"
      style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaClipboardList size={24} />
    </div>
    <div className="stat2-info">
      <h3>Total Requests</h3>
      <div className="stat2-value">0</div>
    </div>
  </div>

  {/* Pending Requests */}
  <div className="stat2-card">
    <div
      className="stat2-icon"
    style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaClock size={24} />
    </div>
    <div className="stat2-info">
      <h3>Pending Requests</h3>
      <div className="stat2-value">
      0
      </div>
    </div>
  </div>

  <div className="stat2-card">
    <div
      className="stat2-icon"
      style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaCheckCircle size={24} />
    </div>
    <div className="stat2-info">
      <h3>Approved Requests</h3>
      <div className="stat2-value">
      0
      </div>
    </div>
  </div>

  
  <div className="stat2-card">
    <div
      className="stat2-icon"
       style={{ background: "#0D614E20", color: "#0D614E" }}
    >
      <FaTimesCircle size={24} />
    </div>
    <div className="stat2-info">
      <h3>Cancelled Requests</h3>
      <div className="stat2-value">
      0
      </div>
    </div>
  </div>
</div>

<div className="controls-section">
        <div className="search-wrapper">
          <BsSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search appointment by patient && Doctor Name..."
            value={appointmentsearch}
            onChange={(e) => setappointmentsearch(e.target.value)}
            className="search-input"
          />
        </div>
</div>
  <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
      <th> Patient Number </th>
              <th>Doctor</th>
              <th> Booking Date</th>
              <th> Slots</th>
              
              <th>Reason</th>
              <th> Cancellation- Request Date </th>
              <th>Status</th>
              
            
           

            </tr>
          </thead>
    <tbody>
  {AppointmentLoading ? (
    Array(3)
      .fill(0)
      .map((_, i) => (
        <tr key={i}>
          <td colSpan="10">
            <div className="skeleton-row"></div>
          </td>
        </tr>
      ))
  ) : AppointmentError ? (
    <tr>
      <td colSpan="10" style={{ color: "red", textAlign: "center" }}>
        {AppointmentError}
      </td>
    </tr>
  ) : AppointmentData.length > 0 ? (
    AppointmentData.map((item, index) => {
      const slot = item.cancellation_request?.slot?.[0];

      return (
        <tr key={item.id}>
     
          <td>{index + 1}</td>

         
          <td>{item.patient_name || "-"}</td>

         
          <td>{item.patient_number || "-"}</td>

       
          <td>{item.doctor_name || "-"}</td>

          
          <td>{slot ? formatDate(slot.date) : "-"}</td>

       
          <td>
            {slot
              ? `${formatTime(slot.start_time)} - ${formatTime(
                  slot.end_time
                )}`
              : "-"}
          </td>

       

       
          <td>{item.cancellation_request?.reason || "-"}</td>

          <td>
            {item.cancellation_request?.requested_at ? (
              <>
                {formatDate(item.cancellation_request.requested_at)}
               
              </>
            ) : (
              "-"
            )}
          </td>

          {/* Status */}
         <td>
  <select
    value={item.status}
    className="status-filter"
    onChange={(e) => {
    const value = e.target.value;

    if (value === "cancelled") {
      setSelectedAppointment(item);
      setShowCancelModal(true);
          setSelectedAction("cancel");
    }

      if (value === "rescheduled") {
    setSelectedAppointment(item);
    setShowRescheduleModal(true);
      getAvaliableSlotlist(item.doctor_id);
  }
  }}
  >
    <option value="cancellation_requested">
      Cancellation Requested
    </option>

    
    <option value="cancelled">
      Cancelled
    </option>

    <option value="rescheduled">
      Rescheduled
    </option>
  </select>
</td>
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan="10" style={{ textAlign: "center" }}>
        No Cancellation Requests Found
      </td>
    </tr>
  )}
</tbody>
        </table>


       
      </div>


      {showCancelModal && (
  <div className="cancel-modal-overlay">
    <div className="cancel-modal">

      {/* Close Button */}
      <button
        className="cancel-close-btn"
        onClick={() => setShowCancelModal(false)}
      >
        <MdClose size={28} />
      </button>

      {/* Icon */}
      <div className="cancel-icon">
        <FaTimes />
      </div>

      <h2>Cancel Appointment</h2>

      <p className="cancel-subtitle">
        Please provide a reason for cancelling this appointment.
      </p>

      <div className="cancel-form-group">
        <label>
          Cancellation Reason <span>*</span>
        </label>

        <textarea
          rows="5"
          placeholder="Enter cancellation reason..."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </div>

      <div className="appcancel-modal-footer">
        <button
          className="appcancel-btn"
          onClick={() => {
            setShowCancelModal(false);
            setCancelReason("");
          }}
        >
          Close
        </button>

    <button
  className="appsubmit-btn"
  onClick={() => handleAppointmentAction("cancel")}
>
  Submit Cancellation
</button>
      </div>
    </div>
  </div>
)}
{showRescheduleModal && (
 <div className="reschedule-overlay">
  <div className="reschedule-modal">

    {/* Sticky Header */}
    <div className="reschedule-header">
      <button
        className="reschedule-close"
        onClick={() => {
          setShowRescheduleModal(false);
          setSelectedSlot(null);
        }}
      >
        <MdClose size={28} />
      </button>

      <div className="reschedule-icon">
        <MdEventRepeat size={40} color="#fff" />
      </div>

      <h2>Reschedule Appointment</h2>
      <p>Please select a new available slot for this appointment.</p>
    </div>

    {/* Scrollable Body */}
    <div className="slot-list">

      {AvailableslotLoading ? (
        Array(2).fill(0).map((_, index) => (
          <div className="slot-card" key={index}>
            <div className="skeleton-slot"></div>
          </div>
        ))
      ) : AvailableslotError ? (
        <div className="slot-error">{AvailableslotError}</div>
      ) : (
        AvailableslotData.map((availability) =>
          availability.slots.map((slot) => (
            <label className="slot-card" key={slot.id}>
              <div className="slot-left">
                <input
                  type="radio"
                  name="slot"
                  checked={selectedSlot === slot.id}
                  onChange={() => setSelectedSlot(slot.id)}
                />

                <div className="slot-date">
                  <h4>{formatDate(availability.date)}</h4>
                  <span>{slot.consultation_type}</span>
                </div>
              </div>

              <div className="slot-time">
                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
              </div>
            </label>
          ))
        )
      )}

    

    </div>

      <div className="reschdule-form-group">
        <label>
          Reschedule Reason <span>*</span>
        </label>

        <textarea
          rows={4}
          placeholder="Enter reschedule reason"
          value={rescheduleReason}
          onChange={(e) => setRescheduleReason(e.target.value)}
        />
      </div>

    {/* Sticky Footer */}
    <div className="reschudlecancel-modal-footer">
      <button
        className="appcancel-btn"
        onClick={() => {
          setShowRescheduleModal(false);
          setSelectedSlot(null);
        }}
      >
        Cancel
      </button>

      <button
        className="reschudlesubmit-btn"
        onClick={() => handleAppointmentAction("reschedule")}
      >
        Confirm Reschedule
      </button>
    </div>

  </div>
</div>
)}


         <ToastContainer position="top-center" autoClose={1000} />
    
    </>
  )
}

export default Management