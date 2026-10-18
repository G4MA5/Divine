import { defineConfig } from "@playwright/test";

/** Tests visuels : `npm run build` puis `npx playwright test` (le serveur de production démarre tout seul). */
export default defineConfig({
  testDir: "./tests",
  timeout: 120_000,
  reporter: [["list"]],
  outputDir: "test-results",
  use: { baseURL: "http://localhost:3200" },
  webServer: { command: "npx next start -p 3200", url: "http://localhost:3200", reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: "telephone-390", use: { browserName: "chromium", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
    { name: "ordinateur-1280", use: { browserName: "chromium", viewport: { width: 1280, height: 800 } } },
  ],
});
