import { describe, it, expect } from "vitest";
import { renderMinimal } from "../../../src/styles/minimal.js";
import { makeConfig } from "../test-helpers.js";

describe("renderMinimal", () => {
  it("renders a slim 8-pixel-tall bar", () => {
    const svg = renderMinimal(makeConfig({ value: 50 }));
    expect(svg).toContain('height="8"');
  });

  it("never renders text labels (minimal style is unlabelled)", () => {
    const svg = renderMinimal(makeConfig({ value: 50, label: "Ignored" }));
    expect(svg).not.toContain("<text");
    expect(svg).not.toContain("Ignored");
  });

  it("uses borderRadius 4 (half of height)", () => {
    const svg = renderMinimal(makeConfig({ value: 50 }));
    expect(svg).toContain('rx="4"');
  });

  it("does not draw a progress rect at value=0", () => {
    const svg = renderMinimal(makeConfig({ value: 0, color: "#ff0000" }));
    expect(svg).not.toContain('fill="#ff0000"');
  });

  it("draws progress fill with the configured colour", () => {
    const svg = renderMinimal(makeConfig({ value: 50, color: "#1e90ff" }));
    expect(svg).toContain('fill="#1e90ff"');
  });

  it("supports gradient mode", () => {
    const svg = renderMinimal(
      makeConfig({
        value: 75,
        colorMode: "gradient",
        colorFrom: "#ff0000",
        colorTo: "#0000ff",
      }),
    );
    expect(svg).toContain("<linearGradient");
  });

  it("supports threshold mode", () => {
    const svg = renderMinimal(
      makeConfig({
        value: 100,
        colorMode: "threshold",
        colorSteps: [
          { threshold: 0, color: "#ff0000" },
          { threshold: 100, color: "#00ff00" },
        ],
      }),
    );
    expect(svg).toContain('fill="#00ff00"');
  });

  it("respects width override", () => {
    const svg = renderMinimal(makeConfig({ value: 50, width: 300 }));
    expect(svg).toContain('width="300"');
  });
});
