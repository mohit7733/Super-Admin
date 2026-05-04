import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo1 from "../../Assests/logo1.png";
import BASE_URL from "../../../Base";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();

  const [phone_number, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    const token = sessionStorage.getItem("superadmin_token");
    const role = sessionStorage.getItem("role");

    if (token && role === "SUPERADMIN") {
      navigate("/dashboard");
    } else if (
      token &&
      (role === "ADMIN" || role === "VERIFIER" || role === "FOLLOWER")
    ) {
      navigate("/vendor");
    }

    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    if (savedRememberMe) {
      setRememberMe(true);
      const savedPhone = localStorage.getItem("phone_number");
      const savedPassword = localStorage.getItem("password");

      if (savedPhone) setPhone(savedPhone);
      if (savedPassword) setPassword(savedPassword);
    }
  }, [navigate]);

  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);

    if (!checked) {
      localStorage.removeItem("phone_number");
      localStorage.removeItem("password");
      localStorage.removeItem("rememberMe");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = phone_number.startsWith("+91")
        ? phone_number
        : `+91${phone_number}`;

      const response = await fetch(`${BASE_URL}/user/admin-login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: formattedPhone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error);
        return;
      }

 
      
      sessionStorage.setItem("superadmin_token", data.access);
      sessionStorage.setItem("role", data.role);
      sessionStorage.setItem("permissions", JSON.stringify(data.permissions || []));

      toast.success("Login Successful!");

      const role = data.role;

      if (role === "SUPERADMIN") {
        navigate("/dashboard");
      } else if (
        role === "ADMIN" ||
        role === "VERIFIER" ||
        role === "FOLLOWUP"
      ) {
        navigate("/vendor");
      } else {
        navigate("/login");
      }
    } catch (err) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <div className="logo1">
              <span className="logo-icon">
                <img
                  src={logo1}
                  alt="Logo"
                  style={{ width: "124px", height: "74px", marginBottom: "20px" }}
                />
              </span>
            </div>
            <p className="login-subtitle">
              Welcome back! Please sign in to your account.
            </p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                placeholder="Enter your phone number"
                value={phone_number}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
                 maxLength={10}
           
              />
            </div>

            <div className="form-group">
              <label> Password</label>
             <div style={{ position: "relative" }}>

              
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="form-input"
    style={{ paddingRight: "40px" }} 
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "pointer",
      color: "#666",
      fontSize: "18px"
    }}
  >
    {showPassword ? <FaEye/> : <FaEyeSlash />}
  </span>
</div>
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="checkbox-input"
                />
                <span> Remember me </span>
                <span
                  className="forgot-password"
                  onClick={() => navigate("/ForgotPassword")}
                  style={{
                    color: "#71a33f",
                    cursor: "pointer",
                    fontSize: "14px",
                    marginLeft: "184px",
                  }}
                >
                  forgot password?
                </span>
              </label>
            </div>

            <button className="login-btn" type="submit" disabled={loginLoading}>
              {loginLoading ? "Logging in..." : "Login"}
            </button>

          </form>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={1000} />
    </>
  );
};

export default Login;
