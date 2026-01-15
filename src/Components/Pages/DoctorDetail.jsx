
import React, { useState, useEffect } from 'react';
import consultnow from '../Assests/consultnow.png';
import { useParams } from 'react-router-dom';
import BASE_URL from "../../Base";

const DoctorDetail = () => {
  const { DoctorId } = useParams();

  const [filter, setFilter] = useState("all");
  const [Data, setDoctordetaildata] = useState(null);
  const [DoctorError, setDoctorError] = useState(null);
  const [DocotorLoading, setDoctorDetailloading] = useState(true);

  const [ConsultationData, setConsultationdata] = useState([]);
  const [ConsultationError, setConsultationError] = useState(null);
  const [ConsultationLoading, setConsultationLoading] = useState(true);
  const getdoctordetaillist = async () => {
    try {
      const response = await fetch(`${BASE_URL}/ecom/doctor/${DoctorId}/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      setDoctordetaildata(data);
      console.log("Doctor Detail -->", data);
    } catch (err) {
      console.error(err.message);
      setDoctorError("Something went wrong while fetching doctor data.");
    } finally {
      setDoctorDetailloading(false);
    }
  };


  const getcounsultationlist = async () => {
    try {
      const response = await fetch(`${BASE_URL}/ecom/PatientsByDoctor/${DoctorId}/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
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

       <div className="filter-buttons">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('approved')}>Approved</button>
        <button onClick={() => setFilter('pending')}>Pending</button>
        <button onClick={()=>setFilter('rejected')}> Rejected</button>
      </div> 

      <table className="customers-table">
        <thead>
          <tr>
            <th>Id</th>
            <th>Patient Name</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Relation</th>
            <th>Description</th>
            <th>Slot Date</th>
            <th>Slot Time</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredConsultations.map((c, index) => (
            <tr key={c.id}>
              <td>{index + 1}</td>
              <td>{c.patient?.name}</td>
              <td>{c.patient?.gender}</td>
              <td>{c.patient?.age}</td>
              <td>{c.patient?.relation}</td>
              <td>{c.patient?.description}</td>
              <td>{c.slot?.date}</td>
              <td>{c.slot?.time}</td>
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default DoctorDetail;
