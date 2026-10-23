
import React from "react";
import { useNavigate } from "react-router-dom";

const TopDoctors = ({ doctors = [] }) => {
  const navigate = useNavigate();
  const safeDoctors = Array.isArray(doctors) ? doctors : [];

  const photoClasses = ["blue-photo", "rose-photo", "teal-photo"];

  const getDoctorName = (doctor) =>
    doctor.doctor_name ||
    doctor.full_name ||
    doctor.name ||
    doctor.display_name ||
    "Doctor";

  const getConsultations = (doctor) =>
    doctor.total_consultations ??
    doctor.consultations_count ??
    doctor.consultation_count ??
    doctor.total_consultation ??
    doctor.consultations ??
    0;

  const getInitials = (name) => {
    const cleanedName = String(name)
      .replace(/^dr\.?\s*/i, "")
      .trim();

    const words = cleanedName.split(/\s+/).filter(Boolean);

    if (words.length === 0) return "DR";

    return words
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");
  };

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(Number(value) || 0);

  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Top Doctors</h2>

        <button
          type="button"
          className="link-button"
          onClick={() => navigate("/Doctor")}
        >
          View All
        </button>
      </div>

      <div className="person-list">
        {safeDoctors.length > 0 ? (
          safeDoctors.map((doctor, index) => {
            const name = getDoctorName(doctor);

            return (
              <div key={doctor.id || doctor.doctor_id || index}>
                <span
                  className={`person-photo ${
                    photoClasses[index % photoClasses.length]
                  }`}
                >
                  {getInitials(name)}
                </span>

                <strong>{name}</strong>

                <b>
                  {formatNumber(getConsultations(doctor))}
                  <small>Consultations</small>
                </b>
              </div>
            );
          })
        ) : (
          <p className="empty-state">
            No doctor data available.
          </p>
        )}
      </div>
    </section>
  );
};

export default TopDoctors;
