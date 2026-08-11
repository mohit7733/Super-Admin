
import React from "react";

const TopDoctors = () => {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Top Doctors</h2>
        <button className="link-button">View All</button>
      </div>

      <div className="person-list">
        <div>
          <span className="person-photo blue-photo">AS</span>

          <strong>Dr. Amit Sharma</strong>

          <b>
            425
            <small>Consultations</small>
          </b>
        </div>

        <div>
          <span className="person-photo rose-photo">NV</span>

          <strong>Dr. Neha Verma</strong>

          <b>
            392
            <small>Consultations</small>
          </b>
        </div>

        <div>
          <span className="person-photo teal-photo">RM</span>

          <strong>Dr. Raj Malhotra</strong>

          <b>
            351
            <small>Consultations</small>
          </b>
        </div>
      </div>
    </section>
  );
};

export default TopDoctors;
