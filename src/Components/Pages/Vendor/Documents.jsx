import React from "react";
import {
  FaFileAlt,
  FaClock,
  FaDownload,
  FaEye,
  FaEllipsisV,
} from "react-icons/fa";
import "./Documents.css";

const Documents = ({ documentsData }) => {

 const formatDocs = (data) => {
  if (!data) return [];

  
  const docs = data.documents || data;

  if (typeof docs !== "object") return [];

  const ignoreKeys = new Set([
    "id",
    "doctor",
    "vendor",
    "is_verified",
    "verified_at",
    "created_at",
    "updated_at",
  ]);

  const labelMap = {
    // Doctor
    medical_degree_certificate: "Medical Degree Certificate",
    registration_certificate: "Registration Certificate",
    identity_proof: "Identity Proof",
    address_proof: "Address Proof",
    passport_photo: "Passport Photo",
    signature: "Signature",
    experience_certificate: "Experience Certificate",

    // Vendor
    gst_certificate: "GST Certificate",
    pan_card: "PAN Card",
    establishment_certificate: "Establishment Certificate",
    fssai_license: "FSSAI License",
    ayurvedic_manufacturing_license:
      "Ayurvedic Manufacturing License",
    bank_statement: "Bank Statement",
    cancelled_cheque: "Cancelled Cheque",
    product_catalog: "Product Catalog",
    company_logo: "Company Logo",
  };

  return Object.entries(docs)
    .filter(([key, value]) => {
      if (ignoreKeys.has(key)) return false;
      return value !== null && value !== undefined && value !== "";
    })
    .map(([key, value]) => ({
      id: key,
      type:
        labelMap[key] ||
        key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      fileUrl: value,
    }));
};

const docs = React.useMemo(() => {
  return formatDocs(documentsData);
}, [documentsData]);

  const DocumentCard = ({ doc }) => {
    return (
      <div className="document-card">

        {/* HEADER */}
        <div className="document-header">
          <div className="document-title-section">
            <FaFileAlt className="documents-icon" />
            <div className="document-type">{doc.type}</div>
          </div>

          <button className="menu-btn">
            <FaEllipsisV />
          </button>
        </div>

       
        <div className="document-image-container">
          {doc.fileUrl ? (
            <iframe
              src={doc.fileUrl}
              title={doc.type}
              className="pdf-preview"
            />
          ) : (
            <div className="no-preview">No File</div>
          )}
        </div>

    

        {/* ACTIONS */}
        <div className="document-actions">

          <button
            className="document-btn docview-btn"
            onClick={() => window.open(doc.fileUrl, "_blank")}
            disabled={!doc.fileUrl}
          >
            <FaEye /> View
          </button>

          <a
            href={doc.fileUrl}
            download
            target="_blank"
            rel="noreferrer"
          >
            <button
              className="document-btn docdownload-btn"
              disabled={!doc.fileUrl}
            >
              <FaDownload /> Download
            </button>
          </a>

        </div>

      </div>
    );
  };

  return (
    <div className="verification-container">

      <div className="documentss-section">

        <div className="documents-grids">

          {docs.length > 0 ? (
            docs.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} />
            ))
          ) : (
            <div className="no-docs">
              No Documents Found
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default Documents;