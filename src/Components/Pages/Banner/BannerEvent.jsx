
import React, { useEffect, useRef, useState } from "react";

import {
  FaUsers,
  FaChartLine,
  FaCalendarAlt,
  FaSearch,
  FaTimes,
  FaCopy,
  FaEdit,
  FaTrash,
  FaPlay,
  FaStop,
} from "react-icons/fa";

import { FiRefreshCw, FiSearch } from "react-icons/fi";

import { BsThreeDotsVertical } from "react-icons/bs";

import { BiPlus } from "react-icons/bi";


import {
  ToastContainer,
  toast,
} from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../../Base";

import { useNavigate } from "react-router-dom";



const SERVICE_CATEGORY_MAP = {
  doctors: "consult",
  doctor: "consultation",

  products: "product",
  product: "product",

  diets: "diet",
  diet: "diet",

  medicine: "medicine",
  medicines: "medicine",

  yoga: "yoga",
  yogas: "yoga",

  prakirti: "prakirti",
  prakritis: "prakirti",
  prakriti: "prakirti",
};


const SCREEN_MAP = {
  doctors: {
    base: "ConsultScreen",
    detail: "DoctorProfile",
  },

  doctor: {
    base: "ConsultScreen",
    detail: "DoctorProfile",
  },

  products: {
    base: "ProductsScreen",
    detail: "ProductDetails",
  },

  product: {
    base: "ProductsScreen",
    detail: "ProductDetails",
  },

  diets: {
    base: "DietScreen",
    detail: "DietPlanDetail",
  },

  diet: {
    base: "DietScreen",
    detail: "DietPlanDetail",
  },

  medicine: {
    base: "MedicineScreen",
    detail: "ProductDetails",
  },

  medicines: {
    base: "MedicineScreen",
    detail: "ProductDetails",
  },

  yoga: {
    base: "YogaScreen",
    detail: "YogaSession",
  },

  yogas: {
    base: "YogaScreen",
    detail: "YogaSession",
  },

  prakirti: {
    base: "PrakritiProfile",
    detail: "PrakritiProfile",
  },

  prakriti: {
    base: "PrakritiProfile",
    detail: "PrakritiProfile",
  },
};



const emptyMedia = () => ({
  media_url: "",
  media_type: "image",
  redirect_link: "",
  service_category_id: "",
  link_type: "",
  brand_id: "",
  service_id: "",
});

const emptyForm = () => ({
  title: "",
  event_tags: "",
  scope: "hero",
  mode: "production",
  starts_at: "",
  ends_at: "",
  media: [emptyMedia()],
  notes: "",
  is_active: true,
});



const BannerEvent = () => {
  const navigate = useNavigate();

 

  const [Loading, setLoading] = useState(true);
  const [Error, setError] = useState(null);

  const [Data, setData] = useState([]);
  const [FilteredData, setFilteredData] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  const [previewImage, setPreviewImage] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
 

const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [deleteItem, setDeleteItem] = useState(null);
const [deleting, setDeleting] = useState(false);
const [cancelQueueModalOpen, setCancelQueueModalOpen] = useState(false);
const [cancelQueueItem, setCancelQueueItem] = useState(null);
const [cancelQueueLoading, setCancelQueueLoading] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    live: 0,
    ended: 0,
  });

  const hasFetched = useRef(false);
const [enqueueModalOpen, setEnqueueModalOpen] = useState(false);
const [enqueueItem, setEnqueueItem] = useState(null);
const [enqueueLoading, setEnqueueLoading] = useState(false);
  const [mediaGalleryOpen, setMediaGalleryOpen] = useState(false);
const [selectedMedia, setSelectedMedia] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const [bannerForm, setBannerForm] = useState(
    emptyForm()
  );
  const [endLiveModalOpen, setEndLiveModalOpen] = useState(false);
const [endLiveItem, setEndLiveItem] = useState(null);
const [endLiveLoading, setEndLiveLoading] = useState(false);

  const fileInputRefs = useRef([]);
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] =
    useState(false);

  const [brands, setBrands] = useState([]);
  const [brandLoading, setBrandLoading] =
    useState(false);

  const [servicesBySlug, setServicesBySlug] =
    useState({});

  const [serviceLoadingSlug, setServiceLoadingSlug] =
    useState("");

  const servicesRef = useRef({});
  const loadingSlugs = useRef(new Set());
const [goLiveModalOpen, setGoLiveModalOpen] = useState(false);
const [goLiveItem, setGoLiveItem] = useState(null);
const [goLiveLoading, setGoLiveLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

 const openCancelQueueModal = (item) => {
  console.log("Cancel Queue clicked:", item);

  setOpenMenuId(null);
  setCancelQueueItem(item);
  setCancelQueueModalOpen(true);
};

const closeCancelQueueModal = () => {
  if (cancelQueueLoading) return;

  setCancelQueueModalOpen(false);
  setCancelQueueItem(null);
}; 

const openDeleteModal = (item) => {
  setOpenMenuId(null);
  setDeleteItem(item);
  setDeleteModalOpen(true);
};


const openGoLiveModal = (item) => {
  setOpenMenuId(null);
  setGoLiveItem(item);
  setGoLiveModalOpen(true);
};
const openEnqueueModal = (item) => {
  setOpenMenuId(null);
  setEnqueueItem(item);
  setEnqueueModalOpen(true);
};

const closeEnqueueModal = () => {
  if (enqueueLoading) return;

  setEnqueueModalOpen(false);
  setEnqueueItem(null);
};
const formatEnqueueDateTime = (dateTime) => {
  if (!dateTime) return "Not set";

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const closeGoLiveModal = () => {
  if (goLiveLoading) return;

  setGoLiveModalOpen(false);
  setGoLiveItem(null);
};
const handleGoLive = async () => {
  if (!goLiveItem?.id) {
    toast.error("Invalid banner event ID");
    return;
  }

  setGoLiveLoading(true);

  try {
    const result = await request(
      `/banners/admin/events/go-live/?id=${encodeURIComponent(
        goLiveItem.id
      )}`,
      {
        method: "POST",
      }
    );

    if (!result) return;

    if (
      !result.response.ok ||
      result.data?.success === false
    ) {
      toast.error(
        result.data?.message ||
          "Failed to make event live"
      );
      return;
    }

    toast.success(
      result.data?.message ||
        "Event is live now"
    );

    setGoLiveModalOpen(false);
    setGoLiveItem(null);

    await getBannerEvents();
  } catch (error) {
    console.error("Go Live Error:", error);

    toast.error(
      "Failed to make event live"
    );
  } finally {
    setGoLiveLoading(false);
  }
};
const openEndLiveModal = (item) => {
  setOpenMenuId(null);
  setEndLiveItem(item);
  setEndLiveModalOpen(true);
};

const closeEndLiveModal = () => {
  if (endLiveLoading) return;

  setEndLiveModalOpen(false);
  setEndLiveItem(null);
};

const closeDeleteModal = () => {
  if (deleting) {
    return;
  }

  setDeleteModalOpen(false);
  setDeleteItem(null);
};
  const request = async (
    endpoint,
    options = {}
  ) => {
    const token =
      sessionStorage.getItem("superadmin_token");

    if (!token) {
      sessionStorage.removeItem(
        "superadmin_token"
      );

      navigate("/login");

      return null;
    }

    try {
      const response = await fetch(
        `${BASE_URL}${endpoint}`,
        {
          ...options,

          headers: {
            Accept: "application/json",

            Authorization: `Bearer ${token}`,

            "ngrok-skip-browser-warning": "true",

            ...(options.body
              ? {
                  "Content-Type":
                    "application/json",
                }
              : {}),

            ...(options.headers || {}),
          },
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

        return null;
      }

      const data = await response.json();

      return {
        response,
        data,
      };
    } catch (error) {
      console.error("API Error:", error);

      throw error;
    }
  };
  const handleEnqueue = async () => {
  if (!enqueueItem?.id) {
    toast.error("Invalid banner event ID");
    return;
  }

  // -----------------------------
  // MEDIA VALIDATION
  // -----------------------------
  const hasMedia =
    Array.isArray(enqueueItem.media) &&
    enqueueItem.media.length > 0 &&
    enqueueItem.media.some(
      (media) => media?.media_url
    );

  if (!hasMedia) {
    toast.error(
      "Please configure media before enqueueing this event."
    );
    return;
  }

  // -----------------------------
  // SCHEDULE VALIDATION
  // -----------------------------
  if (
    !enqueueItem.starts_at ||
    !enqueueItem.ends_at
  ) {
    toast.error(
      "Please configure a valid start and end time."
    );
    return;
  }

  const startDate = new Date(enqueueItem.starts_at);
  const endDate = new Date(enqueueItem.ends_at);
  const now = new Date();

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime())
  ) {
    toast.error("Invalid event schedule.");
    return;
  }

  // ends_at must be after starts_at
  if (endDate <= startDate) {
    toast.error(
      "End time must be after start time."
    );
    return;
  }

  // End time should not already be in the past
  if (endDate <= now) {
    toast.error(
      "Event end time must be in the future."
    );
    return;
  }

  setEnqueueLoading(true);

  try {
    const result = await request(
      `/banners/admin/events/enqueue/?id=${encodeURIComponent(
        enqueueItem.id
      )}`,
      {
        method: "POST",
      }
    );

    if (!result) {
      return;
    }

    if (
      !result.response.ok ||
      result.data?.success === false
    ) {
      toast.error(
        result.data?.message ||
          "Failed to enqueue banner event."
      );
      return;
    }

    toast.success(
      result.data?.message ||
        "Banner event enqueued successfully."
    );

    setEnqueueModalOpen(false);
    setEnqueueItem(null);

    // Refresh table and stats
    await getBannerEvents();
  } catch (error) {
    console.error(
      "Enqueue Banner Error:",
      error
    );

    toast.error(
      "Failed to enqueue banner event."
    );
  } finally {
    setEnqueueLoading(false);
  }
};

  const handleEndLive = async () => {
  if (!endLiveItem?.id) {
    toast.error("Invalid banner event ID");
    return;
  }

  setEndLiveLoading(true);

  try {
    const result = await request(
      `/banners/admin/events/end-now/?id=${encodeURIComponent(
        endLiveItem.id
      )}`,
      {
        method: "POST",
      }
    );

    if (!result) return;

    if (
      !result.response.ok ||
      result.data?.success === false
    ) {
      toast.error(
        result.data?.message ||
          "Failed to end live event"
      );
      return;
    }

    toast.success(
      result.data?.message ||
        "Live event ended successfully"
    );

    setEndLiveModalOpen(false);
    setEndLiveItem(null);

    
    await getBannerEvents();
  } catch (error) {
    console.error("End Live Error:", error);

    toast.error(
      "Failed to end live event"
    );
  } finally {
    setEndLiveLoading(false);
  }
};

  const readList = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    if (
      Array.isArray(
        data?.data?.results
      )
    ) {
      return data.data.results;
    }

    return [];
  };

  // ===================================================
  // GET BANNER EVENTS
  // ===================================================
