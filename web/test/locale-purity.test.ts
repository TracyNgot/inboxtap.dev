import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { exampleReadmes, examplesLanding } from "@/lib/example-registry";
import { getDictionary, getDocsDictionary } from "@/lib/i18n";

const webRoot = join(import.meta.dir, "..");
const repositoryRoot = join(webRoot, "..");

function withoutCode(source: string): string {
  return source
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`\n]+`/g, "")
    .replace(/!\[([^\]]*)]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ");
}

function proseBlocks(source: string): string[] {
  return withoutCode(source)
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^\s*[-*]\s+/gm, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((block) => block.length >= 40);
}

function expectNoCopiedEnglish(english: string, translated: string, label: string): void {
  const englishBlocks = new Set(proseBlocks(english));
  const copied = proseBlocks(translated).filter((block) => englishBlocks.has(block));
  expect(copied, `${label} contains untranslated English prose`).toEqual([]);
}

const forbiddenNaturalCopy = {
  es: [
    /\bapp\b/iu,
    /\bchangelog\b/iu,
    /\bhooks?\b/iu,
    /\bmagic links?\b/iu,
    /\bopen source\b/iu,
    /\bparsead[oa]s?\b/iu,
    /\bredacción\b/iu,
    /\bredactad[oa]s?\b/iu,
    /\breleases?\b/iu,
    /\brunners?\b/iu,
    /\bseeds?\b/iu,
    /\bspecs?\b/iu,
    /\bstacks?\b/iu,
    /\btesting\b/iu,
    /\bworkers?\b/iu,
  ],
  fr: [
    /\bapp\b/iu,
    /\bchangelog\b/iu,
    /\bhooks?\b/iu,
    /\binbox\b/iu,
    /\bmagic links?\b/iu,
    /\bmail parsé\b/iu,
    /\bopen source\b/iu,
    /\breleases?\b/iu,
    /\brunners?\b/iu,
    /\bseeds?\b/iu,
    /\bspecs?\b/iu,
    /\bstacks?\b/iu,
    /\bworkers?\b/iu,
  ],
} as const;

function expectLocalizedTerms(source: string, locale: "es" | "fr", label: string): void {
  const prose = withoutCode(source);
  for (const pattern of forbiddenNaturalCopy[locale]) {
    expect(prose, `${label} contains ${pattern}`).not.toMatch(pattern);
  }
}

function collectStringValues(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStringValues);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      key === "fileName" || key === "id" || key === "slug" ? [] : collectStringValues(child),
    );
  }

  return [];
}

describe("localized pages contain one natural language", () => {
  const englishDocsRoot = join(webRoot, "content", "docs", "en");

  for (const locale of ["fr", "es"] as const) {
    test(`${locale} core docs contain no copied English prose or known false friends`, () => {
      const localizedRoot = join(webRoot, "content", "docs", locale);
      const files = [...new Bun.Glob("**/*.mdx").scanSync({ cwd: englishDocsRoot })].sort();

      for (const file of files) {
        const english = readFileSync(join(englishDocsRoot, file), "utf8");
        const translated = readFileSync(join(localizedRoot, file), "utf8");
        expectNoCopiedEnglish(english, translated, `${locale}/${file}`);
        expectLocalizedTerms(translated, locale, `${locale}/${file}`);
      }
    });

    test(`${locale} example READMEs contain no copied English prose or known false friends`, () => {
      for (const example of exampleReadmes) {
        const directory = join(repositoryRoot, "examples", example.directory);
        const english = readFileSync(join(directory, "README.md"), "utf8");
        const translated = readFileSync(join(directory, `README.${locale}.md`), "utf8");
        expectNoCopiedEnglish(english, translated, `${locale}/${example.directory}`);
        expectLocalizedTerms(translated, locale, `${locale}/${example.directory}`);
      }
    });

    test(`${locale} dictionaries and page metadata avoid known false friends`, () => {
      const copy = collectStringValues({
        docs: getDocsDictionary(locale),
        examples: {
          landing: examplesLanding[locale],
          pages: exampleReadmes.map((example) => example.strings[locale]),
        },
        site: getDictionary(locale),
      }).join("\n");
      expectLocalizedTerms(copy, locale, `${locale} dictionaries`);
    });
  }
});
