import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo1 from '../../Assests/logo1.png';
import BASE_URL from "../../../Base";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [phone_number, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!phone_number) {
      toast.error("Please enter your phone number!");
      setLoading(false);
      return;
    }

    const formattedPhone = phone_number.startsWith("+91")
      ? phone_number
      : `+91${phone_number}`;

    try {
      const response = await fetch(`${BASE_URL}/user/forgot-password/send-otp/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone_number: formattedPhone }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLoading(false);
        toast.error(data.message || "Something went wrong!");
        return;
      }

      toast.success("OTP sent to your phone!");
        sessionStorage.setItem("phone_number", formattedPhone);
      setLoading(false);
      navigate("/VerifyOtp");

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
                  alt="Logo"
                  style={{ width: "124px", height: "74px", marginBottom: "20px" }}
                />
              </span>
            </div>
            <p className="login-subtitle">
              Forgot your password? Enter your phone number to receive OTP.
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

            <button className="login-btn" onClick={handleSendOTP} disabled={loading}>
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <p style={{ marginTop: "12px", textAlign: "center" }}>
              Remember your password?{" "}
              <span
                onClick={() => navigate("/login")}
                style={{ color: "#71a33f", cursor: "pointer", fontWeight: "500" }}
              >
                Back to Login
              </span>
            </p>
          </form>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={1000} />
    </>
  );
};

export default ForgotPassword;
