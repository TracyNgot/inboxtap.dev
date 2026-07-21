import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "bun:test";

const contentRoot = join(import.meta.dir, "..", "content", "docs");
const translatedLocales = ["fr", "es"] as const;

function mdxFiles(locale: string): string[] {
  return [...new Bun.Glob("**/*.mdx").scanSync({ cwd: join(contentRoot, locale) })].sort();
}

function fences(text: string): string[] {
  return text.match(/```[\s\S]*?```/g) ?? [];
}

function headings(text: string): number {
  return text.match(/^## /gm)?.length ?? 0;
}

describe("translated docs stay aligned with English", () => {
  const englishFiles = mdxFiles("en");

  test("the English corpus is present", () => {
    expect(englishFiles.length).toBe(14);
  });

  for (const locale of translatedLocales) {
    test(`every English doc has a ${locale} counterpart`, () => {
      expect(mdxFiles(locale)).toEqual(englishFiles);
    });

    test(`${locale} keeps code fences byte-identical and heading structure aligned`, () => {
      for (const file of englishFiles) {
        const english = readFileSync(join(contentRoot, "en", file), "utf8");
        const translated = readFileSync(join(contentRoot, locale, file), "utf8");
        expect(fences(translated), `${locale}/${file} code fences`).toEqual(fences(english));
        expect(headings(translated), `${locale}/${file} section count`).toBe(headings(english));
      }
    });
  }
});
