import React from "react";
import "./CustomerSkeleton.css";

const CustomerSkeleton = () => {
  return (
    <div className="customer-skeleton-page">

      
      <div className="skeleton-profile">

        <div className="skeleton-avatar shimmer"></div>

        <div className="skeleton-profile-info">
          <div className="skeleton-line lg shimmer"></div>
          <div className="skeleton-line md shimmer"></div>
          <div className="skeleton-line sm shimmer"></div>
          <div className="skeleton-btn shimmer"></div>
        </div>

        <div className="skeleton-id">
          <div className="skeleton-line xs shimmer"></div>
          <div className="skeleton-line md shimmer"></div>
        </div>

      </div>

      {/* Stats */}

      <div className="skeleton-stats">

        {[1,2,3,4].map((item)=>(
          <div className="skeleton-stat-card" key={item}>
            <div className="circle shimmer"></div>

            <div className="stat-content">
              <div className="skeleton-line sm shimmer"></div>
              <div className="skeleton-line md shimmer"></div>
            </div>
          </div>
        ))}

      </div>

      

      <div className="skeleton-content">

        <div className="left">

          <div className="skeleton-card">

            <div className="skeleton-title shimmer"></div>

            {[1,2,3,4,5,6].map((item)=>(
              <div className="row" key={item}>
                <div className="skeleton-line sm shimmer"></div>
                <div className="skeleton-line md shimmer"></div>
              </div>
            ))}

          </div>

          <div className="skeleton-card">

            <div className="skeleton-title shimmer"></div>

            {[1,2,3,4,5,6].map((item)=>(
              <div className="row" key={item}>
                <div className="skeleton-line sm shimmer"></div>
                <div className="skeleton-line md shimmer"></div>
              </div>
            ))}

          </div>

        </div>

        <div className="right">

          {[1,2].map((item)=>(
            <div className="skeleton-side-card" key={item}>

              <div className="skeleton-title shimmer"></div>

              <div className="image shimmer"></div>

              <div className="skeleton-line md shimmer"></div>

              <div className="skeleton-line sm shimmer"></div>

              <div className="skeleton-button shimmer"></div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
};

export default CustomerSkeleton;