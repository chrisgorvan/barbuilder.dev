import { describe, it, expect } from "vitest";
import { generatePercentage } from "../../../src/generators/percentage.js";
import { makeConfig } from "../test-helpers.js";

describe("generatePercentage", () => {
  it("returns the config unchanged when label is set", () => {
    const config = makeConfig({ value: 75, label: "Build" });
    const result = generatePercentage(config);
    expect(result.label).toBe("Build");
    expect(result.value).toBe(75);
  });

  it("auto-generates a 'Progress' label when none provided", () => {
    const config = makeConfig({ value: 50, label: "" });
    const result = generatePercentage(config);
    expect(result.label).toBe("Progress");
  });

  it("does not overwrite a custom label", () => {
    const config = makeConfig({ label: "My Label" });
    expect(generatePercentage(config).label).toBe("My Label");
  });

  it("preserves all other config fields", () => {
    const config = makeConfig({
      value: 33,
      style: "badge",
      color: "#ff0000",
      theme: "dark",
    });
    const result = generatePercentage(config);
    expect(result.style).toBe("badge");
    expect(result.color).toBe("#ff0000");
    expect(result.theme).toBe("dark");
    expect(result.value).toBe(33);
  });

  it("handles boundary values 0 and 100", () => {
    expect(generatePercentage(makeConfig({ value: 0 })).value).toBe(0);
    expect(generatePercentage(makeConfig({ value: 100 })).value).toBe(100);
  });
});
