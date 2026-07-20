import { readFileSync, writeFileSync } from "node:fs";
import { assertCleanMain, run } from "./release-helpers.js";
import { bumpVersion } from "./release-policy.js";

const level = process.argv[2];
if (level !== "patch" && level !== "minor" && level !== "major") {
  throw new Error("Usage: bun scripts/prepare-release.ts <patch|minor|major>");
}

assertCleanMain();
run("bun", ["run", "release:check"]);

const manifestPath = "package.json";
const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { version: string };
manifest.version = bumpVersion(manifest.version, level);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
run("bun", ["install", "--lockfile-only"]);
run("bun", ["run", "verify"]);

const tag = `v${manifest.version}`;
run("git", ["add", "package.json", "bun.lock"]);
run("git", ["commit", "-m", `🔖 chore: release ${tag}`]);
run("git", ["tag", tag]);

console.log("Release commit and tag created. Review them, then push with:");
console.log("git push origin main --follow-tags");
