import type { ProgressConfig } from "../core/types.js";
import { SVGBuilder } from "../core/svg-builder.js";
import {
  generateGradientDef,
  generateGradientId,
  getContrastingTextColor,
  getColorForValue,
} from "../core/colors.js";

// Render pill style progress bar
export function renderPill(config: ProgressConfig): string {
  const width = config.width || 200;
  const height = 20;
  const borderRadius = 10; // Fully rounded ends

  const fillWidth = (width * config.value) / 100;

  const builder = new SVGBuilder(width, height);

  // Add gradient definition if needed
  if (config.colorMode === "gradient") {
    builder.addDefs(generateGradientDef(config));
  }

  // Background (unfilled area)
  builder.addBackground(
    0,
    0,
    width,
    height,
    config.backgroundColor,
    borderRadius,
  );

  // Progress fill (with rounded corners)
  const fillColor =
    config.colorMode === "gradient"
      ? `url(#${generateGradientId(config)})`
      : config.colorMode === "threshold"
        ? getColorForValue(config.value, config.colorSteps!)
        : config.color;

  if (fillWidth > 0) {
    builder.addProgress(0, 0, fillWidth, height, fillColor, borderRadius);
  }

  // Center-aligned label showing progress
  if (config.label) {
    // Label is centered - determine dominant background color
    const centerX = width / 2;
    const progressEndX = fillWidth;
    const isLabelOnProgress = centerX < progressEndX;
    const labelBg = isLabelOnProgress ? config.color : config.backgroundColor;
    const textColor = getContrastingTextColor(labelBg);
    builder.addText(width / 2, 14, config.label, textColor, 11, "middle");
  }

  return builder.build();
}
