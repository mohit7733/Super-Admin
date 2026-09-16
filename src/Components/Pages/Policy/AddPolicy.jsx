import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSave,
  FaTimes,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import BASE_URL from "../../../Base";
import "./AddPolicy.css";

const convertHtmlToPolicyContent = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const content = [];

  Array.from(doc.body.children).forEach((element) => {
    const tag = element.tagName.toLowerCase();
    const text = element.textContent.trim();

    if (!text && tag !== "ul" && tag !== "ol") {
      return;
    }

    if (element.dataset.contentType === "title") {
      content.push({
        text,
        type: "title",
      });
      return;
    }

    if (element.dataset.contentType === "text") {
      content.push({
        text,
        type: "text",
      });
      return;
    }

    if (tag === "h1" || tag === "h2" || tag === "h3") {
      content.push({
        text,
        type: "heading",
      });
      return;
    }

    if (tag === "p") {
      content.push({
        text,
        type: "paragraph",
      });
      return;
    }

    if (tag === "ol" || tag === "ul") {
      const items = Array.from(element.children)
        .filter(
          (child) => child.tagName.toLowerCase() === "li"
        )
        .map((li, index) => ({
          text: li.textContent.trim(),
          marker: `(${String.fromCharCode(97 + index)})`,
        }));

      if (items.length > 0) {
        content.push({
          type: "list",
          items,
        });
      }
    }
  });

  return content;
};



const formatLabel = (key = "") => {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const isPlainObject = (value) => {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
};

const createEmptyValue = (type) => {
  switch (type) {
    case "boolean":
      return false;

    case "number":
      return "";

    case "array":
      return [];

    default:
      return "";
  }
};

const createFieldKey = (name) => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
};

const cloneObject = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};


const DEFAULT_CONFIGURATIONS = {
  doctor_services: {
    consultation: {
      fee: {
        global_fee: "",
      },
      duration_minutes: "",
    },
  },

  cancellation: {
    customer: {
      consultation: {
        free_cancellation_before_minutes: 0,
        rescheduling_enabled: false,
        no_show_refund_eligible: false,
      },

      orders: {
        medicines: {
          prescription: {
            cancellation_allowed_statuses: [],
          },

          otc: {
            cancellation_allowed_statuses: [],
          },
        },

        food: {
          cancellation_allowed_statuses: [],
        },

        skincare: {
          cancellation_allowed_statuses: [],
        },

        certified_utensils: {
          cancellation_allowed_statuses: [],
        },

        cod: {
          cancellation_allowed_statuses: [],
        },
      },

      lab_tests: {
        cancellation_allowed_before: "",
      },

      retreat_bookings: {
        cancellation_terms: "",
      },
    },

    doctor: {
      consultation: {
        cancellation_allowed: false,
      },
    },

    vendor: {
      orders: {
        cancellation_allowed: false,
      },
    },

    admin: {
      fraud_abuse_monitoring_enabled: false,
    },

    system: {
      refund_handled_by: "",
    },
  },
editorial_policy: {
  customer: {
    editorial: {
      content_purpose: "",
      medical_advice_from_editorial_content: false,
      content_grievance_allowed: false
    }
  },

  doctor: {
    editorial: {
      authoring_allowed: false,
      review_allowed: false,
      subject_matter_input_allowed: false,
      competence_based_review: false
    }
  },

  admin: {
    content_review: {
      professional_information_verification: false,
      health_claim_review: false,
      content_review_allowed: false,
      content_correction_allowed: false,
      content_removal_allowed: false,
      content_restriction_allowed: false
    },

    health_claims: {
      fabricated_research_allowed: false,
      false_professional_credentials_allowed: false,
      materially_misleading_health_claims_allowed: false,
      unsupported_absolute_treatment_claims_allowed: false,
      professional_superiority_guarantee_allowed: false,
      health_outcome_guarantee_allowed: false,
      professional_title_support_required: false
    },

    testimonials: {
      genuine_testimonials_allowed: false,
      lawful_obtaining_required: false,
      appropriate_authorisation_required: false,
      scientific_evidence_representation_allowed: false,
      outcome_guarantee_allowed: false
    },

    patient_information: {
      lawful_basis_required: false,
      consent_or_valid_authority_required: false,
      anonymisation_allowed: false
    },

    sponsored_content: {
      allowed: false,
      commercial_content_distinction_required: false,
      false_independent_endorsement_allowed: false,
      health_claim_compliance_required: false
    },

    ai_assistance: {
      allowed: false,
      human_oversight_required: false,
      fabricated_research_as_genuine_evidence_allowed: false,
      fabricated_references_as_genuine_evidence_allowed: false,
      fabricated_quotations_as_genuine_evidence_allowed: false,
      fabricated_medical_information_as_genuine_evidence_allowed: false,
      material_health_claim_human_review_allowed: false
    },

    content_actions: {
      review: false,
      update: false,
      correct: false,
      clarify: false,
      restrict: false,
      remove: false
    }
  },

  system: {
    editorial: {
      medical_diagnosis_from_editorial_content: false,
      prescription_from_editorial_content: false,
      treatment_recommendation_from_editorial_content: false,
      personalised_medical_advice_from_editorial_content: false,
      doctor_patient_relationship_established_by_editorial_content: false
    },

    content_review_triggers: [],

    professional_claims: {
      supporting_information_required: false,
      professional_superiority_guarantee: false,
      health_outcome_guarantee: false
    }
  }
},
  platform_fee: {
    app: {
      flat: "",
      percent: "",
    },

    doctor_dashboard: {
      flat: "",
      percent: "",
    },

    vendor_dashboard: {
      flat: "",
      percent: "",
    },
  },

  serviceability: {
    serviceability: {
      states: [],
      regions: [],
    },
  },

  medical_disclaimer_telemedicine: {
    customer: {
      consultation: {
        modes: [],
        consent_required: false,
        medical_emergency_consultation_allowed: false,
        user_information_accuracy_required: false,
        remote_consultation_acknowledgement_required: false,
        consultation_record_access_allowed: false,
        diet_yoga_plan_modification_allowed: false,
      },

      prescriptions: {
        prescription_transfer_allowed: false,
        prescription_use_by_other_person_allowed: false,
      },
    },

    doctor: {
      consultation: {
        independent_professional_judgment_required: false,
        scope_limited_to_qualifications: false,
        professional_registration_required: false,
        applicable_law_compliance_required: false,
        in_person_referral_allowed: false,
        diagnostic_investigation_referral_allowed: false,
        specialist_referral_allowed: false,
      },

      prescriptions: {
        prescription_allowed_when_legally_permitted: false,
        prescription_user_specific: false,
        prescription_transfer_allowed: false,
      },

      dietician: {
        diagnosis_allowed: false,
        medicine_prescription_allowed: false,
        exceptions: [],
      },
    },

    admin: {
      practitioner_verification: {
        verification_required: false,
        qualification_verification: false,
        registration_verification: false,
        credential_documents_allowed: false,
        certification_verification: false,
        specialisation_verification: false,
        experience_verification: false,
      },

      consultation: {
        appointment_availability_required: false,
        rescheduling_allowed: false,
        technical_issue_resolution_allowed: false,
        practitioner_unavailability_resolution_allowed: false,
      },
    },

    system: {
      consultation: {
        medical_emergency_service: false,
        outcome_guarantee: false,
        diagnosis_guarantee: false,
        treatment_outcome_guarantee: false,
        recovery_time_guarantee: false,
        medicine_effectiveness_guarantee: false,
        wellness_recommendation_outcome_guarantee: false,
        practitioner_availability_guarantee: false,
      },

      prescriptions: {
        legally_permitted_only: false,
        validity_verification_required: false,
        pharmacy_fulfilment_subject_to_verification: false,
      },

      records: {
        consultation_records_enabled: false,
        medical_records_retention_allowed: false,
        record_access_identity_verification: false,
        record_access_security_controls: false,
      },

      privacy: {
        medical_information_access_authorised_users_only: false,
        legitimate_purpose_required: false,
        medical_information_sold: false,
      },

      consultation_limitations: {
        physical_examination_available_remotely: false,
        remote_diagnostic_limitations: false,
        technical_interruption_possible: false,
      },

      policy_routing: {
        cancellation: "",
        refund: "",
        grievance: "",
      },
    },
  },

  "terms_and_conditions": {
  "customer": {
    "account": {
      "registration_required_for_restricted_features": false,
      "accurate_information_required": false,
      "legally_competent_required": false,
      "guardian_access_allowed": false,
      "account_deactivation_allowed": false,
      "account_deletion_allowed": false
    },
    "authentication": {
      "otp_verification_enabled": false,
      "otp_confidentiality_required": false,
      "otp_attempt_limits_enabled": false,
      "reverification_allowed": false,
      "additional_verification_allowed": false
    },
    "account_security": {
      "credential_confidentiality_required": false,
      "unauthorized_account_use_prohibited": false,
      "impersonation_prohibited": false,
      "security_incident_reporting_required": false
    },
    "healthcare": {
      "medical_information_accuracy_required": false,
      "healthcare_professional_independent_judgment": false,
      "medical_outcome_guaranteed": false,
      "emergency_service_provided": false,
      "emergency_care_substitute": false
    },
    "appointments": {
      "booking_subject_to_professional_availability": false,
      "rescheduling_allowed": false,
      "rescheduling_subject_to_availability": false,
      "user_cancellation_allowed": false,
      "doctor_cancellation_allowed": false,
      "platform_cancellation_allowed": false,
      "no_show_policy_applicable": false
    },
    "consultations": {
      "chat_enabled": false,
      "audio_enabled": false,
      "video_enabled": false,
      "recording_or_reproduction_restricted": false,
      "appropriate_conduct_required": false
    },
    "prescriptions": {
      "prescription_issued_by_healthcare_professional": false,
      "prescription_modification_prohibited": false,
      "invalid_prescription_submission_prohibited": false,
      "prescription_sharing_restrictions": false
    },
    "medicines": {
      "prescription_required_where_applicable": false,
      "prescription_verification_required": false,
      "medicine_substitution_subject_to_law": false,
      "order_cancellation_for_invalid_prescription_allowed": false
    },
    "orders": {
      "product_information_review_required": false,
      "returns_subject_to_return_policy": false,
      "cancellations_subject_to_cancellation_policy": false,
      "refunds_subject_to_refund_policy": false
    },
    "payments": {
      "fraudulent_payment_methods_prohibited": false,
      "third_party_payment_processing": false,
      "taxes_applicable": false,
      "cod_refund_verification_required": false
    },
    "fraud_abuse": {
      "false_identity_prohibited": false,
      "impersonation_prohibited": false,
      "forged_prescription_prohibited": false,
      "fraudulent_refund_claims_prohibited": false,
      "false_return_claims_prohibited": false,
      "review_manipulation_prohibited": false,
      "unauthorized_access_prohibited": false,
      "platform_exploitation_prohibited": false
    },
    "user_content": {
      "reviews_allowed": false,
      "truthful_content_required": false,
      "lawful_content_required": false,
      "misleading_content_prohibited": false,
      "abusive_content_prohibited": false,
      "platform_removal_allowed": false
    },
    "communications": {
      "service_communications_allowed": false,
      "promotional_communications_subject_to_consent": false,
      "promotional_opt_out_allowed": false,
      "essential_service_communications_may_continue": false
    }
  },
  "doctor": {
    "onboarding": {
      "identity_verification_required": false,
      "qualification_verification_required": false,
      "registration_verification_required": false,
      "professional_credentials_required": false,
      "kyc_required": false,
      "bank_payment_information_required": false
    },
    "professional_requirements": {
      "valid_registration_required": false,
      "valid_qualification_required": false,
      "professional_licence_requirements_applicable": false,
      "independent_professional_judgment": false,
      "medical_outcome_guaranteed": false
    },
    "consultation": {
      "appointment_availability_subject_to_schedule": false,
      "consultation_refusal_allowed_when_professionally_necessary": false,
      "consultation_discontinuation_allowed_when_professionally_necessary": false,
      "prescription_issuance_allowed_where_legally_permitted": false,
      "follow_up_consultation_subject_to_professional_assessment": false
    },
    "account_status": {
      "approval_required": false,
      "restriction_allowed": false,
      "suspension_allowed": false,
      "reactivation_subject_to_verification": false
    }
  },
  "vendor": {
    "onboarding": {
      "kyc_required": false,
      "business_verification_required": false,
      "bank_verification_required": false,
      "product_verification_required": false
    },
    "operations": {
      "product_information_accuracy_required": false,
      "fulfilment_requirements_applicable": false,
      "regulatory_compliance_required": false,
      "return_refund_obligations_policy_based": false,
      "settlement_adjustments_allowed": false
    },
    "account_status": {
      "approval_required": false,
      "rejection_allowed": false,
      "suspension_allowed": false,
      "restriction_allowed": false,
      "reactivation_allowed": false
    }
  },
  "admin": {
    "account_management": {
      "registration_restriction_allowed": false,
      "additional_verification_allowed": false,
      "account_restriction_allowed": false,
      "account_suspension_allowed": false,
      "account_deactivation_allowed": false,
      "account_reactivation_subject_to_review": false
    },
    "fraud_abuse": {
      "investigation_enabled": false,
      "additional_verification_allowed": false,
      "cod_restriction_allowed": false,
      "refund_restriction_allowed": false,
      "return_restriction_allowed": false,
      "transaction_cancellation_allowed": false,
      "transaction_processing_hold_allowed": false,
      "legal_regulatory_action_allowed": false
    },
    "content_moderation": {
      "review_content_allowed": false,
      "remove_violating_content_allowed": false,
      "restrict_violating_content_allowed": false
    },
    "vendor_management": {
      "vendor_approval_allowed": false,
      "vendor_rejection_allowed": false,
      "vendor_suspension_allowed": false,
      "vendor_reactivation_allowed": false
    },
    "doctor_management": {
      "professional_verification_allowed": false,
      "doctor_approval_allowed": false,
      "doctor_rejection_allowed": false,
      "doctor_restriction_allowed": false,
      "doctor_suspension_allowed": false,
      "doctor_reactivation_allowed": false
    }
  },
  "system": {
    "platform": {
      "service_facilitation_model": false,
      "third_party_service_provider_model": false,
      "continuous_availability_guaranteed": false,
      "error_free_operation_guaranteed": false
    },
    "authentication": {
      "otp_verification_supported": false,
      "otp_attempt_limiting_enabled": false,
      "account_recovery_supported": false,
      "additional_recovery_verification_allowed": false
    },
    "healthcare": {
      "emergency_service": false,
      "medical_outcome_guarantee": false,
      "healthcare_professional_independent": false
    },
    "orders": {
      "medicine_orders_supported": false,
      "wellness_products_supported": false,
      "skincare_products_supported": false,
      "food_products_supported": false,
      "utensils_supported": false,
      "order_cancellation_subject_to_policy": false
    },
    "delivery": {
      "delivery_partner_supported": false,
      "delivery_timelines_indicative": false,
      "delivery_serviceability_required": false,
      "shipping_policy_applies": false
    },
    "payments": {
      "third_party_payment_provider_supported": false,
      "tax_calculation_applicable": false,
      "refund_policy_applies": false,
      "cod_refund_requires_verified_details": false
    },
    "data": {
      "personal_data_processing_subject_to_privacy_policy": false,
      "health_data_processing_subject_to_privacy_policy": false,
      "lawful_retention_allowed": false,
      "legal_disclosure_allowed": false
    },
    "legal": {
      "governing_law": "India",
      "consumer_statutory_rights_preserved": false,
      "grievance_mechanism_available": false,
      "dispute_resolution_required": false,
      "severability_enabled": false,
      "waiver_not_automatic": false,
      "survival_of_applicable_provisions": false
    },
    "policy_relationships": {
      "privacy_policy": false,
      "account_deletion_policy": false,
      "grievance_redressal_policy": false,
      "refund_policy": false,
      "cancellation_policy": false,
      "return_policy": false,
      "shipping_delivery_policy": false,
      "medical_telemedicine_policy": false
    },
    "terms_update": {
      "modification_allowed": false,
      "revised_effective_date_required": false,
      "material_change_communication_when_required": false,
      "continued_use_constitutes_acceptance": false
    }
  }
},

  privacy_policy: {
  
  "customer": {
    "data_collection": {
      "account_information": false,
      "verification_information": false,
      "health_information": false,
      "appointment_information": false,
      "consultation_data": false,
      "prescription_information": false,
      "lab_data": false,
      "order_information": false,
      "payment_information": false,
      "support_information": false
    },
    "authentication": {
      "otp_verification": false,
      "otp_for_advertising": false,
      "account_recovery": false,
      "fraud_prevention": false
    },
    "location": {
      "location_collection": false,
      "permission_required": false
    },
    "rights": {
      "access": false,
      "correction": false,
      "withdraw_consent": false,
      "deletion": false,
      "nomination": false,
      "grievance": false
    },
    "children": {
      "minimum_age_18": false,
      "guardian_required_for_minor": false
    }
  },
  "doctor": {
    "data_collection": {
      "identity_information": false,
      "kyc_information": false,
      "professional_registration": false,
      "qualification_information": false,
      "certificates_and_licenses": false,
      "profile_information": false,
      "consultation_information": false,
      "prescription_records": false,
      "payment_information": false,
      "grievance_information": false,
      "account_status_information": false
    },
    "verification": {
      "professional_verification": false,
      "regulatory_verification": false
    }
  },
  "vendor": {
    "data_collection": {
      "identity_information": false,
      "kyc_information": false,
      "business_information": false,
      "license_information": false,
      "bank_information": false,
      "product_information": false,
      "order_information": false,
      "return_refund_information": false,
      "complaint_information": false,
      "account_status_information": false
    },
    "verification": {
      "vendor_verification": false,
      "business_verification": false
    }
  },
  "admin": {
    "data_access": {
      "need_to_know_access": false,
      "health_data_access": false,
      "consultation_data_access": false,
      "prescription_data_access": false,
      "account_verification_access": false
    },
    "security": {
      "role_based_access": false,
      "authentication_controls": false,
      "security_monitoring": false,
      "security_logging": false,
      "periodic_security_review": false,
      "incident_response": false
    },
    "fraud_abuse": {
      "monitoring_enabled": false,
      "additional_verification": false,
      "transaction_restriction": false,
      "account_suspension": false,
      "account_deactivation": false
    }
  },
  "system": {
    "data_sharing": {
      "healthcare_professionals": false,
      "pharmacy_partners": false,
      "diagnostic_laboratories": false,
      "logistics_partners": false,
      "payment_providers": false,
      "technology_providers": false,
      "verification_sources": false,
      "regulators": false,
      "law_enforcement": false
    },
    "health_data": {
      "sold_to_advertisers": false,
      "sold_to_data_brokers": false,
      "encryption": false,
      "retention_required": false
    },
    "payments": {
      "full_card_details_stored": false,
      "payment_provider_processing": false
    },
    "cookies_analytics": {
      "cookies_enabled": false,
      "sdk_enabled": false,
      "pixels_enabled": false,
      "analytics_enabled": false,
      "advertising_tracking_enabled": false,
      "apple_att_permission_required": false
    },
    "data_retention": {
      "medical_records": false,
      "prescriptions": false,
      "appointment_records": false,
      "kyc_records": false,
      "payment_records": false,
      "tax_records": false,
      "complaint_records": false,
      "fraud_records": false,
      "legal_records": false,
      "secure_deletion": false,
      "anonymization": false
    },
    "account_deletion": {
      "deletion_request_allowed": false,
      "verification_required": false,
      "immediate_deletion": false,
      "retention_after_deletion": false
    },
    "marketing": {
      "marketing_communications": false,
      "consent_required": false,
      "opt_out_available": false
    }
  }

  },
  
  return: {

  "customer": {
    "orders": {
      "prescription_medicines": {
        "return_allowed": false,
        "exceptions": null,
        "report_within_hours": null
      },
      "otc_products": {
        "return_allowed": false,
        "exceptions": null,
        "report_within_hours": null
      },
      "food": {
        "return_allowed": false,
        "exceptions": null,
        "report_within_hours": null
      },
      "skincare": {
        "return_allowed": false,
        "return_within_days": null,
        "required_condition": null,
        "opened_or_used_exceptions": null
      },
      "certified_utensils": {
        "return_allowed": false,
        "return_within_days": null,
        "required_condition": null,
        "used_or_altered_exceptions": null
      }
    }
  },
  "admin": {
    "return": {
      "verification_required": false,
      "physical_inspection_allowed": false,
      "replacement_allowed": false,
      "refund_allowed": false,
      "alternative_verification_allowed": false
    },
    "fraud_abuse": {
      "monitoring_enabled": false,
      "actions": null
    }
  },
  "vendor": {
    "return": {
      "partner_verification_allowed": false,
      "return_pickup_allowed": false
    }
  },
  "system": {
    "refund_handled_by": null,
    "cancellation_handled_by": null,
    "delivery_issues_handled_by": null,
    "return_pickup": {
      "serviceability_dependent": false,
      "partner_dependent": false
    }
  }


  },
  refund: {
   
  "customer": {
    "consultation": {
      "full_refund": {
        "eligibility": null
      },
      "no_show": {
        "refund_eligible": false
      }
    },
    "orders": {
      "medicines": {
        "change_of_mind_refund": false,
        "eligible_reasons": null,
        "replacement_allowed": false
      },
      "food": {
        "change_of_mind_refund": false,
        "report_within_hours": null,
        "eligible_reasons": null
      },
      "skincare": {
        "return_window_days": null,
        "unopened_unused_refund_eligible": false,
        "opened_or_used_refund_eligible": false,
        "opened_or_used_exceptions": null
      },
      "certified_utensils": {
        "return_window_days": null,
        "unused_original_packaging_refund_eligible": false
      }
    },
    "lab_tests": {
      "refund_after_sample_collection": false
    },
    "retreat_bookings": {
      "refund_terms": null
    }
  },
  "admin": {
    "refund": {
      "verification_required": false,
      "partial_refund_allowed": false,
      "initiate_within_business_days": {
        "minimum": null,
        "maximum": null
      }
    },
    "fraud_abuse": {
      "monitoring_enabled": false,
      "actions": null
    }
  },
  "system": {
    "refund_method": null,
    "cod_refund_method": null,
    "third_party_refund_details_allowed": false
  }

  },
 shipping_delivery: {
  admin: {
    support: {
      email: "info@ayurmuni.in",
      in_app_help_and_chat: true,
      unresolved_delivery_complaints_escalate_to:
        "grievance_redressal_policy",
    },

    delivery: {
      express_delivery: {
        same_day_option: {
          available_when_operationally_launched: true,
          charges_displayed_before_confirmation: true,
          estimated_window_displayed_before_confirmation: true,
        },
      },

      standard_delivery: {
        same_day_delivery: {
          available: true,
          conditions: [
            "product_availability",
            "order_confirmation",
            "address_serviceability",
            "applicable_cut_off_time",
            "vendor_or_pharmacy_fulfilment",
            "logistics_availability",
          ],
          guaranteed: false,
          orders_after_cut_off:
            "next_available_delivery_cycle",
        },
      },

      lab_sample_collection: {
        scheduled_service: true,
        report_delivered_digitally: true,
        collection_slot_selected_at_booking: true,
        slot_subject_to_partner_availability: true,
        report_timeline_communicated_at_booking: true,
      },

      prescription_medicines: {
        verification_partner:
          "applicable_pharmacy_partner",
        dispatch_after_verification: true,
        prescription_verification_required: true,
        dispatch_or_delivery_guaranteed_before_verification:
          false,
      },
    },

    expansion: {
      initial_region: "Delhi NCR",
      availability_may_vary_by: [
        "product",
        "service",
        "vendor",
        "pharmacy",
        "laboratory",
        "logistics_partner",
        "delivery_location",
      ],
      additional_regions_may_be_added: true,
      one_product_available_does_not_guarantee_all_products_available:
        true,
    },

    packaging: {
      packaging_by: [
        "vendor",
        "pharmacy",
        "fulfilment_partner",
      ],
      claims_handled_under:
        "refund_cancellation_return_policy",
      report_issue_if_package: [
        "opened",
        "materially_damaged",
        "tampered_with",
        "materially_different_from_order",
      ],
      damaged_or_tampered_report_hours: 48,
      packaging_appropriate_to_product: true,
      user_should_check_package_at_delivery: true,
      medicines_handled_according_to_applicable_requirements:
        true,
    },

    force_majeure: {
      examples: [
        "natural_disasters",
        "severe_weather",
        "traffic_or_transportation_disruptions",
        "strikes_or_labour_disruptions",
        "government_restrictions",
        "public_emergencies",
        "technical_or_telecommunications_failures",
        "vendor_pharmacy_laboratory_disruptions",
        "logistics_partner_disruptions",
        "other_unforeseen_events",
      ],
      minimise_impact_and_resume_fulfilment: true,
      delivery_delay_or_failure_due_to_events_beyond_reasonable_control:
        true,
    },

    delivery_delay: {
      possible_causes: [
        "product_availability",
        "prescription_verification",
        "vendor_or_pharmacy_processing",
        "high_order_volume",
        "weather",
        "traffic",
        "logistics_disruption",
        "technical_issues",
        "government_restrictions",
        "regulatory_requirements",
        "circumstances_beyond_reasonable_control",
      ],
      provide_updated_estimate_or_status: true,
      delay_automatically_entitles_refund: false,
      refund_subject_to_applicable_policy_or_law: true,
    },

    order_tracking: {
      app_path: "Orders > Track Order",
      possible_statuses: [
        "order_received",
        "order_confirmed",
        "order_being_prepared",
        "order_packed",
        "order_dispatched",
        "out_for_delivery",
        "delivered",
      ],
      available_where_supported: true,
      real_time_updates_guaranteed: false,
    },

    failed_delivery: {
      refund_policy:
        "refund_cancellation_return_policy",
      order_cancellation_allowed: true,
      contact_user_for_clarification: true,
      additional_delivery_attempt_allowed: true,
    },

    delivery_charges: {
      charges: {
        amount: 50,
        currency: "INR",
      },
      variation_factors: [
        "delivery_location",
        "order_value",
        "product_category",
        "delivery_speed",
        "vendor_or_fulfilment_partner",
        "promotional_offers",
      ],
      free_delivery_minimum_order_value: 499,
      minimum_order_value_is_applicable: false,
      free_delivery_conditions_may_apply: true,
    },

    order_processing: {
      dispatch_for_delivery: true,
      fulfilment_may_fail_due_to: [
        "product_unavailability",
        "location_not_serviceable",
        "prescription_not_verified",
        "payment_failure",
        "lawful_or_reasonable_fulfilment_constraints",
      ],
      confirm_product_availability: true,
      refund_if_paid_but_not_fulfilled:
        "refund_policy",
      submit_order_to_relevant_partner: true,
      pack_and_handover_to_logistics_partner: true,
      prescription_verification_where_applicable: true,
    },

    delivery_attempts: {
      user_responsible_for: [
        "accurate_delivery_address",
        "complete_delivery_address",
        "appropriate_contact_details",
      ],
      delivery_may_fail_due_to: [
        "incorrect_or_incomplete_address",
        "recipient_unavailable",
        "recipient_unreachable",
        "delivery_location_inaccessible",
        "delivery_or_verification_requirements_not_satisfied",
        "other_delivery_constraints",
      ],
      reasonable_delivery_attempts: true,
      contact_user_for_additional_instructions: true,
      retry_delivery_where_reasonably_practicable: true,
    },

    delivery_disputes: {
      resolution_process:
        "grievance_redressal_policy",
      supported_complaints: [
        "marked_delivered_but_not_received",
        "incorrect_order_received",
        "incomplete_order",
        "product_damaged_during_delivery",
        "package_tampered",
        "incorrect_delivery_attempt",
        "order_not_delivered_within_applicable_window",
      ],
      delivery_status_verification_with_partner:
        true,
    },

    serviceable_areas: {
      initial_region: "Delhi NCR",
      serviceability_factors: [
        "delivery_address",
        "pin_code",
        "product_or_service_availability",
        "vendor_or_pharmacy_service_area",
        "laboratory_service_area",
        "logistics_partner_availability",
        "operational_considerations",
      ],
      serviceability_check_at: [
        "checkout",
        "booking",
      ],
      product_service_availability_may_vary: true,
    },

    third_party_fulfilment: {
      partner_types: [
        "vendors",
        "pharmacies",
        "laboratories",
        "logistics_providers",
        "other_service_providers",
      ],
      third_party_partners_allowed: true,
      information_sharing_subject_to: [
        "privacy_policy",
        "applicable_law",
      ],
      necessary_information_sharing_for_fulfilment:
        true,
      actual_delivery_may_be_performed_by_third_party:
        true,
    },

    delivery_address_change: {
      conditions: [
        "order_not_yet_dispatched",
        "new_address_is_serviceable",
        "vendor_pharmacy_logistics_arrangements_allow_change",
      ],
      change_allowed_after_order: true,
      guaranteed_after_confirmation_or_dispatch:
        false,
    },

    returns_cancellations_refunds: {
      governed_by:
        "refund_cancellation_return_policy",
      applicable_to: [
        "order_cancellation",
        "return_requests",
        "damaged_products",
        "incorrect_products",
        "incomplete_orders",
        "failed_delivery",
        "refund_eligibility",
        "refund_processing",
        "payment_disputes",
      ],
      product_specific_return_conditions_may_apply:
        true,
      approved_returns_may_require_partner_return_instructions:
        true,
    },

    undeliverable_or_restricted_orders: {
      reasons: [
        "location_outside_serviceable_area",
        "product_unavailable",
        "prescription_missing_or_unverified",
        "payment_failure",
        "legal_or_regulatory_restriction",
        "unsafe_or_impracticable_fulfilment",
      ],
      refund_if_payment_received:
        "refund_cancellation_return_policy",
      order_may_be_restricted_rejected_cancelled_or_delayed:
        true,
    },
  },

  system: {
    support: {
      email: "info@ayurmuni.in",
      in_app_help_and_chat: true,
    },

    delivery: {
      express_delivery: {
        show_charges_before_confirmation: true,
        show_estimated_window_before_confirmation:
          true,
        same_day_option_enabled_when_operationally_launched:
          true,
      },

      same_day_delivery: {
        conditions: [
          "product_availability",
          "order_confirmation",
          "serviceability",
          "cut_off_time",
          "vendor_or_pharmacy_fulfilment",
          "logistics_availability",
        ],
        guaranteed: false,
        after_cut_off:
          "next_available_delivery_cycle",
        eligible_categories: [
          "otc_medicine",
          "food",
          "skincare",
          "utensils",
        ],
        available_for_eligible_products: true,
      },

      serviceable_region: "Delhi NCR",

      lab_sample_collection: {
        use_selected_booking_slot: true,
        reports_delivered_digitally: true,
        report_timeline_shown_at_booking: true,
        slot_subject_to_partner_availability: true,
      },

      prescription_medicines: {
        prescription_verification_required: true,
        dispatch_blocked_until_verification: true,
        verification_may_affect_delivery_timeline: true,
      },

      serviceability_check_required: true,
    },

    packaging: {
      damaged_or_tampered_report_hours: 48,
      check_for_opened_or_damaged_or_tampered_package:
        true,
    },

    delivery_delay: {
      automatic_refund_for_delay: false,
      provide_updated_estimate_or_status: true,
    },

    order_tracking: {
      path: "Orders > Track Order",
      possible_statuses: [
        "order_received",
        "order_confirmed",
        "order_being_prepared",
        "order_packed",
        "order_dispatched",
        "out_for_delivery",
        "delivered",
      ],
      real_time_tracking_guaranteed: false,
      show_tracking_where_available: true,
    },

    delivery_charges: {
      charges: {
        amount: 50,
        currency: "INR",
      },
      calculate_based_on: [
        "delivery_location",
        "order_value",
        "product_category",
        "delivery_speed",
        "vendor_or_fulfilment_partner",
        "promotional_offers",
      ],
      free_delivery_minimum_order_value: 499,
      minimum_order_value_is_applicable: false,
    },

    order_processing: {
      check_serviceability: true,
      check_product_availability: true,
      handover_to_logistics_partner: true,
      dispatch_after_fulfilment_checks: true,
      refund_if_paid_but_not_fulfilled: true,
      verify_prescription_when_applicable: true,
      cancel_or_not_fulfil_order_when_required: true,
    },

    delivery_attempts: {
      allow_reasonable_attempts: true,
      allow_user_contact_for_reattempt: true,
      allow_retry_where_reasonably_practicable: true,
    },

    delivery_disputes: {
      allow_delivery_complaint: true,
      verify_delivery_status_with_partner: true,
      escalate_unresolved_complaint_to_grievance:
        true,
    },

    restricted_orders: {
      block_failed_payments: true,
      block_unavailable_products: true,
      block_outside_serviceable_area: true,
      block_unverified_prescriptions: true,
      block_unlawful_or_unsafe_fulfilment: true,
    },

    third_party_fulfilment: {
      enabled: true,
      partner_types: [
        "vendor",
        "pharmacy",
        "laboratory",
        "logistics_provider",
        "service_provider",
      ],
    },

    delivery_address_change: {
      guarantee_after_dispatch: false,
      allow_before_dispatch_when_serviceable: true,
    },
  },
},
grievance_redressal: {
  customer: {
    grievance: {
      allowed: false,
      channels: [
        "in_app",
        "email",
        "post",
      ],
      in_app_path:
        "Profile > Help & Support > Raise a Grievance",
      acknowledgement_within_hours: 24,
      resolution_or_response_within_days: 15,
      additional_information_allowed: false,
      verification_allowed: false,
    },
  },

  admin: {
    grievance: {
      officer: {
        name: "Ms. Anjali",
        designation: "Grievance Officer",
        email: "grievance.redressal@ayurmuni.in",
        phone: "7042370067",

        availability: {
          days: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ],
          start_time: "09:30",
          end_time: "18:30",
        },
      },

      verification_required: false,
      ticket_or_reference_number: false,
      specialised_review_allowed: false,
      interim_status_update_allowed: false,
      urgent_escalation_enabled: false,
      additional_information_allowed: false,
    },

    urgent_grievances: {
      priority_handling: false,

      categories: [
        "adverse_medical_event",
        "unauthorised_access",
        "significant_payment_fraud",
        "immediate_risk",
      ],
    },

    grievance_access: {
      authorised_persons_only: false,
      need_to_know_access: false,
    },

    record_keeping: {
      enabled: false,

      retention_basis: [
        "reasonably_necessary",
        "applicable_law",
      ],
    },

    law_enforcement: {
      nodal_officer: {
        name: "Mrs. Garima",
        designation: "Nodal Officer",
        email: "nodal.officer@ayurmuni.in",
        phone: "7042375200",
      },
    },
  },

  system: {
    grievance: {
      acknowledgement_target_hours: 24,
      resolution_response_target_days: 15,
      verification_enabled: false,
      confidentiality_enabled: false,
      need_to_know_access: false,
    },

    specialised_routing: {
      clinical: false,
      technical: false,
      payment: false,
      delivery: false,
      legal: false,
      data_protection: false,
    },

    policy_routing: {
      refund: "refund_policy",
      return: "return_policy",
      cancellation: "cancellation_policy",
      account_deletion: "account_data_deletion",
    },
  },
},
 account_data_deletion: {
  customer: {
    account: {
      deletion_allowed: false,
      deletion_methods: [],
      in_app_deletion_path: "",
      registered_email_or_mobile_preferred: false,
      partial_data_deletion_allowed: false
    },

    deletion: {
      reversal_period_days: 0,
      restoration_after_reversal_period: false,
      new_account_required_after_final_deletion: false
    }
  },

  admin: {
    deletion: {
      identity_verification_required: false,
      account_ownership_verification_allowed: false,
      additional_authentication_allowed: false,
      unverified_request_action: "",
      completion_confirmation_allowed: false
    },

    partial_deletion: {
      verification_required: false,
      lawful_retention_override: false
    }
  },

  system: {
    deletion: {
      pending_period_days: 0,
      deletable_data_deletion_after_final_days: 0,
      deletion_method: [],
      backup_deletion_immediate: false
    },

    retention: {
      medical_records: false,
      consultation_records: false,
      appointment_service_records: false,
      order_payment_records: false,
      kyc_verification_records: false,
      grievance_dispute_records: false,
      fraud_security_records: false,
      legal_regulatory_records: false,
      retention_basis: []
    },

    account: {
      uninstalling_app_deletes_account: false,
      final_deletion_reversible: false
    }
  }
},
  gst: {
  app: {
    doctor_consultation: {
      flat: "",
      percent: "",
    },
  },
},
};


