import { describe, it, expect } from "vitest";
import {
  parseColor,
  parseGradient,
  parseThresholdSteps,
  getColorForValue,
  generateGradientDef,
  generateGradientId,
  getContrastingTextColor,
} from "../../src/core/colors.js";
import type { ProgressConfig } from "../../src/core/types.js";

describe("parseColor", () => {
  it("should parse 3-digit hex colors", () => {
    expect(parseColor("abc")).toBe("#aabbcc");
    expect(parseColor("f00")).toBe("#ff0000");
    expect(parseColor("0a3")).toBe("#00aa33");
    expect(parseColor("4c1")).toBe("#44cc11");
  });

  it("should parse 6-digit hex colors", () => {
    expect(parseColor("aabbcc")).toBe("#aabbcc");
    expect(parseColor("ff0000")).toBe("#ff0000");
    expect(parseColor("1e90ff")).toBe("#1e90ff");
  });

  it("should handle hex colors with # prefix", () => {
    expect(parseColor("#aabbcc")).toBe("#aabbcc");
    expect(parseColor("#FF0000")).toBe("#ff0000");
  });

  it("should parse CSS named colors", () => {
    expect(parseColor("red")).toBe("#ff0000");
    expect(parseColor("blue")).toBe("#0000ff");
    expect(parseColor("green")).toBe("#008000");
    expect(parseColor("white")).toBe("#ffffff");
    expect(parseColor("black")).toBe("#000000");
  });

  it("should be case insensitive for named colors", () => {
    expect(parseColor("Red")).toBe("#ff0000");
    expect(parseColor("RED")).toBe("#ff0000");
    expect(parseColor("DarkSlateGray")).toBe("#2f4f4f");
    expect(parseColor("darkslategrey")).toBe("#2f4f4f");
  });

  it("should throw error for invalid input", () => {
    expect(() => parseColor("invalid")).toThrow("Invalid color");
    expect(() => parseColor("zzz")).toThrow("Invalid color");
    expect(() => parseColor("12")).toThrow("Invalid color");
    expect(() => parseColor("#abc")).toThrow("Invalid color"); // # prefix only valid for 6-digit
  });

  it("should handle common web colors", () => {
    expect(parseColor("lime")).toBe("#00ff00");
    expect(parseColor("aqua")).toBe("#00ffff");
    expect(parseColor("fuchsia")).toBe("#ff00ff");
    expect(parseColor("silver")).toBe("#c0c0c0");
  });
});

describe("parseGradient", () => {
  it("should parse gradient from two colors", () => {
    const result = parseGradient("red", "blue");
    expect(result).toEqual({
      from: "#ff0000",
      to: "#0000ff",
    });
  });

  it("should handle hex colors in gradients", () => {
    const result = parseGradient("ff0000", "0000ff");
    expect(result).toEqual({
      from: "#ff0000",
      to: "#0000ff",
    });
  });

  it("should throw error if colors are invalid", () => {
    expect(() => parseGradient("invalid", "bad")).toThrow("Invalid color");
  });
});

describe("parseThresholdSteps", () => {
  it("should parse threshold step format", () => {
    const result = parseThresholdSteps("33:red,66:yellow,100:green");
    expect(result).toEqual([
      { threshold: 33, color: "#ff0000" },
      { threshold: 66, color: "#ffff00" },
      { threshold: 100, color: "#008000" },
    ]);
  });

  it("should handle hex colors in thresholds", () => {
    const result = parseThresholdSteps("50:ff0000,100:00ff00");
    expect(result).toEqual([
      { threshold: 50, color: "#ff0000" },
      { threshold: 100, color: "#00ff00" },
    ]);
  });

  it("should sort steps by threshold", () => {
    const result = parseThresholdSteps("100:green,33:red,66:yellow");
    expect(result).toEqual([
      { threshold: 33, color: "#ff0000" },
      { threshold: 66, color: "#ffff00" },
      { threshold: 100, color: "#008000" },
    ]);
  });

  it("should throw error for invalid format", () => {
    expect(() => parseThresholdSteps("invalid")).toThrow(
      "Invalid colorSteps format",
    );
    expect(() => parseThresholdSteps("")).toThrow("Invalid colorSteps format");
    expect(() => parseThresholdSteps("33:red,invalid")).toThrow(
      "Invalid colorSteps format",
    );
  });

  it("should throw error for invalid threshold values", () => {
    expect(() => parseThresholdSteps("abc:red")).toThrow("Invalid threshold");
    expect(() => parseThresholdSteps("-10:red")).toThrow("Invalid threshold");
    expect(() => parseThresholdSteps("150:red")).toThrow("Invalid threshold");
  });
});

describe("getColorForValue", () => {
  const steps = [
    { threshold: 33, color: "#ff0000" },
    { threshold: 66, color: "#ffff00" },
    { threshold: 100, color: "#00ff00" },
  ];

  it("should return first color for values below first threshold", () => {
    expect(getColorForValue(0, steps)).toBe("#ff0000");
    expect(getColorForValue(20, steps)).toBe("#ff0000");
    expect(getColorForValue(32, steps)).toBe("#ff0000");
  });

  it("should return correct color at threshold boundaries", () => {
    expect(getColorForValue(33, steps)).toBe("#ff0000");
    expect(getColorForValue(66, steps)).toBe("#ffff00");
    expect(getColorForValue(100, steps)).toBe("#00ff00");
  });

  it("should return correct color for values in ranges", () => {
    expect(getColorForValue(34, steps)).toBe("#ff0000");
    expect(getColorForValue(50, steps)).toBe("#ff0000");
    expect(getColorForValue(67, steps)).toBe("#ffff00");
    expect(getColorForValue(99, steps)).toBe("#ffff00");
  });
});

