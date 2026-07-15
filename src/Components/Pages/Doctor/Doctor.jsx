import * as XLSX from "xlsx";
import { useState, useEffect, useRef } from "react";
import { toast } from 'react-toastify'

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

  const [showReasonModal, setShowReasonModal] = useState(false);

  const [rejectReason, setRejectReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [OpenthreedotId, setOpenthreedotId] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [ImageModal, setImageModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const pagesize = 5;
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.ceil(totalCount / pagesize);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const [currentpage, setCurrentPage] = useState(1);
  const [Nextpage, setNextpage] = useState(null);

  const [previousPage, setPreviousPage] = useState(null);
  const [doctorStats, setDoctorStats] = useState(null);
  const[RejectionDoctorModal,setRejectionDoctorModal]=useState(false);




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

  const getdoctorlist = async (page = 1) => {
    
    const token = sessionStorage.getItem("superadmin_token");
   
       if (!token) {
         toast.error("Session expired. Please login again");
         navigate("/login");
         return;
       }
   
       setLoading(true);
   
       try {
         const response = await fetch(
            `${BASE_URL}/doctors/admin/doctors-list/?page=${page}`,
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

      setDoctorData(data.data.results);
      setTotalCount(data.data.count);
      setCurrentPage(page);
      setNextpage(data.data.next);
      setPreviousPage(data.data.previous);

    } catch (err) {
      console.error(err.message);
      setError("Something went wrong while fetching data.");
      toast.error("Failed to fetch Doctor Data");
    } finally {
      setLoading(false);
    }
  };
 useEffect(()=>{
  getdoctorlist();
 },
 []
)
   


  const openDocumentModal = (i) => {
    setOpenModal(true);
    setSelectedDoctor(i);
  }
  console.log(selectedDoctor, "selected");

  

  // const handleDoctorDelete = async (id) => {
  //   const token = sessionStorage.getItem("superadmin_token");

  //   try {
  //     const response = await fetch(`${BASE_URL}/healthcare/doctor/${id}/`, {
  //       method: "DELETE",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });


  //     if (response.status === 401 || response.status === 403) {
  //       toast.error("Session expired. Please login again");
  //       sessionStorage.removeItem("superadmin_token");
  //       navigate("/login");
  //       return;
  //     }

  //     if (!response.ok) {
  //       toast.error("Failed to delete");
  //       return;
  //     }

  //     setDoctorData(Doctordata.filter((c) => c.id !== id));
  //     toast.success("Doctor deleted successfully");

  //   } catch {
  //     toast.error("Failed to delete");
  //   }
  // };


  // const handleCloseDoctorModal = () => {
  //   setDoctorModal(false)
  //   clearAllErrors()
  //   setPhonenumber("")
  // }



  // const handleDoctorformSubmit = async (e) => {
  //   e.preventDefault();

  //   console.log("uploadedDocs", uploadedDocs);
  //   const formErrors = validateDoctorForm(Doctorform, phonenumber);
  //   console.log(formErrors, "error");


  //   if (Object.keys(formErrors).length > 0) {
  //     setDoctorFormErrors(formErrors);
  //     toast.error("Please fix the validation errors");
  //     return;
  //   }

  //   const method = EditingDoctorId ? "PUT" : "POST";
  //   const url = EditingDoctorId
  //     ? `${BASE_URL}/healthcare/doctor/${EditingDoctorId}/`
  //     : `${BASE_URL}/healthcare/doctor/`;

  //   const newFormData = new FormData();
  //   newFormData.append("first_name", Doctorform.first_name.trim());
  //   newFormData.append("last_name", Doctorform.last_name.trim());
  //   newFormData.append("email", Doctorform.email.trim());
  //   newFormData.append("assured_muni", Doctorform.assured_muni);
  //   newFormData.append("verified_phone_number", `+91${phonenumber}`);
  //   newFormData.append("experience_years", Number.parseInt(Doctorform.experience_years));
  //   newFormData.append("consultation_fee", Number.parseFloat(Doctorform.consultation_fee));
  //   newFormData.append("available_from", Doctorform.available_from);
  //   newFormData.append("available_to", Doctorform.available_to);
  //   newFormData.append("treatment_type_ids", Doctorform.treatment_type_id);
  //   newFormData.append("practice_license_number", Doctorform.practice_license_number);
  //   newFormData.append("qualification", Doctorform.qualification);

  //   if (Doctorform.profile_image instanceof File) {
  //     newFormData.append("profile_image", Doctorform.profile_image);
  //   }



  //   let docIndex = 0;
  //   uploadedDocs.forEach((item) => {
  //     if (item.file) {
  //       newFormData.append(`document_types[${docIndex}]`, item.type);
  //       newFormData.append(`documents[${docIndex}]`, item.file);
  //       docIndex++;
  //     }
  //   });

  //   if (Array.isArray(Doctorform.specialization_ids)) {
  //     Doctorform.specialization_ids.forEach((id) =>
  //       newFormData.append("specialization_ids", id)
  //     );
  //   } else {
  //     newFormData.append("specialization_ids", Doctorform.specialization_ids);
  //   }

  //   if (!EditingDoctorId) {
  //     const user = userId || localStorage.getItem("USER_ID");
  //     newFormData.append("user", user);
  //   }

  //   const token = sessionStorage.getItem("superadmin_token");
  //   try {
  //     const response = await fetch(url, {
  //       method,
  //       body: newFormData,
  //       headers: {
  //         Accept: "application/json",
  //         Authorization: `Bearer ${token}`,
  //       }
  //     });

  //     if (response.status === 401 || response.status === 403) {
  //       toast.error("Session expired. Please login again");
  //       sessionStorage.removeItem("superadmin_token");
  //       navigate("/login");
  //       return;
  //     }


  //     const result = await response.json();

  //     if (response.ok) {
  //       toast.success(
  //         EditingDoctorId
  //           ? "Doctor updated successfully"
  //           : "Doctor added successfully"
  //       );
  //       setDoctorformModal(false);
  //       clearDoctorForm();
  //       clearAllErrors();
  //       setUploadedDocs([]);
  //       getdoctorlist();
  //     } else {
  //       toast.error(result.message || "Failed to save doctor");
  //     }
  //   } catch (err) {
  //     console.error("Doctor save error:", err.message);
  //     toast.error("Error saving doctor");
  //   }
  // };

  // const handleAddDocument = (e) => {
  //   e.preventDefault();

  //   if (!Doctorform.documentType || !Doctorform.documentFile) {
  //     toast.error("Please select document type and upload file");
  //     return;
  //   }

  //   const newDoc = {
  //     type: Doctorform.documentType,
  //     file: Doctorform.documentFile,
  //   };

  //   setUploadedDocs((prev) => {

  //     const existing = prev.find((d) => d.type === newDoc.type);
  //     if (existing) {
  //       return prev.map((d) => (d.type === newDoc.type ? newDoc : d));
  //     }
  //     return [...prev, newDoc];
  //   });


  //   setDoctorform((prev) => ({
  //     ...prev,
  //     documentType: "",
  //     documentFile: null,
  //   }));

  //   toast.success("Document added!");
  // };

  // const handleAddSpecialization = async (e) => {
  //   e.preventDefault();

  //   if (!newSpecilization.trim()) {
  //     toast.error("Specialization name is required");
  //     return;
  //   }

  //   if (!/^[A-Za-z\s]+$/.test(newSpecilization)) {
  //     toast.error("Specialization must contain only alphabets");
  //     return;
  //   }

  //   const token = sessionStorage.getItem("superadmin_token");

  //   try {
  //     const response = await fetch(`${BASE_URL}/healthcare/speciality/`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({ name: newSpecilization }),
  //     });

  //     if (response.status === 401 || response.status === 403) {
  //       toast.error("Session expired. Please login again");
  //       sessionStorage.removeItem("superadmin_token");
  //       navigate("/login");
  //       return;
  //     }

  //     const data = await response.json();

  //     if (!response.ok) {
  //       const errorMsg =
  //         data?.errors?.name
  //         ;

  //       toast.error(errorMsg);
  //       return;
  //     }

  //     toast.success("Specialization added successfully!");
  //     setNewSpecilization("");
  //     fetchSpecialization();
  //     setAddspecialityform(false);

  //   } catch (error) {
  //     console.error("Error adding specialization:", error);
  //     toast.error("Error adding specialization.");
  //   }
  // };

  const getDoctorStats = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    try {
      const res = await fetch(`${BASE_URL}/healthcare/doctorstats/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await res.json();
      setDoctorStats(data);

    } catch (error) {
      console.error("Error fetching doctor stats:", error);
    }
  };

  // const hasFetched = useRef(false);

  // useEffect(() => {
  //   if (!hasFetched.current) {
  //     getDoctorStats();
  //     hasFetched.current = true;
  //   }
  // }, []);


  // const fetchTreatmentTypes = async () => {
  //   const token = sessionStorage.getItem("superadmin_token");

  //   try {
  //     const response = await fetch(`${BASE_URL}/healthcare/treatmenttypes/`, {
  //       method: "GET",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     if (response.status === 401 || response.status === 403) {
  //       toast.error("Session expired. Please login again");
  //       sessionStorage.removeItem("superadmin_token");
  //       navigate("/login");
  //       return;
  //     }

  //     const data = await response.json();
  //     setTreatmentTypes(data);
  //   } catch (error) {
  //     console.error("Error fetching treatment types:", error);
  //   }
  // };

  // const hasFetchedTreatment = useRef(false);

  // useEffect(() => {
  //   if (!hasFetchedTreatment.current) {
  //     fetchTreatmentTypes();
  //     hasFetchedTreatment.current = true;
  //   }
  // }, []);




  // const handledoctorSubmit = async (e) => {
  //   e.preventDefault();


  //   const phoneValidation = validatePhoneNumber(phonenumber);
  //   if (Object.keys(phoneValidation).length > 0) {
  //     setPhoneErrors(phoneValidation);
  //     return;
  //   }

  //   const token = sessionStorage.getItem("superadmin_token");

  //   try {

  //     const payload = {
  //       phone_number: `+91${phonenumber}`,
  //       role: "doctor",
  //     };


  //     const response = await fetch(`${BASE_URL}/user/super-admin/create-user/`, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(payload),
  //     });


  //     if (response.status === 401 || response.status === 403) {
  //       toast.error("Session expired. Please login again");
  //       sessionStorage.removeItem("superadmin_token");
  //       navigate("/login");
  //       return;
  //     }


  //     const data = await response.json();


  //     if (!response.ok) {
  //       toast.error(data?.error);
  //       return;
  //     }


  //     const uid = data?.user?.id;
  //     toast.success("Doctor ready. Please complete doctor registration");

  //     if (uid) {
  //       setUserId(uid);
  //       localStorage.setItem("USER_ID", uid);
  //       setDoctorModal(false);
  //       setDoctorformModal(true);

  //     }
  //   } catch (err) {
  //     console.error("Doctor create error:", err);
  //     toast.error("Something went wrong. Please try again");
  //   }
  // };




  // const handleDoctorinputchange = (e) => {
  //   const { name, value, type, checked, files } = e.target;

  //   if (doctorFormErrors[name]) {
  //     setDoctorFormErrors((prev) => ({
  //       ...prev,
  //       [name]: "",
  //     }));
  //   }


  //   if (type === "checkbox") {
  //     setDoctorform((prev) => ({
  //       ...prev,
  //       [name]: checked,
  //     }));
  //     return;
  //   }


  //   if (type === "file" && name === "profile_image") {
  //     setDoctorform((prev) => ({
  //       ...prev,
  //       profile_image: files && files.length > 0 ? files[0] : null,
  //     }));
  //     return;
  //   }


  //   if (name === "documentFile") {
  //     setDoctorform((prev) => ({
  //       ...prev,
  //       documentFile: files && files.length > 0 ? files[0] : null,
  //     }));
  //     return;
  //   }

  //   setDoctorform((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };


  // const handleDoctorDownload = () => {
  //   const exportData = Doctordata.map((d, index) => ({
  //     ID: index + 1,
  //     "First Name": d.first_name,
  //     "Last Name": d.last_name,
  //     "Phone Number": d.verified_phone_number,
  //     Email: d.email,
  //     "Consultation Fee (₹)": d.consultation_fee,
  //     Specialization: d.specializations?.map((s) => s.name).join(", "),
  //     Experience: d.experience_years,
  //     "Ayush Register Number": d.practice_license_number,
  //     Qualtification: d.qualification,
  //     Status: d.status,
  //     "Available To": d.available_from,
  //     "Available From": d.available_to,
  //     "Treatment": d.treatment_type,
  //     "Address": d.address_line,


  //   }));

  //   const ws = XLSX.utils.json_to_sheet(exportData)
  //   const colWidths = Object.keys(exportData[0] || {}).map((key) => ({ wch: key.length + 20 }));
  //   ws['!cols'] = colWidths;
  //   const wb = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(wb, ws, "Doctors");
  //   XLSX.writeFile(wb, "doctor_data.xlsx");
  // };



  // const fetchSpecialization = async () => {
  //   const token = sessionStorage.getItem("superadmin_token");

  //   try {
  //     const response = await fetch(`${BASE_URL}/healthcare/speciality/`, {
  //       method: "GET",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${token}`
  //       },
  //     });

  //     if (response.status === 401 || response.status === 403) {
  //       toast.error("Session expired. Please login again");
  //       sessionStorage.removeItem("superadmin_token");
  //       navigate("/login");
  //       return;
  //     }

  //     const data = await response.json();
  //     console.log("Fetched Specialities:", data);
  //     setSpecialities(data);

  //   } catch (error) {
  //     console.error("Error fetching specialities:", error);
  //     // toast.error("Failed to fetch specialities");
  //   }
  // };

  // const hasFetchedSpecialization = useRef(false);

  // useEffect(() => {
  //   if (!hasFetchedSpecialization.current) {
  //     fetchSpecialization();
  //     hasFetchedSpecialization.current = true;
  //   }
  // }, []);




  // const handleSelection = () => {
  //   setDropdownOpen(!dropdownOpen);
  // }


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
            <FaUsers size={24} />
          </div>
          <div className="stat2-info">
            <h3>Total Doctors</h3>
            <div className="stat2-value"> 0</div>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={24} />
          </div>
          <div className="stat2-info">
            <h3>Approved Doctors</h3>
            <div className="stat2-value">{doctorStats?.approved_doctors || 0}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={24} />
          </div>
          <div className="stat2-info">
            <h3>Pending Approval</h3>
            <div className="stat2-value">{doctorStats?.pending_doctors || 0}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
            <FaUsers size={24} />
          </div>
          <div className="stat2-info">
            <h3>Rejected Doctors</h3>
            <div className="stat2-value">{doctorStats?.rejected_doctors || 0}</div>
          </div>
        </div>
      </div>

      <div className="controls-section">
        <div className="search-wrapper">
          <BsSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search doctor by name or specialization..."
            value={doctorsearch}
            onChange={(e) => setDoctorsearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="action-buttons">
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

 
  {/* <td style={{ textAlign: "center" }}>
    <FiFileText
      size={20}
      color="#0D614E"
      onClick={() => openDocumentModal(item)}
      style={{ cursor: "pointer" }}
    />
  </td> */}


  <td
    style={{ position: "relative" }}
    onClick={(e) => e.stopPropagation()}
  >
    <button
      className="action-menu-toggle"
      onClick={() =>
        setOpenthreedotId(
          OpenthreedotId === item.id ? null : item.id
        )
      }
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontSize: "20px",
      }}
    >
      <span className="icon">
        <BsThreeDotsVertical />
      </span>
    </button>

    {OpenthreedotId === item.id && (
      <div className="action-buttons-modal">

        
          <button
            className="action-btn1"
            title="Detail Page"
            onClick={() => handleNavigateDoctor(item.id)}
          >
            <span className="icon">
              <FaEye />
            </span>
            <span>Detail Page</span>
          </button>
        

       
        {/* <button
          className="action-btn1"
          title="Edit Doctor Details"
          onClick={() => {
            setDoctorform({
              profile_image: item.profile_image || "",
              first_name: item.first_name || "",
              last_name: item.last_name || "",
              email: item.email || "",
              experience_years: item.experience_years || "",
              consultation_fee: item.consultation_fee || "",
              qualification: item.qualification || "",
              practice_license_number:
                item.registration_number || "",
            });

            setEditingDoctorId(item.id);
            setDoctorformModal(true);
          }}
        >
          <span className="icon">
            <FaEdit />
          </span>
          <span>Edit Detail</span>
        </button>

        <button
          className="action-btn1"
          title="Delete"
          onClick={() => {
            setSelectedDoctorId(item.id);
            setDeleteConfirmModal(true);
          }}
        >
          <span className="icon-delete">
            <FiTrash2 />
          </span>
          <span className="delete-text">Delete</span>
        </button> */}
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
             onClick={() => getdoctorlist(currentpage - 1)}
              disabled={!previousPage}
            >
              Prev
            </button>


            {pages.map((page) => (
              <button
                key={page}
                onClick={() => getdoctorlist(page)}
                style={{

                  fontWeight: currentpage === page ? "bold" : "normal",
                  background: currentpage === page ? "#0D614E" : "#fff",
                  color: currentpage === page ? "#fff" : "#0D614E",
                }}
              >
                {page}
              </button>
            ))}


            <button
              onClick={() => getdoctorlist(currentpage + 1)}
              disabled={!Nextpage}
            >
              Next
            </button>

          </div>
        )}

      </div>


      {/* {DoctorModal && (
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
      )} */}



      {/* {DoctorformModal && (
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
                  {doctorFormErrors.first_name && (
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
                  {doctorFormErrors.last_name && (
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
                      background: "#0D614E",
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
                      background: "#0D614E",
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
      )} */}
      {/* {AddSpeciality && (
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
      )} */}

      {/* {deleteConfirmModal && (
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
      )} */}

      {/* {openModal && (
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
      )} */}


       {ImageModal && (
        <div className="image-preview-overlay" onClick={() => setImageModal(false)}>
          <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Preview" />

          </div>
        </div>
      )}

{approvedoctorModal && (
  <div className="confirm-overlay">
    <div className="confirm-modal">

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
  <div className="confirm-overlay">
    <div className="reason-modal modern-reason-modal">

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
  className="reason-box"
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

       {/* {showReasonModal && (
        <div className=" modal">

          <form className="customer-form">
            <h3>
              {selectedStatus === "rejected"
                ? "Enter Rejected Reason"
                : "Enter Suspended Reason"}
            </h3>
            <textarea
              value={rejectReason}
              placeholder={
                selectedStatus === "rejected"
                  ? "Enter the reason for rejection..."
                  : "Enter the reason for suspension..."
              }
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="form-buttons">
              <button onClick={submitRejection} type="submit">   Submit  </button>
              <button type="button" onClick={() => setShowReasonModal(false)}> Cancel </button>
            </div>

          </form>
        </div>

      )}  */}
      </>
  )
}

export default Doctor



