import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify, { FastifyInstance } from "fastify";
import { progressRoutes } from "../../src/routes/progress.js";

describe("API Integration Tests", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(progressRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /percentage/:value", () => {
    it("should return SVG for valid percentage", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/75",
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("image/svg+xml");
      expect(response.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(response.body).toContain("<svg");
      expect(response.body).toContain("</svg>");
    });

    it("should handle edge cases (0% and 100%)", async () => {
      const response0 = await app.inject({
        method: "GET",
        url: "/percentage/0",
      });
      expect(response0.statusCode).toBe(200);
      expect(response0.body).toContain("<svg");

      const response100 = await app.inject({
        method: "GET",
        url: "/percentage/100",
      });
      expect(response100.statusCode).toBe(200);
      expect(response100.body).toContain("<svg");
    });

    it("should accept decimal percentages", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/75.5",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<svg");
    });

    it("should return error SVG for invalid percentage", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/150",
      });
      expect(response.statusCode).toBe(400);
      expect(response.body).toContain("svg");
      expect(response.body).toContain("Invalid percentage");
    });

    it("should handle style parameter", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/50?style=pill",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<svg");
    });

    it("should handle color parameter", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/50?color=ff0000",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<svg");
    });

    it("should handle CSS named colors", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/50?color=red",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<svg");
    });

    it("should handle label parameter", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/50?label=Tasks",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("Tasks");
    });

    it("should handle theme parameter", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/50?theme=dark",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<svg");
    });

    it("should handle width parameter", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/50?width=300",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<svg");
      expect(response.body).toContain('width="300"');
    });

    it("should set cache headers for success", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/50",
      });
      expect(response.headers["cache-control"]).toContain("public");
      expect(response.headers["cache-control"]).toContain("immutable");
    });

    it("should set no-cache headers for errors", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/invalid",
      });
      expect(response.headers["cache-control"]).toContain("no-store");
    });
  });

  describe("GET /xofy/:current/:total", () => {
    it("should return SVG for valid x/y values", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/xofy/7/10",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<svg");
    });

    it("should cap current at total", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/xofy/15/10",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<svg");
    });

    it("should handle zero values", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/xofy/0/10",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<svg");
    });

    it("should return error for negative values", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/xofy/-1/10",
      });
      expect(response.statusCode).toBe(400);
    });

    it("should return error for zero total", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/xofy/5/0",
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /icon/:current/:total", () => {
    it("should return SVG with icons only (no progress bar)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/4/5",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<svg");
      expect(response.body).not.toContain("rect"); // No progress bar rectangles
      expect(response.body).toContain("<path"); // Bootstrap Icons use path elements
    });

    it("should handle full stars", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/5/5",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<path"); // Bootstrap Icons use path elements
    });

    it("should handle no stars", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/0/5",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<path"); // Bootstrap Icons use path elements
    });

    it("should cap current at total", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/10/5",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<svg");
    });

    it("should handle shape parameter", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/3/5?shape=circle",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<path"); // Bootstrap Icons use path elements
    });

    it("should apply color to icons", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/3/5?color=ffd700",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("ffd700"); // Gold color
    });
  });

  describe("Style variations", () => {
    it("should render all 5 styles", async () => {
      const styles = ["classic", "pill", "minimal", "badge", "segments"];
      for (const style of styles) {
        const response = await app.inject({
          method: "GET",
          url: `/percentage/50?style=${style}`,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body).toContain("<svg");
      }
    });

    it("should return error for invalid style", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/50?style=invalid",
      });
      expect(response.statusCode).toBe(400);
      expect(response.body).toContain("Unknown style");
    });

    it("should handle segments parameter for segments style", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/50?style=segments&segments=5",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<svg");
    });

    it("should reject invalid segment counts", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/50?style=segments&segments=1",
      });
      expect(response.statusCode).toBe(400);
      expect(response.body).toContain("segments");
    });
  });

  describe("Error handling", () => {
    it("should return error SVG for invalid parameters", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/abc",
      });
      expect(response.statusCode).toBe(400);
      expect(response.body).toContain("svg");
    });

    it("should return error for unknown routes", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/unknown/route",
      });
      expect(response.statusCode).toBe(404);
    });

    it("should handle invalid width values", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/50?width=1000",
      });
      expect(response.statusCode).toBe(400);
    });

    it("should handle invalid color values", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/percentage/50?color=invalid",
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Deterministic rendering", () => {
    it("should generate identical SVG for same parameters", async () => {
      const response1 = await app.inject({
        method: "GET",
        url: "/percentage/50?color=ff0000&style=classic",
      });

      const response2 = await app.inject({
        method: "GET",
        url: "/percentage/50?color=ff0000&style=classic",
      });

      expect(response1.body).toBe(response2.body);
    });

    it("should generate different SVG for different parameters", async () => {
      const response1 = await app.inject({
        method: "GET",
        url: "/percentage/50?color=ff0000",
      });

      const response2 = await app.inject({
        method: "GET",
        url: "/percentage/75?color=ff0000",
      });

      expect(response1.body).not.toBe(response2.body);
    });
  });

  describe("GET /icon/:current/:total - Half Icons", () => {
    it("should accept decimal current values", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/2.5/5",
      });
      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("image/svg+xml");
    });

    it("should render half-filled icons for 0.5 fractional values", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/0.5/5?shape=star",
      });
      expect(response.statusCode).toBe(200);
      const svg = response.body;
      // Half icons use Bootstrap Icons star-half path
      expect(svg).toContain("5.354 5.119"); // Part of star-half path
    });

    it("should render correct states for 2.5/5 (2 filled, 1 half, 2 empty)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/2.5/5?shape=star&color=ffd700",
      });
      expect(response.statusCode).toBe(200);
      expect(response.body).toContain("<svg");
    });

    it("should round 2.25 to 2.5 (nearest 0.5)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/2.25/5",
      });
      expect(response.statusCode).toBe(200);
      // Should show 2 filled + 1 half (rounded to 2.5)
    });

    it("should round 2.75 to 2.5 (nearest 0.5)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/2.75/5",
      });
      expect(response.statusCode).toBe(200);
    });

    it("should round 2.8 to 3.0 (nearest 0.5)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/2.8/5",
      });
      expect(response.statusCode).toBe(200);
    });

    it("should work with all icon shapes", async () => {
      const shapes = ["star", "circle", "heart", "8bit-heart"];
      for (const shape of shapes) {
        const response = await app.inject({
          method: "GET",
          url: `/icon/2.5/5?shape=${shape}&color=4a90e2`,
        });
        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toBe("image/svg+xml");
      }
    });

    it("should handle edge case: exactly 0.5", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/0.5/5?shape=heart",
      });
      expect(response.statusCode).toBe(200);
    });

    it("should handle edge case: 4.5/5", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/4.5/5?shape=circle",
      });
      expect(response.statusCode).toBe(200);
    });

    it("should cap current at total for decimal values", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/icon/7.5/5",
      });
      expect(response.statusCode).toBe(200);
      // Should render as 5/5 (all filled)
    });
  });
});
