
import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const StarRating = ({ rating }) => {
  const totalStars = 5;

  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        if (rating >= starValue) {
          return <FaStar key={index} color="#fff" />; 
        } else if (rating >= starValue - 0.5) {
          return <FaStarHalfAlt key={index} color="#fff" />; 
        } else {
          return <FaRegStar key={index} color="#fff" />; 
        }
      })}
    </div>
  );
};

export default StarRating;

