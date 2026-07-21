export interface ChangelogItem {
  author?: string;
  prNumber?: number;
  prUrl?: string;
  text: string;
}

export interface ChangelogCategory {
  items: ChangelogItem[];
  title: string;
}

export interface ChangelogRelease {
  categories: ChangelogCategory[];
  date?: string;
  extras: string[];
  fullChangelogUrl?: string;
  notes: string[];
  version: string;
}

const releaseHeading = /^## (v\d+\.\d+\.\d+)(?: — (\d{4}-\d{2}-\d{2}))?\s*$/;
const bulletLine = /^[*-] (.*)$/;
const structuredItem = /^(.*) by @([A-Za-z0-9-]+) in (https:\/\/\S+)$/;
const fullChangelogLine = /^\*\*Full Changelog\*\*: (\S+)$/;
const noteLine = /^_([^_]+)_$/;

// CHANGELOG.md sections are produced by scripts/generate-release-notes.ts from
// GitHub-generated notes. This parser is deliberately structural rather than a
// markdown renderer: an unexpected line becomes plain text instead of breaking
// the site build, which release automation depends on.
export function parseChangelog(markdown: string): ChangelogRelease[] {
  const releases: ChangelogRelease[] = [];
  let release: ChangelogRelease | undefined;
  let category: ChangelogCategory | undefined;

  for (const line of markdown.split("\n")) {
    const heading = line.match(releaseHeading);
    if (heading?.[1]) {
      release = { categories: [], date: heading[2], extras: [], notes: [], version: heading[1] };
      category = undefined;
      releases.push(release);
      continue;
    }
    if (!release) continue;

    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      category = { items: [], title: trimmed.slice(4).trim() };
      release.categories.push(category);
      continue;
    }

    const fullChangelog = trimmed.match(fullChangelogLine);
    if (fullChangelog?.[1]) {
      release.fullChangelogUrl = fullChangelog[1];
      continue;
    }

    const bullet = trimmed.match(bulletLine);
    if (bullet) {
      if (!category) {
        category = { items: [], title: "" };
        release.categories.push(category);
      }
      category.items.push(parseItem(bullet[1] ?? ""));
      continue;
    }

    const note = trimmed.match(noteLine);
    if (note?.[1]) {
      release.notes.push(note[1]);
      continue;
    }

    release.extras.push(trimmed);
  }

  return releases;
}

function parseItem(raw: string): ChangelogItem {
  const structured = raw.match(structuredItem);
  if (!structured?.[2] || !structured[3]) return { text: raw };
  const prNumber = structured[3].match(/\/pull\/(\d+)$/)?.[1];
  return {
    author: structured[2],
    prNumber: prNumber ? Number(prNumber) : undefined,
    prUrl: structured[3],
    text: structured[1] ?? "",
  };
}
