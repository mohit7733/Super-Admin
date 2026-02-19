import * as XLSX from "xlsx";
import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify"

import "react-toastify/dist/ReactToastify.css"
import { useNavigate } from "react-router-dom"
import BASE_URL from "../../../Base";
import { FiFileText } from "react-icons/fi";
import {  BsThreeDotsVertical } from "react-icons/bs";





const userId = localStorage.getItem("USER_ID")
console.log("userIduserIduserId", userId)

const intialDoctorform = {
  profile_image:"",
 first_name:"",
 last_name:"",
  email: "",
  assured_muni: false,
  verified_phone_number: "",
  experience_years: "",
  specialization_ids: [],
  user: "",
  treatment_type_id: "",
  consultation_fee: "",
  available_from: "",
  available_to: "",
practice_license_number: "",
  qualification: "",
  documentType: "",
  documentFile: null,
  documents: [],

}



const Doctor = () => {
  const [doctorsearch, setDoctorsearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [specializationfilter, setSpecilizationfilter] = useState("All")
  const [viewDoctor, setViewDoctor] = useState(null)
  const [Doctordata, setDoctorData] = useState([])
  const [DoctorModal, setDoctorModal] = useState(false)
  const [phonenumber, setPhonenumber] = useState("")
  const [error, setError] = useState()
  const [Loading, setLoading] = useState(true)
  const [verifiedDoctorModal, setVerifiedDoctorModal] = useState(false)
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""])
  const otpRefs = useRef([])
  const [phoneErrors, setPhoneErrors] = useState({})
  const [otpErrors, setOtpErrors] = useState({})
  const [doctorFormErrors, setDoctorFormErrors] = useState({})
  const [DoctorformModal, setDoctorformModal] = useState(false)
  const [Doctorform, setDoctorform] = useState(intialDoctorform)
  const [specialities, setSpecialities] = useState([])
  const [EditingDoctorId, setEditingDoctorId] = useState(null)
  const [spec, setSpecs] = useState([])
 
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false)
  const [selectedDoctorId, setSelectedDoctorId] = useState(null)
  const [AddSpeciality, setAddspecialityform] = useState(false);
  const [newSpecilization, setNewSpecilization] = useState("")
  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [doctorperpage,setDoctorperpage]=useState(5);
  const [currentpage,setCurrentpage]=useState(1);
  const [showReasonModal, setShowReasonModal] = useState(false);
 
  const [rejectReason, setRejectReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const[OpenthreedotId,setOpenthreedotId] =useState(null);
  const[previewImage,setPreviewImage]=useState("");
  const[ImageModal,setImageModal]=useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

 

  
  const documentOptions = [
    { value: "highest_qualification_certificate", label: "Highest Qualification Marksheet" },
    { value: "registration_certificate", label: "Ayush Registration Certificate" },
    { value: "other_certificate", label: "Government ID Proof" },
  ];

  
  console.log(Doctorform, "form------>");
  console.log("selecteddoctor", selectedDoctor);

  const [userId, setUserId] = useState("");
  const doctortableRef = useRef(null);
  const fetchedOnce = useRef(false);
  const navigate = useNavigate();
  const validatePhoneNumber = (phone) => {
    const errors = {}

    if (!phone) {
      errors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = "Phone number must be exactly 10 digits"
    } else if (phone.startsWith("0")) {
      errors.phone = "Phone number should not start with 0"
    } else if (!/^[6-9]/.test(phone)) {
      errors.phone = "Phone number should start with 6, 7, 8, or 9"
    }

    return errors
  }


  const validateOTP = (otp) => {
    const errors = {}
    if (!otp || otp.length !== 4) {
      errors.otp = "Please enter the complete 4-digit OTP"
    } else if (!/^\d{4}$/.test(otp)) {
      errors.otp = "OTP must contain only numbers"
    }

    return errors
  }



  const validateDoctorForm = (formData, phoneNum) => {
    const errors = {}
    
if (!formData?.first_name?.trim()) {
  errors.first_name = "First name is required";
} else if (!/^[A-Za-z.\s]+$/.test(formData.first_name.trim())) {
  errors.first_name = "First name can only contain letters and spaces";
} else if (formData.first_name.trim().length < 2) {
  errors.first_name = "First name must be at least 2 characters";
} else if (formData.first_name.trim().length > 50) {
  errors.first_name = "First name should not exceed 50 characters";
} else if (!/^[A-Z]/.test(formData.first_name.trim())) {
  errors.first_name = "First name must start with a capital letter";
}

if (!formData?.last_name?.trim()) {
  errors.last_name = "First name is required";
} else if (!/^[A-Za-z\s]+$/.test(formData.last_name.trim())) {
  errors.last_name = "Last name can only contain letters and spaces";
} else if (formData.last_name.trim().length < 2) {
  errors.last_name = "Last name must be at least 2 characters";
} else if (formData.last_name.trim().length > 50) {
  errors.last_name = "Last name should not exceed 50 characters";
} 
    if (!formData?.email?.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address"
    }



    if (!formData?.consultation_fee) {
      errors.consultation_fee = "Consultation fee is required"
    } else if (isNaN(formData?.consultation_fee)) {
      errors.consultation_fee = "Consultation fee must be a valid number"
    } else if (Number.parseFloat(formData.consultation_fee) <= 0) {
      errors.consultation_fee = "Consultation fee must be greater than 0"
    } else if (Number.parseFloat(formData.consultation_fee) > 10000) {
      errors.consultation_fee = "Consultation fee should not exceed ₹10,000"
    }


    if (!formData?.experience_years) {
      errors.experience_years = "Experience is required"
    } else if (isNaN(formData.experience_years)) {
      errors.experience_years = "Experience must be a valid number"
    } else if (Number.parseInt(formData.experience_years) < 0) {
      errors.experience_years = "Experience cannot be negative"
    } else if (Number.parseInt(formData.experience_years) > 60) {
      errors.experience_years = "Experience should not exceed 60 years"
    }


    if (!formData?.specialization_ids) {
      errors.specialization_ids = "Please select a specialization"
    }
    if (!formData.practice_license_number?.trim()) {
      errors.practice_license_number = "pratice License Number is Required";
    } else if (!/^\d+$/.test(formData?.practice_license_number?.trim())) {
      errors.practice_license_number = "Registration number must contain only numbers";
    }


    if (!formData.qualification?.trim()) {
      errors.qualification = "Qualification is required";
    } else if (!/^[A-Za-z.\s]+$/.test(formData.qualification.trim())) {
      errors.qualification = "Qualification can only contain alphabets, spaces, and dots";
    }


    if (!formData?.available_from) {
      errors.available_from = "Available from time is required"
    }

    if (!formData?.available_to) {
      errors.available_to = "Available to time is required"
    }


    if (formData?.available_from && formData?.available_to) {
      if (formData?.available_from >= formData?.available_to) {
        errors.available_to = "Available to time must be after available from time"
      }
    }


    

    return errors
  }

  const clearAllErrors = () => {
    setPhoneErrors({})
    setOtpErrors({})
    setDoctorFormErrors({})
  }


  
  const handleNavigateDoctor = (id) => {
    console.log(id)
    navigate(`/DoctorDetail/${id}`)
  }
  const handleRemoveDocument = (type) => {
    setUploadedDocs((prev) => prev.filter((doc) => doc.type !== type));
    toast.info("Document removed successfully");
  };

  const clearDoctorForm = () => {
    setDoctorform(intialDoctorform)
    setPhonenumber("")
    setOtpDigits(["", "", "", ""])
    setSpecs([])
    setEditingDoctorId(null)
  }
  

  
const submitRejection = async (e) => {
  e.preventDefault();

  await handleStatusChange(selectedDoctorId, selectedStatus, rejectReason);

  setShowReasonModal(false);
  setRejectReason("");
  setSelectedDoctorId(null);
  setSelectedStatus("");
};

const handleRejectClick = (doctorId, statusType) => {
  setSelectedDoctorId(doctorId);
  setSelectedStatus(statusType);  
 setShowReasonModal(true);
};

  const getdoctorlist = async () => {
    const token= sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(`${BASE_URL}/healthcare/doctor/`, {
        method:'GET',
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,

        },
      })
      if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }
      const data = await response.json()
      setDoctorData(data.data)
    } catch (err) {
      console.error(err.message)
      setError("Something went wrong while fetching data.")
      toast.error("Failed to fetch Doctor Data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!fetchedOnce.current) {
      getdoctorlist();
      fetchedOnce.current = true;
    }
  }, []);

  
