import { test, expect } from "@playwright/test";

test.describe("API Documentation page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs/api");
  });

  test("has correct title", async ({ page }) => {
    await expect(page).toHaveTitle("BarBuilder — API Documentation");
  });

  test("displays sidebar navigation", async ({ page }) => {
    await expect(page.getByRole("complementary")).toBeVisible();
  });

  test("displays main content area", async ({ page }) => {
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("has header and footer", async ({ page }) => {
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});

test.describe("Embedding Guide page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/docs/embed");
  });

  test("has correct title", async ({ page }) => {
    await expect(page).toHaveTitle("BarBuilder — Embedding Guide");
  });

  test("has header and footer", async ({ page }) => {
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});

test.describe("Privacy Policy page", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveTitle("BarBuilder — Privacy Policy");
  });

  test("has header and footer", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});

test.describe("Terms of Use page", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/terms");
    await expect(page).toHaveTitle("BarBuilder — Terms of Use");
  });

  test("has header and footer", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("navigation")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });
});
