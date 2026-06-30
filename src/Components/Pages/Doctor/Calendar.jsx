import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import BASE_URL from "../../../Base";
import { useNavigate } from "react-router-dom";

import {
  FaCalendarAlt,
  FaUser,
} from "react-icons/fa";
import "./Calender.css";




const BookedSlotsCalendar = () => {
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
  const { DoctorId } = useParams();
  const selectedDayData = availabilityData.find(
  (item) => item.date === selectedDate
);

const totalSlots =
  selectedDayData?.slots?.length || 0;

const bookedSlots =
  selectedDayData?.slots?.filter(
    (slot) => slot.status === "booked"
  ) || [];

const availableSlots =
  selectedDayData?.slots?.filter(
    (slot) => slot.status === "available"
  ) || [];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  const navigate = useNavigate();
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
  (_, i) => i + 1
);

const getDateData = (day) => {
  const formattedDate =
    `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return availabilityData.find(
    (item) => item.date === formattedDate
  );
};

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
  const firstDate = new Date(
    result.data.availability[0].date
  );

  setSelectedMonth(firstDate.getMonth());
  setSelectedYear(firstDate.getFullYear());
  setSelectedDate(result.data.availability[0].date);
}
    } else {
      toast.error(
        result.message || "Failed to fetch availability"
      );
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


  


  const days = Array.from({ length: 30 }, (_, i) => i + 1);

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

      <div className="calendar-layout">

        <div className="calendar-section">

          <div className="weekdays">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
              (day) => (
                <div key={day}>{day}</div>
              )
            )}
          </div>

   <div className="calendar-grid">
  {Array.from({ length: firstDay }).map((_, i) => (
    <div
      key={`empty-${i}`}
      className="empty-cell"
    />
  ))}

  {calendarDays.map((day) => {
    const formattedDate = `${selectedYear}-${String(
      selectedMonth + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const dateData = availabilityData.find(
      (item) => item.date === formattedDate
    );

    return (
      <div
        key={day}
        className={`calendar-cell ${
          selectedDate === formattedDate
            ? "active"
            : ""
        }`}
        onClick={() =>
          setSelectedDate(formattedDate)
        }
      >
        <h4>{day}</h4>

        {dateData?.slots?.length > 0 ? (
          <>
            {dateData.slots
              .slice(0, 2)
              .map((slot) => (
                <div
                  key={slot.id}
                  className={`slot-item ${slot.status}`}
                >
                  {slot.start_time}
                </div>
              ))}

            {dateData.slots.length > 2 && (
              <div className="more-slots">
                +{dateData.slots.length - 2} more
              </div>
            )}
          </>
        ) : (
          <div className="no-slots">
            No Slots
          </div>
        )}
      </div>
    );
  })}
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


        <div className="booked-slots-list">
  <h3>Booked Slots</h3>

  {bookedSlots.length ? (
    bookedSlots.map((slot) => (
      <div
        key={slot.id}
        className="booking-card"
      >
        <div>
          <div className="booking-time">
            {slot.start_time} - {slot.end_time}
          </div>

          <p>
            {slot.consultation_type}
          </p>
        </div>

        <span className="status booked">
          Booked
        </span>
      </div>
    ))
  ) : (
    <div className="empty-state">
      No booked slots on this date
    </div>
  )}
</div>
<div className="available-slots-list">
  <h3>Available Slots</h3>





  {availableSlots.length ? (
    availableSlots.map((slot) => (
      <div
        key={slot.id}
        className="booking-card available-card"
      >
        <div>
          <div className="booking-time">
            {slot.start_time} - {slot.end_time}
          </div>

          <p>
            {slot.consultation_type}
          </p>
        </div>

        <span className="status available">
          Available
        </span>
      </div>
    ))
  ) : (
    <div className="empty-state">
      No available slots
    </div>
  )}
</div>
          <button className="view-all-btn">
  View All Booked Slots
</button>

        </div>
      </div>
    </div>
  );
};

export default BookedSlotsCalendar;