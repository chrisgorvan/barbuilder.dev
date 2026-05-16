import { describe, it, expect } from "vitest";
import { getThemeDefaults } from "../../src/core/theme.js";

describe("getThemeDefaults", () => {
  it("returns light theme defaults by default", () => {
    expect(getThemeDefaults("light")).toEqual({
      backgroundColor: "#e0e0e0",
      labelBackground: "#555555",
      labelText: "#ffffff",
      progressColor: "#44cc11",
    });
  });

  it("returns dark theme defaults", () => {
    expect(getThemeDefaults("dark")).toEqual({
      backgroundColor: "#333333",
      labelBackground: "#1a1a1a",
      labelText: "#e0e0e0",
      progressColor: "#55dd55",
    });
  });

  it("uses brighter green progress colour in dark theme", () => {
    const light = getThemeDefaults("light");
    const dark = getThemeDefaults("dark");
    expect(dark.progressColor).not.toBe(light.progressColor);
  });
});