const filteredDoctors = Doctordata.filter((doctor) => {
  const searchLower = doctorsearch?.toLowerCase() || "";

  const matchesSearch =
  
    !searchLower ||
    (doctor?.first_name?.toLowerCase()?.includes(searchLower)) ||
    (doctor?.specializations?.some((s) =>
      s?.name?.toLowerCase()?.includes(searchLower)
    ));

  const matchesStatus =
    statusFilter === "All" ||
    doctor?.status === statusFilter;

  const matchesSpecialization =
    specializationfilter === "All" || 
    doctor.specializations?.some((s) => s.name === specializationfilter);

  return matchesSearch && matchesStatus && matchesSpecialization;
})
.sort((a, b) => {
  const nameA = a.first_name || ""; 
  const nameB = b.first_name || "";
  return nameA.localeCompare(nameB);
});

console.log(filteredDoctors, "filterdoc");

  const openDocumentModal = (i) => {
    setOpenModal(true);
    setSelectedDoctor(i);
  }
  console.log(selectedDoctor, "selected");

 const handleDoctorDelete = async (id) => {
  const token = sessionStorage.getItem("superadmin_token");

  try {
    const response = await fetch(`${BASE_URL}/healthcare/doctor/${id}/`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,   
      },
    });

   
    if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }

    if (!response.ok) {
      toast.error("Failed to delete");
      return;
    }

    setDoctorData(Doctordata.filter((c) => c.id !== id));
    toast.success("Doctor deleted successfully");

  } catch {
    toast.error("Failed to delete");
  }
};


  const handleCloseDoctorModal = () => {
    setDoctorModal(false)
    clearAllErrors()
    setPhonenumber("")
  }


  
