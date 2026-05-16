import type { ThresholdStep, ProgressConfig } from "./types.js";

// CSS named colors mapping (subset of most common colors)
const CSS_COLOR_MAP: Record<string, string> = {
  // Reds
  red: "#ff0000",
  crimson: "#dc143c",
  tomato: "#ff6347",
  coral: "#ff7f50",
  indianred: "#cd5c5c",
  salmon: "#fa8072",
  darksalmon: "#e9967a",
  lightcoral: "#f08080",
  lightsalmon: "#ffa07a",

  // Oranges
  orange: "#ffa500",
  orangered: "#ff4500",
  darkorange: "#ff8c00",

  // Yellows
  yellow: "#ffff00",
  gold: "#ffd700",
  khaki: "#f0e68c",
  lightgoldenrodyellow: "#fafad2",
  lightyellow: "#ffffe0",

  // Greens
  green: "#008000",
  lime: "#00ff00",
  limegreen: "#32cd32",
  mediumseagreen: "#3cb371",
  springgreen: "#00ff7f",
  seagreen: "#2e8b57",
  forestgreen: "#228b22",
  darkgreen: "#006400",
  olive: "#808000",
  olivedrab: "#6b8e23",
  darkolivegreen: "#556b2f",
  lightgreen: "#90ee90",
  palegreen: "#98fb98",

  // Blues
  blue: "#0000ff",
  navy: "#000080",
  darkblue: "#00008b",
  mediumblue: "#0000cd",
  royalblue: "#4169e1",
  steelblue: "#4682b4",
  dodgerblue: "#1e90ff",
  deepskyblue: "#00bfff",
  cornflowerblue: "#6495ed",
  skyblue: "#87ceeb",
  lightskyblue: "#87cefa",
  lightsteelblue: "#b0c4de",
  lightblue: "#add8e6",
  powderblue: "#b0e0e6",
  teal: "#008080",
  darkcyan: "#008b8b",
  cyan: "#00ffff",
  aqua: "#00ffff",
  turquoise: "#40e0d0",
  mediumturquoise: "#48d1cc",
  darkturquoise: "#00ced1",
  cadetblue: "#5f9ea0",
  aquamarine: "#7fffd4",
  paleturquoise: "#afeeee",
  lightcyan: "#e0ffff",

  // Purples
  purple: "#800080",
  indigo: "#4b0082",
  darkmagenta: "#8b008b",
  darkviolet: "#9400d3",
  blueviolet: "#8a2be2",
  darkorchid: "#9932cc",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumslateblue: "#7b68ee",
  slateblue: "#6a5acd",
  darkslateblue: "#483d8b",
  rebeccapurple: "#663399",
  plum: "#dda0dd",
  violet: "#ee82ee",
  magenta: "#ff00ff",
  fuchsia: "#ff00ff",
  orchid: "#da70d6",
  mediumvioletred: "#c71585",
  deeppink: "#ff1493",
  hotpink: "#ff69b4",
  lavenderblush: "#fff0f5",
  pink: "#ffc0cb",
  lightpink: "#ffb6c1",

  // Browns
  maroon: "#800000",
  brown: "#a52a2a",
  saddlebrown: "#8b4513",
  sienna: "#a0522d",
  chocolate: "#d2691e",
  peru: "#cd853f",
  sandybrown: "#f4a460",
  burlywood: "#deb887",
  tan: "#d2b48c",
  rosybrown: "#bc8f8f",
  wheat: "#f5deb3",

  // Grays
  black: "#000000",
  dimgray: "#696969",
  dimgrey: "#696969",
  gray: "#808080",
  grey: "#808080",
  darkgray: "#a9a9a9",
  darkgrey: "#a9a9a9",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  silver: "#c0c0c0",
  lightgray: "#d3d3d3",
  lightgrey: "#d3d3d3",
  gainsboro: "#dcdcdc",
  whitesmoke: "#f5f5f5",
  white: "#ffffff",
};

