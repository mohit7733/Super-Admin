import React, { useState ,useEffect, } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye } from "react-icons/fa";
import BASE_URL from "../../../Base";
import { toast } from 'react-toastify'
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import DoctorReviewModal from "./DoctorReviewModal";
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
                        <td colSpan="7">
                          <div className="skeleton-row"></div>
                        </td>
                      </tr>
                    ))
                  ) : ErrorDoctorReview? (
                    <tr>
                      <td colSpan="7" style={{ color: "red" }}>
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
                            <DoctorReviewModal
  review={selectedReview}
  onClose={closeReviewModal}
/>
           
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