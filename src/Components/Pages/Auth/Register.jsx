import React from 'react'
import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import logo1 from '../../Assests/logo1.png';
import BASE_URL from "../../../Base";

const Register = () => {
const[phoneNumber,setPhoneNumber]=useState("");
const[password,setPassword]=useState("");
const[role,setRole]= useState("");

  const navigate = useNavigate();

 const handleRegister = async (e) => {
    e.preventDefault();

    if (!phoneNumber || !password || !role) {
      toast.error("All fields are required");
      return;
    }

    const payload = {
      phone_number: `+91${phoneNumber}`,
      password: password,
      admin_role: role
    };

    try {
      const response = await fetch(`${BASE_URL}/user/admin-register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registered Successfully!");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        toast.error(data.message || "Registration Failed");
      }
    } catch (error) {
      toast.error("Server Error");
      console.error(error);
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

          <form className="login-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="number"
                placeholder="Enter your phone number"
                className="form-input"
                value={phoneNumber}
                onChange={(e)=>setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="form-input"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
              />
            </div>

<div className="form-group">
  <label className="form-label">Select Role</label>
  <select
    className="form-input"
    value={role}
    onChange={(e) => setRole(e.target.value)}
  >
    <option value="">-- Select Role --</option>
       <option value="SUPERADMIN">Super Admin</option>
    <option value="ADMIN">Admin</option>
    <option value="VERIFIER">Verifier</option>
    <option value="FOLLOWUP">Followup</option>
  </select>
</div>

            <button className="login-btn" type="submit">
              Register
            </button>
          </form>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={1000} />
    
    </>
  )
}

export default Register