import type { ProgressConfig, ProgressType, StyleName, ThemeMode, IconShape } from "@barbuilder/core";
import {
  parseColor,
  parseGradient,
  parseThresholdSteps,
  getThemeDefaults,
  validatePercentage,
  validateInteger,
  validateDecimal,
  validateStyle,
  validateLabel,
  validateSegments,
  validateWidth,
  generateErrorSVG,
  generatePercentage,
  generateXofY,
  generateIcon,
  renderClassic,
  renderPill,
  renderMinimal,
  renderBadge,
  renderSegments,
  renderIconDisplay,
} from "@barbuilder/core";

// Common security headers for all responses
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
  "X-XSS-Protection": "0",
};

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Health check endpoint
    if (pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          service: "barbuilder-worker",
        }),
        {
          headers: { "Content-Type": "application/json", ...SECURITY_HEADERS },
        },
      );
    }

    try {
      // Parse route and generate SVG
      const svg = await handleProgressRoute(pathname, url.searchParams);

      // Return SVG with cache headers
      return new Response(svg, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=31536000, immutable",
          Vary: "Accept-Encoding",
          "Surrogate-Key": generateSurrogateKeys(
            pathname,
            url.searchParams,
          ).join(" "),
          ...SECURITY_HEADERS,
        },
      });
    } catch (error) {
      // Return error as SVG (sanitise message to prevent reflection)
      const rawMessage =
        error instanceof Error
          ? error.message
          : "Unable to generate progress bar";
      const safeMessage = rawMessage.replace(/[<>&"']/g, "");
      const errorSvg = generateErrorSVG(`Error: ${safeMessage}`);

      return new Response(errorSvg, {
        status: 400,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "no-store",
          ...SECURITY_HEADERS,
        },
      });
    }
  },
};

// Handle progress bar routes
async function handleProgressRoute(
  pathname: string,
  searchParams: URLSearchParams,
): Promise<string> {
  // Match routes
  const percentageMatch = pathname.match(/^\/percentage\/([^/]+)$/);
  const xofyMatch = pathname.match(/^\/xofy\/([^/]+)\/([^/]+)$/);
  const iconMatch = pathname.match(/^\/icon\/([^/]+)\/([^/]+)$/);

  let config: ProgressConfig;

  if (percentageMatch) {
    // /percentage/:value
    const value = percentageMatch[1];
    config = parseProgressRequest("percentage", { value }, searchParams);
  } else if (xofyMatch) {
    // /xofy/:current/:total
    const current = xofyMatch[1];
    const total = xofyMatch[2];
    config = parseProgressRequest("xofy", { current, total }, searchParams);
  } else if (iconMatch) {
    // /icon/:current/:total
    const current = iconMatch[1];
    const total = iconMatch[2];
    config = parseProgressRequest("icon", { current, total }, searchParams);
  } else {
    throw new Error("Unknown route");
  }

  // Apply generator and render
  const processedConfig = applyGenerator(config);
  return renderProgressBar(processedConfig);
}

