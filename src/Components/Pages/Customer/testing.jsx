import * as XLSX from "xlsx";
 import { useState, useEffect, useRef, useCallback } from "react";
 import { useNavigate } from "react-router-dom";
 import { toast } from 'react-toastify';
 import BASE_URL from "../../../Base";
 import { apiFetch } from "../../../fetchapi";
 import { BsThreeDotsVertical, BsDownload, BsPlus, BsSearch, BsTrash, BsPencil, BsEye, BsChevronLeft, BsChevronRight } from "react-icons/bs";
 import { FaUsers, FaUserPlus, FaCalendarAlt, FaChartLine } from "react-icons/fa";
 import { MdEmail, MdPhone, MdPerson, MdClose, MdVerified } from "react-icons/md";
 import { RiGenderlessLine } from "react-icons/ri";
import "./Customer.css"

 const userId = localStorage.getItem("USER_ID");

const initialCustomerFormState = {
    profile_picture: "",
    first_name: "",
    email: "",
    verified_phone_number: "",
    gender: "",
};

const initialFormErrors = {
    first_name: "",
    email: "",
    verified_phone_number: "",
    otp: "",
    gender: "",
};

const Testing = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [customerData, setCustomerData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [customerForm, setCustomerForm] = useState(initialCustomerFormState);
    const [editingCustomerId, setEditingCustomerId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const navigate = useNavigate();
    const [formErrors, setFormErrors] = useState(initialFormErrors);
    const [phoneFormErrors, setPhoneFormErrors] = useState({ verified_phone_number: "" });
    const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const bulktableRef = useRef(null);
    const [thisMonthCount, setThisMonthCount] = useState(0);
    const [thisYearCount, setThisYearCount] = useState(0);
    const [imagePreviewModal, setImagePreviewModal] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const pageSize = 5;
    const totalPages = Math.ceil(totalCount / pageSize);

    const validateCustomerForm = () => {
        const errors = {};
        if (!customerForm.first_name.trim()) {
            errors.first_name = "First name is required";
        } else if (!/^[A-Z][a-zA-Z\s]*$/.test(customerForm.first_name)) {
            errors.first_name = "First name should start with a capital letter and contain only letters and spaces";
        }
        if (!customerForm.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email)) {
            errors.email = "Please enter a valid email address";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePhoneForm = () => {
        const errors = {};
        if (!customerForm.verified_phone_number.trim()) {
            errors.verified_phone_number = "Phone number is required";
        } else if (!/^\d{10}$/.test(customerForm.verified_phone_number)) {
            errors.verified_phone_number = "Phone number must be 10 digits";
        }
        setPhoneFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingCustomerId(null);
        setCustomerForm(initialCustomerFormState);
        setFormErrors(initialFormErrors);
    };

    const handleDownload = () => {
        const exportData = customerData.map((c) => ({
            Name: c.first_name,
            Email: c.email,
            "Phone Number": c.verified_phone_number,
            Gender: c.gender || "Not specified",
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Customers");
        XLSX.writeFile(wb, `Customers_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("Export successful!");
    };

    const handleNavigate = (id) => {
        navigate(`/CustomerDetailPage/${id}`);
    };

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        if (!validatePhoneForm()) return;

        try {
            const token = sessionStorage.getItem("superadmin_token");
            const payload = {
                phone_number: `+91${customerForm.verified_phone_number}`,
                role: "customer",
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
                toast.error(data?.error || "Failed to create customer");
                return;
            }

            const uid = data?.user?.id;
            toast.success("Customer created! Please complete registration");
            if (uid) {
                localStorage.setItem("USER_ID", uid);
                setOtpVerified(false);
                setModalOpen(true);
            }
        } catch (err) {
            console.error("Customer create error:", err);
            toast.error("Something went wrong. Please try again");
        }
    };

    const handleCustomerDelete = async (id) => {
        try {
            const response = await apiFetch(`${BASE_URL}/customers/customer/${id}/`, {
                method: "DELETE",
            });
            if (!response) return;
            toast.success("Customer deleted successfully");
            getCustomerList(currentPage, searchTerm);
            setDeleteConfirmModal(false);
        } catch (err) {
            console.error("Delete Error:", err);
            toast.error("Failed to delete customer");
        }
    };

    const handleCustomerFormSubmit = async (e) => {
        e.preventDefault();
        if (!validateCustomerForm()) return;

        const method = editingCustomerId ? "PUT" : "POST";
        const url = editingCustomerId
            ? `${BASE_URL}/customers/customer/${editingCustomerId}/`
            : `${BASE_URL}/customers/customer/`;

        const formData = new FormData();
        if (method === "POST") {
            const uid = localStorage.getItem("USER_ID");
            if (uid) formData.append("user", uid);
        }
        Object.entries(customerForm).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });

        try {
            const data = await apiFetch(url, { method, body: formData, headers: {} });
            if (!data) return;
            toast.success(editingCustomerId ? "Customer updated successfully" : "Customer added successfully");
            handleCloseModal();
            getCustomerList(currentPage, searchTerm);
        } catch (err) {
            console.error("Customer save error:", err);
            toast.error("Failed to save customer");
        }
    };

    const getInitials = (firstName = "") => {
        return (firstName?.[0] || "?").toUpperCase();
    };

    const handleCustomerFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCustomerForm((prev) => ({ ...prev, profile_picture: file }));
        }
    };

    const handleCustomerInputChange = (e) => {
        const { name, value } = e.target;
        let updatedValue = value;
        if (name === "verified_phone_number") {
            updatedValue = value.replace(/\D/g, "").slice(0, 10);
        }
        setCustomerForm((prev) => ({ ...prev, [name]: updatedValue }));
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
        if (phoneFormErrors[name]) setPhoneFormErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const getCustomerList = useCallback(async (page = 1, search = "") => {
        const token = sessionStorage.getItem("superadmin_token");
        if (!token) {
            toast.error("Session expired. Please login again");
            navigate("/login");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${BASE_URL}/customers/customer/?page=${page}&page_size=${pageSize}&search=${search}`,
                {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
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
            setCustomerData(data.data || []);
            setTotalCount(data.count || 0);
            setNextPage(data.next);
            setPreviousPage(data.previous);
            setCurrentPage(page);
            setThisMonthCount(data.this_month_count || 0);
            setThisYearCount(data.this_year_count || 0);
        } catch (err) {
            console.error("Customer Fetch Error:", err);
            setError("Something went wrong while fetching data.");
            toast.error("Failed to fetch customer data");
        } finally {
            setLoading(false);
        }
    }, [navigate, pageSize]);

    useEffect(() => {
        const delay = setTimeout(() => {
            getCustomerList(1, searchTerm);
        }, 300);
        return () => clearTimeout(delay);
    }, [searchTerm, getCustomerList]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div className="customers-container">
            {/* Header Section */}
            <div className="customers-header">
                <div className="header-content">
                    <h1 className="page-title">Customers</h1>
                    <p className="page-subtitle">Manage and track all your customer information</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card" style={{ borderTopColor: "#0D614E" }}>
                    <div className="stat-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                        <FaUsers size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Total Customers</h3>
                        <div className="stat-value">{totalCount.toLocaleString()}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderTopColor: "#0D614E" }}>
                    <div className="stat-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                        <FaChartLine size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>This Year</h3>
                        <div className="stat-value">{thisYearCount.toLocaleString()}</div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderTopColor: "#0D614E" }}>
                    <div className="stat-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                        <FaCalendarAlt size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>This Month</h3>
                        <div className="stat-value">{thisMonthCount.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Controls Section */}
            <div className="controls-section">
                <div className="search-wrapper">
                    <BsSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search customers by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="action-buttons">
                    <button
                        className="btn-primary"
                        onClick={() => {
                            setOtpVerified(true);
                            setCustomerForm(initialCustomerFormState);
                        }}
                    >
                        <BsPlus size={18} />
                        Add Customer
                    </button>
                    <button className="btn-secondary" onClick={handleDownload}>
                        <BsDownload size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-container">
                <div className="table-wrapper">
                    <table className="customers-table">
                        <thead>
                            <tr>
                                <th>Profile</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Gender</th>
                                <th style={{ width: "80px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="6">
                                            <div className="skeleton-row">
                                                <div className="skeleton-avatar"></div>
                                                <div className="skeleton-line"></div>
                                                <div className="skeleton-line"></div>
                                                <div className="skeleton-line"></div>
                                                <div className="skeleton-line"></div>
                                                <div className="skeleton-line"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan="6" className="error-message">{error}</td>
                                </tr>
                            ) : customerData.length > 0 ? (
                                customerData.map((customer) => (
                                    <tr key={customer.id}>
                                        <td>
                                            <div className="customer-avatar" onClick={() => {
                                                if (customer.profile_picture) {
                                                    setImagePreviewUrl(customer.profile_picture);
                                                    setImagePreviewModal(true);
                                                }
                                            }}>
                                                {customer.profile_picture ? (
                                                    <img src={customer.profile_picture} alt={customer.first_name} />
                                                ) : (
                                                    <div className="avatar-placeholder" style={{ background: "#0D614E" }}>
                                                        {getInitials(customer.first_name)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="customer-name">{customer.first_name}</div>
                                        </td>
                                        <td>
                                            <div className="customer-email">
                                                <MdEmail size={14} />
                                                <span>{customer.email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="customer-phone">
                                                <MdPhone size={14} />
                                                <span>{customer.verified_phone_number}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="customer-gender">
                                                <RiGenderlessLine size={14} />
                                                <span>{customer.gender || "Not specified"}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-dropdown" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="menu-trigger"
                                                    onClick={() => setOpenMenuId(openMenuId === customer.id ? null : customer.id)}
                                                >
                                                    <BsThreeDotsVertical />
                                                </button>
                                                {openMenuId === customer.id && (
                                                    <div className="dropdown-menu">
                                                        <button onClick={() => handleNavigate(customer.id)}>
                                                            <BsEye size={14} />
                                                            View Details
                                                        </button>
                                                        <button onClick={() => {
                                                            setModalOpen(true);
                                                            setEditingCustomerId(customer.id);
                                                            setCustomerForm({
                                                                first_name: customer.first_name,
                                                                email: customer.email,
                                                                verified_phone_number: customer.verified_phone_number,
                                                                gender: customer.gender || "",
                                                            });
                                                            setOpenMenuId(null);
                                                        }}>
                                                            <BsPencil size={14} />
                                                            Edit
                                                        </button>
                                                        <button className="danger" onClick={() => {
                                                            setSelectedCustomerId(customer.id);
                                                            setDeleteConfirmModal(true);
                                                            setOpenMenuId(null);
                                                        }}>
                                                            <BsTrash size={14} />
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        <div className="empty-icon">👥</div>
                                        <p>No customers found</p>
                                        <button className="btn-primary small" onClick={() => {
                                            setOtpVerified(true);
                                            setCustomerForm(initialCustomerFormState);
                                        }}>
                                            Add your first customer
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => getCustomerList(currentPage - 1, searchTerm)}
                            disabled={!previousPage}
                            className="page-btn"
                        >
                            <BsChevronLeft size={14} />
                            Prev
                        </button>
                        <div className="page-numbers">
                            {Array(totalPages).fill(0).map((page, index = +1) => (
                                <button
                                    key={index}
                                    onClick={() => getCustomerList(index, searchTerm)}
                                    className={`page-number ${currentPage === index ? "active" : ""}`}
                                    style={currentPage === index ? { background: "#0D614E", color: "#fff" } : {}}
                                >
                                    {index}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => getCustomerList(currentPage + 1, searchTerm)}
                            disabled={!nextPage}
                            className="page-btn"
                        >
                            Next
                            <BsChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCustomerId ? "Edit Customer" : "Add New Customer"}</h2>
                            <button className="close-btn" onClick={handleCloseModal}>
                                <MdClose size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCustomerFormSubmit}>
                            <div className="form-group">
                                <label>Profile Picture</label>
                                <input type="file" name="profile_picture" onChange={handleCustomerFileChange} accept="image/*" />
                            </div>
                            <div className="form-group">
                                <label>First Name *</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    placeholder="Enter first name"
                                    value={customerForm.first_name}
                                    onChange={handleCustomerInputChange}
                                />
                                {formErrors.first_name && <span className="error-text">{formErrors.first_name}</span>}
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter email address"
                                    value={customerForm.email}
                                    onChange={handleCustomerInputChange}
                                />
                                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone Number {!editingCustomerId && "*"}</label>
                                    <input
                                        type="tel"
                                        name="verified_phone_number"
                                        readOnly={!!editingCustomerId}
                                        maxLength={10}
                                        placeholder="Enter 10-digit number"
                                        value={customerForm.verified_phone_number}
                                        onChange={handleCustomerInputChange}
                                    />
                                    {phoneFormErrors.verified_phone_number && <span className="error-text">{phoneFormErrors.verified_phone_number}</span>}
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select name="gender" value={customerForm.gender} onChange={handleCustomerInputChange}>
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Customer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Phone Number Modal */}
            {otpVerified && (
                <div className="modal-overlay" onClick={() => setOtpVerified(false)}>
                    <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Verify Phone Number</h2>
                            <button className="close-btn" onClick={() => setOtpVerified(false)}><MdClose size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateCustomer}>
                            <div className="form-group">
                                <label>Phone Number *</label>
                                <input
                                    type="tel"
                                    name="verified_phone_number"
                                    placeholder="Enter 10-digit mobile number"
                                    value={customerForm.verified_phone_number}
                                    onChange={handleCustomerInputChange}
                                    maxLength={10}
                                    autoFocus
                                />
                                {phoneFormErrors.verified_phone_number && <span className="error-text">{phoneFormErrors.verified_phone_number}</span>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setOtpVerified(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Create Customer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmModal && (
                <div className="modal-overlay" onClick={() => setDeleteConfirmModal(false)}>
                    <div className="modal-content confirm" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">🗑️</div>
                        <h3>Delete Customer</h3>
                        <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setDeleteConfirmModal(false)}>Cancel</button>
                            <button className="btn-danger" onClick={() => handleCustomerDelete(selectedCustomerId)}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {imagePreviewModal && (
                <div className="modal-overlay" onClick={() => setImagePreviewModal(false)}>
                    <div className="image-preview-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="close-preview" onClick={() => setImagePreviewModal(false)}><MdClose size={24} /></button>
                        <img src={imagePreviewUrl} alt="Customer preview" />
                    </div>
                </div>
            )}

            </div>
    );
};

export default Testing;


