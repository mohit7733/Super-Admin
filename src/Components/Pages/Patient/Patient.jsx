import * as XLSX from "xlsx";
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import BASE_URL from "../../../Base";
import "react-toastify/dist/ReactToastify.css";
import { apiFetch } from "../../../fetchapi";
import { BsSearch, BsThreeDots, BsThreeDotsVertical,BsDownload } from "react-icons/bs";

import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Patient = () => {
  const [patientdata, setPatientData] = useState([]);
  const [patientError, setPatientError] = useState(null);
  const [patientloading, setPatientLoading] = useState(true);
  const [Addform, setAddform] = useState(false);
  const [editForm, setEditForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const patienttableRef = useRef(null);
  const [Currentpage, setCurrentpage] = useState(1);
  const [previousPage, setPreviousPage] = useState(null);
  const [Nextpage, setNextPage] = useState(null);
  const pagesize = 5;
  const [Count, setCount] = useState(0);
  const totalPages = Math.ceil(Count / pagesize);
  const [AddError, setAddError] = useState({});

  const [newPatient, setNewPatient] = useState({
    name: '',
    gender: '',
    age: '',
    description: '',
    relation: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient((prev) => ({ ...prev, [name]: value }));
  };
  const fetchOnce = useRef();
  const navigate = useNavigate();


  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

 const getAllpatientList = async (page = 1) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setPatientLoading(true);

  try {
    const response = await fetch(
      `${BASE_URL}/patients/admin/patients/?page=${page}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    const data = await response.json();

    console.log("Patient API Response:", data);

    setPatientData(data?.data?.results || []);
    setCount(data?.data?.count || 0);
    setNextPage(data?.data?.next || null);
    setPreviousPage(data?.data?.previous || null);
    setCurrentpage(page);

  } catch (err) {
    console.error("Patient Fetch Error:", err);

    setPatientError("Something went wrong while fetching patient data.");

    toast.error("Failed to fetch patient data", {
      position: "top-center",
      autoClose: 2000,
    });

  } finally {
    setPatientLoading(false);
  }
};

  useEffect(() => {
    if (!fetchOnce.current) {
      getAllpatientList();
      fetchOnce.current = false;
    }

  }, [])

 const handleToggle = async (id, currentStatus) => {
  const token = sessionStorage.getItem("superadmin_token");
  if(!token){
    toast.error("Session Expired,please login Again");
    navigate("/login");
    return;
  }

  try {
    const response = await fetch(
     `${BASE_URL}/patients/admin/patients/?id=${id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
           "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      }
    );

    const data = await response.json();
    console.log(data);

    toast.success("Status updated successfully");

    getAllpatientList();
  } catch (error) {
    console.error(error);
    toast.error("Failed to update status");
  }
};

  // const handleAddPatient = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const addedPatient = await apiFetch(`${BASE_URL}/healthcare/patient/`, {
  //       method: "POST",
  //       body: JSON.stringify(newPatient),
  //     });

  //     setPatientData((prev) => [...prev, addedPatient]);
  //     setNewPatient({ name: "", gender: "", age: "", description: "", relation: "" });
  //     setAddform(false);

  //     toast.success("Patient added successfully!", {
  //       position: "top-center",
  //       autoClose: 2000,
  //     });
  //   } catch (err) {
  //     toast.error("Failed to add patient");
  //   }
  // };


  // const handleEditClick = (patient) => {
  //   setSelectedPatient(patient);
  //   setEditForm(true);
  // };

  // const handleDownload = () => {
  //   const exportData = patientdata.map((p, index) => ({
  //     ID: index + 1,
  //     Name: p.name,
  //     Gender: p.gender,
  //     Age: p.age,
  //     Description: p.description,
  //     Relation: p.relation,
  //   }));



  //   const ws = XLSX.utils.json_to_sheet(exportData);
  //   const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
  //     wch: key.length + 20,
  //   }));
  //   ws["!cols"] = colWidths;
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Patients");
  //   XLSX.writeFile(wb, "patient_data.xlsx");
  // };


  // const handlePatientDelete = async (id) => {
  //   try {
  //     await apiFetch(`${BASE_URL}/healthcare/patient/${id}/`, {
  //       method: "DELETE",
  //     });


  //     setPatientData((prev) => prev.filter((p) => p?.id !== id));

  //     toast.success("Patient deleted successfully!", {
  //       position: "top-center",
  //       autoClose: 2000,
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to delete patient", {
  //       position: "top-center",
  //       autoClose: 2000,
  //     });
  //   }
  // };


  // const handleEditInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setSelectedPatient((prev) => ({ ...prev, [name]: value }));
  // };



  // const handleEditPatient = async (e) => {
  //   e.preventDefault();

  //   try {

  //     const updatedPatient = await apiFetch(
  //       `${BASE_URL}/healthcare/patient/${selectedPatient?.id}/`,
  //       {
  //         method: "PUT",
  //         body: JSON.stringify(selectedPatient),
  //       }
  //     );


  //     setPatientData((prev) =>
  //       prev.map((patient) =>
  //         patient?.id === updatedPatient?.id ? updatedPatient : patient
  //       )
  //     );

  //     setEditForm(false);

  //     toast.success("Patient updated successfully!", {
  //       position: "top-center",
  //       autoClose: 2000,
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to update patient", {
  //       position: "top-center",
  //       autoClose: 2000,
  //     });
  //   }
  // };






  return (
    <>
      <div className="page-header">
        <h1>Patient</h1>
      </div>

      <div className="controls-section">
        <div className="search-wrapper">
          <BsSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search patient by name..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}

          />

        </div>
        <div className="action-buttons">
          {/* <button className="add-customer-btn" onClick={() => setAddform(true)}>
            + Add Patient
          </button> */}


          {/* <button className="btn-secondary" onClick={handleDownload}>
            Export Details
          </button> */}

                    {/* <button className="btn-secondary" >
                      <BsDownload size={16} />
                      Export Details
                    </button> */}
        </div>


      </div>
      <table className="data-table" >
        <thead>
          <tr>
            <th> Id</th>
            <th>Patient Name</th>
            <th>Gender</th>
            {/* <th>Age</th> */}
            <th> Relation</th>
            <th>Descripition</th>
            <th>Status</th>
            {/* <th> Actions</th> */}
          </tr>
        </thead>
        <tbody>
          {patientloading ? (
            Array(3).fill(0).map((_, i) => (
              <tr key={i}>
                <td colSpan="10"><div className="skeleton-row"></div></td>
              </tr>
            ))
          ) : patientError ? (
            <tr>
              <td colSpan="6" style={{ color: "red" }}>
                {patientError}
              </td>
            </tr>
          ) : patientdata?.length > 0 ? (
            patientdata?.map((patient, index) =>
            (
              <tr key={patient?.id}>
                <td>{index + 1}</td>
                <td>{patient?.first_name}</td>
                <td>{patient?.gender}</td>
                {/* <td>{patient?.age}Years</td> */}
                <td>{patient.relation}</td>
                <td>{patient?.description}</td>
                {/* <td>
                  <div className="action-buttons">

                    <button
                      className="action-btn edit"
                     

                    >
                      <FaEdit/>
                    </button>

                    <button
                      className="action-btn delete"
                     
                    >
                      <FiTrash2/>
                    </button>



                  </div>
                </td> */}
                  <td>
          <label className="switch">
            <input
              type="checkbox"
              checked={patient.is_active}
              onChange={() => handleToggle(patient.id, patient.is_active)}
            />
            <span className="slider round"></span>
          </label>
        </td>
              </tr>
            )
            )
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No Data Found
              </td>
            </tr>
          )}
        </tbody>


      </table>
      {totalPages > 1 && (
        <div className="pagination">


          <button
            onClick={() => getAllpatientList(Currentpage - 1)}
            disabled={!previousPage}
          >
            Prev
          </button>


          {pages.map((page) => (
            <button
              key={page}
              onClick={() => getAllpatientList(page)}
              style={{

                fontWeight: Currentpage === page ? "bold" : "normal",
                background: Currentpage === page ? "#0D614E" : "#fff",
                color: Currentpage === page ? "#fff" : "#0D614E",
              }}
            >
              {page}
            </button>
          ))}


          <button
            onClick={() => getAllpatientList(Currentpage + 1)}
            disabled={!Nextpage}
          >
            Next
          </button>

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
      {/* {Addform && (

        <div className="modal">
          <form className="customer-form" onSubmit={handleAddPatient}>
            <h3>Add New Patient</h3>

            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={newPatient.name}
              onChange={handleInputChange}

            />
            {AddError?.name && <p className="error">{AddError.name}</p>}

            <label>Age:</label>
            <input
              type="number"
              name="age"
              value={newPatient.age}
              onChange={handleInputChange}
              required
            />
            {AddError?.age && <p className="error">{AddError.age}</p>}

            <label>Gender:</label>
            <select
              name="gender"
              value={newPatient.gender}
              onChange={handleInputChange}

            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>

            </select>
            {AddError?.gender && <p className="error">{AddError.gender} </p>}


            <label> Relation</label>
            <select
              name="relation"
              value={newPatient.relation}
              onChange={handleInputChange}
            >
              <option value=""> Select Relation from given Option</option>
              <option value="self"> Self</option>
              <option value="father"> Father</option>
              <option value="mother"> Mother</option>
              <option value="other">Other</option>
            </select>
            <label>Description:</label>
            <textarea
              name="description"
              value={newPatient.description}
              onChange={handleInputChange}
            />



            {AddError?.description && <p className="error">{AddError.description}</p>}
            <div className="form-buttons">

              <button type="submit">Add Patient</button>
              <button type="button" onClick={() => setAddform(false)}>Cancel</button>
            </div>
          </form>

        </div>
      )} */}


      {/* {editForm && selectedPatient && (
        <div className="modal">
          <form className='customer-form' onSubmit={handleEditPatient}>
            <h2>Edit Patient</h2>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={selectedPatient.name}
              onChange={handleEditInputChange}

            />


            <label>Gender:</label>
            <select
              name="gender"
              value={selectedPatient.gender}
              onChange={handleEditInputChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>



            <label>Age:</label>
            <input
              type="number"
              name="age"
              value={selectedPatient.age}
              onChange={handleEditInputChange}
              required
            />

            <label>Relation:</label>
            <label> Relation</label>
            <select
              name="relation"
              value={newPatient.relation}
              onChange={handleEditInputChange}
            >
              <option value=""> Select Relation from given Option</option>
              <option value="self"> Self</option>
              <option value="father"> Father</option>
              <option value="mother"> Mother</option>
              <option value="other">Other</option>
            </select>

            <label>Description:</label>
            <textarea
              name="description"
              value={selectedPatient.description}
              onChange={handleEditInputChange}
            />


            <div className="form-buttons">

              <button type="submit">Save Changes</button>
              <button type="button" onClick={() => setEditForm(false)}>Cancel</button>
            </div>
          </form>

        </div>
      )} */}


{/* 
      {deleteConfirmModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this patient?</h3>
            <div className="form-buttons">
              <button
                className="otp-btn verify-btn"
                onClick={() => {
                  handlePatientDelete(selectedPatientId);
                  setDeleteConfirmModal(false);
                }}
              >
                Yes
              </button>
              <button onClick={() => setDeleteConfirmModal(false)}>No</button>
            </div>
          </div>
        </div>
      )} */}




    </>
  )
}

export default Patient;

