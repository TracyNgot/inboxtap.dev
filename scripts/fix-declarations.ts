import { readFile, writeFile } from "node:fs/promises";

const vitestDeclaration = "dist/fixtures/vitest.d.cts";
const generatedImport = "import { TestAPI } from 'vitest';";
const cjsSafeImport = 'import type { TestAPI } from "vitest" with { "resolution-mode": "import" };';
const declaration = await readFile(vitestDeclaration, "utf8");

// tsup strips this source import attribute while bundling declarations. Restore it so a strict
// CommonJS consumer resolves Vitest's ESM declaration instead of its incompatible CJS re-export.
if (!declaration.includes(generatedImport)) {
  throw new Error(`Could not find the expected Vitest import in ${vitestDeclaration}`);
}

await writeFile(vitestDeclaration, declaration.replace(generatedImport, cjsSafeImport), "utf8");