const handleDoctorformSubmit = async (e) => {
e.preventDefault();

console.log("uploadedDocs", uploadedDocs);
const formErrors = validateDoctorForm(Doctorform, phonenumber);
console.log(formErrors, "error");


if (Object.keys(formErrors).length > 0) {
    setDoctorFormErrors(formErrors);
    toast.error("Please fix the validation errors");
    return;
 }

const method = EditingDoctorId ? "PUT" : "POST";
 const url = EditingDoctorId
    ? `${BASE_URL}/healthcare/doctor/${EditingDoctorId}/`
    : `${BASE_URL}/healthcare/doctor/`;

  const newFormData = new FormData();
  newFormData.append("first_name", Doctorform.first_name.trim());
  newFormData.append("last_name", Doctorform.last_name.trim());
  newFormData.append("email", Doctorform.email.trim());
  newFormData.append("assured_muni", Doctorform.assured_muni);
  newFormData.append("verified_phone_number", `+91${phonenumber}`);
  newFormData.append("experience_years", Number.parseInt(Doctorform.experience_years));
  newFormData.append("consultation_fee", Number.parseFloat(Doctorform.consultation_fee));
  newFormData.append("available_from", Doctorform.available_from);
  newFormData.append("available_to", Doctorform.available_to);
  newFormData.append("treatment_type_ids", Doctorform.treatment_type_id);
  newFormData.append("practice_license_number", Doctorform.practice_license_number);
  newFormData.append("qualification", Doctorform.qualification);
 
if (Doctorform.profile_image instanceof File) {
  newFormData.append("profile_image", Doctorform.profile_image);
}



  let docIndex = 0;
  uploadedDocs.forEach((item) => {
    if (item.file) {  
      newFormData.append(`document_types[${docIndex}]`, item.type);
      newFormData.append(`documents[${docIndex}]`, item.file);
      docIndex++;
    }
  });

  if (Array.isArray(Doctorform.specialization_ids)) {
    Doctorform.specialization_ids.forEach((id) =>
      newFormData.append("specialization_ids", id)
    );
  } else {
    newFormData.append("specialization_ids", Doctorform.specialization_ids);
  }
  
  if (!EditingDoctorId) {
    const user = userId || localStorage.getItem("USER_ID");
    newFormData.append("user", user);
  }

const token = sessionStorage.getItem("superadmin_token");
  try {
    const response = await fetch(url, {
      method,
      body: newFormData,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      }
    });

if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }


    const result = await response.json();

    if (response.ok) {
      toast.success(
        EditingDoctorId
          ? "Doctor updated successfully"
          : "Doctor added successfully"
      );
      setDoctorformModal(false);
      clearDoctorForm();
      clearAllErrors();
      setUploadedDocs([]);
      getdoctorlist();
    } else {
      toast.error(result.message || "Failed to save doctor");
    }
  } catch (err) {
    console.error("Doctor save error:", err.message);
    toast.error("Error saving doctor");
  }
};



  const handleAddDocument = (e) => {
    e.preventDefault();

    if (!Doctorform.documentType || !Doctorform.documentFile) {
      toast.error("Please select document type and upload file");
      return;
    }

    const newDoc = {
      type: Doctorform.documentType,
      file: Doctorform.documentFile,
    };

    setUploadedDocs((prev) => {

      const existing = prev.find((d) => d.type === newDoc.type);
      if (existing) {
        return prev.map((d) => (d.type === newDoc.type ? newDoc : d));
      }
      return [...prev, newDoc];
    });


    setDoctorform((prev) => ({
      ...prev,
      documentType: "",
      documentFile: null,
    }));

    toast.success("Document added!");
  };

