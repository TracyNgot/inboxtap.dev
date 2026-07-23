import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { exampleReadmes, examplesLanding, getExampleDocStrings } from "@/lib/example-registry";
import { getLocalizedDoc } from "@/lib/i18n";
import { locales } from "@/lib/i18n/config";
import { docJsonLd } from "@/lib/seo/json-ld";

const examplesRoot = join(import.meta.dir, "..", "..", "examples");

function pushMatch(targets: string[], match: RegExpMatchArray, ...groups: number[]): void {
  const target = groups.map((index) => match[index]).find(Boolean);
  if (target) targets.push(target);
}

function readmeTargets(source: string): string[] {
  const targets: string[] = [];

  for (const match of source.matchAll(
    /!?\[[^\]\n]*]\(\s*(?:<([^>\n]+)>|([^\s)"']+))(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g,
  )) {
    pushMatch(targets, match, 1, 2);
  }

  for (const match of source.matchAll(/^[ \t]{0,3}\[[^\]\n]+]:[ \t]*(?:<([^>\n]+)>|([^\s]+))/gm)) {
    pushMatch(targets, match, 1, 2);
  }

  for (const match of source.matchAll(
    /<((?:[a-z][a-z\d+.-]*:[^<>\s]+)|(?:[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+))>/gi,
  )) {
    pushMatch(targets, match, 1);
  }

  for (const tag of source.matchAll(
    /<(?:a|area|audio|embed|iframe|img|input|link|script|source|track|video)\b[^>]*>/gi,
  )) {
    for (const match of (tag[0] ?? "").matchAll(
      /\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi,
    )) {
      pushMatch(targets, match, 1, 2, 3);
    }
  }

  return targets;
}

function isAllowedReadmeTarget(target: string): boolean {
  return (
    target.startsWith("#") ||
    target.startsWith("/") ||
    /^[a-z][a-z\d+.-]*:/i.test(target) ||
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(target)
  );
}

function unresolvedReadmeTargets(source: string): string[] {
  return readmeTargets(source).filter((target) => !isAllowedReadmeTarget(target));
}

function headingId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

describe("example README registry", () => {
  test("registers every example README exactly once", () => {
    const directories = readdirSync(examplesRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .filter((entry) => existsSync(join(examplesRoot, entry.name, "README.md")))
      .map((entry) => entry.name)
      .sort();
    const registered: string[] = exampleReadmes.map((example) => example.directory).sort();

    expect(new Set(registered).size).toBe(registered.length);
    expect(registered).toEqual(directories);
  });

  for (const example of exampleReadmes) {
    test(`${example.directory} has one H1, resolvable anchors, and no relative links`, () => {
      const source = readFileSync(join(examplesRoot, example.directory, "README.md"), "utf8");
      const h1s = source.match(/^# [^#].*$/gm) ?? [];
      const headingIds = (source.match(/^## .+$/gm) ?? []).map((heading) =>
        headingId(heading.slice(3)),
      );

      expect(h1s).toHaveLength(1);
      expect(example.toc.en.map<string>((item) => item.id)).toEqual(headingIds);
      expect(
        unresolvedReadmeTargets(source),
        `Unresolved relative README links in ${example.directory}`,
      ).toEqual([]);
    });
  }

  test("detects relative targets across Markdown and HTML link forms", () => {
    const source = `
[inline](guide.md)
![angle destination](<images/hero.png> "Hero")
[reference][docs]
[docs]: ../README.md "Docs"
<a href="./page.html"><img src='assets/screenshot.png'></a>

[anchor](#setup)
[root](/docs/examples)
[external](https://example.com/docs)
<mailto:docs@example.com>
<https://example.com/guide>
<img src="https://example.com/image.png">
`;

    expect(unresolvedReadmeTargets(source)).toEqual([
      "guide.md",
      "images/hero.png",
      "../README.md",
      "./page.html",
      "assets/screenshot.png",
    ]);
    expect(readmeTargets(source)).toContain("mailto:docs@example.com");
    expect(readmeTargets(source)).toContain("https://example.com/guide");
  });

  test("localizes landing and detail routes while keeping directory names stable", () => {
    for (const locale of locales) {
      expect(getLocalizedDoc(locale, "examples").slug).toBe(examplesLanding[locale].slug);
      for (const example of exampleReadmes) {
        const key = `examples/${example.directory}` as const;
        const doc = getLocalizedDoc(locale, key);
        expect(doc.slug).toBe(`${examplesLanding[locale].slug}/${example.directory}`);
        expect(doc).toMatchObject(getExampleDocStrings(locale, key));
        expect(doc.toc.map((item) => item.id)).toEqual(example.toc.en.map((item) => item.id));
        if (locale !== "en") {
          expect(doc.toc.map((item) => item.label)).not.toEqual(
            example.toc.en.map((item) => item.label),
          );
        }
        expect(JSON.stringify(docJsonLd(locale, key))).toContain('"inLanguage":"en"');
      }
    }
  });
});
