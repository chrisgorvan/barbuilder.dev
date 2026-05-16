import type { ProgressConfig } from "../core/types.js";
import { SVGBuilder } from "../core/svg-builder.js";
import {
  generateGradientDef,
  generateGradientId,
  getColorForValue,
} from "../core/colors.js";

// Render minimal style progress bar
export function renderMinimal(config: ProgressConfig): string {
  const width = config.width || 200;
  const height = 8; // Slimmer than other styles
  const borderRadius = 4;

  const fillWidth = (width * config.value) / 100;

  const builder = new SVGBuilder(width, height);

  // Add gradient definition if needed
  if (config.colorMode === "gradient") {
    builder.addDefs(generateGradientDef(config));
  }

  // No border, no labels, just pure progress bar

  // Background (unfilled area)
  builder.addBackground(
    0,
    0,
    width,
    height,
    config.backgroundColor,
    borderRadius,
  );

  // Progress fill
  const fillColor =
    config.colorMode === "gradient"
      ? `url(#${generateGradientId(config)})`
      : config.colorMode === "threshold"
        ? getColorForValue(config.value, config.colorSteps!)
        : config.color;

  if (fillWidth > 0) {
    builder.addProgress(0, 0, fillWidth, height, fillColor, borderRadius);
  }

  return builder.build();
}