// Parse color input (hex or CSS named color)
export function parseColor(input: string): string {
  const normalized = input.toLowerCase().trim();

  // Check if CSS named color
  if (CSS_COLOR_MAP[normalized]) {
    return CSS_COLOR_MAP[normalized];
  }

  // Parse hex color (3 or 6 digits)
  if (/^[0-9a-f]{3}$/i.test(normalized)) {
    // Expand 3-digit hex: 4c1 -> #44cc11
    return `#${normalized[0]}${normalized[0]}${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}`;
  }

  if (/^[0-9a-f]{6}$/i.test(normalized)) {
    return `#${normalized}`;
  }

  // Already has # prefix
  if (/^#[0-9a-f]{6}$/i.test(normalized)) {
    return normalized.toLowerCase();
  }

  throw new Error(`Invalid color '${input}' (use hex or CSS named color)`);
}

// Parse gradient colors
export function parseGradient(
  from: string,
  to: string,
): { from: string; to: string } {
  return {
    from: parseColor(from),
    to: parseColor(to),
  };
}

// Parse threshold steps from string format "33:red,66:yellow,100:green"
export function parseThresholdSteps(input: string): ThresholdStep[] {
  const steps: ThresholdStep[] = [];

  const pairs = input.split(",").map((p) => p.trim());
  for (const pair of pairs) {
    const [thresholdStr, colorStr] = pair.split(":").map((s) => s.trim());

    if (!thresholdStr || !colorStr) {
      throw new Error(`Invalid colorSteps format (use 'threshold:color,...')`);
    }

    const threshold = parseFloat(thresholdStr);
    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      throw new Error(
        `Invalid threshold '${thresholdStr}' in colorSteps (must be 0-100)`,
      );
    }

    const color = parseColor(colorStr);
    steps.push({ threshold, color });
  }

  // Sort by threshold
  steps.sort((a, b) => a.threshold - b.threshold);

  return steps;
}

// Get color for a value based on threshold steps
export function getColorForValue(
  value: number,
  steps: ThresholdStep[],
): string {
  // Find the appropriate color based on value
  for (let i = steps.length - 1; i >= 0; i--) {
    if (value >= steps[i].threshold) {
      return steps[i].color;
    }
  }

  // Fallback to first color
  return steps[0]?.color || "#44cc11";
}

// Generate SVG gradient definition
export function generateGradientDef(config: ProgressConfig): string {
  if (config.colorMode !== "gradient" || !config.colorFrom || !config.colorTo) {
    return "";
  }

  const id = generateGradientId(config);

  return `
    <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${config.colorFrom};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${config.colorTo};stop-opacity:1" />
    </linearGradient>
  `;
}

// Generate deterministic gradient ID from config
export function generateGradientId(config: ProgressConfig): string {
  const key = `${config.colorFrom}-${config.colorTo}`;
  // Simple hash function for Workers (no crypto needed for gradient IDs)
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `grad-${Math.abs(hash).toString(16).padStart(8, "0").substring(0, 8)}`;
}

// Helper to sort object keys for deterministic hashing
export function sortKeys(obj: unknown): unknown {
  if (typeof obj !== "object" || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map(sortKeys);

  const record = obj as Record<string, unknown>;
  return Object.keys(record)
    .sort()
    .reduce<Record<string, unknown>>((result, key) => {
      result[key] = sortKeys(record[key]);
      return result;
    }, {});
}

// Convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  return [
    parseInt(normalized.substring(0, 2), 16),
    parseInt(normalized.substring(2, 4), 16),
    parseInt(normalized.substring(4, 6), 16),
  ];
}

// Calculate relative luminance (WCAG 2.1)
export function getRelativeLuminance(hexColor: string): number {
  const rgb = hexToRgb(hexColor);
  const [r, g, b] = rgb.map((val) => {
    const normalized = val / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Get contrasting text color (returns '#ffffff' or '#000000')
export function getContrastingTextColor(backgroundColor: string): string {
  const luminance = getRelativeLuminance(backgroundColor);
  // WCAG threshold: 0.5 works well for most cases
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
