import React, { useState ,useEffect, } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye } from "react-icons/fa";
import BASE_URL from "../../../Base";
import { ToastContainer, toast } from "react-toastify"
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import {
  FaTimes,
 
  FaUser,
  FaBoxOpen,
  FaCalendarAlt,
  FaCheckCircle,
  FaImage,
} from "react-icons/fa";


const Doctorreview = () => {
      const[DoctorReviewData,setDoctorReviewData]=useState([]);
        const[LoadingDoctorReview,setLoadingDoctorReview]=useState(false);
        const[ErrorDoctorReview,setErrorDoctorReview]=useState(null);
        const [selectedReview, setSelectedReview] = useState(null);
const [showReviewModal, setShowReviewModal] = useState(false);
const [showRejectModal, setShowRejectModal] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);
const [reason, setReason] = useState("");
const[SelectedStatus,setSelectedStatus]=useState("")

const handleViewReview = (review) => {
  setSelectedReview(review);
  setShowReviewModal(true);
};

const closeReviewModal = () => {
  setSelectedReview(null);
  setShowReviewModal(false);
};



        const navigate = useNavigate();
        const renderStars = (rating) => {
          return [...Array(5)].map((_, index) => {
            const starNumber = index + 1;
        
            if (rating >= starNumber) {
              return <FaStar key={index} className="star-filled" />;
            }
        
            if (rating >= starNumber - 0.5) {
              return <FaStarHalfAlt key={index} className="star-filled" />;
            }
        
            return <FaRegStar key={index} className="star-empty" />;
          });
        };


