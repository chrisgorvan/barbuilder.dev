import { test, expect } from "@playwright/test";

test.describe("Builder page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
  });

  test("has correct title", async ({ page }) => {
    await expect(page).toHaveTitle("BarBuilder — Builder");
  });

  test("displays builder heading and description", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "Builder" }),
    ).toBeVisible();
    await expect(
      page.getByText("Configure your progress bar and copy the URL"),
    ).toBeVisible();
  });

  test("shows all progress type options", async ({ page }) => {
    await expect(page.getByRole("radio", { name: "Percentage" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "X of Y" })).toBeVisible();
    await expect(
      page.getByRole("radio", { name: "Icon (Stars)" }),
    ).toBeVisible();
  });

  test("percentage type is selected by default", async ({ page }) => {
    await expect(
      page.getByRole("radio", { name: "Percentage" }),
    ).toBeChecked();
    await expect(
      page.getByRole("slider", { name: "Percentage (0-100)" }),
    ).toBeVisible();
  });

  test("shows all style buttons", async ({ page }) => {
    for (const style of ["Classic", "Pill", "Minimal", "Badge", "Segments"]) {
      await expect(
        page.locator(`#styleSelector button[data-style]`, { hasText: style }),
      ).toBeVisible();
    }
  });

  test("preview image loads with default URL", async ({ page }) => {
    const preview = page.locator("#previewImage");
    await expect(preview).toHaveAttribute("src", /\/percentage\/75/);
  });

  test("generated URL is displayed", async ({ page }) => {
    const urlDisplay = page.locator("#generatedUrl");
    await expect(urlDisplay).toContainText("/percentage/75");
  });

  test("shows copy buttons for URL, MD, and HTML", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /URL/i }).first(),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "MD" })).toBeVisible();
    await expect(page.getByRole("button", { name: "HTML" })).toBeVisible();
  });

  test("preview background toggle works", async ({ page }) => {
    const container = page.locator("#previewContainer");
    await expect(container).not.toHaveClass(/dark-bg/);
    await page.getByRole("button", { name: "Dark BG" }).click();
    await expect(container).toHaveClass(/dark-bg/);
    await page.getByRole("button", { name: "Light BG" }).click();
    await expect(container).not.toHaveClass(/dark-bg/);
  });
});

test.describe("Builder — progress type switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
  });

  test("switching to X of Y shows current/total inputs", async ({ page }) => {
    await page.getByRole("radio", { name: "X of Y" }).check();
    await expect(page.locator("#currentValue")).toBeVisible();
    await expect(page.locator("#totalValue")).toBeVisible();
    await page.waitForTimeout(400);
    await expect(page.locator("#generatedUrl")).toContainText("/xofy/");
  });

  test("switching to Icon shows current/total and shape selector", async ({
    page,
  }) => {
    await page.getByRole("radio", { name: "Icon (Stars)" }).check();
    await expect(page.locator("#currentValue")).toBeVisible();
    await expect(page.locator("#totalValue")).toBeVisible();
    // Shape section becomes visible, style section hides
    await expect(page.locator("#shapeSection")).toBeVisible();
    await expect(page.locator("#styleSection")).toBeHidden();
    await page.waitForTimeout(400);
    await expect(page.locator("#generatedUrl")).toContainText("/icon/");
  });

  test("switching back to percentage restores slider", async ({ page }) => {
    await page.getByRole("radio", { name: "X of Y" }).check();
    await page.getByRole("radio", { name: "Percentage" }).check();
    await expect(
      page.getByRole("slider", { name: "Percentage (0-100)" }),
    ).toBeVisible();
    await expect(page.locator("#styleSection")).toBeVisible();
  });
});

test.describe("Builder — style selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
  });

  test("selecting pill style updates URL", async ({ page }) => {
    await page
      .locator('#styleSelector button[data-style="pill"]')
      .click();
    await page.waitForTimeout(400);
    await expect(page.locator("#generatedUrl")).toContainText("style=pill");
  });

  test("selecting segments style shows segments input", async ({ page }) => {
    await page
      .locator('#styleSelector button[data-style="segments"]')
      .click();
    await expect(page.locator("#segmentsGroup")).toBeVisible();
  });

  test("segments input is hidden for non-segments styles", async ({ page }) => {
    await expect(page.locator("#segmentsGroup")).toBeHidden();
  });
});

