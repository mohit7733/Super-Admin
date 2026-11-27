
import React, { useEffect, useMemo, useState } from "react";
import {
  FaTimes,
  FaPlus,
  FaTrash,
  FaCalendarAlt,
  FaClock,
  FaSyncAlt,
  FaRupeeSign,
  FaCheck,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "./AddDoctorSlots.css";

const WEEKDAYS = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 },
];

const getLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createSlot = () => ({
  id: `${Date.now()}-${Math.random()}`,
  startTime: "",
  repeatEnabled: false,
  repeatDays: [],
  repeatUntil: "",
});

const getEndTime = (startTime) => {
  if (!startTime) return "";

  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + 30;

  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(
    endMinutes
  ).padStart(2, "0")}`;
};

const formatTime = (time) => {
  if (!time) return "--:--";

  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${String(displayHours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")} ${suffix}`;
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDateRange = (startDate, endDate, weekdays) => {
  const dates = [];
  const current = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  while (current <= end) {
    if (weekdays.includes(current.getDay())) {
      dates.push(getLocalDate(current));
    }

    current.setDate(current.getDate() + 1);
  }

  return dates;
};

const AddDoctorSlots = ({ doctor, onClose, onSave }) => {
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [consultationFee, setConsultationFee] = useState("");
  const [slots, setSlots] = useState([createSlot()]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const updateSlot = (id, key, value) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id ? { ...slot, [key]: value } : slot
      )
    );
  };

  const addSlot = () => {
    setSlots((prev) => [...prev, createSlot()]);
  };

  const removeSlot = (id) => {
    if (slots.length === 1) {
      toast.warning("At least one time slot is required.");
      return;
    }

    setSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  const toggleWeekday = (id, day) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== id) return slot;

        const exists = slot.repeatDays.includes(day);

        return {
          ...slot,
          repeatDays: exists
            ? slot.repeatDays.filter((d) => d !== day)
            : [...slot.repeatDays, day],
        };
      })
    );
  };

  const generatedSchedule = useMemo(() => {
    const schedule = {};

    slots.forEach((slot) => {
      if (!slot.startTime) return;

      let dates = [selectedDate];

      if (slot.repeatEnabled) {
        if (!slot.repeatDays.length || !slot.repeatUntil) return;

        dates = getDateRange(
          selectedDate,
          slot.repeatUntil,
          slot.repeatDays
        );
      }

      dates.forEach((date) => {
        if (!schedule[date]) schedule[date] = [];

        schedule[date].push({
          start_time: slot.startTime,
          end_time: getEndTime(slot.startTime),
        });
      });
    });

    return Object.entries(schedule)
      .map(([date, dateSlots]) => ({
        date,
        slots: dateSlots.sort((a, b) =>
          a.start_time.localeCompare(b.start_time)
        ),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [slots, selectedDate]);

  const validateSlots = () => {
    if (!selectedDate) {
      toast.error("Please select a date.");
      return false;
    }

    if (selectedDate < getLocalDate()) {
      toast.error("Please select today or a future date.");
      return false;
    }

    if (!slots.length) {
      toast.error("Please add at least one slot.");
      return false;
    }

    for (const slot of slots) {
      if (!slot.startTime) {
        toast.error("Please select start time for all slots.");
        return false;
      }

      if (slot.repeatEnabled) {
        if (!slot.repeatDays.length) {
          toast.error("Please select at least one repeat day.");
          return false;
        }

        if (!slot.repeatUntil) {
          toast.error("Please select Repeat Until date.");
          return false;
        }

        if (slot.repeatUntil < selectedDate) {
          toast.error("Repeat Until cannot be before the selected date.");
          return false;
        }

        if (slot.repeatUntil < getLocalDate()) {
          toast.error("Please select a future Repeat Until date.");
          return false;
        }
      }
    }

    if (!generatedSchedule.length) {
      toast.error("No valid schedule dates found.");
      return false;
    }

    for (const day of generatedSchedule) {
      const sorted = [...day.slots].sort((a, b) =>
        a.start_time.localeCompare(b.start_time)
      );

      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].start_time < sorted[i - 1].end_time) {
          toast.error(
            `Overlapping slots found on ${formatDate(day.date)}.`
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (saving) return;

    if (!validateSlots()) return;

    if (typeof onSave !== "function") {
      toast.error("Save function is not configured.");
      return;
    }

    const payload = generatedSchedule.map((item) => ({
      date: item.date,
      slots: item.slots,
    }));

    try {
      setSaving(true);

      await onSave(payload);

      // Parent component handles closing after successful API save.
    } catch (error) {
      console.error("Slot save error:", error);
      toast.error("Unable to save doctor slots.");
    } finally {
      setSaving(false);
    }
  };

  const doctorName =
    doctor?.full_name ||
    doctor?.name ||
    doctor?.doctor_name ||
    "Doctor";

  return (
    <div
      className="add-slot-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="add-slot-drawer"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="add-slot-header">
          <div className="add-slot-header-content">
            <div className="add-slot-header-icon">
              <FaCalendarAlt />
            </div>

            <div>
              <h2>Add Time Slots</h2>
              <p>Manage availability for {doctorName}</p>
            </div>
          </div>

          <button
            type="button"
            className="add-slot-close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <FaTimes />
          </button>
        </div>

        {/* BODY */}
        <div className="add-slot-body">

          {/* DOCTOR INFO */}
          <div className="add-slot-doctor-card">
            <div className="add-slot-doctor-avatar">
              {doctorName.charAt(0).toUpperCase()}
            </div>

            <div className="add-slot-doctor-details">
              <span>Adding availability for</span>
              <strong>{doctorName}</strong>
            </div>

            <span className="add-slot-status">Schedule</span>
          </div>

          {/* CONSULTATION FEE */}
          <div className="add-slot-section">
            <div className="add-slot-section-heading">
              <div>
                <h3>Consultation Fee</h3>
                <p>Enter the consultation amount (optional)</p>
              </div>
            </div>

            <div className="add-slot-fee-input">
              <span><FaRupeeSign /></span>

              <input
                type="number"
                min="0"
                placeholder="Enter consultation fee"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
              />
            </div>
          </div>

          <div className="add-slot-divider" />

          {/* DATE */}
          <div className="add-slot-section">
            <div className="add-slot-section-heading">
              <div>
                <h3>Select Date</h3>
                <p>Choose the date from which slots will begin</p>
              </div>
            </div>

            <div className="add-slot-date-input">
              <FaCalendarAlt />

              <input
                type="date"
                min={getLocalDate()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="add-slot-divider" />

          {/* TIME SLOTS */}
          <div className="add-slot-section">
            <div className="add-slot-section-heading slot-heading-row">
              <div>
                <h3>Availability Slots</h3>
                <p>Add one or more consultation time slots</p>
              </div>

              <span className="slot-count">
                {slots.length} {slots.length === 1 ? "Slot" : "Slots"}
              </span>
            </div>

            <div className="add-slot-list">
              {slots.map((slot, index) => (
                <div className="add-slot-card" key={slot.id}>

                  <div className="add-slot-card-heading">
                    <div className="add-slot-number">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <strong>Time Slot {index + 1}</strong>
                    </div>

                    <button
                      type="button"
                      className="add-slot-delete"
                      onClick={() => removeSlot(slot.id)}
                      title="Delete slot"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {/* TIME INPUTS */}
                  <div className="add-slot-time-grid">
                    <div className="add-slot-field">
                      <label>Start Time</label>

                      <div className="add-slot-time-input">
                        <FaClock />

                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            updateSlot(slot.id, "startTime", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div className="add-slot-field">
                      <label>End Time</label>

                      <div className="add-slot-time-input readonly-time">
                        <FaClock />

                        <input
                          type="time"
                          value={getEndTime(slot.startTime)}
                          readOnly
                          tabIndex={-1}
                        />

                        <span className="auto-tag">AUTO</span>
                      </div>
                    </div>
                  </div>

                  <div className="add-slot-duration">
                    <FaInfoCircle />
                    Each consultation slot has a fixed duration of 30 minutes.
                  </div>

                  {/* WEEKLY REPEAT */}
                  <div className="add-slot-repeat">

                    <div className="add-slot-repeat-heading">
                      <div className="add-slot-repeat-icon">
                        <FaSyncAlt />
                      </div>

                      <div className="add-slot-repeat-text">
                        <strong>Repeat Weekly</strong>
                        <span>Automatically repeat this time slot</span>
                      </div>

                      <label className="add-slot-switch">
                        <input
                          type="checkbox"
                          checked={slot.repeatEnabled}
                          onChange={(e) =>
                            updateSlot(
                              slot.id,
                              "repeatEnabled",
                              e.target.checked
                            )
                          }
                        />
                        <span className="add-slot-switch-slider" />
                      </label>
                    </div>

                    {slot.repeatEnabled && (
                      <div className="add-slot-repeat-content">

                        <label className="repeat-label">
                          Repeat On
                        </label>

                        <div className="add-slot-weekdays">
                          {WEEKDAYS.map((day) => (
                            <button
                              type="button"
                              key={day.value}
                              className={
                                slot.repeatDays.includes(day.value)
                                  ? "weekday-btn weekday-active"
                                  : "weekday-btn"
                              }
                              onClick={() =>
                                toggleWeekday(slot.id, day.value)
                              }
                            >
                              {day.label}
                            </button>
                          ))}
                        </div>

                        <div className="add-slot-repeat-until">
                          <label>Repeat Until</label>

                          <div className="add-slot-date-input">
                            <FaCalendarAlt />

                            <input
                              type="date"
                              min={selectedDate}
                              value={slot.repeatUntil}
                              onChange={(e) =>
                                updateSlot(
                                  slot.id,
                                  "repeatUntil",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>

                        {slot.repeatDays.length > 0 && slot.repeatUntil && (
                          <div className="repeat-summary">
                            <FaCheck />
                            Repeats on{" "}
                            {WEEKDAYS
                              .filter((day) =>
                                slot.repeatDays.includes(day.value)
                              )
                              .map((day) => day.label)
                              .join(", ")}
                            {" "}until {formatDate(slot.repeatUntil)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>

            <button
              type="button"
              className="add-another-slot"
              onClick={addSlot}
            >
              <FaPlus />
              Add Another Slot
            </button>
          </div>

          {/* PREVIEW */}
          <div className="add-slot-preview">
            <div className="add-slot-preview-heading">
              <div>
                <h3>Schedule Preview</h3>
                <p>Review your generated availability</p>
              </div>

              <span className="preview-badge">
                {generatedSchedule.length} Dates
              </span>
            </div>

            {generatedSchedule.length > 0 ? (
              <div className="add-slot-preview-list">
                {generatedSchedule.slice(0, 10).map((day) => (
                  <div className="preview-date-row" key={day.date}>
                    <div className="preview-date">
                      <FaCalendarAlt />
                      <strong>{formatDate(day.date)}</strong>
                    </div>

                    <div className="preview-times">
                      {day.slots.map((time, index) => (
                        <span key={`${time.start_time}-${index}`}>
                          {formatTime(time.start_time)} -{" "}
                          {formatTime(time.end_time)}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {generatedSchedule.length > 10 && (
                  <p className="preview-more">
                    + {generatedSchedule.length - 10} more dates
                  </p>
                )}
              </div>
            ) : (
              <div className="preview-empty">
                <FaCalendarAlt />
                <p>Select your time slots to see the schedule preview.</p>
              </div>
            )}
          </div>

        </div>

        {/* FOOTER */}
        <div className="add-slot-footer">
          <div className="add-slot-footer-info">
            <span>{slots.length} time slots</span>
            <small>Review before saving</small>
          </div>

          <div className="add-slot-footer-actions">
            <button
              type="button"
              className="add-slot-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="add-slot-save"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <FaCheck />
                  Save Schedule
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddDoctorSlots;
