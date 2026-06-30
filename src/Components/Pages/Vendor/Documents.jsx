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

         
        </div>

      <div className="document-image-container">
  {doc.fileUrl ? (
    /\.(jpg|jpeg|png|gif|webp)$/i.test(doc.fileUrl) ? (
      <img
        src={doc.fileUrl}
        alt={doc.type}
        className="document-image"
      />
    ) : /\.pdf$/i.test(doc.fileUrl) ? (
      <iframe
        src={`${doc.fileUrl}#toolbar=0&navpanes=0`}
        title={doc.type}
        className="pdf-preview"
      />
    ) : (
      <div className="no-preview">
        No Preview Available
      </div>
    )
  ) : (
    <div className="no-preview">No File</div>
  )}
</div>
        <div className="document-actions">

          <button
            className="document-btn docview-btn"
            onClick={() => window.open(doc.fileUrl, "_blank")}
            disabled={!doc.fileUrl}
          >
            <FaEye /> View
          </button>

         <button
  className="document-btn docdownload-btn"
  disabled={!doc.fileUrl}
  onClick={() =>
    handleDownload(
      doc.fileUrl,
      `${doc.type}.${doc.fileUrl.split(".").pop()}`
    )
  }
>
  <FaDownload /> Download
</button>

        </div>

      </div>
    );
  };

  const handleDownload = async (url, fileName) => {
  try {
    console.log("Downloading:", url);

    const response = await fetch(url);
    console.log("Response:", response);

    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName || "document";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
  }
};

  return (
   <div className="verification-container">
  <div className="documentss-section">

    {docs.length > 0 ? (
      <div className="documents-grids">
        {docs.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>
    ) : (
      <div className="empty-bank-state">
        <FaFileAlt size={50} className="empty-icon" />

        <h3>No Documents Available</h3>

        <p>
          This doctor has not uploaded any documents yet.
        </p>
      </div>
    )}

  </div>
</div>
  );
};

export default Documents;