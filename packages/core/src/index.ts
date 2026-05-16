// Core types
export type {
  ProgressType,
  StyleName,
  IconShape,
  IconFillState,
  ThemeMode,
  ColorMode,
  ProgressConfig,
  ThresholdStep,
  SVGElements,
  StyleConfig,
  ThemeDefaults,
  ValidationResult,
} from "./core/types.js";

// Core modules
export {
  parseColor,
  parseGradient,
  parseThresholdSteps,
  getColorForValue,
  generateGradientDef,
  generateGradientId,
  sortKeys,
  getRelativeLuminance,
  getContrastingTextColor,
} from "./core/colors.js";

export { getThemeDefaults } from "./core/theme.js";

export {
  validatePercentage,
  validateInteger,
  validateDecimal,
  validateStyle,
  validateProgressType,
  validateLabel,
  validateSegments,
  validateWidth,
} from "./core/validation.js";

export { SVGBuilder, generateErrorSVG, normalizeValue } from "./core/svg-builder.js";

export { renderIcon } from "./core/icon-renderer.js";

// Generators
export { generatePercentage } from "./generators/percentage.js";
export { generateXofY } from "./generators/xofy.js";
export { generateIcon } from "./generators/icon.js";

// Style renderers
export { renderClassic } from "./styles/classic.js";
export { renderPill } from "./styles/pill.js";
export { renderMinimal } from "./styles/minimal.js";
export { renderBadge } from "./styles/badge.js";
export { renderSegments } from "./styles/segments.js";
export { renderIconDisplay } from "./styles/icon.js";
