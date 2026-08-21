import React, { useState } from "react";
import "./DoctorReviewModal.css";

import {
  FiX,
  FiClock,
  FiUser,
  FiUserCheck,
  FiCalendar,
  FiMessageSquare,
  FiImage,
  FiCheckCircle,
  FiCopy,
} from "react-icons/fi";

import { FaStar, FaRegStar } from "react-icons/fa";

const DoctorReviewModal = ({ review, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!review) return null;

  const images = review.image_urls || [];

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) =>
      index < Number(rating) ? (
        <FaStar key={index} className="doctor-modal-star filled" />
      ) : (
        <FaRegStar key={index} className="doctor-modal-star" />
      )
    );
  };

  const copyAppointmentId = () => {
    if (review.appointment_id) {
      navigator.clipboard.writeText(review.appointment_id);
    }
  };

  return (
    <>
      <div
        className="reviewDrawerOverlay"
        onClick={onClose}
      >
        <div
          className="reviewDrawer"
          onClick={(e) => e.stopPropagation()}
        >

       
          <div className="reviewDrawerHeader">

            <div>
              <h2>Review Details</h2>

              <p className="doctor-review-id">
                Review ID: {review.id}
              </p>

              <div className="doctor-review-meta">

                <span className="doctor-review-date">
                  <FiClock />
                  {formatDate(review.created_at)}
                </span>

                <span className="doctor-meta-dot">
                  •
                </span>

                <span
                  className={`doctor-status ${
                    review.status?.toLowerCase() || ""
                  }`}
                >
                  {review.status || "active"}
                </span>

              </div>
            </div>

            <button
              className="doctor-modal-close"
              onClick={onClose}
            >
              <FiX />
            </button>

          </div>


         
          <div className="doctor-review-body">

           
            <div className="doctor-top-grid">

             
              <div className="doctor-info-card">

                <div className="doctor-card-title">
                  <FiUser />
                  <h3>Patient Information</h3>
                </div>

                <div className="doctor-person">

                  <div className="doctor-avatar">
                    <FiUser />
                  </div>

                  <div className="doctor-person-content">

                    <h4>
                      {review.patient_name || "Unknown Patient"}
                    </h4>

                    <span>Appointment ID</span>

                    <div className="doctor-id-row">

                      <p>
                        {review.appointment_id || "—"}
                      </p>

                      {review.appointment_id && (
                        <button
                          onClick={copyAppointmentId}
                          title="Copy Appointment ID"
                        >
                          <FiCopy />
                        </button>
                      )}

                    </div>

                    <span className="reviewed-title">
                      Reviewed
                    </span>

                    <div
                      className={
                        review.is_reviewed
                          ? "reviewed-yes"
                          : "reviewed-no"
                      }
                    >
                      {review.is_reviewed ? "Yes" : "No"}
                    </div>

                  </div>

                </div>

              </div>


             
              <div className="doctor-info-card">

                <div className="doctor-card-title">
                  <FiUserCheck />
                  <h3>Doctor Information</h3>
                </div>

                <div className="doctor-person">

                  <div className="doctor-avatar doctor-avatar-green">
                    <FiUserCheck />
                  </div>

                  <div className="doctor-person-content">

                    <h4>
                      {review.doctor_name || "Unknown Doctor"}
                    </h4>

                    <span>Doctor ID</span>

                    <p className="doctor-id-text">
                      {review.doctor_id || "—"}
                    </p>

                  
                    {images.length > 0 && (
                      <div className="doctor-image-thumbnails">

                        {images.slice(0, 4).map(
                          (img, index) => (
                            <div
                              key={index}
                              className={`doctor-thumbnail ${
                                index === 0
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                setSelectedImage(img)
                              }
                            >
                              <img
                                src={img}
                                alt={`Review ${index + 1}`}
                              />
                            </div>
                          )
                        )}

                      </div>
                    )}

                  </div>

                </div>

              </div>

            </div>


            <div className="doctor-section-card">

              <div className="doctor-section-header">
                <FiCheckCircle />
                <h3>Rating</h3>
              </div>

              <div className="doctor-rating-body">

                <div className="doctor-stars">
                  {renderStars(review.rating)}
                </div>

                <strong>
                  {review.rating || 0} / 5
                </strong>

              </div>

            </div>


            
            <div className="doctor-section-card">

              <div className="doctor-section-header">
                <FiMessageSquare />
                <h3>Patient Review</h3>
              </div>

              <div className="doctor-review-content">

                {review.review?.trim() ? (
                  <p>
                    {review.review}
                  </p>
                ) : (
                  <p className="doctor-empty">
                    No written review provided.
                  </p>
                )}

              </div>

            </div>


            {/* ================= DOCTOR REPLY ================= */}
            <div className="doctor-section-card">

              <div className="doctor-section-header">
                <FiMessageSquare />
                <h3>Doctor Reply</h3>
              </div>

              <div className="doctor-review-content">

                {review.doctor_reply ? (
                  <>
                    <p>
                      {review.doctor_reply}
                    </p>

                    {review.doctor_reply_at && (
                      <div className="doctor-reply-date">
                        <FiClock />

                        {formatDate(
                          review.doctor_reply_at
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="doctor-empty">
                    Doctor has not replied to this review.
                  </p>
                )}

              </div>

            </div>


            {/* ================= REVIEW INFORMATION ================= */}
            <div className="doctor-section-card">

              <div className="doctor-section-header">
                <FiCalendar />
                <h3>Review Information</h3>
              </div>

              <div className="doctor-info-grid">

                <div>
                  <span>Review Date</span>
                  <strong>
                    {formatDate(review.created_at)}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong
                    className={`doctor-status-text ${
                      review.status?.toLowerCase() || ""
                    }`}
                  >
                    {review.status || "—"}
                  </strong>
                </div>

                <div>
                  <span>Action By</span>
                  <strong>
                    {review.action_by_name ||
                      review.action_by ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>Action Reason</span>
                  <strong>
                    {review.action_reason || "—"}
                  </strong>
                </div>

              </div>

            </div>

          </div>


          {/* ================= FOOTER ================= */}
          <div className="doctor-modal-footer">

            <button
              onClick={onClose}
              className="doctor-close-button"
            >
              Close
            </button>

          </div>

        </div>
      </div>


      {/* ================= IMAGE PREVIEW ================= */}
      {selectedImage && (
        <div
          className="doctor-image-preview"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="doctor-image-preview-close"
            onClick={() => setSelectedImage(null)}
          >
            <FiX />
          </button>

          <img
            src={selectedImage}
            alt="Review"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default DoctorReviewModal;