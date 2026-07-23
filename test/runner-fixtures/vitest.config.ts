import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/runner-fixtures/vitest.case.ts"],
  },
});
