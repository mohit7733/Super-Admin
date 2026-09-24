import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCheckCircle,
    FaEdit,
    FaHourglassHalf,
    FaImages,
} from "react-icons/fa";
import { FiEye, FiRefreshCw, FiTrash2, FiUpload } from "react-icons/fi";
import { BsPlus } from "react-icons/bs";
import { toast } from "react-toastify";

import BASE_URL from "../../../Base";
import "./Banner.css";

const MODES = [
    { label: "All modes", value: "" },
    { label: "Testing", value: "testing" },
    { label: "Production", value: "production" },
];

const STATUSES = [
    { label: "All statuses", value: "" },
    { label: "Queued", value: "queued" },
    { label: "Live", value: "live" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Ended", value: "ended" },
];

const ACTION_COPY = {
    delete: {
        title: "Delete event",
        body: "This soft-deletes the event. A live event must be ended before it can be deleted.",
        confirm: "Delete",
    },
    enqueue: {
        title: "Enqueue event",
        body: "If no banner is live, this event goes live immediately. If a banner is already live, this event is queued.",
        confirm: "Enqueue",
    },
    cancel: {
        title: "Cancel queue",
        body: "This removes the event from the queue and sets its status to cancelled.",
        confirm: "Cancel queue",
    },
    end: {
        title: "End live event",
        body: "This ends the live event now. The next queued event, if any, becomes live.",
        confirm: "End now",
    },
    goLive: {
        title: "Go live now",
        body: "This ends the current live event, if any, and makes this event live immediately. It does not wait in the queue.",
        confirm: "Go live",
    },
};

const SERVICE_CATEGORY_MAP = {
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

const SCREEN_MAP = {
    doctors: { base: "ConsultScreen", detail: "DoctorProfile" },
    doctor: { base: "ConsultScreen", detail: "DoctorProfile" },
    products: { base: "ProductsScreen", detail: "ProductDetails" },
    product: { base: "ProductsScreen", detail: "ProductDetails" },
    diets: { base: "DietScreen", detail: "DietPlanDetail" },
    diet: { base: "DietScreen", detail: "DietPlanDetail" },
    medicine: { base: "MedicineScreen", detail: "ProductDetails" },
    medicines: { base: "MedicineScreen", detail: "ProductDetails" },
    yoga: { base: "YogaScreen", detail: "YogaSession" },
    yogas: { base: "YogaScreen", detail: "YogaSession" },
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

const statusOf = (event) => String(event?.status || "").toLowerCase();

const tagsToText = (tags) => {
    if (Array.isArray(tags)) {
        return tags.map((tag) => String(tag).trim()).filter(Boolean).join(", ");
    }
    return typeof tags === "string" ? tags : "";
};

const textToTags = (text) =>
    String(text || "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

const toInputDateTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        const match = String(value).match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
        return match ? match[1] : "";
    }

    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);

    const pick = (type) => parts.find((part) => part.type === type)?.value || "";
    const hour = pick("hour") === "24" ? "00" : pick("hour");
    return `${pick("year")}-${pick("month")}-${pick("day")}T${hour}:${pick("minute")}`;
};

const toApiDateTime = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return null;
    if (/[zZ]|[+-]\d{2}:\d{2}$/.test(trimmed)) return trimmed;
    const withSeconds = trimmed.length === 16 ? `${trimmed}:00` : trimmed;
    return `${withSeconds}+05:30`;
};

const formatWhen = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(date);
};

const selectionFromRedirect = (redirectLink) => {
    const link = String(redirectLink || "");
    const brandMatch = link.match(/^CategoryProduct\/(.+)$/);
    if (brandMatch) {
        return {
            service_category_id: "",
            link_type: "brand",
            brand_id: brandMatch[1],
            service_id: "",
        };
    }
    return {
        service_category_id: "",
        link_type: "",
        brand_id: "",
        service_id: "",
    };
};

const categoryNameFromRedirect = (redirectLink) => {
    const link = String(redirectLink || "");
    if (link.startsWith("ConsultScreen") || link.startsWith("DoctorProfile")) return "doctors";
    if (link.startsWith("ProductsScreen")) return "products";
    if (link.startsWith("DietScreen") || link.startsWith("DietScreen")) return "diets";
    if (link.startsWith("MedicineScreen")) return "medicine";
    if (link.startsWith("YogaScreen") || link.startsWith("YogaSession")) return "yoga";
    if (link.startsWith("ProductDetails")) return "products";
    return "";
};

const serviceIdFromRedirect = (redirectLink) => {
    const match = String(redirectLink || "").match(/^(?:DoctorProfile|ProductDetails|DietDetails|YogaSession)\/(.+)$/);
    return match ? match[1] : "";
};

const isVariantCategory = (categoryName) =>
    ["product", "products", "medicine", "medicines"].includes(categoryName);

