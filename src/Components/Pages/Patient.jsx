
import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from "xlsx";
import { useParams } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BASE_URL from "../../Base";

const Patient = () => {
  const [Loading, setPatientLoading] = useState(true);
  const [Error, setError] = useState(null);
  const [PatientData, setPatientData] = useState([]);
  const [SearchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const params = useParams();
  const { PatientId } = params;
  const bulktableRef = useRef(null);
  const [formErrors, setFormErrors] = useState({});
  const filteredPatients = (PatientData || []).filter((item) => {
    const patientName = item.patient?.name || "";
    const customerName = item.customer?.first_name || "";
    return (
      patientName.toLowerCase().includes(SearchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(SearchTerm.toLowerCase())
    );
  });


  console.log('patientttt', PatientId);

  const getPatientlist = async () => {
    try {
      const response = await fetch(
       `${BASE_URL}/ecom/PatientsByDoctor/${PatientId}/`
      );
      const data = await response.json();
      console.log("responseee", data);
      setPatientData(data);
    } catch (err) {
      console.error(err.message);
      setError('Something went wrong while fetching data.');
      toast.error("Failed to fetch patient data");
    } finally {
      setPatientLoading(false);
    }
  };

  useEffect(() => {
    getPatientlist();
  }, []);


  const handleExport = () => {
    const exportData = PatientData.map((p, index) => ({
      "S.No": index + 1,
      "Patient Name": p.patient?.name,
      "Gender": p.patient?.gender,
      "Age": p.patient?.age,
      "Relation": p.patient?.relation,
      "Description": p.patient?.description,
      "Slot Date": p.slot?.date || "N/A",
      "Slot Time": p.slot?.time || "N/A",
      "Status": p.status,
      "Customer Name": p.customer?.first_name || "N/A",
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    XLSX.writeFile(wb, "Patients.xlsx");
  };



  // const getCustomers = async () => {
  //   try {
  //     const res = await fetch("https://q8f99wg9-8000.inc1.devtunnels.ms/ecom/customer/");
  //     const data = await res.json();
  //     setCustomers(data.data);
  //   } catch (err) {
  //     console.error(err.message);
  //   }
  // };



  const handleStatusChange = async (orderId, newStatus) => {

    console.log("orderidf----->", orderId, newStatus);

    try {
      const response = await fetch(
       `${BASE_URL}/ecom/consultationapproval/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: orderId,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const result = await response.json();
      console.log("Status Updated:", result);
      toast.success("Status updated successfully!");


      setPatientData((prev) =>
        prev.map((item) =>
          item.order_id === orderId ? { ...item, status: newStatus } : item
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Error updating status");
    }
  };


  // useEffect(() => {
  //   getCustomers();
  // }, []);


  return (
    <>
      <div className="page-header">
        <h1>Patient</h1>
      </div>

      <div className="customers-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search patient by name..."
            className="search-input"
            value={SearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-controls">


          <button className="export-btn" onClick={handleExport}>
            Export Details
          </button>
        </div>
      </div>

      <table className="customers-table" ref={bulktableRef}>
        <thead>
          <tr>
            <th> Id</th>
            <th> Patient Name</th>
            <th> Gender</th>
            <th> Age </th>
            <th> Description </th>
            <th> Slot Date</th>
            <th> Slot Time</th>
            <th> Status</th>
            
          </tr>
        </thead>
        <tbody>
          {Loading ? (
            <tr>
              <td colSpan="10">Loading Patient Data...</td>
            </tr>
          ) : Error ? (
            <tr>
              <td colSpan="10" style={{ color: "red" }}>
                {Error}
              </td>
            </tr>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((item, index) => (
              console.log("item--->", item),
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.patient?.name}</td>
                <td>{item.patient?.gender}</td>
                <td>{item.patient?.age}</td>
                <td>{item.patient?.description}</td>
                <td>{item.slot?.date}</td>
                <td>{item.slot?.time}</td>
            

                  <td> 
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item?.order_id, e.target.value)}
                      className="status-dropdown"
                    >               
                    <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                     </select>
                  </td>

             
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" style={{ textAlign: "center" }}>
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
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

export default Patient;
