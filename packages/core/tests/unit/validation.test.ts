import { describe, it, expect } from "vitest";
import {
  validatePercentage,
  validateInteger,
  validateStyle,
  validateProgressType,
  validateLabel,
  validateSegments,
  validateWidth,
} from "../../src/core/validation.js";

describe("validatePercentage", () => {
  it("should accept valid percentage values", () => {
    expect(validatePercentage("0")).toEqual({ valid: true });
    expect(validatePercentage("50")).toEqual({ valid: true });
    expect(validatePercentage("100")).toEqual({ valid: true });
    expect(validatePercentage("75.5")).toEqual({ valid: true });
    expect(validatePercentage("0.1")).toEqual({ valid: true });
  });

  it("should reject values below 0", () => {
    const result = validatePercentage("-1");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be 0-100");
  });

  it("should reject values above 100", () => {
    const result = validatePercentage("101");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be 0-100");
  });

  it("should reject non-numeric values", () => {
    const result = validatePercentage("abc");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be number");
  });

  it("should reject empty string", () => {
    const result = validatePercentage("");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be number");
  });
});

describe("validateInteger", () => {
  it("should accept valid integers within range", () => {
    expect(validateInteger("5", 0, 10, "test")).toEqual({ valid: true });
    expect(validateInteger("0", 0, 10, "test")).toEqual({ valid: true });
    expect(validateInteger("10", 0, 10, "test")).toEqual({ valid: true });
  });

  it("should reject values below minimum", () => {
    const result = validateInteger("4", 5, 10, "test");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be ≥ 5");
  });

  it("should reject values above maximum", () => {
    const result = validateInteger("11", 5, 10, "test");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be ≤ 10");
  });

  it("should reject non-integer values", () => {
    const result = validateInteger("abc", 0, 10, "test");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be integer");
  });

  it("should accept decimal strings (parseInt truncates)", () => {
    // parseInt('5.5') returns 5, which is valid behavior
    const result = validateInteger("5.5", 0, 10, "test");
    expect(result.valid).toBe(true);
  });

  it("should include parameter name in error message", () => {
    const result = validateInteger("abc", 0, 10, "segments");
    expect(result.error).toContain("segments");
  });
});

describe("validateStyle", () => {
  it("should accept valid style names", () => {
    expect(validateStyle("classic")).toEqual({ valid: true });
    expect(validateStyle("pill")).toEqual({ valid: true });
    expect(validateStyle("minimal")).toEqual({ valid: true });
    expect(validateStyle("badge")).toEqual({ valid: true });
    expect(validateStyle("segments")).toEqual({ valid: true });
  });

  it("should reject invalid style names", () => {
    const result = validateStyle("invalid");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unknown style");
    expect(result.error).toContain("invalid");
  });

  it("should list valid styles in error message", () => {
    const result = validateStyle("badstyle");
    expect(result.error).toContain("classic");
    expect(result.error).toContain("pill");
    expect(result.error).toContain("minimal");
    expect(result.error).toContain("badge");
    expect(result.error).toContain("segments");
  });
});

describe("validateProgressType", () => {
  it("should accept valid progress types", () => {
    expect(validateProgressType("percentage")).toEqual({ valid: true });
    expect(validateProgressType("xofy")).toEqual({ valid: true });
    expect(validateProgressType("icon")).toEqual({ valid: true });
  });

  it("should reject invalid progress types", () => {
    const result = validateProgressType("invalid");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Unknown progress type");
    expect(result.error).toContain("invalid");
  });

  it("should reject removed types (threshold, indeterminate)", () => {
    const result1 = validateProgressType("threshold");
    expect(result1.valid).toBe(false);
    expect(result1.error).toContain("Unknown progress type");

    const result2 = validateProgressType("indeterminate");
    expect(result2.valid).toBe(false);
    expect(result2.error).toContain("Unknown progress type");
  });

  it("should list valid types in error message", () => {
    const result = validateProgressType("badtype");
    expect(result.error).toContain("percentage");
    expect(result.error).toContain("xofy");
    expect(result.error).toContain("icon");
  });
});

describe("validateLabel", () => {
  it("should return label unchanged if under 50 chars", () => {
    expect(validateLabel("Short label")).toBe("Short label");
    expect(validateLabel("Test")).toBe("Test");
    expect(validateLabel("A".repeat(50))).toBe("A".repeat(50));
  });

  it("should truncate labels over 50 chars", () => {
    const longLabel = "A".repeat(60);
    const result = validateLabel(longLabel);
    expect(result.length).toBe(50);
    expect(result).toBe("A".repeat(47) + "...");
  });

  it("should add ellipsis when truncating", () => {
    const longLabel =
      "This is a very long label that exceeds the fifty character limit";
    const result = validateLabel(longLabel);
    expect(result).toMatch(/\.\.\.$/);
    expect(result.length).toBe(50);
  });

  it("should handle empty labels", () => {
    expect(validateLabel("")).toBe("");
  });

  it("should preserve exactly 50 character labels", () => {
    const exactLabel = "A".repeat(50);
    expect(validateLabel(exactLabel)).toBe(exactLabel);
  });
});

describe("validateSegments", () => {
  it("should accept valid segment counts", () => {
    expect(validateSegments("2")).toEqual({ valid: true });
    expect(validateSegments("10")).toEqual({ valid: true });
    expect(validateSegments("20")).toEqual({ valid: true });
  });

  it("should reject values below 2", () => {
    const result = validateSegments("1");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be ≥ 2");
  });

  it("should reject values above 20", () => {
    const result = validateSegments("21");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be ≤ 20");
  });

  it("should reject non-integer values", () => {
    const result = validateSegments("abc");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be integer");
  });

  it('should include "segments" in error message', () => {
    const result = validateSegments("abc");
    expect(result.error).toContain("segments");
  });
});

describe("validateWidth", () => {
  it("should accept valid width values", () => {
    expect(validateWidth("50")).toEqual({ valid: true });
    expect(validateWidth("200")).toEqual({ valid: true });
    expect(validateWidth("500")).toEqual({ valid: true });
  });

  it("should reject values below 50", () => {
    const result = validateWidth("49");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be ≥ 50");
  });

  it("should reject values above 500", () => {
    const result = validateWidth("501");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be ≤ 500");
  });

  it("should reject non-integer values", () => {
    const result = validateWidth("abc");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("must be integer");
  });

  it('should include "width" in error message', () => {
    const result = validateWidth("abc");
    expect(result.error).toContain("width");
  });
});
