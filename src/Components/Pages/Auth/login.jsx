
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo1 from '../../Assests/logo1.png';
import BASE_URL from "../../../Base";

const Login = () => {
  const navigate = useNavigate();

  const [phone_number, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoading] = useState(false);

 
  useEffect(() => {
    const token = sessionStorage.getItem("superadmin_token");
    if (token) {
      navigate("/dashboard");
    }

    const savedRememberMe = localStorage.getItem("rememberMe") === "true";
    if (savedRememberMe) {
      setRememberMe(true);
      const savedPhone = localStorage.getItem("phone_number");
      const savedPassword = localStorage.getItem("password");

      if (savedPhone) setPhone(savedPhone);
      if (savedPassword) setPassword(savedPassword);
    }
  }, []);

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

    const response = await fetch(`${BASE_URL}/user/superadmin/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: formattedPhone,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setLoading(false);
      toast.error(data.message || "Invalid phone or password");
      return;
    }

    sessionStorage.setItem("superadmin_token", data.access);

    if (rememberMe) {
      localStorage.setItem("phone_number", formattedPhone);
      localStorage.setItem("password", password);
      localStorage.setItem("rememberMe", "true");
    }

    toast.success("Login Successful!");
    navigate("/dashboard");

  } catch (error) {
    setLoading(false);
    toast.error("Something went wrong!");
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
                  alt="Sidebar Icon"
                  style={{ width: "124px", height: "74px",marginBottom:"20px" }}
                />
              </span>
            </div>
            <p className="login-subtitle">
              Welcome back! Please sign in to your account.
            </p>
          </div>

          <form className="login-form">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="number"
                placeholder="Enter your phone number"
                value={phone_number}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
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
              </label>
            </div>

            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>
          </form>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={1000} />
    </>
  );
};

export default Login;
