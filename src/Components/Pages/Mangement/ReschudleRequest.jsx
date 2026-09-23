import React, { useEffect, useState } from "react";
import {
  FaTimesCircle,
  FaClock,
  FaClipboardList,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import { MdEventRepeat, MdClose } from "react-icons/md";
import { BsSearch } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";

const ReschudleRequest = () => {
  const [appointmentsearch, setAppointmentSearch] = useState("");

  const [RescheduleData, setRescheduleData] = useState([]);
  const [ReschudleLoading, setReschudleLoading] = useState(false);
  const [RescheduleError, setReschudleError] = useState(null);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [AvailableslotData, setAvailableslotData] = useState([]);
  const [AvailableslotLoading, setAvailableslotLoading] = useState(false);
  const [AvailableslotError, setAvailableslotError] = useState(null);

  const [rescheduleReason, setRescheduleReason] = useState("");

  const [totalCounts, setTotalCounts] = useState({
    appointment: 0,
    confirmed: 0,
    rescheduled: 0,
    patient_reschedule: 0,
    missed: 0,
    cancelled: 0,
    completed: 0,
    total: 0,
  });

  const navigate = useNavigate();

  /* =========================
     FORMAT DATE
  ========================= */

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

 

  const formatTime = (time) => {
    if (!time) return "-";

    const parsedTime = new Date(`1970-01-01T${time}`);

    if (Number.isNaN(parsedTime.getTime())) {
      return "-";
    }

    return parsedTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

 

  const getRescheduleHistory = (item) => {
    const history = Array.isArray(item?.status_history)
      ? item.status_history
      : [];

    return [...history]
      .reverse()
      .find(
        (event) =>
          event?.to_status === "reschedule" &&
          event?.event === "Reschedule requested"
      );
  };



  const getAppointmentReschedulelist = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setReschudleLoading(true);
    setReschudleError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/doctors/admin/consultation-history/?status=reschedule`,
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

      if (data.success) {
        const results = Array.isArray(data?.data?.results)
          ? data.data.results
          : [];

        setRescheduleData(results);

        setTotalCounts(
          data?.data?.total_counts || {
            appointment: 0,
            confirmed: 0,
            rescheduled: 0,
            patient_reschedule: 0,
            missed: 0,
            cancelled: 0,
            completed: 0,
            total: 0,
          }
        );
      } else {
        toast.error(
          data.message || "Failed to get reschedule requests"
        );
      }
    } catch (error) {
      console.error("Reschedule Fetch Error:", error);

      setReschudleError(
        "Something went wrong while fetching data."
      );

      toast.error("Failed to fetch reschedule request data");
    } finally {
      setReschudleLoading(false);
    }
  };

  /* =========================
     GET AVAILABLE SLOTS
  ========================= */

  const getAvaliableSlotlist = async (doctorId) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setAvailableslotLoading(true);
    setAvailableslotError(null);
    setAvailableslotData([]);
    setSelectedSlot(null);

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

      if (data.success) {
        const availability = Array.isArray(
          data?.data?.availability
        )
          ? data.data.availability
          : [];

        setAvailableslotData(availability);
      } else {
        toast.error(
          data.message || "Failed to get available slots"
        );
      }
    } catch (error) {
      console.error("Available Slot Fetch Error:", error);

      setAvailableslotError(
        "Something went wrong while fetching available slots."
      );

      toast.error("Failed to fetch available slots");
    } finally {
      setAvailableslotLoading(false);
    }
  };

  /* =========================
     INITIAL API CALL
  ========================= */

  useEffect(() => {
    getAppointmentReschedulelist();
  }, []);

  /* =========================
     HANDLE APPOINTMENT ACTION
  ========================= */

  const handleAppointmentAction = async (action) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    if (!selectedAppointment?.id) {
      toast.error("Appointment not selected");
      return;
    }

    let body = {
      action,
    };

   

    if (action === "cancel") {
      if (!cancelReason.trim()) {
        toast.error("Please enter cancellation reason");
        return;
      }

      body.cancellation_reason = cancelReason.trim();
    }

    /* =========================
       RESCHEDULE
    ========================= */

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
      body.reschedule_reason = rescheduleReason.trim();
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

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");

        toast.error("Session expired. Please login again");
        navigate("/login");

        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || "Action completed successfully");

        setShowCancelModal(false);
        setShowRescheduleModal(false);

        setCancelReason("");
        setRescheduleReason("");
        setSelectedSlot(null);
        setSelectedAppointment(null);
        setSelectedAction("");

        getAppointmentReschedulelist();
      } else {
        toast.error(data.message || "Action failed");
      }
    } catch (error) {
      console.error("Appointment Action Error:", error);
      toast.error("Something went wrong");
    }
  };

  

  const filteredRescheduleData = RescheduleData.filter((item) => {
    const search = appointmentsearch.trim().toLowerCase();

    if (!search) return true;

    return (
      item?.patient_name?.toLowerCase().includes(search) ||
      item?.doctor_name?.toLowerCase().includes(search) ||
      item?.patient_number?.toLowerCase().includes(search)
    );
  });

  return (
    <>
    

      <div className="page-header">
        <h1>Reschedule Request Management</h1>

        <p className="page-paragraph">
          Manage appointment details, reschedule and cancelled
          appointments.
        </p>
      </div>

    
      <div className="vendors-stats stats2-grid">

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}


          >
            <FaClipboardList size={16} />
          </div>

          <div className="stat2-info">
            <h3>Total Requests</h3>

            <div className="stat2-value">
              {totalCounts.patient_reschedule ?? 0}
            </div>
          </div>
        </div>

       
        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaClock size={24} />
          </div>

          <div className="stat2-info">
            <h3>Pending Requests</h3>

            <div className="stat2-value">
              {RescheduleData.length}
            </div>
          </div>
        </div>

     

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaCheckCircle size={24} />
          </div>

          <div className="stat2-info">
            <h3>Approved Requests</h3>

            <div className="stat2-value">
              {totalCounts.rescheduled ?? 0}
            </div>
          </div>
        </div>

       

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{
              background: "#0D614E20",
              color: "#0D614E",
            }}
          >
            <FaTimesCircle size={24} />
          </div>

          <div className="stat2-info">
            <h3>Reschudle Requests</h3>

            <div className="stat2-value">
              {totalCounts.reschudle ?? 0}
            </div>
          </div>
        </div>
      </div>


      <div className="controls-section">
        <div className="search-wrapper">
          <BsSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search appointment by patient, doctor name or number..."
            value={appointmentsearch}
            onChange={(e) =>
              setAppointmentSearch(e.target.value)
            }
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
              <th>Patient Number</th>
              <th>Doctor</th>
              <th>Booking Date</th>
              <th>Slot</th>
              <th>Reason</th>
              <th>Reschedule Request Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            

            {ReschudleLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td colSpan="9">
                      <div className="skeleton-row"></div>
                    </td>
                  </tr>
                ))
            ) : RescheduleError ? (

            

              <tr>
                <td
                  colSpan="9"
                  style={{
                    color: "red",
                    textAlign: "center",
                  }}
                >
                  {RescheduleError}
                </td>
              </tr>

            ) : filteredRescheduleData.length > 0 ? (

              /* DATA */

              filteredRescheduleData.map((item, index) => {

                /*
                 * IMPORTANT:
                 * API slot is directly inside item.slot
                 */
                const slot = item?.slot?.[0];

                /*
                 * Find latest reschedule request
                 * from status_history
                 */
                const rescheduleHistory =
                  getRescheduleHistory(item);

                return (
                  <tr key={item.id}>

                    {/* ID */}

                    <td>{index + 1}</td>

                    {/* PATIENT */}

                    <td>
                      {item.patient_name || "-"}
                    </td>

                    {/* NUMBER */}

                    <td>
                      {item.patient_number || "-"}
                    </td>

                    {/* DOCTOR */}

                    <td>
                      {item.doctor_name || "-"}
                    </td>

                    {/* BOOKING DATE */}

                    <td>
                      {slot?.date
                        ? formatDate(slot.date)
                        : "-"}
                    </td>

                    {/* SLOT */}

                    <td>
                      {slot?.start_time &&
                      slot?.end_time
                        ? `${formatTime(
                            slot.start_time
                          )} - ${formatTime(
                            slot.end_time
                          )}`
                        : "-"}
                    </td>

                    {/* REASON */}

                    <td>
                      {rescheduleHistory?.reason ||
                        "-"}
                    </td>

                    {/* RESCHEDULE REQUEST DATE */}

                    <td>
                      {rescheduleHistory?.at
                        ? formatDate(
                            rescheduleHistory.at
                          )
                        : "-"}
                    </td>

                    {/* STATUS */}

                    <td>
                      <select
                        value={item.status || "reschedule"}
                        className="status-filter"
                        onChange={(e) => {
                          const value =
                            e.target.value;

                          if (
                            value === "cancelled"
                          ) {
                            setSelectedAppointment(
                              item
                            );

                            setShowCancelModal(
                              true
                            );

                            setSelectedAction(
                              "cancel"
                            );
                          }

                          if (
                            value === "rescheduled"
                          ) {
                            setSelectedAppointment(
                              item
                            );

                            setShowRescheduleModal(
                              true
                            );

                            setSelectedAction(
                              "reschedule"
                            );

                            getAvaliableSlotlist(
                              item.doctor_id
                            );
                          }
                        }}
                      >

                        <option value="reschedule">
                          Reschedule Requested
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

              /* EMPTY */

              <tr>
                <td
                  colSpan="9"
                  style={{
                    textAlign: "center",
                  }}
                >
                  No Reschedule Requests Found
                </td>
              </tr>

            )}

          </tbody>
        </table>

    

        {showRescheduleModal && (
          <div className="appointment-reschedule-overlay">

            <div className="appointment-reschedule-modal">

              {/* CLOSE */}

              <button
                type="button"
                className="appointment-reschedule-close"
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedSlot(null);
                  setRescheduleReason("");
                  setSelectedAppointment(null);
                }}
              >
                <MdClose size={24} />
              </button>

              {/* HEADER */}

              <div className="appointment-reschedule-header">

                <div className="appointment-reschedule-icon">
                  <MdEventRepeat size={30} />
                </div>

                <h2>
                  Reschedule Appointment
                </h2>

                <p>
                  Select a new available slot for
                  this appointment.
                </p>
              </div>

              {/* BODY */}

              <div className="appointment-reschedule-body">

                {/* SLOTS */}

                {AvailableslotLoading ? (

                  <div className="appointment-reschedule-slot-grid">

                    {Array(5)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          className="appointment-reschedule-slot skeleton-reschedule-slot"
                          key={index}
                        >
                          <div className="reschedule-skeleton-line large"></div>

                          <div className="reschedule-skeleton-line small"></div>

                          <div className="reschedule-skeleton-line time"></div>
                        </div>
                      ))}

                  </div>

                ) : AvailableslotError ? (

                  <div className="appointment-reschedule-error">
                    {AvailableslotError}
                  </div>

                ) : AvailableslotData.length > 0 ? (

                  <div className="appointment-reschedule-slot-grid">

                    {AvailableslotData.flatMap(
                      (availability) => {

                        const slots = Array.isArray(
                          availability?.slots
                        )
                          ? availability.slots
                          : [];

                        return slots.map(
                          (slot) => (

                            <label
                              className={`appointment-reschedule-slot ${
                                selectedSlot ===
                                slot.id
                                  ? "appointment-reschedule-slot-selected"
                                  : ""
                              }`}
                              key={slot.id}
                            >

                              <input
                                type="radio"
                                name="appointment-reschedule-slot"
                                value={slot.id}
                                checked={
                                  selectedSlot ===
                                  slot.id
                                }
                                onChange={() =>
                                  setSelectedSlot(
                                    slot.id
                                  )
                                }
                              />

                              <div className="appointment-reschedule-slot-content">

                                <div className="appointment-reschedule-slot-top">

                                  <span className="appointment-reschedule-date">
                                    {formatDate(
                                      availability?.date
                                    )}
                                  </span>

                                  <span className="appointment-reschedule-type">
                                    {slot?.consultation_type ||
                                      "Video"}
                                  </span>

                                </div>

                                <div className="appointment-reschedule-time">

                                  <FaClock size={12} />

                                  <span>
                                    {formatTime(
                                      slot?.start_time
                                    )}{" "}
                                    -{" "}
                                    {formatTime(
                                      slot?.end_time
                                    )}
                                  </span>

                                </div>

                              </div>

                            </label>
                          )
                        );
                      }
                    )}

                  </div>

                ) : (

                  <div className="appointment-reschedule-empty">
                    No available slots found.
                  </div>

                )}

                {/* REASON */}

                <div className="appointment-reschedule-reason">

                  <label>
                    Reschedule Reason{" "}
                    <span>*</span>
                  </label>

                  <textarea
                    rows={3}
                    placeholder="Enter reason for rescheduling..."
                    value={rescheduleReason}
                    onChange={(e) =>
                      setRescheduleReason(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              {/* FOOTER */}

              <div className="appointment-reschedule-footer">

                <button
                  type="button"
                  className="appointment-reschedule-cancel"
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setSelectedSlot(null);
                    setRescheduleReason("");
                    setSelectedAppointment(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="appointment-reschedule-submit"
                  onClick={() =>
                    handleAppointmentAction(
                      "reschedule"
                    )
                  }
                >
                  <MdEventRepeat size={18} />

                  Confirm Reschedule
                </button>

              </div>

            </div>
          </div>
        )}

        {/* =========================
            CANCEL MODAL
        ========================= */}

        {showCancelModal && (
          <div className="cancel-modal-overlay">

            <div className="cancel-modal">

              {/* CLOSE */}

              <button
                className="cancel-close-btn"
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                  setSelectedAppointment(null);
                }}
              >
                <MdClose size={28} />
              </button>

              {/* ICON */}

              <div className="cancel-icon">
                <FaTimes />
              </div>

              <h2>
                Cancel Appointment
              </h2>

              <p className="cancel-subtitle">
                Please provide a reason for
                cancelling this appointment.
              </p>

              {/* FORM */}

              <div className="cancel-form-group">

                <label>
                  Cancellation Reason{" "}
                  <span>*</span>
                </label>

                <textarea
                  rows="5"
                  placeholder="Enter cancellation reason..."
                  value={cancelReason}
                  onChange={(e) =>
                    setCancelReason(
                      e.target.value
                    )
                  }
                />

              </div>

              {/* FOOTER */}

              <div className="appcancel-modal-footer">

                <button
                  className="appcancel-btn"
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason("");
                    setSelectedAppointment(null);
                  }}
                >
                  Close
                </button>

                <button
                  className="appsubmit-btn"
                  onClick={() =>
                    handleAppointmentAction(
                      "cancel"
                    )
                  }
                >
                  Submit Cancellation
                </button>

              </div>

            </div>
          </div>
        )}
      </div>

      <ToastContainer
        position="top-center"
        autoClose={1000}
      />
    </>
  );
};

export default ReschudleRequest;