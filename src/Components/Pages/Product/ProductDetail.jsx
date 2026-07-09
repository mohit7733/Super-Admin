// ProductDetail.js - Updated with Product Details Section First
import React, { useState, useEffect } from 'react';
import './ProductDetail.css';
import { toast } from 'react-toastify';
import { 
  BsThreeDotsVertical, 
  BsGrid, 
  BsList, 
  BsSearch,
  BsFilter,
  BsDownload,
  BsPrinter,
  BsChevronDown,
  BsChevronUp,
  BsX,
  BsCheck2,
  BsChevronLeft,
  BsChevronRight
} from "react-icons/bs";
import { 
  FaEye, 
  FaEdit, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaBan, 
  FaUndo, 
  FaStar, 
  FaStarHalfAlt, 
  FaRegStar,
  FaShoppingCart,
  FaUserCircle,
  FaStore,
  FaBoxOpen,
  FaClipboardList,
  FaChartBar,
  FaArrowLeft,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaClock,
  FaTruck,
  FaCheckDouble,
  FaTimes,
  FaInfoCircle,
  FaBox,
  FaCube,
  FaList,
  FaThLarge,
  FaFilter
} from "react-icons/fa";
import { 
  FiPackage, 
  FiBox, 
  FiCalendar, 
  FiUser, 
  FiTag, 
  FiBuilding, 
  FiArrowLeft, 
  FiClock, 
  FiTrendingUp, 
  FiTrendingDown, 
  FiDollarSign, 
  FiShoppingBag, 
  FiMail, 
  FiPhone,
  FiMapPin,
  FiGlobe,
  FiAward,
  FiShield,
  FiCheck,
  FiX
} from "react-icons/fi";
import BASE_URL from "../../../Base";
import { useParams, useNavigate } from 'react-router-dom';

