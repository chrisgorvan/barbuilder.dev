import type { ProgressConfig } from "../core/types.js";

// Generate icon-based progress display (no bars, just icons)
export function generateIcon(config: ProgressConfig): ProgressConfig {
  const current = config.current || 0;
  const total = config.total || 5;

  // Cap current at total, but preserve decimal values
  config.current = Math.min(current, total);
  config.total = total;

  // Set normalized value for threshold colors
  config.value = (config.current / config.total) * 100;

  // Default shape
  if (!config.shape) {
    config.shape = "star";
  }

  // No auto-labels for icon type - icons speak for themselves
  // Labels can still be set via URL parameters if needed

  return config;
}
