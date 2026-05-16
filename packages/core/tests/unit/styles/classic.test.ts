import { describe, it, expect } from "vitest";
import { renderClassic } from "../../../src/styles/classic.js";
import { makeConfig } from "../test-helpers.js";

describe("renderClassic", () => {
  it("produces a valid SVG document", () => {
    const svg = renderClassic(
      makeConfig({ value: 50, label: "Progress", width: 200 }),
    );
    expect(svg).toContain("<?xml");
    expect(svg).toContain('width="200"');
    expect(svg).toContain('height="20"');
    expect(svg).toContain("</svg>");
  });

  it("includes the label text", () => {
    const svg = renderClassic(
      makeConfig({ value: 50, label: "Build", width: 200 }),
    );
    expect(svg).toContain("Build");
  });

  it("escapes the label text", () => {
    const svg = renderClassic(
      makeConfig({ value: 50, label: "<x>&'", width: 200 }),
    );
    expect(svg).not.toContain("<x>&'");
    expect(svg).toContain("&lt;x&gt;");
  });

  it("does not draw a progress rect at value=0", () => {
    const svg = renderClassic(
      makeConfig({ value: 0, label: "Empty", color: "#ff0000" }),
    );
    // Background path is always drawn; progress rect width would be 0 → omitted.
    expect(svg).not.toContain('fill="#ff0000"');
  });

  it("draws a progress fill at value=100", () => {
    const svg = renderClassic(
      makeConfig({ value: 100, label: "Done", color: "#00ff00" }),
    );
    expect(svg).toContain('fill="#00ff00"');
  });

  it("uses the configured background colour", () => {
    const svg = renderClassic(
      makeConfig({
        value: 50,
        label: "x",
        backgroundColor: "#123456",
      }),
    );
    expect(svg).toContain('fill="#123456"');
  });

  it("uses dark label background in dark theme", () => {
    const svg = renderClassic(
      makeConfig({ value: 50, label: "x", theme: "dark" }),
    );
    expect(svg).toContain("#1a1a1a");
  });

  it("uses light label background in light theme", () => {
    const svg = renderClassic(
      makeConfig({ value: 50, label: "x", theme: "light" }),
    );
    expect(svg).toContain("#555555");
  });

  it("emits a linearGradient when colorMode is 'gradient'", () => {
    const svg = renderClassic(
      makeConfig({
        value: 50,
        label: "x",
        colorMode: "gradient",
        colorFrom: "#ff0000",
        colorTo: "#00ff00",
      }),
    );
    expect(svg).toContain("<linearGradient");
    expect(svg).toContain("#ff0000");
    expect(svg).toContain("#00ff00");
    expect(svg).toMatch(/url\(#grad-[0-9a-f]{8}\)/);
  });

  it("uses threshold colour when colorMode is 'threshold'", () => {
    const svg = renderClassic(
      makeConfig({
        value: 70,
        label: "x",
        colorMode: "threshold",
        colorSteps: [
          { threshold: 0, color: "#ff0000" },
          { threshold: 50, color: "#ffff00" },
          { threshold: 100, color: "#00ff00" },
        ],
      }),
    );
    // value=70 is >= 50 but < 100, so picks #ffff00
    expect(svg).toContain('fill="#ffff00"');
  });

  it("respects width override", () => {
    const svg = renderClassic(
      makeConfig({ value: 50, label: "x", width: 400 }),
    );
    expect(svg).toContain('width="400"');
  });
});
