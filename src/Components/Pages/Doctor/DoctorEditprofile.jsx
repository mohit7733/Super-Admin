
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaEye,
  FaCamera,
  FaUser,
  FaBriefcaseMedical,
  FaMapMarkerAlt,
  FaPhone,
  FaCheck,
  FaTimes,
  FaStethoscope,
} from "react-icons/fa";

import { ToastContainer,toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditProfile.css";
import BASE_URL from "../../../Base";

/* =========================
   FORM CONTEXT
========================= */

const DoctorFormContext = createContext(null);

/* =========================
   DEFAULT DOCTOR DATA
========================= */

const defaultDoctor = {
  title: "Dr.",
  first_name: "Pakodi",
  last_name: "Leal",
  dob: "1990-01-15",
  gender: "male",
  nationality: "Indian",
  bio: "Ayurveda physician",
  specialized_bio: [],
  languages_spoken: ["English", "Hindi"],
  email: "doctor@example.com",
  secondary_number: "9876543210",
  address_line: "12 MG Road",
  city: "Jaipur",
  state: "Rajasthan",
  pincode: "302001",
  country: "India",
  emergency_contact_name: "Ravi Sharma",
  emergency_contact_relation: "spouse",
  emergency_contact_phone: "9876543211",
  experience_years: "8.00",
  years_of_practice: "8.00",
  qualification: "BAMS",
  registration_number: "REG12345",
  registration_council: "Rajasthan Ayurvedic Council",
  registration_year: 2016,
  consultation_fee: "500.00",
  followup_fee: "300.00",
  consultation_modes: ["video", "clinic"],
  average_consultation_time: 30,
  max_patients_per_day: 20,
  primary_dosha_expertise: "Vata",
  specialized_therapies: ["Panchakarma"],
  is_panchakarma_certified: true,
  is_dietitian: false,
  ayurveda_practice_years: 8,
  practicing_since: "2016-06-01",
  linkedin_url: "https://www.linkedin.com/in/example",
  twitter_url: "",
  facebook_url: "",
  instagram_url: "",
  sequence: 1,
  is_active: true,
  is_verified: true,
};

/* =========================
   REUSABLE FIELD COMPONENT
========================= */

const Field = ({
  label,
  name,
  type = "text",
  required = false,
  placeholder = "",
  children,
}) => {
  const { formData, handleChange, validationErrors } =
    useContext(DoctorFormContext);

  return (
    <div
      className={`edit-field ${
        validationErrors[name] ? "has-error" : ""
      }`}
    >
      <label>
        {label} {required && <span>*</span>}
      </label>

      {children || (
        <input
          type={type}
          name={name}
          value={formData[name] ?? ""}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
        />
      )}

      {validationErrors[name] && (
        <small className="field-error">
          {validationErrors[name]}
        </small>
      )}
    </div>
  );
};



const Section = ({
  icon,
  title,
  children,
  className = "",
}) => (
  <div className={`edit-section ${className}`}>
    <div className="edit-section-heading">
      <div className="edit-section-icon">{icon}</div>
      <h3>{title}</h3>
    </div>

    <div className="edit-section-content">
      {children}
    </div>
  </div>
);

/* =========================
   MAIN COMPONENT
========================= */

const DoctorEditprofile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [previewImage, setPreviewImage] = useState("");

  const [formData, setFormData] = useState({
    ...defaultDoctor,
    ...(location.state?.doctor || {}),
  });

  const [profileImage, setProfileImage] = useState(
    location.state?.doctor?.profile_image || ""
  );

  const [saving, setSaving] = useState(false);

  const [languageDropdownOpen, setLanguageDropdownOpen] =
    useState(false);

  const [validationErrors, setValidationErrors] = useState({});

  const languageOptions = [
    "English",
    "Hindi",
    "Tamil",
    "Telugu",
    "Malayalam",
    "Kannada",
    "Marathi",
    "Gujarati",
    "Bengali",
    "Punjabi",
  ];

  
const uploadImage = async (file) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session Expired, Please Login Again");
    navigate("/login");
    return null;
  }

  try {
    const imageFormData = new FormData();

    imageFormData.append("image", file);
    imageFormData.append("dir", "doctors");

    const response = await fetch(`${BASE_URL}/user/upload/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": "true",
      },
      body: imageFormData,
    });

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return null;
    }

    const data = await response.json();

    if (!response.ok || data.success === false) {
      toast.error(data.message || "Image upload failed");
      return null;
    }

    const imageUrl = data?.data?.url;

    if (!imageUrl) {
      toast.error("Image URL not received from server");
      return null;
    }

    return imageUrl;
  } catch (error) {
    console.error("Upload Error:", error);
    toast.error("Image upload failed");
    return null;
  }
};


  const getPrakritiList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/customers/prakriti/admin/analysis-contents/`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
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

      if (!response.ok || data.success === false) {
        toast.error(data.message || "Failed to get Prakriti types");
        return;
      }

      // Prakriti API response is fetched for this page.
      console.log("Prakriti Types:", data.data || []);
    } catch (error) {
      console.error("Prakriti Fetch Error:", error);
      toast.error("Failed to fetch Prakriti types");
    }
  };


  useEffect(() => {
    if (location.state?.doctor) {
      setFormData({
        ...defaultDoctor,
        ...location.state.doctor,
      });

      setProfileImage(
        location.state.doctor.profile_image || ""
      );
    }
  }, [location.state]);

  useEffect(() => {
    getPrakritiList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear the error for the edited field
    setValidationErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  

  const handleArrayChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    }));

    setValidationErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };



  const handleLanguageToggle = (language) => {
    setFormData((prev) => {
      const selected = Array.isArray(prev.languages_spoken)
        ? prev.languages_spoken
        : [];

      return {
        ...prev,
        languages_spoken: selected.includes(language)
          ? selected.filter((item) => item !== language)
          : [...selected, language],
      };
    });

    setValidationErrors((prev) => ({
      ...prev,
      languages_spoken: "",
    }));
  };



