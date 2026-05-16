import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type {
  ProgressConfig,
  ProgressType,
  StyleName,
  ThemeMode,
  IconShape,
} from "@barbuilder/core";
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

// Query string interface
interface ProgressQuery {
  style?: string;
  color?: string;
  colorFrom?: string;
  colorTo?: string;
  colorSteps?: string;
  backgroundColor?: string;
  theme?: string;
  label?: string;
  segments?: string;
  width?: string;
  shape?: string;
}

// Register progress bar routes
export async function progressRoutes(fastify: FastifyInstance) {
  // Percentage route: /percentage/:value
  fastify.get<{ Params: { value: string }; Querystring: ProgressQuery }>(
    "/percentage/:value",
    async (request, reply) => {
      try {
        const config = parseProgressRequest(request, "percentage");
        const svg = renderProgressBar(config);
        return sendSVGResponse(reply, svg);
      } catch (error) {
        return sendErrorResponse(reply, error);
      }
    },
  );

  // X of Y route: /xofy/:current/:total
  fastify.get<{
    Params: { current: string; total: string };
    Querystring: ProgressQuery;
  }>("/xofy/:current/:total", async (request, reply) => {
    try {
      const config = parseProgressRequest(request, "xofy");
      const svg = renderProgressBar(config);
      return sendSVGResponse(reply, svg);
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });

  // Icon route: /icon/:current/:total
  fastify.get<{
    Params: { current: string; total: string };
    Querystring: ProgressQuery;
  }>("/icon/:current/:total", async (request, reply) => {
    try {
      const config = parseProgressRequest(request, "icon");
      const svg = renderProgressBar(config);
      return sendSVGResponse(reply, svg);
    } catch (error) {
      return sendErrorResponse(reply, error);
    }
  });
}

// Parse progress request and build configuration
function parseProgressRequest(
  request: FastifyRequest,
  type: ProgressType,
): ProgressConfig {
  const params = request.params as Record<string, string>;
  const query = request.query as ProgressQuery;

  // Parse theme first (affects defaults)
  const theme = (query.theme?.toLowerCase() as ThemeMode) || "light";
  const themeDefaults = getThemeDefaults(theme);

  // Validate style
  const style = (query.style?.toLowerCase() as StyleName) || "classic";
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
  if (query.width) {
    const widthValidation = validateWidth(query.width);
    if (!widthValidation.valid) {
      throw new Error(widthValidation.error);
    }
    config.width = parseInt(query.width, 10);
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
  if (query.colorSteps) {
    config.colorMode = "threshold";
    config.colorSteps = parseThresholdSteps(query.colorSteps);
  } else if (query.colorFrom && query.colorTo) {
    config.colorMode = "gradient";
    const gradient = parseGradient(query.colorFrom, query.colorTo);
    config.colorFrom = gradient.from;
    config.colorTo = gradient.to;
  } else if (query.color) {
    config.colorMode = "single";
    config.color = parseColor(query.color);
  }

  // Parse background color override
  if (query.backgroundColor) {
    config.backgroundColor = parseColor(query.backgroundColor);
  }

  // Parse label
  if (query.label) {
    config.label = validateLabel(query.label);
  }

  // Parse segments (for segments style)
  if (query.segments) {
    const segVal = validateSegments(query.segments);
    if (!segVal.valid) throw new Error(segVal.error);
    config.segments = parseInt(query.segments, 10);
  }

  // Parse shape (for icon type)
  if (query.shape) {
    const validShapes: IconShape[] = ["8bit-heart", "circle", "heart", "star"];
    const normalizedShape = query.shape.toLowerCase() as IconShape;
    if (validShapes.includes(normalizedShape)) {
      config.shape = normalizedShape;
    }
  }

  // Apply generator logic (auto-labels, calculations)
  return applyGenerator(config);
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

// Common security headers
function addSecurityHeaders(reply: FastifyReply): FastifyReply {
  return reply
    .header("X-Content-Type-Options", "nosniff")
    .header("X-Frame-Options", "DENY")
    .header(
      "Content-Security-Policy",
      "default-src 'none'; style-src 'unsafe-inline'",
    )
    .header("X-XSS-Protection", "0");
}

// Send successful SVG response
function sendSVGResponse(reply: FastifyReply, svg: string): FastifyReply {
  return addSecurityHeaders(reply)
    .code(200)
    .header("Content-Type", "image/svg+xml")
    .header("Cache-Control", "public, max-age=31536000, immutable")
    .header("Vary", "Accept-Encoding")
    .send(svg);
}

// Send error response as SVG
function sendErrorResponse(reply: FastifyReply, error: unknown): FastifyReply {
  // Sanitise message to prevent reflection attacks
  const rawMessage =
    error instanceof Error ? error.message : "Unable to generate progress bar";
  const message = rawMessage.replace(/[<>&"']/g, "");
  const svg = generateErrorSVG(`Error: ${message}`);

  return addSecurityHeaders(reply)
    .code(400)
    .header("Content-Type", "image/svg+xml")
    .header("Cache-Control", "no-store")
    .send(svg);
}
