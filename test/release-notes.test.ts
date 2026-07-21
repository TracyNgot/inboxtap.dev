import { expect, test } from "bun:test";
import { ensureChangelogItem, formatChangelogSection } from "../scripts/generate-release-notes.js";
import { parseChangelog } from "../web/lib/changelog.js";

const zeroPrBody = `**Full Changelog**: https://github.com/TracyNgot/inboxtap.dev/compare/v0.3.1...v1.0.0`;

const bulletBody = `### 📦 Maintenance
* ⬆️ chore: override postcss and esbuild to patched versions by @TracyNgot in https://github.com/TracyNgot/inboxtap.dev/pull/16

**Full Changelog**: https://github.com/TracyNgot/inboxtap.dev/compare/v0.3.0...v0.3.1`;

test("notes that already contain items pass through unchanged", () => {
  expect(ensureChangelogItem(bulletBody, "v0.3.0")).toBe(bulletBody);
});

test("zero-PR notes gain a promotion item naming the previous tag", () => {
  const notes = ensureChangelogItem(zeroPrBody, "v0.3.1");
  expect(notes).toBe(`* 🔖 chore: promote v0.3.1 unchanged\n\n${zeroPrBody}`);
});

test("zero-PR notes without a previous tag still gain an item", () => {
  expect(ensureChangelogItem(zeroPrBody)).toContain(
    "* 🔖 chore: promote the previous release unchanged",
  );
});

test("a promotion section satisfies the changelog contract the release gate enforces", () => {
  const section = formatChangelogSection(
    "v1.0.0",
    "2026-07-21",
    ensureChangelogItem(zeroPrBody, "v0.3.1"),
  );
  const [release] = parseChangelog(`# Changelog\n\n${section}`);
  expect(release?.version).toBe("v1.0.0");
  expect(release?.date).toBe("2026-07-21");
  expect(release?.categories.flatMap((category) => category.items).length).toBeGreaterThan(0);
  expect(release?.fullChangelogUrl).toBe(
    "https://github.com/TracyNgot/inboxtap.dev/compare/v0.3.1...v1.0.0",
  );
});
