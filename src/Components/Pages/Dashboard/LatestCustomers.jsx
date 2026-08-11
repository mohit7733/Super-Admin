import React from "react";
import { UserRound } from "lucide-react";

const customers = [
  {
    name: "Kavita Sharma",
    email: "kavita.sharma@gmail.com",
    date: "Today, 10:30 AM",
  },
  {
    name: "Riya Patel",
    email: "riya.patel@gmail.com",
    date: "Today, 09:45 AM",
  },
  {
    name: "Rahul Verma",
    email: "rahul.verma@gmail.com",
    date: "Yesterday, 06:20 PM",
  },
  {
    name: "Anjali Mehta",
    email: "anjali.mehta@gmail.com",
    date: "Yesterday, 03:15 PM",
  },
  {
    name: "Priya Singh",
    email: "priya.singh@gmail.com",
    date: "Aug 08, 2025",
  },
];

const LatestCustomers = () => {
  return (
    <div className="panel latest-customers">
      <div className="panel-heading">
        <h2>Latest Customers</h2>

        <button className="link-button">
          View All
        </button>
      </div>

      <div className="customer-list">
        {customers.map((customer, index) => (
          <div key={index}>
            <div className="round-avatar blue-photo">
              <UserRound size={16} />
            </div>

            <div>
              <strong>{customer.name}</strong>
              <small>{customer.email}</small>
            </div>

            <small style={{ marginLeft: "auto", textAlign: "right" }}>
              {customer.date}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestCustomers;