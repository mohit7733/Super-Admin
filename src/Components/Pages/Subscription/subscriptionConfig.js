export const subscriptionConfig = {
  title: "Manage Subscription Packages",
  permission: "manage_subscription_packages",
  endpoints: {
    list: "/packages/admin/",
    create: "/packages/admin/",
    update: "/packages/admin/",
    remove: "/packages/admin/",
  },
  pageSize: 10,
  idKey: "id",
};

export const COMMERCE_MODES = [
  { label: "Open plan", value: "open_plan" },
  { label: "Prepaid package", value: "prepaid_package" },
];

export const CTA_ACTIONS = [
  { label: "Book consultation", value: "book_consultation" },
  { label: "Purchase package", value: "purchase_package" },
];

export const FULFILLMENT_MODES = [
  { label: "Consumable", value: "consumable" },
  { label: "Chat pool", value: "chat_pool" },
  { label: "Flag", value: "flag" },
  { label: "Rule", value: "rule" },
];

export const BENEFIT_UNITS = [
  { label: "Count", value: "count" },
  { label: "Days", value: "days" },
  { label: "Money", value: "money" },
  { label: "None", value: "none" },
];

export const emptyBenefit = () => ({
  benefit_type: {
    code: "",
    name: "",
    fulfillment_mode: "consumable",
    unit: "count",
  },
  quantity: "",
  metadataText: "{}",
  display_order: 0,
});

export const emptyPackageForm = () => ({
  code: "",
  name: "",
  description: "",
  includes: [""],
  kind: {
    code: "",
    name: "",
    description: "",
    display_order: "",
    is_active: true,
  },
  commerce_mode: "prepaid_package",
  cta_action: "purchase_package",
  list_price: "",
  sale_price: "",
  duration_days: "",
  display_order: "0",
  image_url: "",
  tagsText: "",
  is_active: true,
  benefits: [emptyBenefit()],
});

const asText = (value) => (value === null || value === undefined ? "" : String(value));

export const packageToForm = (item = {}) => {
  const kind = typeof item.kind === "string" ? { code: item.kind } : item.kind || {};
  const includes = Array.isArray(item.includes) && item.includes.length ? item.includes.map(asText) : [""];
  const benefits = Array.isArray(item.benefits) && item.benefits.length
    ? item.benefits.map((benefit, index) => {
        const type = benefit?.benefit_type;
        const benefitType = typeof type === "string" ? { code: type } : type || {};

        return {
          benefit_type: {
            code: asText(benefitType.code),
            name: asText(benefitType.name),
            fulfillment_mode: benefitType.fulfillment_mode || "consumable",
            unit: benefitType.unit || "count",
          },
          quantity: benefit?.quantity === null || benefit?.quantity === undefined ? "" : asText(benefit.quantity),
          metadataText: JSON.stringify(benefit?.metadata || {}, null, 2),
          display_order: benefit?.display_order ?? index,
        };
      })
    : [emptyBenefit()];

  return {
    code: asText(item.code),
    name: asText(item.name),
    description: asText(item.description),
    includes,
    kind: {
      code: asText(kind.code),
      name: asText(kind.name),
      description: asText(kind.description),
      display_order: kind.display_order === null || kind.display_order === undefined ? "" : asText(kind.display_order),
      is_active: kind.is_active !== false,
    },
    commerce_mode: item.commerce_mode || "prepaid_package",
    cta_action: item.cta_action || "purchase_package",
    list_price: asText(item.list_price),
    sale_price: asText(item.sale_price),
    duration_days: item.duration_days === null || item.duration_days === undefined ? "" : asText(item.duration_days),
    display_order: item.display_order === null || item.display_order === undefined ? "0" : asText(item.display_order),
    image_url: asText(item.image_url),
    tagsText: Array.isArray(item.tags) ? item.tags.join(", ") : "",
    is_active: item.is_active !== false,
    benefits,
  };
};

const decimalString = (value) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return "";
  const number = Number(trimmed);
  if (Number.isNaN(number)) return trimmed;
  return number.toFixed(2);
};

export const buildSubscriptionPayload = (form) => {
  const kind = { code: form.kind.code.trim() };

  if (form.kind.name.trim()) {
    kind.name = form.kind.name.trim();
    if (form.kind.description.trim()) kind.description = form.kind.description.trim();
    if (String(form.kind.display_order).trim() !== "") {
      kind.display_order = Number(form.kind.display_order);
    }
    kind.is_active = Boolean(form.kind.is_active);
  }

  const benefits = form.benefits
    .filter((benefit) => benefit.benefit_type.code.trim())
    .map((benefit, index) => {
      const benefitType = { code: benefit.benefit_type.code.trim() };

      if (benefit.benefit_type.name.trim()) {
        benefitType.name = benefit.benefit_type.name.trim();
        benefitType.fulfillment_mode = benefit.benefit_type.fulfillment_mode;
        benefitType.unit = benefit.benefit_type.unit;
      }

      const unit = benefit.benefit_type.unit;
      const quantityText = String(benefit.quantity ?? "").trim();
      let quantity = null;

      if (unit !== "none" && quantityText !== "") {
        quantity = decimalString(quantityText);
      }

      let metadata = {};
      if (benefit.metadataText.trim()) {
        metadata = JSON.parse(benefit.metadataText);
      }

      return {
        benefit_type: benefitType,
        quantity,
        metadata,
        display_order:
          String(benefit.display_order).trim() === "" ? index : Number(benefit.display_order),
      };
    });

  return {
    code: form.code.trim(),
    name: form.name.trim(),
    description: form.description.trim(),
    includes: form.includes.map((item) => item.trim()).filter(Boolean),
    kind,
    commerce_mode: form.commerce_mode,
    cta_action: form.cta_action,
    list_price: decimalString(form.list_price),
    sale_price: decimalString(form.sale_price),
    duration_days: String(form.duration_days).trim() === "" ? null : Number(form.duration_days),
    display_order: String(form.display_order).trim() === "" ? 0 : Number(form.display_order),
    image_url: form.image_url.trim(),
    tags: form.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    is_active: Boolean(form.is_active),
    benefits,
  };
};

export const validateSubscriptionForm = (form) => {
  const errors = {};

  if (!form.code.trim()) errors.code = "Code is required";
  if (!form.name.trim()) errors.name = "Name is required";
  if (!form.kind.code.trim()) errors.kindCode = "Kind code is required";
  if (!String(form.list_price).trim()) errors.list_price = "List price is required";
  if (!String(form.sale_price).trim()) errors.sale_price = "Sale price is required";

  form.benefits.forEach((benefit, index) => {
    const hasAny =
      benefit.benefit_type.code.trim() ||
      benefit.benefit_type.name.trim() ||
      String(benefit.quantity).trim();

    if (!hasAny) return;

    if (!benefit.benefit_type.code.trim()) {
      errors[`benefit_${index}_code`] = "Benefit code is required";
    }

    if (benefit.benefit_type.unit !== "none" && benefit.benefit_type.code.trim() && !String(benefit.quantity).trim()) {
      errors[`benefit_${index}_quantity`] = "Quantity is required for this unit";
    }

    if (benefit.metadataText.trim()) {
      try {
        const parsed = JSON.parse(benefit.metadataText);
        if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
          errors[`benefit_${index}_metadata`] = "Metadata must be a JSON object";
        }
      } catch {
        errors[`benefit_${index}_metadata`] = "Metadata must be valid JSON";
      }
    }
  });

  return errors;
};