const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (file) {
    setFormData((prev) => ({
      ...prev,
      profile_image: file,
    }));

    setPreviewImage(URL.createObjectURL(file));
  }
};

  const validateForm = () => {
    const errors = {};

    if (!formData.first_name?.trim()) {
      errors.first_name = "First name is required.";
    }

    if (!formData.last_name?.trim()) {
      errors.last_name = "Last name is required.";
    }

    if (!formData.dob) {
      errors.dob = "Date of birth is required.";
    }

    if (!formData.gender) {
      errors.gender = "Please select gender.";
    }

    if (!formData.nationality) {
      errors.nationality = "Please select nationality.";
    }

    if (!formData.email?.trim()) {
      errors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      errors.email = "Please enter a valid email address.";
    }

    if (
      !Array.isArray(formData.languages_spoken) ||
      formData.languages_spoken.length === 0
    ) {
      errors.languages_spoken =
        "Please select at least one language.";
    }

    if (!formData.qualification?.trim()) {
      errors.qualification = "Qualification is required.";
    }

    if (!formData.registration_number?.trim()) {
      errors.registration_number =
        "Registration number is required.";
    }

    if (!formData.registration_council?.trim()) {
      errors.registration_council =
        "Registration council is required.";
    }

    if (!formData.registration_year) {
      errors.registration_year = "Registration year is required.";
    }

    if (
      formData.experience_years === "" ||
      formData.experience_years === null ||
      formData.experience_years === undefined
    ) {
      errors.experience_years = "Experience is required.";
    }

    if (!formData.practicing_since) {
      errors.practicing_since =
        "Practice since date is required.";
    }

    if (!formData.city?.trim()) {
      errors.city = "City is required.";
    }

    if (!formData.state?.trim()) {
      errors.state = "State is required.";
    }

    if (!formData.pincode?.trim()) {
      errors.pincode = "Pincode is required.";
    }

    if (!formData.country?.trim()) {
      errors.country = "Country is required.";
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

 

  const showBackendErrors = (data) => {
    const backendErrors =
      data?.errors ||
      (typeof data?.detail === "object" ? data.detail : null) ||
      data?.data?.errors ||
      null;

    if (
      backendErrors &&
      typeof backendErrors === "object" &&
      !Array.isArray(backendErrors)
    ) {
      const formattedErrors = {};

      Object.entries(backendErrors).forEach(([key, value]) => {
        if (
          key === "non_field_errors" ||
          key === "detail"
        ) {
          return;
        }

        formattedErrors[key] = Array.isArray(value)
          ? value.join(", ")
          : typeof value === "string"
            ? value
            : JSON.stringify(value);
      });

      setValidationErrors((prev) => ({
        ...prev,
        ...formattedErrors,
      }));

      const generalError =
        backendErrors.non_field_errors ||
        backendErrors.detail ||
        data.message;

      if (generalError) {
        toast.error(
          Array.isArray(generalError)
            ? generalError.join(", ")
            : generalError
        );
      } else if (Object.keys(formattedErrors).length > 0) {
        toast.error("Please correct the highlighted fields.");
      } else {
        toast.error(data.message || "Unable to update doctor profile.");
      }

      return;
    }

    if (typeof data?.detail === "string") {
      toast.error(data.detail);
      return;
    }

    toast.error(data?.message || "Unable to update doctor profile.");
  };



  
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    toast.error("Please correct the highlighted fields.");
    return;
  }

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  try {
    setSaving(true);

    const payload = new FormData();

    Object.keys(formData).forEach((key) => {
      const value = formData[key];

      // Image upload: send only actual File
      if (key === "profile_image") {
        if (value instanceof File) {
          payload.append("profile_image", value);
        }
        return;
      }

      // Languages
      if (key === "languages_spoken") {
        payload.append(
          key,
          JSON.stringify(Array.isArray(value) ? value : [])
        );
        return;
      }

      // Specialized bio
      if (key === "specialized_bio") {
        const bio = Array.isArray(value)
          ? value
          : value
            ? value.split(",").map((item) => item.trim()).filter(Boolean)
            : [];

        payload.append(key, JSON.stringify(bio));
        return;
      }

      // Other array fields
      if (
        key === "specialized_therapies" ||
        key === "consultation_modes"
      ) {
        payload.append(
          key,
          JSON.stringify(Array.isArray(value) ? value : [])
        );
        return;
      }

      // Skip temporary file field
      if (key === "profile_file") return;

      // Other fields
      if (value !== null && value !== undefined) {
        if (typeof value === "object") {
          payload.append(key, JSON.stringify(value));
        } else {
          payload.append(key, value);
        }
      }
    });

    const response = await fetch(
      `${BASE_URL}/doctors/admin/doctor/?id=${id}`,
      {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: payload,
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
      showBackendErrors(data);
      return;
    }

    toast.success(
      data.message || "Doctor profile updated successfully!"
    );

    navigate("/Doctor");

  } catch (error) {
    console.error("Doctor Update Error:", error);
    toast.error("Unable to update doctor profile");
  } finally {
    setSaving(false);
  }
};


  

  return (
    <DoctorFormContext.Provider
      value={{
        formData,
        handleChange,
        validationErrors,
      }}
    >
      <div className="edit-doctor-page">

        {/* TOP HEADER */}

        <div className="edit-doctor-header">
          <div className="edit-page-title">
            <button
              type="button"
              className="edit-back-btn"
              onClick={() => navigate("/Doctor")}
            >
              <FaArrowLeft />
            </button>

            <h2>Edit Doctor Profile</h2>
          </div>

          <button
            type="button"
            className="view-profile-btn"
            onClick={() =>
              navigate(`/Doctor/${id}`, {
                state: { doctor: formData },
              })
            }
          >
            <FaEye /> View Profile
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* FIRST ROW */}

          <div className="edit-top-grid">

            {/* BASIC DETAILS */}

            <Section
              icon={<FaUser />}
              title="Basic Details"
              className="basic-details-section"
            >
              <div className="basic-details-layout">

                <div className="doctor-photo-area">
                  <div className="doctor-photo-preview">
                    {profileImage ? (
                      <img src={profileImage} alt="Doctor" />
                    ) : (
                      <FaUser />
                    )}
                  </div>

                  <label className="change-photo-btn">
                    <FaCamera /> Change Photo

                   <input
  type="file"
  accept="image/*"
  onChange={handleImageChange}
/>
                  </label>
                </div>

                <div className="basic-fields">

                  <div className="edit-form-grid three-columns">

                    <Field
                      label="Title"
                      name="title"
                      required
                    >
                      <select
                        name="title"
                        value={formData.title || "Dr."}
                        onChange={handleChange}
                      >
                        <option>Dr.</option>
                        <option>Mr.</option>
                        <option>Ms.</option>
                        <option>Mrs.</option>
                      </select>
                    </Field>

                    <Field
                      label="First Name"
                      name="first_name"
                      required
                    />

                    <Field
                      label="Last Name"
                      name="last_name"
                      required
                    />

                  </div>

                  <div className="edit-form-grid three-columns">

                    <Field
                      label="Date of Birth"
                      name="dob"
                      type="date"
                      required
                    />

                    <Field
                      label="Gender"
                      name="gender"
                      required
                    >
                      <select
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </Field>

                    <Field
                      label="Nationality"
                      name="nationality"
                      required
                    >
                      <select
                        name="nationality"
                        value={formData.nationality || ""}
                        onChange={handleChange}
                      >
                        <option value="Indian">Indian</option>
                        <option value="Other">Other</option>
                      </select>
                    </Field>

                  </div>

                  <div className="edit-form-grid languages-grid">

                    <Field
                      label="Consultation Fee"
                      name="consultation_fee"
                    />

                    <Field
                      label="Email Address"
                      name="email"
                      type="email"
                      required
                    />

                  </div>

                  {/* LANGUAGES */}

                  <div
                    className={`edit-field language-field ${
                      validationErrors.languages_spoken
                        ? "has-error"
                        : ""
                    }`}
                  >
                    <label>
                      Languages Spoken <span>*</span>
                    </label>

                    <div className="language-select-wrapper">

                      <div
                        className="language-select-input"
                        onClick={() =>
                          setLanguageDropdownOpen(
                            !languageDropdownOpen
                          )
                        }
                      >
                        <div className="language-chips">

                          {(formData.languages_spoken || []).length >
                          0 ? (
                            formData.languages_spoken.map(
                              (language) => (
                                <span
                                  className="language-chip"
                                  key={language}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {language}

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleLanguageToggle(language)
                                    }
                                  >
                                    ×
                                  </button>
                                </span>
                              )
                            )
                          ) : (
                            <span className="language-placeholder">
                              Select Languages
                            </span>
                          )}

                        </div>

                        <span className="language-arrow">⌄</span>
                      </div>

                      {languageDropdownOpen && (
                        <div className="language-dropdown">
                          {languageOptions.map((language) => (
                            <label
                              key={language}
                              className="language-option"
                            >
                              <input
                                type="checkbox"
                                checked={(
                                  formData.languages_spoken || []
                                ).includes(language)}
                                onChange={() =>
                                  handleLanguageToggle(language)
                                }
                              />

                              {language}
                            </label>
                          ))}
                        </div>
                      )}

                    </div>

                    {validationErrors.languages_spoken && (
                      <small className="field-error">
                        {validationErrors.languages_spoken}
                      </small>
                    )}

                  </div>

                </div>
              </div>
            </Section>

            {/* PROFESSIONAL INFO */}

            <Section
              icon={<FaBriefcaseMedical />}
              title="Professional Info"
            >
              <div className="edit-form-grid two-columns">

                <Field
                  label="Qualification"
                  name="qualification"
                  required
                />

                <Field
                  label="Registration Number"
                  name="registration_number"
                  required
                />

                <Field
                  label="Registration Council"
                  name="registration_council"
                  required
                />

                <Field
                  label="Registration Year"
                  name="registration_year"
                  type="number"
                  required
                />

                <Field
                  label="Experience (Years)"
                  name="experience_years"
                  required
                />

                <Field
                  label="Practice Since"
                  name="practicing_since"
                  type="date"
                  required
                />

                <Field
                  label="Max Patients Per Day"
                  name="max_patients_per_day"
                  type="number"
                />

                <Field
                  label="Sequence"
                  name="sequence"
                  type="number"
                />

              </div>
            </Section>

          </div>

          {/* SECOND ROW */}

          <div className="edit-middle-grid">

            {/* ADDRESS */}

            <Section
              icon={<FaMapMarkerAlt />}
              title="Address"
            >
              <div className="edit-address-layout">

                <Field
                  label="Address Line"
                  name="address_line"
                >
                  <textarea
                    name="address_line"
                    value={formData.address_line || ""}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter complete address"
                  />
                </Field>

                <Field
                  label="City"
                  name="city"
                  required
                />

                <Field
                  label="State"
                  name="state"
                  required
                />

                <Field
                  label="Pincode"
                  name="pincode"
                  required
                />

                <Field
                  label="Country"
                  name="country"
                  required
                />

              </div>
            </Section>

            {/* CONTACT & EMERGENCY */}

            <Section
              icon={<FaPhone />}
              title="Contact & Emergency"
            >
              <div className="contact-emergency-wrapper">

                <div className="edit-form-grid contact-emergency-grid">

                  <Field
                    label="Secondary Number"
                    name="secondary_number"
                  />

                  <Field
                    label="Emergency Contact Name"
                    name="emergency_contact_name"
                  />

                  <Field
                    label="Emergency Contact Relation"
                    name="emergency_contact_relation"
                  />

                  <Field
                    label="Emergency Contact Phone"
                    name="emergency_contact_phone"
                  />

                </div>

                {/* SOCIAL MEDIA */}

                <div className="social-media-wrapper">

                  <div className="social-media-heading">
                    <h4>Social Media</h4>
                    <p>
                      Add doctor's social media profile links
                    </p>
                  </div>

                  <div className="edit-form-grid two-columns">

                    <Field
                      label="LinkedIn URL"
                      name="linkedin_url"
                      type="url"
                      placeholder="https://www.linkedin.com/in/username"
                    />

                    <Field
                      label="Twitter URL"
                      name="twitter_url"
                      type="url"
                      placeholder="https://twitter.com/username"
                    />

                    <Field
                      label="Facebook URL"
                      name="facebook_url"
                      type="url"
                      placeholder="https://www.facebook.com/username"
                    />

                    <Field
                      label="Instagram URL"
                      name="instagram_url"
                      type="url"
                      placeholder="https://www.instagram.com/username"
                    />

                  </div>

                </div>

              </div>
            </Section>

          </div>

          {/* SPECIALIZATION & PRACTICE */}

          <Section
            icon={<FaStethoscope />}
            title="Specialization & Practice"
          >
            <div className="edit-specialization-layout">

              {/* BIO */}

              <Field
                label="Bio"
                name="bio"
              >
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter doctor bio"
                />
              </Field>

              {/* SPECIALIZED BIO */}

              <Field
                label="Specialized Bio"
                name="specialized_bio"
              >
                <textarea
                  name="specialized_bio"
                  value={
                    Array.isArray(formData.specialized_bio)
                      ? formData.specialized_bio.join(", ")
                      : formData.specialized_bio || ""
                  }
                  onChange={(e) =>
                    handleArrayChange(
                      "specialized_bio",
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Enter specialized bio"
                />
              </Field>

              {/* PRACTICE YEARS */}

              <Field
                label="Ayurveda Practice Years"
                name="ayurveda_practice_years"
              >
                <input
                  type="number"
                  name="ayurveda_practice_years"
                  value={formData.ayurveda_practice_years ?? ""}
                  onChange={handleChange}
                  min="0"
                  placeholder="Enter practice years"
                />
              </Field>

              {/* TOGGLE BUTTONS */}

              <div className="edit-specialization-toggles">

                <div className="edit-specialization-toggle-item">
                  <label>Is Panchakarma Certified</label>

                  <label className="edit-toggle">
                    <input
                      type="checkbox"
                      name="is_panchakarma_certified"
                      checked={!!formData.is_panchakarma_certified}
                      onChange={handleChange}
                    />

                    <span></span>
                  </label>
                </div>

                <div className="edit-specialization-toggle-item">
                  <label>Is Dietitian</label>

                  <label className="edit-toggle">
                    <input
                      type="checkbox"
                      name="is_dietitian"
                      checked={!!formData.is_dietitian}
                      onChange={handleChange}
                    />

                    <span></span>
                  </label>
                </div>

              </div>

            </div>
          </Section>

          {/* FOOTER BUTTONS */}

          <div className="edit-footer">

            <button
              type="button"
              className="edit-cancel-btn"
              onClick={() => navigate("/Doctor")}
            >
              <FaTimes /> Cancel
            </button>

            <button
              type="submit"
              className="edit-update-btn"
              disabled={saving}
            >
              <FaCheck />
              {saving ? "Updating..." : "Update Profile"}
            </button>

          </div>

        </form>
      </div>
        <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
        newestOnTop
        closeOnClick
      />
    </DoctorFormContext.Provider>
    
  );
  
};

export default DoctorEditprofile;
