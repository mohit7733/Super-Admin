
import React, { useEffect, useState } from "react";
import { CalendarDays, ChevronDown, RefreshCw } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../../Base";
import "./Dashboard.css";

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

// Dashboard API endpoint
const API_URL = `${BASE_URL}/users/admin/dashboard/`;

const metricConfig = [
  {
    key: "total_customers",
    title: "Total Customers",
    icon: "Users",
    tone: "blue",
  },
  {
    key: "total_doctors",
    title: "Total Doctors",
    icon: "Stethoscope",
    tone: "green",
  },
  {
    key: "total_vendors",
    title: "Total Vendors",
    icon: "Store",
    tone: "purple",
  },
  {
    key: "total_orders",
    title: "Total Orders",
    icon: "ShoppingBag",
    tone: "orange",
  },
  {
    key: "total_revenue",
    title: "Total Revenue",
    icon: "WalletCards",
    tone: "mint",
    currency: true,
  },
  {
    key: "total_products",
    title: "Total Products",
    icon: "Box",
    tone: "blue",
  },
];

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [range, setRange] = useState(false);
  const [selectedRange, setSelectedRange] = useState("This month");

  // GET Dashboard API - same pattern as Category GET function
  const fetchDashboard = async (isRefresh = false) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again.");
      window.location.href = "/login";
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
        return;
      }

      const contentType = response.headers.get("content-type") || "";

      if (!response.ok) {
        throw new Error(
          `Dashboard API failed with status ${response.status}`
        );
      }

      if (!contentType.includes("application/json")) {
        const responseText = await response.text();

        console.error(
          "Dashboard API returned non-JSON response:",
          responseText.slice(0, 500)
        );

        throw new Error(
          "Dashboard API returned HTML instead of JSON. Please check the API endpoint."
        );
      }

      const result = await response.json();

      console.log("Dashboard API Response:", result);

      if (result.success === false) {
        throw new Error(
          result.message || "Failed to fetch dashboard data."
        );
      }

      // Supports { success: true, data: {...} }
      // and a direct JSON dashboard response.
      const dashboard = result.data ?? result;

      if (
        !dashboard ||
        typeof dashboard !== "object" ||
        Array.isArray(dashboard)
      ) {
        throw new Error("Invalid dashboard API response.");
      }

      setDashboardData(dashboard);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);

      setError(
        err.message || "Something went wrong while fetching dashboard data."
      );

      toast.error(
        err.message || "Failed to fetch dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const data = dashboardData || {};
  const stats = data.stats || {};

  // Prepare dashboard metric cards
  const metrics = metricConfig.map((config) => {
    const stat = stats[config.key] || {};

    return {
      ...config,
      value: config.currency
        ? formatCurrency(stat.total)
        : formatNumber(stat.total),
      change: Number(stat.change_percent) || 0,
      thisMonth: stat.this_month ?? 0,
      trend: Array.isArray(stat.trend) ? stat.trend : [],
    };
  });

  // Prepare recent orders for the existing component
  const orders = (Array.isArray(data.recent_orders)
    ? data.recent_orders
    : []
  ).map((order) => ({
    id: order.id,
    order_code: order.order_code,
    customer_name: order.customer_name || "N/A",
    vendor_name: order.vendor_name || "N/A",
    amount: Number(order.amount) || 0,
    status: order.status || "pending",
    created_at: order.created_at,
  }));

  if (loading) {
    return (
      <div className="dashboard-state">
        <div className="dashboard-loader" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="dashboard-state dashboard-error">
        <h3>Unable to load dashboard</h3>
        <p>{error}</p>

        <button
          type="button"
          className="dashboard-retry-btn"
          onClick={() => fetchDashboard()}
        >
          <RefreshCw size={16} />
          Retry
        </button>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
        />
      </div>
    );
  }

  return (
    <div className="page-header">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
      />

      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, Super Admin!</p>
        </div>

        <div className="dashboard-heading-actions">
          <div className="date-wrap">
            <button
              type="button"
              className="date-button"
              onClick={() => setRange((previous) => !previous)}
            >
              <CalendarDays size={16} />
              {selectedRange}
              <ChevronDown size={16} />
            </button>

            {range && (
              <div className="date-menu">
                {["Last 7 days", "This month", "This year"].map(
                  (item) => (
                    <button
                      type="button"
                      key={item}
                      className={
                        selectedRange === item ? "selected" : ""
                      }
                      onClick={() => {
                        setSelectedRange(item);
                        setRange(false);
                      }}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="dashboard-refresh-btn"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            title="Refresh dashboard"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "refresh-spinning" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <p className="dashboard-inline-error">
          Refresh failed. Showing the previously loaded data.
        </p>
      )}

      {/* Dashboard Metrics */}
      <div className="metric-grid">
        {metrics.map((metric) => (
          <DashboardMetricCard
            key={metric.key}
            metric={metric}
          />
        ))}
      </div>

      {/* Revenue, Order Overview and Recent Orders */}
      <div className="main-grid">
        <DahboardRevenue
          revenueOverview={data.revenue_overview}
        />

        <DashboardOrderOverView
          ordersOverview={data.orders_overview}
        />

        <DashboardRecentOrder orders={orders} />
      </div>

      {/* Dashboard Secondary Sections */}
      <div className="bottom-grid">
        <TopVendors vendors={data.top_vendors || []} />

        <TopDoctors doctors={data.top_doctors || []} />

        <LatestCustomers customers={data.latest_customers || []} />

        <InventoryAlerts />

        <RecentActivities />

        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
