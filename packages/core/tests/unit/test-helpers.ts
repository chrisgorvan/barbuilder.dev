import type { ProgressConfig } from "../../src/core/types.js";

// Build a fully-populated ProgressConfig for tests. Override fields as needed.
export function makeConfig(
  overrides: Partial<ProgressConfig> = {},
): ProgressConfig {
  return {
    type: "percentage",
    value: 50,
    style: "classic",
    width: 200,
    height: 20,
    colorMode: "single",
    color: "#44cc11",
    backgroundColor: "#e0e0e0",
    theme: "light",
    label: "",
    ...overrides,
  };
}
