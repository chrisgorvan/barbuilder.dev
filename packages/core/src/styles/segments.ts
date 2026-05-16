import type { ProgressConfig } from "../core/types.js";
import { SVGBuilder } from "../core/svg-builder.js";
import {
  generateGradientDef,
  generateGradientId,
  getColorForValue,
} from "../core/colors.js";

// Render segments style progress bar
export function renderSegments(config: ProgressConfig): string {
  const width = config.width || 200;
  const height = 20;
  const segments = config.segments || 10;
  const gap = 2;
  const borderRadius = 3;

  // Calculate segment dimensions
  const totalGapWidth = gap * (segments - 1);
  const segmentWidth = (width - totalGapWidth) / segments;

  // Calculate how many segments to fill (rounds to nearest)
  const filledSegments = Math.round((segments * config.value) / 100);

  const builder = new SVGBuilder(width, height);

  // Add gradient definition if needed
  if (config.colorMode === "gradient") {
    builder.addDefs(generateGradientDef(config));
  }

  // Determine fill color
  const fillColor =
    config.colorMode === "gradient"
      ? `url(#${generateGradientId(config)})`
      : config.colorMode === "threshold"
        ? getColorForValue(config.value, config.colorSteps!)
        : config.color;

  // Render each segment
  for (let i = 0; i < segments; i++) {
    const x = i * (segmentWidth + gap);
    const isFilled = i < filledSegments;

    if (isFilled) {
      builder.addProgress(x, 0, segmentWidth, height, fillColor, borderRadius);
    } else {
      builder.addBackground(
        x,
        0,
        segmentWidth,
        height,
        config.backgroundColor,
        borderRadius,
      );
    }
  }

  // Segments style is purely visual - no labels
  return builder.build();
}
