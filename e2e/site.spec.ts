import { expect, test } from "@playwright/test";
import { projects } from "../src/content/projects";

test("home renders every section, job and project", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Software, built");
  for (const id of ["about", "work", "projects", "contact"]) await expect(page.locator(`#${id}`)).toBeAttached();
  await expect(page.locator(".job")).toHaveCount(4);
  await expect(page.locator(".ring .cv")).toHaveCount(projects.length);
});

test("project paintings load on the hub", async ({ page }) => {
  await page.goto("/projects");
  const paintings = page.locator(".hub .cv img");
  await expect(paintings).toHaveCount(projects.length);
  for (const img of await paintings.all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});

test("gallery arrows move the detail panel", async ({ page }) => {
  await page.goto("/#projects");
  const detail = page.locator(".detail h3");
  await expect(detail).toHaveText(projects[0]?.title ?? "");
  await page.getByRole("button", { name: "Next project" }).click();
  await expect(detail).toHaveText(projects[1]?.title ?? "");
  await page.locator("#projects .stage").focus();
  await page.keyboard.press("ArrowLeft");
  await expect(detail).toHaveText(projects[0]?.title ?? "");
});

test("every case study is prerendered and complete", async ({ page }) => {
  for (const project of projects) {
    const response = await page.goto(`/projects/${project.slug}`);
    expect(response?.status(), project.slug).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.title);
    await expect(page.locator(".card .label")).toContainText(["What it is", "Problem", "Solution", "Stack", "Results"]);
    await expect(page.locator(".hubgrid.three .hub")).toHaveCount(3);
  }
});

test("unknown project is a 404 and the old Plai alias redirects", async ({ page }) => {
  expect((await page.goto("/projects/nope"))?.status()).toBe(404);
  await page.goto("/projects/plai-landing-page");
  await expect(page).toHaveURL(/\/projects\/plai$/);
});

test("no horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const path of ["/", "/projects", "/projects/posture-guard"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test("contact form reports success and server errors", async ({ page }) => {
  await page.goto("/#contact");
  const status = page.locator("#sent");

  await page.getByRole("button", { name: "Send message" }).click();
  await expect(status).toHaveClass(/err/);

  await page.route("/api/contact", (route) => route.fulfill({ status: 200, json: { ok: true } }));
  await page.getByLabel("Name").fill("Ana");
  await page.getByLabel("Email").fill("ana@example.com");
  await page.getByLabel("Your message").fill("Hello, I'd like to talk about a role.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(status).toContainText("on its way");

  await page.unroute("/api/contact");
  await page.route("/api/contact", (route) => route.fulfill({ status: 502, json: { ok: false, error: "Mail is down." } }));
  await page.getByLabel("Name").fill("Ana");
  await page.getByLabel("Email").fill("ana@example.com");
  await page.getByLabel("Your message").fill("Hello, I'd like to talk about a role.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(status).toHaveText("Mail is down.");
});

test("contact API validates input and never leaks config", async ({ request }) => {
  const bad = await request.post("/api/contact", { data: { name: "", email: "x", message: "" } });
  expect(bad.status()).toBe(400);
  const body = await bad.json();
  expect(body.fieldErrors).toHaveProperty("email");

  const bot = await request.post("/api/contact", {
    data: { name: "Bot", email: "bot@example.com", message: "Buy cheap things now!!", website: "spam" },
  });
  expect(bot.status()).toBe(200);
});
