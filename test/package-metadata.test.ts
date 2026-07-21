import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

interface PackageManifest {
  bin: Record<string, string>;
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
});
