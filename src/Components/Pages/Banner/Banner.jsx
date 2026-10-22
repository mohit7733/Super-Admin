import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaImages,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
} from "react-icons/fa";

import { FiTrash2, FiEye, FiUpload } from "react-icons/fi";

import { BsPlus } from "react-icons/bs";

import BASE_URL from "../../../Base";
import { toast } from "react-toastify";

const BRAND_PREFIX = "CategoryProduct/";

const Banner = () => {
  const navigate = useNavigate();

  // =========================================================
  // BANNER STATES
  // =========================================================

  const [BannerData, setBannerData] = useState([]);
  const [BannerLoading, setBannerLoading] = useState(false);
  const [Error, setError] = useState(null);

  const [showBannerModal, setShowBannerModal] = useState(false);
  const [addbannerLoading, setaddbannerloading] = useState(false);

  const [BannerError, setBannerError] = useState({});
  const [BannerImage, setBannerImage] = useState(null);

  const [DeleteBannerModal, setDeleteBannerModal] = useState(false);
  const [SelectedBanner, setSelectedBanner] = useState(null);
  const [BannerPreviewImage, setBannerPreviewImage] = useState("");

  // =========================================================
  // CATEGORY / SERVICE / BRAND STATES
  // =========================================================

  const [CategoryData, setCategoryData] = useState([]);
  const [CategoryLoading, setCategoryLoading] = useState(false);
  const [CategoryError, setCategoryError] = useState(null);

  const [ServiceData, setServiceData] = useState([]);
  const [ServiceLoading, setServiceLoading] = useState(false);
  const [ServiceError, setServiceError] = useState(null);

  const [BrandData, setBrandData] = useState([]);
  const [BrandLoading, setBrandLoading] = useState(false);
  const [BrandError, setBrandError] = useState(null);

  // ADD: type + brand
  const [bannerType, setBannerType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  // EDIT: type + brand
  const [editBannerType, setEditBannerType] = useState("");
  const [editSelectedBrand, setEditSelectedBrand] = useState("");

  // =========================================================
  // EDIT STATES
  // =========================================================

  const [showEditModal, setShowEditModal] = useState(false);
  const [editBannerId, setEditBannerId] = useState(null);
  const [editBannerImage, setEditBannerImage] = useState(null);
  const [editBannerError, setEditBannerError] = useState({});
  const [updateBannerLoading, setUpdateBannerLoading] = useState(false);

  const initialBannerForm = {
    image_url: null,
    redirect_url: "",
    service_category_id: "",
    service_id: "",
    is_active: false,
  };

  const [bannerForm, setBannerForm] = useState(initialBannerForm);

  const initialEditBannerForm = {
    image_url: "",
    redirect_url: "",
    service_category_id: "",
    service_id: "",
    is_active: false,
  };

  const [editBannerForm, setEditBannerForm] = useState(initialEditBannerForm);

  // =========================================================
  // MAPS
  // =========================================================

  const serviceCategoryMap = {
    doctors: "consultation",
    doctor: "consultation",

    products: "product",
    product: "product",

    diets: "diet",
    diet: "diet",

    medicine: "medicine",
    medicines: "medicine",

    yoga: "yoga",
    yogas: "yoga",
  };

  const screenMap = {
    doctors: { base: "ConsultScreen", detail: "DoctorProfile" },
    doctor: { base: "ConsultScreen", detail: "DoctorProfile" },

    products: { base: "ProductsScreen", detail: "ProductDetails" },
    product: { base: "ProductsScreen", detail: "ProductDetails" },

    diets: { base: "DietScreen", detail: "DietDetails" },
    diet: { base: "DietScreen", detail: "DietDetails" },

    medicine: { base: "MedicineScreen", detail: "ProductDetails" },
    medicines: { base: "MedicineScreen", detail: "ProductDetails" },

    yoga: { base: "YogaScreen", detail: "YogaSession" },
    yogas: { base: "YogaScreen", detail: "YogaSession" },
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const getCategoryName = (categoryId) => {
    const category = CategoryData.find(
      (cat) => String(cat.id) === String(categoryId)
    );

    return category?.name?.trim().toLowerCase();
  };

  const isVariantCategory = (categoryName) =>
    categoryName === "product" ||
    categoryName === "products" ||
    categoryName === "medicine" ||
    categoryName === "medicines";

  const getServiceId = (service) => {
    const categoryName = getCategoryName(bannerForm.service_category_id);

    if (isVariantCategory(categoryName)) {
      return service?.variant_id || "";
    }

    return service?.id || "";
  };

  const getEditServiceId = (service) => {
    const categoryName = getCategoryName(editBannerForm.service_category_id);

    if (isVariantCategory(categoryName)) {
      return service?.variant_id || "";
    }

    return service?.id || "";
  };

  const getServiceLabel = (service, categoryName) => {
    if (isVariantCategory(categoryName)) {
      return service?.variant_name || service?.name || "Unnamed Service";
    }

    return service?.name || "Unnamed Service";
  };

  // Sirf active services dikhane ke liye
  const getActiveServices = () =>
    ServiceData.filter((service) => service?.is_active !== false);

  const handleSessionExpired = () => {
    sessionStorage.removeItem("superadmin_token");
    toast.error("Session expired. Please login again");
    navigate("/login");
  };

  const resetBannerForm = () => {
    setBannerForm(initialBannerForm);
    setBannerImage(null);
    setBannerError({});
    setServiceData([]);
    setServiceError(null);
    setBannerType("");
    setSelectedBrand("");
  };

  const resetEditBannerForm = () => {
    setEditBannerForm(initialEditBannerForm);
    setEditBannerImage(null);
    setEditBannerId(null);
    setEditBannerError({});
    setServiceData([]);
    setServiceError(null);
    setEditBannerType("");
    setEditSelectedBrand("");
  };

  // =========================================================
  // API: CATEGORY
  // =========================================================

  const getCategoryList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setCategoryLoading(true);
    setCategoryError(null);

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
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      if (data.success) {
        const categories = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data?.results)
            ? data.data.results
            : [];

        setCategoryData(categories);
      } else {
        setCategoryData([]);
        setCategoryError(data.message || "Failed to fetch categories");
        toast.error(data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Category Fetch Error:", error);
      setCategoryData([]);
      setCategoryError("Failed to fetch categories");
      toast.error("Failed to fetch categories");
    } finally {
      setCategoryLoading(false);
    }
  };

  // =========================================================
  // API: SERVICES
  // =========================================================

  const getServiceList = async (categorySlug) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    if (!categorySlug) {
      setServiceData([]);
      return;
    }

    setServiceLoading(true);
    setServiceError(null);

    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/services/?category=${encodeURIComponent(
          categorySlug
        )}`,
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
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      if (data.success) {
        const services = Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.data?.results)
            ? data.data.results
            : Array.isArray(data.data?.services)
              ? data.data.services
              : [];

        setServiceData(services);
      } else {
        setServiceData([]);
        setServiceError(data.message || "Failed to fetch services");
        toast.error(data.message || "Failed to fetch services");
      }
    } catch (error) {
      console.error("Service Fetch Error:", error);
      setServiceData([]);
      setServiceError("Failed to fetch services");
      toast.error("Failed to fetch services");
    } finally {
      setServiceLoading(false);
    }
  };

  // =========================================================
  // TYPE HANDLERS (ADD + EDIT)
  // =========================================================

  const handleTypeChange = (type) => {
    setBannerType(type);
    setSelectedBrand("");
    setBannerError({});
    setServiceData([]);

    let redirectUrl = "";

    if (type === "service") {
      const categoryName = getCategoryName(bannerForm.service_category_id);
      redirectUrl = screenMap[categoryName]?.base || "";

      const serviceCategory = serviceCategoryMap[categoryName];
      if (serviceCategory) getServiceList(serviceCategory);
    }

    setBannerForm((prev) => ({
      ...prev,
      service_id: "",
      redirect_url: redirectUrl,
    }));
  };

  const handleEditTypeChange = (type) => {
    setEditBannerType(type);
    setEditSelectedBrand("");
    setEditBannerError({});
    setServiceData([]);

    let redirectUrl = "";

    if (type === "service") {
      const categoryName = getCategoryName(editBannerForm.service_category_id);
      redirectUrl = screenMap[categoryName]?.base || "";

      const serviceCategory = serviceCategoryMap[categoryName];
      if (serviceCategory) getServiceList(serviceCategory);
    }

    setEditBannerForm((prev) => ({
      ...prev,
      service_id: "",
      redirect_url: redirectUrl,
    }));
  };

  // =========================================================
  // CHANGE HANDLER (ADD)
  // =========================================================

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    // ---------------- CATEGORY ----------------
    if (name === "service_category_id") {
      const categoryName = getCategoryName(value);
      const serviceCategory = serviceCategoryMap[categoryName];
      const config = screenMap[categoryName];

      setServiceData([]);

      // Brand type: category sirf save hogi, redirect_url nahi badlega
      if (bannerType === "brand") {
        setBannerForm((prev) => ({ ...prev, service_category_id: value }));
        return;
      }

      // Category hata di to Service type bhi hata do
      if (!value) setBannerType("");

      setBannerForm((prev) => ({
        ...prev,
        service_category_id: value,
        service_id: "",
        redirect_url:
          value && bannerType === "service" ? config?.base || "" : "",
      }));

      if (value && bannerType === "service" && serviceCategory) {
        getServiceList(serviceCategory);
      }

      setBannerError((prev) => ({
        ...prev,
        service_category_id: "",
        service_id: "",
        redirect_url: "",
      }));

      return;
    }

    // ---------------- SERVICE ----------------
    if (name === "service_id") {
      const categoryName = getCategoryName(bannerForm.service_category_id);
      const config = screenMap[categoryName];

      let redirectUrl = "";

      if (config) {
        if (value && config.detail) {
          redirectUrl = `${config.detail}/${value}`;
        } else {
          redirectUrl = config.base;
        }
      }

      setBannerForm((prev) => ({
        ...prev,
        service_id: value,
        redirect_url: redirectUrl,
      }));

      setBannerError((prev) => ({
        ...prev,
        service_id: "",
        redirect_url: "",
      }));

      return;
    }

    // ---------------- OTHER INPUTS ----------------
    setBannerForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setBannerError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =========================================================
  // CHANGE HANDLER (EDIT)
  // =========================================================

  const handleEditChange = (e) => {
    const { name, value, checked, type } = e.target;

    // ---------------- CATEGORY ----------------
    if (name === "service_category_id") {
      const categoryName = getCategoryName(value);
      const serviceCategory = serviceCategoryMap[categoryName];
      const config = screenMap[categoryName];

      setServiceData([]);

      if (editBannerType === "brand") {
        setEditBannerForm((prev) => ({ ...prev, service_category_id: value }));
        return;
      }

      if (!value) setEditBannerType("");

      setEditBannerForm((prev) => ({
        ...prev,
        service_category_id: value,
        service_id: "",
        redirect_url:
          value && editBannerType === "service" ? config?.base || "" : "",
      }));

      if (value && editBannerType === "service" && serviceCategory) {
        getServiceList(serviceCategory);
      }

      setEditBannerError((prev) => ({
        ...prev,
        service_category_id: "",
        service_id: "",
        redirect_url: "",
      }));

      return;
    }

    // ---------------- SERVICE ----------------
    if (name === "service_id") {
      const categoryName = getCategoryName(editBannerForm.service_category_id);
      const config = screenMap[categoryName];

      let redirectUrl = "";

      if (config) {
        if (value && config.detail) {
          redirectUrl = `${config.detail}/${value}`;
        } else {
          redirectUrl = config.base;
        }
      }

      setEditBannerForm((prev) => ({
        ...prev,
        service_id: value,
        redirect_url: redirectUrl,
      }));

      setEditBannerError((prev) => ({
        ...prev,
        service_id: "",
        redirect_url: "",
      }));

      return;
    }

    // ---------------- OTHER INPUTS ----------------
    setEditBannerForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setEditBannerError((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =========================================================
  // API: UPLOAD IMAGE
  // =========================================================

  const uploadImage = async (file) => {
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

      const response = await fetch(`${BASE_URL}/user/upload/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return null;
      }

      const data = await response.json();

      return data?.data?.url || null;
    } catch (error) {
      console.error("Image Upload Error:", error);
      toast.error("Image upload failed");
      return null;
    }
  };

  // =========================================================
  // API: BRANDS
  // =========================================================

  const getBrandList = async () => {
    try {
      setBrandLoading(true);
      setBrandError(null);

      const token = sessionStorage.getItem("superadmin_token");

      const response = await fetch(`${BASE_URL}/vendors/admin/brand-name/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (data?.success) {
        setBrandData(data?.data || []);
      } else {
        setBrandData([]);
        setBrandError(data?.message || "Failed to fetch brands");
      }
    } catch (error) {
      console.error("Brand API Error:", error);
      setBrandData([]);
      setBrandError("Failed to fetch brands");
    } finally {
      setBrandLoading(false);
    }
  };

  // =========================================================
  // API: BANNERS
  // =========================================================

  const getBannerList = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setBannerLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/user/admin/banner/`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      if (data.success) {
        setBannerData(data?.data || []);
      } else {
        setError(data.message || "Failed to fetch banners");
        toast.error(data.message || "Failed to fetch banners");
      }
    } catch (error) {
      console.error("Banner Fetch Error:", error);
      setError("Something went wrong while fetching banners.");
      toast.error("Failed to fetch banner data");
    } finally {
      setBannerLoading(false);
    }
  };

  useEffect(() => {
    getCategoryList();
    getBannerList();
    getBrandList();
  }, []);

  // =========================================================
  // ADD BANNER
  // =========================================================

  const handleAddBanner = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    const errors = {};

    if (!bannerType) {
      errors.bannerType = "Please select type";
    }

    if (bannerType === "brand" && !selectedBrand) {
      errors.brand = "Please select a brand";
    }

    if (bannerType === "service" && !bannerForm.service_category_id) {
      errors.service_category_id = "Please select a category";
    }

    if (!bannerForm.redirect_url?.trim()) {
      errors.redirect_url = "Redirect URL is required";
    }

    if (!BannerImage) {
      errors.image_url = "Banner image is required";
    }

    if (Object.keys(errors).length > 0) {
      setBannerError(errors);
      return;
    }

    setBannerError({});
    setaddbannerloading(true);

    try {
      const uploadedImageUrl = await uploadImage(BannerImage);

      if (!uploadedImageUrl) {
        toast.error("Image upload failed");
        return;
      }

      const payload = {
        image_url: uploadedImageUrl,
        redirect_url: bannerForm.redirect_url,
        service_category_id: bannerForm.service_category_id || null,
        service_id:
          bannerType === "service" ? bannerForm.service_id || null : null,
        is_active: bannerForm.is_active,
      };

      console.log("FINAL BANNER PAYLOAD:", payload);

      const response = await fetch(`${BASE_URL}/user/admin/banner/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      if (response.ok && data.success !== false) {
        toast.success("Banner Added Successfully");
        resetBannerForm();
        setShowBannerModal(false);
        await getBannerList();
      } else {
        toast.error(data?.message || "Failed to add banner");
      }
    } catch (error) {
      console.error("Add Banner Error:", error);
      toast.error("Something went wrong");
    } finally {
      setaddbannerloading(false);
    }
  };

  // =========================================================
  // UPDATE BANNER
  // =========================================================

  const handleUpdateBanner = async (e) => {
    e.preventDefault();

    const errors = {};

    if (!editBannerType) {
      errors.bannerType = "Please select type";
    }

    if (editBannerType === "brand" && !editSelectedBrand) {
      errors.brand = "Please select a brand";
    }

    if (editBannerType === "service" && !editBannerForm.service_category_id) {
      errors.service_category_id = "Please select a category";
    }

    if (!editBannerForm.redirect_url?.trim()) {
      errors.redirect_url = "Redirect URL is required";
    }

    if (!editBannerImage && !editBannerForm.image_url) {
      errors.image_url = "Banner image is required";
    }

    if (Object.keys(errors).length > 0) {
      setEditBannerError(errors);
      return;
    }

    setEditBannerError({});

    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    setUpdateBannerLoading(true);

    try {
      let imageUrl = editBannerForm.image_url;

      if (editBannerImage) {
        imageUrl = await uploadImage(editBannerImage);
      }

      if (!imageUrl) {
        toast.error("Image upload failed");
        return;
      }

      const payload = {
        image_url: imageUrl,
        redirect_url: editBannerForm.redirect_url,
        service_category_id: editBannerForm.service_category_id || null,
        service_id:
          editBannerType === "service"
            ? editBannerForm.service_id || null
            : null,
        is_active: editBannerForm.is_active,
      };

      console.log("UPDATE BANNER PAYLOAD:", payload);

      const response = await fetch(
        `${BASE_URL}/user/admin/banner/?id=${editBannerId}`,
        {
          method: "PUT",
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
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      if (response.ok && data.success !== false) {
        toast.success("Banner Updated Successfully");
        setShowEditModal(false);
        resetEditBannerForm();
        await getBannerList();
      } else {
        toast.error(data?.message || "Failed to update banner");
      }
    } catch (error) {
      console.error("Update Banner Error:", error);
      toast.error("Something went wrong");
    } finally {
      setUpdateBannerLoading(false);
    }
  };

  // =========================================================
  // DELETE BANNER
  // =========================================================

  const handleDeleteBanner = async () => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    if (!SelectedBanner) return;

    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/banner/?id=${SelectedBanner.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      if (response.ok && data.success !== false) {
        toast.success("Banner deleted successfully 🗑️");
        setDeleteBannerModal(false);
        setSelectedBanner(null);
        await getBannerList();
      } else {
        toast.error(data?.message || "Failed to delete banner");
      }
    } catch (error) {
      console.error("Delete Banner Error:", error);
      toast.error("Failed to delete banner");
    }
  };

  // =========================================================
  // TOGGLE STATUS
  // =========================================================

  const handleToggleBannerStatus = async (bannerId, currentStatus) => {
    const token = sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error("Session expired. Please login again");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/user/admin/banner/?id=${bannerId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({ is_active: !currentStatus }),
        }
      );

      if (response.status === 401 || response.status === 403) {
        handleSessionExpired();
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(
          `Banner ${!currentStatus ? "Activated" : "Deactivated"} Successfully`
        );

        setBannerData((prev) =>
          prev.map((item) =>
            item.id === bannerId
              ? { ...item, is_active: !currentStatus }
              : item
          )
        );
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Toggle Banner Error:", error);
      toast.error("Something went wrong");
    }
  };

  // =========================================================
  // OPEN EDIT MODAL (PREFILL)
  // =========================================================

  const getBannerServiceId = (item) => {
    if (item.service_id) return String(item.service_id);
    if (item.variant_id) return String(item.variant_id);
    if (item.service?.id) return String(item.service.id);

    // Fallback: redirect_url se id nikalo (e.g. ProductDetails/123)
    const url = item.redirect_url || "";

    if (url && !url.startsWith(BRAND_PREFIX) && url.includes("/")) {
      return url.split("/")[1] || "";
    }

    return "";
  };

  const openEditModal = (item) => {
    console.log("EDIT ITEM:", item, "SERVICE ID:", getBannerServiceId(item));

    setEditBannerId(item.id);

    setEditBannerForm({
      image_url: item.image_url || "",
      redirect_url: item.redirect_url || "",
      service_category_id: item.service_category_id || "",
      service_id: getBannerServiceId(item),
      is_active: item.is_active || false,
    });

    setEditBannerImage(null);
    setEditBannerError({});
    setServiceData([]);
    setServiceError(null);

    const isBrand = item.redirect_url?.startsWith(BRAND_PREFIX);

    if (isBrand) {
      setEditBannerType("brand");
      setEditSelectedBrand(item.redirect_url.split("/")[1] || "");
    } else if (item.service_category_id) {
      setEditBannerType("service");
      setEditSelectedBrand("");
    } else {
      setEditBannerType("");
      setEditSelectedBrand("");
    }

    // Service type ke liye services load karo
    if (!isBrand && item.service_category_id) {
      const categoryName = getCategoryName(item.service_category_id);
      const serviceCategory = serviceCategoryMap[categoryName];

      if (serviceCategory) {
        getServiceList(serviceCategory);
      }
    }

    setShowEditModal(true);
  };

  // =========================================================
  // STATS
  // =========================================================

  const totalBanner = BannerData?.length || 0;

  const activeBanner =
    BannerData?.filter((item) => item.is_active === true).length || 0;

  const inactiveBanner =
    BannerData?.filter((item) => item.is_active === false).length || 0;

  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <div className="page-header">
        <h1>Banner Management</h1>

        <p className="page-paragraph">Manage Banner, their details</p>
      </div>

      <div className="vendors-stats stats2-grid">
        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaImages size={16} />
          </div>

          <div className="stat2-info">
            <h3>Total Banner</h3>
            <div className="stat2-value">{totalBanner}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaCheckCircle size={16} />
          </div>

          <div className="stat2-info">
            <h3>Active Banner</h3>
            <div className="stat2-value">{activeBanner}</div>
          </div>
        </div>

        <div className="stat2-card">
          <div
            className="stat2-icon"
            style={{ background: "#0D614E20", color: "#0D614E" }}
          >
            <FaTimesCircle size={16} />
          </div>

          <div className="stat2-info">
            <h3>Inactive Banner</h3>
            <div className="stat2-value">{inactiveBanner}</div>
          </div>
        </div>
      </div>

      <div className="Question-controls">
        <div className="filter-controls">
          <button
            className="add-customer-btn"
            onClick={() => {
              resetBannerForm();
              setShowBannerModal(true);
            }}
          >
            <BsPlus size={18} />
            Add Banner
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {BannerLoading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td colSpan="4">
                      <div className="skeleton-row"></div>
                    </td>
                  </tr>
                ))
            ) : Error ? (
              <tr>
                <td colSpan="4" style={{ color: "red" }}>
                  {Error}
                </td>
              </tr>
            ) : BannerData?.length > 0 ? (
              BannerData.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>

                  <td>
                    <img
                      src={item.image_url}
                      alt="banner"
                      style={{
                        width: "30px",
                        height: "30px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                      onClick={() => setBannerPreviewImage(item.image_url)}
                    />
                  </td>

                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={item.is_active}
                        onChange={() =>
                          handleToggleBannerStatus(item.id, item.is_active)
                        }
                      />

                      <span className="slider round"></span>
                    </label>
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => openEditModal(item)}
                      >
                        <FaEdit />
                      </button>

                      <button
                        className="action-btn delete"
                        onClick={() => {
                          setSelectedBanner(item);
                          setDeleteBannerModal(true);
                        }}
                      >
                        <span className="icon-delete">
                          <FiTrash2 />
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===================================================== */}
      {/* ADD MODAL                                             */}
      {/* ===================================================== */}

      {showBannerModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => {
            resetBannerForm();
            setShowBannerModal(false);
          }}
        >
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Add Banner</h2>

              <button
                className="close-btn"
                onClick={() => {
                  resetBannerForm();
                  setShowBannerModal(false);
                }}
              >
                ✕
              </button>
            </div>

            <form className="prakriti-form" onSubmit={handleAddBanner}>
              {/* CATEGORY */}
              <div className="form-group">
                <label>Select Category</label>

                <select
                  name="service_category_id"
                  value={bannerForm.service_category_id}
                  onChange={handleChange}
                  disabled={CategoryLoading}
                >
                  <option value="">
                    {CategoryLoading
                      ? "Loading categories..."
                      : "Select Category"}
                  </option>

                  {CategoryData?.filter((cat) => cat.is_active === true).map(
                    (cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    )
                  )}
                </select>

                {BannerError.service_category_id && (
                  <p className="error-text">{BannerError.service_category_id}</p>
                )}
              </div>

              {/* TYPE */}
              <div className="form-group">
                <label>Type *</label>

                <div className="type-options">
                  <label>
                    <input
                      type="radio"
                      name="banner_type"
                      checked={bannerType === "brand"}
                      onChange={() => handleTypeChange("brand")}
                    />
                    Brand
                  </label>

                  {bannerForm.service_category_id && (
                    <label>
                      <input
                        type="radio"
                        name="banner_type"
                        checked={bannerType === "service"}
                        onChange={() => handleTypeChange("service")}
                      />
                      Service
                    </label>
                  )}
                </div>

                {BannerError.bannerType && (
                  <p className="error-text">{BannerError.bannerType}</p>
                )}
              </div>

              {/* BRAND */}
              {bannerType === "brand" && (
                <div className="form-group">
                  <label>Brand *</label>

                  <select
                    value={selectedBrand}
                    onChange={(e) => {
                      const brandId = e.target.value;

                      setSelectedBrand(brandId);

                      setBannerForm((prev) => ({
                        ...prev,
                        service_id: "",
                        redirect_url: brandId
                          ? `${BRAND_PREFIX}${brandId}`
                          : "",
                      }));

                      setBannerError((prev) => ({
                        ...prev,
                        brand: "",
                        redirect_url: "",
                      }));
                    }}
                    className="form-control"
                  >
                    <option value="">
                      {BrandLoading ? "Loading brands..." : "Select Brand"}
                    </option>

                    {BrandData.filter((brand) => brand.is_active).map(
                      (brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      )
                    )}
                  </select>

                  {BrandError && <p className="error-text">{BrandError}</p>}

                  {BannerError.brand && (
                    <p className="error-text">{BannerError.brand}</p>
                  )}
                </div>
              )}

              {/* SERVICE (sirf active) */}
              {bannerType === "service" && (
                <div className="form-group">
                  <label>Service</label>

                  <select
                    name="service_id"
                    value={bannerForm.service_id}
                    onChange={handleChange}
                    disabled={ServiceLoading}
                    className="form-control"
                  >
                    <option value="">
                      {ServiceLoading ? "Loading services..." : "Select Service"}
                    </option>

                    {getActiveServices().map((service) => (
                      <option
                        key={getServiceId(service)}
                        value={getServiceId(service)}
                      >
                        {getServiceLabel(
                          service,
                          getCategoryName(bannerForm.service_category_id)
                        )}
                      </option>
                    ))}
                  </select>

                  {ServiceError && <p className="error-text">{ServiceError}</p>}
                </div>
              )}

              {/* REDIRECT URL */}
              <div className="form-group">
                <label>Redirect URL</label>

                <input
                  type="text"
                  name="redirect_url"
                  value={bannerForm.redirect_url}
                  onChange={handleChange}
                  placeholder="ProductDetails/variant-id"
                  className="form-control"
                />

                {BannerError.redirect_url && (
                  <p className="error-text">{BannerError.redirect_url}</p>
                )}
              </div>

              {/* IMAGE */}
              <div className="form-group">
                <label>Banner Image</label>

                <div className="upload-box1">
                  <input
                    type="file"
                    accept="image/*"
                    id="categoryUpload"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (!file) return;

                      setBannerImage(file);

                      setBannerForm((prev) => ({
                        ...prev,
                        image_url: file,
                      }));

                      setBannerError((prev) => ({
                        ...prev,
                        image_url: "",
                      }));
                    }}
                  />

                  {BannerImage ? (
                    <div className="banner-preview-wrapper">
                      <div className="banner-preview-left">
                        <img
                          src={URL.createObjectURL(BannerImage)}
                          alt="preview"
                          className="banner-preview-image"
                        />
                      </div>

                      <div className="banner-preview-actions">
                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() =>
                            window.open(
                              URL.createObjectURL(BannerImage),
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
                            setBannerImage(null);

                            setBannerForm((prev) => ({
                              ...prev,
                              image_url: null,
                            }));
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="categoryUpload" className="upload-label">
                      <div className="upload-content">
                        <span className="upload-icon">⬆</span>

                        <p>Click to upload banner image</p>

                        <small>PNG, JPG up to 2MB</small>
                      </div>
                    </label>
                  )}
                </div>

                {BannerError.image_url && (
                  <p className="error-text">{BannerError.image_url}</p>
                )}
              </div>

              {/* ACTIVE */}
              <div className="form-group">
                <label>Is Active</label>

                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={bannerForm.is_active}
                    onChange={handleChange}
                  />

                  <span>{bannerForm.is_active ? "Active" : "Inactive"}</span>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    resetBannerForm();
                    setShowBannerModal(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={addbannerLoading}
                >
                  {addbannerLoading ? "Adding..." : "Add Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* EDIT MODAL                                            */}
      {/* ===================================================== */}

      {showEditModal && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => {
            resetEditBannerForm();
            setShowEditModal(false);
          }}
        >
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Edit Banner</h2>

              <button
                className="close-btn"
                onClick={() => {
                  resetEditBannerForm();
                  setShowEditModal(false);
                }}
              >
                ✕
              </button>
            </div>

            <form className="prakriti-form" onSubmit={handleUpdateBanner}>
              {/* CATEGORY */}
              <div className="form-group">
                <label>Select Category</label>

                <select
                  name="service_category_id"
                  value={editBannerForm.service_category_id}
                  onChange={handleEditChange}
                  disabled={CategoryLoading}
                >
                  <option value="">
                    {CategoryLoading
                      ? "Loading categories..."
                      : "Select Category"}
                  </option>

                  {CategoryData?.filter((cat) => cat.is_active === true).map(
                    (cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    )
                  )}
                </select>

                {editBannerError.service_category_id && (
                  <p className="error-text">
                    {editBannerError.service_category_id}
                  </p>
                )}
              </div>

              {/* TYPE */}
              <div className="form-group">
                <label>Type *</label>

                <div className="type-options">
                  <label>
                    <input
                      type="radio"
                      name="edit_banner_type"
                      checked={editBannerType === "brand"}
                      onChange={() => handleEditTypeChange("brand")}
                    />
                    Brand
                  </label>

                  {editBannerForm.service_category_id && (
                    <label>
                      <input
                        type="radio"
                        name="edit_banner_type"
                        checked={editBannerType === "service"}
                        onChange={() => handleEditTypeChange("service")}
                      />
                      Service
                    </label>
                  )}
                </div>

                {editBannerError.bannerType && (
                  <p className="error-text">{editBannerError.bannerType}</p>
                )}
              </div>

              {/* BRAND */}
              {editBannerType === "brand" && (
                <div className="form-group">
                  <label>Brand *</label>

                  <select
                    value={editSelectedBrand}
                    onChange={(e) => {
                      const brandId = e.target.value;

                      setEditSelectedBrand(brandId);

                      setEditBannerForm((prev) => ({
                        ...prev,
                        service_id: "",
                        redirect_url: brandId
                          ? `${BRAND_PREFIX}${brandId}`
                          : "",
                      }));

                      setEditBannerError((prev) => ({
                        ...prev,
                        brand: "",
                        redirect_url: "",
                      }));
                    }}
                    className="form-control"
                  >
                    <option value="">
                      {BrandLoading ? "Loading brands..." : "Select Brand"}
                    </option>

                    {BrandData.filter((brand) => brand.is_active).map(
                      (brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      )
                    )}
                  </select>

                  {BrandError && <p className="error-text">{BrandError}</p>}

                  {editBannerError.brand && (
                    <p className="error-text">{editBannerError.brand}</p>
                  )}
                </div>
              )}

              {/* SERVICE */}
              {editBannerType === "service" && (
                <div className="form-group">
                  <label>Service</label>

                  <select
                    name="service_id"
                    value={editBannerForm.service_id}
                    onChange={handleEditChange}
                    disabled={ServiceLoading}
                  >
                    <option value="">
                      {ServiceLoading ? "Loading services..." : "Select Service"}
                    </option>

                    {getActiveServices().map((service) => (
                      <option
                        key={getEditServiceId(service)}
                        value={getEditServiceId(service)}
                      >
                        {getServiceLabel(
                          service,
                          getCategoryName(editBannerForm.service_category_id)
                        )}
                      </option>
                    ))}

                    {editBannerForm.service_id &&
                      !ServiceLoading &&
                      !getActiveServices().some(
                        (s) =>
                          String(getEditServiceId(s)) ===
                          String(editBannerForm.service_id)
                      ) && (
                        <option value={editBannerForm.service_id}>
                          Current service ({editBannerForm.service_id})
                        </option>
                      )}
                  </select>

                  {ServiceError && <p className="error-text">{ServiceError}</p>}

                  {editBannerError.service_id && (
                    <p className="error-text">{editBannerError.service_id}</p>
                  )}
                </div>
              )}

              {/* VARIANT INFO (product / medicine) */}
              {editBannerType === "service" &&
                isVariantCategory(
                  getCategoryName(editBannerForm.service_category_id)
                ) &&
                editBannerForm.service_id && (
                  <div
                    style={{
                      padding: "10px 12px",
                      background: "#f5faf8",
                      border: "1px solid #dceee9",
                      borderRadius: "8px",
                      marginBottom: "15px",
                      fontSize: "13px",
                    }}
                  >
                    {(() => {
                      const selectedService = ServiceData.find(
                        (service) =>
                          String(service.variant_id) ===
                          String(editBannerForm.service_id)
                      );

                      if (!selectedService) return null;

                      const currentCategory = getCategoryName(
                        editBannerForm.service_category_id
                      );

                      const isMedicine =
                        currentCategory === "medicine" ||
                        currentCategory === "medicines";

                      return (
                        <>
                          <div>
                            <strong>
                              {isMedicine ? "Medicine:" : "Product:"}
                            </strong>{" "}
                            {selectedService.name}
                          </div>

                          <div>
                            <strong>Variant:</strong>{" "}
                            {selectedService.variant_name}
                          </div>

                          {selectedService.size && (
                            <div>
                              <strong>Size:</strong> {selectedService.size}
                            </div>
                          )}

                          {selectedService.weightage && (
                            <div>
                              <strong>Unit:</strong> {selectedService.weightage}
                            </div>
                          )}

                          {selectedService.brand_name && (
                            <div>
                              <strong>Brand:</strong>{" "}
                              {selectedService.brand_name}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}

              {/* REDIRECT URL */}
              <div className="form-group">
                <label>Redirect URL</label>

                <input
                  type="text"
                  name="redirect_url"
                  value={editBannerForm.redirect_url}
                  onChange={handleEditChange}
                  className="form-control"
                />

                {editBannerError.redirect_url && (
                  <p className="error-text">{editBannerError.redirect_url}</p>
                )}
              </div>

              {/* IMAGE */}
              <div className="form-group">
                <label>Banner Image</label>

                <div className="upload-box1">
                  <input
                    type="file"
                    accept="image/*"
                    id="editBannerUpload"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (!file) return;

                      setEditBannerImage(file);

                      setEditBannerError((prev) => ({
                        ...prev,
                        image_url: "",
                      }));
                    }}
                  />

                  {editBannerImage || editBannerForm.image_url ? (
                    <div className="banner-preview-wrapper">
                      <div className="banner-preview-left">
                        <img
                          src={
                            editBannerImage
                              ? URL.createObjectURL(editBannerImage)
                              : editBannerForm.image_url
                          }
                          alt="preview"
                          className="banner-preview-image"
                        />
                      </div>

                      <div className="banner-preview-actions">
                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() =>
                            window.open(
                              editBannerImage
                                ? URL.createObjectURL(editBannerImage)
                                : editBannerForm.image_url,
                              "_blank"
                            )
                          }
                        >
                          <FiEye />
                        </button>

                        <button
                          type="button"
                          className="preview-btn"
                          onClick={() =>
                            document.getElementById("editBannerUpload")?.click()
                          }
                        >
                          <FiUpload />
                        </button>

                        <button
                          type="button"
                          className="delete-btn-preview"
                          onClick={() => {
                            setEditBannerImage(null);

                            setEditBannerForm((prev) => ({
                              ...prev,
                              image_url: "",
                            }));
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="editBannerUpload" className="upload-label">
                      <div className="upload-content">
                        <span className="upload-icon">⬆</span>

                        <p>Click to upload banner image</p>

                        <small>PNG, JPG up to 2MB</small>
                      </div>
                    </label>
                  )}
                </div>

                {editBannerError.image_url && (
                  <p className="error-text">{editBannerError.image_url}</p>
                )}
              </div>

              {/* ACTIVE */}
              <div className="form-group">
                <label>Is Active</label>

                <div className="checkbox-row">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={editBannerForm.is_active}
                    onChange={handleEditChange}
                  />

                  <span>
                    {editBannerForm.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    resetEditBannerForm();
                    setShowEditModal(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={updateBannerLoading}
                >
                  {updateBannerLoading ? "Updating..." : "Update Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* DELETE MODAL                                          */}
      {/* ===================================================== */}

      {DeleteBannerModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Are you sure you want to delete this Banner?</h3>

            <div className="form-buttons">
              <button
                className="otp-btn verify-btn"
                onClick={handleDeleteBanner}
              >
                Yes
              </button>

              <button
                onClick={() => {
                  setDeleteBannerModal(false);
                  setSelectedBanner(null);
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* IMAGE PREVIEW MODAL                                   */}
      {/* ===================================================== */}

      {BannerPreviewImage && (
        <div
          className="prakriti-modal-overlay"
          onClick={() => setBannerPreviewImage("")}
        >
          <div className="prakriti-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prakriti-modal-header">
              <h2>Image Preview</h2>

              <button
                className="close-btn"
                onClick={() => setBannerPreviewImage("")}
              >
                ✕
              </button>
            </div>

            <div style={{ textAlign: "center" }}>
              <img
                src={BannerPreviewImage}
                alt="preview"
                style={{
                  width: "100%",
                  maxHeight: "500px",
                  objectFit: "contain",
                  borderRadius: "10px",
                }}
              />
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setBannerPreviewImage("")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Banner;