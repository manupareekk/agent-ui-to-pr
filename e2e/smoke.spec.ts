import { expect, test } from "@playwright/test";

test("experiment host and pattern pill render", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("experiment-host")).toBeVisible({ timeout: 60_000 });
  await expect(page.locator(".pattern-pill")).toBeVisible();
});
