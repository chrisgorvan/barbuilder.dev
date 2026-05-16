import type { ProgressConfig } from "../core/types.js";

// Generate X of Y progress bar
export function generateXofY(config: ProgressConfig): ProgressConfig {
  const current = config.current || 0;
  const total = config.total || 100;

  // Cap current at total (don't error on overflow, just treat as 100%)
  const cappedCurrent = Math.min(current, total);

  // Calculate percentage
  config.value = (cappedCurrent / total) * 100;

  // Auto-generate label if not provided
  if (!config.label) {
    config.label = "Progress";
  }

  // For segments style, set segments to match total (clamped to 2-20 range)
  if (config.style === "segments") {
    config.segments = Math.min(Math.max(total, 2), 20);
  }

  return config;
}
