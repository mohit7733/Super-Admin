
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaBox,
  FaUser,
  FaCreditCard,
  FaGift,
  FaStethoscope,
  FaHistory,
  FaCalendarAlt,
  FaSyncAlt,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaRupeeSign,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";

import BASE_URL from "../../../Base";
import "react-toastify/dist/ReactToastify.css";
import "./PackageDetails.css";

const PackageDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  

  const display = (value, fallback = "—") => {
    if (value === null || value === undefined || value === "") {
      return fallback;
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.length
          ? value.map((item) => display(item, "")).join(", ")
          : fallback;
      }

      return (
        value.full_name ||
        value.name ||
        value.label ||
        value.title ||
        value.code ||
        value.id ||
        fallback
      );
    }

    return String(value);
  };

  const money = (value, currency = "INR") => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
      return display(value);
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number);
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return display(value);
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const quantity = (value) => {
    if (value === null || value === undefined || value === "") {
      return "Unlimited";
    }

    return display(value);
  };

  const getStatusClass = (value) => {
    const status = display(value, "").toLowerCase();

    if (
      ["active", "paid", "approved", "completed", "available", "success"].includes(status)
    ) {
      return "cpd-success";
    }

    if (
      ["rejected", "failed", "cancelled", "expired", "inactive", "refunded"].includes(status)
    ) {
      return "cpd-danger";
    }

    if (
      ["pending", "processing", "reserved"].includes(status)
    ) {
      return "cpd-pending";
    }

    return "cpd-neutral";
  };

  // =====================================================
  // API
  // =====================================================

  const fetchDetails = async () => {
    try {
      setLoading(true);

      const token = sessionStorage.getItem("superadmin_token");

      const response = await fetch(
        `${BASE_URL}/packages/admin/purchases/?id=${id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("superadmin_token");
        navigate("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to fetch purchase details"
        );
      }

      setDetails(result.data || null);
    } catch (error) {
      console.error("Package details error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  // =====================================================
  // REUSABLE UI
  // =====================================================

  const Status = ({ value }) => (
    <span className={`cpd-status ${getStatusClass(value)}`}>
      {display(value)}
    </span>
  );

  const Info = ({ label, value, icon }) => (
  <div className="cpd-info">
    <span>
      {icon && <span className="cpd-info-icon">{icon}</span>}
      {label}
    </span>

    <strong>
      {React.isValidElement(value) ? value : display(value)}
    </strong>
  </div>
);

  const Section = ({ title, icon, children }) => (
    <section className="cpd-section">
      <div className="cpd-section-heading">
        <span className="cpd-section-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  );

  const Empty = ({ text = "No records available." }) => (
    <div className="cpd-no-data">
      <FaHistory />
      <span>{text}</span>
    </div>
  );

  const DataTable = ({ columns, rows, emptyText }) => (
    <div className="cpd-table-wrap">
      {rows.length > 0 ? (
        <table className="cpd-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id || row.entitlement_id || row.purchase_id || index}>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.render
                      ? column.render(row)
                      : display(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <Empty text={emptyText} />
      )}
    </div>
  );

 
  if (loading) {
    return (
      <div className="cpd-loader">
        <FaSyncAlt className="cpd-spin" />
        <p>Loading package details...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="cpd-empty">
        <h3>Purchase details not found</h3>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

 

  const packageData = details.package_details || {};
  const packageSnapshot = details.package_snapshot || {};
  const payment = details.payment_details || {};

  const customerPatient = details.customer_patient_details || {};
  const customer = customerPatient.customer || details.customer || {};
  const patient = customerPatient.patient || details.patient || {};

  const allocation = details.benefit_allocation || {};
  const allocationSummary = allocation.summary || {};
  const benefits = Array.isArray(allocation.benefits)
    ? allocation.benefits
    : [];

  const usageData = details.benefit_usage || {};
  const usageHistory = Array.isArray(usageData.usage_history)
    ? usageData.usage_history
    : [];

  const shiftedData = usageData.shifted_benefits || {};
  const shiftedIn = Array.isArray(shiftedData.shifted_in)
    ? shiftedData.shifted_in
    : [];
  const shiftedOut = Array.isArray(shiftedData.shifted_out)
    ? shiftedData.shifted_out
    : [];

  const consultationData = details.consultation_history || {};
  const consultationSummary = consultationData.summary || {};
  const consultations = Array.isArray(consultationData.consultations)
    ? consultationData.consultations
    : [];

  const purchaseData = details.purchase_history || {};
  const purchaseEvents = Array.isArray(purchaseData.events)
    ? purchaseData.events
    : [];
  const customerPurchases = Array.isArray(purchaseData.customer_purchases)
    ? purchaseData.customer_purchases
    : [];

  const currency = details.currency || payment.currency || "INR";

  const packageName =
    packageData.package_name ||
    details.package_name_snapshot ||
    packageSnapshot.name;

  const customerName =
    customer.full_name ||
    [customer.first_name, customer.last_name].filter(Boolean).join(" ");

  const patientName =
    patient.full_name ||
    details.patient_name ||
    [patient.first_name, patient.last_name].filter(Boolean).join(" ");

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="cpd-page">
      <ToastContainer position="top-right" />

      {/* HEADER */}

      <div className="cpd-header">
        <button className="cpd-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <div className="cpd-header-content">
          <div>
            <h2>Package Purchase Details</h2>
            <p>Complete package, payment and fulfillment information</p>
          </div>

          <Status value={details.status} />
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="cpd-summary">
        <div className="cpd-summary-card">
          <span>Package Name</span>
          <h3>{display(packageName)}</h3>
          <small>Purchase ID: {display(details.id)}</small>
        </div>

        <div className="cpd-summary-card">
          <span>Paid Amount</span>
          <h2>{money(details.paid_price, currency)}</h2>
          <small>Original: {money(details.original_price, currency)}</small>
        </div>

        <div className="cpd-summary-card">
          <span>Purchase Status</span>
          <Status value={details.status} />
          <small>Billing: {display(details.billing_mode)}</small>
        </div>

        <div className="cpd-summary-card">
          <span>Total Benefits</span>
          <h2>{display(allocationSummary.benefit_count, "0")}</h2>
          <small>Allocated benefits</small>
        </div>
      </div>

      {/* PACKAGE DETAILS */}

      <Section title="Package Details" icon={<FaBox />}>
        <div className="cpd-grid">
          <Info label="Package Name" value={packageName} />
          <Info label="Package ID" value={packageData.package_id || details.package} />
          <Info
            label="Category"
            value={packageData.category?.name || packageSnapshot.category_name}
          />
          <Info
            label="Category Code"
            value={packageData.category?.code || packageSnapshot.category}
          />
       <Info
  label="Description"
  value={
    packageData.description
      ? packageData.description.split(" ").slice(0,10).join(" ") +
        (packageData.description.split(" ").length > 10 ? "..." : "")
      : "-"
  }
/>
          <Info label="Purchase Type" value={packageData.purchase_type} />
          <Info label="Validity" value={packageData.validity_days ? `${packageData.validity_days} days` : "Not specified"} />
          <Info label="Original Price" value={money(details.original_price, currency)} />
          <Info label="Selling Price" value={money(packageSnapshot.selling_price, currency)} />
          <Info label="Paid Price" value={money(details.paid_price, currency)} />
          <Info label="Package Active" value={packageData.is_package_active ? "Yes" : "No"} />
          <Info label="Purchased At" value={formatDate(packageData.purchased_at || details.created_at)} />
        
          <Info label="Start Date" value={formatDate(details.starts_at)} />
          <Info label="Expiry Date" value={formatDate(details.expires_at)} />
          <Info label="Days Remaining" value={packageData.days_remaining} />
       
        </div>

        
        <div className="cpd-benefits-section">
  <h4 className="cpd-subheading">Included Benefits</h4>

 <div className="cpd-benefits">
  {(
    Array.isArray(packageData.included_benefits)
      ? packageData.included_benefits
      : Array.isArray(packageSnapshot.fulfillment)
      ? packageSnapshot.fulfillment
      : []
  ).length > 0 ? (
    (
      Array.isArray(packageData.included_benefits)
        ? packageData.included_benefits
        : packageSnapshot.fulfillment || []
    ).map((benefit, index) => (
      <div className="cpd-benefit-item" key={index}>
        <FaCheckCircle className="cpd-benefit-check" />
        <span>
          {typeof benefit === "object"
            ? display(benefit.label || benefit.name || benefit.benefit_name)
            : display(benefit)}
        </span>
      </div>
    ))
  ) : (
    <Empty text="No included benefits available." />
  )}
</div>
</div>
      </Section>

      {/* PAYMENT DETAILS */}

      <Section title="Payment Details" icon={<FaCreditCard />}>
        <div className="cpd-grid">
          <Info label="Payment Status" value={<Status value={payment.payment_status} />} />
         
          <Info label="Original Price" value={money(payment.original_price, currency)} />
          <Info label="Discount Amount" value={money(payment.discount_amount, currency)} />
          <Info label="Total Paid Amount" value={money(payment.total_paid_amount || details.paid_price, currency)} />
          <Info label="Payment Gateway" value={payment.payment_gateway} />
          <Info label="Billing Mode" value={payment.billing_mode} />
          <Info label="Paid At" value={formatDate(payment.paid_at || details.paid_at)} />
          <Info label="Razorpay Order ID" value={payment.razorpay_order_id || details.razorpay_order_id} />
          <Info label="Razorpay Payment ID" value={payment.razorpay_payment_id || details.razorpay_payment_id} />
       
          <Info label="Failure Reason" value={payment.failure_reason} />
          <Info label="Autopay Status" value={payment.autopay_status || details.autopay_status} />
        </div>

     

     

        {Array.isArray(payment.refund?.refunds) && payment.refund.refunds.length > 0 && (
          <DataTable
            columns={[
              { key: "id", label: "Refund ID" },
              { key: "amount", label: "Amount", render: (row) => money(row.amount, currency) },
              { key: "status", label: "Status", render: (row) => <Status value={row.status} /> },
              { key: "created_at", label: "Date", render: (row) => formatDate(row.created_at) },
            ]}
            rows={payment.refund.refunds}
          />
        )}
      </Section>

      {/* CUSTOMER & PATIENT */}

      <Section title="Customer & Patient Details" icon={<FaUser />}>
        <div className="cpd-subheading">Customer Information</div>

        <div className="cpd-grid">
          <Info label="Customer Name" value={customerName} />
          <Info label="Customer ID" value={customer.id} />
          <Info label="Phone Number" value={customer.phone_number}  />
          <Info label="Gender" value={customer.gender} />
          <Info label="Date of Birth" value={formatDate(customer.date_of_birth)} />
          <Info label="Joined At" value={formatDate(customer.joined_at)} />
        </div>
{/* 
        {customer.profile_picture && (
          <div className="cpd-profile">
            <img src={customer.profile_picture} alt="Customer profile" />
            <span>Customer Profile</span>
          </div>
        )} */}

        <div className="cpd-subheading">Patient Information</div>

        <div className="cpd-grid">
          <Info label="Patient Name" value={patientName} />
          <Info label="Patient ID" value={patient.id || details.patient_id} />
          <Info label="Relationship" value={patient.relation} />
          <Info label="Gender" value={patient.gender} />
          <Info label="Date of Birth" value={formatDate(patient.dob)} />
        
          <Info label="Phone Number" value={patient.phone_number} />
         
         
        </div>
      </Section>

      {/* BENEFIT SUMMARY */}

      <Section title="Benefit Allocation Summary" icon={<FaGift />}>
   

        <DataTable
          columns={[
            {
              key: "benefit_name",
              label: "Benefit",
              render: (row) => (
                <div className="cpd-benefit-name">
                  <strong>{display(row.label || row.benefit_name)}</strong>
                  <small>{display(row.fulfillment_mode)} · {display(row.unit)}</small>
                </div>
              ),
            },
            { key: "role", label: "Role" },
            { key: "status", label: "Status", render: (row) => <Status value={row.status} /> },
            { key: "allocated_quantity", label: "Allocated", render: (row) => quantity(row.allocated_quantity) },
            { key: "used_quantity", label: "Used", render: (row) => quantity(row.used_quantity) },
            { key: "remaining_quantity", label: "Remaining", render: (row) => quantity(row.remaining_quantity) },
            { key: "reserved_quantity", label: "Reserved", render: (row) => quantity(row.reserved_quantity) },
            { key: "usable_quantity", label: "Usable", render: (row) => quantity(row.usable_quantity) },
            { key: "usage_count", label: "Usage Count" },
            { key: "valid_from", label: "Valid From", render: (row) => formatDate(row.valid_from) },
            { key: "valid_until", label: "Valid Until", render: (row) => formatDate(row.valid_until) },
            { key: "last_used_at", label: "Last Used", render: (row) => formatDate(row.last_used_at) },
          ]}
          rows={benefits}
          emptyText="No benefit allocation records found."
        />
      </Section>

      {/* BENEFIT USAGE */}
{/* 
      <Section title="Benefit Usage History" icon={<FaHistory />}>
        <DataTable
          columns={[
            { key: "id", label: "Usage ID" },
            {
              key: "benefit_name",
              label: "Benefit",
              render: (row) => display(row.benefit_name || row.label || row.benefit),
            },
            { key: "quantity", label: "Quantity", render: (row) => quantity(row.quantity ?? row.quantity_used) },
            { key: "status", label: "Status", render: (row) => <Status value={row.status} /> },
            { key: "used_at", label: "Used At", render: (row) => formatDate(row.used_at || row.created_at) },
            { key: "reference_id", label: "Reference", render: (row) => display(row.reference_id || row.appointment_id) },
          ]}
          rows={usageHistory}
          emptyText="No benefit usage history available."
        />
      </Section> */}

      {/* SHIFTED BENEFITS */}

      {/* <Section title="Shifted Benefits" icon={<FaSyncAlt />}>
        <div className="cpd-subheading">Shift Information</div>

        <div className="cpd-grid">
          <Info label="Shift Status" value={details.shift_status} />
          <Info label="Consumables Shifted To" value={details.consumables_shifted_to} />
          <Info label="Shifted Consumables" value={details.shifted_consumables?.length ?? 0} />
        </div>

        <div className="cpd-subheading">Shifted In</div>

        <DataTable
          columns={[
            { key: "benefit_name", label: "Benefit", render: (row) => display(row.benefit_name || row.label || row.benefit) },
            { key: "quantity", label: "Quantity", render: (row) => quantity(row.quantity || row.shifted_in_quantity) },
            { key: "status", label: "Status", render: (row) => <Status value={row.status} /> },
            { key: "created_at", label: "Date", render: (row) => formatDate(row.created_at || row.shifted_at) },
          ]}
          rows={shiftedIn}
          emptyText="No shifted-in benefits."
        />

        <div className="cpd-subheading">Shifted Out</div>

        <DataTable
          columns={[
            { key: "benefit_name", label: "Benefit", render: (row) => display(row.benefit_name || row.label || row.benefit) },
            { key: "quantity", label: "Quantity", render: (row) => quantity(row.quantity || row.shifted_out_quantity) },
            { key: "status", label: "Status", render: (row) => <Status value={row.status} /> },
            { key: "created_at", label: "Date", render: (row) => formatDate(row.created_at || row.shifted_at) },
          ]}
          rows={shiftedOut}
          emptyText="No shifted-out benefits."
        />
      </Section> */}

      {/* DOCTOR CONSULTATIONS */}

      <Section title="Doctor Consultation History" icon={<FaStethoscope />}>
        <div className="cpd-stats">
          <div>
            <span>Total Consultations</span>
            <strong>{display(consultationSummary.total, "0")}</strong>
          </div>
          <div>
            <span>Completed</span>
            <strong>{display(consultationSummary.completed, "0")}</strong>
          </div>
          <div>
            <span>Remaining</span>
            <strong>
              {Math.max(
                0,
                Number(consultationSummary.total || 0) -
                Number(consultationSummary.completed || 0)
              )}
            </strong>
          </div>
        </div>

        <DataTable
          columns={[
            { key: "doctor_name", label: "Doctor", render: (row) => display(row.doctor_name || row.doctor) },
            { key: "doctor_id", label: "Doctor ID" },
            { key: "appointment_id", label: "Appointment ID" },
            {
              key: "consultation_date",
              label: "Consultation Date",
              render: (row) => formatDate(row.consultation_date || row.appointment_date),
            },
            { key: "consultation_time", label: "Time" },
            { key: "status", label: "Status", render: (row) => <Status value={row.status} /> },
          ]}
          rows={consultations}
          emptyText="No doctor consultations available."
        />
      </Section>

    

      {/* CUSTOMER PURCHASE HISTORY */}

      <Section title="Customer Package Purchase History" icon={<FaHistory />}>
        <div className="cpd-subheading">
          Same Package Purchase Count: {display(purchaseData.same_package_purchase_count, "0")}
        </div>

        <DataTable
          columns={[
            { key: "package_name", label: "Package Name" },
            { key: "purchase_id", label: "Purchase ID" },
            { key: "package_id", label: "Package ID" },
            { key: "paid_price", label: "Paid Price", render: (row) => money(row.paid_price, row.currency || currency) },
            { key: "status", label: "Status", render: (row) => <Status value={row.status} /> },
            { key: "starts_at", label: "Start Date", render: (row) => formatDate(row.starts_at) },
            { key: "expires_at", label: "Expiry Date", render: (row) => formatDate(row.expires_at) },
            { key: "paid_at", label: "Paid At", render: (row) => formatDate(row.paid_at) },
            { key: "created_at", label: "Created At", render: (row) => formatDate(row.created_at) },
         
          ]}
          rows={customerPurchases}
          emptyText="No customer purchase history available."
        />
      </Section>
    </div>
  );
};

export default PackageDetails;
