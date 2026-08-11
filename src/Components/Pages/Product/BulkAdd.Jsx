import React, { useRef, useState } from "react";
import {
  FaCloudDownloadAlt,
  FaFileExcel,
  FaFolderOpen,
  FaTrash,
  FaInfoCircle,
  FaBoxOpen,
  FaTag,
  FaImages,
  FaLink,
  FaFileAlt,
  FaChevronUp,
  FaChevronDown,
  FaArrowRight,
  FaLightbulb,
  FaTimes,
} from "react-icons/fa";

import "./BulkAdd.css";

const BulkAdd = () => {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [openSections, setOpenSections] = useState({
    products: true,
    variants: true,
    gallery: true,
    references: true,
    instructions: false,
  });

  const handleFile = (file) => {
    if (!file) return;

    const validExtensions = [".xlsx", ".xls"];
    const fileName = file.name.toLowerCase();

    const isValid = validExtensions.some((ext) =>
      fileName.endsWith(ext)
    );

    if (!isValid) {
      alert("Please upload a valid Excel file (.xlsx or .xls)");
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const downloadTemplate = () => {
    // Replace this path with your actual template path/API
    const link = document.createElement("a");

    link.href = "/templates/products_bulk_upload_template.xlsx";
    link.download = "products_bulk_upload_template.xlsx";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleValidate = () => {
    if (!selectedFile) {
      alert("Please select an Excel file first.");
      return;
    }

    console.log("Validate file:", selectedFile);

    // Excel parsing/API integration will be added here
  };

  return (
    <div className="bulk-upload-page">

      {/* ================= TOP HEADER ================= */}
      <div className="bulk-breadcrumb">
        <span>Dashboard</span>
        <FaChevronDown className="breadcrumb-arrow" />
        <span>Products</span>
        <FaChevronDown className="breadcrumb-arrow" />
        <strong>Bulk Product Upload</strong>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="bulk-upload-container">

        {/* ================= LEFT CARD ================= */}
        <div className="bulk-upload-card">

          <div className="bulk-card-header">
            <div>
              <h1>Bulk Product Upload</h1>
              <p>
                Upload multiple products using Excel file.
                Download the template, fill your data and upload.
              </p>
            </div>

            <button
              className="mobile-close-btn"
              type="button"
            >
              <FaTimes />
            </button>
          </div>

          {/* DOWNLOAD TEMPLATE */}
          <button
            className="download-template-btn"
            onClick={downloadTemplate}
            type="button"
          >
            <FaCloudDownloadAlt />
            Download Excel Template
          </button>

          {/* HIDDEN INPUT */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            hidden
          />

          {/* ================= DROP ZONE ================= */}
          <div
            className={`excel-drop-zone ${
              dragActive ? "drag-active" : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="excel-file-icon">
              <FaFileExcel />
            </div>

            <h3>Drag & drop your Excel file here</h3>

            <span className="drop-or">or</span>

            <button
              type="button"
              className="browse-file-btn"
              onClick={handleBrowse}
            >
              <FaFolderOpen />
              Browse File
            </button>

            <p className="supported-format">
              Supported format: .xlsx, .xls
            </p>
          </div>

          {/* ================= SELECTED FILE ================= */}
          {selectedFile && (
            <div className="selected-file-box">

              <div className="selected-file-left">

                <div className="small-excel-icon">
                  <FaFileExcel />
                </div>

                <div className="selected-file-info">
                  <h4>{selectedFile.name}</h4>

                  <span>
                    {(selectedFile.size / 1024).toFixed(0)} KB
                  </span>
                </div>

              </div>

              <button
                type="button"
                className="remove-file-btn"
                onClick={removeFile}
              >
                <FaTrash />
                Remove
              </button>

            </div>
          )}

          {/* ================= NOTE ================= */}
          <div className="bulk-note-box">

            <div className="bulk-note-icon">
              <FaInfoCircle />
            </div>

            <div>
              <h4>Note</h4>

              <p>
                Please make sure your Excel file follows the
                given template format.
              </p>

              <span>Maximum file size: 10MB</span>
            </div>

          </div>

          {/* ================= FOOTER ================= */}
          <div className="bulk-card-footer">

            <button
              type="button"
              className="cancel-upload-btn"
              onClick={removeFile}
            >
              Cancel
            </button>

            <button
              type="button"
              className="validate-upload-btn"
              onClick={handleValidate}
            >
              Validate & Preview
              <FaArrowRight />
            </button>

          </div>

        </div>

        {/* ================= RIGHT GUIDE ================= */}
        <div className="excel-guide-card">

          <div className="guide-header">
            <h2>Excel Sheet Guide</h2>

            <p>
              Your Excel file must contain the following sheets.
            </p>
          </div>

          {/* PRODUCTS */}
          <div
            className={`guide-section products-section ${
              openSections.products ? "section-open" : ""
            }`}
          >

            <div
              className="guide-section-header"
              onClick={() => toggleSection("products")}
            >

              <div className="guide-icon products-icon">
                <FaBoxOpen />
              </div>

              <div className="guide-title-area">

                <div className="guide-title-row">

                  <span className="guide-number products-number">
                    1
                  </span>

                  <h3>Products Sheet</h3>

                  <span className="required-badge">
                    Required
                  </span>

                </div>

                <p>
                  Main product information. One row for each product.
                </p>

              </div>

              <div className="guide-chevron">
                {openSections.products ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>

            </div>

            {openSections.products && (
              <div className="guide-content">

                <strong>Important Columns:</strong>

                <ul>
                  <li>
                    <code>product_key</code>, name
                  </li>

                  <li>
                    <code>product_subcategory_id</code>
                  </li>

                  <li>
                    <code>brand_name_id</code>, manufacturer
                  </li>

                  <li>
                    origin, short_description,
                    full_description
                  </li>

                  <li>
                    compositions, benefits,
                    is_active, is_featured
                  </li>
                </ul>

              </div>
            )}

          </div>

          {/* VARIANTS */}
          <div
            className={`guide-section variants-section ${
              openSections.variants ? "section-open" : ""
            }`}
          >

            <div
              className="guide-section-header"
              onClick={() => toggleSection("variants")}
            >

              <div className="guide-icon variants-icon">
                <FaTag />
              </div>

              <div className="guide-title-area">

                <div className="guide-title-row">

                  <span className="guide-number variants-number">
                    2
                  </span>

                  <h3>Variants Sheet</h3>

                  <span className="required-badge">
                    Required
                  </span>

                </div>

                <p>
                  Product variants with pricing, stock and other details.
                </p>

              </div>

              <div className="guide-chevron">
                {openSections.variants ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>

            </div>

            {openSections.variants && (
              <div className="guide-content">

                <strong>Important Columns:</strong>

                <ul>
                  <li>
                    <code>product_key</code>
                  </li>

                  <li>
                    <code>vendor_sku_code</code>,
                    title
                  </li>

                  <li>
                    <code>is_default</code>
                  </li>

                  <li>
                    selling_price, MRP, stock
                  </li>

                  <li>
                    packaging_size, weight, etc.
                  </li>
                </ul>

              </div>
            )}

          </div>

          {/* GALLERY */}
          <div
            className={`guide-section gallery-section ${
              openSections.gallery ? "section-open" : ""
            }`}
          >

            <div
              className="guide-section-header"
              onClick={() => toggleSection("gallery")}
            >

              <div className="guide-icon gallery-icon">
                <FaImages />
              </div>

              <div className="guide-title-area">

                <div className="guide-title-row">

                  <span className="guide-number gallery-number">
                    3
                  </span>

                  <h3>Gallery Sheet</h3>

                  <span className="required-badge">
                    Required
                  </span>

                </div>

                <p>
                  Product/variant images information.
                </p>

              </div>

              <div className="guide-chevron">
                {openSections.gallery ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>

            </div>

            {openSections.gallery && (
              <div className="guide-content">

                <strong>Important Columns:</strong>

                <ul>
                  <li>
                    <code>product_key</code>
                  </li>

                  <li>
                    <code>vendor_sku_code</code>
                  </li>

                  <li>
                    <code>image_url</code>,
                    image_order
                  </li>

                  <li>
                    <code>is_thumbnail</code>
                  </li>

                  <li>
                    alt_text, etc.
                  </li>
                </ul>

              </div>
            )}

          </div>

          {/* REFERENCES */}
          <div
            className={`guide-section references-section ${
              openSections.references ? "section-open" : ""
            }`}
          >

            <div
              className="guide-section-header"
              onClick={() => toggleSection("references")}
            >

              <div className="guide-icon references-icon">
                <FaLink />
              </div>

              <div className="guide-title-area">

                <div className="guide-title-row">

                  <span className="guide-number references-number">
                    4
                  </span>

                  <h3>References Sheet</h3>

                  <span className="optional-badge">
                    Optional
                  </span>

                </div>

                <p>
                  Reference data for categories, brands, disease, etc.
                </p>

              </div>

              <div className="guide-chevron">
                {openSections.references ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>

            </div>

            {openSections.references && (
              <div className="guide-content">

                <strong>Contains:</strong>

                <ul>
                  <li>
                    Category
                  </li>

                  <li>
                    Brand
                  </li>

                  <li>
                    Disease
                  </li>

                  <li>
                    Subcategory
                  </li>

                  <li>
                    Treatment Type, Units,
                    Other references
                  </li>
                </ul>

              </div>
            )}

          </div>

          {/* INSTRUCTIONS */}
          <div
            className={`guide-section instructions-section ${
              openSections.instructions ? "section-open" : ""
            }`}
          >

            <div
              className="guide-section-header"
              onClick={() => toggleSection("instructions")}
            >

              <div className="guide-icon instructions-icon">
                <FaFileAlt />
              </div>

              <div className="guide-title-area">

                <div className="guide-title-row">

                  <span className="guide-number instructions-number">
                    5
                  </span>

                  <h3>Instructions Sheet</h3>

                  <span className="info-badge">
                    Info
                  </span>

                </div>

                <p>
                  Read the instructions carefully before uploading.
                </p>

              </div>

              <div className="guide-chevron">
                {openSections.instructions ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </div>

            </div>

            {openSections.instructions && (
              <div className="guide-content">

                <strong>Contains:</strong>

                <ul>
                  <li>
                    Excel formatting guidelines
                  </li>

                  <li>
                    Required field information
                  </li>

                  <li>
                    Examples and data rules
                  </li>
                </ul>

              </div>
            )}

          </div>

          {/* HELP */}
          <div className="guide-help">

            <FaLightbulb />

            <div>
              <strong>Need help?</strong>

              <span>
                Download the template or contact support.
              </span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default BulkAdd;