describe("generateGradientId", () => {
  it("should generate deterministic IDs for same colors", () => {
    const config: ProgressConfig = {
      type: "percentage",
      value: 50,
      style: "classic",
      color: "#ff0000",
      colorMode: "gradient",
      colorFrom: "#ff0000",
      colorTo: "#00ff00",
      backgroundColor: "#e0e0e0",
      theme: "light",
      labelLeft: "Test",
      labelRight: "50%",
      segments: 10,
      width: 200,
      current: 0,
      total: 100,
    };

    const id1 = generateGradientId(config);
    const id2 = generateGradientId(config);
    expect(id1).toBe(id2);
    expect(id1).toMatch(/^grad-[0-9a-f]{8}$/);
  });

  it("should generate different IDs for different gradient colors", () => {
    const config1: ProgressConfig = {
      type: "percentage",
      value: 50,
      style: "classic",
      color: "#ff0000",
      colorMode: "gradient",
      colorFrom: "#ff0000",
      colorTo: "#00ff00",
      backgroundColor: "#e0e0e0",
      theme: "light",
      labelLeft: "Test",
      labelRight: "50%",
      segments: 10,
      width: 200,
      current: 0,
      total: 100,
    };

    const config2: ProgressConfig = {
      ...config1,
      colorTo: "#0000ff", // Different gradient end color
    };

    const id1 = generateGradientId(config1);
    const id2 = generateGradientId(config2);
    expect(id1).not.toBe(id2);
  });

  it("should generate same IDs when only non-color properties differ", () => {
    const config1: ProgressConfig = {
      type: "percentage",
      value: 50,
      style: "classic",
      color: "#ff0000",
      colorMode: "gradient",
      colorFrom: "#ff0000",
      colorTo: "#00ff00",
      backgroundColor: "#e0e0e0",
      theme: "light",
      labelLeft: "Test",
      labelRight: "50%",
      segments: 10,
      width: 200,
      current: 0,
      total: 100,
    };

    const config2: ProgressConfig = {
      ...config1,
      value: 75, // Different value, but gradient colors same
      labelLeft: "Different",
    };

    const id1 = generateGradientId(config1);
    const id2 = generateGradientId(config2);
    expect(id1).toBe(id2); // Same colors = same ID
  });
});

describe("generateGradientDef", () => {
  it("should generate valid SVG gradient definition", () => {
    const config: ProgressConfig = {
      type: "percentage",
      value: 50,
      style: "classic",
      color: "#ff0000",
      colorMode: "gradient",
      colorFrom: "#ff0000",
      colorTo: "#00ff00",
      backgroundColor: "#e0e0e0",
      theme: "light",
      labelLeft: "Test",
      labelRight: "50%",
      segments: 10,
      width: 200,
      current: 0,
      total: 100,
    };

    const def = generateGradientDef(config);
    expect(def).toContain("<linearGradient");
    expect(def).toContain('id="grad-');
    expect(def).toContain('x1="0%" y1="0%" x2="100%" y2="0%"');
    expect(def).toContain("stop-color:#ff0000");
    expect(def).toContain("stop-color:#00ff00");
    expect(def).toContain("</linearGradient>");
  });

  it("should return empty string if not gradient mode", () => {
    const config: ProgressConfig = {
      type: "percentage",
      value: 50,
      style: "classic",
      color: "#ff0000",
      colorMode: "single",
      backgroundColor: "#e0e0e0",
      theme: "light",
      labelLeft: "Test",
      labelRight: "50%",
      segments: 10,
      width: 200,
      current: 0,
      total: 100,
    };

    const def = generateGradientDef(config);
    expect(def).toBe("");
  });

  it("should return empty string if gradient colors missing", () => {
    const config: ProgressConfig = {
      type: "percentage",
      value: 50,
      style: "classic",
      color: "#ff0000",
      colorMode: "gradient",
      backgroundColor: "#e0e0e0",
      theme: "light",
      labelLeft: "Test",
      labelRight: "50%",
      segments: 10,
      width: 200,
      current: 0,
      total: 100,
    };

    const def = generateGradientDef(config);
    expect(def).toBe("");
  });

  it("should generate deterministic gradient definitions", () => {
    const config: ProgressConfig = {
      type: "percentage",
      value: 50,
      style: "classic",
      color: "#ff0000",
      colorMode: "gradient",
      colorFrom: "#ff0000",
      colorTo: "#00ff00",
      backgroundColor: "#e0e0e0",
      theme: "light",
      labelLeft: "Test",
      labelRight: "50%",
      segments: 10,
      width: 200,
      current: 0,
      total: 100,
    };

    const def1 = generateGradientDef(config);
    const def2 = generateGradientDef(config);
    expect(def1).toBe(def2);
  });
});

describe("getContrastingTextColor", () => {
  it("should return black for light backgrounds", () => {
    expect(getContrastingTextColor("#ffffff")).toBe("#000000"); // white bg
    expect(getContrastingTextColor("#ffff00")).toBe("#000000"); // yellow bg
    expect(getContrastingTextColor("#00ffff")).toBe("#000000"); // cyan bg
  });

  it("should return white for dark backgrounds", () => {
    expect(getContrastingTextColor("#000000")).toBe("#ffffff"); // black bg
    expect(getContrastingTextColor("#000080")).toBe("#ffffff"); // navy bg
    expect(getContrastingTextColor("#800000")).toBe("#ffffff"); // maroon bg
  });

  it("should handle mid-range grays", () => {
    expect(getContrastingTextColor("#808080")).toBe("#ffffff"); // mid gray
    expect(getContrastingTextColor("#cccccc")).toBe("#000000"); // light gray
  });
});
