import type { ProgressConfig, IconFillState } from "../core/types.js";
import { SVGBuilder } from "../core/svg-builder.js";
import { renderIcon } from "../core/icon-renderer.js";
import { getContrastingTextColor } from "../core/colors.js";

// Render icon-only progress display
export function renderIconDisplay(config: ProgressConfig): string {
  const current = config.current || 0;
  const total = config.total || 5;
  const shape = config.shape || "star";

  const iconSize = 8; // Icon radius/size
  const iconSpacing = 20; // Space between icons
  const padding = 4;

  // Calculate label width if label is provided
  const hasLabel = config.label && config.label.length > 0;
  const labelWidth = hasLabel ? calculateLabelWidth(config.label) : 0;

  const iconsWidth = total * iconSpacing + padding * 2;
  const width = labelWidth + iconsWidth;
  const height = 20;
  const centerY = height / 2;

  const builder = new SVGBuilder(width, height);

  // Add label background and text if label provided
  if (hasLabel) {
    const labelBg = config.theme === "dark" ? "#1a1a1a" : "#555555";
    const labelPath = createRoundedRect(
      0,
      0,
      labelWidth,
      height,
      3,
      true,
      false,
    );
    builder.addBackgroundPath(labelPath, labelBg);

    const labelTextColor = getContrastingTextColor(labelBg);
    builder.addText(8, 14, config.label, labelTextColor, 11, "start");
  }

  // Render each icon
  for (let i = 0; i < total; i++) {
    const iconX = labelWidth + padding + i * iconSpacing + iconSize;

    // Round current to nearest 0.5 for visual clarity
    const roundedCurrent = Math.round(current * 2) / 2;

    // Determine fill state based on rounded current value
    let fillState: IconFillState;

    if (i < Math.floor(roundedCurrent)) {
      // Icons before the fractional position are fully filled
      fillState = "filled";
    } else if (i === Math.floor(roundedCurrent) && roundedCurrent % 1 !== 0) {
      // The icon at the fractional position gets half-filled
      fillState = "half";
    } else {
      // Icons after the current position are unfilled
      fillState = "unfilled";
    }

    const iconSvg = renderIcon(
      iconX,
      centerY,
      iconSize,
      shape,
      fillState,
      config.color,
    );
    builder.addRawSVG(iconSvg);
  }

  return builder.build();
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
