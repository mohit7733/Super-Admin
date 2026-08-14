
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
  const [currentPage, setCurrentPage] = useState(1);
const [pageSize] = useState(10);
const [totalPages, setTotalPages] = useState(1);
const [totalCount, setTotalCount] = useState(0);
const[SelectedDiet,setSelectedDiet]=useState(null);
const[StatusModal,setStatusModal]=useState(false)

  const getDietPlans = async (page = 1) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const response = await fetch(`${BASE_URL}/diet/plans/?page=${page}`, {
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
         const count = Number(result.count || 0);

      setTotalCount(count);

      // API is returning 10 records per page
      setTotalPages(Math.ceil(count / pageSize));
     
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

const handleStatusChange = async (id,currentStatus) => {
  if (!SelectedDiet) return;

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  const dietId = SelectedDiet.id;
 

  try {
    setLoading(true);

    const response = await fetch(
      `${BASE_URL}/diet/plans/?id=${dietId}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          is_active:!currentStatus ,
        }),
      }
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const result = await response.json();

     if (response.ok) {
          toast.success(
            !currentStatus ?"Diet Activated Successfully" : "Diet Deactivated Successfully"
          );
          getDietPlans();
        } else {
          toast.error( "Failed to update status");
        }
      
     
    
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong while updating status");
  } finally {
    setLoading(false);
  }
};


useEffect(() => {
  getDietPlans(currentPage);
}, [currentPage]);
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
      <th> Status</th>
      <th>Created At</th>
      <th>Created By</th>
    </tr>
  </thead>

  <tbody>
    {Loading ? (
      Array(5)
        .fill(0)
        .map((_, i) => (
          <tr key={i}>
            <td colSpan="12">
              <div className="skeleton-row"></div>
            </td>
          </tr>
        ))
    ) : Error ? (
      <tr>
        <td colSpan="12">{Error}</td>
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
    className={`status-badge ${
      item.is_active
        ? "status-active"
        : "status-inactive"
    }`}
  >
    {item.is_active ? "Active" : "Inactive"}
  </span>

  <br />

  <label className="switch">
    <input
      type="checkbox"
      checked={item.is_active}
      onChange={() => {
        setSelectedDiet(item);
        setStatusModal(true);
      }}
    />

    <span className="slider round"></span>
  </label>
</td>
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

            <td>

    <p>{item.created_by_name || "-"}</p>
  
  
  
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
<div className="order-pagination-container">

  <div className="order-pagination-info">
    Showing{" "}
    <strong>
      {totalCount === 0
        ? 0
        : (currentPage - 1) * pageSize + 1}
    </strong>{" "}
    to{" "}
    <strong>
      {Math.min(currentPage * pageSize, totalCount)}
    </strong>{" "}
    of <strong>{totalCount}</strong> diet plans
  </div>

  <div className="order-pagination-buttons">

   
    <button
      className="order-pagination-btn order-pagination-arrow"
      disabled={currentPage === 1 || Loading}
      onClick={() =>
        setCurrentPage((prev) => prev - 1)
      }
    >
      ‹
    </button>

    {/* FIRST PAGE */}
    <button
      className={`order-pagination-btn ${
        currentPage === 1
          ? "order-pagination-active"
          : ""
      }`}
      disabled={Loading}
      onClick={() => setCurrentPage(1)}
    >
      1
    </button>

    {/* LEFT DOTS */}
    {currentPage > 3 && (
      <span className="order-pagination-dots">
        ...
      </span>
    )}

    {/* MIDDLE PAGES */}
    {Array.from(
      { length: totalPages },
      (_, index) => index + 1
    )
      .filter((page) => {
        return (
          page !== 1 &&
          page !== totalPages &&
          page >= currentPage - 1 &&
          page <= currentPage + 1
        );
      })
      .map((page) => (
        <button
          key={page}
          className={`order-pagination-btn ${
            currentPage === page
              ? "order-pagination-active"
              : ""
          }`}
          disabled={Loading}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </button>
      ))}

   
    {currentPage < totalPages - 2 && (
      <span className="order-pagination-dots">
        ...
      </span>
    )}

    
    {totalPages > 1 && (
      <button
        className={`order-pagination-btn ${
          currentPage === totalPages
            ? "order-pagination-active"
            : ""
        }`}
        disabled={Loading}
        onClick={() => setCurrentPage(totalPages)}
      >
        {totalPages}
      </button>
    )}

    
    <button
      className="order-pagination-btn order-pagination-arrow"
      disabled={
        currentPage === totalPages || Loading
      }
      onClick={() =>
        setCurrentPage((prev) => prev + 1)
      }
    >
      ›
    </button>

  </div>
</div>

            </div>
             {StatusModal && SelectedDiet && (
   <div
    className="activeModal-overlay"
    onClick={() => {
      setStatusModal(false);
      setSelectedDiet(null);
    }}
  >
    <div
      className="activeModal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="activeModal-close"
        onClick={() => {
          setStatusModal(false);
          setSelectedDiet(null);
        }}
      >
        ×
      </button>

      <div className="activeModal-icon">
        ⚠️
      </div>

      <h2 className="activeModal-title">
        Confirm Status Change
      </h2>

      <p className="activeModal-text">
        Are you sure you want to
        <span
          className={
            SelectedDiet.is_active
              ? "inactive-text"
              : "active-text"
          }
        >
          {SelectedDiet.is_active
            ? " Inactive "
            : " Active "}
        </span>
        this Diet?
      </p>

      <div className="activeModal-card">
        <h4>{SelectedDiet.name}</h4>
     
      </div>

      <div className="activeModal-footer">
        <button
          className="activeModal-cancel"
          onClick={() => {
            setStatusModal(false);
            setSelectedDiet(null);
          }}
        >
          Cancel
        </button>

        <button
          className={`activeModal-confirm ${
            SelectedDiet.is_active
              ? "deactivate-btn"
              : "activate-btn"
          }`}
        onClick={() => {
            handleStatusChange(
              SelectedDiet.id,
              SelectedDiet.is_active
            );

            setStatusModal(false);
            setSelectedDiet(null);
          }}
        >
          Yes,{" "}
        {SelectedDiet.is_active
            ? "Deactivate"
            : "Activate"}
        </button>
      </div>

    </div>
  </div>
)}
 <ToastContainer position="top-center" autoClose={2000} />
    </>
  )
}

export default Diet