// ===================================================
// DELETE BANNER EVENT
// ===================================================

const deleteBanner = async () => {
  if (!deleteItem?.id) {
    toast.error("Invalid banner event ID");
    return;
  }

  setDeleting(true);

  try {
    const result = await request(
      `/banners/admin/events/?id=${encodeURIComponent(
        deleteItem.id
      )}`,
      {
        method: "DELETE",
      }
    );

    if (!result) {
      return;
    }

    // Backend error
    if (
      !result.response.ok ||
      result.data?.success === false
    ) {
      toast.error(
        result.data?.message ||
          "Failed to delete banner event"
      );

      return;
    }

    toast.success(
      result.data?.message ||
        "Banner event deleted successfully"
    );

    // Close modal
    setDeleteModalOpen(false);
    setDeleteItem(null);

    // Refresh list
    await getBannerEvents();
  } catch (error) {
    console.error(
      "Delete Banner Error:",
      error
    );

    toast.error(
      "Failed to delete banner event"
    );
  } finally {
    setDeleting(false);
  }
};
  const getBannerEvents = async () => {
    const token =
      sessionStorage.getItem("superadmin_token");

    if (!token) {
      toast.error(
        "Session expired. Please login again"
      );

      navigate("/login");

      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await request(
        "/banners/admin/events/"
      );

      if (!result) {
        return;
      }

      const data = result.data;

      if (data?.success === false) {
        toast.error(
          data?.message ||
            "Failed to fetch banner events"
        );

        setError(
          data?.message ||
            "Failed to fetch banner events"
        );

        return;
      }

      const list = readList(data);

      const sortedData = [...list].sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );

      setData(sortedData);

      calculateStats(sortedData);

      setFilteredData(
        filterData(
          sortedData,
          searchTerm,
          statusFilter,
          modeFilter
        )
      );
    } catch (error) {
      console.error(
        "Banner Events Fetch Error:",
        error
      );

      setError(
        "Something went wrong while fetching banner events."
      );

      toast.error(
        "Failed to fetch banner events"
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // CALCULATE STATS
  // ===================================================

  const calculateStats = (data) => {
    const total = data.length;

    const live = data.filter(
      (item) =>
        item.status?.toLowerCase() ===
        "live"
    ).length;

    const ended = data.filter(
      (item) =>
        item.status?.toLowerCase() ===
        "ended"
    ).length;

    setStats({
      total,
      live,
      ended,
    });
  };

  // ===================================================
  // FILTER DATA
  // ===================================================

  const filterData = (
    data,
    search,
    status,
    mode
  ) => {
    let filtered = [...data];

    if (search.trim()) {
      const term = search
        .toLowerCase()
        .trim();

      filtered = filtered.filter(
        (item) =>
          item.title
            ?.toLowerCase()
            .includes(term) ||
          String(item.id || "")
            .toLowerCase()
            .includes(term) ||
          item.scope
            ?.toLowerCase()
            .includes(term) ||
          item.status
            ?.toLowerCase()
            .includes(term) ||
          item.mode
            ?.toLowerCase()
            .includes(term)
      );
    }

    if (status !== "all") {
      filtered = filtered.filter(
        (item) =>
          item.status?.toLowerCase() ===
          status
      );
    }

    if (mode !== "all") {
      filtered = filtered.filter(
        (item) =>
          item.mode?.toLowerCase() ===
          mode
      );
    }

    return filtered;
  };

  // ===================================================
  // INITIAL FETCH
  // ===================================================

  useEffect(() => {
    if (hasFetched.current) {
      return;
    }

    hasFetched.current = true;

    getBannerEvents();
  }, []);

  // ===================================================
  // FILTER EFFECT
  // ===================================================

  useEffect(() => {
    setFilteredData(
      filterData(
        Data,
        searchTerm,
        statusFilter,
        modeFilter
      )
    );
  }, [
    Data,
    searchTerm,
    statusFilter,
    modeFilter,
  ]);

  // ===================================================
  // LOAD CATEGORIES
  // ===================================================

  const loadCategories = async () => {
    setCategoryLoading(true);

    try {
      const result = await request(
        "/user/admin/service-category/"
      );

      if (!result) {
        return [];
      }

      const list = readList(result.data);

      const activeCategories = list.filter(
        (item) =>
          item?.is_active === true
      );

      setCategories(activeCategories);

      return activeCategories;
    } catch (error) {
      console.error(
        "Category list error:",
        error
      );

      toast.error(
        "Failed to fetch categories"
      );

      return [];
    } finally {
      setCategoryLoading(false);
    }
  };

  // ===================================================
  // LOAD BRANDS
  // ===================================================

  const loadBrands = async () => {
    setBrandLoading(true);

    try {
      const result = await request(
        "/vendors/admin/brand-name/"
      );

      if (!result) {
        return [];
      }

      const list = readList(result.data);

      const activeBrands = list.filter(
        (item) =>
          item?.is_active === true
      );

      setBrands(activeBrands);

      return activeBrands;
    } catch (error) {
      console.error(
        "Brand list error:",
        error
      );

      toast.error(
        "Failed to fetch brands"
      );

      setBrands([]);

      return [];
    } finally {
      setBrandLoading(false);
    }
  };

  // ===================================================
  // LOAD SERVICES
  // ===================================================

  const loadServices = async (slug) => {
    if (!slug) {
      return [];
    }

    if (servicesRef.current[slug]) {
      return servicesRef.current[slug];
    }

    if (loadingSlugs.current.has(slug)) {
      return [];
    }

    loadingSlugs.current.add(slug);

    setServiceLoadingSlug(slug);

    try {
      const result = await request(
        `/user/admin/services/?category=${encodeURIComponent(
          slug
        )}`
      );

      if (!result) {
        return [];
      }

      const list = readList(
        result.data
      ).filter(
        (service) =>
          service?.is_active === true
      );

      servicesRef.current[slug] = list;

      setServicesBySlug((prev) => ({
        ...prev,
        [slug]: list,
      }));

      return list;
    } catch (error) {
      console.error(
        "Service list error:",
        error
      );

      toast.error(
        "Failed to fetch services"
      );

      servicesRef.current[slug] = [];

      setServicesBySlug((prev) => ({
        ...prev,
        [slug]: [],
      }));

      return [];
    } finally {
      loadingSlugs.current.delete(slug);

      setServiceLoadingSlug("");
    }
  };

  // ===================================================
  // LOAD CATEGORY + BRAND WHEN MODAL OPENS
  // ===================================================

  useEffect(() => {
    if (!showAddModal) {
      return;
    }

    if (
      categories.length === 0 &&
      !categoryLoading
    ) {
      loadCategories();
    }

    if (
      brands.length === 0 &&
      !brandLoading
    ) {
      loadBrands();
    }
  }, [showAddModal]);

  // ===================================================
  // SCREEN KEY
  // ===================================================

  const screenKeyOf = (category) => {
    const name =
      category?.name
        ?.trim()
        .toLowerCase();

    if (!name) {
      return "";
    }

    if (SCREEN_MAP[name]) {
      return name;
    }

    if (
      name.includes("consult") ||
      name.includes("doctor")
    ) {
      return "doctors";
    }

    if (name.includes("product")) {
      return "products";
    }

    if (name.includes("medicine")) {
      return "medicine";
    }

    if (name.includes("diet")) {
      return "diets";
    }

    if (name.includes("yoga")) {
      return "yoga";
    }

    if (
      name.includes("prakirti") ||
      name.includes("prakriti")
    ) {
      return "prakriti";
    }

    return "";
  };

  // ===================================================
  // CATEGORY NAME
  // ===================================================

  const categoryNameOf = (categoryId) => {
    const category = categories.find(
      (item) =>
        String(item.id) ===
        String(categoryId)
    );

    return category?.name || "";
  };

  // ===================================================
  // CATEGORY SLUG
  // ===================================================

  const categorySlugOf = (categoryId) => {
    const category = categories.find(
      (item) =>
        String(item.id) ===
        String(categoryId)
    );

    const key = screenKeyOf(category);

    return (
      SERVICE_CATEGORY_MAP[key] || ""
    );
  };

  // ===================================================
  // SERVICE OPTION ID
  // ===================================================

  const serviceOptionId = (service) => {
    return String(
      service?.id ||
        service?.service_id ||
        service?.uuid ||
        ""
    );
  };

  // ===================================================
  // SERVICE OPTION LABEL
  // ===================================================

  const serviceOptionLabel = (
    service
  ) => {
    return (
      service?.name ||
      service?.service_name ||
      service?.title ||
      service?.variant_name ||
      "Unnamed Service"
    );
  };

  // ===================================================
  // UPDATE MEDIA
  // ===================================================

  const updateMedia = (
    index,
    changes
  ) => {
    setBannerForm((prev) => ({
      ...prev,

      media: prev.media.map(
        (item, i) =>
          i === index
            ? {
                ...item,
                ...changes,
              }
            : item
      ),
    }));
  };

  // ===================================================
  // ADD MEDIA
  // ===================================================

  const addMedia = () => {
    setBannerForm((prev) => ({
      ...prev,

      media: [
        ...prev.media,
        emptyMedia(),
      ],
    }));
  };

  // ===================================================
  // REMOVE MEDIA
  // ===================================================

  const removeMedia = (index) => {
    fileInputRefs.current.splice(
      index,
      1
    );

    setBannerForm((prev) => ({
      ...prev,

      media: prev.media.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // ===================================================
  // DELETE IMAGE
  // ===================================================

  const deleteMediaImage = (index) => {
    if (
      fileInputRefs.current[index]
    ) {
      fileInputRefs.current[
        index
      ].value = "";
    }

    updateMedia(index, {
      media_url: "",
      media_type: "image",
      redirect_link: "",
      service_category_id: "",
      link_type: "",
      brand_id: "",
      service_id: "",
    });

    toast.info(
      "Image removed. You can upload again."
    );
  };

  // ===================================================
  // UPLOAD IMAGE
  // ===================================================

  const handleMediaFile = async (
    index,
    file
  ) => {
    if (!file) {
      return;
    }

    setUploadingIndex(index);

    try {
      const token =
        sessionStorage.getItem(
          "superadmin_token"
        );

      if (!token) {
        toast.error(
          "Session expired. Please login again"
        );

        navigate("/login");

        return;
      }

      const formData = new FormData();

      formData.append(
        "image",
        file
      );

      formData.append(
        "dir",
        "banners"
      );

      const response = await fetch(
        `${BASE_URL}/user/upload/`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,

            "ngrok-skip-browser-warning":
              "true",
          },

          body: formData,
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

      const imageUrl =
        data?.data?.url ||
        data?.url ||
        data?.data?.image_url;

      if (
        !response.ok ||
        !imageUrl
      ) {
        toast.error(
          data?.message ||
            "Image upload failed"
        );

        return;
      }

      updateMedia(index, {
        media_url: imageUrl,
        media_type: "image",
      });

      toast.success(
        "Image uploaded successfully"
      );
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      toast.error(
        "Image upload failed"
      );
    } finally {
      setUploadingIndex(null);
    }
  };

  // ===================================================
  // CATEGORY CHANGE
  // ===================================================

  const handleCategoryChange = (
    index,
    categoryId
  ) => {
    const category = categories.find(
      (item) =>
        String(item.id) ===
        String(categoryId)
    );

    const key = screenKeyOf(category);

    const screenConfig =
      SCREEN_MAP[key];

    const slug =
      SERVICE_CATEGORY_MAP[key] || "";

    updateMedia(index, {
      service_category_id:
        categoryId,

      link_type: "",

      brand_id: "",

      service_id: "",

      redirect_link:
        screenConfig?.base || "",
    });

    if (slug) {
      loadServices(slug);
    }
  };

  // ===================================================
  // REDIRECT TYPE CHANGE
  // ===================================================

  const handleTypeChange = (
    index,
    type
  ) => {
    updateMedia(index, {
      link_type: type,

      brand_id: "",

      service_id: "",

      redirect_link: "",
    });
  };

  // ===================================================
  // BRAND CHANGE
  // ===================================================

  const handleBrandChange = (
    index,
    brandId
  ) => {
    if (!brandId) {
      updateMedia(index, {
        brand_id: "",
        redirect_link: "",
      });

      return;
    }

    updateMedia(index, {
      brand_id: brandId,

      redirect_link: `CategoryProduct/${brandId}`,
    });
  };

  // ===================================================
  // SERVICE CHANGE
  // ===================================================

  const handleServiceChange = (
    index,
    serviceId
  ) => {
    const item =
      bannerForm.media[index];

    const category =
      categories.find(
        (cat) =>
          String(cat.id) ===
          String(
            item.service_category_id
          )
      );

    const key =
      screenKeyOf(category);

    const config =
      SCREEN_MAP[key];

    let redirectLink = "";

    if (
      serviceId &&
      config?.detail
    ) {
      redirectLink = `${config.detail}/${serviceId}`;
    } else if (config?.base) {
      redirectLink = config.base;
    }

    updateMedia(index, {
      service_id: serviceId,

      redirect_link:
        redirectLink,
    });
  };

  // ===================================================
  // ISO DATE -> DATETIME LOCAL
  // ===================================================

  const toInputDateTime = (
    value
  ) => {
    if (!value) {
      return "";
    }

    const d = new Date(value);

    if (isNaN(d.getTime())) {
      return "";
    }

    const pad = (n) =>
      String(n).padStart(2, "0");

    return `${d.getFullYear()}-${pad(
      d.getMonth() + 1
    )}-${pad(
      d.getDate()
    )}T${pad(
      d.getHours()
    )}:${pad(
      d.getMinutes()
    )}`;
  };

  // ===================================================
  // PARSE REDIRECT
  // ===================================================

  const parseRedirect = async (
    rawLink,
    cats
  ) => {
    const base = {
      service_category_id: "",
      link_type: "",
      brand_id: "",
      service_id: "",
    };

    const link = String(
      rawLink || ""
    )
      .trim()
      .replace(/^\/+/, "");

    if (!link) {
      return base;
    }

    const [
      screenRaw,
      ...rest
    ] = link.split("/");

    const screen = String(
      screenRaw || ""
    )
      .trim()
      .toLowerCase();

    const param = rest
      .join("/")
      .trim();

    console.log(
      "🔍 Parsing redirect:",
      {
        rawLink,
        screen,
        param,
      }
    );

    // =================================================
    // CATEGORY PRODUCT / BRAND
    // =================================================

    if (
      screen ===
        "categoryproduct" &&
      param
    ) {
      const productCategory =
        cats.find(
          (category) =>
            screenKeyOf(
              category
            ) === "products"
        );

      console.log(
        "🟢 CategoryProduct found:",
        {
          productCategory,
          brandId: param,
        }
      );

      return {
        ...base,

        service_category_id:
          productCategory
            ? String(
                productCategory.id
              )
            : "",

        link_type: "brand",

        brand_id: String(param),

        service_id: "",
      };
    }

    // =================================================
    // BASE SCREEN
    // =================================================

    if (!param) {
      const category =
        cats.find((c) => {
          const key =
            screenKeyOf(c);

          const config =
            SCREEN_MAP[key];

          return (
            config?.base?.toLowerCase() ===
            screen
          );
        });

      console.log(
        "🟢 Base screen found:",
        {
          screen,
          category,
        }
      );

      return {
        ...base,

        service_category_id:
          category
            ? String(category.id)
            : "",

        link_type: "",

        service_id: "",

        brand_id: "",
      };
    }

    // =================================================
    // DETAIL SCREEN
    // =================================================

    const candidates =
      cats.filter((c) => {
        const key =
          screenKeyOf(c);

        const config =
          SCREEN_MAP[key];

        return (
          config?.detail?.toLowerCase() ===
          screen
        );
      });

    console.log(
      "🟡 Detail candidates:",
      candidates
    );

    // =================================================
    // TRY TO FIND SERVICE FROM API
    // =================================================

    for (const cat of candidates) {
      const key =
        screenKeyOf(cat);

      const slug =
        SERVICE_CATEGORY_MAP[key];

      if (!slug) {
        continue;
      }

      try {
        const list =
          await loadServices(
            slug
          );

        console.log(
          `🔵 Services for ${slug}:`,
          list
        );

        const found =
          list.find(
            (service) => {
              const ids = [
                service?.id,
                service?.service_id,
                service?.doctor_id,
                service?.variant_id,
                service?.uuid,
              ]
                .filter(Boolean)
                .map(String);

              return ids.includes(
                String(param)
              );
            }
          );

        if (found) {
          const isVariant =
            [
              "products",
              "product",
              "medicine",
              "medicines",
            ].includes(key);

          const selectedId =
            String(
              isVariant
                ? found?.variant_id ??
                    found?.id ??
                    param
                : found?.id ??
                    found?.service_id ??
                    found?.doctor_id ??
                    param
            );

          console.log(
            "✅ Service matched:",
            {
              category: cat.name,
              selectedId,
              found,
            }
          );

          return {
            ...base,

            service_category_id:
              String(cat.id),

            link_type: "service",

            service_id:
              selectedId,
          };
        }
      } catch (error) {
        console.error(
          "Service matching error:",
          error
        );
      }
    }

    // =================================================
    // IMPORTANT FALLBACK
    // =================================================

    if (
      candidates.length > 0
    ) {
      const category =
        candidates[0];

      console.log(
        "⚠️ Service not found in API, using redirect ID:",
        {
          category:
            category.name,
          id: param,
        }
      );

      return {
        ...base,

        service_category_id:
          String(category.id),

        link_type: "service",

        service_id:
          String(param),
      };
    }

    console.log(
      "❌ Could not identify redirect:",
      link
    );

    return base;
  };

  // ===================================================
  // CREATE
  // ===================================================

  const openCreate = () => {
    setEditingId(null);

    setBannerForm(
      emptyForm()
    );

    fileInputRefs.current = [];

    setShowAddModal(true);

    setOpenMenuId(null);
  };

  // ===================================================
  // EDIT
  // ===================================================

  const openEdit = async (
    item
  ) => {
    if (editLoading) {
      return;
    }

    setOpenMenuId(null);

    setEditLoading(true);

    try {
      // -----------------------------------------------
      // LOAD CATEGORIES
      // -----------------------------------------------

      let cats = categories;

      if (cats.length === 0) {
        cats =
          await loadCategories();
      }

      // -----------------------------------------------
      // LOAD BRANDS
      // -----------------------------------------------

      if (brands.length === 0) {
        await loadBrands();
      }

      // -----------------------------------------------
      // MEDIA LIST
      // -----------------------------------------------

      const mediaList =
        Array.isArray(
          item.media
        ) &&
        item.media.length > 0
          ? item.media
          : [];

      // -----------------------------------------------
      // PARSE ALL MEDIA
      // -----------------------------------------------

      const media =
        await Promise.all(
          mediaList.map(
            async (m) => {
              const link =
                m.redirect_link ??
                m.redirect_url ??
                m.redirect_to ??
                m.link ??
                m.deeplink ??
                "";

              console.log(
                "===================================="
              );

              console.log(
                "EDIT MEDIA"
              );

              console.log(
                "Image:",
                m.media_url
              );

              console.log(
                "Redirect:",
                link
              );

              const parsed =
                await parseRedirect(
                  link,
                  cats
                );

              console.log(
                "PARSED RESULT:",
                parsed
              );

              return {
                ...emptyMedia(),

                media_url:
                  m.media_url ||
                  m.image_url ||
                  m.url ||
                  "",

                media_type:
                  m.media_type ||
                  "image",

                // IMPORTANT:
                // Keep original API redirect
                redirect_link:
                  link,

                // Parsed values
                ...parsed,
              };
            }
          )
        );

      console.log(
        "FINAL EDIT MEDIA:",
        media
      );

      fileInputRefs.current = [];

      // -----------------------------------------------
      // SET FORM
      // -----------------------------------------------

      setBannerForm({
        title:
          item.title || "",

        event_tags:
          Array.isArray(
            item.event_tags
          )
            ? item.event_tags.join(
                ", "
              )
            : item.event_tags ||
              "",

        scope:
          item.scope ||
          "hero",

        mode:
          item.mode ||
          "production",

        starts_at:
          toInputDateTime(
            item.starts_at
          ),

        ends_at:
          toInputDateTime(
            item.ends_at
          ),

        media:
          media.length > 0
            ? media
            : [emptyMedia()],

        notes:
          item.notes || "",

        is_active:
          item.is_active ??
          true,
      });

      setEditingId(item.id);

      setShowAddModal(true);
    } catch (error) {
      console.error(
        "Open edit error:",
        error
      );

      toast.error(
        "Failed to open edit form"
      );
    } finally {
      setEditLoading(false);
    }
  };

  // ===================================================
  // CLOSE MODAL
  // ===================================================

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowAddModal(false);

    setEditingId(null);

    setBannerForm(
      emptyForm()
    );

    fileInputRefs.current = [];
  };

  // ===================================================
  // TEXT -> TAGS
  // ===================================================

  const textToTags = (
    text
  ) => {
    return text
      .split(",")
      .map(
        (item) =>
          item.trim()
      )
      .filter(Boolean);
  };

  // ===================================================
  // API DATE TIME
  // ===================================================

  const toApiDateTime = (
    value
  ) => {
    if (!value) {
      return null;
    }

    return value;
  };

  // ===================================================
  // SAVE BANNER
  // ===================================================

  const saveBanner = async () => {
    if (
      !bannerForm.title.trim()
    ) {
      toast.error(
        "Please enter banner title"
      );

      return;
    }

    const validMedia =
      bannerForm.media.filter(
        (item) =>
          item.media_url?.trim()
      );

    if (
      validMedia.length === 0
    ) {
      toast.error(
        "Please upload at least one image"
      );

      return;
    }

    // for (
    //   let i = 0;
    //   i < validMedia.length;
    //   i++
    // ) {
    //   const item =
    //     validMedia[i];

    //   if (
    //     !item.service_category_id &&
    //     !item.redirect_link
    //   ) {
    //     toast.error(
    //       `Please select category for Media ${
    //         i + 1
    //       }`
    //     );

    //     return;
    //   }
    // }

    const payload = {
      title:
        bannerForm.title.trim(),

      event_tags:
        textToTags(
          bannerForm.event_tags
        ),

      scope:
        bannerForm.scope ||
        "hero",

      mode:
        bannerForm.mode ||
        "production",

      starts_at:
        toApiDateTime(
          bannerForm.starts_at
        ),

      ends_at:
        toApiDateTime(
          bannerForm.ends_at
        ),

      media:
        validMedia.map(
          (item) => ({
            media_url:
              item.media_url.trim(),

            media_type:
              "image",

            redirect_link:
              item.redirect_link?.trim() ||
              null,
          })
        ),

      notes:
        bannerForm.notes.trim() ||
        null,

      is_active:
        Boolean(
          bannerForm.is_active
        ),
    };

    const isEdit =
      Boolean(editingId);

    setSaving(true);

    try {
      const result =
        await request(
          isEdit
            ? `/banners/admin/events/?id=${encodeURIComponent(
                editingId
              )}`
            : "/banners/admin/events/",
          {
            method: isEdit
              ? "PUT"
              : "POST",

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      if (!result) {
        return;
      }

      if (
        !result.response.ok ||
        result.data?.success ===
          false
      ) {
        toast.error(
          result.data?.message ||
            (isEdit
              ? "Failed to update banner"
              : "Failed to create banner")
        );

        return;
      }

      toast.success(
        isEdit
          ? "Banner event updated successfully"
          : "Banner event created successfully"
      );

      setShowAddModal(false);

      setEditingId(null);

      setBannerForm(
        emptyForm()
      );

      fileInputRefs.current = [];

      await getBannerEvents();
    } catch (error) {
      console.error(
        "Save Banner Error:",
        error
      );

      toast.error(
        isEdit
          ? "Failed to update banner"
          : "Failed to create banner"
      );
    } finally {
      setSaving(false);
    }
  };
const handleCancelQueue = async () => {
  if (!cancelQueueItem?.id) {
    toast.error("Invalid banner event ID");
    return;
  }

  if (cancelQueueItem.status !== "queued") {
    toast.error("Only queued events can be cancelled.");
    return;
  }

  setCancelQueueLoading(true);

  try {
    const result = await request(
      `/banners/admin/events/cancel-queue/?id=${encodeURIComponent(
        cancelQueueItem.id
      )}`,
      {
        method: "POST",
      }
    );

    if (!result) return;

    if (
      !result.response.ok ||
      result.data?.success === false
    ) {
      toast.error(
        result.data?.message ||
          "Failed to cancel queued event."
      );
      return;
    }

    toast.success(
      result.data?.message ||
        "Event removed from queue successfully."
    );

    setCancelQueueModalOpen(false);
    setCancelQueueItem(null);

    await getBannerEvents();
  } catch (error) {
    console.error("Cancel Queue Error:", error);

    toast.error("Failed to cancel queued event.");
  } finally {
    setCancelQueueLoading(false);
  }
};
  // ===================================================
  // CLEAR FILTERS
  // ===================================================

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setModeFilter("all");
  };

  // ===================================================
  // FORMAT DATE
  // ===================================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "N/A";
    }

    return new Date(
      date
    ).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ===================================================
  // STATUS CLASS
  // ===================================================

  const getStatusClass = (
    status
  ) => {
    switch (
      status?.toLowerCase()
    ) {
      case "live":
        return "status-badge status-live";

      case "ended":
        return "status-badge status-ended";

      case "scheduled":
        return "status-badge status-scheduled";

      case "cancelled":
        return "status-badge status-cancelled";

      default:
        return "status-badge";
    }
  };

  // ===================================================
  // JSX
  // ===================================================

  return (
    <>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="page-header">
        <h1>
          Banner Events Management
        </h1>

        <p className="page-paragraph">
          Manage banner events and
          their scheduling details
        </p>
      </div>

      {/* =================================================
          STATS
      ================================================= */}

      <div className="stats2-grid">
        {/* TOTAL */}
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
            <FaUsers size={16} />
          </div>

          <div className="stat2-info">
            <h3>
              Total Events
            </h3>

            <div className="stat2-value">
              {stats.total}
            </div>
          </div>
        </div>

        {/* LIVE */}
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
            <FaChartLine size={16} />
          </div>

          <div className="stat2-info">
            <h3>
              Live
            </h3>

            <div className="stat2-value">
              {stats.live}
            </div>
          </div>
        </div>

        {/* ENDED */}
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
            <FaCalendarAlt size={16} />
          </div>

          <div className="stat2-info">
            <h3>
              Ended
            </h3>

            <div className="stat2-value">
              {stats.ended}
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="filter-category">
        <div className="filter-controls">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search by title, ID, scope..."
              value={
                searchTerm
              }
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="search-input"
            />

            {searchTerm && (
              <button
                className="clear-search"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                <FaTimes />
              </button>
            )}
          </div>

          <select
            className="status-filter-select"
            value={
              statusFilter
            }
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
          >
            <option value="all">
              All Status
            </option>

            <option value="live">
              Live
            </option>

            <option value="ended">
              Ended
            </option>

            <option value="scheduled">
              Scheduled
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          {(searchTerm ||
            statusFilter !==
              "all" ||
            modeFilter !==
              "all") && (
            <button
              className="clear-filters-btn"
              onClick={
                clearFilters
              }
              title="Reset Filters"
            >
              <FiRefreshCw />
            </button>
          )}
        </div>

        <button
          className="add-customer-btn"
          onClick={
            openCreate
          }
        >
          <BiPlus />

          Add Banner
        </button>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Event</th>


              <th>Scope</th>
              <th>Mode</th>
              <th>Media</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Active</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {Loading ? (
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <td colSpan="10">
                      <div className="skeleton-row" />
                    </td>
                  </tr>
                ))
            ) : Error ? (
              <tr>
                <td
                  colSpan="10"
                  style={{
                    color:
                      "#dc2626",
                  }}
                >
                  {Error}
                </td>
              </tr>
            ) : FilteredData?.length >
              0 ? (
              FilteredData.map(
                (
                  item,
                  index
                ) => {
                  const media =
                    item.media?.[0];

                  return (
                    <tr
                      key={
                        item.id
                      }
                    >
                      <td>
                        {index + 1}
                      </td>

                      <td>
                        <strong>
                          {item.title ||
                            "N/A"}
                        </strong>

                        {item.id && (
                          <div className="category-id-wrapper">
                            <span className="category-id-text">
                              {
                                item.id
                              }
                            </span>

                            <button
                              type="button"
                              className="copy-id-btn"
                              title="Copy Event ID"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  item.id
                                );

                                toast.success(
                                  "Event ID copied!"
                                );
                              }}
                            >
                              <FaCopy
                                size={
                                  12
                                }
                              />
                            </button>
                          </div>
                        )}
                      </td>

                      <td>
                        <span className="category-code-badge">
                          {item.scope ||
                            "N/A"}
                        </span>
                      </td>

                      <td>
                        <span
                          className="category-code-badge"
                          style={{
                            textTransform:
                              "capitalize",
                          }}
                        >
                          {item.mode ||
                            "N/A"}
                        </span>
                      </td>

                      <td>
                      <div className="event-media-preview">
  {item.media?.length > 0 ? (
    <>
      <div
        className="event-main-image"
        onClick={() => setPreviewImage(item.media[0]?.media_url)}
      >
        <img
          src={item.media[0]?.media_url}
          alt={item.title}
        />
      </div>

      {item.media.length > 1 && (
        <button
          type="button"
          className="event-more-images"
          onClick={() => {
            setSelectedMedia(item.media);
            setMediaGalleryOpen(true);
          }}
        >
          +{item.media.length - 1}
        </button>
      )}
    </>
  ) : (
    <div className="no-event-image">
      No Image
    </div>
  )}
</div>
                      </td>

                      <td
                        style={{
                          color:
                            "#6b7280",
                          fontSize:
                            "13px",
                        }}
                      >
                        {formatDate(
                          item.starts_at
                        )}
                      </td>

                      <td
                        style={{
                          color:
                            "#6b7280",
                          fontSize:
                            "13px",
                        }}
                      >
                        {formatDate(
                          item.ends_at
                        )}
                      </td>

                      <td>
     <div className={`event-status-badge status-${item.status}`}>
  {item.status === "live" && (
    <span className="live-dot"></span>
  )}

  <span>
    {item.status === "live"
      ? "LIVE"
      : item.status?.toUpperCase()}
  </span>
</div>
                      </td>

                      <td>
                        <span
                          className={
                            item.is_active
                              ? "status-badge status-live"
                              : "status-badge status-ended"
                          }
                        >
                          {item.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td
                        className={
                          index ===
                          FilteredData.length -
                            1
                            ? "action-td action-td-up"
                            : "action-td"
                        }
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <button
                          className="action-menu-toggle"
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId ===
                                item.id
                                ? null
                                : item.id
                            )
                          }
                        >
                          <BsThreeDotsVertical />
                        </button>

                        {openMenuId ===
                          item.id && (
                          <div className="action-buttons-modal">
                            {/* EDIT */}
                            <button
                              className="action-btn1"
                              onClick={() =>
                                openEdit(
                                  item
                                )
                              }
                              disabled={
                                editLoading
                              }
                            >
                              <FaEdit />

                              <span>
                                {editLoading
                                  ? "Loading..."
                                  : "Edit"}
                              </span>
                            </button>

                         {/* DELETE */}
<button
  className="action-btn1"
  onClick={() => openDeleteModal(item)}
  disabled={deleting}
>
  <FaTrash />

  <span>
    Delete
  </span>
</button>

                          <button
  type="button"
  className="action-btn1"
  onClick={() => openGoLiveModal(item)}
  disabled={item.status === "live"}
>
  <FaPlay />
  <span>
    {item.status === "live" ? "Live Now" : "Go Live"}
  </span>
</button>
{item.status === "queued" && (
  <button
    type="button"
    className="action-btn1"
    onClick={() => {
      console.log("CANCEL QUEUE CLICKED", item);

      setCancelQueueItem(item);
      setCancelQueueModalOpen(true);
    }}
  >
    <FaStop />
    <span>Cancel Queue</span>
  </button>
)}

                        {item.status === "live" && (
  <button
    type="button"
    className="action-btn1"
    onClick={() => openEndLiveModal(item)}
  >
    <FaStop />
    <span>End Live</span>
  </button>
)}
{item.status !== "live" &&
  item.status !== "queued" && (
    <button
      type="button"
      className="action-btn1"
      onClick={() => openEnqueueModal(item)}
    >
      <FaPlay />
      <span>Enqueue</span>
    </button>
  )}
  
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                }
              )
            ) : (
              <tr>
                <td colSpan="10">
                  <div className="empty-filter-state">
                    <div className="empty-filter-icon">
                      <FiSearch />
                    </div>

                    <h3>
                      {searchTerm ||
                      statusFilter !==
                        "all" ||
                      modeFilter !==
                        "all"
                        ? "No Banner Events Found"
                        : "No Banner Events Available"}
                    </h3>

                    <p>
                      {searchTerm ||
                      statusFilter !==
                        "all" ||
                      modeFilter !==
                        "all"
                        ? "We couldn't find any banner event matching your search or selected filters."
                        : "There are currently no banner events available."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =================================================
          ADD / EDIT MODAL
      ================================================= */}

      {showAddModal && (
        <div
          className="banner-modal-overlay"
          onClick={
            closeModal
          }
        >
          <div
            className="banner-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* HEADER */}

            <div className="banner-modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit Banner Event"
                    : "Add Banner Event"}
                </h2>

                <p>
                  {editingId
                    ? "Update banner event details"
                    : "Create a new banner event"}
                </p>
              </div>

              <button
                type="button"
                className="banner-modal-close"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
              >
                <FaTimes />
              </button>
            </div>

            {/* BODY */}

            <div className="banner-modal-body">
              {/* TITLE */}

              <div className="banner-form-group">
                <label>
                  Title
                  <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter banner title"
                  value={
                    bannerForm.title
                  }
                  onChange={(e) =>
                    setBannerForm(
                      (prev) => ({
                        ...prev,

                        title:
                          e.target.value,
                      })
                    )
                  }
                />
              </div>

              {/* TAGS */}

              <div className="banner-form-group">
                <label>
                  Event Tags
                </label>

                <input
                  type="text"
                  placeholder="diwali, festival, offer"
                  value={
                    bannerForm.event_tags
                  }
                  onChange={(e) =>
                    setBannerForm(
                      (prev) => ({
                        ...prev,

                        event_tags:
                          e.target.value,
                      })
                    )
                  }
                />

                <small>
                  Separate multiple
                  tags with comma.
                </small>
              </div>

              {/* DATE */}

              <div className="banner-form-grid">
                <div className="banner-form-group">
                  <label>
                    Starts at
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      bannerForm.starts_at
                    }
                    onChange={(e) =>
                      setBannerForm(
                        (prev) => ({
                          ...prev,

                          starts_at:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>

                <div className="banner-form-group">
                  <label>
                    Ends at
                  </label>

                  <input
                    type="datetime-local"
                    value={
                      bannerForm.ends_at
                    }
                    onChange={(e) =>
                      setBannerForm(
                        (prev) => ({
                          ...prev,

                          ends_at:
                            e.target.value,
                        })
                      )
                    }
                  />
                </div>
              </div>

              {/* =================================================
                  MEDIA SECTION
              ================================================= */}

              <div className="banner-media-section">
                <div className="banner-section-title">
                  <div>
                    <h3>
                      Banner Media
                    </h3>

                    <span>
                      Add one or more images
                    </span>
                  </div>
                </div>

                {bannerForm.media.map(
                  (
                    media,
                    index
                  ) => (
                    <div
                      className="banner-media-card"
                      key={index}
                    >
                      {/* MEDIA HEADER */}

                      <div className="banner-media-card-header">
                        <strong>
                          Media{" "}
                          {index + 1}
                        </strong>

                        {bannerForm
                          .media
                          .length >
                          1 && (
                          <button
                            type="button"
                            className="banner-remove-media"
                            onClick={() =>
                              removeMedia(
                                index
                              )
                            }
                            disabled={
                              saving
                            }
                            title="Remove Media"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>

                      {/* IMAGE UPLOAD */}

                      {!media.media_url ? (
                        <label className="banner-upload-box">
                          <input
                            ref={(el) => {
                              fileInputRefs.current[
                                index
                              ] = el;
                            }}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={(e) => {
                              const file =
                                e
                                  .target
                                  .files?.[0];

                              if (file) {
                                handleMediaFile(
                                  index,
                                  file
                                );
                              }

                              e.target.value =
                                "";
                            }}
                          />

                          {uploadingIndex ===
                          index ? (
                            <p>
                              Uploading...
                            </p>
                          ) : (
                            <>
                              <FaChartLine />

                              <p>
                                Click to upload image
                              </p>

                              <small>
                                PNG, JPG, WEBP
                              </small>
                            </>
                          )}
                        </label>
                      ) : (
                        <div className="banner-image-preview">
                          <img
                            src={
                              media.media_url
                            }
                            alt={`Banner ${
                              index + 1
                            }`}
                          />

                          <button
                            type="button"
                            className="banner-image-delete-btn"
                            title="Delete Image"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              deleteMediaImage(
                                index
                              )
                            }
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}

                      {/* =================================================
                          REDIRECT SECTION
                      ================================================= */}

                      <div className="banner-redirect-section">
                        <h4>
                          Redirect
                        </h4>

                        <div className="banner-redirect-grid">
                          {/* =================================================
                              SERVICE CATEGORY
                          ================================================= */}

                          <div className="banner-form-group">
                            <label>
                              Service Category
                            </label>

                            <select
                              value={String(
                                media.service_category_id ||
                                  ""
                              )}
                              onChange={(e) =>
                                handleCategoryChange(
                                  index,
                                  e
                                    .target
                                    .value
                                )
                              }
                              disabled={
                                categoryLoading
                              }
                            >
                              <option value="">
                                {categoryLoading
                                  ? "Loading Categories..."
                                  : "Select Category"}
                              </option>

                              {categories.map(
                                (
                                  category
                                ) => (
                                  <option
                                    key={
                                      category.id
                                    }
                                    value={String(
                                      category.id
                                    )}
                                  >
                                    {
                                      category.name
                                    }
                                  </option>
                                )
                              )}

                              {/* FALLBACK FOR OLD CATEGORY */}

                              {media.service_category_id &&
                                !categories.some(
                                  (
                                    category
                                  ) =>
                                    String(
                                      category.id
                                    ) ===
                                    String(
                                      media.service_category_id
                                    )
                                ) && (
                                  <option
                                    value={String(
                                      media.service_category_id
                                    )}
                                  >
                                    Selected Category (
                                    {
                                      media.service_category_id
                                    }
                                    )
                                  </option>
                                )}
                            </select>
                          </div>

                          {/* =================================================
                              REDIRECT TYPE
                          ================================================= */}

                          <div className="banner-form-group">
                            <label>
                              Redirect Type
                            </label>

                            <select
                              value={
                                media.link_type ||
                                ""
                              }
                              onChange={(e) =>
                                handleTypeChange(
                                  index,
                                  e
                                    .target
                                    .value
                                )
                              }
                              disabled={
                                !media.service_category_id
                              }
                            >
                              <option value="">
                                Select Type
                              </option>

                              <option value="brand">
                                Brand
                              </option>

                              <option value="service">
                                Service
                              </option>
                            </select>
                          </div>

                          {/* =================================================
                              BRAND
                          ================================================= */}

                          {media.link_type ===
                            "brand" && (
                            <div className="banner-form-group full-width">
                              <label>
                                Brand
                              </label>

                              <select
                                value={String(
                                  media.brand_id ||
                                    ""
                                )}
                                onChange={(
                                  e
                                ) =>
                                  handleBrandChange(
                                    index,
                                    e
                                      .target
                                      .value
                                  )
                                }
                              >
                                <option value="">
                                  {brandLoading
                                    ? "Loading Brands..."
                                    : "Select Brand"}
                                </option>

                                {/* FALLBACK OLD BRAND */}

                                {media.brand_id &&
                                  !brands.some(
                                    (
                                      brand
                                    ) =>
                                      String(
                                        brand.id
                                      ) ===
                                      String(
                                        media.brand_id
                                      )
                                  ) && (
                                    <option
                                      value={String(
                                        media.brand_id
                                      )}
                                    >
                                      Selected Brand (
                                      {
                                        media.brand_id
                                      }
                                      )
                                    </option>
                                  )}

                                {brands.map(
                                  (
                                    brand
                                  ) => (
                                    <option
                                      key={
                                        brand.id
                                      }
                                      value={String(
                                        brand.id
                                      )}
                                    >
                                      {
                                        brand.name
                                      }
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                          )}

                          {/* =================================================
                              SERVICE
                          ================================================= */}

                          {media.link_type ===
                            "service" &&
                            (() => {
                              // IMPORTANT:
                              // These variables are ONLY
                              // inside Service block.

                              const slug =
                                categorySlugOf(
                                  media.service_category_id
                                );

                              const categoryName =
                                categoryNameOf(
                                  media.service_category_id
                                )
                                  ?.trim()
                                  .toLowerCase();

                              const isVariant =
                                [
                                  "product",
                                  "products",
                                  "medicine",
                                  "medicines",
                                ].includes(
                                  categoryName
                                );

                              const list =
                                servicesBySlug[
                                  slug
                                ] || [];

                              // Check selected ID
                              const selectedServiceExists =
                                list.some(
                                  (
                                    service
                                  ) => {
                                    const id =
                                      String(
                                        isVariant
                                          ? service?.variant_id ??
                                              service?.id ??
                                              ""
                                          : service?.id ??
                                              service?.service_id ??
                                              ""
                                      );

                                    return (
                                      id ===
                                      String(
                                        media.service_id ||
                                          ""
                                      )
                                    );
                                  }
                                );

                              return (
                                <div className="banner-form-group full-width">
                                  <label>
                                    Service
                                  </label>

                                  <select
                                    value={String(
                                      media.service_id ||
                                        ""
                                    )}
                                    disabled={
                                      !media.service_category_id
                                    }
                                    onFocus={() => {
                                      if (
                                        slug &&
                                        !servicesRef
                                          .current[
                                          slug
                                        ]
                                      ) {
                                        loadServices(
                                          slug
                                        );
                                      }
                                    }}
                                    onChange={(e) =>
                                      handleServiceChange(
                                        index,
                                        e
                                          .target
                                          .value
                                      )
                                    }
                                  >
                                    <option value="">
                                      {!media.service_category_id
                                        ? "Select category first"
                                        : serviceLoadingSlug ===
                                          slug
                                        ? "Loading Services..."
                                        : "Select Service"}
                                    </option>

                                    {/* IMPORTANT:
                                        If old service ID is not
                                        returned by API, still
                                        show selected ID.
                                    */}

                                    {media.service_id &&
                                      !selectedServiceExists && (
                                        <option
                                          value={String(
                                            media.service_id
                                          )}
                                        >
                                          Selected Service (
                                          {
                                            media.service_id
                                          }
                                          )
                                        </option>
                                      )}

                                    {list.map(
                                      (
                                        service,
                                        i
                                      ) => {
                                        const id =
                                          String(
                                            isVariant
                                              ? service?.variant_id ??
                                                  service?.id ??
                                                  ""
                                              : service?.id ??
                                                  service?.service_id ??
                                                  service?.doctor_id ??
                                                  ""
                                          );

                                        const label =
                                          isVariant
                                            ? service?.variant_name ||
                                              service?.name ||
                                              service?.title ||
                                              serviceOptionLabel(
                                                service
                                              )
                                            : service?.name ||
                                              service?.service_name ||
                                              service?.title ||
                                              serviceOptionLabel(
                                                service
                                              );

                                        return (
                                          <option
                                            key={`${id}-${i}`}
                                            value={
                                              id
                                            }
                                          >
                                            {
                                              label ||
                                                "Unnamed Service"
                                            }
                                          </option>
                                        );
                                      }
                                    )}
                                  </select>
                                </div>
                              );
                            })()}
                        </div>

                        {/* =================================================
                            REDIRECT LINK DISPLAY
                        ================================================= */}

                        <div
                          style={{
                            marginTop:
                              "10px",

                            padding:
                              "10px 12px",

                            background:
                              "#f8fafc",

                            border:
                              "1px solid #e5e7eb",

                            borderRadius:
                              "6px",

                            fontSize:
                              "12px",

                            color:
                              "#475569",

                            wordBreak:
                              "break-all",
                          }}
                        >
                          <strong>
                            Redirect:
                          </strong>{" "}
                          {media.redirect_link ||
                            "No redirect selected"}
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* =================================================
                    ADD MEDIA
                ================================================= */}

                <div className="banner-add-media-wrapper">
                  <button
                    type="button"
                    className="banner-add-media-btn"
                    onClick={
                      addMedia
                    }
                    disabled={
                      saving
                    }
                  >
                    <BiPlus />

                    Add Media
                  </button>
                </div>
              </div>
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="banner-modal-footer">
              <button
                type="button"
                className="banner-cancel-btn"
                onClick={
                  closeModal
                }
                disabled={
                  saving
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="banner-save-btn"
                onClick={
                  saveBanner
                }
                disabled={
                  saving
                }
              >
                {saving
                  ? editingId
                    ? "Updating..."
                    : "Creating..."
                  : editingId
                  ? "Update Banner"
                  : "Create Banner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          IMAGE PREVIEW MODAL
      ================================================= */}

      {previewImage && (
        <div
          className="prakriti-modal-overlay"
          onClick={() =>
            setPreviewImage("")
          }
        >
          <div
            className="prakriti-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="prakriti-modal-header">
              <h2>
                Banner Preview
              </h2>

              <button
                className="modal-close-btn"
                onClick={() =>
                  setPreviewImage("")
                }
              >
                <FaTimes />
              </button>
            </div>

            <div
              style={{
                textAlign:
                  "center",

                padding:
                  "20px",
              }}
            >
              <img
                src={
                  previewImage
                }
                alt="Banner Preview"
                style={{
                  display:
                    "block",

                  maxWidth:
                    "100%",

                  maxHeight:
                    "70vh",

                  width:
                    "auto",

                  height:
                    "auto",

                  margin:
                    "0 auto",

                  objectFit:
                    "contain",

                  borderRadius:
                    "10px",
                }}
              />
            </div>

            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() =>
                  setPreviewImage("")
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

     {/* =================================================
    DELETE CONFIRMATION MODAL
================================================= */}

{deleteModalOpen && (
  <div
    className="delete-modal-overlay"
    onClick={closeDeleteModal}
  >
    <div
      className="delete-confirm-modal"
      onClick={(e) =>
        e.stopPropagation()
      }
    >
      {/* HEADER */}

      <div className="delete-modal-header">
        <div className="delete-warning-icon">
          <FaTrash />
        </div>

        <button
          type="button"
          className="delete-modal-close"
          onClick={closeDeleteModal}
          disabled={deleting}
        >
          <FaTimes />
        </button>
      </div>

      {/* BODY */}

      <div className="delete-modal-body">
        <h2>
          Delete Banner Event?
        </h2>

        <p>
          Are you sure you want to delete
          this banner?
        </p>

        {deleteItem && (
          <div className="delete-event-info">
            <strong>
              {deleteItem.title ||
                "Untitled Banner"}
            </strong>

            <span>
              Event ID:{" "}
              {deleteItem.id}
            </span>
          </div>
        )}

        <p className="delete-warning-text">
          This action will soft delete the
          banner event. You won't be able
          to use this event anymore.
        </p>
      </div>

      {/* FOOTER */}

      <div className="delete-modal-footer">
        <button
          type="button"
          className="delete-cancel-btn"
          onClick={closeDeleteModal}
          disabled={deleting}
        >
          No
        </button>

        <button
          type="button"
          className="delete-confirm-btn"
          onClick={deleteBanner}
          disabled={deleting}
        >
          {deleting
            ? "Deleting..."
            : "Yes, Delete"}
        </button>
      </div>
    </div>
  </div>
)}
{goLiveModalOpen && (
  <div
    className="banner-go-live-overlay"
    onClick={closeGoLiveModal}
  >
    <div
      className="banner-go-live-modal"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="banner-go-live-header">
        <div className="banner-go-live-icon">
          <FaPlay />
        </div>

        <button
          type="button"
          className="banner-go-live-close"
          onClick={closeGoLiveModal}
          disabled={goLiveLoading}
        >
          <FaTimes />
        </button>
      </div>

      {/* BODY */}
      <div className="banner-go-live-body">
        <h2>Make Event Live?</h2>

        <p className="banner-go-live-description">
          Are you sure you want to make this event live
          now?
        </p>

        {/* EVENT INFO */}
        {goLiveItem && (
          <div className="banner-go-live-event-info">
            <div>
              <span>Event</span>
              <strong>
                {goLiveItem.title || "Untitled Banner"}
              </strong>
            </div>

            <div>
              <span>Event ID</span>
              <strong>{goLiveItem.id}</strong>
            </div>
          </div>
        )}

        {/* WHAT WILL HAPPEN */}
        <div className="banner-go-live-info-box">
          <div className="banner-go-live-info-title">
            <FaPlay />
            <span>What will happen?</span>
          </div>

          <ul>
            <li>
              This event will go <strong>LIVE immediately</strong>.
            </li>

            <li>
              It will <strong>skip the scheduled queue</strong>.
            </li>

            <li>
              If another event is currently live, it will be{" "}
              <strong>ended automatically</strong>.
            </li>

            <li>
              The selected event will start displaying immediately.
            </li>
          </ul>
        </div>
      </div>

      {/* FOOTER */}
      <div className="banner-go-live-footer">
        <button
          type="button"
          className="banner-go-live-cancel-btn"
          onClick={closeGoLiveModal}
          disabled={goLiveLoading}
        >
          Cancel
        </button>

        <button
          type="button"
          className="banner-go-live-confirm-btn"
          onClick={handleGoLive}
          disabled={goLiveLoading}
        >
          <FaPlay />

          {goLiveLoading
            ? "Going Live..."
            : "Go Live Now"}
        </button>
      </div>
    </div>
  </div>
)}
{endLiveModalOpen && (
  <div
    className="banner-end-live-overlay"
    onClick={closeEndLiveModal}
  >
    <div
      className="banner-end-live-modal"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="banner-end-live-header">
        <div className="banner-end-live-icon">
          <FaStop />
        </div>

        <button
          type="button"
          className="banner-end-live-close"
          onClick={closeEndLiveModal}
          disabled={endLiveLoading}
        >
          <FaTimes />
        </button>
      </div>

      {/* BODY */}
      <div className="banner-end-live-body">
        <h2>End Live Event?</h2>

        <p className="banner-end-live-description">
          Are you sure you want to end this live event now?
        </p>

        {/* EVENT INFO */}
        {endLiveItem && (
          <div className="banner-end-live-event-info">
            <div>
              <span>Event</span>

              <strong>
                {endLiveItem.title || "Untitled Banner"}
              </strong>
            </div>

            <div>
              <span>Event ID</span>

              <strong>
                {endLiveItem.id}
              </strong>
            </div>
          </div>
        )}

        {/* WHAT WILL HAPPEN */}
        <div className="banner-end-live-info-box">
          <div className="banner-end-live-info-title">
            <FaStop />
            <span>What will happen?</span>
          </div>

          <ul>
            <li>
              This event will be{" "}
              <strong>ended immediately</strong>.
            </li>

            <li>
              If another event is queued, the{" "}
              <strong>next queued event</strong> will
              become LIVE.
            </li>

            <li>
              The next event will be promoted automatically.
            </li>
          </ul>
        </div>
      </div>

      {/* FOOTER */}
      <div className="banner-end-live-footer">
        <button
          type="button"
          className="banner-end-live-cancel-btn"
          onClick={closeEndLiveModal}
          disabled={endLiveLoading}
        >
          Cancel
        </button>

        <button
          type="button"
          className="banner-end-live-confirm-btn"
          onClick={handleEndLive}
          disabled={endLiveLoading}
        >
          <FaStop />

          {endLiveLoading
            ? "Ending..."
            : "End Live Now"}
        </button>
      </div>
    </div>
  </div>
)}
{/* ================= ENQUEUE MODAL ================= */}
{enqueueModalOpen && enqueueItem && (
  <div className="banner-enqueue-overlay">
    <div className="banner-enqueue-modal">

      {/* Header */}
      <div className="banner-enqueue-header">
        <div className="banner-enqueue-title-wrapper">
          <div className="banner-enqueue-icon">
            <FaPlay />
          </div>

          <div>
            <h2>Enqueue Event</h2>
            <p>Add this event to the publishing queue</p>
          </div>
        </div>

        <button
          type="button"
          className="banner-enqueue-close"
          onClick={closeEnqueueModal}
          disabled={enqueueLoading}
        >
          <FaTimes />
        </button>
      </div>

      {/* Body */}
      <div className="banner-enqueue-body">

        {/* Main Explanation */}
        <div className="banner-enqueue-intro">
          <strong>What does Enqueue mean?</strong>

          <p>
            Enqueue means putting this event into the
            <strong> publishing queue (waiting line)</strong>.
          </p>
        </div>

        {/* Queue Flow */}
        <div className="banner-enqueue-flow">

          {/* Current Live */}
          <div className="enqueue-flow-item">
            <div className="enqueue-flow-icon live">
              <span></span>
            </div>

            <div className="enqueue-flow-content">
              <strong>Current Live Event</strong>
              <small>
                The event currently being displayed
              </small>
            </div>
          </div>

          <div className="enqueue-flow-arrow">
            ↓
          </div>

          {/* Queue */}
          <div className="enqueue-flow-item">
            <div className="enqueue-flow-icon queued">
              <span>Q</span>
            </div>

            <div className="enqueue-flow-content">
              <strong>Your Event → Queue</strong>
              <small>
                Your event waits for its turn
              </small>
            </div>
          </div>

          <div className="enqueue-flow-arrow">
            ↓
          </div>

          {/* Live */}
          <div className="enqueue-flow-item">
            <div className="enqueue-flow-icon next">
              <FaPlay />
            </div>

            <div className="enqueue-flow-content">
              <strong>Your Event Becomes LIVE</strong>
              <small>
                When its turn comes
              </small>
            </div>
          </div>

        </div>

        {/* What Happens */}
        <div className="banner-enqueue-info">

          <div className="banner-enqueue-info-title">
            <FaChartLine />
            <span>What will happen?</span>
          </div>

          <div className="banner-enqueue-points">

            <div className="enqueue-point">
              <div className="enqueue-point-number">1</div>

              <p>
                <strong>No event is LIVE:</strong>{" "}
                This event will become LIVE immediately.
              </p>
            </div>

            <div className="enqueue-point">
              <div className="enqueue-point-number">2</div>

              <p>
                <strong>Another event is LIVE:</strong>{" "}
                This event will be added to the queue.
              </p>
            </div>

            <div className="enqueue-point">
              <div className="enqueue-point-number">3</div>

              <p>
                <strong>When its turn comes:</strong>{" "}
                This event will become LIVE.
              </p>
            </div>

          </div>
        </div>

        {/* Schedule */}
        <div className="banner-enqueue-schedule">

          <div className="banner-enqueue-schedule-header">
            <FaCalendarAlt />
            <span>Event Schedule</span>
          </div>

          <div className="banner-enqueue-schedule-grid">

            <div className="enqueue-schedule-box">
              <span>Starts At</span>
              <strong>
                {formatEnqueueDateTime(enqueueItem.starts_at)}
              </strong>
            </div>

            <div className="enqueue-schedule-box">
              <span>Ends At</span>
              <strong>
                {formatEnqueueDateTime(enqueueItem.ends_at)}
              </strong>
            </div>

          </div>

        </div>

        {/* Warning */}
        <div className="banner-enqueue-note">
          <span>ⓘ</span>

          <p>
            Make sure the event has valid media, start time,
            and end time before enqueueing.
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="banner-enqueue-footer">

        <button
          type="button"
          className="banner-enqueue-cancel"
          onClick={closeEnqueueModal}
          disabled={enqueueLoading}
        >
          Cancel
        </button>

        <button
          type="button"
          className="banner-enqueue-confirm"
          onClick={handleEnqueue}
          disabled={enqueueLoading}
        >
          {enqueueLoading ? (
            <>
              <FiRefreshCw className="enqueue-spinner" />
              Enqueueing...
            </>
          ) : (
            <>
              <FaPlay />
              Enqueue Event
            </>
          )}
        </button>

      </div>

    </div>
  </div>
)}
{cancelQueueModalOpen && cancelQueueItem && (
      <div className="banner-cancel-queue-overlay">
        <div className="banner-cancel-queue-modal">

          <div className="banner-cancel-queue-header">
            <div className="banner-cancel-queue-title-wrapper">
              <div className="banner-cancel-queue-icon">
                <FaStop />
              </div>

              <div>
                <h2>Cancel from Queue?</h2>
                <p>Remove this event from the publishing queue</p>
              </div>
            </div>

            <button
              type="button"
              className="banner-cancel-queue-close"
              onClick={closeCancelQueueModal}
            >
              <FaTimes />
            </button>
          </div>

          <div className="banner-cancel-queue-body">

            <div className="banner-cancel-queue-intro">
              <div className="banner-cancel-queue-intro-icon">
                <FaStop />
              </div>

              <div>
                <strong>Remove this event from the queue</strong>

                <p>
                  This event is currently waiting in the
                  <strong> publishing queue</strong>.
                  Cancelling it will remove it from the queue.
                </p>
              </div>
            </div>

            <div className="banner-cancel-queue-status">
              <span>Current Status</span>

              <div className="cancel-queue-status-value">
                <span className="cancel-queue-status-dot"></span>
                QUEUED
              </div>
            </div>

            <div className="banner-cancel-queue-info">
              <div className="banner-cancel-queue-info-title">
                <FaChartLine />
                <span>What will happen?</span>
              </div>

              <div className="cancel-queue-points">

                <div className="cancel-queue-point">
                  <span>1</span>
                  <p>
                    This event will be removed from the
                    <strong> queue</strong>.
                  </p>
                </div>

                <div className="cancel-queue-point">
                  <span>2</span>
                  <p>
                    Its status will change from
                    <strong> QUEUED → CANCELLED</strong>.
                  </p>
                </div>

                <div className="cancel-queue-point">
                  <span>3</span>
                  <p>
                    It will not become LIVE automatically.
                  </p>
                </div>

              </div>
            </div>

          </div>

          <div className="banner-cancel-queue-footer">

            <button
              type="button"
              className="banner-cancel-queue-cancel"
              onClick={closeCancelQueueModal}
              disabled={cancelQueueLoading}
            >
              Keep in Queue
            </button>

            <button
              type="button"
              className="banner-cancel-queue-confirm"
              onClick={handleCancelQueue}
              disabled={cancelQueueLoading}
            >
              {cancelQueueLoading ? (
                <>
                  <FiRefreshCw className="cancel-queue-spinner" />
                  Cancelling...
                </>
              ) : (
                <>
                  <FaStop />
                  Cancel from Queue
                </>
              )}
            </button>

          </div>

        </div>
      </div>
    )}
    {mediaGalleryOpen && (
  <div
    className="media-gallery-overlay"
    onClick={() => setMediaGalleryOpen(false)}
  >
    <div
      className="media-gallery-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="media-gallery-header">
        <div>
          <h2>Event Images</h2>
          <p>
            {selectedMedia.length} image
            {selectedMedia.length > 1 ? "s" : ""}
          </p>
        </div>

        <button
          type="button"
          className="media-gallery-close"
          onClick={() => setMediaGalleryOpen(false)}
        >
          <FaTimes />
        </button>
      </div>

      <div className="media-gallery-grid">
        {selectedMedia.map((media, index) => (
          <div
            className="media-gallery-item"
            key={`${media.media_url}-${index}`}
          >
            <img
              src={media.media_url}
              alt={`Banner ${index + 1}`}
              onClick={() => setPreviewImage(media.media_url)}
            />

            <div className="media-gallery-number">
              Image {index + 1}
            </div>
          </div>
        ))}
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

export default BannerEvent;

