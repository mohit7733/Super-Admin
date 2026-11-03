
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
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaIdCard,
  FaRupeeSign,
  FaSyncAlt,
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

  const token = sessionStorage.getItem("superadmin_token");

  const fetchDetails = async () => {
    try {
      setLoading(true);

      // Replace this URL with your actual package purchase detail endpoint.
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
        throw new Error(result.message || "Unable to fetch purchase details");
      }

      const data = result.data;

      // Supports either a direct object or a paginated results response.
      const purchase = Array.isArray(data?.results)
        ? data.results.find((item) => String(item.id) === String(id)) ||
          data.results[0]
        : data;

      if (!purchase) {
        throw new Error("Purchase details not found");
      }

      setDetails(purchase);
    } catch (error) {
      console.error("Purchase details error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const get = (obj, ...keys) => {
    for (const key of keys) {
      const value = obj?.[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
    return "—";
  };

  const formatDate = (value) => {
    if (!value || value === "—") return "—";
    const date = new Date(value);
    return isNaN(date.getTime())
      ? value
      : date.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const formatMoney = (value) => {
    if (value === undefined || value === null || value === "") return "—";
    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  const statusClass = (status) => {
    const value = String(status || "").toLowerCase();

    if (["success", "completed", "active", "approved", "paid"].includes(value))
      return "cpd-success";

    if (["failed", "cancelled", "rejected", "refunded", "expired"].includes(value))
      return "cpd-danger";

    if (["pending", "processing"].includes(value))
      return "cpd-pending";

    return "cpd-neutral";
  };

  const Status = ({ value }) => (
    <span className={`cpd-status ${statusClass(value)}`}>
      {value || "—"}
    </span>
  );

  const Section = ({ title, icon, children }) => (
    <div className="cpd-section">
      <div className="cpd-section-heading">
        <span className="cpd-section-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );

  const Info = ({ label, value }) => (
    <div className="cpd-info">
      <span>{label}</span>
      <strong>{value === undefined || value === null || value === "" ? "—" : value}</strong>
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

  // Adapt these property names to your API response.
  const packageData = details.package_details || details.package_info || details.package || {};
  const payment = details.payment_details || details.payment || {};
  const customer = details.customer_details || details.customer || {};
  const patient = details.patient_details || details.patient || {};
  const benefits = details.benefits || details.fulfillments || details.package_benefits || [];
  const consultations = details.consultations || details.doctor_consultations || [];
  const usageHistory = details.usage_history || details.benefit_usage_history || [];
  const purchaseHistory = details.purchase_history || details.previous_purchases || [];

  const packageName =
    typeof packageData === "string"
      ? packageData
      : get(packageData, "name", "package_name");

  const patientName =
    typeof patient === "string"
      ? patient
      : get(patient, "name", "patient_name");

  const customerName =
    typeof customer === "string"
      ? customer
      : get(customer, "name", "customer_name", "full_name");

  const doctorUsed = consultations.filter(
    (item) => String(item.status).toLowerCase() === "completed"
  ).length;

  const totalConsultations = benefits.reduce(
    (total, item) =>
      total +
      (Number(item.quantity_allocated ?? item.total_quantity ?? 0)),
    0
  );

  return (
    <div className="cpd-page">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="cpd-header">
        <button className="cpd-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </button>

        <div className="cpd-header-content">
          <div>
            <h2>Package Purchase Details</h2>
            <p>Complete package, payment and fulfillment information</p>
          </div>
          <Status value={get(details, "status", "purchase_status")} />
        </div>
      </div>

      {/* Summary */}
      <div className="cpd-summary">
        <div>
          <span>Package Name</span>
          <h3>{packageName}</h3>
          <small>Purchase ID: {get(details, "id", "purchase_id")}</small>
        </div>

        <div>
          <span>Paid Amount</span>
          <h2>{formatMoney(get(payment, "paid_amount", "amount_paid", "amount") === "—"
            ? get(details, "paid_amount", "amount_paid", "price")
            : get(payment, "paid_amount", "amount_paid", "amount"))}</h2>
        </div>

        <div>
          <span>Package Status</span>
          <Status value={get(details, "status", "purchase_status")} />
        </div>
      </div>

      {/* Package Details */}
      <Section title="Package Details" icon={<FaBox />}>
        <div className="cpd-grid">
          <Info label="Package Name" value={packageName} />
          <Info label="Package ID" value={get(packageData, "id", "package_id")} />
          <Info label="Category" value={get(packageData, "category_name", "category")} />
          <Info label="Description" value={get(packageData, "description")} />
          <Info label="Purchase Type" value={get(packageData, "purchase_type", "type")} />
          <Info label="Billing Mode" value={get(packageData, "billing_mode", "billing_type")} />
          <Info label="Original Price" value={formatMoney(get(packageData, "original_price", "mrp", "price"))} />
          <Info label="Selling Price" value={formatMoney(get(packageData, "selling_price", "discounted_price", "price"))} />
          <Info label="Validity" value={get(packageData, "validity", "validity_days", "duration")} />
          <Info label="Start Date" value={formatDate(get(details, "start_date", "activation_date"))} />
          <Info label="Expiry Date" value={formatDate(get(details, "expiry_date", "expires_at"))} />
          <Info label="Activation Date" value={formatDate(get(details, "activation_date", "activated_at"))} />
        </div>
      </Section>

      {/* Payment */}
      <Section title="Payment Details" icon={<FaCreditCard />}>
        <div className="cpd-grid">
          <Info label="Original Amount" value={formatMoney(get(payment, "original_amount", "original_price", "amount"))} />
          <Info label="Discount" value={formatMoney(get(payment, "discount_amount", "discount"))} />
          <Info label="Paid Amount" value={formatMoney(get(payment, "paid_amount", "amount_paid", "amount"))} />
          <Info label="Payment Status" value={<Status value={get(payment, "status", "payment_status")} />} />
          <Info label="Payment Method" value={get(payment, "payment_method", "method")} />
          <Info label="Razorpay Order ID" value={get(payment, "razorpay_order_id", "order_id")} />
          <Info label="Razorpay Payment ID" value={get(payment, "razorpay_payment_id", "payment_id")} />
          <Info label="Payment Date" value={formatDate(get(payment, "payment_date", "paid_at", "created_at"))} />
          <Info label="Transaction ID" value={get(payment, "transaction_id")} />
          <Info label="Refund Status" value={<Status value={get(payment, "refund_status")} />} />
          <Info label="Refunded Amount" value={formatMoney(get(payment, "refunded_amount", "refund_amount"))} />
        </div>
      </Section>

      {/* Customer */}
      <Section title="Customer & Patient Details" icon={<FaUser />}>
        <div className="cpd-subheading">Customer Information</div>
        <div className="cpd-grid">
          <Info label="Customer Name" value={customerName} />
          <Info label="Customer ID" value={get(customer, "id", "customer_id")} />
          <Info label="Phone Number" value={get(customer, "phone", "phone_number", "mobile")} />
          <Info label="Email" value={get(customer, "email", "email_address")} />
        </div>

        <div className="cpd-subheading">Patient Information</div>
        <div className="cpd-grid">
          <Info label="Patient Name" value={patientName} />
          <Info label="Patient ID" value={get(patient, "id", "patient_id")} />
          <Info label="Relationship" value={get(patient, "relationship", "relation")} />
        </div>
      </Section>

      {/* Benefits */}
      <Section title="Benefit Usage & Fulfillment" icon={<FaGift />}>
        {benefits.length ? (
          <div className="cpd-table-wrap">
            <table className="cpd-table">
              <thead>
                <tr>
                  <th>Benefit</th>
                  <th>Total Allocated</th>
                  <th>Used</th>
                  <th>Remaining</th>
                  <th>Validity</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {benefits.map((benefit, index) => (
                  <tr key={benefit.id || index}>
                    <td>
                      <strong>{get(benefit, "benefit_name", "name", "title")}</strong>
                      <small>{get(benefit, "benefit_id", "id")}</small>
                    </td>
                    <td>{get(benefit, "quantity_allocated", "total_quantity", "quantity")}</td>
                    <td>{get(benefit, "quantity_used", "used_quantity")}</td>
                    <td>{get(benefit, "remaining_quantity", "quantity_remaining")}</td>
                    <td>{get(benefit, "validity", "validity_days")}</td>
                    <td>{formatDate(get(benefit, "expiry_date", "expires_at"))}</td>
                    <td><Status value={get(benefit, "status")} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="cpd-no-data">No benefit details available from API.</div>}
      </Section>

      
      <Section title="Benefit Usage History" icon={<FaHistory />}>
        {usageHistory.length ? (
          <div className="cpd-table-wrap">
            <table className="cpd-table">
              <thead>
                <tr>
                  <th>Benefit</th>
                  <th>Usage ID</th>
                  <th>Quantity Used</th>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {usageHistory.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{get(item, "benefit_name", "benefit")}</td>
                    <td>{get(item, "id", "usage_id")}</td>
                    <td>{get(item, "quantity", "quantity_used")}</td>
                    <td>{formatDate(get(item, "used_at", "created_at", "date"))}</td>
                    <td>{get(item, "reference_id", "appointment_id")}</td>
                    <td><Status value={get(item, "status")} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="cpd-no-data">No usage history available.</div>}
      </Section>

      {/* Shifted Benefits */}
      <Section title="Shifted Benefits" icon={<FaSyncAlt />}>
        {Array.isArray(details.shifted_benefits) && details.shifted_benefits.length ? (
          <div className="cpd-table-wrap">
            <table className="cpd-table">
              <thead>
                <tr>
                  <th>Benefit</th>
                  <th>Previous Package</th>
                  <th>New Package</th>
                  <th>Quantity</th>
                  <th>Shift Date</th>
                </tr>
              </thead>
              <tbody>
                {details.shifted_benefits.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{get(item, "benefit_name")}</td>
                    <td>{get(item, "previous_package_name")}</td>
                    <td>{get(item, "new_package_name")}</td>
                    <td>{get(item, "quantity")}</td>
                    <td>{formatDate(get(item, "shifted_at", "created_at"))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="cpd-no-data">No shifted benefits available.</div>}
      </Section>

      {/* Doctor Consultations */}
      <Section title="Doctor Consultation History" icon={<FaStethoscope />}>
        <div className="cpd-stats">
          <div>
            <span>Total Allocated Consultations</span>
            <strong>{totalConsultations || "—"}</strong>
          </div>
          <div>
            <span>Completed Consultations</span>
            <strong>{doctorUsed}</strong>
          </div>
          <div>
            <span>Remaining Consultations</span>
            <strong>{Math.max(0, totalConsultations - doctorUsed)}</strong>
          </div>
        </div>

        {consultations.length ? (
          <div className="cpd-table-wrap">
            <table className="cpd-table">
              <thead>
                <tr>
                  <th>Doctor Name</th>
                  <th>Doctor ID</th>
                  <th>Appointment ID</th>
                  <th>Consultation Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{get(item, "doctor_name", "doctor")}</td>
                    <td>{get(item, "doctor_id")}</td>
                    <td>{get(item, "appointment_id", "id")}</td>
                    <td>{formatDate(get(item, "consultation_date", "appointment_date"))}</td>
                    <td>{get(item, "consultation_time", "appointment_time")}</td>
                    <td><Status value={get(item, "status", "appointment_status")} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="cpd-no-data">No consultation history available.</div>}
      </Section>

      {/* Purchase History */}
      <Section title="Package Purchase History" icon={<FaCalendarAlt />}>
        <div className="cpd-grid">
          <Info label="Purchase Date" value={formatDate(get(details, "purchase_date", "created_at"))} />
          <Info label="Activation Date" value={formatDate(get(details, "activation_date", "activated_at"))} />
          <Info label="Start Date" value={formatDate(get(details, "start_date"))} />
          <Info label="Expiry Date" value={formatDate(get(details, "expiry_date"))} />
          <Info label="Purchase Status" value={<Status value={get(details, "status", "purchase_status")} />} />
        </div>

        {purchaseHistory.length ? (
          <div className="cpd-table-wrap">
            <table className="cpd-table">
              <thead>
                <tr>
                  <th>Package Name</th>
                  <th>Purchase ID</th>
                  <th>Purchase Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {purchaseHistory.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{get(item, "package_name", "package")}</td>
                    <td>{get(item, "id", "purchase_id")}</td>
                    <td>{formatDate(get(item, "purchase_date", "created_at"))}</td>
                    <td>{formatMoney(get(item, "paid_amount", "amount"))}</td>
                    <td><Status value={get(item, "status")} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="cpd-no-data">No previous purchase history available.</div>}
      </Section>

    </div>
  );
};

export default PackageDetails;
