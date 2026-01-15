import * as XLSX from "xlsx";
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify"
import BASE_URL from "../../Base";
import "react-toastify/dist/ReactToastify.css"

const Allpatient = () => {
  const [patientdata,setPatientData]=useState([]);
const[patientError,setPatientError]=useState(null);
const[patientloading,setPatientLoading]=useState(true);
const[Addform,setAddform]=useState(false);
const [editForm, setEditForm] = useState(false);
const [selectedPatient, setSelectedPatient] = useState(null);
const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
const [selectedPatientId, setSelectedPatientId] = useState(null);
const [addErrors, setAddErrors] = useState({});
const [editErrors, setEditErrors] = useState({});
const[searchTerm,setSearchTerm]=useState("");
  const patienttableRef = useRef(null);
const [newPatient, setNewPatient] = useState({
    name: '',
    gender: '',
    age: '',
    description: ''
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPatient((prev) => ({ ...prev, [name]: value }));
  };

  const filteredData = patientdata.filter((patient) => {
    const matchesSearch =
      patient?.name === null || patient?.name?.toLowerCase().includes(searchTerm?.toLowerCase())
    return matchesSearch
   
  })

  .sort((a, b) => {
    if (!a.name) return 1;  
    if (!b.name) return -1;
    return a.name.localeCompare(b.name);
  })

const getAllpatientList = async () => {
    try {
      const response = await fetch(`${BASE_URL}/ecom/patient/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })
      const data = await response.json()
      const sortedData = data
    

      setPatientData(sortedData)

      console.log("patientdata---->", sortedData)
    } catch (err) {
      console.error(err.message)
  setPatientError("Something went wrong while fetching data.")
      toast.error(" Failed to fetch customer data", {
        position: "top-center",
        autoClose: 2000,
      })
    } finally {
      setPatientLoading(false)
    }
  }
useEffect(()=>{
getAllpatientList();
},[])


const handleAddPatient = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(`${BASE_URL}/ecom/patient/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPatient),
    });

    if (!response.ok) {
      throw new Error("Failed to add patient");
    }

    const addedPatient = await response.json();
    setPatientData((prev) => [...prev, addedPatient]);
    setNewPatient({ name: "", gender: "", age: "", description: "" });
    setAddform(false);
    toast.success("Patient added successfully!", {
      position: "top-center",
      autoClose: 2000,
    });
  } catch (err) {
    console.error(err);
    toast.error("Failed to add patient", {
      position: "top-center",
      autoClose: 2000,
    });
  }
};

const handleEditClick = (patient) => {
  setSelectedPatient(patient); 
  setEditForm(true);          
};

const handleDownload = () => {
  const exportData = patientdata.map((p, index) => ({
    ID: index + 1,
    Name: p.name,
    Gender: p.gender,
    Age: p.age,
    Description: p.description,
  }));


  const ws = XLSX.utils.json_to_sheet(exportData);
  const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
    wch: key.length + 20,
  }));
  ws["!cols"] = colWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Patients");
  XLSX.writeFile(wb, "patient_data.xlsx");
};

const handlePatientDelete = async (id) => {
  try {
    const response = await fetch(
   `${BASE_URL}/ecom/patient/${id}/`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete patient");
    }

    
    setPatientData((prev) => prev.filter((p) => p.id !== id));

    toast.success("Patient deleted successfully!", {
      position: "top-center",
      autoClose: 2000,
    });
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete patient", {
      position: "top-center",
      autoClose: 2000,
    });
  }
};


const handleEditInputChange = (e) => {
  const { name, value } = e.target;
  setSelectedPatient((prev) => ({ ...prev, [name]: value }));
};

const handleEditPatient = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch(
     `${BASE_URL}/ecom/patient/${selectedPatient.id}/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedPatient),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update patient");
    }

    const updatedPatient = await response.json();

  
    setPatientData((prev) =>
      prev.map((patient) =>
        patient.id === updatedPatient.id ? updatedPatient : patient
      )
    );

    setEditForm(false);
    toast.success("Patient updated successfully!", {
      position: "top-center",
      autoClose: 2000,
    });
  } catch (err) {
    console.error(err);
    toast.error("Failed to update patient", {
      position: "top-center",
      autoClose: 2000,
    });
  }
};



  
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
  value={searchTerm}
  onChange={(e)=>setSearchTerm(e.target.value)}
  
/>

        </div>
<div className="filter-controls">
   <button className="add-customer-btn" onClick={() => setAddform(true)}>
            + Add Patient
          </button>


          <button className="export-btn" onClick={handleDownload}>
            Export Details
          </button>
        </div>

        </div>

      <table className="customers-table" ref={patienttableRef }>
        <thead>
          <tr>
            <th> Id</th>
            <th>Patient Name</th>
            <th>Gender</th>
            <th>Age</th>
            <th>Descripition</th>
          <th> Actions</th>
          </tr>
        </thead>
        <tbody>
          {patientloading? (
            <tr>
              <td colSpan="6">Loading patient data...</td>
            </tr>
          ) : patientError ? (
            <tr>
              <td colSpan="6" style={{ color: "red" }}>
                {patientError}
              </td>
            </tr>
          ) : filteredData.length > 0 ? (
            filteredData.map((patient,index) => 
              (           
                <tr key={patient.id}>
                <td>{index+1} </td>
                <td>{patient.name}</td>
                <td>{patient.gender}</td>
                <td>{patient.age}</td>
                <td>{patient.description}</td>
                <td>
                  <div className="action-buttons">
                    <button className="action-btn view" >
                      👁
                    </button>
                 
                 <button
  className="action-btn edit"
  onClick={() => handleEditClick(patient)}
>
  ✏️
</button>

<button
  className="action-btn delete"
  onClick={() => {
    setSelectedPatientId(patient.id);
    setDeleteConfirmModal(true);
  }}
>
  🗑
</button>



                  </div>
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
 {Addform && (
        
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
     
              <label>Age:</label>
              <input
                type="number"
                name="age"
                value={newPatient.age}
                onChange={handleInputChange}
                required
              />
          

            
              <label>Description:</label>
              <textarea
                name="description"
                value={newPatient.description}
                onChange={handleInputChange}
              />
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
           
              <div className="form-buttons">

            <button type="submit">Add Patient</button>
            <button type="button" onClick={() => setAddform(false)}>Cancel</button>
            </div>
          </form>
          
        </div>
      )}


{editForm && selectedPatient && (
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
)}



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
)}




    </>
  )
}

export default Allpatient