const serviceOptionId = (service, categoryName) => {
    const id = isVariantCategory(categoryName) ? service?.variant_id : service?.id;
    return id === null || id === undefined || id === "" ? "" : String(id);
};

const serviceOptionLabel = (service, categoryName) => {
    if (isVariantCategory(categoryName)) {
        return service?.variant_name || service?.name || "Unnamed Service";
    }
    return service?.name || "Unnamed Service";
};

const readList = (data) => {
    const payload = data?.data ?? data?.results ?? data;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.services)) return payload.services;
    return [];
};

const mediaToForm = (media) => {
    if (!Array.isArray(media) || media.length === 0) return [emptyMedia()];
    return media.map((item) => ({
        ...emptyMedia(),
        ...selectionFromRedirect(item?.redirect_link),
        media_url: item?.media_url || "",
        media_type: item?.media_type === "video" ? "video" : "image",
        redirect_link: item?.redirect_link || "",
    }));
};

const eventToForm = (event = {}) => ({
    title: event.title || "",
    event_tags: tagsToText(event.event_tags),
    scope: event.scope || "hero",
    mode: event.mode || "production",
    starts_at: toInputDateTime(event.starts_at),
    ends_at: toInputDateTime(event.ends_at),
    media: mediaToForm(event.media),
    notes: event.notes || "",
    is_active: event.is_active !== false,
});

const enqueueBlockReason = (event) => {
    const media = Array.isArray(event?.media) ? event.media : [];
    const hasMedia = media.some((item) => item?.media_url && item?.media_type);
    if (!hasMedia) return "Add media before enqueueing this event.";

    const starts = event?.starts_at ? new Date(event.starts_at) : null;
    const ends = event?.ends_at ? new Date(event.ends_at) : null;
    const endsAfterStart =
        starts &&
        ends &&
        !Number.isNaN(starts.getTime()) &&
        !Number.isNaN(ends.getTime()) &&
        ends > starts;
    const endsInFuture = ends && !Number.isNaN(ends.getTime()) && ends > new Date();

    if (!endsAfterStart && !endsInFuture) {
        return "Set a valid schedule. End time must be after the start time, or the end time must be in the future.";
    }

    return "";
};

const readEvents = (data) => {
    if (!data) return [];
    const payload = data.data !== undefined ? data.data : data.results !== undefined ? data.results : data;
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.results)) return payload.results;
    if (payload && Array.isArray(payload.events)) return payload.events;
    if (payload && typeof payload === "object" && (payload.id !== undefined || payload.title)) {
        return [payload];
    }
    return [];
};

const isOk = (data, response) => {
    if (!response.ok || data?.success === false) return false;
    const status = typeof data?.status === "string" ? data.status.toLowerCase() : "";
    return !["error", "failed", "fail"].includes(status);
};

const errorMessage = (data, fallback) => {
    if (!data) return fallback;
    if (typeof data.message === "string" && data.message.trim()) return data.message;
    if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
    if (typeof data.error === "string" && data.error.trim()) return data.error;
    if (data.detail && typeof data.detail === "object") return JSON.stringify(data.detail);
    return fallback;
};

const eventPath = (id, action) => {
    const root = action ? `/banners/admin/events/${action}/` : "/banners/admin/events/";
    return `${root}?id=${encodeURIComponent(id)}`;
};

const pillClass = (value) => {
    const key = String(value || "").toLowerCase();
    if (["live", "queued", "cancelled", "ended", "testing", "production"].includes(key)) return key;
    return "other";
};

