import React from "react";
import { useNavigate } from "react-router-dom";


import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, permission }) => {
  const token = sessionStorage.getItem("superadmin_token");
  const role = sessionStorage.getItem("role");
  const permissions = JSON.parse(sessionStorage.getItem("permissions") || "[]");
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!token) {
    navigate("/login", { replace: true });
    return null;
    return <navigate to="/login" replace />;
  }

  // Super Admin has full access
  if (role === "superadmin") {
    return children;
  }

  // Check permission for other users
  if (permission && !permissions.includes(permission)) {
    navigate("/login", { replace: true });
    return null;
    return <navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;