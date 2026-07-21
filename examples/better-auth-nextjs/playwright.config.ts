import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: [
    {
      command: "npx inboxtap",
      url: "http://127.0.0.1:8025/health",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npm run db:migrate && npm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
