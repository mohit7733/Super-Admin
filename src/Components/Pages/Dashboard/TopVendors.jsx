
import React from "react";

const TopVendors = () => {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Top Vendors</h2>
        <button className="link-button">View All</button>
      </div>

      <div className="rank-list">
        <div>
          <span className="medal gold">1</span>

          <strong>AyurMuni</strong>

          <small>
            ₹3.2 Lakh
            <br />
            Total Sales
          </small>
        </div>

        <div>
          <span className="medal silver">2</span>

          <strong>Herbal Care</strong>

          <small>
            ₹2.4 Lakh
            <br />
            Total Sales
          </small>
        </div>

        <div>
          <span className="medal bronze">3</span>

          <strong>Nature Plus</strong>

          <small>
            ₹2.1 Lakh
            <br />
            Total Sales
          </small>
        </div>
          <div>
          <span className="medal bronze">3</span>

          <strong>Nature Plus</strong>

          <small>
            ₹2.1 Lakh
            <br />
            Total Sales
          </small>
        </div>
         <div>
          <span className="medal bronze">3</span>

          <strong>Nature Plus</strong>

          <small>
            ₹2.1 Lakh
            <br />
            Total Sales
          </small>
        </div>
      </div>
    </section>
  );
};

export default TopVendors;