const EventBanner = () => {
    const navigate = useNavigate();
    const requestSerial = useRef(0);

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        id: "",
        mode: "",
        status: "",
        scope: "",
    });
    const [appliedId, setAppliedId] = useState("");
    const [appliedScope, setAppliedScope] = useState("");
    const [showEdit, setShowEdit] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [uploadingIndex, setUploadingIndex] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [pendingAction, setPendingAction] = useState("");
    const [viewEvent, setViewEvent] = useState(null);
    const [viewLoading, setViewLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [brandLoading, setBrandLoading] = useState(false);
    const [servicesBySlug, setServicesBySlug] = useState({});
    const [serviceLoadingSlug, setServiceLoadingSlug] = useState("");
    const servicesRef = useRef({});
    const loadingSlugs = useRef(new Set());

    const request = useCallback(async (path, { method = "GET", body } = {}) => {
        const token = sessionStorage.getItem("superadmin_token");
        if (!token) {
            toast.error("Session expired. Please login again");
            navigate("/login");
            return null;
        }

        const response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true",
                ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
            },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        if (response.status === 401 || response.status === 403) {
            sessionStorage.removeItem("superadmin_token");
            toast.error("Session expired. Please login again");
            navigate("/login");
            return null;
        }

        const text = await response.text();
        let data = null;
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = { message: text };
            }
        }

        return { response, data };
    }, [navigate]);

    const loadEvents = useCallback(async ({ soft = false } = {}) => {
        const current = ++requestSerial.current;
        if (soft) setRefreshing(true);
        else setLoading(true);
        if (!soft) setError(null);

        const params = new URLSearchParams();
        if (appliedId) params.set("id", appliedId);
        if (filters.mode) params.set("mode", filters.mode);
        if (filters.status) params.set("status", filters.status);
        if (appliedScope) params.set("scope", appliedScope);
        const query = params.toString();
        const path = query ? `/banners/admin/events/?${query}` : "/banners/admin/events/";

        try {
            const result = await request(path);
            if (!result || current !== requestSerial.current) return;

            if (!isOk(result.data, result.response)) {
                const message = errorMessage(result.data, "Failed to fetch events");
                if (!soft) {
                    setEvents([]);
                    setError(message);
                }
                toast.error(message);
                return;
            }

            setError(null);
            setEvents(readEvents(result.data));
        } catch (loadError) {
            console.error("Event list error:", loadError);
            if (current !== requestSerial.current) return;
            if (!soft) {
                setEvents([]);
                setError("Something went wrong while fetching events.");
            }
            toast.error("Failed to fetch events");
        } finally {
            if (current === requestSerial.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, [appliedId, appliedScope, filters.mode, filters.status, request]);

    useEffect(() => {
        const timer = setTimeout(() => setAppliedId(filters.id.trim()), 400);
        return () => clearTimeout(timer);
    }, [filters.id]);

    useEffect(() => {
        const timer = setTimeout(() => setAppliedScope(filters.scope.trim()), 400);
        return () => clearTimeout(timer);
    }, [filters.scope]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const loadCategories = useCallback(async () => {
        setCategoryLoading(true);
        try {
            const result = await request("/user/admin/service-category/");
            if (!result || !isOk(result.data, result.response)) {
                toast.error(errorMessage(result?.data, "Failed to fetch categories"));
                return;
            }
            setCategories(readList(result.data));
        } catch (categoryError) {
            console.error("Category list error:", categoryError);
            toast.error("Failed to fetch categories");
        } finally {
            setCategoryLoading(false);
        }
    }, [request]);

    const loadBrands = useCallback(async () => {
        setBrandLoading(true);
        try {
            const result = await request("/vendors/admin/brand-name/");
            if (!result || !isOk(result.data, result.response)) {
                toast.error(errorMessage(result?.data, "Failed to fetch brands"));
                setBrands([]);
                return;
            }
            setBrands(readList(result.data));
        } catch (brandError) {
            console.error("Brand list error:", brandError);
            toast.error("Failed to fetch brands");
            setBrands([]);
        } finally {
            setBrandLoading(false);
        }
    }, [request]);

    const loadServices = useCallback(async (slug) => {
        if (!slug || servicesRef.current[slug] || loadingSlugs.current.has(slug)) return;
        loadingSlugs.current.add(slug);
        setServiceLoadingSlug(slug);
        try {
            const result = await request(`/user/admin/services/?category=${encodeURIComponent(slug)}`);
            const list = result && isOk(result.data, result.response) ? readList(result.data) : [];
            if (result && !isOk(result.data, result.response)) {
                toast.error(errorMessage(result.data, "Failed to fetch services"));
            }
            servicesRef.current[slug] = list;
            setServicesBySlug((prev) => ({ ...prev, [slug]: list }));
        } catch (serviceError) {
            console.error("Service list error:", serviceError);
            toast.error("Failed to fetch services");
            servicesRef.current[slug] = [];
            setServicesBySlug((prev) => ({ ...prev, [slug]: [] }));
        } finally {
            loadingSlugs.current.delete(slug);
            setServiceLoadingSlug("");
        }
    }, [request]);

    useEffect(() => {
        if (!showEdit) return;
        if (categories.length === 0) loadCategories();
        if (brands.length === 0) loadBrands();
    }, [showEdit, categories.length, brands.length, loadCategories, loadBrands]);

    useEffect(() => {
        if (!showEdit || categories.length === 0) return;

        setForm((prev) => {
            let changed = false;
            const media = prev.media.map((item) => {
                if (item.service_category_id || item.link_type === "brand") return item;
                const guessedName = categoryNameFromRedirect(item.redirect_link);
                if (!guessedName) return item;
                const category = categories.find(
                    (cat) => cat.name?.trim().toLowerCase() === guessedName
                );
                if (!category) return item;
                changed = true;
                return {
                    ...item,
                    service_category_id: String(category.id),
                    link_type: "service",
                    service_id: serviceIdFromRedirect(item.redirect_link),
                };
            });
            return changed ? { ...prev, media } : prev;
        });
    }, [showEdit, categories]);

    useEffect(() => {
        if (!showEdit) return;
        form.media.forEach((item) => {
            const category = categories.find((cat) => String(cat.id) === String(item.service_category_id));
            const slug = SERVICE_CATEGORY_MAP[category?.name?.trim().toLowerCase()];
            if (slug) loadServices(slug);
        });
    }, [showEdit, form.media, categories, loadServices]);

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
            formData.append("dir", "banners");

            const response = await fetch(`${BASE_URL}/user/upload/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true",
                },
                body: formData,
            });

            if (response.status === 401 || response.status === 403) {
                sessionStorage.removeItem("superadmin_token");
                toast.error("Session expired. Please login again");
                navigate("/login");
                return null;
            }

            const data = await response.json();
            const url = data?.data?.url || data?.url || null;
            if (!response.ok || !url) {
                toast.error(errorMessage(data, "Image upload failed"));
                return null;
            }
            return url;
        } catch (uploadError) {
            console.error("Media upload error:", uploadError);
            toast.error("Image upload failed");
            return null;
        }
    };

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm());
        setErrors({});
        setShowEdit(true);
    };

    const openEdit = (event) => {
        setEditingId(event.id);
        setForm(eventToForm(event));
        setErrors({});
        setShowEdit(true);
    };

    const closeEdit = () => {
        setShowEdit(false);
        setEditingId(null);
        setForm(emptyForm());
        setErrors({});
    };

    const updateMedia = (index, patch) => {
        setForm((prev) => ({
            ...prev,
            media: prev.media.map((item, itemIndex) =>
                itemIndex === index ? { ...item, ...patch } : item
            ),
        }));
    };

    const categoryNameOf = (categoryId) => {
        const category = categories.find((cat) => String(cat.id) === String(categoryId));
        return category?.name?.trim().toLowerCase() || "";
    };

    const handleMediaCategory = (index, categoryId) => {
        const categoryName = categoryNameOf(categoryId);
        const config = SCREEN_MAP[categoryName];
        const slug = SERVICE_CATEGORY_MAP[categoryName];
        updateMedia(index, {
            service_category_id: categoryId,
            link_type: categoryId ? "service" : "",
            brand_id: "",
            service_id: "",
            redirect_link: config?.base || "",
        });
        if (slug) loadServices(slug);
    };

    const handleMediaBrand = (index, brandId) => {
        updateMedia(index, {
            brand_id: brandId,
            service_id: "",
            redirect_link: brandId ? `CategoryProduct/${brandId}` : "",
        });
    };

    const handleMediaService = (index, serviceId, categoryId) => {
        const config = SCREEN_MAP[categoryNameOf(categoryId)];
        let redirectLink = "";
        if (config) {
            redirectLink = serviceId && config.detail ? `${config.detail}/${serviceId}` : config.base;
        }
        updateMedia(index, {
            service_id: serviceId,
            redirect_link: redirectLink,
        });
    };

    const handleMediaFile = async (index, file) => {
        if (!file) return;
        setUploadingIndex(index);
        const url = await uploadImage(file);
        setUploadingIndex(null);
        if (!url) return;
        updateMedia(index, { media_url: url, media_type: "image" });
    };

    const validateForm = () => {
        const nextErrors = {};
        if (!form.title.trim()) nextErrors.title = "Title is required";
        if (!form.scope.trim()) nextErrors.scope = "Scope is required";
        if (!form.mode) nextErrors.mode = "Mode is required";

        if (form.starts_at && form.ends_at) {
            const starts = new Date(toApiDateTime(form.starts_at));
            const ends = new Date(toApiDateTime(form.ends_at));
            if (!Number.isNaN(starts.getTime()) && !Number.isNaN(ends.getTime()) && ends <= starts) {
                nextErrors.ends_at = "End time must be after the start time";
            }
        }

        const media = form.media.filter((item) => item.media_url.trim() || item.redirect_link.trim());
        if (media.length === 0) {
            nextErrors.media = "Add at least one media item";
        } else if (media.some((item) => !item.media_url.trim() || !item.media_type)) {
            nextErrors.media = "Each media item needs a URL and a type";
        }

        return nextErrors;
    };

    const buildPayload = () => ({
        title: form.title.trim(),
        event_tags: textToTags(form.event_tags),
        scope: form.scope.trim(),
        mode: form.mode,
        starts_at: toApiDateTime(form.starts_at),
        ends_at: toApiDateTime(form.ends_at),
        media: form.media
            .filter((item) => item.media_url.trim())
            .map((item) => ({
                media_url: item.media_url.trim(),
                media_type: item.media_type,
                redirect_link: item.redirect_link.trim() || null,
            })),
        notes: form.notes.trim() || null,
        is_active: Boolean(form.is_active),
    });

    const handleUpdate = async (event) => {
        event.preventDefault();
        const nextErrors = validateForm();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        const creating = !editingId;
        setSaving(true);
        try {
            const result = await request(creating ? "/banners/admin/events/" : eventPath(editingId), {
                method: creating ? "POST" : "PUT",
                body: buildPayload(),
            });
            if (!result) return;

            if (!isOk(result.data, result.response)) {
                toast.error(errorMessage(result.data, creating ? "Failed to create event" : "Failed to update event"));
                return;
            }

            toast.success(
                typeof result.data?.message === "string"
                    ? result.data.message
                    : creating
                        ? "Event created"
                        : "Event updated"
            );
            closeEdit();
            await loadEvents({ soft: true });
        } catch (updateError) {
            console.error("Save event error:", updateError);
            toast.error(creating ? "Failed to create event" : "Failed to update event");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (event) => {
        const key = `${event.id}:active`;
        setPendingAction(key);
        try {
            const result = await request(eventPath(event.id), {
                method: "PATCH",
                body: { is_active: !event.is_active },
            });
            if (!result) return;

            if (!isOk(result.data, result.response)) {
                toast.error(errorMessage(result.data, "Failed to update event"));
                return;
            }

            toast.success(event.is_active ? "Event deactivated" : "Event activated");
            await loadEvents({ soft: true });
        } catch (toggleError) {
            console.error("Patch event error:", toggleError);
            toast.error("Failed to update event");
        } finally {
            setPendingAction("");
        }
    };

    const openConfirm = (action, event) => {
        if (action === "delete" && statusOf(event) === "live") {
            toast.error("A live event must be ended before it can be deleted.");
            return;
        }
        if (action === "cancel" && statusOf(event) !== "queued") {
            toast.error("Only a queued event can be cancelled.");
            return;
        }
        if (action === "end" && statusOf(event) !== "live") {
            toast.error("Only a live event can be ended.");
            return;
        }
        if (action === "enqueue") {
            const reason = enqueueBlockReason(event);
            if (reason) {
                toast.error(reason);
                return;
            }
        }
        setConfirm({ action, event });
    };

    const runConfirm = async () => {
        if (!confirm?.event?.id) return;
        const { action, event } = confirm;
        const key = `${event.id}:${action}`;
        const pathByAction = {
            delete: { method: "DELETE", path: eventPath(event.id) },
            enqueue: { method: "POST", path: eventPath(event.id, "enqueue") },
            cancel: { method: "POST", path: eventPath(event.id, "cancel-queue") },
            end: { method: "POST", path: eventPath(event.id, "end-now") },
            goLive: { method: "POST", path: eventPath(event.id, "go-live") },
        };
        const fallback = {
            delete: "Event deleted",
            enqueue: "Event enqueued",
            cancel: "Event removed from the queue",
            end: "Live event ended",
            goLive: "Event is now live",
        };
        const failure = {
            delete: "Failed to delete event",
            enqueue: "Failed to enqueue event",
            cancel: "Failed to cancel the queued event",
            end: "Failed to end the live event",
            goLive: "Failed to make the event live",
        };

        setPendingAction(key);
        try {
            const result = await request(pathByAction[action].path, {
                method: pathByAction[action].method,
            });
            if (!result) return;

            if (!isOk(result.data, result.response)) {
                toast.error(errorMessage(result.data, failure[action]));
                return;
            }

            toast.success(
                typeof result.data?.message === "string" ? result.data.message : fallback[action]
            );
            setConfirm(null);
            await loadEvents({ soft: true });
        } catch (actionError) {
            console.error("Event action error:", actionError);
            toast.error(failure[action]);
        } finally {
            setPendingAction("");
        }
    };

    const openView = async (event) => {
        setViewEvent(event);
        setViewLoading(true);
        try {
            const result = await request(eventPath(event.id));
            if (result && isOk(result.data, result.response)) {
                const [fresh] = readEvents(result.data);
                if (fresh) setViewEvent(fresh);
            }
        } catch (viewError) {
            console.error("Event detail error:", viewError);
        } finally {
            setViewLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({ id: "", mode: "", status: "", scope: "" });
        setAppliedId("");
        setAppliedScope("");
    };

    const hasFilters = Boolean(filters.id || filters.mode || filters.status || filters.scope);
    const liveCount = events.filter((item) => statusOf(item) === "live").length;
    const queuedCount = events.filter((item) => statusOf(item) === "queued").length;
    const modeOptions = MODES.some((item) => item.value === form.mode)
        ? MODES.filter((item) => item.value)
        : [...MODES.filter((item) => item.value), { label: form.mode, value: form.mode }];

    const firstMedia = (event) => (Array.isArray(event.media) ? event.media[0] : null);

    return (
        <>
            <div className="page-header">
                <h1>Banner Management</h1>
                <p className="page-paragraph">
                    Manage banner events, media, schedules, and publishing.
                </p>
            </div>

            <div className="vendors-stats stats2-grid">
                <div className="stat2-card">
                    <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                        <FaImages size={16} />
                    </div>
                    <div className="stat2-info">
                        <h3>Total Events</h3>
                        <div className="stat2-value">{events.length}</div>
                    </div>
                </div>
                <div className="stat2-card">
                    <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                        <FaCheckCircle size={16} />
                    </div>
                    <div className="stat2-info">
                        <h3>Live</h3>
                        <div className="stat2-value">{liveCount}</div>
                    </div>
                </div>
                <div className="stat2-card">
                    <div className="stat2-icon" style={{ background: "#0D614E20", color: "#0D614E" }}>
                        <FaHourglassHalf size={16} />
                    </div>
                    <div className="stat2-info">
                        <h3>Queued</h3>
                        <div className="stat2-value">{queuedCount}</div>
                    </div>
                </div>
            </div>

            <div className="banner-toolbar">
                <div className="banner-filters">
                    
                    <label className="banner-filter">
                        
                        <select
                            value={filters.mode}
                            onChange={(event) => setFilters((prev) => ({ ...prev, mode: event.target.value }))}
                        >
                            {MODES.map((item) => (
                                <option key={item.label} value={item.value}>{item.label}</option>
                            ))}
                        </select>
                    </label>
                    <label className="banner-filter">
                     
                        <select
                            value={filters.status}
                            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                        >
                            {STATUSES.map((item) => (
                                <option key={item.label} value={item.value}>{item.label}</option>
                            ))}
                        </select>
                    </label>
                   
                    {hasFilters && (
                        <button type="button" className="banner-clear" onClick={clearFilters}>
                            Clear
                        </button>
                    )}
                </div>
                <div className="banner-toolbar-actions">
                    <button type="button" className="add-customer-btn" onClick={openCreate}>
                        <BsPlus size={18} />
                        Add event
                    </button>
                 
                </div>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Event</th>
                            <th>Scope</th>
                            <th>Mode</th>
                            <th>Status</th>
                            <th>Schedule</th>
                            <th>Media</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array(3).fill(0).map((_, index) => (
                                <tr key={index}>
                                    <td colSpan="8"><div className="skeleton-row"></div></td>
                                </tr>
                            ))
                        ) : error ? (
                            <tr>
                                <td colSpan="8" style={{ color: "red" }}>{error}</td>
                            </tr>
                        ) : events.length > 0 ? (
                            events.map((item) => {
                                const status = statusOf(item);
                                const media = firstMedia(item);
                                const enqueueReason = enqueueBlockReason(item);
                                const rowBusy = pendingAction.startsWith(`${item.id}:`);
                                const tags = Array.isArray(item.event_tags) ? item.event_tags : [];

                                return (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="banner-title">{item.title || "Untitled event"}</div>
                                            <div className="banner-id">ID: {item.id}</div>
                                            {tags.length > 0 && (
                                                <div className="banner-tags">
                                                    {tags.map((tag) => (
                                                        <span className="banner-tag" key={`${item.id}-${tag}`}>{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td>{item.scope || "—"}</td>
                                        <td>
                                            <span className={`banner-pill ${pillClass(item.mode)}`}>
                                                {item.mode || "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`banner-pill ${pillClass(item.status)}`}>
                                                {item.status || "—"}
                                            </span>
                                        </td>
                                        <td>
                                            <div>{formatWhen(item.starts_at)}</div>
                                            <div className="banner-muted">to {formatWhen(item.ends_at)}</div>
                                        </td>
                                        <td>
                                            {media?.media_type === "image" && media.media_url ? (
                                                <img
                                                    className="banner-thumb"
                                                    src={media.media_url}
                                                    alt=""
                                                    onClick={() => setPreview({ url: media.media_url, type: "image" })}
                                                />
                                            ) : media?.media_url ? (
                                                <button
                                                    type="button"
                                                    className="banner-text-btn"
                                                    onClick={() => setPreview({ url: media.media_url, type: media.media_type || "video" })}
                                                >
                                                    {media.media_type || "Media"}
                                                </button>
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(item.is_active)}
                                                    disabled={rowBusy}
                                                    onChange={() => handleToggleActive(item)}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </td>
                                        <td>
                                            <div className="banner-actions">
                                                <button type="button" className="action-btn view" title="View" onClick={() => openView(item)}>
                                                    <FiEye />
                                                </button>
                                                <button type="button" className="action-btn edit" title="Edit" onClick={() => openEdit(item)}>
                                                    <FaEdit />
                                                </button>
                                                {status !== "live" && status !== "queued" && status !== "ended" && (
                                                    <button
                                                        type="button"
                                                        className="banner-text-btn"
                                                        title={enqueueReason || "Enqueue"}
                                                        disabled={rowBusy || Boolean(enqueueReason)}
                                                        onClick={() => openConfirm("enqueue", item)}
                                                    >
                                                        Enqueue
                                                    </button>
                                                )}
                                                {status === "queued" && (
                                                    <button
                                                        type="button"
                                                        className="banner-text-btn"
                                                        disabled={rowBusy}
                                                        onClick={() => openConfirm("cancel", item)}
                                                    >
                                                        Cancel queue
                                                    </button>
                                                )}
                                                {status === "live" && (
                                                    <button
                                                        type="button"
                                                        className="banner-text-btn"
                                                        disabled={rowBusy}
                                                        onClick={() => openConfirm("end", item)}
                                                    >
                                                        End live
                                                    </button>
                                                )}
                                                {status !== "live" && new Date(item.ends_at) > new Date() && (
                                                    <button
                                                        type="button"
                                                        className="banner-text-btn primary"
                                                        disabled={rowBusy}
                                                        onClick={() => openConfirm("goLive", item)}
                                                    >
                                                        Go live
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    className="action-btn delete"
                                                    title={status === "live" ? "End the live event before deleting" : "Delete"}
                                                    disabled={rowBusy || status === "live"}
                                                    onClick={() => openConfirm("delete", item)}
                                                >
                                                    <FiTrash2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: "center" }}>No events found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showEdit && (
                <div className="prakriti-modal-overlay" onClick={closeEdit}>
                    <div className="prakriti-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="prakriti-modal-header">
                            <h2>{editingId ? "Edit event" : "Add event"}</h2>
                            <button type="button" className="close-btn" onClick={closeEdit}>✕</button>
                        </div>
                        <form className="prakriti-form banner-event-form" onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    value={form.title}
                                    onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                                />
                                {errors.title && <p className="error-text">{errors.title}</p>}
                            </div>

                            <div className="form-group">
                                <label>Tags</label>
                                <input
                                    value={form.event_tags}
                                    placeholder="diwali, sale"
                                    onChange={(event) => setForm((prev) => ({ ...prev, event_tags: event.target.value }))}
                                />
                            </div>

                            <div className="banner-form-grid">
                                <div className="form-group">
                                    <label>Scope</label>
                                    <input
                                        list="banner-scope-options"
                                        value={form.scope}
                                        onChange={(event) => setForm((prev) => ({ ...prev, scope: event.target.value }))}
                                    />
                                    {errors.scope && <p className="error-text">{errors.scope}</p>}
                                </div>
                                <div className="form-group">
                                    <label>Mode</label>
                                    <select
                                        value={form.mode}
                                        onChange={(event) => setForm((prev) => ({ ...prev, mode: event.target.value }))}
                                    >
                                        {modeOptions.map((item) => (
                                            <option key={item.value} value={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                    {errors.mode && <p className="error-text">{errors.mode}</p>}
                                </div>
                            </div>

                            <div className="banner-form-grid">
                                <div className="form-group">
                                    <label>Starts at (IST)</label>
                                    <input
                                        type="datetime-local"
                                        value={form.starts_at}
                                        onChange={(event) => setForm((prev) => ({ ...prev, starts_at: event.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ends at (IST)</label>
                                    <input
                                        type="datetime-local"
                                        value={form.ends_at}
                                        onChange={(event) => setForm((prev) => ({ ...prev, ends_at: event.target.value }))}
                                    />
                                    {errors.ends_at && <p className="error-text">{errors.ends_at}</p>}
                                </div>
                            </div>

                            <div className="dynamic-section">
                                <div className="section-header">
                                    <h3>Media</h3>
                                    <button
                                        type="button"
                                        className="banner-text-btn"
                                        onClick={() => setForm((prev) => ({ ...prev, media: [...prev.media, emptyMedia()] }))}
                                    >
                                        Add media
                                    </button>
                                </div>
                                {errors.media && <p className="error-text">{errors.media}</p>}
                                {form.media.map((item, index) => (
                                    <div className="banner-media-card" key={`media-${index}`}>
                                        <div className="banner-media-head">
                                            <span>Media {index + 1}</span>
                                            {form.media.length > 1 && (
                                                <button type="button" className="banner-text-btn danger" onClick={() => {
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        media: prev.media.filter((_, itemIndex) => itemIndex !== index),
                                                    }));
                                                }}>
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                        <div className="form-group">
                                            <label>Media URL</label>
                                            <input
                                                value={item.media_url}
                                                onChange={(event) => updateMedia(index, { media_url: event.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Media type</label>
                                            <select
                                                value={item.media_type}
                                                onChange={(event) => updateMedia(index, { media_type: event.target.value })}
                                            >
                                                <option value="image">Image</option>
                                                <option value="video">Video</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Select category</label>
                                            <select
                                                value={item.service_category_id}
                                                disabled={categoryLoading}
                                                onChange={(event) => handleMediaCategory(index, event.target.value)}
                                            >
                                                <option value="">
                                                    {categoryLoading ? "Loading categories..." : "Select category"}
                                                </option>
                                                {categories
                                                    .filter((cat) => cat.is_active === true)
                                                    .map((cat) => (
                                                        <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                                                    ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Type</label>
                                            <div className="type-options">
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={item.link_type === "brand"}
                                                        onChange={() => updateMedia(index, {
                                                            link_type: "brand",
                                                            service_id: "",
                                                        })}
                                                    />
                                                    Brand
                                                </label>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={item.link_type === "service"}
                                                        onChange={() => updateMedia(index, {
                                                            link_type: "service",
                                                            brand_id: "",
                                                        })}
                                                    />
                                                    Service
                                                </label>
                                            </div>
                                        </div>
                                        {item.link_type === "brand" && (
                                            <div className="form-group">
                                                <label>Brand</label>
                                                <select
                                                    value={item.brand_id}
                                                    onChange={(event) => handleMediaBrand(index, event.target.value)}
                                                >
                                                    <option value="">
                                                        {brandLoading ? "Loading brands..." : "Select brand"}
                                                    </option>
                                                    {brands
                                                        .filter((brand) => brand.is_active)
                                                        .map((brand) => (
                                                            <option key={brand.id} value={String(brand.id)}>{brand.name}</option>
                                                        ))}
                                                </select>
                                            </div>
                                        )}
                                        {item.link_type === "service" && (
                                            <div className="form-group">
                                                <label>Service</label>
                                                <select
                                                    value={item.service_id}
                                                    onChange={(event) => handleMediaService(index, event.target.value, item.service_category_id)}
                                                >
                                                    <option value="">
                                                        {serviceLoadingSlug === SERVICE_CATEGORY_MAP[categoryNameOf(item.service_category_id)]
                                                            ? "Loading services..."
                                                            : "Select service"}
                                                    </option>
                                                    {(servicesBySlug[SERVICE_CATEGORY_MAP[categoryNameOf(item.service_category_id)]] || []).map((service, serviceIndex) => {
                                                        const categoryName = categoryNameOf(item.service_category_id);
                                                        const optionId = serviceOptionId(service, categoryName);
                                                        return (
                                                            <option key={`${optionId}-${serviceIndex}`} value={optionId}>
                                                                {serviceOptionLabel(service, categoryName)}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                            </div>
                                        )}
                                        <div className="form-group">
                                            <label>Redirect link</label>
                                            <input
                                                value={item.redirect_link}
                                                placeholder="ProductDetails/variant-id"
                                                onChange={(event) => updateMedia(index, { redirect_link: event.target.value })}
                                            />
                                        </div>
                                        {item.media_type === "image" && (
                                            <div className="banner-upload-row">
                                                <FiUpload />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    disabled={uploadingIndex === index}
                                                    onChange={(event) => {
                                                        const file = event.target.files?.[0];
                                                        event.target.value = "";
                                                        handleMediaFile(index, file);
                                                    }}
                                                />
                                                {uploadingIndex === index && <span className="banner-muted">Uploading...</span>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                                />
                            </div>

                            <div className="form-group">
                                <label className="banner-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={form.is_active}
                                        onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
                                    />
                                    Active
                                </label>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={closeEdit}>Cancel</button>
                                <button type="submit" className="save-btn" disabled={saving || uploadingIndex !== null}>
                                    {saving ? "Saving..." : editingId ? "Update event" : "Create event"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

           

            {confirm && (
                <div className="modal">
                    <div className="modal-content banner-confirm">
                        <h3>{ACTION_COPY[confirm.action].title}</h3>
                        <p><strong>{confirm.event.title || confirm.event.id}</strong></p>
                        <p>{ACTION_COPY[confirm.action].body}</p>
                        <div className="form-buttons">
                            <button
                                type="button"
                                className="otp-btn verify-btn"
                                onClick={runConfirm}
                                disabled={Boolean(pendingAction)}
                            >
                                {pendingAction ? "Please wait..." : ACTION_COPY[confirm.action].confirm}
                            </button>
                            <button type="button" onClick={() => setConfirm(null)} disabled={Boolean(pendingAction)}>
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {preview && (
                <div className="prakriti-modal-overlay" onClick={() => setPreview(null)}>
                    <div className="prakriti-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="prakriti-modal-header">
                            <h2>Media preview</h2>
                            <button type="button" className="close-btn" onClick={() => setPreview(null)}>✕</button>
                        </div>
                        <div className="prakriti-form" style={{ textAlign: "center" }}>
                            {preview.type === "video" ? (
                                <video src={preview.url} controls style={{ width: "100%", maxHeight: "480px" }} />
                            ) : (
                                <img
                                    src={preview.url}
                                    alt=""
                                    style={{ width: "100%", maxHeight: "480px", objectFit: "contain", borderRadius: "10px" }}
                                />
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="cancel-btn" onClick={() => setPreview(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default EventBanner;
