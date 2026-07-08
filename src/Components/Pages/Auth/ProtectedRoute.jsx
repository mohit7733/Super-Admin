

import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, permission }) => {
  const token = sessionStorage.getItem("superadmin_token");
  const role = sessionStorage.getItem("role");
  const permissions = JSON.parse(sessionStorage.getItem("permissions") || "[]");
  const navigate = useNavigate();

  
  if (!token) {
    return <navigate to="/login" replace />;
  }

 
  if (role?.toLowerCase() === "superadmin") {
    return children;
  }


  if (permission && !permissions.includes(permission)) {
    return <navigate to="/login" replace />;
  }


  return children;
};

export default ProtectedRoute;
