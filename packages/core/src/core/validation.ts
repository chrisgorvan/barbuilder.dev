import type { ValidationResult, StyleName, ProgressType } from "./types.js";

// Valid style names
const VALID_STYLES: StyleName[] = [
  "classic",
  "pill",
  "minimal",
  "badge",
  "segments",
];

// Valid progress types
const VALID_TYPES: ProgressType[] = ["percentage", "xofy", "icon"];

// Validate percentage value (0-100)
export function validatePercentage(value: string): ValidationResult {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return {
      valid: false,
      error: `Invalid percentage value '${value}' (must be number)`,
    };
  }

  if (num < 0 || num > 100) {
    return {
      valid: false,
      error: `Invalid percentage value '${num}' (must be 0-100)`,
    };
  }

  return { valid: true };
}

// Validate integer within range
export function validateInteger(
  value: string,
  min: number,
  max: number,
  name: string,
): ValidationResult {
  const num = parseInt(value, 10);

  if (isNaN(num)) {
    return {
      valid: false,
      error: `Invalid ${name} value '${value}' (must be integer)`,
    };
  }

  if (num < min) {
    return {
      valid: false,
      error: `Invalid ${name} value '${num}' (must be ≥ ${min})`,
    };
  }

  if (num > max) {
    return {
      valid: false,
      error: `Invalid ${name} value '${num}' (must be ≤ ${max})`,
    };
  }

  return { valid: true };
}

// Validate decimal number within range (for icon current values)
export function validateDecimal(
  value: string,
  min: number,
  max: number,
  name: string,
): ValidationResult {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return {
      valid: false,
      error: `Invalid ${name} value '${value}' (must be number)`,
    };
  }

  if (num < min || num > max) {
    return {
      valid: false,
      error: `Invalid ${name} value '${num}' (must be ${min}-${max})`,
    };
  }

  return { valid: true };
}

// Validate style name
export function validateStyle(style: string): ValidationResult {
  if (!VALID_STYLES.includes(style as StyleName)) {
    return {
      valid: false,
      error: `Unknown style '${style}' (valid: ${VALID_STYLES.join(", ")})`,
    };
  }

  return { valid: true };
}

// Validate progress type
export function validateProgressType(type: string): ValidationResult {
  if (!VALID_TYPES.includes(type as ProgressType)) {
    return {
      valid: false,
      error: `Unknown progress type '${type}' (valid: ${VALID_TYPES.join(", ")})`,
    };
  }

  return { valid: true };
}

// Validate and truncate label (max 50 chars)
// Strips Unicode control characters and directional overrides (intentional security filter)
export function validateLabel(label: string): string {
  const sanitised = label.replace(
    // eslint-disable-next-line no-control-regex -- stripping control chars is the intent
    /[\x00-\x1f\x7f\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff]/g,
    "",
  );
  if (sanitised.length > 50) {
    return sanitised.substring(0, 47) + "...";
  }
  return sanitised;
}

// Validate segments count (2-20)
export function validateSegments(value: string): ValidationResult {
  return validateInteger(value, 2, 20, "segments");
}

// Validate width (50-500)
export function validateWidth(value: string): ValidationResult {
  return validateInteger(value, 50, 500, "width");
}
