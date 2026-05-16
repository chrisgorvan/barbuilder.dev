import type { ProgressConfig } from "../core/types.js";

// Generate percentage progress bar
export function generatePercentage(config: ProgressConfig): ProgressConfig {
  // Value already validated and normalized to 0-100

  // Auto-generate label if not provided
  if (!config.label) {
    config.label = "Progress";
  }

  return config;
}
