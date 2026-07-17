import { readFile } from "node:fs/promises";
import { assertCleanMain, capture, run } from "./release-helpers.js";

interface PackageManifest {
  version: string;
}

assertCleanMain();
const manifest = JSON.parse(await readFile("package.json", "utf8")) as PackageManifest;
const expectedTag = `v${manifest.version}`;
const tags = capture("git", ["tag", "--points-at", "HEAD"]).split("\n");

if (!tags.includes(expectedTag)) {
  throw new Error(`HEAD must have the ${expectedTag} tag before publishing`);
}

run("bun", ["run", "verify"]);
run("bun", ["publish", "--access", "public", "--registry", "https://registry.npmjs.org/"]);
