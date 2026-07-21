import { readFileSync, writeFileSync } from "node:fs";
import { capture } from "./release-helpers.js";

export interface ReleaseNotesRequest {
  previousTag?: string;
  tag: string;
  target?: string;
}

export function generateReleaseNotes({ previousTag, tag, target = "main" }: ReleaseNotesRequest) {
  const fields = ["-f", `tag_name=${tag}`, "-f", `target_commitish=${target}`];
  if (previousTag) fields.push("-f", `previous_tag_name=${previousTag}`);
  const body = capture("gh", [
    "api",
    "repos/{owner}/{repo}/releases/generate-notes",
    ...fields,
    "--jq",
    ".body",
  ]);
  return normalizeNotesBody(body);
}

// GitHub bodies open with an HTML comment and a "What's Changed" heading, and
// may add more h2 sections such as "New Contributors". CHANGELOG.md reserves h2
// for version headings, so drop the boilerplate and demote the rest to h3.
export function normalizeNotesBody(body: string): string {
  return body
    .replace(/\r\n/g, "\n")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/^## What's Changed[^\S\n]*$/m, "")
    .replace(/^## /gm, "### ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// A release dispatched with no pull requests merged since the previous tag
// (e.g. promoting to v1.0.0) generates a body with no bullets, which the
// changelog parity gate rejects: every release section must contain an item.
export function ensureChangelogItem(notes: string, previousTag?: string): string {
  if (/^\* /m.test(notes)) return notes;
  const origin = previousTag ?? "the previous release";
  return `* 🔖 chore: promote ${origin} unchanged\n\n${notes}`;
}

export function formatChangelogSection(
  tag: string,
  date: string,
  notes: string,
  note?: string,
): string {
  const lines = [`## ${tag} — ${date}`, ""];
  if (note) lines.push(`_${note}_`, "");
  lines.push(notes, "");
  return lines.join("\n");
}

export function prependChangelogSection(section: string, changelogPath = "CHANGELOG.md"): void {
  const existing = readFileSync(changelogPath, "utf8");
  const firstSectionAt = existing.indexOf("\n## ");
  if (firstSectionAt === -1) {
    throw new Error(`${changelogPath} must contain at least one "## " release section`);
  }
  const header = existing.slice(0, firstSectionAt + 1);
  const rest = existing.slice(firstSectionAt + 1);
  writeFileSync(changelogPath, `${header}${section}\n${rest}`);
}

if (import.meta.main) {
  const [tag, previousTag] = process.argv.slice(2);
  if (!tag) throw new Error("Usage: bun scripts/generate-release-notes.ts <tag> [previousTag]");
  console.log(generateReleaseNotes({ previousTag, tag }));
}
