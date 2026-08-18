import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUploadCloud,
  FiFileText,
  FiTrash2,
  FiDownload,
  FiRefreshCw,
  FiInfo,
  FiCheckCircle,
  FiChevronUp,
  FiChevronDown,
  FiImage,
  FiCopy,
  FiCheck,
  FiX,
} from "react-icons/fi";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./BulkAdd.css";
import BASE_URL from "../../../Base";

const BulkUploadProducts = () => {
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [guideOpen, setGuideOpen] = useState(true);

    const navigate = useNavigate();
  

  const [galleryImages, setGalleryImages] = useState([]);
  const [isGalleryUploading, setIsGalleryUploading] = useState(false);
  const [galleryDragging, setGalleryDragging] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);

  const MAX_FILE_SIZE = 15 * 1024 * 1024;

  const GALLERY_DIR = "product_gallery";


  const validateFile = (file) => {
    if (!file) return false;

    const allowedExtensions = [".xlsx", ".xls"];

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      toast.error("Please upload only .xlsx or .xls files.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 15 MB.");
      return false;
    }

    return true;
  };

  const handleFileSelect = (file) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    toast.success("Excel file selected successfully.");
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };



  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      handleFileSelect(file);
    }
  };

 

  const removeFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  
 

  const handleReset = () => {
    setSelectedFile(null);
    setGalleryImages([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }

    toast.info("Upload form has been reset.");
  };

 

  const downloadTemplate = () => {
    const link = document.createElement("a");

    link.href =
      "/templates/products_bulk_upload_template%20(1).xlsx";

    link.download = "products_bulk_upload_template (1).xlsx";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


const uploadGalleryImage = async (file) => {
  if (!file) return null;

  const token = sessionStorage.getItem("superadmin_token");

  if (!token) {
    toast.error("Session Expired, Please Login Again");
    navigate("/login");
    return null;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    toast.error(
      "Only JPG, JPEG, PNG and WEBP images are allowed."
    );
    return null;
  }

  if (file.size > MAX_FILE_SIZE) {
    toast.error("Image size must be less than 15 MB.");
    return null;
  }

  try {
    setIsGalleryUploading(true);

    const formData = new FormData();

    formData.append("image", file);
    formData.append("dir", GALLERY_DIR);

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

      setTimeout(() => {
        navigate("/login");
      }, 500);

      return null;
    }

    let data = {};

    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    console.log("Gallery upload response:", data);

    if (!response.ok) {
      throw new Error(
        data?.message ||
        data?.error?.message ||
        data?.error ||
        "Unable to upload gallery image."
      );
    }

   
    const generatedUrl =
      data?.data?.url 
    

    if (!generatedUrl) {
      console.error("Upload API response:", data);

      throw new Error(
        "Image uploaded but URL was not found in API response."
      );
    }

    const newImage = {
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      url: generatedUrl,
      size: file.size,
      type: file.type,
      is_cover: galleryImages.length === 0,
    };

    setGalleryImages((prev) => [
      ...prev,
      newImage,
    ]);

    toast.success(
      `${file.name} uploaded successfully.`
    );

    return generatedUrl;

  } catch (error) {
    console.error(
      "Gallery image upload error:",
      error
    );

    toast.error(
      error?.message ||
      "Something went wrong while uploading image."
    );

    return null;

  } finally {
    setIsGalleryUploading(false);
  }
};

  /* =========================
     GALLERY FILE SELECT
  ========================= */

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      uploadGalleryImage(file);
    });

    e.target.value = "";
  };

  /* =========================
     GALLERY DRAG & DROP
  ========================= */

  const handleGalleryDragOver = (e) => {
    e.preventDefault();
    setGalleryDragging(true);
  };

  const handleGalleryDragLeave = (e) => {
    e.preventDefault();
    setGalleryDragging(false);
  };

  const handleGalleryDrop = (e) => {
    e.preventDefault();
    setGalleryDragging(false);

    const files = Array.from(
      e.dataTransfer.files || []
    );

    files.forEach((file) => {
      uploadGalleryImage(file);
    });
  };

  

  const removeGalleryImage = (id) => {
    setGalleryImages((prev) => {
      const updated = prev.filter(
        (image) => image.id !== id
      );


      if (
        updated.length > 0 &&
        !updated.some((image) => image.is_cover)
      ) {
        updated[0].is_cover = true;
      }

      return updated;
    });
  };

 

  const setCoverImage = (id) => {
    setGalleryImages((prev) =>
      prev.map((image) => ({
        ...image,
        is_cover: image.id === id,
      }))
    );
  };


  const copyGalleryUrl = async (url, id) => {
    try {
      await navigator.clipboard.writeText(url);

      setCopiedUrl(id);

      toast.success("Image URL copied.");

      setTimeout(() => {
        setCopiedUrl(null);
      }, 2000);
    } catch (error) {
      toast.error("Unable to copy URL.");
    }
  };

  /* =========================
     FORMAT FILE SIZE
  ========================= */

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 KB";

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /* =========================
     EXCEL UPLOAD
  ========================= */

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an Excel file first.");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();

      formData.append("file", selectedFile);

      const response = await fetch(
        `${BASE_URL}/products/admin/bulk-upload/`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to upload products."
        );
      }

      toast.success(
        data?.message ||
          "Products uploaded successfully."
      );

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(
        "Bulk upload error:",
        error
      );

      toast.error(
        error?.message ||
          "Something went wrong while uploading."
      );
    } finally {
      setIsUploading(false);
    }
  };

  /* =========================
     BACK
  ========================= */

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="bulk-upload-page">

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
      />

      <div className="bulk-upload-container">

        {/* =========================
            HEADER
        ========================= */}

        <div className="bulk-page-header">

          <button
            className="back-products-btn"
            onClick={handleBack}
          >
            <FiArrowLeft />
            <span>Back to Products</span>
          </button>

          <div className="bulk-title-row">
            <h1>
              Bulk Upload <span>Products</span>
            </h1>
          </div>

          <p className="bulk-page-description">
            Download the template, fill Products → Variants →
            Gallery, upload gallery images and use the generated
            URLs in the Excel file.
          </p>

        </div>

        {/* =========================
            CONTENT GRID
        ========================= */}

        <div className="bulk-content-grid">

          {/* =========================
              LEFT COLUMN
          ========================= */}

          <div className="bulk-left-column">

            {/* =========================
                EXCEL UPLOAD CARD
            ========================= */}

            <div className="upload-card">

              <div className="upload-card-header">

                <div className="upload-card-icon">
                  <FiFileText />
                </div>

                <div>
                  <h2>Upload Excel File</h2>

                  <p>
                    Use the official template (.xlsx).
                    Max 15 MB.
                  </p>
                </div>

              </div>

              {/* DROP ZONE */}

              <div
                className={`excel-drop-zone ${
                  isDragging ? "dragging" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleInputChange}
                  hidden
                />

                <div className="upload-cloud-icon">
                  <FiUploadCloud />
                </div>

                <h3>
                  Drag & drop your Excel file here
                </h3>

                <p>
                  or click to browse from your computer
                </p>

                <span className="accepted-files">
                  Accepted: .xlsx, .xls
                </span>

              </div>

              {/* SELECTED FILE */}

              {selectedFile && (
                <div className="selected-file-card">

                  <div className="selected-file-left">

                    <div className="selected-file-icon">
                      <FiFileText />
                    </div>

                    <div className="selected-file-info">

                      <strong>
                        {selectedFile.name}
                      </strong>

                      <span>
                        {formatFileSize(
                          selectedFile.size
                        )}
                      </span>

                    </div>

                  </div>

                  <button
                    className="remove-file-btn"
                    onClick={removeFile}
                    type="button"
                    title="Remove file"
                  >
                    <FiTrash2 />
                  </button>

                </div>
              )}

              {/* ACTIONS */}

              <div className="upload-actions">

                <button
                  className="upload-products-btn"
                  onClick={handleUpload}
                  disabled={
                    !selectedFile ||
                    isUploading
                  }
                >

                  <FiUploadCloud />

                  {isUploading
                    ? "Uploading..."
                    : "Upload Products"}

                </button>

                <button
                  className="reset-upload-btn"
                  onClick={handleReset}
                  disabled={isUploading}
                >

                  <FiRefreshCw />
                  Reset

                </button>

              </div>

            </div>

            {/* =================================================
                GALLERY IMAGE UPLOAD CARD
            ================================================= */}

            <div className="upload-card gallery-upload-card">

              <div className="upload-card-header">

                <div className="upload-card-icon">
                  <FiImage />
                </div>

                <div>
                  <h2>Gallery Images</h2>

                  <p>
                    Upload product images and generate
                    their media URLs.
                  </p>
                </div>

              </div>

              {/* GALLERY DROP ZONE */}

              <div
                className={`excel-drop-zone gallery-drop-zone ${
                  galleryDragging
                    ? "dragging"
                    : ""
                }`}
                onDragOver={handleGalleryDragOver}
                onDragLeave={handleGalleryDragLeave}
                onDrop={handleGalleryDrop}
                onClick={() =>
                  galleryInputRef.current?.click()
                }
              >

                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={handleGalleryChange}
                  hidden
                />

                <div className="upload-cloud-icon">
                  <FiImage />
                </div>

                <h3>
                  Drag & drop product images here
                </h3>

                <p>
                  or click to browse multiple images
                </p>

                <span className="accepted-files">
                  JPG, JPEG, PNG, WEBP • Max 15 MB
                </span>

              </div>

              {/* UPLOADING MESSAGE */}

              {isGalleryUploading && (
                <div className="gallery-uploading">
                  <FiRefreshCw className="spin-icon" />
                  <span>
                    Uploading image...
                  </span>
                </div>
              )}

              {/* GALLERY IMAGES */}

              {galleryImages.length > 0 && (
                <div className="gallery-images-list">

                  <div className="gallery-list-header">

                    <div>
                      <strong>
                        Uploaded Images
                      </strong>

                      <span>
                        {galleryImages.length} image
                        {galleryImages.length > 1
                          ? "s"
                          : ""}
                      </span>
                    </div>

                  </div>

                  {galleryImages.map((image) => (
                    <div
                      className="gallery-image-item"
                      key={image.id}
                    >

                      {/* IMAGE */}

                      <div className="gallery-preview">

                        <img
                          src={image.url}
                          alt={image.name}
                        />

                        {image.is_cover && (
                          <span className="cover-badge">
                            Cover
                          </span>
                        )}

                      </div>

                      {/* INFO */}

                      <div className="gallery-image-info">

                        <strong
                          title={image.name}
                        >
                          {image.name}
                        </strong>

                        <span>
                          {formatFileSize(
                            image.size
                          )}
                        </span>

                        {/* URL */}

                        <div className="gallery-url-box">

                          <input
                            type="text"
                            value={image.url}
                            readOnly
                            onClick={(e) =>
                              e.target.select()
                            }
                          />

                          <button
                            type="button"
                            onClick={() =>
                              copyGalleryUrl(
                                image.url,
                                image.id
                              )
                            }
                            title="Copy URL"
                          >

                            {copiedUrl ===
                            image.id ? (
                              <FiCheck />
                            ) : (
                              <FiCopy />
                            )}

                          </button>

                        </div>

                        {/* COVER */}

                        <div className="gallery-item-actions">

                          {!image.is_cover && (
                            <button
                              type="button"
                              className="set-cover-btn"
                              onClick={() =>
                                setCoverImage(
                                  image.id
                                )
                              }
                            >
                              Set as Cover
                            </button>
                          )}

                          <button
                            type="button"
                            className="remove-gallery-btn"
                            onClick={() =>
                              removeGalleryImage(
                                image.id
                              )
                            }
                            title="Remove image"
                          >
                            <FiTrash2 />
                            Remove
                          </button>

                        </div>

                      </div>

                    </div>
                  ))}

                </div>
              )}

              {/* GALLERY EXCEL INFO */}

              <div className="gallery-info-note">

                <FiInfo />

                <p>
                  Copy the generated URL into the
                  <strong> Gallery </strong>
                  sheet's
                  <strong> media_url </strong>
                  column.
                  Set
                  <strong> media_type </strong>
                  to
                  <strong> image </strong>
                  and
                  <strong> is_cover </strong>
                  to
                  <strong> True </strong>
                  for the cover image.
                </p>

              </div>

            </div>

          </div>

          {/* =========================
              RIGHT COLUMN
          ========================= */}

          <div className="bulk-right-column">

            {/* HOW IT WORKS */}

            <div className="info-card how-it-works-card">

              <div className="info-card-header">

                <div className="info-icon yellow">
                  <FiInfo />
                </div>

                <div>
                  <h2>How it works</h2>

                  <p>
                    Follow these steps for a successful
                    upload.
                  </p>
                </div>

              </div>

              <div className="steps-list">

                <div className="step-item">

                  <div className="step-number">
                    1
                  </div>

                  <p>
                    Download the template and keep
                    sheet names:
                    <strong>
                      {" "}Products, Variants, Gallery,
                      References.
                    </strong>
                  </p>

                </div>

                <div className="step-item">

                  <div className="step-number">
                    2
                  </div>

                  <p>
                    Fill product rows first, then add
                    variants and gallery rows using the
                    same
                    <strong> product_key.</strong>
                  </p>

                </div>

                <div className="step-item">

                  <div className="step-number">
                    3
                  </div>

                  <p>
                    Upload your product gallery images
                    using the Gallery uploader. Copy
                    the generated URL into
                    <strong> media_url.</strong>
                  </p>

                </div>

                <div className="step-item">

                  <div className="step-number">
                    4
                  </div>

                  <p>
                    Copy subcategory, brand and disease
                    IDs from the
                    <strong> References </strong>
                    sheet.
                  </p>

                </div>

                <div className="step-item">

                  <div className="step-number">
                    5
                  </div>

                  <p>
                    Save the Excel file as
                    <strong> .xlsx </strong>
                    and upload it.
                  </p>

                </div>

              </div>

              <button
                className="download-template-btn"
                onClick={downloadTemplate}
              >
                <FiDownload />
                Download Excel Template
              </button>

            </div>

            {/* SHEET GUIDE */}

            <div className="info-card sheet-guide-card">

              <button
                className="sheet-guide-header"
                onClick={() =>
                  setGuideOpen(!guideOpen)
                }
              >

                <div>

                  <h2>
                    Sheet format guide
                  </h2>

                  <p>
                    Required columns for each sheet
                  </p>

                </div>

                {guideOpen ? (
                  <FiChevronUp />
                ) : (
                  <FiChevronDown />
                )}

              </button>

              {guideOpen && (
                <div className="sheet-guide-content">

                  {/* PRODUCTS */}

                  <div className="sheet-section">

                    <h3>Products</h3>

                    <p className="columns-text">
                      product_key, name,
                      product_subcategory_id,
                      brand_name_id, manufacturer,
                      origin, short_description,
                      full_description, how_to_use,
                      health_disease_ids, benefits,
                      treatment_type, compositions,
                      side_effects, dosages,
                      safety_information,
                      model_number, is_nutrition,
                      is_featured, is_active
                    </p>

                    <p className="guide-note">
                      One row per product. Use a temporary
                      product_key such as P0001 to link
                      variants and gallery.
                    </p>

                  </div>

                  {/* VARIANTS */}

                  <div className="sheet-section">

                    <h3>Variants</h3>

                    <p className="columns-text">
                      product_key,
                      vendor_sku_code, title,
                      is_default, physical_state,
                      calculation_mode, cost_per_item,
                      size, weightage, selling_price,
                      mrp, discount,
                      is_free_shipping,
                      shipping_amount,
                      is_returnable,
                      returnable_days,
                      pan_delivery,
                      prescription_required,
                      tax_name, tax_rate
                    </p>

                    <p className="guide-note">
                      One row per SKU/size. Match
                      product_key to Products.
                    </p>

                  </div>

                  {/* GALLERY */}

                  <div className="sheet-section">

                    <h3>Gallery</h3>

                    <p className="columns-text">
                      product_key,
                      vendor_sku_code,
                      media_url,
                      media_type,
                      is_cover
                    </p>

                    <p className="guide-note">
                      Upload images above, copy their
                      generated URL and paste it into
                      media_url.
                    </p>

                  </div>

                  {/* REFERENCES */}

                  <div className="sheet-section">

                    <h3>References</h3>

                    <p className="columns-text">
                      product_subcategory_id / name,
                      brand_name_id / name,
                      health_disease_id / name,
                      physical_state
                    </p>

                    <p className="guide-note">
                      Lookup sheet only — do not invent IDs.
                    </p>

                  </div>

                </div>
              )}

            </div>

            {/* QUICK TIPS */}

            <div className="info-card quick-tips-card">

              <div className="info-card-header">

                <div className="info-icon blue">
                  <FiCheckCircle />
                </div>

                <div>

                  <h2>Quick tips</h2>

                  <p>
                    Avoid common upload failures
                  </p>

                </div>

              </div>

              <ul className="quick-tips-list">

                <li>
                  Keep example rows or replace them —
                  <strong>
                    {" "}do not rename sheet headers.
                  </strong>
                </li>

                <li>
                  Boolean fields use
                  <code> True </code> /
                  <code> False </code>.
                </li>

                <li>
                  Every variant needs a unique
                  <strong>
                    {" "}vendor_sku_code.
                  </strong>
                </li>

                <li>
                  Gallery media URLs are generated
                  through the image upload API.
                </li>

                <li>
                  Use only one
                  <strong> is_cover=True </strong>
                  image per variant.
                </li>

                <li>
                  Stock quantity is managed separately
                  in Stock Management after approval.
                </li>

              </ul>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default BulkUploadProducts;