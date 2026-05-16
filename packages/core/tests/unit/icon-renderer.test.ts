import { describe, it, expect } from "vitest";
import { renderIcon } from "../../src/core/icon-renderer.js";
import type { IconShape, IconFillState } from "../../src/core/types.js";

const SHAPES: IconShape[] = ["star", "heart", "circle", "8bit-heart"];
const STATES: IconFillState[] = ["filled", "half", "unfilled"];

describe("renderIcon", () => {
  it.each(SHAPES)("renders a %s in every fill state", (shape) => {
    for (const state of STATES) {
      const svg = renderIcon(10, 10, 8, shape, state, "#ff0000");
      expect(typeof svg).toBe("string");
      expect(svg.length).toBeGreaterThan(0);
      expect(svg).toContain("<path");
    }
  });

  it("applies the requested colour to filled icons", () => {
    const svg = renderIcon(10, 10, 8, "star", "filled", "#abc123");
    expect(svg).toContain('fill="#abc123"');
  });

  it("emits a transform attribute that translates and scales", () => {
    const svg = renderIcon(20, 30, 8, "star", "filled", "#000");
    expect(svg).toMatch(/transform="translate\([\d.,-]+\) scale\([\d.]+\)"/);
  });

  it("falls back to star for unknown shapes", () => {
    const svg = renderIcon(
      10,
      10,
      8,
      "unknown" as IconShape,
      "filled",
      "#000",
    );
    const expected = renderIcon(10, 10, 8, "star", "filled", "#000");
    expect(svg).toBe(expected);
  });

  it("8bit-heart filled emits both a black outline and a coloured fill", () => {
    const svg = renderIcon(10, 10, 8, "8bit-heart", "filled", "#ff0000");
    expect(svg).toContain('fill="#000000"');
    expect(svg).toContain('fill="#ff0000"');
  });

  it("8bit-heart unfilled has only the outline (no coloured fill)", () => {
    const svg = renderIcon(10, 10, 8, "8bit-heart", "unfilled", "#ff0000");
    expect(svg).toContain('fill="#000000"');
    expect(svg).not.toContain('fill="#ff0000"');
  });

  it("8bit-heart half adds a clipPath def and clips the coloured fill", () => {
    const svg = renderIcon(10, 10, 8, "8bit-heart", "half", "#ff0000");
    expect(svg).toContain("<clipPath");
    expect(svg).toContain("clip-path=");
  });

  it("renders different paths for filled/half/unfilled stars", () => {
    const filled = renderIcon(10, 10, 8, "star", "filled", "#000");
    const half = renderIcon(10, 10, 8, "star", "half", "#000");
    const unfilled = renderIcon(10, 10, 8, "star", "unfilled", "#000");
    expect(filled).not.toBe(half);
    expect(half).not.toBe(unfilled);
    expect(filled).not.toBe(unfilled);
  });
});
