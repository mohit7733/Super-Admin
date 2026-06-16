import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo1 from "../../Assests/logo1.png";
import Ayurmunilogo from "../../Assests/ayurmunilogo1.png"
import BASE_URL from "../../../Base"; 

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from 'react-toastify';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
 const [otp, setOtp] = useState(["", "", "", ""]);

  const handleSubmit = async (e) => {
    e.preventDefault();
const formattedPhone = `+91${phoneNumber.replace(/^\+91|^0/g, "")}`
 
    
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/user/admin/forgot-password/`, {
        method: "POST",
        headers: {
         "Content-Type": "application/json",
      
          "ngrok-skip-browser-warning": "true",

        },
        body: JSON.stringify({
            phone_number: formattedPhone,
       
        password: newPassword,
      otp: otp.join("") 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.error );
      }
    } catch (error) {
      toast.error("Something went wrong, try again later");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="reset-wrapper">
      <div className="reset-card">
        <div className="reset-header">
          <img src={Ayurmunilogo} alt="Logo" className="reset-logo" />
          <h2>Reset Password</h2>
          <p>Create a new password for your account</p>
        </div>

     <form onSubmit={handleSubmit}>


  <div className="form-group">
    <label>Phone Number</label>
    <input
      type="number"
      placeholder="Enter your phone number"
      value={phoneNumber}
      onChange={(e) => setPhoneNumber(e.target.value)}
    />
  </div>
   <div className="form-group">
    <label>New Password</label>
    <input
      type="password"
      placeholder="Enter new password"
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
    />
  </div>


<div className="form-group">

   <label>Enter OTP</label>
  <div className="otp-box-wrapper">
    {otp?.map((digit, index) => (
      <input
        key={index}
        id={`otp-${index}`}
        type="text"
        maxLength="1"
        value={digit}
        onChange={(e) => {
          const value = e.target.value;

          if (/^[0-9]?$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

         
            if (value && index < 3) {
              document.getElementById(`otp-${index + 1}`).focus();
            }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Backspace" && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
          }
        }}
        className="otp-input"
      />
    ))}
  </div>
</div>
  


 
  <button type="submit" className="reset-btn" disabled={loading}>
    {loading ? "Updating..." : "Reset Password"}
  </button>

</form>
      </div>
    </div>
      <ToastContainer position="top-center" autoClose={1000} />
    </>
  );
};

export default ResetPassword;