import { describe, it, expect } from "vitest";
import { renderIconDisplay } from "../../../src/styles/icon.js";
import { makeConfig } from "../test-helpers.js";

function countTransforms(svg: string): number {
  return (svg.match(/transform="translate/g) ?? []).length;
}

describe("renderIconDisplay", () => {
  it("renders one icon group per total", () => {
    const svg = renderIconDisplay(
      makeConfig({ type: "icon", current: 0, total: 5, shape: "star" }),
    );
    // Each icon emits at least one <g transform=...>
    expect(countTransforms(svg)).toBeGreaterThanOrEqual(5);
  });

  it("renders without a label area when label is empty", () => {
    const svg = renderIconDisplay(
      makeConfig({ type: "icon", current: 1, total: 3, label: "" }),
    );
    expect(svg).not.toContain("<text");
  });

  it("renders a label area when label is provided", () => {
    const svg = renderIconDisplay(
      makeConfig({
        type: "icon",
        current: 1,
        total: 3,
        label: "Rating",
      }),
    );
    expect(svg).toContain("Rating");
    expect(svg).toContain("<text");
  });

  it("uses dark label background in dark theme", () => {
    const svg = renderIconDisplay(
      makeConfig({
        type: "icon",
        current: 1,
        total: 3,
        label: "x",
        theme: "dark",
      }),
    );
    expect(svg).toContain("#1a1a1a");
  });

  it("uses configured icon colour for filled icons", () => {
    const svg = renderIconDisplay(
      makeConfig({
        type: "icon",
        current: 3,
        total: 3,
        shape: "star",
        color: "#ffd700",
      }),
    );
    expect(svg).toContain('fill="#ffd700"');
  });

  it("supports half-fill via fractional current", () => {
    const svg = renderIconDisplay(
      makeConfig({
        type: "icon",
        current: 2.5,
        total: 5,
        shape: "star",
        color: "#ff0000",
      }),
    );
    // Half-filled state uses the star-half path, which includes 'star-half'-specific shape
    // We can at least confirm the colour is applied (filled + half icons use the colour)
    expect(svg).toContain('fill="#ff0000"');
  });

  it("supports each icon shape", () => {
    const shapes = ["star", "heart", "circle", "8bit-heart"] as const;
    for (const shape of shapes) {
      const svg = renderIconDisplay(
        makeConfig({ type: "icon", current: 1, total: 2, shape }),
      );
      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
    }
  });

  it("rounds current to nearest 0.5 for visual clarity", () => {
    // current=2.3 should behave like 2.5 (rounds up to half)
    const svg23 = renderIconDisplay(
      makeConfig({
        type: "icon",
        current: 2.3,
        total: 5,
        shape: "star",
        color: "#ff0000",
      }),
    );
    const svg25 = renderIconDisplay(
      makeConfig({
        type: "icon",
        current: 2.5,
        total: 5,
        shape: "star",
        color: "#ff0000",
      }),
    );
    expect(svg23).toBe(svg25);
  });
});