function ProductDetail() {
  const navigate = useNavigate();
  const { productId } = useParams();
  
  // State variables
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productData, setProductData] = useState(null);
  const [variants, setVariants] = useState([]);
  const [filteredVariants, setFilteredVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedVariantForAction, setSelectedVariantForAction] = useState(null);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');
  const [activeTab, setActiveTab] = useState('variants');
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('title');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    productInfo: true,
    pricing: true,
    shipping: true,
    variants: true
  });
   const [openMenuId, setOpenMenuId] = useState(null);

  // Mock data
  const mockOrders = [
    { id: 'ORD-001', customer: 'John Doe', email: 'john@email.com', date: '2024-06-15', amount: 299.00, status: 'Delivered', variant: '500ml', qty: 2, paymentMethod: 'Card' },
    { id: 'ORD-002', customer: 'Jane Smith', email: 'jane@email.com', date: '2024-06-14', amount: 598.00, status: 'Shipped', variant: '1L', qty: 1, paymentMethod: 'UPI' },
    { id: 'ORD-003', customer: 'Mike Johnson', email: 'mike@email.com', date: '2024-06-13', amount: 449.00, status: 'Processing', variant: '250ml', qty: 3, paymentMethod: 'COD' },
    { id: 'ORD-004', customer: 'Sarah Wilson', email: 'sarah@email.com', date: '2024-06-12', amount: 299.00, status: 'Delivered', variant: '500ml', qty: 1, paymentMethod: 'Card' },
    { id: 'ORD-005', customer: 'David Brown', email: 'david@email.com', date: '2024-06-11', amount: 897.00, status: 'Cancelled', variant: '100ml', qty: 4, paymentMethod: 'UPI' },
  ];

  const mockReviews = [
    { id: 1, customer: 'Alice Cooper', rating: 5, comment: 'Excellent product! Works great for my skin. Highly recommend to everyone.', date: '2024-06-14', variant: '500ml', helpful: 12 },
    { id: 2, customer: 'Bob Martin', rating: 4, comment: 'Good quality, but price could be better. Overall satisfied with the purchase.', date: '2024-06-12', variant: '250ml', helpful: 8 },
    { id: 3, customer: 'Carol White', rating: 5, comment: 'Amazing results! My skin feels so fresh and clean. Will buy again.', date: '2024-06-10', variant: '500ml', helpful: 15 },
    { id: 4, customer: 'Dan Thompson', rating: 3, comment: 'Average product, nothing special. Works fine but not worth the hype.', date: '2024-06-08', variant: '1L', helpful: 3 },
    { id: 5, customer: 'Emma Davis', rating: 5, comment: 'Best face wash I\'ve ever used! My skin has improved dramatically.', date: '2024-06-05', variant: '500ml', helpful: 20 },
  ];

  // Fetch data
  useEffect(() => {
    fetchProductDetails();
    fetchOrders();
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    applyFilters();
  }, [variants, searchTerm, statusFilter, sortField, sortDirection]);

  useEffect(() => {
    if (selectedVariant?.media?.length > 0) {
      const coverImage = selectedVariant.media.find(m => m.is_cover);
      setSelectedImage(coverImage?.media_url || selectedVariant.media[0]?.media_url);
      setCurrentImageIndex(selectedVariant.media.findIndex(m => 
        m.media_url === (coverImage?.media_url || selectedVariant.media[0]?.media_url)
      ));
    }
  }, [selectedVariant]);

  const fetchProductDetails = async () => {
    const token = sessionStorage.getItem("superadmin_token");
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/vendors/admin/product/?id=${productId}`, {
        method: 'GET',
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) throw new Error('Failed to fetch product details');
      const result = await response.json();

      if (result.success) {
        setProductData(result.data.product);
        setVariants(result.data.variants);
        setFilteredVariants(result.data.variants);
        if (result.data.variants.length > 0) {
          setSelectedVariant(result.data.variants[0]);
        }
      } else {
        setError(result.message || 'Failed to load product');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => setOrders(mockOrders);
  const fetchReviews = async () => setReviews(mockReviews);

  // Filter and Sort
  const applyFilters = () => {
    let filtered = [...variants];
    if (searchTerm) {
      filtered = filtered.filter(v => 
        v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.variant_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.size?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status?.toLowerCase() === statusFilter);
    }
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (sortField === 'mrp' || sortField === 'selling_price' || sortField === 'stock') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (sortDirection === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
    setFilteredVariants(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

 
  const handleVariantAction = async (
  variantId,
  action,
  reasonText = ""
) => {
  try {
    const token = sessionStorage.getItem("superadmin_token");

    if (
      (action === "reject" || action === "rejected") &&
      !reasonText.trim()
    ) {
      toast.error("Please enter rejection reason");
      return;
    }

    const payload = {
      variant_id: variantId,
      status:
        action === "approve"
          ? "approved"
          : action === "reject"
          ? "rejected"
          : "suspended",
    };

    if (action === "reject") {
      payload.reason = reasonText;
    }

    const response = await fetch(
      `${BASE_URL}/vendors/admin/product/?id=${productId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Failed to update status"
      );
    }

    const newStatus = payload.status;

    
    setVariants((prev) =>
      prev.map((item) =>
        item.id === variantId
          ? {
              ...item,
              status: newStatus,
              reason:
                action === "reject"
                  ? reasonText
                  : item.reason,
            }
          : item
      )
    );

   
    if (selectedVariant?.id === variantId) {
      setSelectedVariant((prev) => ({
        ...prev,
        status: newStatus,
        reason:
          action === "reject"
            ? reasonText
            : prev.reason,
      }));
    }

    toast.success(
      `Variant ${
        action === "approve"
          ? "approved"
          : action === "reject"
          ? "rejected"
          : "suspended"
      } successfully`
    );

    setShowActionModal(false);
    setSelectedVariantForAction(null);
    setReason("");
    setOpenMenuId(null);
  } catch (error) {
    toast.error(error.message);
  }
};

  const handleBulkAction = async (action) => {
    if (selectedVariants.length === 0) {
      alert('Please select at least one variant');
      return;
    }

    if (window.confirm(`Are you sure you want to ${action} ${selectedVariants.length} variant(s)?`)) {
      const reasonText = window.prompt(`Please provide a reason for ${action}ing these variants:`);
      if (action === 'reject' || action === 'suspend') {
        if (!reasonText || reasonText.trim() === '') {
          alert('Reason is required');
          return;
        }
      }

      for (const variantId of selectedVariants) {
        await handleVariantAction(variantId, action, reasonText || '');
      }
    }
  };


  const nextImage = () => {
    if (selectedVariant?.media?.length > 0) {
      const newIndex = (currentImageIndex + 1) % selectedVariant.media.length;
      setCurrentImageIndex(newIndex);
      setSelectedImage(selectedVariant.media[newIndex].media_url);
    }
  };

  const prevImage = () => {
    if (selectedVariant?.media?.length > 0) {
      const newIndex = (currentImageIndex - 1 + selectedVariant.media.length) % selectedVariant.media.length;
      setCurrentImageIndex(newIndex);
      setSelectedImage(selectedVariant.media[newIndex].media_url);
    }
  };

  const selectThumbnail = (index) => {
    setCurrentImageIndex(index);
    setSelectedImage(selectedVariant.media[index].media_url);
  };


  const getStatusBadge = (status) => {
    const statusMap = {
      'approved': { class: 'badge-approved', label: 'Approved', icon: <FaCheckCircle /> },
      'pending': { class: 'badge-pending', label: 'Pending', icon: <FiClock /> },
      'rejected': { class: 'badge-rejected', label: 'Rejected', icon: <FaTimesCircle /> },
      'suspended': { class: 'badge-suspended', label: 'Suspended', icon: <FaBan /> }
    };
    const info = statusMap[status?.toLowerCase()] || statusMap['pending'];
    return (
      <span className={`status-badge ${info.class}`}>
        {info.icon} {info.label}
      </span>
    );
  };

  const getOrderStatusBadge = (status) => {
    const map = {
      'delivered': { class: 'order-delivered', label: 'Delivered', icon: <FaCheckDouble /> },
      'shipped': { class: 'order-shipped', label: 'Shipped', icon: <FaTruck /> },
      'processing': { class: 'order-processing', label: 'Processing', icon: <FaClock /> },
      'cancelled': { class: 'order-cancelled', label: 'Cancelled', icon: <FaTimes /> }
    };
    const info = map[status?.toLowerCase()] || map['processing'];
    return (
      <span className={`order-status ${info.class}`}>
        {info.icon} {info.label}
      </span>
    );
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<FaStar key={i} className="star-filled" />);
      else if (i === full && half) stars.push(<FaStarHalfAlt key={i} className="star-half" />);
      else stars.push(<FaRegStar key={i} className="star-empty" />);
    }
    return stars;
  };

  const calculateStats = () => {
    const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    const approved = variants.filter(v => v.status?.toLowerCase() === 'approved').length;
    const pending = variants.filter(v => v.status?.toLowerCase() === 'pending').length;
    const rejected = variants.filter(v => v.status?.toLowerCase() === 'rejected').length;
    const suspended = variants.filter(v => v.status?.toLowerCase() === 'suspended').length;
    return { totalStock, approved, pending, rejected, suspended, total: variants.length };
  };

  const stats = calculateStats();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const exportData = (type) => {
    let data = [];
    let filename = '';
    
    if (type === 'variants') {
      data = variants.map(v => ({
        'Variant Name': v.title,
        'SKU': v.variant_code,
        'Size': `${v.size} ${v.weightage}`,
        'MRP': v.mrp,
        'Selling Price': v.selling_price,
        'Stock': v.stock,
        'Status': v.status
      }));
      filename = 'variants_data.csv';
    } else if (type === 'orders') {
      data = orders.map(o => ({
        'Order ID': o.id,
        'Customer': o.customer,
        'Variant': o.variant,
        'Qty': o.qty,
        'Amount': o.amount,
        'Date': o.date,
        'Status': o.status
      }));
      filename = 'orders_data.csv';
    } else if (type === 'reviews') {
      data = reviews.map(r => ({
        'Customer': r.customer,
        'Rating': r.rating,
        'Comment': r.comment,
        'Date': r.date,
        'Variant': r.variant
      }));
      filename = 'reviews_data.csv';
    }

    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const csv = [
        headers.join(','),
        ...data.map(row => headers.map(h => JSON.stringify(row[h] || '')).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading product details...</p>
        <div className="loading-progress-bar">
          <div className="progress-fill"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Product</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btns-primary">
          Retry
        </button>
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="error-container">
        <p>No product found</p>
      </div>
    );
  }

  return (
    <>
    <div className="product-detail-container">
     
      <nav className="top-nav">
        <div className="nav-left">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft />
          </button>
          {/* <div className="breadcrumb">
            <span>Products</span>
            <span className="separator">/</span>
            <span className="active">{productData.name}</span>
          </div> */}
        </div>
      
      </nav>

   
      <div className="product-header">
        <div className="product-header-left">
          <h1 className="product-title">{productData.name}</h1>
          <div className="product-meta-tags">
            <span className="meta-tag">
              <FiTag /> ID: {productData.id?.substring(0, 8)}...
            </span>
            <span className="meta-tag">
              <FiCalendar /> {new Date(productData.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
            <span className="meta-tag">
              
               {productData.vendor_business_name}
            </span>
            <span className="meta-tag">
              <FiPackage /> {variants.length} Variants
            </span>
            {/* <span className="meta-tag">
              {getStatusBadge('approved')}
            </span> */}
          </div>
        </div>
        <div className="product-header-right">
          <button className="btns-outline"  onClick={() => navigate(-1)}>
            <FaStore /> View Vendor
          </button>
          {/* <button className="btn-primary">
            <FaEdit /> Edit Product
          </button> */}
        </div>
      </div>

    
 
      
      <div className="product-details-section">
        <div className="details-header">
          <h3 className="details-title">
            <FiPackage className="details-title-icon" />
            Product Details
          </h3>
          {/* <span className="product-id-badge">{productData.id}</span> */}
        </div>
        
        <div className="product-details-grid">
          {/* Left Column - Product Information */}
          <div className="details-column">
            <div className="details-group">
              <h4 className="details-group-title">
                <FaInfoCircle className="group-icon" />
                Basic Information
              </h4>
              <div className="details-row">
                <span className="details-label">Product Name</span>
                <span className="details-value">{productData.name}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Brand</span>
                <span className="details-value brand-name">{productData.brand_name}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Manufacturer</span>
                <span className="details-value">{productData.manufacturer || 'N/A'}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Origin</span>
                <span className="details-value">{productData.origin || 'N/A'}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Treatment Type</span>
                <span className="details-value">{productData.treatment_type || 'N/A'}</span>
              </div>
            </div>

            <div className="details-group">
              <h4 className="details-group-title">
                <FiBox className="group-icon" />
                Category & Classification
              </h4>
              <div className="details-row">
                <span className="details-label">Category</span>
                <span className="details-value">{productData.product_category_name || 'N/A'}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Subcategory</span>
                <span className="details-value">{productData.subcategory || 'N/A'}</span>
              </div>
             
            
            </div>
          </div>

       
          <div className="details-column">
            <div className="details-group">
              <h4 className="details-group-title">
                <FaStore className="group-icon" />
                Vendor Information
              </h4>
              <div className="details-row">
                <span className="details-label">Vendor</span>
                <span className="details-value vendor-name">{productData.vendor_business_name}</span>
              </div>
              <div className="details-row">
                <span className="details-label">Phone</span>
                <span className="details-value">{productData.vendor_phone_number || 'N/A'}</span>
              </div>
              {/* <div className="details-row">
                <span className="details-label">Vendor ID</span>
                <span className="details-value id-text">{productData.vendor_id?.substring(0, 12)}...</span>
              </div> */}
              <div className="details-row">
                <span className="details-label">Added On</span>
                <span className="details-value">{new Date(productData.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            </div>

            <div className="details-group">
              <h4 className="details-group-title">
                <FiShield className="group-icon" />
                Status & Features
              </h4>
              {/* <div className="details-row">
                <span className="details-label">Status</span>
                <span className="details-value">{productData.status}</span>
              </div> */}
              <div className="details-row">
                <span className="details-label">Featured</span>
                <span className="details-value">
                  {productData.is_featured ? 
                    <span className="featured-tag"><FaCheckCircle /> Featured</span> : 
                    <span className="not-featured-tag"><FaTimesCircle /> Not Featured</span>
                  }
                </span>
              </div>
              <div className="details-row">
                <span className="details-label">Nutrition</span>
                <span className="details-value">
                  {productData.is_nutrition ? 
                    <span className="yes-tag"><FiCheck /> Yes</span> : 
                    <span className="no-tag"><FiX /> No</span>
                  }
                </span>
              </div>
              <div className="details-row">
                <span className="details-label">Last Updated</span>
                <span className="details-value">{new Date(productData.updated_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
            </div>
          </div>
        </div>

      
        <div className="details-group full-width">
          <h4 className="details-group-title">
            {/* <FiClipboardList className="group-icon" /> */}
            Description
          </h4>
          <p className="product-description">{productData.full_description || 'No description available'}</p>
          {productData.short_description && (
            <div className="short-description">
              <strong>Short Description:</strong>
              <p>{productData.short_description}</p>
            </div>
          )}
          {productData.how_to_use && (
            <div className="how-to-use">
              <strong>How to Use:</strong>
              <p>{productData.how_to_use}</p>
            </div>
          )}
        </div>
      </div>

      <div className="tabs-container">
        {/* <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'variants' ? 'active' : ''}`}
            onClick={() => setActiveTab('variants')}
          >
            <FaCube /> Variants <span className="tab-count">{variants.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FiShoppingBag /> Orders <span className="tab-count">{orders.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            <FaStar /> Reviews <span className="tab-count">{reviews.length}</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <FaChartBar /> Analytics
          </button>
        </div> */}

    
        {activeTab === 'variants' && (
          <div className="tab-content">
           
            <div className="variants-toolbar">
              <div className="search-box">
                <BsSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search variants by name, SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm('')}>
                    <BsX />
                  </button>
                )}
              </div>
              <div className="toolbar-actions">
                <div className="filter-wrapper">
                  <button className="filter-btn" onClick={() => setShowFilters(!showFilters)}>
                    <FaFilter /> Filter {statusFilter !== 'all' && <span className="filter-active-dot"></span>}
                  </button>
                  {showFilters && (
                    <div className="filter-dropdown">
                      <div className="filter-option" onClick={() => setStatusFilter('all')}>
                        <span>All</span>
                        {statusFilter === 'all' && <BsCheck2 className="filter-check" />}
                      </div>
                      <div className="filter-option" onClick={() => setStatusFilter('approved')}>
                        <span>Approved</span>
                        {statusFilter === 'approved' && <BsCheck2 className="filter-check" />}
                      </div>
                      <div className="filter-option" onClick={() => setStatusFilter('pending')}>
                        <span>Pending</span>
                        {statusFilter === 'pending' && <BsCheck2 className="filter-check" />}
                      </div>
                      <div className="filter-option" onClick={() => setStatusFilter('rejected')}>
                        <span>Rejected</span>
                        {statusFilter === 'rejected' && <BsCheck2 className="filter-check" />}
                      </div>
                      <div className="filter-option" onClick={() => setStatusFilter('suspended')}>
                        <span>Suspended</span>
                        {statusFilter === 'suspended' && <BsCheck2 className="filter-check" />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

         
            {selectedVariants.length > 0 && (
              <div className="bulk-actions-bar">
                <span className="bulk-count">{selectedVariants.length} variant(s) selected</span>
                <div className="bulk-actions">
                  <button className="bulk-btn approve" onClick={() => handleBulkAction('approve')}>
                    <FaCheckCircle /> Approve All
                  </button>
                  <button className="bulk-btn reject" onClick={() => handleBulkAction('reject')}>
                    <FaTimesCircle /> Reject All
                  </button>
                  <button className="bulk-btn suspend" onClick={() => handleBulkAction('suspend')}>
                    <FaBan /> Suspend All
                  </button>
                  <button className="bulk-btn clear" onClick={() => setSelectedVariants([])}>
                    <BsX /> Clear
                  </button>
                </div>
              </div>
            )}

          
            {selectedVariant && (
              <div className="selected-variant-card animate-slide-down">
                <div className="variant-selector-header">
                  <div className="variant-selector-title">
                    <FaBoxOpen className="title-icon" />
                    <h4>Selected Variant</h4>
                    <span className="variant-name-badge">{selectedVariant.title}</span>
                    <span className="variant-status-inline">{getStatusBadge(selectedVariant.status)}</span>
                  </div>
                  <button className="btn-outline-small" onClick={() => setSelectedVariant(null)}>
                    <BsX /> Clear
                  </button>
                </div>

                <div className="selected-variant-layout">
                  {/* Image Gallery */}
                  <div className="variant-gallery">
                    <div className="main-image-container">
                      {selectedVariant.media?.length > 0 ? (
                        <>
                          <img 
                            src={selectedImage || 'https://via.placeholder.com/400'}
                            alt={selectedVariant.title}
                            className="main-gallery-image"
                            onError={(e) => e.target.src = 'https://via.placeholder.com/400'}
                          />
                          {selectedVariant.media.length > 1 && (
                            <>
                              <button className="gallery-nav prev" onClick={prevImage}>
                                <BsChevronLeft />
                              </button>
                              <button className="gallery-nav next" onClick={nextImage}>
                                <BsChevronRight />
                              </button>
                              <div className="image-counter">
                                {currentImageIndex + 1} / {selectedVariant.media.length}
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <div className="no-image-placeholder">
                          <FiPackage className="no-image-icon" />
                          <span>No Image Available</span>
                        </div>
                      )}
                    </div>
                    
                    
                    {selectedVariant.media?.length > 0 && (
                      <div className="thumbnail-strip">
                        {selectedVariant.media.map((media, idx) => (
                          <div 
                            key={idx}
                            className={`thumbnail-item ${currentImageIndex === idx ? 'active' : ''}`}
                            onClick={() => selectThumbnail(idx)}
                          >
                            <img 
                              src={media.media_url}
                              alt={`Thumbnail ${idx + 1}`}
                              onError={(e) => e.target.src = 'https://via.placeholder.com/80'}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                 
                  <div className="variant-gallery-details">
                    <div className="variant-detail-section">
                      <h5 className="detail-section-title">Variant Information</h5>
                      <div className="detail-row">
                        <span className="detail-label">Variant Name</span>
                        <span className="detail-value highlight">{selectedVariant.title}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">SKU</span>
                        <span className="detail-value sku-code">{selectedVariant.variant_code}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Size</span>
                        <span className="detail-value">{selectedVariant.size} {selectedVariant.weightage}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">HSN Code</span>
                        <span className="detail-value">{selectedVariant.hsn_code}</span>
                      </div>
                    </div>

                    <div className="variant-detail-section">
                      <h5 className="detail-section-title">Pricing</h5>
                      <div className="detail-row">
                        <span className="detail-label">MRP</span>
                        <span className="detail-value mrp">₹{parseFloat(selectedVariant.mrp).toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Selling Price</span>
                        <span className="detail-value selling">₹{parseFloat(selectedVariant.selling_price).toFixed(2)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Discount</span>
                        <span className="detail-value discount">
                          {((1 - parseFloat(selectedVariant.selling_price) / parseFloat(selectedVariant.mrp)) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Taxes</span>
                        <span className="detail-value">
                          {selectedVariant.taxes?.map((tax, idx) => (
                            <span key={idx} className="tax-tag">{tax.name}: {tax.rate}%</span>
                          ))}
                        </span>
                      </div>
                    </div>

                    <div className="variant-detail-section">
                      <h5 className="detail-section-title">Stock & Status</h5>
                      <div className="detail-row">
                        <span className="detail-label">Stock</span>
                        <span className={`detail-value ${selectedVariant.stock < selectedVariant.low_stock_threshold ? 'low-stock' : ''}`}>
                          {selectedVariant.stock} units
                          {selectedVariant.stock < selectedVariant.low_stock_threshold && 
                            <span className="low-stock-warning"> ⚠️ Low stock</span>
                          }
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Low Stock Threshold</span>
                        <span className="detail-value">{selectedVariant.low_stock_threshold} units</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Returnable</span>
                        <span className="detail-value">
  {selectedVariant.is_returnable ? (
    <span >
         <FaCheckCircle color="#0D614E" size={18} />  Yes
    </span>
  ) : (
    <span style={{ color: "#0D614E" ,textAlign:"center",fontSize:"10px",marginBottom:"4px"}}>
      <FaTimesCircle style={{ marginRight: "5px" }} />
      No
    </span>
  )}
</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Pay on Delivery</span>
<span className="detail-value">
  {selectedVariant.pay_on_delivery ? (
     <span >
         <FaCheckCircle color="#0D614E" size={18} />  Yes
    </span>
  ) : (
    <FaTimesCircle color="#dc3545" size={18} />
  )}
</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Free Shipping</span>
                        <span className="detail-value">{selectedVariant.is_free_shipping ? '✅ Yes' : '❌ No'}</span>
                      </div>
                      {selectedVariant.reason && (
                        <div className="detail-row">
                          <span className="detail-label">Reason</span>
                          <span className="detail-value reason-text">{selectedVariant.reason}</span>
                        </div>
                      )}
                    </div>

                    <div className="variant-detail-section actions-section">
                      <h5 className="detail-section-title">Actions</h5>
                      <div className="action-buttons-group horizontal">
                        <button 
                          className="actions-btn approves-btn"
                          onClick={() => {
                            setSelectedVariantForAction(selectedVariant);
                            setShowActionModal(true);
                            setActionType('approve');
                          }}
                        >
                          <FaCheckCircle /> Approve
                        </button>
                        <button 
                          className="actions-btn reject-btn"
                          onClick={() => {
                            setSelectedVariantForAction(selectedVariant);
                            setShowActionModal(true);
                            setActionType('reject');
                          }}
                        >
                          <FaTimesCircle /> Reject
                        </button>
                        <button 
                          className="actions-btn suspends-btn"
                          onClick={() => {
                            setSelectedVariantForAction(selectedVariant);
                            setShowActionModal(true);
                            setActionType('suspend');
                          }}
                        >
                          <FaBan /> Suspend
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== VARIANTS TABLE ===== */}
            <div className="variants-table-wrapper">
              <div className="table-header">
                <h4>All Variants</h4>
                <span className="variant-count">{filteredVariants.length} variants</span>
              </div>
             <div className="table-wrapper">
  <table className="data-table">
    <thead>
      <tr>
        <th>Variant</th>
        <th>Size</th>
        <th>MRP (₹)</th>
        <th>Price (₹)</th>
        <th>Stock</th>
        <th>Status</th>
     
      </tr>
    </thead>

    <tbody>
      {filteredVariants.length > 0 ? (
        filteredVariants.map((variant) => (
          <tr
            key={variant.id}
            className={
              selectedVariant?.id === variant.id
                ? "selected-row"
                : ""
            }
            onClick={() => {
              setSelectedVariant(variant);
              setSelectedImage(null);
            }}
          >
            {/* Variant Info */}
            <td>
              <div className="variant-info">
                <img
                  src={
                    variant.media?.find((m) => m.is_cover)?.media_url ||
                    variant.media?.[0]?.media_url ||
                    "https://via.placeholder.com/50"
                  }
                  alt={variant.title}
                  className="variant-image-small"
                  onError={(e) =>
                    (e.target.src =
                      "https://via.placeholder.com/50")
                  }
                />

                <div className="variant-details">
                  <span className="variant-title">
                    {variant.title}
                  </span>

                  <span className="variant-sku">
                    SKU : {variant.variant_code}
                  </span>
                </div>
              </div>
            </td>

            {/* Size */}
            <td>
              {variant.size} {variant.weightage}
            </td>

            {/* MRP */}
            <td>
              ₹{parseFloat(variant.mrp).toFixed(2)}
            </td>

            {/* Selling Price */}
            <td>
              ₹{parseFloat(
                variant.selling_price
              ).toFixed(2)}
            </td>

            {/* Stock */}
            <td
              className={`stock-cell ${
                variant.stock <
                variant.low_stock_threshold
                  ? "low-stock"
                  : ""
              }`}
            >
              {variant.stock}

              {variant.stock <
                variant.low_stock_threshold && (
                <span className="stock-warning-icon">
                  ⚠️
                </span>
              )}
            </td>

            
            <td>{getStatusBadge(variant.status)}</td>

            
            {/* <td
              style={{ position: "relative" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="action-menu-toggle"
                onClick={() =>
                  setOpenMenuId(
                    openMenuId === variant.id
                      ? null
                      : variant.id
                  )
                }
              >
                <BsThreeDotsVertical />
              </button>

              {openMenuId === variant.id && (
                <div className="actions-buttons-modal">
                  <button
                    className="actions-btn1"
                    onClick={() => {
                      setSelectedVariantForAction(
                        variant
                      );
                      setShowActionModal(true);
                      setActionType("view");
                    }}
                  >
                    <span className="icon">
                      <FaEye />
                    </span>
                    <span>View Details</span>
                  </button>

<button
                                      className="actions-btn1"
                    onClick={() => {
                      setSelectedVariantForAction(
                        variant
                      );
                      setActionType("edit");
                    }}
                  >
                    <span className="icon">
                      <FaEdit />
                    </span>
                    <span>Edit Variant</span>
                  </button>
                </div>
              )}
            </td> */}
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan="7"
            style={{
              textAlign: "center",
              padding: "40px",
            }}
          >
            No Variants Found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
              <div className="table-footer">
                <span>Showing {filteredVariants.length} of {variants.length} variants</span>
                <div className="table-footer-actions">
                  <button className="footer-btn" onClick={() => exportData('variants')}>
                    <BsDownload /> Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== ORDERS TAB =====
        {activeTab === 'orders' && (
          <div className="tab-content">
            <div className="orders-section">
              <div className="section-header">
                <h4><FiShoppingBag className="section-icon" /> Order History</h4>
                <div className="orders-summary">
                  <span className="summary-item">
                    <span className="summary-label">Total Orders</span>
                    <strong>{orders.length}</strong>
                  </span>
                  <span className="summary-item">
                    <span className="summary-label">Revenue</span>
                    <strong className="revenue">{formatCurrency(orders.reduce((sum, o) => sum + o.amount, 0))}</strong>
                  </span>
                  <button className="btn-outline-small" onClick={() => exportData('orders')}>
                    <BsDownload /> Export
                  </button>
                </div>
              </div>
              <div className="table-responsive">
                <table className="data-table orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Variant</th>
                      <th>Qty</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="order-row">
                        <td><span className="order-id">{order.id}</span></td>
                        <td>
                          <div className="customer-info">
                            <span className="customer-name">{order.customer}</span>
                            <span className="customer-email">{order.email}</span>
                          </div>
                        </td>
                        <td>{order.variant}</td>
                        <td className="qty-cell">{order.qty}x</td>
                        <td className="amount-cell">{formatCurrency(order.amount)}</td>
                        <td>{new Date(order.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}</td>
                        <td><span className="payment-badge">{order.paymentMethod}</span></td>
                        <td>{getOrderStatusBadge(order.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )} */}

        {/* ===== REVIEWS TAB ===== */}
        {/* {activeTab === 'reviews' && (
          <div className="tab-content">
            <div className="reviews-section">
              <div className="section-header">
                <h4><FaStar className="section-icon" /> Customer Reviews</h4>
                <div className="reviews-summary">
                  <span className="summary-item">
                    <span className="summary-label">Average Rating</span>
                    <div className="rating-display">
                      <strong>{reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0}</strong>
                      <div className="stars-display">
                        {renderStars(reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0)}
                      </div>
                    </div>
                  </span>
                  <span className="summary-item">
                    <span className="summary-label">Total Reviews</span>
                    <strong>{reviews.length}</strong>
                  </span>
                  <button className="btn-outline-small" onClick={() => exportData('reviews')}>
                    <BsDownload /> Export
                  </button>
                </div>
              </div>
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          {review.customer.charAt(0)}
                        </div>
                        <div>
                          <span className="reviewer-name">{review.customer}</span>
                          <span className="review-variant">{review.variant}</span>
                        </div>
                      </div>
                      <div className="review-actions">
                        <div className="review-rating">
                          {renderStars(review.rating)}
                        </div>
                        <span className="review-date">{new Date(review.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                    </div>
                    <p className="review-comment">"{review.comment}"</p>
                    <div className="review-footer">
                      <span className="helpful-count">
                        <FaCheckCircle className="helpful-icon" /> {review.helpful} people found this helpful
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )} */}

        {/* ===== ANALYTICS TAB ===== */}
        {/* {activeTab === 'analytics' && (
          <div className="tab-content">
            <div className="analytics-section">
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="analytics-header">
                    <h4>Revenue Overview</h4>
                    <span className="analytics-period">Last 7 days</span>
                  </div>
                  <div className="analytics-chart-placeholder">
                    <div className="chart-bars">
                      <div className="chart-bar" style={{ height: '60%' }}><span>Mon</span></div>
                      <div className="chart-bar" style={{ height: '80%' }}><span>Tue</span></div>
                      <div className="chart-bar" style={{ height: '45%' }}><span>Wed</span></div>
                      <div className="chart-bar" style={{ height: '90%' }}><span>Thu</span></div>
                      <div className="chart-bar" style={{ height: '70%' }}><span>Fri</span></div>
                      <div className="chart-bar" style={{ height: '55%' }}><span>Sat</span></div>
                      <div className="chart-bar" style={{ height: '75%' }}><span>Sun</span></div>
                    </div>
                  </div>
                  <div className="analytics-stats">
                    <div className="analytics-stat">
                      <span className="stat-label">Revenue</span>
                      <span className="stat-value">{formatCurrency(12500)}</span>
                    </div>
                    <div className="analytics-stat">
                      <span className="stat-label">Orders</span>
                      <span className="stat-value">42</span>
                    </div>
                    <div className="analytics-stat">
                      <span className="stat-label">Conversion</span>
                      <span className="stat-value">3.2%</span>
                    </div>
                  </div>
                </div>
                <div className="analytics-card">
                  <div className="analytics-header">
                    <h4>Top Selling Variants</h4>
                    <span className="analytics-period">This month</span>
                  </div>
                  <div className="top-variants-list">
                    {variants.slice(0, 5).map((v, idx) => (
                      <div key={v.id} className="top-variant-item">
                        <span className="rank">#{idx + 1}</span>
                        <span className="variant-name">{v.title}</span>
                        <span className="variant-sales">{v.stock || 0} units</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )} */}
      </div>

      {/* ===== ACTION MODAL ===== */}
      {showActionModal && selectedVariantForAction && (
        <div className="modal-overlay" onClick={() => setShowActionModal(false)}>
          <div className="modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modalp-header">
              <h3>
                {actionType === 'approve' ? 'Approve' :
                 actionType === 'reject' ? 'Reject' : 
                 actionType === 'suspend' ? 'Suspend' : 'Variant Details'}
              </h3>
              <button className="modal-close" onClick={() => setShowActionModal(false)}>
                <BsX />
              </button>
            </div>
            <div className="modal-body">
              {actionType === 'view' ? (
                <div className="modal-variant-details">
                  <div className="modal-image-section">
                    <img 
                      src={selectedVariantForAction.media?.find(m => m.is_cover)?.media_url || selectedVariantForAction.media?.[0]?.media_url || 'https://via.placeholder.com/200'}
                      alt={selectedVariantForAction.title}
                      className="modal-variant-image"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/200'}
                    />
                  </div>
                  <div className="modal-variant-info">
                    <div className="modal-info-row">
                      <span className="modal-info-label">Title</span>
                      <span className="modal-info-value">{selectedVariantForAction.title}</span>
                    </div>
                    <div className="modal-info-row">
                      <span className="modal-info-label">SKU</span>
                      <span className="modal-info-value sku-code">{selectedVariantForAction.variant_code}</span>
                    </div>
                    <div className="modal-info-row">
                      <span className="modal-info-label">Size</span>
                      <span className="modal-info-value">{selectedVariantForAction.size} {selectedVariantForAction.weightage}</span>
                    </div>
                    <div className="modal-info-row">
                      <span className="modal-info-label">MRP</span>
                      <span className="modal-info-value mrp">₹{parseFloat(selectedVariantForAction.mrp).toFixed(2)}</span>
                    </div>
                    <div className="modal-info-row">
                      <span className="modal-info-label">Selling Price</span>
                      <span className="modal-info-value selling">₹{parseFloat(selectedVariantForAction.selling_price).toFixed(2)}</span>
                    </div>
                    <div className="modal-info-row">
                      <span className="modal-info-label">Stock</span>
                      <span className="modal-info-value">{selectedVariantForAction.stock} units</span>
                    </div>
                    <div className="modal-info-row">
                      <span className="modal-info-label">Status</span>
                      <span className="modal-info-value">{getStatusBadge(selectedVariantForAction.status)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="modal-action-content">
                  <div className="modal-variant-summary">
                    <img 
                      src={selectedVariantForAction.media?.find(m => m.is_cover)?.media_url || selectedVariantForAction.media?.[0]?.media_url || 'https://via.placeholder.com/60'}
                      alt={selectedVariantForAction.title}
                      className="modal-summary-image"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/60'}
                    />
                    <div>
                      <div className="summary-title">{selectedVariantForAction.title}</div>
                      <div className="summary-sku">{selectedVariantForAction.variant_code}</div>
                    </div>
                    <div className="summary-status">{getStatusBadge(selectedVariantForAction.status)}</div>
                  </div>

                  <div className="action-confirmation">
                    <div className="confirmation-icon">
                      {actionType === 'approve' && <FaCheckCircle className="icon-approve" />}
                      {actionType === 'reject' && <FaTimesCircle className="icon-reject" />}
                      {actionType === 'suspend' && <FaBan className="icon-suspend" />}
                    </div>
                    <h4>
                      {actionType === 'approve' ? 'Approve this variant?' :
                       actionType === 'reject' ? 'Reject this variant?' : 
                       'Suspend this variant?'}
                    </h4>
                    <p>
                      {actionType === 'approve' ? 'This will make the variant available for purchase.' :
                       actionType === 'reject' ? 'This will reject the variant and hide it from the catalog.' : 
                       'This will temporarily suspend the variant.'}
                    </p>
                  </div>

                  {(actionType === 'reject' || actionType === 'suspend') && (
                    <div className="form-group">
                      <label htmlFor="reason">Reason for {actionType}ing:</label>
                      <textarea
                        id="reason"
                        className="reason-input"
                        rows="4"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={`Please provide a detailed reason for ${actionType}ing this variant...`}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btns-secondary" onClick={() => setShowActionModal(false)}>
                {actionType === 'view' ? 'Close' : 'Cancel'}
              </button>
              {actionType !== 'view' && (
                <button
                  className={`btn-${actionType}`}
                  onClick={() => handleVariantAction(
                    selectedVariantForAction.id,
                    actionType,
                    reason
                  )}
                  disabled={actionType !== 'approve' && !reason.trim()}
                >
                  {actionType === 'approve' ? 'Approve' :
                   actionType === 'reject' ? 'Reject' : 'Suspend'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    
    </div>
    </>
    
  );
}

export default ProductDetail;