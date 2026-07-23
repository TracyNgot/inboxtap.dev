import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

interface PackageManifest {
  bin: Record<string, string>;
  description: string;
  keywords: string[];
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
