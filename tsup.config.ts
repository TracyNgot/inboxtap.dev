import { defineConfig } from "tsup";

export default defineConfig([
  {
    clean: true,
    dts: true,
    entry: {
      client: "src/client/index.ts",
      cli: "src/cli.ts",
      index: "src/index.ts",
    },
    format: ["esm", "cjs"],
    outDir: "dist",
    platform: "node",
    sourcemap: true,
    target: "node20",
  },
]);