const handleAddSpecialization = async (e) => {
  e.preventDefault();

  if (!newSpecilization.trim()) {
    toast.error("Specialization name is required");
    return;
  }

  if (!/^[A-Za-z\s]+$/.test(newSpecilization)) {
    toast.error("Specialization must contain only alphabets");
    return;
  }

  const token = sessionStorage.getItem("superadmin_token");

  try {
    const response = await fetch(`${BASE_URL}/healthcare/speciality/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newSpecilization }),
    });

    if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }

    const data = await response.json();

if (!response.ok) {
  const errorMsg =
    data?.errors?.name
    ;

  toast.error(errorMsg);
  return;
}

    toast.success("Specialization added successfully!");
    setNewSpecilization("");
    fetchSpecialization();
    setAddspecialityform(false);

  } catch (error) {
    console.error("Error adding specialization:", error);
    toast.error("Error adding specialization.");
  }
};


  const fetchTreatmentTypes = async () => {
     const token = sessionStorage.getItem("superadmin_token");

    try {
      const response = await fetch(`${BASE_URL}/healthcare/treatmenttypes/`, {
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
      setTreatmentTypes(data);
    } catch (error) {
      console.error("Error fetching treatment types:", error);
    }
  };

  useEffect(() => {
    fetchTreatmentTypes();
  }, []);





const handledoctorSubmit = async (e) => {
  e.preventDefault();

 
  const phoneValidation = validatePhoneNumber(phonenumber);
  if (Object.keys(phoneValidation).length > 0) {
    setPhoneErrors(phoneValidation);
    return;
  }

  const token = sessionStorage.getItem("superadmin_token");

  try {
  
    const payload = {
      phone_number: `+91${phonenumber}`,
      role: "doctor",
    };


    const response = await fetch(`${BASE_URL}/user/super-admin/create-user/`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

 
    if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }


    const data = await response.json();

   
    if (!response.ok) {
      toast.error(data?.error );
      return;
    }

 
   const uid = data?.user?.id;
    toast.success("Doctor ready. Please complete doctor registration");

    if (uid) {
      setUserId(uid);
      localStorage.setItem("USER_ID", uid);
  setDoctorModal(false);
   setDoctorformModal(true);

  } 
 } catch(err) {
    console.error("Doctor create error:", err);
    toast.error("Something went wrong. Please try again");
  }
};



 
  const handleDoctorinputchange = (e) => {
  const { name, value, type, checked, files } = e.target;

  if (doctorFormErrors[name]) {
    setDoctorFormErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  }


  if (type === "checkbox") {
    setDoctorform((prev) => ({
      ...prev,
      [name]: checked,
    }));
    return;
  }

  
  if (type === "file" && name === "profile_image") {
    setDoctorform((prev) => ({
      ...prev,
      profile_image: files && files.length > 0 ? files[0] : null,
    }));
    return;
  }

  
  if (name === "documentFile") {
    setDoctorform((prev) => ({
      ...prev,
      documentFile: files && files.length > 0 ? files[0] : null,
    }));
    return;
  }

  setDoctorform((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  
  const handleDoctorDownload = () => {
    const exportData = Doctordata.map((d, index) => ({
      ID: index + 1,
      "First Name": d.first_name,
      "Last Name":d.last_name,
      "Phone Number":d.verified_phone_number,
      Email: d.email,
      "Consultation Fee (₹)": d.consultation_fee,
      Specialization: d.specializations?.map((s) => s.name).join(", "),
      Experience : d.experience_years,
      "Ayush Register Number" : d.ayush_registration_number,
      Qualtification : d.qualification,
      Status : d.status,
    "Available To":d.available_from,
    "Available From":d.available_to,
      "Treatment":d.treatment_type,
      "Address":d.address_line,


    }));

    const ws = XLSX.utils.json_to_sheet(exportData)
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({ wch: key.length + 20 }));
    ws['!cols'] = colWidths;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Doctors");
    XLSX.writeFile(wb, "doctor_data.xlsx");
  };

  const handleverifiedDoctor = () => {
    setVerifiedDoctorModal(false)
    setOtpErrors({})
    setOtpDigits(["", "", "", ""])
  }

 const fetchSpecialization = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  try {
    const response = await fetch(`${BASE_URL}/healthcare/speciality/`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
    });

    if (response.status === 401 || response.status === 403) {
      toast.error("Session expired. Please login again");
      sessionStorage.removeItem("superadmin_token");
      navigate("/login");
      return;
    }

    const data = await response.json();
    console.log("Fetched Specialities:", data);
    setSpecialities(data);

  } catch (error) {
    console.error("Error fetching specialities:", error);
    toast.error("Failed to fetch specialities");
  }
};

  useEffect(() => {
    fetchSpecialization();
  }, [])


 
  const indexoflastdoctor =currentpage*doctorperpage;
  const indexoffirstdoctor= indexoflastdoctor - doctorperpage;
  const currentDoctor= filteredDoctors.slice(indexoffirstdoctor,indexoflastdoctor)
  const totalpages=Math.ceil(filteredDoctors.length/doctorperpage);

const handlePageChange=(pageNumber)=>setCurrentpage(pageNumber)
  const handleSelection = () => {
    setDropdownOpen(!dropdownOpen);
  }


const getInitials = (firstName, lastName) => {
  const safeFirstName = (firstName || "").toString();
  const safeLastName = (lastName || "").toString();

  const cleanFirstName = safeFirstName
    .replace(/^dr\.?\s*/i, "")
    .trim();

  const firstInitial = cleanFirstName.charAt(0)?.toUpperCase() || "";
  const lastInitial = safeLastName.charAt(0)?.toUpperCase() || "";

  return `${firstInitial}${lastInitial}` || "?";
};




  const handleStatusChange = async (doctorId, newStatus,reason = "") => {
    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(`${BASE_URL}/healthcare/approvedoctor/${doctorId}/`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization:`Bearer ${token}`
        },
        body: JSON.stringify({
      status: newStatus,
       rejection_reason: reason 
        }),
      })
      if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

      if (!response.ok) {
        throw new Error("Failed to update status")
      }

      setDoctorData((prev) =>
        prev.map((doctor) =>
          doctor.id === doctorId ? { ...doctor, status : newStatus } : doctor,
        ),
      )
    } catch (err) {
      console.error(err)
      toast.error("Error updating vendor status")
    }
  }

 
  return (
    <>
      <div className="page-header">
        <h1>Doctor</h1>
      </div>

      <div className="doctor-controls">
        <div className="search-bar">

          <input
            type="text"
            placeholder="Search doctor by name or specialization..."
            value={doctorsearch}
            onChange={(e) => setDoctorsearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select className="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="pending">pending</option>
            <option value="approved">Approved</option>
            <option value="rejected"> Rejected</option>
              <option value="suspended"> Suspended</option>

          </select>

          <select
            value={specializationfilter}
            onChange={(e) => setSpecilizationfilter(e.target.value)}
            className="status-filter"
          >
            <option value="All">All Specializations</option>
            {specialities?.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <button className="add-customer-btn" onClick={() => setDoctorModal(true)}>
            + Add Doctor
          </button>
          <button className="add-customer-btn" onClick={handleDoctorDownload}>
            Export Details
          </button>

        </div>
      </div>
      
     

      <div className="customers-stats">
        <div className="stat-card">
          <h3>Total Doctors</h3>
          <div className="stat-value">{Doctordata.length}</div>
        </div>
        <div className="stat-card">
          <h3> Approved  Doctors</h3>
          <div className="stat-value">{Doctordata.filter((d) => d.status ==="approved").length}</div>
        </div>
        <div className="stat-card">
          <h3>Pending Doctors</h3>
          <div className="stat-value">{Doctordata.filter((d) => d.status ==="pending").length}</div>
        </div>
      </div>
      <div className="table-container">
        <table className="customers-table" ref={doctortableRef}>
          <thead>
            <tr>
              <th>ID</th>
              <th>profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            
              <th>Status</th>
              <th> Fees </th>
              <th>Availability</th>
              <th>Ayush.No</th>
              <th>Qualification </th>
              <th>Specialization</th>
              <th>Type</th>
              
              <th>Experience</th>
             
               <th>Documents </th>
               <th>Actions</th>

            </tr>
          </thead>
          <tbody>
            {Loading ? (
                <tr>
            <td colSpan="15" style={{ textAlign: "center", padding: "20px" }}>
              <div className="circular-loader"></div>
            </td>
          </tr>

            ) : error ? (
              <tr>
                <td colSpan="11" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : currentDoctor.length > 0 ? (
              currentDoctor.map((item, index) => (
                <tr key={item.id}>
                  <td>{indexoffirstdoctor + index+1}</td>
               
                 <td>
  <div className="customer-avatar-wrapper">
    {item.profile_image ? (
      <img
        src={item.profile_image}
        alt="profile"
        className="customer-avatar-img"
        onClick={() => {
          setImageModal(true);
     setPreviewImage(item.profile_image);
        }}
      />
    ) : (
      <div className="customer-avatar">
        {getInitials(item.first_name, item.last_name)}
      </div>
    )}
  </div>
</td>
<td>
  {item.first_name
    ? `${item.first_name}${item.last_name
      
      ? " " + item.last_name : ""}`
    : "NA"}
</td>

  
                  <td>{item?.email}</td>
                  <td>{item?.verified_phone_number}</td>
                 
                    <td>
                <select
  value={item?.status}
  onChange={(e) => {
   const newStatus = e.target.value;
    if (newStatus === "rejected" || newStatus === "suspended") {
      handleRejectClick(item.id, newStatus);  
    } else {
      handleStatusChange(item.id, newStatus);
    }
  }}
  className="status-dropdown"
>

 <option value="pending">Pending</option>
  <option value="approved">Approved</option>
  <option value="rejected">Rejected</option>
  <option value="suspended">Suspended</option>
</select>
                  </td>

                  <td>₹{item?.consultation_fee}</td>
                  <td style={{ color: "blue" }}>
                    {item?.available_from} - {item?.available_to}
                  </td>

                  <td>{item?.practice_license_number}</td>
                  <td>{item?.qualification}</td>

                  <td>{item?.specializations?.map((s) => s.name).join(", ")}</td>

                  <td>{item?.treatment_type.map((item) => item.treatment_type)}</td>
                 
                      <td>{item?.experience_years} years</td>


                  <td style={{ textAlign: "center" }}>
                    <FiFileText size={20} color="#71a33f"
                      onClick={() => openDocumentModal(item)}
                    />
                  </td>

<td style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>

  <button
    className="action-menu-toggle"
    onClick={() =>
      setOpenthreedotId(OpenthreedotId === item.id ? null : item.id)
    }
    style={{
      background: "transparent",
      border: "none",
      cursor: "pointer",
      fontSize: "20px",
    }}
  >
    <BsThreeDotsVertical />
  </button>



 
  {OpenthreedotId === item.id && (
    <div
      className="action-buttons-modal"
      
    >
       
       
       {item.status ==="approved" &&(
        <button
                        className="action-btn1"
                        title=" Detail Page"
                        onClick={() => handleNavigateDoctor(item.id)}
                      >
    <span className="icon">👁</span> 
  <span>Detail Page</span>
  </button>
       )} 

   <button
  className="action-btn1"
  title="Edit Doctor Details"
  onClick={() => {
    const existingDocs = [];
    if (item.documents && item.documents.length > 0) {
      item.documents.forEach((doc) => {
        existingDocs.push({
          type: doc.document_type,
          file: null,
          existingUrl: doc.file_url,
        });
      });
    }


    setDoctorform({
      profile_image:item.profile_image,
         first_name:item.first_name,
         last_name:item.last_name,
      email: item.email,
     
      assured_muni: item.assured_muni,
      verified_phone_number: item.verified_phone_number,
      experience_years: item.experience_years,
      specialization_ids: item.specializations
        ? item.specializations.map((spec) => String(spec.id))
        : [],
      consultation_fee: item.consultation_fee,
      available_from: item.available_from || "",
      available_to: item.available_to || "",
      treatment_type_id: item.treatment_type?.[0]?.id || "",
     practice_license_number: item.practice_license_number,
      qualification: item.qualification,
      documentType: "",
      documentFile: null,
    });

    setUploadedDocs(existingDocs);
    setSpecs(
      item.specializations ? item.specializations.map((spec) => spec.id) : []
    );
    setPhonenumber(item.verified_phone_number?.replace("+91", ""));
    setEditingDoctorId(item.id);
    clearAllErrors();
    setDoctorformModal(true);
  }}
>
   <span className="icon">✏️</span>
  <span>Edit Detail</span>
</button>

                    

   <button
                        className="action-btn1"
                        title="Delete"
                        onClick={() => {
                          setSelectedDoctorId(item.id)
                          setDeleteConfirmModal(true)
                        }}
                      >
   <span className="icon">🗑</span>
  <span>Delete </span>
                      </button>  
    </div>
  )}
</td>



                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" style={{ textAlign: "center" }}>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>

  {filteredDoctors.length> doctorperpage &&(
          < div className="pagination"> 

 <button onClick={()=>handlePageChange(currentpage-1)} disabled={currentpage === 1}> Prev</button>
 
{Array.from({ length: totalpages}, (_, i) => i + 1).map(number => (
  <button
    key={number} 
    className={currentpage === number ? "active" : ""} 
    onClick={() => handlePageChange(number)}
  >
    {number}
  </button>
))}

<button onClick={()=>handlePageChange(currentpage +1)} disabled={currentpage === totalpages}> Next</button>

          </div>
        )}
      </div>


      {DoctorModal && (
        <div className="modal">
          <form className="customer-form" onSubmit={handledoctorSubmit}>
            <h2>Enter your phone number</h2>
            <input
              type="text"
              value={phonenumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "")
                if (value.length <= 10) {
                  setPhonenumber(value)
                  if (phoneErrors.phone) {
                    setPhoneErrors({})
                  }
                }
              }}
              placeholder="Enter phone number without +91"
              maxLength={10}
              style={{ borderColor: phoneErrors.phone ? "red" : "" }}
            />
            {phoneErrors.phone && (
              <span style={{ color: "red", fontSize: "17px", display: "block", marginTop: "5px" }}>
                {phoneErrors.phone}
              </span>
            )}
            <div className="form-buttons">
              <button type="submit">Create Doctor</button>
              <button type="button" onClick={handleCloseDoctorModal}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

     

      {DoctorformModal && (
        <div className="modal">
          <form className="product-form" onSubmit={handleDoctorformSubmit}>
            <h3>{EditingDoctorId ? "Edit Doctor" : "Add Doctor"}</h3>

            <div className="form-grid">

              <div className="form-column-1">
                <div className="form-field">
                  <label>Profile Picture :</label>
                <input
    type="file"
    name="profile_image"
    accept="image/*"
    onChange={handleDoctorinputchange}
  />
                </div>
                <div className="form-field">
                  <label>First Name: *</label>
                  <input
                    name="first_name"
                    value={Doctorform.first_name}
                    onChange={handleDoctorinputchange}

                    style={{ borderColor: doctorFormErrors.first_name ? "red" : "" }}
                  />
                  {doctorFormErrors.first_name&& (
                    <span className="error-text">{doctorFormErrors.first_name}</span>
                  )}
                </div>
                 <div className="form-field">
                  <label>Last Name: *</label>
                  <input
                    name="last_name"
                    value={Doctorform.last_name}
                    onChange={handleDoctorinputchange}
                    style={{ borderColor: doctorFormErrors.last_name ? "red" : "" }}
                  />
                  {doctorFormErrors.last_name&& (
                    <span className="error-text">{doctorFormErrors.last_name}</span>
                  )}
                </div>

                <div className="form-field">
                  <label>Email: *</label>
                  <input
                    name="email"
                    type="email"
                    value={Doctorform.email}
                    onChange={handleDoctorinputchange}
                    style={{ borderColor: doctorFormErrors.email ? "red" : "" }}
                  />
                  {doctorFormErrors.email && (
                    <span className="error-text">{doctorFormErrors.email}</span>
                  )}
                </div>

              

                <div className="form-field">
                  <label>Consultation Fee (₹): *</label>
                  <input
                    type="number"
                    name="consultation_fee"
                    value={Doctorform.consultation_fee}
                    onChange={handleDoctorinputchange}
                    min="1"
                    max="10000"
                    style={{ borderColor: doctorFormErrors.consultation_fee ? "red" : "" }}
                  />
                  {doctorFormErrors.consultation_fee && (
                    <span className="error-text">{doctorFormErrors.consultation_fee}</span>
                  )}
                </div>

                <div className="form-field">
                  <label>Specialization: *</label>
                  <div
                    className="multi-select-dropdown"
                    style={{ borderColor: doctorFormErrors.specialization_ids ? "red" : "" }}
                  >
                    <div className="multi-select-label" onClick={handleSelection}>
                      {Doctorform.specialization_ids.length > 0
                        ? specialities
                          .filter((s) => Doctorform.specialization_ids.includes(s.id))
                          .map((s) => s.name)
                          .join(", ")
                        : "-- Select Specialities --"}
                    </div>


                    {dropdownOpen && (
                      <div className="multi-select-options">
                        {specialities.map((spec) => (
                          <label
                            key={spec.id}
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              gap: "5px",
                              cursor: "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              style={{ width: "auto" }}
                              checked={
                                Array.isArray(Doctorform.specialization_ids) &&
                                Doctorform.specialization_ids.includes(String(spec.id))
                              }
                              onChange={(e) => {
                                let updated = Array.isArray(Doctorform.specialization_ids)
                                  ? [...Doctorform.specialization_ids]
                                  : Doctorform.specialization_ids
                                    ? [String(Doctorform.specialization_ids)]
                                    : [];

                                if (e.target.checked) {
                                  if (!updated.includes(String(spec.id))) {
                                    updated.push(String(spec.id));
                                  }
                                } else {
                                  updated = updated.filter((id) => id !== String(spec.id));
                                }

                                setDoctorform({
                                  ...Doctorform,
                                  specialization_ids: updated,
                                });
                              }}
                            />
                            {spec.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>


                  <button
                    type="button"

                    onClick={() => setAddspecialityform(true)}


                    style={{

                      padding: "4px 10px",
                      background: "#71a33f",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                   
                    }}
                  >
                    + Add Speciality
                  </button>

                  {doctorFormErrors.specialization_ids && (
                    <span className="error-text">{doctorFormErrors.specialization_ids}</span>
                  )}
                </div>
              </div>


              <div className="form-column-2">
                <div className="form-field">
                  <label>Experience (Years): *</label>
                  <input
                    type="number"
                    name="experience_years"
                    value={Doctorform.experience_years}
                    onChange={handleDoctorinputchange}
                    min="0"
                    max="60"
                    style={{ borderColor: doctorFormErrors.experience_years ? "red" : "" }}
                  />
                  {doctorFormErrors.experience_years && (
                    <span className="error-text">{doctorFormErrors.experience_years}</span>
                  )}
                </div>

                <div className="form-field">
                  <label>Available from: *</label>
                  <input
                    type="time"
                    name="available_from"
                    value={Doctorform.available_from}
                    onChange={handleDoctorinputchange}
                    style={{ borderColor: doctorFormErrors.available_from ? "red" : "" }}
                  />
                  {doctorFormErrors.available_from && (
                    <span className="error-text">{doctorFormErrors.available_from}</span>
                  )}
                </div>

                <div className="form-field">
                  <label>Available to: *</label>
                  <input
                    type="time"
                    name="available_to"
                    value={Doctorform.available_to}
                    onChange={handleDoctorinputchange}
                    style={{ borderColor: doctorFormErrors.available_to ? "red" : "" }}
                  />
                  {doctorFormErrors.available_to && (
                    <span className="error-text">{doctorFormErrors.available_to}</span>
                  )}
                </div>

                <div className="form-field">
                  <label>Phone Number:</label>
                  <input
                    type="text"
                    name="verified_phone_number"
                    value={phonenumber}
                    onChange={(e) => setPhonenumber(e.target.value)}
                    placeholder="Phone number without +91"
                    readOnly
                    style={{ borderColor: doctorFormErrors.verified_phone_number ? "red" : "" }}
                  />
                  {doctorFormErrors.verified_phone_number && (
                    <span className="error-text">{doctorFormErrors.verified_phone_number}</span>
                  )}
                </div>

                <div className="form-field1">
                  <label>Treatment Type: *</label>
                  <select
                    name="treatment_type_id"
                    value={Doctorform.treatment_type_id}
                    onChange={handleDoctorinputchange}
                 
                    className="form-select1"
                  >
                    <option value="">-- Select Treatment Type --</option>
                    {treatmentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.treatment_type}
                      </option>
                    ))}
                  </select>
                  {doctorFormErrors.treatment_type_id && (
                    <span className="error-text">{doctorFormErrors.treatment_type_id}</span>
                  )}
                </div>
              </div>


              <div className="form-column-3">

                <div className="form-field">
                  <label>License Number:</label>
                  <input
                    type="text"
                    name="practice_license_number"
                    placeholder="Enter your  License Number"
                    value={Doctorform.practice_license_number || ""}
                    onChange={handleDoctorinputchange}
                  
                  />
                  {doctorFormErrors.practice_license_number && (
                    <span className="error-text">
                      {doctorFormErrors.practice_license_number}
                    </span>
                  )}
                </div>


                <div className="form-field">
                  <label>Qualification: *</label>
                  <input
                    type="text"
                    name="qualification"
                    placeholder="Enter Qualification (e.g. BAMS, MD, PhD)"
                    value={Doctorform.qualification || ""}
                    onChange={handleDoctorinputchange}

                  />
                  {doctorFormErrors.qualification && (
                    <span className="error-text">{doctorFormErrors.qualification}</span>
                  )}
                </div>



                <div className="form-field">
                  <label>Documents: *</label>
                  <select
                    name="documentType"
                    value={Doctorform.documentType}
                    onChange={handleDoctorinputchange}
                    style={{ borderColor: doctorFormErrors.documentType ? "red" : "" }}
                  >
                    <option value="">-- Select Document --</option>

                    {documentOptions
                      .filter((opt) => !uploadedDocs.some((doc) => doc.type === opt.value))
                      .map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}

                  </select>
                  {doctorFormErrors.documentType && (
                    <span className="error-text">{doctorFormErrors.documentType}</span>
                  )}
                </div>

             




               <div className="form-field">
  <label>Upload Document (PDF)</label>
  <input
    type="file"
    name="documentFile"
    onChange={handleDoctorinputchange}
    accept="application/pdf"
    style={{
      borderColor: doctorFormErrors.documentFile ? "red" : "",
    }}
  />

  {doctorFormErrors.documentFile && (
    <span className="error-text">{doctorFormErrors.documentFile}</span>
  )}

  <button
    type="button"
    onClick={handleAddDocument}
    style={{
      padding: "4px 10px",
      background: "#71a33f",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      marginTop: "5px",
    }}
  >
    Add
  </button>

  
  {uploadedDocs.length > 0 && (
    <div className="uploaded-doc-list" style={{ marginTop: "10px" }}>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {uploadedDocs.map((doc, i) => (
          <li
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "5px",
              borderBottom: "1px solid #ddd",
              paddingBottom: "3px",
            }}
          >
            <span
              style={{
                display: "inline-block",
                maxWidth: "200px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              ✅ <strong>{doc.type}</strong> —{" "}
              {doc.file
                ? doc.file.name
                : doc.existingUrl
                ? "Previously uploaded"
                : "No file"}
            </span>

            <div style={{ display: "flex", alignItems: "center" }}>

              {doc.existingUrl && (
                <a
                  href={doc.existingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "blue",
                    textDecoration: "underline",
                    marginRight: "10px",
                  }}
                >
                  View
                </a>
              )}

         

              <label
                style={{
                  cursor: "pointer",
                  color: "green",
                  marginRight: "10px",
                }}
              >
                Replace
                <input
                  type="file"
                  accept="application/pdf"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setUploadedDocs((prev) =>
                        prev.map((d) =>
                          d.type === doc.type
                            ? { ...d, file, existingUrl: null }
                            : d
                        )
                      );
                      toast.success("Document replaced!");
                    }
                  }}
                />
              </label>

          
              <button
                type="button"
                onClick={() => handleRemoveDocument(doc.type)}
                style={{
                  color: "red",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                🗑
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )}
</div>

              </div>

            </div>
            <div className="form-buttons">
              <button type="submit">Save</button>
              <button
                type="button"
                onClick={() => {
                  setDoctorformModal(false);
                  clearDoctorForm();
                  clearAllErrors();
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {AddSpeciality && (
        <div className="modal">
          <form className="customer-form" onSubmit={handleAddSpecialization}>
            <h2>Add New Specialization</h2>
            <label>Specialization:</label>
            <input
              type="text"
              placeholder="Enter New Specialization"
              value={newSpecilization}
              onChange={(e) => setNewSpecilization(e.target.value)}
            />

            <div className="form-buttons">
              <button type="submit">Add Specialization</button>
              <button type="button" onClick={() => setAddspecialityform(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteConfirmModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this doctor?</h3>
            <div className="form-buttons">
              <button
                className="otp-btn verify-btn"
                onClick={() => {
                  handleDoctorDelete(selectedDoctorId)
                  setDeleteConfirmModal(false)
                }}
              >
                Yes
              </button>
              <button onClick={() => setDeleteConfirmModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {openModal && (
        <div className="modal-overlay" onClick={() => setOpenModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Uploaded Documents</h3>

            {selectedDoctor?.documents && selectedDoctor.documents.length > 0 ? (
              <ul className="doc-list">
                {selectedDoctor.documents.map((doc, i) => (
                  <li key={i}>
                    {doc.file_url ? (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        📄 {doc.document_type_display || doc.document_type}
                      </a>
                    ) : (
                      <span className="docno">📄 No Document Uploaded</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-docs">No documents uploaded.</p>
            )}
            <button className="close-btn" onClick={() => setOpenModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}


     {ImageModal &&(
      <div className="image-preview-overlay" onClick={() => setImageModal(false)}>
    <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
      <img src={previewImage} alt="Preview" />
      
    </div>
    </div>
     )}
 

{showReasonModal &&(
  <div className="modal">
    <div className="modal-content">
<h2> Enter Rejection Reason</h2>
<textarea
value={rejectReason}
placeholder =  " Enter the reason for the Rejection....."
onChange={(e)=>setRejectReason(e.target.value)}
/>
<div className="form-buttons">
<button onClick ={submitRejection}> Submit</button>
<button onClick = {()=> setShowReasonModal(false)}>Cancel</button>
</div>
    </div>
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
  )
}

export default Doctor



