import { describe, it, expect } from "vitest";
import {
  SVGBuilder,
  generateErrorSVG,
  normalizeValue,
} from "../../src/core/svg-builder.js";

describe("SVGBuilder", () => {
  it("builds an SVG with declared width and height", () => {
    const svg = new SVGBuilder(200, 20).build();
    expect(svg).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('width="200"');
    expect(svg).toContain('height="20"');
    expect(svg).toContain("</svg>");
  });

  it("addBackground emits a rect with given fill", () => {
    const svg = new SVGBuilder(100, 10)
      .addBackground(0, 0, 100, 10, "#ff0000")
      .build();
    expect(svg).toContain(
      '<rect x="0" y="0" width="100" height="10" fill="#ff0000"',
    );
  });

  it("addBackground includes rx when radius > 0", () => {
    const svg = new SVGBuilder(100, 10)
      .addBackground(0, 0, 100, 10, "#fff", 3)
      .build();
    expect(svg).toContain('rx="3"');
  });

  it("addProgress with width <= 0 does not emit a rect", () => {
    const svg = new SVGBuilder(100, 10)
      .addProgress(0, 0, 0, 10, "#000")
      .build();
    expect(svg).not.toContain('width="0"');
  });

  it("addText escapes XML special characters", () => {
    const svg = new SVGBuilder(100, 20)
      .addText(10, 14, `<script>"&'`, "#000000")
      .build();
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
    expect(svg).toContain("&quot;");
    expect(svg).toContain("&amp;");
    expect(svg).toContain("&apos;");
  });

  it("addText respects text-anchor", () => {
    const svg = new SVGBuilder(100, 20)
      .addText(50, 14, "Test", "#000", 11, "middle")
      .build();
    expect(svg).toContain('text-anchor="middle"');
  });

  it("addBorder emits a rect with stroke and no fill", () => {
    const svg = new SVGBuilder(100, 20)
      .addBorder(0, 0, 100, 20, "#000000", 2, 3)
      .build();
    expect(svg).toContain('stroke="#000000"');
    expect(svg).toContain('stroke-width="2"');
    expect(svg).toContain('fill="none"');
    expect(svg).toContain('rx="3"');
  });

  it("addDefs wraps content in a <defs> block", () => {
    const svg = new SVGBuilder(100, 20)
      .addDefs("<linearGradient id='g'/>")
      .build();
    expect(svg).toContain("<defs>");
    expect(svg).toContain("<linearGradient id='g'/>");
    expect(svg).toContain("</defs>");
  });

  it("omits <defs> block when no defs added", () => {
    const svg = new SVGBuilder(100, 20).build();
    expect(svg).not.toContain("<defs>");
  });

  it("addRawSVG appends raw content to the progress layer", () => {
    const svg = new SVGBuilder(100, 20).addRawSVG("<g><path/></g>").build();
    expect(svg).toContain("<g><path/></g>");
  });

  it("supports method chaining", () => {
    const builder = new SVGBuilder(100, 20);
    expect(builder.addBackground(0, 0, 100, 20, "#fff")).toBe(builder);
    expect(builder.addProgress(0, 0, 50, 20, "#0f0")).toBe(builder);
    expect(builder.addText(10, 14, "x", "#000")).toBe(builder);
  });
});

describe("generateErrorSVG", () => {
  it("returns a 400x40 red error SVG", () => {
    const svg = generateErrorSVG("Boom");
    expect(svg).toContain('width="400"');
    expect(svg).toContain('height="40"');
    expect(svg).toContain('fill="#ff6b6b"');
    expect(svg).toContain("Boom");
  });

  it("escapes XML special characters in error messages", () => {
    const svg = generateErrorSVG('<bad>"');
    expect(svg).not.toContain("<bad>");
    expect(svg).toContain("&lt;bad&gt;");
    expect(svg).toContain("&quot;");
  });
});

describe("normalizeValue", () => {
  it("rounds to one decimal place", () => {
    expect(normalizeValue(50)).toBe(50);
    expect(normalizeValue(50.04)).toBe(50);
    expect(normalizeValue(50.05)).toBe(50.1);
    expect(normalizeValue(50.15)).toBeCloseTo(50.2, 5);
    expect(normalizeValue(0)).toBe(0);
    expect(normalizeValue(100)).toBe(100);
  });

  it("handles negative values", () => {
    expect(normalizeValue(-1.23)).toBe(-1.2);
  });
});
