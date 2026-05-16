import { describe, it, expect } from "vitest";
import { renderPill } from "../../../src/styles/pill.js";
import { makeConfig } from "../test-helpers.js";

describe("renderPill", () => {
  it("renders with rounded ends (rx=10)", () => {
    const svg = renderPill(makeConfig({ value: 50 }));
    expect(svg).toContain('rx="10"');
  });

  it("centers the label when provided", () => {
    const svg = renderPill(makeConfig({ value: 50, label: "Center", width: 200 }));
    expect(svg).toContain('text-anchor="middle"');
    expect(svg).toContain('x="100"');
    expect(svg).toContain("Center");
  });

  it("omits text when no label", () => {
    const svg = renderPill(makeConfig({ value: 50, label: "" }));
    expect(svg).not.toContain("<text");
  });

  it("does not draw progress at value=0", () => {
    const svg = renderPill(makeConfig({ value: 0, color: "#ff0000" }));
    expect(svg).not.toContain('fill="#ff0000"');
  });

  it("draws progress fill with the configured colour", () => {
    const svg = renderPill(makeConfig({ value: 75, color: "#00ff00" }));
    expect(svg).toContain('fill="#00ff00"');
  });

  it("supports gradient colour mode", () => {
    const svg = renderPill(
      makeConfig({
        value: 50,
        colorMode: "gradient",
        colorFrom: "#aa0000",
        colorTo: "#0000aa",
      }),
    );
    expect(svg).toContain("<linearGradient");
  });

  it("supports threshold colour mode", () => {
    const svg = renderPill(
      makeConfig({
        value: 25,
        colorMode: "threshold",
        colorSteps: [
          { threshold: 0, color: "#ff0000" },
          { threshold: 50, color: "#00ff00" },
        ],
      }),
    );
    expect(svg).toContain('fill="#ff0000"');
  });
});
