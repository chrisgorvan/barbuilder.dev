// Progress type definitions
export type ProgressType = "percentage" | "xofy" | "icon";
export type StyleName = "classic" | "pill" | "minimal" | "badge" | "segments";
export type IconShape = "8bit-heart" | "circle" | "heart" | "star";
export type IconFillState = "filled" | "half" | "unfilled";
export type ThemeMode = "light" | "dark";
export type ColorMode = "single" | "gradient" | "threshold";

// Main configuration interface for progress bar
export interface ProgressConfig {
  // Progress type and values
  type: ProgressType;
  value: number; // 0-100 normalized percentage
  current?: number; // For xofy/icon types
  total?: number; // For xofy/icon types

  // Style configuration
  style: StyleName;
  width: number;
  height: number;

  // Color configuration
  colorMode: ColorMode;
  color: string; // Hex color (#RRGGBB)
  colorFrom?: string; // Gradient start (hex)
  colorTo?: string; // Gradient end (hex)
  colorSteps?: ThresholdStep[];
  backgroundColor: string; // Hex color for unfilled area

  // Theme
  theme: ThemeMode;

  // Label
  label: string;

  // Advanced options
  segments?: number; // For segments style (2-20)
  shape?: IconShape; // For icon type (star, heart, circle, 8bit-heart)
}

// Threshold color step
export interface ThresholdStep {
  threshold: number; // 0-100
  color: string; // Hex color (#RRGGBB)
}

// SVG element groups for building
export interface SVGElements {
  defs: string; // Gradient/pattern definitions
  background: string; // Background rectangles
  progress: string; // Progress fill elements
  labels: string; // Text elements
  border?: string; // Optional border elements
}

// Style-specific configuration
export interface StyleConfig {
  defaultWidth: number;
  defaultHeight: number;
  borderRadius: number;
  hasBorder: boolean;
  hasLabels: boolean;
  padding: number;
}

// Theme default colors
export interface ThemeDefaults {
  backgroundColor: string;
  labelBackground: string;
  labelText: string;
  progressColor: string;
}

// Validation result
export interface ValidationResult {
  valid: boolean;
  error?: string;
}
