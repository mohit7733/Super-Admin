
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BASE_URL from "../../../Base";
import {
  FaUserCircle,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import "./Calender.css";

const BookedSlotsCalendar = ({ setActiveTab }) => {
  const { DoctorId } = useParams();
  const navigate = useNavigate();

  const [availabilityData, setAvailabilityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth()
  );

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );

  // EDIT STATES
  const [editingSlot, setEditingSlot] = useState(null);

  const [editForm, setEditForm] = useState({
    start_time: "",
    end_time: "",
  });

  const [saving, setSaving] = useState(false);

  // DELETE STATES
  const [deletingSlot, setDeletingSlot] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
  ];

  const years = [
    2024, 2025, 2026, 2027, 2028, 2029, 2030,
  ];

  // API URLS
  const API_URL = `${BASE_URL}/doctors/admin/availability/?doctor_id=${DoctorId}`;
  const SLOT_API_URL = `${BASE_URL}/doctors/admin/availability/`;

  // FORMAT TIME
  const formatTime = (time) => {
    if (!time) return "";
    return String(time).slice(0, 5);
  };

  // DAY FROM DATE
  const getDayFromDate = (date) => {
    if (!date) return "";

    const dateObject = new Date(`${date}T00:00:00`);

    return dateObject
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();
  };

  // AUTOMATIC END TIME = START TIME + 30 MINUTES
  const calculateEndTime = (startTime) => {
    if (!startTime) return "";

    const [hours, minutes] = startTime.split(":").map(Number);

    const totalMinutes = hours * 60 + minutes + 30;

    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;

    return `${String(endHours).padStart(2, "0")}:${String(
      endMinutes
    ).padStart(2, "0")}`;
  };

  // SELECTED DAY DATA
  const selectedDayData = availabilityData.find(
    (item) => item.date === selectedDate
  );

  const totalSlots = selectedDayData?.slots?.length || 0;

  const bookedSlots =
    selectedDayData?.slots?.filter(
      (slot) => slot.status === "booked"
    ) || [];

  const availableSlots =
    selectedDayData?.slots?.filter(
      (slot) => slot.status === "available"
    ) || [];

  // CALENDAR DATES
  const daysInMonth = new Date(
    selectedYear,
    selectedMonth + 1,
    0
  ).getDate();

  const firstDay = new Date(
    selectedYear,
    selectedMonth,
    1
  ).getDay();

  const calendarDays = Array.from(
    { length: daysInMonth },
    (_, index) => index + 1
  );

  const formatDate = (day) =>
    `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

  // GET AVAILABILITY API
  const fetchAvailability = useCallback(async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to fetch availability"
        );
      }

      const availability = result?.data?.availability || [];

      setDoctor(result?.data?.doctor || null);
      setAvailabilityData(availability);

      if (availability.length > 0) {
        const firstDate = availability[0].date;

        if (firstDate) {
          const dateObject = new Date(`${firstDate}T00:00:00`);

          setSelectedMonth(dateObject.getMonth());
          setSelectedYear(dateObject.getFullYear());

          setSelectedDate((previous) => {
            return availability.some(
              (item) => item.date === previous
            )
              ? previous
              : firstDate;
          });
        }
      } else {
        setSelectedDate(null);
      }
    } catch (error) {
      console.error("Availability Fetch Error:", error);
      toast.error(error.message || "Failed to fetch availability");
    } finally {
      setLoading(false);
    }
  }, [API_URL, navigate]);

  useEffect(() => {
    if (DoctorId) {
      fetchAvailability();
    }
  }, [DoctorId, fetchAvailability]);

  // ==============================
  // EDIT SLOT
  // ==============================

  // OPEN EDIT MODAL
  const handleEditClick = (slot, date) => {
    if (!slot?.id) {
      toast.error("Slot ID is missing in API response");
      console.error("Slot data:", slot);
      return;
    }

    const startTime = formatTime(slot.start_time);

    setEditingSlot({
      id: slot.id,
      day: slot.day || getDayFromDate(date),
      date,
    });

    setEditForm({
      start_time: startTime,
      end_time: calculateEndTime(startTime),
    });
  };

  // CLOSE EDIT MODAL
  const closeEditModal = () => {
    if (saving) return;

    setEditingSlot(null);

    setEditForm({
      start_time: "",
      end_time: "",
    });
  };

  // UPDATE SLOT API - PUT
  const handleUpdateSlot = async (e) => {
    e.preventDefault();

    if (!editingSlot?.id) {
      toast.error("Slot ID is missing");
      return;
    }

    if (!editForm.start_time) {
      toast.error("Please select start time");
      return;
    }

    // ALWAYS CALCULATE END TIME AGAIN BEFORE API CALL
    const automaticEndTime = calculateEndTime(
      editForm.start_time
    );

    const payload = {
      start_time: `${editForm.start_time}:00`,
      end_time: `${automaticEndTime}:00`,
    };

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    console.log("UPDATE SLOT ID:", editingSlot.id);
    console.log("UPDATE SLOT PAYLOAD:", payload);

    try {
      setSaving(true);

      const response = await fetch(
        `${SLOT_API_URL}?id=${encodeURIComponent(editingSlot.id)}`,
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to update availability slot"
        );
      }

      toast.success(
        result.message || "Availability slot updated successfully"
      );

      setEditingSlot(null);

      setEditForm({
        start_time: "",
        end_time: "",
      });

      await fetchAvailability();
    } catch (error) {
      console.error("Update Slot Error:", error);
      toast.error(error.message || "Failed to update slot");
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // DELETE SLOT
  // ==============================

  // OPEN DELETE MODAL
  const handleDeleteClick = (slot) => {
    if (!slot?.id) {
      toast.error("Slot ID is missing");
      console.error("Delete Slot Data:", slot);
      return;
    }

    setDeletingSlot(slot);
  };

  // CLOSE DELETE MODAL
  const closeDeleteModal = () => {
    if (deleting) return;

    setDeletingSlot(null);
  };

  // DELETE SLOT API - DELETE
  const handleDeleteSlot = async () => {
    if (!deletingSlot?.id) {
      toast.error("Slot ID is missing");
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      setDeleting(true);

      console.log("DELETE SLOT ID:", deletingSlot.id);

      const response = await fetch(
        `${SLOT_API_URL}?id=${encodeURIComponent(deletingSlot.id)}`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
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

      const responseText = await response.text();
      let result = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          result = {};
        }
      }

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to delete availability slot"
        );
      }

      toast.success(
        result.message || "Availability slot deleted successfully"
      );

      setDeletingSlot(null);

      await fetchAvailability();
    } catch (error) {
      console.error("Delete Slot Error:", error);
      toast.error(error.message || "Failed to delete slot");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="slot-calendar-page">

      {/* FILTERS */}
      <div className="filters">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {months.map((month, index) => (
            <option key={month} value={index}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="calendar-loader">
          <div className="spinner" />
          <p>Loading availability...</p>
        </div>
      ) : (
        <div className="calendar-layout">

          {/* CALENDAR SECTION */}
          <div className="calendar-section">

            <div className="weekdays">
              {[
                "Sun", "Mon", "Tue", "Wed",
                "Thu", "Fri", "Sat",
              ].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>

            <div className="calendar-grid">

              {Array.from({ length: firstDay }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="empty-cell"
                />
              ))}

              {calendarDays.map((day) => {
                const formattedDate = formatDate(day);

                const dateData = availabilityData.find(
                  (item) => item.date === formattedDate
                );

                return (
                  <div
                    key={formattedDate}
                    className={`calendar-cell ${
                      selectedDate === formattedDate ? "active" : ""
                    }`}
                    onClick={() => setSelectedDate(formattedDate)}
                  >
                    <h4>{day}</h4>

                    {dateData?.slots?.length ? (
                      <>
                        {dateData.slots.slice(0, 2).map((slot, index) => (
                          <div
                            key={slot.id || `${formattedDate}-${index}`}
                            className="calendar-slot"
                          >
                            <div className="calendar-slot-actions">

                              <div
                                className={`slot-time ${
                                  slot.status || "available"
                                }`}
                              >
                                {formatTime(slot.start_time)} -{" "}
                                {formatTime(slot.end_time)}
                              </div>

                              <div className="slot-action-buttons">

                                {/* EDIT BUTTON */}
                                <button
                                  type="button"
                                  className="slot-edit-btn"
                                  title="Edit Slot"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditClick(slot, formattedDate);
                                  }}
                                >
                                  <FaEdit />
                                </button>

                                {/* DELETE BUTTON */}
                                <button
                                  type="button"
                                  className="slot-delete-btn"
                                  title="Delete Slot"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(slot);
                                  }}
                                >
                                  <FaTrash />
                                </button>

                              </div>
                            </div>
                          </div>
                        ))}

                        {dateData.slots.length > 2 && (
                          <div className="more-count">
                            +{dateData.slots.length - 2} more
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="no-slots">No Slots</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* LEGEND */}
            <div className="calendar-legend">
              {[
                "available",
                "booked",
                "completed",
                "confirmed",
                "rescheduled",
                "expired",
              ].map((status) => (
                <div className="legend-item" key={status}>
                  <span className={`legend-dot ${status}`} />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
              ))}

              <div className="legend-item">
                <span className="legend-dot no-slots" />
                No Slots
              </div>
            </div>
          </div>

          {/* DETAILS PANEL */}
          <div className="details-panel">

            <div className="selected-date-card">
              <FaCalendarAlt className="date-icon" />

              <div>
                <h2>{selectedDate || "Select Date"}</h2>
                <span>Selected Date</span>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="summary-cards">

              <div className="mini-card">
                <span>Total Slots</span>
                <h3>{totalSlots}</h3>
              </div>

              <div className="mini-card booked">
                <span>Booked</span>
                <h3>{bookedSlots.length}</h3>
              </div>

              <div className="mini-card available">
                <span>Available</span>
                <h3>{availableSlots.length}</h3>
              </div>

            </div>

            {/* SLOT LIST */}
            <div className="booked-slots-list">

              <h3>
                Time Slots ({selectedDayData?.slots?.length || 0})
              </h3>

              {selectedDayData?.slots?.length ? (
                selectedDayData.slots.map((slot, index) => {
                  const showPatient =
                    (
                      slot.status === "booked" ||
                      slot.status === "rescheduled"
                    ) && slot.booked_by?.patient_name;

                  return (
                    <div
                      key={slot.id || `${selectedDate}-${index}`}
                      className="slot-card"
                    >
                      <div>
                        <div
                          className={`slot-time ${
                            slot.status || "available"
                          }`}
                        >
                          {formatTime(slot.start_time)} -{" "}
                          {formatTime(slot.end_time)}
                        </div>

                        <p>{slot.consultation_type || "-"}</p>

                        {showPatient && (
                          <div className="slot-card-patient">
                            <FaUserCircle className="patient-icon" />
                            <span>{slot.booked_by.patient_name}</span>
                          </div>
                        )}
                      </div>

                      <div className="slot-right">
                        <span
                          className={`status ${
                            slot.status || "available"
                          }`}
                        >
                          {slot.status || "available"}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-state">
                  No Slots
                </div>
              )}
            </div>

            <button
              type="button"
              className="view-all-btn"
              onClick={() => setActiveTab("Slot")}
            >
              View All Booked Slots
            </button>

          </div>
        </div>
      )}

      {/* ==============================
          EDIT SLOT MODAL
      ============================== */}

      {editingSlot && (
        <div
          className="calendar-modal-overlay"
          onClick={closeEditModal}
        >
          <div
            className="calendar-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="calendar-modal-header">
              <div>
                <h2>Edit Availability Slot</h2>
                <p>Update doctor availability timings</p>
              </div>

              <button
                type="button"
                className="calendar-modal-close"
                onClick={closeEditModal}
                disabled={saving}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateSlot}>

              <div className="calendar-modal-body">

                {/* START TIME */}
                <div className="calendar-form-group">
                  <label>Start Time</label>

                  <input
                    type="time"
                    value={editForm.start_time}
                    onChange={(e) => {
                      const startTime = e.target.value;

                      setEditForm({
                        start_time: startTime,
                        end_time: calculateEndTime(startTime),
                      });
                    }}
                    required
                  />
                </div>

                {/* END TIME - AUTOMATICALLY CALCULATED */}
                <div className="calendar-form-group">
                  <label>End Time (+30 Minutes)</label>

                  <input
                    type="time"
                    value={editForm.end_time}
                    disabled
                    readOnly
                  />

                
                </div>

              </div>

              <div className="calendar-modal-footer">

                <button
                  type="button"
                  className="calendar-cancel-btn"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="calendar-update-btn"
                  disabled={saving || !editForm.start_time}
                >
                  {saving ? "Updating..." : "Update Slot"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==============================
          DELETE CONFIRMATION MODAL
      ============================== */}

      {deletingSlot && (
        <div
          className="calendar-delete-overlay"
          onClick={closeDeleteModal}
        >
          <div
            className="calendar-delete-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <h2>
              Are you sure you want to delete this Slot?
            </h2>

            <div className="calendar-delete-actions">

              <button
                type="button"
                className="calendar-delete-yes"
                onClick={handleDeleteSlot}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes"}
              </button>

              <button
                type="button"
                className="calendar-delete-no"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                No
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookedSlotsCalendar;
