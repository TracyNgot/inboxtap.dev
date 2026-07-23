import { defineConfig } from "tsup";

export default defineConfig([
  {
    clean: true,
    dts: true,
    entry: {
      client: "src/client/index.ts",
      cli: "src/cli.ts",
      "fixtures/bun": "src/fixtures/bun.ts",
      "fixtures/index": "src/fixtures/index.ts",
      "fixtures/playwright": "src/fixtures/playwright.ts",
      "fixtures/vitest": "src/fixtures/vitest.ts",
      index: "src/index.ts",
      "matchers/bun": "src/matchers/bun.ts",
      "matchers/index": "src/matchers/index.ts",
      "matchers/playwright": "src/matchers/playwright.ts",
      "matchers/vitest": "src/matchers/vitest.ts",
      "reports/index": "src/reports/index.ts",
    },
    external: ["bun:test"],
    format: ["esm", "cjs"],
    outDir: "dist",
    platform: "node",
    sourcemap: true,
    target: "node20",
  },
]);
