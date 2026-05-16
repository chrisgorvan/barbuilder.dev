import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has correct title and meta description", async ({ page }) => {
    await expect(page).toHaveTitle(
      "BarBuilder — Instant Progress Bars for Your Project",
    );
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute(
      "content",
      /embeddable SVG progress bars/,
    );
  });

  test("displays hero section with heading and CTAs", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: /Instant Progress Bars/,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Get Started" }).first(),
    ).toHaveAttribute("href", "/builder");
    await expect(
      page.getByRole("link", { name: "View Gallery" }),
    ).toHaveAttribute("href", "#showcase");
  });

  test("mini builder card shows live preview image", async ({ page }) => {
    const preview = page.locator("#mini-preview");
    await expect(preview).toHaveAttribute("src", /\/percentage\/75/);
  });

  test("mini builder value slider updates preview", async ({ page }) => {
    const slider = page.locator("#mini-value");
    await slider.fill("50");
    await slider.dispatchEvent("input");
    await expect(page.locator("#mini-value-display")).toHaveText("50");
    // Wait for debounced update
    await page.waitForTimeout(200);
    await expect(page.locator("#mini-preview")).toHaveAttribute(
      "src",
      /\/percentage\/50/,
    );
  });

  test("mini builder width slider updates preview", async ({ page }) => {
    const slider = page.locator("#mini-width");
    await slider.fill("300");
    await slider.dispatchEvent("input");
    await expect(page.locator("#mini-width-display")).toHaveText("300");
    await page.waitForTimeout(200);
    await expect(page.locator("#mini-preview")).toHaveAttribute(
      "src",
      /width=300/,
    );
  });

  test("mini builder colour chips change preview colour", async ({ page }) => {
    await page.locator('.card-colour-chip[data-color="4c71ff"]').click();
    await page.waitForTimeout(200);
    await expect(page.locator("#mini-preview")).toHaveAttribute(
      "src",
      /color=4c71ff/,
    );
    await expect(
      page.locator('.card-colour-chip[data-color="4c71ff"]'),
    ).toHaveClass(/selected/);
  });

  test("features section is visible", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 2, name: "Why BarBuilder?" }),
    ).toBeVisible();
    const features = page.locator(".feature-card");
    await expect(features).toHaveCount(4);
  });

  test("showcase section displays all example cards", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 2, name: "Showcase" }),
    ).toBeVisible();
    const cards = page.locator(".showcase-card");
    await expect(cards).toHaveCount(6);
  });

  test("showcase images point to API base", async ({ page }) => {
    const images = page.locator(".showcase-bar img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute("src");
      expect(src).toMatch(/localhost:8787/);
    }
  });
});
