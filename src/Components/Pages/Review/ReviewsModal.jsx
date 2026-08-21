
import "./ReviewModal.css";
import React, { useState } from "react";

import {
  FiX,
  FiUser,
  FiPackage,
  FiShoppingBag,
  FiMessageSquare,
  FiImage,
  FiClock,
  FiCheckCircle,
  FiCopy,
} from "react-icons/fi";

const ReviewsModal = ({ review, onClose }) => {
   const [selectedImage, setSelectedImage] = useState(null);
  if (!review) return null;

  
  const cleanUrl = (url) => {
    if (!url) return "";

    const match = url.match(/\((.*?)\)/);

    return match ? match[1] : url;
  };

  const productImages = [
    ...new Set(
      (review.variant_image_urls || [])
        .map(cleanUrl)
        .filter(Boolean)
    ),
  ];

  const reviewImages = [
    ...new Set(
      (review.image_urls || [])
        .map(cleanUrl)
        .filter(Boolean)
    ),
  ];

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text) => {
    if (!text) return;

    navigator.clipboard.writeText(text);
  };

  const rating = Number(review.rating || 0);

  return (
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

            <p className="reviewId">
              Review ID: {review.id || "N/A"}
            </p>

            <div className="reviewHeaderMeta">

              <span>
                <FiClock />
                {formatDateTime(review.created_at)}
              </span>

              <span className="reviewDot">•</span>

              <span
                className={`reviewStatus ${
                  review.status?.toLowerCase() || ""
                }`}
              >
                {review.status || "N/A"}
              </span>

            </div>
          </div>

          <button
            className="reviewCloseBtn"
            onClick={onClose}
          >
            <FiX />
          </button>

        </div>


      
        <div className="reviewTopGrid">


          <div className="reviewInfoCard">

            <div className="reviewCardTitle">
              <FiUser />
              <h3>Customer Information</h3>
            </div>

            <div className="customerInfo">

              <div className="customerAvatar">
                <FiUser />
              </div>

              <div className="customerDetails">

                <h4>
                  {review.patient_name || "N/A"}
                </h4>

                <p className="detailLabel">
                  Order ID
                </p>

                <div className="orderIdRow">

                  <span>
                    {review.order_id || "N/A"}
                  </span>

                  {review.order_id && (
                    <button
                      onClick={() =>
                        copyToClipboard(review.order_id)
                      }
                    >
                      <FiCopy />
                    </button>
                  )}

                </div>

                <p className="detailLabel reviewedLabel">
                  Reviewed
                </p>

                <span
                  className={`yesBadge ${
                    review.is_reviewed ? "yes" : "no"
                  }`}
                >
                  {review.is_reviewed ? "Yes" : "No"}
                </span>

              </div>

            </div>

          </div>


         

          <div className="reviewInfoCard">

            <div className="reviewCardTitle">
              <FiPackage />
              <h3>Product Information</h3>
            </div>

            <div className="productInfoReview">

      <div className="mainProductImage">
  {productImages.length > 0 ? (
    <img
      src={selectedImage || productImages[0]}
      alt={review.product_name || "Product"}
     
    />
  ) : (
    <div className="noProductImage">
      <FiPackage />
    </div>
  )}
</div>
              <div className="productReviewDetails">

                <h4>
                  {review.product_name || "N/A"}
                </h4>

                <p className="detailLabel">
                  Variant ID
                </p>

                <span className="variantId">
                  {review.variant_id || "N/A"}
                </span>

              </div>

            </div>


            {/* Product Gallery */}

 {productImages.length > 0 && (
  <div className="productGallery">

    {productImages.slice(0, 4).map((image, index) => (
      <div
        className={`galleryImage ${
          (selectedImage || productImages[0]) === image
            ? "selected"
            : ""
        }`}
        key={`${image}-${index}`}
        onClick={() => setSelectedImage(image)}
      >
        <img
          src={image}
          alt={`Product ${index + 1}`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    ))}

    {productImages.length > 4 && (
      <div
        className="moreImages"
        onClick={() => setSelectedImage(productImages[4])}
      >
        +{productImages.length - 4}
      </div>
    )}

  </div>
)}

          </div>

        </div>


       

        <div className="reviewSection">

          <div className="sectionTitle">
            <FiCheckCircle />
            <h3>Rating</h3>
          </div>

          <div className="ratingContainer">

            <div className="stars">

              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <= rating
                      ? "star active"
                      : "star"
                  }
                >
                  ★
                </span>
              ))}

            </div>

            <strong>
              {rating} / 5
            </strong>

          </div>

        </div>


       

        <div className="reviewSection">

          <div className="sectionTitle">
            <FiMessageSquare />
            <h3>Customer Review</h3>
          </div>

          {review.review ? (
            <p className="reviewText">
              {review.review}
            </p>
          ) : (
            <p className="emptyReview">
              No written review provided.
            </p>
          )}

        </div>


       

        <div className="reviewSection">

          <div className="sectionTitle">

            <FiImage />

            <h3>
              Review Images ({reviewImages.length})
            </h3>

          </div>

          {reviewImages.length > 0 ? (

            <div className="reviewImageGallery">

              {reviewImages.map(
                (image, index) => (
                  <div
                    className="reviewImageBox"
                    key={`${image}-${index}`}
                  >
                    <img
                      src={image}
                      alt={`Review ${index + 1}`}
                      onError={(e) => {
                        e.target.style.display =
                          "none";
                      }}
                    />
                  </div>
                )
              )}

            </div>

          ) : (

            <div className="noReviewImages">
              <FiImage />
              <span>No review images uploaded.</span>
            </div>

          )}

        </div>



        <div className="reviewSection">

          <div className="sectionTitle">

            <FiMessageSquare />

            <h3>Vendor Reply</h3>

          </div>

          {review.vendor_reply ? (

            <div className="vendorReply">

              <p>
                {review.vendor_reply}
              </p>

              {review.vendor_reply_at && (
                <span>
                  Replied on{" "}
                  {formatDateTime(
                    review.vendor_reply_at
                  )}
                </span>
              )}

            </div>

          ) : (

            <div className="noVendorReply">
              <FiMessageSquare />

              <span>
                No vendor reply yet.
              </span>
            </div>

          )}

        </div>



        <div className="reviewSection">

          <div className="sectionTitle">

            <FiShoppingBag />

            <h3>Additional Information</h3>

          </div>

          <div className="additionalInfo">

            <div>
              <label>Created At</label>

              <span>
                {formatDateTime(
                  review.created_at
                )}
              </span>
            </div>

            <div>
              <label>Updated At</label>

              <span>
                {formatDateTime(
                  review.updated_at
                )}
              </span>
            </div>

            <div>
              <label>Action By</label>

              <span>
                {review.action_by_name || "N/A"}
              </span>
            </div>

            <div>
              <label>Action Reason</label>

              <span>
                {review.action_reason || "N/A"}
              </span>
            </div>

          </div>

        </div>


        

        <div className="reviewDrawerFooter">

          <button
            className="reviewFooterClose"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </div>
    </div>
  );
};

export default ReviewsModal;