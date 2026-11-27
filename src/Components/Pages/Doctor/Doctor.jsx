
import * as XLSX from "xlsx";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../../../Base";

import { FiFileText, FiTrash2 } from "react-icons/fi";
import {
  BsDownload,
  BsPlus,
  BsSearch,
  BsThreeDotsVertical,
} from "react-icons/bs";
import { FaTrash, FaUsers, FaEdit, FaEye, FaCheckCircle } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";

import Calender from "./Calendar";
import AddDoctorSlots from "./AddDoctorSlots";

const initialDoctorForm = {
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
};

const Doctor = () => {
  const navigate = useNavigate();

  // Search and filters
  const [doctorsearch, setDoctorsearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [specializationfilter, setSpecilizationfilter] = useState("All");

  // Doctor data
  const [Doctordata, setDoctorData] = useState([]);
  const [allDoctorData, setAllDoctorData] = useState([]);
  const [viewDoctor, setViewDoctor] = useState(null);

  // Loading and errors
  const [Loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination
  const pagesize = 10;
  const [totalCount, setTotalCount] = useState(0);
  const [currentpage, setCurrentPage] = useState(1);
  const [Nextpage, setNextpage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);

  const totalPages = Math.ceil(totalCount / pagesize);

  // Modals
  const [DoctorModal, setDoctorModal] = useState(false);
  const [verifiedDoctorModal, setVerifiedDoctorModal] = useState(false);
  const [DoctorformModal, setDoctorformModal] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [AddSpeciality, setAddspecialityform] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [approvedoctorModal, setDoctorApproveModal] = useState(false);
  const [RejectionDoctorModal, setRejectionDoctorModal] = useState(false);
  const [sequenceModal, setSequenceModal] = useState(false);
  const [ImageModal, setImageModal] = useState(false);

  // Doctor form
  const [Doctorform, setDoctorform] = useState(initialDoctorForm);
  const [EditingDoctorId, setEditingDoctorId] = useState(null);
  const [doctorFormErrors, setDoctorFormErrors] = useState({});
  const [specialities, setSpecialities] = useState([]);
  const [spec, setSpecs] = useState([]);
  const [newSpecilization, setNewSpecilization] = useState("");
  const [treatmentTypes, setTreatmentTypes] = useState([]);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // Phone and OTP
  const [phonenumber, setPhonenumber] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [phoneErrors, setPhoneErrors] = useState({});
  const [otpErrors, setOtpErrors] = useState({});
  const otpRefs = useRef([]);
const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  // Selected records
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedSequenceDoctor, setSelectedSequenceDoctor] = useState(null);

  // Status
  const [rejectReason, setRejectReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isApproving, setIsApproving] = useState(false);

  // Sequence
  const [newSequence, setNewSequence] = useState("");
  const [isUpdatingSequence, setIsUpdatingSequence] = useState(false);

  // Other
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [userId, setUserId] = useState("");

  const doctortableRef = useRef(null);
  const modalRef = useRef(null);
  const searchDebounceRef = useRef(null);

  const [doctorStats, setdoctorStats] = useState({
    doctors: 0,
    approved: 0,
    pending: 0,
    suspended: 0,
    rejected: 0,
  });

  const documentOptions = [
    {
      value: "highest_qualification_certificate",
      label: "Highest Qualification Marksheet",
    },
    {
      value: "registration_certificate",
      label: "Ayush Registration Certificate",
    },
    {
      value: "other_certificate",
      label: "Government ID Proof",
    },
  ];

  const [OpenthreedotId, setOpenthreedotId] = useState(null);

  // Pagination helper - same as Vendor
  const getPaginationItems = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentpage <= 3) {
      return [1, 2, 3, "...", totalPages];
    }

    if (currentpage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentpage - 1,
      currentpage,
      currentpage + 1,
      "...",
      totalPages,
    ];
  };

  const paginationItems = getPaginationItems();

  const handleNavigateDoctor = (id) => {
    navigate(`/DoctorDetail/${id}`);
  };

  const handleApproveClick = (doctor) => {
    setSelectedDoctorId(doctor.id);
    setSelectedDoctor(doctor);
    setDoctorApproveModal(true);
  };

  const handleRejectClick = (doctor, statusType) => {
    setSelectedDoctorId(doctor.id);
    setSelectedStatus(statusType);
    setSelectedDoctor(doctor);
    setRejectionDoctorModal(true);
  };

  const handleSequenceClick = (doctor) => {
    setSelectedSequenceDoctor(doctor);
    setNewSequence(doctor.sequence ?? "");
    setSequenceModal(true);
  };

  const validatePhoneNumber = (phone) => {
    const errors = {};

    if (!phone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      errors.phone = "Phone number must be exactly 10 digits";
    } else if (phone.startsWith("0")) {
      errors.phone = "Phone number should not start with 0";
    } else if (!/^[6-9]/.test(phone)) {
      errors.phone = "Phone number should start with 6, 7, 8, or 9";
    }

    return errors;
  };

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
      errors.last_name = "Last name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.last_name.trim())) {
      errors.last_name = "Last name can only contain letters and spaces";
    } else if (formData.last_name.trim().length < 2) {
      errors.last_name = "Last name must be at least 2 characters";
    } else if (formData.last_name.trim().length > 50) {
      errors.last_name = "Last name should not exceed 50 characters";
    }

    if (!formData?.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData?.consultation_fee) {
      errors.consultation_fee = "Consultation fee is required";
    } else if (isNaN(formData.consultation_fee)) {
      errors.consultation_fee = "Consultation fee must be a valid number";
    } else if (Number.parseFloat(formData.consultation_fee) <= 0) {
      errors.consultation_fee = "Consultation fee must be greater than 0";
    } else if (Number.parseFloat(formData.consultation_fee) > 10000) {
      errors.consultation_fee = "Consultation fee should not exceed ₹10,000";
    }

    if (!formData?.experience_years) {
      errors.experience_years = "Experience is required";
    } else if (isNaN(formData.experience_years)) {
      errors.experience_years = "Experience must be a valid number";
    } else if (Number.parseInt(formData.experience_years) < 0) {
      errors.experience_years = "Experience cannot be negative";
    } else if (Number.parseInt(formData.experience_years) > 60) {
      errors.experience_years = "Experience should not exceed 60 years";
    }

    if (!formData?.specialization_ids?.length) {
      errors.specialization_ids = "Please select a specialization";
    }

    if (!formData.practice_license_number?.trim()) {
      errors.practice_license_number = "Practice License Number is Required";
    } else if (!/^\d+$/.test(formData.practice_license_number.trim())) {
      errors.practice_license_number = "Registration number must contain only numbers";
    }

    if (!formData.qualification?.trim()) {
      errors.qualification = "Qualification is required";
    } else if (!/^[A-Za-z.\s]+$/.test(formData.qualification.trim())) {
      errors.qualification = "Qualification can only contain alphabets, spaces, and dots";
    }

    if (!formData?.available_from) {
      errors.available_from = "Available from time is required";
    }

    if (!formData?.available_to) {
      errors.available_to = "Available to time is required";
    }

    if (
      formData?.available_from &&
      formData?.available_to &&
      formData.available_from >= formData.available_to
    ) {
      errors.available_to = "Available to time must be after available from time";
    }

    return errors;
  };

  const clearAllErrors = () => {
    setPhoneErrors({});
    setOtpErrors({});
    setDoctorFormErrors({});
  };

  const handleRemoveDocument = (type) => {
    setUploadedDocs((prev) => prev.filter((doc) => doc.type !== type));
    toast.info("Document removed successfully");
  };

  const clearDoctorForm = () => {
    setDoctorform(initialDoctorForm);
    setPhonenumber("");
    setOtpDigits(["", "", "", ""]);
    setSpecs([]);
    setEditingDoctorId(null);
  };

  const openDocumentModal = (doctor) => {
    setOpenModal(true);
    setSelectedDoctor(doctor);
  };

  const getInitials = (firstName, lastName) => {
    const cleanFirstName = (firstName || "")
      .toString()
      .replace(/^dr\.?\s*/i, "")
      .trim();

    const firstInitial = cleanFirstName.charAt(0)?.toUpperCase() || "";
    const lastInitial = (lastName || "").toString().charAt(0)?.toUpperCase() || "";

    return `${firstInitial}${lastInitial}` || "?";
  };

  // Get doctor list
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
    setError("");

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
 
