import React, { useEffect, useState, useRef } from "react";

import {
  FaCircleQuestion,
  FaCircleCheck,
  FaCircleXmark,
  FaGlobe,
  FaLock,
  FaBullhorn,
  FaUserGroup,
  FaGift,
  FaCrown,
  FaUserShield,
  FaMoneyBillWave,
  FaPercent,
} from "react-icons/fa6";

import {
  FaEdit,
  FaSearch,
  FaTimes,
  FaCopy,
  FaFileExcel,
} from "react-icons/fa";

import { BiPlus } from "react-icons/bi";

import { FiTrash2, FiEye } from "react-icons/fi";

import {
  ToastContainer,
  toast,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import { useNavigate } from "react-router-dom";

import BASE_URL from "../../../Base";

import { FaTicketAlt } from "react-icons/fa";

import "./Coupons.css";


const Coupon = () => {

  const navigate = useNavigate();
const [couponErrors, setCouponErrors] = useState({});

  const [coupons, setCoupons] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);
   const [deleteModal, setDeleteModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

 

  const [visibilityOpen, setVisibilityOpen] = useState(false);

  const [sourceOpen, setSourceOpen] = useState(false);

  const [discountTypeOpen, setDiscountTypeOpen] =
    useState(false);

  const [selectedCoupon, setSelectedCoupon] =
    useState(null);
     const [CouponId, setCouponId] = useState(null);

  const [showAddCouponModal, setShowAddCouponModal] =
    useState(false);

  const [submitLoading, setSubmitLoading] =
    useState(false);
    const [serviceCategories, setServiceCategories] = useState([]);
const [loadingCategories, setLoadingCategories] = useState(false);


 const [couponImage, setCouponImage] = useState(null);


const [editVisibilityOpen, setEditVisibilityOpen] = useState(false);
const [editSourceOpen, setEditSourceOpen] = useState(false);
const [editDiscountTypeOpen, setEditDiscountTypeOpen] = useState(false);
const couponFileRef = useRef(null);

  const initialCouponForm = {

    code: "",

    visibility: "",

    source: "",
service_category_id: "",
  applies_to: "",

    discount_type: "",

    discount_value: "",

    min_amount: "",

    max_discount_amount: "",

    starts_at: "",

    expires_at: "",

    max_total_uses: "",

    max_uses_per_customer: "",

    is_active: false,

    image_url: "",

    description: "",
  };


  const [couponForm, setCouponForm] =
    useState(initialCouponForm);



 const resetCouponForm = () => {
  setCouponForm(initialCouponForm);
  setCouponErrors({});

  setCouponImage(null);

  setVisibilityOpen(false);
  setSourceOpen(false);
  setDiscountTypeOpen(false);

  setSubmitLoading(false);

  if (couponFileRef.current) {
    couponFileRef.current.value = "";
  }
};
 const [showEditCouponModal, setShowEditCouponModal] = useState(false);
const [editCouponForm, setEditCouponForm] = useState(initialCouponForm);
const [editCouponErrors, setEditCouponErrors] = useState({});
const [editCouponImage, setEditCouponImage] = useState(null);
const [editExistingImage, setEditExistingImage] = useState("");
const [editSubmitLoading, setEditSubmitLoading] = useState(false);

const editCouponFileRef = useRef(null);
  const uploadCouponImage = async (file) => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return null;
  }

  try {
    const formData = new FormData();

    formData.append("image", file);
    formData.append("dir", "health_issues");

    const response = await fetch(
      `${BASE_URL}/user/upload/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");
      toast.error("Session expired. Please login again");
      navigate("/login");
      return null;
    }

    const data = await response.json();

    console.log("COUPON IMAGE UPLOAD RESPONSE:", data);

    if (!response.ok || !data?.success) {
      toast.error(
        data?.message || "Image upload failed"
      );
      return null;
    }

    return data?.data?.url || null;

  } catch (error) {
    console.error("Coupon Image Upload Error:", error);
    toast.error("Image upload failed");
    return null;
  }
};
const validateCouponForm = () => {
  const errors = {};

  const code = couponForm.code.trim();
  const discountValue = Number(couponForm.discount_value);
  const minAmount =
    couponForm.min_amount !== ""
      ? Number(couponForm.min_amount)
      : null;

  const maxDiscount =
    couponForm.max_discount_amount !== ""
      ? Number(couponForm.max_discount_amount)
      : null;

  const maxTotalUses =
    couponForm.max_total_uses !== ""
      ? Number(couponForm.max_total_uses)
      : null;

  const maxUsesPerCustomer =
    couponForm.max_uses_per_customer !== ""
      ? Number(couponForm.max_uses_per_customer)
      : null;


  if (!code) {
    errors.code = "Coupon code is required.";
  } else if (code.length < 3) {
    errors.code = "Coupon code must contain at least 3 characters.";
  } else if (code.length > 50) {
    errors.code = "Coupon code cannot exceed 50 characters.";
  } else if (!/^[A-Z0-9_-]+$/.test(code)) {
    errors.code =
      "Coupon code can contain only uppercase letters, numbers, hyphen and underscore.";
  }
  
if (
  couponForm.max_total_uses === "" ||
  couponForm.max_total_uses === null
) {
  errors.max_total_uses =
    "Maximum total uses is required.";
} else if (
  !Number.isFinite(maxTotalUses) ||
  maxTotalUses < 1
) {
  errors.max_total_uses =
    "Maximum total uses must be at least 1.";
}



if (
  couponForm.max_uses_per_customer === "" ||
  couponForm.max_uses_per_customer === null
) {
  errors.max_uses_per_customer =
    "Maximum uses per customer is required.";
} else if (
  !Number.isFinite(maxUsesPerCustomer) ||
  maxUsesPerCustomer < 1
) {
  errors.max_uses_per_customer =
    "Maximum uses per customer must be at least 1.";
}

 
  if (!couponForm.visibility) {
    errors.visibility = "Please select coupon visibility.";
  }

 
  if (!couponForm.source) {
    errors.source = "Please select coupon source.";
  }

 
  if (!couponForm.service_category_id) {
    errors.service_category_id =
      "Please select a service category.";
  }
  if (!couponForm.applies_to) {
  errors.applies_to = "Please select where the coupon applies.";
}

  if (!couponForm.discount_type) {
    errors.discount_type =
      "Please select discount type.";
  }

  
  if (
    couponForm.discount_value === "" ||
    couponForm.discount_value === null
  ) {
    errors.discount_value =
      "Discount value is required.";
  } else if (!Number.isFinite(discountValue) || discountValue <= 0) {
    errors.discount_value =
      "Discount value must be greater than 0.";
  }

  if (
    couponForm.discount_type === "percentage" &&
    discountValue > 100
  ) {
    errors.discount_value =
      "Percentage discount cannot exceed 100%.";
  }

 
  if (
    minAmount !== null &&
    (!Number.isFinite(minAmount) || minAmount < 0)
  ) {
    errors.min_amount =
      "Minimum bill amount cannot be negative.";
  }

  
  if (
    couponForm.discount_type === "percentage" &&
    maxDiscount !== null &&
    (!Number.isFinite(maxDiscount) || maxDiscount <= 0)
  ) {
    errors.max_discount_amount =
      "Maximum discount must be greater than 0.";
  }


  if (couponForm.discount_type === "flat") {
    if (couponForm.max_discount_amount) {
      errors.max_discount_amount =
        "Maximum discount is not applicable for flat discounts.";
    }
  }

 
  if (
    couponForm.starts_at &&
    couponForm.expires_at
  ) {
    const startDate = new Date(couponForm.starts_at);
    const expiryDate = new Date(couponForm.expires_at);

    if (expiryDate <= startDate) {
      errors.expires_at =
        "Expiry date and time must be after the start date and time.";
    }
  }

 

 
  

  return errors;
};

const handleCreateCoupon = async (e) => {
  e.preventDefault();

  const validationErrors = validateCouponForm();

  if (Object.keys(validationErrors).length > 0) {
  setCouponErrors(validationErrors);

 
  const firstError = Object.values(validationErrors)[0];
  toast.error(firstError);

  return;
}

setCouponErrors({});

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setSubmitLoading(true);

  try {
    // Upload image first if selected
    let imageUrl = "";

    if (couponImage) {
      imageUrl = await uploadCouponImage(couponImage);

      if (!imageUrl) {
        setSubmitLoading(false);
        return;
      }
    }

    const payload = {
      code: couponForm.code.trim().toUpperCase(),

      visibility: couponForm.visibility,

      source: couponForm.source,

       applies_to: couponForm.applies_to,

      service_category_id: couponForm.service_category_id,

      discount_type: couponForm.discount_type,

      discount_value: Number(
        couponForm.discount_value
      ),

      min_amount:
        couponForm.min_amount !== ""
          ? Number(couponForm.min_amount)
          : null,

      max_discount_amount:
        couponForm.discount_type === "percentage" &&
        couponForm.max_discount_amount !== ""
          ? Number(couponForm.max_discount_amount)
          : null,

      starts_at: couponForm.starts_at
        ? new Date(couponForm.starts_at).toISOString()
        : null,

      expires_at: couponForm.expires_at
        ? new Date(couponForm.expires_at).toISOString()
        : null,

      max_total_uses:
        couponForm.max_total_uses !== ""
          ? Number(couponForm.max_total_uses)
          : null,

      max_uses_per_customer:
        couponForm.max_uses_per_customer !== ""
          ? Number(couponForm.max_uses_per_customer)
          : null,

      is_active: couponForm.is_active,

      image_url: imageUrl,

      description:
        couponForm.description.trim(),
    };

    console.log(
      "CREATE COUPON PAYLOAD:",
      payload
    );

    const response = await fetch(
      `${BASE_URL}/promotions/admin/coupons/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      }
    );

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      sessionStorage.removeItem(
        "superadmin_token"
      );

      toast.error(
        "Session expired. Please login again"
      );

      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log(
      "CREATE COUPON RESPONSE:",
      data
    );

    if (!response.ok || data?.success === false) {
      toast.error(
        data?.message ||
          "Failed to create coupon."
      );
      return;
    }

    toast.success(
      "Coupon created successfully!"
    );

    resetCouponForm();
    setCouponImage(null);

    if (couponFileRef.current) {
      couponFileRef.current.value = "";
    }

    setShowAddCouponModal(false);

    await getCoupons();

  } catch (error) {
    console.error(
      "Create Coupon Error:",
      error
    );

    toast.error(
      "Something went wrong while creating coupon."
    );
  } finally {
    setSubmitLoading(false);
  }
};