// Parse request parameters and build configuration
function parseProgressRequest(
  type: ProgressType,
  params: Record<string, string>,
  searchParams: URLSearchParams,
): ProgressConfig {
  // Parse theme first (affects defaults)
  const theme =
    (searchParams.get("theme")?.toLowerCase() as ThemeMode) || "light";
  const themeDefaults = getThemeDefaults(theme);

  // Validate style
  const style =
    (searchParams.get("style")?.toLowerCase() as StyleName) || "classic";
  const styleValidation = validateStyle(style);
  if (!styleValidation.valid) {
    throw new Error(styleValidation.error);
  }

  // Initialize config with defaults
  const config: ProgressConfig = {
    type,
    value: 0,
    style,
    width: 200,
    height: 20,
    colorMode: "single",
    color: themeDefaults.progressColor,
    backgroundColor: themeDefaults.backgroundColor,
    theme,
    label: "",
  };

  // Parse width override if provided
  const widthParam = searchParams.get("width");
  if (widthParam) {
    const widthValidation = validateWidth(widthParam);
    if (!widthValidation.valid) {
      throw new Error(widthValidation.error);
    }
    config.width = parseInt(widthParam, 10);
  }

  // Parse type-specific values
  switch (type) {
    case "percentage":
      const validation = validatePercentage(params.value);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      config.value = parseFloat(params.value);
      break;

    case "xofy":
      const currentValXofY = validateInteger(
        params.current,
        0,
        999999,
        "current",
      );
      const totalValXofY = validateInteger(params.total, 1, 999999, "total");

      if (!currentValXofY.valid) throw new Error(currentValXofY.error);
      if (!totalValXofY.valid) throw new Error(totalValXofY.error);

      config.current = parseInt(params.current, 10);
      config.total = parseInt(params.total, 10);
      break;

    case "icon":
      const currentVal = validateDecimal(params.current, 0, 50, "current");
      const totalVal = validateInteger(params.total, 1, 50, "total");

      if (!currentVal.valid) throw new Error(currentVal.error);
      if (!totalVal.valid) throw new Error(totalVal.error);

      config.current = parseFloat(params.current);
      config.total = parseInt(params.total, 10);
      break;
  }

  // Parse color mode
  const colorSteps = searchParams.get("colorSteps");
  const colorFrom = searchParams.get("colorFrom");
  const colorTo = searchParams.get("colorTo");
  const color = searchParams.get("color");

  if (colorSteps) {
    config.colorMode = "threshold";
    config.colorSteps = parseThresholdSteps(colorSteps);
  } else if (colorFrom && colorTo) {
    config.colorMode = "gradient";
    const gradient = parseGradient(colorFrom, colorTo);
    config.colorFrom = gradient.from;
    config.colorTo = gradient.to;
  } else if (color) {
    config.colorMode = "single";
    config.color = parseColor(color);
  }

  // Parse background color override
  const bgColor = searchParams.get("backgroundColor");
  if (bgColor) {
    config.backgroundColor = parseColor(bgColor);
  }

  // Parse label
  const label = searchParams.get("label");
  if (label) {
    config.label = validateLabel(label);
  }

  // Parse segments (for segments style)
  const segments = searchParams.get("segments");
  if (segments) {
    const segVal = validateSegments(segments);
    if (!segVal.valid) throw new Error(segVal.error);
    config.segments = parseInt(segments, 10);
  }

  // Parse shape (for icon type)
  const shape = searchParams.get("shape");
  if (shape) {
    const validShapes: IconShape[] = ["8bit-heart", "circle", "heart", "star"];
    const normalizedShape = shape.toLowerCase() as IconShape;
    if (validShapes.includes(normalizedShape)) {
      config.shape = normalizedShape;
    }
  }

  return config;
}

// Apply type-specific generator
function applyGenerator(config: ProgressConfig): ProgressConfig {
  switch (config.type) {
    case "percentage":
      return generatePercentage(config);
    case "xofy":
      return generateXofY(config);
    case "icon":
      return generateIcon(config);
    default:
      return config;
  }
}

// Render progress bar with appropriate style
function renderProgressBar(config: ProgressConfig): string {
  // Icon type uses special icon-only renderer
  if (config.type === "icon") {
    return renderIconDisplay(config);
  }

  // Other types use style-based rendering
  switch (config.style) {
    case "classic":
      return renderClassic(config);
    case "pill":
      return renderPill(config);
    case "minimal":
      return renderMinimal(config);
    case "badge":
      return renderBadge(config);
    case "segments":
      return renderSegments(config);
    default:
      throw new Error(`Unknown style: ${config.style}`);
  }
}

// Sanitise a value for use in a Surrogate-Key token (alphanumeric + hyphens only)
function sanitiseKeyToken(value: string): string {
  return value.replace(/[^a-zA-Z0-9-]/g, "").substring(0, 30);
}

// Generate Surrogate-Key values for cache management
function generateSurrogateKeys(
  pathname: string,
  params: URLSearchParams,
): string[] {
  const keys: string[] = ["version-1"];

  // Extract progress type from path
  const pathMatch = pathname.match(/^\/([^/]+)/);
  if (pathMatch) {
    keys.push(`type-${sanitiseKeyToken(pathMatch[1])}`);
  }

  // Extract style
  const style = sanitiseKeyToken(params.get("style") || "classic");
  keys.push(`style-${style}`);

  // Determine color mode
  if (params.has("colorSteps")) {
    keys.push("color-threshold");
  } else if (params.has("colorFrom") && params.has("colorTo")) {
    keys.push("color-gradient");
  } else {
    keys.push("color-single");
  }

  // Extract theme
  const theme = sanitiseKeyToken(params.get("theme") || "light");
  keys.push(`theme-${theme}`);

  return keys;
}
