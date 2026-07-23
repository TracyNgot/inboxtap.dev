import { defineConfig } from "@playwright/test";

export default defineConfig({
  fullyParallel: false,
  reporter: "line",
  testDir: ".",
  testMatch: "playwright.case.ts",
  workers: 1,
});
