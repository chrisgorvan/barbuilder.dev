import type { SVGElements } from "./types.js";

// SVGBuilder class for constructing SVG documents
export class SVGBuilder {
  private width: number;
  private height: number;
  private elements: SVGElements;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.elements = {
      defs: "",
      background: "",
      progress: "",
      labels: "",
      border: "",
    };
  }

  // Add gradient or pattern definitions
  addDefs(content: string): this {
    this.elements.defs += content;
    return this;
  }

  // Add background rectangle
  addBackground(
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    rx: number = 0,
  ): this {
    const rect = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"${rx > 0 ? ` rx="${rx}"` : ""}/>`;
    this.elements.background += rect;
    return this;
  }

  // Add progress rectangle
  addProgress(
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    rx: number = 0,
  ): this {
    if (width <= 0) return this; // Don't render zero-width progress
    const rect = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}"${rx > 0 ? ` rx="${rx}"` : ""}/>`;
    this.elements.progress += rect;
    return this;
  }

  // Add path to background layer
  addBackgroundPath(d: string, fill: string): this {
    const path = `<path d="${d}" fill="${fill}"/>`;
    this.elements.background += path;
    return this;
  }

  // Add path to progress layer
  addProgressPath(d: string, fill: string): this {
    const path = `<path d="${d}" fill="${fill}"/>`;
    this.elements.progress += path;
    return this;
  }

  // Add raw SVG content to progress layer
  addRawSVG(svg: string): this {
    this.elements.progress += svg;
    return this;
  }

  // Add text element
  addText(
    x: number,
    y: number,
    content: string,
    fill: string,
    fontSize: number = 11,
    anchor: "start" | "middle" | "end" = "start",
  ): this {
    const escaped = escapeXml(content);
    const text = `<text x="${x}" y="${y}" fill="${fill}" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="${fontSize}" text-anchor="${anchor}">${escaped}</text>`;
    this.elements.labels += text;
    return this;
  }

  // Add border
  addBorder(
    x: number,
    y: number,
    width: number,
    height: number,
    stroke: string,
    strokeWidth: number = 1,
    rx: number = 0,
  ): this {
    const rect = `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}"${rx > 0 ? ` rx="${rx}"` : ""}/>`;
    this.elements.border = (this.elements.border || "") + rect;
    return this;
  }

  // Build final SVG string
  build(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}">
${this.elements.defs ? `  <defs>${this.elements.defs}\n  </defs>` : ""}
  ${this.elements.background}
  ${this.elements.progress}
  ${this.elements.border || ""}
  ${this.elements.labels}
</svg>`;
  }
}

// Generate error SVG
export function generateErrorSVG(message: string): string {
  const width = 400;
  const height = 40;
  const escaped = escapeXml(message);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="#ff6b6b"/>
  <text x="10" y="25" fill="#ffffff" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12">${escaped}</text>
</svg>`;
}

// Escape XML special characters (critical for security)
function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Normalize float values for deterministic rendering
export function normalizeValue(value: number): number {
  return Math.round(value * 10) / 10;
}
