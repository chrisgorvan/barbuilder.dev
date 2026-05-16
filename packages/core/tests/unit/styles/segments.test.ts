import { describe, it, expect } from "vitest";
import { renderSegments } from "../../../src/styles/segments.js";
import { makeConfig } from "../test-helpers.js";

function countRectsWithFill(svg: string, fill: string): number {
  const re = new RegExp(`<rect[^>]*fill="${escapeRegex(fill)}"`, "g");
  return (svg.match(re) ?? []).length;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("renderSegments", () => {
  it("defaults to 10 segments when not configured", () => {
    const svg = renderSegments(
      makeConfig({ value: 100, color: "#00ff00", backgroundColor: "#cccccc" }),
    );
    const filled = countRectsWithFill(svg, "#00ff00");
    expect(filled).toBe(10);
  });

  it("fills segments proportional to value (rounded)", () => {
    const svg = renderSegments(
      makeConfig({
        value: 50,
        segments: 10,
        color: "#00ff00",
        backgroundColor: "#cccccc",
      }),
    );
    expect(countRectsWithFill(svg, "#00ff00")).toBe(5);
    expect(countRectsWithFill(svg, "#cccccc")).toBe(5);
  });

  it("renders zero filled segments at value=0", () => {
    const svg = renderSegments(
      makeConfig({
        value: 0,
        segments: 5,
        color: "#00ff00",
        backgroundColor: "#cccccc",
      }),
    );
    expect(countRectsWithFill(svg, "#00ff00")).toBe(0);
    expect(countRectsWithFill(svg, "#cccccc")).toBe(5);
  });

  it("renders all filled segments at value=100", () => {
    const svg = renderSegments(
      makeConfig({
        value: 100,
        segments: 7,
        color: "#00ff00",
        backgroundColor: "#cccccc",
      }),
    );
    expect(countRectsWithFill(svg, "#00ff00")).toBe(7);
  });

  it("rounds half-segments to nearest", () => {
    // 10 segments, value=55 → 5.5 segments → rounds to 6
    const svg = renderSegments(
      makeConfig({
        value: 55,
        segments: 10,
        color: "#00ff00",
        backgroundColor: "#cccccc",
      }),
    );
    expect(countRectsWithFill(svg, "#00ff00")).toBe(6);
  });

  it("never renders a text label", () => {
    const svg = renderSegments(
      makeConfig({ value: 50, label: "Ignored" }),
    );
    expect(svg).not.toContain("<text");
    expect(svg).not.toContain("Ignored");
  });

  it("supports gradient mode", () => {
    const svg = renderSegments(
      makeConfig({
        value: 50,
        segments: 4,
        colorMode: "gradient",
        colorFrom: "#ff0000",
        colorTo: "#0000ff",
      }),
    );
    expect(svg).toContain("<linearGradient");
  });

  it("respects custom segments count", () => {
    const svg = renderSegments(
      makeConfig({
        value: 100,
        segments: 20,
        color: "#00ff00",
        backgroundColor: "#cccccc",
      }),
    );
    expect(countRectsWithFill(svg, "#00ff00")).toBe(20);
  });
});
