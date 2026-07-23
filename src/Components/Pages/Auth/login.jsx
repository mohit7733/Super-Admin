
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import BASE_URL from "../../../Base";
import Ayurmunilogo from "../../Assests/ayurmunilogo1.png"
import Ayurmuniimages from "../../Assests/Ayurvedicimages.jpg"


const PHONE_PREFIX = "+91";
const MAX_PHONE_LENGTH = 10;
const TOAST_AUTO_CLOSE = 1000;
const TOAST_POSITION = "top-center";


const ROLES = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN",
  VERIFIER: "VERIFIER",
  FOLLOWUP: "FOLLOWUP",
};


const STORAGE_KEYS = {
  TOKEN: "superadmin_token",
  ROLE: "role",
  PERMISSIONS: "permissions",
  REMEMBER_ME: "rememberMe",
  PHONE: "phone_number",
  PASSWORD: "password",
};

const Login = () => {
  const navigate = useNavigate();

 
  const [formData, setFormData] = useState({
    phone_number: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

 
  const formatPhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.startsWith("+91") ? cleaned : `${PHONE_PREFIX}${cleaned}`;
  };

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Please enter a valid 10-digit phone number";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone_number") {
     
      const numericValue = value.replace(/\D/g, "").slice(0, MAX_PHONE_LENGTH);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);

    if (!checked) {
      
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(formData.phone_number);

      const response = await fetch(`${BASE_URL}/user/admin/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          password: formData.password
        }),
      });

      // const data = await response.json();

      // if (!response.ok) {
      //   throw new Error(data.error || data.message || "Login failed");
      // }

      // sessionStorage.setItem(STORAGE_KEYS.TOKEN, data.access);
      // sessionStorage.setItem(STORAGE_KEYS.ROLE, data.role);
      // sessionStorage.setItem(STORAGE_KEYS.PERMISSIONS, JSON.stringify(data.permissions || []));

     const result = await response.json();
     console.log("")

if (!response.ok) {
  throw new Error(
    `[${result?.error?.code}] ${result?.error?.message}` ||
    "Something went wrong."
  );
}

const data = result.data;

const userRole = data.is_super_admin
  ? "SUPERADMIN"
  : data.admin_role;


sessionStorage.setItem(STORAGE_KEYS.TOKEN, data.access);

sessionStorage.setItem(
  STORAGE_KEYS.ROLE,
  userRole
);

sessionStorage.setItem(
  STORAGE_KEYS.PERMISSIONS,
  JSON.stringify(data.permissions || [])
);

toast.success("Login Successful!");

const route = getRouteByRole(userRole);
console.log("userRole", userRole);
console.log("route", route);

setTimeout(() => {
  navigate(route);
}, 1000);
} catch (err) {
      console.error("Login error:", err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // const getRouteByRole = (role) => {
  //   switch (role) {
  //     case ROLES.SUPERADMIN:
  //       return "/dashboard";
  //     case ROLES.follower:
  //     case ROLES.VERIFIER:
  //     case ROLES.FOLLOWUP:
  //       return "/vendor";
  //     default:
  //       return "/login";
  //   }
  // };

  const getRouteByRole = (role) => {
  if (role === "SUPERADMIN") {
    return "/dashboard";
  }

  return "/vendor";
};

  const checkExistingSession = useCallback(() => {
    const token = sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    const role = sessionStorage.getItem(STORAGE_KEYS.ROLE);

    if (token && role) {
      const route = getRouteByRole(role);
      navigate(route);
    }
  }, [navigate]);

  const loadSavedCredentials = useCallback(() => {
    const shouldRemember = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === "true";

    if (shouldRemember) {
      const savedPhone = localStorage.getItem(STORAGE_KEYS.PHONE);
      const savedPassword = localStorage.getItem(STORAGE_KEYS.PASSWORD);

      setRememberMe(true);
      setFormData({
        phone_number: savedPhone || "",
        password: savedPassword || "",
      });
    }
  }, []);

  
  useEffect(() => {
    checkExistingSession();
    loadSavedCredentials();
  }, [checkExistingSession, loadSavedCredentials]);

  return (
    <>
      <div
  className="login-content"
  style={{
    backgroundImage: `linear-gradient(
      rgba(114, 123, 121, 0.55),
      rgba(141, 207, 192, 0.55)
    ), url(${Ayurmuniimages})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    width: "100%",
  }}
>
        <div className="login-card">
          <div className="login-header">
            <div className="logo1">
              <img
                src={Ayurmunilogo}
                alt="Company Logo"
                style={{ width: "102px", height: "81px", marginBottom: "20px" }}
              />
              <h1 className="icon"> Ayurmuni</h1>
            </div>
            <p className="login-subtitle">
              Welcome back! Please sign in to your account.
            </p>
          </div>

          <form className="login-form" onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label htmlFor="phone_number" className="form-label">
                Phone Number
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                placeholder="Enter your 10-digit phone number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className={`form-input ${errors.phone_number ? "error" : ""}`}
                maxLength={MAX_PHONE_LENGTH}
                autoComplete="username"
                disabled={isLoading}
                aria-invalid={!!errors.phone_number}
                aria-describedby={errors.phone_number ? "phone-error" : undefined}
              />
              {errors.phone_number && (
                <span className="error-message" id="phone-error" role="alert">
                  {errors.phone_number}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input ${errors.password ? "error" : ""}`}
                  style={{ paddingRight: "40px" }}
                  autoComplete="current-password"
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    color: "#666",
                    fontSize: "18px",
                    padding: 0,
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && (
                <span className="error-message" id="password-error" role="alert">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="checkbox-input"
                  disabled={isLoading}
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="forgot-password"
                onClick={() => navigate("/ForgotPassword")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0D614E",
                  cursor: "pointer",
                  fontSize: "14px",
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            </div>

            <button
              className="login-btn"
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinners" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>
        </div>
      </div>
    <ToastContainer position="top-center" autoClose={2000} />
   </>
  );
};

export default Login;
