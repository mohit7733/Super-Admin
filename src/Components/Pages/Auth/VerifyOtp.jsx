import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo1 from "../../Assests/logo1.png";
import BASE_URL from "../../../Base";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleChange = (value, index) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join("");

    if (finalOtp.length !== 4) {
      toast.error("Please enter 4-digit OTP");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/user/forgot-password/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: finalOtp,
          phone_number: sessionStorage.getItem("phone_number"),
        }),
      });
      const data = await response.json();
      console.log("OTP Verify Response:", data);

      if (response.ok && data.status) {
        toast.success("OTP Verified Successfully ✅");
        setTimeout(() => navigate("/ResetPassword"), 1000);
      } else {
        toast.error(data.message || "Invalid or expired OTP ❌");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      toast.error("OTP verification failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResendLoading(true);
      const response = await fetch(`${BASE_URL}/user/forgot-password/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: sessionStorage.getItem("phone_number"),
        }),
      });
      const data = await response.json();
      console.log("Resend OTP Response:", data);

      if (response.ok && data.status) {
        toast.success("OTP Resent Successfully ✅");
        setOtp(["", "", "", ""]); 
      } else {
        toast.error(data.message || "Failed to resend OTP ❌");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      toast.error("Failed to resend OTP ❌");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <>
    <div className="verify-wrapper">
      <ToastContainer position="top-right" />
      <div className="verify-card">
        <div className="verify-header">
          <img src={logo1} alt="Logo" className="verify-logo" />
          <h2>Verify Phone Number</h2>
          <p>Enter the 4-digit OTP sent to your phone number</p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="otp-box-wrapper">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                className="otp-input"
              />
            ))}
          </div>

          <button className="verify-btn" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <p className="resend-text">
            Didn’t receive the code?{" "}
            <span
              onClick={!resendLoading ? handleResend : undefined}
              style={{
                color: "#71a33f",
                cursor: resendLoading ? "not-allowed" : "pointer",
                fontWeight: "500",
              }}
            >
              {resendLoading ? "Resending..." : "Resend OTP"}
            </span>
          </p>
        </form>
      </div>
    </div>
     <ToastContainer position="top-center" autoClose={1000} />
     </>
  );
};

export default VerifyOtp;