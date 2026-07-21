import { describe, expect, test } from "bun:test";
import { parseChangelog } from "@/lib/changelog";

const sample = `# Changelog

Intro prose that must be ignored.

## v1.2.3 — 2026-07-21

_This version was never published to npm; the first published release is v0.2.2._

### ✨ Features
* ✨ feat: add filters by @TracyNgot in https://github.com/TracyNgot/inboxtap.dev/pull/42
### 🎉 New Contributors
* @someone made their first contribution in https://github.com/TracyNgot/inboxtap.dev/pull/41

Unrecognized {prose} with <markdown-hostile> characters.

**Full Changelog**: https://github.com/TracyNgot/inboxtap.dev/compare/v1.2.2...v1.2.3

## v0.1.1

* A bullet without any category heading

**Full Changelog**: https://github.com/TracyNgot/inboxtap.dev/commits/v0.1.1
`;

describe("parseChangelog", () => {
  const releases = parseChangelog(sample);

  test("splits releases on version headings and skips the intro", () => {
    expect(releases.map((release) => release.version)).toEqual(["v1.2.3", "v0.1.1"]);
    expect(releases[0]?.date).toBe("2026-07-21");
    expect(releases[1]?.date).toBeUndefined();
  });

  test("parses structured items with author and pull request", () => {
    const [features] = releases[0]?.categories ?? [];
    expect(features?.title).toBe("✨ Features");
    expect(features?.items).toEqual([
      {
        author: "TracyNgot",
        prNumber: 42,
        prUrl: "https://github.com/TracyNgot/inboxtap.dev/pull/42",
        text: "✨ feat: add filters",
      },
    ]);
  });

  test("keeps notes, extras, and the full-changelog link", () => {
    expect(releases[0]?.notes).toEqual([
      "This version was never published to npm; the first published release is v0.2.2.",
    ]);
    expect(releases[0]?.extras).toEqual([
      "Unrecognized {prose} with <markdown-hostile> characters.",
    ]);
    expect(releases[0]?.fullChangelogUrl).toBe(
      "https://github.com/TracyNgot/inboxtap.dev/compare/v1.2.2...v1.2.3",
    );
    expect(releases[1]?.fullChangelogUrl).toBe(
      "https://github.com/TracyNgot/inboxtap.dev/commits/v0.1.1",
    );
  });

  test("collects bullets without a heading into an untitled category", () => {
    expect(releases[1]?.categories).toEqual([
      { items: [{ text: "A bullet without any category heading" }], title: "" },
    ]);
  });
});

describe("repository CHANGELOG.md", () => {
  test("parses into dated releases with items", async () => {
    const markdown = await Bun.file(new URL("../../CHANGELOG.md", import.meta.url)).text();
    const releases = parseChangelog(markdown);
    expect(releases.length).toBeGreaterThanOrEqual(9);
    for (const release of releases) {
      expect(release.version).toMatch(/^v\d+\.\d+\.\d+$/);
      expect(release.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(release.categories.flatMap((category) => category.items).length).toBeGreaterThan(0);
      expect(release.fullChangelogUrl).toBeDefined();
    }
  });
});
