// import React from 'react'

// const DashboardOrderOverView = () => {
//   return (
//     <>
    
//     </>
//   )
// }

// export default DashboardOrderOverView
import React from "react";

const DashboardOrderOverView = () => {
  return (
    <section className="panel orders-panel">

      <div className="panel-heading">
        <h2>Orders Overview</h2>
      </div>

      <div className="donut-wrap">

        <div className="donut">
          <div>
            <strong>8,245</strong>
            <span>Total Orders</span>
          </div>
        </div>

        <div className="legend">

          <p>
            <i className="green-dot" />
            Delivered
            <span>65% (5,358)</span>
          </p>

          <p>
            <i className="orange-dot" />
            Pending
            <span>20% (1,649)</span>
          </p>

          <p>
            <i className="red-dot" />
            Cancelled
            <span>10% (824)</span>
          </p>

          <p>
            <i className="purple-dot" />
            Returned
            <span>5% (414)</span>
          </p>

        </div>
      </div>

    </section>
  );
};

export default DashboardOrderOverView;