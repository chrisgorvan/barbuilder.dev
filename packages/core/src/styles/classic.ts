import type { ProgressConfig } from "../core/types.js";
import { SVGBuilder } from "../core/svg-builder.js";
import {
  generateGradientDef,
  generateGradientId,
  getContrastingTextColor,
  getColorForValue,
} from "../core/colors.js";

// Render classic style progress bar
export function renderClassic(config: ProgressConfig): string {
  const width = config.width || 200;
  const height = 20;
  const borderRadius = 3;

  // Calculate label and progress areas (content-aware width)
  const labelWidth = calculateLabelWidth(config.label);
  const progressWidth = width - labelWidth;
  const fillWidth = (progressWidth * config.value) / 100;

  const builder = new SVGBuilder(width, height);

  // Add gradient definition if needed
  if (config.colorMode === "gradient") {
    builder.addDefs(generateGradientDef(config));
  }

  // Draw full background with rounded corners
  builder.addBackground(
    0,
    0,
    width,
    height,
    config.backgroundColor,
    borderRadius,
  );

  // Label background with rounded left corners only
  const labelBg = config.theme === "dark" ? "#1a1a1a" : "#555555";
  const labelPath = createRoundedRect(
    0,
    0,
    labelWidth,
    height,
    borderRadius,
    true,
    false,
  );
  builder.addBackgroundPath(labelPath, labelBg);

  // Progress fill with rounded right corners only (if it extends to the edge)
  const fillColor =
    config.colorMode === "gradient"
      ? `url(#${generateGradientId(config)})`
      : config.colorMode === "threshold"
        ? getColorForValue(config.value, config.colorSteps!)
        : config.color;

  if (fillWidth > 0) {
    const progressEndX = labelWidth + fillWidth;
    const needsRightRounding = progressEndX >= width - 1; // Within 1px of edge
    const progressPath = createRoundedRect(
      labelWidth,
      0,
      fillWidth,
      height,
      borderRadius,
      false,
      needsRightRounding,
    );
    builder.addProgressPath(progressPath, fillColor);
  }

  // Label with contrast-aware color
  const labelColor = getContrastingTextColor(labelBg);
  builder.addText(8, 14, config.label, labelColor, 11, "start");

  return builder.build();
}

// Create SVG path for rectangle with selective rounded corners
function createRoundedRect(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  roundLeft: boolean,
  roundRight: boolean,
): string {
  const r = radius;
  const commands: string[] = [];

  // Start at top-left
  if (roundLeft) {
    commands.push(`M ${x + r} ${y}`);
  } else {
    commands.push(`M ${x} ${y}`);
  }

  // Top edge to top-right
  if (roundRight) {
    commands.push(`L ${x + width - r} ${y}`);
    commands.push(`A ${r} ${r} 0 0 1 ${x + width} ${y + r}`);
  } else {
    commands.push(`L ${x + width} ${y}`);
  }

  // Right edge to bottom-right
  if (roundRight) {
    commands.push(`L ${x + width} ${y + height - r}`);
    commands.push(`A ${r} ${r} 0 0 1 ${x + width - r} ${y + height}`);
  } else {
    commands.push(`L ${x + width} ${y + height}`);
  }

  // Bottom edge to bottom-left
  if (roundLeft) {
    commands.push(`L ${x + r} ${y + height}`);
    commands.push(`A ${r} ${r} 0 0 1 ${x} ${y + height - r}`);
  } else {
    commands.push(`L ${x} ${y + height}`);
  }

  // Left edge back to start
  if (roundLeft) {
    commands.push(`L ${x} ${y + r}`);
    commands.push(`A ${r} ${r} 0 0 1 ${x + r} ${y}`);
  } else {
    commands.push(`L ${x} ${y}`);
  }

  commands.push("Z");
  return commands.join(" ");
}

// Calculate content-aware label width
function calculateLabelWidth(label: string): number {
  // Approximate text width for 11px Verdana font (~6.5px per character)
  const textWidth = label.length * 6.5;

  // Add padding (8px on each side = 16px total)
  const paddedWidth = textWidth + 16;

  // Apply constraints: min 40px, max 120px
  return Math.min(Math.max(paddedWidth, 40), 120);
}
