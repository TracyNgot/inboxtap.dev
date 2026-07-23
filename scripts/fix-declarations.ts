import { readFile, writeFile } from "node:fs/promises";

const vitestDeclarations = [
  {
    path: "dist/fixtures/vitest.d.cts",
    generatedImport: "import { TestAPI } from 'vitest';",
    cjsSafeImport: 'import type { TestAPI } from "vitest" with { "resolution-mode": "import" };',
  },
  {
    path: "dist/matchers/vitest.d.cts",
    generatedImport: "import { ExpectStatic } from 'vitest';",
    cjsSafeImport:
      'import type { ExpectStatic } from "vitest" with { "resolution-mode": "import" };',
  },
];

// tsup strips this source import attribute while bundling declarations. Restore it so a strict
// CommonJS consumer resolves Vitest's ESM declaration instead of its incompatible CJS re-export.
for (const entry of vitestDeclarations) {
  const declaration = await readFile(entry.path, "utf8");
  if (!declaration.includes(entry.generatedImport)) {
    throw new Error(`Could not find the expected Vitest import in ${entry.path}`);
  }

  await writeFile(
    entry.path,
    declaration.replace(entry.generatedImport, entry.cjsSafeImport),
    "utf8",
  );
}
