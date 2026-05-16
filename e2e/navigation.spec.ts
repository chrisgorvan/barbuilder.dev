import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("header nav contains all expected links", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation");
    await expect(nav.getByRole("link", { name: "BarBuilder" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(nav.getByRole("link", { name: "Features" })).toHaveAttribute(
      "href",
      "/#features",
    );
    await expect(nav.getByRole("link", { name: "Examples" })).toHaveAttribute(
      "href",
      "/#showcase",
    );
    await expect(
      nav.getByRole("link", { name: "API Documentation" }),
    ).toHaveAttribute("href", "/docs/api");
    await expect(
      nav.getByRole("link", { name: "Embedding Guide" }),
    ).toHaveAttribute("href", "/docs/embed");
    await expect(
      nav.getByRole("link", { name: "Get Started" }),
    ).toHaveAttribute("href", "/builder");
  });

  test("logo link navigates to homepage", async ({ page }) => {
    await page.goto("/builder");
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "BarBuilder" })
      .click();
    await expect(page).toHaveURL("/");
  });

  test("Get Started link navigates to builder", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Get Started" })
      .click();
    await expect(page).toHaveURL(/\/builder/);
  });

  test("API Documentation link navigates to docs", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "API Documentation" })
      .click();
    await expect(page).toHaveURL("/docs/api");
  });

  test("Embedding Guide link navigates to embed docs", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Embedding Guide" })
      .click();
    await expect(page).toHaveURL("/docs/embed");
  });
});

test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("displays all footer columns", async ({ page }) => {
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByText("Product")).toBeVisible();
    await expect(footer.getByText("Resources")).toBeVisible();
    await expect(footer.getByText("Community")).toBeVisible();
    await expect(footer.getByText("Policies")).toBeVisible();
  });

  test("footer contains key links", async ({ page }) => {
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: "Builder" })).toHaveAttribute(
      "href",
      "/builder",
    );
    await expect(
      footer.getByRole("link", { name: "API Documentation" }),
    ).toHaveAttribute("href", "/docs/api");
    await expect(
      footer.getByRole("link", { name: "Privacy Policy" }),
    ).toHaveAttribute("href", "/privacy");
    await expect(
      footer.getByRole("link", { name: "Terms of Use" }),
    ).toHaveAttribute("href", "/terms");
    await expect(
      footer.getByRole("link", { name: "Changelog" }),
    ).toHaveAttribute(
      "href",
      "https://github.com/chrisgorvan/barbuilder.dev/releases",
    );
  });

  test("displays copyright notice", async ({ page }) => {
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByText(/© 2026 BarBuilder/)).toBeVisible();
  });
});
