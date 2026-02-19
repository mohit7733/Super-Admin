import React, { useState } from "react";

const Support = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const dummyTickets = [
    {
      id: "TCK-1001",
      customer_name: "Rohit Sharma",
      subject: "Unable to login",
      category: "Technical",
      priority: "High",
      status: "Open",
      created_at: "2025-09-25",
    },

    {
      id: "TCK-1002",
      customer_name: "Priya Singh",
      subject: "Refund not received",
      category: "Billing",
      priority: "Medium",
      status: "Pending",
      created_at: "2025-09-20",
    },

    {
      id: "TCK-1003",
      customer_name: "Amit Verma",
      subject: "App crashing on start",
      category: "Technical",
      priority: "High",
      status: "Resolved",
      created_at: "2025-09-15",
    },

    {
      id: "TCK-1004",
      customer_name: "Kavita Sahu",
      subject: "Change phone number",
      category: "Account",
      priority: "Low",
      status: "Closed",
      created_at: "2025-09-10",
    },

    {
      id: "TCK-1005",
      customer_name: "Deepak Yadav",
      subject: "Order not delivered",
      category: "Orders",
      priority: "High",
      status: "Open",
      created_at: "2025-09-28",
    },

  ];

  const filteredTickets = dummyTickets.filter((ticket) =>
    ticket.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTickets = dummyTickets.length;
  const activeTickets = dummyTickets.filter((t) => t.status === "Open").length;
  const pendingTickets = dummyTickets.filter((t) => t.status === "Pending").length;

  return (
    <>
      <div className="page-header">
        <h2>User Support</h2>

        <div className="vendors-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Tickets By Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <button className="export-btn">Export Details</button>
          </div>
        </div>

        <div className="vendors-stats">
          <div className="stat-card">
            <h3>Total Ticket</h3>
            <div className="stat-value">{totalTickets}</div>
          </div>
          <div className="stat-card">
            <h3>Active Ticket</h3>
            <div className="stat-value">{activeTickets}</div>
          </div>
          <div className="stat-card">
            <h3>Pending Ticket</h3>
            <div className="stat-value">{pendingTickets}</div>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>Id</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.customer_name}</td>
                <td>{ticket.subject}</td>
                <td>{ticket.category}</td>
                <td>{ticket.priority}</td>
                <td>{ticket.status}</td>
                <td>{ticket.created_at}</td>
               
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
export default Support;
