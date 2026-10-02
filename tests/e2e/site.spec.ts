import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("public pages and accessible layout", async ({ page }, testInfo) => {
  for (const path of [
    "/",
    "/mekan",
    "/hikayeniz",
    "/sikca-sorulan-sorular",
    "/iletisim",
    "/gizlilik",
    "/planla",
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    if (path === "/")
      await page.screenshot({
        path: `/tmp/kiana-${testInfo.project.name}.png`,
        fullPage: true,
      });
    await expect(page.locator("h1")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
  }
});
test("planning validates and never reports a sent reservation", async ({
  page,
}) => {
  await page.goto("/planla");
  await page.getByRole("button", { name: "Planımı görüntüle" }).click();
  await expect(page.locator("#plan-error")).toBeVisible();
  await page.getByLabel("Düşündüğünüz tarih").fill("2090-06-15");
  await page.getByLabel("Yaklaşık davetli sayısı").fill("150");
  await page.getByRole("button", { name: "Planımı görüntüle" }).click();
  await expect(page.getByText("Henüz bir talep gönderilmedi.")).toBeVisible();
  await expect(page.getByText("150 kişi")).toBeVisible();
  await page.getByRole("button", { name: "Tercihlerimi düzenle" }).click();
  await expect(page.getByLabel("Yaklaşık davetli sayısı")).toHaveValue("150");
  await page.reload();
  await expect(page.getByLabel("Yaklaşık davetli sayısı")).toHaveValue("");
});
test("FAQ expands with keyboard and mobile menu supports Escape", async ({
  page,
  isMobile,
}) => {
  await page.goto("/");
  const question = page.locator("summary").first();
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("details").first()).toHaveAttribute("open", "");
  if (isMobile) {
    await page.getByRole("button", { name: "Menü" }).click();
    await expect(
      page.getByRole("navigation", { name: "Ana menü" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Menü" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  }
});
test("health is minimal and no-store; unknown route returns 404", async ({
  request,
}) => {
  const health = await request.get("/api/health");
  expect(await health.json()).toEqual({ status: "ok", version: "0.1.0" });
  expect(health.headers()["cache-control"]).toBe("no-store");
  expect(health.headers()["x-content-type-options"]).toBe("nosniff");
  expect((await request.get("/missing-page")).status()).toBe(404);
});
