
import React, { useState } from "react";


const Calender = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrev = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNext = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const selectDate = (day) => {
    const selected = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onDateSelect(selected);
  };

  return (
    <div className="calendar-box">
      <div className="calendar-header">
        <button onClick={handlePrev}>◀</button>
        <h3>
          {currentDate.toLocaleString("default", { month: "long" })} {year}
        </h3>
        <button onClick={handleNext}>▶</button>
      </div>

      <div className="calendar-grid">
        {[...Array(daysInMonth)].map((_, i) => (
          <div key={i} className="calendar-day" onClick={() => selectDate(i + 1)}>
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calender;