const handleSaveDoctorSlots = async (payload) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    sessionStorage.removeItem("superadmin_token");
    navigate("/login");
    return;
  }

  if (!selectedDoctor?.id) {
    toast.error("Doctor ID not found");
    return;
  }

  try {
    const response = await fetch(
      `${BASE_URL}/doctors/admin/availability/?doctor_id=${selectedDoctor.id}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    if (!response.ok || data.success === false) {
      toast.error(data.message || "Failed to add doctor slots");
      throw new Error(data.message || "Failed to add doctor slots");
    }

    toast.success(data.message || "Doctor slots added successfully!");

    setShowAddSlotModal(false);
    setSelectedDoctor(null);

    return data;

  } catch (error) {
    console.error("Save Doctor Slots Error:", error);

    if (error.message !== "Failed to add doctor slots" &&
        error.message !== "Doctor ID not found") {
      toast.error("Something went wrong while saving slots.");
    }

    throw error;
  }
};


  // Search and status filter - single debounced API effect
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      getdoctorlist(1, doctorsearch, statusFilter);
    }, 500);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [doctorsearch, statusFilter]);

  // Dietician toggle
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

      setDoctorData((prev) =>
        prev.map((item) =>
          item.id === doctor.id
            ? { ...item, is_dietitian: newDieticianStatus }
            : item
        )
      );

      setOpenthreedotId(null);

      toast.success(
        newDieticianStatus
          ? "Doctor added as Dietician successfully"
          : "Doctor removed as Dietician successfully"
      );
    } catch (error) {
      console.error("Dietician toggle error:", error);
      toast.error(error.message || "Something went wrong while updating Dietician");
    }
  };

  // Update sequence
  const handleUpdateSequence = async () => {
    if (newSequence === "" || Number(newSequence) < 0) {
      toast.error("Please enter a valid sequence");
      return;
    }

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setIsUpdatingSequence(true);

    try {
      const response = await fetch(
        `${BASE_URL}/doctors/admin/doctor/?id=${selectedSequenceDoctor.id}`,
        {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            sequence: Number(newSequence),
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
        throw new Error(data?.message || "Failed to update sequence");
      }

      setDoctorData((prev) =>
        prev.map((doctor) =>
          doctor.id === selectedSequenceDoctor.id
            ? { ...doctor, sequence: Number(newSequence) }
            : doctor
        )
      );

      toast.success("Doctor sequence updated successfully");

      setSequenceModal(false);
      setSelectedSequenceDoctor(null);
      setNewSequence("");
    } catch (error) {
      console.error("Update sequence error:", error);
      toast.error(error.message || "Failed to update sequence");
    } finally {
      setIsUpdatingSequence(false);
    }
  };

  // Update doctor status
  const handleStatusChange = async (doctorId, newStatus, reason = "") => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return false;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/doctors/admin/doctor/status/`,
        {
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
            reason,
          }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        toast.error("Session expired. Please login again");
        navigate("/login");
        return false;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update status");
      }

      setDoctorData((prev) =>
        prev.map((doctor) =>
          doctor.id === doctorId
            ? { ...doctor, approval_status: newStatus }
            : doctor
        )
      );

      toast.success(`Doctor ${newStatus} successfully`);
      return true;
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error updating Doctor status");
      return false;
    }
  };

  const submitRejection = async (e) => {
    e.preventDefault();

    const success = await handleStatusChange(
      selectedDoctorId,
      selectedStatus,
      rejectReason
    );

    if (success) {
      setRejectionDoctorModal(false);
      setRejectReason("");
      setSelectedDoctorId(null);
      setSelectedStatus("");
    }
  };

  // Clear all filters
  const clearDoctorFilters = () => {
    setDoctorsearch("");
    setStatusFilter("All");
    setCurrentPage(1);
    setOpenthreedotId(null);
  };
  const handleAddSlot = (item) => {
  setSelectedDoctor(item);
  setShowAddSlotModal(true);
};

  // Pagination navigation
  const handlePageChange = (page) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentpage ||
      Loading
    ) {
      return;
    }

    getdoctorlist(page, doctorsearch, statusFilter);
  };

  const startItem =
    totalCount === 0 ? 0 : (currentpage - 1) * pagesize + 1;

  const endItem = Math.min(currentpage * pagesize, totalCount);

  return (
    <>
      <div className="page-header">
        <h1>Doctor Management</h1>
        <p className="page-paragraph">
          Manage Doctor, details and their Approvals
        </p>
      </div>

      <div className="vendors-stats stats2-grid">
        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaUsers size={12} />
          </div>
          <div className="stat2-info">
            <h3>Total Doctors</h3>
            <div className="stat2-value">
              {doctorStats?.doctors || 0}
            </div>
          </div>
        </div>

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaUsers size={12} />
          </div>
          <div className="stat2-info">
            <h3>Approved Doctors</h3>
            <div className="stat2-value">
              {doctorStats?.approved || 0}
            </div>
          </div>
        </div>

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaUsers size={12} />
          </div>
          <div className="stat2-info">
            <h3>Pending Approval</h3>
            <div className="stat2-value">
              {doctorStats?.pending || 0}
            </div>
          </div>
        </div>

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaUsers size={12} />
          </div>
          <div className="stat2-info">
            <h3>Rejected Doctors</h3>
            <div className="stat2-value">
              {doctorStats?.rejected || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <BsSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search doctors by name, email, or phone..."
              value={doctorsearch}
              onChange={(e) => {
                setDoctorsearch(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />

            {doctorsearch && (
              <button
                type="button"
                className="clear-search"
                onClick={() => {
                  setDoctorsearch("");
                  setCurrentPage(1);
                }}
                title="Clear Search"
              >
                <IoClose />
              </button>
            )}
          </div>

          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>

          {(doctorsearch || statusFilter !== "All") && (
            <button
              type="button"
              className="clear-filters-btn"
              title="Clear Filters"
              onClick={clearDoctorFilters}
            >
              <FiTrash2 />
            </button>
          )}
        </div>
      </div>

      {/* Doctor Table */}
      <div className="table-wrapper">
        <table className="data-table" ref={doctortableRef}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Fees</th>
              <th>Qualification</th>
              <th>Specialization</th>
              <th>Experience</th>
              <th>Sequence</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {Loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td colSpan="12">
                      <div className="skeleton-row"></div>
                    </td>
                  </tr>
                ))
            ) : error ? (
              <tr>
                <td colSpan="12" style={{ color: "red" }}>
                  {error}
                </td>
              </tr>
            ) : Doctordata.length > 0 ? (
              Doctordata.map((item, index) => (
                <tr key={item.id}>
                  <td>{(currentpage - 1) * pagesize + index + 1}</td>

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
                          {getInitials(
                            item.first_name,
                            item.last_name
                          )}
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
                  <td>{item.verified_phone_number || "NA"}</td>

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
                  <td>{item.qualification || "NA"}</td>

                  <td>
                    {item.specializations?.length > 0
                      ? item.specializations
                          .map((s) => s.name)
                          .join(", ")
                      : "NA"}
                  </td>

                  <td>{item.experience_years || 0} years</td>
                  <td>{item.sequence ?? 0}</td>

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

    {/* Detail Page */}
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

    {/* Edit Profile - NEW */}
    <button
      className="action-btn1"
      title="Edit Profile"
      onClick={() => {
        setOpenthreedotId(null);
        navigate(`/Doctor/edit/${item.id}`, {
          state: { doctor: item },
        });
      }}
    >
      <span className="icon">
        <FaEdit />
      </span>
      <span>Edit Profile</span>
    </button>

    {/* Dietician Toggle */}
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

    {/* Update Sequence */}
    <button
      className="action-btn1"
      title="Update Sequence"
      onClick={() => {
        setOpenthreedotId(null);
        handleSequenceClick(item);
      }}
    >
      <span className="icon">
        <FaEdit />
      </span>
      <span>Update Sequence</span>
    </button>
    {/* Add Slot */}
<button
  className="action-btn1"
  title="Add Slot"
  onClick={() => {
    setOpenthreedotId(null);
    handleAddSlot(item);
  }}
>
  <span className="icon">
    <FaPlus />
  </span>
  <span>Add Slot</span>
</button>

  </div>
)}

                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="12" style={{ textAlign: "center" }}>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>

       
      {/* Order-style Pagination */}
{totalCount > 0 && (
  <div className="order-pagination-container">

    <div className="order-pagination-info">
      Showing{" "}
      <strong>{startItem}</strong>{" "}
      to{" "}
      <strong>{endItem}</strong>{" "}
      of <strong>{totalCount}</strong> doctors
    </div>

    {totalPages > 1 && (
      <div className="order-pagination-buttons">

        {/* PREVIOUS */}
        <button
          type="button"
          className="order-pagination-btn order-pagination-arrow"
          disabled={!previousPage || Loading}
          onClick={() => handlePageChange(currentpage - 1)}
          title="Previous Page"
        >
          ‹
        </button>

        {/* FIRST PAGE */}
        <button
          type="button"
          className={`order-pagination-btn ${
            currentpage === 1 ? "order-pagination-active" : ""
          }`}
          disabled={Loading}
          onClick={() => handlePageChange(1)}
        >
          1
        </button>

        {/* LEFT DOTS */}
        {currentpage > 3 && (
          <span className="order-pagination-dots">...</span>
        )}

        {/* MIDDLE PAGES */}
        {Array.from(
          { length: totalPages },
          (_, index) => index + 1
        )
          .filter(
            (page) =>
              page !== 1 &&
              page !== totalPages &&
              page >= currentpage - 1 &&
              page <= currentpage + 1
          )
          .map((page) => (
            <button
              type="button"
              key={page}
              className={`order-pagination-btn ${
                currentpage === page ? "order-pagination-active" : ""
              }`}
              disabled={Loading}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}

        {/* RIGHT DOTS */}
        {currentpage < totalPages - 2 && (
          <span className="order-pagination-dots">...</span>
        )}

        {/* LAST PAGE */}
        {totalPages > 1 && (
          <button
            type="button"
            className={`order-pagination-btn ${
              currentpage === totalPages ? "order-pagination-active" : ""
            }`}
            disabled={Loading}
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </button>
        )}

        {/* NEXT */}
        <button
          type="button"
          className="order-pagination-btn order-pagination-arrow"
          disabled={!Nextpage || Loading}
          onClick={() => handlePageChange(currentpage + 1)}
          title="Next Page"
        >
          ›
        </button>

      </div>
    )}
  </div>
)}
      </div>

      {/* Image Preview */}
      {ImageModal && (
        <div
          className="image-preview-overlay"
          onClick={() => setImageModal(false)}
        >
          <div
            className="image-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewImage} alt="Preview" />
          </div>
        </div>
      )}

      {/* Approve Doctor Modal */}
      {approvedoctorModal && (
        <div
          className="confirm-overlay"
          onClick={() => {
            setDoctorApproveModal(false);
            setSelectedDoctorId(null);
            setSelectedDoctor(null);
          }}
        >
          <div
            className="confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="closes-modal"
              onClick={() => {
                setDoctorApproveModal(false);
                setSelectedDoctorId(null);
                setSelectedDoctor(null);
              }}
            >
              <IoClose />
            </button>

            <div className="approval-icon-wrapper">
              <FaCheckCircle className="approval-icon" />
            </div>

            <h2 className="confirm-title">Approve Doctor</h2>

            <p className="confirm-description">
              Are you sure you want to approve this doctor?
            </p>

            <div className="vendor-info-card">
              <div className="vendor-row">
                <span className="label">Doctor Name</span>
                <span className="value approve-text">
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

            {!selectedDoctor?.policies_accepted && (
              <div className="policy-warning">
                <span className="policy-warning-icon">i</span>
                <span>
                  Doctor has not accepted the policy yet. Please ask the
                  doctor to accept the policy before approval.
                </span>
              </div>
            )}

            <div className="confirm-buttons">
              <button
                className="cancels-btn"
                onClick={() => {
                  setDoctorApproveModal(false);
                  setSelectedDoctorId(null);
                  setSelectedDoctor(null);
                }}
              >
                Cancel
              </button>

              <button
                className={`approve-btn ${
                  isApproving || !selectedDoctor?.policies_accepted
                    ? "approve-btn-disabled"
                    : ""
                }`}
                disabled={
                  isApproving || !selectedDoctor?.policies_accepted
                }
                onClick={async () => {
                  if (
                    isApproving ||
                    !selectedDoctor?.policies_accepted
                  ) {
                    return;
                  }

                  setIsApproving(true);

                  try {
                    const success = await handleStatusChange(
                      selectedDoctorId,
                      "approved"
                    );

                    if (success) {
                      setDoctorApproveModal(false);
                      setSelectedDoctorId(null);
                      setSelectedDoctor(null);
                    }
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

      {/* Reject / Suspend Modal */}
      {RejectionDoctorModal && (
        <div
          className="confirm-overlay"
          onClick={() => {
            setRejectionDoctorModal(false);
            setRejectReason("");
          }}
        >
          <div
            className="reason-modal modern-reason-modal"
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

      {/* Sequence Modal */}
      {sequenceModal && (
        <div
          className="confirm-overlay"
          onClick={() => setSequenceModal(false)}
        >
          <div
            className="confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="closes-modal"
              onClick={() => setSequenceModal(false)}
            >
              <IoClose />
            </button>

            <div className="sequence-icon-wrapper">
              <FaEdit className="sequence-modal-icon" />
            </div>

            <h2 className="confirm-title">
              Update Doctor Sequence
            </h2>

            <p className="confirm-description">
              Update the display sequence of this doctor.
            </p>

            <div className="vendor-info-card">
              <div className="vendor-row">
                <span className="label">Doctor Name</span>
                <span className="value">
                  {selectedSequenceDoctor?.first_name}{" "}
                  {selectedSequenceDoctor?.last_name}
                </span>
              </div>
            </div>

            <div className="reason-field">
              <label>
                Sequence <span>*</span>
              </label>

              <input
                type="number"
                min="0"
                className="sequence-input"
                value={newSequence}
                onChange={(e) => setNewSequence(e.target.value)}
                placeholder="Enter sequence"
              />
            </div>

            <div className="confirm-buttons">
              <button
                className="cancels-btn"
                onClick={() => setSequenceModal(false)}
                disabled={isUpdatingSequence}
              >
                Cancel
              </button>

              <button
                className="approve-btn"
                onClick={handleUpdateSequence}
                disabled={isUpdatingSequence}
              >
                {isUpdatingSequence ? "Updating..." : "Update Sequence"}
              </button>
            </div>
          </div>
        </div>
      )}
{showAddSlotModal && (
  <AddDoctorSlots
    doctor={selectedDoctor}
    onClose={() => {
      setShowAddSlotModal(false);
      setSelectedDoctor(null);
    }}
    onSave={handleSaveDoctorSlots}
  />
)}

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
};

export default Doctor;
