
import React, { useState ,useEffect, } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye } from "react-icons/fa";
import BASE_URL from "../../../Base";
import { toast } from 'react-toastify'
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import {
  FaTimes,
 
  FaUser,
  FaBoxOpen,
  FaCalendarAlt,
  FaCheckCircle,
  FaImage,
} from "react-icons/fa";

import "./Review.css"


const Review = () => {
    const[ReviewData,setReviewData]=useState([]);
    const[LoadingReview,setLoadingReview]=useState(false);
    const[ErrorReview,setErrorReview]=useState(null);
    const [reviewModal, setReviewModal] = useState(false);
const [selectedReview, setSelectedReview] = useState(null);

const navigate = useNavigate();

    const getReviewList = async () => {
const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoadingReview(true);


  try {
    const response = await fetch(
      `${BASE_URL}/review/admin/?entity_type=product`,
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

    console.log("Product Review API Response:", data);

    if (data.success) {
      setReviewData(data.data);

     

    } else {
      toast.error(data.message || "Failed to get Review Data");
    }

  } catch (error) {

    console.error(" Error Fetching the review :", error);

    setErrorReview("Something went wrong while fetching review data.");

    toast.error("Failed to fetch Review  data");

  } finally {
    setLoadingReview(false);
  }
};
useEffect(()=>{getReviewList();},[])

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
    

  return (
    <>
     <div className="page-header">
        <h1> Product Review Management</h1>
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
                              <th> Product</th>
                              <th> Review</th>  
                              <th>Rating</th>              
                            <th>Status</th>
                              <th>Actions</th>
                
                            </tr>
                          </thead>
          <tbody>
            {LoadingReview? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan="6">
                    <div className="skeleton-row"></div>
                  </td>
                </tr>
              ))
            ) : ErrorReview ? (
              <tr>
                <td colSpan="6" style={{ color: "red" }}>
                  {ErrorReview}
                </td>
              </tr>
            ) : ReviewData?.length > 0 ? (
              ReviewData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
          
                 
                  <td>{item.patient_name}</td>
          
                 
              <td>

{item.product_name}
</td>


  <td> {item.review}</td>
 <td>
  <div className="rating-stars">
    {renderStars(Number(item.rating))}
  
  </div>
</td>
  <td>{item.status}</td>

          
                
                
                  
                  <td>
                          <div className="action-buttons">
                         
                         
                                           
                           <button
  className="action-btn view"
  onClick={() => {
    setSelectedReview(item);
    setReviewModal(true);
  }}
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

                      {reviewModal && (
  <div className="review-modal-overlay">
    <div className="review-modal">

      <div className="review-modal-header">
        <div className="review-modal-title">
          <FaBoxOpen />
          <h2>Review Details</h2>
        </div>

        <button
          className="review-close-btn"
          onClick={() => setReviewModal(false)}
        >
          <FaTimes />
        </button>
      </div>

     
     <div className="review-product-card">

  <div className="review-product-left">
    <img
      src={selectedReview?.variant_image_urls?.[0]}
      alt={selectedReview?.product_name}
      className="review-product-image"
    />

    <div className="review-product-content">
      <span className="review-product-tag">
        Product
      </span>

      <h3>{selectedReview?.product_name}</h3>

     
    </div>
  </div>

  <div className="review-product-gallery-box">
    <h4>
      Product Gallery (
      {selectedReview?.variant_image_urls?.length || 0}
      )
    </h4>

    <div className="review-product-gallery">
      {selectedReview?.variant_image_urls?.map((img, index) => (
        <div
          key={index}
          className="review-gallery-item"
        >
          <img
            src={img}
            alt={`product-${index}`}
          />
        </div>
      ))}
    </div>
  </div>

</div>

   

      <div className="review-info-section">

        <div className="review-info-box">
          <FaUser />
          <div>
            <label>Patient</label>
            <span>
              {selectedReview?.patient_name}
            </span>
          </div>
        </div>

        <div className="review-info-box">
          <FaStar />
          <div>
            <label>Rating</label>
            <span>
              {selectedReview?.rating}/5
            </span>
          </div>
        </div>

        <div className="review-info-box">
          <FaCheckCircle />
          <div>
            <label>Status</label>
            <span className="review-status-active">
              {selectedReview?.status}
            </span>
          </div>
        </div>

        <div className="review-info-box">
          <FaCalendarAlt />
          <div>
            <label>Date</label>
            <span>
              {new Date(
                selectedReview?.created_at
              ).toLocaleDateString()}
            </span>
          </div>
        </div>

      </div>



      <div className="review-comment-card">
        <h4>Review Comment</h4>

        <p>
          {selectedReview?.review}
        </p>
      </div>

   

      <div className="review-gallery-card">

        <h4>
          <FaImage />
          Review Photos
        </h4>

        <div className="review-gallery-grid">

          {selectedReview?.image_urls?.map(
            (img, index) => (
              <img
                key={index}
                src={img}
                alt=""
                className="review-gallery-image"
              />
            )
          )}

        </div>
      </div>
      <div className="review-modal-footer">
  <button
    className="review-footer-close-btn"
    onClick={() => {
      setReviewModal(false);
      setSelectedReview(null);
    }}
  >
    <FaTimes />
    <span>Close</span>
  </button>
</div>

    </div>
    
  </div>
)}

    </>
  )
}

export default Review