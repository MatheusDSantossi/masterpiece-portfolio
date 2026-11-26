import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3100);

// Playwright loads its config from the default export.
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 120_000,
  expect: { timeout: 15_000 },
  // Headless browsers render WebGL in software, where every frame of the painted background is slow.
  // Reduced motion makes the site skip easing, which keeps tests deterministic and covers that path too.
  use: { baseURL: `http://localhost:${port}`, trace: "on-first-retry", contextOptions: { reducedMotion: "reduce" } },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // CI builds once in an earlier step; locally, build first so tests never run against stale output.
    command: process.env.CI ? `pnpm start -p ${port}` : `pnpm build && pnpm start -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
