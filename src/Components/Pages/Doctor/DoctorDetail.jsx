
import React, { useState, useEffect } from 'react';
import consultnow from '../../Assests/consultnow.png';
import { useParams } from 'react-router-dom';
import BASE_URL from "../../../Base";
import { ToastContainer, toast } from "react-toastify"
import { useNavigate } from "react-router-dom"

import Calendar from "./Calendar";

const DoctorDetail = () => {
  const { DoctorId } = useParams();

  const [filter, setFilter] = useState("all");
  const [Data, setDoctordetaildata] = useState(null);
  const [DoctorError, setDoctorError] = useState(null);
  const [DocotorLoading, setDoctorDetailloading] = useState(true);
  const [ConsultationData, setConsultationdata] = useState([]);
  const [ConsultationError, setConsultationError] = useState(null);
  const [ConsultationLoading, setConsultationLoading] = useState(true);
  const[Currentpage,setCurrentPage]=useState(1);
  const[ConsultaionDetailperpage,setConsultationDetailperpage]=useState(5);
  const [selectedDate, setSelectedDate] = useState(null);

  const navigate = useNavigate();
  

  const getdoctordetaillist = async () => {
    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(`${BASE_URL}/healthcare/doctor/${DoctorId}/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:`bearer${token}`
        },
      });
       if (response.status === 401 || response.status === 403) {
            toast.error("Session expired. Please login again");
            sessionStorage.removeItem("superadmin_token");
            navigate("/login");
            return;
        }

      const data = await response.json();
      setDoctordetaildata(data.data);
      console.log("Doctor Detail -->", data);
    } catch (err) {
      console.error(err.message);
      setDoctorError("Something went wrong while fetching doctor data.");
    } finally {
      setDoctorDetailloading(false);
    }
  };


  const getcounsultationlist = async () => {
    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(`${BASE_URL}/healthcare/patientsbydoctor/${DoctorId}/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
      });
        if (response.status === 401 || response.status === 403) {
            toast.error("Session expired. Please login again");
            sessionStorage.removeItem("superadmin_token");
            navigate("/login");
            return;
        }
      const data = await response.json();
      setConsultationdata(data)
      console.log("Consultation Data -->", data.data);
    } catch (err) {
      console.error(err.message);
      setConsultationError("Something went wrong while fetching consultations.");
    } finally {
      setConsultationLoading(false);
    }
  };

  useEffect(() => {
    getdoctordetaillist();
    getcounsultationlist();
  }, []);

   const filteredConsultations = ConsultationData.filter((c) => {
    if (filter === "all") return true;
    if (filter === "approved") return c.status?.toLowerCase() === "approved";
    if (filter === "pending") return c.status?.toLowerCase() === "pending";
    if (filter === "rejected") return c.status?.toLowerCase() === "rejected";
    return true;
  });

  const indexoflastconsulationDetail = Currentpage*ConsultaionDetailperpage;
  const indexoffirstconsulationDetail=indexoflastconsulationDetail - ConsultaionDetailperpage;
  const totalPages=Math.ceil(filteredConsultations.length/ConsultaionDetailperpage);
  const Currentconsultation=filteredConsultations.slice(indexoffirstconsulationDetail,indexoflastconsulationDetail);
  const handlePageChange=(pagenumber)=>setCurrentPage(pagenumber)

  useEffect(() => {
  setCurrentPage(1);
}, [filter]);

  return (
    <>
      <div className="page-header">
        
        <h1>Doctor Detail Page</h1>
      </div>

      <div className="doctor-info">
        <img src={consultnow} alt="Doctor" className="doctor-photo" />
        <div className="doctor-details">
          <h3>{Data?.name}</h3>
          <p><strong>Specialization:</strong> {Data?.specializations?.[0]?.name}</p>
          <p><strong>Experience:</strong> {Data?.experience_years} Years</p>
          <p><strong>Email:</strong> {Data?.email}</p>
          <p><strong>Phone Number:</strong> {Data?.verified_phone_number}</p>
          <p><strong>Consultation Fee:</strong> ₹{Data?.consultation_fee}</p>
          <p><strong>Availability:</strong> {Data?.available_from} - {Data?.available_to}</p>
          <p><strong>Address:</strong> {Data?.address_line}</p>
        </div>
      </div>

      <div className="customers-stats">
        <div className="stat-card">
          <h3>Total Consultation</h3>
          <div className="stat-value">{ConsultationData.length}</div>
        </div>
        <div className="stat-card">
          <h3>Approved Consultation</h3>
        <div className="stat-value">
  {ConsultationData.filter((c) => c.status?.toLowerCase() === "approved").length}
</div>

        </div>
        <div className="stat-card">
          <h3>Pending Consultation</h3>
          <div className="stat-value">{ConsultationData.filter((c) => c.status?.toLowerCase() === "pending").length}</div>
        </div>
        <div className="stat-card">
          <h3>Rejected Consultation</h3>
          <div className="stat-value">{ConsultationData.filter((c) => c.status?.toLowerCase() === "rejected").length}</div>
        </div>
      </div>
<Calendar onDateSelect={(date) => setSelectedDate(date)} />

<div className="filter-buttons">
  <button 
    className={filter === 'all' ? 'active' : ''} 
    onClick={() => setFilter('all')}
  >
    All
  </button>

  <button 
    className={filter === 'approved' ? 'active' : ''} 
    onClick={() => setFilter('approved')}
  >
    Approved
  </button>

  <button 
    className={filter === 'pending' ? 'active' : ''} 
    onClick={() => setFilter('pending')}
  >
    Pending
  </button>

  <button 
    className={filter === 'rejected' ? 'active' : ''} 
    onClick={() => setFilter('rejected')}
  >
    Rejected
  </button>
</div>


      <table className="customers-table">
        <thead>
          <tr>
            
            <th>Id</th>
            <th>Patient Name</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Relation</th>
            <th>Slot Date</th>
            <th>Slot Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>

{ConsultationLoading ? (
    <tr>
            <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
              <div className="circular-loader"></div>
            </td>
          </tr>
) : ConsultationError ? (
  <tr>
    <td colSpan="10" style={{ color: "red" }}>
      {ConsultationError}
    </td>
  </tr>
) : Currentconsultation && Currentconsultation.length > 0 ? (
  Currentconsultation.map((c, index) => (
    <tr key={c.id}>
      <td>{indexoffirstconsulationDetail + index + 1}</td>
      <td>{c.patient?.name}</td>
      <td>{c.patient?.gender}</td>
      <td>{c.patient?.age}</td>
      <td>{c.patient?.relation}</td>
   
      <td>{c.slot?.date}</td>
      <td>{c.slot?.time}</td>
      <td>{c?.status}</td>
    </tr>
  ))
) : (
  <tr>
    <td colSpan="10">No Data Found</td>
  </tr>
)}

</tbody>
</table>

           {filteredConsultations.length> ConsultaionDetailperpage &&(
          < div className="pagination"> 

<button onClick={()=>handlePageChange(Currentpage-1)} disabled={Currentpage === 1}> Prev</button>
 
{Array.from({ length: totalPages}, (_, i) => i + 1).map(number => (
  <button
    key={number} 
    className={Currentpage === number ? "active" : ""} 
    onClick={() => handlePageChange(number)}
  >
    {number}
  </button>
))}


<button onClick={()=>handlePageChange(Currentpage +1)} disabled={Currentpage === totalPages}> Next</button>

          </div>
        )} 

  <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        closeButton
      />
    </>

    
  );
};

export default DoctorDetail;