const handleCouponChange = (e) => {
  const { name, value, type, checked } = e.target;

  const updatedValue =
    type === "checkbox"
      ? checked
      : name === "code"
      ? value
          .toUpperCase()
          .replace(/\s+/g, "")
          .replace(/[^A-Z0-9_-]/g, "")
      : value;

  setCouponForm((prev) => ({
    ...prev,
    [name]: updatedValue,
  }));

  setCouponErrors((prev) => ({
    ...prev,
    [name]: "",
  }));
};

const getServiceCategories = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) return;

  setLoadingCategories(true);

  try {
    const response = await fetch(
      `${BASE_URL}/user/admin/service-category/`,
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
      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log("SERVICE CATEGORY RESPONSE:", data);

    if (data.success === true) {
      setServiceCategories(data.data || []);
    } else {
      setServiceCategories([]);
      toast.error(data.message || "Failed to fetch service categories");
    }
  } catch (error) {
    console.error("Service Category Error:", error);
    toast.error("Failed to fetch service categories");
    setServiceCategories([]);
  } finally {
    setLoadingCategories(false);
  }
};

 const getCoupons = async () => {
  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session expired. Please login again");
    navigate("/login");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const response = await fetch(
      `${BASE_URL}/promotions/admin/coupons/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      }
    );

    console.log("Coupon HTTP Status:", response.status);

    // Unauthorized
    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("superadmin_token");

      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const data = await response.json();

    console.log("Coupon API Response:", data);

    // API response uses success: true
    if (response.ok && data.success === true) {
      const couponData = Array.isArray(data.data)
        ? data.data
        : [];

      // Latest created coupon first
      const sortedData = [...couponData].sort(
        (a, b) =>
          new Date(b.created_at) - new Date(a.created_at)
      );

      setCoupons(sortedData);
      setError(null);
    } else {
      const errorMessage =
        data.message || "Failed to fetch coupons";

      toast.error(errorMessage);
      setError(errorMessage);
      setCoupons([]);
    }
  } catch (error) {
    console.error("Coupon Fetch Error:", error);

    const errorMessage =
      "Something went wrong while fetching coupon data.";

    setError(errorMessage);
    toast.error("Failed to fetch coupon data");
    setCoupons([]);
  } finally {
    setLoading(false);
  }
};
const resetEditCouponForm = () => {
  setEditCouponForm(initialCouponForm);
  setEditCouponErrors({});
  setEditCouponImage(null);
  setEditExistingImage("");

  setEditVisibilityOpen(false);
  setEditSourceOpen(false);
  setEditDiscountTypeOpen(false);

  setEditSubmitLoading(false);

  if (editCouponFileRef.current) {
    editCouponFileRef.current.value = "";
  }
};

  useEffect(() => {
  getCoupons();
  getServiceCategories();
}, []);


  

  const filteredCoupons =
    coupons.filter((coupon) => {

      const search =
        searchTerm.toLowerCase();


      return (

        coupon.code
          ?.toLowerCase()
          .includes(search)

        ||

        coupon.description
          ?.toLowerCase()
          .includes(search)

        ||

        coupon.source
          ?.toLowerCase()
          .includes(search)

        ||

        coupon.visibility
          ?.toLowerCase()
          .includes(search)

        ||

        coupon.applies_to
          ?.toLowerCase()
          .includes(search)

      );

    });



  const totalCoupons =
    coupons.length;


  const activeCoupons =
    coupons.filter(
      (coupon) =>
        coupon.is_active === true
    ).length;


  const inactiveCoupons =
    coupons.filter(
      (coupon) =>
        coupon.is_active === false
    ).length;

 const handleDelete = async (id) => {
    const token = sessionStorage.getItem("superadmin_token");
    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/promotions/admin/coupons/?id=${id}`,
        {
          method: "DELETE",
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

      if (!response.ok || data.success === false) {
        const errorMsg = data?.message || "Failed to delete category";
        toast.error(errorMsg);
        return;
      }

      toast.success("Category deleted successfully");
      setDeleteModal(false);
    getCoupons();

    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("Something went wrong while deleting category");
    }
  };
 

  const formatDate = (date) => {

    if (!date) {

      return "No expiry";

    }


    try {

      return new Date(
        date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    } catch (error) {

      return "-";

    }
  };

const validateCouponData = (form) => {
  const errors = {};

  const code = form.code.trim();

  const discountValue = Number(form.discount_value);

  const minAmount =
    form.min_amount !== ""
      ? Number(form.min_amount)
      : null;

  const maxDiscount =
    form.max_discount_amount !== ""
      ? Number(form.max_discount_amount)
      : null;

  const maxTotalUses =
    form.max_total_uses !== ""
      ? Number(form.max_total_uses)
      : null;

  const maxUsesPerCustomer =
    form.max_uses_per_customer !== ""
      ? Number(form.max_uses_per_customer)
      : null;

  if (!code) {
    errors.code = "Coupon code is required.";
  } else if (code.length < 3) {
    errors.code =
      "Coupon code must contain at least 3 characters.";
  } else if (code.length > 50) {
    errors.code =
      "Coupon code cannot exceed 50 characters.";
  } else if (!/^[A-Z0-9_-]+$/.test(code)) {
    errors.code =
      "Coupon code can contain only uppercase letters, numbers, hyphen and underscore.";
  }

  if (!form.visibility) {
    errors.visibility =
      "Please select coupon visibility.";
  }

  if (!form.source) {
    errors.source =
      "Please select coupon source.";
  }

  if (!form.service_category_id) {
    errors.service_category_id =
      "Please select a service category.";
  }

  if (!form.applies_to) {
    errors.applies_to =
      "Please select where the coupon applies.";
  }

  if (!form.discount_type) {
    errors.discount_type =
      "Please select discount type.";
  }

  if (
    form.discount_value === "" ||
    form.discount_value === null
  ) {
    errors.discount_value =
      "Discount value is required.";
  } else if (
    !Number.isFinite(discountValue) ||
    discountValue <= 0
  ) {
    errors.discount_value =
      "Discount value must be greater than 0.";
  }

  if (
    form.discount_type === "percentage" &&
    discountValue > 100
  ) {
    errors.discount_value =
      "Percentage discount cannot exceed 100%.";
  }

  if (
    minAmount !== null &&
    (!Number.isFinite(minAmount) || minAmount < 0)
  ) {
    errors.min_amount =
      "Minimum bill amount cannot be negative.";
  }

  if (
    form.discount_type === "percentage" &&
    maxDiscount !== null &&
    (!Number.isFinite(maxDiscount) || maxDiscount <= 0)
  ) {
    errors.max_discount_amount =
      "Maximum discount must be greater than 0.";
  }

  if (
    form.discount_type === "flat" &&
    form.max_discount_amount
  ) {
    errors.max_discount_amount =
      "Maximum discount is not applicable for flat discounts.";
  }

  if (
    form.starts_at &&
    form.expires_at
  ) {
    const startDate =
      new Date(form.starts_at);

    const expiryDate =
      new Date(form.expires_at);

    if (expiryDate <= startDate) {
      errors.expires_at =
        "Expiry date and time must be after the start date and time.";
    }
  }

  if (
    maxTotalUses !== null &&
    (!Number.isFinite(maxTotalUses) ||
      maxTotalUses < 1)
  ) {
    errors.max_total_uses =
      "Maximum total uses must be at least 1.";
  }

  if (
    maxUsesPerCustomer !== null &&
    (!Number.isFinite(maxUsesPerCustomer) ||
      maxUsesPerCustomer < 1)
  ) {
    errors.max_uses_per_customer =
      "Maximum uses per customer must be at least 1.";
  }

  return errors;
};

const handleUpdateCoupon = async (e) => {
  e.preventDefault();

  const validationErrors =
    validateCouponData(editCouponForm);

  if (Object.keys(validationErrors).length > 0) {
    setEditCouponErrors(validationErrors);

    const firstError =
      Object.values(validationErrors)[0];

    toast.error(firstError);

    return;
  }

  setEditCouponErrors({});

  const token =
    sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error(
      "Session expired. Please login again"
    );

    navigate("/login");
    return;
  }

  if (!selectedCoupon?.id) {
    toast.error("Coupon ID is missing.");
    return;
  }

  setEditSubmitLoading(true);

  try {
    let imageUrl = editExistingImage;

    
    if (editCouponImage) {
      imageUrl =
        await uploadCouponImage(editCouponImage);

      if (!imageUrl) {
        setEditSubmitLoading(false);
        return;
      }
    }

    const payload = {
      code: editCouponForm.code
        .trim()
        .toUpperCase(),

      visibility:
        editCouponForm.visibility,

      source:
        editCouponForm.source,

      applies_to:
        editCouponForm.applies_to,

      service_category_id:
        editCouponForm.service_category_id,

      discount_type:
        editCouponForm.discount_type,

      discount_value:
        Number(editCouponForm.discount_value),

      min_amount:
        editCouponForm.min_amount !== ""
          ? Number(editCouponForm.min_amount)
          : null,

      max_discount_amount:
        editCouponForm.discount_type ===
          "percentage" &&
        editCouponForm.max_discount_amount !== ""
          ? Number(
              editCouponForm.max_discount_amount
            )
          : null,

      starts_at:
        editCouponForm.starts_at
          ? new Date(
              editCouponForm.starts_at
            ).toISOString()
          : null,

      expires_at:
        editCouponForm.expires_at
          ? new Date(
              editCouponForm.expires_at
            ).toISOString()
          : null,

      max_total_uses:
        editCouponForm.max_total_uses !== ""
          ? Number(
              editCouponForm.max_total_uses
            )
          : null,

      max_uses_per_customer:
        editCouponForm.max_uses_per_customer !== ""
          ? Number(
              editCouponForm.max_uses_per_customer
            )
          : null,

      is_active:
        editCouponForm.is_active,

      image_url: imageUrl,

      description:
        editCouponForm.description.trim(),
    };

    console.log(
      "UPDATE COUPON PAYLOAD:",
      payload
    );

    const response = await fetch(
    `${BASE_URL}/promotions/admin/coupons/?id=${selectedCoupon.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type":
            "application/json",

          Accept:
            "application/json",

          Authorization:
            `Bearer ${token}`,

          "ngrok-skip-browser-warning":
            "true",
        },

        body: JSON.stringify(payload),
      }
    );

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      sessionStorage.removeItem(
        "superadmin_token"
      );

      toast.error(
        "Session expired. Please login again"
      );

      navigate("/login");
      return;
    }

    const data =
      await response.json();

    console.log(
      "UPDATE COUPON RESPONSE:",
      data
    );

    if (
      !response.ok ||
      data?.success === false
    ) {
      toast.error(
        data?.message ||
          "Failed to update coupon."
      );

      return;
    }

    toast.success(
      "Coupon updated successfully!"
    );

    resetEditCouponForm();

    setSelectedCoupon(null);

    setShowEditCouponModal(false);

    await getCoupons();

  } catch (error) {
    console.error(
      "Update Coupon Error:",
      error
    );

    toast.error(
      "Something went wrong while updating coupon."
    );
  } finally {
    setEditSubmitLoading(false);
  }
};
const handleEditCouponChange = (e) => {
  const { name, value, type, checked } = e.target;

  const updatedValue =
    type === "checkbox"
      ? checked
      : name === "code"
      ? value
          .toUpperCase()
          .replace(/\s+/g, "")
          .replace(/[^A-Z0-9_-]/g, "")
      : value;

  setEditCouponForm((prev) => ({
    ...prev,
    [name]: updatedValue,
  }));

  setEditCouponErrors((prev) => ({
    ...prev,
    [name]: "",
  }));
};


  const formatValidity = (coupon) => {

    if (
      !coupon.starts_at &&
      !coupon.expires_at
    ) {

      return "No limit";

    }


    const start =
      coupon.starts_at
        ? formatDate(
            coupon.starts_at
          )
        : "Now";


    const end =
      coupon.expires_at
        ? formatDate(
            coupon.expires_at
          )
        : "No expiry";


    return `${start} - ${end}`;
  };


  const handleEditCoupon = (coupon) => {
  console.log("EDIT COUPON DATA:", coupon);

  setEditCouponForm({
    code: coupon.code || "",
    visibility: coupon.visibility || "",
    source: coupon.source || "",
    service_category_id: coupon.service_category_id || "",
    applies_to: coupon.applies_to || "",
    discount_type: coupon.discount_type || "",
    discount_value:
      coupon.discount_value !== null &&
      coupon.discount_value !== undefined
        ? String(coupon.discount_value)
        : "",
    min_amount:
      coupon.min_amount !== null &&
      coupon.min_amount !== undefined
        ? String(coupon.min_amount)
        : "",
    max_discount_amount:
      coupon.max_discount_amount !== null &&
      coupon.max_discount_amount !== undefined
        ? String(coupon.max_discount_amount)
        : "",
    starts_at: coupon.starts_at
      ? formatDateTimeLocal(coupon.starts_at)
      : "",
    expires_at: coupon.expires_at
      ? formatDateTimeLocal(coupon.expires_at)
      : "",
    max_total_uses:
      coupon.max_total_uses !== null &&
      coupon.max_total_uses !== undefined
        ? String(coupon.max_total_uses)
        : "",
    max_uses_per_customer:
      coupon.max_uses_per_customer !== null &&
      coupon.max_uses_per_customer !== undefined
        ? String(coupon.max_uses_per_customer)
        : "",
    is_active: coupon.is_active === true,
    image_url: coupon.image_url || "",
    description: coupon.description || "",
  });

  setEditExistingImage(coupon.image_url || "");
  setEditCouponImage(null);
  setEditCouponErrors({});

  setEditVisibilityOpen(false);
  setEditSourceOpen(false);
  setEditDiscountTypeOpen(false);

  setSelectedCoupon(coupon);
  setShowEditCouponModal(true);
};

 const formatDateTimeLocal = (date) => {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "";
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

  return (

    <>

  
  <div className="page-header">

        <h1>
          Coupon Management
        </h1>

      </div>

    

     

      <div className="stats2-grid">



        <div
          className="stat2-card"
          style={{
            borderTopColor:
              "#0D614E",
          }}
        >

          <div
            className="stat2-icon"
            style={{
              background:
                "#0D614E20",

              color:
                "#0D614E",
            }}
          >

            <FaTicketAlt
              size={16}
            />

          </div>


          <div className="stat2-info">

            <h3>
              Total Coupons
            </h3>

            <div className="stat2-value">
              {totalCoupons}
            </div>

          </div>

        </div>


        {/* ACTIVE */}

        <div
          className="stat2-card"
          style={{
            borderTopColor:
              "#0D614E",
          }}
        >

          <div
            className="stat2-icon"
            style={{
              background:
                "#0D614E20",

              color:
                "#0D614E",
            }}
          >

            <FaCircleCheck
              size={16}
            />

          </div>


          <div className="stat2-info">

            <h3>
              Active Coupons
            </h3>

            <div className="stat2-value">
              {activeCoupons}
            </div>

          </div>

        </div>


        {/* INACTIVE */}

        <div
          className="stat2-card"
          style={{
            borderTopColor:
              "#0D614E",
          }}
        >

          <div
            className="stat2-icon"
            style={{
              background:
                "#0D614E20",

              color:
                "#0D614E",
            }}
          >

            <FaCircleXmark
              size={16}
            />

          </div>


          <div className="stat2-info">

            <h3>
              Inactive Coupons
            </h3>

            <div className="stat2-value">
              {inactiveCoupons}
            </div>

          </div>

        </div>


      </div>


      <div className="filter-category">

        <div className="filter-controls">

          <div className="search-wrapper">

            <FaSearch
              className="search-icon"
            />

            <input
              type="text"
              placeholder="Search by coupon code..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="search-input"
            />


            {searchTerm && (

              <button
                type="button"
                className="clear-search"
                onClick={() =>
                  setSearchTerm("")
                }
              >

                <FaTimes />

              </button>

            )}

          </div>

        </div>


    

        <button
          className="add-customer-btn"
          onClick={() => {

            resetCouponForm();

            setShowAddCouponModal(
              true
            );

          }}
        >

          <BiPlus />

          Add Coupon

        </button>

      </div>


   

      <div className="coupon-table-wrapper">

        <table className="coupon-table">

          <thead className="coupon-table-head">

            <tr>

              <th className="coupon-col-code">
                Coupon
              </th>

              <th className="coupon-col-source">
                Source
              </th>

              <th className="coupon-col-applies">
                Applies To
              </th>

              <th className="coupon-col-discount">
                Discount
              </th>

              <th className="coupon-col-validity">
                Validity
              </th>

              <th className="coupon-col-status">
                Status
              </th>

              <th className="coupon-col-action">
                Action
              </th>

            </tr>

          </thead>


          <tbody className="coupon-table-body">


            {/* LOADING */}

            {loading && (

              <tr>

                <td
                  colSpan="9"
                  className="coupon-loading"
                >

                  <div className="coupon-loader">

                    <div className="coupon-spinner"></div>

                    <span>
                      Loading coupons...
                    </span>

                  </div>

                </td>

              </tr>

            )}


            {/* ERROR */}

            {!loading &&
              error && (

                <tr>

                  <td
                    colSpan="9"
                    className="coupon-empty"
                  >

                    <div className="coupon-empty-content">

                      <FaTicketAlt
                        size={24}
                      />

                      <span>
                        {error}
                      </span>

                    </div>

                  </td>

                </tr>

              )}


            {/* EMPTY */}

            {!loading &&
              !error &&
              filteredCoupons.length === 0 && (

                <tr>

                  <td
                    colSpan="9"
                    className="coupon-empty"
                  >

                    <div className="coupon-empty-content">

                      <FaTicketAlt
                        size={24}
                      />

                      <strong>

                        {searchTerm
                          ? `No coupon found for "${searchTerm}"`
                          : "No coupons found"}

                      </strong>


                      <span>

                        {searchTerm
                          ? "Try searching with another coupon code."
                          : "Create your first coupon to get started."}

                      </span>

                    </div>

                  </td>

                </tr>

              )}


            {/* DATA */}

            {!loading &&
              !error &&
              filteredCoupons.map(
                (coupon, index) => (

                  <tr
                    key={
                      coupon.id ||
                      index
                    }
                    className="coupon-table-row"
                  >


                    {/* COUPON */}

                    <td className="coupon-code-cell">

                      <div className="coupon-code-wrapper">

                        <span className="coupon-code">

                          {coupon.code ||
                            "-"}

                        </span>


                        <span className="coupon-id">

                          ID:{" "}

                          {coupon.id ||
                            "-"}

                        </span>

                      </div>

                    </td>


                   

                    <td>

                      <span className="coupon-pill coupon-source-pill">

                        {coupon.source
                          ? coupon.source
                              .charAt(0)
                              .toUpperCase() +
                            coupon.source.slice(1)
                          : "-"}

                      </span>

                    </td>


                    

                    <td>

                      <span className="coupon-applies">

                        {coupon.applies_to ===
                        "both"

                          ? "Order & Consultation"

                          : coupon.applies_to ===
                            "order"

                          ? "Order"

                          : coupon.applies_to ===
                            "consultation"

                          ? "Consultation"

                          : "-"}

                      </span>

                    </td>


                   

                    <td>

                      <div className="coupon-discount-wrapper">

                        <span className="coupon-discount">

                          {coupon.discount_type ===
                          "percentage"

                            ? `${coupon.discount_value}%`

                            : `₹${coupon.discount_value}`}

                        </span>


                        {coupon.discount_type && (

                          <span className="coupon-discount-type">

                            {coupon.discount_type ===
                            "percentage"

                              ? "Percentage"

                              : "Flat"}

                          </span>

                        )}


                        {coupon.min_amount && (

                          <span className="coupon-limit">

                            Min ₹
                            {coupon.min_amount}

                          </span>

                        )}


                        {coupon.max_discount_amount && (

                          <span className="coupon-limit">

                            Max ₹
                            {coupon.max_discount_amount}

                          </span>

                        )}

                      </div>

                    </td>


                    
                    <td>

                      <div className="coupon-validity">

                        <div className="coupon-date">

                          {coupon.starts_at
                            ? formatDate(
                                coupon.starts_at
                              )
                            : "No start date"}

                        </div>


                        <div className="coupon-validity-separator">

                          →

                        </div>


                        <div className="coupon-date">

                          {coupon.expires_at
                            ? formatDate(
                                coupon.expires_at
                              )
                            : "No expiry"}

                        </div>

                      </div>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`status-badge ${
                          coupon.is_active
                            ? "status-active"
                            : "status-inactive"
                        }`}
                      >

                        {coupon.is_active
                          ? "Active"
                          : "Inactive"}

                      </span>


                      <br />


                      <label className="switch">

                        <input
                          type="checkbox"
                          checked={
                            coupon.is_active
                          }
                          readOnly
                        />

                        <span className="slider round"></span>

                      </label>

                    </td>


                   

                    <td>

                      <div className="coupon-actions">

                        <button
                          type="button"
                          className="coupon-action-btn coupon-edit-btn"
                          title="Edit Coupon"
                          onClick={() =>
                            handleEditCoupon(
                              coupon
                            )
                          }
                        >

                          <FaEdit
                            size={13}
                          />

                        </button>


                       <button
                          type="button"
                          className="coupon-action-btn coupon-delete-btn"
                          title="Delete Coupon"
                          onClick={() => {

                            setCouponId(
                              coupon.id
                            );

                            setDeleteModal(
                              true
                            );

                          }}
                        >

                          <FiTrash2
                            size={13}
                          />

                        </button>

                      </div>

                    </td>


                  </tr>

                )
              )}

          </tbody>

        </table>

      </div>


  

 {showAddCouponModal && (

  <div className="coupon-modal-overlay">

    <div className="coupon-modal">

  

      <div className="coupon-modal-header">

        <div>

          <h2>
            Add Coupon
          </h2>

          <p>
            Create a new coupon
          </p>

        </div>

        <button
          type="button"
          className="coupon-modal-close"
          onClick={() => {

            if (!submitLoading) {

              resetCouponForm();

              setShowAddCouponModal(false);

            }

          }}
        >
          <FaTimes />
        </button>

      </div>


  

      <form
        className="coupon-form"
        onSubmit={handleCreateCoupon}
      >



        <div className="coupon-form-group">

          <label>
            Coupon Code <span>*</span>
          </label>

          <input
            type="text"
            name="code"
            value={couponForm.code}
            onChange={handleCouponChange}
            placeholder="e.g. AYUR20"
            maxLength={30}
            autoComplete="off"
            className={
              couponErrors.code
                ? "input-error"
                : ""
            }
          />

          {couponErrors.code && (
            <span className="field-error">
              {couponErrors.code}
            </span>
          )}

        </div>


      

        <div className="coupon-form-group">

          <label>
            Service Category <span>*</span>
          </label>

          <select
            name="service_category_id"
            value={couponForm.service_category_id}
            onChange={handleCouponChange}
            className={
              couponErrors.service_category_id
                ? "input-error"
                : ""
            }
          >

            <option value="">
              {loadingCategories
                ? "Loading categories..."
                : "Select Service Category"}
            </option>

            {!loadingCategories &&
              serviceCategories
                .filter(
                  (category) =>
                    category.is_active === true ||
                    category.is_active === "true"
                )
                .map((category) => (

                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>

                ))}

          </select>

          {couponErrors.service_category_id && (
            <span className="field-error">
              {couponErrors.service_category_id}
            </span>
          )}

        </div>


       

        <div className="coupon-form-group visibility-form-group">

          <label>
            Visibility <span>*</span>
          </label>

          <div className="visibility-dropdown">

            <button
              type="button"
              className={`visibility-select ${
                visibilityOpen
                  ? "visibility-select-open"
                  : ""
              } ${
                couponErrors.visibility
                  ? "input-error"
                  : ""
              }`}
              onClick={() =>
                setVisibilityOpen(
                  (prev) => !prev
                )
              }
            >

              <span>

                {couponForm.visibility === "general"
                  ? "General"
                  : couponForm.visibility === "private"
                  ? "Private"
                  : "Select Visibility"}

              </span>

              <span
                className={`visibility-arrow ${
                  visibilityOpen
                    ? "rotate"
                    : ""
                }`}
              >
                ▾
              </span>

            </button>


            {visibilityOpen && (

              <div className="visibility-menu">

                <div className="visibility-info">

                  <FaCircleQuestion
                    size={20}
                  />

                  <span>
                    Select General for all
                    eligible customers or
                    Private for selected
                    customers only.
                  </span>

                </div>


                {/* GENERAL */}

                <button
                  type="button"
                  className={`visibility-option ${
                    couponForm.visibility ===
                    "general"
                      ? "visibility-option-selected"
                      : ""
                  }`}
                  onClick={() => {

                    setCouponForm(
                      (prev) => ({
                        ...prev,
                        visibility:
                          "general",
                      })
                    );

                    setCouponErrors(
                      (prev) => ({
                        ...prev,
                        visibility: "",
                      })
                    );

                    setVisibilityOpen(
                      false
                    );

                  }}
                >

                  <span className="visibility-option-left">

                    <span className="visibility-icon general-icon">

                      <FaGlobe
                        size={18}
                      />

                    </span>

                    <span className="visibility-option-content">

                      <strong>
                        General
                      </strong>

                      <small>
                        Visible to all
                        eligible customers.
                      </small>

                    </span>

                  </span>

                  {couponForm.visibility ===
                    "general" && (

                    <FaCircleCheck
                      className="visibility-check"
                      size={18}
                    />

                  )}

                </button>


             

                <button
                  type="button"
                  className={`visibility-option ${
                    couponForm.visibility ===
                    "private"
                      ? "visibility-option-selected"
                      : ""
                  }`}
                  onClick={() => {

                    setCouponForm(
                      (prev) => ({
                        ...prev,
                        visibility:
                          "private",
                      })
                    );

                    setCouponErrors(
                      (prev) => ({
                        ...prev,
                        visibility: "",
                      })
                    );

                    setVisibilityOpen(
                      false
                    );

                  }}
                >

                  <span className="visibility-option-left">

                    <span className="visibility-icon private-icon">

                      <FaLock
                        size={18}
                      />

                    </span>

                    <span className="visibility-option-content">

                      <strong>
                        Private
                      </strong>

                      <small>
                        Visible only to
                        selected customers.
                      </small>

                    </span>

                  </span>

                  {couponForm.visibility ===
                    "private" && (

                    <FaCircleCheck
                      className="visibility-check"
                      size={18}
                    />

                  )}

                </button>

              </div>

            )}

          </div>

          {couponErrors.visibility && (
            <span className="field-error">
              {couponErrors.visibility}
            </span>
          )}

        </div>


      

        <div className="coupon-form-group visibility-form-group">

          <label>
            Source <span>*</span>
          </label>

          <div className="visibility-dropdown">

            <button
              type="button"
              className={`visibility-select ${
                sourceOpen
                  ? "visibility-select-open"
                  : ""
              } ${
                couponErrors.source
                  ? "input-error"
                  : ""
              }`}
              onClick={() =>
                setSourceOpen(
                  (prev) => !prev
                )
              }
            >

              <span>

                {couponForm.source === "campaign"
                  ? "Campaign"
                  : couponForm.source === "referral"
                  ? "Referral"
                  : couponForm.source === "reward"
                  ? "Reward"
                  : couponForm.source === "loyalty"
                  ? "Loyalty"
                  : couponForm.source === "admin"
                  ? "Admin"
                  : "Select Source"}

              </span>

              <span
                className={`visibility-arrow ${
                  sourceOpen
                    ? "rotate"
                    : ""
                }`}
              >
                ▾
              </span>

            </button>


            {sourceOpen && (

              <div className="visibility-menu">

                <div className="visibility-info">

                  <FaCircleQuestion
                    size={20}
                  />

                  <span>
                    Select the source based
                    on how or why the coupon
                    was created.
                  </span>

                </div>


              

                <button
                  type="button"
                  className={`visibility-option ${
                    couponForm.source ===
                    "campaign"
                      ? "visibility-option-selected"
                      : ""
                  }`}
                  onClick={() => {

                    setCouponForm(
                      (prev) => ({
                        ...prev,
                        source:
                          "campaign",
                      })
                    );

                    setCouponErrors(
                      (prev) => ({
                        ...prev,
                        source: "",
                      })
                    );

                    setSourceOpen(
                      false
                    );

                  }}
                >

                  <span className="visibility-option-left">

                    <span className="visibility-icon general-icon">

                      <FaBullhorn
                        size={18}
                      />

                    </span>

                    <span className="visibility-option-content">

                      <strong>
                        Campaign
                      </strong>

                      <small>
                        <b>When to use:</b>{" "}
                        Use this when the
                        coupon is created
                        as part of a marketing
                        or promotional campaign.
                      </small>

                      <small>
                        <b>Example:</b>{" "}
                        Diwali Sale: Create
                        DIWALI20 with 20% off.
                      </small>

                    </span>

                  </span>

                  {couponForm.source ===
                    "campaign" && (

                    <FaCircleCheck
                      className="visibility-check"
                      size={18}
                    />

                  )}

                </button>


                {/* REFERRAL */}

                <button
                  type="button"
                  className={`visibility-option ${
                    couponForm.source ===
                    "referral"
                      ? "visibility-option-selected"
                      : ""
                  }`}
                  onClick={() => {

                    setCouponForm(
                      (prev) => ({
                        ...prev,
                        source:
                          "referral",
                      })
                    );

                    setCouponErrors(
                      (prev) => ({
                        ...prev,
                        source: "",
                      })
                    );

                    setSourceOpen(
                      false
                    );

                  }}
                >

                  <span className="visibility-option-left">

                    <span className="visibility-icon private-icon">

                      <FaUserGroup
                        size={18}
                      />

                    </span>

                    <span className="visibility-option-content">

                      <strong>
                        Referral
                      </strong>

                      <small>
                        <b>When to use:</b>{" "}
                        Use when the coupon
                        is generated because
                        a customer referred
                        another person.
                      </small>

                      <small>
                        <b>Example:</b>{" "}
                        REFER100 as a ₹100
                        coupon.
                      </small>

                    </span>

                  </span>

                  {couponForm.source ===
                    "referral" && (

                    <FaCircleCheck
                      className="visibility-check"
                      size={18}
                    />

                  )}

                </button>


               

                <button
                  type="button"
                  className={`visibility-option ${
                    couponForm.source ===
                    "reward"
                      ? "visibility-option-selected"
                      : ""
                  }`}
                  onClick={() => {

                    setCouponForm(
                      (prev) => ({
                        ...prev,
                        source:
                          "reward",
                      })
                    );

                    setCouponErrors(
                      (prev) => ({
                        ...prev,
                        source: "",
                      })
                    );

                    setSourceOpen(
                      false
                    );

                  }}
                >

                  <span className="visibility-option-left">

                    <span className="visibility-icon general-icon">

                      <FaGift
                        size={18}
                      />

                    </span>

                    <span className="visibility-option-content">

                      <strong>
                        Reward
                      </strong>

                      <small>
                        <b>When to use:</b>{" "}
                        Use when the coupon
                        is given as a reward
                        for completing an
                        action.
                      </small>

                      <small>
                        <b>Example:</b>{" "}
                        FIVEORDERS10 after
                        5 orders.
                      </small>

                    </span>

                  </span>

                  {couponForm.source ===
                    "reward" && (

                    <FaCircleCheck
                      className="visibility-check"
                      size={18}
                    />

                  )}

                </button>


                {/* LOYALTY */}

                <button
                  type="button"
                  className={`visibility-option ${
                    couponForm.source ===
                    "loyalty"
                      ? "visibility-option-selected"
                      : ""
                  }`}
                  onClick={() => {

                    setCouponForm(
                      (prev) => ({
                        ...prev,
                        source:
                          "loyalty",
                      })
                    );

                    setCouponErrors(
                      (prev) => ({
                        ...prev,
                        source: "",
                      })
                    );

                    setSourceOpen(
                      false
                    );

                  }}
                >

                  <span className="visibility-option-left">

                    <span className="visibility-icon general-icon">

                      <FaCrown
                        size={18}
                      />

                    </span>

                    <span className="visibility-option-content">

                      <strong>
                        Loyalty
                      </strong>

                      <small>
                        <b>When to use:</b>{" "}
                        Use for loyalty
                        program customers.
                      </small>

                      <small>
                        <b>Example:</b>{" "}
                        GOLD15 for Gold
                        customers.
                      </small>

                    </span>

                  </span>

                  {couponForm.source ===
                    "loyalty" && (

                    <FaCircleCheck
                      className="visibility-check"
                      size={18}
                    />

                  )}

                </button>


                {/* ADMIN */}

                <button
                  type="button"
                  className={`visibility-option ${
                    couponForm.source ===
                    "admin"
                      ? "visibility-option-selected"
                      : ""
                  }`}
                  onClick={() => {

                    setCouponForm(
                      (prev) => ({
                        ...prev,
                        source:
                          "admin",
                      })
                    );

                    setCouponErrors(
                      (prev) => ({
                        ...prev,
                        source: "",
                      })
                    );

                    setSourceOpen(
                      false
                    );

                  }}
                >

                  <span className="visibility-option-left">

                    <span className="visibility-icon private-icon">

                      <FaUserShield
                        size={18}
                      />

                    </span>

                    <span className="visibility-option-content">

                      <strong>
                        Admin
                      </strong>

                      <small>
                        <b>When to use:</b>{" "}
                        Use when an admin
                        manually creates
                        a coupon.
                      </small>

                      <small>
                        <b>Example:</b>{" "}
                        SORRY200 for customer
                        support cases.
                      </small>

                    </span>

                  </span>

                  {couponForm.source ===
                    "admin" && (

                    <FaCircleCheck
                      className="visibility-check"
                      size={18}
                    />

                  )}

                </button>

              </div>

            )}

          </div>

          {couponErrors.source && (
            <span className="field-error">
              {couponErrors.source}
            </span>
          )}

        </div>


      

        <div className="coupon-form-group visibility-form-group">

          <label>
            Discount Type <span>*</span>
          </label>

          <div className="visibility-dropdown">

            <button
              type="button"
              className={`visibility-select ${
                discountTypeOpen
                  ? "visibility-select-open"
                  : ""
              } ${
                couponErrors.discount_type
                  ? "input-error"
                  : ""
              }`}
              onClick={() =>
                setDiscountTypeOpen(
                  (prev) => !prev
                )
              }
            >

              <span>

                {couponForm.discount_type === "flat"
                  ? "Flat (₹ off)"
                  : couponForm.discount_type ===
                    "percentage"
                  ? "Percentage (% off)"
                  : "Select Discount Type"}

              </span>

              <span
                className={`visibility-arrow ${
                  discountTypeOpen
                    ? "rotate"
                    : ""
                }`}
              >
                ▾
              </span>

            </button>


            {discountTypeOpen && (

              <div className="visibility-menu">

                <div className="visibility-info">

                  <FaCircleQuestion
                    size={20}
                  />

                  <span>
                    Choose whether the coupon
                    gives a fixed amount discount
                    or a percentage-based discount.
                  </span>

                </div>


                {/* FLAT */}

                <button
                  type="button"
                  className={`visibility-option ${
                    couponForm.discount_type ===
                    "flat"
                      ? "visibility-option-selected"
                      : ""
                  }`}
                  onClick={() => {

                    setCouponForm(
                      (prev) => ({
                        ...prev,
                        discount_type:
                          "flat",
                        max_discount_amount:
                          "",
                      })
                    );

                    setCouponErrors(
                      (prev) => ({
                        ...prev,
                        discount_type: "",
                        max_discount_amount: "",
                      })
                    );

                    setDiscountTypeOpen(
                      false
                    );

                  }}
                >

                  <span className="visibility-option-left">

                    <span className="visibility-icon general-icon">

                      <FaMoneyBillWave
                        size={18}
                      />

                    </span>

                    <span className="visibility-option-content">

                      <strong>
                        Flat (₹ off)
                      </strong>

                      <small>
                        <b>When to use:</b>{" "}
                        Use for fixed amount
                        discounts.
                      </small>

                      <small>
                        <b>Example:</b>{" "}
                        Enter ₹100 → customer
                        gets ₹100 off.
                      </small>

                      <small>
                        <b>Minimum Bill:</b>{" "}
                        Optional.
                      </small>

                    </span>

                  </span>

                  {couponForm.discount_type ===
                    "flat" && (

                    <FaCircleCheck
                      className="visibility-check"
                      size={18}
                    />

                  )}

                </button>


                {/* PERCENTAGE */}

                <button
                  type="button"
                  className={`visibility-option ${
                    couponForm.discount_type ===
                    "percentage"
                      ? "visibility-option-selected"
                      : ""
                  }`}
                  onClick={() => {

                    setCouponForm(
                      (prev) => ({
                        ...prev,
                        discount_type:
                          "percentage",
                      })
                    );

                    setCouponErrors(
                      (prev) => ({
                        ...prev,
                        discount_type: "",
                        max_discount_amount: "",
                      })
                    );

                    setDiscountTypeOpen(
                      false
                    );

                  }}
                >

                  <span className="visibility-option-left">

                    <span className="visibility-icon private-icon">

                      <FaPercent
                        size={18}
                      />

                    </span>

                    <span className="visibility-option-content">

                      <strong>
                        Percentage (% off)
                      </strong>

                      <small>
                        <b>When to use:</b>{" "}
                        Use when discount is
                        percentage based.
                      </small>

                      <small>
                        <b>Example:</b>{" "}
                        Enter 20 → customer
                        gets 20% off.
                      </small>

                      <small>
                        <b>Maximum Discount:</b>{" "}
                        Optional maximum ₹ amount.
                      </small>

                    </span>

                  </span>

                  {couponForm.discount_type ===
                    "percentage" && (

                    <FaCircleCheck
                      className="visibility-check"
                      size={18}
                    />

                  )}

                </button>

              </div>

            )}

          </div>


          {couponForm.discount_type && (

            <div className="discount-type-example">

              <strong>
                Example:
              </strong>{" "}

              {couponForm.discount_type ===
              "flat"

                ? "Enter 100 → customer gets ₹100 off."

                : "Enter 20 → customer gets 20% off."}

            </div>

          )}

          {couponErrors.discount_type && (
            <span className="field-error">
              {couponErrors.discount_type}
            </span>
          )}

        </div>


      

        <div className="coupon-form-group discount-help-group">

          <label>
            Discount Value <span>*</span>
          </label>

          <input
            type="number"
            name="discount_value"
            value={couponForm.discount_value}
            onChange={handleCouponChange}
            placeholder={
              couponForm.discount_type ===
              "percentage"
                ? "e.g. 20"
                : "e.g. 100"
            }
            min="0"
            max={
              couponForm.discount_type ===
              "percentage"
                ? "100"
                : undefined
            }
            className={
              couponErrors.discount_value
                ? "input-error"
                : ""
            }
          />

          {couponForm.discount_type && (

            <>

              <small className="discount-field-help">

                {couponForm.discount_type ===
                "percentage"

                  ? "Enter the percentage discount. Maximum allowed is 100%."

                  : "Enter the fixed amount to deduct from the bill."}

              </small>

              <div className="discount-field-example">

                <strong>
                  Example:
                </strong>{" "}

                {couponForm.discount_type ===
                "percentage"

                  ? "Enter 20 → customer gets 20% off."

                  : "Enter 100 → customer gets ₹100 off."}

              </div>

            </>

          )}

          {couponErrors.discount_value && (
            <span className="field-error">
              {couponErrors.discount_value}
            </span>
          )}

        </div>


      

        <div className="coupon-form-group discount-help-group">

          <label>
            Minimum Bill
          </label>

          <input
            type="number"
            name="min_amount"
            value={couponForm.min_amount}
            onChange={handleCouponChange}
            placeholder="Optional"
            min="0"
            className={
              couponErrors.min_amount
                ? "input-error"
                : ""
            }
          />

          {couponForm.discount_type && (

            <>

              <small className="discount-field-help">

                Coupon will apply only when
                the customer's bill reaches
                this minimum amount.

              </small>

              <div className="discount-field-example">

                <strong>
                  Example:
                </strong>{" "}
                Enter ₹499 → coupon applies
                only when the bill is ₹499
                or more.

              </div>

            </>

          )}

          {couponErrors.min_amount && (
            <span className="field-error">
              {couponErrors.min_amount}
            </span>
          )}

        </div>


      

        <div className="coupon-form-group discount-help-group">

          <label>
            Maximum Discount
          </label>

          <input
            type="number"
            name="max_discount_amount"
            value={couponForm.max_discount_amount}
            onChange={handleCouponChange}
            placeholder={
              couponForm.discount_type ===
              "flat"
                ? "Not applicable"
                : "Optional"
            }
            disabled={
              couponForm.discount_type ===
              "flat"
            }
            min="0"
            className={
              couponErrors.max_discount_amount
                ? "input-error"
                : ""
            }
          />

          {couponForm.discount_type && (

            <>

              <small className="discount-field-help">

                {couponForm.discount_type ===
                "percentage"

                  ? "Sets the maximum ₹ amount that can be discounted."

                  : "Not required because Flat discount is already fixed."}

              </small>

              <div className="discount-field-example">

                <strong>
                  Example:
                </strong>{" "}

                {couponForm.discount_type ===
                "percentage"

                  ? "20% of ₹10,000 = ₹2,000, but maximum ₹200 → customer gets only ₹200 off."

                  : "Flat ₹100 discount is already fixed, so maximum discount is not required."}

              </div>

            </>

          )}

          {couponErrors.max_discount_amount && (
            <span className="field-error">
              {couponErrors.max_discount_amount}
            </span>
          )}

        </div>


       

        <div className="coupon-form-group">

          <label>
            Select Date and Time
          </label>

          <input
            type="datetime-local"
            name="starts_at"
            value={couponForm.starts_at}
            onChange={handleCouponChange}
            className={
              couponErrors.starts_at
                ? "input-error"
                : ""
            }
          />

          {couponErrors.starts_at && (
            <span className="field-error">
              {couponErrors.starts_at}
            </span>
          )}

        </div>


     

        <div className="coupon-form-group">

          <label>
            Select Expire Date and Time
          </label>

          <input
            type="datetime-local"
            name="expires_at"
            value={couponForm.expires_at}
            onChange={handleCouponChange}
            className={
              couponErrors.expires_at
                ? "input-error"
                : ""
            }
          />

          {couponErrors.expires_at && (
            <span className="field-error">
              {couponErrors.expires_at}
            </span>
          )}

        </div>


        

        <div className="coupon-form-group">

          <label>
            Maximum Total Uses
          </label>

          <input
            type="number"
            name="max_total_uses"
            value={couponForm.max_total_uses}
            onChange={handleCouponChange}
            placeholder="e.g. 100 — total coupon uses"
            min="1"
            className={
              couponErrors.max_total_uses
                ? "input-error"
                : ""
            }
          />

          {couponErrors.max_total_uses && (
            <span className="field-error">
              {couponErrors.max_total_uses}
            </span>
          )}

        </div>


      

        <div className="coupon-form-group">

          <label>
            Maximum Uses Per Customer
          </label>

          <input
            type="number"
            name="max_uses_per_customer"
            value={couponForm.max_uses_per_customer}
            onChange={handleCouponChange}
            placeholder="e.g. 2 — uses allowed per customer"
            min="1"
            className={
              couponErrors.max_uses_per_customer
                ? "input-error"
                : ""
            }
          />

          {couponErrors.max_uses_per_customer && (
            <span className="field-error">
              {couponErrors.max_uses_per_customer}
            </span>
          )}

        </div>
<div className="coupon-form-group visibility-form-group">

          <label>
            Applies To <span>*</span>
          </label>

          <select
            name="applies_to"
            value={couponForm.applies_to}
            onChange={handleCouponChange}
            className={
              couponErrors.applies_to
                ? "input-error"
                : ""
            }
          >

            <option value="">
              Select Applies To
            </option>

            <option value="order">
              Order
            </option>

            <option value="consultation">
              Consultation
            </option>

            <option value="both">
              Both
            </option>

          </select>

          {couponForm.applies_to && (

            <small className="discount-field-help">

              {couponForm.applies_to === "order"
                ? "Coupon will apply to orders."
                : couponForm.applies_to === "consultation"
                ? "Coupon will apply to consultations."
                : "Coupon will apply to both orders and consultations."}

            </small>

          )}

          {couponErrors.applies_to && (
            <span className="field-error">
              {couponErrors.applies_to}
            </span>
          )}

        </div>

        {/* =================================================
            COUPON IMAGE
        ================================================= */}

        <div className="coupon-form-group full">

          <label>
            Coupon Image
          </label>

          <div className="upload-box1">

            <input
              ref={couponFileRef}
              type="file"
              accept="image/*"
              id="couponUpload"
              onChange={(e) => {

                const file =
                  e.target.files[0];

                if (file) {

                  setCouponImage(file);

                  setCouponErrors(
                    (prev) => ({
                      ...prev,
                      image_url: "",
                    })
                  );

                }

              }}
            />

            {couponImage ? (

              <div className="banner-preview-wrapper">

                <div className="banner-preview-left">

                  <img
                    src={URL.createObjectURL(
                      couponImage
                    )}
                    alt="Coupon preview"
                    className="banner-preview-image"
                  />

                </div>


                <div className="banner-preview-actions">

                  <button
                    type="button"
                    className="preview-btn"
                    onClick={() =>
                      window.open(
                        URL.createObjectURL(
                          couponImage
                        ),
                        "_blank"
                      )
                    }
                  >
                    <FiEye />
                  </button>


                  <button
                    type="button"
                    className="delete-btn-preview"
                    onClick={() => {

                      setCouponImage(null);

                      if (
                        couponFileRef.current
                      ) {
                        couponFileRef.current.value =
                          "";
                      }

                    }}
                  >
                    <FiTrash2 />
                  </button>

                </div>

              </div>

            ) : (

              <label
                htmlFor="couponUpload"
                className="upload-label"
              >

                <div className="upload-content">

                  <span className="upload-icon">
                    ⬆
                  </span>

                  <p>
                    Click to upload coupon image
                  </p>

                  <span className="upload-hint">
                    PNG, JPG, JPEG
                  </span>

                </div>

              </label>

            )}

          </div>

          {couponErrors.image_url && (
            <span className="field-error">
              {couponErrors.image_url}
            </span>
          )}

        </div>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <div className="coupon-form-group full">

          <label>
            Description
          </label>

          <textarea
            name="description"
            value={couponForm.description}
            onChange={handleCouponChange}
            placeholder="Enter coupon description..."
            rows="3"
            className={
              couponErrors.description
                ? "input-error"
                : ""
            }
          />

          {couponErrors.description && (
            <span className="field-error">
              {couponErrors.description}
            </span>
          )}

        </div>


        {/* =================================================
            ACTIVE
        ================================================= */}

        <div className="coupon-active-row">

          <div>

            <label>
              Active
            </label>

            <p>
              Enable this coupon
            </p>

          </div>


          <label className="coupon-switch">

            <input
              type="checkbox"
              name="is_active"
              checked={
                couponForm.is_active
              }
              onChange={
                handleCouponChange
              }
            />

            <span className="coupon-switch-slider"></span>

          </label>

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="coupon-modal-footer">

          <button
            type="button"
            className="coupon-cancel-btn"
            onClick={() => {

              resetCouponForm();

              setShowAddCouponModal(
                false
              );

            }}
            disabled={
              submitLoading
            }
          >
            Cancel
          </button>


          <button
            type="submit"
            className="coupon-submit-btn"
            disabled={
              submitLoading
            }
          >

            {submitLoading
              ? "Creating..."
              : "Create Coupon"}

          </button>

        </div>

      </form>

    </div>

  </div>

)}
{showEditCouponModal && (
  <div className="coupon-modal-overlay">

    <div className="coupon-modal">

      {/* HEADER */}

      <div className="coupon-modal-header">

        <div>
          <h2>
            Edit Coupon
          </h2>

          <p>
            Update coupon details
          </p>
        </div>

        <button
          type="button"
          className="coupon-modal-close"
          onClick={() => {
            if (!editSubmitLoading) {
              resetEditCouponForm();
              setShowEditCouponModal(false);
              setSelectedCoupon(null);
            }
          }}
        >
          <FaTimes />
        </button>

      </div>


      <form
        className="coupon-form"
        onSubmit={handleUpdateCoupon}
      >

        {/* COUPON CODE */}

        <div className="coupon-form-group">

          <label>
            Coupon Code <span>*</span>
          </label>

          <input
            type="text"
            name="code"
            value={editCouponForm.code}
            onChange={handleEditCouponChange}
            placeholder="e.g. AYUR20"
            maxLength={30}
            autoComplete="off"
            className={
              editCouponErrors.code
                ? "input-error"
                : ""
            }
          />

          {editCouponErrors.code && (
            <span className="field-error">
              {editCouponErrors.code}
            </span>
          )}

        </div>


        {/* SERVICE CATEGORY */}

        <div className="coupon-form-group">

          <label>
            Service Category <span>*</span>
          </label>

          <select
            name="service_category_id"
            value={
              editCouponForm.service_category_id
            }
            onChange={
              handleEditCouponChange
            }
            className={
              editCouponErrors.service_category_id
                ? "input-error"
                : ""
            }
          >

            <option value="">
              {loadingCategories
                ? "Loading categories..."
                : "Select Service Category"}
            </option>

            {!loadingCategories &&
              serviceCategories
                .filter(
                  (category) =>
                    category.is_active === true ||
                    category.is_active === "true"
                )
                .map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}

          </select>

          {editCouponErrors.service_category_id && (
            <span className="field-error">
              {
                editCouponErrors
                  .service_category_id
              }
            </span>
          )}

        </div>


   

        <div className="coupon-form-group visibility-form-group">

          <label>
            Visibility <span>*</span>
          </label>

          <div className="visibility-dropdown">

            <button
              type="button"
              className={`visibility-select ${
                editVisibilityOpen
                  ? "visibility-select-open"
                  : ""
              } ${
                editCouponErrors.visibility
                  ? "input-error"
                  : ""
              }`}
              onClick={() =>
                setEditVisibilityOpen(
                  (prev) => !prev
                )
              }
            >

              <span>
                {editCouponForm.visibility ===
                "general"
                  ? "General"
                  : editCouponForm.visibility ===
                    "private"
                  ? "Private"
                  : "Select Visibility"}
              </span>

              <span
                className={`visibility-arrow ${
                  editVisibilityOpen
                    ? "rotate"
                    : ""
                }`}
              >
                ▾
              </span>

            </button>


            {editVisibilityOpen && (
              <div className="visibility-menu">

                <div className="visibility-info">

                  <FaCircleQuestion
                    size={20}
                  />

                  <span>
                    Select General for all
                    eligible customers or
                    Private for selected
                    customers only.
                  </span>

                </div>


                {/* GENERAL */}

                <button
                  type="button"
                  className={`visibility-option ${
                    editCouponForm.visibility ===
                    "general"
                      ? "visibility-option-selected"
                      : ""
                  }`}
                  onClick={() => {

                    setEditCouponForm(
                      (prev) => ({
                        ...prev,
                        visibility:
                          "general",
                      })
                    );

                    setEditCouponErrors(
                      (prev) => ({
                        ...prev,
                        visibility: "",
                      })
                    );

                    setEditVisibilityOpen(
                      false
                    );
                  }}
                >

                  <span className="visibility-option-left">

                    <span className="visibility-icon general-icon">
                      <FaGlobe size={18} />
                    </span>

                    <span className="visibility-option-content">

                      <strong>
                        General
                      </strong>

                      <small>
                        Visible to all
                        eligible customers.
                      </small>

                    </span>

                  </span>

                  {editCouponForm.visibility ===
                    "general" && (
                    <FaCircleCheck
                      className="visibility-check"
                      size={18}
                    />
                  )}

                </button>


                {/* PRIVATE */}

                <button
                  type="button"
                  className={`visibility-option ${
                    editCouponForm.visibility ===
                    "private"
                      ? "visibility-option-selected"
                      : ""
                  }`}
                  onClick={() => {

                    setEditCouponForm(
                      (prev) => ({
                        ...prev,
                        visibility:
                          "private",
                      })
                    );

                    setEditCouponErrors(
                      (prev) => ({
                        ...prev,
                        visibility: "",
                      })
                    );

                    setEditVisibilityOpen(
                      false
                    );
                  }}
                >

                  <span className="visibility-option-left">

                    <span className="visibility-icon private-icon">
                      <FaLock size={18} />
                    </span>

                    <span className="visibility-option-content">

                      <strong>
                        Private
                      </strong>

                      <small>
                        Visible only to
                        selected customers.
                      </small>

                    </span>

                  </span>

                  {editCouponForm.visibility ===
                    "private" && (
                    <FaCircleCheck
                      className="visibility-check"
                      size={18}
                    />
                  )}

                </button>

              </div>
            )}

          </div>

          {editCouponErrors.visibility && (
            <span className="field-error">
              {editCouponErrors.visibility}
            </span>
          )}

        </div>



        <div className="coupon-form-group visibility-form-group">

          <label>
            Source <span>*</span>
          </label>

          <select
            name="source"
            value={editCouponForm.source}
            onChange={handleEditCouponChange}
            className={
              editCouponErrors.source
                ? "input-error"
                : ""
            }
          >

            <option value="">
              Select Source
            </option>

            <option value="campaign">
              Campaign
            </option>

            <option value="referral">
              Referral
            </option>

            <option value="reward">
              Reward
            </option>

            <option value="loyalty">
              Loyalty
            </option>

            <option value="admin">
              Admin
            </option>

          </select>

          {editCouponErrors.source && (
            <span className="field-error">
              {editCouponErrors.source}
            </span>
          )}

        </div>


        {/* DISCOUNT TYPE */}

        <div className="coupon-form-group visibility-form-group">

          <label>
            Discount Type <span>*</span>
          </label>

          <select
            name="discount_type"
            value={
              editCouponForm.discount_type
            }
            onChange={(e) => {

              handleEditCouponChange(e);

              if (
                e.target.value === "flat"
              ) {
                setEditCouponForm(
                  (prev) => ({
                    ...prev,
                    max_discount_amount:
                      "",
                  })
                );
              }

            }}
            className={
              editCouponErrors.discount_type
                ? "input-error"
                : ""
            }
          >

            <option value="">
              Select Discount Type
            </option>

            <option value="flat">
              Flat (₹ off)
            </option>

            <option value="percentage">
              Percentage (% off)
            </option>

          </select>

          {editCouponErrors.discount_type && (
            <span className="field-error">
              {
                editCouponErrors
                  .discount_type
              }
            </span>
          )}

        </div>


        {/* DISCOUNT VALUE */}

        <div className="coupon-form-group discount-help-group">

          <label>
            Discount Value <span>*</span>
          </label>

          <input
            type="number"
            name="discount_value"
            value={
              editCouponForm.discount_value
            }
            onChange={
              handleEditCouponChange
            }
            placeholder={
              editCouponForm.discount_type ===
              "percentage"
                ? "e.g. 20"
                : "e.g. 100"
            }
            min="0"
            max={
              editCouponForm.discount_type ===
              "percentage"
                ? "100"
                : undefined
            }
            className={
              editCouponErrors.discount_value
                ? "input-error"
                : ""
            }
          />

          {editCouponErrors.discount_value && (
            <span className="field-error">
              {
                editCouponErrors
                  .discount_value
              }
            </span>
          )}

        </div>


        {/* MINIMUM BILL */}

        <div className="coupon-form-group discount-help-group">

          <label>
            Minimum Bill
          </label>

          <input
            type="number"
            name="min_amount"
            value={
              editCouponForm.min_amount
            }
            onChange={
              handleEditCouponChange
            }
            placeholder="Optional"
            min="0"
            className={
              editCouponErrors.min_amount
                ? "input-error"
                : ""
            }
          />

          {editCouponErrors.min_amount && (
            <span className="field-error">
              {
                editCouponErrors
                  .min_amount
              }
            </span>
          )}

        </div>


        {/* MAX DISCOUNT */}

        <div className="coupon-form-group discount-help-group">

          <label>
            Maximum Discount
          </label>

          <input
            type="number"
            name="max_discount_amount"
            value={
              editCouponForm.max_discount_amount
            }
            onChange={
              handleEditCouponChange
            }
            placeholder={
              editCouponForm.discount_type ===
              "flat"
                ? "Not applicable"
                : "Optional"
            }
            disabled={
              editCouponForm.discount_type ===
              "flat"
            }
            min="0"
            className={
              editCouponErrors.max_discount_amount
                ? "input-error"
                : ""
            }
          />

          {editCouponErrors.max_discount_amount && (
            <span className="field-error">
              {
                editCouponErrors
                  .max_discount_amount
              }
            </span>
          )}

        </div>


        {/* START DATE */}

        <div className="coupon-form-group">

          <label>
            Select Date and Time
          </label>

          <input
            type="datetime-local"
            name="starts_at"
            value={
              editCouponForm.starts_at
            }
            onChange={
              handleEditCouponChange
            }
            className={
              editCouponErrors.starts_at
                ? "input-error"
                : ""
            }
          />

        </div>


        {/* EXPIRY */}

        <div className="coupon-form-group">

          <label>
            Select Expire Date and Time
          </label>

          <input
            type="datetime-local"
            name="expires_at"
            value={
              editCouponForm.expires_at
            }
            onChange={
              handleEditCouponChange
            }
            className={
              editCouponErrors.expires_at
                ? "input-error"
                : ""
            }
          />

          {editCouponErrors.expires_at && (
            <span className="field-error">
              {
                editCouponErrors
                  .expires_at
              }
            </span>
          )}

        </div>


        {/* MAX TOTAL USES */}

        <div className="coupon-form-group">

          <label>
            Maximum Total Uses
          </label>

          <input
            type="number"
            name="max_total_uses"
            value={
              editCouponForm.max_total_uses
            }
            onChange={
              handleEditCouponChange
            }
            placeholder="Optional"
            min="1"
          />

          {editCouponErrors.max_total_uses && (
            <span className="field-error">
              {
                editCouponErrors
                  .max_total_uses
              }
            </span>
          )}

        </div>


        {/* MAX USES PER CUSTOMER */}

        <div className="coupon-form-group">

          <label>
            Maximum Uses Per Customer
          </label>

          <input
            type="number"
            name="max_uses_per_customer"
            value={
              editCouponForm.max_uses_per_customer
            }
            onChange={
              handleEditCouponChange
            }
            placeholder="Optional"
            // min="1"
          />

          {editCouponErrors.max_uses_per_customer && (
            <span className="field-error">
              {
                editCouponErrors
                  .max_uses_per_customer
              }
            </span>
          )}

        </div>


        {/* APPLIES TO */}

        <div className="coupon-form-group">

          <label>
            Applies To <span>*</span>
          </label>

          <select
            name="applies_to"
            value={
              editCouponForm.applies_to
            }
            onChange={
              handleEditCouponChange
            }
            className={
              editCouponErrors.applies_to
                ? "input-error"
                : ""
            }
          >

            <option value="">
              Select Applies To
            </option>

            <option value="order">
              Order
            </option>

            <option value="consultation">
              Consultation
            </option>

            <option value="both">
              Both
            </option>

          </select>

          {editCouponErrors.applies_to && (
            <span className="field-error">
              {
                editCouponErrors.applies_to
              }
            </span>
          )}

        </div>


        {/* IMAGE */}

        <div className="coupon-form-group full">

          <label>
            Coupon Image
          </label>

          <div className="upload-box1">

            <input
              ref={editCouponFileRef}
              type="file"
              accept="image/*"
              id="editCouponUpload"
              onChange={(e) => {

                const file =
                  e.target.files[0];

                if (file) {
                  setEditCouponImage(file);

                  setEditCouponErrors(
                    (prev) => ({
                      ...prev,
                      image_url: "",
                    })
                  );
                }

              }}
            />


            {editCouponImage ? (

              <div className="banner-preview-wrapper">

                <div className="banner-preview-left">

                  <img
                    src={
                      URL.createObjectURL(
                        editCouponImage
                      )
                    }
                    alt="Coupon preview"
                    className="banner-preview-image"
                  />

                </div>

                <div className="banner-preview-actions">

                  <button
                    type="button"
                    className="preview-btn"
                    onClick={() =>
                      window.open(
                        URL.createObjectURL(
                          editCouponImage
                        ),
                        "_blank"
                      )
                    }
                  >
                    <FiEye />
                  </button>

                  <button
                    type="button"
                    className="delete-btn-preview"
                    onClick={() => {

                      setEditCouponImage(
                        null
                      );

                      if (
                        editCouponFileRef.current
                      ) {
                        editCouponFileRef.current.value =
                          "";
                      }

                    }}
                  >
                    <FiTrash2 />
                  </button>

                </div>

              </div>

            ) : editExistingImage ? (

              <div className="banner-preview-wrapper">

                <div className="banner-preview-left">

                  <img
                    src={editExistingImage}
                    alt="Existing coupon"
                    className="banner-preview-image"
                  />

                </div>

                <div className="banner-preview-actions">

                  <button
                    type="button"
                    className="preview-btn"
                    onClick={() =>
                      window.open(
                        editExistingImage,
                        "_blank"
                      )
                    }
                  >
                    <FiEye />
                  </button>

                  <button
                    type="button"
                    className="delete-btn-preview"
                    onClick={() => {

                      setEditExistingImage("");

                    }}
                  >
                    <FiTrash2 />
                  </button>

                </div>

              </div>

            ) : (

              <label
                htmlFor="editCouponUpload"
                className="upload-label"
              >

                <div className="upload-content">

                  <span className="upload-icon">
                    ⬆
                  </span>

                  <p>
                    Click to upload coupon image
                  </p>

                  <span className="upload-hint">
                    PNG, JPG, JPEG
                  </span>

                </div>

              </label>

            )}

          </div>

        </div>


        {/* DESCRIPTION */}

        <div className="coupon-form-group full">

          <label>
            Description
          </label>

          <textarea
            name="description"
            value={
              editCouponForm.description
            }
            onChange={
              handleEditCouponChange
            }
            placeholder="Enter coupon description..."
            rows="3"
          />

        </div>


        {/* ACTIVE */}

        <div className="coupon-active-row">

          <div>

            <label>
              Active
            </label>

            <p>
              Enable this coupon
            </p>

          </div>

          <label className="coupon-switch">

            <input
              type="checkbox"
              name="is_active"
              checked={
                editCouponForm.is_active
              }
              onChange={
                handleEditCouponChange
              }
            />

            <span className="coupon-switch-slider"></span>

          </label>

        </div>


        {/* FOOTER */}

        <div className="coupon-modal-footer">

          <button
            type="button"
            className="coupon-cancel-btn"
            onClick={() => {

              resetEditCouponForm();

              setShowEditCouponModal(false);

              setSelectedCoupon(null);

            }}
            disabled={
              editSubmitLoading
            }
          >
            Cancel
          </button>

          <button
            type="submit"
            className="coupon-submit-btn"
            disabled={
              editSubmitLoading
            }
          >
            {editSubmitLoading
              ? "Updating..."
              : "Update Coupon"}
          </button>

        </div>

      </form>

    </div>

  </div>
)}
     
      {deleteModal && (
  <div className="modal">
    <div className="modal-content">
      <h3>
        Are you sure you want to delete this Coupon?
      </h3>

      <div className="form-buttons">
        <button
          className="otp-btn verify-btn"
          onClick={() => {
            handleDelete(CouponId);
            setDeleteModal(false);
          }}
        >
          Yes
        </button>

        <button
          onClick={() => setDeleteModal(false)}
        >
          No
        </button>
      </div>
    </div>
  </div>
)}
      <ToastContainer
        position="top-center"
        autoClose={2000}
      />

    </>

  );

};


export default Coupon;