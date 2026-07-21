import { readFileSync, writeFileSync } from "node:fs";
import {
  ensureChangelogItem,
  formatChangelogSection,
  generateReleaseNotes,
  prependChangelogSection,
} from "./generate-release-notes.js";
import { assertCleanMain, capture, run } from "./release-helpers.js";
import { bumpVersion } from "./release-policy.js";

const level = process.argv[2];
if (level !== "patch" && level !== "minor" && level !== "major") {
  throw new Error("Usage: bun scripts/prepare-release.ts <patch|minor|major>");
}

assertCleanMain();
run("bun", ["run", "release:check"]);

const manifestPath = "package.json";
const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { version: string };
const previousTag = capture("git", ["describe", "--tags", "--abbrev=0", "--match", "v*"]);
manifest.version = bumpVersion(manifest.version, level);
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

const tag = `v${manifest.version}`;
const date = new Date().toISOString().slice(0, 10);
prependChangelogSection(
  formatChangelogSection(
    tag,
    date,
    ensureChangelogItem(generateReleaseNotes({ previousTag, tag }), previousTag),
  ),
);

run("bun", ["install", "--lockfile-only"]);
run("bun", ["run", "verify"]);

run("git", ["add", "package.json", "bun.lock", "CHANGELOG.md"]);
run("git", ["commit", "-m", `🔖 chore: release ${tag}`]);
run("git", ["tag", tag]);

console.log("Release commit and tag created. Review them, then push with:");
console.log("git push origin main --follow-tags");
