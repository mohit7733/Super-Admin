
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../../Base";
import {
  FaClipboardList,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";


const Diet = () => {


  const navigate = useNavigate();
  const[Data,setData]=useState([]);
  const[Error,setError]=useState(null);
  const[Loading,setLoading]=useState(false);

  const getDietPlans = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const response = await fetch(`${BASE_URL}/diet/plans/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const result = await response.json();

    if (result.status === "success") {
      const sortedData = [...result.data].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );

      setData(sortedData);
     
    } else {
      setError(result.message);
      toast.error(result.message);
    }
  } catch (error) {
    console.error(error);
    setError("Failed to fetch diet plans.");
    toast.error("Failed to fetch diet plans.");
  } finally {
    setLoading(false);
  }
};


useEffect(()=>{getDietPlans();},[])
  return (
    <>
     <div className="page-header">
        <h1>Diet Plan Management</h1>
        <p className="page-paragraph">Manage All Diet Plans and their details</p>
      </div>
       <div className="stats2-grid">
     
        <div className="stat2-card" style={{ borderTopColor: "#0D614E" }}>
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaClipboardList size={16} />
          </div>
          <div className="stat2-info">
            <h3>Total Diet Plans</h3>
        
          </div>
        </div>
      
        {/* Active Plans */}
        <div className="stat2-card" style={{ borderTopColor:"#0D614E" }}>
          <div
            className="stat2-icon"
              style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaCheckCircle size={16} />
          </div>
          <div className="stat2-info">
            <h3>Active Plans</h3>
            {/* <div className="stat2-value">{stats.active}</div> */}
          </div>
        </div>
      

        <div className="stat2-card" style={{ borderTopColor:"#0D614E" }}>
          <div
            className="stat2-icon"
           style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaTimesCircle size={16} />
          </div>
          <div className="stat2-info">
            <h3>Inactive Plans</h3>    
          </div>
        </div>
      </div>

       <div className="table-wrapper">
        <table className="data-table">
  <thead>
    <tr>
      <th>#</th>
      <th>Diet Plan</th>
      <th>Cover</th>
      <th>Season</th>
      <th>Disease</th>
      <th>Prakriti</th>
      <th>Type</th>
      <th>Price</th>
      
      <th>Created At</th>
    </tr>
  </thead>

  <tbody>
    {Loading ? (
      Array(5)
        .fill(0)
        .map((_, i) => (
          <tr key={i}>
            <td colSpan="10">
              <div className="skeleton-row"></div>
            </td>
          </tr>
        ))
    ) : Error ? (
      <tr>
        <td colSpan="10">{Error}</td>
      </tr>
    ) : Data.length > 0 ? (
      Data.map((item, index) => {
        const cover =
          item.diet_plan_gallery?.find((img) => img.is_cover)?.image_url;

        return (
          <tr key={item.id}>
            <td>{index + 1}</td>

            <td>
              <strong>{item.name}</strong>
            </td>

            <td>
              {cover ? (
                <img
                  src={cover}
                  alt={item.name}
                  width={30}
                  height={30}
                  style={{
                    borderRadius: "8px",
                    objectFit: "cover",
                    border: "1px solid #e5e7eb",
                  }}
                />
              ) : (
                "No Image"
              )}
            </td>

            <td>
             <span className="category-code-badge">
             {item.season}
            </span>
            </td>
            <td>
              {item.health_diseases?.length
                ? item.health_diseases.map((d) => d.name).join(", ")
                : "-"}
            </td>

            <td>{item.prakriti}</td>

            <td>
              <span
                className={
                  item.is_paid ? "paid-badge" : "free-badge"
                }
              >
                {item.is_paid ? "Paid" : "Free"}
              </span>
            </td>

            <td>
              {item.is_paid
                ? `₹${Number(item.price).toFixed(2)}`
                : "₹0.00"}
            </td>


            <td>
              {new Date(item.created_at).toLocaleDateString()}
            </td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan="10">
          No Diet Plans Found
        </td>
      </tr>
    )}
  </tbody>
</table>
            </div>
    </>
  )
}

export default Diet