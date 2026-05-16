import { test, expect } from "@playwright/test";

const API_BASE = "http://localhost:8787";

test.describe("API — percentage endpoint", () => {
  test("returns SVG for valid percentage", async ({ request }) => {
    const response = await request.get(`${API_BASE}/percentage/75`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/svg+xml");
    const body = await response.text();
    expect(body).toContain("<svg");
  });

  test("returns SVG with style parameter", async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/percentage/50?style=pill`,
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/svg+xml");
  });

  test("returns SVG with colour and label", async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/percentage/90?color=ff6b6b&label=Build`,
    );
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<svg");
    expect(body).toContain("Build");
  });

  test("returns error for invalid percentage", async ({ request }) => {
    const response = await request.get(`${API_BASE}/percentage/150`);
    expect(response.status()).toBe(400);
  });

  test("returns SVG with dark theme", async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/percentage/60?theme=dark`,
    );
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<svg");
  });
});

test.describe("API — xofy endpoint", () => {
  test("returns SVG for valid x of y", async ({ request }) => {
    const response = await request.get(`${API_BASE}/xofy/7/10`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/svg+xml");
    const body = await response.text();
    expect(body).toContain("<svg");
  });

  test("returns SVG with segments style", async ({ request }) => {
    const response = await request.get(
      `${API_BASE}/xofy/3/5?style=segments`,
    );
    expect(response.status()).toBe(200);
  });
});

test.describe("API — icon endpoint", () => {
  test("returns SVG for star rating", async ({ request }) => {
    const response = await request.get(`${API_BASE}/icon/4/5`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/svg+xml");
    const body = await response.text();
    expect(body).toContain("<svg");
  });

  test("supports half-fill values", async ({ request }) => {
    const response = await request.get(`${API_BASE}/icon/3.5/5`);
    expect(response.status()).toBe(200);
  });

  test("supports different icon shapes", async ({ request }) => {
    for (const shape of ["heart", "circle", "8bit-heart"]) {
      const response = await request.get(
        `${API_BASE}/icon/3/5?shape=${shape}`,
      );
      expect(response.status()).toBe(200);
    }
  });
});

test.describe("API — health endpoint", () => {
  test("returns 200 OK", async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    expect(response.status()).toBe(200);
  });
});

test.describe("API — caching headers", () => {
  test("successful responses include cache-control header", async ({
    request,
  }) => {
    const response = await request.get(`${API_BASE}/percentage/50`);
    expect(response.status()).toBe(200);
    const cacheControl = response.headers()["cache-control"];
    expect(cacheControl).toBeDefined();
  });
});

test.describe("API — all styles produce valid SVG", () => {
  const styles = ["classic", "pill", "minimal", "badge", "segments"];

  for (const style of styles) {
    test(`style=${style} returns valid SVG`, async ({ request }) => {
      const response = await request.get(
        `${API_BASE}/percentage/65?style=${style}`,
      );
      expect(response.status()).toBe(200);
      const body = await response.text();
      expect(body).toContain("<svg");
      expect(body).toContain("</svg>");
    });
  }
});
