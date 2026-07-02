import React from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, permission = null }) => {
  const token = sessionStorage.getItem("superadmin_token");
  const role = sessionStorage.getItem("role")?.toLowerCase();
  const navigate = useNavigate();

  let permissions = [];
  try {
    permissions = JSON.parse(sessionStorage.getItem("permissions") || "[]");
  } catch (error) {
    permissions = [];
  }

  // Redirect to login if not authenticated
  if (!token) {
    navigate("/login", { replace: true });
    return null;
  }

  // Super Admin has full access
  if (role === "superadmin") {
    return children;
  }

  // Check permission for other users
  if (permission && !permissions.includes(permission)) {
    navigate("/login", { replace: true });
    return null;
  }

  return children;
};

export default ProtectedRoute;