

import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, permission }) => {
  const token = sessionStorage.getItem("superadmin_token");
  const role = sessionStorage.getItem("role");
  const permissions = JSON.parse(sessionStorage.getItem("permissions") || "[]");

  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

 
  if (role?.toLowerCase() === "superadmin") {
    return children;
  }


  if (permission && !permissions.includes(permission)) {
    return <Navigate to="/login" replace />;
  }


  return children;
};

export default ProtectedRoute;
