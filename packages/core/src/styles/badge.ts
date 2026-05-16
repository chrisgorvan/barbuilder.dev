import type { ProgressConfig } from "../core/types.js";
import { SVGBuilder } from "../core/svg-builder.js";
import {
  getContrastingTextColor,
  generateGradientDef,
  generateGradientId,
  getColorForValue,
} from "../core/colors.js";

// Render badge style progress bar
export function renderBadge(config: ProgressConfig): string {
  const height = 20;

  // Generate value display based on type
  let valueDisplay = "";
  switch (config.type) {
    case "percentage":
      valueDisplay = `${Math.round(config.value)}%`;
      break;
    case "xofy":
      const current = Math.min(config.current || 0, config.total || 100);
      valueDisplay = `${current}/${config.total || 100}`;
      break;
    case "icon":
      const iconCurrent = Math.min(config.current || 0, config.total || 5);
      valueDisplay = `${iconCurrent}/${config.total || 5}`;
      break;
  }

  // Measure text widths (approximate: 6px per char)
  const labelWidth = measureText(config.label) + 16;
  const valueWidth = measureText(valueDisplay) + 16;
  const width = labelWidth + valueWidth;

  const builder = new SVGBuilder(width, height);

  // Add gradient definition if needed
  if (config.colorMode === "gradient") {
    builder.addDefs(generateGradientDef(config));
  }

  // Label section (left) - always gray
  builder.addBackground(0, 0, labelWidth, height, "#555555", 0);

  // Value section (right) - colored based on progress
  const valueBgColor =
    config.colorMode === "gradient"
      ? `url(#${generateGradientId(config)})`
      : config.colorMode === "threshold"
        ? getColorForValue(config.value, config.colorSteps!)
        : config.color;

  builder.addBackground(labelWidth, 0, valueWidth, height, valueBgColor, 0);

  // Labels with contrast-aware colors
  // Left section always #555555 gray
  const leftTextColor = getContrastingTextColor("#555555");
  // Right section uses the value background color
  const rightTextColor = getContrastingTextColor(
    config.colorMode === "gradient"
      ? config.colorTo || config.color
      : config.colorMode === "threshold"
        ? getColorForValue(config.value, config.colorSteps!)
        : config.color,
  );

  builder.addText(
    labelWidth / 2,
    14,
    config.label,
    leftTextColor,
    11,
    "middle",
  );
  builder.addText(
    labelWidth + valueWidth / 2,
    14,
    valueDisplay,
    rightTextColor,
    11,
    "middle",
  );

  return builder.build();
}

// Approximate text width (11px font)
function measureText(text: string): number {
  let width = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // Star characters (★ ☆) are wider than regular characters
    if (char === "★" || char === "☆") {
      width += 11; // Stars are approximately 11px wide in 11px font
    } else {
      width += 6.5; // Regular characters average 6.5px
    }
  }

  return width;
}
