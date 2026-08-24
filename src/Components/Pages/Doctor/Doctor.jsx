import * as XLSX from "xlsx";
import { useState, useEffect, useRef } from "react";


import { data, useNavigate } from "react-router-dom"
import BASE_URL from "../../../Base";
import { FiFileText } from "react-icons/fi";
import { BsDownload, BsPlus, BsSearch, BsThreeDotsVertical } from "react-icons/bs";
import { FaTrash, FaUsers } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import Calender from "./Calendar"
import { FaCheckCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { ToastContainer, toast } from "react-toastify";


const userId = localStorage.getItem("USER_ID")
console.log("userIduserIduserId", userId)

const intialDoctorform = {
  profile_image: "",
  first_name: "",
  last_name: "",
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
  const[approvedoctorModal,setDoctorApproveModal]=useState(false);
 const [isApproving, setIsApproving] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [allDoctorData, setAllDoctorData] = useState([]);

  const [showReasonModal, setShowReasonModal] = useState(false);

  const [rejectReason, setRejectReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [OpenthreedotId, setOpenthreedotId] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [ImageModal, setImageModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const pagesize =10;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pagesize);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const [currentpage, setCurrentPage] = useState(1);
  const [Nextpage, setNextpage] = useState(null);

  const [previousPage, setPreviousPage] = useState(null);

  const[RejectionDoctorModal,setRejectionDoctorModal]=useState(false);
   const [doctorStats, setdoctorStats] = useState({
  vendors: 0,
  approved: 0,
  pending: 0,
  suspended: 0,
  rejected: 0,
});
const searchDebounceRef = useRef(null);



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
    const handleApproveClick = (doctor) => {
  setSelectedDoctorId(doctor.id);
  setSelectedDoctor(doctor);      
  setDoctorApproveModal(true);
};
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

  const validateDoctorForm = (formData, phoneNum) => {
    const errors = {};

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

  await handleStatusChange(
    selectedDoctorId,
    selectedStatus,
    rejectReason
  );

  setRejectionDoctorModal(false);  
  setRejectReason("");
  setSelectedDoctorId(null);
  setSelectedStatus("");
};
  const handleRejectClick = (doctor, statusType) => {
  setSelectedDoctorId(doctor.id);
  setSelectedStatus(statusType);
  setSelectedDoctor(doctor);
  setRejectionDoctorModal(true);
};

  const getdoctorlist = async (
  page = 1,
  searchValue = doctorsearch,
  statusValue = statusFilter
) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoading(true);

  try {
    const queryParams = new URLSearchParams();

    queryParams.append("page", page.toString());

   
    if (searchValue?.trim()) {
      queryParams.append("search", searchValue.trim());
    }

   
    if (statusValue && statusValue !== "All") {
      queryParams.append("status", statusValue);
    }

    const response = await fetch(
      `${BASE_URL}/doctors/admin/doctors-list/?${queryParams.toString()}`,
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

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to fetch doctors");
    }

    setDoctorData(data?.data?.results || []);
    setTotalCount(data?.data?.count || 0);
    setCurrentPage(page);

    setNextpage(data?.data?.next || null);
    setPreviousPage(data?.data?.previous || null);

    setdoctorStats(
      data?.data?.total_counts || {
        doctors: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        suspended: 0,
      }
    );
  } catch (err) {
    console.error("Doctor list error:", err);
    setError("Something went wrong while fetching data.");
    toast.error("Failed to fetch Doctor Data");
  } finally {
    setLoading(false);
  }
};
  const handleDieticianToggle = async (doctor) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  const newDieticianStatus = !doctor.is_dietitian;

  try {
    const response = await fetch(
      `${BASE_URL}/doctors/admin/doctor/?id=${doctor.id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          is_dietitian: newDieticianStatus,
        }),
      }
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Failed to update dietician status");
    }

    // Update table immediately
    setDoctorData((prev) =>
      prev.map((item) =>
        item.id === doctor.id
          ? {
              ...item,
              is_dietitian: newDieticianStatus,
            }
          : item
      )
    );

    // Close three-dot menu
    setOpenthreedotId(null);

    toast.success(
      newDieticianStatus
        ? "Doctor added as Dietician successfully"
        : "Doctor removed as Dietician successfully"
    );
  } catch (error) {
    console.error("Dietician toggle error:", error);
    toast.error(
      error.message || "Something went wrong while updating Dietician"
    );
  }
};

useEffect(() => {
  getdoctorlist(1, "", "All");
}, []);

useEffect(() => {
  if (searchDebounceRef.current) {
    clearTimeout(searchDebounceRef.current);
  }

  searchDebounceRef.current = setTimeout(() => {
    setCurrentPage(1);
    getdoctorlist(1, doctorsearch, statusFilter);
  }, 500);

  return () => {
    clearTimeout(searchDebounceRef.current);
  };
}, [doctorsearch]);
const modalRef = useRef(null);
const filterDoctors = () => {
  let filtered = [...allDoctorData];

  // Search
  if (doctorsearch.trim()) {
    const search = doctorsearch.toLowerCase();

    filtered = filtered.filter((doctor) => {
      const fullName =
        `${doctor.first_name || ""} ${doctor.last_name || ""}`.toLowerCase();

      const email = (doctor.email || "").toLowerCase();

      const specialization =
        doctor.specializations
          ?.map((s) => s.name.toLowerCase())
          .join(" ") || "";

      return (
        fullName.includes(search) ||
        email.includes(search) ||
        specialization.includes(search)
      );
    });
  }

  // Status Filter
  if (statusFilter !== "All") {
    filtered = filtered.filter(
      (doctor) => doctor.approval_status === statusFilter
    );
  }

  // Specialization Filter
  if (specializationfilter !== "All") {
    filtered = filtered.filter((doctor) =>
      doctor.specializations?.some(
        (s) => s.name === specializationfilter
      )
    );
  }

  setDoctorData(filtered);
};

  const openDocumentModal = (i) => {
    setOpenModal(true);
    setSelectedDoctor(i);
  }
  console.log(selectedDoctor, "selected");

  


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

 const handleStatusChange = async (doctorId, newStatus, reason = "") => {
    const token = sessionStorage.getItem("superadmin_token")
    try {
      const response = await fetch(`${BASE_URL}/doctors/admin/doctor/status/`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
           "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          doctor_id: doctorId,
          status: newStatus,
          reason: reason
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

      if (response.status === 200 || response.status === 201) {
        // await getDoctorStats();
        setDoctorData((prev) =>
          prev.map((doctor) =>
            doctor.id === doctorId ? { ...doctor, approval_status: newStatus } : doctor,
          ),
        )
      }


    } catch (err) {
      console.error(err)
      toast.error("Error updating vendor status")
    }
  } 


  return (
    <>
      <div className="page-header">
        <h1>Doctor Management</h1>
        <p className="page-paragraph"> Manage Doctor ,details and their  Approvals</p>
      </div>
      

      <div className="vendors-stats stats2-grid">
        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={12} />
          </div>
          <div className="stat2-info">
            <h3>Total Doctors</h3>
            <div className="stat2-value">{doctorStats?.doctors}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={12} />
          </div>
          <div className="stat2-info">
            <h3>Approved Doctors</h3>
            <div className="stat2-value">{doctorStats?.approved || 0}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={12} />
          </div>
          <div className="stat2-info">
            <h3>Pending Approval</h3>
            <div className="stat2-value">{doctorStats?.pending || 0}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={12} />
          </div>
          <div className="stat2-info">
            <h3>Rejected Doctors</h3>
            <div className="stat2-value">{doctorStats?.rejected || 0}</div>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-wrapper">
          <BsSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search doctor by email,phone Number..."
            value={doctorsearch}
            onChange={(e) => setDoctorsearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="action-buttons">
        <select
  className="status-filter"
  value={statusFilter}
  onChange={(e) => {
    const newStatus = e.target.value;

    setStatusFilter(newStatus);
    setCurrentPage(1);

    getdoctorlist(1, doctorsearch, newStatus);
  }}
>
  <option value="All">All Status</option>
  <option value="pending">Pending</option>
  <option value="approved">Approved</option>
  <option value="rejected">Rejected</option>
  <option value="suspended">Suspended</option>
</select>

          {/* <select
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
          </select> */}

          {/* <button className="btn-primary" onClick={() => setDoctorModal(true)}>
            <BsPlus size={18} />
            Add Doctor
          </button>
          <button className="btn-secondary" >
            <BsDownload size={16} />
            Export Details
          </button> */}

        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table" ref={doctortableRef}>
          <thead>
            <tr>
              <th>ID</th>
              <th>profile</th>
              <th>Name</th>

              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th> Fees </th>
            
              <th>Ayush.No</th>
              <th>Qualification </th>
              <th>Specialization</th>
              <th>Experience</th>
              {/* <th>Documents </th> */}
              <th>Actions</th>

            </tr>
          </thead>
          <tbody>
            {Loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan="10"><div className="skeleton-row"></div></td>
                </tr>
              ))

            ) : error ? (
              <tr>
                <td colSpan="13" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : Doctordata.length > 0 ? (
              Doctordata.map((item, index) => (
                <tr key={item.id}>
  <td>{index + 1}</td>

  {/* PROFILE */}
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
      ? `${item.first_name} ${item.last_name || ""}`
      : "NA"}
  </td>

  
  <td>{item.email || "NA"}</td>


  <td>{item.secondary_number || "NA"}</td>

  
  <td>
            <select
  value={item.approval_status}
  className="status-dropdown"
  onChange={(e) => {
    const newStatus = e.target.value;

    if (newStatus === "approved") {
      handleApproveClick(item);
    } else if (
      newStatus === "rejected" ||
      newStatus === "suspended"
    ) {
      handleRejectClick(item, newStatus);
    }
  }}
>
  <option value="pending">Pending</option>
  <option value="approved">Approved</option>
  <option value="rejected">Rejected</option>
  <option value="suspended">Suspended</option>
</select>
  </td>

  
  <td>₹{item.consultation_fee || 0}</td>



  <td>{item.ayurvedic_council_id || "NA"}</td>

 
  <td>{item.qualification || "NA"}</td>

  
  <td>
    {item.specializations?.length > 0
      ? item.specializations.map((s) => s.name).join(", ")
      : "NA"}
  </td>

 
  

 
  <td>{item.experience_years || 0} years</td>

 



 <td
  className={
    index === Doctordata.length - 1
      ? "action-td action-td-up"
      : "action-td"
  }
  onClick={(e) => e.stopPropagation()}
>
 <button
  className="action-menu-toggle"
  onClick={() =>
    setOpenthreedotId(
      OpenthreedotId === item.id ? null : item.id
    )
  }
>
      <span className="icon">
        <BsThreeDotsVertical />
      </span>
    </button>

  {OpenthreedotId === item.id && (
  <div className="action-buttons-modal">

    {/* DETAIL PAGE */}
    <button
      className="action-btn1"
      title="Detail Page"
      onClick={() => {
        setOpenthreedotId(null);
        handleNavigateDoctor(item.id);
      }}
    >
      <span className="icon">
        <FaEye />
      </span>

      <span>Detail Page</span>
    </button>


    {/* ADD / REMOVE DIETICIAN */}
    <button
      className="action-btn1"
      title={
        item.is_dietitian
          ? "Remove as Dietician"
          : "Add as Dietician"
      }
      onClick={() => handleDieticianToggle(item)}
    >
      <span className="icon">
        {item.is_dietitian ? "✕" : "🥗"}
      </span>

      <span>
        {item.is_dietitian
          ? "Remove as Dietician"
          : "Add as Dietician"}
      </span>
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


  {totalPages > 1 && (
  <div className="pagination">

    <button
      onClick={() =>
        getdoctorlist(
          currentpage - 1,
          doctorsearch,
          statusFilter
        )
      }
      disabled={!previousPage}
    >
      Prev
    </button>

    {pages.map((page) => (
      <button
        key={page}
        onClick={() =>
          getdoctorlist(
            page,
            doctorsearch,
            statusFilter
          )
        }
        style={{
          fontWeight:
            currentpage === page ? "bold" : "normal",
          background:
            currentpage === page
              ? "#0D614E"
              : "#fff",
          color:
            currentpage === page
              ? "#fff"
              : "#0D614E",
        }}
      >
        {page}
      </button>
    ))}

    <button
      onClick={() =>
        getdoctorlist(
          currentpage + 1,
          doctorsearch,
          statusFilter
        )
      }
      disabled={!Nextpage}
    >
      Next
    </button>

  </div>
)}

      </div>



       {ImageModal && (
        <div className="image-preview-overlay" onClick={() => setImageModal(false)}>
          <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Preview" />

          </div>
        </div>
      )}

{approvedoctorModal && (
  <div className="confirm-overlay"
   onClick={() => {
    setDoctorApproveModal(false);
    setSelectedDoctorId(null);
  }}
  >
    <div className="confirm-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <button
        className="closes-modal"
        onClick={() => {
          setDoctorApproveModal(false);
          setSelectedDoctorId(null);
        }}
      >
        <IoClose />
      </button>

      <div className="approval-icon-wrapper">
        <FaCheckCircle className="approval-icon" />
      </div>

      <h2 className="confirm-title">
        Approve Doctor
      </h2>

      <p className="confirm-description">
        Are you sure you want to approve this doctor?
      </p>

   <div className="vendor-info-card">
  <div className="vendor-row">
    <span className="label">Doctor Name</span>

    <span
      className={`value ${
        selectedStatus === "rejected"
          ? "reject-text"
          : selectedStatus === "suspended"
          ? "suspend-text"
          : "approve-text"
      }`}
    >
      {selectedDoctor?.first_name || "N/A"}
    </span>
  </div>
</div>

      <div className="info-box">
        <span className="info-icon">ℹ</span>

        <span>
          This action will grant Doctor access to the platform.
        </span>
      </div>

      <div className="confirm-buttons">

        <button
          className="cancels-btn"
          onClick={() => {
            setDoctorApproveModal(false);
            setSelectedDoctorId(null);
          }}
        >
          Cancel
        </button>

       <button
  className="approve-btn"
  disabled={isApproving}
  onClick={async () => {
    if (isApproving) return;

    setIsApproving(true);

    try {
      await handleStatusChange(
        selectedDoctorId,
        "approved"
      );

      setDoctorApproveModal(false);
      setSelectedDoctorId(null);
    } finally {
      setIsApproving(false);
    }
  }}
>
  {isApproving ? "Approving..." : "Approve"}
</button>

      </div>

    </div>
  </div>
)}

   {RejectionDoctorModal && (
  <div className="confirm-overlay"
    onClick={() => {
          setRejectionDoctorModal(false);
          setRejectReason("");
        }}
  >
    <div className="reason-modal modern-reason-modal"
        onClick={(e) => e.stopPropagation()}
    >

      <button
        className="closes-modal"
        onClick={() => {
          setRejectionDoctorModal(false);
          setRejectReason("");
        }}
      >
        <IoClose />
      </button>

      <div
        className={`reason-icon ${
          selectedStatus === "rejected"
            ? "reject-bg"
            : "suspend-bg"
        }`}
      >
        {selectedStatus === "rejected" ? "✕" : "❚❚"}
      </div>

      <h2>
        {selectedStatus === "rejected"
          ? "Reject Doctor"
          : "Suspend Doctor"}
      </h2>

      <p className="reason-subtitle">
        {selectedStatus === "rejected"
          ? "Please provide a reason for rejection."
          : "Please provide a reason for suspension."}
      </p>

  <div
  className={`vendor-info-card ${
    selectedStatus === "rejected"
      ? "reject-card"
      : "suspend-card"
  }`}
>
  <div className="vendor-row">
    <span className="label">Doctor Name</span>

    <span
      className={`value ${
        selectedStatus === "rejected"
          ? "reject-text"
          : "suspend-text"
      }`}
    >
      {selectedDoctor?.first_name || "N/A"}
    </span>
  </div>
</div>

      {/* Reason Box */}
      <div className="reason-field">
        <label>
          Reason <span>*</span>
        </label>
<textarea
  className={`reason-box ${
    selectedStatus === "rejected"
      ? "reject-reason-box"
      : "suspend-reason-box"
  }`}
  value={rejectReason}
  onChange={(e) => setRejectReason(e.target.value)}
  placeholder={
    selectedStatus === "rejected"
      ? "Enter reason for rejection..."
      : "Enter reason for suspension..."
  }
/>
      </div>

     
      <div
  className={`info-box ${
    selectedStatus === "rejected"
      ? "reject-info-box"
      : "suspend-info-box"
  }`}
>
  <span
    className={`infos-icon ${
      selectedStatus === "rejected"
        ? "reject-infos-icon"
        : "suspend-infos-icon"
    }`}
  >
    {selectedStatus === "rejected" ? "✕" : "⏸"}
  </span>

  <span>
    {selectedStatus === "rejected"
      ? "The Doctor will be notified about the rejection reason."
      : "The Doctor will temporarily lose access to the platform."}
  </span>
</div>

    <div className="confirm-buttons">
        <button
          className="cancels-btn"
          onClick={() => {
            setRejectionDoctorModal(false);
            setRejectReason("");
          }}
        >
          Cancel
        </button>

    <button
  className={`approve-btn ${
    selectedStatus === "rejected"
      ? "rejects-btn"
      : "suspend-btn"
  }`}
  onClick={(e) => {
    if (!rejectReason.trim()) {
      toast.error(
        selectedStatus === "rejected"
          ? "Please enter rejection reason"
          : "Please enter suspension reason"
      );
      return;
    }

    submitRejection(e);
  }}
>
  {selectedStatus === "rejected" ? "Reject" : "Suspend"}
</button>
      </div>
    </div>
  </div>
)}
  <ToastContainer position="top-center" autoClose={2000} />
      </>
  )
}

export default Doctor



