import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

interface PackageManifest {
  bin: Record<string, string>;
  dependencies: Record<string, string>;
  description: string;
  exports: Record<
    string,
    {
      import: { default: string; types: string };
      require: { default: string; types: string };
    }
  >;
  keywords: string[];
  peerDependencies: Record<string, string>;
  peerDependenciesMeta: Record<string, { optional: boolean }>;
  publishConfig: {
    access: string;
    registry: string;
  };
  repository: {
    type: string;
    url: string;
  };
}

const manifest = JSON.parse(readFileSync("package.json", "utf8")) as PackageManifest;

test("keeps npm release metadata aligned with the public package", () => {
  expect(manifest.bin).toEqual({ inboxtap: "dist/cli.js" });
  expect(manifest.publishConfig).toEqual({
    access: "public",
    registry: "https://registry.npmjs.org/",
  });
  expect(manifest.repository).toEqual({
    type: "git",
    url: "git+https://github.com/TracyNgot/inboxtap.dev.git",
  });
  expect(manifest.description).toBe(
    "A local email capture server and TypeScript SDK for testing verification links, magic links, OTPs, invitations, and password-reset emails.",
  );
  expect(manifest.keywords).toEqual(
    expect.arrayContaining(["email-testing", "playwright", "vitest", "otp", "magic-link"]),
  );
});

test("publishes isolated fixture subpaths with optional runner peers", () => {
  const exportFiles = {
    ".": "index",
    "./client": "client",
    "./fixtures": "fixtures/index",
    "./fixtures/bun": "fixtures/bun",
    "./fixtures/playwright": "fixtures/playwright",
    "./fixtures/vitest": "fixtures/vitest",
  };

  expect(Object.keys(manifest.exports)).toEqual(Object.keys(exportFiles));
  for (const [subpath, file] of Object.entries(exportFiles)) {
    expect(manifest.exports[subpath]).toEqual({
      import: {
        default: `./dist/${file}.js`,
        types: `./dist/${file}.d.ts`,
      },
      require: {
        default: `./dist/${file}.cjs`,
        types: `./dist/${file}.d.cts`,
      },
    });
  }
  expect(manifest.peerDependencies).toEqual({
    "@playwright/test": ">=1.61.0 <2",
    nodemailer: ">=9.0.0 <10",
    vitest: ">=4.1.0 <5",
  });
  expect(manifest.peerDependenciesMeta).toEqual({
    "@playwright/test": { optional: true },
    nodemailer: { optional: true },
    vitest: { optional: true },
  });
  expect(manifest.dependencies["@types/nodemailer"]).toBe("^8.0.1");
});