const handleStatusChange = async (id, status, reason = "") => {
  if (status === "rejected" && !reason) {
    setSelectedItem(id);
    setShowRejectModal(true);
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/review/admin/?entity_type=doctor&id=${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("superadmin_token")}`,
        },
        body: JSON.stringify({
          action: status,
          reason,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      toast.success(`Status changed to ${status}`);

      setShowRejectModal(false);
      setReason("");
      setSelectedItem(null);

      getDoctorReviewList();
    } else {
      toast.error(data?.message || "Failed to update status");
    }
  } catch (error) {
    toast.error("Something went wrong");
  }
};

            const getDoctorReviewList = async () => {
const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoadingDoctorReview(true);


  try {
    const response = await fetch(
      `${BASE_URL}/review/admin/?entity_type=doctor`,
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
      setDoctorReviewData(data.data);

     

    } else {
      toast.error(data.message || "Failed to get categories");
    }

  } catch (error) {

    console.error(" Error Fetching the review :", error);

    setErrorDoctorReview("Something went wrong while fetching review data.");

    toast.error("Failed to fetch Review  data");

  } finally {
    setLoadingDoctorReview(false);
  }
};
useEffect(()=>{
getDoctorReviewList();
},[])
  return (
    <>
     <div className="page-header">
        <h1> Doctor Review Management</h1>
        <p className="page-paragraph">
          Manage Review, their details
        </p>
      </div>
       <div className="table-wrapper">
                              <table className="data-table" >
                                <thead>
                                  <tr>
                                    <th>ID</th>
                                    <th> Customer </th>
                                    <th> Doctor</th>
                                    <th> Review</th>  
                                    <th> Rating</th>              
                                  <th>Status</th>
                                    <th>Actions</th>
                      
                                  </tr>
                                </thead>
                <tbody>
                  {LoadingDoctorReview? (
                    Array(3).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td colSpan="6">
                          <div className="skeleton-row"></div>
                        </td>
                      </tr>
                    ))
                  ) : ErrorDoctorReview? (
                    <tr>
                      <td colSpan="6" style={{ color: "red" }}>
                        {ErrorDoctorReview}
                      </td>
                    </tr>
                  ) : DoctorReviewData?.length > 0 ? (
                    DoctorReviewData.map((item, index) => (
                      <tr key={item.id}>
                        <td>{index + 1}</td>
                
                       
                        <td>{item.patient_name}</td>
                
                       
                    <td>
      
      {item.doctor_name}
      </td>
      
      
        <td> {item.review}</td>
       <td>
        <div className="rating-stars">
          {renderStars(Number(item.rating))}
        
        </div>
      </td>
       <td>
  <select
    value={item.status}
    onChange={(e) => handleStatusChange(item.id, e.target.value)}
    className="status-dropdown"
  >
    <option value="">Select Status</option>
    <option value="active">Active</option>
    <option value="rejected">Rejected</option>
  </select>
</td>
      
                
                      
                      
                        
                        <td>
                                <div className="action-buttons">
                               <button
  className="action-btn view"
  onClick={() => handleViewReview(item)}
>
  <FaEye />
</button>                                              
                                                 </div>
                                </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
                              </table>
                     
                      
                      
                            </div>  
              {showReviewModal && selectedReview && (
  <div className="doctor-review-modal-overlay">
    <div className="doctor-review-modal">

      {/* Header */}
      <div className="doctor-review-modal-header">
        <div className="doctor-review-modal-title-wrapper">
          <div className="doctor-review-modal-icon">
            <FaBoxOpen />
          </div>

          <div>
            <h2>Doctor Review Details</h2>
            <p>Review ID: {selectedReview?.id}</p>
          </div>
        </div>

        <button
          className="doctor-review-modal-close-btn"
          onClick={closeReviewModal}
        >
          <FaTimes />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="doctor-review-summary-grid">

        <div className="doctor-review-summary-card">
          <div className="doctor-review-summary-icon doctor-review-blue">
            <FaUser />
          </div>

          <div>
            <span>Patient Name</span>
            <h4>{selectedReview?.patient_name}</h4>
          </div>
        </div>

        <div className="doctor-review-summary-card">
          <div className="doctor-review-summary-icon doctor-review-green">
            <FaUser />
          </div>

          <div>
            <span>Doctor Name</span>
            <h4>{selectedReview?.doctor_name}</h4>
          </div>
        </div>

        <div className="doctor-review-summary-card">
          <div className="doctor-review-summary-icon doctor-review-yellow">
            <FaStar />
          </div>

          <div>
            <span>Rating</span>

            <div className="doctor-review-rating-box">
              {renderStars(Number(selectedReview?.rating))}
            </div>

            <h4>{selectedReview?.rating}/5</h4>
          </div>
        </div>

        <div className="doctor-review-summary-card">
          <div className="doctor-review-summary-icon doctor-review-purple">
            <FaCheckCircle />
          </div>

          <div>
            <span>Status</span>

            <div
              className={`doctor-review-status-badge ${selectedReview?.status?.toLowerCase()}`}
            >
              {selectedReview?.status}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="doctor-review-detail-grid">

    

      
        <div className="doctor-review-detail-card">
          <h3>Doctor Information</h3>

          <div className="doctor-review-detail-row">
            <span>Doctor Name</span>
            <p>{selectedReview?.doctor_name}</p>
          </div>

          <div className="doctor-review-detail-row">
            <span>Current Status</span>

            <div
              className={`doctor-review-status-badge ${selectedReview?.status?.toLowerCase()}`}
            >
              {selectedReview?.status}
            </div>
          </div>

          <div className="doctor-review-detail-row">
            <span>Action By</span>
            <p>-</p>
          </div>

          <div className="doctor-review-detail-row">
            <span>Action Reason</span>
            <p>-</p>
          </div>
        </div>
      </div>

    
      <div className="doctor-review-date-card">
        <FaCalendarAlt />

        <div>
          <h4>Review Date & Time</h4>
          <p>{selectedReview?.created_at}</p>
        </div>
      </div>

      {/* Review Message */}
      <div className="doctor-review-text-card">
        <h3>Review</h3>

        <div className="doctor-review-message">
          {selectedReview?.review}
        </div>
      </div>

      {/* Images */}
      <div className="doctor-review-image-card">
        <h3>
          <FaImage />
          &nbsp; Review Images
        </h3>

        {selectedReview?.images?.length > 0 ? (
          <div className="doctor-review-images">
            {selectedReview.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`review-${index}`}
              />
            ))}
          </div>
        ) : (
          <div className="doctor-review-no-image">
            No images attached with this review.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="doctor-review-modal-footer">
        <button
          className="doctor-review-close-btn"
          onClick={closeReviewModal}
        >
          Close
        </button>

       
      </div>

    </div>
  </div>
)}
{showRejectModal && (
  <div className="modal">
   <form className="customer-form"> 
     <h3>Enter Rejection Reason</h3>

      <textarea
        placeholder="Enter reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

         <div className="form-buttons">
        <button
        type="submit"
         onClick={() => {
  if (!reason.trim()) {
    toast.error("Reason is required");
    return;
  }

  handleStatusChange(selectedItem, "rejected", reason);
}}
        >
          Submit
        </button>

        <button
        type="button"
          onClick={() => {
            setShowRejectModal(false);
            setReason("");
          }}
        >
          Cancel
        </button>
      </div>

   </form>
    

   
    </div>

)} 
      

    
    </>
  )
}

export default Doctorreview