test.describe("Builder — colour selection", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
  });

  test("clicking a colour chip updates the hex input", async ({ page }) => {
    await page.locator('.color-chip[data-color="ff6b6b"]').click();
    await expect(page.locator("#colorHex")).toHaveValue("#ff6b6b");
  });

  test("typing a hex value updates the preview URL", async ({ page }) => {
    await page.locator("#colorHex").fill("#abc123");
    await page.locator("#colorHex").dispatchEvent("input");
    await page.waitForTimeout(400);
    await expect(page.locator("#generatedUrl")).toContainText("color=abc123");
  });
});

test.describe("Builder — label", () => {
  test("typing a label updates the URL and char count", async ({ page }) => {
    await page.goto("/builder");
    const labelInput = page.locator("#label");
    await labelInput.fill("Build");
    await labelInput.dispatchEvent("input");
    await page.waitForTimeout(400);
    await expect(page.locator("#labelCount")).toHaveText("5/50");
    await expect(page.locator("#generatedUrl")).toContainText("label=Build");
  });
});

test.describe("Builder — theme", () => {
  test("switching to dark theme updates URL", async ({ page }) => {
    await page.goto("/builder");
    await page.getByRole("button", { name: "Dark", exact: true }).click();
    await page.waitForTimeout(400);
    await expect(page.locator("#generatedUrl")).toContainText("theme=dark");
  });
});

test.describe("Builder — width", () => {
  test("changing width updates URL", async ({ page }) => {
    await page.goto("/builder");
    const widthInput = page.locator("#width");
    await widthInput.fill("350");
    await widthInput.dispatchEvent("input");
    await page.waitForTimeout(400);
    await expect(page.locator("#generatedUrl")).toContainText("width=350");
  });
});

test.describe("Builder — presets", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
  });

  test("GitHub Build Status preset applies correct state", async ({
    page,
  }) => {
    await page.locator("#presetSelector").selectOption("github-build");
    await page.waitForTimeout(400);
    await expect(page.locator("#generatedUrl")).toContainText(
      "/percentage/100",
    );
    await expect(page.locator("#generatedUrl")).toContainText("style=badge");
    await expect(page.locator("#generatedUrl")).toContainText("label=Build");
  });

  test("Star Rating preset switches to icon type", async ({ page }) => {
    await page.locator("#presetSelector").selectOption("star-rating");
    await page.waitForTimeout(400);
    await expect(
      page.getByRole("radio", { name: "Icon (Stars)" }),
    ).toBeChecked();
    await expect(page.locator("#generatedUrl")).toContainText("/icon/");
    await expect(page.locator("#generatedUrl")).toContainText("label=Rating");
  });

  test("Task Tracker preset uses segments style", async ({ page }) => {
    await page.locator("#presetSelector").selectOption("task-tracker");
    await page.waitForTimeout(400);
    await expect(page.locator("#generatedUrl")).toContainText("/xofy/7/10");
    await expect(page.locator("#generatedUrl")).toContainText("style=segments");
  });
});

test.describe("Builder — URL hash state", () => {
  test("state is encoded in the URL hash", async ({ page }) => {
    await page.goto("/builder");
    await page.waitForTimeout(400);
    const url = page.url();
    expect(url).toContain("#");
    // Hash should be a base64-encoded JSON string
    const hash = new URL(url).hash.substring(1);
    const decoded = JSON.parse(atob(hash));
    expect(decoded.type).toBe("percentage");
    expect(decoded.value).toBe(75);
  });

  test("loading a URL with hash restores state", async ({ page }) => {
    const state = {
      type: "xofy",
      value: 75,
      current: 8,
      total: 12,
      style: "pill",
      color: "ff6b6b",
      theme: "dark",
      label: "Tasks",
      segments: 10,
      width: 300,
      shape: "star",
    };
    const hash = btoa(JSON.stringify(state));
    await page.goto(`/builder#${hash}`);
    await page.waitForTimeout(400);

    await expect(page.getByRole("radio", { name: "X of Y" })).toBeChecked();
    await expect(page.locator("#generatedUrl")).toContainText("/xofy/8/12");
    await expect(page.locator("#generatedUrl")).toContainText("style=pill");
    await expect(page.locator("#generatedUrl")).toContainText("color=ff6b6b");
    await expect(page.locator("#generatedUrl")).toContainText("theme=dark");
    await expect(page.locator("#generatedUrl")).toContainText("label=Tasks");
    await expect(page.locator("#generatedUrl")).toContainText("width=300");
  });
});
