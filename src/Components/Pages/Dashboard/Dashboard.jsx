


import React, { useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

import "./Dashboard.css";

import DashboardHeader from "./DahboardHeader";
import DashboardMetricCard from "./DashboardMetricCard";
import DahboardRevenue from "./DahboardRevenue";
import DashboardOrderOverView from "./DashboardOrderOverView";
import DashboardRecentOrder from "./DashboardRecentOrder";

import TopVendors from "./TopVendors";
import TopDoctors from "./TopDoctors";
import LatestCustomers from "./LatestCustomers";
import InventoryAlerts from "./InventoryAlerts";
import RecentActivities from "./RecentActivities";
import QuickActions from "./QuickActions";

const metrics = [
  {
    title: "Total Customers",
    value: "12,458",
    change: "15%",
    icon: "Users",
    tone: "blue",
    points: "0,38 20,33 38,18 58,34 78,40 98,25 117,8 136,28 156,34 177,18 196,31 214,4",
  },
  {
    title: "Total Doctors",
    value: "568",
    change: "8%",
    icon: "Stethoscope",
    tone: "green",
    points: "0,35 18,16 38,30 57,43 78,29 97,26 116,10 136,28 157,43 177,26 197,34 214,11",
  },
  {
    title: "Total Vendors",
    value: "145",
    change: "5%",
    icon: "Store",
    tone: "purple",
    points: "0,31 18,16 38,21 57,13 77,29 97,22 117,23 137,0 157,22 177,31 197,26 214,33",
  },
  {
    title: "Total Orders",
    value: "8,245",
    change: "12%",
    icon: "ShoppingBag",
    tone: "orange",
    points: "0,39 19,24 39,38 59,47 78,32 98,28 118,2 137,27 157,44 177,32 197,41 214,25",
  },
  {
    title: "Total Revenue",
    value: "₹12,45,650",
    change: "22%",
    icon: "WalletCards",
    tone: "mint",
    points: "0,38 19,23 39,30 59,13 78,32 98,45 118,30 137,7 157,26 177,39 197,28 214,11",
  },
  {
    title: "Total Products",
    value: "3,580",
    change: "",
    icon: "Box",
    tone: "blue",
    points: "0,38 18,24 38,39 58,49 78,37 98,18 117,1 137,27 157,43 177,35 197,48 214,31",
  },
];

const orders = [
  ["ORD00125", "Kavita Sharma", "AyurMuni", "₹1,200", "Delivered"],
  ["ORD00124", "Riya Patel", "Herbal Care", "₹780", "Pending"],
  ["ORD00123", "Rahul Verma", "Nature Plus", "₹2,400", "Cancelled"],
  ["ORD00122", "Anjali Mehta", "AyurMuni", "₹1,560", "Delivered"],
  ["ORD00121", "Priya Singh", "Herbal Care", "₹950", "Pending"],
];

const Dashboard = () => {
  const [range, setRange] = useState(false);

  return (
    <>
   
      <div className="page-header">

      
        <div className="page-heading">
          <div>
            <h1>Dashboard</h1>
            <p>Welcome back, Super Admin!</p>
          </div>

          <div className="date-wrap">
            <button
              className="date-button"
              onClick={() => setRange(!range)}
            >
              <CalendarDays size={16} />
              Aug 01, 2025 - Aug 10, 2025
              <ChevronDown size={16} />
            </button>

            {range && (
              <div className="date-menu">
                <div>Last 7 days</div>
                <div>This month</div>
                <div>Custom range</div>
              </div>
            )}
          </div>
        </div>

       
        <div className="metric-grid">
          {metrics.map((metric) => (
            <DashboardMetricCard






              key={metric.title}
              metric={metric}
            />
          ))}
        </div>

     
        <div className="main-grid">
          <DahboardRevenue />

          <DashboardOrderOverView />

          <DashboardRecentOrder orders={orders} />
        </div>

        {/* Bottom Grid */}
        <div className="bottom-grid">

          <TopVendors />

          <TopDoctors />

          <LatestCustomers />

          <InventoryAlerts />

          <RecentActivities />

          <QuickActions />

        </div>
      </div>
    </>
  );
};

export default Dashboard;