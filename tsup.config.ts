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
    },
    external: ["bun:test"],
    format: ["esm", "cjs"],
    outDir: "dist",
    platform: "node",
    sourcemap: true,
    target: "node20",
  },
]);
