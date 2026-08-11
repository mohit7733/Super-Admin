import React from "react";
import {
  UserPlus,
  CheckCircle2,
  Stethoscope,
  Users,
  ShoppingBag,
} from "lucide-react";

const RecentActivities = () => {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Recent Activities</h2>
        <button className="link-button">View All</button>
      </div>

      <div className="activity-list">
        <div>
          <i className="activity-icon blue">
            <UserPlus size={13} />
          </i>

          <strong>
            New Vendor Registered
            <small>2 mins ago</small>
          </strong>
        </div>

        <div>
          <i className="activity-icon green">
            <CheckCircle2 size={13} />
          </i>

          <strong>
            Order Delivered
            <small>5 mins ago</small>
          </strong>
        </div>

        <div>
          <i className="activity-icon blue">
            <Stethoscope size={13} />
          </i>

          <strong>
            Doctor Joined
            <small>18 mins ago</small>
          </strong>
        </div>

        <div>
          <i className="activity-icon blue">
            <Users size={13} />
          </i>

          <strong>
            New Customer Registered
            <small>22 mins ago</small>
          </strong>
        </div>

        <div>
          <i className="activity-icon blue">
            <ShoppingBag size={13} />
          </i>

          <strong>
            New Order Placed
            <small>25 mins ago</small>
          </strong>
        </div>
      </div>
    </section>
  );
};

export default RecentActivities;