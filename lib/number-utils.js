/**
 * Format a number with comma thousand separators.
 * Used for form inputs that display plain numeric strings (e.g. "1,234,567").
 */
export const formatNumber = (value) => {
  if (value == null) return "";
  const raw = String(value).replace(/\D/g, "");
  if (!raw) return "";
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * Parse a comma-formatted string back to a number.
 * Returns 0 for invalid / empty input.
 */
export const parseNumber = (formattedValue) => {
  const raw = String(formattedValue ?? "").replace(/,/g, "");
  const parsed = parseFloat(raw);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format a number as Canadian-dollar currency (e.g. "$1,234.56").
 */
export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(
    value,
  );

/**
 * Sanitize a money string that may contain $, spaces, or multiple dots.
 * Returns NaN for null / empty input (used for watch-field calculations).
 */
export const sanitizeMoney = (str) => {
  if (str == null) return NaN;
  const cleaned = String(str).replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  const normalized =
    parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
  return normalized ? Number(normalized) : NaN;
};