const DynamicConfiguration = ({
  value,
  path = "",
  onChange,
  onDelete,
  depth = 0,
}) => {
  if (!isPlainObject(value)) {
    return null;
  }

  const entries = Object.entries(value);

  return (
    <div
      className={`dynamic-config-level ${
        depth > 0 ? "nested-level" : ""
      }`}
    >
      {entries.map(([key, fieldValue]) => {
        const currentPath = path
          ? `${path}.${key}`
          : key;

        /* ---------------------------------------------
           OBJECT
        --------------------------------------------- */

        if (isPlainObject(fieldValue)) {
          return (
            <div
              className="dynamic-config-section"
              key={currentPath}
            >
              <div className="dynamic-config-section-header">
                <div>
                  <h4>{formatLabel(key)}</h4>

                  {depth === 0 && (
                    <span>
                      Configuration section
                    </span>
                  )}
                </div>

                {onDelete && (
                  <button
                    type="button"
                    className="dynamic-delete-btn"
                    onClick={() =>
                      onDelete(currentPath)
                    }
                    title="Delete section"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <DynamicConfiguration
                value={fieldValue}
                path={currentPath}
                onChange={onChange}
                onDelete={onDelete}
                depth={depth + 1}
              />

              <AddFieldButton
                parentPath={currentPath}
                onChange={onChange}
              />
            </div>
          );
        }

        /* ---------------------------------------------
           BOOLEAN
        --------------------------------------------- */

        if (typeof fieldValue === "boolean") {
          return (
            <div
              className="dynamic-config-field-row"
              key={currentPath}
            >
              <div className="dynamic-field-info">
                <label>{formatLabel(key)}</label>
                <span>Boolean setting</span>
              </div>

              <div className="dynamic-field-actions">
                <label className="dynamic-switch">
                  <input
                    type="checkbox"
                    checked={fieldValue}
                    onChange={(e) =>
                      onChange(
                        currentPath,
                        e.target.checked
                      )
                    }
                  />

                  <span className="dynamic-slider"></span>
                </label>

                {onDelete && (
                  <button
                    type="button"
                    className="dynamic-inline-delete"
                    onClick={() =>
                      onDelete(currentPath)
                    }
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          );
        }

        /* ---------------------------------------------
           NUMBER
        --------------------------------------------- */

        if (typeof fieldValue === "number") {
          return (
            <div
              className="dynamic-config-field"
              key={currentPath}
            >
              <div className="dynamic-field-label-row">
                <label>{formatLabel(key)}</label>

                {onDelete && (
                  <button
                    type="button"
                    className="dynamic-inline-delete"
                    onClick={() =>
                      onDelete(currentPath)
                    }
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <input
                type="number"
                value={fieldValue}
                placeholder={`Enter ${formatLabel(
                  key
                ).toLowerCase()}`}
                onChange={(e) => {
                  const value =
                    e.target.value === ""
                      ? ""
                      : Number(e.target.value);

                  onChange(currentPath, value);
                }}
              />
            </div>
          );
        }

        /* ---------------------------------------------
           ARRAY
        --------------------------------------------- */

        if (Array.isArray(fieldValue)) {
          return (
            <div
              className="dynamic-config-field"
              key={currentPath}
            >
              <div className="dynamic-field-label-row">
                <div>
                  <label>{formatLabel(key)}</label>
                  <small>
                    Enter values separated by commas
                  </small>
                </div>

                {onDelete && (
                  <button
                    type="button"
                    className="dynamic-inline-delete"
                    onClick={() =>
                      onDelete(currentPath)
                    }
                  >
                    <FaTrash />
                  </button>
                )}
              </div>

              <input
                type="text"
                value={fieldValue.join(", ")}
                placeholder={`Enter ${formatLabel(
                  key
                ).toLowerCase()}`}
                onChange={(e) => {
                  const values = e.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);

                  onChange(currentPath, values);
                }}
              />

              {fieldValue.length > 0 && (
                <div className="dynamic-tags">
                  {fieldValue.map((item, index) => (
                    <span
                      className="dynamic-tag"
                      key={`${item}-${index}`}
                    >
                      {formatLabel(item)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        }

        /* ---------------------------------------------
           STRING
        --------------------------------------------- */

        return (
          <div
            className="dynamic-config-field"
            key={currentPath}
          >
            <div className="dynamic-field-label-row">
              <label>{formatLabel(key)}</label>

              {onDelete && (
                <button
                  type="button"
                  className="dynamic-inline-delete"
                  onClick={() =>
                    onDelete(currentPath)
                  }
                >
                  <FaTrash />
                </button>
              )}
            </div>

            <input
              type="text"
              value={fieldValue ?? ""}
              placeholder={`Enter ${formatLabel(
                key
              ).toLowerCase()}`}
              onChange={(e) =>
                onChange(
                  currentPath,
                  e.target.value
                )
              }
            />
          </div>
        );
      })}
    </div>
  );
};


const AddFieldButton = ({
  parentPath,
  onChange,
}) => {
  const [showForm, setShowForm] = useState(false);

  const [fieldData, setFieldData] = useState({
    name: "",
    type: "string",
    value: "",
  });

  const reset = () => {
    setFieldData({
      name: "",
      type: "string",
      value: "",
    });

    setShowForm(false);
  };

 const handleAdd = () => {
  const fieldKey = createFieldKey(fieldData.name);

  if (!fieldKey) {
    toast.error("Please enter field name");
    return;
  }

  let value;

  if (fieldData.type === "boolean") {
    value = Boolean(fieldData.value);
  } else if (fieldData.type === "number") {
    value =
      fieldData.value === ""
        ? ""
        : Number(fieldData.value);
  } else if (fieldData.type === "array") {
    value = fieldData.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  } else {
    value = fieldData.value;
  }

  onChange(
    parentPath
      ? `${parentPath}.${fieldKey}`
      : fieldKey,
    value,
    true
  );

  reset();
};
  return (
    <div className="dynamic-add-field-wrapper">
      {!showForm ? (
        <button
          type="button"
          className="dynamic-add-field-btn"
          onClick={() => setShowForm(true)}
        >
          <FaPlus />
          Add Field
        </button>
      ) : (
        <div className="dynamic-add-field-form">
          <div className="dynamic-add-field-header">
            <div>
              <strong>Add Configuration Field</strong>
              <span>
                Add a new setting inside this section.
              </span>
            </div>

            <button
              type="button"
              onClick={reset}
              className="dynamic-close-btn"
            >
              <FaTimes />
            </button>
          </div>

          <div className="dynamic-add-field-grid">
            <div>
              <label>Field Name</label>

              <input
                type="text"
                value={fieldData.name}
                onChange={(e) =>
                  setFieldData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="e.g. Follow Up Fee"
              />
            </div>

            <div>
              <label>Field Type</label>

              <select
                value={fieldData.type}
                onChange={(e) =>
                  setFieldData((prev) => ({
                    ...prev,
                    type: e.target.value,
                    value: "",
                  }))
                }
              >
                <option value="string">
                  Text
                </option>

                <option value="number">
                  Number
                </option>

                <option value="boolean">
                  Toggle
                </option>

                <option value="array">
                  Multiple Values
                </option>
              </select>
            </div>
          </div>

          {fieldData.type === "string" && (
            <div>
              <label>Value</label>

              <input
                type="text"
                value={fieldData.value}
                onChange={(e) =>
                  setFieldData((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                placeholder="Enter value"
              />
            </div>
          )}

          {fieldData.type === "number" && (
            <div>
              <label>Value</label>

              <input
                type="number"
                value={fieldData.value}
                onChange={(e) =>
                  setFieldData((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                placeholder="Enter number"
              />
            </div>
          )}

          {fieldData.type === "boolean" && (
            <div className="dynamic-add-toggle">
              <label>Default Value</label>

              <label className="dynamic-switch">
                <input
                  type="checkbox"
                  checked={Boolean(
                    fieldData.value
                  )}
                  onChange={(e) =>
                    setFieldData((prev) => ({
                      ...prev,
                      value: e.target.checked,
                    }))
                  }
                />

                <span className="dynamic-slider"></span>
              </label>
            </div>
          )}

          {fieldData.type === "array" && (
            <div>
              <label>Values</label>

              <input
                type="text"
                value={fieldData.value}
                onChange={(e) =>
                  setFieldData((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                placeholder="e.g. Audio, Video, Chat"
              />
            </div>
          )}

          <div className="dynamic-add-field-actions">
            <button
              type="button"
              className="dynamic-secondary-btn"
              onClick={reset}
            >
              Cancel
            </button>

            <button
              type="button"
              className="dynamic-primary-btn"
              onClick={handleAdd}
            >
              <FaPlus />
              Add Field
            </button>
          </div>
        </div>
      )}
    </div>
  );
};




const CreatePolicy = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    policy_type: "",
    title: "",
    subtitle: "",
    is_mandatory: false,
    target_roles: [],
    document_url: "",
    content: [],
    configuration: {},
  });
  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] =
    useState(false);

 
  const policyTypeGroups = [
    {
      category: "Legal",
      options: [
    
        {
          value: "terms_and_conditions",
          label: "Terms and Conditions",
        },

        {
          value: "privacy_policy",
          label: "Privacy Policy",
        },
            {
    value: "cancellation",
    label: "Cancellation Policy"
  },

  {
    value: "editorial_policy",
    label: "Editorial Policy"
  },

     

        {
          value: "return",
          label: "Return Policy",
        },

        {
          value: "refund",
          label: "Refund Policy",
        },

        {
          value: "shipping_delivery",
          label: "Shipping & Delivery Policy",
        },


        {
          value: "grievance_redressal",
          label: "Grievance Redressal Policy",
        },
        {
          value: "account_data_deletion",
          label: "Account Data Deletion",
        },

        {
          value: "medical_disclaimer_telemedicine",
          label:
            "Medical Disclaimer & Telemedicine",
        },
      ],
    },

    {
      category: "Operational",
      options: [
        {
          value: "doctor_services",
          label: "Doctor Services",
        },
        {
          value: "platform_fee",
          label: "Platform Fee",
        },
        {
          value: "gst",
          label: "GST",
        },
      ],
    },

    {
      category: "System",
      options: [
        {
          value: "serviceability",
          label: "Serviceability",
        },
      ],
    },
  ];

  const roles = [
    {
      value: "customer",
      label: "Customer",
    },
    {
      value: "doctor",
      label: "Doctor",
    },
    {
      value: "vendor",
      label: "Vendor",
    },
    {
      value: "admin",
      label: "Admin",
    },
    {
      value: "system",
      label: "System",
    },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],

    content: "",

   
   onUpdate: ({ editor }) => {
  const html = editor.getHTML();

  const structuredContent =
    convertHtmlToPolicyContent(html);

  setFormData((prev) => ({
    ...prev,
    content: structuredContent,
  }));

  setErrors((prev) => {
    const updatedErrors = { ...prev };

    const hasContent = structuredContent.some((item) => {
      if (!item) return false;

      if (item.type === "list") {
        return (
          Array.isArray(item.items) &&
          item.items.some(
            (listItem) =>
              listItem?.text?.trim()
          )
        );
      }

      return Boolean(item.text?.trim());
    });

    if (hasContent) {
      delete updatedErrors.content;
    }

    return updatedErrors;
  });
},
  });

  


const handlePolicyTypeChange = (e) => {
  const policyType = e.target.value;

  const selectedConfiguration =
    DEFAULT_CONFIGURATIONS[policyType];

  setFormData((prev) => ({
    ...prev,
    policy_type: policyType,
    configuration: selectedConfiguration
      ? cloneObject(selectedConfiguration)
      : {},
  }));

  setErrors((prev) => {
    const updatedErrors = { ...prev };

    if (policyType) {
      delete updatedErrors.policy_type;
    } else {
      updatedErrors.policy_type =
        "Please select policy type";
    }

    return updatedErrors;
  });
};



  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  // Validate field while typing
  setErrors((prev) => {
    const updatedErrors = { ...prev };

    if (name === "title") {
      const trimmedValue = value.trim();

      if (!trimmedValue) {
        updatedErrors.title = "Please enter policy title";
      } else if (trimmedValue.length < 3) {
        updatedErrors.title =
          "Policy title must be at least 3 characters";
      } else if (trimmedValue.length > 200) {
        updatedErrors.title =
          "Policy title cannot exceed 200 characters";
      } else {
        delete updatedErrors.title;
      }
    }

    if (name === "subtitle") {
      const trimmedValue = value.trim();

      if (!trimmedValue) {
        updatedErrors.subtitle =
          "Please enter policy subtitle";
      } else if (trimmedValue.length < 5) {
        updatedErrors.subtitle =
          "Policy subtitle must be at least 5 characters";
      } else if (trimmedValue.length > 500) {
        updatedErrors.subtitle =
          "Policy subtitle cannot exceed 500 characters";
      } else {
        delete updatedErrors.subtitle;
      }
    }

    return updatedErrors;
  });
};


 const handleRoleToggle = (role) => {
  setFormData((prev) => {
    const exists =
      prev.target_roles.includes(role);

    return {
      ...prev,
      target_roles: exists
        ? prev.target_roles.filter(
            (item) => item !== role
          )
        : [...prev.target_roles, role],
    };
  });

  setErrors((prev) => {
    const updatedErrors = { ...prev };

    const isSelected =
      formData.target_roles.includes(role);

    if (
      isSelected &&
      formData.target_roles.length === 1
    ) {
      updatedErrors.target_roles =
        "Please select at least one target role";
    } else {
      delete updatedErrors.target_roles;
    }

    return updatedErrors;
  });
};

  const removeRole = (role) => {
    setFormData((prev) => ({
      ...prev,
      target_roles:
        prev.target_roles.filter(
          (item) => item !== role
        ),
    }));
  };



  const getNestedValue = (object, path) => {
    return path
      .split(".")
      .reduce(
        (current, key) =>
          current?.[key],
        object
      );
  };

  
  const setNestedValue = (
    object,
    path,
    value
  ) => {
    const keys = path.split(".");
    const result = cloneObject(object);

    let current = result;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = value;
      } else {
        if (
          !current[key] ||
          typeof current[key] !== "object"
        ) {
          current[key] = {};
        }

        current = current[key];
      }
    });

    return result;
  };

  

  const deleteNestedValue = (
    object,
    path
  ) => {
    const keys = path.split(".");
    const result = cloneObject(object);

    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current?.[keys[i]];

      if (!current) {
        return result;
      }
    }

    delete current[
      keys[keys.length - 1]
    ];

    return result;
  };

 

  const handleConfigurationChange = (
    path,
    value,
    isNewField = false
  ) => {
    setFormData((prev) => {
      const updated =
        setNestedValue(
          prev.configuration,
          path,
          value
        );

      return {
        ...prev,
        configuration: updated,
      };
    });
  };

 

  const handleConfigurationDelete = (
    path
  ) => {
    setFormData((prev) => ({
      ...prev,
      configuration:
        deleteNestedValue(
          prev.configuration,
          path
        ),
    }));
  };

 

  const [showSectionForm, setShowSectionForm] =
    useState(false);

  const [newSectionName, setNewSectionName] =
    useState("");

  const handleAddSection = () => {
    const key = createFieldKey(
      newSectionName
    );

    if (!key) {
      toast.error(
        "Please enter section name"
      );
      return;
    }

    if (
      formData.configuration?.[key]
    ) {
      toast.error(
        "This section already exists"
      );
      return;
    }

    setFormData((prev) => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [key]: {},
      },
    }));

    setNewSectionName("");
    setShowSectionForm(false);
  };

  const validateForm = () => {
  const newErrors = {};

  if (!formData.policy_type) {
    newErrors.policy_type = "Please select policy type";
  }

  if (!formData.title?.trim()) {
    newErrors.title = "Please enter policy title";
  } else if (formData.title.trim().length < 3) {
    newErrors.title = "Policy title must be at least 3 characters";
  } else if (formData.title.trim().length > 200) {
    newErrors.title = "Policy title cannot exceed 200 characters";
  }

  if (!formData.subtitle?.trim()) {
    newErrors.subtitle = "Please enter policy subtitle";
  } else if (formData.subtitle.trim().length < 5) {
    newErrors.subtitle =
      "Policy subtitle must be at least 5 characters";
  } else if (formData.subtitle.trim().length > 500) {
    newErrors.subtitle =
      "Policy subtitle cannot exceed 500 characters";
  }

  if (
    !Array.isArray(formData.target_roles) ||
    formData.target_roles.length === 0
  ) {
    newErrors.target_roles = "Please select at least one target role";
  }

  if (
    !Array.isArray(formData.content) ||
    formData.content.length === 0
  ) {
    newErrors.content = "Please enter policy content";
  } else {
    const hasValidContent = formData.content.some((item) => {
      if (!item) return false;

      if (item.type === "list") {
        return (
          Array.isArray(item.items) &&
          item.items.some((listItem) => listItem?.text?.trim())
        );
      }

      return Boolean(item.text?.trim());
    });

    if (!hasValidContent) {
      newErrors.content = "Please enter valid policy content";
    }
  }

  
  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const token =
      sessionStorage.getItem(
        "superadmin_token"
      );

    if (!token) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        policy_type:
          formData.policy_type,

        title:
          formData.title.trim(),

        subtitle:
          formData.subtitle.trim(),

        is_mandatory:
          formData.is_mandatory,

        target_roles:
          formData.target_roles,

        content:
          formData.content,

        configuration:
          formData.configuration,
      };

      if (
        formData.document_url.trim()
      ) {
        payload.document_urls = [
          formData.document_url.trim(),
        ];
      }

      console.log(
        "CREATE POLICY PAYLOAD:",
        payload
      );

      const response = await fetch(
        `${BASE_URL}/policies/admin/legal/`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type":
              "application/json",
            Accept: "application/json",
            "ngrok-skip-browser-warning":
              "true",
          },

          body: JSON.stringify(payload),
        }
      );

      const data =
        await response.json();

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        sessionStorage.removeItem(
          "superadmin_token"
        );

        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to create policy"
        );
      }

      toast.success(
        "Policy created successfully"
      );

      navigate("/LegalPolicies");
    } catch (error) {
      console.error(
        "Create policy error:",
        error
      );

      toast.error(
        error.message ||
          "Something went wrong"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

 

  return (
    <div className="policy-create-page">

     

      <div className="policy-create-header">
        <div className="policy-header-left">
          <button
            type="button"
            className="policy-back-btn"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>

          <div>
            <h2>Create Policy</h2>

            <p>
              Create and publish a legal policy
              for your platform users.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>

     

        <div className="policy-card">

          <div className="policy-card-header">
            <div>
              <h3>
                Policy Information
              </h3>

              <p>
                Define the basic information
                and visibility of this policy.
              </p>
            </div>
          </div>

          <div className="policy-form-grid">

            {/* POLICY TYPE */}

            <div className="policy-field">
              <label>
                Policy Type{" "}
                <span>*</span>
              </label>

              <select
                name="policy_type"
                value={
                  formData.policy_type
                }
                onChange={
                  handlePolicyTypeChange
                }
              >
                <option value="">
                  Select policy type
                </option>

                {policyTypeGroups.map(
                  (group) => (
                    <optgroup
                      key={
                        group.category
                      }
                      label={
                        group.category
                      }
                    >
                      {group.options.map(
                        (policy) => (
                          <option
                            key={
                              policy.value
                            }
                            value={
                              policy.value
                            }
                          >
                            {policy.label}
                          </option>
                        )
                      )}
                    </optgroup>
                  )
                )}
              </select>
               {errors.policy_type && (
    <span className="field-error">
      {errors.policy_type}
    </span>
  )}
            </div>

            

            <div className="policy-field">
              <label>
                Policy Title{" "}
                <span>*</span>
              </label>

              <input
                type="text"
                name="title"
                value={
                  formData.title
                }
                onChange={handleChange}
                placeholder="e.g. Privacy Policy"
              />
               {errors.title && (
    <span className="field-error">
      {errors.title}
    </span>
  )}
            </div>

     

            <div className="policy-field policy-full-width">
  <label>
    Subtitle <span>*</span>
  </label>

  <input
    type="text"
    name="subtitle"
    value={formData.subtitle}
    onChange={handleChange}
    placeholder="Brief description of this policy"
    className={
      errors.subtitle
        ? "policy-input-error"
        : ""
    }
  />

  {errors.subtitle && (
    <span className="field-error">
      {errors.subtitle}
    </span>
  )}

 
</div>
          </div>

         

          <div className="policy-setting-row">
            <div>
              <h4>
                Mandatory Policy
              </h4>

              <p>
                Users must acknowledge this
                policy when applicable.
              </p>
            </div>

            <label className="policy-switch">
              <input
                type="checkbox"
                checked={
                  formData.is_mandatory
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_mandatory:
                      e.target.checked,
                  }))
                }
              />

              <span className="policy-slider"></span>
            </label>
          </div>

          {/* TARGET ROLES */}

          <div className="policy-role-section">
            <label>
              Target Roles{" "}
              <span>*</span>
            </label>

            <p className="policy-field-description">
              Select the users or system roles
              this policy applies to.
            </p>

            <div className="policy-role-options">
              {roles.map((role) => {
                const selected =
                  formData.target_roles.includes(
                    role.value
                  );

                return (
                  <button
                    type="button"
                    key={role.value}
                    className={`policy-role-option ${
                      selected
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleRoleToggle(
                        role.value
                      )
                    }
                  >
                    {selected && (
                      <span>✓</span>
                    )}

                    {role.label}
                  </button>
                  
                );
              })}
            </div>
            {errors.target_roles && (
  <span className="field-error">
    {errors.target_roles}
  </span>
)}

            {formData.target_roles.length >
              0 && (
              <div className="policy-selected-roles">
                {formData.target_roles.map(
                  (role) => {
                    const roleData =
                      roles.find(
                        (item) =>
                          item.value ===
                          role
                      );

                    return (
                      <div
                        className="policy-role-chip"
                        key={role}
                      >
                        {
                          roleData?.label
                        }

                        <button
                          type="button"
                          onClick={() =>
                            removeRole(
                              role
                            )
                          }
                        >
                          <FaTimes />
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </div>

     
        <div className="policy-card">

          <div className="policy-card-header">
            <div>
              <h3>
                Policy Content
              </h3>

              <p>
                Enter the complete legal
                content of the policy.
              </p>
            </div>


            <span className="policy-required-badge">
              Required
            </span>
            
          </div>

          <div className="policy-rich-editor">

            <div className="policy-editor-toolbar">

              <button
                type="button"
                className={
                  editor?.isActive(
                    "bold"
                  )
                    ? "active"
                    : ""
                }
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .toggleBold()
                    .run()
                }
              >
                <strong>B</strong>
              </button>

              <button
                type="button"
                className={
                  editor?.isActive(
                    "italic"
                  )
                    ? "active"
                    : ""
                }
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .toggleItalic()
                    .run()
                }
              >
                <em>I</em>
              </button>

              <button
                type="button"
                className={
                  editor?.isActive(
                    "underline"
                  )
                    ? "active"
                    : ""
                }
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .toggleUnderline()
                    .run()
                }
              >
                <u>U</u>
              </button>

              <span className="policy-toolbar-divider" />

              <button
                type="button"
                className={
                  editor?.isActive(
                    "heading",
                    { level: 2 }
                  )
                    ? "active"
                    : ""
                }
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .toggleHeading({
                      level: 2,
                    })
                    .run()
                }
              >
                H2
              </button>

              <button
                type="button"
                className={
                  editor?.isActive(
                    "heading",
                    { level: 3 }
                  )
                    ? "active"
                    : ""
                }
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .toggleHeading({
                      level: 3,
                    })
                    .run()
                }
              >
                H3
              </button>

              <span className="policy-toolbar-divider" />

              <button
                type="button"
                className={
                  editor?.isActive(
                    "bulletList"
                  )
                    ? "active"
                    : ""
                }
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .toggleBulletList()
                    .run()
                }
              >
                • List
              </button>

              <button
                type="button"
                className={
                  editor?.isActive(
                    "orderedList"
                  )
                    ? "active"
                    : ""
                }
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .toggleOrderedList()
                    .run()
                }
              >
                1. List
              </button>

              <span className="policy-toolbar-divider" />

              <button
                type="button"
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .setTextAlign("left")
                    .run()
                }
              >
                Left
              </button>

              <button
                type="button"
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .setTextAlign("center")
                    .run()
                }
              >
                Center
              </button>

              <span className="policy-toolbar-divider" />

              <button
                type="button"
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .undo()
                    .run()
                }
              >
                ↶
              </button>

              <button
                type="button"
                onClick={() =>
                  editor
                    ?.chain()
                    .focus()
                    .redo()
                    .run()
                }
              >
                ↷
              </button>
            </div>

            <EditorContent editor={editor} />
          </div>
          {errors.content && (
  <span className="field-error policy-content-error">
    {errors.content}
  </span>
)}
         
        </div>

      

        <div className="policy-card">

          <div className="policy-card-header">

            <div>
              <h3>
                Configuration
              </h3>

              <p>
                Configure policy-specific rules,
                limits and operational settings.
              </p>
            </div>

            {formData.policy_type && (
              <span className="configuration-policy-badge">
                {
                  policyTypeGroups
                    .flatMap(
                      (group) =>
                        group.options
                    )
                    .find(
                      (item) =>
                        item.value ===
                        formData.policy_type
                    )?.label
                }
              </span>
            )}
          </div>

          {!formData.policy_type ? (
            <div className="configuration-empty">
              <div className="configuration-empty-icon">
                ⚙
              </div>

              <h4>
                Select a Policy Type
              </h4>

              <p>
                Select a policy type above to
                configure its settings.
              </p>
            </div>
          ) : (
            <>
              {Object.keys(
                formData.configuration
              ).length === 0 ? (
                <div className="configuration-empty">

                  <div className="configuration-empty-icon">
                    ⚙
                  </div>

                  <h4>
                    No Configuration Added
                  </h4>

                  <p>
                    Add a section and configure
                    policy-specific settings.
                  </p>
                </div>
              ) : (
                <DynamicConfiguration
                  value={
                    formData.configuration
                  }
                  onChange={
                    handleConfigurationChange
                  }
                  onDelete={
                    handleConfigurationDelete
                  }
                />
              )}

              {/* ADD ROOT SECTION */}

              {!showSectionForm ? (
                <button
                  type="button"
                  className="dynamic-add-section-btn"
                  onClick={() =>
                    setShowSectionForm(
                      true
                    )
                  }
                >
                  <FaPlus />
                  Add Section
                </button>
              ) : (
                <div className="dynamic-root-section-form">

                  <div>
                    <label>
                      Section Name
                    </label>

                    <input
                      type="text"
                      value={
                        newSectionName
                      }
                      onChange={(e) =>
                        setNewSectionName(
                          e.target.value
                        )
                      }
                      placeholder="e.g. Follow Up"
                    />
                  </div>

                  <div className="dynamic-root-actions">

                    <button
                      type="button"
                      className="dynamic-secondary-btn"
                      onClick={() => {
                        setShowSectionForm(
                          false
                        );
                        setNewSectionName(
                          ""
                        );
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="dynamic-primary-btn"
                      onClick={
                        handleAddSection
                      }
                    >
                      <FaPlus />
                      Add Section
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

     

        <div className="policy-form-actions">

          <button
            type="button"
            className="policy-cancel-btn"
            onClick={() =>
              navigate(-1)
            }
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="policy-save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="policy-spinner"></span>
                Creating...
              </>
            ) : (
              <>
                <FaSave />
                Create Policy
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreatePolicy;