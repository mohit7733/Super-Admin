import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BASE_URL from "../../../Base";
import { FaUserCircle, FaCalendarAlt } from "react-icons/fa";
import "./Calender.css";

const BookedSlotsCalendar = ({ setActiveTab }) => {
  const [availabilityData, setAvailabilityData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { DoctorId } = useParams();
  const navigate = useNavigate();

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];

  const selectedDayData = availabilityData.find(
    (item) => item.date === selectedDate
  );

  const totalSlots = selectedDayData?.slots?.length || 0;
  const bookedSlots =
    selectedDayData?.slots?.filter((slot) => slot.status === "booked") || [];
  const availableSlots =
    selectedDayData?.slots?.filter((slot) => slot.status === "available") || [];

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const formatDate = (day) =>
    `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

  const fetchAvailability = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${BASE_URL}/doctors/admin/availability/?doctor_id=${DoctorId}`,
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

      const result = await response.json();

      if (result.success) {
        setDoctor(result.data.doctor);
        setAvailabilityData(result.data.availability);

        if (result.data.availability?.length > 0) {
          const firstDate = new Date(result.data.availability[0].date);
          setSelectedMonth(firstDate.getMonth());
          setSelectedYear(firstDate.getFullYear());
          setSelectedDate(result.data.availability[0].date);
        }
      } else {
        toast.error(result.message || "Failed to fetch availability");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (DoctorId) {
      fetchAvailability();
    }
  }, [DoctorId]);

  return (
    <div className="slot-calendar-page">
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
        <div className="calendar-section">
          <div className="weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="empty-cell" />
            ))}

            {calendarDays.map((day) => {
              const formattedDate = formatDate(day);
              const dateData = availabilityData.find(
                (item) => item.date === formattedDate
              );

              return (
                <div
                  key={day}
                  className={`calendar-cell ${
                    selectedDate === formattedDate ? "active" : ""
                  }`}
                  onClick={() => setSelectedDate(formattedDate)}
                >
                  <h4>{day}</h4>

                  {dateData?.slots?.length ? (
                    <>
                      {dateData.slots.slice(0, 2).map((slot) => (
                        <div key={slot.id} className="calendar-slot">
                          <div className={`slot-time ${slot.status}`}>
                            {slot.start_time} - {slot.end_time}
                          </div>

                          {slot.status === "booked" && (
                            <div className="patient-name">
                              <FaUserCircle className="patient-icon" />
                              <span>
                                {slot.booked_by?.patient_name ||
                                  slot.patient_name ||
                                  slot.user_name ||
                                  "Booked"}
                              </span>
                            </div>
                          )}
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

          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot available"></span>
              Available
            </div>
            <div className="legend-item">
              <span className="legend-dot booked"></span>
              Booked
            </div>
            <div className="legend-item">
              <span className="legend-dot completed"></span>
              Completed
            </div>
            <div className="legend-item">
              <span className="legend-dot confirmed"></span>
              Confirmed
            </div>
            <div className="legend-item">
              <span className="legend-dot rescheduled"></span>
              Rescheduled
            </div>
            <div className="legend-item">
              <span className="legend-dot expired"></span>
              Expired
            </div>
            <div className="legend-item">
              <span className="legend-dot no-slots"></span>
              No Slots
            </div>
          </div>
        </div>

        <div className="details-panel">
          <div className="selected-date-card">
            <FaCalendarAlt className="date-icon" />
            <div>
              <h2>{selectedDate || "Select Date"}</h2>
              <span>Selected Date</span>
            </div>
          </div>

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

          <div>
            <h3 style={{ marginBottom: "10px" }}>
              Time Slots ({selectedDayData?.slots?.length || 0})
            </h3>

            {selectedDayData?.slots?.length ? (
              selectedDayData.slots.map((slot) => {
                const showPatient =
                  (slot.status === "booked" || slot.status === "rescheduled") &&
                  slot.booked_by?.patient_name;

                return (
                  <div key={slot.id} className="slot-card">
                    <div>
                      <div className={`slot-time ${slot.status}`}>
                        {slot.start_time} - {slot.end_time}
                      </div>
                      <p>{slot.consultation_type}</p>

                      {showPatient && (
                        <div className="slot-card-patient">
                          <FaUserCircle className="patient-icon" />
                     <span style={{ fontSize: "11px", fontWeight: "600" }}>
  {slot.booked_by.patient_name}
</span>
                        </div>
                      )}
                    </div>

                    <div className="slot-right">
                      <span className={`status ${slot.status}`}>
                        {slot.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">No Slots</div>
            )}
          </div>
<button
  className="view-all-btn"
  onClick={() => setActiveTab("Slot")}
>
  View All Booked Slots
</button>
        </div>
      </div>
      )}
    </div>
  );
};

export default BookedSlotsCalendar;