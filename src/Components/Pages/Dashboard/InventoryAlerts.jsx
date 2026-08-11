import React from "react";
import { Package } from "lucide-react";

const InventoryAlerts = () => {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Inventory Alerts</h2>
        <button className="link-button">View All</button>
      </div>

      <div className="inventory-list">
        <div>
          <span className="product-pic">
            <Package size={20} />
          </span>

          <strong>
            Ashwagandha Capsules
            <small className="red-text">Only 5 Left</small>
          </strong>
        </div>

        <div>
          <span className="product-pic amber">
            <Package size={20} />
          </span>

          <strong>
            Tulsi Drops
            <small className="orange-text">12 Left</small>
          </strong>
        </div>

        <div>
          <span className="product-pic rose">
            <Package size={20} />
          </span>

          <strong>
            Chyawanprash
            <small className="orange-text">18 Left</small>
          </strong>
        </div>

        <div>
          <span className="product-pic green">
            <Package size={20} />
          </span>

          <strong>
            Giloy Tablets
            <small className="blue-text">25 Left</small>
          </strong>
        </div>
      </div>
    </section>
  );
};

export default InventoryAlerts;