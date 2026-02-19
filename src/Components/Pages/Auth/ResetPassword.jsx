import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo1 from "../../Assests/logo1.png";
import BASE_URL from "../../../Base"; 

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from 'react-toastify';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneNumber || !newPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/user/forgot-password/reset/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          new_password: newPassword,
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
          <img src={logo1} alt="Logo" className="reset-logo" />
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

          <button type="submit" className="reset-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
      <ToastContainer position="top-center" autoClose={1000} />
    </>
  );
};

export default ResetPassword;